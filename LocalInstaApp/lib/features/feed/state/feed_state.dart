import 'package:flutter/foundation.dart';
import '../data/post.dart';
import '../data/posts_repository.dart';

class FeedState extends ChangeNotifier {
  FeedState(this._repo);
  final PostsRepository _repo;

  List<Post> posts = [];
  int _page = 0;
  bool isLoading = false;
  bool isLoadingMore = false;
  bool hasMore = true;
  String? error;

  final Map<String, bool> _optimisticLikes = {};
  final Set<String> _knownLiked = {};

  Future<void> loadFirstPage() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      posts = await _repo.fetchFeedPage(0);
      _page = 0;
      hasMore = posts.length == PostsRepository.pageSize;
    } catch (e) {
      error = 'Could not load feed: $e';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() async {
    try {
      final freshFirstPage = await _repo.fetchFeedPage(0);
      posts = freshFirstPage;
      _page = 0;
      hasMore = freshFirstPage.length == PostsRepository.pageSize;
      notifyListeners();
    } catch (_) {
      // keep whatever was already showing on a failed pull-to-refresh
    }
  }

  Future<void> loadMore() async {
    if (isLoadingMore || !hasMore) return;
    isLoadingMore = true;
    notifyListeners();
    try {
      final nextPage = await _repo.fetchFeedPage(_page + 1);
      posts = [...posts, ...nextPage];
      _page++;
      hasMore = nextPage.length == PostsRepository.pageSize;
    } catch (_) {
      // stay on the current page; user can retry by scrolling again
    } finally {
      isLoadingMore = false;
      notifyListeners();
    }
  }

  void prependNewPost(Post post) {
    posts = [post, ...posts];
    notifyListeners();
  }

  bool isLikedOptimistic(String postId) => _optimisticLikes[postId] ?? _knownLiked.contains(postId);

  void markKnownLiked(String postId, bool liked) {
    if (liked) {
      _knownLiked.add(postId);
    } else {
      _knownLiked.remove(postId);
    }
  }

  Future<void> toggleLike(String postId) async {
    final currentlyLiked = isLikedOptimistic(postId);
    _optimisticLikes[postId] = !currentlyLiked;
    _adjustLikeCount(postId, currentlyLiked ? -1 : 1);
    notifyListeners();

    try {
      await _repo.toggleLike(postId);
    } catch (e) {
      _optimisticLikes[postId] = currentlyLiked;
      _adjustLikeCount(postId, currentlyLiked ? 1 : -1);
      notifyListeners();
    }
  }

  void _adjustLikeCount(String postId, int delta) {
    posts = posts.map((p) {
      if (p.id != postId) return p;
      return p.copyWith(likeCount: (p.likeCount + delta).clamp(0, 1 << 30));
    }).toList();
  }
}
