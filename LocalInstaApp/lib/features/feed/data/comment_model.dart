import 'post.dart';

class CommentModel {
  const CommentModel({
    required this.id,
    required this.body,
    required this.createdAt,
    required this.author,
  });
  final String id;
  final String body;
  final DateTime createdAt;
  final PostAuthor author;

  factory CommentModel.fromMap(Map<String, dynamic> map) => CommentModel(
        id: map['id'] as String,
        body: map['body'] as String,
        createdAt: DateTime.parse(map['created_at'] as String),
        author: map['profiles'] != null
            ? PostAuthor.fromMap(map['profiles'] as Map<String, dynamic>)
            : const PostAuthor(id: '', username: 'unknown'),
      );
}
