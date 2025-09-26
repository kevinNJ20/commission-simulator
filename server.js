// ============================================================================
// SERVEUR LOCAL COMMISSION UEMOA - server.js CORRIGÉ FINAL
// Commission UEMOA - Système Central de Traçabilité
// ÉTAPES 20-21 (Libre Pratique) + ÉTAPE 16 (Transit)
// Siège: Ouagadougou, Burkina Faso
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ✅ Configuration Commission UEMOA selon rapport PDF
const PORT = process.env.PORT || 3003;
const HOST = '0.0.0.0';
const ORGANISME_CODE = 'UEMOA';
const ORGANISME_NOM = 'Commission UEMOA';
const ORGANISME_TYPE = 'SUPERVISION_CENTRALE_TRACABILITE';
const SIEGE = 'Ouagadougou, Burkina Faso';
const ROLE_COMMISSION = 'ÉTAPES_20_21_LIBRE_PRATIQUE_ETAPE_16_TRANSIT';

console.log(`🏛️ Démarrage ${ORGANISME_NOM} - ${SIEGE}...`);
console.log(`🔍 Rôle: ${ROLE_COMMISSION}`);

// Types MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

// ✅ ROUTER API COMMISSION UEMOA - Endpoints spécialisés selon rapport PDF
const apiRouter = {
  // ✅ Endpoints de base Commission
  'GET /api/health': () => require('./api/health'),
  'GET /api/statistiques': () => require('./api/statistiques'),
  'GET /api/dashboard': () => require('./api/dashboard'),
  
  // ✅ ÉTAPES 20-21 et 16: Endpoint traçabilité centrale (principal)
  'GET /api/tracabilite/enregistrer': () => require('./api/tracabilite/enregistrer'),
  'POST /api/tracabilite/enregistrer': () => require('./api/tracabilite/enregistrer'),
  
  // ✅ ÉTAPE 20: Endpoints spécialisés MANIFESTES (notifications)
  'GET /api/tracabilite/manifeste': () => require('./api/tracabilite/manifeste'),
  'POST /api/tracabilite/manifeste': () => require('./api/tracabilite/manifeste'),
  
  // ✅ ÉTAPE 21: Endpoints spécialisés DÉCLARATIONS (finalisations)
  'GET /api/tracabilite/declaration': () => require('./api/tracabilite/declaration'),
  'POST /api/tracabilite/declaration': () => require('./api/tracabilite/declaration'),
  
  // ✅ Autres endpoints Commission existants
  'GET /api/tracabilite/lister': () => require('./api/tracabilite/lister'),
  'GET /api/tracabilite/rechercher': () => require('./api/tracabilite/rechercher'),
  'GET /api/rapports/exporter': () => require('./api/rapports/exporter'),
  'POST /api/rapports/generer': () => require('./api/rapports/generer'),
  
  // ✅ Endpoints Kit d'Interconnexion (Communication avec Kit MuleSoft)
  'GET /api/kit/diagnostic': () => require('./api/kit/diagnostic'),
  'GET /api/kit/test': () => require('./api/kit/test'),
  'POST /api/kit/test': () => require('./api/kit/test'),
  'POST /api/kit/synchroniser': () => require('./api/kit/synchroniser')
};

// Fonction pour créer un objet de réponse compatible Vercel
function createVercelResponse(res) {
  const vercelRes = {
    headers: {},
    statusCode: 200,
    
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    
    json: function(data) {
      this.headers['Content-Type'] = 'application/json';
      res.writeHead(this.statusCode, this.headers);
      res.end(JSON.stringify(data));
      return this;
    },
    
    send: function(data) {
      this.headers['Content-Type'] = 'text/plain';
      res.writeHead(this.statusCode, this.headers);
      res.end(data);
      return this;
    },
    
    setHeader: function(name, value) {
      this.headers[name] = value;
      return this;
    },
    
    end: function(data) {
      res.writeHead(this.statusCode, this.headers);
      res.end(data);
      return this;
    }
  };
  
  return vercelRes;
}

// Fonction pour créer un objet de requête compatible Vercel
function createVercelRequest(req, body, query) {
  return {
    ...req,
    body: body || {},
    query: query || {},
    method: req.method,
    url: req.url,
    headers: req.headers
  };
}

