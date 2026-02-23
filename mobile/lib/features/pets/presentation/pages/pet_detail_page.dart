import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/pet_model.dart';
import '../../../../core/models/medical_record_model.dart';
import '../../../../core/models/vaccination_model.dart';
import '../../../../core/models/photo_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import 'pet_form_page.dart';
import '../../../medical_records/presentation/pages/medical_records_page.dart';
import '../../../vaccinations/presentation/pages/vaccinations_page.dart';
import '../../../photos/presentation/pages/photos_gallery_page.dart';

class PetDetailPage extends StatefulWidget {
  final int petId;

  const PetDetailPage({super.key, required this.petId});

  @override
  State<PetDetailPage> createState() => _PetDetailPageState();
}

class _PetDetailPageState extends State<PetDetailPage> {
  Pet? _pet;
  List<MedicalRecord> _medicalRecords = [];
  List<Vaccination> _vaccinations = [];
  List<PetPhoto> _photos = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPetData();
  }

  Future<void> _loadPetData() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final petData = await ApiService.getPet(token, widget.petId);
      final recordsData = await ApiService.getMedicalRecords(token, widget.petId);
      final vaccinationsData = await ApiService.getVaccinations(token, widget.petId);
      final photosData = await ApiService.getPetPhotos(token, widget.petId);

      setState(() {
        _pet = Pet.fromJson(petData);
        _medicalRecords = recordsData
            .map((json) => MedicalRecord.fromJson(json))
            .toList();
        _vaccinations = vaccinationsData
            .map((json) => Vaccination.fromJson(json))
            .toList();
        _photos = photosData.map((json) => PetPhoto.fromJson(json)).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erro ao carregar dados: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Pet')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_pet == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Pet')),
        body: const Center(child: Text('Pet não encontrado')),
      );
    }

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: Text(_pet!.name),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () async {
                final result = await context.push(
                  '/pets/${_pet!.id}/edit',
                  extra: _pet,
                );
                if (result == true) {
                  _loadPetData();
                }
              },
            ),
          ],
          bottom: const TabBar(
            isScrollable: true,
            tabs: [
              Tab(text: 'Info', icon: Icon(Icons.info)),
              Tab(text: 'Prontuário', icon: Icon(Icons.medical_services)),
              Tab(text: 'Vacinas', icon: Icon(Icons.vaccines)),
              Tab(text: 'Fotos', icon: Icon(Icons.photo_library)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Aba de Informações
            _buildInfoTab(),
            // Aba de Prontuário
            MedicalRecordsPage(petId: widget.petId),
            // Aba de Vacinas
            VaccinationsPage(petId: widget.petId),
            // Aba de Fotos
            PhotosGalleryPage(petId: widget.petId),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Foto do pet
          if (_pet!.photo != null)
            Center(
              child: CircleAvatar(
                radius: 60,
                backgroundImage: NetworkImage(_pet!.photo!),
              ),
            ),
          const SizedBox(height: 24),
          
          // Alerta importante
          if (_pet!.importantInfo != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red, width: 2),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning, color: Colors.red, size: 32),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ATENÇÃO!',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.red,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _pet!.importantInfo!,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          
          // Informações básicas
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Informações Básicas',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  _buildInfoRow('Espécie', _pet!.species == 'dog' ? 'Cachorro' : _pet!.species == 'cat' ? 'Gato' : 'Outro'),
                  if (_pet!.breed != null) _buildInfoRow('Raça', _pet!.breed!),
                  if (_pet!.age != null) _buildInfoRow('Idade', '${_pet!.age} anos'),
                  if (_pet!.birthDate != null)
                    _buildInfoRow(
                      'Data de Nascimento',
                      '${_pet!.birthDate!.day}/${_pet!.birthDate!.month}/${_pet!.birthDate!.year}',
                    ),
                  if (_pet!.color != null) _buildInfoRow('Cor', _pet!.color!),
                  if (_pet!.weight != null) _buildInfoRow('Peso', '${_pet!.weight} kg'),
                ],
              ),
            ),
          ),
          
          // Alertas de comportamento
          if (_pet!.behaviorAlerts.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Alertas de Comportamento',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _pet!.behaviorAlerts.map((alert) {
                        return Chip(
                          label: Text(alert),
                          backgroundColor: Colors.orange[100],
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ],
          
          // Preferências de corte
          if (_pet!.groomingPreferences.hairLength != null ||
              _pet!.groomingPreferences.shampooType != null ||
              _pet!.groomingPreferences.finishing.isNotEmpty) ...[
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Preferências de Corte',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    if (_pet!.groomingPreferences.hairLength != null)
                      _buildInfoRow('Comprimento', _pet!.groomingPreferences.hairLength!),
                    if (_pet!.groomingPreferences.shampooType != null)
                      _buildInfoRow('Shampoo', _pet!.groomingPreferences.shampooType!),
                    if (_pet!.groomingPreferences.finishing.isNotEmpty)
                      _buildInfoRow(
                        'Finalização',
                        _pet!.groomingPreferences.finishing.join(', '),
                      ),
                    if (_pet!.groomingPreferences.notes != null)
                      _buildInfoRow('Observações', _pet!.groomingPreferences.notes!),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
