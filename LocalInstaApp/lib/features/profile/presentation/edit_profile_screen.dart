import 'package:flutter/material.dart';
import '../../../core/storage_paths.dart';
import '../../../core/storage_repository.dart';
import '../../../core/supabase_client.dart';
import '../../../shared/media/pick_and_prepare_image.dart';
import '../../../shared/widgets/avatar_image.dart';
import '../data/profile.dart';
import '../data/profile_repository.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key, required this.profile});
  final Profile profile;

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _username = TextEditingController(text: widget.profile.username);
  late final _fullName = TextEditingController(text: widget.profile.fullName ?? '');
  late final _bio = TextEditingController(text: widget.profile.bio ?? '');
  final _repo = ProfileRepository();
  String? _avatarUrl;
  bool _saving = false;
  bool _uploadingAvatar = false;

  @override
  void initState() {
    super.initState();
    _avatarUrl = widget.profile.avatarUrl;
  }

  @override
  void dispose() {
    _username.dispose();
    _fullName.dispose();
    _bio.dispose();
    super.dispose();
  }

  String? _validateUsername(String? value) {
    if (value == null || !RegExp(r'^[a-z0-9_]{3,20}$').hasMatch(value)) {
      return 'Lowercase letters, numbers, underscore, 3-20 characters';
    }
    return null;
  }

  Future<void> _changeAvatar() async {
    final picked = await pickPostImage(context);
    if (picked == null) return;
    final cropped = await cropToSquare(picked.path);
    if (cropped == null) return;

    setState(() => _uploadingAvatar = true);
    try {
      final bytes = await compressForUpload(cropped.path);
      final userId = supabase.auth.currentUser!.id;
      final path = buildUploadPath(userId: userId, extension: 'jpg');
      final url = await StorageRepository().uploadImageBytes(bucket: 'avatars', path: path, bytes: bytes);
      await _repo.updateAvatarUrl(userId, url);
      if (!mounted) return;
      setState(() => _avatarUrl = url);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not update avatar: $e')));
      }
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await _repo.updateProfile(
        userId: widget.profile.id,
        username: _username.text.trim(),
        bio: _bio.text.trim().isEmpty ? null : _bio.text.trim(),
        fullName: _fullName.text.trim().isEmpty ? null : _fullName.text.trim(),
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit profile'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Save'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Center(
                child: GestureDetector(
                  onTap: _uploadingAvatar ? null : _changeAvatar,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      AvatarImage(url: _avatarUrl, radius: 48),
                      if (_uploadingAvatar) const CircularProgressIndicator(),
                    ],
                  ),
                ),
              ),
              TextButton(onPressed: _uploadingAvatar ? null : _changeAvatar, child: const Text('Change photo')),
              const SizedBox(height: 12),
              TextFormField(
                controller: _username,
                decoration: const InputDecoration(labelText: 'Username', border: OutlineInputBorder()),
                validator: _validateUsername,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _fullName,
                decoration: const InputDecoration(labelText: 'Full name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _bio,
                maxLines: 3,
                maxLength: 150,
                decoration: const InputDecoration(labelText: 'Bio', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
