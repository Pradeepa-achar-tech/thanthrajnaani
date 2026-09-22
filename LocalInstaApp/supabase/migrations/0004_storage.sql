-- LocalInsta — Storage buckets for avatars and post images, with
-- folder-owned RLS: every file lives at <user_id>/<uuid>.jpg, and the
-- policy checks that folder prefix against auth.uid().

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('posts', 'posts', true)
on conflict (id) do nothing;

create policy "public read on avatars and posts"
on storage.objects for select to public
using (bucket_id in ('avatars', 'posts'));

create policy "users upload to their own avatar folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users upload to their own posts folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'posts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users manage their own avatar files"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own avatar files"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own post files"
on storage.objects for delete to authenticated
using (bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text);
