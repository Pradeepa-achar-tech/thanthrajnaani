-- LocalInsta — Row Level Security. Every table is RLS-enabled with an
-- explicit policy set; a table with no policy is fully closed by default.

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- profiles: public directory, owner-only writes
create policy "profiles are publicly readable"
on public.profiles for select to public using (true);

create policy "users update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id) with check (auth.uid() = id);

-- posts: public directory, owner-only writes
create policy "posts are publicly readable"
on public.posts for select to public using (true);

create policy "users insert their own posts"
on public.posts for insert to authenticated
with check (auth.uid() = user_id);

create policy "users update their own posts"
on public.posts for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users delete their own posts"
on public.posts for delete to authenticated
using (auth.uid() = user_id);

-- likes: authenticated-readable, insert/delete only as yourself
create policy "likes readable by authenticated users"
on public.likes for select to authenticated using (true);

create policy "users like posts as themselves"
on public.likes for insert to authenticated
with check (auth.uid() = user_id);

create policy "users remove their own likes"
on public.likes for delete to authenticated
using (auth.uid() = user_id);

-- comments: authenticated-readable, insert/delete only as yourself
create policy "comments readable by authenticated users"
on public.comments for select to authenticated using (true);

create policy "users comment as themselves"
on public.comments for insert to authenticated
with check (auth.uid() = user_id);

create policy "users delete their own comments"
on public.comments for delete to authenticated
using (auth.uid() = user_id);

-- follows: authenticated-readable, insert/delete only as yourself
create policy "follows readable by authenticated users"
on public.follows for select to authenticated using (true);

create policy "users follow as themselves"
on public.follows for insert to authenticated
with check (auth.uid() = follower_id);

create policy "users unfollow as themselves"
on public.follows for delete to authenticated
using (auth.uid() = follower_id);
