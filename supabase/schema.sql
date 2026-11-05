-- ============================================================================
-- SuperBasicBonusStamp - Supabase PostgreSQL Schema
-- Kör detta skript i Supabase Dashboard -> SQL Editor -> New Query
-- Skriptet är idempotent och kan köras säkert flera gånger.
-- ============================================================================

-- 1. STORES (En rad per butik, kopplad till Supabase Auth user.id)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL DEFAULT 'Min Butik',
  bonus_type TEXT NOT NULL DEFAULT 'STAMPS' CHECK (bonus_type IN ('STAMPS', 'POINTS')),
  pos_mode TEXT NOT NULL DEFAULT 'QUICK' CHECK (pos_mode IN ('QUICK', 'ARTICLES')),
  threshold NUMERIC NOT NULL DEFAULT 10,
  reward_amount NUMERIC NOT NULL DEFAULT 1,
  reward_description TEXT NOT NULL DEFAULT '1 gratis vara',
  purchase_message TEXT NOT NULL DEFAULT 'Tack för ditt besök hos {butik}! Du har nu {saldo} (bara {kvar_till_bonus} kvar till din bonus: {bonus}).',
  bonus_message TEXT NOT NULL DEFAULT 'Tack för ditt besök hos {butik}! Grattis! Du har nått en ny bonus ({bonus}) att nyttja vid nästa köp! Du har nu {kvar_till_bonus} kvar till nästa bonus.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMERS (Kunder per butik)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  email TEXT,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  opt_out_outreach BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, phone_number)
);

-- Om tabellen customers redan existerade från tidigare: säkerställ att email finns
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (store_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (store_id, phone_number);

-- 3. ARTICLES (Artiklar per butik - används i Artikelläge)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Allmänt',
  sales_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRANSACTIONS (Historik över köp och stämplar)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  delta_balance NUMERIC NOT NULL DEFAULT 0,
  bonuses_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SHOPIFY INTEGRATION
-- ============================================================================

-- 5. SHOPIFY INTEGRATIONS (Koppling per butik)
CREATE TABLE IF NOT EXISTS public.shopify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL UNIQUE,                -- t.ex. "min-butik.myshopify.com"
  access_token TEXT NOT NULL,                      -- Admin API token (shpat_...)
  webhook_secret TEXT NOT NULL,                    -- Webhook signing secret
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  consent_mode TEXT NOT NULL DEFAULT 'RESPECT_OUTREACH' CHECK (consent_mode IN ('RESPECT_OUTREACH', 'REQUIRE_CONSENT', 'ALWAYS_ENROLL')),
  eligible_product_types TEXT[] NOT NULL DEFAULT '{}', -- Tom lista = alla varor ger poäng
  points_per_currency NUMERIC NOT NULL DEFAULT 1,  -- T.ex. 1 poäng per 1 kr
  discount_code_prefix TEXT NOT NULL DEFAULT 'BONUS-',
  discount_validity_days INTEGER NOT NULL DEFAULT 90,
  sync_articles BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id)
);

-- 6. SHOPIFY ORDERS (Spårbarhet, idempotens & omnikanal)
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  total_price NUMERIC NOT NULL DEFAULT 0,
  eligible_subtotal NUMERIC NOT NULL DEFAULT 0,
  points_awarded NUMERIC NOT NULL DEFAULT 0,
  discounts_applied TEXT[] NOT NULL DEFAULT '{}',
  source_name TEXT NOT NULL DEFAULT 'web',         -- 'web', 'pos', etc.
  marketing_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, shopify_order_id)
);

-- 7. SHOPIFY DISCOUNT CODES (Unika rabattkoder för online-inlösen)
CREATE TABLE IF NOT EXISTS public.shopify_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,                       -- T.ex. BONUS-K8X29A
  shopify_price_rule_id TEXT NOT NULL,
  shopify_discount_id TEXT,
  discount_amount NUMERIC NOT NULL,                -- Värde i kr (motsvarande reward_amount)
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED')),
  used_at TIMESTAMPTZ,
  used_in_order_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Varje butik ser och ändrar ENDAST sin egen data
-- ============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_discount_codes ENABLE ROW LEVEL SECURITY;

-- Policies för stores
DROP POLICY IF EXISTS "Butik hanterar sin egen profil" ON public.stores;
CREATE POLICY "Butik hanterar sin egen profil"
  ON public.stores
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies för customers
DROP POLICY IF EXISTS "Butik hanterar sina egna kunder" ON public.customers;
CREATE POLICY "Butik hanterar sina egna kunder"
  ON public.customers
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för articles
DROP POLICY IF EXISTS "Butik hanterar sina egna artiklar" ON public.articles;
CREATE POLICY "Butik hanterar sina egna artiklar"
  ON public.articles
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för transactions
DROP POLICY IF EXISTS "Butik hanterar sina egna transaktioner" ON public.transactions;
CREATE POLICY "Butik hanterar sina egna transaktioner"
  ON public.transactions
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för shopify_integrations
DROP POLICY IF EXISTS "Butik hanterar sin egen Shopify-koppling" ON public.shopify_integrations;
CREATE POLICY "Butik hanterar sin egen Shopify-koppling"
  ON public.shopify_integrations
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för shopify_orders
DROP POLICY IF EXISTS "Butik läser sina egna Shopify-ordrar" ON public.shopify_orders;
CREATE POLICY "Butik läser sina egna Shopify-ordrar"
  ON public.shopify_orders
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för shopify_discount_codes
DROP POLICY IF EXISTS "Butik hanterar sina egna Shopify-rabattkoder" ON public.shopify_discount_codes;
CREATE POLICY "Butik hanterar sina egna Shopify-rabattkoder"
  ON public.shopify_discount_codes
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- ============================================================================
-- AUTOMATISK SKAPANDE AV BUTIKSPROFIL VID NY REGISTRERING
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_store_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.stores (id, store_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Min Butik')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_store_user();
