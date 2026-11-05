import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  DEFAULT_PURCHASE_MESSAGE,
  DEFAULT_BONUS_MESSAGE,
} from '../services/smsFormatter';

export type BonusType = 'STAMPS' | 'POINTS';
export type PosMode = 'QUICK' | 'ARTICLES';

export interface StoreSettings {
  id: string;
  storeName: string;
  bonusType: BonusType;
  posMode: PosMode;
  threshold: number;
  rewardAmount: number;
  rewardDescription: string;
  purchaseMessage: string;
  bonusMessage: string;
}

export interface Article {
  id: string;
  sku: string | null;
  name: string;
  price: number;
  category: string;
  salesCount: number;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  email?: string | null;
  currentBalance: number;
  totalSpent: number;
  optOutOutreach?: boolean;
  createdAt?: string;
}

// --- DEMO-LÄGE (Lokal fallback i AsyncStorage om Supabase inte är kopplat än) ---
const DEMO_STORE_KEY = '@sbbs_demo_store';
const DEMO_ARTICLES_KEY = '@sbbs_demo_articles';
const DEMO_CUSTOMERS_KEY = '@sbbs_demo_customers';
const DEMO_ACTIVE_KEY = '@sbbs_demo_active';

export const isDemoModeActive = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    const val = await AsyncStorage.getItem(DEMO_ACTIVE_KEY);
    return val === 'true';
  }
  const val = await AsyncStorage.getItem(DEMO_ACTIVE_KEY);
  return val === 'true';
};

export const setDemoModeActive = async (active: boolean): Promise<void> => {
  if (active) {
    await AsyncStorage.setItem(DEMO_ACTIVE_KEY, 'true');
  } else {
    await AsyncStorage.removeItem(DEMO_ACTIVE_KEY);
  }
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'demo-store',
  storeName: 'Min Butik',
  bonusType: 'STAMPS',
  posMode: 'QUICK',
  threshold: 10,
  rewardAmount: 1,
  rewardDescription: '1 gratis vara',
  purchaseMessage: DEFAULT_PURCHASE_MESSAGE,
  bonusMessage: DEFAULT_BONUS_MESSAGE,
};

async function getCurrentUserId(): Promise<string> {
  if (await isDemoModeActive()) {
    return 'demo-store';
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Ingen inloggad butik hittades. Logga in igen.');
  }
  return data.user.id;
}

/** --- BUTIKSINSTÄLLNINGAR & BONUSREGLER --- **/

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_STORE_KEY);
    if (raw) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
    }
    await AsyncStorage.setItem(DEMO_STORE_KEY, JSON.stringify(DEFAULT_STORE_SETTINGS));
    return DEFAULT_STORE_SETTINGS;
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    const { data: userData } = await supabase.auth.getUser();
    const metaStoreName = userData.user?.user_metadata?.store_name || 'Min Butik';
    const newRow = {
      id: userId,
      store_name: metaStoreName,
      bonus_type: DEFAULT_STORE_SETTINGS.bonusType,
      pos_mode: DEFAULT_STORE_SETTINGS.posMode,
      threshold: DEFAULT_STORE_SETTINGS.threshold,
      reward_amount: DEFAULT_STORE_SETTINGS.rewardAmount,
      reward_description: DEFAULT_STORE_SETTINGS.rewardDescription,
      purchase_message: DEFAULT_STORE_SETTINGS.purchaseMessage,
      bonus_message: DEFAULT_STORE_SETTINGS.bonusMessage,
    };
    const { data: inserted, error: insertError } = await supabase
      .from('stores')
      .upsert(newRow)
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    return mapStoreFromDb(inserted);
  }

  return mapStoreFromDb(data);
};

function mapStoreFromDb(row: any): StoreSettings {
  return {
    id: row.id,
    storeName: row.store_name ?? 'Min Butik',
    bonusType: row.bonus_type === 'POINTS' ? 'POINTS' : 'STAMPS',
    posMode: row.pos_mode === 'ARTICLES' ? 'ARTICLES' : 'QUICK',
    threshold: Number(row.threshold ?? 10),
    rewardAmount: Number(row.reward_amount ?? 1),
    rewardDescription: row.reward_description ?? '1 gratis vara',
    purchaseMessage: row.purchase_message || DEFAULT_PURCHASE_MESSAGE,
    bonusMessage: row.bonus_message || DEFAULT_BONUS_MESSAGE,
  };
}

