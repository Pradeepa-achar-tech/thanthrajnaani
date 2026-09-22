import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_client.dart';

class StorageRepository {
  StorageRepository({SupabaseClient? client}) : _client = client ?? supabase;
  final SupabaseClient _client;

  Future<String> uploadImageBytes({
    required String bucket,
    required String path,
    required Uint8List bytes,
  }) async {
    try {
      await _client.storage.from(bucket).uploadBinary(
            path,
            bytes,
            fileOptions: const FileOptions(contentType: 'image/jpeg', upsert: false),
          );
      return _client.storage.from(bucket).getPublicUrl(path);
    } on StorageException catch (e) {
      throw Exception('Upload failed: ${e.message}');
    }
  }
}
