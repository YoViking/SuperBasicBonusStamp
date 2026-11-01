-- ============================================================================
-- SuperBasicBonusStamp - Supabase PostgreSQL Schema
-- Kör detta skript i Supabase Dashboard -> SQL Editor -> New Query
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
  current_balance NUMERIC NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, phone_number)
);

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
-- ROW LEVEL SECURITY (RLS) - Varje butik ser och ändrar ENDAST sin egen data
-- ============================================================================

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies för stores
CREATE POLICY "Butik hanterar sin egen profil"
  ON public.stores
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies för customers
CREATE POLICY "Butik hanterar sina egna kunder"
  ON public.customers
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för articles
CREATE POLICY "Butik hanterar sina egna artiklar"
  ON public.articles
  FOR ALL
  USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Policies för transactions
CREATE POLICY "Butik hanterar sina egna transaktioner"
  ON public.transactions
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
