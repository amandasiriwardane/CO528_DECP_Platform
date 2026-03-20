import 'package:flutter/material.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import 'package:provider/provider.dart';
import '../../../shared/screens/menu_screen.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool isDirect = true;

  final List<Map<String, String>> mockChats = [
    {'name': 'Dharani Navodya', 'role': 'Student', 'initial': 'D'},
    {'name': 'Dharani Navodya', 'role': 'Student', 'initial': 'D'},
    {'name': 'Dharani Navodya', 'role': 'Student', 'initial': 'D'},
    {'name': 'Dharanii Navodya', 'role': 'Student', 'initial': 'D'},
    {'name': 'nimesha Thathsaranio', 'role': 'Student', 'initial': 'N'},
    {'name': 'shammi perera', 'role': 'Student', 'initial': 'S'},
  ];

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.username.isNotEmpty == true) ? user!.username[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const MenuDrawer(),
      appBar: AppBar(
        title: const Text('Messages', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withOpacity(0.2),
              child: Text(initials, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primaryDark)),
            ),
          )
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Messages',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9), // Slate 100
                      borderRadius: BorderRadius.circular(20),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        GestureDetector(
                          onTap: () => setState(() => isDirect = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: isDirect ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: isDirect ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))] : null,
                            ),
                            child: Text(
                              'Direct',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: isDirect ? AppColors.primaryDark : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() => isDirect = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: !isDirect ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: !isDirect ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 2))] : null,
                            ),
                            child: Text(
                              'Groups',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: !isDirect ? AppColors.primaryDark : AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.withOpacity(0.1)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.01), blurRadius: 10, offset: const Offset(0, 4))
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                      child: Text(
                        isDirect ? 'DIRECT MESSAGES' : 'GROUP MESSAGES',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF94A3B8), // slate-400
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    const Divider(color: Color(0xFFF1F5F9), thickness: 1.5, height: 1), // slate-100
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: isDirect ? mockChats.length : 0,
                      separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), thickness: 1, height: 1),
                      itemBuilder: (context, index) {
                        final chat = mockChats[index];
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          leading: CircleAvatar(
                            radius: 22,
                            backgroundColor: AppColors.primary.withOpacity(0.15),
                            child: Text(
                              chat['initial']!,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryDark,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          title: Text(
                            chat['name']!,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                          ),
                          subtitle: Text(
                            chat['role']!,
                            style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                          ),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Chat screen coming soon!')));
                          },
                        );
                      },
                    ),
                    if (!isDirect)
                      const Padding(
                        padding: EdgeInsets.all(40.0),
                        child: Center(
                          child: Text(
                            'No groups yet.',
                            style: TextStyle(color: Color(0xFF64748B), fontSize: 14),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
        ],
      ),
    );
  }
}
