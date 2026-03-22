import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/messages_provider.dart';
import '../../../core/constants/app_colors.dart';

class CreateGroupDialog extends StatefulWidget {
  const CreateGroupDialog({super.key});

  @override
  State<CreateGroupDialog> createState() => _CreateGroupDialogState();
}

class _CreateGroupDialogState extends State<CreateGroupDialog> {
  final TextEditingController _nameController = TextEditingController();
  final Set<int> _selectedMembers = {};

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  void _createGroup() {
    final name = _nameController.text.trim();
    if (name.isEmpty || _selectedMembers.isEmpty) return;

    context.read<MessagesProvider>().createGroup(name, _selectedMembers.toList());
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final users = context.watch<MessagesProvider>().users;
    final isButtonEnabled = _nameController.text.trim().isNotEmpty && _selectedMembers.isNotEmpty;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: Colors.white,
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        width: double.infinity,
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'New Group Chat',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close, color: Color(0xFF0F172A), size: 20),
                  )
                ],
              ),
            ),
            const Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
            Flexible(
              child: ListView(
                shrinkWrap: true,
                padding: const EdgeInsets.all(24),
                children: [
                  const Text('GROUP NAME', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: TextField(
                      controller: _nameController,
                      onChanged: (_) => setState(() {}),
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('INVITE MEMBERS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  ...users.map((user) {
                    final isSelected = _selectedMembers.contains(user.id);
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          if (isSelected) {
                            _selectedMembers.remove(user.id);
                          } else {
                            _selectedMembers.add(user.id);
                          }
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(color: isSelected ? const Color(0xFF4F46E5) : const Color(0xFF94A3B8), width: 1.5),
                                color: isSelected ? const Color(0xFF4F46E5) : Colors.transparent,
                              ),
                              child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                '${user.firstName.isNotEmpty ? user.firstName : user.username} (${user.role})',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(0xFF334155)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              child: GestureDetector(
                onTap: isButtonEnabled ? _createGroup : null,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: isButtonEnabled ? const Color(0xFF8B949E) : const Color(0xFF8B949E).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Center(
                    child: Text(
                      'Create Group',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
