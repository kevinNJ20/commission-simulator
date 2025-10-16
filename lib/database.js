// ============================================================================
// BASE DE DONNÉES COMMISSION UEMOA - Système Central de Traçabilité
// Conforme au rapport PDF - ÉTAPES 20-21 (Libre Pratique) + ÉTAPE 16 (Transit)
// Rôle: Supervision centralisée et traçabilité finale uniquement
// ============================================================================

const { v4: uuidv4 } = require('uuid');

class CommissionUEMOADatabase {
  constructor() {
    // ✅ FOCUS: Seulement les données de traçabilité centrale
    this.operationsTracabilite = new Map(); // Opérations reçues depuis Kit MuleSoft
    this.corridorsCommerciaux = new Map();   // Corridors surveillés UEMOA
    this.paysActifs = new Set();             // Pays membres avec activité
    this.alertesSupervision = [];            // Alertes pour supervision Commission
    this.metriquesUEMOA = new Map();         // Métriques agrégées UEMOA
    this.rapportsCommission = new Map();     // Rapports générés pour Commission
    
    // ✅ Statistiques spécifiques Commission UEMOA (étapes 20-21 et 16)
    this.statistiques = {
      operationsTotal: 0,                    // Total opérations tracées
      operationsAujourdhui: 0,              // Opérations du jour
      paysConnectes: 0,                     // Pays membres actifs
      corridorsActifs: 0,                   // Corridors commerciaux surveillés
      workflowsLibrePratique: 0,            // Workflows libre pratique (étapes 20-21)
      workflowsTransit: 0,                  // Workflows transit (étape 16)
      derniereMiseAJour: new Date()
    };
    
    // ✅ Pays membres UEMOA - Conforme au rapport PDF
    this.initPaysMembreUEMOA();
    
    // ✅ Données de test conformes aux étapes Commission
    this.genererDonneesTestCommission();
    
    console.log('🏛️ Base de données Commission UEMOA initialisée - Traçabilité centralisée');
    console.log('📋 Rôle: ÉTAPES 20-21 (Libre Pratique) + ÉTAPE 16 (Transit)');
  }

  // ✅ INITIALISATION: Pays membres UEMOA selon rapport PDF
  initPaysMembreUEMOA() {
    const paysMembers = [
      // Pays côtiers (de prime abord)
      { code: 'SEN', nom: 'Sénégal', ville: 'Dakar', type: 'COTIER', role: 'PAYS_PRIME_ABORD' },
      { code: 'CIV', nom: 'Côte d\'Ivoire', ville: 'Abidjan', type: 'COTIER', role: 'PAYS_PRIME_ABORD' },
      { code: 'BEN', nom: 'Bénin', ville: 'Cotonou', type: 'COTIER', role: 'PAYS_PRIME_ABORD' },
      { code: 'TGO', nom: 'Togo', ville: 'Lomé', type: 'COTIER', role: 'PAYS_PRIME_ABORD' },
      { code: 'GNB', nom: 'Guinée-Bissau', ville: 'Bissau', type: 'COTIER', role: 'PAYS_PRIME_ABORD' },
      
      // Pays de l'hinterland (de destination)  
      { code: 'MLI', nom: 'Mali', ville: 'Bamako', type: 'HINTERLAND', role: 'PAYS_DESTINATION' },
      { code: 'BFA', nom: 'Burkina Faso', ville: 'Ouagadougou', type: 'HINTERLAND', role: 'PAYS_DESTINATION' },
      { code: 'NER', nom: 'Niger', ville: 'Niamey', type: 'HINTERLAND', role: 'PAYS_DESTINATION' }
    ];

    this.paysUEMOA = new Map();
    paysMembers.forEach(pays => {
      this.paysUEMOA.set(pays.code, pays);
    });
    
    console.log(`📍 ${paysMembers.length} pays membres UEMOA enregistrés pour supervision`);
  }

