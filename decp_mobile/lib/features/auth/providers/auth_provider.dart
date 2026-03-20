import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService;

  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._authService) {
    _checkInitialAuth();
  }

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null || _hasToken;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool _hasToken = false;

  Future<void> _checkInitialAuth() async {
    _isLoading = true;
    notifyListeners();

    _hasToken = await _authService.hasToken();
    // Assuming backend has a /me route to fetch user info if token exists
    // For now, if there's a token, we just mark as authenticated.
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authService.login(username, password);
      if (user != null) {
        _user = user;
        _hasToken = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('AUTH ERROR: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> register({
    required String username,
    required String firstName,
    required String lastName,
    required String password,
    required String role,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _authService.register(
        username: username,
        firstName: firstName,
        lastName: lastName,
        password: password,
        role: role,
      );
      if (user != null) {
        _user = user;
        _hasToken = true;
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      print('AUTH ERROR: $e');
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> updateProfile(String firstName, String lastName) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.updateProfile(firstName, lastName);
      if (_user != null) {
        _user = _user!.copyWith(firstName: firstName, lastName: lastName);
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> updatePassword(String currentPassword, String newPassword) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _authService.updatePassword(currentPassword, newPassword);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    _hasToken = false;
    notifyListeners();
  }
}
