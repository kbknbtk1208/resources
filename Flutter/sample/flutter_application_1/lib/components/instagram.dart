import 'package:flutter/material.dart';
import 'package:flutter_application_1/components/post_list.dart';

import '../domains/post.dart';
import '../httpClient/index.dart';

class Instagram extends StatefulWidget {
  //  [
  //   Post(
  //       caption: 'みかん最高！',
  //       imageUrl: 'https://sample.kbknbtk-test.com/blogs/mikan.jpg',
  //       username: 'kuboki'),
  //   Post(
  //       caption: 'みかん大好き！',
  //       imageUrl: 'https://sample.kbknbtk-test.com/blogs/mikan.jpg',
  //       username: 'kuboki')
  // ];

  Instagram({super.key});

  @override
  State<Instagram> createState() => _InstagramState();
}

class _InstagramState extends State<Instagram> {
  List<Post> postList = [];

  @override
  void initState() {
    super.initState();
    // fetchPost();
  }

  // fetchPost() async {
  //   postList = await fetchPosts();
  //   print(postList);
  //   setState(() {});
  // }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Post>>(
        future: fetchPosts(),
        builder: (BuildContext context, AsyncSnapshot<List<Post>> snapshot) {
          if (snapshot.hasData) {
            return PostList(posts: snapshot.data ?? []);
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          } else {
            return Text('hoge');
          }
        });
  }
}