// ✅ FONCTION: Vérifier fichiers API Commission requis selon rapport PDF
function verifierFichiersAPICommission() {
  const fichiersRequis = [
    './api/health.js',                        // Health check Commission
    './api/statistiques.js',                  // Stats supervision
    './api/tracabilite/enregistrer.js',       // ÉTAPES 20-21 et 16 (principal)
    './api/tracabilite/manifeste.js',         // ÉTAPE 20 spécialisé
    './api/tracabilite/declaration.js',       // ÉTAPE 21 spécialisé
    './lib/database.js',                      // Base traçabilité Commission
    './lib/analytics.js',                     // Analytics supervision
    './lib/kit-client.js'                     // Communication Kit MuleSoft
  ];
  
  const fichiersMissing = [];
  
  fichiersRequis.forEach(fichier => {
    if (!fs.existsSync(path.join(__dirname, fichier))) {
      fichiersMissing.push(fichier);
    }
  });
  
  if (fichiersMissing.length > 0) {
    console.log('⚠️  ATTENTION Commission UEMOA: Fichiers API manquants:');
    fichiersMissing.forEach(fichier => {
      console.log(`   ❌ ${fichier}`);
    });
    console.log('');
    console.log('📝 Rôle Commission selon rapport PDF:');
    console.log('   • ÉTAPE 20: Notification manifeste libre pratique');
    console.log('   • ÉTAPE 21: Traçabilité finale libre pratique');
    console.log('   • ÉTAPE 16: Traçabilité finale transit');
    console.log('   • Supervision centralisée échanges UEMOA');
    console.log('');
  } else {
    console.log('✅ Tous les fichiers API Commission UEMOA sont présents');
  }
  
  return fichiersMissing.length === 0;
}

// ✅ Serveur HTTP Commission UEMOA
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // ✅ Logging spécialisé Commission UEMOA
  const timestamp = new Date().toLocaleString('fr-FR');
  console.log(`[${timestamp}] ${method} ${pathname} - [Commission UEMOA - Supervision Centrale]`);

  // ✅ CORS headers Commission UEMOA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-System, X-Correlation-ID, X-Format, X-Source-Country, X-Test-Type, X-Commission-Role, X-Workflow-Step, X-Kit-Source');
  res.setHeader('Access-Control-Max-Age', '3600');
  res.setHeader('X-Commission-UEMOA', 'Supervision-Centrale-Ouagadougou');
  res.setHeader('X-Workflow-Support', 'ETAPES_20_21_LIBRE_PRATIQUE_ETAPE_16_TRANSIT');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // ✅ Router API Commission avec gestion spécialisée
    const route = `${method} ${pathname}`;
    let handler = apiRouter[route];
    
    // Si pas de route exacte, chercher route partielle
    if (!handler) {
      for (const [routePattern, routeHandler] of Object.entries(apiRouter)) {
        const [routeMethod, routePath] = routePattern.split(' ');
        if (routeMethod === method && pathname.startsWith(routePath)) {
          handler = routeHandler;
          break;
        }
      }
    }

    if (handler && pathname.startsWith('/api/')) {
      try {
        const handlerFunction = handler();
        if (!handlerFunction) {
          throw new Error(`Handler Commission non trouvé pour ${route}`);
        }
        
        // Créer les objets compatibles Vercel
        const vercelRes = createVercelResponse(res);
        
        // Lire le body pour les requêtes POST/PUT
        let body = {};
        if (method === 'POST' || method === 'PUT') {
          body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => {
              data += chunk.toString();
            });
            
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch (error) {
                console.error('❌ [Commission] Erreur parsing JSON:', error);
                console.error('📝 Données reçues:', data.substring(0, 200) + '...');
                resolve({});
              }
            });
            
            req.on('error', reject);
            setTimeout(() => resolve({}), 10000); // Timeout 10s
          });
        }
        
        const vercelReq = createVercelRequest(req, body, parsedUrl.query);
        
        // ✅ Logging détaillé Commission pour les opérations de traçabilité
        if (method === 'POST' && Object.keys(body).length > 0) {
          console.log(`📊 [Commission UEMOA] ${route} - Traçabilité:`, {
            typeOperation: body.typeOperation,
            numeroOperation: body.numeroOperation,
            corridor: `${body.paysOrigine} → ${body.paysDestination}`,
            etapeWorkflow: determinerEtapeWorkflowCommission(body.typeOperation)
          });
        }
        
        // Exécuter le handler API Commission
        await handlerFunction(vercelReq, vercelRes);
        
      } catch (error) {
        console.error(`❌ [Commission UEMOA] Erreur API [${route}]:`, error.message);
        console.error('📋 Stack trace Commission:', error.stack);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Commission UEMOA Internal Server Error', 
          message: error.message,
          route: route,
          commission: {
            nom: ORGANISME_NOM,
            siege: SIEGE,
            role: ROLE_COMMISSION
          },
          timestamp: new Date().toISOString()
        }));
      }
      return;
    }

    // ✅ Servir les fichiers statiques Commission
    let filePath;
    if (pathname === '/') {
      filePath = path.join(__dirname, 'public', 'index.html');
    } else {
      filePath = path.join(__dirname, 'public', pathname);
    }

    // Vérifier si le fichier existe
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // ✅ Page 404 spécialisée Commission UEMOA
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>404 - Page Non Trouvée - ${ORGANISME_NOM}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              h1 { color: #ff9500; }
              a { color: #3498db; text-decoration: none; }
              .container { 
                background: rgba(255,255,255,0.95); 
                padding: 40px; 
                border-radius: 15px; 
                color: #333; 
                display: inline-block;
                border-left: 5px solid #ff9500;
              }
              .info { 
                margin-top: 20px; 
                padding: 15px; 
                background: #f8f9fa; 
                border-radius: 8px; 
                border-left: 3px solid #ff9500;
              }
              .endpoint-list { text-align: left; margin-top: 15px; font-size: 0.9em; }
              .workflow-info {
                background: rgba(255, 149, 0, 0.1);
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                border-left: 3px solid #ff9500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏛️ ${ORGANISME_NOM}</h1>
              <h2>404 - Page Non Trouvée</h2>
              <p>La page <code>${pathname}</code> n'existe pas sur le système central de traçabilité.</p>
              
              <div class="workflow-info">
                <h3>🔍 Rôle Commission UEMOA selon Rapport PDF</h3>
                <p><strong>ÉTAPE 20:</strong> Notification manifeste libre pratique</p>
                <p><strong>ÉTAPE 21:</strong> Traçabilité finale libre pratique (21 étapes)</p>
                <p><strong>ÉTAPE 16:</strong> Traçabilité finale transit (16 étapes)</p>
                <p><strong>Siège:</strong> ${SIEGE}</p>
              </div>
              
              <div class="info">
                <h3>📡 Endpoints API Commission Disponibles:</h3>
                <div class="endpoint-list">
                  <strong>GET</strong> /api/health - Health check Commission<br>
                  <strong>GET</strong> /api/statistiques - Stats supervision<br>
                  <strong>GET/POST</strong> /api/tracabilite/enregistrer - ÉTAPES 20-21 et 16<br>
                  <strong>GET/POST</strong> /api/tracabilite/manifeste - ÉTAPE 20 spécialisé<br>
                  <strong>GET/POST</strong> /api/tracabilite/declaration - ÉTAPE 21 spécialisé<br>
                  <strong>GET/POST</strong> /api/kit/test - Tests Kit MuleSoft<br>
                  <strong>GET</strong> /api/rapports/exporter - Export données Commission<br>
                </div>
              </div>
              
              <p><a href="/">← Retour au Dashboard Commission UEMOA</a></p>
            </div>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('❌ [Commission UEMOA] Erreur serveur:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Commission UEMOA Internal Server Error', 
      message: error.message,
      commission: {
        nom: ORGANISME_NOM,
        siege: SIEGE,
        role: ROLE_COMMISSION
      },
      timestamp: new Date().toISOString()
    }));
  }
});

