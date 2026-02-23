import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

/// Widget que protege conteúdo baseado no role do usuário
class RoleGuard extends StatelessWidget {
  final Widget child;
  final List<String> allowedRoles;
  final Widget? fallback;

  const RoleGuard({
    super.key,
    required this.child,
    required this.allowedRoles,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final userRole = authProvider.userRole;
        
        if (allowedRoles.contains(userRole)) {
          return child;
        }

        return fallback ?? const SizedBox.shrink();
      },
    );
  }
}

/// Widget que mostra conteúdo apenas para clientes
class CustomerOnly extends StatelessWidget {
  final Widget child;
  final Widget? fallback;

  const CustomerOnly({
    super.key,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    return RoleGuard(
      allowedRoles: ['customer'],
      child: child,
      fallback: fallback,
    );
  }
}

/// Widget que mostra conteúdo apenas para gestores
class ManagerOnly extends StatelessWidget {
  final Widget child;
  final Widget? fallback;

  const ManagerOnly({
    super.key,
    required this.child,
    this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    return RoleGuard(
      allowedRoles: ['master', 'manager'],
      child: child,
      fallback: fallback,
    );
  }
}
