import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

import 'package:provider/provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/messages_provider.dart';
import 'package:intl/intl.dart';

class ChatScreen extends StatefulWidget {
  final int userId; // Also acts as groupId if isGroup == true
  final String userName; // Acts as groupName
  final String role; // Acts as group role
  final String initial;
  final bool isGroup;

  const ChatScreen({
    super.key,
    required this.userId,
    required this.userName,
    required this.role,
    required this.initial,
    this.isGroup = false,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.isGroup) {
        context.read<MessagesProvider>().fetchGroupMessages(widget.userId);
      } else {
        context.read<MessagesProvider>().fetchMessages(widget.userId);
      }
    });
  }

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    
    if (widget.isGroup) {
      context.read<MessagesProvider>().sendGroupMessage(widget.userId, text);
    } else {
      context.read<MessagesProvider>().sendMessage(widget.userId, text);
    }
    _messageController.clear();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final me = context.watch<AuthProvider>().user;
    final provider = context.watch<MessagesProvider>();
    final messages = provider.activeChatMessages;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        centerTitle: false,
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primary.withOpacity(0.15),
              child: Text(
                widget.initial,
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark, fontSize: 14),
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.userName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF0F172A))),
                Text(widget.role, style: const TextStyle(fontSize: 12, color: AppColors.primaryDark)),
              ],
            )
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Colors.grey.withOpacity(0.1), height: 1),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: provider.isLoading && messages.isEmpty
              ? const Center(child: CircularProgressIndicator())
              : ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[index];
                final isMe = message.senderId.toString() == me?.id;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        if (!isMe && widget.isGroup && message.senderUsername != null)
                          Padding(
                            padding: const EdgeInsets.only(left: 4, bottom: 4),
                            child: Text(
                              message.senderUsername!.toUpperCase(),
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary),
                            ),
                          ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: isMe ? const Color(0xFF10B981) : const Color(0xFFF1F5F9), // emerald-500 or slate-100
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(16),
                              topRight: const Radius.circular(16),
                              bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                              bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                message.content,
                                style: TextStyle(
                                  color: isMe ? Colors.white : AppColors.textPrimary,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                DateFormat('h:mm a').format(message.createdAt),
                                style: TextStyle(
                                  fontSize: 10,
                                  color: isMe ? Colors.white.withOpacity(0.7) : AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Input Area
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.withOpacity(0.1))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.grey.withOpacity(0.2)),
                      ),
                      child: TextField(
                        controller: _messageController,
                        decoration: const InputDecoration(
                          hintText: 'Write something...',
                          hintStyle: TextStyle(color: Color(0xFF64748B), fontSize: 14),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: _sendMessage,
                    child: CircleAvatar(
                      radius: 24,
                      backgroundColor: const Color(0xFFA7F3D0), // green-200
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
