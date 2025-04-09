class Post {
  final String username;
  final String imageUrl;
  final String caption;

  factory Post.fromJson(Map<String, dynamic> json) {
    return Post(
      username: json['username'],
      imageUrl: json['imageUrl'],
      caption: json['caption'],
    );
  }

  Post({required this.username, required this.imageUrl, required this.caption});
}
