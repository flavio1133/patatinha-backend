// Dados em memória - códigos de convite e vínculos cliente-empresa
const invitationCodes = [];
const clientCompanies = [];
let codeIdCounter = 1;
let linkIdCounter = 1;

function nextCodeId() {
  return 'inv_' + codeIdCounter++;
}
function nextLinkId() {
  return linkIdCounter++;
}

module.exports = { invitationCodes, clientCompanies, nextCodeId, nextLinkId };
