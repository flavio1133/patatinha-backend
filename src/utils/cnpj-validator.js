/**
 * Validação de CNPJ - formato e dígitos verificadores (algoritmo oficial)
 */

function stripCnpj(cnpj) {
  return String(cnpj).replace(/\D/g, '');
}

function formatCnpj(cnpj) {
  const s = stripCnpj(cnpj);
  if (s.length < 14) return s;
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12, 14)}`;
}

function validateCnpjDigits(cnpj) {
  const s = stripCnpj(cnpj);
  if (s.length !== 14) return false;
  if (/^(\d)\1+$/.test(s)) return false; // Todos iguais

  let sum = 0;
  let pos = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(s.charAt(i), 10) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(s.charAt(12), 10) !== d1) return false;

  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(s.charAt(i), 10) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }
  let d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(s.charAt(13), 10) !== d2) return false;

  return true;
}

function validateCnpj(cnpj) {
  const s = stripCnpj(cnpj);
  if (s.length !== 14) {
    return { valid: false, message: 'CNPJ deve ter 14 dígitos' };
  }
  if (!validateCnpjDigits(cnpj)) {
    return { valid: false, message: 'CNPJ inválido (dígitos verificadores incorretos)' };
  }
  return { valid: true, message: 'CNPJ válido', formatted: formatCnpj(cnpj) };
}

module.exports = {
  stripCnpj,
  formatCnpj,
  validateCnpj,
  validateCnpjDigits,
};
