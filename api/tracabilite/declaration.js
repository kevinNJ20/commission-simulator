// ============================================================================
// COMMISSION UEMOA - Endpoint spécialisé pour les DÉCLARATIONS DOUANIÈRES
// Fichier: api/tracabilite/declaration.js (CORRIGÉ)
// ============================================================================

const database = require('../../lib/database');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-System, X-Correlation-ID, X-Format');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      console.log('📋 [Commission] Nouvelle soumission de déclaration reçue:', {
        source: req.headers['x-source-system'],
        correlationId: req.headers['x-correlation-id'],
        typeOperation: req.body?.typeOperation,
        numeroOperation: req.body?.numeroOperation
      });
      
      // Validation spécifique aux déclarations
      const erreurs = validerSoumissionDeclaration(req.body);
      if (erreurs.length > 0) {
        console.log('❌ [Commission] Soumission déclaration invalide:', erreurs);
        return res.status(400).json({
          status: 'ERROR',
          message: 'Données de soumission déclaration invalides',
          erreurs,
          timestamp: new Date().toISOString()
        });
      }

      // ✅ CORRECTION: Normaliser les codes pays pour déclarations
      const donneesNormalisees = normaliserCodesPaysDeclaration(req.body);

      // Enrichir les données avec les métadonnées de la requête
      const declarationEnrichie = {
        ...donneesNormalisees,
        typeDocument: 'DECLARATION',
        metadonnees: {
          ipSource: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          sourceSystem: req.headers['x-source-system'],
          correlationId: req.headers['x-correlation-id'],
          timestamp: Date.now()
        }
      };

      // Enregistrer la déclaration dans la base centrale
      const declarationEnregistree = database.enregistrerOperationTracabilite(declarationEnrichie);

      console.log(`✅ [Commission] Déclaration enregistrée: ${declarationEnregistree.id}`);

      // Réponse de confirmation spécialisée
      const reponse = {
        status: 'RECORDED',
        message: 'Soumission de déclaration douanière enregistrée avec succès',
        
        declaration: {
          id: declarationEnregistree.id,
          numeroOperation: declarationEnregistree.numeroOperation,
          numeroDeclaration: declarationEnregistree.donneesMetier?.numero_declaration,
          bureauDeclaration: declarationEnregistree.donneesMetier?.bureau_declaration || 'NON_SPECIFIE',
          corridor: `${declarationEnregistree.paysOrigine} → ${declarationEnregistree.paysDestination}`,
          nombreArticles: declarationEnregistree.donneesMetier?.nombre_articles || 'NON_SPECIFIE',
          valeurTotaleCaf: declarationEnregistree.donneesMetier?.valeur_totale_caf || declarationEnregistree.donneesMetier?.montant_paye || 'NON_SPECIFIE',
          liquidationTotale: declarationEnregistree.donneesMetier?.liquidation_totale || declarationEnregistree.donneesMetier?.montant_paye,
          dateEnregistrement: declarationEnregistree.dateEnregistrement
        },
        
        commission: {
          nom: 'Commission UEMOA',
          fonction: 'TRACABILITE_DECLARATIONS'
        },
        
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id']
      };

      res.status(200).json(reponse);
      
    } else if (req.method === 'GET') {
      // Lister les déclarations uniquement
      const limite = parseInt(req.query.limite) || 50;
      // ✅ CORRECTION: Filtrer toutes les opérations puis identifier les déclarations
      const toutesOperations = database.obtenirOperations(limite * 2); // Plus large pour filtrer après
      
      // ✅ Filtrer côté JavaScript pour plus de flexibilité
      const declarations = toutesOperations.filter(op => {
        const type = op.typeOperation || '';
        return type.includes('DECLARATION') || 
               type.includes('COMPLETION') || 
               type.includes('SOUMISSION') ||
               op.etapeWorkflow === '21';
      }).slice(0, limite);
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Liste de ${declarations.length} soumission(s) de déclaration`,
        declarations: declarations.map(d => ({
          id: d.id,
          numeroOperation: d.numeroOperation,
          numeroDeclaration: d.donneesMetier?.numero_declaration,
          bureauDeclaration: d.donneesMetier?.bureau_declaration || 'NON_SPECIFIE',
          corridor: `${d.paysOrigine} → ${d.paysDestination}`,
          valeurTotaleCaf: d.donneesMetier?.valeur_totale_caf || d.donneesMetier?.montant_paye || 0,
          dateEnregistrement: d.dateEnregistrement
        })),
        timestamp: new Date().toISOString()
      });
      
    } else {
      res.status(405).json({ 
        erreur: 'Méthode non autorisée',
        methodesAutorisees: ['GET', 'POST', 'OPTIONS']
      });
    }
    
  } catch (error) {
    console.error('❌ [Commission] Erreur API déclaration:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors du traitement de la soumission déclaration',
      erreur: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id']
    });
  }
};

// ✅ FONCTION: Normaliser les codes pays pour déclarations
function normaliserCodesPaysDeclaration(donnees) {
  const mapPays = {
    'SÉNÉGAL': 'SEN',
    'SENEGAL': 'SEN',
    'BURKINA FASO': 'BFA',
    'BURKINA': 'BFA',
    'CÔTE D\'IVOIRE': 'CIV',
    'COTE D\'IVOIRE': 'CIV',
    'MALI': 'MLI',
    'NIGER': 'NER',
    'TOGO': 'TGO',
    'BÉNIN': 'BEN',
    'BENIN': 'BEN',
    'GUINÉE-BISSAU': 'GNB',
    'GUINEE-BISSAU': 'GNB'
  };

  const donneesNormalisees = { ...donnees };
  
  // Normaliser paysOrigine
  if (donnees.paysOrigine && mapPays[donnees.paysOrigine.toUpperCase()]) {
    donneesNormalisees.paysOrigine = mapPays[donnees.paysOrigine.toUpperCase()];
  }
  
  // Normaliser paysDestination
  if (donnees.paysDestination && mapPays[donnees.paysDestination.toUpperCase()]) {
    donneesNormalisees.paysDestination = mapPays[donnees.paysDestination.toUpperCase()];
  }
  
  // Normaliser les codes pays dans les articles
  if (donnees.donneesMetier?.origines_distinctes) {
    donneesNormalisees.donneesMetier.origines_distinctes = donnees.donneesMetier.origines_distinctes.map(pays => 
      mapPays[pays.toUpperCase()] || pays
    );
  }
  
  console.log('🔄 [Commission] Codes pays déclaration normalisés:', {
    original: {
      origine: donnees.paysOrigine,
      destination: donnees.paysDestination
    },
    normalise: {
      origine: donneesNormalisees.paysOrigine,
      destination: donneesNormalisees.paysDestination
    }
  });
  
  return donneesNormalisees;
}

// ✅ VALIDATION CORRIGÉE: Accepter COMPLETION_LIBRE_PRATIQUE et rendre certains champs optionnels
function validerSoumissionDeclaration(donnees) {
  const erreurs = [];

  if (!donnees || typeof donnees !== 'object') {
    erreurs.push('Données de déclaration manquantes ou invalides');
    return erreurs;
  }

  // ✅ CORRECTION: Accepter aussi "COMPLETION" dans le type d'opération
  if (!donnees.typeOperation || 
      (!donnees.typeOperation.includes('DECLARATION') && !donnees.typeOperation.includes('COMPLETION'))) {
    erreurs.push('Type d\'opération déclaration ou completion requis');
  }

  if (!donnees.numeroOperation) {
    erreurs.push('Numéro d\'opération déclaration requis');
  }

  if (!donnees.paysOrigine) {
    erreurs.push('Pays d\'origine requis');
  }

  if (!donnees.paysDestination) {
    erreurs.push('Pays de destination requis');
  }

  // ✅ Vérifications spécifiques déclaration (plus flexibles)
  if (donnees.donneesMetier) {
    if (!donnees.donneesMetier.numero_declaration) {
      erreurs.push('Numéro de déclaration requis dans les données métier');
    }
    
    // ✅ CORRECTION: Bureau de déclaration optionnel pour les COMPLETION venant du Kit
    const isCompletion = donnees.typeOperation && donnees.typeOperation.includes('COMPLETION');
    
    if (!isCompletion && !donnees.donneesMetier.bureau_declaration) {
      erreurs.push('Bureau de déclaration requis dans les données métier (sauf pour COMPLETION)');
    }
    
    // ✅ CORRECTION: Nombre d'articles optionnel pour COMPLETION
    if (!isCompletion && typeof donnees.donneesMetier.nombre_articles !== 'number') {
      // Vérifier si on a au moins un indicateur de quantité
      if (!donnees.donneesMetier.montant_paye && !donnees.donneesMetier.valeur_totale_caf) {
        erreurs.push('Nombre d\'articles ou montant requis pour les déclarations');
      }
    }
    
    // ✅ CORRECTION: Accepter montant_paye comme alternative à valeur_totale_caf
    if (!isCompletion && 
        typeof donnees.donneesMetier.valeur_totale_caf !== 'number' && 
        typeof donnees.donneesMetier.montant_paye !== 'number') {
      erreurs.push('Valeur totale CAF ou montant payé requis');
    }
  } else {
    erreurs.push('Données métier requises pour la déclaration');
  }

  return erreurs;
}