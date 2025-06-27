// Module d'Analytics pour la Commission UEMOA
class Analytics {
    constructor() {
      this.metriquesTempsReel = new Map();
      this.alertes = [];
      this.systemesConnectes = new Set(['KIT_INTERCONNEXION']);
      this.historique = [];
      this.seuilsAlertes = {
        tauxErreur: 0.05, // 5%
        latenceMax: 2000, // 2 secondes
        operationsMinParHeure: 10
      };
      
      this.initMetriques();
    }
  
    initMetriques() {
      // Initialiser les métriques de base
      this.metriquesTempsReel.set('operations_success', 0);
      this.metriquesTempsReel.set('operations_error', 0);
      this.metriquesTempsReel.set('latence_totale', 0);
      this.metriquesTempsReel.set('nb_mesures_latence', 0);
    }
  
    // Enregistrer une nouvelle opération pour analytics
    enregistrerMetrique(type, valeur, metadata = {}) {
      const timestamp = new Date();
      const metrique = {
        type,
        valeur,
        timestamp,
        metadata
      };
      
      this.historique.push(metrique);
      this.mettreAJourMetriquesTempsReel(metrique);
      this.verifierAlertes();
      
      // Nettoyer l'historique (garder seulement 24h)
      this.nettoyerHistorique();
    }
  
    mettreAJourMetriquesTempsReel(metrique) {
      switch (metrique.type) {
        case 'operation_success':
          this.incrementer('operations_success');
          break;
        case 'operation_error':
          this.incrementer('operations_error');
          break;
        case 'latence':
          this.ajouterLatence(metrique.valeur);
          break;
        case 'systeme_connexion':
          this.systemesConnectes.add(metrique.metadata.systeme);
          break;
        case 'systeme_deconnexion':
          this.systemesConnectes.delete(metrique.metadata.systeme);
          break;
      }
    }
  
    incrementer(cle) {
      const valeurActuelle = this.metriquesTempsReel.get(cle) || 0;
      this.metriquesTempsReel.set(cle, valeurActuelle + 1);
    }
  
    ajouterLatence(latence) {
      const total = this.metriquesTempsReel.get('latence_totale') || 0;
      const count = this.metriquesTempsReel.get('nb_mesures_latence') || 0;
      
      this.metriquesTempsReel.set('latence_totale', total + latence);
      this.metriquesTempsReel.set('nb_mesures_latence', count + 1);
    }
  
    // Calculer le taux de réussite
    calculerTauxReussite() {
      const success = this.metriquesTempsReel.get('operations_success') || 0;
      const errors = this.metriquesTempsReel.get('operations_error') || 0;
      const total = success + errors;
      
      return total > 0 ? (success / total) * 100 : 100;
    }
  
    // Obtenir le temps de réponse moyen
    getTempsReponseMoyen() {
      const total = this.metriquesTempsReel.get('latence_totale') || 0;
      const count = this.metriquesTempsReel.get('nb_mesures_latence') || 0;
      
      return count > 0 ? Math.round(total / count) : 0;
    }
  
    // Obtenir la liste des systèmes connectés
    getSystemesConnectes() {
      return Array.from(this.systemesConnectes);
    }
  
    // Calculer les opérations par heure
    getOperationsParHeure(timeframe = '24h') {
      const maintenant = new Date();
      const heuresBack = this.parseTimeframe(timeframe);
      const debut = new Date(maintenant.getTime() - (heuresBack * 60 * 60 * 1000));
      
      const operationsRecentes = this.historique.filter(m => 
        m.timestamp >= debut && 
        (m.type === 'operation_success' || m.type === 'operation_error')
      );
      
      // Grouper par heure
      const parHeure = {};
      for (let i = 0; i < heuresBack; i++) {
        const heure = new Date(debut.getTime() + (i * 60 * 60 * 1000));
        const cleHeure = heure.getHours();
        parHeure[cleHeure] = 0;
      }
      
      operationsRecentes.forEach(op => {
        const heure = op.timestamp.getHours();
        parHeure[heure] = (parHeure[heure] || 0) + 1;
      });
      
      return Object.entries(parHeure).map(([heure, count]) => ({
        heure: parseInt(heure),
        operations: count
      }));
    }
  
    // Obtenir l'activité par pays
    getActiviteParPays(timeframe = '24h') {
      const maintenant = new Date();
      const heuresBack = this.parseTimeframe(timeframe);
      const debut = new Date(maintenant.getTime() - (heuresBack * 60 * 60 * 1000));
      
      const operationsRecentes = this.historique.filter(m => 
        m.timestamp >= debut && m.metadata.pays
      );
      
      const parPays = {};
      operationsRecentes.forEach(op => {
        const pays = op.metadata.pays;
        parPays[pays] = (parPays[pays] || 0) + 1;
      });
      
      return Object.entries(parPays).map(([pays, count]) => ({
        pays,
        operations: count
      }));
    }
  
