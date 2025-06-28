// Base de données Commission UEMOA - Système Central de Traçabilité
const { v4: uuidv4 } = require('uuid');

class CommissionDatabase {
  constructor() {
    this.operationsTracabilite = new Map();
    this.corridorsCommerciaux = new Map();
    this.paysActifs = new Set();
    this.alertesSysteme = [];
    this.metriquesTempsReel = new Map();
    this.rapportsGeneres = new Map();
    
    this.statistiques = {
      operationsTotal: 0,
      operationsAujourdhui: 0,
      paysConnectes: 0,
      corridorsActifs: 0,
      volumeEchanges: 0,
      derniereMiseAJour: new Date()
    };
    
    // Initialiser les pays UEMOA
    this.initPaysUEMOA();
    
    // Générer quelques données de test
    this.genererDonneesTest();
    
    console.log('🏛️ Base de données Commission UEMOA initialisée');
  }

  initPaysUEMOA() {
    const pays = [
      { code: 'BFA', nom: 'Burkina Faso', type: 'HINTERLAND' },
      { code: 'BEN', nom: 'Bénin', type: 'COTIER' },
      { code: 'CIV', nom: 'Côte d\'Ivoire', type: 'COTIER' },
      { code: 'GNB', nom: 'Guinée-Bissau', type: 'COTIER' },
      { code: 'MLI', nom: 'Mali', type: 'HINTERLAND' },
      { code: 'NER', nom: 'Niger', type: 'HINTERLAND' },
      { code: 'SEN', nom: 'Sénégal', type: 'COTIER' },
      { code: 'TGO', nom: 'Togo', type: 'COTIER' }
    ];

    this.paysUEMOA = new Map();
    pays.forEach(pays => {
      this.paysUEMOA.set(pays.code, pays);
    });
  }

  // === RÉCEPTION OPÉRATIONS DE TRAÇABILITÉ DEPUIS LE KIT ===
  enregistrerOperationTracabilite(operation) {
    const id = operation.numeroOperation || uuidv4();
    
    const operationComplete = {
      id,
      ...operation,
      dateEnregistrement: new Date(),
      source: 'KIT_INTERCONNEXION',
      statut: 'ENREGISTREE',
      metadonnees: {
        ipSource: null, // Sera rempli par l'API
        userAgent: null,
        timestamp: Date.now()
      }
    };
    
    this.operationsTracabilite.set(id, operationComplete);
    this.mettreAJourStatistiques(operationComplete);
    this.mettreAJourCorridors(operationComplete);
    this.analyserPourAlertes(operationComplete);
    
    console.log(`📊 [Commission] Opération de traçabilité enregistrée: ${id}`);
    console.log(`🔄 [Commission] Type: ${operation.typeOperation}, ${operation.paysOrigine} → ${operation.paysDestination}`);
    
    return operationComplete;
  }

  mettreAJourStatistiques(operation) {
    this.statistiques.operationsTotal++;
    this.statistiques.derniereMiseAJour = new Date();
    
    // Ajouter pays actifs
    if (operation.paysOrigine) {
      this.paysActifs.add(operation.paysOrigine);
    }
    if (operation.paysDestination) {
      this.paysActifs.add(operation.paysDestination);
    }
    this.statistiques.paysConnectes = this.paysActifs.size;
    
    // Compter opérations aujourd'hui
    const aujourdhui = new Date().toDateString();
    if (new Date(operation.dateEnregistrement).toDateString() === aujourdhui) {
      this.statistiques.operationsAujourdhui++;
    }
    
    // Estimer volume d'échanges (basé sur les données métier)
    if (operation.donneesMetier?.valeurTotaleEstimee) {
      this.statistiques.volumeEchanges += operation.donneesMetier.valeurTotaleEstimee;
    }
  }

  mettreAJourCorridors(operation) {
    if (operation.paysOrigine && operation.paysDestination) {
      const corridorId = `${operation.paysOrigine}-${operation.paysDestination}`;
      
      if (!this.corridorsCommerciaux.has(corridorId)) {
        this.corridorsCommerciaux.set(corridorId, {
          id: corridorId,
          origine: operation.paysOrigine,
          destination: operation.paysDestination,
          nombreOperations: 0,
          volumeEstime: 0,
          typesOperations: new Set(),
          premiereOperation: operation.dateEnregistrement,
          derniereOperation: operation.dateEnregistrement
        });
      }
      
      const corridor = this.corridorsCommerciaux.get(corridorId);
      corridor.nombreOperations++;
      corridor.typesOperations.add(operation.typeOperation);
      corridor.derniereOperation = operation.dateEnregistrement;
      
      if (operation.donneesMetier?.valeurTotaleEstimee) {
        corridor.volumeEstime += operation.donneesMetier.valeurTotaleEstimee;
      }
      
      this.statistiques.corridorsActifs = this.corridorsCommerciaux.size;
    }
  }

