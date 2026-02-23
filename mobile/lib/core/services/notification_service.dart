import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Serviço de notificações locais
class NotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  static Future<void> initialize() async {
    if (_initialized) return;

    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
    );

    await _plugin.initialize(
      const InitializationSettings(android: android, iOS: ios),
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _initialized = true;
  }

  static void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      // Navegar conforme payload (ex: appointment:id)
      // Requer acesso ao router - pode ser feito via callback
    }
  }

  static Future<void> show(String title, String body, {String? payload}) async {
    const android = AndroidNotificationDetails(
      'patatinha_channel',
      'Patatinha',
      channelDescription: 'Notificações do Patatinha',
      importance: Importance.defaultImportance,
    );

    const ios = DarwinNotificationDetails();

    await _plugin.show(
      0,
      title,
      body,
      const NotificationDetails(android: android, iOS: ios),
      payload: payload,
    );
  }

  static Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
