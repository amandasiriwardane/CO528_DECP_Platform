import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/job_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import 'package:intl/intl.dart';
import '../../../shared/screens/menu_screen.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});

  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JobProvider>().fetchJobs();
    });
  }

  @override
  Widget build(BuildContext context) {
    final jobProvider = context.watch<JobProvider>();
    final user = context.watch<AuthProvider>().user;
    final initials = (user?.username.isNotEmpty == true) ? user!.username[0].toUpperCase() : 'U';

    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: const MenuDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: const Text('Jobs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
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
      body: jobProvider.isLoading && jobProvider.jobs.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: jobProvider.fetchJobs,
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Job Board',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A), // Tailwind slate-900 like web
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Discover opportunities mapped exactly to your degree path.',
                            style: TextStyle(
                              fontSize: 15,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (jobProvider.jobs.isEmpty && !jobProvider.isLoading)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Text(
                          'No jobs available at the moment.',
                          style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final job = jobProvider.jobs[index];
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
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(job.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                        ),
                                        const Chip(
                                          label: Text('Full Time', style: TextStyle(fontSize: 12, color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
                                          backgroundColor: AppColors.background,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.business_center, size: 16, color: AppColors.accent),
                                        const SizedBox(width: 6),
                                        Text(job.username, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                                        const SizedBox(width: 16),
                                        const Icon(Icons.access_time, size: 16, color: Colors.orange),
                                        const SizedBox(width: 6),
                                        Text(DateFormat('MMM d, yyyy').format(job.createdAt), style: const TextStyle(color: AppColors.textSecondary)),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(job.description, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 15, height: 1.4)),
                                    const SizedBox(height: 20),
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        onPressed: job.hasApplied ? null : () {
                                          context.read<JobProvider>().applyForJob(job.id);
                                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mock CV Submitted Successfully!')));
                                        },
                                        style: ElevatedButton.styleFrom(
                                          padding: const EdgeInsets.symmetric(vertical: 14),
                                          backgroundColor: job.hasApplied ? AppColors.successLight : AppColors.textPrimary,
                                          foregroundColor: job.hasApplied ? AppColors.success : Colors.white,
                                          disabledBackgroundColor: AppColors.successLight,
                                          disabledForegroundColor: AppColors.success,
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                          elevation: job.hasApplied ? 0 : 2,
                                        ),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            if (job.hasApplied) const Icon(Icons.check_circle, size: 18),
                                            if (job.hasApplied) const SizedBox(width: 8),
                                            Text(job.hasApplied ? 'Applied' : 'Apply Now', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                          ],
                                        ),
                                      ),
                                    )
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: jobProvider.jobs.length,
                      ),
                    ),
                  const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
                ],
              ),
            ),
    );
  }
}
