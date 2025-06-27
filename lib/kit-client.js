const axios = require('axios');

class KitInterconnexionClient {
  constructor() {
    // URL CloudHub mise à jour
    this.baseURL = process.env.KIT_BASE_URL || 'https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api/v1';
    this.timeout = 15000; // Augmenté pour CloudHub
    
    // Configuration axios avec retry
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Commission-UEMOA-Client/1.0'
      }
    });
    
    // Intercepteur pour retry automatique
    this.setupRetry();
  }

  setupRetry() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (!config._retry && config.retry !== false) {
          config._retry = true;
          console.log('🔄 Retry connexion Kit...');
          
          // Attendre 2 secondes avant retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return this.client.request(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  async notifierOperation(operation) {
    try {
      console.log('📊 Notification opération vers Kit CloudHub:', operation.numeroOperation);
      
      const response = await this.client.post('/tracabilite/enregistrer', operation, {
        headers: {
          'X-Source-System': 'COMMISSION_UEMOA',
          'X-Correlation-ID': `COMM_${Date.now()}`
        }
      });
      
      console.log('✅ Opération notifiée avec succès:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Erreur notification opération:', error.message);
      if (error.response) {
        console.error('Statut:', error.response.status);
        console.error('Données:', error.response.data);
      }
      throw error;
    }
  }

  async verifierSante() {
    try {
      console.log('🏥 Vérification santé Kit CloudHub...');
      const response = await this.client.get('/health');
      console.log('✅ Kit CloudHub opérationnel:', response.data.status);
      return response.data;
    } catch (error) {
      console.error('❌ Kit CloudHub non accessible:', error.message);
      return { 
        status: 'DOWN', 
        error: error.message,
        url: this.baseURL 
      };
    }
  }

  // Test de connectivité avec diagnostic
  async testerConnectivite() {
    try {
      const startTime = Date.now();
      const response = await this.verifierSante();
      const duration = Date.now() - startTime;
      
      return {
        accessible: response.status === 'UP',
        duree: duration,
        reponse: response,
        url: this.baseURL
      };
    } catch (error) {
      return {
        accessible: false,
        erreur: error.message,
        url: this.baseURL
      };
    }
  }
}

module.exports = new KitInterconnexionClient();