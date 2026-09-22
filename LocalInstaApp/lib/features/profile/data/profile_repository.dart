import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/supabase_client.dart';
import 'profile.dart';

class ProfileRepository {
  ProfileRepository({SupabaseClient? client}) : _client = client ?? supabase;
  final SupabaseClient _client;

  Future<Profile> fetchProfile(String userId) async {
    final row = await _client.from('profiles').select().eq('id', userId).single();
    return Profile.fromMap(row);
  }

  Future<void> updateProfile({
    required String userId,
    required String username,
    String? bio,
    String? fullName,
  }) async {
    try {
      await _client.from('profiles').update({
        'username': username,
        'bio': bio,
        'full_name': fullName,
      }).eq('id', userId);
    } on PostgrestException catch (e) {
      if (e.code == '23505') {
        throw Exception('That username is already taken — try another.');
      }
      rethrow;
    }
  }

  Future<void> updateAvatarUrl(String userId, String avatarUrl) async {
    await _client.from('profiles').update({'avatar_url': avatarUrl}).eq('id', userId);
  }

  Future<List<Profile>> searchProfiles(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return [];
    final rows = await _client
        .from('profiles')
        .select()
        .or('username.ilike.%$trimmed%,full_name.ilike.%$trimmed%')
        .limit(20);
    return (rows as List).map((r) => Profile.fromMap(r as Map<String, dynamic>)).toList();
  }
}
