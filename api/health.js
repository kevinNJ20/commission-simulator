// ============================================================================
// COMMISSION UEMOA - API Health Check CORRIGÉE
// Ouagadougou, Burkina Faso - Supervision Centrale UEMOA
// Rôle: Traçabilité ÉTAPES 20-21 (Libre Pratique) et 16 (Transit)
// ============================================================================

const kitClient = require('../lib/kit-client');
const database = require('../lib/database');

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
      console.log('🏛️ [Commission UEMOA] Health check - Ouagadougou (Supervision centrale)');
      
      // ✅ Test connectivité Kit MuleSoft depuis Commission
      let kitStatus = null;
      try {
        console.log('🔍 [Commission] Test connectivité vers Kit MuleSoft...');
        kitStatus = await Promise.race([
          kitClient.verifierSante(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout Kit MuleSoft > 5s')), 5000)
          )
        ]);
        console.log('✅ [Commission] Kit MuleSoft accessible:', kitStatus.accessible);
      } catch (error) {
        console.error('❌ [Commission] Kit MuleSoft inaccessible:', error.message);
        kitStatus = {
          accessible: false,
          erreur: error.message,
          status: 'TIMEOUT_OU_INACCESSIBLE',
          source: 'COMMISSION_TO_MULESOFT'
        };
      }

      // Obtenir statistiques de traçabilité Commission
      const stats = database.obtenirStatistiques();
      const operationsRecentes = database.obtenirOperations(5);

      const healthStatus = {
        service: 'Commission UEMOA - Système Central de Traçabilité',
        status: 'UP',
        version: '1.0.0-UEMOA',
        timestamp: new Date().toISOString(),
        
        // ✅ Informations Commission selon rapport PDF
        commission: {
          nom: 'Commission de l\'Union Économique et Monétaire Ouest Africaine',
          sigle: 'UEMOA',
          siege: 'Ouagadougou, Burkina Faso',
          type: 'INSTITUTION_SUPRANATIONALE',
          role: 'SUPERVISION_TRACABILITE_CENTRALE'
        },
        
        // ✅ Rôle dans les workflows selon rapport PDF
        workflow: {
          libre_pratique: {
            etapesTotales: 21,
            etapesCommission: '20-21',
            description: 'Notification Commission UEMOA et traçabilité finale',
            role: 'Supervision et archivage centralisé des opérations libre pratique'
          },
          transit: {
            etapesTotales: 16,
            etapesCommission: '16',
            description: 'Traçabilité finale des opérations de transit',
            role: 'Supervision et archivage centralisé des opérations transit'
          }
        },
        
        // ✅ Fonctionnalités Commission UEMOA
        fonctionnalites: {
          tracabiliteCentrale: 'ACTIF', // Étapes 20-21 et 16
          supervisionEchanges: 'ACTIF',
          analyseStatistique: 'ACTIF',
          monitoringCorridors: kitStatus?.accessible ? 'ACTIF' : 'DEGRADE',
          alertesSuperviseur: 'ACTIF'
        },
        
        // États membres UEMOA surveillés
        paysMembresSurveilles: {
          cotiers: [
            { code: 'SEN', nom: 'Sénégal', ville: 'Dakar', role: 'Pays de prime abord' },
            { code: 'CIV', nom: 'Côte d\'Ivoire', ville: 'Abidjan', role: 'Pays de prime abord' },
            { code: 'BEN', nom: 'Bénin', ville: 'Cotonou', role: 'Pays de prime abord' },
            { code: 'TGO', nom: 'Togo', ville: 'Lomé', role: 'Pays de prime abord' },
            { code: 'GNB', nom: 'Guinée-Bissau', ville: 'Bissau', role: 'Pays de prime abord' }
          ],
          hinterland: [
            { code: 'MLI', nom: 'Mali', ville: 'Bamako', role: 'Pays de destination' },
            { code: 'BFA', nom: 'Burkina Faso', ville: 'Ouagadougou', role: 'Pays de destination' },
            { code: 'NER', nom: 'Niger', ville: 'Niamey', role: 'Pays de destination' }
          ],
          total: 8
        },
        
        // ✅ Kit d'Interconnexion depuis Commission
        kit: {
          url: kitClient.baseURL,
          status: kitStatus?.status || 'UNKNOWN',
          accessible: kitStatus?.accessible || false,
          latence: kitStatus?.latence || null,
          dernierTest: kitStatus?.timestamp || new Date().toISOString(),
          modeConnexion: 'COMMISSION_TO_KIT',
          role: 'Réception notifications traçabilité depuis Kit MuleSoft'
        },
        
        // Endpoints Commission UEMOA
        endpoints: {
          health: '/api/health',
          statistiques: '/api/statistiques',
          tracabiliteEnregistrer: '/api/tracabilite/enregistrer', // Étapes 20-21, 16
          tracabiliteLister: '/api/tracabilite/lister',
          dashboard: '/api/dashboard',
          rapportsExporter: '/api/rapports/exporter',
          kitDiagnostic: '/api/kit/diagnostic'
        },
        
        // ✅ Écosystème UEMOA selon rapport PDF
        ecosystemeUEMOA: {
          architecture: 'DECENTRALISEE',
          modeInterconnexion: 'KIT_MULESOFT_PAR_PAYS',
          supervisionCentrale: 'COMMISSION_UEMOA',
          
          acteurs: {
            paysMembers: '8 États membres avec systèmes douaniers',
            kitInterconnexion: 'MuleSoft hébergé dans chaque pays',
            commissionUEMOA: 'Supervision centrale Ouagadougou'
          },
          
          flux: [
            'Pays Côtier → Kit MuleSoft → Pays Hinterland',
            'Kit MuleSoft → Commission UEMOA (Traçabilité)',
            'Commission → Analyses statistiques et monitoring'
          ]
        },
        
        // Statistiques traçabilité Commission
        statistiques: {
          operationsTotal: stats.operationsTotal,
          operationsAujourdhui: stats.operationsAujourdhui,
          paysConnectes: stats.paysConnectes,
          corridorsActifs: stats.corridorsActifs,
          derniereMiseAJour: stats.derniereMiseAJour
        },
        
        // Monitoring système Commission
        monitoring: {
          uptime: process.uptime(),
          memoire: process.memoryUsage(),
          environnement: process.env.NODE_ENV || 'development',
          operationsEnAttente: operationsRecentes?.filter(op => op.statut === 'EN_ATTENTE').length || 0,
          dernieresOperations: operationsRecentes?.length || 0
        },
        
        // Partenaires selon rapport PDF
        partenaires: {
          kitInterconnexion: {
            url: kitClient.baseURL,
            role: 'Notification des opérations entre pays membres',
            disponible: kitStatus?.accessible || false
          },
          paysMembers: {
            exemple1: 'Sénégal (Port Dakar) - Pays de prime abord',
            exemple2: 'Mali (Bamako) - Pays de destination',
            role: 'Échanges commerciaux avec traçabilité Commission',
            communication: 'Via Kit MuleSoft décentralisé'
          }
        }
      };

      // Status global Commission
      const globalStatus = kitStatus?.accessible ? 'UP' : 'DEGRADED';
      
      res.status(200).json({
        ...healthStatus,
        status: globalStatus
      });
      
      console.log(`✅ [Commission] Health check envoyé - Service: ${globalStatus} - Kit: ${kitStatus?.accessible ? 'OK' : 'KO'}`);
      
    } catch (error) {
      console.error('❌ [Commission] Erreur health check:', error);
      
      res.status(500).json({
        service: 'Commission UEMOA - Système Central de Traçabilité',
        status: 'ERROR',
        erreur: error.message,
        commission: {
          nom: 'Commission UEMOA',
          siege: 'Ouagadougou, Burkina Faso'
        },
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ 
      status: 'ERROR',
      message: 'Méthode non autorisée',
      methodesAutorisees: ['GET', 'OPTIONS'],
      commission: {
        nom: 'Commission UEMOA',
        siege: 'Ouagadougou, Burkina Faso'
      }
    });
  }
};