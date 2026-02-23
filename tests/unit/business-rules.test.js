const {
  canAddPet,
  validatePetRequiredFields,
  canCancelAppointment,
  getServiceDuration,
  hasScheduleConflict,
  canCheckIn,
  canCheckOut,
  checkLowStock,
  isProductAvailable,
  calculateFractionalPrice,
} = require('../../src/services/business-rules.service');

describe('Business Rules Service - Testes Unitários', () => {
  
  describe('RN001: canAddPet', () => {
    test('deve permitir adicionar pet quando abaixo do limite', () => {
      const result = canAddPet('customer-1', 3);
      expect(result.allowed).toBe(true);
    });

    test('deve negar quando atingiu limite de 5 pets', () => {
      const result = canAddPet('customer-1', 5);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Limite de 5 pets');
      expect(result.maxPets).toBe(5);
    });

    test('deve negar quando acima do limite', () => {
      const result = canAddPet('customer-1', 6);
      expect(result.allowed).toBe(false);
    });
  });

  describe('RN002: validatePetRequiredFields', () => {
    test('deve validar pet com todos os campos obrigatórios', () => {
      const petData = {
        name: 'Rex',
        species: 'dog',
        birthDate: '2020-01-15'
      };
      const result = validatePetRequiredFields(petData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar pet sem nome', () => {
      const petData = {
        species: 'dog',
        birthDate: '2020-01-15'
      };
      const result = validatePetRequiredFields(petData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nome é obrigatório');
    });

    test('deve rejeitar pet sem espécie', () => {
      const petData = {
        name: 'Rex',
        birthDate: '2020-01-15'
      };
      const result = validatePetRequiredFields(petData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Espécie é obrigatória');
    });

    test('deve rejeitar pet sem data de nascimento ou idade', () => {
      const petData = {
        name: 'Rex',
        species: 'dog'
      };
      const result = validatePetRequiredFields(petData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Data de nascimento ou idade aproximada é obrigatória');
    });

    test('deve aceitar idade ao invés de data de nascimento', () => {
      const petData = {
        name: 'Rex',
        species: 'dog',
        age: 3
      };
      const result = validatePetRequiredFields(petData);
      expect(result.valid).toBe(true);
    });
  });

  describe('RN007/RN008: canCancelAppointment', () => {
    test('deve permitir cancelamento com mais de 2h de antecedência', () => {
      const appointment = {
        date: '2026-12-25',
        time: '14:00'
      };
      const futureDate = new Date('2026-12-25T14:00:00');
      futureDate.setHours(futureDate.getHours() + 3); // 3h no futuro
      jest.useFakeTimers();
      jest.setSystemTime(futureDate);

      const result = canCancelAppointment(appointment, false);
      expect(result.allowed).toBe(true);
      expect(result.canChargeFee).toBe(false);

      jest.useRealTimers();
    });

    test('deve negar cancelamento com menos de 2h (cliente)', () => {
      const appointment = {
        date: '2026-12-25',
        time: '14:00'
      };
      const futureDate = new Date('2026-12-25T14:00:00');
      futureDate.setHours(futureDate.getHours() + 1); // 1h no futuro
      jest.useFakeTimers();
      jest.setSystemTime(futureDate);

      const result = canCancelAppointment(appointment, false);
      expect(result.allowed).toBe(false);
      expect(result.requiresManager).toBe(true);

      jest.useRealTimers();
    });

    test('deve permitir cancelamento para gestor mesmo com menos de 2h', () => {
      const appointment = {
        date: '2026-12-25',
        time: '14:00'
      };
      const futureDate = new Date('2026-12-25T14:00:00');
      futureDate.setHours(futureDate.getHours() + 1); // 1h no futuro
      jest.useFakeTimers();
      jest.setSystemTime(futureDate);

      const result = canCancelAppointment(appointment, true);
      expect(result.allowed).toBe(true);
      expect(result.canChargeFee).toBe(true);
      expect(result.feePercentage).toBe(50);

      jest.useRealTimers();
    });
  });

  describe('RN010: getServiceDuration', () => {
    test('deve retornar duração correta para banho', () => {
      expect(getServiceDuration('banho')).toBe(60);
    });

    test('deve retornar duração correta para tosa', () => {
      expect(getServiceDuration('tosa')).toBe(90);
    });

    test('deve retornar duração correta para banho+tosa', () => {
      expect(getServiceDuration('banho_tosa')).toBe(120);
    });

    test('deve retornar duração padrão para serviço desconhecido', () => {
      expect(getServiceDuration('servico_inexistente')).toBe(60);
    });
  });

  describe('RN019: checkLowStock', () => {
    test('deve identificar estoque normal', () => {
      const product = {
        current_stock: 10,
        min_stock: 5
      };
      const result = checkLowStock(product);
      expect(result.isLow).toBe(false);
      expect(result.isCritical).toBe(false);
      expect(result.status).toBe('ok');
    });

    test('deve identificar estoque baixo', () => {
      const product = {
        current_stock: 4,
        min_stock: 5
      };
      const result = checkLowStock(product);
      expect(result.isLow).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    test('deve identificar estoque crítico', () => {
      const product = {
        current_stock: 1,
        min_stock: 5
      };
      const result = checkLowStock(product);
      expect(result.isLow).toBe(true);
      expect(result.isCritical).toBe(true);
    });
  });

  describe('RN024: isProductAvailable', () => {
    test('deve verificar disponibilidade de produto por unidade', () => {
      const product = {
        current_stock: 10,
        sellByWeight: false
      };
      const result = isProductAvailable(product, 5);
      expect(result.available).toBe(true);
    });

    test('deve negar quando estoque insuficiente', () => {
      const product = {
        current_stock: 3,
        sellByWeight: false
      };
      const result = isProductAvailable(product, 5);
      expect(result.available).toBe(false);
      expect(result.availableQuantity).toBe(3);
    });

    test('deve verificar disponibilidade de produto por peso', () => {
      const product = {
        current_stock_weight: 5000, // 5kg em gramas
        sellByWeight: true
      };
      const result = isProductAvailable(product, 3000); // 3kg
      expect(result.available).toBe(true);
    });
  });

  describe('RN021/RN022: calculateFractionalPrice', () => {
    test('deve calcular preço fracionado corretamente', () => {
      const pricePerKg = 40.00;
      const quantityGrams = 500; // 0.5kg
      const result = calculateFractionalPrice(pricePerKg, quantityGrams);
      expect(result.totalPrice).toBe(20.00);
      expect(result.pricePerGram).toBe(0.04);
    });

    test('deve calcular preço para 1kg completo', () => {
      const pricePerKg = 40.00;
      const quantityGrams = 1000; // 1kg
      const result = calculateFractionalPrice(pricePerKg, quantityGrams);
      expect(result.totalPrice).toBe(40.00);
    });
  });
});
