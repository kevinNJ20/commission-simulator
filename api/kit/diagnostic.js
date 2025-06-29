module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (req.method === 'GET') {
      try {
        const kitClient = require('../../lib/kit-client');
        const diagnostic = await kitClient.executerDiagnostic();
        
        res.status(200).json({
          status: 'SUCCESS',
          message: 'Diagnostic Kit terminé',
          diagnostic,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          message: 'Erreur diagnostic Kit',
          erreur: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  };