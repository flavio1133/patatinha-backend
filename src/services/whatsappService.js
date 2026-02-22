/**
 * Serviço de WhatsApp Business API (Meta Cloud API)
 * Se credenciais não estiverem configuradas, opera em modo simulado.
 *
 * Configuração (.env):
 *   WHATSAPP_PHONE_NUMBER_ID=id-do-numero
 *   WHATSAPP_ACCESS_TOKEN=token-da-api
 *
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const BASE_URL = 'https://graph.facebook.com/v18.0';

function formatPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('55')) cleaned = '55' + cleaned;
  return cleaned;
}

function isConfigured() {
  return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN);
}

async function sendMessage(to, text) {
  if (!isConfigured()) {
    console.log(`[WhatsApp] (simulado) Para ${to}: ${(text || '').substring(0, 60)}...`);
    return { success: true, messageId: null, _simulated: true };
  }

  let axios;
  try {
    axios = require('axios');
  } catch {
    console.warn('[WhatsAppService] axios não instalado. Execute: npm install axios');
    console.log(`[WhatsApp] (simulado) Para ${to}: ${(text || '').substring(0, 60)}...`);
    return { success: true, messageId: null, _simulated: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  try {
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhone(to),
        type: 'text',
        text: { body: String(text || '') },
      },
    });
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      ...response.data,
    };
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('[WhatsAppService] Erro:', msg);
    throw new Error(`WhatsApp: ${msg}`);
  }
}

async function sendTemplate(to, templateName, language = 'pt_BR', components = []) {
  if (!isConfigured()) {
    console.log(`[WhatsApp] (simulado) Template ${templateName} para ${to}`);
    return { success: true, messageId: null, _simulated: true };
  }

  let axios;
  try {
    axios = require('axios');
  } catch {
    console.log(`[WhatsApp] (simulado) Template ${templateName} para ${to}`);
    return { success: true, messageId: null, _simulated: true };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const url = `${BASE_URL}/${phoneNumberId}/messages`;

  try {
    const response = await axios({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: language },
          components: components.length ? components : undefined,
        },
      },
    });
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id,
      ...response.data,
    };
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error('[WhatsAppService] Erro template:', msg);
    throw new Error(`WhatsApp: ${msg}`);
  }
}

module.exports = {
  sendMessage,
  sendTemplate,
  formatPhone,
  isConfigured,
};
