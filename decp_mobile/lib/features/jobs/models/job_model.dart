class JobModel {
  final String id;
  final String title;
  final String description;
  final String username;
  final DateTime createdAt;
  final bool hasApplied;

  JobModel({
    required this.id,
    required this.title,
    required this.description,
    required this.username,
    required this.createdAt,
    this.hasApplied = false,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    return JobModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Unknown Job',
      description: json['description'] ?? '',
      username: json['username'] ?? 'Unknown Company',
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at']) 
          : DateTime.now(),
      hasApplied: json['has_applied'] == true || json['has_applied'] == 'true',
    );
  }
}
