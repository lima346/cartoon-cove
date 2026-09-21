
-- ROLES
create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- CATALOGUE
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text,
  sort_order int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  cover_url text,
  backdrop_url text,
  category_id uuid references public.categories(id) on delete set null,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  views int not null default 0,
  season_price_cents int not null default 9900,
  created_at timestamptz not null default now()
);
grant select on public.series to anon, authenticated;
grant all on public.series to service_role;
alter table public.series enable row level security;
create policy "series public read" on public.series for select to anon, authenticated using (is_published or public.has_role(auth.uid(),'admin'));
create policy "series admin write" on public.series for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  number int not null default 1,
  title text not null default 'Temporada 1',
  price_cents int not null default 9900,
  unique (series_id, number)
);
grant select on public.seasons to anon, authenticated;
grant all on public.seasons to service_role;
alter table public.seasons enable row level security;
create policy "seasons public read" on public.seasons for select to anon, authenticated using (true);
create policy "seasons admin write" on public.seasons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  number int not null,
  title text not null,
  description text not null default '',
  thumb_url text,
  video_url text,
  subtitles_url text,
  duration_seconds int not null default 0,
  is_premium boolean not null default false,
  price_cents int not null default 2900,
  is_published boolean not null default true,
  views int not null default 0,
  created_at timestamptz not null default now(),
  unique (season_id, number)
);
grant all on public.episodes to service_role;
grant select on public.episodes to authenticated;
alter table public.episodes enable row level security;
create policy "episodes admin read" on public.episodes for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "episodes admin write" on public.episodes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- public view without the video file url
create view public.episodes_public with (security_invoker = false) as
  select e.id, e.season_id, e.number, e.title, e.description, e.thumb_url,
         e.duration_seconds, e.is_premium, e.price_cents, e.is_published, e.views, e.created_at,
         (e.subtitles_url is not null) as has_subtitles
  from public.episodes e
  where e.is_published;
grant select on public.episodes_public to anon, authenticated;

-- COMMERCE
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('episode','season','plan')),
  episode_id uuid references public.episodes(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  plan text,
  amount_cents int not null default 0,
  currency text not null default 'MZN',
  method text not null default 'mpesa',
  status text not null default 'pending' check (status in ('pending','approved','refused')),
  created_at timestamptz not null default now()
);
grant select on public.purchases to authenticated;
grant all on public.purchases to service_role;
alter table public.purchases enable row level security;
create policy "purchases own read" on public.purchases for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "purchases admin write" on public.purchases for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan text not null check (plan in ('monthly','annual')),
  status text not null default 'active',
  current_period_end timestamptz not null,
  created_at timestamptz not null default now()
);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "subs own read" on public.subscriptions for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "subs admin write" on public.subscriptions for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete cascade,
  position_seconds int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, episode_id)
);
grant select, insert, update, delete on public.watch_history to authenticated;
grant all on public.watch_history to service_role;
alter table public.watch_history enable row level security;
create policy "history own" on public.watch_history for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  series_id uuid not null references public.series(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, series_id)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "favorites own" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.platform_settings (
  id int primary key default 1 check (id = 1),
  allow_episode_purchase boolean not null default true,
  allow_season_purchase boolean not null default true,
  allow_subscription boolean not null default true,
  monthly_price_cents int not null default 19900,
  annual_price_cents int not null default 159900,
  currency text not null default 'MZN'
);
grant select on public.platform_settings to anon, authenticated;
grant all on public.platform_settings to service_role;
alter table public.platform_settings enable row level security;
create policy "settings public read" on public.platform_settings for select to anon, authenticated using (true);
create policy "settings admin write" on public.platform_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.platform_settings (id) values (1);

