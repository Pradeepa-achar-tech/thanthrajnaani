import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'shimmer_box.dart';

class AvatarImage extends StatelessWidget {
  const AvatarImage({super.key, this.url, this.radius = 20});
  final String? url;
  final double radius;

  @override
  Widget build(BuildContext context) {
    if (url == null || url!.isEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        child: Icon(Icons.person, size: radius, color: Theme.of(context).colorScheme.onPrimaryContainer),
      );
    }
    return ClipOval(
      child: SizedBox(
        width: radius * 2,
        height: radius * 2,
        child: CachedNetworkImage(
          imageUrl: url!,
          fit: BoxFit.cover,
          placeholder: (context, url) => const ShimmerBox(),
          errorWidget: (context, url, error) => Icon(Icons.person, size: radius),
        ),
      ),
    );
  }
}
