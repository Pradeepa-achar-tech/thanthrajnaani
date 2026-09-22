-- LocalInsta — auto-profile creation, denormalized counters, and the
-- toggle_like RPC. See the LocalInsta course (Module 2/3/6) for the full
-- explanation of every piece here.

-- ── auto-create a profile row on signup ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── keep profiles.updated_at honest ────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── like / comment counters on posts ───────────────────────────────────
create or replace function public.increment_post_like_count()
returns trigger language plpgsql as $$
begin
  update public.posts set like_count = like_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.decrement_post_like_count()
returns trigger language plpgsql as $$
begin
  update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger on_like_insert
  after insert on public.likes
  for each row execute function public.increment_post_like_count();

create trigger on_like_delete
  after delete on public.likes
  for each row execute function public.decrement_post_like_count();

create or replace function public.increment_post_comment_count()
returns trigger language plpgsql as $$
begin
  update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function public.decrement_post_comment_count()
returns trigger language plpgsql as $$
begin
  update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  return old;
end;
$$;

create trigger on_comment_insert
  after insert on public.comments
  for each row execute function public.increment_post_comment_count();

create trigger on_comment_delete
  after delete on public.comments
  for each row execute function public.decrement_post_comment_count();

-- ── follow counters on both sides of the relationship ──────────────────
create or replace function public.increment_follow_counts()
returns trigger language plpgsql as $$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set follower_count = follower_count + 1 where id = new.following_id;
  return new;
end;
$$;

create or replace function public.decrement_follow_counts()
returns trigger language plpgsql as $$
begin
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set follower_count = greatest(follower_count - 1, 0) where id = old.following_id;
  return old;
end;
$$;

create trigger on_follow_insert
  after insert on public.follows
  for each row execute function public.increment_follow_counts();

create trigger on_follow_delete
  after delete on public.follows
  for each row execute function public.decrement_follow_counts();

create or replace function public.increment_post_count()
returns trigger language plpgsql as $$
begin
  update public.profiles set post_count = post_count + 1 where id = new.user_id;
  return new;
end;
$$;

create or replace function public.decrement_post_count()
returns trigger language plpgsql as $$
begin
  update public.profiles set post_count = greatest(post_count - 1, 0) where id = old.user_id;
  return old;
end;
$$;

create trigger on_post_insert
  after insert on public.posts
  for each row execute function public.increment_post_count();

create trigger on_post_delete
  after delete on public.posts
  for each row execute function public.decrement_post_count();

-- ── atomic like/unlike toggle ───────────────────────────────────────────
create or replace function public.toggle_like(post_id_input uuid)
returns boolean
language plpgsql
security invoker
as $$
declare
  already_liked boolean;
begin
  select exists(
    select 1 from public.likes
    where post_id = post_id_input and user_id = auth.uid()
  ) into already_liked;

  if already_liked then
    delete from public.likes
    where post_id = post_id_input and user_id = auth.uid();
    return false;
  else
    insert into public.likes (post_id, user_id) values (post_id_input, auth.uid());
    return true;
  end if;
end;
$$;
