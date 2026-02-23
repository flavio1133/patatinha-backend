/**
 * Jobs para expiração de códigos de convite
 */
const { invitationCodes } = require('../data/invitation-codes.data');

function expireOldCodes() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  invitationCodes.forEach((c) => {
    if (c.status === 'available' && new Date(c.created_at) < thirtyDaysAgo) {
      c.status = 'expired';
      console.log(`[Job] Código ${c.code} expirado (30 dias)`);
    }
  });
}

function expireByDate() {
  const now = new Date();
  invitationCodes.forEach((c) => {
    if (c.status === 'available' && c.expires_at && new Date(c.expires_at) < now) {
      c.status = 'expired';
      console.log(`[Job] Código ${c.code} expirado (data)`);
    }
  });
}

function runAll() {
  expireOldCodes();
  expireByDate();
}

module.exports = { expireOldCodes, expireByDate, runAll };
