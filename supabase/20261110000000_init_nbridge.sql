-- =============================================================================
-- NBridge: initial schema (single-tenant)
-- Supabase SQL Editor-e paste kore Run korun, ba supabase/migrations/ e rakhun.
-- Modules: Core/Auth, Lead, Candidate, Finance, Files, Others
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
create type public.user_role          as enum ('owner', 'admin', 'manager', 'staff');
create type public.lead_source        as enum ('website', 'facebook', 'referral', 'manual', 'other');
create type public.lead_status        as enum ('new', 'contacted', 'qualified', 'converted', 'lost');
create type public.candidate_status   as enum ('in_review', 'documents_pending', 'offer_received', 'completed');
create type public.application_status as enum ('applied', 'offer_received', 'offer_accepted', 'visa_applied', 'visa_granted', 'rejected', 'withdrawn');
create type public.transaction_type   as enum ('income', 'expense');
create type public.transaction_status as enum ('paid', 'pending');
create type public.document_category  as enum ('passport', 'visa', 'medical', 'contract', 'other');
create type public.document_status    as enum ('verified', 'pending', 'expired');
create type public.task_status        as enum ('pending', 'in_progress', 'completed');
create type public.task_priority      as enum ('low', 'medium', 'high');

-- -----------------------------------------------------------------------------
-- 2. GENERIC HELPERS
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Atomic counters (LD-1001, NB-2026-001, TRX-1001 er jonno)
create table public.counters (
  key   text primary key,
  value bigint not null default 0
);
alter table public.counters enable row level security;   -- kono policy nei: shudhu security definer function use korbe

