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
      console.log('🚨 Autorisation de mainlevée reçue depuis Kit:', req.body);
      
      const autorisation = req.body.autorisationMainlevee || req.body;
      
      // Simuler le processus de mainlevée
      const mainleveeAcceptee = {
        id: Date.now(),
        numeroManifeste: autorisation.numeroManifeste,
        numeroDeclaration: autorisation.numeroDeclaration,
        montantAcquitte: autorisation.montantAcquitte,
        referenceAutorisation: autorisation.referenceAutorisation,
        dateTraitement: new Date(),
        statut: 'MAINLEVEE_ACCORDEE',
        paysDeclarant: autorisation.paysDeclarant
      };
      
      // Enregistrer dans la base locale (simulation)
      db.enregistrerMainlevee(mainleveeAcceptee);
      
      console.log('✅ Mainlevée accordée pour manifeste:', autorisation.numeroManifeste);
      console.log('💰 Montant acquitté:', autorisation.montantAcquitte);
      
      res.status(200).json({
        status: 'ACCEPTED',
        message: 'Mainlevée autorisée, marchandise peut être enlevée',
        numeroManifeste: autorisation.numeroManifeste,
        referenceMainlevee: mainleveeAcceptee.referenceAutorisation,
        dateTraitement: mainleveeAcceptee.dateTraitement,
        prochaines_etapes: [
          'Présentation de l\'autorisation au bureau de douane',
          'Vérification documentaire',
          'Enlèvement des marchandises autorisé'
        ]
      });
      
    } else if (req.method === 'GET') {
      // Récupérer toutes les mainlevées accordées
      const mainlevees = db.getMainlevees();
      res.status(200).json({
        mainlevees: mainlevees,
        total: mainlevees.length
      });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
    
  } catch (error) {
    console.error('Erreur API mainlevée:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors du traitement de la mainlevée',
      error: error.message
    });
  }
};