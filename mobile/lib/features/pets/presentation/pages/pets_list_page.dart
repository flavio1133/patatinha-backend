import 'package:flutter/material.dart';

class PetsListPage extends StatelessWidget {
  const PetsListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meus Pets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Implementar cadastro de pet
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Lista de pets será implementada aqui'),
      ),
    );
  }
}