    // Calculer les tendances
    calculerTendances(timeframe = '24h') {
      const maintenant = new Date();
      const heuresBack = this.parseTimeframe(timeframe);
      const debut = new Date(maintenant.getTime() - (heuresBack * 60 * 60 * 1000));
      const milieu = new Date(maintenant.getTime() - (heuresBack / 2 * 60 * 60 * 1000));
      
      const operationsPremierePeriode = this.historique.filter(m => 
        m.timestamp >= debut && m.timestamp < milieu &&
        (m.type === 'operation_success' || m.type === 'operation_error')
      ).length;
      
      const operationsDeuxiemePeriode = this.historique.filter(m => 
        m.timestamp >= milieu &&
        (m.type === 'operation_success' || m.type === 'operation_error')
      ).length;
      
      const evolution = operationsPremierePeriode > 0 ? 
        ((operationsDeuxiemePeriode - operationsPremierePeriode) / operationsPremierePeriode) * 100 : 0;
      
      return {
        periode1: operationsPremierePeriode,
        periode2: operationsDeuxiemePeriode,
        evolution: Math.round(evolution * 100) / 100,
        tendance: evolution > 5 ? 'hausse' : evolution < -5 ? 'baisse' : 'stable'
      };
    }
  
    // Vérifier les alertes
    verifierAlertes() {
      const tauxReussite = this.calculerTauxReussite();
      const latenceMoyenne = this.getTempsReponseMoyen();
      const operationsDerniereHeure = this.getOperationsParHeure('1h')[0]?.operations || 0;
      
      // Alerte taux d'erreur élevé
      if ((100 - tauxReussite) / 100 > this.seuilsAlertes.tauxErreur) {
        this.ajouterAlerte('TAUX_ERREUR_ELEVE', 
          `Taux d'erreur élevé: ${100 - tauxReussite}%`, 'warning');
      }
      
      // Alerte latence élevée
      if (latenceMoyenne > this.seuilsAlertes.latenceMax) {
        this.ajouterAlerte('LATENCE_ELEVEE', 
          `Latence élevée: ${latenceMoyenne}ms`, 'warning');
      }
      
      // Alerte faible activité
      if (operationsDerniereHeure < this.seuilsAlertes.operationsMinParHeure) {
        this.ajouterAlerte('FAIBLE_ACTIVITE', 
          `Faible activité: ${operationsDerniereHeure} opérations/heure`, 'info');
      }
    }
  
    ajouterAlerte(type, message, niveau = 'info') {
      const alerte = {
        id: `${type}_${Date.now()}`,
        type,
        message,
        niveau,
        timestamp: new Date(),
        active: true
      };
      
      // Éviter les doublons
      const existante = this.alertes.find(a => a.type === type && a.active);
      if (!existante) {
        this.alertes.push(alerte);
        console.log(`🚨 Alerte ${niveau}: ${message}`);
      }
    }
  
    // Obtenir les alertes actives
    getAlertes() {
      return this.alertes
        .filter(a => a.active)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    }
  
    // Obtenir l'état des systèmes
    getEtatSystemes() {
      return {
        kitInterconnexion: this.systemesConnectes.has('KIT_INTERCONNEXION') ? 'UP' : 'DOWN',
        paysA: this.systemesConnectes.has('PAYS_A') ? 'UP' : 'DOWN',
        paysB: this.systemesConnectes.has('PAYS_B') ? 'UP' : 'DOWN',
        commission: 'UP', // Toujours UP car c'est le système local
        derniereMiseAJour: new Date()
      };
    }
  
    // Métriques de performance
    getLatenceMoyenne() {
      return this.getTempsReponseMoyen();
    }
  
    getThroughput(timeframe = '1h') {
      const operationsParHeure = this.getOperationsParHeure(timeframe);
      return operationsParHeure.reduce((sum, h) => sum + h.operations, 0);
    }
  
    getTauxErreur() {
      return (100 - this.calculerTauxReussite()) / 100;
    }
  
    // Utilitaires
    parseTimeframe(timeframe) {
      const match = timeframe.match(/(\d+)([hd])/);
      if (!match) return 24;
      
      const [, num, unit] = match;
      return unit === 'h' ? parseInt(num) : parseInt(num) * 24;
    }
  
    nettoyerHistorique() {
      const limite = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24h
      this.historique = this.historique.filter(m => m.timestamp >= limite);
      
      // Nettoyer les alertes anciennes
      this.alertes = this.alertes.filter(a => 
        new Date(a.timestamp) >= new Date(Date.now() - (2 * 60 * 60 * 1000)) // 2h
      );
    }
  
    // Simulation de données pour démonstration
    simulerActivite() {
      // Simuler quelques opérations
      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const pays = ['CIV', 'BFA', 'MLI', 'SEN'][Math.floor(Math.random() * 4)];
        const success = Math.random() > 0.1; // 90% de succès
        
        this.enregistrerMetrique(
          success ? 'operation_success' : 'operation_error',
          1,
          { pays }
        );
        
        // Simuler latence
        this.enregistrerMetrique('latence', Math.floor(Math.random() * 500) + 50);
      }
    }
  }
  
  // Instance singleton
  const analytics = new Analytics();
  
  // Simuler périodiquement de l'activité pour la démo
  setInterval(() => {
    if (Math.random() > 0.7) { // 30% de chance à chaque intervalle
      analytics.simulerActivite();
    }
  }, 30000); // Toutes les 30 secondes
  
  module.exports = analytics;