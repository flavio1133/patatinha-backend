const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth.middleware');
const { seedUsersSync } = require('../scripts/seed-users');

// TODO: Substituir por conexão real com banco de dados
// Por enquanto, usando dados em memória para desenvolvimento
const users = [];

// Criar usuários de teste de forma SÍNCRONA ao carregar (evita 500 no primeiro login)
if (process.env.NODE_ENV !== 'production') {
  try {
    seedUsersSync(users);
  } catch (err) {
    console.error('Erro ao criar usuários de teste:', err);
  }
}

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Registro de usuário
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').optional().trim(),
], validate, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Verificar se usuário já existe (case-insensitive)
    const emailLower = (email || '').trim().toLowerCase();
    const existingUser = users.find(u => u.email && u.email.toLowerCase() === emailLower);
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário (padrão: cliente)
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: 'customer', // customer, employee, financial, manager, master
      createdAt: new Date(),
    };

    users.push(user);

    // Gerar token JWT (incluindo role)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Retornar resposta (sem senha)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Garantir que usuários de teste existam (caso seed não tenha rodado)
    if (users.length === 0) {
      try {
        const { seedUsersSync } = require('../scripts/seed-users');
        seedUsersSync(users);
      } catch (e) {
        console.error('Erro ao popular usuários:', e);
      }
    }

    // Buscar usuário (case-insensitive)
    const emailLower = email.trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === emailLower);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (!user.password) {
      console.error('Usuário sem senha hash:', user.email);
      return res.status(500).json({ error: 'Erro interno. Tente novamente.' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT (incluindo role)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Retornar resposta (sem senha)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Obter perfil do usuário autenticado
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Atualizar perfil (nome, telefone; opcional: senha)
router.put('/me', [
  authenticateToken,
  body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
  body('phone').optional().trim(),
  body('currentPassword').optional(),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres'),
], validate, async (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  const user = users[userIndex];
  const { name, phone, currentPassword, newPassword } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone || null;

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  user.updatedAt = new Date();
  const { password: _, ...userWithoutPassword } = user;
  res.json({ message: 'Perfil atualizado', user: userWithoutPassword });
});

module.exports = router;
module.exports.users = users;
