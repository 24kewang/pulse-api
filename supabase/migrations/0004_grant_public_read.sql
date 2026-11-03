-- RLS policies only filter rows; the role also needs table-level privileges.
-- Earlier migrations created these tables without granting SELECT, so anon reads failed with
-- "permission denied for table ..." (42501).

grant select on public.events, public.sponsors, public.team_members to anon, authenticated;
