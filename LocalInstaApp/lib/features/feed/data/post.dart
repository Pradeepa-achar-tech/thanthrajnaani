class PostAuthor {
  const PostAuthor({required this.id, required this.username, this.avatarUrl});
  final String id;
  final String username;
  final String? avatarUrl;

  factory PostAuthor.fromMap(Map<String, dynamic> map) => PostAuthor(
        id: map['id'] as String? ?? '',
        username: map['username'] as String? ?? 'unknown',
        avatarUrl: map['avatar_url'] as String?,
      );
}

class Post {
  const Post({
    required this.id,
    required this.userId,
    required this.imageUrl,
    required this.likeCount,
    required this.commentCount,
    required this.createdAt,
    required this.author,
    this.caption,
  });

  final String id;
  final String userId;
  final String imageUrl;
  final String? caption;
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;
  final PostAuthor author;

  Post copyWith({int? likeCount, int? commentCount}) => Post(
        id: id,
        userId: userId,
        imageUrl: imageUrl,
        caption: caption,
        likeCount: likeCount ?? this.likeCount,
        commentCount: commentCount ?? this.commentCount,
        createdAt: createdAt,
        author: author,
      );

  factory Post.fromMap(Map<String, dynamic> map) => Post(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        imageUrl: map['image_url'] as String,
        caption: map['caption'] as String?,
        likeCount: map['like_count'] as int? ?? 0,
        commentCount: map['comment_count'] as int? ?? 0,
        createdAt: DateTime.parse(map['created_at'] as String),
        author: map['profiles'] != null
            ? PostAuthor.fromMap(map['profiles'] as Map<String, dynamic>)
            : const PostAuthor(id: '', username: 'unknown'),
      );
}
