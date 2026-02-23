import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/models/professional_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';

class ProfessionalsPage extends StatefulWidget {
  const ProfessionalsPage({super.key});

  @override
  State<ProfessionalsPage> createState() => _ProfessionalsPageState();
}

class _ProfessionalsPageState extends State<ProfessionalsPage> {
  List<Professional> _professionals = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfessionals();
  }

  Future<void> _loadProfessionals() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = await ApiService.getProfessionals(token);
      setState(() {
        _professionals = data.map((json) => Professional.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar profissionais: $e')),
        );
      }
    }
  }

  String _getSpecialtyLabel(String specialty) {
    switch (specialty) {
      case 'banho':
        return 'Banho';
      case 'tosa':
        return 'Tosa';
      case 'gatos':
        return 'Gatos';
      case 'caes_grandes':
        return 'Cães Grandes';
      default:
        return specialty;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profissionais'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _professionals.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        'Nenhum profissional cadastrado',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadProfessionals,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _professionals.length,
                    itemBuilder: (context, index) {
                      final professional = _professionals[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: professional.isActive
                                ? Theme.of(context).colorScheme.primary
                                : Colors.grey,
                            child: Text(
                              professional.name[0].toUpperCase(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  professional.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              if (!professional.isActive)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[300],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    'Inativo',
                                    style: TextStyle(fontSize: 10),
                                  ),
                                ),
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              if (professional.specialties.isNotEmpty)
                                Wrap(
                                  spacing: 4,
                                  runSpacing: 4,
                                  children: professional.specialties.map((spec) {
                                    return Chip(
                                      label: Text(
                                        _getSpecialtyLabel(spec),
                                        style: const TextStyle(fontSize: 10),
                                      ),
                                      padding: EdgeInsets.zero,
                                      materialTapTargetSize:
                                          MaterialTapTargetSize.shrinkWrap,
                                    );
                                  }).toList(),
                                ),
                              const SizedBox(height: 4),
                              Text(
                                'Velocidade média: ${professional.averageSpeed} min',
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                              Text(
                                'Horário: ${professional.workSchedule.start} - ${professional.workSchedule.end}',
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
                              ),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            // TODO: Abrir detalhes do profissional
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
