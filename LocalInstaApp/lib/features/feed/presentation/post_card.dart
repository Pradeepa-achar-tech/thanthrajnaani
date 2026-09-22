import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../shared/widgets/avatar_image.dart';
import '../../../shared/widgets/post_image.dart';
import '../../profile/presentation/profile_screen.dart';
import '../data/post.dart';
import '../state/feed_state.dart';
import 'double_tap_like_overlay.dart';
import 'post_detail_screen.dart';

void openProfile(BuildContext context, String userId) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => ProfileScreen(userId: userId)));
}

class PostCard extends StatelessWidget {
  const PostCard({super.key, required this.post});
  final Post post;

  @override
  Widget build(BuildContext context) {
    final feedState = context.watch<FeedState>();
    final isLiked = feedState.isLikedOptimistic(post.id);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: GestureDetector(
              onTap: () => openProfile(context, post.userId),
              child: Row(
                children: [
                  AvatarImage(url: post.author.avatarUrl, radius: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      post.author.username,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
          DoubleTapLikeOverlay(
            isLiked: isLiked,
            onLike: () => context.read<FeedState>().toggleLike(post.id),
            child: GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
              ),
              child: PostImage(imageUrl: post.imageUrl),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Row(
              children: [
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: Icon(isLiked ? Icons.favorite : Icons.favorite_border,
                      color: isLiked ? Colors.red : null),
                  onPressed: () => context.read<FeedState>().toggleLike(post.id),
                ),
                const SizedBox(width: 8),
                IconButton(
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  icon: const Icon(Icons.mode_comment_outlined),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
                  ),
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
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
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
          if (post.commentCount > 0)
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
              child: GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PostDetailScreen(postId: post.id)),
                ),
                child: Text('View all ${post.commentCount} comments',
                    style: TextStyle(color: Colors.grey.shade600)),
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
            child: Text(
              timeago.format(post.createdAt),
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
            ),
          ),
        ],
      ),
    );
  }
}
