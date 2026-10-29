-- FICTIONAL DEVELOPMENT DATA ONLY. Kevin: select pulse-dev, apply migration 0003,
-- then run this file. Fixed UUIDs and upserts make repeated runs safe for these fixtures.
-- No buckets or Storage objects are created by this SQL.
-- Upload approved test images to the configured public PAST_EVENT_PHOTOS_BUCKET:
--   seed-past-events/autumn-challenge/presentation.jpg
--   seed-past-events/autumn-challenge/teamwork.jpg
--   seed-past-events/workshop/prototype.jpg
-- URLs will not serve images until these exact objects exist. No real event data is used.

begin;

insert into public.events (id, title, description, location, start_time, end_time)
values
    ('84c64b9d-f419-4b25-a13d-45aee4a391a2', 'Example Autumn Innovation Challenge',
     'Fictional student teams presented prototypes for campus problems.', 'Example Room A',
     '2026-09-19T15:00:00Z', '2026-09-19T21:00:00Z'),
    ('75e412d0-c61f-43d2-812d-84c19f4790c7', 'Example Prototype Workshop',
     'A fictional hands-on introduction to rapid prototyping.', null,
     '2026-08-22T18:00:00Z', '2026-08-22T20:00:00Z'),
    ('a9fb181f-a408-48fa-a59a-b2d97850c601', 'Example Archive Without Photos',
     null, null, '2026-07-10T18:00:00Z', '2026-07-10T19:00:00Z'),
    ('b6df416b-2ddc-42dc-b57d-4ec592150ecc', 'Example Future Event',
     'Excluded until its fixed end time passes; use a controlled clock for boundary tests.', null,
     '2099-01-01T18:00:00Z', '2099-01-01T19:00:00Z')
on conflict (id) do update set
    title = excluded.title, description = excluded.description, location = excluded.location,
    start_time = excluded.start_time, end_time = excluded.end_time;

insert into public.event_photos (id, event_id, storage_path, alt_text, caption, sort_order)
values
    ('f1032beb-10e8-4851-b781-fc0942c380c5', '84c64b9d-f419-4b25-a13d-45aee4a391a2',
     'seed-past-events/autumn-challenge/presentation.jpg',
     'Fictional students presenting a campus prototype', 'Example final presentations', 0),
    ('78b443c4-15de-495f-a1ef-03bdc0313ed8', '84c64b9d-f419-4b25-a13d-45aee4a391a2',
     'seed-past-events/autumn-challenge/teamwork.jpg',
     'Fictional students collaborating around laptops', null, 1),
    ('427a817d-7da1-4906-a716-5e26bc5e3c7b', '75e412d0-c61f-43d2-812d-84c19f4790c7',
     'seed-past-events/workshop/prototype.jpg',
     'An example cardboard prototype on a workshop table', null, 0)
on conflict (id) do update set
    event_id = excluded.event_id, storage_path = excluded.storage_path, alt_text = excluded.alt_text,
    caption = excluded.caption, sort_order = excluded.sort_order;

insert into public.competition_projects
    (id, event_id, project_name, competition_type, team_name, project_url, repository_url, sort_order)
values
    ('d20a5f97-803f-47af-b85d-8116d364c17a', '84c64b9d-f419-4b25-a13d-45aee4a391a2',
     'Example Campus Compass', 'Campus Innovation', 'Example Team Maple',
     'https://example.com/campus-compass', null, 0),
    ('f890b54c-ae73-40ea-baa3-17a425ac8c78', '84c64b9d-f419-4b25-a13d-45aee4a391a2',
     'Example Study Buddy', 'Campus Innovation', 'Example Team Cedar',
     null, 'https://example.com/study-buddy/source', 1)
on conflict (id) do update set
    event_id = excluded.event_id, project_name = excluded.project_name,
    competition_type = excluded.competition_type, team_name = excluded.team_name,
    project_url = excluded.project_url, repository_url = excluded.repository_url,
    sort_order = excluded.sort_order;

commit;
