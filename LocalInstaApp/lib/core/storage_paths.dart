import 'package:uuid/uuid.dart';

const _uuid = Uuid();

/// Every uploaded file's path is `<user_id>/<uuid>.<ext>` — the first
/// segment matches the folder-owned Storage RLS policy exactly.
String buildUploadPath({required String userId, required String extension}) {
  return '$userId/${_uuid.v4()}.$extension';
}
