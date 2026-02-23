import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/models/appointment_model.dart';
import '../../../../core/models/pet_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';

class AppointmentBookingPage extends StatefulWidget {
  final int? petId;
  final int? customerId;

  const AppointmentBookingPage({super.key, this.petId, this.customerId});

  @override
  State<AppointmentBookingPage> createState() => _AppointmentBookingPageState();
}

class _AppointmentBookingPageState extends State<AppointmentBookingPage> {
  int? _selectedPetId;
  String? _selectedService;
  DateTime? _selectedDate;
  String? _selectedTime;
  String? _selectedProfessionalId;
  final TextEditingController _notesController = TextEditingController();

  List<Pet> _pets = [];
  List<ProfessionalAvailability> _availability = [];
  bool _isLoadingPets = true;
  bool _isLoadingAvailability = false;
  bool _isSubmitting = false;

  final List<String> _services = ['banho', 'tosa', 'banho_tosa', 'veterinario'];

  @override
  void initState() {
    super.initState();
    _loadPets();
    if (widget.petId != null) {
      _selectedPetId = widget.petId;
    }
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadPets() async {
    setState(() => _isLoadingPets = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      List<dynamic> petsData;
      if (widget.customerId != null) {
        petsData = await ApiService.getPetsByCustomer(token, widget.customerId!);
      } else {
        petsData = await ApiService.getPets(token);
      }

      setState(() {
        _pets = petsData.map((json) => Pet.fromJson(json)).toList();
        if (_pets.isNotEmpty && _selectedPetId == null) {
          _selectedPetId = _pets.first.id;
        }
        _isLoadingPets = false;
      });
    } catch (e) {
      setState(() => _isLoadingPets = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar pets: $e')),
        );
      }
    }
  }

  Future<void> _loadAvailability() async {
    if (_selectedDate == null || _selectedService == null) return;

    setState(() => _isLoadingAvailability = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final data = await ApiService.checkAvailability(token, dateStr, _selectedService!);
      final availabilityResponse = AvailabilityResponse.fromJson(data);

      setState(() {
        _availability = availabilityResponse.availability;
        _isLoadingAvailability = false;
      });
    } catch (e) {
      setState(() => _isLoadingAvailability = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar disponibilidade: $e')),
        );
      }
    }
  }

  Future<void> _submitAppointment() async {
    if (_selectedPetId == null ||
        _selectedService == null ||
        _selectedDate == null ||
        _selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha todos os campos obrigatórios')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final data = {
        'petId': _selectedPetId,
        'service': _selectedService,
        'date': dateStr,
        'time': _selectedTime,
        'notes': _notesController.text.trim().isEmpty
            ? null
            : _notesController.text.trim(),
        if (widget.customerId != null) 'customerId': widget.customerId,
        if (_selectedProfessionalId != null)
          'professionalId': int.parse(_selectedProfessionalId!),
      };

      await ApiService.createAppointment(token, data);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Agendamento criado com sucesso!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao criar agendamento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  String _getServiceLabel(String service) {
    switch (service) {
      case 'banho':
        return 'Banho';
      case 'tosa':
        return 'Tosa';
      case 'banho_tosa':
        return 'Banho & Tosa';
      case 'veterinario':
        return 'Veterinário';
      default:
        return service;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Novo Agendamento'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Seleção de Pet
            if (_isLoadingPets)
              const Center(child: CircularProgressIndicator())
            else if (_pets.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Nenhum pet cadastrado'),
                ),
              )
            else
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Pet *',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<int>(
                        value: _selectedPetId,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.pets),
                        ),
                        items: _pets.map((pet) {
                          return DropdownMenuItem(
                            value: pet.id,
                            child: Text(pet.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() => _selectedPetId = value);
                        },
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 16),

            // Seleção de Serviço
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Serviço *',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _services.map((service) {
                        final isSelected = _selectedService == service;
                        return FilterChip(
                          label: Text(_getServiceLabel(service)),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedService = selected ? service : null;
                              _selectedTime = null;
                              _availability = [];
                            });
                            if (selected && _selectedDate != null) {
                              _loadAvailability();
                            }
                          },
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Seleção de Data
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Data *',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _selectedDate ?? DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 60)),
                        );
                        if (picked != null) {
                          setState(() {
                            _selectedDate = picked;
                            _selectedTime = null;
                            _availability = [];
                          });
                          if (_selectedService != null) {
                            _loadAvailability();
                          }
                        }
                      },
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.calendar_today),
                          suffixIcon: Icon(Icons.arrow_drop_down),
                        ),
                        child: Text(
                          _selectedDate != null
                              ? DateFormat('dd/MM/yyyy').format(_selectedDate!)
                              : 'Selecione a data',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Horários Disponíveis
            if (_isLoadingAvailability)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Center(child: CircularProgressIndicator()),
                ),
              )
            else if (_availability.isNotEmpty && _selectedService != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Horários Disponíveis *',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      ..._availability.map((profAvail) {
                        if (profAvail.availableSlots.isEmpty) {
                          return const SizedBox.shrink();
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (_availability.length > 1)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Text(
                                  '${profAvail.professionalName} (${profAvail.currentAppointments} agendamentos)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              ),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: profAvail.availableSlots.map((slot) {
                                final isSelected = _selectedTime == slot.time &&
                                    _selectedProfessionalId == profAvail.professionalId.toString();
                                return FilterChip(
                                  label: Text(slot.time),
                                  selected: isSelected,
                                  onSelected: slot.available
                                      ? (selected) {
                                          setState(() {
                                            if (selected) {
                                              _selectedTime = slot.time;
                                              _selectedProfessionalId =
                                                  profAvail.professionalId.toString();
                                            } else {
                                              _selectedTime = null;
                                              _selectedProfessionalId = null;
                                            }
                                          });
                                        }
                                      : null,
                                  backgroundColor: slot.available
                                      ? null
                                      : Colors.grey[300],
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 16),
                          ],
                        );
                      }),
                    ],
                  ),
                ),
              )
            else if (_selectedDate != null && _selectedService != null)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Nenhum horário disponível para esta data'),
                ),
              ),
            const SizedBox(height: 16),

            // Observações
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Observações',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        hintText: 'Alguma observação especial?',
                        prefixIcon: Icon(Icons.note),
                      ),
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Botão de Agendar
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitAppointment,
              child: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Confirmar Agendamento'),
            ),
          ],
        ),
      ),
    );
  }
}
