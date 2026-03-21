class MessageUserModel {
  final int id;
  final String username;
  final String firstName;
  final String lastName;
  final String role;

  MessageUserModel({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.role,
  });

  factory MessageUserModel.fromJson(Map<String, dynamic> json) {
    return MessageUserModel(
      id: json['id'],
      username: json['username'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      role: json['role'] ?? '',
    );
  }
}
