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
// EXPORTAR APENAS O ADMIN (SEM APP CHECK)
// =====================================================
module.exports = {
  admin
};