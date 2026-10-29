insert into public.events (id, title, description, location, start_time, end_time)
values
    -- Monday, Feb 16: three events, inserted out of order to check sorting
    ('00000000-0000-4000-8000-000000000003', 'Resume Review', 'Bring a printed copy of your resume for feedback from industry mentors.', 'Siebel Center 2405', '2026-02-16T18:00:00-06:00', '2026-02-16T19:30:00-06:00'),
    ('00000000-0000-4000-8000-000000000001', 'Opening Ceremony (Free T-shirts)', 'Kick off the week with our Opening Ceremony! Learn what''s ahead, meet the team, and make sure to grab a free T-shirt!', 'ECEB 2017', '2026-02-16T15:00:00-06:00', '2026-02-16T15:45:00-06:00'),
    ('00000000-0000-4000-8000-000000000002', 'Career Fair Prep Workshop', 'Tips on talking to recruiters and making the most of the career fair.', 'ECEB 1002', '2026-02-16T16:00:00-06:00', '2026-02-16T17:00:00-06:00'),
 
    -- Tuesday, Feb 17
    ('00000000-0000-4000-8000-000000000004', 'Tech Talk: Building Reliable APIs', 'An engineer walks through how their team designs and tests backend services.', 'ECEB 1013', '2026-02-17T17:00:00-06:00', '2026-02-17T18:00:00-06:00'),
 
    -- Wednesday, Feb 18 -> Thursday, Feb 19: crosses midnight, belongs to Feb 18 only
    ('00000000-0000-4000-8000-000000000005', 'Late Night Hack Session', 'Bring a laptop and work on side projects with other attendees. Snacks provided.', 'Siebel Center Basement', '2026-02-18T23:00:00-06:00', '2026-02-19T01:00:00-06:00'),
 
    -- Thursday, Feb 19: starts exactly at midnight, belongs to Feb 19 only
    ('00000000-0000-4000-8000-000000000006', 'Midnight Pancakes', 'Free pancakes to celebrate making it halfway through the week.', 'ECEB Atrium', '2026-02-19T00:00:00-06:00', '2026-02-19T01:00:00-06:00'),
 
    -- Friday, Feb 20: no description or location yet
    ('00000000-0000-4000-8000-000000000007', 'Sponsor Mixer', null, null, '2026-02-20T18:00:00-06:00', '2026-02-20T20:00:00-06:00'),
 
    -- Sunday, Feb 22
    ('00000000-0000-4000-8000-000000000008', 'Closing Ceremony', 'Wrap up the week, hear from sponsors, and announce raffle winners.', 'ECEB 2017', '2026-02-22T14:00:00-06:00', '2026-02-22T15:00:00-06:00')
on conflict (id) do nothing;