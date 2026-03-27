import 'package:flutter/material.dart';
import '../../features/jobs/screens/jobs_screen.dart';
import '../../features/events/screens/events_screen.dart';
import '../../features/research/screens/research_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/feed/screens/feed_screen.dart';
import '../../features/messages/screens/messages_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class MenuDrawer extends StatelessWidget {
  const MenuDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final username = user?.username ?? 'Guest';
    final handle = username.toLowerCase().replaceAll(' ', '');
    final role = user?.role ?? 'Student';

    return Drawer(
      width: MediaQuery.of(context).size.width * 0.75,
      backgroundColor: Colors.white,
      elevation: 0,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'DECP',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF16A34A), // Green-600
                      letterSpacing: -0.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7), // Green-100
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      role,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF166534), // Green-800
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1), // Slate-100
            
            // Scrollable Links
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                children: [
                  _buildNavItem(context, Icons.home_outlined, 'Dashboard', const DashboardScreen(), isActive: false),
                  const SizedBox(height: 8),
                  _buildNavItem(context, Icons.chat_bubble_outline, 'Feed', const FeedScreen(), isActive: false),
                  const SizedBox(height: 8),
                  _buildNavItem(context, Icons.work_outline, 'Jobs', const JobsScreen(), isActive: false),
                  const SizedBox(height: 8),
                  _buildNavItem(context, Icons.calendar_today_outlined, 'Events', const EventsScreen(), isActive: false),
                  const SizedBox(height: 8),
                  _buildNavItem(context, Icons.menu_book_outlined, 'Research', const ResearchScreen(), isActive: false),
                  const SizedBox(height: 8),
                  _buildNavItem(context, Icons.mail_outline, 'Messages', const MessagesScreen(), isActive: false),
                ],
              ),
            ),
            
            // Footer
            const Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Column(
                children: [
                  InkWell(
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        children: [
                          const Icon(Icons.person_outline, color: Color(0xFF475569), size: 28), // Slate-600
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                username,
                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Color(0xFF0F172A)),
                              ),
                              Text(
                                '@$handle',
                                style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: Color(0xFF64748B)),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  InkWell(
                    onTap: () {
                      context.read<AuthProvider>().logout();
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: const Row(
                      children: [
                         Icon(Icons.logout, color: Color(0xFFE11D48), size: 24), // Rose-600
                         SizedBox(width: 16),
                         Text(
                           'Log Out',
                           style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Color(0xFFE11D48)),
                         )
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, IconData icon, String title, Widget screen, {bool isActive = false}) {
    // Slate-700 for inactive
    final color = isActive ? const Color(0xFF16A34A) : const Color(0xFF334155); 
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFFF0FDF4) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                fontSize: 16,
                color: color,
              ),
            ),
            if (isActive) ...[
              const Spacer(),
              Icon(Icons.chevron_right, color: color, size: 20),
            ]
          ],
        ),
      ),
    );
  }
}

