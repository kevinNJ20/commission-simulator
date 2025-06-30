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
      // ✅ CORRECTION: Utiliser les vrais noms des méthodes de database.js
      const statistiquesGlobales = db.obtenirStatistiquesGlobales(); // ✅ obtenir au lieu de get
      const statistiquesParPays = db.obtenirStatistiquesParPays(); // ✅ obtenir au lieu de get
      const operationsParType = db.obtenirOperationsParType(); // ✅ obtenir au lieu de get
      const corridorsActifs = db.obtenirCorridorsActifs(); // ✅ obtenirCorridorsActifs au lieu de getOperationsParCorridor
      const operationsRecentes = db.obtenirOperations(10); // ✅ obtenir au lieu de get
      
      res.status(200).json({
        global: statistiquesGlobales,
        parPays: statistiquesParPays,
        parType: operationsParType,
        corridors: corridorsActifs,
        operationsRecentes: operationsRecentes
      });
      
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      res.status(500).json({
        error: 'Erreur récupération statistiques',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};