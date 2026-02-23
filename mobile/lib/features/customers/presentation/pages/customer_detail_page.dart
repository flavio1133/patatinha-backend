import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/models/customer_model.dart';
import '../../../../core/models/pet_model.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../pets/presentation/pages/pet_form_page.dart';
import '../../../pets/presentation/pages/pet_detail_page.dart';

class CustomerDetailPage extends StatefulWidget {
  final int customerId;

  const CustomerDetailPage({super.key, required this.customerId});

  @override
  State<CustomerDetailPage> createState() => _CustomerDetailPageState();
}

class _CustomerDetailPageState extends State<CustomerDetailPage> {
  Customer? _customer;
  List<Pet> _pets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCustomerData();
  }

  Future<void> _loadCustomerData() async {
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;
      if (token == null) return;

      final customerData = await ApiService.getCustomer(token, widget.customerId);
      final petsData = await ApiService.getPetsByCustomer(token, widget.customerId);

      setState(() {
        _customer = Customer.fromJson(customerData);
        _pets = petsData.map((json) => Pet.fromJson(json)).toList();
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

  Future<void> _openWhatsApp(String phone) async {
    final url = Uri.parse('https://wa.me/55${phone.replaceAll(RegExp(r'[^\d]'), '')}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cliente')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_customer == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cliente')),
        body: const Center(child: Text('Cliente não encontrado')),
      );
    }

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(_customer!.name),
          actions: [
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () async {
                final result = await context.push(
                  '/customers/${_customer!.id}/edit',
                  extra: _customer,
                );
                if (result == true) {
                  _loadCustomerData();
                }
              },
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Informações', icon: Icon(Icons.info)),
              Tab(text: 'Pets', icon: Icon(Icons.pets)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Aba de Informações
            SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Foto do cliente (se houver)
                  if (_customer!.photo != null)
                    Center(
                      child: CircleAvatar(
                        radius: 50,
                        backgroundImage: NetworkImage(_customer!.photo!),
                      ),
                    ),
                  const SizedBox(height: 24),
                  // Informações de contato
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Contato',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 16),
                          ListTile(
                            leading: const Icon(Icons.phone),
                            title: const Text('Telefone'),
                            subtitle: Text(_customer!.phone),
                            trailing: IconButton(
                              icon: const Icon(Icons.chat, color: Colors.green),
                              onPressed: () => _openWhatsApp(_customer!.phone),
                            ),
                          ),
                          if (_customer!.email != null)
                            ListTile(
                              leading: const Icon(Icons.email),
                              title: const Text('E-mail'),
                              subtitle: Text(_customer!.email!),
                            ),
                          if (_customer!.address != null)
                            ListTile(
                              leading: const Icon(Icons.location_on),
                              title: const Text('Endereço'),
                              subtitle: Text(_customer!.address!),
                            ),
                        ],
                      ),
                    ),
                  ),
                  if (_customer!.notes != null) ...[
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Observações',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 8),
                            Text(_customer!.notes!),
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            // Aba de Pets
            _pets.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.pets_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          'Nenhum pet cadastrado',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () async {
                            final result = await context.push(
                              '/pets/new',
                              extra: {'customerId': _customer!.id},
                            );
                            if (result == true) {
                              _loadCustomerData();
                            }
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Adicionar Pet'),
                        ),
                      ],
                    ),
                  )
                : Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            final result = await context.push(
                              '/pets/new',
                              extra: {'customerId': _customer!.id},
                            );
                            if (result == true) {
                              _loadCustomerData();
                            }
                          },
                          icon: const Icon(Icons.add),
                          label: const Text('Adicionar Pet'),
                        ),
                      ),
                      Expanded(
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _pets.length,
                          itemBuilder: (context, index) {
                            final pet = _pets[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Theme.of(context).colorScheme.primary,
                                  child: pet.photo != null
                                      ? ClipOval(
                                          child: Image.network(pet.photo!),
                                        )
                                      : Icon(
                                          pet.species == 'dog'
                                              ? Icons.pets
                                              : pet.species == 'cat'
                                                  ? Icons.cruelty_free
                                                  : Icons.pets,
                                          color: Colors.white,
                                        ),
                                ),
                                title: Text(
                                  pet.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (pet.breed != null) Text('Raça: ${pet.breed}'),
                                    if (pet.importantInfo != null)
                                      Container(
                                        margin: const EdgeInsets.only(top: 4),
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.red[100],
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          '⚠️ ${pet.importantInfo}',
                                          style: const TextStyle(
                                            color: Colors.red,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {
                                  context.push('/pets/${pet.id}');
                                },
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
          ],
        ),
      ),
    );
  }
}
