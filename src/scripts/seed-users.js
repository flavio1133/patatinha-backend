const bcrypt = require('bcryptjs');

function hashSync(password, rounds = 10) {
  return bcrypt.hashSync(password, rounds);
}

const testUsers = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'super@patatinha.com',
    password: 'Super@2026',
    phone: '(11) 99999-9999',
    role: 'super_admin',
  },
  {
    id: 2,
    name: 'Administrador Master',
    email: 'admin@patatinha.com',
    password: 'Admin@2026',
    phone: '(11) 99999-9999',
    role: 'master',
  },
  {
    id: 3,
    name: 'Gerente',
    email: 'gerente@patatinha.com',
    password: 'Gerente@2026',
    phone: '(11) 98888-8888',
    role: 'manager',
  },
  {
    id: 4,
    name: 'Funcionário',
    email: 'funcionario@patatinha.com',
    password: 'Func@2026',
    phone: '(11) 97777-7777',
    role: 'employee',
  },
  {
    id: 5,
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    password: 'Cliente@2026',
    phone: '(11) 96666-6666',
    role: 'customer',
  },
  {
    id: 6,
    name: 'Maria Silva',
    email: 'maria@teste.com',
    password: 'Maria@2026',
    phone: '(11) 95555-5555',
    role: 'customer',
  },
  {
    id: 7,
    name: 'João Santos',
    email: 'joao@teste.com',
    password: 'Joao@2026',
    phone: '(81) 91234-5678',
    role: 'customer',
  },
];

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

async function seedUsers(usersArray) {
  seedUsersSync(usersArray);
}

module.exports = { seedUsers, seedUsersSync, testUsers };