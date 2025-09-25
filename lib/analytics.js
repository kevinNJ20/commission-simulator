// ============================================================================
// ANALYTICS COMMISSION UEMOA - Système de Supervision Avancée
// Rôle: Analyse des workflows UEMOA - ÉTAPES 20-21 (Libre Pratique) + 16 (Transit)
// ============================================================================

class AnalyticsCommissionUEMOA {
  constructor() {
    // ✅ Métriques spécifiques supervision Commission UEMOA
    this.metriquesSupervision = new Map();
    this.alertesCommission = [];
    this.systemesInterconnectes = new Set(['KIT_INTERCONNEXION_MULESOFT']);
    this.historiqueOperations = [];
    this.corridorsAnalyse = new Map();
    this.tendancesUEMOA = new Map();
    
    // ✅ Seuils d'alertes Commission UEMOA
    this.seuilsAlertes = {
      tauxEchecWorkflow: 0.10, // 10% d'échec maximum
      latenceMaxCommission: 5000, // 5 secondes max pour Commission
      operationsMinParJour: 5, // Minimum 5 opérations/jour
      volumeMaxSansAlerte: 500000000, // 500M FCFA
      corridorsMinActifs: 2 // Minimum 2 corridors actifs
    };
    
    this.initMetriquesCommission();
    console.log('📊 Analytics Commission UEMOA initialisé - Supervision workflows');
  }

  initMetriquesCommission() {
    // ✅ Métriques de base Commission
    this.metriquesSupervision.set('operations_etape_20', 0); // Notifications manifeste
    this.metriquesSupervision.set('operations_etape_21', 0); // Finalisations libre pratique
    this.metriquesSupervision.set('operations_etape_16', 0); // Traçabilité transit
    this.metriquesSupervision.set('workflows_libre_pratique_complets', 0);
    this.metriquesSupervision.set('workflows_transit_complets', 0);
    this.metriquesSupervision.set('operations_success', 0);
    this.metriquesSupervision.set('operations_error', 0);
    this.metriquesSupervision.set('latence_totale_commission', 0);
    this.metriquesSupervision.set('nb_mesures_latence', 0);
    this.metriquesSupervision.set('volume_commercial_supervise', 0);
    
    console.log('📋 Métriques Commission UEMOA initialisées');
  }

  // ✅ Enregistrer une opération pour analytics Commission
  enregistrerMetriqueCommission(type, valeur, metadata = {}) {
    const timestamp = new Date();
    const metrique = {
      type,
      valeur,
      timestamp,
      metadata: {
        ...metadata,
        commission: 'UEMOA',
        siege: 'Ouagadougou'
      }
    };
    
    this.historiqueOperations.push(metrique);
    this.mettreAJourMetriquesCommission(metrique);
    this.analyserTendancesUEMOA(metrique);
    this.verifierAlertesCommission();
    
    // ✅ Nettoyer historique (garder 7 jours pour Commission)
    this.nettoyerHistoriqueCommission();
  }

  mettreAJourMetriquesCommission(metrique) {
    switch (metrique.type) {
      case 'operation_etape_20':
        this.incrementer('operations_etape_20');
        this.incrementer('operations_success');
        break;
      case 'operation_etape_21':
        this.incrementer('operations_etape_21');
        this.incrementer('workflows_libre_pratique_complets');
        this.incrementer('operations_success');
        break;
      case 'operation_etape_16':
        this.incrementer('operations_etape_16');
        this.incrementer('workflows_transit_complets');
        this.incrementer('operations_success');
        break;
      case 'operation_error':
        this.incrementer('operations_error');
        break;
      case 'latence_commission':
        this.ajouterLatenceCommission(metrique.valeur);
        break;
      case 'volume_commercial':
        const volumeActuel = this.metriquesSupervision.get('volume_commercial_supervise') || 0;
        this.metriquesSupervision.set('volume_commercial_supervise', volumeActuel + metrique.valeur);
        break;
      case 'corridor_nouveau':
        this.analyserNouveauCorridor(metrique.metadata);
        break;
    }
  }

