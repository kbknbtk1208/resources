import 'package:flutter/material.dart';

class PostControl extends StatelessWidget {
  const PostControl({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.centerLeft,
      child: const Row(
        children: <Widget>[
          SizedBox(
            width: 100,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Icon(Icons.favorite),
                Icon(Icons.chat_bubble_outline),
                Icon(Icons.send_outlined)
              ],
            ),
          ),
          SizedBox(
            width: 200,
            child: Text('slide'),
          ),
          Icon(Icons.bookmark),
        ],
      ),
    );
  }
}
