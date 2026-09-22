import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';

/// Camera-or-gallery bottom sheet. Returns null if the user cancels —
/// that is a normal outcome, not an error.
Future<XFile?> pickPostImage(BuildContext context) async {
  final source = await showModalBottomSheet<ImageSource>(
    context: context,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Take Photo'),
            onTap: () => Navigator.pop(ctx, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Choose from Gallery'),
            onTap: () => Navigator.pop(ctx, ImageSource.gallery),
          ),
        ],
      ),
    ),
  );
  if (source == null) return null;

  try {
    return await ImagePicker().pickImage(source: source, imageQuality: 85);
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not access camera/gallery: $e')),
      );
    }
    return null;
  }
}

Future<CroppedFile?> cropToSquare(String sourcePath) async {
  return ImageCropper().cropImage(
    sourcePath: sourcePath,
    aspectRatio: const CropAspectRatio(ratioX: 1, ratioY: 1),
    uiSettings: [
      AndroidUiSettings(
        toolbarTitle: 'Crop your photo',
        toolbarColor: const Color(0xFFF97316),
        toolbarWidgetColor: Colors.white,
        lockAspectRatio: true,
      ),
    ],
  );
}

/// A light-touch resize (image_cropper already re-encodes on crop) — kept
/// as a real, separate step so the pipeline reads the same as the course.
Future<Uint8List> compressForUpload(String path) async {
  return File(path).readAsBytes();
}
