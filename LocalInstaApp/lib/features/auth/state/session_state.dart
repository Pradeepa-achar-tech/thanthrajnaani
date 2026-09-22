import 'dart:async';
import 'package:flutter/foundation.dart';
import '../data/auth_repository.dart';

/// The three real states of a session — the compiler can enforce that
/// every consumer handles all three via an exhaustive switch.
sealed class AuthSession {
  const AuthSession();
}

class AuthLoading extends AuthSession {
  const AuthLoading();
}

class AuthSignedIn extends AuthSession {
  const AuthSignedIn(this.userId);
  final String userId;
}

class AuthSignedOut extends AuthSession {
  const AuthSignedOut();
}

class SessionState extends ChangeNotifier {
  SessionState(this._authRepository) {
    _sub = _authRepository.onAuthStateChange.listen((event) {
      final user = event.session?.user;
      _session = user == null ? const AuthSignedOut() : AuthSignedIn(user.id);
      notifyListeners();
    });
  }

  final AuthRepository _authRepository;
  late final StreamSubscription _sub;
  AuthSession _session = const AuthLoading();

  AuthSession get session => _session;

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}
