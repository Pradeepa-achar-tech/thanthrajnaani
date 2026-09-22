import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'app.dart';
import 'core/env.dart';
import 'core/theme_state.dart';
import 'core/storage_repository.dart';
import 'features/auth/data/auth_repository.dart';
import 'features/auth/state/session_state.dart';
import 'features/feed/data/posts_repository.dart';
import 'features/feed/state/create_post_state.dart';
import 'features/feed/state/feed_state.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Env.assertConfigured();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    publishableKey: Env.supabaseAnonKey,
  );

  runApp(
    MultiProvider(
      providers: [
        Provider<AuthRepository>(create: (_) => AuthRepository()),
        ChangeNotifierProvider<SessionState>(
          create: (ctx) => SessionState(ctx.read<AuthRepository>()),
        ),
        ChangeNotifierProvider<ThemeState>(create: (_) => ThemeState()),
        Provider<PostsRepository>(create: (_) => PostsRepository()),
        Provider<StorageRepository>(create: (_) => StorageRepository()),
        ChangeNotifierProvider<FeedState>(
          create: (ctx) => FeedState(ctx.read<PostsRepository>()),
        ),
        ChangeNotifierProvider<CreatePostState>(
          create: (ctx) => CreatePostState(
            ctx.read<StorageRepository>(),
            ctx.read<PostsRepository>(),
            ctx.read<FeedState>(),
          ),
        ),
      ],
      child: const LocalInstaApp(),
    ),
  );
}
