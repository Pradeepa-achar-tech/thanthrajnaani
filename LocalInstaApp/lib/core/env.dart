/// Compile-time configuration — values are supplied via `--dart-define` at
/// build/run time and never hardcoded here. See README.md for the exact
/// command to run this app against your own free Supabase project.
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static bool get isConfigured => supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static void assertConfigured() {
    if (!isConfigured) {
      throw StateError(
        'Missing --dart-define SUPABASE_URL / SUPABASE_ANON_KEY.\n'
        'Run with:\n'
        '  flutter run --dart-define=SUPABASE_URL=https://your-ref.supabase.co '
        '--dart-define=SUPABASE_ANON_KEY=your-anon-key\n'
        'See README.md for how to create a free Supabase project (no card required).',
      );
    }
  }
}
