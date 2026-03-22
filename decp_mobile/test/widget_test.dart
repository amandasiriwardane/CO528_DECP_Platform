import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:decp_mobile/main.dart';
import 'package:decp_mobile/core/network/api_client.dart';
import 'package:decp_mobile/features/auth/services/auth_service.dart';
import 'package:decp_mobile/features/auth/providers/auth_provider.dart';
import 'package:decp_mobile/features/feed/providers/feed_provider.dart';
import 'package:decp_mobile/features/jobs/providers/job_provider.dart';
import 'package:decp_mobile/features/events/providers/event_provider.dart';
import 'package:decp_mobile/features/research/providers/research_provider.dart';
import 'package:decp_mobile/features/messages/providers/messages_provider.dart';

void main() {
  testWidgets('App starts and routes based on auth state', (WidgetTester tester) async {
    // Mock the secure storage method channel to prevent MissingPluginException
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
      const MethodChannel('plugins.it_nomads.com/flutter_secure_storage'),
      (MethodCall methodCall) async {
        return null;
      },
    );

    final apiClient = ApiClient();
    final authService = AuthService(apiClient);

    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
          ChangeNotifierProvider(create: (_) => FeedProvider(apiClient)),
          ChangeNotifierProvider(create: (_) => JobProvider(apiClient)),
          ChangeNotifierProvider(create: (_) => EventProvider(apiClient)),
          ChangeNotifierProvider(create: (_) => ResearchProvider(apiClient)),
          ChangeNotifierProvider(create: (_) => MessagesProvider(apiClient)),
        ],
        child: const DECPApp(),
      ),
    );

    // InitialScreen should display a CircularProgressIndicator while checking auth
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Allow the routing microtask to execute
    await tester.pump();

    // Allow any page transition animations to settle
    await tester.pumpAndSettle();

    // Since mock secure storage returns null (not authenticated), 
    // the app should navigate to the LoginScreen or initial unauthenticated state.
    // At minimum, we expect it to not be stuck on InitialScreen's loading indicator.
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });
}
