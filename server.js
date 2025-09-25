// ============================================================================
// SERVEUR LOCAL COMMISSION UEMOA - server.js CORRIGÉ
// Commission UEMOA - Système Central de Traçabilité
// Compatible avec les APIs écrites pour Vercel + Nouveaux Endpoints Spécialisés
// ============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration du serveur - COMMISSION UEMOA
const PORT = process.env.PORT || 3003;
const HOST = '0.0.0.0';
const ORGANISME_CODE = 'UEMOA';
const ORGANISME_NOM = 'Commission UEMOA';
const ORGANISME_TYPE = 'COMMISSION_CENTRALE';
const SIEGE = 'Ouagadougou, Burkina Faso';

console.log(`🏛️ Démarrage serveur ${ORGANISME_NOM}...`);

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

// ✅ ROUTER CORRIGÉ: APIs COMMISSION UEMOA avec nouveaux endpoints spécialisés
const apiRouter = {
  // Endpoints de base
  'GET /api/health': () => require('./api/health'),
  'GET /api/statistiques': () => require('./api/statistiques'),
  'GET /api/dashboard': () => require('./api/dashboard'),
  
  // Endpoint traçabilité générique (conservé pour compatibilité)
  'GET /api/tracabilite/enregistrer': () => require('./api/tracabilite/enregistrer'),
  'POST /api/tracabilite/enregistrer': () => require('./api/tracabilite/enregistrer'),
  
  // ✅ NOUVEAUX: Endpoints spécialisés pour MANIFESTES
  'GET /api/tracabilite/manifeste': () => require('./api/tracabilite/manifeste'),
  'POST /api/tracabilite/manifeste': () => require('./api/tracabilite/manifeste'),
  
  // ✅ NOUVEAUX: Endpoints spécialisés pour DÉCLARATIONS
  'GET /api/tracabilite/declaration': () => require('./api/tracabilite/declaration'),
  'POST /api/tracabilite/declaration': () => require('./api/tracabilite/declaration'),
  
  // Autres endpoints existants
  'GET /api/tracabilite/lister': () => require('./api/tracabilite/lister'),
  'GET /api/tracabilite/rechercher': () => require('./api/tracabilite/rechercher'),
  'GET /api/rapports/exporter': () => require('./api/rapports/exporter'),
  'POST /api/rapports/generer': () => require('./api/rapports/generer'),
  
  // Endpoints Kit d'Interconnexion
  'GET /api/kit/diagnostic': () => require('./api/kit/diagnostic'),
  'GET /api/kit/test': () => require('./api/kit/test'), // ✅ AJOUTÉ: Support GET pour les tests
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

// ✅ FONCTION: Vérifier l'existence des fichiers API requis
function verifierFichiersAPI() {
  const fichiersRequis = [
    './api/health.js',
    './api/statistiques.js',
    './api/tracabilite/enregistrer.js',
    './api/tracabilite/manifeste.js',    // ✅ NOUVEAU
    './api/tracabilite/declaration.js'   // ✅ NOUVEAU
  ];
  
  const fichiersMissing = [];
  
  fichiersRequis.forEach(fichier => {
    if (!fs.existsSync(path.join(__dirname, fichier))) {
      fichiersMissing.push(fichier);
    }
  });
  
  if (fichiersMissing.length > 0) {
    console.log('⚠️  ATTENTION: Fichiers API manquants:');
    fichiersMissing.forEach(fichier => {
      console.log(`   ❌ ${fichier}`);
    });
    console.log('');
    console.log('📝 Pour créer les fichiers manquants:');
    console.log('   1. Créez les dossiers: mkdir -p api/tracabilite');
    console.log('   2. Créez les fichiers depuis les exemples fournis');
    console.log('');
  } else {
    console.log('✅ Tous les fichiers API requis sont présents');
  }
  
  return fichiersMissing.length === 0;
}

// Serveur HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // ✅ AMÉLIORATION: Logging plus détaillé avec timestamp
  const timestamp = new Date().toLocaleString('fr-FR');
  console.log(`[${timestamp}] ${method} ${pathname} - [${ORGANISME_CODE}]`);

  // ✅ AMÉLIORATION: CORS headers plus complets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Source-System, X-Correlation-ID, X-Format, X-Source-Country, X-Test-Type');
  res.setHeader('Access-Control-Max-Age', '3600');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Router API
    const route = `${method} ${pathname}`;
    let handler = apiRouter[route];
    
    // Si pas de route exacte, essayer de trouver une route partielle
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
        // ✅ AMÉLIORATION: Vérifier si le fichier API existe avant de l'exécuter
        const handlerFunction = handler();
        if (!handlerFunction) {
          throw new Error(`Handler non trouvé pour ${route}`);
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
                console.error('❌ Erreur parsing JSON:', error);
                console.error('📝 Données reçues:', data.substring(0, 200) + '...');
                resolve({});
              }
            });
            
            req.on('error', reject);
            
            // Timeout après 10 secondes
            setTimeout(() => resolve({}), 10000);
          });
        }
        
        const vercelReq = createVercelRequest(req, body, parsedUrl.query);
        
        // ✅ AMÉLIORATION: Logging détaillé pour les API calls
        if (method === 'POST' && Object.keys(body).length > 0) {
          console.log(`📨 [API] ${route} - Body:`, {
            typeOperation: body.typeOperation,
            numeroOperation: body.numeroOperation,
            paysOrigine: body.paysOrigine,
            paysDestination: body.paysDestination
          });
        }
        
        // Exécuter le handler API
        await handlerFunction(vercelReq, vercelRes);
        
      } catch (error) {
        console.error(`❌ Erreur API [${route}]:`, error.message);
        console.error('📋 Stack trace:', error.stack);
        
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Internal Server Error', 
          message: error.message,
          route: route,
          organisme: ORGANISME_CODE,
          timestamp: new Date().toISOString()
        }));
      }
      return;
    }

    // Servir les fichiers statiques
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
      // ✅ AMÉLIORATION: Page 404 plus informative
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
              h1 { color: #e74c3c; }
              a { color: #3498db; text-decoration: none; }
              .container { background: rgba(255,255,255,0.9); padding: 40px; border-radius: 15px; color: #333; display: inline-block; }
              .info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
              .endpoint-list { text-align: left; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏛️ ${ORGANISME_NOM}</h1>
              <h2>404 - Page Non Trouvée</h2>
              <p>La page <code>${pathname}</code> n'existe pas sur le système de traçabilité.</p>
              
              <div class="info">
                <h3>📡 Endpoints API Disponibles:</h3>
                <div class="endpoint-list">
                  <strong>GET</strong> /api/health<br>
                  <strong>GET</strong> /api/statistiques<br>
                  <strong>GET/POST</strong> /api/tracabilite/enregistrer<br>
                  <strong>GET/POST</strong> /api/tracabilite/manifeste<br>
                  <strong>GET/POST</strong> /api/tracabilite/declaration<br>
                  <strong>GET/POST</strong> /api/kit/test<br>
                </div>
              </div>
              
              <p><a href="/">← Retour au Dashboard Central</a></p>
            </div>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: error.message,
      organisme: ORGANISME_CODE,
      timestamp: new Date().toISOString()
    }));
  }
});

