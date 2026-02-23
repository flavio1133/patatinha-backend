import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/code/presentation/pages/enter_code_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/pets/presentation/pages/pets_list_page.dart';
import '../../features/pets/presentation/pages/pet_form_page.dart';
import '../../features/pets/presentation/pages/pet_detail_page.dart';
import '../../features/appointments/presentation/pages/appointments_page.dart';
import '../../features/appointments/presentation/pages/appointment_booking_page.dart';
import '../../features/appointments/presentation/pages/appointment_detail_page.dart';
import '../../features/inventory/presentation/pages/inventory_list_page.dart';
import '../../features/inventory/presentation/pages/product_form_page.dart';
import '../../features/inventory/presentation/pages/product_detail_page.dart';
import '../../features/pos/presentation/pages/pos_page.dart';
import '../../features/finance/presentation/pages/finance_dashboard_page.dart';
import '../../features/finance/presentation/pages/commissions_page.dart';
import '../../features/finance/presentation/pages/subscriptions_page.dart';
import '../../core/models/inventory_model.dart';
import '../../features/shop/presentation/pages/shop_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/customers/presentation/pages/customers_list_page.dart';
import '../../features/customers/presentation/pages/customer_form_page.dart';
import '../../features/customers/presentation/pages/customer_detail_page.dart';
import '../../core/models/customer_model.dart';
import '../../core/models/pet_model.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/login',
    routes: [
      // Código de convite (primeiro acesso cliente)
      GoRoute(
        path: '/enter-code',
        name: 'enter-code',
        builder: (context, state) => const EnterCodePage(),
      ),
      // Autenticação
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Home (com navegação inferior)
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      
      // Clientes (CRM)
      GoRoute(
        path: '/customers',
        name: 'customers',
        builder: (context, state) => const CustomersListPage(),
      ),
      GoRoute(
        path: '/customers/new',
        name: 'customer-new',
        builder: (context, state) => const CustomerFormPage(),
      ),
      GoRoute(
        path: '/customers/:id',
        name: 'customer-detail',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return CustomerDetailPage(customerId: id);
        },
      ),
      GoRoute(
        path: '/customers/:id/edit',
        name: 'customer-edit',
        builder: (context, state) {
          final customer = state.extra as Customer?;
          return CustomerFormPage(customer: customer);
        },
      ),
      
      // Pets
      GoRoute(
        path: '/pets',
        name: 'pets',
        builder: (context, state) => const PetsListPage(),
      ),
      GoRoute(
        path: '/pets/new',
        name: 'pet-new',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return PetFormPage(customerId: extra?['customerId']);
        },
      ),
      GoRoute(
        path: '/pets/:id',
        name: 'pet-detail',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return PetDetailPage(petId: id);
        },
      ),
      GoRoute(
        path: '/pets/:id/edit',
        name: 'pet-edit',
        builder: (context, state) {
          final pet = state.extra as Pet?;
          return PetFormPage(pet: pet);
        },
      ),
      
      // Agendamentos
      GoRoute(
        path: '/appointments',
        name: 'appointments',
        builder: (context, state) => const AppointmentsPage(),
      ),
      GoRoute(
        path: '/appointments/new',
        name: 'appointment-new',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return AppointmentBookingPage(
            petId: extra?['petId'],
            customerId: extra?['customerId'],
          );
        },
      ),
      GoRoute(
        path: '/appointments/:id',
        name: 'appointment-detail',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return AppointmentDetailPage(appointmentId: id);
        },
      ),
      
      // Loja
      GoRoute(
        path: '/shop',
        name: 'shop',
        builder: (context, state) => const ShopPage(),
      ),
      
      // Perfil
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),
      // Notificações
      GoRoute(
        path: '/notifications',
        name: 'notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
      
      // Estoque
      GoRoute(
        path: '/inventory',
        name: 'inventory',
        builder: (context, state) => const InventoryListPage(),
      ),
      GoRoute(
        path: '/inventory/new',
        name: 'product-new',
        builder: (context, state) => const ProductFormPage(),
      ),
      GoRoute(
        path: '/inventory/:id',
        name: 'product-detail',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ProductDetailPage(productId: id);
        },
      ),
      GoRoute(
        path: '/inventory/:id/edit',
        name: 'product-edit',
        builder: (context, state) {
          final product = state.extra as Product?;
          return ProductFormPage(product: product);
        },
      ),
      
      // PDV
      GoRoute(
        path: '/pos',
        name: 'pos',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          return POSPage(
            customerId: extra?['customerId'],
            appointmentId: extra?['appointmentId'],
          );
        },
      ),
      
      // Financeiro
      GoRoute(
        path: '/finance',
        name: 'finance',
        builder: (context, state) => const FinanceDashboardPage(),
      ),
      GoRoute(
        path: '/commissions',
        name: 'commissions',
        builder: (context, state) => const CommissionsPage(),
      ),
      GoRoute(
        path: '/subscriptions',
        name: 'subscriptions',
        builder: (context, state) => const SubscriptionsPage(),
      ),
    ],
  );
}
