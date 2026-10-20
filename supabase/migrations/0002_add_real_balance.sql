ALTER TABLE public.trading_accounts
  ADD COLUMN real_balance numeric(20,8) NOT NULL DEFAULT 0
  CHECK (real_balance >= 0);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));

  INSERT INTO public.trading_accounts
    (user_id, label, currency, is_demo, balance, real_balance)
  VALUES
    (NEW.id, 'Main Account', 'USD', TRUE, 10000, 0);

  RETURN NEW;
END;
$$;
