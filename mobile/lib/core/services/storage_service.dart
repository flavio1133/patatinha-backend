import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Serviço de cache local para suporte offline
class StorageService {
  static const _keyPets = '@PetShop:pets';
  static const _keyAppointments = '@PetShop:appointments';
  static const _keyCompany = 'client_company_id';

  Future<void> savePets(List<dynamic> pets) async {
    await _saveData(_keyPets, pets);
  }

  Future<List<dynamic>?> getPets() async {
    return await _getData(_keyPets);
  }

  Future<void> saveAppointments(List<dynamic> appointments) async {
    await _saveData(_keyAppointments, appointments);
  }

  Future<List<dynamic>?> getAppointments() async {
    return await _getData(_keyAppointments);
  }

  Future<void> _saveData(String key, dynamic data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(key, jsonEncode(data));
    } catch (e) {
      // ignore
    }
  }

  Future<dynamic> _getData(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final json = prefs.getString(key);
      if (json == null) return null;
      return jsonDecode(json);
    } catch (e) {
      return null;
    }
  }

  Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyPets);
    await prefs.remove(_keyAppointments);
  }
}
