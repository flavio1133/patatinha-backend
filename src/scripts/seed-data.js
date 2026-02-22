// seed-data.js - Script para popular banco de dados com dados iniciais
const bcrypt = require('bcrypt');
const { User, Professional, Customer, Pet, Appointment, Notification } = require('../models'); // Ajuste conforme seu modelo

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function runSeed() {
  console.log('🌱 Iniciando seed de dados...');

  try {
    // =====================================================
    // 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
    // =====================================================
    console.log('🧹 Limpando dados existentes...');
    
    await Notification.destroy({ where: {}, force: true });
    await Appointment.destroy({ where: {}, force: true });
    await Pet.destroy({ where: {}, force: true });
    await Customer.destroy({ where: {}, force: true });
    await Professional.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    
    console.log('✅ Dados antigos removidos.');

    // =====================================================
    // 2. CRIAR USUÁRIOS COM DIFERENTES PAPÉIS
    // =====================================================
    console.log('👥 Criando usuários...');

    const usuarios = [
      {
        email: 'super@patatinha.com',
        password: await hashPassword('Super@2026'),
        role: 'super_admin',
        name: 'Super Admin',
        companyId: null // Super admin não pertence a nenhuma empresa
      },
      {
        email: 'admin@patatinha.com',
        password: await hashPassword('Admin@2026'),
        role: 'master',
        name: 'Admin Principal',
        companyId: 1
      },
      {
        email: 'gerente@patatinha.com',
        password: await hashPassword('Gerente@2026'),
        role: 'manager',
        name: 'Gerente Geral',
        companyId: 1
      },
      {
        email: 'funcionario@patatinha.com',
        password: await hashPassword('Func@2026'),
        role: 'employee',
        name: 'Funcionário Padrão',
        companyId: 1
      },
      {
        email: 'cliente@teste.com',
        password: await hashPassword('Cliente@2026'),
        role: 'customer',
        name: 'Cliente Teste',
        companyId: 1
      },
      {
        email: 'maria@teste.com',
        password: await hashPassword('Maria@2026'),
        role: 'customer',
        name: 'Maria Silva',
        companyId: 1
      },
      {
        email: 'joao@teste.com',
        password: await hashPassword('Joao@2026'),
        role: 'customer',
        name: 'João Santos',
        companyId: 1
      }
    ];

    const createdUsers = [];
    for (const userData of usuarios) {
      try {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`✅ Usuário criado: ${userData.email} (${userData.role})`);
      } catch (error) {
        console.error(`❌ Erro ao criar ${userData.email}:`, error.message);
      }
    }

    // =====================================================
    // 3. CRIAR PROFISSIONAIS
    // =====================================================
    console.log('💇 Criando profissionais...');

    const profissionais = [
      { name: 'Ana Souza', specialty: 'Banho e Tosa', companyId: 1 },
      { name: 'Carlos Lima', specialty: 'Veterinário', companyId: 1 },
      { name: 'Mariana Costa', specialty: 'Adestramento', companyId: 1 }
    ];

    for (const prof of profissionais) {
      await Professional.create(prof);
    }
    console.log(`✅ ${profissionais.length} profissionais criados.`);

    // =====================================================
    // 4. CRIAR CLIENTES (associados aos usuários customer)
    // =====================================================
    console.log('🐕 Criando clientes...');

    const customerUsers = createdUsers.filter(u => u.role === 'customer');
    const clientes = [];

    for (const user of customerUsers) {
      const cliente = await Customer.create({
        name: user.name,
        email: user.email,
        phone: '(81) 99999-9999',
        address: 'Rua Exemplo, 123',
        userId: user.id,
        companyId: user.companyId
      });
      clientes.push(cliente);
    }
    console.log(`✅ ${clientes.length} clientes criados.`);

    // =====================================================
    // 5. CRIAR PETS PARA OS CLIENTES
    // =====================================================
    console.log('🐾 Criando pets...');

    const racas = ['Vira-lata', 'Poodle', 'Labrador', 'Bulldog', 'Pastor Alemão'];
    const nomes = ['Rex', 'Luna', 'Thor', 'Mel', 'Bob', 'Nina', 'Fred'];

    let petCount = 0;
    for (const cliente of clientes) {
      // Cada cliente tem 1-3 pets
      const numPets = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numPets; i++) {
        await Pet.create({
          name: nomes[Math.floor(Math.random() * nomes.length)] + (i+1),
          species: 'dog',
          breed: racas[Math.floor(Math.random() * racas.length)],
          age: Math.floor(Math.random() * 10) + 1,
          customerId: cliente.id,
          companyId: cliente.companyId
        });
        petCount++;
      }
    }
    console.log(`✅ ${petCount} pets criados.`);

    // =====================================================
    // 6. CRIAR AGENDAMENTOS DE EXEMPLO
    // =====================================================
    console.log('📅 Criando agendamentos de exemplo...');

    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const depoisAmanha = new Date(hoje);
    depoisAmanha.setDate(depoisAmanha.getDate() + 2);

    const profissionaisCriados = await Professional.findAll();
    const clientesComPets = await Customer.findAll({ include: ['pets'] });

    let appointmentCount = 0;
    for (const cliente of clientesComPets.slice(0, 3)) { // só alguns clientes
      if (cliente.pets && cliente.pets.length > 0) {
        const pet = cliente.pets[0];
        const profissional = profissionaisCriados[Math.floor(Math.random() * profissionaisCriados.length)];
        
        // Agendamento para hoje
        await Appointment.create({
          date: hoje.toISOString().split('T')[0],
          time: '14:00',
          service: 'Banho',
          status: 'confirmed',
          petId: pet.id,
          customerId: cliente.id,
          professionalId: profissional.id,
          companyId: cliente.companyId
        });
        appointmentCount++;

        // Agendamento para amanhã
        await Appointment.create({
          date: amanha.toISOString().split('T')[0],
          time: '10:30',
          service: 'Tosa',
          status: 'confirmed',
          petId: pet.id,
          customerId: cliente.id,
          professionalId: profissional.id,
          companyId: cliente.companyId
        });
        appointmentCount++;
      }
    }
    console.log(`✅ ${appointmentCount} agendamentos criados.`);

    // =====================================================
    // 7. CRIAR NOTIFICAÇÕES DE EXEMPLO
    // =====================================================
    console.log('🔔 Criando notificações de exemplo...');

    const tiposNotificacao = ['lembrete', 'promoção', 'alerta'];
    const mensagens = [
      'Seu banho está agendado para amanhã!',
      'Promoção especial de tosa essa semana!',
      'Não esqueça da vacina do seu pet.',
      'Seu pet está pronto para retirada!'
    ];

    let notificacaoCount = 0;
    for (const user of createdUsers.slice(0, 5)) {
      const numNotif = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numNotif; i++) {
        await Notification.create({
          userId: user.id,
          type: tiposNotificacao[Math.floor(Math.random() * tiposNotificacao.length)],
          message: mensagens[Math.floor(Math.random() * mensagens.length)],
          read: Math.random() > 0.5,
          companyId: user.companyId
        });
        notificacaoCount++;
      }
    }
    console.log(`✅ ${notificacaoCount} notificações criadas.`);

    // =====================================================
    // 8. RESUMO FINAL
    // =====================================================
    console.log('\n📊 RESUMO DO SEED:');
    console.log(`👥 Usuários: ${createdUsers.length}`);
    console.log(`💇 Profissionais: ${profissionais.length}`);
    console.log(`🐕 Clientes: ${clientes.length}`);
    console.log(`🐾 Pets: ${petCount}`);
    console.log(`📅 Agendamentos: ${appointmentCount}`);
    console.log(`🔔 Notificações: ${notificacaoCount}`);
    console.log('\n✅ Seed concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

module.exports = { runSeed };

// Se executado diretamente
if (require.main === module) {
  runSeed().then(() => {
    console.log('🎉 Seed finalizado!');
    process.exit(0);
  }).catch(err => {
    console.error('💥 Erro fatal:', err);
    process.exit(1);
  });
}