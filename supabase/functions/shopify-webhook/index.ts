// ============================================================================
// Supabase Edge Function: shopify-webhook
// Hanterar Shopify Webhooks (orders/paid, refunds/create etc.)
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';
import {
  verifyShopifyHmac,
  normalizePhoneNumber,
  generateDiscountCode,
  createShopifyDiscountCode,
  updateShopifyOrderAttributes,
  addShopifyCustomerTags,
} from '../_shared/shopify.ts';

Deno.serve(async (req: Request) => {
  // Endast POST tillåts för webhooks
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Endast POST stöds' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const shopDomain = req.headers.get('x-shopify-shop-domain');
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  const topic = req.headers.get('x-shopify-topic') || 'orders/paid';

  if (!shopDomain) {
    return new Response(JSON.stringify({ error: 'x-shopify-shop-domain saknas' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawBody = await req.text();

  // Skapa Supabase Admin-klient (med service role för att uppdatera tabeller oberoende av inloggad användare)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Hämta butikens Shopify-integration
  const { data: integration, error: intError } = await supabase
    .from('shopify_integrations')
    .select('*, stores(*)')
    .eq('shop_domain', shopDomain)
    .single();

  if (intError || !integration || !integration.is_active) {
    console.error(`Aktiv integration saknas för domän: ${shopDomain}`);
    return new Response(JSON.stringify({ error: 'Butik eller integration saknas' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Verifiera HMAC-signatur
  const isValidHmac = await verifyShopifyHmac(
    rawBody,
    hmacHeader,
    integration.webhook_secret
  );

  if (!isValidHmac) {
    console.error('Ogiltig Shopify HMAC-signatur');
    return new Response(JSON.stringify({ error: 'Ogiltig signatur' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const order = JSON.parse(rawBody);
  const storeId = integration.store_id;
  const storeSettings = integration.stores;

  try {
    // ========================================================================
    // A. HANTERING AV ORDERS / PAID
    // ========================================================================
    if (topic === 'orders/paid' || topic === 'orders/create') {
      const shopifyOrderId = String(order.id);

      // 1. Idempotenskontroll (förhindra dubbelkörning vid Shopify webhook retries)
      const { data: existingOrder } = await supabase
        .from('shopify_orders')
        .select('id')
        .eq('store_id', storeId)
        .eq('shopify_order_id', shopifyOrderId)
        .maybeSingle();

      if (existingOrder) {
        return new Response(
          JSON.stringify({ message: 'Order redan behandlad tidigare' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // 2. Kundidentifiering & Samtycke (Consent)
      const rawPhone =
        order.customer?.phone ||
        order.shipping_address?.phone ||
        order.billing_address?.phone;
      const normalizedPhone = normalizePhoneNumber(rawPhone);
      const customerEmail = (order.customer?.email || order.email || '').trim().toLowerCase() || null;

      // Samtyckeskontroll
      const acceptsMarketing =
        Boolean(order.buyer_accepts_marketing) ||
        Boolean(order.customer?.accepts_marketing) ||
        order.customer?.sms_marketing_consent?.state === 'subscribed';

      // Om butiken kräver strikt samtycke och kunden tackade nej
      if (integration.consent_mode === 'REQUIRE_CONSENT' && !acceptsMarketing) {
        return new Response(
          JSON.stringify({ message: 'Order ignorerad: kunden gav ej samtycke till lojalitetsprogram' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Om varken telefon eller e-post finns kan vi inte identifiera kunden
      if (!normalizedPhone && !customerEmail) {
        return new Response(
          JSON.stringify({ message: 'Order saknar kontaktuppgift (telefon/epost)' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Slå upp eller skapa kund
      let customerId: string | null = null;
      let customerBalance = 0;
      let customerTotalSpent = 0;

      // Sök på telefonnummer i första hand
      let { data: customer } = normalizedPhone
        ? await supabase
            .from('customers')
            .select('*')
            .eq('store_id', storeId)
            .eq('phone_number', normalizedPhone)
            .maybeSingle()
        : { data: null };

      // Sök på e-post i andra hand om telefon saknas eller ej gav träff
      if (!customer && customerEmail) {
        const { data: customerByEmail } = await supabase
          .from('customers')
          .select('*')
          .eq('store_id', storeId)
          .eq('email', customerEmail)
          .maybeSingle();
        customer = customerByEmail;
      }

      const optOut = integration.consent_mode === 'RESPECT_OUTREACH' ? !acceptsMarketing : false;

      if (!customer) {
        // Skapa ny kund
        const newPhone = normalizedPhone || customerEmail || `shopify-${order.customer?.id || Date.now()}`;
        const { data: createdCustomer, error: createCustErr } = await supabase
          .from('customers')
          .insert({
            store_id: storeId,
            phone_number: newPhone,
            email: customerEmail,
            current_balance: 0,
            total_spent: 0,
            opt_out_outreach: optOut,
          })
          .select()
          .single();

        if (createCustErr) throw createCustErr;
        customerId = createdCustomer.id;
        customerBalance = 0;
        customerTotalSpent = 0;
      } else {
        customerId = customer.id;
        customerBalance = Number(customer.current_balance ?? 0);
        customerTotalSpent = Number(customer.total_spent ?? 0);

        // Komplettera saknad e-post eller telefon om tillgängligt
        const updates: any = {};
        if (!customer.email && customerEmail) updates.email = customerEmail;
        if ((!customer.phone_number || customer.phone_number.startsWith('shopify-')) && normalizedPhone) {
          updates.phone_number = normalizedPhone;
        }
        if (acceptsMarketing && customer.opt_out_outreach) {
          updates.opt_out_outreach = false; // Kunden gav aktivt nytt samtycke i kassan
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('customers').update(updates).eq('id', customerId);
        }
      }

      // 3. Kontrollera om kunden använde en aktiv rabattkod i ordern
      const appliedDiscounts = (order.discount_applications || [])
        .map((d: any) => d.code || d.title)
        .filter(Boolean);

      let bonusesRedeemedCount = 0;
      for (const discCode of appliedDiscounts) {
        const { data: matchedDiscount } = await supabase
          .from('shopify_discount_codes')
          .select('*')
          .eq('store_id', storeId)
          .eq('code', discCode)
          .eq('status', 'ACTIVE')
          .maybeSingle();

        if (matchedDiscount) {
          // Markera koden som förbrukad
          await supabase
            .from('shopify_discount_codes')
            .update({
              status: 'USED',
              used_at: new Date().toISOString(),
              used_in_order_id: shopifyOrderId,
            })
            .eq('id', matchedDiscount.id);

          bonusesRedeemedCount += 1;
        }
      }

      // 4. Beräkna intjänade poäng eller stämplar
      const bonusType = storeSettings?.bonus_type || 'POINTS';
      let eligibleSubtotal = 0;
      let pointsOrStampsAwarded = 0;

      if (bonusType === 'POINTS') {
        const eligibleTypes = integration.eligible_product_types || [];
        if (eligibleTypes.length > 0 && Array.isArray(order.line_items)) {
          // Filtrera på specifika artikelgrupper / produkttyper
          for (const item of order.line_items) {
            const productType = (item.product_type || '').trim();
            if (eligibleTypes.includes(productType)) {
              eligibleSubtotal += Number(item.price ?? 0) * Number(item.quantity ?? 1);
            }
          }
        } else {
          // Alla produkter ger poäng (subtotal exkl frakt)
          eligibleSubtotal = Number(order.current_subtotal_price || order.subtotal_price || 0);
        }

        const pointsRate = Number(integration.points_per_currency || 1);
        pointsOrStampsAwarded = Math.max(0, Math.floor(eligibleSubtotal * pointsRate));
      } else {
        // STAMPS-läge: 1 stämpel per betald order
        eligibleSubtotal = Number(order.current_subtotal_price || order.subtotal_price || 0);
        pointsOrStampsAwarded = 1;
      }

      // 5. Uppdatera kundens saldo
      let newBalance = customerBalance + pointsOrStampsAwarded;
      const newTotalSpent = customerTotalSpent + eligibleSubtotal;

      // 6. Kontrollera om kunden nått ny bonuströskel och ska få en unik Shopify-rabattkod
      const threshold = Math.max(1, Number(storeSettings?.threshold || 1000));
      const rewardAmount = Number(storeSettings?.reward_amount || 100);
      let newlyGeneratedCode: string | null = null;

      if (newBalance >= threshold) {
        const prefix = integration.discount_code_prefix || 'BONUS-';
        const codeString = generateDiscountCode(prefix);

        try {
          const discountResult = await createShopifyDiscountCode(
            shopDomain,
            integration.access_token,
            {
              code: codeString,
              amount: rewardAmount,
              validityDays: integration.discount_validity_days || 90,
            }
          );

          // Spara rabattkoden i databasen
          await supabase.from('shopify_discount_codes').insert({
            store_id: storeId,
            customer_id: customerId,
            code: discountResult.code,
            shopify_price_rule_id: discountResult.priceRuleId,
            shopify_discount_id: discountResult.discountId,
            discount_amount: rewardAmount,
            status: 'ACTIVE',
            expires_at: discountResult.expiresAt,
          });

          // Dra av tröskelvärdet från saldot när belöning skapats
          newBalance = newBalance - threshold;
          newlyGeneratedCode = discountResult.code;

          // Tagga kunden i Shopify
          if (order.customer?.id) {
            await addShopifyCustomerTags(
              shopDomain,
              integration.access_token,
              order.customer.id,
              ['kundklubb-bonus', 'aktiv-rabattkod']
            );
          }
        } catch (codeErr) {
          console.error('Kunde inte skapa rabattkod i Shopify:', codeErr);
        }
      }

      // Spara uppdaterat kundsaldo
      await supabase
        .from('customers')
        .update({
          current_balance: newBalance,
          total_spent: newTotalSpent,
        })
        .eq('id', customerId);

      // Registrera transaktion
      await supabase.from('transactions').insert({
        store_id: storeId,
        customer_id: customerId,
        delta_balance: pointsOrStampsAwarded,
        bonuses_redeemed: bonusesRedeemedCount,
      });

      // Spara order i shopify_orders
      await supabase.from('shopify_orders').insert({
        store_id: storeId,
        shopify_order_id: shopifyOrderId,
        order_number: String(order.order_number || order.name || ''),
        customer_id: customerId,
        total_price: Number(order.total_price || 0),
        eligible_subtotal: eligibleSubtotal,
        points_awarded: pointsOrStampsAwarded,
        discounts_applied: appliedDiscounts,
        source_name: String(order.source_name || 'web'),
        marketing_consent_given: acceptsMarketing,
      });

      // 7. Lägg till attribut på Shopify-ordern så att poäng & rabattkod syns på orderbekräftelsen
      const noteAttributes = [
        { name: 'bonus_points_earned', value: String(pointsOrStampsAwarded) },
        { name: 'bonus_new_balance', value: String(newBalance) },
      ];
      if (newlyGeneratedCode) {
        noteAttributes.push({
          name: 'bonus_discount_code',
          value: newlyGeneratedCode,
        });
      }

      await updateShopifyOrderAttributes(
        shopDomain,
        integration.access_token,
        shopifyOrderId,
        noteAttributes
      );

      return new Response(
        JSON.stringify({
          success: true,
          pointsAwarded: pointsOrStampsAwarded,
          newBalance,
          newDiscountCode: newlyGeneratedCode,
          bonusesRedeemed: bonusesRedeemedCount,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ========================================================================
    // B. HANTERING AV REFUNDS (RETURER / ÅTERBETALNINGAR)
    // ========================================================================
    if (topic === 'refunds/create') {
      const shopifyOrderId = String(order.order_id);

      const { data: matchedOrder } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('store_id', storeId)
        .eq('shopify_order_id', shopifyOrderId)
        .maybeSingle();

      if (matchedOrder && matchedOrder.customer_id) {
        // Beräkna poäng som ska dras tillbaka baserat på returbelopp
        const refundedAmount = (order.refund_line_items || []).reduce(
          (sum: number, r: any) => sum + Number(r.subtotal || 0),
          0
        );

        const pointsRate = Number(integration.points_per_currency || 1);
        const pointsToDeduct = Math.floor(refundedAmount * pointsRate);

        if (pointsToDeduct > 0) {
          const { data: cust } = await supabase
            .from('customers')
            .select('current_balance')
            .eq('id', matchedOrder.customer_id)
            .single();

          if (cust) {
            const adjustedBalance = Math.max(0, Number(cust.current_balance) - pointsToDeduct);
            await supabase
              .from('customers')
              .update({ current_balance: adjustedBalance })
              .eq('id', matchedOrder.customer_id);

            await supabase.from('transactions').insert({
              store_id: storeId,
              customer_id: matchedOrder.customer_id,
              delta_balance: -pointsToDeduct,
              bonuses_redeemed: 0,
            });
          }
        }
      }

      return new Response(JSON.stringify({ success: true, refundProcessed: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: `Ignorerat ämne: ${topic}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Fel i shopify-webhook handler:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internt fel' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
