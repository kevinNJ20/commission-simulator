const db = require('../../lib/database');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      console.log('📊 Nouvelle opération de traçabilité:', req.body);
      
      // Enregistrer l'opération
      const operation = db.enregistrerOperation(req.body);
      
      console.log('✅ Opération enregistrée dans la Commission UEMOA');
      
      res.status(200).json({
        status: 'RECORDED',
        message: 'Opération enregistrée avec succès',
        numeroOperation: operation.numeroOperation,
        id: operation.id,
        timestamp: operation.dateEnregistrement
      });
      
    } else if (req.method === 'GET') {
      // Récupérer toutes les opérations
      const operations = db.getOperations();
      res.status(200).json({
        operations: operations,
        total: operations.length
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Erreur API traçabilité:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors de l\'enregistrement',
      error: error.message
    });
  }
};