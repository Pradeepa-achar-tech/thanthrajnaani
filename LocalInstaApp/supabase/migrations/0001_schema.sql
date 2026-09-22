-- LocalInsta — core schema (profiles, posts, likes, comments, follows).
-- Run this whole file in your Supabase project's SQL Editor, in order,
-- on a fresh project. See ../../README.md for the full setup walkthrough.

-- ── profiles ────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null
    check (username ~ '^[a-z0-9_]{3,20}$'),
  full_name text,
  bio text,
  avatar_url text,
  follower_count int not null default 0,
  following_count int not null default 0,
  post_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── posts ───────────────────────────────────────────────────────────────
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);

-- ── likes ───────────────────────────────────────────────────────────────
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index idx_likes_post_id on public.likes(post_id);

-- ── comments ────────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index idx_comments_post_id on public.comments(post_id);

-- ── follows ─────────────────────────────────────────────────────────────
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index idx_follows_follower on public.follows(follower_id);
create index idx_follows_following on public.follows(following_id);
