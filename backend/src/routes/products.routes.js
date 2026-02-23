const express = require('express');
const router = express.Router();

// TODO: Implementar conexão com banco de dados
const products = [
  {
    id: 1,
    name: 'Ração Premium para Cães',
    description: 'Ração completa e balanceada',
    price: 89.90,
    category: 'racao',
    image: null,
    stock: 50,
  },
  {
    id: 2,
    name: 'Brinquedo para Gatos',
    description: 'Brinquedo interativo',
    price: 29.90,
    category: 'brinquedos',
    image: null,
    stock: 30,
  },
];

// Middleware de autenticação (opcional para produtos)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Por enquanto, produtos são públicos
  // Mas podemos usar o token para personalização
  if (token) {
    req.user = { userId: 1 };
  }
  next();
};

// Listar produtos
router.get('/', authenticateToken, (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let filteredProducts = [...products];

  // Filtro por categoria
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // Busca por nome
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p => p.name.toLowerCase().includes(searchLower) ||
           p.description.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por preço
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  res.json({ products: filteredProducts });
});

// Obter produto específico
router.get('/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  res.json(product);
});

module.exports = router;
