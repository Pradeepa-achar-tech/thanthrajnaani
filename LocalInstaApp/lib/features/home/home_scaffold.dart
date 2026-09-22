import 'package:flutter/material.dart';
import '../../core/supabase_client.dart';
import '../feed/presentation/create_post_screen.dart';
import '../feed/presentation/feed_screen.dart';
import '../profile/presentation/profile_screen.dart';
import '../profile/presentation/search_screen.dart';

class HomeScaffold extends StatefulWidget {
  const HomeScaffold({super.key});
  @override
  State<HomeScaffold> createState() => _HomeScaffoldState();
}

class _HomeScaffoldState extends State<HomeScaffold> {
  int _index = 0;

  void _onTap(int i) {
    if (i == 2) {
      // "Post" is an action, not a persistent tab — open it, then snap back.
      Navigator.push(context, MaterialPageRoute(builder: (_) => const CreatePostScreen()));
      return;
    }
    setState(() => _index = i);
  }

  @override
  Widget build(BuildContext context) {
    final currentUserId = supabase.auth.currentUser!.id;
    final screens = [
      const FeedScreen(),
      const SearchScreen(),
      const SizedBox.shrink(), // index 2 never renders — Post is action-only
      ProfileScreen(userId: currentUserId),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: _onTap,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Feed'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.add_box_outlined), label: 'Post'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
