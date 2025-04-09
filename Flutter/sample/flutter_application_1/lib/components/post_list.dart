import 'package:flutter/material.dart';

import '../domains/post.dart';
import 'post_widget.dart';

class PostList extends StatelessWidget {
  final List<Post> posts;

  const PostList({required this.posts, super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: posts.length,
      itemBuilder: (context, index) {
        return Column(
          children: [PostWidget(post: posts[index]), const Divider()],
        );
      },
    );
  }
}
