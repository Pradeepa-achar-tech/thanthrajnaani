class Profile {
  const Profile({
    required this.id,
    required this.username,
    this.fullName,
    this.bio,
    this.avatarUrl,
    this.followerCount = 0,
    this.followingCount = 0,
    this.postCount = 0,
  });

  final String id;
  final String username;
  final String? fullName;
  final String? bio;
  final String? avatarUrl;
  final int followerCount;
  final int followingCount;
  final int postCount;

  factory Profile.fromMap(Map<String, dynamic> map) => Profile(
        id: map['id'] as String,
        username: map['username'] as String,
        fullName: map['full_name'] as String?,
        bio: map['bio'] as String?,
        avatarUrl: map['avatar_url'] as String?,
        followerCount: map['follower_count'] as int? ?? 0,
        followingCount: map['following_count'] as int? ?? 0,
        postCount: map['post_count'] as int? ?? 0,
      );
}
