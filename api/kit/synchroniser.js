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
        const resultat = await kitClient.synchroniserDonnees();
        
        res.status(200).json({
          status: resultat.succes ? 'SUCCESS' : 'ERROR',
          message: resultat.message,
          synchronisation: resultat,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          message: 'Erreur synchronisation Kit',
          erreur: error.message,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  };