  // ✅ ÉTAPES 20-21 et 16: Enregistrement opération de traçabilité depuis Kit MuleSoft
  enregistrerOperationTracabilite(operation) {
    const id = operation.numeroOperation || uuidv4();
    
    // ✅ Déterminer l'étape workflow selon le type d'opération
    const etapeWorkflow = this.determinerEtapeWorkflowCommission(operation);
    
    const operationComplete = {
      id,
      ...operation,
      etapeWorkflow,
      dateEnregistrement: new Date(),
      source: 'KIT_INTERCONNEXION_MULESOFT',
      statut: 'TRACE_COMMISSION',
      commission: {
        siege: 'Ouagadougou, Burkina Faso',
        fonction: 'TRACABILITE_CENTRALE_UEMOA',
        dateReception: new Date()
      }
    };
    
    this.operationsTracabilite.set(id, operationComplete);
    this.mettreAJourStatistiquesCommission(operationComplete);
    this.mettreAJourCorridorsUEMOA(operationComplete);
    this.analyserPourSupervision(operationComplete);
    
    console.log(`📊 [Commission] ÉTAPE ${etapeWorkflow} - Opération tracée: ${id}`);
    console.log(`🔄 [Commission] ${operation.typeOperation}: ${operation.paysOrigine} → ${operation.paysDestination}`);
    
    return operationComplete;
  }

  // ✅ Déterminer l'étape workflow Commission selon rapport PDF
  determinerEtapeWorkflowCommission(operation) {
    const type = operation.typeOperation;
    
    // Libre Pratique - Étapes 20-21 Commission
    if (type === 'TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE' || type === 'TRANSMISSION_MANIFESTE') {
      return '20'; // Notification Commission manifeste
    }
    
    if (type === 'COMPLETION_LIBRE_PRATIQUE' || type === 'SOUMISSION_DECLARATION_DOUANIERE') {
      return '21'; // Notification Commission finalisation libre pratique
    }
    
    // Transit - Étape 16 Commission
    if (type === 'COMPLETION_TRANSIT' || type === 'TRANSIT_CONFIRMATION') {
      return '16'; // Traçabilité transit finale
    }
    
    // Par défaut - traçabilité générale
    return '20-21'; // Traçabilité générale Commission
  }

  // ✅ Mise à jour statistiques spécifiques Commission UEMOA
  mettreAJourStatistiquesCommission(operation) {
    this.statistiques.operationsTotal++;
    this.statistiques.derniereMiseAJour = new Date();
    
    // ✅ Compteurs par type de workflow
    if (operation.etapeWorkflow === '20' || operation.etapeWorkflow === '21' || operation.etapeWorkflow === '20-21') {
      this.statistiques.workflowsLibrePratique++;
    }
    
    if (operation.etapeWorkflow === '16') {
      this.statistiques.workflowsTransit++;
    }
    
    // ✅ Pays membres actifs
    if (operation.paysOrigine && this.paysUEMOA.has(operation.paysOrigine)) {
      this.paysActifs.add(operation.paysOrigine);
    }
    if (operation.paysDestination && this.paysUEMOA.has(operation.paysDestination)) {
      this.paysActifs.add(operation.paysDestination);
    }
    this.statistiques.paysConnectes = this.paysActifs.size;
    
    // ✅ Opérations aujourd'hui
    const aujourdhui = new Date().toDateString();
    if (new Date(operation.dateEnregistrement).toDateString() === aujourdhui) {
      this.statistiques.operationsAujourdhui++;
    }
  }