create or replace function public.has_episode_access(_user_id uuid, _episode_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select
    coalesce((select not e.is_premium from public.episodes e where e.id = _episode_id), false)
    or (_user_id is not null and (
      public.has_role(_user_id,'admin')
      or exists (select 1 from public.subscriptions s where s.user_id = _user_id and s.status = 'active' and s.current_period_end > now())
      or exists (select 1 from public.purchases p where p.user_id = _user_id and p.status = 'approved' and p.kind = 'episode' and p.episode_id = _episode_id)
      or exists (
        select 1 from public.purchases p
        join public.episodes e on e.id = _episode_id
        where p.user_id = _user_id and p.status = 'approved' and p.kind = 'season' and p.season_id = e.season_id)
    ));
$$;

-- DEMO DATA
insert into public.categories (slug, name, emoji, sort_order) values
  ('desenhos','Desenhos','🎬',1),
  ('memes','Memes','😂',2),
  ('memes-ia','Memes IA','🤖',3),
  ('series','Séries','🎭',4),
  ('infantil','Infantil','👨‍👩‍👧',5),
  ('tendencias','Tendências','🔥',6),
  ('novidades','Novidades','🆕',7);

insert into public.series (slug, title, description, cover_url, backdrop_url, category_id, is_featured, views, season_price_cents) values
  ('as-aventuras-do-robo','As Aventuras do Robô','Uma máquina perdida descobre que tem um coração — e que a cidade inteira quer apagar a memória dele.','/images/robo.jpg','/images/hero.jpg',(select id from public.categories where slug='desenhos'),true,18420,9900),
  ('memes-do-futuro','Memes do Futuro','Os memes que a internet ainda não inventou, gerados por inteligência artificial.','/images/memes-futuro.jpg',null,(select id from public.categories where slug='memes-ia'),false,12980,7900),
  ('as-aventuras-de-zito','As Aventuras de Zito','Zito, um miúdo curioso do bairro, transforma cada dia numa aventura inesquecível.','/images/zito.jpg',null,(select id from public.categories where slug='infantil'),false,9310,8900),
  ('memes-ia-mocambique','Memes IA Moçambique','O humor moçambicano recriado com IA, episódio após episódio.','/images/memes-mz.jpg',null,(select id from public.categories where slug='memes'),false,15670,6900);

insert into public.seasons (series_id, number, title, price_cents)
select id, 1, 'Temporada 1', season_price_cents from public.series;

insert into public.episodes (season_id, number, title, description, thumb_url, video_url, duration_seconds, is_premium, price_cents, views)
select s.id, v.number, v.title, v.descr, se.cover_url, v.video, v.dur, v.premium, 2900, v.views
from public.seasons s
join public.series se on se.id = s.series_id
join (values
  ('as-aventuras-do-robo',1,'O início','O robô acorda numa cidade que não reconhece.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',1440,false,8200),
  ('as-aventuras-do-robo',2,'O novo amigo','Uma criança encontra o robô escondido na sucata.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',1500,false,7100),
  ('as-aventuras-do-robo',3,'A missão secreta','Juntos, descobrem um plano para apagar todas as memórias.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',1560,true,4300),
  ('as-aventuras-do-robo',4,'A grande aventura','A fuga pelos túneis da cidade neon.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',1680,true,3900),
  ('as-aventuras-do-robo',5,'O confronto','O último capítulo da temporada.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',1740,true,3100),
  ('memes-do-futuro',1,'Memes que ainda não existem','A IA tenta prever o humor de 2090.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',420,false,6100),
  ('memes-do-futuro',2,'O algoritmo riu','Quando a máquina percebe a piada.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',460,false,5200),
  ('memes-do-futuro',3,'Meme infinito','Um meme que se gera a si próprio.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',510,true,2800),
  ('memes-do-futuro',4,'Fim da internet','O último meme da história.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',530,true,2400),
  ('as-aventuras-de-zito',1,'O bairro acorda','Zito começa mais um dia de descobertas.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',900,false,4800),
  ('as-aventuras-de-zito',2,'A bicicleta voadora','Uma invenção que muda tudo.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',940,false,4200),
  ('as-aventuras-de-zito',3,'O tesouro da machamba','Um mapa antigo aparece no quintal.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',980,true,2100),
  ('memes-ia-mocambique',1,'Chapa 100','O transporte mais famoso vira meme.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',360,false,7300),
  ('memes-ia-mocambique',2,'Sol de Maputo','Quando o calor aperta.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',380,false,6600),
  ('memes-ia-mocambique',3,'Domingo na Costa','Premium: o episódio mais pedido.','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',400,true,3300)
) as v(serie, number, title, descr, video, dur, premium, views) on v.serie = se.slug;
