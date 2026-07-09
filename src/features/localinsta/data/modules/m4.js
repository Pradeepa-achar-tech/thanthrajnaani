// Module 4 — Storage & the Media Upload Pipeline
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m4 = {
  id: 'm4',
  title: 'Storage & the Media Pipeline',
  hours: 7,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Create Supabase Storage buckets with real folder-based RLS policies, pick and crop photos with image_picker/image_cropper, build the full pick-to-published-URL upload pipeline, and render it all back efficiently with cached_network_image and shimmer placeholders.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Supabase Storage buckets & policies',
      topics: [
        {
          id: 'm4-t1',
          title: 'Creating the avatars and posts buckets',
          explain:
            'Supabase Storage organizes files into named buckets — LocalInsta needs two public ones: `avatars` and `posts`.',
          analogy:
            'A photo studio keeps two separate filing cabinets — one for staff ID photos, one for client print orders — even though both hold the same kind of thing (images), because they are managed and accessed differently. `avatars` and `posts` are those two cabinets.',
          theory:
            'A **bucket** in Supabase Storage is a top-level namespace for files, S3-compatible under the hood, genuinely free on the Spark-equivalent free tier (1GB storage, 5GB bandwidth/month — no card, unlike Firebase Storage\'s Blaze requirement covered in Module 1). Each bucket has its own **public/private** toggle and its own RLS policies (Storage security is enforced through RLS on a special `storage.objects` table, covered in the next topic).\n\nLocalInsta creates two **public** buckets: `avatars` (profile pictures) and `posts` (post images/videos). "Public" here means anyone with the exact file URL can view it without authentication — appropriate for a public-by-default social app, exactly matching the `select` policies you wrote on `profiles`/`posts` in Module 3. Public does **not** mean anyone can *upload* to the bucket — that is still governed by upload-side RLS policies, next topic.',
          whyItMatters:
            'Getting the bucket structure right before writing any upload code avoids a common beginner mistake — dumping every file type into one undifferentiated bucket, which makes policies harder to reason about and file organization harder to browse later.',
          steps: [
            'Open **Storage** in the Supabase dashboard, click **New bucket**.',
            'Create `avatars`, toggle **Public bucket** on.',
            'Create `posts`, toggle **Public bucket** on.',
            'Open each bucket and confirm it is empty, with the public toggle showing correctly in its settings.',
            'Note the URL shape both buckets will produce: `https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>`.',
          ],
          code: `-- Buckets can also be created via SQL if you prefer scripting this step:
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Confirm both exist
select id, name, public from storage.buckets;`,
          pitfalls: [
            '**Making a bucket private "for safety" when the content is meant to be publicly viewable.** A private bucket requires generating short-lived signed URLs for every single image, adding real complexity for no benefit on genuinely public content. Fix: public buckets for public content, matching your RLS read policies from Module 3.',
            '**One giant `media` bucket for everything.** Harder to reason about policies (avatar uploads and post uploads have slightly different rules) and harder to browse in the dashboard. Fix: separate buckets per content type, as done here.',
            '**Forgetting buckets are project-wide, not per-user.** All users\' avatars live in the same `avatars` bucket, distinguished by folder path (next topic), not by separate buckets per user. Fix: understand folder-based organization within one bucket, not one bucket per user.',
            '**Creating a bucket and assuming "public" alone is enough security.** Public only controls *read* access to files whose exact path you already know — write access still needs explicit RLS policies, covered immediately next. Fix: never skip the upload-side policies.',
          ],
          tryIt:
            'Create both buckets via the dashboard UI, then re-run the confirmation query above via SQL Editor to see them listed — note the `public` column reads `true` for both.',
          takeaway: 'Public buckets solve read access for genuinely public content; upload access is an entirely separate policy question, next.',
        },
        {
          id: 'm4-t2',
          title: 'Storage RLS: folder-based ownership policies',
          explain:
            'Storage security is enforced by RLS policies on `storage.objects`, using the file\'s folder path (the first path segment) to check it matches the uploader\'s own user id.',
          analogy:
            'A shared darkroom where every photographer gets their own labelled drawer — the darkroom manager (a Storage RLS policy) checks the label on the drawer you are reaching into, not just who you are, before letting you slide a print in or pull one out.',
          theory:
            'Every file in every bucket is a row in the special `storage.objects` table (columns include `bucket_id`, `name` — the full path — and `owner`), and this table has its own RLS policies exactly like any table from Module 3. LocalInsta\'s convention: every uploaded file\'s path starts with the uploader\'s own user id as the first folder segment — `avatars/<user_id>/profile.jpg`, `posts/<user_id>/<post_id>.jpg`. The helper function `storage.foldername(name)` splits a path into an array of segments, so `(storage.foldername(name))[1]` extracts that first segment for comparison against `auth.uid()::text`.\n\nThis path-prefix convention is what turns "one shared bucket per content type" into a genuinely per-user-secured space: the policy does not care about bucket layout beyond that one agreed convention, and every upload/delete policy for both buckets follows the identical shape.',
          whyItMatters:
            'This is the Storage equivalent of Module 3\'s `auth.uid() = user_id` ownership pattern — recognising it as the *same idea*, just checking a folder path instead of a table column, means Storage security stops feeling like a separate, unfamiliar system.',
          steps: [
            'Enable RLS is already on by default for `storage.objects` (Supabase\'s managed default) — confirm via `select relrowsecurity from pg_class where relname = \'objects\';`.',
            'Write a public `select` policy on `storage.objects` scoped to `bucket_id in (\'avatars\', \'posts\')` — matching the public-bucket decision from the previous topic.',
            'Write an `insert` policy: `with check (bucket_id = \'avatars\' and (storage.foldername(name))[1] = auth.uid()::text)` — repeat for `posts`.',
            'Write matching `update`/`delete` policies using `using` with the same folder-ownership check.',
            'Test: attempt to upload a file whose path does not start with your own user id and confirm it is rejected.',
          ],
          code: `-- Public read on both buckets (matches the public-bucket decision)
create policy "public read on avatars and posts"
on storage.objects for select
to public
using (bucket_id in ('avatars', 'posts'));

-- Upload only into your own folder
create policy "users upload to their own avatar folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users upload to their own posts folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'posts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Update/delete only your own files
create policy "users manage their own avatar files"
on storage.objects for update using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete their own avatar files"
on storage.objects for delete using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users delete their own post files"
on storage.objects for delete using (
  bucket_id = 'posts' and (storage.foldername(name))[1] = auth.uid()::text
);`,
          pitfalls: [
            '**Forgetting that `auth.uid()` returns a `uuid` but `storage.foldername(name)` returns `text[]`.** Comparing a `uuid` to a `text` element without casting (`auth.uid()::text`) fails to match even for legitimately correct paths. Fix: always cast `auth.uid()` to `text` in Storage policies.',
            '**Uploading with a path that does not start with the user\'s own id, out of a naming-convenience shortcut.** The insert policy silently rejects it, and the error can be confusing if you have not internalised the convention. Fix: always build upload paths as `<user_id>/<filename>` from Flutter, matching the policy exactly.',
            '**Writing one combined policy for both buckets with an `or` instead of two separate, bucket-scoped policies.** Works, but makes it easy to accidentally grant broader access than intended when one bucket\'s rules need to diverge later (e.g. if posts ever need a moderation step avatars do not). Fix: prefer one policy per bucket per operation, even with some duplication — clarity over cleverness.',
            '**Assuming Storage RLS is somehow separate from "real" RLS.** It is the exact same mechanism, on the exact same kind of table (`storage.objects`), just with Supabase-provided helper functions (`storage.foldername`) for path parsing. Fix: apply everything learned about testing RLS in Module 3 here too.',
          ],
          tryIt:
            'Using the impersonation technique from Module 3, attempt (as one test user) to insert a `storage.objects` row with another user\'s id as the folder prefix, and confirm the insert policy rejects it — then attempt it with your own id as the prefix and confirm it succeeds.',
          takeaway: 'Storage RLS is the same auth.uid()-based ownership pattern as Module 3, just checking a folder-path convention instead of a table column.',
        },
        {
          id: 'm4-t3',
          title: 'Public URLs — LocalInsta never needs signed URLs',
          explain:
            'Because both buckets are public, every uploaded file gets a permanent, predictable public URL the instant it is uploaded — no signed-URL expiry logic needed anywhere in the app.',
          analogy:
            'A public noticeboard poster has one fixed address anyone can walk up and read, forever, versus a bank\'s one-time entry pass that expires the moment your appointment ends. LocalInsta\'s public bucket URLs are the noticeboard poster — simple, permanent, no expiry to manage.',
          theory:
            '`supabase.storage.from(\'posts\').getPublicUrl(path)` returns a permanent URL of the shape `https://<ref>.supabase.co/storage/v1/object/public/posts/<path>` — this is a pure string construction, not a network call, and the URL never expires as long as the file exists and the bucket stays public. This is exactly the value you store in `posts.image_url` (Module 3\'s schema) and `profiles.avatar_url`.\n\n**Signed URLs** (`createSignedUrl`, time-limited, for private-bucket content) exist in Supabase Storage but LocalInsta never needs them, precisely because every table\'s RLS read policy already established that this content is meant to be public. Recognising *why* you do not need a feature is as valuable as knowing how to use it — reaching for signed URLs on public content would add real complexity (tracking expiry, re-signing) for zero actual security benefit.',
          whyItMatters:
            'A surprising number of tutorials reach for signed URLs by default "to be safe", adding real complexity and an expiry-tracking bug surface for content that was always meant to be public. Knowing when the simpler tool is correct is a genuine design skill.',
          steps: [
            'After any successful upload, call `supabase.storage.from(bucketName).getPublicUrl(path)`.',
            'Confirm the returned URL is a plain string, immediately usable, with no further network round-trip.',
            'Paste one such URL directly into a browser and confirm the image loads with no authentication.',
            'Store this exact URL string in the relevant `posts.image_url` or `profiles.avatar_url` column.',
          ],
          code: `// After a successful upload (full upload flow built later this module)
final path = '\${userId}/\${postId}.jpg';
await supabase.storage.from('posts').upload(path, imageFile);

final publicUrl = supabase.storage.from('posts').getPublicUrl(path);
// -> https://your-ref.supabase.co/storage/v1/object/public/posts/<user_id>/<post_id>.jpg

// Store it directly — no expiry, no re-signing needed
await supabase.from('posts').insert({
  'user_id': userId,
  'image_url': publicUrl,
  'caption': caption,
});`,
          pitfalls: [
            '**Reaching for `createSignedUrl` on public-bucket content "for extra safety".** Adds expiry-tracking complexity for content whose RLS read policy already made it intentionally public. Fix: public buckets get plain public URLs, full stop.',
            '**Re-fetching the public URL from Storage on every app launch instead of storing it once in the database.** Unnecessary extra calls for a value that never changes once uploaded. Fix: `getPublicUrl` once at upload time, persist the string.',
            '**Assuming a public URL means the *file itself* was uploaded without RLS protection.** The URL being public only affects *reading*; the insert policy from the previous topic still fully protects who can *upload* to that path. Fix: keep these two concerns mentally separate.',
            '**Constructing the public URL manually by hand-formatting the string instead of calling `getPublicUrl`.** Fragile if Supabase ever changes the URL shape. Fix: always use the SDK method, never hardcode the URL pattern.',
          ],
          tryIt:
            'Upload a test file directly via the Storage dashboard UI, call `getPublicUrl` for its path from a Dart scratch script (or just construct the URL by the documented pattern once, to see it), and open it in a browser with no authentication — confirm it just works.',
          takeaway: 'Public buckets get permanent public URLs, no expiry — reserve signed URLs for genuinely private content, which LocalInsta has none of.',
        },
        {
          id: 'm4-t4',
          title: 'Free tier storage limits & what happens at the ceiling',
          explain:
            'Supabase\'s free tier gives 1GB of Storage and 5GB of monthly bandwidth — plenty for a learning project, and worth understanding what happens (and does not happen) if you hit it.',
          analogy:
            'A single shared photo album at a small guesthouse with a fixed number of pages — plenty for the season\'s guests, but the owner would notice well before it filled up, and simply would not paste in more photos rather than the album spontaneously combusting.',
          theory:
            '**Storage** (1GB free) is the total size of every file across every bucket; **bandwidth** (5GB/month free) is the total data transferred *out* to viewers — every image a feed loads counts against this. Hitting the storage ceiling means new uploads are rejected with a clear error (not data loss); hitting the bandwidth ceiling means new downloads are throttled or rejected until the next monthly reset (or an upgrade) — again, not data loss, just a temporary serving limit.\n\nFor perspective: a typical compressed JPEG post image (this module\'s compression topic covers getting there) at ~200-400KB means 1GB comfortably holds 2,500-5,000 uploaded posts — enormous headroom for learning, demoing, or even a genuinely small real community app. Bandwidth is the tighter constraint in practice, which is exactly why this module\'s compression and Module 5\'s caching topics matter beyond just "best practice" — they directly extend how far the free tier stretches.',
          whyItMatters:
            'Understanding the free tier\'s real numbers — not vague "it\'s limited" hand-waving — lets you make informed decisions about image compression and caching instead of guessing, and reassures you that hitting a limit during this course is a recoverable, well-understood event, not a crisis.',
          steps: [
            'Open **Project Settings → Billing** (still free-tier, no card) and find the current Storage and Bandwidth usage meters.',
            'Note today\'s baseline usage (likely near zero at this point in the course).',
            'Calculate roughly: at ~300KB per compressed post image, how many posts fit in the 1GB storage budget?',
            'Note the monthly bandwidth reset date shown in the dashboard.',
            'Bookmark this page — you will revisit it in Module 9\'s performance topic once the app has real usage.',
          ],
          code: `-- You can also estimate current Storage usage directly via SQL:
select
  bucket_id,
  count(*) as file_count,
  pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size
from storage.objects
group by bucket_id;`,
          pitfalls: [
            '**Never checking the usage dashboard until something breaks.** Fix: check it periodically, especially after adding a lot of seed/test data — it is a genuinely useful habit, not just a course exercise.',
            '**Uploading uncompressed, full-resolution camera photos "because storage seems like a lot".** A single modern phone photo can be 5-10MB — at that size, 1GB holds only 100-200 posts. Fix: this is exactly why the compression topic later this module is not optional polish.',
            '**Panicking that hitting a limit means data loss.** It does not — new uploads/downloads are blocked or throttled, existing data is untouched. Fix: understand the actual failure mode so you can react calmly and appropriately (delete test data, compress harder, or genuinely consider an upgrade for a real production app).',
            '**Confusing database storage (Module 3\'s 500MB Postgres quota) with file Storage (this module\'s 1GB quota).** They are two entirely separate meters. Fix: know which quota a given piece of data counts against.',
          ],
          tryIt:
            'Run the SQL usage-estimation query above right now (even with your Storage buckets still empty or nearly so) so you know exactly how to check it again in Module 9 once the app has real seeded content.',
          takeaway: '1GB storage and 5GB bandwidth, genuinely free, is enormous headroom for this course — compression is what stretches it further, not what saves you from an imminent crisis.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Picking & preparing images',
      topics: [
        {
          id: 'm4-t5',
          title: 'image_picker: camera vs gallery, and Android permissions',
          explain:
            '`image_picker` gives one clean API for both the camera and the photo gallery — and Android 13+ needs a specific runtime permission declared and requested correctly.',
          analogy:
            'Asking a friend "show me a photo" versus "take a new photo right now" are two different requests with the same end goal — a picked image. `image_picker`\'s `ImageSource.gallery` and `ImageSource.camera` are exactly those two doors into the same result.',
          theory:
            '`ImagePicker().pickImage(source: ImageSource.gallery)` or `.camera` returns an `XFile?` (null if the user backed out — treat this as a normal cancellation, exactly like Module 2\'s Google Sign-In cancellation). Both paths need platform permission declarations: **Android 13+ (API 33+)** uses granular photo/video permissions (`READ_MEDIA_IMAGES`) instead of the old blanket storage permission, while camera access always needs `CAMERA`. `image_picker` handles the runtime permission *request* dialog for you, but the manifest entries must still be declared.\n\nOffering the user an explicit choice — a bottom sheet with "Take Photo" / "Choose from Gallery" — rather than defaulting silently to one, matches the real Instagram UX and avoids surprising a user who expected the other option.',
          whyItMatters:
            'Camera/gallery permission handling is one of the most-abandoned flows in real apps when done poorly — a confusing permission dialog with no context, or a crash when permission is denied, loses users at the exact moment they were about to create content, which is the core action of a photo-sharing app.',
          steps: [
            'Add Android manifest entries: `<uses-permission android:name="android.permission.CAMERA" />` and the Android 13+ media permissions.',
            'Build a bottom sheet with two options: "Take Photo" and "Choose from Gallery".',
            'Wire each to `ImagePicker().pickImage(source: ...)`, handling the `null` (cancelled) case silently.',
            'Wrap the call in `try`/`catch` for the permission-denied case, showing a friendly message pointing to app settings.',
            'On success, pass the returned `XFile` into the cropper (next topic).',
          ],
          code: `<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

// Dart
Future<XFile?> pickPostImage(BuildContext context) async {
  final source = await showModalBottomSheet<ImageSource>(
    context: context,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Take Photo'),
            onTap: () => Navigator.pop(ctx, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Choose from Gallery'),
            onTap: () => Navigator.pop(ctx, ImageSource.gallery),
          ),
        ],
      ),
    ),
  );
  if (source == null) return null; // user dismissed the sheet — not an error

  try {
    return await ImagePicker().pickImage(source: source, imageQuality: 85);
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not access \${source == ImageSource.camera ? 'camera' : 'gallery'}: \$e')),
      );
    }
    return null;
  }
}`,
          pitfalls: [
            '**Only declaring the old `READ_EXTERNAL_STORAGE` permission.** Silently fails to prompt correctly on Android 13+, which uses the newer granular media permissions instead. Fix: declare both, since the app may run on a range of Android versions.',
            '**Treating a `null` XFile (user cancelled the picker) as an error and showing a SnackBar.** Confuses users who deliberately backed out. Fix: silent return, exactly like the OAuth cancellation pattern from Module 2.',
            '**Not setting `imageQuality` on `pickImage`.** Full-resolution camera photos are unnecessarily huge before you even reach the dedicated compression step. Fix: a reasonable `imageQuality: 85` here is a first, cheap size reduction.',
            '**No fallback UI when permission is permanently denied ("don\'t ask again").** The picker call just silently fails forever with no path forward for the user. Fix: catch the failure and offer a clear "open app settings" action.',
          ],
          tryIt:
            'Wire the full bottom-sheet-to-XFile flow, test both the camera and gallery paths on a real device, and deliberately deny the permission once to confirm your error handling shows something more helpful than a silent failure.',
          takeaway: 'Offer an explicit camera-or-gallery choice, treat cancellation as normal, and handle Android 13+\'s permission split deliberately.',
        },
        {
          id: 'm4-t6',
          title: 'image_cropper: a square crop, Instagram-style',
          explain:
            '`image_cropper` opens a native cropping UI constrained to a 1:1 aspect ratio, matching LocalInsta\'s square post grid from Module 0.',
          analogy:
            'A passport-photo booth does not let you submit any random rectangle — it constrains you to exactly the required frame before printing. `image_cropper`\'s locked 1:1 aspect ratio is that same constrained frame, guaranteeing every post fits the grid cleanly.',
          theory:
            '`ImageCropper().cropImage(sourcePath: xfile.path, aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1), uiSettings: [...])` opens a native (platform-specific) cropping screen — Android gets a Material-styled cropper, locked to a square by the aspect ratio constraint — and returns a `CroppedFile?` on success. Locking the aspect ratio (rather than leaving it free-form) is a deliberate product decision matching Module 0\'s `AspectRatio(aspectRatio: 1)` grid cells: every post image genuinely is a square, guaranteed at crop time, not just visually forced later with `BoxFit.cover` (which would crop unpredictably and inconsistently across different screens).\n\nA `null` return means the user cancelled the crop — treat it the same as every other picker-style cancellation in this course: a silent, normal outcome.',
          whyItMatters:
            'Cropping to a guaranteed shape *before* upload, rather than trying to force arbitrary aspect ratios to look right in the UI later, is simpler and more predictable — the grid and feed code in Modules 5-6 never need special-case logic for "what if this image is a weird shape".',
          steps: [
            'Add `image_cropper: ^8.0.2` to `pubspec.yaml`.',
            'After a successful `pickPostImage`, immediately call `ImageCropper().cropImage(...)` with a locked 1:1 `CropAspectRatio`.',
            'Configure `AndroidUiSettings` with a toolbar title and the LocalInsta brand orange as the toolbar color.',
            'Handle the `null` (cancelled) case by returning to the picker step, not showing an error.',
            'On success, pass the `CroppedFile`\'s path into the compression step (next topic).',
          ],
          code: `Future<CroppedFile?> cropToSquare(String sourcePath) async {
  return ImageCropper().cropImage(
    sourcePath: sourcePath,
    aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
    uiSettings: [
      AndroidUiSettings(
        toolbarTitle: 'Crop your photo',
        toolbarColor: const Color(0xFFE85A2A), // LocalInsta brand orange
        toolbarWidgetColor: Colors.white,
        lockAspectRatio: true, // user cannot drag it into a non-square shape
      ),
    ],
  );
}

// Chained together
Future<void> pickCropAndUpload(BuildContext context) async {
  final picked = await pickPostImage(context);
  if (picked == null) return;

  final cropped = await cropToSquare(picked.path);
  if (cropped == null) return; // cancelled crop — back to normal, no error shown

  // next: compress + upload (following topics)
}`,
          pitfalls: [
            '**Not setting `lockAspectRatio: true`.** Users can drag the crop handles into a non-square shape despite the `aspectRatio` hint, breaking the grid assumption downstream. Fix: always lock it explicitly.',
            '**Skipping the crop step for gallery-picked images "since they might already be square".** Inconsistent — some are, most are not. Fix: always route every picked image through the same crop step, no exceptions, for predictable downstream behaviour.',
            '**Treating a cancelled crop as needing an error message.** Same principle as every other cancellable picker flow this module — silent, normal. Fix: just return, let the user retry from the beginning if they want.',
            '**Forgetting iOS-specific `uiSettings` if you ever target iOS.** LocalInsta\'s course scope is Android-first, but `image_cropper` supports iOS too — worth knowing `IOSUiSettings` exists as a parallel config if you extend the app later.',
          ],
          tryIt:
            'Pick a clearly non-square photo (a wide landscape shot) and confirm the cropper genuinely forces you into a square selection with no way to submit a non-square crop.',
          takeaway: 'Lock the aspect ratio at crop time — every post image arrives at the upload step already guaranteed square, no downstream special-casing needed.',
        },
        {
          id: 'm4-t7',
          title: 'Compressing before upload — protecting the free tier',
          explain:
            'A cropped image is still often 1-3MB — compressing it to a reasonable JPEG quality before upload directly stretches the free tier\'s storage and bandwidth ceilings from Module 4\'s earlier topic.',
          analogy:
            'Vacuum-sealing bedding before storing it in a small loft is not about making it a different thing — it is the same bedding, taking a fraction of the space. Image compression is exactly that: visually near-identical content, meaningfully smaller.',
          theory:
            '`flutter_image_compress` re-encodes an image at a target JPEG `quality` (0-100) and optionally resizes it, trading a small, usually visually-imperceptible quality reduction for a significant file-size reduction — commonly 60-80% smaller at `quality: 80` compared to an uncompressed source. For LocalInsta, compressing to roughly **1080px on the long edge** (more than enough for any phone screen) at **quality 80** is a sensible default, mirroring what Instagram itself does internally.\n\nThis single step is what turns Module 4\'s free-tier math from "a few hundred posts" into "thousands of posts" — directly connecting a concrete engineering decision (compression settings) to a concrete business constraint (free-tier ceilings), which is exactly the kind of trade-off reasoning worth being able to explain out loud.',
          whyItMatters:
            'Skipping compression is one of the most common ways a learning project silently burns through free-tier quotas far faster than expected — and unlike many optimizations, this one is genuinely nearly free in terms of implementation effort for the payoff it gives.',
          steps: [
            'Add `flutter_image_compress: ^2.3.0` to `pubspec.yaml`.',
            'After cropping, call `FlutterImageCompress.compressWithFile(croppedPath, quality: 80, minWidth: 1080, minHeight: 1080)`.',
            'Compare the before/after file sizes with a debug `print` to see the real reduction on a test photo.',
            'Handle the (rare) case where compression returns `null` by falling back to the uncompressed cropped file rather than blocking the upload entirely.',
            'Confirm visually on a real device that quality 80 is indistinguishable from the original at normal viewing size.',
          ],
          code: `Future<Uint8List> compressForUpload(String croppedPath) async {
  final originalSize = await File(croppedPath).length();

  final compressed = await FlutterImageCompress.compressWithFile(
    croppedPath,
    quality: 80,
    minWidth: 1080,
    minHeight: 1080,
    format: CompressFormat.jpeg,
  );

  if (compressed == null) {
    // Rare fallback — do not block the upload over a compression failure
    return File(croppedPath).readAsBytes();
  }

  debugPrint(
    'Compressed \${(originalSize / 1024).toStringAsFixed(0)}KB '
    '-> \${(compressed.length / 1024).toStringAsFixed(0)}KB',
  );
  return compressed;
}`,
          pitfalls: [
            '**Compressing too aggressively (quality below ~60) chasing maximum size savings.** Visible artifacts on real photos, especially skies and gradients — a bad trade for a photo-sharing app where image quality is the whole point. Fix: quality 75-85 is the sensible band; test visually, do not just chase the smallest file.',
            '**Skipping the `minWidth`/`minHeight` resize and only reducing JPEG quality.** A 4000px-wide photo at quality 80 is still far larger than a 1080px-wide photo at quality 80, for no visible benefit on a phone screen. Fix: resize AND compress together.',
            '**Not handling a `null` compression result at all.** A rare codec/format edge case would crash the whole upload flow. Fix: always have a graceful fallback to the uncompressed bytes rather than blocking.',
            '**Compressing on the main isolate for a very large source image, causing a visible UI freeze.** `flutter_image_compress`\'s file-based API already runs natively off the main thread for the heavy lifting, but always test on a real large photo, not just small test assets.',
          ],
          tryIt:
            'Take a real, full-resolution photo with your phone camera, run it through the full pick → crop → compress pipeline, and print both the before-crop and after-compress file sizes — you should typically see an 80%+ reduction with no visible quality loss on screen.',
          takeaway: 'Resize to ~1080px and compress to quality ~80 — a small, invisible quality trade that meaningfully multiplies how far the free tier stretches.',
        },
        {
          id: 'm4-t8',
          title: 'Generating the storage path — user folder + unique filename',
          explain:
            'Every uploaded file\'s path follows `<user_id>/<uuid>.jpg` — satisfying the folder-based RLS policy from earlier this module and guaranteeing no filename collisions.',
          analogy:
            'A cloakroom ticket with your name on the drawer and a unique number on the item inside — the drawer (folder) proves ownership, the number (uuid) guarantees no two items ever get mixed up, even if two people check in a coat at the exact same second.',
          theory:
            'Two requirements converge into one path-naming convention: the Storage RLS policies from earlier this module require the **first path segment to equal the uploader\'s `auth.uid()`**, and every file needs a **guaranteed-unique** name to avoid silently overwriting another upload (two posts, two different images, could otherwise coincidentally share a filename like `photo.jpg`). The `uuid` package (already in `pubspec.yaml` since Module 1) generates a version-4 random UUID, virtually collision-proof for this purpose.\n\nA small helper function centralizes this convention so every upload call site — avatar, post image, later a story image — constructs paths identically, rather than each screen inventing its own slightly-different naming scheme.',
          whyItMatters:
            'A shared, tested path-building helper is exactly the kind of small utility that prevents an entire class of subtle bugs (an RLS rejection because one screen forgot the folder-prefix convention) from ever being possible in the first place.',
          steps: [
            'Create `lib/core/storage_paths.dart` with a function `buildUploadPath({required String userId, required String extension})`.',
            'Use the `uuid` package\'s `Uuid().v4()` for the filename portion.',
            'Return `\'\$userId/\${Uuid().v4()}.\$extension\'`.',
            'Use this helper for both the avatar upload path and the post-image upload path (different buckets, same path-shape convention).',
            'Confirm the resulting path always starts with the exact same string as `supabase.auth.currentUser!.id`.',
          ],
          code: `import 'package:uuid/uuid.dart';

const _uuid = Uuid();

String buildUploadPath({required String userId, required String extension}) {
  return '\$userId/\${_uuid.v4()}.\$extension';
}

// Usage — always keeps the folder-ownership convention consistent
final userId = supabase.auth.currentUser!.id;
final avatarPath = buildUploadPath(userId: userId, extension: 'jpg');
// -> "a1b2c3d4-.../f47ac10b-58cc-4372-a567-0e02b2c3d479.jpg"

final postPath = buildUploadPath(userId: userId, extension: 'jpg');`,
          pitfalls: [
            '**Using the original filename from the picked file (e.g. `IMG_20260709.jpg`) directly.** Two uploads with the same original filename from the same user would overwrite each other, and could also leak device/camera metadata through the filename. Fix: always generate a fresh UUID filename server-independent of the source file\'s original name.',
            '**Forgetting the user-id folder prefix on one upload call site while remembering it everywhere else.** The Storage RLS insert policy silently rejects that one upload, and the bug can be confusing to trace without recognising the pattern from this topic. Fix: always route every upload through this one shared helper, never construct paths ad hoc.',
            '**Using a sequential or timestamp-based filename instead of a UUID.** More predictable, and depending on how it is generated, can occasionally collide under concurrent uploads. Fix: a version-4 UUID\'s collision probability is negligible for this scale.',
            '**Hardcoding the file extension as `.jpg` even when a user picks a PNG or (later, Module 7) a video file.** Fix: derive the extension from the actual picked/compressed file\'s real format rather than assuming.',
          ],
          tryIt:
            'Generate ten paths with this helper using the same fake `userId` and confirm every single one starts with the identical folder prefix but has a completely different, unique filename.',
          takeaway: 'One shared path-building helper, matching the RLS folder convention exactly, is what keeps every upload call site correct by construction.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'The upload pipeline',
      topics: [
        {
          id: 'm4-t9',
          title: 'Uploading bytes to Supabase Storage',
          explain:
            '`supabase.storage.from(bucket).uploadBinary(path, bytes)` sends the compressed image bytes directly — no temp file juggling required.',
          analogy:
            'Handing a sealed courier envelope straight to the delivery counter, rather than first printing the contents, walking them to a locker, and having the courier retrieve them from there — `uploadBinary` skips the unnecessary intermediate temp-file step when you already have the bytes in memory.',
          theory:
            '`supabase.storage.from(\'posts\').uploadBinary(path, compressedBytes, fileOptions: const FileOptions(contentType: \'image/jpeg\', upsert: false))` uploads directly from a `Uint8List` (exactly what Module 4\'s compression step produces) — no need to write a temporary file to disk first just to hand its path to the SDK. `upsert: false` (the default) means a genuine collision (which the UUID path from the previous topic makes essentially impossible) fails loudly rather than silently overwriting — a deliberate safety choice.\n\nWrap the call in `try`/`catch` for `StorageException` — a network blip mid-upload on a slow rural connection is a realistic scenario for a hyperlocal app, not an edge case to ignore.',
          whyItMatters:
            'This is the one network call every single piece of user-generated content in LocalInsta passes through — getting its error handling and options right here pays off across avatars, post images, and (Module 7) story images alike.',
          steps: [
            'Write `uploadImageBytes({required String bucket, required String path, required Uint8List bytes})` in a small `StorageRepository` class (matching Module 2\'s repository pattern).',
            'Call `supabase.storage.from(bucket).uploadBinary(path, bytes, fileOptions: const FileOptions(contentType: \'image/jpeg\'))`.',
            'Wrap in `try`/`catch (e) on StorageException`, rethrowing a friendlier app-specific exception.',
            'On success, call `getPublicUrl(path)` (from earlier this module) and return the resulting URL string directly from this same method.',
          ],
          code: `class StorageRepository {
  StorageRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Future<String> uploadImageBytes({
    required String bucket,
    required String path,
    required Uint8List bytes,
  }) async {
    try {
      await _client.storage.from(bucket).uploadBinary(
            path,
            bytes,
            fileOptions: const FileOptions(contentType: 'image/jpeg', upsert: false),
          );
      return _client.storage.from(bucket).getPublicUrl(path);
    } on StorageException catch (e) {
      throw Exception('Upload failed: \${e.message}');
    }
  }
}`,
          pitfalls: [
            '**Setting `upsert: true` by default "just in case".** Silently overwrites an existing file at that path with zero warning — dangerous given the whole point of the UUID path was collision-proofing. Fix: keep `upsert: false` unless you have a specific, deliberate reason to overwrite (e.g. always-replace avatar uploads, a legitimate exception discussed in the next topic).',
            '**Not setting `contentType`.** Some clients/browsers may misinterpret the file without an explicit MIME type. Fix: always set it explicitly to match the actual compressed format.',
            '**Calling `getPublicUrl` before the upload actually completes (missing `await`).** Returns a URL for a file that does not exist yet, briefly. Fix: always `await` the upload call first.',
            '**Not surfacing upload errors distinctly from other errors in the calling UI.** A failed upload deserves a specific "upload failed, try again" message, not a generic error banner indistinguishable from an auth or database failure. Fix: catch and rethrow a distinguishable exception type as shown.',
          ],
          tryIt:
            'Call this method with a real compressed image and confirm the returned public URL loads correctly in a browser — then deliberately call it a second time with the exact same path and confirm it fails (since `upsert: false`), proving the collision-safety guarantee.',
          takeaway: 'uploadBinary skips the temp-file detour, upsert:false makes accidental overwrites impossible, and the method returns straight to a usable public URL.',
        },
        {
          id: 'm4-t10',
          title: 'Upload progress, retry & the offline case',
          explain:
            'A real upload UI needs a visible progress/pending state and a graceful retry path — `connectivity_plus` helps distinguish "no internet" from "server error" up front.',
          analogy:
            'A courier who vanishes for twenty minutes with no update leaves you anxious; one who says "picked up, on the way, five minutes out" keeps you calm even if the trip takes a while. An upload progress indicator is that reassuring status update.',
          theory:
            '`connectivity_plus`\'s `Connectivity().checkConnectivity()` lets you check for a network connection **before** attempting an upload at all, showing an immediate, specific "You\'re offline" message rather than letting the request fail slowly and confusingly. For the upload itself, track a simple local state machine — `idle → uploading → success` or `idle → uploading → failed` — driving a disabled button, a spinner, and a "Try again" affordance on failure, mirroring the `_submitting` pattern from Module 2\'s auth forms.\n\n`supabase_flutter`\'s Storage upload does not currently expose granular byte-level progress callbacks the way some other SDKs do — for LocalInsta, a simple indeterminate spinner during the upload is the honest, appropriate level of detail; do not fake a fine-grained progress bar with made-up numbers.',
          whyItMatters:
            'Posting a photo is the single highest-stakes action in the entire app from a user\'s perspective — a failed or unclear upload at this exact moment is far more damaging to trust than a failure almost anywhere else in LocalInsta.',
          steps: [
            'Add `connectivity_plus: ^6.1.0` to `pubspec.yaml` (already listed in Module 1\'s dependency set).',
            'Before starting an upload, call `await Connectivity().checkConnectivity()` and short-circuit with a clear offline message if there is no connection.',
            'Track `enum UploadStatus { idle, uploading, success, failed }` in your post-creation `ChangeNotifier`.',
            'Show a disabled "Posting..." button with a spinner during `uploading`.',
            'On `failed`, show the error and a "Try again" button that re-attempts the exact same upload call.',
          ],
          code: `enum UploadStatus { idle, uploading, success, failed }

class CreatePostState extends ChangeNotifier {
  CreatePostState(this._storageRepo, this._postsRepo);
  final StorageRepository _storageRepo;
  final PostsRepository _postsRepo;

  UploadStatus status = UploadStatus.idle;
  String? errorMessage;

  Future<void> submit({
    required Uint8List imageBytes,
    required String userId,
    String? caption,
  }) async {
    final connectivity = await Connectivity().checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) {
      status = UploadStatus.failed;
      errorMessage = "You're offline — check your connection and try again.";
      notifyListeners();
      return;
    }

    status = UploadStatus.uploading;
    errorMessage = null;
    notifyListeners();

    try {
      final path = buildUploadPath(userId: userId, extension: 'jpg');
      final url = await _storageRepo.uploadImageBytes(bucket: 'posts', path: path, bytes: imageBytes);
      await _postsRepo.createPost(imageUrl: url, caption: caption);
      status = UploadStatus.success;
    } catch (e) {
      status = UploadStatus.failed;
      errorMessage = e.toString();
    } finally {
      notifyListeners();
    }
  }
}`,
          pitfalls: [
            '**Faking a percentage progress bar with no real underlying data.** Actively misleading — an indeterminate spinner is more honest than a fabricated number. Fix: use an indeterminate `CircularProgressIndicator` unless you have a genuine byte-level progress source.',
            '**Not checking connectivity first, letting a doomed request time out slowly.** Wastes 10-30 seconds of a confused, waiting user before finally showing an error. Fix: a fast, upfront connectivity check gives immediate, honest feedback.',
            '**Losing the picked/cropped/compressed image on a failed upload, forcing the user to redo the entire pick-crop-compress flow just to retry.** Fix: keep the compressed bytes in memory in the `ChangeNotifier` so "Try again" can re-attempt the exact same upload without re-picking.',
            '**Letting the user navigate away mid-upload with no warning, potentially losing the post.** Fix: consider a confirmation if they try to back out during `uploading` status, or (a fine simpler choice for this course) let the upload continue in the background if your navigation stack allows it.',
          ],
          tryIt:
            'Turn on airplane mode, attempt to post, and confirm you get an immediate, specific "you\'re offline" message rather than a long hang — then turn connectivity back on and confirm "Try again" succeeds without needing to re-pick the image.',
          takeaway: 'An honest indeterminate spinner, an upfront connectivity check, and a real retry that reuses the already-compressed bytes — that is the whole of good upload UX here.',
        },
        {
          id: 'm4-t11',
          title: 'The complete avatar upload flow',
          explain:
            'Pick → crop → compress → upload → update `profiles.avatar_url` — the first full end-to-end use of everything built this module.',
          analogy:
            'A tailor takes your measurements, cuts the cloth, stitches the garment, and only then updates the shop\'s "ready for pickup" board — each step depends on the one before it, and the board only changes once the whole chain genuinely finished.',
          theory:
            'The avatar flow chains every piece from this module in sequence: `pickPostImage` (reused for avatars too — same picker, same bottom sheet) → `cropToSquare` → `compressForUpload` → `StorageRepository.uploadImageBytes(bucket: \'avatars\', ...)` → finally `supabase.from(\'profiles\').update({\'avatar_url\': url}).eq(\'id\', userId)`, protected by the Module 3 RLS `update` policy that already ensures a user can only update their **own** profile row.\n\nThis is a genuinely satisfying integration checkpoint: every concept from Modules 1-4 — compile-time config, the repository pattern, RLS, Storage policies, image handling — converges into one real, working feature a user can actually see and use.',
          whyItMatters:
            'Finishing one complete vertical slice — a real feature, start to finish, touching every layer of the stack — is worth more for building genuine confidence than reading about each layer in isolation. This is that checkpoint for LocalInsta.',
          steps: [
            'Add an `updateAvatar(BuildContext context)` method chaining every step above, on the profile screen.',
            'Show a loading overlay on the avatar circle during the upload.',
            'On success, update the local `ChangeNotifier`\'s cached profile so the UI reflects the new avatar immediately, without waiting for a full profile refetch.',
            'On failure at any step, show a clear error and leave the old avatar untouched (never show a broken image mid-flow).',
            'Test the full flow on a real device: tap avatar → pick or take a photo → crop to square → see the new avatar appear.',
          ],
          code: `Future<void> updateAvatar(BuildContext context) async {
  final picked = await pickPostImage(context);
  if (picked == null) return;

  final cropped = await cropToSquare(picked.path);
  if (cropped == null) return;

  final profileState = context.read<ProfileState>();
  profileState.setAvatarUploading(true);

  try {
    final bytes = await compressForUpload(cropped.path);
    final userId = supabase.auth.currentUser!.id;
    final path = buildUploadPath(userId: userId, extension: 'jpg');

    final storageRepo = context.read<StorageRepository>();
    final url = await storageRepo.uploadImageBytes(bucket: 'avatars', path: path, bytes: bytes);

    await supabase.from('profiles').update({'avatar_url': url}).eq('id', userId);

    profileState.updateCachedAvatarUrl(url); // instant UI update, no refetch needed
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not update avatar: \$e')),
      );
    }
  } finally {
    profileState.setAvatarUploading(false);
  }
}`,
          pitfalls: [
            '**Updating `profiles.avatar_url` before the upload actually succeeds.** A failed upload would leave the database pointing at a URL that does not exist. Fix: strict sequential order — database update only happens after a confirmed-successful upload.',
            '**Forcing a full profile refetch after every avatar change instead of updating the cached value locally.** Adds a visible delay for something that should feel instant. Fix: optimistically update the local cache with the known-correct new URL immediately after a successful database write.',
            '**Leaving old avatar files in Storage after replacing them, indefinitely.** Not incorrect, but does slowly consume the free tier\'s 1GB storage quota over many avatar changes. Fix: acceptable to leave for this course\'s scope; a production app might delete the previous avatar file after a successful replacement — a reasonable stretch extension.',
            '**Not showing any loading state on the avatar itself during upload.** The screen looks frozen or unresponsive for the several seconds an upload genuinely takes. Fix: a loading overlay directly on the avatar circle, as shown.',
          ],
          tryIt:
            'Run the complete flow on a real device end to end, then verify directly in the Supabase dashboard: the file appears in the `avatars` bucket under your user id\'s folder, and `profiles.avatar_url` for your row matches its public URL exactly.',
          takeaway: 'Strict order — upload succeeds first, database updates second, local UI updates optimistically third — is what keeps this flow correct under failure.',
        },
      ],
    },
    {
      id: 'm4-s4',
      title: 'Displaying media efficiently',
      topics: [
        {
          id: 'm4-t12',
          title: 'cached_network_image & shimmer placeholders',
          explain:
            '`CachedNetworkImage` stores downloaded images on disk and in memory so scrolling back up the feed never re-downloads a photo — paired with a `shimmer` skeleton while each image loads.',
          analogy:
            'A tea stall that keeps yesterday\'s used glasses rinsed and ready on a shelf, rather than washing a brand-new glass from scratch for every single repeat customer — caching saves you from redoing work you already did once. `CachedNetworkImage`\'s disk cache is that shelf of ready glasses.',
          theory:
            '`CachedNetworkImage(imageUrl: post.imageUrl, fit: BoxFit.cover, placeholder: (context, url) => const ShimmerBox(), errorWidget: (context, url, error) => const _BrokenImagePlaceholder())` handles the entire download-cache-display lifecycle: first request downloads and caches (memory + disk); every subsequent request for the same URL — scrolling back up the feed, revisiting a profile grid — serves instantly from cache with zero network call, directly reducing the bandwidth consumption from Module 4\'s free-tier topic.\n\n`shimmer`\'s `Shimmer.fromColors` wraps a plain grey box in an animated sheen, the same "skeleton loading" pattern used by virtually every modern app (LinkedIn, Instagram itself) — it communicates "content is coming" far more convincingly than a bare spinner for image-heavy layouts like a feed or a grid.',
          whyItMatters:
            'Every single image anywhere in LocalInsta — feed, grid, avatars, stories — should go through `CachedNetworkImage`, never a plain `Image.network`. This one substitution is simultaneously a UX improvement (instant re-display) and a direct cost-saving measure against the free tier\'s bandwidth ceiling.',
          steps: [
            'Build a small reusable `ShimmerBox` widget in `shared/widgets/` wrapping `Shimmer.fromColors` around a plain grey `Container`.',
            'Replace every `Image.network(...)` call site from earlier modules\' mockup code with `CachedNetworkImage`.',
            'Wire `placeholder` to `ShimmerBox` and `errorWidget` to a small "image unavailable" icon state.',
            'Scroll a feed of test posts down and back up, confirming (via a quick debug log or just visibly instant reloads) that revisited images load with no network delay.',
            'Test the error case by pointing one test post at a deliberately broken URL.',
          ],
          code: `class ShimmerBox extends StatelessWidget {
  const ShimmerBox({super.key});
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(color: Colors.white),
    );
  }
}

class PostImage extends StatelessWidget {
  const PostImage({super.key, required this.imageUrl});
  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        fit: BoxFit.cover,
        placeholder: (context, url) => const ShimmerBox(),
        errorWidget: (context, url, error) => Container(
          color: Colors.grey.shade200,
          child: const Icon(Icons.broken_image_outlined, color: Colors.grey),
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Using plain `Image.network` anywhere in the app "just for this one screen".** Re-downloads on every rebuild/scroll, no caching, no graceful error state — a silent performance and cost regression. Fix: `CachedNetworkImage` everywhere, no exceptions, for any remote image.',
            '**No `errorWidget`.** A broken or deleted image URL shows Flutter\'s default ugly red error box. Fix: always provide a branded, graceful fallback.',
            '**Not bounding the cache size, on an app with very heavy image usage over a long session.** `cached_network_image`\'s defaults are sensible for this course\'s scale; a very high-traffic production app might tune `CacheManager` settings — worth knowing this is configurable, not something to over-engineer here.',
            '**Wrapping every single small icon or local asset in `CachedNetworkImage` out of habit.** It is specifically for *remote* images; local assets use `Image.asset` and need no caching logic at all. Fix: reserve it for genuinely network-sourced images.',
          ],
          tryIt:
            'Build the full feed mockup from Module 0 again, this time with `CachedNetworkImage` and `ShimmerBox` instead of a plain `Image.network`, on a throttled/slow network profile (many emulators let you simulate this) — confirm the shimmer shows convincingly during the initial load and disappears instantly on a re-scroll.',
          takeaway: 'CachedNetworkImage plus a shimmer placeholder is the one substitution that improves UX and directly protects the free-tier bandwidth budget at the same time.',
        },
        {
          id: 'm4-t13',
          title: 'Thumbnail strategy: one compressed size, used everywhere',
          explain:
            'LocalInsta deliberately stores and serves one compressed 1080px image per post — no separate thumbnail generation pipeline — and explains exactly why that trade-off is the right one at this scale.',
          analogy:
            'A small neighbourhood print shop does not maintain five separate negative sizes for one photo — one good-quality print serves the album page, the frame, and the gift copy alike. Running multiple derived image sizes only earns its complexity at a much larger scale than a single free-tier project needs.',
          theory:
            'Larger platforms generate multiple derived sizes per upload (a tiny grid thumbnail, a medium feed size, a full-resolution detail view) via a server-side image-processing pipeline — genuinely valuable at massive scale, but real added complexity (extra Storage objects, extra processing, a Cloud/Edge Function to generate them) that is not justified for a free-tier learning project. LocalInsta\'s single compromise — one 1080px, quality-80 JPEG per post, from Module 4\'s compression topic, displayed via `BoxFit.cover` at whatever size a given screen needs (a 120px grid cell or a 400px feed card) — is a deliberate, reasoned simplification, not an oversight.\n\n`BoxFit.cover` combined with Flutter\'s own image caching (both the network cache from the previous topic and Flutter\'s internal decoded-image cache) means the same 1080px source image renders efficiently at multiple on-screen sizes without needing separate stored variants — Flutter downsamples for display without needing a second file.',
          whyItMatters:
            'Knowing *when a simpler architecture is correct*, not just when a more sophisticated one would technically be possible, is a real engineering judgment call — and being able to articulate this specific trade-off (one size vs. a multi-size pipeline) explicitly is a genuinely strong interview answer about scaling decisions.',
          steps: [
            'Confirm every image display call site (grid, feed, post detail, avatar) uses the exact same `imageUrl` — no separate thumbnail URL anywhere in the schema.',
            'Render the same post image in a 120px grid cell and a 400px feed card, confirming both look sharp thanks to the 1080px source.',
            'Write a short note in your project README explicitly stating this trade-off and why it was chosen — practice articulating it, not just implementing it.',
            'Identify, on paper, the point at which this decision would need revisiting (a real production app with many thousands of daily active users, where bandwidth costs from serving full-size images to tiny grid cells become significant) — you are not building that today, but knowing the boundary matters.',
          ],
          code: `-- No separate thumbnail_url column anywhere in the schema —
-- this is a deliberate absence, not a missing feature:

-- posts table (from Module 3) has exactly one media reference:
-- image_url text not null

-- A production-scale alternative (NOT built in this course, noted for context):
-- posts (
--   ...,
--   thumbnail_url text,   -- a separate, smaller derived image
--   full_url text          -- the original full-resolution image
-- )
-- generated by a Storage-triggered Edge Function on upload — real
-- complexity, genuinely worth it only well past this app's current scale.`,
          pitfalls: [
            '**Adding a thumbnail pipeline preemptively "because real apps have one".** Real engineering judgment is scaling complexity to actual need, not to what the biggest apps in the world eventually needed. Fix: one compressed size is the right choice for LocalInsta\'s actual scale; revisit only if real usage data justifies it.',
            '**Serving the same image at a much larger on-screen size than 1080px (e.g. a full-bleed hero banner) without adjusting the compression pipeline\'s target size for that specific use case.** Fix: if LocalInsta ever adds a use case genuinely needing higher resolution, that is a deliberate, separate decision — not a reason to abandon the single-size default everywhere else.',
            '**Not being able to explain *why* this decision was made if asked.** Fix: this is exactly why the README note in the steps above matters — a decision you cannot articulate is easy to mistake for an oversight later.',
            '**Assuming "no thumbnail pipeline" means no performance work was done at all.** Compression (this module) and caching (previous topic) are the two techniques that make the single-size approach viable — it is a considered trade-off, not an absence of optimization.',
          ],
          tryIt:
            'Write the README trade-off note described in the steps now, in your own words, as if explaining it to a teammate reviewing your architecture — this is genuinely good practice for articulating engineering decisions, not busywork.',
          takeaway: 'One well-compressed image size, reused everywhere via BoxFit.cover, is a deliberate, correctly-scoped trade-off — not a shortcut you forgot to fix.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Mini Project',
      title: 'The Avatar Upload Feature, Fully Wired',
      domain: 'Supabase Storage',
      duration: '2 hours',
      description:
        'Create both Storage buckets with correct folder-based RLS policies, then build the complete avatar upload flow — pick, crop, compress, upload, and update the profile — with a real loading state and error handling.',
      tools: ['Flutter', 'supabase_flutter', 'image_picker', 'image_cropper', 'flutter_image_compress'],
      blueprint: {
        overview:
          'Two public Storage buckets (avatars, posts) with folder-based ownership RLS policies; a StorageRepository wrapping uploadBinary and getPublicUrl; the full avatar upload pipeline (pick -> crop to square -> compress -> upload -> update profiles.avatar_url) with a loading overlay and graceful error handling.',
        functionalRequirements: [
          '**Buckets.** avatars and posts, both public, both RLS-policy-complete (public select, folder-owned insert/update/delete).',
          '**Pick + crop.** A camera-or-gallery bottom sheet, followed by a locked 1:1 crop.',
          '**Compress.** Resize to ~1080px, quality 80 JPEG, with a visible before/after size log.',
          '**Upload.** uploadBinary with upsert:false, contentType set, wrapped in error handling.',
          '**Profile update.** avatar_url updated only after a confirmed-successful upload, with an optimistic local UI update.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0004_storage_buckets_and_policies.sql.** Bucket creation + every storage.objects RLS policy from this module.',
          '**lib/core/storage_paths.dart.** buildUploadPath helper using the uuid package.',
          '**lib/features/profile/data/storage_repository.dart.** uploadImageBytes wrapping Storage upload + getPublicUrl.',
          '**lib/features/auth or profile/presentation.** The full pick -> crop -> compress -> upload -> update chain wired to a tappable avatar widget.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Buckets + Storage RLS migration',
            outcome: 'Both buckets exist with a complete, tested policy set.',
            prompt:
              'Write supabase/migrations/0004_storage_buckets_and_policies.sql creating public avatars and posts buckets via insert into storage.buckets, then RLS policies on storage.objects: public select on both buckets, and insert/update/delete policies scoped per bucket requiring (storage.foldername(name))[1] = auth.uid()::text. Include a verification block showing an impersonation test that a cross-user upload path is rejected.',
          },
          {
            step: 2,
            label: 'Pick, crop, compress pipeline',
            outcome: 'A reusable pipeline from tap to compressed bytes.',
            prompt:
              'Create lib/shared/media/pick_and_prepare_image.dart with pickPostImage (camera-or-gallery bottom sheet using image_picker, treating cancellation as a silent no-op), cropToSquare (image_cropper locked to a 1:1 aspect ratio with lockAspectRatio true), and compressForUpload (flutter_image_compress at quality 80, minWidth/minHeight 1080, falling back to the uncompressed bytes if compression returns null). Log before/after sizes in debug mode.',
          },
          {
            step: 3,
            label: 'StorageRepository + upload path helper',
            outcome: 'A tested upload-to-public-URL method.',
            prompt:
              'Create lib/core/storage_paths.dart with buildUploadPath({userId, extension}) using the uuid package. Create lib/features/profile/data/storage_repository.dart with an uploadImageBytes({bucket, path, bytes}) method calling supabase.storage.from(bucket).uploadBinary with upsert:false and contentType image/jpeg, catching StorageException, and returning getPublicUrl(path) on success.',
          },
          {
            step: 4,
            label: 'Full avatar upload flow with loading state',
            outcome: 'A working, testable "tap avatar to change it" feature.',
            prompt:
              'Wire an updateAvatar(context) function on the profile screen chaining pickPostImage -> cropToSquare -> compressForUpload -> StorageRepository.uploadImageBytes(bucket: "avatars") -> supabase.from("profiles").update({"avatar_url": url}).eq("id", userId), in that strict order (database only updates after a confirmed successful upload). Show a loading overlay on the avatar circle during upload and update ProfileState\'s cached avatar_url optimistically on success, without a full refetch. Show a SnackBar with the real error on any failure.',
          },
        ],
        deliverable:
          'A LocalInsta build where tapping your own avatar lets you take or pick a photo, crop it to a square, and see it appear as your new avatar within a few seconds — verified by checking the Storage dashboard shows the file under your own user-id folder and profiles.avatar_url matches.',
      },
    },
    {
      id: 'm4-p2',
      type: 'Project',
      title: 'Efficient Media Display Across the App',
      domain: 'Performance / Caching',
      duration: '1.5 hours',
      description:
        'Replace every remote image call site with CachedNetworkImage and shimmer placeholders, and document LocalInsta\'s single-size thumbnail trade-off as a deliberate architectural decision.',
      tools: ['Flutter', 'cached_network_image', 'shimmer'],
      blueprint: {
        overview:
          'A shared PostImage/AvatarImage widget set built on CachedNetworkImage with shimmer placeholders and a graceful broken-image fallback, applied consistently everywhere LocalInsta shows a remote image, plus a documented note explaining the deliberate single-compressed-size media strategy.',
        functionalRequirements: [
          '**Shared widgets.** A reusable ShimmerBox and image display widgets used by every screen, not ad hoc per-screen Image.network calls.',
          '**Graceful errors.** A broken or missing image URL shows a branded fallback icon, never Flutter\'s default red error box.',
          '**Verified caching.** Scrolling away and back to a previously-loaded image shows no visible reload delay.',
          '**Documented trade-off.** A README section explaining why LocalInsta uses one compressed image size rather than a multi-size thumbnail pipeline.',
        ],
        technicalImplementation: [
          '**lib/shared/widgets/shimmer_box.dart.** Reusable shimmer skeleton.',
          '**lib/shared/widgets/post_image.dart / avatar_image.dart.** CachedNetworkImage wrappers with placeholder/errorWidget wired.',
          '**Audit pass.** Every existing Image.network call site from earlier module mockups replaced.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Shared shimmer + image widgets',
            outcome: 'Reusable, consistent image display components.',
            prompt:
              'Create lib/shared/widgets/shimmer_box.dart wrapping Shimmer.fromColors around a plain container. Create lib/shared/widgets/post_image.dart (AspectRatio 1:1, CachedNetworkImage, BoxFit.cover) and avatar_image.dart (CircleAvatar-shaped, CachedNetworkImage), both using ShimmerBox as the placeholder and a grey broken-image icon as the errorWidget.',
          },
          {
            step: 2,
            label: 'Replace every remote image call site',
            outcome: 'Zero raw Image.network calls left anywhere in the app.',
            prompt:
              'Search the codebase for every Image.network usage (including any leftover from earlier module mockups) and replace each with the appropriate shared PostImage or AvatarImage widget. Confirm none were missed by grepping for "Image.network" and finding zero remaining matches.',
          },
          {
            step: 3,
            label: 'Document the single-size media strategy',
            outcome: 'A clear, honest architecture note in the README.',
            prompt:
              'Add a "Media strategy" section to the README explaining that LocalInsta stores one compressed ~1080px quality-80 JPEG per post (no separate thumbnail/full-size pipeline), why this is the correct trade-off at this scale (avoiding Edge Function complexity and extra Storage objects for a free-tier learning project), and what usage level would justify revisiting it.',
          },
        ],
        deliverable:
          'Every image anywhere in LocalInsta loads through CachedNetworkImage with a shimmer placeholder and a graceful error state, verified by an instant reload on re-scroll, plus a README section that clearly explains the deliberate media-sizing trade-off.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Why does LocalInsta use two separate public Storage buckets (avatars, posts) instead of one shared bucket?',
      options: [
        'It keeps policies and organization clearer per content type, even though both could technically share a bucket',
        'Supabase requires a separate bucket for every table',
        'Public buckets are limited to one file each',
        'It reduces the free-tier storage quota needed',
      ],
      answer: 0,
    },
    {
      id: 'm4-q2',
      q: 'What does the Storage RLS insert policy check via `(storage.foldername(name))[1] = auth.uid()::text`?',
      options: [
        'That the first folder segment of the upload path matches the uploading user\'s own id',
        'That the filename contains the word "auth"',
        'That the file is under 1GB',
        'That the bucket is set to public',
      ],
      answer: 0,
    },
    {
      id: 'm4-q3',
      q: 'Why does LocalInsta use plain public URLs instead of Supabase\'s signed URLs for post images?',
      options: [
        'The content is genuinely meant to be public, so a permanent URL is simpler with no expiry to manage',
        'Signed URLs are not supported by Supabase Storage',
        'Public URLs are more secure than signed URLs',
        'Signed URLs cannot be generated for images',
      ],
      answer: 0,
    },
    {
      id: 'm4-q4',
      q: 'Why does LocalInsta compress and resize images to ~1080px/quality 80 before uploading?',
      options: [
        'It meaningfully stretches the free tier\'s storage and bandwidth quotas with little to no visible quality loss',
        'Supabase rejects any image larger than 1080px',
        'It makes the crop step unnecessary',
        'It is required for Row Level Security to work',
      ],
      answer: 0,
    },
    {
      id: 'm4-q5',
      q: 'Why does the avatar upload flow update `profiles.avatar_url` only AFTER the Storage upload succeeds, never before?',
      options: [
        'To avoid the database pointing at a URL for a file that might not actually exist if the upload failed',
        'Because RLS blocks updating avatar_url before an upload',
        'Because Supabase requires uploads and database writes in a single call',
        'It has no real effect on correctness, only style',
      ],
      answer: 0,
    },
    {
      id: 'm4-q6',
      q: 'Why does LocalInsta deliberately store and serve just one compressed image size per post instead of building a multi-size thumbnail pipeline?',
      options: [
        'A multi-size pipeline adds real complexity that is not justified at this app\'s current scale — a considered trade-off, not an oversight',
        'Flutter cannot display an image at more than one size',
        'Supabase Storage does not support multiple files per post',
        'Multi-size pipelines are only possible with a paid plan',
      ],
      answer: 0,
    },
  ],
}
