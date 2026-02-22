const admin = require('firebase-admin');

// =====================================================
// PEGAR A CHAVE DO FIREBASE DA VARIÁVEL DE AMBIENTE
// =====================================================
let serviceAccount;

try {
  // Tenta pegar o conteúdo da variável FIREBASE_SERVICE_ACCOUNT
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!envVar) {
    throw new Error('❌ Variável de ambiente FIREBASE_SERVICE_ACCOUNT não foi encontrada!');
  }
  
  // Converte o texto (string) para um objeto JavaScript
  serviceAccount = JSON.parse(envVar);
  
  console.log('✅ Chave do Firebase carregada com sucesso da variável de ambiente!');
  
} catch (error) {
  console.error('❌ ERRO CRÍTICO: Não foi possível carregar a chave do Firebase');
  console.error('Detalhes:', error.message);
  
  // Encerra o programa com erro (não adianta continuar sem Firebase)
  process.exit(1);
}

// =====================================================
// INICIALIZAR O FIREBASE ADMIN
// =====================================================
let app;

try {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  
  console.log('✅ Firebase Admin inicializado com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

// =====================================================
// CONFIGURAR O APP CHECK
// =====================================================
const appCheck = admin.appCheck();

// Middleware para verificar token do App Check
const verifyAppCheck = async (req, res, next) => {
  const appCheckToken = req.header('X-Firebase-AppCheck');
  
  if (!appCheckToken) {
    return res.status(401).json({ 
      error: 'Token do App Check não fornecido' 
    });
  }

  try {
    await appCheck.verifyToken(appCheckToken);
    console.log('✅ Token do App Check válido');
    next();
  } catch (err) {
    console.error('❌ Token do App Check inválido:', err.message);
    res.status(401).json({ 
      error: 'Token do App Check inválido' 
    });
  }
};

// =====================================================
// EXPORTAR AS FUNÇÕES PARA OUTROS ARQUIVOS USAREM
// =====================================================
module.exports = {
  admin,
  appCheck,
  verifyAppCheck
};