  incrementer(cle) {
    const valeurActuelle = this.metriquesSupervision.get(cle) || 0;
    this.metriquesSupervision.set(cle, valeurActuelle + 1);
  }

  ajouterLatenceCommission(latence) {
    const total = this.metriquesSupervision.get('latence_totale_commission') || 0;
    const count = this.metriquesSupervision.get('nb_mesures_latence') || 0;
    
    this.metriquesSupervision.set('latence_totale_commission', total + latence);
    this.metriquesSupervision.set('nb_mesures_latence', count + 1);
  }

  // ✅ Analyser les tendances UEMOA
  analyserTendancesUEMOA(metrique) {
    const jour = metrique.timestamp.toDateString();
    
    if (!this.tendancesUEMOA.has(jour)) {
      this.tendancesUEMOA.set(jour, {
        date: jour,
        operationsLibrePratique: 0,
        operationsTransit: 0,
        corridorsActifs: new Set(),
        volumeCommercial: 0,
        paysActifs: new Set()
      });
    }
    
    const tendance = this.tendancesUEMOA.get(jour);
    
    if (metrique.type.includes('etape_20') || metrique.type.includes('etape_21')) {
      tendance.operationsLibrePratique++;
    }
    
    if (metrique.type.includes('etape_16')) {
      tendance.operationsTransit++;
    }
    
    if (metrique.metadata.corridor) {
      tendance.corridorsActifs.add(metrique.metadata.corridor);
    }
    
    if (metrique.metadata.paysOrigine) {
      tendance.paysActifs.add(metrique.metadata.paysOrigine);
    }
    
    if (metrique.metadata.paysDestination) {
      tendance.paysActifs.add(metrique.metadata.paysDestination);
    }
    
    if (metrique.metadata.volume) {
      tendance.volumeCommercial += metrique.metadata.volume;
    }
  }

  // ✅ Calculer le taux de réussite des workflows
  calculerTauxReussiteWorkflows() {
    const success = this.metriquesSupervision.get('operations_success') || 0;
    const errors = this.metriquesSupervision.get('operations_error') || 0;
    const total = success + errors;
    
    return total > 0 ? (success / total) * 100 : 100;
  }

  // ✅ Temps de réponse moyen Commission
  getTempsReponseCommission() {
    const total = this.metriquesSupervision.get('latence_totale_commission') || 0;
    const count = this.metriquesSupervision.get('nb_mesures_latence') || 0;
    
    return count > 0 ? Math.round(total / count) : 0;
  }

  // ✅ Systèmes interconnectés surveillés
  getSystemesInterconnectes() {
    return Array.from(this.systemesInterconnectes);
  }

  // ✅ Opérations par étape Commission (20, 21, 16)
  getOperationsParEtapeCommission(timeframe = '24h') {
    const maintenant = new Date();
    const heuresBack = this.parseTimeframe(timeframe);
    const debut = new Date(maintenant.getTime() - (heuresBack * 60 * 60 * 1000));
    
    const operationsRecentes = this.historiqueOperations.filter(m => 
      m.timestamp >= debut && 
      (m.type.includes('etape_20') || m.type.includes('etape_21') || m.type.includes('etape_16'))
    );
    
    const parEtape = {
      'Étape 20 (Notification manifeste)': 0,
      'Étape 21 (Finalisation libre pratique)': 0,
      'Étape 16 (Traçabilité transit)': 0
    };
    
    operationsRecentes.forEach(op => {
      if (op.type.includes('etape_20')) {
        parEtape['Étape 20 (Notification manifeste)']++;
      } else if (op.type.includes('etape_21')) {
        parEtape['Étape 21 (Finalisation libre pratique)']++;
      } else if (op.type.includes('etape_16')) {
        parEtape['Étape 16 (Traçabilité transit)']++;
      }
    });
    
    return Object.entries(parEtape).map(([etape, count]) => ({
      etape,
      operations: count
    }));
  }

