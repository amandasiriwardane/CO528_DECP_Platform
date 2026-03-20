import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/feed_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/screens/menu_screen.dart';
import '../../../shared/widgets/notifications_dialog.dart';
import '../../profile/screens/profile_screen.dart';

class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  State<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  final TextEditingController _postController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<FeedProvider>().fetchPosts();
    });
  }

  @override
  void dispose() {
    _postController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final feedProvider = context.watch<FeedProvider>();
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.username.isNotEmpty == true) ? user!.username[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const MenuDrawer(),
      appBar: AppBar(
        title: const Text('Feed', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
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
      body: feedProvider.isLoading && feedProvider.posts.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: feedProvider.fetchPosts,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey.withOpacity(0.1)),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.01), blurRadius: 10, offset: const Offset(0, 4))
                          ],
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  backgroundColor: AppColors.primary.withOpacity(0.2),
                                  child: Text(initials, style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF8FAFC), // Web App brand-50 or Slate-50 background look
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: TextField(
                                      controller: _postController,
                                      maxLines: 3,
                                      minLines: 1,
                                      decoration: const InputDecoration.collapsed(
                                        hintText: 'Share your thoughts, projects, or questions...',
                                        hintStyle: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                TextButton.icon(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Media picker coming soon!')));
                                  },
                                  icon: const Icon(Icons.image_outlined, color: AppColors.textSecondary, size: 20),
                                  label: const Text('Add Media', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                                ),
                                ElevatedButton.icon(
                                  onPressed: () {
                                    if (_postController.text.trim().isNotEmpty) {
                                      context.read<FeedProvider>().createPost(_postController.text.trim());
                                      _postController.clear();
                                      FocusScope.of(context).unfocus();
                                    }
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary.withOpacity(0.8), // Slightly transparent green like web
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                    elevation: 0,
                                  ),
                                  icon: const Text('Post', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                  label: const Icon(Icons.send_outlined, size: 16),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (feedProvider.posts.isEmpty && !feedProvider.isLoading)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Text(
                          'No posts yet. Be the first to share something!',
                          style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final post = feedProvider.posts[index];
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                            child: Card(
                              elevation: 0,
                              color: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: Colors.grey.withOpacity(0.1)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(20.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          backgroundColor: AppColors.primary.withOpacity(0.1),
                                          child: Text(post.username.isNotEmpty ? post.username[0].toUpperCase() : 'U'),
                                        ),
                                        const SizedBox(width: 12),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text('${post.firstName} ${post.lastName}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                            Text('@${post.username} • ${post.role}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(post.content, style: const TextStyle(fontSize: 15, height: 1.4)),
                                    if (post.imageUrl != null) ...[
                                      const SizedBox(height: 16),
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Image.network(
                                          'http://10.0.2.2:8080${post.imageUrl}', 
                                          width: double.infinity,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                                        ),
                                      ),
                                    ],
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Icon(
                                          post.isLiked ? Icons.favorite : Icons.favorite_border, 
                                          size: 20, 
                                          color: post.isLiked ? Colors.red : AppColors.textSecondary
                                        ),
                                        const SizedBox(width: 6),
                                        Text('${post.likesCount}', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                                        const SizedBox(width: 20),
                                        const Icon(Icons.comment_outlined, size: 20, color: AppColors.textSecondary),
                                        const SizedBox(width: 6),
                                        Text('${post.commentsCount}', style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                                      ],
                                    )
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: feedProvider.posts.length,
                      ),
                    ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
                ],
              ),
            ),
    );
  }
}
