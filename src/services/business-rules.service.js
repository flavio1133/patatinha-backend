/**
 * Serviço de Regras de Negócio
 * Centraliza todas as validações e regras de negócio do sistema
 */

const MAX_PETS_PER_CUSTOMER = 5;
const APPOINTMENT_CANCELLATION_DEADLINE_HOURS = 2;
const CHECK_IN_TOLERANCE_MINUTES = 15;
const NO_SHOW_LIMIT = 3;
const SERVICE_DURATIONS = {
  banho: 60,
  tosa: 90,
  banho_tosa: 120,
  veterinario: 30,
  hotel: 1440, // 24 horas
  outros: 60,
};
const APPOINTMENT_INTERVAL_MINUTES = 15;
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/**
 * RN001: Verifica se cliente pode cadastrar mais pets
 */
function canAddPet(customerId, petsCount) {
  if (petsCount >= MAX_PETS_PER_CUSTOMER) {
    return {
      allowed: false,
      reason: `Limite de ${MAX_PETS_PER_CUSTOMER} pets por cliente atingido`,
      maxPets: MAX_PETS_PER_CUSTOMER,
    };
  }
  return { allowed: true };
}

/**
 * RN002: Valida campos obrigatórios do pet
 */
function validatePetRequiredFields(petData) {
  const errors = [];
  
  if (!petData.name || petData.name.trim() === '') {
    errors.push('Nome é obrigatório');
  }
  
  if (!petData.species) {
    errors.push('Espécie é obrigatória');
  }
  
  if (!petData.birthDate && !petData.age) {
    errors.push('Data de nascimento ou idade aproximada é obrigatória');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * RN007/RN008: Verifica se pode cancelar agendamento
 */
function canCancelAppointment(appointment, isManager = false) {
  const now = new Date();
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
  const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
  
  // Se já passou o horário, não pode cancelar
  if (hoursUntilAppointment < 0) {
    return {
      allowed: false,
      reason: 'Não é possível cancelar um agendamento que já passou',
      requiresManager: true,
    };
  }
  
  // Se é gestor, sempre pode cancelar
  if (isManager) {
    return {
      allowed: true,
      canChargeFee: hoursUntilAppointment < APPOINTMENT_CANCELLATION_DEADLINE_HOURS,
      feePercentage: hoursUntilAppointment < APPOINTMENT_CANCELLATION_DEADLINE_HOURS ? 50 : 0,
    };
  }
  
  // Cliente só pode cancelar até 2h antes
  if (hoursUntilAppointment < APPOINTMENT_CANCELLATION_DEADLINE_HOURS) {
    return {
      allowed: false,
      reason: `Cancelamento só permitido até ${APPOINTMENT_CANCELLATION_DEADLINE_HOURS} horas antes do horário agendado`,
      requiresManager: true,
      hoursUntilAppointment: hoursUntilAppointment.toFixed(1),
    };
  }
  
  return {
    allowed: true,
    canChargeFee: false,
    feePercentage: 0,
  };
}

/**
 * RN009: Verifica se cliente precisa pré-pagamento devido a no-shows
 */
function requiresPrePayment(noShowCount) {
  return {
    requiresPrePayment: noShowCount >= NO_SHOW_LIMIT,
    noShowCount,
    limit: NO_SHOW_LIMIT,
    message: noShowCount >= NO_SHOW_LIMIT 
      ? `Cliente com ${noShowCount} no-shows. Pré-pagamento obrigatório.`
      : null,
  };
}

/**
 * RN010: Retorna duração padrão do serviço
 */
function getServiceDuration(serviceType) {
  return SERVICE_DURATIONS[serviceType] || SERVICE_DURATIONS.outros;
}

/**
 * RN011/RN012: Verifica conflitos de horário
 */
function hasScheduleConflict(appointments, newAppointment, professionalId) {
  const { date, time, service } = newAppointment;
  const duration = getServiceDuration(service);
  const newStartMinutes = timeToMinutes(time);
  const newEndMinutes = newStartMinutes + duration;
  
  // Filtrar agendamentos do mesmo profissional no mesmo dia
  const sameDayAppointments = appointments.filter(
    apt => apt.professionalId === professionalId &&
           apt.date === date &&
           apt.status !== 'cancelled'
  );
  
  for (const apt of sameDayAppointments) {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + (apt.duration || 60);
    
    // Verificar conflito direto
    if ((newStartMinutes >= aptStart && newStartMinutes < aptEnd) ||
        (newEndMinutes > aptStart && newEndMinutes <= aptEnd) ||
        (newStartMinutes <= aptStart && newEndMinutes >= aptEnd)) {
      return {
        hasConflict: true,
        conflictingAppointment: apt,
        reason: 'Horário conflitante com outro agendamento',
      };
    }
    
    // Verificar intervalo mínimo (RN011)
    const intervalBefore = aptStart - newEndMinutes;
    const intervalAfter = newStartMinutes - aptEnd;
    
    if (intervalBefore >= 0 && intervalBefore < APPOINTMENT_INTERVAL_MINUTES) {
      return {
        hasConflict: true,
        conflictingAppointment: apt,
        reason: `Intervalo mínimo de ${APPOINTMENT_INTERVAL_MINUTES} minutos entre agendamentos não respeitado`,
      };
    }
    
    if (intervalAfter >= 0 && intervalAfter < APPOINTMENT_INTERVAL_MINUTES) {
      return {
        hasConflict: true,
        conflictingAppointment: apt,
        reason: `Intervalo mínimo de ${APPOINTMENT_INTERVAL_MINUTES} minutos entre agendamentos não respeitado`,
      };
    }
  }
  
  return { hasConflict: false };
}

/**
 * RN013: Verifica se check-in está dentro da tolerância
 */
function canCheckIn(appointment) {
  const now = new Date();
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
  const minutesLate = (now - appointmentDateTime) / (1000 * 60);
  
  if (minutesLate > CHECK_IN_TOLERANCE_MINUTES) {
    return {
      allowed: true,
      isLate: true,
      minutesLate: Math.floor(minutesLate),
      requiresConfirmation: true,
      message: `Cliente atrasado ${Math.floor(minutesLate)} minutos. Deseja remarcar?`,
    };
  }
  
  return {
    allowed: true,
    isLate: false,
    minutesLate: minutesLate < 0 ? Math.abs(Math.floor(minutesLate)) : 0,
  };
}

/**
 * RN014: Verifica se pode fazer check-out
 */
function canCheckOut(appointment) {
  if (!appointment.checkInTime) {
    return {
      allowed: false,
      reason: 'Check-out só pode ser feito após o check-in',
    };
  }
  
  if (appointment.status === 'completed') {
    return {
      allowed: false,
      reason: 'Agendamento já foi finalizado',
    };
  }
  
  return {
    allowed: true,
  };
}

/**
 * RN015: Verifica se pet está pronto há mais de 1h
 */
function isPetWaitingTooLong(appointment) {
  if (appointment.status !== 'completed' || !appointment.checkOutTime) {
    return { waitingTooLong: false };
  }
  
  const now = new Date();
  const checkOutTime = new Date(appointment.checkOutTime);
  const hoursWaiting = (now - checkOutTime) / (1000 * 60 * 60);
  
  return {
    waitingTooLong: hoursWaiting >= 1,
    hoursWaiting: hoursWaiting.toFixed(1),
    message: hoursWaiting >= 1 
      ? `Pet está pronto há ${Math.floor(hoursWaiting)} hora(s). Enviar lembrete?`
      : null,
  };
}

/**
 * RN017/RN018: Aplica receita padrão de insumos
 */
function applyServiceRecipe(serviceType, petSize = 'medium') {
  // Receitas padrão por tipo de serviço e tamanho do pet
  const recipes = {
    banho: {
      small: { shampoo: 30, conditioner: 20, perfume: 3 },
      medium: { shampoo: 40, conditioner: 30, perfume: 5 },
      large: { shampoo: 60, conditioner: 45, perfume: 8 },
    },
    tosa: {
      small: { shampoo: 30, conditioner: 20 },
      medium: { shampoo: 40, conditioner: 30 },
      large: { shampoo: 60, conditioner: 45 },
    },
    banho_tosa: {
      small: { shampoo: 30, conditioner: 20, perfume: 3 },
      medium: { shampoo: 40, conditioner: 30, perfume: 5 },
      large: { shampoo: 60, conditioner: 45, perfume: 8 },
    },
  };
  
  return recipes[serviceType]?.[petSize] || {};
}

/**
 * RN019: Verifica estoque mínimo
 */
function checkLowStock(product) {
  if (product.sellByWeight) {
    const isLow = product.stockWeight < product.minStockWeight;
    const isCritical = product.stockWeight < (product.minStockWeight * 0.5);
    
    return {
      isLow,
      isCritical,
      current: product.stockWeight,
      minimum: product.minStockWeight,
      status: isCritical ? 'critical' : isLow ? 'low' : 'normal',
    };
  } else {
    const isLow = product.stock < product.minStock;
    const isCritical = product.stock < (product.minStock * 0.5);
    
    return {
      isLow,
      isCritical,
      current: product.stock,
      minimum: product.minStock,
      status: isCritical ? 'critical' : isLow ? 'low' : 'normal',
    };
  }
}

/**
 * RN020: Verifica validade do produto
 */
function checkProductExpiry(product) {
  if (!product.expiryDate) {
    return { isExpiring: false };
  }
  
  const expiryDate = new Date(product.expiryDate);
  const now = new Date();
  const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
  
  return {
    isExpiring: daysUntilExpiry <= 30,
    daysUntilExpiry: Math.floor(daysUntilExpiry),
    status: daysUntilExpiry < 0 ? 'expired' : daysUntilExpiry <= 30 ? 'expiring' : 'ok',
  };
}

/**
 * RN021/RN022: Calcula preço de venda fracionada
 */
function calculateFractionalPrice(pricePerKg, quantityGrams) {
  const quantityKg = quantityGrams / 1000;
  const totalPrice = quantityKg * pricePerKg;
  
  return {
    quantityKg: quantityKg.toFixed(3),
    pricePerKg,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    quantityGrams,
  };
}

/**
 * RN024: Verifica se produto está disponível para venda
 */
function isProductAvailable(product, requestedQuantity = 1) {
  if (product.sellByWeight) {
    const available = product.stockWeight >= requestedQuantity;
    return {
      available,
      reason: available ? null : 'Estoque insuficiente',
      availableQuantity: product.stockWeight,
      requestedQuantity,
    };
  } else {
    const available = product.stock >= requestedQuantity;
    return {
      available,
      reason: available ? null : 'Estoque insuficiente',
      availableQuantity: product.stock,
      requestedQuantity,
    };
  }
}

/**
 * RN004: Valida tamanho de imagem
 */
function validateImageSize(fileSize) {
  return {
    valid: fileSize <= MAX_IMAGE_SIZE_BYTES,
    maxSizeMB: MAX_IMAGE_SIZE_MB,
    currentSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
    error: fileSize > MAX_IMAGE_SIZE_BYTES 
      ? `Imagem muito grande. Tamanho máximo: ${MAX_IMAGE_SIZE_MB}MB`
      : null,
  };
}

/**
 * RN031: Verifica se cliente tem assinatura ativa
 */
function hasActiveSubscription(customer) {
  // Esta função deve ser implementada verificando a tabela de assinaturas
  // Por enquanto, retorna false
  return {
    hasActiveSubscription: false,
    priority: false,
  };
}

/**
 * RN032: Valida categoria de transação
 */
function validateTransactionCategory(category) {
  const validCategories = [
    'venda',
    'compra',
    'salario',
    'imposto',
    'aluguel',
    'utilities',
    'marketing',
    'outros',
  ];
  
  return {
    valid: validCategories.includes(category),
    validCategories,
    error: validCategories.includes(category) 
      ? null 
      : `Categoria inválida. Use uma das seguintes: ${validCategories.join(', ')}`,
  };
}

/**
 * RN033: Verifica vencimento de contas a pagar
 */
function checkBillDueDate(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);
  
  return {
    isOverdue: daysUntilDue < 0,
    isDueSoon: daysUntilDue <= 5 && daysUntilDue >= 0,
    daysUntilDue: Math.floor(daysUntilDue),
    status: daysUntilDue < 0 ? 'overdue' : daysUntilDue <= 5 ? 'due_soon' : 'ok',
    alertColor: daysUntilDue < 0 ? 'red' : daysUntilDue <= 5 ? 'yellow' : 'green',
  };
}

// Funções auxiliares
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

module.exports = {
  // Constantes
  MAX_PETS_PER_CUSTOMER,
  APPOINTMENT_CANCELLATION_DEADLINE_HOURS,
  CHECK_IN_TOLERANCE_MINUTES,
  NO_SHOW_LIMIT,
  SERVICE_DURATIONS,
  APPOINTMENT_INTERVAL_MINUTES,
  MAX_IMAGE_SIZE_MB,
  
  // Funções
  canAddPet,
  validatePetRequiredFields,
  canCancelAppointment,
  requiresPrePayment,
  getServiceDuration,
  hasScheduleConflict,
  canCheckIn,
  canCheckOut,
  isPetWaitingTooLong,
  applyServiceRecipe,
  checkLowStock,
  checkProductExpiry,
  calculateFractionalPrice,
  isProductAvailable,
  validateImageSize,
  hasActiveSubscription,
  validateTransactionCategory,
  checkBillDueDate,
  
  // Funções auxiliares
  timeToMinutes,
  minutesToTime,
};