  // ✅ Analyse des corridors commerciaux UEMOA
  getAnalyseCorridors(timeframe = '7d') {
    const maintenant = new Date();
    const joursBack = timeframe === '7d' ? 7 : 1;
    const debut = new Date(maintenant.getTime() - (joursBack * 24 * 60 * 60 * 1000));
    
    const operationsRecentes = this.historiqueOperations.filter(m => 
      m.timestamp >= debut && m.metadata.corridor
    );
    
    const analyseCorridors = {};
    operationsRecentes.forEach(op => {
      const corridor = op.metadata.corridor;
      if (!analyseCorridors[corridor]) {
        analyseCorridors[corridor] = {
          corridor,
          operationsTotal: 0,
          workflowsLibrePratique: 0,
          workflowsTransit: 0,
          volumeCommercial: 0
        };
      }
      
      analyseCorridors[corridor].operationsTotal++;
      
      if (op.type.includes('etape_20') || op.type.includes('etape_21')) {
        analyseCorridors[corridor].workflowsLibrePratique++;
      }
      
      if (op.type.includes('etape_16')) {
        analyseCorridors[corridor].workflowsTransit++;
      }
      
      if (op.metadata.volume) {
        analyseCorridors[corridor].volumeCommercial += op.metadata.volume;
      }
    });
    
    return Object.values(analyseCorridors)
      .sort((a, b) => b.operationsTotal - a.operationsTotal);
  }

  // ✅ Activité par pays membres UEMOA
  getActiviteParPaysUEMOA(timeframe = '24h') {
    const maintenant = new Date();
    const heuresBack = this.parseTimeframe(timeframe);
    const debut = new Date(maintenant.getTime() - (heuresBack * 60 * 60 * 1000));
    
    const operationsRecentes = this.historiqueOperations.filter(m => 
      m.timestamp >= debut && (m.metadata.paysOrigine || m.metadata.paysDestination)
    );
    
    const activiteParPays = {};
    const paysUEMOA = ['SEN', 'MLI', 'BFA', 'CIV', 'BEN', 'TGO', 'NER', 'GNB'];
    
    // Initialiser tous les pays UEMOA
    paysUEMOA.forEach(pays => {
      activiteParPays[pays] = {
        pays,
        operationsEnvoyees: 0,
        operationsRecues: 0,
        workflowsLibrePratique: 0,
        workflowsTransit: 0
      };
    });
    
    operationsRecentes.forEach(op => {
      if (op.metadata.paysOrigine && activiteParPays[op.metadata.paysOrigine]) {
        activiteParPays[op.metadata.paysOrigine].operationsEnvoyees++;
        if (op.type.includes('etape_20') || op.type.includes('etape_21')) {
          activiteParPays[op.metadata.paysOrigine].workflowsLibrePratique++;
        }
        if (op.type.includes('etape_16')) {
          activiteParPays[op.metadata.paysOrigine].workflowsTransit++;
        }
      }
      
      if (op.metadata.paysDestination && activiteParPays[op.metadata.paysDestination]) {
        activiteParPays[op.metadata.paysDestination].operationsRecues++;
        if (op.type.includes('etape_20') || op.type.includes('etape_21')) {
          activiteParPays[op.metadata.paysDestination].workflowsLibrePratique++;
        }
        if (op.type.includes('etape_16')) {
          activiteParPays[op.metadata.paysDestination].workflowsTransit++;
        }
      }
    });
    
    return Object.values(activiteParPays)
      .filter(p => p.operationsEnvoyees > 0 || p.operationsRecues > 0)
      .sort((a, b) => (b.operationsEnvoyees + b.operationsRecues) - (a.operationsEnvoyees + a.operationsRecues));
  }

