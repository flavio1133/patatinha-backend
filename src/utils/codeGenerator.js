/**
 * Gerador de códigos únicos para convites
 * Caracteres evitam confusão: 0/O, 1/I/l
 */
const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateUniqueCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  return code;
}

function generateUniqueInvitationCode(invitationCodes, length = 8) {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = generateUniqueCode(length);
    const existing = invitationCodes.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!existing) return code;
    attempts++;
  }

  throw new Error('Não foi possível gerar um código único após múltiplas tentativas');
}

module.exports = { generateUniqueCode, generateUniqueInvitationCode };
