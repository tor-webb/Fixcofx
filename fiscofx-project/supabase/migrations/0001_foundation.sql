create extension if not exists pgcrypto;

create type user_role        as enum ('user', 'support', 'admin');
create type asset_class      as enum ('forex', 'crypto', 'stock', 'index', 'commodity', 'derivative');
create type order_side       as enum ('buy', 'sell');
create type order_type       as enum ('market', 'limit', 'stop');
create type order_status     as enum ('pending', 'filled', 'partially_filled', 'rejected', 'cancelled', 'expired', 'unknown');
create type txn_status       as enum ('pending', 'processing', 'completed', 'failed', 'cancelled');
create type ticket_status    as enum ('open', 'pending_user', 'resolved', 'closed');

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  timezone     text not null default 'Africa/Nairobi',
  role         user_role not null default 'user',
  preferences  jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.current_role_name() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('support','admin') from public.profiles where id = auth.uid()), false)
$$;

create table public.trading_accounts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null check (char_length(label) between 1 and 60),
  currency   char(3) not null default 'USD',
  is_demo    boolean not null default true,
  balance    numeric(20,8) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now()
);
create index on public.trading_accounts (user_id);

create table public.instruments (
  id                uuid primary key default gen_random_uuid(),
  symbol            text not null,
  name              text not null,
  asset_class       asset_class not null,
  instrument_type   text not null,
  exchange          text,
  base_currency     text,
  quote_currency    text,
  contract_type     text,
  price_precision   smallint not null default 5 check (price_precision between 0 and 12),
  qty_precision     smallint not null default 2 check (qty_precision between 0 and 12),
  min_order_size    numeric(20,8) not null default 0.01 check (min_order_size > 0),
  max_order_size    numeric(20,8) not null default 100 check (max_order_size >= min_order_size),
  tick_size         numeric(20,10) not null default 0.00001 check (tick_size > 0),
  trading_hours     jsonb,
  is_active         boolean not null default true,
  data_status       text not null default 'simulated' check (data_status in ('simulated','live','delayed','stale','unavailable')),
  verified_with_provider boolean not null default false,
  last_update_at    timestamptz,
  created_at        timestamptz not null default now(),
  unique (symbol, asset_class, exchange)
);
create index on public.instruments (asset_class, is_active);
create index on public.instruments using gin (to_tsvector('simple', symbol || ' ' || name));

create table public.instrument_provider_mappings (
  id              uuid primary key default gen_random_uuid(),
  instrument_id   uuid not null references public.instruments(id) on delete cascade,
  provider        text not null,
  provider_symbol text not null,
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  unique (instrument_id, provider)
);

