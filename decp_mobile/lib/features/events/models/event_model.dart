class EventModel {
  final String id;
  final String title;
  final String description;
  final DateTime date;
  final String venue;
  final int rsvpCount;
  final bool hasRsvp;

  EventModel({
    required this.id,
    required this.title,
    required this.description,
    required this.date,
    required this.venue,
    this.rsvpCount = 0,
    this.hasRsvp = false,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? 'Unknown Event',
      description: json['description'] ?? '',
      date: json['date'] != null 
          ? DateTime.parse(json['date']) 
          : DateTime.now(),
      venue: json['venue'] ?? 'TBD',
      rsvpCount: int.tryParse(json['rsvp_count']?.toString() ?? '0') ?? 0,
      hasRsvp: json['has_rsvp'] == true || json['has_rsvp'] == 'true',
    );
  }
}
