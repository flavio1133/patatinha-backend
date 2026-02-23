/**
 * Dados mocados para teste do painel e área do cliente
 */

export const mockDashboard = {
  appointments: { total: 8, attended: 5, meta: 15 },
  sales: { revenue: 1240.5, total: 12, meta: 2000 },
  customers: { total: 156, active: 89, new: 5 },
  stock: { critical: 4 },
  subscriptions: { active: 24 },
  alerts: { lowStock: 3, paymentFailed: 1, vaccines: 2, billsToday: 1, inactive30: 12 },
  revenueChart: [
    { dia: '14/02', valor: 890 },
    { dia: '15/02', valor: 1120 },
    { dia: '16/02', valor: 980 },
    { dia: '17/02', valor: 1240 },
    { dia: '18/02', valor: 1450 },
    { dia: '19/02', valor: 1100 },
    { dia: '20/02', valor: 1240 },
  ],
  servicesChart: [
    { nome: 'Banho e Tosa', quantidade: 45 },
    { nome: 'Banho', quantidade: 32 },
    { nome: 'Consulta', quantidade: 18 },
    { nome: 'Vacina', quantidade: 12 },
    { nome: 'Outros', quantidade: 8 },
  ],
  peakHours: [
    { hora: '08h', qtd: 2 },
    { hora: '09h', qtd: 5 },
    { hora: '10h', qtd: 8 },
    { hora: '11h', qtd: 6 },
    { hora: '14h', qtd: 4 },
    { hora: '15h', qtd: 7 },
    { hora: '16h', qtd: 5 },
    { hora: '17h', qtd: 3 },
  ],
  upcomingAppointments: [
    { id: 1, time: '09:00', petName: 'Rex', service: 'Banho e Tosa', customerName: 'Maria Silva', status: 'pendente' },
    { id: 2, time: '10:30', petName: 'Luna', service: 'Consulta', customerName: 'Maria Silva', status: 'pendente' },
    { id: 3, time: '14:00', petName: 'Thor', service: 'Banho', customerName: 'João Santos', status: 'pendente' },
  ],
  recentActivity: [
    { type: 'checkin', msg: 'Rex - Banho e Tosa', time: '08:45' },
    { type: 'sale', msg: 'Venda R$ 189,90', time: '08:30' },
    { type: 'customer', msg: 'Novo cliente: Carla Mendes', time: 'Ontem' },
  ],
};

export const mockAppointments = [
  { id: 1, time: '09:00', petName: 'Rex', service: 'Banho e Tosa', status: 'concluído', professionalName: 'Ana Silva', petId: 1 },
  { id: 2, time: '10:30', petName: 'Luna', service: 'Consulta', status: 'em_andamento', professionalName: 'Carlos Lima', petId: 2 },
  { id: 3, time: '14:00', petName: 'Thor', service: 'Banho', status: 'pendente', professionalName: 'Ana Silva', petId: 3 },
  { id: 4, time: '15:30', petName: 'Mel', service: 'Vacina', status: 'pendente', professionalName: 'Carlos Lima', petId: 4 },
  { id: 5, time: '16:00', petName: 'Bob', service: 'Banho e Tosa', status: 'pendente', professionalName: 'Ana Silva', petId: 5 },
];

export const mockCustomers = [
  { id: 1, name: 'Maria Silva', phone: '(81) 95555-5555', email: 'maria@teste.com', petsCount: 2 },
  { id: 2, name: 'João Santos', phone: '(81) 96666-6666', email: 'joao@teste.com', petsCount: 1 },
  { id: 3, name: 'Ana Oliveira', phone: '(81) 97777-7777', email: 'ana@teste.com', petsCount: 3 },
  { id: 4, name: 'Pedro Costa', phone: '(81) 98888-8888', email: 'pedro@teste.com', petsCount: 1 },
  { id: 5, name: 'Carla Mendes', phone: '(81) 99999-9999', email: 'carla@teste.com', petsCount: 2 },
];

export const mockProducts = [
  { id: 1, name: 'Ração Premium 15kg', category: 'Alimentação', stock: 45, stockWeight: null, sellByWeight: false, price: 189.9, pricePerKg: null, stockStatus: 'normal' },
  { id: 2, name: 'Shampoo Antipulgas', category: 'Higiene', stock: 8, stockWeight: null, sellByWeight: false, price: 34.9, pricePerKg: null, stockStatus: 'low' },
  { id: 3, name: 'Bifinho 500g', category: 'Petiscos', stock: 22, stockWeight: null, sellByWeight: false, price: 28.5, pricePerKg: null, stockStatus: 'normal' },
  { id: 4, name: 'Areia Sanitária 4kg', category: 'Higiene', stock: 4, stockWeight: null, sellByWeight: false, price: 42.0, pricePerKg: null, stockStatus: 'low' },
  { id: 5, name: 'Coleira M', category: 'Acessórios', stock: 15, stockWeight: null, sellByWeight: false, price: 39.9, pricePerKg: null, stockStatus: 'normal' },
];

export const mockFinanceDashboard = {
  income: 3240.5,
  expense: 1890.2,
  balance: 1350.3,
};

export const mockFinanceForecast = {
  warnings: ['Dia 25: saldo projetado negativo'],
};

// Área do cliente - Maria Silva
export const mockCliente = {
  nextAppointment: {
    id: 1,
    petName: 'Rex',
    service: 'Banho e Tosa',
    date: 'Hoje',
    time: '14:00',
    status: 'confirmado',
  },
  pets: [
    { id: 1, name: 'Rex', species: 'Cachorro', breed: 'Labrador', photo: null },
    { id: 2, name: 'Luna', species: 'Gata', breed: 'SRD', photo: null },
  ],
  history: [
    { id: 1, date: '15/02/2025', service: 'Banho e Tosa', pet: 'Rex', value: 85.0 },
    { id: 2, date: '10/02/2025', service: 'Consulta', pet: 'Luna', value: 120.0 },
    { id: 3, date: '05/02/2025', service: 'Vacina V10', pet: 'Rex', value: 95.0 },
  ],
  gallery: [
    { id: 1, pet: 'Rex', url: 'https://placehold.co/400x300/FF6B4A/white?text=Rex', caption: 'Rex no parque' },
    { id: 2, pet: 'Luna', url: 'https://placehold.co/400x300/FF9F6B/white?text=Luna', caption: 'Luna em casa' },
    { id: 3, pet: 'Rex', url: 'https://placehold.co/400x300/FFB86B/white?text=Banho', caption: 'Depois do banho' },
  ],
};
