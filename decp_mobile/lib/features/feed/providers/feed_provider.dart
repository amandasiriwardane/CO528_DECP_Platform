import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../auth/services/auth_service.dart';
import '../models/post_model.dart';
import '../../../core/network/api_client.dart';

class FeedProvider with ChangeNotifier {
  final ApiClient _apiClient;
  
  List<PostModel> _posts = [];
  bool _isLoading = false;
  String? _errorMessage;

  FeedProvider(this._apiClient) {
    fetchPosts();
  }

  List<PostModel> get posts => _posts;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchPosts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.get('/feed');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['posts'] ?? [];
        _posts = data.map((json) => PostModel.fromJson(json)).toList();
      }
    } catch (e) {
      // Mock data strategy if backend varies or fails during MVP demo
      _posts = [
        PostModel(id: '1', content: 'Welcome to the DECP Feed!', username: 'admin', firstName: 'System', lastName: 'Admin', role: 'admin', createdAt: DateTime.now()),
        PostModel(id: '2', content: 'Fallback mode activated. Please ensure backend is running.', username: 'dev', firstName: 'Test', lastName: 'User', role: 'student', createdAt: DateTime.now().subtract(const Duration(hours: 1))),
      ];
      _errorMessage = 'Could not fetch posts from server. Showing local mocks.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> createPost(String content) async {
    try {
      final formData = FormData.fromMap({'content': content});
      final response = await _apiClient.dio.post('/feed/post', data: formData);
      if (response.statusCode == 201) {
        fetchPosts(); // Refresh feed
      }
    } catch (e) {
      _errorMessage = 'Failed to create post';
      notifyListeners();
    }
  }
}