create table public.watchlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
create table public.watchlist_items (
  watchlist_id  uuid not null references public.watchlists(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  position      int not null default 0,
  added_at      timestamptz not null default now(),
  primary key (watchlist_id, instrument_id)
);

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.trading_accounts(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  instrument_id   uuid not null references public.instruments(id),
  side            order_side not null,
  type            order_type not null,
  quantity        numeric(20,8) not null check (quantity > 0),
  limit_price     numeric(20,10) check (limit_price is null or limit_price > 0),
  stop_price      numeric(20,10) check (stop_price is null or stop_price > 0),
  stop_loss       numeric(20,10),
  take_profit     numeric(20,10),
  status          order_status not null default 'pending',
  reject_reason   text,
  expires_at      timestamptz,
  idempotency_key text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index on public.orders (account_id, status, created_at desc);
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();

create table public.executions (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  price       numeric(20,10) not null check (price > 0),
  quantity    numeric(20,8) not null check (quantity > 0),
  fee         numeric(20,8) not null default 0 check (fee >= 0),
  executed_at timestamptz not null default now()
);
create index on public.executions (order_id);

create table public.positions (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.trading_accounts(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id),
  side          order_side not null,
  quantity      numeric(20,8) not null check (quantity > 0),
  entry_price   numeric(20,10) not null check (entry_price > 0),
  stop_loss     numeric(20,10),
  take_profit   numeric(20,10),
  fees_paid     numeric(20,8) not null default 0,
  opened_at     timestamptz not null default now()
);
create index on public.positions (account_id);

create table public.closed_trades (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.trading_accounts(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id),
  side          order_side not null,
  quantity      numeric(20,8) not null check (quantity > 0),
  entry_price   numeric(20,10) not null,
  exit_price    numeric(20,10) not null,
  gross_pnl     numeric(20,8) not null,
  fees          numeric(20,8) not null default 0,
  net_pnl       numeric(20,8) not null,
  close_reason  text not null check (close_reason in ('manual','stop_loss','take_profit','partial','liquidation','system')),
  opened_at     timestamptz not null,
  closed_at     timestamptz not null default now()
);
create index on public.closed_trades (account_id, closed_at desc);

create table public.wallets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  account_id       uuid references public.trading_accounts(id) on delete cascade,
  currency         text not null,
  is_demo          boolean not null default true,
  available        numeric(20,8) not null default 0 check (available >= 0),
  reserved         numeric(20,8) not null default 0 check (reserved >= 0),
  pending_deposits numeric(20,8) not null default 0 check (pending_deposits >= 0),
  pending_withdrawals numeric(20,8) not null default 0 check (pending_withdrawals >= 0),
  unique (user_id, currency, is_demo)
);

create table public.ledger_accounts (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid references public.profiles(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete cascade,
  name     text not null,
  currency text not null,
  is_demo  boolean not null default true
);

create table public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  wallet_id   uuid not null references public.wallets(id),
  kind        text not null check (kind in ('deposit','withdrawal','fee','adjustment','trade_pnl')),
  amount      numeric(20,8) not null check (amount > 0),
  currency    text not null,
  status      txn_status not null default 'pending',
  is_demo     boolean not null default true,
  reference   text not null unique,
  provider    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index on public.transactions (user_id, created_at desc);
create trigger txn_updated before update on public.transactions for each row execute function public.set_updated_at();

create table public.ledger_entries (
  id             uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id),
  ledger_account_id uuid not null references public.ledger_accounts(id),
  direction      text not null check (direction in ('debit','credit')),
  amount         numeric(20,8) not null check (amount > 0),
  currency       text not null,
  created_at     timestamptz not null default now()
);
create index on public.ledger_entries (transaction_id);
create or replace function public.block_ledger_mutation() returns trigger
language plpgsql as $$ begin raise exception 'ledger_entries is append-only'; end $$;
create trigger ledger_no_update before update or delete on public.ledger_entries
  for each row execute function public.block_ledger_mutation();

create table public.broker_connections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  platform    text not null check (platform in ('mt4','mt5','exchange','other')),
  status      text not null default 'not_connected' check (status in ('not_connected','pending_verification','connected','error')),
  external_ref text,
  last_checked_at timestamptz,
  created_at  timestamptz not null default now()
);

create table public.chart_layouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 60),
  layout     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create table public.price_alerts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  condition     text not null check (condition in ('above','below')),
  target_price  numeric(20,10) not null check (target_price > 0),
  is_active     boolean not null default true,
  triggered_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (user_id, instrument_id, condition, target_price)
);

create table public.news_sources (
  id        uuid primary key default gen_random_uuid(),
  name      text not null unique,
  url       text,
  is_sample boolean not null default true,
  license_notes text
);
create table public.news_articles (
  id          uuid primary key default gen_random_uuid(),
  source_id   uuid not null references public.news_sources(id),
  headline    text not null,
  summary     text,
  category    text not null,
  region      text,
  original_url text,
  is_sample   boolean not null default true,
  published_at timestamptz not null,
  updated_at  timestamptz
);
create index on public.news_articles (published_at desc);
create table public.news_instrument_links (
  article_id    uuid not null references public.news_articles(id) on delete cascade,
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  primary key (article_id, instrument_id)
);
create table public.economic_events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  region      text,
  currency    text,
  scheduled_at timestamptz not null,
  actual      text,
  forecast    text,
  previous    text,
  importance  text check (importance in ('low','medium','high')),
  is_sample   boolean not null default true,
  source      text,
  updated_at  timestamptz not null default now()
);
create index on public.economic_events (scheduled_at);
create table public.news_alerts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null check (kind in ('instrument','central_bank','earnings','economic_release','important_news')),
  instrument_id uuid references public.instruments(id) on delete cascade,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.support_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  channel    text not null default 'mock_assistant' check (channel in ('mock_assistant','ai','human')),
  created_at timestamptz not null default now()
);
create table public.support_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender          text not null check (sender in ('user','assistant','staff')),
  body            text not null check (char_length(body) <= 4000),
  created_at      timestamptz not null default now()
);
create index on public.support_messages (conversation_id, created_at);
create table public.support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  subject    text not null check (char_length(subject) between 1 and 200),
  body       text not null check (char_length(body) <= 4000),
  status     ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger tickets_updated before update on public.support_tickets for each row execute function public.set_updated_at();

create table public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  entity     text,
  entity_id  text,
  details    jsonb,
  ip         inet,
  created_at timestamptz not null default now()
);
create index on public.audit_logs (created_at desc);