create or replace function public.next_counter(counter_key text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
begin
  insert into public.counters (key, value)
  values (counter_key, 1)
  on conflict (key) do update set value = public.counters.value + 1
  returning value into next_value;
  return next_value;
end;
$$;
revoke all on function public.next_counter(text) from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. CORE / AUTH
-- -----------------------------------------------------------------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  email      text,
  phone      text,
  avatar_url text,
  role       public.user_role not null default 'staff',
  is_active  boolean not null default false,   -- admin approve na korle login-e data dekhbe na
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Single-tenant company settings: shudhu 1-ta row thakte pare
create table public.company_settings (
  id          boolean primary key default true check (id),
  name        text not null default 'NBridge',
  logo_url    text,
  currency    text not null default 'BDT',
  timezone    text not null default 'Asia/Dhaka',
  preferences jsonb not null default '{}'::jsonb,   -- notifications, localization, appearance
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
insert into public.company_settings default values;

-- Role helpers (RLS policy te use hoy)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active)
$$;

create or replace function public.has_role(variadic allowed text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role::text = any (allowed)
  )
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_member()         to authenticated;
grant execute on function public.has_role(text[])    to authenticated;

-- Notun user signup hole profile auto toiri.
-- Prothom user = owner (active). Baki sobai inactive staff, admin approve korbe.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first boolean;
begin
  select not exists (select 1 from public.profiles) into is_first;

  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    case when is_first then 'owner'::public.user_role else 'staff'::public.user_role end,
    is_first
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role / is_active shudhu admin+ bodlate parbe; owner role shudhu owner bodlate parbe
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
       and not public.has_role('owner', 'admin') then
      raise exception 'Only owner/admin can change role or active status';
    end if;

    if new.role is distinct from old.role
       and (new.role = 'owner' or old.role = 'owner')
       and not public.has_role('owner') then
      raise exception 'Only the owner can grant or remove the owner role';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- -----------------------------------------------------------------------------
-- 4. LEAD MODULE
-- -----------------------------------------------------------------------------
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  lead_no          text unique,
  name             text not null check (char_length(name) between 1 and 200),
  email            text check (email is null or char_length(email) <= 254),
  phone            text check (phone is null or char_length(phone) <= 40),
  whatsapp         text check (whatsapp is null or char_length(whatsapp) <= 40),
  country_interest text,
  program          text,
  source           public.lead_source not null default 'manual',
  status           public.lead_status not null default 'new',
  assigned_to      uuid references public.profiles (id) on delete set null,
  intake           jsonb not null default '{}'::jsonb
                   check (octet_length(intake::text) <= 20000),   -- PublicLeadPage-er puro form ekhane
  created_by       uuid default auth.uid() references public.profiles (id) on delete set null,
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index leads_status_idx      on public.leads (status)      where deleted_at is null;
create index leads_assigned_to_idx on public.leads (assigned_to);
create index leads_created_at_idx  on public.leads (created_at desc);
create index leads_phone_idx       on public.leads (phone);
create index leads_email_idx       on public.leads (lower(email));

-- -----------------------------------------------------------------------------
-- 5. CANDIDATE MODULE
-- -----------------------------------------------------------------------------
create table public.candidates (
  id           uuid primary key default gen_random_uuid(),
  candidate_no text unique,
  lead_id      uuid unique references public.leads (id) on delete set null,
  name         text not null check (char_length(name) between 1 and 200),
  email        text,
  phone        text,
  whatsapp     text,
  dob          date,
  gender       text check (gender is null or gender in ('Male', 'Female', 'Other', 'Prefer not to say')),
  nationality  text default 'Bangladeshi',
  address      text,
  status       public.candidate_status not null default 'in_review',
  assigned_to  uuid references public.profiles (id) on delete set null,
  created_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index candidates_status_idx on public.candidates (status) where deleted_at is null;
create index candidates_created_idx on public.candidates (created_at desc);

create table public.candidate_education (
  id            uuid primary key default gen_random_uuid(),
  candidate_id  uuid not null references public.candidates (id) on delete cascade,
  qualification text not null,
  institution   text,
  major         text,
  passing_year  int check (passing_year is null or passing_year between 1950 and 2100),
  result        text,
  grading_scale text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index candidate_education_candidate_idx on public.candidate_education (candidate_id);

create table public.candidate_language_tests (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  test         text not null,          -- IELTS, PTE, TOEFL, JLPT ...
  score        text,
  test_date    date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index candidate_language_tests_candidate_idx on public.candidate_language_tests (candidate_id);

create table public.applications (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  country      text not null,
  university   text,
  program      text,
  intake       text,                   -- jemon "September 2027"
  status       public.application_status not null default 'applied',
  offer_date   date,
  notes        text,
  created_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index applications_candidate_idx on public.applications (candidate_id);
create index applications_status_idx    on public.applications (status);

-- -----------------------------------------------------------------------------
-- 6. FINANCE MODULE
-- -----------------------------------------------------------------------------
create table public.transaction_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       public.transaction_type not null,
  created_at timestamptz not null default now(),
  unique (name, type)
);

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  trx_no       text unique,
  title        text not null check (char_length(title) between 1 and 200),
  category_id  uuid references public.transaction_categories (id) on delete set null,
  candidate_id uuid references public.candidates (id) on delete set null,
  type         public.transaction_type not null,
  status       public.transaction_status not null default 'pending',
  amount       numeric(12, 2) not null check (amount > 0),
  method       text,                   -- Cash, Bank Transfer, bKash ...
  trx_date     date not null default current_date,
  created_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index transactions_date_idx      on public.transactions (trx_date desc);
create index transactions_candidate_idx on public.transactions (candidate_id);
create index transactions_type_idx      on public.transactions (type, status);

insert into public.transaction_categories (name, type) values
  ('Service Fee',           'income'),
  ('Consultation Fee',      'income'),
  ('Visa Processing',       'income'),
  ('Document Verification', 'income'),
  ('Office Rent',           'expense'),
  ('Staff Salary',          'expense'),
  ('Utilities',             'expense'),
  ('Marketing',             'expense'),
  ('Other',                 'expense');

-- -----------------------------------------------------------------------------
-- 7. FILES MODULE (metadata; asol file Storage bucket-e)
-- -----------------------------------------------------------------------------
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates (id) on delete cascade,
  category     public.document_category not null default 'other',
  file_name    text not null,
  storage_path text not null unique,   -- jemon: <candidate_id>/<uuid>-passport.pdf
  mime_type    text,
  size_bytes   bigint check (size_bytes is null or size_bytes >= 0),
  status       public.document_status not null default 'pending',
  expires_at   date,
  uploaded_by  uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index documents_candidate_idx on public.documents (candidate_id);
create index documents_status_idx    on public.documents (status);
create index documents_expires_idx   on public.documents (expires_at) where expires_at is not null;

-- -----------------------------------------------------------------------------
-- 8. OTHERS MODULE
-- -----------------------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 200),
  description  text,
  due_date     date,
  priority     public.task_priority not null default 'medium',
  status       public.task_status not null default 'pending',
  assigned_to  uuid references public.profiles (id) on delete set null,
  candidate_id uuid references public.candidates (id) on delete set null,
  created_by   uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index tasks_assigned_idx on public.tasks (assigned_to, status);
create index tasks_due_idx      on public.tasks (due_date);

create table public.notes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  content      text not null default '',
  candidate_id uuid references public.candidates (id) on delete set null,
  author_id    uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index notes_candidate_idx on public.notes (candidate_id);

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null default '',
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,           -- jemon "lead.created"
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index activity_logs_created_idx on public.activity_logs (created_at desc);
create index activity_logs_entity_idx  on public.activity_logs (entity_type, entity_id);

-- -----------------------------------------------------------------------------
-- 9. TRIGGERS: updated_at, auto numbers, activity log
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'company_settings', 'leads', 'candidates', 'candidate_education',
    'candidate_language_tests', 'applications', 'transactions', 'documents',
    'tasks', 'notes', 'announcements'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;

create or replace function public.assign_lead_no()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.lead_no is null then
    new.lead_no := 'LD-' || (1000 + public.next_counter('lead'));
  end if;
  return new;
end;
$$;
create trigger leads_assign_no before insert on public.leads
  for each row execute function public.assign_lead_no();

create or replace function public.assign_candidate_no()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  yr text := to_char(now(), 'YYYY');
begin
  if new.candidate_no is null then
    new.candidate_no := 'NB-' || yr || '-' ||
      lpad(public.next_counter('candidate-' || yr)::text, 3, '0');
  end if;
  return new;
end;
$$;
create trigger candidates_assign_no before insert on public.candidates
  for each row execute function public.assign_candidate_no();

create or replace function public.assign_trx_no()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.trx_no is null then
    new.trx_no := 'TRX-' || (1000 + public.next_counter('transaction'));
  end if;
  return new;
end;
$$;
create trigger transactions_assign_no before insert on public.transactions
  for each row execute function public.assign_trx_no();

-- Dashboard "recent activity" er jonno auto log
create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  j jsonb := to_jsonb(new);
begin
  insert into public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    tg_table_name || '.created',
    tg_table_name,
    new.id,
    jsonb_build_object('label', coalesce(j ->> 'name', j ->> 'title', j ->> 'file_name'))
  );
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['leads', 'candidates', 'documents', 'transactions', 'tasks'] loop
    execute format(
      'create trigger %I after insert on public.%I for each row execute function public.log_activity()',
      t || '_log_activity', t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 10. LEAD -> CANDIDATE CONVERSION (RPC)
-- Frontend: supabase.rpc('convert_lead_to_candidate', { p_lead_id })
-- -----------------------------------------------------------------------------
create or replace function public.convert_lead_to_candidate(p_lead_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  l public.leads%rowtype;
  new_candidate_id uuid;
begin
  if not public.is_member() then
    raise exception 'Not allowed';
  end if;

  select * into l from public.leads where id = p_lead_id and deleted_at is null for update;
  if not found then
    raise exception 'Lead not found';
  end if;

  select id into new_candidate_id from public.candidates where lead_id = p_lead_id;
  if new_candidate_id is not null then
    return new_candidate_id;       -- already converted
  end if;

  insert into public.candidates (lead_id, name, email, phone, whatsapp, dob, gender, nationality, address, assigned_to)
  values (
    l.id, l.name, l.email, l.phone, l.whatsapp,
    nullif(l.intake ->> 'dateOfBirth', '')::date,
    nullif(l.intake ->> 'gender', ''),
    coalesce(nullif(l.intake ->> 'nationality', ''), 'Bangladeshi'),
    nullif(l.intake ->> 'address', ''),
    l.assigned_to
  )
  returning id into new_candidate_id;

  update public.leads set status = 'converted' where id = p_lead_id;

  return new_candidate_id;
end;
$$;
grant execute on function public.convert_lead_to_candidate(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY
-- Rule:
--   * active member  -> lead, candidate, files, tasks, notes dekhte/edit korte pare
--   * manager+       -> finance
--   * admin+         -> delete, company settings, team management
--   * anon           -> shudhu public form theke leads INSERT
-- -----------------------------------------------------------------------------
alter table public.profiles                 enable row level security;
alter table public.company_settings         enable row level security;
alter table public.leads                    enable row level security;
alter table public.candidates               enable row level security;
alter table public.candidate_education      enable row level security;
alter table public.candidate_language_tests enable row level security;
alter table public.applications             enable row level security;
alter table public.transaction_categories   enable row level security;
alter table public.transactions             enable row level security;
alter table public.documents                enable row level security;
alter table public.tasks                    enable row level security;
alter table public.notes                    enable row level security;
alter table public.announcements            enable row level security;
alter table public.activity_logs            enable row level security;

-- profiles
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_member());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.has_role('owner', 'admin'))
  with check (public.has_role('owner', 'admin'));

create policy profiles_delete_owner on public.profiles
  for delete to authenticated
  using (public.has_role('owner') and id <> auth.uid());

-- company_settings
create policy company_settings_select on public.company_settings
  for select to authenticated using (public.is_member());

create policy company_settings_update on public.company_settings
  for update to authenticated
  using (public.has_role('owner', 'admin'))
  with check (public.has_role('owner', 'admin'));

-- leads
create policy leads_select on public.leads
  for select to authenticated using (public.is_member());

create policy leads_insert_member on public.leads
  for insert to authenticated with check (public.is_member());

create policy leads_update on public.leads
  for update to authenticated
  using (public.is_member()) with check (public.is_member());

create policy leads_delete on public.leads
  for delete to authenticated using (public.has_role('owner', 'admin'));

-- Public "Get started" form (login chhara). Shudhu INSERT, kono SELECT na.
create policy leads_insert_public on public.leads
  for insert to anon
  with check (
    source = 'website'
    and status = 'new'
    and assigned_to is null
    and created_by is null
    and deleted_at is null
  );

revoke all on public.leads from anon;
grant insert on public.leads to anon;
-- NOTE: anon insert-e `.select()` chaibe na (SELECT policy nei). Shudhu `.insert(...)` use korun.

-- Member-wide tables: select/insert/update = active member, delete = admin+
do $$
declare
  t text;
begin
  foreach t in array array[
    'candidates', 'candidate_education', 'candidate_language_tests',
    'applications', 'documents', 'announcements'
  ] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.is_member())', t || '_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_member())', t || '_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_member()) with check (public.is_member())', t || '_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.has_role(''owner'', ''admin''))', t || '_delete', t);
  end loop;
