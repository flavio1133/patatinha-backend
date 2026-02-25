// Dados em memória - códigos de convite e vínculos cliente-empresa
const invitationCodes = [];
const clientCompanies = [];
let codeIdCounter = 1;
let linkIdCounter = 1;

// Seed: cliente demo (userId 5) vinculado à empresa comp_1 para agendamento
if (clientCompanies.length === 0) {
  clientCompanies.push({
    id: linkIdCounter++,
    client_id: 5,
    company_id: 'comp_1',
    linked_at: new Date(),
    linked_by: 'seed',
    is_active: true,
  });
}

function nextCodeId() {
  return 'inv_' + codeIdCounter++;
}
function nextLinkId() {
  return linkIdCounter++;
}

module.exports = { invitationCodes, clientCompanies, nextCodeId, nextLinkId };