  analyserPourAlertes(operation) {
    // Analyser pour détecter des anomalies ou points d'attention
    const alertes = [];
    
    // Alerte: Nouveau corridor commercial
    const corridorId = `${operation.paysOrigine}-${operation.paysDestination}`;
    const corridor = this.corridorsCommerciaux.get(corridorId);
    if (corridor && corridor.nombreOperations === 1) {
      alertes.push({
        type: 'NOUVEAU_CORRIDOR',
        niveau: 'INFO',
        message: `Nouveau corridor commercial détecté: ${operation.paysOrigine} → ${operation.paysDestination}`,
        operation: operation.id
      });
    }
    
    // Alerte: Volume élevé
    if (operation.donneesMetier?.valeurTotaleEstimee > 10000000) { // > 10M FCFA
      alertes.push({
        type: 'VOLUME_ELEVE',
        niveau: 'ATTENTION',
        message: `Volume élevé détecté: ${operation.donneesMetier.valeurTotaleEstimee.toLocaleString()} FCFA`,
        operation: operation.id
      });
    }
    
    // Enregistrer les alertes
    alertes.forEach(alerte => this.ajouterAlerte(alerte));
  }

  ajouterAlerte(alerte) {
    const alerteComplete = {
      id: uuidv4(),
      ...alerte,
      timestamp: new Date(),
      statut: 'NOUVELLE'
    };
    
    this.alertesSysteme.unshift(alerteComplete);
    
    // Garder seulement les 100 dernières alertes
    if (this.alertesSysteme.length > 100) {
      this.alertesSysteme = this.alertesSysteme.slice(0, 100);
    }
    
    console.log(`🚨 [Commission] Alerte ${alerte.niveau}: ${alerte.message}`);
  }

  // === MÉTRIQUES TEMPS RÉEL ===
  enregistrerMetriqueTempsReel(cle, valeur, metadata = {}) {
    const metrique = {
      valeur,
      timestamp: new Date(),
      metadata
    };
    
    if (!this.metriquesTempsReel.has(cle)) {
      this.metriquesTempsReel.set(cle, []);
    }
    
    const historique = this.metriquesTempsReel.get(cle);
    historique.unshift(metrique);
    
    // Garder seulement les 100 dernières valeurs
    if (historique.length > 100) {
      historique.splice(100);
    }
  }

  obtenirMetriqueTempsReel(cle, limite = 10) {
    return this.metriquesTempsReel.get(cle)?.slice(0, limite) || [];
  }

  // === ACCESSEURS ET RECHERCHE ===
  obtenirOperations(limite = 50, filtres = {}) {
    let operations = Array.from(this.operationsTracabilite.values());
    
    // Filtrage
    if (filtres.typeOperation) {
      operations = operations.filter(op => op.typeOperation === filtres.typeOperation);
    }
    
    if (filtres.paysOrigine) {
      operations = operations.filter(op => op.paysOrigine === filtres.paysOrigine);
    }
    
    if (filtres.paysDestination) {
      operations = operations.filter(op => op.paysDestination === filtres.paysDestination);
    }
    
    if (filtres.dateDebut) {
      const dateDebut = new Date(filtres.dateDebut);
      operations = operations.filter(op => new Date(op.dateEnregistrement) >= dateDebut);
    }
    
    if (filtres.dateFin) {
      const dateFin = new Date(filtres.dateFin);
      operations = operations.filter(op => new Date(op.dateEnregistrement) <= dateFin);
    }
    
    // Tri par date décroissante
    operations.sort((a, b) => new Date(b.dateEnregistrement) - new Date(a.dateEnregistrement));
    
    return operations.slice(0, limite);
  }

