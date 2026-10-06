-- AI60 schema. Idempotent: safe to run on every deploy.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  created_at timestamptz not null default now()
);

create table if not exists workshops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  capacity int not null default 1000,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into workshops (title, starts_at)
select 'Build Your First AI Project in 60 Minutes', now() + interval '8 days'
where not exists (select 1 from workshops);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  college_id uuid references colleges(id),
  branch text not null,
  grad_year int not null check (grad_year between 2024 and 2030),
  phone text check (phone is null or phone ~ '^[0-9+\- ]{8,15}$'),
  readiness_score int check (readiness_score between 0 and 100),
  readiness_tier text,
  referral_code text not null unique,
  dashboard_token text not null unique,
  is_ambassador boolean not null default false,
  is_demo boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
create unique index if not exists students_email_key on students (lower(email));
create index if not exists students_college_idx on students (college_id);
create index if not exists students_ip_idx on students (ip_hash, created_at);

create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  workshop_id uuid not null references workshops(id),
  source text not null default 'direct',
  created_at timestamptz not null default now(),
  unique (student_id, workshop_id)
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references students(id) on delete cascade,
  referred_id uuid not null unique references students(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (referrer_id <> referred_id)
);
create index if not exists referrals_referrer_idx on referrals (referrer_id);

create table if not exists ambassadors (
  student_id uuid primary key references students(id) on delete cascade,
  motivation text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references students(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 100),
  problem text not null check (char_length(problem) between 10 and 600),
  github_url text not null check (github_url ~ '^https://github\.com/[A-Za-z0-9-]+/[A-Za-z0-9._-]+/?$'),
  tech_stack text not null,
  description text not null check (char_length(description) between 20 and 2000),
  demo_url text check (demo_url is null or demo_url ~ '^https://'),
  created_at timestamptz not null default now()
);
create index if not exists projects_desc_trgm on projects using gin (description gin_trgm_ops);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  problem_clarity int not null check (problem_clarity between 0 and 20),
  ai_integration int not null check (ai_integration between 0 and 20),
  technical_depth int not null check (technical_depth between 0 and 20),
  originality int not null check (originality between 0 and 20),
  documentation int not null check (documentation between 0 and 20),
  overall int generated always as (problem_clarity + ai_integration + technical_depth + originality + documentation) stored,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  improvements text[] not null default '{}',
  feedback text,
  next_step text,
  model text not null default 'rule-based',
  created_at timestamptz not null default now()
);

