import 'package:flutter/material.dart';
import '../data/follow_repository.dart';

class FollowButton extends StatefulWidget {
  const FollowButton({super.key, required this.targetUserId, required this.initiallyFollowing});
  final String targetUserId;
  final bool initiallyFollowing;
  @override
  State<FollowButton> createState() => _FollowButtonState();
}

class _FollowButtonState extends State<FollowButton> {
  late bool _isFollowing = widget.initiallyFollowing;
  final _repo = FollowRepository();

  Future<void> _toggle() async {
    final wasFollowing = _isFollowing;
    setState(() => _isFollowing = !wasFollowing);

    try {
      if (wasFollowing) {
        await _repo.unfollow(widget.targetUserId);
      } else {
        await _repo.follow(widget.targetUserId);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isFollowing = wasFollowing);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not update follow status — try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: _isFollowing
          ? OutlinedButton(onPressed: _toggle, child: const Text('Following'))
          : FilledButton(onPressed: _toggle, child: const Text('Follow')),
    );
  }
}
