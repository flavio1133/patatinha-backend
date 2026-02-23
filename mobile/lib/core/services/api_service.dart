import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  // Detecta se está rodando na web e ajusta a URL automaticamente
  static String get baseUrl {
    if (kIsWeb) {
      // Na web, usa a mesma origem (mesmo domínio) ou URL configurada
      return '/api';
    } else {
      // No mobile, usa localhost ou IP da rede local
      return 'http://localhost:3000/api';
    }
  }
  
  static Map<String, String> getHeaders({String? token}) {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // ========== Código de Convite (Cliente) ==========

  static Future<Map<String, dynamic>> validateInvitationCode(String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/validate-invitation-code'),
      headers: getHeaders(),
      body: jsonEncode({'code': code.toUpperCase()}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Código inválido');
    }
  }

  static Future<void> linkClientToCompany(String token, int invitationId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/link-client-to-company'),
      headers: getHeaders(token: token),
      body: jsonEncode({'invitationId': invitationId}),
    );

    if (response.statusCode != 200) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Erro ao vincular');
    }
  }

  static Future<Map<String, dynamic>> getCompanyPublic(int companyId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/companies/$companyId/public'),
      headers: getHeaders(),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar empresa: ${response.body}');
    }
  }

  // Autenticação
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: getHeaders(),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao fazer login: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String phone,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: getHeaders(),
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao registrar: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getUserProfile(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar perfil: ${response.body}');
    }
  }

  // Pets
  static Future<List<dynamic>> getPets(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pets'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['pets'] ?? [];
    } else {
      throw Exception('Erro ao buscar pets: ${response.body}');
    }
  }

  // Agendamentos
  static Future<List<dynamic>> getAppointments(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/appointments'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['appointments'] ?? [];
    } else {
      throw Exception('Erro ao buscar agendamentos: ${response.body}');
    }
  }

  // Produtos
  static Future<List<dynamic>> getProducts(String token, {Map<String, String>? filters}) async {
    String url = '$baseUrl/products';
    if (filters != null && filters.isNotEmpty) {
      url += '?${Uri(queryParameters: filters).query}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['products'] ?? [];
    } else {
      throw Exception('Erro ao buscar produtos: ${response.body}');
    }
  }

  // ========== CRM - Clientes e Pets ==========

  // Clientes
  static Future<List<dynamic>> getCustomers(String token, {String? search}) async {
    String url = '$baseUrl/customers';
    if (search != null && search.isNotEmpty) {
      url += '?search=${Uri.encodeComponent(search)}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['customers'] ?? [];
    } else {
      throw Exception('Erro ao buscar clientes: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getCustomer(String token, int customerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/customers/$customerId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar cliente: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createCustomer(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/customers'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar cliente: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> updateCustomer(String token, int customerId, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/customers/$customerId'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao atualizar cliente: ${response.body}');
    }
  }

  // Pets (atualizado para suportar customerId)
  static Future<List<dynamic>> getPetsByCustomer(String token, int customerId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pets?customerId=$customerId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['pets'] ?? [];
    } else {
      throw Exception('Erro ao buscar pets: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getPet(String token, int petId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/pets/$petId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar pet: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createPet(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/pets'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar pet: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> updatePet(String token, int petId, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/pets/$petId'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao atualizar pet: ${response.body}');
    }
  }

  // Prontuário Médico
  static Future<List<dynamic>> getMedicalRecords(String token, int petId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/medical-records/pet/$petId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['records'] ?? [];
    } else {
      throw Exception('Erro ao buscar prontuário: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createMedicalRecord(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/medical-records'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar registro: ${response.body}');
    }
  }

  // Vacinas
  static Future<List<dynamic>> getVaccinations(String token, int petId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/vaccinations/pet/$petId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['vaccinations'] ?? [];
    } else {
      throw Exception('Erro ao buscar vacinas: ${response.body}');
    }
  }

  static Future<List<dynamic>> getExpiringVaccinations(String token, {int days = 30}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/vaccinations/expiring?days=$days'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['expiringVaccinations'] ?? [];
    } else {
      throw Exception('Erro ao buscar vacinas expirando: ${response.body}');
    }
  }

  static Future<List<dynamic>> getCommonVaccines(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/vaccinations/common'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['vaccines'] ?? [];
    } else {
      throw Exception('Erro ao buscar vacinas comuns: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createVaccination(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/vaccinations'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao registrar vacina: ${response.body}');
    }
  }

  // Fotos
  static Future<List<dynamic>> getPetPhotos(String token, int petId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/photos/pet/$petId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['photos'] ?? [];
    } else {
      throw Exception('Erro ao buscar fotos: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getBeforeAfterPair(String token, int photoId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/photos/before-after/$photoId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar par antes/depois: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createPhoto(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/photos'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar foto: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createBeforeAfterPair(String token, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/photos/before-after'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar par antes/depois: ${response.body}');
    }
  }

  // ========== Agenda e Serviços ==========

  // Profissionais
  static Future<List<dynamic>> getProfessionals(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/professionals'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['professionals'] ?? [];
    } else {
      throw Exception('Erro ao buscar profissionais: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getProfessional(String token, int professionalId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/professionals/$professionalId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar profissional: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getProfessionalAvailability(
    String token,
    int professionalId,
    String date,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/professionals/$professionalId/availability?date=$date'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar disponibilidade: ${response.body}');
    }
  }

  // Agendamentos
  static Future<List<dynamic>> getAppointments(
    String token, {
    String? date,
    int? professionalId,
    String? status,
    int? customerId,
  }) async {
    String url = '$baseUrl/appointments';
    final queryParams = <String>[];
    
    if (date != null) queryParams.add('date=$date');
    if (professionalId != null) queryParams.add('professionalId=$professionalId');
    if (status != null) queryParams.add('status=$status');
    if (customerId != null) queryParams.add('customerId=$customerId');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['appointments'] ?? [];
    } else {
      throw Exception('Erro ao buscar agendamentos: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getAppointment(String token, int appointmentId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/appointments/$appointmentId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar agendamento: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> checkAvailability(
    String token,
    String date,
    String service,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/appointments/availability?date=$date&service=$service'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao verificar disponibilidade: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createAppointment(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/appointments'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao criar agendamento');
    }
  }

  static Future<Map<String, dynamic>> updateAppointment(
    String token,
    int appointmentId,
    Map<String, dynamic> data,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/appointments/$appointmentId'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao atualizar agendamento: ${response.body}');
    }
  }

  static Future<void> cancelAppointment(String token, int appointmentId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/appointments/$appointmentId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao cancelar agendamento: ${response.body}');
    }
  }

  // Check-in e Check-out
  static Future<Map<String, dynamic>> checkInAppointment(String token, int appointmentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/appointments/$appointmentId/check-in'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao fazer check-in: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> startAppointment(String token, int appointmentId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/appointments/$appointmentId/start'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao iniciar atendimento: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> checkOutAppointment(
    String token,
    int appointmentId, {
    String? photoUrl,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/appointments/$appointmentId/check-out'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao fazer check-out: ${response.body}');
    }
  }

  // Grade semanal
  static Future<Map<String, dynamic>> getWeeklySchedule(
    String token,
    String startDate,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl/appointments/schedule/week?startDate=$startDate'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar grade semanal: ${response.body}');
    }
  }

  // ========== Estoque e PDV ==========

  // Inventário
  static Future<List<dynamic>> getInventory(
    String token, {
    String? search,
    String? category,
    bool? lowStock,
  }) async {
    String url = '$baseUrl/inventory';
    final queryParams = <String>[];
    
    if (search != null) queryParams.add('search=${Uri.encodeComponent(search)}');
    if (category != null) queryParams.add('category=$category');
    if (lowStock == true) queryParams.add('lowStock=true');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['products'] ?? [];
    } else {
      throw Exception('Erro ao buscar estoque: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getProduct(String token, int productId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/inventory/$productId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar produto: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createProduct(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inventory'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar produto: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> updateProduct(
    String token,
    int productId,
    Map<String, dynamic> data,
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/inventory/$productId'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao atualizar produto: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> stockIn(
    String token,
    int productId,
    double quantity, {
    double? cost,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inventory/$productId/stock-in'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        'quantity': quantity,
        if (cost != null) 'cost': cost,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao registrar entrada: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> stockOut(
    String token,
    int productId,
    double quantity, {
    String? reason,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/inventory/$productId/stock-out'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        'quantity': quantity,
        if (reason != null) 'reason': reason,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao registrar saída: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getLowStockAlerts(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/inventory/alerts/low-stock'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar alertas: ${response.body}');
    }
  }

  // Vendas (PDV)
  static Future<List<dynamic>> getSales(
    String token, {
    String? startDate,
    String? endDate,
    int? customerId,
    String? paymentMethod,
  }) async {
    String url = '$baseUrl/sales';
    final queryParams = <String>[];
    
    if (startDate != null) queryParams.add('startDate=$startDate');
    if (endDate != null) queryParams.add('endDate=$endDate');
    if (customerId != null) queryParams.add('customerId=$customerId');
    if (paymentMethod != null) queryParams.add('paymentMethod=$paymentMethod');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['sales'] ?? [];
    } else {
      throw Exception('Erro ao buscar vendas: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createSale(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sales'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Erro ao criar venda');
    }
  }

  static Future<Map<String, dynamic>> getSale(String token, int saleId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/sales/$saleId'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar venda: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getSalesReport(
    String token, {
    String? startDate,
    String? endDate,
  }) async {
    String url = '$baseUrl/sales/reports/summary';
    final queryParams = <String>[];
    
    if (startDate != null) queryParams.add('startDate=$startDate');
    if (endDate != null) queryParams.add('endDate=$endDate');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar relatório: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> cashClosing(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sales/cash-closing'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao fechar caixa: ${response.body}');
    }
  }

  // Custo de serviços
  static Future<List<dynamic>> getServiceRecipes(
    String token, {
    String? serviceType,
  }) async {
    String url = '$baseUrl/service-costs/recipes';
    if (serviceType != null) {
      url += '?serviceType=$serviceType';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['recipes'] ?? [];
    } else {
      throw Exception('Erro ao buscar receitas: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> calculateServiceCost(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/service-costs/calculate'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao calcular custo: ${response.body}');
    }
  }

  // ========== Gestão Financeira ==========

  // Fluxo de Caixa
  static Future<List<dynamic>> getTransactions(
    String token, {
    String? startDate,
    String? endDate,
    String? type,
    String? category,
  }) async {
    String url = '$baseUrl/cashflow';
    final queryParams = <String>[];
    
    if (startDate != null) queryParams.add('startDate=$startDate');
    if (endDate != null) queryParams.add('endDate=$endDate');
    if (type != null) queryParams.add('type=$type');
    if (category != null) queryParams.add('category=$category');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['transactions'] ?? [];
    } else {
      throw Exception('Erro ao buscar transações: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createTransaction(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/cashflow'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar transação: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getDailyDashboard(
    String token, {
    String? date,
  }) async {
    String url = '$baseUrl/cashflow/dashboard/daily';
    if (date != null) {
      url += '?date=$date';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar dashboard: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getMonthlyDashboard(
    String token, {
    int? year,
    int? month,
  }) async {
    String url = '$baseUrl/cashflow/dashboard/monthly';
    final queryParams = <String>[];
    
    if (year != null) queryParams.add('year=$year');
    if (month != null) queryParams.add('month=$month');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar dashboard mensal: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getCashFlowForecast(
    String token, {
    int days = 30,
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/cashflow/forecast?days=$days'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar previsão: ${response.body}');
    }
  }

  // Comissões
  static Future<List<dynamic>> getCommissionRules(
    String token, {
    int? professionalId,
  }) async {
    String url = '$baseUrl/commissions/rules';
    if (professionalId != null) {
      url += '?professionalId=$professionalId';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['rules'] ?? [];
    } else {
      throw Exception('Erro ao buscar regras: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createCommissionRule(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/commissions/rules'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar regra: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> calculateCommission(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/commissions/calculate'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao calcular comissão: ${response.body}');
    }
  }

  static Future<List<dynamic>> getCommissions(
    String token, {
    int? professionalId,
    String? startDate,
    String? endDate,
    bool? paid,
  }) async {
    String url = '$baseUrl/commissions';
    final queryParams = <String>[];
    
    if (professionalId != null) queryParams.add('professionalId=$professionalId');
    if (startDate != null) queryParams.add('startDate=$startDate');
    if (endDate != null) queryParams.add('endDate=$endDate');
    if (paid != null) queryParams.add('paid=$paid');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['commissions'] ?? [];
    } else {
      throw Exception('Erro ao buscar comissões: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getMonthlyCommissionReport(
    String token, {
    int? year,
    int? month,
    int? professionalId,
  }) async {
    String url = '$baseUrl/commissions/report/monthly';
    final queryParams = <String>[];
    
    if (year != null) queryParams.add('year=$year');
    if (month != null) queryParams.add('month=$month');
    if (professionalId != null) queryParams.add('professionalId=$professionalId');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar relatório: ${response.body}');
    }
  }

  static Future<void> payCommission(
    String token,
    int commissionId, {
    String? paymentDate,
    String? notes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/commissions/$commissionId/pay'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        if (paymentDate != null) 'paymentDate': paymentDate,
        if (notes != null) 'notes': notes,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao pagar comissão: ${response.body}');
    }
  }

  // Assinaturas
  static Future<List<dynamic>> getSubscriptionPlans(
    String token, {
    bool? active,
  }) async {
    String url = '$baseUrl/subscriptions/plans';
    if (active == true) {
      url += '?active=true';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['plans'] ?? [];
    } else {
      throw Exception('Erro ao buscar planos: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createSubscriptionPlan(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/subscriptions/plans'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar plano: ${response.body}');
    }
  }

  static Future<List<dynamic>> getSubscriptions(
    String token, {
    int? customerId,
    String? status,
    bool? active,
  }) async {
    String url = '$baseUrl/subscriptions';
    final queryParams = <String>[];
    
    if (customerId != null) queryParams.add('customerId=$customerId');
    if (status != null) queryParams.add('status=$status');
    if (active == true) queryParams.add('active=true');
    
    if (queryParams.isNotEmpty) {
      url += '?${queryParams.join('&')}';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['subscriptions'] ?? [];
    } else {
      throw Exception('Erro ao buscar assinaturas: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> createSubscription(
    String token,
    Map<String, dynamic> data,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/subscriptions'),
      headers: getHeaders(token: token),
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao criar assinatura: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> useSubscriptionService(
    String token,
    int subscriptionId,
    String serviceType,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/subscriptions/$subscriptionId/use-service'),
      headers: getHeaders(token: token),
      body: jsonEncode({'serviceType': serviceType}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao usar serviço: ${response.body}');
    }
  }

  static Future<Map<String, dynamic>> getMRRReport(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/subscriptions/reports/mrr'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar relatório MRR: ${response.body}');
    }
  }

  static Future<void> cancelSubscription(
    String token,
    int subscriptionId, {
    String? reason,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/subscriptions/$subscriptionId/cancel'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        if (reason != null) 'reason': reason,
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao cancelar assinatura: ${response.body}');
    }
  }

  // Notificações
  static Future<Map<String, dynamic>> getNotifications(
    String token, {
    int limit = 50,
    int offset = 0,
  }) async {
    final uri = Uri.parse('$baseUrl/notifications')
        .replace(queryParameters: {'limit': limit.toString(), 'offset': offset.toString()});
    final response = await http.get(
      uri,
      headers: getHeaders(token: token),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Erro ao buscar notificações: ${response.body}');
    }
  }

  static Future<void> markNotificationAsRead(String token, String id) async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/$id/read'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao marcar como lida: ${response.body}');
    }
  }

  static Future<void> markAllNotificationsAsRead(String token) async {
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/read-all'),
      headers: getHeaders(token: token),
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao marcar todas como lidas: ${response.body}');
    }
  }

  static Future<void> registerNotificationToken(
    String token, {
    required String pushToken,
    String platform = 'android',
    String? deviceId,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/notifications/tokens'),
      headers: getHeaders(token: token),
      body: jsonEncode({
        'token': pushToken,
        'platform': platform,
        if (deviceId != null) 'device_id': deviceId,
      }),
    );

    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Erro ao registrar token: ${response.body}');
    }
  }
}
