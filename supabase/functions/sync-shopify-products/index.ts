// ============================================================================
// Supabase Edge Function: sync-shopify-products
// Hämtar artiklar/produkter och produktkategorier från Shopify till butiken
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Endast POST stöds' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Auktorisering saknas' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Skapa klient för att identifiera inloggad butiksanvändare
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Ej behörig' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const storeId = userData.user.id;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Hämta butikens koppling
    const { data: integration, error: intErr } = await adminClient
      .from('shopify_integrations')
      .select('*')
      .eq('store_id', storeId)
      .single();

    if (intErr || !integration) {
      return new Response(JSON.stringify({ error: 'Ingen aktiv Shopify-koppling hittades för butiken' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hämta produkter från Shopify Admin REST API
    const productsRes = await fetch(
      `https://${integration.shop_domain}/admin/api/2024-10/products.json?limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': integration.access_token,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsRes.ok) {
      const errText = await productsRes.text();
      return new Response(
        JSON.stringify({ error: `Kunde inte hämta produkter från Shopify: ${errText}` }),
        { status: productsRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const productsData = await productsRes.json();
    const products = productsData.products || [];

    const productTypesSet = new Set<string>();
    let insertedOrUpdatedCount = 0;

    for (const prod of products) {
      const category = (prod.product_type || 'Allmänt').trim() || 'Allmänt';
      if (prod.product_type) productTypesSet.add(prod.product_type.trim());

      const variants = prod.variants || [];
      for (const variant of variants) {
        const title =
          variants.length > 1
            ? `${prod.title} (${variant.title})`
            : prod.title;

        const price = Number(variant.price || 0);
        const sku = variant.sku ? String(variant.sku).trim() : null;

        // Kontrollera om artikeln redan finns baserat på SKU eller namn
        let existingQuery = adminClient
          .from('articles')
          .select('id')
          .eq('store_id', storeId);

        if (sku) {
          existingQuery = existingQuery.eq('sku', sku);
        } else {
          existingQuery = existingQuery.eq('name', title);
        }

        const { data: existing } = await existingQuery.maybeSingle();

        if (existing) {
          await adminClient
            .from('articles')
            .update({
              name: title,
              price,
              category,
              sku,
            })
            .eq('id', existing.id);
        } else {
          await adminClient.from('articles').insert({
            store_id: storeId,
            name: title,
            price,
            category,
            sku,
          });
        }
        insertedOrUpdatedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: insertedOrUpdatedCount,
        productTypes: Array.from(productTypesSet).sort(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Fel vid produktsynkning:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
