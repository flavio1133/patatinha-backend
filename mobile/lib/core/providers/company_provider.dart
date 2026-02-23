import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class CompanyProvider with ChangeNotifier {
  static const _keyCompanyId = 'client_company_id';

  Map<String, dynamic>? _company;
  int? _companyId;
  bool _loading = false;

  Map<String, dynamic>? get company => _company;
  int? get companyId => _companyId;
  bool get loading => _loading;
  bool get hasCompany => _companyId != null;

  CompanyProvider() {
    _loadCompanyId();
  }

  Future<void> _loadCompanyId() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getInt(_keyCompanyId);
    if (id != null) {
      _companyId = id;
      await _fetchCompany();
    }
    notifyListeners();
  }

  Future<void> _fetchCompany() async {
    if (_companyId == null) return;
    try {
      _company = await ApiService.getCompanyPublic(_companyId!);
    } catch (e) {
      debugPrint('Erro ao carregar empresa: $e');
      _company = null;
    }
    notifyListeners();
  }

  Future<void> setCompanyId(int id) async {
    _companyId = id;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyCompanyId, id);
    await _fetchCompany();
    notifyListeners();
  }

  Future<void> clearCompany() async {
    _company = null;
    _companyId = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyCompanyId);
    notifyListeners();
  }

  Future<void> refresh() async {
    await _loadCompanyId();
  }
}