  // ✅ Calculer les tendances Commission UEMOA
  calculerTendancesCommission(timeframe = '7d') {
    const joursBack = timeframe === '7d' ? 7 : 1;
    const maintenant = new Date();
    const milieu = new Date(maintenant.getTime() - (joursBack / 2 * 24 * 60 * 60 * 1000));
    const debut = new Date(maintenant.getTime() - (joursBack * 24 * 60 * 60 * 1000));
    
    const operationsPremierePeriode = this.historiqueOperations.filter(m => 
      m.timestamp >= debut && m.timestamp < milieu &&
      (m.type.includes('etape_20') || m.type.includes('etape_21') || m.type.includes('etape_16'))
    ).length;
    
    const operationsDeuxiemePeriode = this.historiqueOperations.filter(m => 
      m.timestamp >= milieu &&
      (m.type.includes('etape_20') || m.type.includes('etape_21') || m.type.includes('etape_16'))
    ).length;
    
    const evolution = operationsPremierePeriode > 0 ? 
      ((operationsDeuxiemePeriode - operationsPremierePeriode) / operationsPremierePeriode) * 100 : 0;
    
    return {
      periode1: operationsPremierePeriode,
      periode2: operationsDeuxiemePeriode,
      evolution: Math.round(evolution * 100) / 100,
      tendance: evolution > 10 ? 'croissance_forte' : 
                evolution > 5 ? 'croissance' : 
                evolution < -10 ? 'declin_fort' : 
                evolution < -5 ? 'declin' : 'stable',
      interpretation: this.interpreterTendance(evolution),
      recommandation: this.genererRecommandationCommission(evolution)
    };
  }

  interpreterTendance(evolution) {
    if (evolution > 20) return 'Forte croissance des échanges UEMOA - Excellent signe d\'intégration';
    if (evolution > 10) return 'Croissance soutenue des échanges - Tendance positive';
    if (evolution > 5) return 'Croissance modérée des échanges - Dans la norme';
    if (evolution < -20) return 'Forte baisse des échanges - Attention requise';
    if (evolution < -10) return 'Baisse notable des échanges - Surveillance nécessaire';
    if (evolution < -5) return 'Léger déclin des échanges - À surveiller';
    return 'Stabilité des échanges UEMOA - Situation normale';
  }

  genererRecommandationCommission(evolution) {
    if (evolution > 15) return 'Maintenir la dynamique - Évaluer capacités infrastructure';
    if (evolution < -15) return 'Analyser causes de la baisse - Concertation pays membres recommandée';
    return 'Continuer supervision normale - Aucune action urgente requise';
  }

  // ✅ Vérifier les alertes Commission UEMOA
  verifierAlertesCommission() {
    const tauxReussite = this.calculerTauxReussiteWorkflows();
    const latenceMoyenne = this.getTempsReponseCommission();
    const operationsAujourdhui = this.getOperationsAujourdhui();
    const volumeSupervise = this.metriquesSupervision.get('volume_commercial_supervise') || 0;
    const corridorsActifs = this.getCorridorsActifs().length;
    
    // ✅ Alerte taux d'échec workflow élevé
    if ((100 - tauxReussite) / 100 > this.seuilsAlertes.tauxEchecWorkflow) {
      this.ajouterAlerteCommission('TAUX_ECHEC_WORKFLOW_ELEVE', 
        `Taux d'échec workflows élevé: ${(100 - tauxReussite).toFixed(1)}%`, 'warning');
    }
    
    // ✅ Alerte latence Commission élevée
    if (latenceMoyenne > this.seuilsAlertes.latenceMaxCommission) {
      this.ajouterAlerteCommission('LATENCE_COMMISSION_ELEVEE', 
        `Latence Commission élevée: ${latenceMoyenne}ms`, 'warning');
    }
    
    // ✅ Alerte faible activité workflows
    if (operationsAujourdhui < this.seuilsAlertes.operationsMinParJour) {
      this.ajouterAlerteCommission('FAIBLE_ACTIVITE_WORKFLOWS', 
        `Faible activité workflows: ${operationsAujourdhui} opérations/jour`, 'info');
    }
    
    // ✅ Alerte volume commercial très élevé
    if (volumeSupervise > this.seuilsAlertes.volumeMaxSansAlerte) {
      this.ajouterAlerteCommission('VOLUME_COMMERCIAL_TRES_ELEVE', 
        `Volume commercial très élevé: ${(volumeSupervise/1000000).toFixed(0)}M FCFA`, 'attention');
    }
    
    // ✅ Alerte corridors peu actifs
    if (corridorsActifs < this.seuilsAlertes.corridorsMinActifs) {
      this.ajouterAlerteCommission('CORRIDORS_PEU_ACTIFS', 
        `Peu de corridors actifs: ${corridorsActifs}`, 'info');
    }
  }

