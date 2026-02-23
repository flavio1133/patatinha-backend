// Dados em memória - notificações e tokens de dispositivos
const notifications = [];
const notificationTokens = [];
let notificationIdCounter = 1;

function nextNotificationId() {
  return 'notif_' + notificationIdCounter++;
}

module.exports = { notifications, notificationTokens, nextNotificationId };
