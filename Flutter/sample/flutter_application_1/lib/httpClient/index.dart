import 'dart:convert';
import 'package:http/http.dart' as http;

import '../domains/post.dart';

Future<List<Post>> fetchPosts() async {
  final response =
      await http.get(Uri.parse('http://192.168.1.10:50002/flutter/post'));
  print(response.body);

  await Future.delayed(
    Duration(seconds: 1),
  );
  if (response.statusCode == 200) {
    List jsonResponse = json.decode(response.body);
    return jsonResponse.map((item) => Post.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load posts');
  }
}
