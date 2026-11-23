begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'files', 'files', false, 20971520,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid default auth.uid() references auth.users(id) on delete set null,
  bucket_id text not null default 'files' check (bucket_id = 'files'),
  storage_path text not null,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (
    mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')
  ),
  size_bytes integer not null check (size_bytes between 1 and 20971520),
  category text not null default 'Other' check (
    category in ('Passport', 'Visa', 'Medical', 'Contract', 'Academic Transcript', 'Language Certificate', 'Other')
  ),
  status text not null default 'Pending' check (status in ('Pending', 'Verified', 'Expired')),
  created_at timestamptz not null default now(),
  unique (bucket_id, storage_path),
  check (owner_id is null or storage_path = owner_id::text || '/documents/' || id::text)
);

create index files_owner_created_idx on public.files (owner_id, created_at desc, id desc);
create index files_created_idx on public.files (created_at desc, id desc);

alter table public.files enable row level security;
revoke all on public.files from public, anon, authenticated;
grant select on public.files to authenticated, service_role;
grant insert (id, storage_path, file_name, mime_type, size_bytes, category)
  on public.files to authenticated;

create policy files_owner_select on public.files
  for select to authenticated using (owner_id = (select auth.uid()));

create policy files_owner_insert on public.files
  for insert to authenticated with check (owner_id = (select auth.uid()));

create policy files_storage_select on storage.objects
  for select to authenticated using (
    bucket_id = 'files' and exists (
      select 1 from public.files f
      where f.bucket_id = storage.objects.bucket_id and f.storage_path = storage.objects.name
        and f.owner_id = (select auth.uid())
    )
  );

create policy files_storage_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'files' and exists (
      select 1 from public.files f
      where f.bucket_id = storage.objects.bucket_id and f.storage_path = storage.objects.name
        and f.owner_id = (select auth.uid())
    )
  );

-- A reservation becomes visible to the app once its object exists.
create view public.available_files with (security_invoker = true) as
select f.*
from public.files f
where exists (
  select 1 from storage.objects o where o.bucket_id = f.bucket_id and o.name = f.storage_path
);

revoke all on public.available_files from public, anon, authenticated;
grant select on public.available_files to authenticated, service_role;

commit;
