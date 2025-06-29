const db = require('../lib/database');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const statistiquesGlobales = db.getStatistiquesGlobales();
      const statistiquesParPays = db.getStatistiquesParPays();
      const operationsParType = db.getOperationsParType();
      const corridorsActifs = db.getOperationsParCorridor();
      const operationsRecentes = db.getOperations(10);
      
      res.status(200).json({
        global: statistiquesGlobales,
        parPays: statistiquesParPays,
        parType: operationsParType,
        corridors: corridorsActifs,
        operationsRecentes: operationsRecentes
      });
      
    } catch (error) {
      res.status(500).json({
        error: 'Erreur récupération statistiques',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};