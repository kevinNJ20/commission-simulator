// ============================================================================
// COMMISSION UEMOA - Endpoint Proxy pour Tests Kit MuleSoft
// Fichier: api/kit/test.js
// ============================================================================

const kitClient = require('../../lib/kit-client');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      console.log('🔧 [Commission] Test Kit via proxy serveur...');
      
      const { type = 'health' } = req.query;
      let resultat = {};
      
      switch (type) {
        case 'health':
          resultat = await kitClient.verifierSante();
          break;
        case 'diagnostic':
          resultat = await kitClient.executerDiagnostic();
          break;
        case 'ping':
          const startTime = Date.now();
          await kitClient.ping();
          resultat = {
            success: true,
            latence: Date.now() - startTime,
            message: 'Ping MuleSoft réussi'
          };
          break;
        default:
          throw new Error(`Type de test non supporté: ${type}`);
      }
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Test Kit ${type} réussi`,
        resultat,
        source: 'PROXY_SERVEUR',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ [Commission] Erreur test Kit via proxy:', error);
      
      res.status(500).json({
        status: 'ERROR',
        message: 'Test Kit échoué via proxy serveur',
        erreur: error.message,
        source: 'PROXY_SERVEUR',
        timestamp: new Date().toISOString()
      });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('🔧 [Commission] Test Kit avancé via proxy serveur...');
      
      const { action, payload } = req.body;
      let resultat = {};
      
      switch (action) {
        case 'operation_test':
          // Test envoi opération de traçabilité
          resultat = await kitClient.envoyerOperationTest();
          break;
          
        case 'synchronisation':
          resultat = await kitClient.synchroniserDonnees();
          break;
          
        case 'connectivite':
          resultat = await kitClient.testerConnectiviteDirecte();
          break;
          
        default:
          throw new Error(`Action non supportée: ${action}`);
      }
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Test avancé ${action} réussi`,
        resultat,
        source: 'PROXY_SERVEUR',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ [Commission] Erreur test avancé Kit:', error);
      
      res.status(500).json({
        status: 'ERROR',
        message: 'Test avancé Kit échoué',
        erreur: error.message,
        source: 'PROXY_SERVEUR',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ 
      erreur: 'Méthode non autorisée',
      methodesAutorisees: ['GET', 'POST', 'OPTIONS']
    });
  }
};