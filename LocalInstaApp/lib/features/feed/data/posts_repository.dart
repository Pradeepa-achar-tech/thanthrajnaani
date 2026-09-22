import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/supabase_client.dart';
import 'post.dart';
import 'comment_model.dart';

class PostsRepository {
  PostsRepository({SupabaseClient? client}) : _client = client ?? supabase;
  final SupabaseClient _client;

  static const pageSize = 20;

  Future<List<Post>> fetchFeedPage(int page) async {
    final from = page * pageSize;
    final to = from + pageSize - 1;
    final rows = await _client
        .from('posts')
        .select('*, profiles(id, username, avatar_url)')
        .order('created_at', ascending: false)
        .range(from, to);
    return (rows as List).map((r) => Post.fromMap(r as Map<String, dynamic>)).toList();
  }

  Future<List<Post>> fetchPostsByUser(String userId) async {
    final rows = await _client
        .from('posts')
        .select('*, profiles(id, username, avatar_url)')
        .eq('user_id', userId)
        .order('created_at', ascending: false);
    return (rows as List).map((r) => Post.fromMap(r as Map<String, dynamic>)).toList();
  }

  Future<Post> fetchPostById(String postId) async {
    final row = await _client
        .from('posts')
        .select('*, profiles(id, username, avatar_url)')
        .eq('id', postId)
        .single();
    return Post.fromMap(row);
  }

  Future<Post> createPost({required String imageUrl, String? caption}) async {
    final userId = _client.auth.currentUser!.id;
    final row = await _client
        .from('posts')
        .insert({
          'user_id': userId,
          'image_url': imageUrl,
          'caption': caption,
        })
        .select('*, profiles(id, username, avatar_url)')
        .single();
    return Post.fromMap(row);
  }

  Future<void> deletePost(String postId) async {
    await _client.from('posts').delete().eq('id', postId);
  }

  Future<bool> toggleLike(String postId) async {
    final result = await _client.rpc('toggle_like', params: {'post_id_input': postId});
    return result as bool;
  }

  Future<bool> isLikedByMe(String postId) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return false;
    final row = await _client
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();
    return row != null;
  }

  Future<List<CommentModel>> fetchComments(String postId) async {
    final rows = await _client
        .from('comments')
        .select('*, profiles(id, username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at');
    return (rows as List).map((r) => CommentModel.fromMap(r as Map<String, dynamic>)).toList();
  }

  Future<CommentModel> postComment(String postId, String body) async {
    final userId = _client.auth.currentUser!.id;
    final row = await _client
        .from('comments')
        .insert({'post_id': postId, 'user_id': userId, 'body': body})
        .select('*, profiles(id, username, avatar_url)')
        .single();
    return CommentModel.fromMap(row);
  }

  Future<void> deleteComment(String commentId) async {
    await _client.from('comments').delete().eq('id', commentId);
  }
}
