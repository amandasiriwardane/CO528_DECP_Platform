class ResearchProjectModel {
  final String id;
  final String title;
  final String description;
  final String creatorUsername;
  final int memberCount;
  final int docCount;
  final DateTime createdAt;

  ResearchProjectModel({
    required this.id,
    required this.title,
    required this.description,
    required this.creatorUsername,
    required this.memberCount,
    required this.docCount,
    required this.createdAt,
  });

  factory ResearchProjectModel.fromJson(Map<String, dynamic> json) {
    return ResearchProjectModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      creatorUsername: json['creator_username'] ?? '',
      memberCount: int.tryParse(json['member_count']?.toString() ?? '1') ?? 1,
      docCount: int.tryParse(json['doc_count']?.toString() ?? '0') ?? 0,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at']) : DateTime.now(),
    );
  }
}
