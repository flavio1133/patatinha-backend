const bcrypt = require('bcryptjs');

/**
 * Seed de profissionais, pets, clientes, empresas e agendamentos para desenvolvimento.
 * Usuários de auth (id 4, 5, 6) = clientes: cliente@teste.com, maria@teste.com, joao@teste.com
 * Empresa de teste: contato@patatinha.com / demo123
 */
function runSeed() {
  if (process.env.NODE_ENV === 'production') return;

  const companiesRouter = require('../routes/companies.routes');
  const professionalsRouter = require('../routes/professionals.routes');
  const petsRouter = require('../routes/pets.routes');
  const appointmentsRouter = require('../routes/appointments.routes');
  const customersRouter = require('../routes/customers.routes');

  const { companies, companySettings, companyEmployees, companiesState } = companiesRouter;
  const { notifications, nextNotificationId } = require('../data/notifications.data');
  const professionals = professionalsRouter.professionals;
  const pets = petsRouter.pets;
  const appointments = appointmentsRouter.appointments;
  const customers = customersRouter.customers;
  const customersState = customersRouter.customersState;

  // Empresa de teste para login: contato@patatinha.com / demo123
  if (companies.length === 0) {
    console.log('🌱 Seed: criando empresa de teste (Patatinha Recife)...');
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 15);
    const passwordHash = bcrypt.hashSync('demo123', 10);
    companies.push({
      id: 'comp_1',
      name: 'Patatinha Recife',
      legal_name: 'Patatinha Pet Shop Ltda',
      cnpj: '11.222.333/0001-81',
      email: 'contato@patatinha.com',
      password_hash: passwordHash,
      phone: '(81) 3333-4444',
      whatsapp: '(81) 99999-5555',
      address: 'Rua do Pet, 100',
      address_number: '100',
      complement: 'Sala 1',
      neighborhood: 'Boa Viagem',
      city: 'Recife',
      state: 'PE',
      zip_code: '51020010',
      logo_url: null,
      website: 'https://patatinha.com.br',
      instagram: '@patatinha.recife',
      trial_start: now,
      trial_end: trialEnd,
      subscription_status: 'trial',
      subscription_plan_id: null,
      payment_customer_id: null,
      payment_method: null,
      created_at: now,
      updated_at: now,
    });
    companySettings.push({
      id: 'settings_comp_1',
      company_id: 'comp_1',
      opening_hours: {
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '09:00-13:00',
        sunday: 'Fechado',
      },
      services_offered: ['banho', 'tosa', 'banho_tosa', 'veterinario', 'vacina'],
      employees: [],
      created_at: now,
      updated_at: now,
    });
    if (companiesState) companiesState.companyIdCounter = 2;
    console.log('✅ Empresa criada: contato@patatinha.com / demo123');
  }

  // Funcionários da empresa Patatinha Recife (comp_1)
  if (companyEmployees.filter((e) => e.company_id === 'comp_1').length === 0) {
    console.log('🌱 Seed: criando funcionários da empresa...');
    const empRoles = [
      { name: 'João Vendedor', cpf: '12345678901', email: 'vendedor@patatinha.com', password: 'vendedor123', role: 'vendedor' },
      { name: 'Maria Atendente', cpf: '98765432109', email: 'atendente@patatinha.com', password: 'atendente123', role: 'atendente' },
    ];
    empRoles.forEach((r, i) => {
      companyEmployees.push({
        id: 'emp_' + (i + 1),
        company_id: 'comp_1',
        name: r.name,
        cpf: r.cpf,
        email: r.email,
        password_hash: bcrypt.hashSync(r.password, 10),
        role: r.role,
        is_active: true,
        created_at: new Date(),
      });
    });
    if (companiesState) companiesState.employeeIdCounter = 3;
    console.log('✅ Funcionários: vendedor@patatinha.com / atendente@patatinha.com');
  }

  if (professionals.length === 0) {
    console.log('🌱 Seed: criando profissionais...');
    professionals.push({
      id: 1,
      name: 'Ana Silva',
      specialties: ['banho', 'tosa', 'caes_grandes'],
      averageSpeed: 60,
      workSchedule: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      daysOff: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    professionals.push({
      id: 2,
      name: 'Carlos Lima',
      specialties: ['banho', 'tosa', 'gatos', 'veterinario'],
      averageSpeed: 60,
      workSchedule: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      daysOff: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    professionalsRouter.professionalsState.professionalIdCounter = 3;
    console.log('✅ Profissionais criados:', professionals.length);
  }

  // Clientes que solicitam serviços: mesmos que têm login (auth id 4, 5, 6)
  if (customers.length === 0) {
    console.log('🌱 Seed: criando clientes (com login/senha para área do cliente)...');
    customers.push(
      { id: 1, name: 'Cliente Teste', email: 'cliente@teste.com', phone: '(11) 99999-0001', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Maria Silva', email: 'maria@teste.com', phone: '(11) 99999-0002', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'João Experimental', email: 'joao@teste.com', phone: '(11) 99999-0003', createdAt: new Date(), updatedAt: new Date() }
    );
    customersState.customerIdCounter = 4;
    console.log('✅ Clientes criados:', customers.length);
  }

  const hasPetsJoao = pets.some((p) => p.userId === 6);
  if (pets.length === 0 || !hasPetsJoao) {
    if (pets.length === 0) console.log('🌱 Seed: criando pets para clientes...');
    else console.log('🌱 Seed: adicionando 3 pets experimentais (João)...');
    const today = new Date().toISOString().split('T')[0];
    let nextPetId = pets.length + 1;
    const pushPet = (userId, name, breed, species, age) => {
      pets.push({
        id: nextPetId++,
        userId,
        customerId: null,
        name,
        breed,
        species,
        age,
        birthDate: null,
        color: null,
        weight: null,
        photo: null,
        importantInfo: null,
        behaviorAlerts: [],
        groomingPreferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };
    // userId 4 = cliente@teste.com, 5 = maria@teste.com
    if (pets.length === 0) {
      pushPet(4, 'Rex', 'Labrador', 'dog', 3);
      pushPet(4, 'Luna', 'SRD', 'cat', 2);
      pushPet(5, 'Rex', 'Labrador', 'dog', 4);
      pushPet(5, 'Luna', 'SRD', 'cat', 1);
    }
    // userId 6 = joao@teste.com – 3 pets experimentais
    pushPet(6, 'Thor', 'Pastor Alemão', 'dog', 2);
    pushPet(6, 'Mel', 'Golden Retriever', 'dog', 4);
    pushPet(6, 'Bob', 'SRD', 'cat', 1);
    const maxId = pets.length ? Math.max(...pets.map((p) => p.id)) : 0;
    petsRouter.petsState.petIdCounter = maxId + 1;
    console.log('✅ Pets criados:', pets.length);
    // Se acabamos de adicionar os 3 pets do João, criar agendamentos para eles
    if (!hasPetsJoao && professionals.length > 0) {
      const joaoPets = pets.filter((p) => p.userId === 6);
      const todayStr = today;
      const appState = appointmentsRouter.appointmentsState;
      const serviceDurations = { banho: 60, tosa: 90, banho_tosa: 120, veterinario: 30, hotel: 60, outros: 60 };
      [
        { service: 'banho_tosa', date: todayStr, time: '11:00', professionalId: 1 },
        { service: 'veterinario', date: addDays(todayStr, 1), time: '10:00', professionalId: 2 },
        { service: 'banho', date: addDays(todayStr, 2), time: '16:00', professionalId: 1 },
      ].forEach((a, i) => {
        const petId = joaoPets[i]?.id;
        if (!petId) return;
        const duration = serviceDurations[a.service] || 60;
        appointments.push({
          id: appState.appointmentIdCounter++,
          userId: 6,
          customerId: null,
          petId,
          professionalId: a.professionalId,
          service: a.service,
          date: a.date,
          time: a.time,
          duration,
          notes: null,
          status: 'confirmed',
          checkInTime: null,
          checkOutTime: null,
          estimatedCompletionTime: null,
          createdAt: new Date(),
        });
      });
      console.log('✅ Agendamentos do João (3 serviços) criados.');
    }
  }

  const todayStr = today();
  if (appointments.length === 0 && professionals.length > 0 && pets.length > 0) {
    console.log('🌱 Seed: criando agendamentos...');
    const serviceDurations = { banho: 60, tosa: 90, banho_tosa: 120, veterinario: 30, hotel: 60, outros: 60 };
    const base = [
      { userId: 4, petId: 1, service: 'banho_tosa', date: todayStr, time: '14:00', professionalId: 1 },
      { userId: 4, petId: 2, service: 'veterinario', date: todayStr, time: '10:30', professionalId: 2 },
      { userId: 5, petId: 3, service: 'banho', date: todayStr, time: '09:00', professionalId: 1 },
      { userId: 5, petId: 4, service: 'banho_tosa', date: addDays(todayStr, 1), time: '15:00', professionalId: 2 },
      { userId: 6, petId: 5, service: 'banho_tosa', date: todayStr, time: '11:00', professionalId: 1 },
      { userId: 6, petId: 6, service: 'veterinario', date: addDays(todayStr, 1), time: '10:00', professionalId: 2 },
      { userId: 6, petId: 7, service: 'banho', date: addDays(todayStr, 2), time: '16:00', professionalId: 1 },
    ];
    base.forEach((a, i) => {
      const duration = serviceDurations[a.service] || 60;
      appointments.push({
        id: i + 1,
        userId: a.userId,
        customerId: null,
        petId: a.petId,
        professionalId: a.professionalId,
        service: a.service,
        date: a.date,
        time: a.time,
        duration,
        notes: null,
        status: i === 0 ? 'confirmed' : i === 1 ? 'checked_in' : 'confirmed',
        checkInTime: null,
        checkOutTime: null,
        estimatedCompletionTime: null,
        createdAt: new Date(),
      });
    });
    appointmentsRouter.appointmentsState.appointmentIdCounter = 8;
    console.log('✅ Agendamentos criados:', appointments.length);
  }

  // Notificações de teste (apenas se estiver vazio)
  if (notifications && notifications.length === 0) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const sample = [
      { user_id: 1, type: 'new_appointment', title: 'Novo agendamento! 📅', body: 'Cliente Teste agendou banho_tosa para Rex às 14:00.', status: 'pending', company_id: 'comp_1' },
      { user_id: 1, type: 'payment_received', title: '💰 Pagamento recebido', body: 'Pagamento de R$ 120,00 confirmado. Obrigado!', status: 'read', company_id: 'comp_1' },
      { user_id: 4, type: 'appointment_reminder', title: 'Lembrete de agendamento 🐾', body: 'Olá! Rex tem agendamento amanhã às 14:00. Confirme sua presença!', status: 'pending', company_id: 'comp_1' },
      { user_id: 4, type: 'pet_ready', title: 'Rex está pronto! 🐶', body: 'Seu pet está lindo e esperando por você! Passe aqui para buscá-lo.', status: 'read', company_id: 'comp_1' },
      { user_id: 6, type: 'vaccine_alert', title: 'Vacina próxima do vencimento 💉', body: 'A vacina V10 do Totó vence em 15 dias. Agende já!', status: 'pending', company_id: 'comp_1' },
      { user_id: 'comp_1', type: 'low_stock_alert', title: '⚠️ Estoque baixo', body: 'Shampoo Pet está com apenas 3 unidades. Mínimo recomendado: 10.', status: 'pending', company_id: 'comp_1' },
    ];
    sample.forEach((s) => {
      notifications.push({
        id: nextNotificationId(),
        ...s,
        data: {},
        created_at: s.status === 'read' ? oneHourAgo : now,
        delivered_via: ['push'],
      });
    });
    console.log('✅ Notificações de teste criadas:', notifications.length);
  }
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

module.exports = { runSeed };
