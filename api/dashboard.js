const db = require('../lib/database');Add commentMore actions
const analytics = require('../lib/analytics');

module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { timeframe = '24h', pays } = req.query;
      
      // Calculer les métriques en temps réel
      const dashboardData = {
        timestamp: new Date().toISOString(),
        timeframe,
        
        // Métriques principales
        metriques: {
          operationsTotal: db.metriques.operationsTotal,
          operationsAujourdhui: db.metriques.operationsAujourdhui,
          paysActifs: Array.from(db.metriques.paysActifs).length,
          systemesConnectes: analytics.getSystemesConnectes(),
          tauxReussite: analytics.calculerTauxReussite(),
          tempsReponseMoyen: analytics.getTempsReponseMoyen()
        },

        // Données pour graphiques
        graphiques: {
          operationsParHeure: analytics.getOperationsParHeure(timeframe),
          operationsParType: db.getOperationsParType(),
          operationsParCorridor: db.getOperationsParCorridor(),
          activiteParPays: analytics.getActiviteParPays(timeframe)
        },

        // Statistiques détaillées
        statistiques: {
          global: db.getStatistiquesGlobales(),
          parPays: pays ? db.getStatistiquesParPays().filter(p => p.code === pays) 
                        : db.getStatistiquesParPays(),
          tendances: analytics.calculerTendances(timeframe)
        },

        // Alertes et notifications
        alertes: analytics.getAlertes(),
        
        // État des systèmes
        etatSystemes: analytics.getEtatSystemes(),
        
        // Performances
        performances: {
          latence: analytics.getLatenceMoyenne(),
          throughput: analytics.getThroughput(timeframe),
          erreurs: analytics.getTauxErreur()
        }
      };

      res.status(200).json(dashboardData);
      
    } catch (error) {
      console.error('Erreur dashboard:', error);
      res.status(500).json({
        error: 'Erreur génération dashboard',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};