end;
$$;

-- tasks & notes: member select/insert/update; delete = admin+ ba jar toiri
create policy tasks_select on public.tasks for select to authenticated using (public.is_member());
create policy tasks_insert on public.tasks for insert to authenticated with check (public.is_member());
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_member()) with check (public.is_member());
create policy tasks_delete on public.tasks for delete to authenticated
  using (public.has_role('owner', 'admin') or created_by = auth.uid());

create policy notes_select on public.notes for select to authenticated using (public.is_member());
create policy notes_insert on public.notes for insert to authenticated with check (public.is_member());
create policy notes_update on public.notes for update to authenticated
  using (public.is_member() and (author_id = auth.uid() or public.has_role('owner', 'admin')))
  with check (public.is_member());
create policy notes_delete on public.notes for delete to authenticated
  using (public.has_role('owner', 'admin') or author_id = auth.uid());

-- finance: manager+ only
create policy transaction_categories_select on public.transaction_categories
  for select to authenticated using (public.has_role('owner', 'admin', 'manager'));
create policy transaction_categories_write on public.transaction_categories
  for all to authenticated
  using (public.has_role('owner', 'admin'))
  with check (public.has_role('owner', 'admin'));

create policy transactions_select on public.transactions
  for select to authenticated using (public.has_role('owner', 'admin', 'manager'));