  ajouterAlerteCommission(type, message, niveau = 'info') {
    const alerte = {
      id: `COMM_${type}_${Date.now()}`,
      type,
      message,
      niveau,
      timestamp: new Date(),
      active: true,
      commission: {
        siege: 'Ouagadougou',
        fonction: 'SUPERVISION_UEMOA'
      }
    };
    
    // ✅ Éviter les doublons
    const existante = this.alertesCommission.find(a => a.type === type && a.active);
    if (!existante) {
      this.alertesCommission.push(alerte);
      console.log(`🚨 [Commission] Alerte ${niveau}: ${message}`);
    }
  }

  // ✅ Obtenir les alertes actives Commission
  getAlertesCommission() {
    return this.alertesCommission
      .filter(a => a.active)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Top 20 alertes Commission
  }

  // ✅ État des systèmes surveillés par Commission
  getEtatSystemesSupervises() {
    return {
      kitInterconnexion: this.systemesInterconnectes.has('KIT_INTERCONNEXION_MULESOFT') ? 'UP' : 'DOWN',
      senegal: this.systemesInterconnectes.has('SENEGAL_DAKAR') ? 'UP' : 'DOWN',
      mali: this.systemesInterconnectes.has('MALI_BAMAKO') ? 'UP' : 'DOWN',
      burkinaFaso: this.systemesInterconnectes.has('BURKINA_FASO') ? 'UP' : 'DOWN',
      commission: 'UP', // Toujours UP (système local)
      derniereMiseAJour: new Date()
    };
  }

  // ✅ Métriques de performance Commission
  getLatenceMoyenneCommission() {
    return this.getTempsReponseCommission();
  }

  getThroughputCommission(timeframe = '1h') {
    const operationsParHeure = this.getOperationsParEtapeCommission(timeframe);
    return operationsParHeure.reduce((sum, h) => sum + h.operations, 0);
  }

  getTauxErreurCommission() {
    return (100 - this.calculerTauxReussiteWorkflows()) / 100;
  }

  getOperationsAujourdhui() {
    const aujourdhui = new Date().toDateString();
    return this.historiqueOperations.filter(m => 
      m.timestamp.toDateString() === aujourdhui &&
      (m.type.includes('etape_20') || m.type.includes('etape_21') || m.type.includes('etape_16'))
    ).length;
  }

  getCorridorsActifs() {
    const corridorsSet = new Set();
    this.historiqueOperations
      .filter(m => m.metadata.corridor)
      .forEach(m => corridorsSet.add(m.metadata.corridor));
    return Array.from(corridorsSet);
  }

  // ✅ Rapport de supervision Commission UEMOA
  genererRapportSupervision(periode = '7d') {
    const tendances = this.calculerTendancesCommission(periode);
    const corridors = this.getAnalyseCorridors(periode);
    const activitePays = this.getActiviteParPaysUEMOA('24h');
    const alertes = this.getAlertesCommission();
    
    return {
      periode,
      timestamp: new Date(),
      commission: {
        nom: 'Commission UEMOA',
        siege: 'Ouagadougou, Burkina Faso'
      },
      resume: {
        operationsTotal: this.metriquesSupervision.get('operations_success') || 0,
        workflowsLibrePratique: this.metriquesSupervision.get('workflows_libre_pratique_complets') || 0,
        workflowsTransit: this.metriquesSupervision.get('workflows_transit_complets') || 0,
        tauxReussite: this.calculerTauxReussiteWorkflows(),
        latenceMoyenne: this.getTempsReponseCommission(),
        volumeCommercial: this.metriquesSupervision.get('volume_commercial_supervise') || 0
      },
      tendances,
      corridorsAnalyse: corridors.slice(0, 10),
      activitePays: activitePays.slice(0, 8),
      alertesActives: alertes.slice(0, 5),
      recommandations: this.genererRecommandationsCommission(tendances, corridors, alertes)
    };
  }