alter table public.profiles                  enable row level security;
alter table public.trading_accounts          enable row level security;
alter table public.instruments               enable row level security;
alter table public.instrument_provider_mappings enable row level security;
alter table public.watchlists                enable row level security;
alter table public.watchlist_items           enable row level security;
alter table public.orders                    enable row level security;
alter table public.executions                enable row level security;
alter table public.positions                 enable row level security;
alter table public.closed_trades             enable row level security;
alter table public.wallets                   enable row level security;
alter table public.ledger_accounts           enable row level security;
alter table public.ledger_entries            enable row level security;
alter table public.transactions              enable row level security;
alter table public.broker_connections        enable row level security;
alter table public.chart_layouts             enable row level security;
alter table public.price_alerts              enable row level security;
alter table public.news_sources              enable row level security;
alter table public.news_articles             enable row level security;
alter table public.news_instrument_links     enable row level security;
alter table public.economic_events           enable row level security;
alter table public.news_alerts               enable row level security;
alter table public.support_conversations     enable row level security;
alter table public.support_messages          enable row level security;
alter table public.support_tickets           enable row level security;
alter table public.audit_logs                enable row level security;

create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant  update (display_name, timezone, preferences) on public.profiles to authenticated;

create policy ta_select on public.trading_accounts for select using (user_id = auth.uid() or public.is_admin());
create policy ta_insert_demo on public.trading_accounts for insert with check (user_id = auth.uid() and is_demo = true and balance = 0);
revoke update, delete on public.trading_accounts from authenticated, anon;

create policy instr_read on public.instruments for select using (true);
create policy instr_admin on public.instruments for all using (public.is_admin()) with check (public.is_admin());
create policy ipm_read on public.instrument_provider_mappings for select using (public.is_staff());
create policy ipm_admin on public.instrument_provider_mappings for all using (public.is_admin()) with check (public.is_admin());
create policy ns_read on public.news_sources for select using (true);
create policy ns_admin on public.news_sources for all using (public.is_admin()) with check (public.is_admin());
create policy na_read on public.news_articles for select using (true);
create policy na_admin on public.news_articles for all using (public.is_admin()) with check (public.is_admin());
create policy nil_read on public.news_instrument_links for select using (true);
create policy nil_admin on public.news_instrument_links for all using (public.is_admin()) with check (public.is_admin());
create policy ee_read on public.economic_events for select using (true);
create policy ee_admin on public.economic_events for all using (public.is_admin()) with check (public.is_admin());

create policy wl_own on public.watchlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wli_own on public.watchlist_items for all
  using (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.user_id = auth.uid()));
create policy cl_own on public.chart_layouts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy pa_own on public.price_alerts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy nal_own on public.news_alerts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy bc_select on public.broker_connections for select using (user_id = auth.uid());

create policy orders_select on public.orders for select using (user_id = auth.uid());
create policy exec_select   on public.executions for select using (user_id = auth.uid());
create policy pos_select    on public.positions for select using (user_id = auth.uid());
create policy ct_select     on public.closed_trades for select using (user_id = auth.uid());
create policy wal_select    on public.wallets for select using (user_id = auth.uid());
create policy la_select     on public.ledger_accounts for select using (user_id = auth.uid());
create policy txn_select    on public.transactions for select using (user_id = auth.uid());
create policy le_select     on public.ledger_entries for select
  using (exists (select 1 from public.transactions t where t.id = transaction_id and t.user_id = auth.uid()));

create policy sc_own on public.support_conversations for select using (user_id = auth.uid() or public.is_staff());
create policy sc_ins on public.support_conversations for insert with check (user_id = auth.uid());
create policy sm_select on public.support_messages for select
  using (exists (select 1 from public.support_conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.is_staff())));
create policy sm_insert_user on public.support_messages for insert
  with check (sender = 'user' and exists (select 1 from public.support_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy st_select on public.support_tickets for select using (user_id = auth.uid() or public.is_staff());
create policy st_insert on public.support_tickets for insert with check (user_id = auth.uid() and status = 'open');
create policy st_staff_update on public.support_tickets for update using (public.is_staff()) with check (public.is_staff());

create policy audit_admin_read on public.audit_logs for select using (public.is_admin());

revoke insert, update, delete on public.orders, public.executions, public.positions, public.closed_trades,
  public.wallets, public.ledger_accounts, public.ledger_entries, public.transactions, public.audit_logs
  from authenticated, anon;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, split_part(new.email, '@', 1));
  insert into public.trading_accounts (user_id, label, currency, is_demo, balance)
  values (new.id, 'Demo account', 'USD', true, 10000);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
