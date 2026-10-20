-- Receipt metadata and private storage policies for the first single-user MVP.
-- Apply only to a dedicated prototype project after reviewing Issue #7.
-- No financial amount/VAT/ledger tables are introduced here.

create table if not exists public.accounting_entities (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'Mijn administratie' check (char_length(name) between 1 and 160),
  created_at timestamptz not null default now()
);

alter table public.accounting_entities enable row level security;

create policy "Owners can view their accounting entity"
  on public.accounting_entities for select to authenticated
  using (owner_user_id = (select auth.uid()));

create policy "Owners can create their accounting entity"
  on public.accounting_entities for insert to authenticated
  with check (owner_user_id = (select auth.uid()));

create policy "Owners can update their accounting entity"
  on public.accounting_entities for update to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

grant select, insert, update on public.accounting_entities to authenticated;

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references public.accounting_entities(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  original_filename text not null check (char_length(original_filename) between 1 and 200),
  storage_path text not null unique,
  content_type text not null check (
    content_type in (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif'
    )
  ),
  byte_size bigint not null check (byte_size between 1 and 15728640),
  sha256 char(64) not null check (sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'uploaded' check (status in ('uploaded', 'needs_review', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists receipts_entity_created_at_idx
  on public.receipts (entity_id, created_at desc);

alter table public.receipts enable row level security;

create policy "Owners can read receipts in their entity"
  on public.receipts for select to authenticated
  using (
    exists (
      select 1 from public.accounting_entities e
      where e.id = receipts.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can create receipts in their entity"
  on public.receipts for insert to authenticated
  with check (
    uploaded_by = (select auth.uid())
    and exists (
      select 1 from public.accounting_entities e
      where e.id = receipts.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Owners can update receipts in their entity"
  on public.receipts for update to authenticated
  using (
    exists (
      select 1 from public.accounting_entities e
      where e.id = receipts.entity_id and e.owner_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.accounting_entities e
      where e.id = receipts.entity_id and e.owner_user_id = (select auth.uid())
    )
  );

grant select, insert, update on public.receipts to authenticated;

-- Private by default; no public URLs for receipt contents.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false, 15728640,
  array[
    'application/pdf','image/jpeg','image/png','image/webp',
    'image/avif','image/heic','image/heif'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Receipt owners can upload into private storage"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.accounting_entities e
      where e.id::text = (storage.foldername(name))[2]
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Receipt owners can read private storage"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.accounting_entities e
      where e.id::text = (storage.foldername(name))[2]
        and e.owner_user_id = (select auth.uid())
    )
  );

create policy "Receipt owners can delete private storage"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.accounting_entities e
      where e.id::text = (storage.foldername(name))[2]
        and e.owner_user_id = (select auth.uid())
    )
  );