export const saveStoreSettings = async (
  settings: Omit<StoreSettings, 'id'>
): Promise<StoreSettings> => {
  if (await isDemoModeActive()) {
    const updated: StoreSettings = { id: 'demo-store', ...settings };
    await AsyncStorage.setItem(DEMO_STORE_KEY, JSON.stringify(updated));
    return updated;
  }

  const userId = await getCurrentUserId();
  const payload = {
    id: userId,
    store_name: settings.storeName.trim() || 'Min Butik',
    bonus_type: settings.bonusType,
    pos_mode: settings.posMode,
    threshold: settings.threshold,
    reward_amount: settings.rewardAmount,
    reward_description: settings.rewardDescription.trim(),
    purchase_message: settings.purchaseMessage,
    bonus_message: settings.bonusMessage,
  };

  const { data, error } = await supabase
    .from('stores')
    .upsert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapStoreFromDb(data);
};

/** --- ARTIKLAR --- **/

function mapArticleFromDb(row: any): Article {
  return {
    id: String(row.id),
    sku: row.sku ?? null,
    name: row.name,
    price: Number(row.price ?? 0),
    category: row.category || 'Allmänt',
    salesCount: Number(row.sales_count ?? 0),
  };
}

export const getArticles = async (): Promise<Article[]> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_ARTICLES_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('store_id', userId)
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map(mapArticleFromDb);
};

