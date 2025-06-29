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
      const { q, limite = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          error: 'Paramètre de recherche manquant',
          message: 'Utilisez ?q=terme_recherche'
        });
      }
      
      const resultats = database.rechercherOperations(q, parseInt(limite));
      
      res.status(200).json({
        status: 'SUCCESS',
        recherche: q,
        resultats,
        nombre: resultats.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erreur recherche',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};