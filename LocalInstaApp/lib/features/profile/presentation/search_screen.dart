import 'dart:async';
import 'package:flutter/material.dart';
import '../../../shared/widgets/avatar_image.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../feed/presentation/post_card.dart' show openProfile;
import '../data/profile.dart';
import '../data/profile_repository.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _repo = ProfileRepository();
  Timer? _debounce;
  List<Profile> _results = [];
  bool _loading = false;
  bool _searched = false;

  void _onQueryChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      if (query.trim().isEmpty) {
        setState(() {
          _results = [];
          _searched = false;
        });
        return;
      }
      setState(() => _loading = true);
      final results = await _repo.searchProfiles(query);
      if (!mounted) return;
      setState(() {
        _results = results;
        _loading = false;
        _searched = true;
      });
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          autofocus: false,
          decoration: const InputDecoration(
            hintText: 'Search LocalInsta',
            prefixIcon: Icon(Icons.search),
            border: InputBorder.none,
          ),
          onChanged: _onQueryChanged,
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : (_searched && _results.isEmpty)
              ? const EmptyState(icon: Icons.search_off, title: 'No results', subtitle: 'Try a different username')
              : ListView.builder(
                  itemCount: _results.length,
                  itemBuilder: (context, i) {
                    final p = _results[i];
                    return ListTile(
                      leading: AvatarImage(url: p.avatarUrl, radius: 20),
                      title: Text(p.username),
                      subtitle: p.fullName != null ? Text(p.fullName!) : null,
                      onTap: () => openProfile(context, p.id),
                    );
                  },
                ),
    );
  }
}