// ✅ Fonction utilitaire Commission: Déterminer étape workflow
function determinerEtapeWorkflowCommission(typeOperation) {
  if (!typeOperation) return 'N/A';
  
  // Selon rapport PDF Figure 19 et 20
  if (typeOperation.includes('MANIFESTE') || typeOperation.includes('TRANSMISSION')) {
    return '20'; // Notification manifeste
  }
  
  if (typeOperation.includes('COMPLETION') || typeOperation.includes('DECLARATION')) {
    return '21'; // Finalisation libre pratique
  }
  
  if (typeOperation.includes('TRANSIT')) {
    return '16'; // Traçabilité transit
  }
  
  return '20-21'; // Traçabilité générale Commission
}

// ✅ Afficher état endpoints Commission au démarrage
function afficherEtatEndpointsCommission() {
  console.log('📡 État des endpoints API Commission UEMOA:');
  
  for (const [route, handlerFunc] of Object.entries(apiRouter)) {
    const [method, path] = route.split(' ');
    try {
      const handler = handlerFunc();
      const status = handler ? '✅' : '❌';
      
      // Indiquer le rôle selon rapport PDF
      let roleInfo = '';
      if (path.includes('manifeste')) roleInfo = ' (ÉTAPE 20)';
      else if (path.includes('declaration')) roleInfo = ' (ÉTAPE 21)';
      else if (path.includes('enregistrer')) roleInfo = ' (ÉTAPES 20-21 et 16)';
      else if (path.includes('kit')) roleInfo = ' (Kit MuleSoft)';
      
      console.log(`   ${status} ${method.padEnd(4)} ${path}${roleInfo}`);
    } catch (error) {
      console.log(`   ❌ ${method.padEnd(4)} ${path} - Erreur: ${error.message}`);
    }
  }
  console.log('');
}

