import 'package:flutter/material.dart';

class DoubleTapLikeOverlay extends StatefulWidget {
  const DoubleTapLikeOverlay({
    super.key,
    required this.child,
    required this.isLiked,
    required this.onLike,
  });
  final Widget child;
  final bool isLiked;
  final VoidCallback onLike;

  @override
  State<DoubleTapLikeOverlay> createState() => _DoubleTapLikeOverlayState();
}

class _DoubleTapLikeOverlayState extends State<DoubleTapLikeOverlay>
    with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  );

  void _handleDoubleTap() {
    if (!widget.isLiked) widget.onLike();
    _controller.forward(from: 0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTap: _handleDoubleTap,
      child: Stack(
        alignment: Alignment.center,
        children: [
          widget.child,
          IgnorePointer(
            child: FadeTransition(
              opacity: Tween(begin: 1.0, end: 0.0).animate(
                CurvedAnimation(parent: _controller, curve: const Interval(0.4, 1.0)),
              ),
              child: ScaleTransition(
                scale: Tween(begin: 0.6, end: 1.2).animate(
                  CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
                ),
                child: const Icon(Icons.favorite, color: Colors.white, size: 90),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
