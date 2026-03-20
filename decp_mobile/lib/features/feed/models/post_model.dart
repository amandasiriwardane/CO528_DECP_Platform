class PostModel {
  final String id;
  final String content;
  final String username;
  final String firstName;
  final String lastName;
  final String role;
  final DateTime createdAt;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final String? imageUrl;

  PostModel({
    required this.id,
    required this.content,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.createdAt,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.isLiked = false,
    this.imageUrl,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['id']?.toString() ?? '',
      content: json['content'] ?? '',
      username: json['username'] ?? 'user',
      firstName: json['first_name'] ?? 'Unknown',
      lastName: json['last_name'] ?? 'User',
      role: json['role'] ?? 'Student',
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      likesCount: int.tryParse(json['likes_count']?.toString() ?? '0') ?? 0,
      commentsCount: int.tryParse(json['comments_count']?.toString() ?? '0') ?? 0,
      isLiked: json['is_liked'] == true || json['is_liked'] == 'true',
      imageUrl: json['image_url'],
    );
  }
}
