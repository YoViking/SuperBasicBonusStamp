-- ============================================================================
-- SuperBasicBonusStamp - Migration: Shopify Integration
-- Kör detta skript i Supabase SQL Editor
-- ============================================================================

-- 1. Lägg till email på customers
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers (store_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (store_id, phone_number);

-- 2. Shopify integrations (Butikskoppling)
CREATE TABLE IF NOT EXISTS public.shopify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  consent_mode TEXT NOT NULL DEFAULT 'RESPECT_OUTREACH' CHECK (consent_mode IN ('RESPECT_OUTREACH', 'REQUIRE_CONSENT', 'ALWAYS_ENROLL')),
  eligible_product_types TEXT[] NOT NULL DEFAULT '{}',
  points_per_currency NUMERIC NOT NULL DEFAULT 1,
  discount_code_prefix TEXT NOT NULL DEFAULT 'BONUS-',
  discount_validity_days INTEGER NOT NULL DEFAULT 90,
  sync_articles BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id)
);

-- 3. Shopify orders (Ordrar och poängspårning)
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
  source_name TEXT NOT NULL DEFAULT 'web',
  marketing_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, shopify_order_id)
);

-- 4. Shopify discount codes (Unika rabattkoder)
CREATE TABLE IF NOT EXISTS public.shopify_discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  shopify_price_rule_id TEXT NOT NULL,
  shopify_discount_id TEXT,
  discount_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED')),
  used_at TIMESTAMPTZ,
  used_in_order_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE public.shopify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_discount_codes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shopify_integrations' AND policyname = 'shopify_integrations_manage_own') THEN
    CREATE POLICY "shopify_integrations_manage_own" ON public.shopify_integrations FOR ALL USING (auth.uid() = store_id) WITH CHECK (auth.uid() = store_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shopify_orders' AND policyname = 'shopify_orders_manage_own') THEN
    CREATE POLICY "shopify_orders_manage_own" ON public.shopify_orders FOR ALL USING (auth.uid() = store_id) WITH CHECK (auth.uid() = store_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'shopify_discount_codes' AND policyname = 'shopify_discount_codes_manage_own') THEN
    CREATE POLICY "shopify_discount_codes_manage_own" ON public.shopify_discount_codes FOR ALL USING (auth.uid() = store_id) WITH CHECK (auth.uid() = store_id);
  END IF;
END $$;
