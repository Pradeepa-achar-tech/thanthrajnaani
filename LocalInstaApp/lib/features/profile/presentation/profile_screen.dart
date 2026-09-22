import 'package:flutter/material.dart';
import '../../../core/supabase_client.dart';
import '../../../shared/widgets/avatar_image.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/post_image.dart';
import '../../auth/data/auth_repository.dart';
import '../../feed/data/post.dart';
import '../../feed/data/posts_repository.dart';
import '../../feed/presentation/post_detail_screen.dart';
import '../data/follow_repository.dart';
import '../data/profile.dart';
import '../data/profile_repository.dart';
import 'edit_profile_screen.dart';
import 'follow_button.dart';
import 'follow_list_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, required this.userId});
  final String userId;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _profileRepo = ProfileRepository();
  final _followRepo = FollowRepository();
  final _postsRepo = PostsRepository();

  Profile? _profile;
  List<Post> _posts = [];
  bool _isFollowing = false;
  bool _loading = true;

  bool get isOwnProfile => widget.userId == supabase.auth.currentUser?.id;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final profile = await _profileRepo.fetchProfile(widget.userId);
    final posts = await _postsRepo.fetchPostsByUser(widget.userId);
    bool following = false;
    if (!isOwnProfile) {
      following = await _followRepo.isFollowing(widget.userId);
    }
    if (!mounted) return;
    setState(() {
      _profile = profile;
      _posts = posts;
      _isFollowing = following;
      _loading = false;
    });
  }

  Future<void> _confirmSignOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign out?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Sign out')),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await AuthRepository().signOut();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_profile == null) {
      return const Scaffold(body: Center(child: Text('Profile not found')));
    }

    final profile = _profile!;

    return Scaffold(
      appBar: AppBar(
        title: Text(profile.username),
        actions: [
          if (isOwnProfile)
            IconButton(icon: const Icon(Icons.logout), onPressed: _confirmSignOut),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      AvatarImage(url: profile.avatarUrl, radius: 36),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _StatColumn(label: 'Posts', value: profile.postCount),
                            _StatColumn(
                              label: 'Followers',
                              value: profile.followerCount,
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => FollowListScreen(
                                      userId: widget.userId, mode: FollowListMode.followers),
                                ),
                              ),
                            ),
                            _StatColumn(
                              label: 'Following',
                              value: profile.followingCount,
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => FollowListScreen(
                                      userId: widget.userId, mode: FollowListMode.following),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(profile.fullName ?? profile.username, style: const TextStyle(fontWeight: FontWeight.w600)),
                  if (profile.bio != null && profile.bio!.isNotEmpty) Text(profile.bio!),
                  const SizedBox(height: 12),
                  if (isOwnProfile)
                    OutlinedButton(
                      onPressed: () async {
                        final changed = await Navigator.push<bool>(
                          context,
                          MaterialPageRoute(builder: (_) => EditProfileScreen(profile: profile)),
                        );
                        if (changed == true) _load();
                      },
                      child: const Text('Edit Profile'),
                    )
                  else
                    FollowButton(targetUserId: widget.userId, initiallyFollowing: _isFollowing),
                ],
              ),
            ),
            const Divider(height: 1),
            const SizedBox(height: 2),
            if (_posts.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 24),
                child: EmptyState(icon: Icons.grid_on, title: 'No posts yet'),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(2),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 2,
                  mainAxisSpacing: 2,
                ),
                itemCount: _posts.length,
                itemBuilder: (context, i) => GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => PostDetailScreen(postId: _posts[i].id)),
                  ),
                  child: PostImage(imageUrl: _posts[i].imageUrl),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _StatColumn extends StatelessWidget {
  const _StatColumn({required this.label, required this.value, this.onTap});
  final String label;
  final int value;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Text('$value', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
        ],
      ),
    );
  }
}
