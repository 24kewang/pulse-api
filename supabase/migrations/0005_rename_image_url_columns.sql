-- These columns hold paths inside public Storage buckets (like event_photos.storage_path), not URLs.
--   team_members.image_path -> object in the `team-photos` bucket, e.g. '2025-26/prahit.jpeg'
--   sponsors.logo_path      -> object in the `sponsor-logos` bucket, e.g. '2026/amd.png'
-- The API builds the public URL with supabase.storage.from(bucket).getPublicUrl(path).

begin;

alter table public.team_members rename column image_url to image_path;
alter table public.sponsors rename column logo_url to logo_path;

commit;
