// ============================================================================
// COMMISSION UEMOA - API Traçabilité ÉTAPES 20-21 (Libre Pratique) + 16 (Transit)
// Fichier: api/tracabilite/enregistrer.js
// Conforme au rapport PDF - Figure 19 et 20
// ============================================================================

const database = require('../../lib/database');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-System, X-Correlation-ID, X-Kit-Source, X-Workflow-Step');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      // ✅ ÉTAPES 20-21 (Libre Pratique) et ÉTAPE 16 (Transit)
      console.log('🏛️ [Commission UEMOA] Réception opération de traçabilité depuis Kit MuleSoft');
      console.log('📋 [Commission] Source:', req.headers['x-source-system']);
      console.log('🔗 [Commission] Correlation:', req.headers['x-correlation-id']);
      console.log('⚙️ [Commission] Étape workflow:', req.headers['x-workflow-step']);
      console.log('📊 [Commission] Données:', JSON.stringify(req.body, null, 2));
      
      // Validation des données reçues depuis le Kit MuleSoft
      const erreurs = validerOperationTracabilite(req.body);
      if (erreurs.length > 0) {
        console.log('❌ [Commission] Opération de traçabilité invalide:', erreurs);
        return res.status(400).json({
          status: 'ERROR',
          message: 'Données d\'opération de traçabilité invalides pour Commission UEMOA',
          erreurs,
          commission: {
            nom: 'Commission UEMOA',
            siege: 'Ouagadougou, Burkina Faso',
            fonction: 'TRACABILITE_CENTRALE'
          },
          timestamp: new Date().toISOString()
        });
      }

      // ✅ Déterminer l'étape workflow selon le type d'opération
      const etapeWorkflow = determinerEtapeWorkflow(req.body);
      
      // Enrichir les données avec les métadonnées Commission
      const operationEnrichie = {
        ...req.body,
        etapeWorkflow,
        commission: {
          siege: 'Ouagadougou, Burkina Faso',
          dateReception: new Date(),
          fonction: 'TRACABILITE_CENTRALE_UEMOA'
        },
        metadonnees: {
          sourceSystem: req.headers['x-source-system'] || 'KIT_MULESOFT',
          kitCorrelationId: req.headers['x-correlation-id'],
          etapeWorkflowKit: req.headers['x-workflow-step'],
          timestamp: Date.now()
        }
      };

      // ✅ ÉTAPES 20-21 : Enregistrer l'opération dans le système central Commission
      const operationEnregistree = database.enregistrerOperationTracabilite(operationEnrichie);

      console.log(`✅ [Commission] ÉTAPE ${etapeWorkflow} TERMINÉE: Opération ${operationEnregistree.id} tracée`);
      console.log(`📈 [Commission] Total opérations: ${database.statistiques.operationsTotal}`);

      // Analyse et génération d'alertes Commission UEMOA
      analyserEtNotifierAlertes(operationEnregistree);

      // ✅ Réponse conforme rapport PDF - Commission UEMOA
      const reponse = {
        status: 'RECORDED',
        message: `✅ ÉTAPE ${etapeWorkflow} COMMISSION UEMOA TERMINÉE - Opération tracée avec succès`,
        
        // Informations Commission selon rapport PDF
        commission: {
          nom: 'Commission de l\'Union Économique et Monétaire Ouest Africaine',
          sigle: 'UEMOA',
          siege: 'Ouagadougou, Burkina Faso',
          fonction: 'TRACABILITE_CENTRALE_INTERCONNEXION',
          roleWorkflow: etapeWorkflow.includes('20-21') ? 'Supervision libre pratique finale' : 'Traçabilité transit finale'
        },
        
        // Détails opération tracée
        operation: {
          id: operationEnregistree.id,
          numeroOperation: operationEnregistree.numeroOperation,
          typeOperation: operationEnregistree.typeOperation,
          corridor: `${operationEnregistree.paysOrigine} → ${operationEnregistree.paysDestination}`,
          etapeWorkflow,
          dateEnregistrement: operationEnregistree.dateEnregistrement
        },
        
        // Workflow selon rapport PDF
        workflow: {
          type: etapeWorkflow.includes('20-21') ? 'LIBRE_PRATIQUE' : 'TRANSIT',
          etapeCommission: etapeWorkflow,
          description: getDescriptionEtape(etapeWorkflow),
          totalEtapes: etapeWorkflow.includes('20-21') ? 21 : 16,
          statutWorkflow: 'TRACABILITE_CENTRALE_COMPLETEE'
        },
        
        // Statistiques Commission temps réel
        statistiques: {
          operationsTotal: database.statistiques.operationsTotal,
          operationsAujourdhui: database.statistiques.operationsAujourdhui,
          paysConnectes: database.statistiques.paysConnectes,
          corridorsActifs: database.statistiques.corridorsActifs,
          derniereMiseAJour: database.statistiques.derniereMiseAJour
        },
        
        // Échanges UEMOA surveillés
        echangesUEMOA: {
          paysMembresSurveilles: [
            'SEN (Sénégal - Pays côtier)',
            'MLI (Mali - Pays hinterland)',
            'BFA (Burkina Faso - Pays hinterland)',
            'CIV (Côte d\'Ivoire - Pays côtier)',
            'BEN (Bénin - Pays côtier)',
            'TGO (Togo - Pays côtier)',
            'NER (Niger - Pays hinterland)',
            'GNB (Guinée-Bissau - Pays côtier)'
          ],
          typesSurveilles: [
            'TRANSMISSION_MANIFESTE',
            'NOTIFICATION_PAIEMENT',
            'AUTORISATION_MAINLEVEE',
            'TRANSIT',
            'APUREMENT'
          ]
        },
        
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id']
      };

      res.status(200).json(reponse);
      
      // Log pour monitoring central Commission
      console.log(`📊 [Commission] Stats UEMOA - Opérations: ${database.statistiques.operationsTotal}, Pays: ${database.statistiques.paysConnectes}, Corridors: ${database.statistiques.corridorsActifs}`);
      
    } else if (req.method === 'GET') {
      // ✅ Consultation des opérations tracées (pour monitoring Commission)
      const limite = parseInt(req.query.limite) || 50;
      const typeOperation = req.query.typeOperation;
      const paysOrigine = req.query.paysOrigine;
      const paysDestination = req.query.paysDestination;
      const etapeWorkflow = req.query.etapeWorkflow;
      
      const filtres = {};
      if (typeOperation) filtres.typeOperation = typeOperation;
      if (paysOrigine) filtres.paysOrigine = paysOrigine;
      if (paysDestination) filtres.paysDestination = paysDestination;
      if (etapeWorkflow) filtres.etapeWorkflow = etapeWorkflow;
      
      const operations = database.obtenirOperations(limite, filtres);
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Liste des opérations tracées par la Commission UEMOA`,
        
        commission: {
          nom: 'Commission UEMOA',
          siege: 'Ouagadougou, Burkina Faso',
          fonction: 'TRACABILITE_CENTRALE'
        },
        
        operations: operations.map(op => ({
          id: op.id,
          typeOperation: op.typeOperation,
          numeroOperation: op.numeroOperation,
          corridor: `${op.paysOrigine} → ${op.paysDestination}`,
          etapeWorkflow: op.etapeWorkflow || 'NON_SPECIFIE',
          dateEnregistrement: op.dateEnregistrement,
          source: op.source || 'KIT_MULESOFT'
        })),
        
        pagination: {
          limite,
          retournes: operations.length,
          filtres
        },
        
        workflow: {
          etapesCommission: ['20-21 (Libre Pratique)', '16 (Transit)'],
          description: 'Traçabilité centralisée des échanges UEMOA'
        },
        
        timestamp: new Date().toISOString()
      });
      
    } else {
      res.status(405).json({ 
        status: 'ERROR',
        message: 'Méthode non autorisée',
        methodesAutorisees: ['GET', 'POST', 'OPTIONS'],
        commission: {
          nom: 'Commission UEMOA',
          siege: 'Ouagadougou'
        }
      });
    }
    
  } catch (error) {
    console.error('❌ [Commission] Erreur API traçabilité:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors du traitement de l\'opération de traçabilité Commission UEMOA',
      erreur: error.message,
      commission: {
        nom: 'Commission UEMOA',
        siege: 'Ouagadougou, Burkina Faso'
      },
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id']
    });
  }
};

// ✅ Fonctions utilitaires Commission UEMOA

function determinerEtapeWorkflow(donnees) {
  const type = donnees.typeOperation;
  
  // Selon le rapport PDF - Figure 19 et 20
  if (type === 'TRANSMISSION_MANIFESTE' || type === 'NOTIFICATION_PAIEMENT' || type === 'AUTORISATION_MAINLEVEE') {
    return '20-21'; // Workflow Libre Pratique
  }
  
  if (type === 'TRANSIT' || type === 'COMPLETION_TRANSIT') {
    return '16'; // Workflow Transit
  }
  
  // Par défaut, traçabilité générale
  return '20-21';
}

function getDescriptionEtape(etapeWorkflow) {
  const descriptions = {
    '20-21': 'Notification Commission UEMOA et traçabilité finale workflow libre pratique (21 étapes)',
    '16': 'Confirmation retour et traçabilité finale workflow transit (16 étapes)'
  };
  
  return descriptions[etapeWorkflow] || 'Traçabilité générale Commission UEMOA';
}

function analyserEtNotifierAlertes(operation) {
  const alertes = [];
  
  // Alerte nouveau corridor commercial
  const corridor = `${operation.paysOrigine}-${operation.paysDestination}`;
  if (!database.corridorsCommerciaux.has(corridor)) {
    alertes.push({
      type: 'NOUVEAU_CORRIDOR_UEMOA',
      niveau: 'INFO',
      message: `Nouveau corridor commercial UEMOA détecté: ${operation.paysOrigine} → ${operation.paysDestination}`,
      operation: operation.id
    });
  }
  
  // Alerte volume élevé (selon standards UEMOA)
  if (operation.donneesMetier?.valeurTotaleEstimee > 50000000) { // > 50M FCFA
    alertes.push({
      type: 'VOLUME_ELEVE_UEMOA',
      niveau: 'ATTENTION',
      message: `Volume élevé détecté: ${operation.donneesMetier.valeurTotaleEstimee.toLocaleString()} FCFA`,
      operation: operation.id
    });
  }
  
  // Enregistrer les alertes Commission
  alertes.forEach(alerte => {
    database.ajouterAlerte({
      ...alerte,
      source: 'COMMISSION_UEMOA',
      siege: 'Ouagadougou'
    });
    console.log(`🚨 [Commission UEMOA] ${alerte.niveau}: ${alerte.message}`);
  });
}

function validerOperationTracabilite(donnees) {
  const erreurs = [];

  // Vérification structure générale
  if (!donnees || typeof donnees !== 'object') {
    erreurs.push('Données d\'opération manquantes pour Commission UEMOA');
    return erreurs;
  }

  // Vérifications obligatoires Commission
  if (!donnees.typeOperation || donnees.typeOperation.trim() === '') {
    erreurs.push('Type d\'opération requis pour traçabilité Commission');
  }

  if (!donnees.numeroOperation || donnees.numeroOperation.trim() === '') {
    erreurs.push('Numéro d\'opération requis pour traçabilité Commission');
  }

  if (!donnees.paysOrigine || donnees.paysOrigine.trim() === '') {
    erreurs.push('Pays d\'origine requis pour traçabilité UEMOA');
  }

  if (!donnees.paysDestination || donnees.paysDestination.trim() === '') {
    erreurs.push('Pays de destination requis pour traçabilité UEMOA');
  }

  // Validation codes pays UEMOA (3 lettres)
  const paysUEMOA = ['SEN', 'MLI', 'BFA', 'CIV', 'BEN', 'TGO', 'NER', 'GNB'];
  
  if (donnees.paysOrigine && !paysUEMOA.includes(donnees.paysOrigine)) {
    erreurs.push(`Code pays origine non UEMOA: ${donnees.paysOrigine}`);
  }

  if (donnees.paysDestination && !paysUEMOA.includes(donnees.paysDestination)) {
    erreurs.push(`Code pays destination non UEMOA: ${donnees.paysDestination}`);
  }

  // Validation types d'opération Commission UEMOA
  const typesValidesUEMOA = [
    'TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE',
    'COMPLETION_LIBRE_PRATIQUE',
    'CREATION_TRANSIT',
    'COMPLETION_TRANSIT',
    'NOTIFICATION_PAIEMENT',
    'AUTORISATION_MAINLEVEE',
    'APUREMENT',
    'TEST_COMMISSION'
  ];
  
  if (donnees.typeOperation && !typesValidesUEMOA.includes(donnees.typeOperation)) {
    erreurs.push(`Type d'opération non reconnu Commission UEMOA: ${donnees.typeOperation}`);
  }

  return erreurs;
}