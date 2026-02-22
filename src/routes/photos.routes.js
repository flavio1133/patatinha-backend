const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar upload real de arquivos
// Por enquanto, usando URLs de imagens
const photos = [];
let photoIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar fotos de um pet
router.get('/pet/:petId', authenticateToken, (req, res) => {
  const petPhotos = photos
    .filter(p => p.petId === parseInt(req.params.petId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ photos: petPhotos });
});

// Obter par antes/depois específico
router.get('/before-after/:id', authenticateToken, (req, res) => {
  const photo = photos.find(p => p.id === parseInt(req.params.id));
  
  if (!photo) {
    return res.status(404).json({ error: 'Foto não encontrada' });
  }

  // Se for foto "depois", buscar a "antes" correspondente
  if (photo.type === 'after' && photo.beforeAfterPairId) {
    const beforePhoto = photos.find(p => p.id === photo.beforeAfterPairId);
    res.json({
      before: beforePhoto,
      after: photo,
    });
  } else if (photo.type === 'before') {
    // Buscar foto "depois" correspondente
    const afterPhoto = photos.find(p => p.beforeAfterPairId === photo.id);
    res.json({
      before: photo,
      after: afterPhoto || null,
    });
  } else {
    res.json({ photo });
  }
});

// Upload de foto (antes ou depois)
router.post('/', [
  authenticateToken,
  body('petId').isInt().withMessage('ID do pet é obrigatório'),
  body('type').isIn(['before', 'after', 'general']),
  body('imageUrl').notEmpty().withMessage('URL da imagem é obrigatória'),
  validate
], (req, res) => {
  const {
    petId,
    type,
    imageUrl,
    serviceType, // banho, tosa, etc.
    serviceDate,
    beforeAfterPairId, // ID da foto "antes" se esta for "depois"
    caption,
  } = req.body;

  const newPhoto = {
    id: photoIdCounter++,
    petId: parseInt(petId),
    type, // 'before', 'after', 'general'
    imageUrl,
    serviceType: serviceType || null,
    serviceDate: serviceDate || new Date().toISOString(),
    beforeAfterPairId: beforeAfterPairId || null,
    caption: caption || null,
    createdAt: new Date(),
  };

  photos.push(newPhoto);
  res.status(201).json({
    message: 'Foto adicionada com sucesso',
    photo: newPhoto,
  });
});

// Criar par antes/depois (upload simultâneo)
router.post('/before-after', [
  authenticateToken,
  body('petId').isInt().withMessage('ID do pet é obrigatório'),
  body('beforeImageUrl').notEmpty().withMessage('Foto "antes" é obrigatória'),
  body('afterImageUrl').notEmpty().withMessage('Foto "depois" é obrigatória'),
  validate
], (req, res) => {
  const {
    petId,
    beforeImageUrl,
    afterImageUrl,
    serviceType,
    serviceDate,
    caption,
  } = req.body;

  // Criar foto "antes"
  const beforePhoto = {
    id: photoIdCounter++,
    petId: parseInt(petId),
    type: 'before',
    imageUrl: beforeImageUrl,
    serviceType: serviceType || null,
    serviceDate: serviceDate || new Date().toISOString(),
    beforeAfterPairId: null,
    caption: caption || null,
    createdAt: new Date(),
  };

  // Criar foto "depois" vinculada à "antes"
  const afterPhoto = {
    id: photoIdCounter++,
    petId: parseInt(petId),
    type: 'after',
    imageUrl: afterImageUrl,
    serviceType: serviceType || null,
    serviceDate: serviceDate || new Date().toISOString(),
    beforeAfterPairId: beforePhoto.id,
    caption: caption || null,
    createdAt: new Date(),
  };

  photos.push(beforePhoto);
  photos.push(afterPhoto);

  res.status(201).json({
    message: 'Par antes/depois criado com sucesso',
    before: beforePhoto,
    after: afterPhoto,
  });
});

// Deletar foto
router.delete('/:id', authenticateToken, (req, res) => {
  const photoIndex = photos.findIndex(p => p.id === parseInt(req.params.id));

  if (photoIndex === -1) {
    return res.status(404).json({ error: 'Foto não encontrada' });
  }

  const photo = photos[photoIndex];
  
  // Se for foto "antes", deletar também a "depois" vinculada
  if (photo.type === 'before') {
    const afterPhotoIndex = photos.findIndex(p => p.beforeAfterPairId === photo.id);
    if (afterPhotoIndex !== -1) {
      photos.splice(afterPhotoIndex, 1);
    }
  }
  
  // Se for foto "depois", remover vínculo da "antes"
  if (photo.type === 'after' && photo.beforeAfterPairId) {
    const beforePhotoIndex = photos.findIndex(p => p.id === photo.beforeAfterPairId);
    if (beforePhotoIndex !== -1) {
      photos[beforePhotoIndex].beforeAfterPairId = null;
    }
  }

  photos.splice(photoIndex, 1);
  res.json({ message: 'Foto removida' });
});

// Função auxiliar para buscar fotos por petId
function getPhotosByPetId(petId) {
  return photos
    .filter(p => p.petId === petId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = router;
module.exports.getPhotosByPetId = getPhotosByPetId;
