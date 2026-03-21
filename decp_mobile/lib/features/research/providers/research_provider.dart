import 'package:flutter/material.dart';
import '../models/research_project_model.dart';
import '../../../core/network/api_client.dart';

class ResearchProvider with ChangeNotifier {
  final ApiClient _apiClient;
  
  List<ResearchProjectModel> _projects = [];
  bool _isLoading = false;
  String? _errorMessage;

  ResearchProvider(this._apiClient) {
    fetchProjects();
  }

  List<ResearchProjectModel> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchProjects() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.get('/users/projects');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['projects'] ?? [];
        _projects = data.map((json) => ResearchProjectModel.fromJson(json)).toList();
      }
    } catch (e) {
      _errorMessage = 'Failed to fetch projects';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createProject(String title, String description) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await _apiClient.dio.post('/users/projects', data: {
        'title': title,
        'description': description,
      });
      if (response.statusCode == 201) {
        await fetchProjects();
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = 'Failed to create project';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
