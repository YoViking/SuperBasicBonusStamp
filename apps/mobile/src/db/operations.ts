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
  currentBalance: number;
  totalSpent: number;
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
    currentBalance: Number(row.current_balance ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    createdAt: row.created_at,
  };
}

export const getAllCustomers = async (): Promise<Customer[]> => {
  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    return [...list].sort((a, b) => b.currentBalance - a.currentBalance);
  }

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', userId)
    .order('current_balance', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapCustomerFromDb);
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

export const createCustomer = async (phone: string): Promise<Customer> => {
  const cleanPhone = phone.trim();

  if (await isDemoModeActive()) {
    const raw = await AsyncStorage.getItem(DEMO_CUSTOMERS_KEY);
    const list: Customer[] = raw ? JSON.parse(raw) : [];
    const newCustomer: Customer = {
      id: Date.now().toString(),
      phoneNumber: cleanPhone,
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
