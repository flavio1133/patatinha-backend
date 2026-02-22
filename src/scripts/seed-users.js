/**
 * Script para criar usuários de teste
 * Executa automaticamente quando o servidor inicia
 */

const bcrypt = require('bcryptjs');

// hashSync para popular usuários de forma síncrona ao carregar o módulo
function hashSync(password, rounds = 10) {
  return bcrypt.hashSync(password, rounds);
}

// Usuários de teste pré-configurados
const testUsers = [
  {
    id: 1,
    name: 'Administrador Master',
    email: 'admin@patatinha.com',
    password: 'admin123',
    phone: '(11) 99999-9999',
    role: 'master',
  },
  {
    id: 2,
    name: 'Gerente',
    email: 'gerente@patatinha.com',
    password: 'gerente123',
    phone: '(11) 98888-8888',
    role: 'manager',
  },
  {
    id: 3,
    name: 'Funcionário',
    email: 'funcionario@patatinha.com',
    password: 'func123',
    phone: '(11) 97777-7777',
    role: 'employee',
  },
  {
    id: 4,
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    password: 'cliente123',
    phone: '(11) 96666-6666',
    role: 'customer',
  },
  {
    id: 5,
    name: 'Maria Silva',
    email: 'maria@teste.com',
    password: 'maria123',
    phone: '(11) 95555-5555',
    role: 'customer',
  },
  {
    id: 6,
    name: 'João Experimental',
    email: 'joao@teste.com',
    password: 'joao123',
    phone: '(81) 91234-5678',
    role: 'customer',
  },
];

/**
 * Criar usuários de teste (síncrono - evita race condition no primeiro login)
 * @param {Array} usersArray - Array de usuários em memória
 */
function seedUsersSync(usersArray) {
  console.log('🌱 Verificando usuários de teste...');

  for (const userData of testUsers) {
    const exists = usersArray.some((u) => u.email === userData.email);
    if (exists) continue;

    const hashedPassword = hashSync(userData.password, 10);
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      phone: userData.phone,
      role: userData.role,
      createdAt: new Date(),
    };
    usersArray.push(user);
    console.log(`✅ Usuário criado: ${userData.email} (${userData.role})`);
  }

  console.log('✅ Usuários de teste ok.');
}

/**
 * Versão assíncrona (mantida para compatibilidade)
 */
async function seedUsers(usersArray) {
  seedUsersSync(usersArray);
}

module.exports = { seedUsers, seedUsersSync, testUsers };
