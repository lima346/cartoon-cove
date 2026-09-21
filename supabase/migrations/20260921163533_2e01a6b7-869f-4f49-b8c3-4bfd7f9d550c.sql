
drop view public.episodes_public;
create view public.episodes_public with (security_invoker = true) as
  select e.id, e.season_id, e.number, e.title, e.description, e.thumb_url,
         e.duration_seconds, e.is_premium, e.price_cents, e.is_published, e.views, e.created_at,
         (e.subtitles_url is not null) as has_subtitles
  from public.episodes e
  where e.is_published;
grant select on public.episodes_public to anon, authenticated;

revoke select on public.episodes from authenticated;
grant select (id, season_id, number, title, description, thumb_url, subtitles_url,
  duration_seconds, is_premium, price_cents, is_published, views, created_at)
  on public.episodes to anon, authenticated;
create policy "episodes public read" on public.episodes for select to anon, authenticated using (is_published);

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.has_episode_access(uuid, uuid) from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