  genererRecommandationsCommission(tendances, corridors, alertes) {
    const recommandations = [];
    
    if (tendances.evolution > 20) {
      recommandations.push('Croissance forte détectée - Évaluer besoins en infrastructure');
    }
    
    if (corridors.length < 3) {
      recommandations.push('Diversifier les corridors commerciaux - Promouvoir échanges Sud-Sud');
    }
    
    if (alertes.filter(a => a.niveau === 'warning').length > 2) {
      recommandations.push('Plusieurs alertes actives - Réunion technique Commission recommandée');
    }
    
    if (recommandations.length === 0) {
      recommandations.push('Supervision normale - Maintenir surveillance continue');
    }
    
    return recommandations;
  }

  // ✅ Utilitaires Commission
  
  parseTimeframe(timeframe) {
    const match = timeframe.match(/(\d+)([hd])/);
    if (!match) return 24;
    
    const [, num, unit] = match;
    return unit === 'h' ? parseInt(num) : parseInt(num) * 24;
  }

  nettoyerHistoriqueCommission() {
    const limite = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 jours
    this.historiqueOperations = this.historiqueOperations.filter(m => m.timestamp >= limite);
    
    // ✅ Nettoyer les alertes anciennes (48h)
    this.alertesCommission = this.alertesCommission.filter(a => 
      new Date(a.timestamp) >= new Date(Date.now() - (48 * 60 * 60 * 1000))
    );
    
    // ✅ Nettoyer les tendances anciennes (30 jours)
    const limiteTendances = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
    for (const [jour, tendance] of this.tendancesUEMOA.entries()) {
      if (new Date(tendance.date) < limiteTendances) {
        this.tendancesUEMOA.delete(jour);
      }
    }
  }

  // ✅ Simulation d'activité Commission pour démonstration
  simulerActiviteCommission() {
    const operationsTypes = ['operation_etape_20', 'operation_etape_21', 'operation_etape_16'];
    const paysUEMOA = ['SEN', 'MLI', 'BFA', 'CIV', 'BEN', 'TGO', 'NER', 'GNB'];
    
    // ✅ Simuler quelques opérations Commission
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const typeOp = operationsTypes[Math.floor(Math.random() * operationsTypes.length)];
      const paysOrigine = paysUEMOA[Math.floor(Math.random() * 4)]; // Pays côtiers plus fréquents
      const paysDestination = paysUEMOA[Math.floor(Math.random() * 4) + 4]; // Pays hinterland
      const success = Math.random() > 0.05; // 95% de succès pour Commission
      
      this.enregistrerMetriqueCommission(
        success ? typeOp : 'operation_error',
        1,
        { 
          paysOrigine,
          paysDestination,
          corridor: `${paysOrigine}-${paysDestination}`,
          volume: Math.floor(Math.random() * 50000000) + 1000000, // 1M à 50M FCFA
          etapeWorkflow: typeOp.includes('20') ? '20' : typeOp.includes('21') ? '21' : '16'
        }
      );
      
      // ✅ Simuler latence Commission
      this.enregistrerMetriqueCommission('latence_commission', Math.floor(Math.random() * 2000) + 500);
    }
    
    // ✅ Parfois ajouter un système interconnecté
    if (Math.random() > 0.8) {
      const systemes = ['SENEGAL_DAKAR', 'MALI_BAMAKO', 'BURKINA_FASO', 'COTE_IVOIRE_ABIDJAN'];
      const systeme = systemes[Math.floor(Math.random() * systemes.length)];
      this.systemesInterconnectes.add(systeme);
      
      this.enregistrerMetriqueCommission('systeme_connexion', 1, { systeme });
    }
  }
}

// ✅ Instance singleton pour Commission UEMOA
const analyticsCommission = new AnalyticsCommissionUEMOA();

// ✅ Simuler périodiquement de l'activité pour démonstration Commission
setInterval(() => {
  if (Math.random() > 0.6) { // 40% de chance à chaque intervalle
    analyticsCommission.simulerActiviteCommission();
  }
}, 45000); // Toutes les 45 secondes (Commission = rythme plus lent)

module.exports = analyticsCommission;