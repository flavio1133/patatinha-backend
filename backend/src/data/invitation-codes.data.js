// Dados em memória - códigos de convite e vínculos cliente-empresa (cache)
const { InvitationCode, ClientCompany } = require('../db');

const invitationCodes = [];
const clientCompanies = [];
let codeIdCounter = 1;
let linkIdCounter = 1;

async function hydrateInvitationData() {
  try {
    const codes = await InvitationCode.findAll({ order: [['created_at', 'ASC']] });
    const links = await ClientCompany.findAll({ order: [['id', 'ASC']] });

    invitationCodes.length = 0;
    clientCompanies.length = 0;

    codes.forEach((row) => {
      const plain = row.get({ plain: true });
      invitationCodes.push(plain);
    });

    links.forEach((row) => {
      const plain = row.get({ plain: true });
      clientCompanies.push(plain);
    });

    // Seed demo apenas se não houver nenhum vínculo (não grava no banco)
    if (clientCompanies.length === 0) {
      clientCompanies.push({
        id: linkIdCounter++,
        client_id: 5,
        company_id: 'comp_1',
        linked_at: new Date(),
        linked_by: 'seed',
        is_active: true,
      });
    } else {
      const lastLink = clientCompanies[clientCompanies.length - 1];
      linkIdCounter = (lastLink.id || 0) + 1;
    }

    // Atualizar contador de códigos com base nas chaves existentes
    const lastCode = invitationCodes[invitationCodes.length - 1];
    if (lastCode && typeof lastCode.id === 'string' && lastCode.id.startsWith('inv_')) {
      const n = parseInt(lastCode.id.split('_')[1], 10);
      codeIdCounter = Number.isNaN(n) ? 1 : n + 1;
    } else if (invitationCodes.length > 0) {
      codeIdCounter = invitationCodes.length + 1;
    }
  } catch (err) {
    console.error('Erro ao carregar códigos de convite do banco:', err.message);
  }
}

// Hidratar assim que o módulo for carregado
hydrateInvitationData();

function nextCodeId() {
  return 'inv_' + codeIdCounter++;
}
function nextLinkId() {
  return linkIdCounter++;
}

module.exports = { invitationCodes, clientCompanies, nextCodeId, nextLinkId };
