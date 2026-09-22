# Rebuilds the signed release APKs against the real LocalInsta Supabase backend.
# The anon/publishable key below is safe to keep in the repo — it is the public
# client key, meant to be embedded in apps, and is constrained by Row Level
# Security. Never put the service_role/secret key or DB password here.

flutter build apk --release --split-per-abi `
  --dart-define=SUPABASE_URL=https://snpwtgrxbgpfmxmprkah.supabase.co `
  --dart-define=SUPABASE_ANON_KEY=sb_publishable_b0l8VMqVXR0BdfBZ_WPj_A_Y1UFIJ6s

Write-Host ""
Write-Host "APKs written to build\app\outputs\flutter-apk\"