// ✅ Démarrer le serveur Commission UEMOA
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('🏛️ ============================================================');
  console.log(`🏛️ ${ORGANISME_NOM} - Système Central de Traçabilité DÉMARRÉ`);
  console.log(`📍 Siège: ${SIEGE}`);
  console.log(`🔍 Rôle: ${ROLE_COMMISSION}`);
  console.log(`🌍 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`📊 Dashboard Commission: http://localhost:${PORT}`);
  console.log(`🏥 Health Commission: http://localhost:${PORT}/api/health`);
  console.log(`📈 Stats Supervision: http://localhost:${PORT}/api/statistiques`);
  console.log(`📊 Traçabilité Centrale: http://localhost:${PORT}/api/tracabilite/enregistrer`);
  console.log(`📦 ÉTAPE 20 (Manifeste): http://localhost:${PORT}/api/tracabilite/manifeste`);
  console.log(`📋 ÉTAPE 21 (Déclaration): http://localhost:${PORT}/api/tracabilite/declaration`);
  console.log(`🔗 Kit MuleSoft: https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io`);
  console.log(`⏹️  Arrêt: Ctrl+C`);
  console.log('🏛️ ============================================================');
  console.log('');
  console.log(`🏛️ ${ORGANISME_NOM} - Supervision Centralisée selon Rapport PDF`);
  console.log('');
  console.log('📋 Workflows Commission UEMOA supportés:');
  console.log('   🔄 LIBRE PRATIQUE (21 étapes):');
  console.log('      • ÉTAPE 20: Notification manifeste depuis Kit MuleSoft');
  console.log('      • ÉTAPE 21: Traçabilité finale workflow libre pratique');
  console.log('   🔄 TRANSIT (16 étapes):');
  console.log('      • ÉTAPE 16: Traçabilité finale transit');
  console.log('');
  console.log('🌍 États membres UEMOA surveillés:');
  console.log('   🏖️  Pays Côtiers (Prime abord):');
  console.log('      • 🇸🇳 SEN (Sénégal) - Port de Dakar');
  console.log('      • 🇨🇮 CIV (Côte d\'Ivoire) - Port d\'Abidjan');
  console.log('      • 🇧🇯 BEN (Bénin) - Port de Cotonou');
  console.log('      • 🇹🇬 TGO (Togo) - Port de Lomé');
  console.log('      • 🇬🇼 GNB (Guinée-Bissau) - Port de Bissau');
  console.log('   🏔️  Pays Hinterland (Destination):');
  console.log('      • 🇲🇱 MLI (Mali) - Bamako');
  console.log('      • 🇧🇫 BFA (Burkina Faso) - Ouagadougou');
  console.log('      • 🇳🇪 NER (Niger) - Niamey');
  console.log('');
  console.log('📊 Fonctionnalités Commission UEMOA:');
  console.log('   • Traçabilité centralisée ÉTAPES 20-21 et 16');
  console.log('   • Supervision échanges entre pays membres');
  console.log('   • Interface web spécialisée Commission');
  console.log('   • Analytics et métriques supervision avancées');
  console.log('   • Communication avec Kit MuleSoft d\'Interconnexion');
  console.log('   • Génération de rapports supervision');
  console.log('   • Export de données Commission pour analyses');
  console.log(`   • Code organisme: ${ORGANISME_CODE} | Type: ${ORGANISME_TYPE}`);
  console.log('');
  
  // ✅ Vérifications spécifiques Commission au démarrage
  const fichiersOK = verifierFichiersAPICommission();
  afficherEtatEndpointsCommission();
  
  if (!fichiersOK) {
    console.log('⚠️  ATTENTION Commission UEMOA: Certains endpoints ne fonctionneront pas.');
    console.log('📝 Consultez les instructions ci-dessus pour les fichiers manquants.');
    console.log('');
  }
  
  console.log('🚀 Commission UEMOA prête pour supervision centralisée !');
  console.log('🔄 En attente de notifications depuis Kit MuleSoft...');
  console.log('');
});

// ✅ Gestion propre de l'arrêt Commission
process.on('SIGINT', () => {
  console.log(`\n🛑 Arrêt ${ORGANISME_NOM} - ${SIEGE}...`);
  server.close(() => {
    console.log('✅ Commission UEMOA arrêtée proprement');
    console.log('📊 Supervision centralisée terminée');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(`\n🛑 Arrêt ${ORGANISME_NOM} - ${SIEGE}...`);
  server.close(() => {
    console.log('✅ Commission UEMOA arrêtée proprement');
    process.exit(0);
  });
});

// ✅ Gestion d'erreurs robuste Commission
process.on('uncaughtException', (error) => {
  console.error(`❌ [Commission UEMOA] Erreur non capturée:`, error.message);
  console.error('📋 Stack trace Commission:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ [Commission UEMOA] Promesse rejetée non gérée:`, reason);
  console.error('📋 Promise Commission:', promise);
});