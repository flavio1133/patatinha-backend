import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models/pet_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/constants/app_constants.dart';

class PetFormPage extends StatefulWidget {
  final Pet? pet;
  final int? customerId;

  const PetFormPage({super.key, this.pet, this.customerId});

  @override
  State<PetFormPage> createState() => _PetFormPageState();
}

class _PetFormPageState extends State<PetFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _breedController = TextEditingController();
  final _ageController = TextEditingController();
  final _colorController = TextEditingController();
  final _weightController = TextEditingController();
  final _importantInfoController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedSpecies = 'dog';
  DateTime? _selectedBirthDate;
  List<String> _behaviorAlerts = [];
  final List<String> _availableBehaviorAlerts = [
    'Agitado',
    'Medroso',
    'Agressivo com outros cães',
    'Não gosta de secador',
    'Morde',
    'Late muito',
  ];

  // Preferências de tosa
  String? _hairLength;
  String? _shampooType;
  List<String> _finishing = [];
  final List<String> _availableFinishing = ['Perfume', 'Laços', 'Gravata', 'Acessórios'];

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.pet != null) {
      final pet = widget.pet!;
      _nameController.text = pet.name;
      _breedController.text = pet.breed ?? '';
      _ageController.text = pet.age?.toString() ?? '';
      _colorController.text = pet.color ?? '';
      _weightController.text = pet.weight?.toString() ?? '';
      _importantInfoController.text = pet.importantInfo ?? '';
      _selectedSpecies = pet.species;
      _selectedBirthDate = pet.birthDate;
      _behaviorAlerts = List.from(pet.behaviorAlerts);
      _hairLength = pet.groomingPreferences.hairLength;
      _shampooType = pet.groomingPreferences.shampooType;
      _finishing = List.from(pet.groomingPreferences.finishing);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    _ageController.dispose();
    _colorController.dispose();
    _weightController.dispose();
    _importantInfoController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectBirthDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedBirthDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _selectedBirthDate = picked;
      });
    }
  }

  Future<void> _savePet() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final data = {
        'name': _nameController.text.trim(),
        'species': _selectedSpecies,
        'breed': _breedController.text.trim().isEmpty
            ? null
            : _breedController.text.trim(),
        'age': _ageController.text.trim().isEmpty
            ? null
            : int.tryParse(_ageController.text.trim()),
        'birthDate': _selectedBirthDate?.toIso8601String(),
        'color': _colorController.text.trim().isEmpty
            ? null
            : _colorController.text.trim(),
        'weight': _weightController.text.trim().isEmpty
            ? null
            : double.tryParse(_weightController.text.trim()),
        'importantInfo': _importantInfoController.text.trim().isEmpty
            ? null
            : _importantInfoController.text.trim(),
        'behaviorAlerts': _behaviorAlerts,
        'groomingPreferences': {
          'hairLength': _hairLength,
          'shampooType': _shampooType,
          'finishing': _finishing,
          'notes': _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        },
        if (widget.customerId != null) 'customerId': widget.customerId,
      };

      if (widget.pet == null) {
        await ApiService.createPet(token, data);
      } else {
        await ApiService.updatePet(token, widget.pet!.id, data);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.pet == null
                  ? 'Pet cadastrado com sucesso!'
                  : 'Pet atualizado com sucesso!',
            ),
            backgroundColor: Colors.green,
          ),
        );
        context.pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao salvar pet: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.pet == null ? 'Novo Pet' : 'Editar Pet'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Informações Básicas
              Text(
                'Informações Básicas',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nome do Pet *',
                  prefixIcon: Icon(Icons.pets),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Nome é obrigatório';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedSpecies,
                decoration: const InputDecoration(
                  labelText: 'Espécie *',
                  prefixIcon: Icon(Icons.category),
                ),
                items: AppConstants.petSpecies.map((species) {
                  return DropdownMenuItem(
                    value: species,
                    child: Text(species == 'dog'
                        ? 'Cachorro'
                        : species == 'cat'
                            ? 'Gato'
                            : species == 'bird'
                                ? 'Pássaro'
                                : species == 'rabbit'
                                    ? 'Coelho'
                                    : 'Outro'),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedSpecies = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _breedController,
                decoration: const InputDecoration(
                  labelText: 'Raça',
                  prefixIcon: Icon(Icons.pets),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _ageController,
                      decoration: const InputDecoration(
                        labelText: 'Idade (anos)',
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: InkWell(
                      onTap: _selectBirthDate,
                      child: InputDecorator(
                        decoration: const InputDecoration(
                          labelText: 'Data de Nascimento',
                          prefixIcon: Icon(Icons.cake),
                        ),
                        child: Text(
                          _selectedBirthDate != null
                              ? '${_selectedBirthDate!.day}/${_selectedBirthDate!.month}/${_selectedBirthDate!.year}'
                              : 'Selecione',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _colorController,
                      decoration: const InputDecoration(
                        labelText: 'Cor',
                        prefixIcon: Icon(Icons.palette),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextFormField(
                      controller: _weightController,
                      decoration: const InputDecoration(
                        labelText: 'Peso (kg)',
                        prefixIcon: Icon(Icons.monitor_weight),
                      ),
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Alerta Importante
              Text(
                '⚠️ Informação Importante',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _importantInfoController,
                decoration: const InputDecoration(
                  labelText: 'Ex: Diabético, medicação contínua, etc.',
                  prefixIcon: Icon(Icons.warning, color: Colors.red),
                  hintText: 'Deixe em branco se não houver',
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 24),
              
              // Alertas de Comportamento
              Text(
                'Alertas de Comportamento',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableBehaviorAlerts.map((alert) {
                  final isSelected = _behaviorAlerts.contains(alert);
                  return FilterChip(
                    label: Text(alert),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _behaviorAlerts.add(alert);
                        } else {
                          _behaviorAlerts.remove(alert);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              
              // Preferências de Corte
              Text(
                'Preferências de Corte',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _hairLength,
                decoration: const InputDecoration(
                  labelText: 'Comprimento do Pelo',
                  prefixIcon: Icon(Icons.content_cut),
                ),
                items: ['Curto', 'Médio', 'Longo'].map((length) {
                  return DropdownMenuItem(
                    value: length.toLowerCase(),
                    child: Text(length),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _hairLength = value);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Tipo de Shampoo',
                  prefixIcon: Icon(Icons.shower),
                ),
                controller: TextEditingController(text: _shampooType),
                onChanged: (value) => _shampooType = value.isEmpty ? null : value,
              ),
              const SizedBox(height: 16),
              Text(
                'Finalização',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableFinishing.map((item) {
                  final isSelected = _finishing.contains(item);
                  return FilterChip(
                    label: Text(item),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _finishing.add(item);
                        } else {
                          _finishing.remove(item);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _notesController,
                decoration: const InputDecoration(
                  labelText: 'Observações',
                  prefixIcon: Icon(Icons.note),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: _isLoading ? null : _savePet,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(widget.pet == null ? 'Cadastrar' : 'Salvar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
