import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/post_control.dart';

import '../domains/post.dart';

class PostWidget extends StatelessWidget {
  final Post post;

  const PostWidget({required this.post, super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              const Icon(Icons.no_accounts),
              Text(
                post.username,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        Image.network('https://sample.kbknbtk-test.com/blogs/mikan.jpg'),
        PostControl(),
        Padding(
          padding: const EdgeInsets.all(10),
          child:
              Align(alignment: Alignment.centerLeft, child: Text(post.caption)),
        )
      ]),
    );
  }
}
