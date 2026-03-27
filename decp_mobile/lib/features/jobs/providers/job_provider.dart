import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../models/job_model.dart';
import '../../../core/network/api_client.dart';

class JobProvider with ChangeNotifier {
  final ApiClient _apiClient;
  
  List<JobModel> _jobs = [];
  bool _isLoading = false;
  String? _errorMessage;

  JobProvider(this._apiClient) {
    fetchJobs();
  }

  List<JobModel> get jobs => _jobs;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchJobs() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.get('/jobs');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['jobs'] ?? [];
        _jobs = data.map((json) => JobModel.fromJson(json)).toList();
      }
    } catch (e) {
      // Provide mock data if the API isn't up
      _jobs = [
        JobModel(id: '1', title: 'Software Engineering Intern', username: 'Google', description: 'Summer internship in the Cloud division.', createdAt: DateTime.now()),
        JobModel(id: '2', title: 'Junior Backend Developer', username: 'WSO2', description: 'Looking for a fresh graduate specialized in Ballerina and Java.', createdAt: DateTime.now().subtract(const Duration(days: 2)), hasApplied: true),
      ];
      _errorMessage = 'Could not fetch jobs from server. Showing local mocks.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> applyForJob(String jobId, [dynamic file]) async {
    try {
      final formData = FormData();
      
      if (file != null) {
        // file is from file_picker (PlatformFile)
        formData.files.add(MapEntry(
          'resume',
          MultipartFile.fromBytes(
            file.bytes ?? [], 
            filename: file.name,
          ),
        ));
      } else {
        formData.fields.add(const MapEntry('resume', 'Dummy CV File'));
      }

      final response = await _apiClient.dio.post('/jobs/$jobId/apply', data: formData);
      if (response.statusCode == 200 || response.statusCode == 201) {
        final index = _jobs.indexWhere((j) => j.id == jobId);
        if (index != -1) {
          final j = _jobs[index];
          _jobs[index] = JobModel(
            id: j.id, title: j.title, description: j.description, 
            username: j.username, createdAt: j.createdAt, hasApplied: true,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      print('APPLY ERROR: $e');
      _errorMessage = 'Failed to apply';
      notifyListeners();
      rethrow; // Re-throw to show error in UI
    }
  }
}