export const addArticle = async (
  sku: string,
  name: string,
  price: number,
  category: string
): Promise<Article> => {
  const cleanSku = sku.trim() || null;
  const cleanCategory = category.trim() || 'Allmänt';

  if (await isDemoModeActive()) {
    const list = await getArticles();
    const newItem: Article = {
      id: Date.now().toString(),
      sku: cleanSku,
      name: name.trim(),
      price,
      category: cleanCategory,
      salesCount: 0,
    };
    await AsyncStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify([...list, newItem]));
    return newItem;
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('articles')
    .insert({
      store_id: userId,
      sku: cleanSku,
      name: name.trim(),
      price,
      category: cleanCategory,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapArticleFromDb(data);
};

export const updateArticle = async (
  id: string,
  sku: string,
  name: string,
  price: number,
  category: string
): Promise<void> => {
  const cleanSku = sku.trim() || null;
  const cleanCategory = category.trim() || 'Allmänt';

  if (await isDemoModeActive()) {
    const list = await getArticles();
    const updated = list.map((item) =>
      item.id === id
        ? { ...item, sku: cleanSku, name: name.trim(), price, category: cleanCategory }
        : item
    );
    await AsyncStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify(updated));
    return;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('articles')
    .update({
      sku: cleanSku,
      name: name.trim(),
      price,
      category: cleanCategory,
    })
    .eq('id', id)
    .eq('store_id', userId);

  if (error) throw new Error(error.message);
};

export const deleteArticle = async (id: string): Promise<void> => {
  if (await isDemoModeActive()) {
    const list = await getArticles();
    await AsyncStorage.setItem(
      DEMO_ARTICLES_KEY,
      JSON.stringify(list.filter((a) => a.id !== id))
    );
    return;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .eq('store_id', userId);

  if (error) throw new Error(error.message);
};

/** --- KUNDER & KÖP / STÄMPLAR --- **/

function mapCustomerFromDb(row: any): Customer {
  return {
    id: String(row.id),
    phoneNumber: row.phone_number,
    email: row.email ?? null,
    currentBalance: Number(row.current_balance ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    optOutOutreach: Boolean(row.opt_out_outreach ?? false),
    createdAt: row.created_at,
  };
}

const OPT_OUT_IDS_KEY = '@sbbs_opt_out_customer_ids';

async function getLocalOptOutIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(OPT_OUT_IDS_KEY);
  const arr: string[] = raw ? JSON.parse(raw) : [];
  return new Set(arr);
}

export const getAllCustomers = async (): Promise<Customer[]> => {
  const localOptOut = await getLocalOptOutIds();

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    return [...list]
      .map((c) => ({
        ...c,
        optOutOutreach: Boolean(c.optOutOutreach || localOptOut.has(c.id)),
      }))
      .sort((a, b) => b.currentBalance - a.currentBalance);
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', userId)
    .order('current_balance', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((row) => {
    const mapped = mapCustomerFromDb(row);
    return {
      ...mapped,
      optOutOutreach: Boolean(mapped.optOutOutreach || localOptOut.has(mapped.id)),
    };
  });
};

export const setCustomerOutreachOptOut = async (
  customerId: string,
  optOut: boolean
): Promise<void> => {
  const localOptOut = await getLocalOptOutIds();
  if (optOut) {
    localOptOut.add(customerId);
  } else {
    localOptOut.delete(customerId);
  }
  await AsyncStorage.setItem(OPT_OUT_IDS_KEY, JSON.stringify([...localOptOut]));

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    const updated = list.map((c) =>
      c.id === customerId ? { ...c, optOutOutreach: optOut } : c
    );
    await AsyncStorage.setItem(DEMO_CUSTOMERS_KEY, JSON.stringify(updated));
    return;
  }

  const userId = await getCurrentUserId();
  await supabase
    .from('customers')
    .update({ opt_out_outreach: optOut })
    .eq('id', customerId)
    .eq('store_id', userId);
};

export const getCustomer = async (phone: string): Promise<Customer | undefined> => {
  const cleanPhone = phone.trim();

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    return list.find((c) => c.phoneNumber === cleanPhone);
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', userId)
    .eq('phone_number', cleanPhone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapCustomerFromDb(data) : undefined;
};

export const createCustomer = async (
  phone: string,
  email?: string | null
): Promise<Customer> => {
  const cleanPhone = phone.trim();
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    const newCustomer: Customer = {
      id: Date.now().toString(),
      phoneNumber: cleanPhone,
      email: cleanEmail,
      currentBalance: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DEMO_CUSTOMERS_KEY, JSON.stringify([...list, newCustomer]));
    return newCustomer;
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('customers')
    .insert({
      store_id: userId,
      phone_number: cleanPhone,
      email: cleanEmail,
      current_balance: 0,
      total_spent: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCustomerFromDb(data);
};

export const deleteCustomerById = async (customerId: string): Promise<void> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(
      DEMO_CUSTOMERS_KEY,
      JSON.stringify(list.filter((c) => c.id !== customerId))
    );
    return;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('store_id', userId);

  if (error) throw new Error(error.message);
};

/**
 * Registrerar ett köp eller stämpel-tillägg.
 * - I STAMPS-läge är `addedValue` antalet nya stämplar (t.ex. 1, 2 eller antal varor i korgen).
 * - I POINTS-läge är `addedValue` köpesumman i kr före rabatt.
 */
export const processPurchase = async (
  phone: string,
  addedValue: number,
  cart: Article[] = [],
  appliedBonusesCount: number = 0
): Promise<{
  bonusEarned: boolean;
  newBalance: number;
  threshold: number;
  actualAdded: number;
  storeSettings: StoreSettings;
}> => {
  const settings = await getStoreSettings();
  const threshold = Math.max(1, settings.threshold);

  let customer = await getCustomer(phone);
  if (!customer) {
    customer = await createCustomer(phone);
  }

  const previousBalance = customer.currentBalance;
  const pointsDeduction = threshold * appliedBonusesCount;
  const balanceAfterRedemption = Math.max(0, previousBalance - pointsDeduction);

  // I POINTS-läge drar en inlöst bonus av rewardAmount från det belopp som ger nya poäng
  const bonusDiscount =
    settings.bonusType === 'POINTS' ? settings.rewardAmount * appliedBonusesCount : 0;
  const actualAdded =
    settings.bonusType === 'POINTS'
      ? Math.max(0, addedValue - bonusDiscount)
      : Math.max(0, addedValue);

  const newBalance = balanceAfterRedemption + actualAdded;

  const previousBonuses = Math.floor(balanceAfterRedemption / threshold);
  const newBonuses = Math.floor(newBalance / threshold);
  const bonusEarned = newBonuses > previousBonuses;

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    const updatedCustomers = list.map((c) =>
      c.id === customer!.id
        ? {
            ...c,
            currentBalance: newBalance,
            totalSpent: c.totalSpent + actualAdded,
          }
        : c
    );
    await AsyncStorage.setItem(DEMO_CUSTOMERS_KEY, JSON.stringify(updatedCustomers));

    if (cart.length > 0) {
      const articlesList = await getArticles();
      const countMap = new Map<string, number>();
      for (const item of cart) {
        countMap.set(item.id, (countMap.get(item.id) || 0) + 1);
      }
      const updatedArticles = articlesList.map((a) =>
        countMap.has(a.id)
          ? { ...a, salesCount: a.salesCount + (countMap.get(a.id) || 0) }
          : a
      );
      await AsyncStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify(updatedArticles));
    }

    return { bonusEarned, newBalance, threshold, actualAdded, storeSettings: settings };
  }

  const userId = await getCurrentUserId();

  const { error: updateError } = await supabase
    .from('customers')
    .update({
      current_balance: newBalance,
      total_spent: customer.totalSpent + actualAdded,
    })
    .eq('id', customer.id)
    .eq('store_id', userId);

  if (updateError) throw new Error(updateError.message);

  // Spara transaktionsrad
  await supabase.from('transactions').insert({
    store_id: userId,
    customer_id: customer.id,
    delta_balance: actualAdded,
    bonuses_redeemed: appliedBonusesCount,
  });

  // Uppdatera sales_count på sålda artiklar (för Toppsäljare)
  if (cart.length > 0) {
    const countMap = new Map<string, { article: Article; count: number }>();
    for (const item of cart) {
      const existing = countMap.get(item.id);
      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(item.id, { article: item, count: 1 });
      }
    }

    for (const { article, count } of countMap.values()) {
      await supabase
        .from('articles')
        .update({ sales_count: (article.salesCount || 0) + count })
        .eq('id', article.id)
        .eq('store_id', userId);
    }
  }

  return { bonusEarned, newBalance, threshold, actualAdded, storeSettings: settings };
};

/** ============================================================================
 * SHOPIFY INTEGRATION OPERATIONS
 * ============================================================================ */

export type ShopifyConsentMode = 'RESPECT_OUTREACH' | 'REQUIRE_CONSENT' | 'ALWAYS_ENROLL';

export interface ShopifyIntegration {
  id: string;
  storeId: string;
  shopDomain: string;
  accessToken: string;
  webhookSecret: string;
  isActive: boolean;
  consentMode: ShopifyConsentMode;
  eligibleProductTypes: string[];
  pointsPerCurrency: number;
  discountCodePrefix: string;
  discountValidityDays: number;
  syncArticles: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopifyDiscountCode {
  id: string;
  storeId: string;
  customerId: string;
  customerPhone?: string;
  customerEmail?: string;
  code: string;
  shopifyPriceRuleId: string;
  shopifyDiscountId?: string;
  discountAmount: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';
  usedAt?: string;
  usedInOrderId?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ShopifyOrderSummary {
  id: string;
  storeId: string;
  shopifyOrderId: string;
  orderNumber: string;
  customerPhone?: string;
  customerEmail?: string;
  totalPrice: number;
  pointsAwarded: number;
  discountsApplied: string[];
  sourceName: string;
  processedAt: string;
}

const DEMO_SHOPIFY_INTEGRATION_KEY = '@sbbs_demo_shopify_integration';
const DEMO_SHOPIFY_DISCOUNTS_KEY = '@sbbs_demo_shopify_discounts';
const DEMO_SHOPIFY_ORDERS_KEY = '@sbbs_demo_shopify_orders';

function mapShopifyIntegrationFromDb(row: any): ShopifyIntegration {
  return {
    id: row.id,
    storeId: row.store_id,
    shopDomain: row.shop_domain || '',
    accessToken: row.access_token || '',
    webhookSecret: row.webhook_secret || '',
    isActive: Boolean(row.is_active ?? true),
    consentMode: row.consent_mode || 'RESPECT_OUTREACH',
    eligibleProductTypes: Array.isArray(row.eligible_product_types)
      ? row.eligible_product_types
      : [],
    pointsPerCurrency: Number(row.points_per_currency ?? 1),
    discountCodePrefix: row.discount_code_prefix || 'BONUS-',
    discountValidityDays: Number(row.discount_validity_days ?? 90),
    syncArticles: Boolean(row.sync_articles ?? false),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getShopifyIntegration = async (): Promise<ShopifyIntegration | null> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_SHOPIFY_INTEGRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('shopify_integrations')
    .select('*')
    .eq('store_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Fel vid hämtning av Shopify-integration:', error);
    return null;
  }

  return data ? mapShopifyIntegrationFromDb(data) : null;
};

export const saveShopifyIntegration = async (
  integration: Omit<ShopifyIntegration, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>
): Promise<ShopifyIntegration> => {
  const cleanDomain = integration.shopDomain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase();

  const payload = {
    shop_domain: cleanDomain,
    access_token: integration.accessToken.trim(),
    webhook_secret: integration.webhookSecret.trim(),
    is_active: integration.isActive,
    consent_mode: integration.consentMode,
    eligible_product_types: integration.eligibleProductTypes || [],
    points_per_currency: integration.pointsPerCurrency,
    discount_code_prefix: integration.discountCodePrefix.trim() || 'BONUS-',
    discount_validity_days: integration.discountValidityDays,
    sync_articles: integration.syncArticles,
    updated_at: new Date().toISOString(),
  };

  if (await isDemoModeActive()) {
    const saved: ShopifyIntegration = {
      id: 'demo-shopify-int',
      storeId: 'demo-store',
      shopDomain: cleanDomain,
      accessToken: integration.accessToken.trim(),
      webhookSecret: integration.webhookSecret.trim(),
      isActive: integration.isActive,
      consentMode: integration.consentMode,
      eligibleProductTypes: integration.eligibleProductTypes || [],
      pointsPerCurrency: integration.pointsPerCurrency,
      discountCodePrefix: integration.discountCodePrefix.trim() || 'BONUS-',
      discountValidityDays: integration.discountValidityDays,
      syncArticles: integration.syncArticles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DEMO_SHOPIFY_INTEGRATION_KEY, JSON.stringify(saved));
    return saved;
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('shopify_integrations')
    .upsert({
      store_id: userId,
      ...payload,
    }, { onConflict: 'store_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapShopifyIntegrationFromDb(data);
};

export const testShopifyConnection = async (
  shopDomain: string,
  accessToken: string
): Promise<{ success: boolean; shopName?: string; error?: string }> => {
  const cleanDomain = shopDomain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '')
    .toLowerCase();

  if (!cleanDomain || !accessToken.trim()) {
    return { success: false, error: 'Både butiksdomän och access token krävs.' };
  }

  try {
    const res = await fetch(`https://${cleanDomain}/admin/api/2024-10/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken.trim(),
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, error: 'Ogiltig Access Token (401 Unauthorized).' };
      }
      if (res.status === 404) {
        return { success: false, error: 'Shopify-butiken kunde inte hittas (404 Not Found).' };
      }
      const errText = await res.text();
      return { success: false, error: `Shopify svarade med status ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return {
      success: true,
      shopName: data.shop?.name || cleanDomain,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Kunde inte nå Shopify. Kontrollera internetanslutningen.',
    };
  }
};

export const getShopifyDiscountCodes = async (
  statusFilter: 'ALL' | 'ACTIVE' | 'USED' = 'ALL'
): Promise<ShopifyDiscountCode[]> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_SHOPIFY_DISCOUNTS_KEY);
    const list: ShopifyDiscountCode[] = raw ? JSON.parse(raw) : [];
    if (statusFilter === 'ALL') return list;
    return list.filter((c) => c.status === statusFilter);
  }

  const userId = await getCurrentUserId();
  let query = supabase
    .from('shopify_discount_codes')
    .select('*, customers(phone_number, email)')
    .eq('store_id', userId)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    customerPhone: row.customers?.phone_number,
    customerEmail: row.customers?.email,
    code: row.code,
    shopifyPriceRuleId: row.shopify_price_rule_id,
    shopifyDiscountId: row.shopify_discount_id,
    discountAmount: Number(row.discount_amount ?? 0),
    status: row.status,
    usedAt: row.used_at,
    usedInOrderId: row.used_in_order_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
};

export const getActiveDiscountCodesForCustomer = async (
  customerId: string
): Promise<ShopifyDiscountCode[]> => {
  if (await isDemoModeActive()) {
    const list = await getShopifyDiscountCodes('ACTIVE');
    return list.filter((d) => d.customerId === customerId);
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('shopify_discount_codes')
    .select('*')
    .eq('store_id', userId)
    .eq('customer_id', customerId)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    storeId: row.store_id,
    customerId: row.customer_id,
    code: row.code,
    shopifyPriceRuleId: row.shopify_price_rule_id,
    shopifyDiscountId: row.shopify_discount_id,
    discountAmount: Number(row.discount_amount ?? 0),
    status: row.status,
    usedAt: row.used_at,
    usedInOrderId: row.used_in_order_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  }));
};

export const redeemShopifyDiscountCodeInPos = async (
  codeId: string
): Promise<void> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_SHOPIFY_DISCOUNTS_KEY);
    const list: ShopifyDiscountCode[] = raw ? JSON.parse(raw) : [];
    const updated = list.map((c) =>
      c.id === codeId
        ? { ...c, status: 'USED' as const, usedAt: new Date().toISOString(), usedInOrderId: 'POS-INSTORE' }
        : c
    );
    await AsyncStorage.setItem(DEMO_SHOPIFY_DISCOUNTS_KEY, JSON.stringify(updated));
    return;
  }

  const userId = await getCurrentUserId();
  const { error } = await supabase
    .from('shopify_discount_codes')
    .update({
      status: 'USED',
      used_at: new Date().toISOString(),
      used_in_order_id: 'POS-INSTORE',
    })
    .eq('id', codeId)
    .eq('store_id', userId);

  if (error) throw new Error(error.message);
};

