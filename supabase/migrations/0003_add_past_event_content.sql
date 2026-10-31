-- Past events reuse public.events. Only repeating photos and projects need new tables.
-- Apply once, atomically, after the existing events migration.
begin;

create table public.event_photos (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    storage_path text not null unique check (btrim(storage_path) <> ''),
    alt_text text not null check (btrim(alt_text) <> ''),
    caption text,
    sort_order integer not null default 0 check (sort_order >= 0),
    created_at timestamptz not null default now()
);

create table public.competition_projects (
    id uuid primary key default gen_random_uuid(),
    event_id uuid not null references public.events(id) on delete cascade,
    project_name text not null check (btrim(project_name) <> ''),
    competition_type text not null check (btrim(competition_type) <> ''),
    team_name text not null check (btrim(team_name) <> ''),
    project_url text check (project_url ~* '^https?://[^[:space:]]+$'),
    repository_url text check (repository_url ~* '^https?://[^[:space:]]+$'),
    sort_order integer not null default 0 check (sort_order >= 0),
    created_at timestamptz not null default now()
);

create index event_photos_display_idx on public.event_photos (event_id, sort_order, id);
create index competition_projects_display_idx on public.competition_projects (event_id, sort_order, id);
create index events_end_time_idx on public.events (end_time);

alter table public.event_photos enable row level security;
alter table public.competition_projects enable row level security;

-- Public reads use the anon client; no public write policies are granted.
create policy "Event photos are publicly readable" on public.event_photos
    for select to anon, authenticated using (true);
create policy "Competition projects are publicly readable" on public.competition_projects
    for select to anon, authenticated using (true);

grant select on public.event_photos, public.competition_projects to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger
    on public.event_photos, public.competition_projects from anon, authenticated;

commit;
