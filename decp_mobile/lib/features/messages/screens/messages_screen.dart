import 'package:flutter/material.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import 'package:provider/provider.dart';
import '../../../shared/screens/menu_screen.dart';
import '../../../shared/widgets/notifications_dialog.dart';
import 'chat_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../providers/messages_provider.dart';
import '../widgets/create_group_dialog.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  bool isDirect = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MessagesProvider>().fetchUsers();
      context.read<MessagesProvider>().fetchGroups();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.username.isNotEmpty == true) ? user!.username[0].toUpperCase() : 'U';
    final provider = context.watch<MessagesProvider>();
    final users = provider.users;
    final groups = provider.groups;

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
            onPressed: () {
              showDialog(context: context, builder: (_) => const NotificationsDialog());
            },
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const ProfileScreen()));
              },
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.primary.withOpacity(0.2),
                child: Text(initials, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primaryDark)),
              ),
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
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            isDirect ? 'DIRECT MESSAGES' : 'GROUP MESSAGES',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF94A3B8), // slate-400
                              letterSpacing: 1.2,
                            ),
                          ),
                          if (!isDirect)
                            GestureDetector(
                              onTap: () {
                                showDialog(context: context, builder: (_) => const CreateGroupDialog());
                              },
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF0FDF4), // green-50
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(Icons.add, size: 16, color: Color(0xFF16A34A)), // green-600
                              ),
                            ),
                        ],
                      ),
                    ),
                    const Divider(color: Color(0xFFF1F5F9), thickness: 1.5, height: 1), // slate-100
                    provider.isLoading 
                      ? const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator()))
                      : ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: isDirect ? users.length : groups.length,
                      separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), thickness: 1, height: 1),
                      itemBuilder: (context, index) {
                        if (isDirect) {
                          final chatUser = users[index];
                          final initial = chatUser.firstName.isNotEmpty ? chatUser.firstName[0].toString().toUpperCase() : chatUser.username[0].toString().toUpperCase();
                          final displayName = chatUser.firstName.isNotEmpty ? '${chatUser.firstName} ${chatUser.lastName}' : chatUser.username;
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            leading: CircleAvatar(
                              radius: 22,
                              backgroundColor: AppColors.primary.withOpacity(0.15),
                              child: Text(
                                initial,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark, fontSize: 16),
                              ),
                            ),
                            title: Text(
                              displayName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                            ),
                            subtitle: Text(
                              chatUser.role,
                              style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                            ),
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(
                                userId: chatUser.id,
                                userName: displayName,
                                role: chatUser.role,
                                initial: initial,
                                isGroup: false,
                              )));
                            },
                          );
                        } else {
                          final group = groups[index];
                          final initial = group.name.isNotEmpty ? group.name[0].toUpperCase() : 'G';
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            leading: CircleAvatar(
                              radius: 22,
                              backgroundColor: AppColors.primary.withOpacity(0.15),
                              child: Text(
                                initial,
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark, fontSize: 16),
                              ),
                            ),
                            title: Text(
                              group.name,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A)),
                            ),
                            subtitle: const Text(
                              'Active Group',
                              style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                            ),
                            onTap: () {
                              Navigator.push(context, MaterialPageRoute(builder: (_) => ChatScreen(
                                userId: group.id,
                                userName: group.name,
                                role: 'Group Chat',
                                initial: initial,
                                isGroup: true,
                              )));
                            },
                          );
                        }
                      },
                    ),
                    if (!isDirect && groups.isEmpty && !provider.isLoading)
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
