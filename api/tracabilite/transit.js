// ============================================================================
// COMMISSION UEMOA - API Traçabilité Transit (ÉTAPE 16)
// Fichier: api/tracabilite/transit.js
// ============================================================================

const database = require('../../lib/database');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Source-System, X-Workflow-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      console.log('📥 [COMMISSION] ÉTAPE 16: Réception traçabilité transit');
      console.log('📋 [COMMISSION] Données reçues:', JSON.stringify(req.body, null, 2));
      
      const tracabiliteTransit = req.body;
      
      // Validation
      if (!tracabiliteTransit.numeroDeclaration || !tracabiliteTransit.typeOperation) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Données traçabilité transit incomplètes',
          timestamp: new Date().toISOString()
        });
      }
      
      // Enregistrer dans la base Commission
      const tracabiliteId = `UEMOA_TRA_${Date.now()}`;
      const enregistrement = {
        id: tracabiliteTransit.numeroDeclaration,
        ...tracabiliteTransit,
        dateEnregistrement: new Date(),
        sourceKit: true,
        etapeWorkflow: 16,
        workflow: 'TRANSIT'
      };
      
      database.operationsTracabilite.set(tracabiliteId, enregistrement);
      
      console.log(`✅ [COMMISSION] ÉTAPE 16 TERMINÉE: Traçabilité transit ${tracabiliteId} enregistrée`);
      
      res.status(200).json({
        status: 'SUCCESS',
        message: '✅ ÉTAPE 16 COMMISSION TERMINÉE - Traçabilité transit enregistrée',
        organisme: {
          code: 'UEMOA',
          nom: 'Commission UEMOA',
          siege: 'Ouagadougou, Burkina Faso',
          role: 'Supervision Centrale'
        },
        tracabilite: {
          id: tracabiliteId,
          numeroDeclaration: tracabiliteTransit.numeroDeclaration,
          typeOperation: tracabiliteTransit.typeOperation,
          paysDepart: tracabiliteTransit.paysDepart,
          paysDestination: tracabiliteTransit.paysDestination,
          dateEnregistrement: enregistrement.dateEnregistrement,
          etapeWorkflow: 16
        },
        instructions: [
          '✅ Opération transit tracée avec succès',
          '📊 Données disponibles pour analyses UEMOA',
          '🏁 Workflow transit terminé (16 étapes complètes)'
        ],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ [COMMISSION] Erreur traçabilité transit:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erreur enregistrement traçabilité transit',
        erreur: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ 
      erreur: 'Méthode non autorisée'
    });
  }
};