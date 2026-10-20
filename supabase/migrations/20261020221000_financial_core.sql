-- First financial schema slice.
-- Apply only after reviewing docs/DUTCH_TAX_BASELINE.md and docs/FINANCIAL_DATA_CONVENTIONS.md.
-- This schema stores invoices and exact decimal values; it does not post ledger entries.

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.accounting_entities(id) on delete cascade,
  invoice_date date not null,
  delivery_date date,
  currency_code char(3) not null default 'EUR'
    check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'draft'
    check (status in ('draft', 'final', 'cancelled')),
  supplier_legal_name text,
  supplier_address text,
  supplier_vat_id text,
  supplier_kvk_number text,
  buyer_legal_name text,
  buyer_address text,
  invoice_series text,
  invoice_year integer,
  invoice_number text,
  vat_rounding_method text not null default 'per_line'
    check (vat_rounding_method = 'per_line'),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'draft' and invoice_number is null and invoice_series is null
      and invoice_year is null and finalized_at is null)
    or
    (status in ('final', 'cancelled') and invoice_number is not null
      and invoice_series is not null and invoice_year is not null and finalized_at is not null)
  ),
  unique (id, entity_id)
);

create unique index if not exists invoices_number_unique_idx
  on public.invoices (entity_id, invoice_series, invoice_year, invoice_number)
  where invoice_number is not null;

create index if not exists invoices_entity_date_idx
  on public.invoices (entity_id, invoice_date desc);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  position integer not null check (position > 0),
  description text not null check (char_length(btrim(description)) between 1 and 500),
  quantity numeric(12,4) not null check (quantity > 0),
  unit_price numeric(12,4) not null check (unit_price >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  net_amount numeric(12,2) not null check (net_amount >= 0),
  vat_treatment text not null
    check (vat_treatment in ('standard', 'zero_rate', 'exempt', 'reverse_charge', 'kor')),
  vat_rate numeric(5,2),
  vat_reason text,
  taxable_base numeric(12,2) not null check (taxable_base >= 0),
  vat_amount numeric(12,2) not null default 0 check (vat_amount >= 0),
  gross_amount numeric(12,2) not null check (gross_amount >= 0),
  created_at timestamptz not null default now(),
  unique (invoice_id, position),
  check (gross_amount = net_amount + vat_amount),
  check (
    (vat_treatment = 'standard'
      and vat_rate in (9.00, 21.00)
      and vat_reason is null)
    or
    (vat_treatment = 'zero_rate'
      and vat_rate = 0.00
      and nullif(btrim(vat_reason), '') is not null)
    or
    (vat_treatment in ('exempt', 'reverse_charge', 'kor')
      and vat_rate is null
      and nullif(btrim(vat_reason), '') is not null)
  )
);

create index if not exists invoice_lines_invoice_position_idx
  on public.invoice_lines (invoice_id, position);

create table if not exists public.invoice_number_counters (
  entity_id uuid not null references public.accounting_entities(id) on delete cascade,
  series text not null check (series ~ '^[A-Z0-9]{1,12}$'),
  invoice_year integer not null check (invoice_year between 2000 and 9999),
  next_number bigint not null default 1 check (next_number > 0),
  updated_at timestamptz not null default now(),
  primary key (entity_id, series, invoice_year)
);

alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.invoice_number_counters enable row level security;

