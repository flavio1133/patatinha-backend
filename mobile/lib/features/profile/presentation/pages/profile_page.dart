import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers/auth_provider.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Perfil'),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Avatar e informações do usuário
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 40,
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        child: Text(
                          authProvider.user?['name']?[0]?.toUpperCase() ?? 'U',
                          style: const TextStyle(
                            fontSize: 32,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        authProvider.user?['name'] ?? 'Usuário',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        authProvider.user?['email'] ?? '',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Menu de opções
              Card(
                child: Column(
                  children: [
                    ListTile(
                      leading: const Icon(Icons.pets),
                      title: const Text('Meus Pets'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.go('/pets'),
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.shopping_bag),
                      title: const Text('Meus Pedidos'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // TODO: Implementar histórico de pedidos
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.stars),
                      title: const Text('Pontos de Fidelidade'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // TODO: Implementar sistema de fidelidade
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.settings),
                      title: const Text('Configurações'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // TODO: Implementar configurações
                      },
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.logout, color: Colors.red),
                      title: const Text(
                        'Sair',
                        style: TextStyle(color: Colors.red),
                      ),
                      onTap: () async {
                        await authProvider.logout();
                        if (context.mounted) {
                          context.go('/login');
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
