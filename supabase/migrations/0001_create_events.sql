-- This is a template. Change to actual schema to be implemented

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    location text,
    start_time timestamptz not null,
    end_time timestamptz,
    created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- Anyone can read events. Writes go through the API's service client, which bypasses RLS.
create policy "Events are publicly readable" on public.events for select using (true);
