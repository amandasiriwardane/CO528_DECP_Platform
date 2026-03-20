import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/constants/app_colors.dart';
import 'core/network/api_client.dart';
import 'features/auth/services/auth_service.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/feed/providers/feed_provider.dart';
import 'features/jobs/providers/job_provider.dart';
import 'features/events/providers/event_provider.dart';
import 'shared/screens/main_tab_screen.dart';

void main() {
  final apiClient = ApiClient();
  final authService = AuthService(apiClient);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(authService)),
        ChangeNotifierProvider(create: (_) => FeedProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => JobProvider(apiClient)),
        ChangeNotifierProvider(create: (_) => EventProvider(apiClient)),
      ],
      child: const DECPApp(),
    ),
  );
}

class DECPApp extends StatelessWidget {
  const DECPApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DECP Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: AppColors.primary,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const InitialScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/home': (context) => const MainTabScreen(),
      },
    );
  }
}

class InitialScreen extends StatelessWidget {
  const InitialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Basic routing logic
    Future.microtask(() {
      final auth = context.read<AuthProvider>();
      if (auth.isAuthenticated) {
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        Navigator.pushReplacementNamed(context, '/login');
      }
    });

    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
