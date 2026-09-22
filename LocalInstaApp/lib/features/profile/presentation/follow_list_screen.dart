import 'package:flutter/material.dart';
import '../../../core/supabase_client.dart';
import '../../../shared/widgets/avatar_image.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../feed/presentation/post_card.dart' show openProfile;
import '../data/follow_repository.dart';
import '../data/profile.dart';
import 'follow_button.dart';

enum FollowListMode { followers, following }

class FollowListScreen extends StatefulWidget {
  const FollowListScreen({super.key, required this.userId, required this.mode});
  final String userId;
  final FollowListMode mode;

  @override
  State<FollowListScreen> createState() => _FollowListScreenState();
}

class _FollowListScreenState extends State<FollowListScreen> {
  final _repo = FollowRepository();
  List<Profile> _profiles = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final profiles = widget.mode == FollowListMode.followers
        ? await _repo.fetchFollowers(widget.userId)
        : await _repo.fetchFollowing(widget.userId);
    if (!mounted) return;
    setState(() {
      _profiles = profiles;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.mode == FollowListMode.followers ? 'Followers' : 'Following';
    final currentUserId = supabase.auth.currentUser?.id;

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _profiles.isEmpty
              ? EmptyState(
                  icon: Icons.people_outline,
                  title: widget.mode == FollowListMode.followers
                      ? 'No followers yet'
                      : 'Not following anyone yet',
                )
              : ListView.builder(
                  itemCount: _profiles.length,
                  itemBuilder: (context, i) {
                    final p = _profiles[i];
                    return ListTile(
                      leading: AvatarImage(url: p.avatarUrl, radius: 20),
                      title: Text(p.username),
                      subtitle: p.bio != null ? Text(p.bio!, maxLines: 1, overflow: TextOverflow.ellipsis) : null,
                      onTap: () => openProfile(context, p.id),
                      trailing: p.id == currentUserId
                          ? null
                          : SizedBox(
                              width: 110,
                              child: FollowButton(targetUserId: p.id, initiallyFollowing: false),
                            ),
                    );
                  },
                ),
    );
  }
}
