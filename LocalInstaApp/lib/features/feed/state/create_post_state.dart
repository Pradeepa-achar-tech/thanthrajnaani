import 'package:flutter/foundation.dart';
import '../../../core/storage_repository.dart';
import '../../../core/storage_paths.dart';
import '../../../core/supabase_client.dart';
import '../data/post.dart';
import '../data/posts_repository.dart';
import 'feed_state.dart';

enum UploadStatus { idle, uploading, success, failed }

class CreatePostState extends ChangeNotifier {
  CreatePostState(this._storageRepo, this._postsRepo, this._feedState);
  final StorageRepository _storageRepo;
  final PostsRepository _postsRepo;
  final FeedState _feedState;

  UploadStatus status = UploadStatus.idle;
  String? errorMessage;

  Future<void> submit({required Uint8List imageBytes, String? caption}) async {
    status = UploadStatus.uploading;
    errorMessage = null;
    notifyListeners();

    try {
      final userId = supabase.auth.currentUser!.id;
      final path = buildUploadPath(userId: userId, extension: 'jpg');
      final url = await _storageRepo.uploadImageBytes(bucket: 'posts', path: path, bytes: imageBytes);
      final Post newPost = await _postsRepo.createPost(imageUrl: url, caption: caption);
      _feedState.prependNewPost(newPost);
      status = UploadStatus.success;
    } catch (e) {
      status = UploadStatus.failed;
      errorMessage = e.toString();
    } finally {
      notifyListeners();
    }
  }

  void reset() {
    status = UploadStatus.idle;
    errorMessage = null;
    notifyListeners();
  }
}
