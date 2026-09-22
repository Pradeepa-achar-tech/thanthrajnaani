import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared Supabase client — every repository in the app reads from this
/// single instance instead of constructing its own.
final supabase = Supabase.instance.client;
