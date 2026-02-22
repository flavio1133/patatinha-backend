const admin = require('firebase-admin');

// Carregar a chave privada do arquivo baixado
const serviceAccount = require('../../firebase-key.json');

let app;
try {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'patatinha-petshop',
  });
  console.log('✅ Firebase Admin inicializado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
}

const appCheck = admin.appCheck();

// Middleware para verificar token do App Check
const verifyAppCheck = async (req, res, next) => {
  const appCheckToken = req.header('X-Firebase-AppCheck');
  
  if (!appCheckToken) {
    console.log('❌ Token do App Check não fornecido');
    return res.status(401).json({ error: 'Token do App Check não fornecido' });
  }

  try {
    // Verificar se o token é válido
    await appCheck.verifyToken(appCheckToken);
    console.log('✅ Token do App Check válido');
    next();
  } catch (err) {
    console.error('❌ Token do App Check inválido:', err.message);
    res.status(401).json({ error: 'Token do App Check inválido' });
  }
};

module.exports = {
  admin,
  appCheck,
  verifyAppCheck
};