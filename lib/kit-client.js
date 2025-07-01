const axios = require('axios');

class KitInterconnexionClient {
  constructor() {
    // ✅ CORRECTION: URL directe vers MuleSoft (pas via API locale)
    this.baseURL = 'http://localhost:8080/api/v1';
    this.timeout = 30000; // 30 secondes
    this.systemeName = 'COMMISSION_UEMOA';
    this.siege = 'OUAGADOUGOU';
    
    // Configuration Axios
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Commission-UEMOA/1.0',
        'X-Source-System': this.systemeName,
        'Authorization': 'Bearer COMMISSION_TOKEN' // Token pour l'authentification
      }
    });

    this.setupInterceptors();
    console.log(`🏛️ Client Kit initialisé pour Commission UEMOA - URL: ${this.baseURL}`);
  }

  setupInterceptors() {
    // Intercepteur pour ajouter headers et logging
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        config.headers['X-Correlation-ID'] = `COMM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`📤 [Commission] Requête vers Kit: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error(`❌ [Commission] Erreur requête:`, error.message);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour logging des réponses et retry
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`📥 [Commission] Réponse Kit: ${response.status} (${duration}ms)`);
        
        response.metadata = {
          duration,
          timestamp: new Date(),
          correlationId: response.config.headers['X-Correlation-ID']
        };
        
        return response;
      },
      async (error) => {
        const config = error.config;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;
        
        console.error(`❌ [Commission] Erreur Kit (${duration}ms):`, {
          status: error.response?.status,
          message: error.message,
          url: config?.url
        });

        // Retry automatique pour certaines erreurs
        if (this.shouldRetry(error) && !config._retryAttempted) {
          config._retryAttempted = true;
          console.log(`🔄 [Commission] Tentative de retry...`);
          
          await this.wait(2000);
          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  shouldRetry(error) {
    return !error.response || 
           error.response.status >= 500 || 
           error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT';
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === VÉRIFICATION SANTÉ (DIRECT vers MuleSoft) ===
  async verifierSante() {
    try {
      console.log(`🏥 [Commission] Vérification santé Kit MuleSoft...`);
      
      // ✅ DIRECT vers MuleSoft - pas via API locale
      const response = await this.client.get('/health');
      
      console.log(`✅ [Commission] Kit MuleSoft opérationnel:`, response.data.status);
      
      return {
        ...response.data,
        latence: response.metadata.duration,
        accessible: true,
        timestamp: response.metadata.timestamp,
        source: 'MULESOFT_DIRECT'
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Kit MuleSoft inaccessible:`, error.message);
      
      return {
        status: 'DOWN',
        accessible: false,
        erreur: error.message,
        timestamp: new Date(),
        source: 'MULESOFT_DIRECT',
        details: {
          code: error.code,
          status: error.response?.status,
          url: this.baseURL
        }
      };
    }
  }

  // === TEST ENVOI OPÉRATION DE TRAÇABILITÉ (DIRECT vers MuleSoft) ===
  async envoyerOperationTest() {
    try {
      console.log(`📊 [Commission] Envoi opération test vers Kit MuleSoft...`);
      
      const operationTest = {
        typeOperation: 'TEST_COMMISSION',
        numeroOperation: `COMM_TEST_${Date.now()}`,
        paysOrigine: 'COMMISSION',
        paysDestination: 'TEST',
        donneesMetier: {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'Commission UEMOA Dashboard'
        }
      };
      
      // ✅ DIRECT vers MuleSoft
      const response = await this.client.post('/tracabilite/enregistrer', operationTest);
      
      console.log(`✅ [Commission] Opération test envoyée:`, response.data);
      
      return {
        ...response.data,
        latence: response.metadata.duration,
        timestamp: response.metadata.timestamp,
        correlationId: response.metadata.correlationId,
        source: 'MULESOFT_DIRECT'
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Échec envoi opération test:`, error.message);
      
      throw new Error(`Envoi opération test échoué: ${error.response?.data?.message || error.message}`);
    }
  }

  // === TEST DE CONNECTIVITÉ DIRECT ===
  async testerConnectiviteDirecte() {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 [Commission] Test connectivité DIRECTE vers Kit MuleSoft...`);
      
      const sante = await this.verifierSante();
      const duration = Date.now() - startTime;
      
      return {
        success: sante.accessible,
        duree: duration,
        sante,
        kit: {
          url: this.baseURL,
          version: sante.version,
          status: sante.status
        },
        modeTest: 'DIRECT_MULESOFT',
        timestamp: new Date()
      };
      
    } catch (error) {
      return {
        success: false,
        duree: Date.now() - startTime,
        erreur: error.message,
        kit: {
          url: this.baseURL,
          status: 'INACCESSIBLE'
        },
        modeTest: 'DIRECT_MULESOFT',
        timestamp: new Date()
      };
    }
  }

  // === SYNCHRONISATION AVEC LE KIT ===
  async synchroniserDonnees() {
    try {
      console.log(`🔄 [Commission] Synchronisation avec Kit MuleSoft...`);
      
      // Test de connectivité
      const sante = await this.verifierSante();
      
      if (!sante.accessible) {
        throw new Error('Kit MuleSoft inaccessible pour synchronisation');
      }
      
      // Test d'envoi de données
      await this.envoyerOperationTest();
      
      console.log(`✅ [Commission] Synchronisation terminée`);
      
      return {
        succes: true,
        timestamp: new Date(),
        latence: sante.latence,
        message: 'Synchronisation réussie avec le Kit MuleSoft',
        source: 'MULESOFT_DIRECT'
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Erreur synchronisation:`, error.message);
      
      return {
        succes: false,
        timestamp: new Date(),
        erreur: error.message,
        message: 'Échec de synchronisation avec le Kit MuleSoft',
        source: 'MULESOFT_DIRECT'
      };
    }
  }

  // === DIAGNOSTIC COMPLET ===
  async executerDiagnostic() {
    console.log(`🔍 [Commission] Démarrage diagnostic Kit MuleSoft...`);
    
    const diagnosticResult = {
      timestamp: new Date(),
      commission: {
        nom: 'Commission UEMOA',
        siege: this.siege,
        systeme: this.systemeName
      },
      modeTest: 'DIRECT_MULESOFT',
      tests: {}
    };

    // Test 1: Connectivité de base
    try {
      const sante = await this.verifierSante();
      diagnosticResult.tests.connectivite = {
        success: sante.accessible,
        duree: sante.latence,
        details: sante
      };
    } catch (error) {
      diagnosticResult.tests.connectivite = {
        success: false,
        erreur: error.message
      };
    }

    // Test 2: Ping multiple pour mesurer la stabilité
    diagnosticResult.tests.stabilite = await this.testerStabilite();

    // Test 3: Test d'envoi de données
    diagnosticResult.tests.envoi = await this.testerEnvoiDonnees();

    // Test 4: Accès aux endpoints
    diagnosticResult.tests.endpoints = await this.testerEndpoints();

    console.log(`📊 [Commission] Diagnostic Kit MuleSoft terminé:`, {
      connectivite: diagnosticResult.tests.connectivite?.success,
      stabilite: diagnosticResult.tests.stabilite?.stable,
      envoi: diagnosticResult.tests.envoi?.success,
      endpoints: diagnosticResult.tests.endpoints?.disponibles
    });

    return diagnosticResult;
  }

  async testerStabilite(nombreTests = 5) {
    const latences = [];
    let erreurs = 0;

    for (let i = 0; i < nombreTests; i++) {
      try {
        const startTime = Date.now();
        await this.client.get('/health');
        const latence = Date.now() - startTime;
        latences.push(latence);
        await this.wait(300);
      } catch (error) {
        erreurs++;
      }
    }

    const latenceMoyenne = latences.length > 0 
      ? Math.round(latences.reduce((a, b) => a + b, 0) / latences.length)
      : 0;

    return {
      nombreTests,
      reussites: latences.length,
      erreurs,
      latenceMoyenne,
      latenceMin: latences.length > 0 ? Math.min(...latences) : 0,
      latenceMax: latences.length > 0 ? Math.max(...latences) : 0,
      stable: erreurs === 0 && latenceMoyenne < 3000
    };
  }

  async testerEnvoiDonnees() {
    try {
      await this.envoyerOperationTest();
      return {
        success: true,
        message: 'Envoi de données vers Kit MuleSoft réussi'
      };
    } catch (error) {
      return {
        success: false,
        erreur: error.message
      };
    }
  }

  async testerEndpoints() {
    const endpoints = [
      { nom: 'Health', path: '/health', methode: 'GET' },
      { nom: 'TracabiliteEnregistrer', path: '/tracabilite/enregistrer', methode: 'POST' },
      { nom: 'Console', path: '/console', methode: 'GET' }
    ];

    const resultats = {};

    for (const endpoint of endpoints) {
      try {
        let response;
        
        if (endpoint.methode === 'POST') {
          // Pour POST, envoyer des données test
          response = await this.client.post(endpoint.path, {
            typeOperation: 'TEST_ENDPOINT',
            numeroOperation: `TEST_${Date.now()}`,
            paysOrigine: 'TEST',
            paysDestination: 'TEST'
          });
        } else {
          response = await this.client.get(endpoint.path);
        }
        
        resultats[endpoint.nom] = {
          disponible: true,
          status: response.status,
          latence: response.metadata?.duration
        };
      } catch (error) {
        resultats[endpoint.nom] = {
          disponible: false,
          erreur: error.response?.status || error.message
        };
      }
    }

    const disponibles = Object.values(resultats).filter(r => r.disponible).length;
    
    return {
      ...resultats,
      disponibles: `${disponibles}/${endpoints.length}`
    };
  }

  // === MÉTRIQUES ET MONITORING ===
  async obtenirMetriquesKit() {
    try {
      // En réalité, le Kit n'a peut-être pas d'endpoint de métriques
      // mais on peut simuler ou utiliser les informations de santé
      const sante = await this.verifierSante();
      
      return {
        disponibilite: sante.accessible,
        latence: sante.latence,
        version: sante.version,
        uptime: sante.uptime,
        timestamp: new Date(),
        source: 'MULESOFT_DIRECT'
      };
      
    } catch (error) {
      return {
        disponibilite: false,
        erreur: error.message,
        timestamp: new Date(),
        source: 'MULESOFT_DIRECT'
      };
    }
  }

  // === INFORMATIONS CLIENT ===
  getClientInfo() {
    return {
      commission: {
        nom: 'Commission de l\'Union Économique et Monétaire Ouest Africaine',
        sigle: 'UEMOA',
        siege: this.siege
      },
      kit: {
        url: this.baseURL,
        timeout: this.timeout,
        modeConnexion: 'DIRECT_MULESOFT'
      },
      systeme: {
        nom: this.systemeName,
        version: '1.0.0',
        role: 'TRACABILITE_CENTRALE'
      },
      fonctions: [
        'Collecte des opérations d\'échange',
        'Traçabilité des flux commerciaux', 
        'Monitoring des corridors UEMOA',
        'Génération de rapports statistiques'
      ]
    };
  }

  // === ACCÈS CONSOLE KIT ===
  getConsoleURL() {
    return this.baseURL.replace('/api/v1', '/console');
  }
}

// Instance singleton
const kitClient = new KitInterconnexionClient();

module.exports = kitClient;