  rechercherOperations(termesRecherche, limite = 20) {
    const termes = termesRecherche.toLowerCase();
    const operations = Array.from(this.operationsTracabilite.values());
    
    const resultats = operations.filter(operation => {
      return (
        operation.typeOperation?.toLowerCase().includes(termes) ||
        operation.numeroOperation?.toLowerCase().includes(termes) ||
        operation.paysOrigine?.toLowerCase().includes(termes) ||
        operation.paysDestination?.toLowerCase().includes(termes) ||
        JSON.stringify(operation.donneesMetier).toLowerCase().includes(termes)
      );
    });
    
    return resultats
      .sort((a, b) => new Date(b.dateEnregistrement) - new Date(a.dateEnregistrement))
      .slice(0, limite);
  }

  obtenirCorridorsActifs() {
    return Array.from(this.corridorsCommerciaux.values())
      .map(corridor => ({
        ...corridor,
        typesOperations: Array.from(corridor.typesOperations)
      }))
      .sort((a, b) => b.nombreOperations - a.nombreOperations);
  }

  obtenirStatistiquesGlobales() {
    return {
      ...this.statistiques,
      paysActifs: Array.from(this.paysActifs),
      derniereMiseAJour: new Date()
    };
  }

  obtenirStatistiquesParPays() {
    const statsParPays = new Map();
    
    // Initialiser tous les pays UEMOA
    for (const [code, pays] of this.paysUEMOA) {
      statsParPays.set(code, {
        ...pays,
        operationsEnvoyees: 0,
        operationsRecues: 0,
        volumeEnvoye: 0,
        volumeRecu: 0,
        dernierActivite: null
      });
    }
    
    // Calculer les statistiques basées sur les opérations
    for (const operation of this.operationsTracabilite.values()) {
      // Pays origine
      if (operation.paysOrigine && statsParPays.has(operation.paysOrigine)) {
        const statsPaysOrigine = statsParPays.get(operation.paysOrigine);
        statsPaysOrigine.operationsEnvoyees++;
        if (operation.donneesMetier?.valeurTotaleEstimee) {
          statsPaysOrigine.volumeEnvoye += operation.donneesMetier.valeurTotaleEstimee;
        }
        if (!statsPaysOrigine.dernierActivite || 
            new Date(operation.dateEnregistrement) > new Date(statsPaysOrigine.dernierActivite)) {
          statsPaysOrigine.dernierActivite = operation.dateEnregistrement;
        }
      }
      
      // Pays destination
      if (operation.paysDestination && statsParPays.has(operation.paysDestination)) {
        const statsPaysDestination = statsParPays.get(operation.paysDestination);
        statsPaysDestination.operationsRecues++;
        if (operation.donneesMetier?.valeurTotaleEstimee) {
          statsPaysDestination.volumeRecu += operation.donneesMetier.valeurTotaleEstimee;
        }
        if (!statsPaysDestination.dernierActivite || 
            new Date(operation.dateEnregistrement) > new Date(statsPaysDestination.dernierActivite)) {
          statsPaysDestination.dernierActivite = operation.dateEnregistrement;
        }
      }
    }
    
    return Array.from(statsParPays.values());
  }

  obtenirOperationsParType() {
    const parType = {};
    
    for (const operation of this.operationsTracabilite.values()) {
      const type = operation.typeOperation || 'INCONNU';
      parType[type] = (parType[type] || 0) + 1;
    }
    
    return parType;
  }

  obtenirAlertes(limite = 20) {
    return this.alertesSysteme.slice(0, limite);
  }

  // === GÉNÉRATION DE RAPPORTS ===
  genererRapport(typeRapport, parametres = {}) {
    const rapportId = uuidv4();
    const dateGeneration = new Date();
    
    let donnees = {};
    
    switch (typeRapport) {
      case 'GLOBAL':
        donnees = this.genererRapportGlobal(parametres);
        break;
      case 'PAR_PAYS':
        donnees = this.genererRapportParPays(parametres);
        break;
      case 'CORRIDORS':
        donnees = this.genererRapportCorridors(parametres);
        break;
      default:
        throw new Error(`Type de rapport non supporté: ${typeRapport}`);
    }
    
    const rapport = {
      id: rapportId,
      type: typeRapport,
      parametres,
      donnees,
      dateGeneration,
      statut: 'GENERE'
    };
    
    this.rapportsGeneres.set(rapportId, rapport);
    
    console.log(`📋 [Commission] Rapport ${typeRapport} généré: ${rapportId}`);
    
    return rapport;
  }

