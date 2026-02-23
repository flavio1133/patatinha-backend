/**
 * Serviço de Push Notifications
 * Suporta OneSignal. Se credenciais não estiverem configuradas, opera em modo simulado.
 * 
 * Configuração (.env):
 *   ONESIGNAL_APP_ID=sua-app-id
 *   ONESIGNAL_API_KEY=sua-rest-api-key
 */

let client = undefined;
let initTried = false;

function initClient() {
  if (initTried) return client;
  initTried = true;
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  if (!appId || !apiKey) {
    client = null;
    return null;
  }
  try {
    const OneSignal = require('onesignal-node');
    client = new OneSignal.Client(appId, apiKey);
  } catch (err) {
    console.warn('[PushService] onesignal-node não instalado. Execute: npm install onesignal-node');
    client = null;
  }
  return client;
}

async function sendToUser(userId, notification) {
  const c = initClient();
  if (!c) {
    console.log(`[Push] (simulado) Para usuário ${userId}: ${notification.title} - ${notification.body}`);
    return { success: true, id: null, message: 'Push simulado (OneSignal não configurado)' };
  }

  try {
    const body = {
      contents: {
        en: notification.body,
        pt: notification.body,
      },
      headings: {
        en: notification.title,
        pt: notification.title,
      },
      include_external_user_ids: [String(userId)],
      data: notification.data || {},
      priority: notification.priority === 'high' || notification.priority === 'urgent' ? 10 : 5,
    };
    if (typeof c.createNotification === 'function') {
      const response = await c.createNotification(body);
      const result = response?.body || response;
      return { success: true, id: result?.id, ...result };
    }
    throw new Error('createNotification não disponível');
  } catch (err) {
    console.error('[PushService] Erro ao enviar push:', err.message || err);
    throw err;
  }
}

async function sendToMultipleUsers(userIds, notification) {
  const c = initClient();
  if (!c) {
    console.log(`[Push] (simulado) Para ${userIds.length} usuários: ${notification.title}`);
    return { success: true, id: null, message: 'Push simulado' };
  }

  try {
    const body = {
      contents: { en: notification.body, pt: notification.body },
      headings: { en: notification.title, pt: notification.title },
      include_external_user_ids: userIds.map(String),
      data: notification.data || {},
    };
    const response = await c.createNotification(body);
    const result = response?.body || response;
    return { success: true, id: result?.id, ...result };
  } catch (err) {
    console.error('[PushService] Erro ao enviar push múltiplo:', err.message || err);
    throw err;
  }
}

async function sendToAll(notification) {
  const c = initClient();
  if (!c) {
    console.log(`[Push] (simulado) Broadcast: ${notification.title}`);
    return { success: true, id: null, message: 'Push simulado' };
  }

  try {
    const body = {
      contents: { en: notification.body, pt: notification.body },
      headings: { en: notification.title, pt: notification.title },
      included_segments: ['All'],
      data: notification.data || {},
    };
    const response = await c.createNotification(body);
    const result = response?.body || response;
    return { success: true, id: result?.id, ...result };
  } catch (err) {
    console.error('[PushService] Erro ao enviar push broadcast:', err.message || err);
    throw err;
  }
}

module.exports = {
  sendToUser,
  sendToMultipleUsers,
  sendToAll,
  isConfigured: () => !!(process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY),
};
