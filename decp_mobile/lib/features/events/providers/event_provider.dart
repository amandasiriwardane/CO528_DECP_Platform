import 'package:flutter/material.dart';
import '../models/event_model.dart';
import '../../../core/network/api_client.dart';

class EventProvider with ChangeNotifier {
  final ApiClient _apiClient;
  
  List<EventModel> _events = [];
  bool _isLoading = false;
  String? _errorMessage;

  EventProvider(this._apiClient) {
    fetchEvents();
  }

  List<EventModel> get events => _events;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchEvents() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await _apiClient.dio.get('/events');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['events'] ?? [];
        _events = data.map((json) => EventModel.fromJson(json)).toList();
      }
    } catch (e) {
      // Provide mock data if the API isn't up
      _events = [
        EventModel(id: '1', title: 'Tech Talk: Flutter vs React Native', description: 'Join us for an alumni panel comparing modern frameworks.', date: DateTime.now().add(const Duration(days: 3)), venue: 'Main Auditorium'),
        EventModel(id: '2', title: 'Career Fair 2026', description: 'Meet top tech companies recruiting fresh grads.', date: DateTime.now().add(const Duration(days: 10)), venue: 'Virtual', hasRsvp: true),
      ];
      _errorMessage = 'Could not fetch events from server. Showing local mocks.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> rsvpEvent(String eventId) async {
    try {
      final response = await _apiClient.dio.post('/events/$eventId/rsvp');
      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = response.data;
        final index = _events.indexWhere((e) => e.id == eventId);
        if (index != -1) {
          final evt = _events[index];
          final diff = (data['rsvped'] == true) ? 1 : -1;
          _events[index] = EventModel(
            id: evt.id,
            title: evt.title,
            description: evt.description,
            date: evt.date,
            venue: evt.venue,
            rsvpCount: evt.rsvpCount + diff,
            hasRsvp: data['rsvped'] == true,
          );
          notifyListeners();
        }
      }
    } catch (e) {
      print('RSVP ERROR: $e');
      _errorMessage = 'Failed to RSVP';
      notifyListeners();
    }
  }
}