export const getRecentShopifyOrders = async (limit: number = 10): Promise<ShopifyOrderSummary[]> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_SHOPIFY_ORDERS_KEY);
    const list: ShopifyOrderSummary[] = raw ? JSON.parse(raw) : [];
    return list.slice(0, limit);
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('shopify_orders')
    .select('*, customers(phone_number, email)')
    .eq('store_id', userId)
    .order('processed_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    storeId: row.store_id,
    shopifyOrderId: row.shopify_order_id,
    orderNumber: row.order_number || `#${row.shopify_order_id}`,
    customerPhone: row.customers?.phone_number,
    customerEmail: row.customers?.email,
    totalPrice: Number(row.total_price ?? 0),
    pointsAwarded: Number(row.points_awarded ?? 0),
    discountsApplied: Array.isArray(row.discounts_applied) ? row.discounts_applied : [],
    sourceName: row.source_name || 'web',
    processedAt: row.processed_at,
  }));
};

export const syncShopifyArticles = async (): Promise<{ count: number; productTypes: string[] }> => {
  const integration = await getShopifyIntegration();
  if (!integration || !integration.shopDomain || !integration.accessToken) {
    throw new Error('Shopify-uppgifter saknas. Konfigurera kopplingen först.');
  }

  if (await isDemoModeActive()) {
    // Simulera synk i demo-läge
    const demoArticles = [
      { id: Date.now().toString(), sku: 'SHOPIFY-101', name: 'Demo Kaffe Mörkrost', price: 89, category: 'Kaffe', salesCount: 0 },
      { id: (Date.now() + 1).toString(), sku: 'SHOPIFY-102', name: 'Demo Kaffekopp Porslin', price: 129, category: 'Tillbehör', salesCount: 0 },
    ];
    await AsyncStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify(demoArticles));
    return { count: 2, productTypes: ['Kaffe', 'Tillbehör'] };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/sync-shopify-products`;

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Synk misslyckades med status ${res.status}`);
  }

  const data = await res.json();
  return {
    count: data.count || 0,
    productTypes: data.productTypes || [],
  };
};

