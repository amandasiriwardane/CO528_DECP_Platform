class MessageGroupModel {
  final int id;
  final String name;

  MessageGroupModel({
    required this.id,
    required this.name,
  });

  factory MessageGroupModel.fromJson(Map<String, dynamic> json) {
    return MessageGroupModel(
      id: json['id'],
      name: json['name'] ?? 'Unnamed Group',
    );
  }
}
