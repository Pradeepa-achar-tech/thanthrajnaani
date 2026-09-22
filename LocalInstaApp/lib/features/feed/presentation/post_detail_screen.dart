import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/supabase_client.dart';
import '../../../shared/widgets/avatar_image.dart';
import '../../../shared/widgets/post_image.dart';
import '../data/comment_model.dart';
import '../data/post.dart';
import '../data/posts_repository.dart';
import '../state/feed_state.dart';
import 'double_tap_like_overlay.dart';

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key, required this.postId});
  final String postId;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  final _repo = PostsRepository();
  final _commentController = TextEditingController();
  Post? _post;
  List<CommentModel> _comments = [];
  bool _loading = true;
  String? _error;
  bool _posting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final post = await _repo.fetchPostById(widget.postId);
      final comments = await _repo.fetchComments(widget.postId);
      final liked = await _repo.isLikedByMe(widget.postId);
      if (!mounted) return;
      context.read<FeedState>().markKnownLiked(widget.postId, liked);
      setState(() {
        _post = post;
        _comments = comments;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load this post: $e';
        _loading = false;
      });
    }
  }

  Future<void> _postComment() async {
    final body = _commentController.text.trim();
    if (body.isEmpty) return;
    setState(() => _posting = true);
    try {
      final comment = await _repo.postComment(widget.postId, body);
      if (!mounted) return;
      setState(() {
        _comments = [..._comments, comment];
        _commentController.clear();
        if (_post != null) _post = _post!.copyWith(commentCount: _post!.commentCount + 1);
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not post comment: $e')));
    } finally {
      if (mounted) setState(() => _posting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_error != null || _post == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text(_error ?? 'Post not found')),
      );
    }

    final post = _post!;
    final feedState = context.watch<FeedState>();
    final isLiked = feedState.isLikedOptimistic(post.id);
    final currentUserId = supabase.auth.currentUser?.id;

    return Scaffold(
      appBar: AppBar(title: const Text('Post')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  child: Row(
                    children: [
                      AvatarImage(url: post.author.avatarUrl, radius: 16),
                      const SizedBox(width: 8),
                      Text(post.author.username, style: const TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                DoubleTapLikeOverlay(
                  isLiked: isLiked,
                  onLike: () => context.read<FeedState>().toggleLike(post.id),
                  child: PostImage(imageUrl: post.imageUrl),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(isLiked ? Icons.favorite : Icons.favorite_border,
                            color: isLiked ? Colors.red : null),
                        onPressed: () => context.read<FeedState>().toggleLike(post.id),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('${post.likeCount} likes', style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                if (post.caption != null && post.caption!.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
                    child: RichText(
                      text: TextSpan(
                        style: DefaultTextStyle.of(context).style,
                        children: [
                          TextSpan(text: '${post.author.username} ', style: const TextStyle(fontWeight: FontWeight.w600)),
                          TextSpan(text: post.caption),
                        ],
                      ),
                    ),
                  ),
                const Divider(height: 24),
                if (_comments.isEmpty)
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text('No comments yet — be the first!', style: TextStyle(color: Colors.grey.shade600)),
                  )
                else
                  ..._comments.map((c) => ListTile(
                        leading: AvatarImage(url: c.author.avatarUrl, radius: 16),
                        title: RichText(
                          text: TextSpan(
                            style: DefaultTextStyle.of(context).style,
                            children: [
                              TextSpan(text: '${c.author.username} ', style: const TextStyle(fontWeight: FontWeight.bold)),
                              TextSpan(text: c.body),
                            ],
                          ),
                        ),
                        subtitle: Text(timeago.format(c.createdAt), style: const TextStyle(fontSize: 11)),
                        trailing: c.author.id == currentUserId
                            ? IconButton(
                                icon: const Icon(Icons.delete_outline, size: 18),
                                onPressed: () async {
                                  await _repo.deleteComment(c.id);
                                  setState(() {
                                    _comments = _comments.where((x) => x.id != c.id).toList();
                                  });
                                },
                              )
                            : null,
                      )),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: const InputDecoration(hintText: 'Add a comment...'),
                    ),
                  ),
                  IconButton(
                    icon: _posting
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send),
                    onPressed: _posting ? null : _postComment,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
