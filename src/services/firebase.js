const admin = require('firebase-admin');

// =====================================================
// PEGAR A CHAVE DO FIREBASE DA VARIÁVEL DE AMBIENTE
// =====================================================
let serviceAccount;
try {
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!envVar) {
    throw new Error('❌ Variável de ambiente FIREBASE_SERVICE_ACCOUNT não foi encontrada!');
  }
  serviceAccount = JSON.parse(envVar);
  console.log('✅ Chave do Firebase carregada com sucesso!');
} catch (error) {
  console.error('❌ ERRO CRÍTICO:', error.message);
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
// CONFIGURAR O APP CHECK (COM CHAVE LIGA/DESLIGA)
// =====================================================
const appCheck = admin.appCheck();

// Middleware para verificar token do App Check (respeita a variável de ambiente)
const verifyAppCheck = async (req, res, next) => {
  // SE A VARIÁVEL DE AMBIENTE ESTIVER COMO "true", PULA A VERIFICAÇÃO
  if (process.env.APP_CHECK_DISABLED === 'true') {
    console.log('⚠️ App Check está DESABILITADO por variável de ambiente.');
    return next();
  }

  // CASO CONTRÁRIO, FAZ A VERIFICAÇÃO NORMAL
  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (!appCheckToken) {
    console.log('❌ Token do App Check não fornecido');
    return res.status(401).json({ error: 'Token do App Check não fornecido' });
  }

  try {
    await appCheck.verifyToken(appCheckToken);
    console.log('✅ Token do App Check válido');
    next();
  } catch (err) {
    console.error('❌ Token do App Check inválido:', err.message);
    res.status(401).json({ error: 'Token do App Check inválido' });
  }
};

// =====================================================
// EXPORTAR AS FUNÇÕES
// =====================================================
module.exports = {
  admin,
  appCheck,
  verifyAppCheck
};