// ✅ FONCTION: Afficher l'état des endpoints au démarrage
function afficherEtatEndpoints() {
  console.log('📡 État des endpoints API:');
  
  for (const [route, handlerFunc] of Object.entries(apiRouter)) {
    const [method, path] = route.split(' ');
    try {
      const handler = handlerFunc();
      const status = handler ? '✅' : '❌';
      console.log(`   ${status} ${method.padEnd(4)} ${path}`);
    } catch (error) {
      console.log(`   ❌ ${method.padEnd(4)} ${path} - Erreur: ${error.message}`);
    }
  }
  console.log('');
}

// Démarrer le serveur
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('🏛️ ============================================================');
  console.log(`🏛️ Serveur ${ORGANISME_NOM} démarré`);
  console.log(`📍 Siège: ${SIEGE}`);
  console.log(`🌍 URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📈 Statistiques: http://localhost:${PORT}/api/statistiques`);
  console.log(`📊 Traçabilité: http://localhost:${PORT}/api/tracabilite/enregistrer`);
  console.log(`📦 Manifestes: http://localhost:${PORT}/api/tracabilite/manifeste`);
  console.log(`📋 Déclarations: http://localhost:${PORT}/api/tracabilite/declaration`);
  console.log(`🔗 Kit URL: https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io`);
  console.log(`⏹️  Arrêt: Ctrl+C`);
  console.log('🏛️ ============================================================');
  console.log('');
  console.log(`🏛️ ${ORGANISME_NOM} - Système Central de Traçabilité`);
  console.log('📋 Fonctionnalités disponibles:');
  console.log('   • Collecte centralisée des opérations d\'échange entre pays UEMOA');
  console.log('   • Traçabilité complète des flux de données');
  console.log('   • Endpoints spécialisés pour manifestes et déclarations'); // ✅ NOUVEAU
  console.log('   • Statistiques en temps réel et monitoring');
  console.log('   • Génération de rapports et export de données');
  console.log('   • Interface web avec graphiques et métriques avancées');
  console.log('   • Tests et diagnostic Kit d\'Interconnexion');
  console.log(`   • Code organisme: ${ORGANISME_CODE} | Type: ${ORGANISME_TYPE}`);
  console.log('');
  console.log('🌍 Pays membres UEMOA surveillés:');
  console.log('   • BFA (Burkina Faso) - Hinterland');
  console.log('   • BEN (Bénin) - Côtier');
  console.log('   • CIV (Côte d\'Ivoire) - Côtier');
  console.log('   • GNB (Guinée-Bissau) - Côtier');
  console.log('   • MLI (Mali) - Hinterland');
  console.log('   • NER (Niger) - Hinterland');
  console.log('   • SEN (Sénégal) - Côtier');
  console.log('   • TGO (Togo) - Côtier');
  console.log('');
  
  // ✅ NOUVEAUTÉ: Vérifications au démarrage
  const fichiersOK = verifierFichiersAPI();
  afficherEtatEndpoints();
  
  if (!fichiersOK) {
    console.log('⚠️  ATTENTION: Certains endpoints ne fonctionneront pas car les fichiers API sont manquants.');
    console.log('📝 Consultez les instructions ci-dessus pour créer les fichiers requis.');
    console.log('');
  }
  
  console.log('🚀 Serveur prêt à recevoir les requêtes!');
  console.log('');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log(`\n🛑 Arrêt du serveur ${ORGANISME_NOM}...`);
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(`\n🛑 Arrêt du serveur ${ORGANISME_NOM}...`);
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// ✅ AMÉLIORATION: Gestion d'erreurs plus robuste
process.on('uncaughtException', (error) => {
  console.error(`❌ [${ORGANISME_CODE}] Erreur non capturée:`, error.message);
  console.error('📋 Stack trace:', error.stack);
  
  // Optionnel: arrêter le serveur en cas d'erreur critique
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ [${ORGANISME_CODE}] Promesse rejetée non gérée:`, reason);
  console.error('📋 Promise:', promise);
});