import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../home/home_scaffold.dart';
import '../state/session_state.dart';
import 'sign_in_screen.dart';

/// The single receptionist at the front door — every other screen in the
/// app can assume a signed-in user, because this is the only place that
/// ever checks.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionState>().session;

    return switch (session) {
      AuthLoading() => const _SplashScreen(),
      AuthSignedOut() => const SignInScreen(),
      AuthSignedIn() => const HomeScaffold(),
    };
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
