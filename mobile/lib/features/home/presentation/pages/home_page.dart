import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/company_provider.dart';
import '../../../../core/services/api_service.dart';
import '../../../../core/services/storage_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;

  List<Widget> _buildPages() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isCustomer = authProvider.isCustomer;
    
    if (isCustomer) {
      // Páginas para cliente
      return const [
        _HomeTab(),
        Placeholder(), // Pets será implementado
        Placeholder(), // Agendamentos será implementado
        Placeholder(), // Loja será implementado
        Placeholder(), // Perfil será implementado
      ];
    } else {
      // Páginas para gestor/funcionário
      return const [
        _ManagerHomeTab(),
        Placeholder(), // Agenda será implementado
        Placeholder(), // Clientes será implementado
        Placeholder(), // Financeiro será implementado
        Placeholder(), // Perfil será implementado
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _buildPages(),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          // Navegação por rotas
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          final isCustomer = authProvider.isCustomer;
          
          if (isCustomer) {
            switch (index) {
              case 0:
                context.go('/home');
                break;
              case 1:
                context.go('/pets');
                break;
              case 2:
                context.go('/appointments');
                break;
              case 3:
                context.go('/shop');
                break;
              case 4:
                context.go('/profile');
                break;
            }
          } else {
            switch (index) {
              case 0:
                context.go('/home');
                break;
              case 1:
                context.go('/appointments');
                break;
              case 2:
                context.go('/customers');
                break;
              case 3:
                context.go('/finance');
                break;
              case 4:
                context.go('/profile');
                break;
            }
          }
        },
        type: BottomNavigationBarType.fixed,
        items: _buildBottomNavItems(),
      ),
    );
  }

  List<BottomNavigationBarItem> _buildBottomNavItems() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isCustomer = authProvider.isCustomer;
    
    if (isCustomer) {
      return const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Início',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.pets),
          label: 'Pets',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_today),
          label: 'Agendamentos',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.shopping_cart),
          label: 'Loja',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Perfil',
        ),
      ];
    } else {
      return const [
        BottomNavigationBarItem(
          icon: Icon(Icons.dashboard),
          label: 'Dashboard',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.calendar_today),
          label: 'Agenda',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.people),
          label: 'Clientes',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.attach_money),
          label: 'Financeiro',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Perfil',
        ),
      ];
    }
  }
}

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  dynamic _nextAppointment;
  List<dynamic> _pets = [];
  List<dynamic> _recentServices = [];
  bool _loading = true;
  final _storage = StorageService();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final auth = context.read<AuthProvider>();
    if (auth.token == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final appointments = await ApiService.getAppointments(auth.token!);
      final pets = await ApiService.getPets(auth.token!);
      await _storage.savePets(pets);
      await _storage.saveAppointments(appointments);

      final today = DateTime.now().toIso8601String().split('T')[0];
      final list = appointments is List ? appointments : [];
      final next = List<dynamic>.from(list)
          .where((a) => a['status'] != 'cancelled')
          .where((a) => (a['date'] ?? '').toString().compareTo(today) >= 0)
          .toList()
        ..sort((a, b) => '${a['date']}${a['time']}'.compareTo('${b['date']}${b['time']}'));

      final recent = List<dynamic>.from(list)
        ..sort((a, b) => '${b['date']}${b['time']}'.compareTo('${a['date']}${a['time']}'));
      final recentList = recent.take(5).toList();

      if (mounted) {
        setState(() {
          _nextAppointment = next.isNotEmpty ? next.first : null;
          _pets = pets is List ? pets : [];
          _recentServices = recentList;
          _loading = false;
        });
      }
    } catch (e) {
      final cached = await _storage.getPets();
      final cachedApt = await _storage.getAppointments();
      if (mounted) {
        setState(() {
          _pets = cached ?? [];
          if (cachedApt != null && cachedApt.isNotEmpty) {
            final today = DateTime.now().toIso8601String().split('T')[0];
            final aptList = cachedApt is List ? cachedApt : [];
            final next = List<dynamic>.from(aptList)
                .where((a) => a['status'] != 'cancelled')
                .where((a) => (a['date'] ?? '').toString().compareTo(today) >= 0)
                .toList()
              ..sort((a, b) => '${a['date']}${a['time']}'.compareTo('${b['date']}${b['time']}'));
            _nextAppointment = next.isNotEmpty ? next.first : null;
            _recentServices = List<dynamic>.from(aptList).take(5).toList();
          }
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final company = context.watch<CompanyProvider>().company;
    final auth = context.read<AuthProvider>();
    final userName = auth.user?['name']?.toString().split(' ').first ?? '';

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  company?['logo_url'] != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: CachedNetworkImage(
                            imageUrl: company!['logo_url'],
                            width: 40,
                            height: 40,
                            fit: BoxFit.cover,
                          ),
                        )
                      : Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFFFF6B4A),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Center(
                            child: Text(
                              (company?['name'] ?? 'P').toString()[0].toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Olá, $userName',
                            style: TextStyle(fontSize: 14, color: Colors.grey[600])),
                        Text(
                          company?['name'] ?? 'Patatinha',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    onPressed: () => context.go('/notifications'),
                  ),
                ],
              ),
            ),
          ),
          if (_nextAppointment != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Card(
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: InkWell(
                    onTap: () => context.go('/appointments/${_nextAppointment['id']}'),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Próximo agendamento',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  )),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4CAF50),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text('Confirmado',
                                    style: TextStyle(color: Colors.white, fontSize: 12)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(_nextAppointment['petName'] ?? 'Pet',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              )),
                          Text(_nextAppointment['service'] ?? '',
                              style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                          const SizedBox(height: 8),
                          Text(
                            '${_nextAppointment['date'] ?? ''} às ${_nextAppointment['time'] ?? ''}',
                            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            )
          else
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text('Nenhum agendamento futuro',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () => context.go('/appointments/new'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF6B4A),
                          ),
                          child: const Text('Agendar agora'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Meus Pets',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      )),
                  TextButton(
                    onPressed: () => context.go('/pets'),
                    child: const Text('Ver todos', style: TextStyle(color: Color(0xFFFF6B4A))),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 110,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _pets.length,
                itemBuilder: (context, i) {
                  final p = _pets[i];
                  return GestureDetector(
                    onTap: () => context.go('/pets/${p['id']}'),
                    child: Container(
                      width: 80,
                      margin: const EdgeInsets.only(right: 16),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 35,
                            backgroundColor: Colors.grey[200],
                            backgroundImage:
                                p['photo_url'] != null ? NetworkImage(p['photo_url']) : null,
                            child: p['photo_url'] == null
                                ? const Text('🐶', style: TextStyle(fontSize: 28))
                                : null,
                          ),
                          const SizedBox(height: 8),
                          Text(p['name'] ?? '',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis),
                          Text(p['breed'] ?? '',
                              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Últimos serviços',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      )),
                  TextButton(
                    onPressed: () => context.go('/appointments'),
                    child: const Text('Ver histórico', style: TextStyle(color: Color(0xFFFF6B4A))),
                  ),
                ],
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                if (i >= _recentServices.length) return null;
                final s = _recentServices[i];
                return ListTile(
                  title: Text(s['petName'] ?? 'Pet'),
                  subtitle: Text('${s['service'] ?? ''} • R\$ ${s['value'] ?? ''}'),
                  trailing: Text(
                    s['date']?.toString().substring(0, 10) ?? '',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  onTap: () => context.go('/appointments/${s['id']}'),
                );
              },
              childCount: _recentServices.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/appointments/new'),
        backgroundColor: const Color(0xFFFF6B4A),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 40, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Tab inicial para gestores/funcionários
class _ManagerHomeTab extends StatelessWidget {
  const _ManagerHomeTab();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Patatinha - Gestão'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // TODO: Implementar notificações
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner de boas-vindas
            Card(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.secondary,
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.business, size: 48, color: Colors.white),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Painel de Gestão',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Visão completa do seu negócio',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.white70,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Ações rápidas para gestores
            Text(
              'Ações Rápidas',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: [
                _ActionCard(
                  icon: Icons.calendar_today,
                  title: 'Agenda',
                  color: Colors.blue,
                  onTap: () => context.go('/appointments'),
                ),
                _ActionCard(
                  icon: Icons.people,
                  title: 'Clientes',
                  color: Colors.green,
                  onTap: () => context.go('/customers'),
                ),
                _ActionCard(
                  icon: Icons.inventory_2,
                  title: 'Estoque',
                  color: Colors.orange,
                  onTap: () => context.go('/inventory'),
                ),
                _ActionCard(
                  icon: Icons.point_of_sale,
                  title: 'PDV',
                  color: Colors.purple,
                  onTap: () => context.go('/pos'),
                ),
                _ActionCard(
                  icon: Icons.attach_money,
                  title: 'Financeiro',
                  color: Colors.teal,
                  onTap: () => context.go('/finance'),
                ),
                _ActionCard(
                  icon: Icons.card_membership,
                  title: 'Assinaturas',
                  color: Colors.indigo,
                  onTap: () => context.go('/subscriptions'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