  // ✅ Mise à jour corridors commerciaux UEMOA
  mettreAJourCorridorsUEMOA(operation) {
    if (operation.paysOrigine && operation.paysDestination) {
      const corridorId = `${operation.paysOrigine}-${operation.paysDestination}`;
      
      if (!this.corridorsCommerciaux.has(corridorId)) {
        // ✅ Informations corridor enrichies
        const paysOrigine = this.paysUEMOA.get(operation.paysOrigine);
        const paysDestination = this.paysUEMOA.get(operation.paysDestination);
        
        this.corridorsCommerciaux.set(corridorId, {
          id: corridorId,
          origine: operation.paysOrigine,
          destination: operation.paysDestination,
          nomOrigine: paysOrigine?.nom || operation.paysOrigine,
          nomDestination: paysDestination?.nom || operation.paysDestination,
          typeOrigine: paysOrigine?.type || 'INCONNU',
          typeDestination: paysDestination?.type || 'INCONNU',
          nombreOperations: 0,
          workflowsLibrePratique: 0,
          workflowsTransit: 0,
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
      
      // ✅ Compteurs par type de workflow
      if (operation.etapeWorkflow === '20' || operation.etapeWorkflow === '21' || operation.etapeWorkflow === '20-21') {
        corridor.workflowsLibrePratique++;
      }
      if (operation.etapeWorkflow === '16') {
        corridor.workflowsTransit++;
      }
      
      // ✅ Volume estimé
      if (operation.donneesMetier?.valeurTotaleEstimee || operation.donneesMetier?.valeur_approximative) {
        corridor.volumeEstime += (operation.donneesMetier.valeurTotaleEstimee || operation.donneesMetier.valeur_approximative || 0);
      }
      
      this.statistiques.corridorsActifs = this.corridorsCommerciaux.size;
    }
  }

  // ✅ Analyse pour supervision Commission UEMOA
  analyserPourSupervision(operation) {
    const alertes = [];
    
    // ✅ Alerte: Nouveau corridor commercial UEMOA
    const corridorId = `${operation.paysOrigine}-${operation.paysDestination}`;
    const corridor = this.corridorsCommerciaux.get(corridorId);
    if (corridor && corridor.nombreOperations === 1) {
      alertes.push({
        type: 'NOUVEAU_CORRIDOR_UEMOA',
        niveau: 'INFO',
        message: `Nouveau corridor commercial UEMOA surveillé: ${operation.paysOrigine} → ${operation.paysDestination}`,
        operation: operation.id,
        etapeWorkflow: operation.etapeWorkflow
      });
    }
    
    // ✅ Alerte: Volume élevé nécessitant attention Commission
    if (operation.donneesMetier?.valeurTotaleEstimee > 100000000) { // > 100M FCFA
      alertes.push({
        type: 'VOLUME_ELEVE_SUPERVISION',
        niveau: 'ATTENTION',
        message: `Volume élevé nécessitant supervision: ${operation.donneesMetier.valeurTotaleEstimee.toLocaleString()} FCFA`,
        operation: operation.id,
        corridor: corridorId,
        etapeWorkflow: operation.etapeWorkflow
      });
    }
    
    // ✅ Alerte: Workflow complet libre pratique (étapes 20-21)
    if (operation.etapeWorkflow === '21') {
      alertes.push({
        type: 'WORKFLOW_LIBRE_PRATIQUE_COMPLET',
        niveau: 'SUCCESS',
        message: `Workflow libre pratique (21 étapes) terminé avec succès`,
        operation: operation.id,
        corridor: corridorId
      });
    }
    
    // ✅ Enregistrer les alertes Commission
    alertes.forEach(alerte => this.ajouterAlerteSupervision(alerte));
  }

  ajouterAlerteSupervision(alerte) {
    const alerteComplete = {
      id: uuidv4(),
      ...alerte,
      timestamp: new Date(),
      statut: 'NOUVELLE_SUPERVISION',
      commission: {
        siege: 'Ouagadougou',
        fonction: 'SUPERVISION_CENTRALE'
      }
    };
    
    this.alertesSupervision.unshift(alerteComplete);
    
    // ✅ Garder seulement les 200 dernières alertes (Commission = beaucoup d'activité)
    if (this.alertesSupervision.length > 200) {
      this.alertesSupervision = this.alertesSupervision.slice(0, 200);
    }
    
    console.log(`🚨 [Commission Supervision] ${alerte.niveau}: ${alerte.message}`);
  }

  // ✅ ACCESSEURS: Adaptés au rôle Commission UEMOA

  obtenirOperations(limite = 50, filtres = {}) {
    let operations = Array.from(this.operationsTracabilite.values());
    
    // ✅ CORRECTION: Filtrage spécifique Commission avec support tableau
    if (filtres.typeOperation) {
      if (Array.isArray(filtres.typeOperation)) {
        operations = operations.filter(op => 
          filtres.typeOperation.some(type => 
            op.typeOperation && op.typeOperation.includes(type)
          )
        );
      } else {
        operations = operations.filter(op => 
          op.typeOperation && op.typeOperation.includes(filtres.typeOperation)
        );
      }
    }
    
    if (filtres.etapeWorkflow) {
      operations = operations.filter(op => op.etapeWorkflow === filtres.etapeWorkflow);
    }
    
    if (filtres.paysOrigine) {
      operations = operations.filter(op => op.paysOrigine === filtres.paysOrigine);
    }
    
    if (filtres.paysDestination) {
      operations = operations.filter(op => op.paysDestination === filtres.paysDestination);
    }
    
    // Tri par date décroissante
    operations.sort((a, b) => new Date(b.dateEnregistrement) - new Date(a.dateEnregistrement));
    
    return operations.slice(0, limite);
  }

  obtenirStatistiquesGlobales() {
    return {
      ...this.statistiques,
      paysMembresSurveilles: Array.from(this.paysActifs),
      corridorsCommerciauxActifs: this.corridorsCommerciaux.size,
      derniereMiseAJour: new Date(),
      commission: {
        nom: 'Commission UEMOA',
        siege: 'Ouagadougou, Burkina Faso',
        role: 'SUPERVISION_CENTRALE_TRACABILITE'
      }
    };
  }

  obtenirStatistiquesParPays() {
    const statsParPays = new Map();
    
    // ✅ Initialiser tous les pays membres UEMOA
    for (const [code, pays] of this.paysUEMOA) {
      statsParPays.set(code, {
        ...pays,
        operationsEnvoyees: 0,
        operationsRecues: 0,
        workflowsLibrePratique: 0,
        workflowsTransit: 0,
        volumeEnvoye: 0,
        volumeRecu: 0,
        dernierActivite: null
      });
    }
    
    // ✅ Calculer les statistiques basées sur les opérations tracées
    for (const operation of this.operationsTracabilite.values()) {
      // Pays origine
      if (operation.paysOrigine && statsParPays.has(operation.paysOrigine)) {
        const statsPaysOrigine = statsParPays.get(operation.paysOrigine);
        statsPaysOrigine.operationsEnvoyees++;
        
        if (operation.etapeWorkflow === '20' || operation.etapeWorkflow === '21' || operation.etapeWorkflow === '20-21') {
          statsPaysOrigine.workflowsLibrePratique++;
        }
        if (operation.etapeWorkflow === '16') {
          statsPaysOrigine.workflowsTransit++;
        }
        
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
        
        if (operation.etapeWorkflow === '20' || operation.etapeWorkflow === '21' || operation.etapeWorkflow === '20-21') {
          statsPaysDestination.workflowsLibrePratique++;
        }
        if (operation.etapeWorkflow === '16') {
          statsPaysDestination.workflowsTransit++;
        }
        
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

  obtenirCorridorsActifs() {
    return Array.from(this.corridorsCommerciaux.values())
      .map(corridor => ({
        ...corridor,
        typesOperations: Array.from(corridor.typesOperations),
        // ✅ Informations enrichies pour Commission
        description: `${corridor.nomOrigine} (${corridor.typeOrigine}) → ${corridor.nomDestination} (${corridor.typeDestination})`,
        efficacite: corridor.workflowsLibrePratique / Math.max(corridor.nombreOperations, 1) * 100
      }))
      .sort((a, b) => b.nombreOperations - a.nombreOperations);
  }

  obtenirOperationsParType() {
    const parType = {};
    
    for (const operation of this.operationsTracabilite.values()) {
      const type = operation.typeOperation || 'INCONNU';
      parType[type] = (parType[type] || 0) + 1;
    }
    
    // ✅ CORRECTION: Log pour debugging
    console.log('📊 [Database] Operations par type:', parType);
    
    return parType;
  }

  obtenirAlertes(limite = 50) {
    return this.alertesSupervision.slice(0, limite);
  }

  // ✅ Génération de données de test Commission UEMOA
  genererDonneesTestCommission() {
    const operationsTestCommission = [
      // ✅ Test Étape 20 - Notification manifeste libre pratique
      {
        typeOperation: 'TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE',
        numeroOperation: 'UEMOA_MAN_2025_001',
        paysOrigine: 'SEN', // Sénégal
        paysDestination: 'MLI', // Mali
        donneesMetier: {
          numero_manifeste: 'MAN_SEN_2025_5016',
          navire: 'MARCO POLO',
          consignataire: 'MAERSK LINE SENEGAL',
          port_debarquement: 'Port de Dakar',
          nombre_articles: 3,
          valeur_approximative: 25000000, // 25M FCFA
          pays_destinations: ['MLI']
        }
      },
      
      // ✅ Test Étape 21 - Finalisation libre pratique
      {
        typeOperation: 'COMPLETION_LIBRE_PRATIQUE',
        numeroOperation: 'UEMOA_FINAL_2025_001',
        paysOrigine: 'SEN',
        paysDestination: 'MLI',
        donneesMetier: {
          numero_declaration: 'DEC_MLI_2025_001',
          manifeste_origine: 'MAN_SEN_2025_5016',
          montant_paye: 3500000, // 3.5M FCFA
          reference_paiement: 'PAY_MLI_2025_001',
          workflow_complete: true,
          etapes_totales: 21
        }
      },
      
      // ✅ Test Étape 16 - Traçabilité transit
      {
        typeOperation: 'COMPLETION_TRANSIT',
        numeroOperation: 'UEMOA_TRANSIT_2025_001',
        paysOrigine: 'SEN',
        paysDestination: 'MLI',
        donneesMetier: {
          numero_declaration_transit: 'TRA_SEN_2025_001',
          transporteur: 'TRANSPORT SAHEL',
          delai_route: '72 heures',
          itineraire: 'Dakar-Bamako via Kayes',
          arrivee_confirmee: true,
          etapes_totales: 16
        }
      }
    ];

    console.log('🧪 Génération données de test Commission UEMOA...');
    operationsTestCommission.forEach(op => {
      this.enregistrerOperationTracabilite(op);
    });

    console.log(`✅ ${operationsTestCommission.length} opérations de test Commission générées`);
  }

  // ✅ MÉTHODES UTILITAIRES Commission

  rechercherOperations(termesRecherche, limite = 30) {
    const termes = termesRecherche.toLowerCase();
    const operations = Array.from(this.operationsTracabilite.values());
    
    const resultats = operations.filter(operation => {
      return (
        operation.typeOperation?.toLowerCase().includes(termes) ||
        operation.numeroOperation?.toLowerCase().includes(termes) ||
        operation.paysOrigine?.toLowerCase().includes(termes) ||
        operation.paysDestination?.toLowerCase().includes(termes) ||
        operation.etapeWorkflow?.toString().includes(termes) ||
        JSON.stringify(operation.donneesMetier).toLowerCase().includes(termes)
      );
    });
    
    return resultats
      .sort((a, b) => new Date(b.dateEnregistrement) - new Date(a.dateEnregistrement))
      .slice(0, limite);
  }

  reinitialiser() {
    console.log('🔄 [Commission] Réinitialisation base de données traçabilité...');
    
    this.operationsTracabilite.clear();
    this.corridorsCommerciaux.clear();
    this.paysActifs.clear();
    this.alertesSupervision = [];
    this.metriquesUEMOA.clear();
    this.rapportsCommission.clear();
    
    this.statistiques = {
      operationsTotal: 0,
      operationsAujourdhui: 0,
      paysConnectes: 0,
      corridorsActifs: 0,
      workflowsLibrePratique: 0,
      workflowsTransit: 0,
      derniereMiseAJour: new Date()
    };
    
    // Régénérer les données de test
    this.genererDonneesTestCommission();
    
    console.log('✅ [Commission] Base de données traçabilité réinitialisée');
  }
}

// ✅ Instance singleton Commission UEMOA
const database = new CommissionUEMOADatabase();

module.exports = database;