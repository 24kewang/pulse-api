
insert into public.sponsors
    (id, name, logo_url, website_url, description, year)
values
    (
        '11111111-1111-4111-8111-111111111111',
        'Example Technologies',
        null,
        'https://example.com',
        'Example technology sponsor',
        2026
    ),
    (
        '22222222-2222-4222-8222-222222222222',
        'Demo Labs',
        null,
        'https://example.org',
        'Example research sponsor',
        2025
    ),
    (
        '33333333-3333-4333-8333-333333333333',
        'Sample Innovations',
        null,
        'https://example.net',
        'Example innovation sponsor',
        2026
    )
on conflict (id) do update set
    name = excluded.name,
    logo_url = excluded.logo_url,
    website_url = excluded.website_url,
    description = excluded.description,
    year = excluded.year;