create table if not exists campaign_events (
  id bigserial primary key,
  event_name text not null check (event_name in (
    'landing_page_view','challenge_started','challenge_completed',
    'registration_started','registration_completed',
    'referral_link_copied','referral_shared','referral_registration',
    'ambassador_joined','project_submitted','evaluation_completed','achievement_shared')),
  visitor_id text not null,
  student_id uuid references students(id) on delete set null,
  properties jsonb not null default '{}',
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists events_name_time_idx on campaign_events (event_name, created_at);
create index if not exists events_visitor_idx on campaign_events (visitor_id);

-- ---------- Views (counts always computed server-side from referrals) ----------
create or replace view leaderboard_students as
select
  s.id,
  case when position(' ' in btrim(s.name)) > 0
    then split_part(btrim(s.name), ' ', 1) || ' ' || upper(left(regexp_replace(btrim(s.name), '^.*\s', ''), 1)) || '.'
    else btrim(s.name) end as display_name,
  c.name as college,
  coalesce(r.cnt, 0)::int as referrals,
  case when coalesce(r.cnt, 0) >= 10 then 'Priority Q&A'
       when coalesce(r.cnt, 0) >= 5 then 'AI Project Evaluation'
       when coalesce(r.cnt, 0) >= 3 then 'AI Project Prompt Pack'
       else '-' end as reward,
  row_number() over (order by coalesce(r.cnt, 0) desc, s.created_at asc)::int as rank,
  s.is_demo
from students s
left join colleges c on c.id = s.college_id
left join (select referrer_id, count(*) as cnt from referrals group by referrer_id) r on r.referrer_id = s.id;

create or replace view college_stats as
select c.id as college_id, c.name, s.is_demo,
       count(distinct s.id)::int as registrations,
       count(distinct p.id)::int as projects
from colleges c
join students s on s.college_id = c.id
left join projects p on p.student_id = s.id
group by c.id, c.name, s.is_demo;

create or replace view funnel_counts as
select event_name, is_demo,
       count(distinct visitor_id)::int as visitors,
       count(*)::int as events
from campaign_events
group by event_name, is_demo;

-- ---------- Registration: one transaction, all abuse checks, referral attribution ----------
create or replace function register_student(
  p_name text, p_email text, p_college text, p_branch text, p_grad_year int,
  p_phone text, p_score int, p_tier text, p_ref_code text, p_ip_hash text,
  p_source text default 'direct', p_max_per_ip int default 10
) returns table (out_student_id uuid, out_referral_code text, out_dashboard_token text, out_referral_applied boolean)
language plpgsql as $$
declare
  v_college_id uuid; v_slug text; v_code text; v_token text; v_student uuid; v_workshop uuid;
  v_referrer uuid; v_applied boolean := false; v_base text; v_try int := 0; v_suffix text; i int;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if p_name is null or p_email is null or p_college is null or btrim(p_college) = '' then
    raise exception 'INVALID_INPUT';
  end if;
  if exists (select 1 from students where lower(email) = lower(p_email)) then
    raise exception 'EMAIL_EXISTS';
  end if;
  if p_ip_hash is not null and (
       select count(*) from students where ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
     ) >= p_max_per_ip then
    raise exception 'RATE_LIMITED';
  end if;
  select id into v_workshop from workshops where is_active order by starts_at limit 1;
  if v_workshop is null then raise exception 'NO_WORKSHOP'; end if;

  -- college: exact slug match, else fuzzy match (pg_trgm), else create
  v_slug := btrim(regexp_replace(lower(btrim(p_college)), '[^a-z0-9]+', '-', 'g'), '-');
  if v_slug = '' then raise exception 'INVALID_INPUT'; end if;
  select id into v_college_id from colleges where slug = v_slug;
  if v_college_id is null then
    select id into v_college_id from colleges
      where similarity(lower(name), lower(btrim(p_college))) > 0.7
      order by similarity(lower(name), lower(btrim(p_college))) desc limit 1;
  end if;
  if v_college_id is null then
    insert into colleges (name, slug) values (left(btrim(p_college), 120), v_slug)
    on conflict (slug) do update set slug = excluded.slug returning id into v_college_id;
  end if;

  -- referral code: AI60-NAME-XXXX
  v_base := upper(left(regexp_replace(split_part(btrim(p_name), ' ', 1), '[^A-Za-z]', '', 'g'), 8));
  if v_base = '' then v_base := 'STUDENT'; end if;
  loop
    v_suffix := '';
    for i in 1..4 loop
      v_suffix := v_suffix || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    v_code := 'AI60-' || v_base || '-' || v_suffix;
    exit when not exists (select 1 from students where referral_code = v_code);
    v_try := v_try + 1;
    if v_try > 20 then raise exception 'CODE_GEN_FAILED'; end if;
  end loop;
  v_token := encode(gen_random_bytes(24), 'hex');

  begin
    insert into students (name, email, college_id, branch, grad_year, phone,
                          readiness_score, readiness_tier, referral_code, dashboard_token, ip_hash)
    values (btrim(p_name), btrim(p_email), v_college_id, btrim(p_branch), p_grad_year, nullif(btrim(p_phone), ''),
            p_score, p_tier, v_code, v_token, p_ip_hash)
    returning id into v_student;
  exception when unique_violation then
    raise exception 'EMAIL_EXISTS';
  end;

  -- attribute referral only now that registration succeeded
  if p_ref_code is not null and btrim(p_ref_code) <> '' then
    select id into v_referrer from students where referral_code = upper(btrim(p_ref_code));
    if v_referrer is not null and v_referrer <> v_student then
      insert into referrals (referrer_id, referred_id) values (v_referrer, v_student)
      on conflict (referred_id) do nothing;
      v_applied := true;
      insert into campaign_events (event_name, visitor_id, student_id, properties)
      values ('referral_registration', 'server', v_student, jsonb_build_object('referrer_id', v_referrer));
    end if;
  end if;

  insert into registrations (student_id, workshop_id, source)
  values (v_student, v_workshop, case when v_applied then 'referral' else coalesce(p_source, 'direct') end);

  insert into campaign_events (event_name, visitor_id, student_id)
  values ('registration_completed', 'server', v_student);

  return query select v_student, v_code, v_token, v_applied;
end $$;

-- Most similar existing real project (feeds the evaluator's Originality score)
create or replace function project_similarity(p_text text, p_exclude_student uuid default null)
returns table (similar_project_id uuid, similarity_score real)
language sql stable as $$
  select p.id, similarity(p.description, p_text)
  from projects p join students s on s.id = p.student_id
  where s.is_demo = false and (p_exclude_student is null or p.student_id <> p_exclude_student)
  order by similarity(p.description, p_text) desc
  limit 1;
$$;

-- ---------- Lock down: browser/anon roles must never touch data directly ----------
do $$
declare t text;
begin
  foreach t in array array['colleges','workshops','students','registrations','referrals',
                           'ambassadors','projects','evaluations','campaign_events'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all tables in schema public from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from authenticated';
  end if;
end $$;