  genererRapportGlobal(parametres) {
    return {
      statistiquesGlobales: this.obtenirStatistiquesGlobales(),
      operationsParType: this.obtenirOperationsParType(),
      corridorsActifs: this.obtenirCorridorsActifs().slice(0, 10),
      alertesRecentes: this.obtenirAlertes(10),
      tendances: this.calculerTendances()
    };
  }

  genererRapportParPays(parametres) {
    return {
      statistiquesParPays: this.obtenirStatistiquesParPays(),
      paysLesPlusActifs: this.obtenirStatistiquesParPays()
        .sort((a, b) => (b.operationsEnvoyees + b.operationsRecues) - (a.operationsEnvoyees + a.operationsRecues))
        .slice(0, 5)
    };
  }

  genererRapportCorridors(parametres) {
    return {
      corridorsActifs: this.obtenirCorridorsActifs(),
      corridorsLesPlusUtilises: this.obtenirCorridorsActifs().slice(0, 10),
      analyseFlux: this.analyserFluxCommercial()
    };
  }

  calculerTendances() {
    // Calculer les tendances basées sur les opérations récentes
    const maintenant = new Date();
    const hier = new Date(maintenant.getTime() - (24 * 60 * 60 * 1000));
    const semaineDerniere = new Date(maintenant.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const operationsAujourdhui = this.obtenirOperations(1000, { 
      dateDebut: hier.toISOString() 
    }).length;
    
    const operationsSemaineDerniere = this.obtenirOperations(1000, { 
      dateDebut: semaineDerniere.toISOString(),
      dateFin: hier.toISOString()
    }).length;
    
    const tendance = operationsSemaineDerniere > 0 
      ? ((operationsAujourdhui - operationsSemaineDerniere) / operationsSemaineDerniere) * 100
      : 0;
    
    return {
      operationsAujourdhui,
      operationsSemaineDerniere,
      evolution: Math.round(tendance * 100) / 100,
      direction: tendance > 5 ? 'HAUSSE' : tendance < -5 ? 'BAISSE' : 'STABLE'
    };
  }

  analyserFluxCommercial() {
    const flux = {
      totalOperations: this.statistiques.operationsTotal,
      corridorsPrincipaux: this.obtenirCorridorsActifs().slice(0, 5),
      paysExpeDominants: this.obtenirStatistiquesParPays()
        .sort((a, b) => b.operationsEnvoyees - a.operationsEnvoyees)
        .slice(0, 3),
      paysDestDominants: this.obtenirStatistiquesParPays()
        .sort((a, b) => b.operationsRecues - a.operationsRecues)
        .slice(0, 3)
    };
    
    return flux;
  }

  // === DONNÉES DE TEST ===
  genererDonneesTest() {
    const operationsTest = [
      {
        typeOperation: 'TRANSMISSION_MANIFESTE',
        numeroOperation: 'MAN2025001-20250115103000',
        paysOrigine: 'CIV',
        paysDestination: 'BFA',
        donneesMetier: {
          numeroManifeste: 'MAN2025001',
          transporteur: 'MAERSK LINE',
          nombreMarchandises: 2,
          valeurTotaleEstimee: 5000000
        }
      },
      {
        typeOperation: 'NOTIFICATION_PAIEMENT',
        numeroOperation: 'PAY2025001-20250115140000',
        paysOrigine: 'BFA',
        paysDestination: 'CIV',
        donneesMetier: {
          numeroDeclaration: 'DEC2025001',
          montantPaye: 350000,
          referencePaiement: 'PAY2025001'
        }
      }
    ];

    operationsTest.forEach(op => {
      this.enregistrerOperationTracabilite(op);
    });

    console.log('🧪 [Commission] Données de test générées');
  }

  // === MÉTHODES UTILITAIRES ===
  reinitialiser() {
    this.operationsTracabilite.clear();
    this.corridorsCommerciaux.clear();
    this.paysActifs.clear();
    this.alertesSysteme = [];
    this.metriquesTempsReel.clear();
    this.rapportsGeneres.clear();
    
    this.statistiques = {
      operationsTotal: 0,
      operationsAujourdhui: 0,
      paysConnectes: 0,
      corridorsActifs: 0,
      volumeEchanges: 0,
      derniereMiseAJour: new Date()
    };
    
    console.log('🔄 [Commission] Base de données réinitialisée');
  }
}

// Instance singleton
const database = new CommissionDatabase();

module.exports = database;