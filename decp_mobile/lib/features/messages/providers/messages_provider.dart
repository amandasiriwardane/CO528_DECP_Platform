import 'package:flutter/material.dart';
import '../models/message_user_model.dart';
import '../models/chat_message_model.dart';
import '../../../core/network/api_client.dart';

class MessagesProvider with ChangeNotifier {
  final ApiClient _apiClient;
  
  List<MessageUserModel> _users = [];
  List<ChatMessageModel> _activeChatMessages = [];
  bool _isLoading = false;

  MessagesProvider(this._apiClient) {
    fetchUsers();
  }

  List<MessageUserModel> get users => _users;
  List<ChatMessageModel> get activeChatMessages => _activeChatMessages;
  bool get isLoading => _isLoading;

  Future<void> fetchUsers() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/users/list');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['users'] ?? [];
        _users = data.map((json) => MessageUserModel.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Failed to fetch users: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMessages(int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiClient.dio.get('/users/messages/$userId');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['messages'] ?? [];
        _activeChatMessages = data.map((json) => ChatMessageModel.fromJson(json)).toList();
      }
    } catch (e) {
      debugPrint('Failed to fetch messages: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> sendMessage(int receiverId, String content) async {
    try {
      final response = await _apiClient.dio.post('/users/messages', data: {
        'receiver_id': receiverId,
        'content': content,
      });
      if (response.statusCode == 201) {
        await fetchMessages(receiverId);
      }
    } catch (e) {
      debugPrint('Failed to send message: $e');
    }
  }
  
  void clearActiveChat() {
    _activeChatMessages = [];
    notifyListeners();
  }
}