create policy transactions_insert on public.transactions
  for insert to authenticated with check (public.has_role('owner', 'admin', 'manager'));
create policy transactions_update on public.transactions
  for update to authenticated
  using (public.has_role('owner', 'admin', 'manager'))
  with check (public.has_role('owner', 'admin', 'manager'));
create policy transactions_delete on public.transactions
  for delete to authenticated using (public.has_role('owner', 'admin'));

-- activity_logs: read-only history (insert shudhu trigger/ownself, update/delete nei)
create policy activity_logs_select on public.activity_logs
  for select to authenticated using (public.is_member());
create policy activity_logs_insert on public.activity_logs
  for insert to authenticated
  with check (public.is_member() and actor_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 12. STORAGE: private bucket for candidate documents
-- Upload path convention: <candidate_id>/<uuid>-<filename>
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-documents',
  'candidate-documents',
  false,
  10485760,   -- 10 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "candidate docs: members read" on storage.objects
  for select to authenticated
  using (bucket_id = 'candidate-documents' and public.is_member());

create policy "candidate docs: members upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'candidate-documents' and public.is_member());

create policy "candidate docs: members update" on storage.objects
  for update to authenticated
  using (bucket_id = 'candidate-documents' and public.is_member())
  with check (bucket_id = 'candidate-documents' and public.is_member());

create policy "candidate docs: admins delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'candidate-documents' and public.has_role('owner', 'admin'));

-- =============================================================================
-- DONE.
-- Next steps:
--  1. Authentication > Users > "Add user / Invite" diye prothome nijer account banan
--     (prothom user auto 'owner' + active hobe).
--  2. Tarpor Authentication > Providers > Email: "Allow new users to sign up" OFF korun.
--  3. Baki team member-der Dashboard theke invite korun; tader profiles.is_active
--     = true korte hobe (Team & Roles page theke ba SQL diye).
-- =============================================================================
