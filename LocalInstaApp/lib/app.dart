import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme.dart';
import 'core/theme_state.dart';
import 'features/auth/presentation/auth_gate.dart';

class LocalInstaApp extends StatelessWidget {
  const LocalInstaApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeState = context.watch<ThemeState>();
    return MaterialApp(
      title: 'LocalInsta',
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: themeState.mode,
      home: const AuthGate(),
    );
  }
}
