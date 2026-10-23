-- Team members shown on the "Our Team" page (pulseillinois.org/our-team)

create table if not exists public.team_members (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    position text not null,              -- title shown under the photo, e.g. 'Co-Director'
    team text not null,                  -- section heading, e.g. 'Directors', 'Logistics', 'Technical'
    academic_year text not null,         -- e.g. '2025-26', so past rosters can be kept
    image_url text,                      -- headshot
    linkedin_url text,
    email text,
    display_order integer not null default 0,  -- ordering within a section on the page
    created_at timestamptz not null default now()
);

create index if not exists team_members_year_idx on public.team_members (academic_year);

alter table public.team_members enable row level security;

-- Anyone can read the team. Writes go through the API's service client, which bypasses RLS.
create policy "Team members are publicly readable" on public.team_members for select using (true);