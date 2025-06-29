const database = require('../../lib/database');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { limite = 50, type, paysOrigine, paysDestination } = req.query;
      
      const filtres = {};
      if (type) filtres.typeOperation = type;
      if (paysOrigine) filtres.paysOrigine = paysOrigine;
      if (paysDestination) filtres.paysDestination = paysDestination;
      
      const operations = database.obtenirOperations(parseInt(limite), filtres);
      
      res.status(200).json({
        status: 'SUCCESS',
        operations,
        pagination: { limite: parseInt(limite), retournes: operations.length },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur liste traçabilité',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};