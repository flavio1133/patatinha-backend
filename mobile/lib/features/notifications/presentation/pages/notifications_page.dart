import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/services/api_service.dart';

const _typeIcons = {
  'appointment_reminder': '📅',
  'pet_ready': '🐶',
  'check_in': '✅',
  'vaccine_alert': '💉',
  'promotion': '🎉',
  'payment': '💰',
  'low_stock_alert': '⚠️',
  'new_appointment': '📅',
  'payment_received': '💰',
  'subscription_expiring': '⚠️',
  'system': '🔔',
};

String _formatTime(String? dateStr) {
  if (dateStr == null) return '';
  final d = DateTime.tryParse(dateStr);
  if (d == null) return dateStr;
  final now = DateTime.now();
  final diff = now.difference(d);

  if (diff.inMinutes < 1) return 'Agora mesmo';
  if (diff.inMinutes < 60) return '${diff.inMinutes}min atrás';
  if (diff.inHours < 24) return '${diff.inHours}h atrás';
  if (diff.inDays < 7) return '${diff.inDays} dias atrás';
  return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
}

String _getIcon(String? type) => _typeIcons[type ?? ''] ?? '🔔';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key});

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  List<dynamic> _notifications = [];
  int _unreadCount = 0;
  bool _loading = true;
  bool _refreshing = false;

  Future<void> _loadNotifications() async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) {
      setState(() {
        _notifications = [];
        _unreadCount = 0;
        _loading = false;
      });
      return;
    }
    try {
      final res = await ApiService.getNotifications(auth.token!);
      if (mounted) {
        setState(() {
          _notifications = List<dynamic>.from(res['notifications'] ?? []);
          _unreadCount = res['unread_count'] ?? 0;
          _loading = false;
          _refreshing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _refreshing = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar: $e')),
        );
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) return;
    try {
      await ApiService.markNotificationAsRead(auth.token!, id);
      if (mounted) {
        setState(() {
          _notifications = _notifications.map<dynamic>((n) {
            if (n['id'] == id) {
              return {...n, 'status': 'read'};
            }
            return n;
          }).toList();
          _unreadCount = (_unreadCount - 1).clamp(0, 999);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro: $e')),
        );
      }
    }
  }

  Future<void> _markAllAsRead() async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) return;
    try {
      await ApiService.markAllNotificationsAsRead(auth.token!);
      if (mounted) {
        setState(() {
          _notifications = _notifications.map<dynamic>((n) => {...n, 'status': 'read'}).toList();
          _unreadCount = 0;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro: $e')),
        );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
        title: const Text('Notificações'),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text('Marcar todas como lidas'),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async {
                setState(() => _refreshing = true);
                await _loadNotifications();
              },
              child: _notifications.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 80),
                        Center(
                          child: Text(
                            'Nenhuma notificação',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) {
                        final n = _notifications[index];
                        final isRead = n['status'] == 'read';
                        return InkWell(
                          onTap: () {
                            if (!isRead) _markAsRead(n['id']?.toString() ?? '');
                          },
                          child: Container(
                            color: isRead ? Colors.white : const Color(0xFFFFF9F5),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _getIcon(n['type']),
                                  style: const TextStyle(fontSize: 24),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        n['title']?.toString() ?? '',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w600,
                                          fontSize: 16,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        n['body']?.toString() ?? '',
                                        style: TextStyle(
                                          fontSize: 14,
                                          color: Colors.grey[700],
                                        ),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        _formatTime(n['created_at']?.toString()),
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey[500],
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
    );
  }
}
