import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:provider/provider.dart';
import '../../../shared/media/pick_and_prepare_image.dart';
import '../state/create_post_state.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});
  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  CroppedFile? _cropped;
  bool _cancelled = false;
  final _captionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _pickAndCrop());
  }

  @override
  void dispose() {
    _captionController.dispose();
    super.dispose();
  }

  Future<void> _pickAndCrop() async {
    final picked = await pickPostImage(context);
    if (picked == null) {
      setState(() => _cancelled = true);
      return;
    }
    final cropped = await cropToSquare(picked.path);
    if (cropped == null) {
      setState(() => _cancelled = true);
      return;
    }
    setState(() => _cropped = cropped);
  }

  Future<void> _submit() async {
    final bytes = await compressForUpload(_cropped!.path);
    if (!mounted) return;
    await context.read<CreatePostState>().submit(
          imageBytes: bytes,
          caption: _captionController.text.trim().isEmpty ? null : _captionController.text.trim(),
        );
    if (!mounted) return;
    final state = context.read<CreatePostState>();
    if (state.status == UploadStatus.success) {
      Navigator.pop(context);
    } else if (state.status == UploadStatus.failed) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not post: ${state.errorMessage}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final createState = context.watch<CreatePostState>();
    final uploading = createState.status == UploadStatus.uploading;

    if (_cancelled) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.pop(context);
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('New post'),
        actions: [
          TextButton(
            onPressed: (_cropped == null || uploading) ? null : _submit,
            child: uploading
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Share'),
          ),
        ],
      ),
      body: _cropped == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                AspectRatio(
                  aspectRatio: 1,
                  child: Image.file(File(_cropped!.path), fit: BoxFit.cover),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    controller: _captionController,
                    maxLength: 500,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      hintText: 'Write a caption...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
