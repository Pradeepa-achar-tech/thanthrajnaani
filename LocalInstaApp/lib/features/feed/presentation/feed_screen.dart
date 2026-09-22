import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/supabase_client.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../profile/presentation/profile_screen.dart';
import '../state/feed_state.dart';
import 'create_post_screen.dart';
import 'post_card.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});
  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_maybeLoadMore);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FeedState>().loadFirstPage();
    });
  }

  void _maybeLoadMore() {
    if (!_scrollController.hasClients) return;
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 400) {
      context.read<FeedState>().loadMore();
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final feedState = context.watch<FeedState>();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.add_box_outlined),
          tooltip: 'New post',
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreatePostScreen())),
        ),
        title: Image.asset('assets/icon/logo-banner.png', height: 40, fit: BoxFit.contain),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            tooltip: 'Profile',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ProfileScreen(userId: supabase.auth.currentUser!.id)),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<FeedState>().refresh(),
        child: Builder(builder: (context) {
          if (feedState.isLoading && feedState.posts.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }
          if (feedState.error != null && feedState.posts.isEmpty) {
            return ErrorState(
              message: feedState.error!,
              onRetry: () => context.read<FeedState>().loadFirstPage(),
            );
          }
          if (feedState.posts.isEmpty) {
            return ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 120),
                EmptyState(
                  icon: Icons.photo_camera_outlined,
                  title: 'No posts yet',
                  subtitle: 'Be the first to share something!',
                ),
              ],
            );
          }
          return ListView.builder(
            controller: _scrollController,
            physics: const AlwaysScrollableScrollPhysics(),
            itemCount: feedState.posts.length + (feedState.isLoadingMore ? 1 : 0),
            itemBuilder: (context, i) {
              if (i >= feedState.posts.length) {
                return const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              return PostCard(post: feedState.posts[i]);
            },
          );
        }),
      ),
    );
  }
}
