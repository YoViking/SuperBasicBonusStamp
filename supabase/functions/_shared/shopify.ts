// ============================================================================
// SuperBasicBonusStamp - Shopify API & Security Helpers
// Deno / Edge Function compatible
// ============================================================================

/**
 * Verifierar Shopifys HMAC-SHA256 signatur från X-Shopify-Hmac-Sha256 headern.
 */
export async function verifyShopifyHmac(
  rawBody: string,
  hmacHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!hmacHeader || !secret) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const base64Signature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );

    // Säker jämförelse för att motverka timing-attacker
    if (base64Signature.length !== hmacHeader.length) {
      return false;
    }

    let diff = 0;
    for (let i = 0; i < base64Signature.length; i++) {
      diff |= base64Signature.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
    }
    return diff === 0;
  } catch (err) {
    console.error('Kunde inte verifiera Shopify HMAC:', err);
    return false;
  }
}

/**
 * Normaliserar telefonnummer till internationellt E.164-format (t.ex. +46701234567).
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;

  // Ta bort alla tecken utom siffror och plustecken
  let cleaned = rawPhone.replace(/[^\d+]/g, '').trim();

  // Om svenskt nummer som börjar med 07
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    cleaned = '+46' + cleaned.substring(1);
  } else if (cleaned.startsWith('46') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+') && cleaned.length >= 8) {
    // Standard: lägg till + om det saknas och ser ut som landskod
    cleaned = '+' + cleaned;
  }

  return cleaned.length >= 7 ? cleaned : null;
}

/**
 * Genererar en unik, lättläst rabattkod (t.ex. BONUS-7K9A2X).
 */
export function generateDiscountCode(prefix: string = 'BONUS-'): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Undviker förväxlingsbara tecken (0, 1, I, O)
  let code = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }
  return `${prefix.trim()}${code}`;
}

export interface CreateDiscountResult {
  code: string;
  priceRuleId: string;
  discountId?: string;
  expiresAt: string;
}

/**
 * Skapar en unik, engångs rabattkod i Shopify via Shopifys Price Rules & Discount Code API.
 */
export async function createShopifyDiscountCode(
  shopDomain: string,
  accessToken: string,
  options: {
    code: string;
    amount: number;
    validityDays?: number;
  }
): Promise<CreateDiscountResult> {
  const validityDays = options.validityDays || 90;
  const startsAt = new Date().toISOString();
  const expiresAtDate = new Date();
  expiresAtDate.setDate(expiresAtDate.getDate() + validityDays);
  const endsAt = expiresAtDate.toISOString();

  const priceRulePayload = {
    price_rule: {
      title: `Bonusbelöning: ${options.code}`,
      target_type: 'line_item',
      target_selection: 'all',
      allocation_method: 'across',
      value_type: 'fixed_amount',
      value: `-${Math.abs(options.amount).toFixed(2)}`,
      customer_selection: 'all',
      usage_limit: 1,
      starts_at: startsAt,
      ends_at: endsAt,
    },
  };

  const priceRuleRes = await fetch(
    `https://${shopDomain}/admin/api/2024-10/price_rules.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(priceRulePayload),
    }
  );

  if (!priceRuleRes.ok) {
    const errText = await priceRuleRes.text();
    throw new Error(`Shopify Price Rule misslyckades (${priceRuleRes.status}): ${errText}`);
  }

  const priceRuleData = await priceRuleRes.json();
  const priceRuleId = String(priceRuleData.price_rule.id);

  // Skapa själva rabattkoden under regeln
  const discountRes = await fetch(
    `https://${shopDomain}/admin/api/2024-10/price_rules/${priceRuleId}/discount_codes.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        discount_code: {
          code: options.code,
        },
      }),
    }
  );

  let discountId: string | undefined;
  if (discountRes.ok) {
    const discountData = await discountRes.json();
    discountId = String(discountData.discount_code?.id);
  }

  return {
    code: options.code,
    priceRuleId,
    discountId,
    expiresAt: endsAt,
  };
}

/**
 * Uppdaterar Shopify-ordern med attribut så att intjänade poäng och rabattkod syns på orderbekräftelsen.
 */
export async function updateShopifyOrderAttributes(
  shopDomain: string,
  accessToken: string,
  orderId: string | number,
  attributes: Array<{ name: string; value: string }>
): Promise<void> {
  try {
    await fetch(`https://${shopDomain}/admin/api/2024-10/orders/${orderId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        order: {
          id: orderId,
          note_attributes: attributes,
        },
      }),
    });
  } catch (err) {
    console.warn(`Kunde inte uppdatera attribut på Shopify-order ${orderId}:`, err);
  }
}

/**
 * Lägger till taggar på kunden i Shopify för enkel segmentering i Shopify Email.
 */
export async function addShopifyCustomerTags(
  shopDomain: string,
  accessToken: string,
  customerId: string | number,
  tagsToAdd: string[]
): Promise<void> {
  try {
    const getRes = await fetch(
      `https://${shopDomain}/admin/api/2024-10/customers/${customerId}.json`,
      {
        headers: { 'X-Shopify-Access-Token': accessToken },
      }
    );

    if (!getRes.ok) return;
    const data = await getRes.json();
    const existingTags = (data.customer?.tags || '')
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    const mergedTags = Array.from(new Set([...existingTags, ...tagsToAdd])).join(', ');

    await fetch(`https://${shopDomain}/admin/api/2024-10/customers/${customerId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        customer: {
          id: customerId,
          tags: mergedTags,
        },
      }),
    });
  } catch (err) {
    console.warn(`Kunde inte uppdatera kundtaggar på Shopify-kund ${customerId}:`, err);
  }
}
