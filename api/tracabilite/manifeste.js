// ============================================================================
// COMMISSION UEMOA - Endpoint spécialisé pour les MANIFESTES
// Fichier: api/tracabilite/manifeste.js
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
      console.log('📦 [Commission] Nouvelle transmission de manifeste reçue:', {
        source: req.headers['x-source-system'],
        correlationId: req.headers['x-correlation-id'],
        typeOperation: req.body?.typeOperation,
        numeroOperation: req.body?.numeroOperation
      });
      
      // Validation spécifique aux manifestes
      const erreurs = validerTransmissionManifeste(req.body);
      if (erreurs.length > 0) {
        console.log('❌ [Commission] Transmission manifeste invalide:', erreurs);
        return res.status(400).json({
          status: 'ERROR',
          message: 'Données de transmission manifeste invalides',
          erreurs,
          timestamp: new Date().toISOString()
        });
      }

      // ✅ CORRECTION: Normaliser les codes pays
      const donneesNormalisees = normaliserCodesPaysPourManifeste(req.body);

      // Enrichir les données avec les métadonnées de la requête
      const manifesteEnrichi = {
        ...donneesNormalisees,
        typeDocument: 'MANIFESTE',
        metadonnees: {
          ipSource: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          sourceSystem: req.headers['x-source-system'],
          correlationId: req.headers['x-correlation-id'],
          timestamp: Date.now()
        }
      };

      // Enregistrer le manifeste dans la base centrale
      const manifesteEnregistre = database.enregistrerOperationTracabilite(manifesteEnrichi);

      console.log(`✅ [Commission] Manifeste enregistré: ${manifesteEnregistre.id}`);

      // Réponse de confirmation spécialisée
      const reponse = {
        status: 'RECORDED',
        message: 'Transmission de manifeste enregistrée avec succès',
        
        manifeste: {
          id: manifesteEnregistre.id,
          numeroOperation: manifesteEnregistre.numeroOperation,
          numeroManifeste: manifesteEnregistre.donneesMetier?.numero_manifeste,
          navire: manifesteEnregistre.donneesMetier?.navire,
          consignataire: manifesteEnregistre.donneesMetier?.consignataire,
          corridor: `${manifesteEnregistre.paysOrigine} → ${manifesteEnregistre.paysDestination}`,
          nombreArticles: manifesteEnregistre.donneesMetier?.nombre_articles,
          dateEnregistrement: manifesteEnregistre.dateEnregistrement
        },
        
        commission: {
          nom: 'Commission UEMOA',
          fonction: 'TRACABILITE_MANIFESTES'
        },
        
        timestamp: new Date().toISOString(),
        correlationId: req.headers['x-correlation-id']
      };

      res.status(200).json(reponse);
      
    } else if (req.method === 'GET') {
      // Lister les manifestes uniquement
      const limite = parseInt(req.query.limite) || 50;
      const manifestes = database.obtenirOperations(limite, { 
        typeOperation: ['TRANSMISSION_MANIFESTE', 'TRANSMISSION_MANIFESTE_UEMOA'] 
      });
      
      res.status(200).json({
        status: 'SUCCESS',
        message: `Liste de ${manifestes.length} transmission(s) de manifeste`,
        manifestes: manifestes.map(m => ({
          id: m.id,
          numeroOperation: m.numeroOperation,
          numeroManifeste: m.donneesMetier?.numero_manifeste,
          navire: m.donneesMetier?.navire,
          corridor: `${m.paysOrigine} → ${m.paysDestination}`,
          dateEnregistrement: m.dateEnregistrement
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
    console.error('❌ [Commission] Erreur API manifeste:', error);
    
    res.status(500).json({
      status: 'ERROR',
      message: 'Erreur lors du traitement de la transmission manifeste',
      erreur: error.message,
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id']
    });
  }
};

// ✅ FONCTION: Normaliser les codes pays pour éviter l'erreur 400
function normaliserCodesPaysPourManifeste(donnees) {
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
  
  // Normaliser les pays dans donneesMetier.pays_destinations
  if (donnees.donneesMetier?.pays_destinations) {
    donneesNormalisees.donneesMetier.pays_destinations = donnees.donneesMetier.pays_destinations.map(pays => 
      mapPays[pays.toUpperCase()] || pays
    );
  }
  
  console.log('🔄 [Commission] Codes pays normalisés:', {
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

// Validation spécifique aux manifestes
function validerTransmissionManifeste(donnees) {
  const erreurs = [];

  if (!donnees || typeof donnees !== 'object') {
    erreurs.push('Données de manifeste manquantes ou invalides');
    return erreurs;
  }

  // Vérifications obligatoires pour manifestes
  if (!donnees.typeOperation || !donnees.typeOperation.includes('MANIFESTE')) {
    erreurs.push('Type d\'opération manifeste requis');
  }

  if (!donnees.numeroOperation) {
    erreurs.push('Numéro d\'opération manifeste requis');
  }

  if (!donnees.paysOrigine) {
    erreurs.push('Pays d\'origine requis');
  }

  if (!donnees.paysDestination) {
    erreurs.push('Pays de destination requis');
  }

  // Vérifications spécifiques manifeste
  if (donnees.donneesMetier) {
    if (!donnees.donneesMetier.numero_manifeste) {
      erreurs.push('Numéro de manifeste requis dans les données métier');
    }
    
    if (!donnees.donneesMetier.consignataire) {
      erreurs.push('Consignataire requis dans les données métier');
    }
    
    if (!donnees.donneesMetier.navire) {
      erreurs.push('Nom du navire requis dans les données métier');
    }
  }

  return erreurs;
}