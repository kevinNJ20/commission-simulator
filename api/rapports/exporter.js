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
      const { format = 'json', type = 'global' } = req.query;
      
      const donnees = {
        statistiques: database.obtenirStatistiquesGlobales(),
        operations: database.obtenirOperations(1000),
        corridors: database.obtenirCorridorsActifs(),
        exportTimestamp: new Date().toISOString()
      };
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="commission-uemoa-export-${new Date().toISOString().split('T')[0]}.json"`);
        res.status(200).json(donnees);
      } else {
        res.status(400).json({ error: 'Format non supporté' });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Erreur export',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};