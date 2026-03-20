import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../models/user_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthService(this._apiClient);

  Future<UserModel?> login(String username, String password) async {
    try {
      final response = await _apiClient.dio.post(
        '/users/login',
        data: {'username': username, 'password': password},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        final token = data['token'];
        if (token != null) {
          await _storage.write(key: 'jwt_token', value: token);
        }
        if (data['user'] != null) {
          return UserModel.fromJson(data['user']);
        }
        return UserModel.fromJson({'id': '1', 'username': username, 'first_name': '', 'last_name': '', 'role': 'Student'}); // Fallback
      }
      return null;
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Login failed');
    }
  }

  Future<UserModel?> register({
    required String username,
    required String firstName,
    required String lastName,
    required String password,
    required String role,
  }) async {
    try {
      await _apiClient.dio.post(
        '/users/register',
        data: {
          'username': username,
          'first_name': firstName,
          'last_name': lastName,
          'password': password,
          'role': role,
        },
      );

      // Auto-login after successful registration (mimicking Web App auth context)
      return await login(username, password);
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Registration failed');
    }
  }

  Future<void> updateProfile(String firstName, String lastName) async {
    await _apiClient.dio.put('/users/profile', data: {
      'first_name': firstName,
      'last_name': lastName,
    });
  }

  Future<void> updatePassword(String currentPassword, String newPassword) async {
    await _apiClient.dio.put('/users/password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  Future<bool> hasToken() async {
    final token = await _storage.read(key: 'jwt_token');
    return token != null;
  }
}
