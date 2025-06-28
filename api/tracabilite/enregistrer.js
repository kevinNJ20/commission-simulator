const database = require('../../lib/database');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-System, X-Correlation-ID');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      console.log('📊 [Commission] Nouvelle opération de traçabilité reçue:', {
        source: req.headers['x-source-system'],
        correlationId: req.headers['x-correlation-id'],
        typeOperation: req.body?.typeOperation,
        numeroOperation: req.body?.numeroOperation
      });
      
      // Validation des données reçues
      const erreurs = validerOperationTracabilite(req.body);
      if (erreurs.length > 0) {
        console.log('❌ [Commission] Opération de traçabilité invalide:', erreurs);
        return res.status(400).json({
          status: 'ERROR',
          message: 'Données d\'opération de traçabilité invalides',
          erreurs,
          timestamp: new Date().toISOString()
        });
      }

      // Enrichir les données avec les métadonnées de la requête
      const operationEnrichie = {
        ...req.body,
        metadonnees: {
          ipSource: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          sourceSystem: req.headers['x-source-system'],
          correlationId: req.headers['x-correlation-id'],
          timestamp: Date.now()
        }
      };

      // Enregistrer l'opération dans la base centrale
      const operationEnregistree = database.enregistrerOperationTracabilite(operationEnrichie);

      console.log(`✅ [Commission] Opération de traçabilité enregistrée: ${operationEnregistree.id}`);
      console.log(`📈 [Commission] Total opérations: ${database.statistiques.operationsTotal}`);

      // Enregistrer métriques temps réel
      database.enregistrerMetriqueTempsReel('operations_per_hour', 1);
      database.enregistrerMetriqueTempsReel('latency_processing', Date.now() - operationEnrichie.metadonnees.timestamp);

      // Réponse de confirmation
      const reponse = {
        status: 'RECORDED',
        message: 'Opération de traçabilité enregistrée avec succès',
        
        operation: {
          id: operationEnregistree.id,
          numeroOperation: operationEnregistree.numeroOperation,
          typeOperation: operationEnregistree.typeOperation,
          corridor: `${operationEnregistree.paysOrigine} → ${operationEnregistree.paysDestination}`,
          dateEnregistrement: operationEnregistree.dateEnregistrement
        },
        
        commission: {
          nom: 'Commission UEMOA',
          siege: 'Ouagadougou, Burkina Faso',
          fonction: 'TRACABILITE_CENTRALE'
        },
        
        statistiques: {
          operationsTotal: database.statistiques.operationsTotal,
          operationsAujourdhui: database.statistiques.operationsAujourdhui,
          paysConnectes: database.statistiques.paysConnectes,
          corridorsActifs: database.statistiques.corridorsActifs
        },
        
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id']
      };

      res.status(200).json(reponse);
      
      // Log pour monitoring central
      console.log(`📊 [Commission] Stats globales - Opérations: ${database.statistiques.operationsTotal}, Pays: ${database.statistiques.paysConnectes}, Corridors: ${database.statistiques.corridorsActifs}`);
      
    } else if (req.method === 'GET') {
      // Lister les opérations de traçabilité (pour monitoring/dashboard)
      const limite = parseInt(req.query.limite) || 50;
      const typeOperation = req.query.typeOperation;
      const paysOrigine = req.query.paysOrigine;
      const paysDestination = req.query.paysDestination;
      
      const filtres = {};
      if (typeOperation) filtres.typeOperation = typeOperation;
      if (paysOrigine) filtres.paysOrigine = paysOrigine;
      if (paysDestination) filtres.paysDestination = paysDestination;
      
      const operations = database.obtenirOperations(limite, filtres);
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Liste de ${operations.length} opération(s) de traçabilité`,
        operations: operations.map(op => ({
          id: op.id,
          typeOperation: op.typeOperation,
          numeroOperation: op.numeroOperation,
          corridor: `${op.paysOrigine} → ${op.paysDestination}`,
          dateEnregistrement: op.dateEnregistrement,
          source: op.source,
          statut: op.statut
        })),
        pagination: {
          limite,
          retournes: operations.length,
          filtres
        },
        timestamp: new Date().toISOString()
      });
      
    } else {
      res.status(405).json({ 
        erreur: 'Méthode non autorisée',
        methodesAutorisees: ['GET', 'POST', 'OPTIONS']
      });
    }
    
  } catch (error) {
    console.error('❌ [Commission] Erreur API traçabilité:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors du traitement de l\'opération de traçabilité',
      erreur: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id']
    });
  }
};

// Validation des données d'opération de traçabilité
function validerOperationTracabilite(donnees) {
  const erreurs = [];

  // Vérification structure générale
  if (!donnees || typeof donnees !== 'object') {
    erreurs.push('Données d\'opération manquantes ou invalides');
    return erreurs;
  }

  // Vérifications obligatoires
  if (!donnees.typeOperation || donnees.typeOperation.trim() === '') {
    erreurs.push('Type d\'opération requis');
  }

  if (!donnees.numeroOperation || donnees.numeroOperation.trim() === '') {
    erreurs.push('Numéro d\'opération requis');
  }

  if (!donnees.paysOrigine || donnees.paysOrigine.trim() === '') {
    erreurs.push('Pays d\'origine requis');
  }

  if (!donnees.paysDestination || donnees.paysDestination.trim() === '') {
    erreurs.push('Pays de destination requis');
  }

  // Validation codes pays (3 lettres)
  if (donnees.paysOrigine && !/^[A-Z]{3}$/.test(donnees.paysOrigine)) {
    erreurs.push('Code pays origine invalide (doit être 3 lettres majuscules)');
  }

  if (donnees.paysDestination && !/^[A-Z]{3}$/.test(donnees.paysDestination)) {
    erreurs.push('Code pays destination invalide (doit être 3 lettres majuscules)');
  }

  // Validation types d'opération connus
  const typesValides = [
    'TRANSMISSION_MANIFESTE',
    'NOTIFICATION_PAIEMENT', 
    'AUTORISATION_MAINLEVEE',
    'TEST_COMMISSION',
    'TEST_SIMULATION',
    'TRANSIT',
    'DECLARATION'
  ];
  
  if (donnees.typeOperation && !typesValides.includes(donnees.typeOperation)) {
    erreurs.push(`Type d'opération non reconnu: ${donnees.typeOperation}`);
  }

  // Validation données métier (optionnelles mais si présentes, doivent être valides)
  if (donnees.donneesMetier) {
    if (typeof donnees.donneesMetier !== 'object') {
      erreurs.push('Données métier doivent être un objet');
    }
  }

  return erreurs;
}