-- Preserve the original extraction proposal separately from user-confirmed fields.
create table if not exists public.receipt_extractions (
  receipt_id uuid primary key references public.receipts(id) on delete cascade,
  proposal jsonb not null,
  confirmed_data jsonb,
  decision_status text not null default 'pending'
    check (decision_status in ('pending', 'confirmed', 'rejected')),
  proposed_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (decision_status = 'pending' and confirmed_data is null and reviewed_at is null and reviewed_by is null)
    or
    (decision_status = 'confirmed' and confirmed_data is not null and reviewed_at is not null and reviewed_by is not null)
    or
    (decision_status = 'rejected' and confirmed_data is null and reviewed_at is not null and reviewed_by is not null)
  )
);

alter table public.receipt_extractions enable row level security;

create policy "Owners can read receipt extractions"
  on public.receipt_extractions for select to authenticated
  using (
    exists (
      select 1 from public.receipts r
      join public.accounting_entities e on e.id = r.entity_id
      where r.id = receipt_extractions.receipt_id
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can create receipt extraction proposals"
  on public.receipt_extractions for insert to authenticated
  with check (
    (reviewed_by is null or reviewed_by = (select auth.uid()))
    and exists (
      select 1 from public.receipts r
      join public.accounting_entities e on e.id = r.entity_id
      where r.id = receipt_extractions.receipt_id
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can review their receipt extractions"
  on public.receipt_extractions for update to authenticated
  using (
    exists (
      select 1 from public.receipts r
      join public.accounting_entities e on e.id = r.entity_id
      where r.id = receipt_extractions.receipt_id
        and e.owner_user_id = (select auth.uid())
    )
  )
  with check (
    (reviewed_by is null or reviewed_by = (select auth.uid()))
    and exists (
      select 1 from public.receipts r
      join public.accounting_entities e on e.id = r.entity_id
      where r.id = receipt_extractions.receipt_id
        and e.owner_user_id = (select auth.uid())
    )
  );

revoke all privileges on table public.receipt_extractions from anon, authenticated;
grant select, insert on table public.receipt_extractions to authenticated;
grant update (confirmed_data, decision_status, reviewed_at, reviewed_by, updated_at)
  on table public.receipt_extractions to authenticated;