create policy "Owners can read their invoices"
  on public.invoices for select to authenticated
  using (
    exists (
      select 1 from public.accounting_entities e
      where e.id = invoices.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can insert draft invoices"
  on public.invoices for insert to authenticated
  with check (
    status = 'draft'
    and invoice_number is null
    and invoice_series is null
    and invoice_year is null
    and finalized_at is null
    and exists (
      select 1 from public.accounting_entities e
      where e.id = invoices.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can update draft invoices"
  on public.invoices for update to authenticated
  using (
    status = 'draft'
    and exists (
      select 1 from public.accounting_entities e
      where e.id = invoices.entity_id and e.owner_user_id = (select auth.uid())
    )
  )
  with check (
    status = 'draft'
    and invoice_number is null
    and invoice_series is null
    and invoice_year is null
    and finalized_at is null
    and exists (
      select 1 from public.accounting_entities e
      where e.id = invoices.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can read invoice lines for their invoices"
  on public.invoice_lines for select to authenticated
  using (
    exists (
      select 1
      from public.invoices i
      join public.accounting_entities e on e.id = i.entity_id
      where i.id = invoice_lines.invoice_id
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can insert invoice lines for draft invoices"
  on public.invoice_lines for insert to authenticated
  with check (
    exists (
      select 1
      from public.invoices i
      join public.accounting_entities e on e.id = i.entity_id
      where i.id = invoice_lines.invoice_id
        and i.status = 'draft'
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can update invoice lines for draft invoices"
  on public.invoice_lines for update to authenticated
  using (
    exists (
      select 1
      from public.invoices i
      join public.accounting_entities e on e.id = i.entity_id
      where i.id = invoice_lines.invoice_id
        and i.status = 'draft'
        and e.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.invoices i
      join public.accounting_entities e on e.id = i.entity_id
      where i.id = invoice_lines.invoice_id
        and i.status = 'draft'
        and e.owner_user_id = (select auth.uid())
    )
  );

-- Counters can only be changed by the narrowly-scoped finalize_invoice function.
revoke all privileges on table public.invoice_number_counters from anon, authenticated;
revoke all privileges on table public.invoices from anon, authenticated;
revoke all privileges on table public.invoice_lines from anon, authenticated;
grant select, insert, update on table public.invoices to authenticated;
grant select, insert, update on table public.invoice_lines to authenticated;

create or replace function public.finalize_invoice(p_invoice_id uuid, p_series text default 'INV')
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice public.invoices%rowtype;
  v_year integer;
  v_next bigint;
  v_formatted_number text;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_series is null or p_series !~ '^[A-Z0-9]{1,12}$' then
    raise exception 'Invalid invoice series' using errcode = '22023';
  end if;

  select i.*
    into v_invoice
    from public.invoices i
    join public.accounting_entities e on e.id = i.entity_id
   where i.id = p_invoice_id
     and e.owner_user_id = v_user_id
   for update of i;

  if not found then
    raise exception 'Invoice not found or not accessible' using errcode = 'P0002';
  end if;

  if v_invoice.status <> 'draft' or v_invoice.invoice_number is not null then
    raise exception 'Only a draft without a number can be finalized' using errcode = '22023';
  end if;

  if nullif(btrim(v_invoice.supplier_legal_name), '') is null
     or nullif(btrim(v_invoice.supplier_address), '') is null
     or nullif(btrim(v_invoice.buyer_legal_name), '') is null
     or nullif(btrim(v_invoice.buyer_address), '') is null
     or v_invoice.delivery_date is null then
    raise exception 'Required invoice identity, address, and delivery date are missing' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.invoice_lines l where l.invoice_id = v_invoice.id
  ) then
    raise exception 'At least one invoice line is required' using errcode = '22023';
  end if;

  v_year := extract(year from v_invoice.invoice_date)::integer;

  insert into public.invoice_number_counters (entity_id, series, invoice_year, next_number)
  values (v_invoice.entity_id, p_series, v_year, 1)
  on conflict (entity_id, series, invoice_year) do nothing;

  select c.next_number
    into v_next
    from public.invoice_number_counters c
   where c.entity_id = v_invoice.entity_id
     and c.series = p_series
     and c.invoice_year = v_year
   for update;

  update public.invoice_number_counters
     set next_number = v_next + 1,
         updated_at = now()
   where entity_id = v_invoice.entity_id
     and series = p_series
     and invoice_year = v_year;

  v_formatted_number := format('%s-%s-%s', p_series, v_year::text, lpad(v_next::text, 6, '0'));

  update public.invoices
     set status = 'final',
         invoice_series = p_series,
         invoice_year = v_year,
         invoice_number = v_formatted_number,
         finalized_at = now()
   where id = v_invoice.id;

  return v_formatted_number;
end;
$$;

revoke all on function public.finalize_invoice(uuid, text) from public, anon, authenticated;
grant execute on function public.finalize_invoice(uuid, text) to authenticated;
