import 'package:flutter/material.dart';
import '../../features/jobs/screens/jobs_screen.dart';
import '../../features/events/screens/events_screen.dart';
import '../../features/research/screens/research_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../core/constants/app_colors.dart';
import 'package:provider/provider.dart';

class MenuDrawer extends StatelessWidget {
  const MenuDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.username.isNotEmpty == true) ? user!.username[0].toUpperCase() : 'U';

    return Drawer(
      width: MediaQuery.of(context).size.width * 0.75,
      backgroundColor: AppColors.background,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              color: Colors.white,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primary.withOpacity(0.2),
                    child: Text(initials, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primaryDark)),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('DECP Menu', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.textPrimary)),
                        Text(user?.username ?? 'Guest', style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildMenuItem(context, Icons.work_outline, 'Jobs', const JobsScreen()),
                  _buildMenuItem(context, Icons.event, 'Events', const EventsScreen()),
                  _buildMenuItem(context, Icons.menu_book_outlined, 'Research', const ResearchScreen()),
                  _buildMenuItem(context, Icons.person_outline, 'Profile', const ProfileScreen()),
                  const SizedBox(height: 24),
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.red.withOpacity(0.2))),
                    child: ListTile(
                      leading: const Icon(Icons.logout, color: Colors.red),
                      title: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.red)),
                      onTap: () {
                        context.read<AuthProvider>().logout();
                      },
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, Widget screen) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 8),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.withOpacity(0.1))),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () {
          Navigator.pop(context); // Close the drawer
          Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
        },
      ),
    );
  }
}

