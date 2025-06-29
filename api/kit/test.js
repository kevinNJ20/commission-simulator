module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (req.method === 'POST') {
      try {
        const kitClient = require('../../lib/kit-client');
        const resultat = await kitClient.envoyerOperationTest();
        
        res.status(200).json({
          status: 'SUCCESS',
          message: 'Test Kit réussi',
          test: resultat,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          message: 'Test Kit échoué',
          erreur: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  };