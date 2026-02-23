import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/models/appointment_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import 'appointment_detail_page.dart';

class ScheduleDashboardPage extends StatefulWidget {
  const ScheduleDashboardPage({super.key});

  @override
  State<ScheduleDashboardPage> createState() => _ScheduleDashboardPageState();
}

class _ScheduleDashboardPageState extends State<ScheduleDashboardPage> {
  DateTime _weekStart = DateTime.now();
  Map<String, List<Appointment>> _weeklySchedule = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadWeeklySchedule();
  }

  void _adjustWeekStart(int days) {
    setState(() {
      _weekStart = _weekStart.add(Duration(days: days));
      _loadWeeklySchedule();
    });
  }

  Future<void> _loadWeeklySchedule() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      // Ajustar para segunda-feira
      final weekday = _weekStart.weekday; // 1 = segunda, 7 = domingo
      final monday = _weekStart.subtract(Duration(days: weekday == 7 ? 6 : weekday - 1));
      final startDate = DateFormat('yyyy-MM-dd').format(monday);

      final data = await ApiService.getWeeklySchedule(token, startDate);
      
      setState(() {
        _weeklySchedule = {};
        if (data['schedule'] != null) {
          for (var daySchedule in data['schedule']) {
            final date = daySchedule['date'] as String;
            final appointments = (daySchedule['appointments'] as List<dynamic>?)
                    ?.map((json) => Appointment.fromJson(json))
                    .toList() ??
                [];
            _weeklySchedule[date] = appointments;
          }
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar agenda: $e')),
        );
      }
    }
  }

  List<DateTime> get _weekDays {
    final weekday = _weekStart.weekday; // 1 = segunda, 7 = domingo
    final monday = _weekStart.subtract(Duration(days: weekday == 7 ? 6 : weekday - 1));
    return List.generate(7, (index) => monday.add(Duration(days: index)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agenda Semanal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.today),
            onPressed: () {
              setState(() {
                _weekStart = DateTime.now();
              });
              _loadWeeklySchedule();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Controles de semana
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surface,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  onPressed: () => _adjustWeekStart(-7),
                ),
                Text(
                  '${DateFormat('dd/MM').format(_weekDays.first)} - ${DateFormat('dd/MM/yyyy').format(_weekDays.last)}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  onPressed: () => _adjustWeekStart(7),
                ),
              ],
            ),
          ),
          // Grade semanal
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: _loadWeeklySchedule,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _weekDays.length,
                      itemBuilder: (context, index) {
                        final day = _weekDays[index];
                        final dateStr = DateFormat('yyyy-MM-dd').format(day);
                        final appointments = _weeklySchedule[dateStr] ?? [];
                        
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: ExpansionTile(
                            leading: CircleAvatar(
                              backgroundColor: _isToday(day)
                                  ? Theme.of(context).colorScheme.primary
                                  : Colors.grey[300],
                              child: Text(
                                DateFormat('d').format(day),
                                style: TextStyle(
                                  color: _isToday(day) ? Colors.white : Colors.black,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              DateFormat('EEEE', 'pt_BR').format(day),
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: _isToday(day)
                                    ? Theme.of(context).colorScheme.primary
                                    : null,
                              ),
                            ),
                            subtitle: Text(
                              '${appointments.length} agendamento(s)',
                            ),
                            children: appointments.isEmpty
                                ? [
                                    const Padding(
                                      padding: EdgeInsets.all(16.0),
                                      child: Text('Nenhum agendamento'),
                                    ),
                                  ]
                                : appointments.map((apt) {
                                    return ListTile(
                                      leading: CircleAvatar(
                                        backgroundColor: _getStatusColor(apt.status),
                                        radius: 20,
                                        child: Icon(
                                          _getStatusIcon(apt.status),
                                          color: Colors.white,
                                          size: 16,
                                        ),
                                      ),
                                      title: Text(
                                        apt.petName ?? 'Pet #${apt.petId}',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('${apt.serviceLabel} - ${apt.time}'),
                                          if (apt.professionalName != null)
                                            Text(
                                              apt.professionalName!,
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                                fontSize: 12,
                                              ),
                                            ),
                                        ],
                                      ),
                                      trailing: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _getStatusColor(apt.status)
                                              .withOpacity(0.2),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Text(
                                          apt.statusLabel,
                                          style: TextStyle(
                                            color: _getStatusColor(apt.status),
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) =>
                                                AppointmentDetailPage(
                                              appointmentId: apt.id,
                                            ),
                                          ),
                                        ).then((_) => _loadWeeklySchedule());
                                      },
                                    );
                                  }).toList(),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  bool _isToday(DateTime date) {
    final today = DateTime.now();
    return date.year == today.year &&
        date.month == today.month &&
        date.day == today.day;
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'confirmed':
        return Colors.blue;
      case 'checked_in':
        return Colors.orange;
      case 'in_progress':
        return Colors.purple;
      case 'completed':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'confirmed':
        return Icons.check_circle;
      case 'checked_in':
        return Icons.login;
      case 'in_progress':
        return Icons.work;
      case 'completed':
        return Icons.done_all;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.info;
    }
  }
}
