import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/supabase_client.dart';
import 'profile.dart';

class FollowRepository {
  FollowRepository({SupabaseClient? client}) : _client = client ?? supabase;
  final SupabaseClient _client;

  Future<void> follow(String targetUserId) async {
    final currentUserId = _client.auth.currentUser!.id;
    try {
      await _client.from('follows').insert({
        'follower_id': currentUserId,
        'following_id': targetUserId,
      });
    } on PostgrestException catch (e) {
      if (e.code == '23505') return; // already following
      rethrow;
    }
  }

  Future<void> unfollow(String targetUserId) async {
    final currentUserId = _client.auth.currentUser!.id;
    await _client
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
  }

  Future<bool> isFollowing(String targetUserId) async {
    final currentUserId = _client.auth.currentUser?.id;
    if (currentUserId == null) return false;
    final row = await _client
        .from('follows')
        .select()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();
    return row != null;
  }

  Future<List<Profile>> fetchFollowers(String userId) async {
    final rows = await _client
        .from('follows')
        .select('profiles!follows_follower_id_fkey(id, username, avatar_url, bio, follower_count, following_count, post_count)')
        .eq('following_id', userId);
    return (rows as List)
        .map((r) => Profile.fromMap(r['profiles'] as Map<String, dynamic>))
        .toList();
  }

  Future<List<Profile>> fetchFollowing(String userId) async {
    final rows = await _client
        .from('follows')
        .select('profiles!follows_following_id_fkey(id, username, avatar_url, bio, follower_count, following_count, post_count)')
        .eq('follower_id', userId);
    return (rows as List)
        .map((r) => Profile.fromMap(r['profiles'] as Map<String, dynamic>))
        .toList();
  }
}
