const { Sequelize, DataTypes } = require('sequelize');

const {
  DATABASE_URL,
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'patatinha_db',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  NODE_ENV,
} = process.env;

// Render e outros hosts externos usam DATABASE_URL; local usa variáveis separadas
const isProduction = NODE_ENV === 'production';
const dialectOptions = isProduction && DATABASE_URL
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};

const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      logging: NODE_ENV === 'development' && process.env.DB_LOGGING === 'true' ? console.log : false,
      dialectOptions,
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      logging: NODE_ENV === 'development' && process.env.DB_LOGGING === 'true' ? console.log : false,
      dialectOptions,
    });

// =====================================================
// MODELOS EXISTENTES (mantidos exatamente como estavam)
// =====================================================

// Empresas (dados principais)
const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  person_type: {
    type: DataTypes.ENUM('pf', 'pj'),
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  legal_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cnpj: {
    type: DataTypes.STRING(18),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: DataTypes.STRING,
  whatsapp: DataTypes.STRING,
  address: DataTypes.STRING,
  address_number: DataTypes.STRING,
  complement: DataTypes.STRING,
  neighborhood: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip_code: DataTypes.STRING,
  logo_url: DataTypes.STRING,
  website: DataTypes.STRING,
  instagram: DataTypes.STRING,
  owner_is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  trial_start: DataTypes.DATE,
  trial_end: DataTypes.DATE,
  subscription_status: {
    type: DataTypes.STRING,
    defaultValue: 'trial',
  },
  subscription_plan_id: DataTypes.STRING,
  payment_customer_id: DataTypes.STRING,
  payment_method: DataTypes.STRING,
}, {
  tableName: 'companies',
  underscored: true,
});

// Configurações da empresa (horário, módulos, etc.)
const CompanySettings = sequelize.define('CompanySettings', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  opening_hours: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  services_offered: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  enabled_modules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      pdv: true,
      finance: true,
      inventory: true,
      reports: true,
    },
  },
}, {
  tableName: 'company_settings',
  underscored: true,
});

// Funcionários da empresa (login próprio da empresa, não o Auth global)
const CompanyEmployee = sequelize.define('CompanyEmployee', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'company_employees',
  underscored: true,
});

Company.hasOne(CompanySettings, { foreignKey: 'company_id', as: 'settings' });
CompanySettings.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(CompanyEmployee, { foreignKey: 'company_id', as: 'employees' });
CompanyEmployee.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Clientes
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: DataTypes.STRING,
  notes: DataTypes.TEXT,
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },
  photo: DataTypes.STRING,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deleted_at: DataTypes.DATE,
}, {
  tableName: 'customers',
  underscored: true,
});

// Pets
const Pet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  breed: DataTypes.STRING,
  age: DataTypes.INTEGER,
  birthDate: {
    type: DataTypes.STRING,
    field: 'birth_date',
  },
  species: DataTypes.STRING,
  color: DataTypes.STRING,
  weight: DataTypes.FLOAT,
  photo: DataTypes.STRING,
  importantInfo: {
    type: DataTypes.TEXT,
    field: 'important_info',
  },
  behaviorAlerts: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    field: 'behavior_alerts',
  },
  groomingPreferences: {
    type: DataTypes.JSONB,
    field: 'grooming_preferences',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  deleted_at: DataTypes.DATE,
}, {
  tableName: 'pets',
  underscored: true,
});

Customer.hasMany(Pet, { foreignKey: 'customer_id', as: 'pets' });
Pet.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// Produtos (estoque)
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: DataTypes.STRING,
  sku: DataTypes.STRING,
  category: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.FLOAT,
  stock: DataTypes.INTEGER,
  minStock: {
    type: DataTypes.INTEGER,
    field: 'min_stock',
  },
  sellByWeight: {
    type: DataTypes.BOOLEAN,
    field: 'sell_by_weight',
  },
  stockWeight: {
    type: DataTypes.FLOAT,
    field: 'stock_weight',
  },
  minStockWeight: {
    type: DataTypes.FLOAT,
    field: 'min_stock_weight',
  },
  pricePerKg: {
    type: DataTypes.FLOAT,
    field: 'price_per_kg',
  },
  isConsumable: {
    type: DataTypes.BOOLEAN,
    field: 'is_consumable',
  },
  volume: DataTypes.FLOAT,
  cost: DataTypes.FLOAT,
  yieldPerService: {
    type: DataTypes.FLOAT,
    field: 'yield_per_service',
  },
  unit: DataTypes.STRING,
}, {
  tableName: 'products',
  underscored: true,
});

// Vendas
const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'appointment_id',
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  subtotal: DataTypes.FLOAT,
  discount: DataTypes.FLOAT,
  total: DataTypes.FLOAT,
  paymentMethod: {
    type: DataTypes.STRING,
    field: 'payment_method',
  },
  cashAmount: {
    type: DataTypes.FLOAT,
    field: 'cash_amount',
  },
  change: DataTypes.FLOAT,
  notes: DataTypes.TEXT,
  date: DataTypes.STRING,
  time: DataTypes.STRING,
}, {
  tableName: 'sales',
  underscored: true,
});

// Agendamentos
const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
  },
  companyId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'company_id',
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'pet_id',
  },
  professionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'professional_id',
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'confirmed',
  },
  checkInTime: {
    type: DataTypes.DATE,
    field: 'check_in_time',
  },
  checkOutTime: {
    type: DataTypes.DATE,
    field: 'check_out_time',
  },
  estimatedCompletionTime: {
    type: DataTypes.DATE,
    field: 'estimated_completion_time',
  },
  cancellation_reason: DataTypes.TEXT,
  cancelled_by: DataTypes.STRING,
  cancelled_at: DataTypes.DATE,
  cancellationFee: {
    type: DataTypes.FLOAT,
    field: 'cancellation_fee',
  },
}, {
  tableName: 'appointments',
  underscored: true,
});

// Códigos de convite
const InvitationCode = sequelize.define('InvitationCode', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  company_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'available',
  },
  expires_at: DataTypes.DATE,
  used_at: DataTypes.DATE,
}, {
  tableName: 'invitation_codes',
  underscored: true,
});

// Vínculo cliente-empresa (via convite ou outros meios)
const ClientCompany = sequelize.define('ClientCompany', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  linked_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  linked_by: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'invitation',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'client_companies',
  underscored: true,
});

// =====================================================
// NOVO MODELO: PROFISSIONAL (funcionários que atendem)
// =====================================================
const Professional = sequelize.define('Professional', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  specialties: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  averageSpeed: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    field: 'average_speed',
  },
  workSchedule: {
    type: DataTypes.JSONB,
    defaultValue: {
      start: '08:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00'
    },
    field: 'work_schedule',
  },
  daysOff: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    field: 'days_off',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  companyId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'company_id',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'professionals',
  underscored: true,
});

// Associações (opcionais, você pode adicionar depois se necessário)
// Professional.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
// Professional.hasMany(Appointment, { foreignKey: 'professional_id', as: 'appointments' });

// =====================================================
// EXPORTAÇÃO (agora com Professional incluso)
// =====================================================
module.exports = {
  sequelize,
  Company,
  CompanySettings,
  CompanyEmployee,
  Customer,
  Pet,
  Appointment,
  Product,
  Sale,
  InvitationCode,
  ClientCompany,
  Professional, // <-- NOVO MODELO ADICIONADO
};