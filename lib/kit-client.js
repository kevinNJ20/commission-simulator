// ============================================================================
// CLIENT KIT MULESOFT - Commission UEMOA Spécialisé
// Rôle: Communication avec Kit d'Interconnexion pour ÉTAPES 20-21 et 16
// Commission UEMOA (Ouagadougou) ↔ Kit MuleSoft ↔ Pays Membres
// ============================================================================

const axios = require('axios');

class KitInterconnexionClientCommission {
  constructor() {
    // ✅ Configuration spécifique Commission UEMOA
    this.baseURL = process.env.KIT_MULESOFT_URL || 'http://64.225.5.75:8086/api/v1';
    this.timeout = 45000; // 45 secondes (Commission = plus de temps)
    this.systemeName = 'COMMISSION_UEMOA_SUPERVISION';
    this.siege = 'OUAGADOUGOU_BURKINA_FASO';
    this.role = 'SUPERVISION_CENTRALE_TRACABILITE';
    
    // ✅ Configuration Axios pour Commission
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Commission-UEMOA-Supervision/1.0',
        'X-Source-System': this.systemeName,
        'X-Source-Country': 'UEMOA',
        'X-Commission-Role': 'TRACABILITE_CENTRALE',
        'Authorization': 'Bearer COMMISSION_UEMOA_SUPERVISION_TOKEN'
      }
    });

    this.setupInterceptorsCommission();
    console.log(`🏛️ [Commission] Client Kit MuleSoft initialisé`);
    console.log(`📍 Siège: ${this.siege.replace('_', ', ')}`);
    console.log(`🔗 Kit URL: ${this.baseURL}`);
  }

  setupInterceptorsCommission() {
    // ✅ Intercepteur requêtes - spécifique Commission
    this.client.interceptors.request.use(
      (config) => {
        config.metadata = { startTime: Date.now() };
        config.headers['X-Correlation-ID'] = `COMM_UEMOA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Commission-Timestamp'] = new Date().toISOString();
        
        console.log(`📤 [Commission → Kit] ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data) {
          console.log(`📋 [Commission] Données:`, {
            typeOperation: config.data.typeOperation,
            numeroOperation: config.data.numeroOperation,
            corridor: `${config.data.paysOrigine} → ${config.data.paysDestination}`
          });
        }
        
        return config;
      },
      (error) => {
        console.error(`❌ [Commission] Erreur requête vers Kit:`, error.message);
        return Promise.reject(error);
      }
    );

    // ✅ Intercepteur réponses - avec retry Commission
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`📥 [Kit → Commission] ${response.status} (${duration}ms)`);
        
        response.metadata = {
          duration,
          timestamp: new Date(),
          correlationId: response.config.headers['X-Correlation-ID'],
          commissionRole: this.role
        };
        
        return response;
      },
      async (error) => {
        const config = error.config;
        const duration = config?.metadata ? Date.now() - config.metadata.startTime : 0;
        
        console.error(`❌ [Kit → Commission] Erreur (${duration}ms):`, {
          status: error.response?.status,
          message: error.message,
          url: config?.url
        });

        // ✅ Retry automatique pour Commission (plus de tentatives)
        if (this.shouldRetryCommission(error) && !config._commissionRetryAttempted) {
          config._commissionRetryAttempted = true;
          console.log(`🔄 [Commission] Nouvelle tentative vers Kit MuleSoft...`);
          
          await this.wait(3000); // 3 secondes pour Commission
          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  shouldRetryCommission(error) {
    // ✅ Commission = retry plus agressif (supervision critique)
    return !error.response || 
           error.response.status >= 500 || 
           error.response.status === 429 || // Rate limiting
           error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' ||
           error.code === 'ENOTFOUND';
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ✅ VÉRIFICATION SANTÉ Kit depuis Commission UEMOA
  async verifierSanteKit() {
    try {
      console.log(`🏥 [Commission] Vérification santé Kit d'Interconnexion...`);
      
      const response = await this.client.get('/health');
      
      const kitInfo = response.data;
      console.log(`✅ [Commission] Kit MuleSoft opérationnel:`, {
        version: kitInfo.version,
        status: kitInfo.status,
        workflows: kitInfo.workflows
      });
      
      return {
        ...kitInfo,
        latence: response.metadata.duration,
        accessible: true,
        timestamp: response.metadata.timestamp,
        source: 'KIT_MULESOFT_DIRECT',
        testeDepuisCommission: true
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Kit MuleSoft inaccessible:`, error.message);
      
      return {
        status: 'DOWN',
        accessible: false,
        erreur: error.message,
        timestamp: new Date(),
        source: 'KIT_MULESOFT_DIRECT',
        testeDepuisCommission: true,
        details: {
          code: error.code,
          status: error.response?.status,
          url: this.baseURL
        }
      };
    }
  }

  // ✅ TEST NOTIFICATION Commission vers Kit (ÉTAPES 20-21 et 16)
  async testerNotificationVersKit() {
    try {
      console.log(`📊 [Commission] Test notification vers Kit MuleSoft...`);
      
      const notificationTest = {
        typeOperation: 'TEST_NOTIFICATION_COMMISSION',
        numeroOperation: `COMM_TEST_${Date.now()}`,
        paysOrigine: 'UEMOA',
        paysDestination: 'TEST',
        donneesMetier: {
          test: true,
          source: 'Commission UEMOA - Test Supervision',
          timestamp: new Date().toISOString(),
          etape_workflow: '20-21',
          commission: {
            nom: 'Commission UEMOA',
            siege: 'Ouagadougou, Burkina Faso'
          }
        }
      };
      
      const response = await this.client.post('/tracabilite/enregistrer', notificationTest);
      
      console.log(`✅ [Commission] Notification test envoyée:`, response.data.status);
      
      return {
        ...response.data,
        latence: response.metadata.duration,
        timestamp: response.metadata.timestamp,
        correlationId: response.metadata.correlationId,
        source: 'TEST_COMMISSION_TO_KIT'
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Échec notification test:`, error.message);
      
      throw new Error(`Test notification Commission échoué: ${error.response?.data?.message || error.message}`);
    }
  }

  // ✅ RÉCUPÉRATION STATISTIQUES Kit depuis Commission
  async recupererStatistiquesKit() {
    try {
      console.log(`📈 [Commission] Récupération statistiques Kit...`);
      
      // Tentative récupération statistiques depuis Console Kit
      const response = await this.client.get('/console/stats');
      
      return {
        statistiques: response.data,
        source: 'KIT_CONSOLE_STATS',
        recupereePar: 'COMMISSION_UEMOA',
        timestamp: new Date()
      };
      
    } catch (error) {
      console.log(`ℹ️ [Commission] Statistiques Kit non disponibles:`, error.message);
      
      // Fallback : juste vérifier que le Kit fonctionne
      const sante = await this.verifierSanteKit();
      
      return {
        statistiques: sante,
        source: 'KIT_HEALTH_FALLBACK',
        recupereePar: 'COMMISSION_UEMOA',
        timestamp: new Date()
      };
    }
  }

  // ✅ SYNCHRONISATION Commission avec Kit (pour traçabilité)
  async synchroniserAvecKit() {
    try {
      console.log(`🔄 [Commission] Synchronisation avec Kit d'Interconnexion...`);
      
      // 1. Vérifier santé Kit
      const santeKit = await this.verifierSanteKit();
      
      if (!santeKit.accessible) {
        throw new Error('Kit MuleSoft inaccessible pour synchronisation Commission');
      }
      
      // 2. Test notification bidirectionnelle
      await this.testerNotificationVersKit();
      
      // 3. Récupérer statistiques si disponibles
      const stats = await this.recupererStatistiquesKit();
      
      console.log(`✅ [Commission] Synchronisation terminée avec Kit`);
      
      return {
        succes: true,
        timestamp: new Date(),
        latence: santeKit.latence,
        message: 'Synchronisation Commission-Kit réussie',
        source: 'COMMISSION_KIT_SYNC',
        statistiquesKit: stats,
        santeKit
      };
      
    } catch (error) {
      console.error(`❌ [Commission] Erreur synchronisation:`, error.message);
      
      return {
        succes: false,
        timestamp: new Date(),
        erreur: error.message,
        message: 'Échec synchronisation Commission-Kit',
        source: 'COMMISSION_KIT_SYNC'
      };
    }
  }

  // ✅ DIAGNOSTIC COMPLET Kit depuis Commission UEMOA
  async executerDiagnosticCommission() {
    console.log(`🔍 [Commission] Démarrage diagnostic complet Kit MuleSoft...`);
    
    const diagnosticResult = {
      timestamp: new Date(),
      commission: {
        nom: 'Commission de l\'Union Économique et Monétaire Ouest Africaine',
        sigle: 'UEMOA',
        siege: this.siege.replace('_', ', '),
        systeme: this.systemeName,
        role: this.role
      },
      kit: {
        url: this.baseURL,
        timeout: this.timeout
      },
      tests: {}
    };

    // ✅ Test 1: Connectivité de base Kit
    try {
      const sante = await this.verifierSanteKit();
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

    // ✅ Test 2: Stabilité connexion (ping multiple)
    diagnosticResult.tests.stabilite = await this.testerStabiliteKit();

    // ✅ Test 3: Notification traçabilité vers Kit
    diagnosticResult.tests.notificationTracabilite = await this.testerNotificationKit();

    // ✅ Test 4: Accès endpoints Kit spécifiques Commission
    diagnosticResult.tests.endpointsKit = await this.testerEndpointsKit();

    // ✅ Test 5: Récupération données depuis Kit
    diagnosticResult.tests.recuperationDonnees = await this.testerRecuperationDonneesKit();

    const testsReussis = Object.values(diagnosticResult.tests).filter(t => t.success).length;
    const totalTests = Object.keys(diagnosticResult.tests).length;

    diagnosticResult.resume = {
      testsReussis,
      totalTests,
      tauxReussite: Math.round((testsReussis / totalTests) * 100),
      kitOperationnel: testsReussis >= 3, // Minimum 3/5 tests réussis
      recommandationCommission: testsReussis === totalTests ? 
        'Kit MuleSoft pleinement opérationnel pour supervision Commission' :
        'Kit MuleSoft partiellement opérationnel - surveillance recommandée'
    };

    console.log(`📊 [Commission] Diagnostic Kit terminé:`, {
      reussis: testsReussis,
      total: totalTests,
      taux: diagnosticResult.resume.tauxReussite + '%'
    });

    return diagnosticResult;
  }

  // ✅ Tests auxiliaires pour diagnostic Commission
  
  async testerStabiliteKit(nombreTests = 5) {
    const latences = [];
    let erreurs = 0;

    console.log(`📡 [Commission] Test stabilité Kit (${nombreTests} tentatives)...`);

    for (let i = 0; i < nombreTests; i++) {
      try {
        const startTime = Date.now();
        await this.client.get('/health');
        const latence = Date.now() - startTime;
        latences.push(latence);
        await this.wait(500); // 500ms entre tests
      } catch (error) {
        erreurs++;
      }
    }

    const latenceMoyenne = latences.length > 0 
      ? Math.round(latences.reduce((a, b) => a + b, 0) / latences.length)
      : 0;

    return {
      success: erreurs === 0,
      nombreTests,
      reussites: latences.length,
      erreurs,
      latenceMoyenne,
      latenceMin: latences.length > 0 ? Math.min(...latences) : 0,
      latenceMax: latences.length > 0 ? Math.max(...latences) : 0,
      stable: erreurs === 0 && latenceMoyenne < 5000 // 5s max pour Commission
    };
  }

  async testerNotificationKit() {
    try {
      console.log(`📊 [Commission] Test notification traçabilité Kit...`);
      await this.testerNotificationVersKit();
      return {
        success: true,
        message: 'Notification traçabilité Commission → Kit réussie'
      };
    } catch (error) {
      return {
        success: false,
        erreur: error.message
      };
    }
  }

  async testerEndpointsKit() {
    const endpoints = [
      { nom: 'Health', path: '/health', methode: 'GET' },
      { nom: 'TracabiliteEnregistrer', path: '/tracabilite/enregistrer', methode: 'POST' },
      { nom: 'Console', path: '/console', methode: 'GET' },
      { nom: 'ManifesteTranmission', path: '/manifeste/transmission', methode: 'GET' }
    ];

    const resultats = {};

    for (const endpoint of endpoints) {
      try {
        let response;
        
        if (endpoint.methode === 'POST') {
          response = await this.client.post(endpoint.path, {
            typeOperation: 'TEST_ENDPOINT_COMMISSION',
            numeroOperation: `TEST_EP_${Date.now()}`,
            paysOrigine: 'UEMOA',
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
      success: disponibles >= 2, // Au moins Health + Tracabilite
      ...resultats,
      disponibles: `${disponibles}/${endpoints.length}`
    };
  }

  async testerRecuperationDonneesKit() {
    try {
      console.log(`📋 [Commission] Test récupération données Kit...`);
      const stats = await this.recupererStatistiquesKit();
      return {
        success: true,
        donnees: stats,
        message: 'Récupération données Kit réussie depuis Commission'
      };
    } catch (error) {
      return {
        success: false,
        erreur: error.message
      };
    }
  }

  // ✅ MÉTRIQUES Kit depuis Commission
  async obtenirMetriquesKit() {
    try {
      console.log(`📊 [Commission] Récupération métriques Kit...`);
      
      const sante = await this.verifierSanteKit();
      const stats = await this.recupererStatistiquesKit();
      
      return {
        disponibilite: sante.accessible,
        latence: sante.latence,
        version: sante.version,
        uptime: sante.uptime,
        workflows: sante.workflows,
        statistiques: stats.statistiques,
        timestamp: new Date(),
        source: 'METRIQUES_KIT_COMMISSION'
      };
      
    } catch (error) {
      return {
        disponibilite: false,
        erreur: error.message,
        timestamp: new Date(),
        source: 'METRIQUES_KIT_COMMISSION'
      };
    }
  }

  // ✅ INFORMATIONS Client Commission
  getClientInfoCommission() {
    return {
      commission: {
        nom: 'Commission de l\'Union Économique et Monétaire Ouest Africaine',
        sigle: 'UEMOA',
        siege: this.siege.replace('_', ', '),
        role: this.role
      },
      kit: {
        url: this.baseURL,
        timeout: this.timeout,
        modeConnexion: 'COMMISSION_TO_KIT',
        fonctions_supportees: [
          'Réception notifications étapes 20-21 (libre pratique)',
          'Réception notifications étape 16 (transit)',
          'Supervision centralisée workflows UEMOA',
          'Diagnostic connectivité Kit d\'Interconnexion'
        ]
      },
      systeme: {
        nom: this.systemeName,
        version: '1.0.0-UEMOA',
        role: 'SUPERVISION_CENTRALE_TRACABILITE'
      },
      paysSupervises: [
        'SEN (Sénégal - Pays côtier)',
        'MLI (Mali - Pays hinterland)',
        'BFA (Burkina Faso - Pays hinterland)',
        'CIV (Côte d\'Ivoire - Pays côtier)',
        'BEN (Bénin - Pays côtier)',
        'TGO (Togo - Pays côtier)',
        'NER (Niger - Pays hinterland)',
        'GNB (Guinée-Bissau - Pays côtier)'
      ]
    };
  }

  // ✅ URL Console Kit depuis Commission
  getConsoleKitURL() {
    return this.baseURL.replace('/api/v1', '/console');
  }

  // ✅ Ping simple Kit
  async ping() {
    const startTime = Date.now();
    await this.client.get('/health');
    return Date.now() - startTime;
  }
}

// ✅ Instance singleton pour Commission UEMOA
const kitClientCommission = new KitInterconnexionClientCommission();

module.exports = kitClientCommission;