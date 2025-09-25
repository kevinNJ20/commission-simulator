// Configuration API - COMMISSION UEMOA CORRIGÉ
const API_BASE = window.location.origin + '/api';
const KIT_MULESOFT_URL = 'http://localhost:8080/api/v1';
window.SYSTEME_TYPE = 'COMMISSION_UEMOA';
window.ORGANISME_CODE = 'UEMOA';

let statusInterval;
let refreshInterval;
let chartOperationsType;
let chartPaysActivite;
let kitConnected = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation Commission UEMOA - Monitoring Kit MuleSoft avec Test Direct');
    
    // Initialiser les graphiques
    initGraphiques();
    
    // Vérifier le statut périodiquement
    verifierStatut();
    statusInterval = setInterval(verifierStatut, 30000);
    
    // Actualiser les données toutes les 10 secondes
    chargerToutesLesDonnees();
    refreshInterval = setInterval(chargerToutesLesDonnees, 10000);
    
    // Ajouter une entrée de log initiale
    ajouterLogOperation('SYSTEME', 'Commission UEMOA', 'Système de traçabilité démarré - Monitoring Kit activé');
});

// Vérification du statut du service (via API locale pour le monitoring continu)
async function verifierStatut() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (data.status === 'UP') {
            indicator.textContent = '🟢';
            text.textContent = 'Système opérationnel';
            document.getElementById('status').style.background = '#d4edda';
        } else {
            indicator.textContent = '🔴';
            text.textContent = 'Système indisponible';
            document.getElementById('status').style.background = '#f8d7da';
        }
    } catch (error) {
        console.error('Erreur vérification statut:', error);
        document.getElementById('status-indicator').textContent = '🔴';
        document.getElementById('status-text').textContent = 'Erreur connexion';
        document.getElementById('status').style.background = '#f8d7da';
    }
}

// ✅ CORRECTION: Test de connexion Kit DIRECT vers MuleSoft
async function testerConnexionKit() {
    ajouterLogOperation('🔧 Test connexion Kit', 'Test connectivité directe vers Kit MuleSoft...');
    
    const startTime = Date.now();
    
    try {
        // ✅ APPEL DIRECT vers le Kit MuleSoft
        const response = await fetch(`${KIT_MULESOFT_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD',
                'X-Source-Country': window.ORGANISME_CODE,
                'User-Agent': 'CommissionUEMOA-Dashboard/1.0'
            },
            signal: AbortSignal.timeout(10000) // 10 secondes timeout
        });
        
        const latence = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            afficherNotification(`✅ Kit MuleSoft accessible - ${response.status} (${latence}ms)`, 'success');
            ajouterLogOperation('🔧 Test Kit Direct', `✅ Succès - Latence: ${latence}ms, Version: ${data.version || 'N/A'}`);
            
            // Log détaillé du Kit
            console.log('📊 Réponse Kit MuleSoft:', data);
            kitConnected = true;
            
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        const latence = Date.now() - startTime;
        let messageErreur = 'Kit MuleSoft inaccessible';
        
        if (error.name === 'TimeoutError') {
            messageErreur = 'Timeout - Kit MuleSoft ne répond pas (>10s)';
        } else if (error.message.includes('CORS')) {
            messageErreur = 'Erreur CORS - Configuration Kit à vérifier';
        } else if (error.message.includes('Failed to fetch')) {
            messageErreur = 'Erreur réseau - Kit MuleSoft inaccessible';
        } else {
            messageErreur = `Erreur: ${error.message}`;
        }
        
        afficherNotification(`❌ ${messageErreur} (${latence}ms)`, 'error');
        ajouterLogOperation('🔧 Test Kit Direct', `❌ Échec - ${messageErreur}`);
        kitConnected = false;
    }
}

// ✅ NOUVEAU: Test complet (Direct + Via API locale)
async function testerConnexionKitComplet() {
    ajouterLogOperation('🔍 Test complet', 'Test connectivité Kit - Direct + Via API locale');
    
    // Test 1: Direct depuis le browser
    console.log('🔍 Test 1: Connectivité directe browser → Kit MuleSoft');
    const testDirect = await testerKitDirect();
    
    // Test 2: Via l'API locale 
    console.log('🔍 Test 2: Connectivité via API locale → Kit MuleSoft');
    const testViaAPI = await testerKitViaAPI();
    
    // Comparaison des résultats
    const resultats = {
        testDirect: {
            accessible: testDirect.accessible,
            latence: testDirect.latence,
            source: 'Browser → Kit MuleSoft'
        },
        testViaAPI: {
            accessible: testViaAPI.accessible,
            latence: testViaAPI.latence,
            source: 'API Locale → Kit MuleSoft'
        },
        coherent: testDirect.accessible === testViaAPI.accessible
    };
    
    console.log('📊 Comparaison tests Kit:', resultats);
    
    const message = `Direct: ${testDirect.accessible ? '✅' : '❌'} (${testDirect.latence}ms) | ` +
                   `API: ${testViaAPI.accessible ? '✅' : '❌'} (${testViaAPI.latence}ms)`;
    
    ajouterLogOperation('🔍 Test complet', message);
    
    if (!resultats.coherent) {
        afficherNotification('⚠️ Résultats incohérents entre test direct et API locale', 'warning');
    } else {
        afficherNotification('✅ Tests cohérents - Connectivité validée', 'success');
    }
    
    return resultats;
}

// Test Kit direct (helper function)
async function testerKitDirect() {
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${KIT_MULESOFT_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD',
                'X-Source-Country': window.ORGANISME_CODE
            },
            signal: AbortSignal.timeout(8000)
        });
        
        const latence = Date.now() - startTime;
        
        return {
            accessible: response.ok,
            latence,
            status: response.status
        };
        
    } catch (error) {
        return {
            accessible: false,
            latence: Date.now() - startTime,
            erreur: error.message
        };
    }
}

// Test Kit via API locale (helper function)  
async function testerKitViaAPI() {
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const latence = Date.now() - startTime;
        
        return {
            accessible: data.status === 'UP',
            latence
        };
        
    } catch (error) {
        return {
            accessible: false,
            latence: Date.now() - startTime,
            erreur: error.message
        };
    }
}

// ✅ NOUVEAU: Diagnostic complet Kit MuleSoft (spécifique Commission UEMOA)
async function lancerDiagnostic() {
    ajouterLogOperation('🩺 Diagnostic', 'Démarrage diagnostic complet Kit MuleSoft...');
    afficherNotification('🩺 Diagnostic Kit en cours...', 'info');
    
    const diagnostic = {
        timestamp: new Date().toISOString(),
        systeme: window.SYSTEME_TYPE,
        organisme: window.ORGANISME_CODE,
        tests: {}
    };
    
    // Test 1: Health Check
    console.log('🏥 Test Health Check...');
    diagnostic.tests.health = await testerEndpointKit('/health', 'GET');
    
    // Test 2: Console Access
    console.log('🖥️ Test Console Access...');
    diagnostic.tests.console = await testerEndpointKit('/console', 'GET');
    
    // Test 3: Endpoint Traçabilité (✅ CORRECTION codes pays)
    console.log('📊 Test endpoint traçabilité...');
    diagnostic.tests.tracabiliteEnregistrer = await testerEndpointKit('/tracabilite/enregistrer', 'POST', {
        typeOperation: 'TEST_DIAGNOSTIC',
        numeroOperation: `TEST_DIAG_${Date.now()}`,
        paysOrigine: 'TST', // ✅ CORRECTION: 3 lettres
        paysDestination: 'TST', // ✅ CORRECTION: 3 lettres
        donneesMetier: {
            test: true,
            source: 'COMMISSION_UEMOA_DIAGNOSTIC'
        }
    });
    
    // Test 4: Endpoint Transmission Manifeste (pour vérifier réception depuis pays)
    console.log('📋 Test endpoint transmission manifeste...');
    diagnostic.tests.manifesteTransmission = await testerEndpointKit('/manifeste/transmission', 'GET');
    
    // Test 5: Endpoint Notification Paiement (pour vérifier réception depuis pays)
    console.log('💳 Test endpoint notification paiement...');
    diagnostic.tests.paiementNotification = await testerEndpointKit('/paiement/notification', 'GET');
    
    // Résumé du diagnostic
    const testsReussis = Object.values(diagnostic.tests).filter(t => t.accessible).length;
    const totalTests = Object.keys(diagnostic.tests).length;
    
    diagnostic.resume = {
        testsReussis,
        totalTests,
        tauxReussite: Math.round((testsReussis / totalTests) * 100),
        kitOperationnel: testsReussis > 0
    };
    
    console.log('📊 Diagnostic Kit terminé:', diagnostic.resume);
    
    const message = `Terminé - ${testsReussis}/${totalTests} tests réussis (${diagnostic.resume.tauxReussite}%)`;
    ajouterLogOperation('🩺 Diagnostic', message);
    
    if (diagnostic.resume.kitOperationnel) {
        afficherNotification(`✅ Kit opérationnel - ${message}`, 'success');
    } else {
        afficherNotification(`❌ Kit défaillant - ${message}`, 'error');
    }
    
    return diagnostic;
}

// Utilitaire pour tester un endpoint spécifique du Kit
async function testerEndpointKit(endpoint, method = 'GET', testData = null) {
    const startTime = Date.now();
    
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD',
                'X-Source-Country': window.ORGANISME_CODE,
                'X-Test-Type': 'DIAGNOSTIC'
            },
            signal: AbortSignal.timeout(5000)
        };
        
        // ✅ CORRECTION: données test par défaut avec codes pays valides
        if (method === 'POST') {
            options.body = JSON.stringify(testData || {
                typeOperation: 'TEST_DIAGNOSTIC',
                numeroOperation: `DIAG_${Date.now()}`,
                paysOrigine: 'TST', // ✅ CORRECTION: 3 lettres
                paysDestination: 'TST', // ✅ CORRECTION: 3 lettres
                donneesMetier: {
                    test: true,
                    timestamp: new Date().toISOString(),
                    source: 'COMMISSION_UEMOA_DIAGNOSTIC'
                }
            });
        }
        
        const response = await fetch(`${KIT_MULESOFT_URL}${endpoint}`, options);
        const latence = Date.now() - startTime;
        
        return {
            accessible: response.ok,
            status: response.status,
            latence,
            endpoint,
            method
        };
        
    } catch (error) {
        return {
            accessible: false,
            status: 0,
            latence: Date.now() - startTime,
            endpoint,
            method,
            erreur: error.message
        };
    }
}

// ✅ NOUVEAU: Test envoi opération de traçabilité vers Kit (test réel d'intégration)
async function testerEnvoiTracabiliteKit() {
    ajouterLogOperation('📊 Test traçabilité', 'Test envoi opération traçabilité vers Kit...');
    
    const operationTest = {
        typeOperation: 'TEST_INTEGRATION',
        numeroOperation: `TEST_TRACE_${Date.now()}`,
        paysOrigine: 'TST', // ✅ CORRECTION: 3 lettres
        paysDestination: 'TST', // ✅ CORRECTION: 3 lettres
        donneesMetier: {
            test: true,
            source: 'Commission UEMOA Dashboard',
            timestamp: new Date().toISOString(),
            numeroManifeste: `TEST_MAN_${Date.now()}`,
            transporteur: 'TEST CARRIER'
        }
    };
    
    try {
        const startTime = Date.now();
        
        const response = await fetch(`${KIT_MULESOFT_URL}/tracabilite/enregistrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD',
                'X-Source-Country': window.ORGANISME_CODE,
                'X-Test-Type': 'TRACABILITE_TEST',
                'Authorization': 'Bearer COMMISSION_TOKEN'
            },
            body: JSON.stringify(operationTest),
            signal: AbortSignal.timeout(10000)
        });
        
        const latence = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            afficherNotification(`✅ Opération traçabilité test envoyée - ${response.status} (${latence}ms)`, 'success');
            ajouterLogOperation('📊 Test traçabilité', `✅ Succès - ${operationTest.numeroOperation} (${latence}ms)`);
            console.log('📊 Réponse traçabilité:', data);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        const messageErreur = error.message.includes('Timeout') ? 'Timeout Kit' : error.message;
        afficherNotification(`❌ Échec test traçabilité: ${messageErreur}`, 'error');
        ajouterLogOperation('📊 Test traçabilité', `❌ Échec - ${messageErreur}`);
    }
}

// Initialisation des graphiques (reste inchangé)
function initGraphiques() {
    // Graphique Operations par Type
    const ctxType = document.getElementById('chart-operations-type');
    chartOperationsType = new Chart(ctxType, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#00f2fe'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Graphique Activité par Pays
    const ctxPays = document.getElementById('chart-pays-activite');
    chartPaysActivite = new Chart(ctxPays, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Opérations Envoyées',
                data: [],
                backgroundColor: '#667eea'
            }, {
                label: 'Opérations Reçues',
                data: [],
                backgroundColor: '#764ba2'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Charger toutes les données (reste inchangé)
async function chargerToutesLesDonnees() {
    try {
        await Promise.all([
            chargerStatistiques(),
            chargerOperations(),
            chargerGraphiques()
        ]);
    } catch (error) {
        console.error('Erreur chargement données:', error);
        afficherNotification('Erreur lors du chargement des données', 'error');
    }
}

// Charger les statistiques globales (reste inchangé)
async function chargerStatistiques() {
    try {
        const response = await fetch(`${API_BASE}/statistiques`);
        const data = await response.json();
        
        // Mettre à jour les métriques
        document.getElementById('operations-total').textContent = data.global?.operationsTotal || 0;
        document.getElementById('operations-aujourd-hui').textContent = data.global?.operationsAujourdhui || 0;
        document.getElementById('pays-actifs').textContent = data.global?.paysActifs?.length || 0;
        document.getElementById('corridors-actifs').textContent = data.corridors?.length || 0;
        
        // Mettre à jour la liste des corridors
        afficherCorridors(data.corridors || []);
        
    } catch (error) {
        console.error('Erreur chargement statistiques:', error);
    }
}

// Charger et afficher les opérations récentes (reste inchangé)
async function chargerOperations() {
    try {
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer?limite=10`);
        const data = await response.json();
        
        const operationsList = document.getElementById('operations-list');
        
        if (data.status === 'SUCCESS' && data.operations && data.operations.length > 0) {
            operationsList.innerHTML = data.operations.map(op => `
                <div class="operation-item">
                    <div class="operation-header">
                        <div class="operation-title">
                            ${getOperationIcon(op.typeOperation)} ${op.typeOperation || 'OPERATION'}
                        </div>
                        <div class="operation-time">
                            ${formatDateTime(op.dateEnregistrement)}
                        </div>
                    </div>
                    <div class="operation-details">
                        <div><strong>N° Opération:</strong> ${op.numeroOperation || op.id}</div>
                        <div><strong>Corridor:</strong> ${op.corridor || (op.paysOrigine + ' → ' + op.paysDestination)}</div>
                        <div><strong>Statut:</strong> <span class="badge badge-${(op.statut || 'ENREGISTREE').toLowerCase()}">${op.statut || 'ENREGISTREE'}</span></div>
                        ${op.donneesMetier ? `<div><strong>Détails:</strong> ${JSON.stringify(op.donneesMetier).substring(0, 100)}...</div>` : ''}
                    </div>
                </div>
            `).join('');
            
            // Ajouter les nouvelles opérations au log
            const derniereOperation = data.operations[0];
            if (derniereOperation && derniereOperation.id !== window.lastOperationId) {
                ajouterLogOperation(
                    derniereOperation.typeOperation, 
                    derniereOperation.corridor || `${derniereOperation.paysOrigine} → ${derniereOperation.paysDestination}`,
                    `Nouvelle opération enregistrée: ${derniereOperation.numeroOperation}`
                );
                window.lastOperationId = derniereOperation.id;
            }
        } else {
            operationsList.innerHTML = '<p class="text-muted">Aucune opération enregistrée pour le moment.</p>';
        }
        
    } catch (error) {
        console.error('Erreur chargement opérations:', error);
        document.getElementById('operations-list').innerHTML = '<p class="text-danger">Erreur lors du chargement des opérations.</p>';
    }
}

// Charger et mettre à jour les graphiques (reste inchangé)
async function chargerGraphiques() {
    try {
        const response = await fetch(`${API_BASE}/statistiques`);
        const data = await response.json();
        
        // Graphique Operations par Type
        if (data.parType && Object.keys(data.parType).length > 0) {
            chartOperationsType.data.labels = Object.keys(data.parType);
            chartOperationsType.data.datasets[0].data = Object.values(data.parType);
            chartOperationsType.update();
        }
        
        // Graphique Activité par Pays
        if (data.parPays && data.parPays.length > 0) {
            const paysAvecActivite = data.parPays.filter(p => p.operationsEnvoyees > 0 || p.operationsRecues > 0);
            if (paysAvecActivite.length > 0) {
                chartPaysActivite.data.labels = paysAvecActivite.map(p => p.code);
                chartPaysActivite.data.datasets[0].data = paysAvecActivite.map(p => p.operationsEnvoyees);
                chartPaysActivite.data.datasets[1].data = paysAvecActivite.map(p => p.operationsRecues);
                chartPaysActivite.update();
            }
        }
        
    } catch (error) {
        console.error('Erreur chargement graphiques:', error);
    }
}

// Afficher la liste des corridors (reste inchangé)
function afficherCorridors(corridors) {
    const corridorsList = document.getElementById('corridors-list');
    
    if (corridors.length > 0) {
        corridorsList.innerHTML = corridors.slice(0, 10).map(corridor => {
            // Gérer les différents formats de corridors
            let route, count;
            if (Array.isArray(corridor)) {
                [route, count] = corridor;
            } else if (corridor.origine && corridor.destination) {
                route = `${corridor.origine} → ${corridor.destination}`;
                count = corridor.nombreOperations || 0;
            } else {
                route = corridor.id || 'Corridor inconnu';
                count = corridor.nombreOperations || 0;
            }
            
            return `
                <div class="corridor-item">
                    <span class="corridor-route">🚛 ${route}</span>
                    <span class="corridor-count">${count}</span>
                </div>
            `;
        }).join('');
    } else {
        corridorsList.innerHTML = '<p class="text-muted">Aucun corridor actif pour le moment.</p>';
    }
}

// Simuler une opération de test pour vérifier l'intégration Kit (reste inchangé)
async function simulerOperationTest() {
    try {
        const operationTest = {
            typeOperation: 'TEST_COMMISSION',
            numeroOperation: `COMM_TEST_${Date.now()}`,
            paysOrigine: 'TST', // ✅ CORRECTION: 3 lettres au lieu de "TEST"
            paysDestination: 'TST', // ✅ CORRECTION: 3 lettres au lieu de "TEST"
            donneesMetier: {
                test: true,
                source: 'Commission UEMOA Dashboard',
                timestamp: new Date().toISOString()
            }
        };
        
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_DASHBOARD'
            },
            body: JSON.stringify(operationTest)
        });
        
        if (response.ok) {
            const result = await response.json();
            afficherNotification('✅ Opération test enregistrée avec succès', 'success');
            ajouterLogOperation('TEST', 'Commission', 'Test interne généré depuis le dashboard');
            setTimeout(() => chargerToutesLesDonnees(), 1000);
        } else {
            const error = await response.json();
            afficherNotification('❌ Erreur: ' + (error.message || 'Erreur inconnue'), 'error');
        }
        
    } catch (error) {
        console.error('Erreur simulation:', error);
        afficherNotification('❌ Erreur technique lors de la simulation', 'error');
    }
}


// Vider toutes les données (reste inchangé)
async function viderDonnees() {
    if (confirm('⚠️ Êtes-vous sûr de vouloir vider toutes les données de traçabilité ?')) {
        try {
            // Cette fonctionnalité devrait être implémentée côté serveur avec une route dédiée
            afficherNotification('🗑️ Fonctionnalité de vidage en cours de développement', 'info');
            ajouterLogOperation('ADMIN', 'Commission', 'Demande de vidage des données (non implémenté)');
        } catch (error) {
            afficherNotification('❌ Erreur lors du vidage des données', 'error');
        }
    }
}

// Exporter les données (reste inchangé)
async function exporterDonnees() {
    try {
        const response = await fetch(`${API_BASE}/statistiques`);
        const data = await response.json();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `commission-uemoa-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        afficherNotification('📥 Données exportées avec succès', 'success');
        ajouterLogOperation('EXPORT', 'Commission', 'Export des données de traçabilité effectué');
        
    } catch (error) {
        console.error('Erreur export:', error);
        afficherNotification('❌ Erreur lors de l\'export', 'error');
    }
}

// Ajouter une entrée dans le log d'activité (reste inchangé)
function ajouterLogOperation(type, source, description) {
    // Cette fonction peut être étendue pour afficher un log d'activité en temps réel
    console.log(`📊 [Commission] ${type}: ${source} - ${description}`);
}

// Fonctions utilitaires (reste inchangé)
function getOperationIcon(type) {
    const icons = {
        'TRANSMISSION_MANIFESTE': '📦',
        'NOTIFICATION_PAIEMENT': '💳',
        'AUTORISATION_MAINLEVEE': '✅',
        'TEST_COMMISSION': '🧪',
        'TEST_SIMULATION': '🔬',
        'TRANSIT': '🚛',
        'DECLARATION': '📋',
        'TEST_INTEGRATION': '🔗',
        'TEST_DIAGNOSTIC': '🩺'
    };
    return icons[type] || '📄';
}

function formatDateTime(dateString) {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function afficherNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Fonctions publiques pour les boutons HTML
window.chargerStatistiques = chargerStatistiques;
window.chargerOperations = chargerOperations;
window.exporterDonnees = exporterDonnees;
window.simulerOperationTest = simulerOperationTest;
window.viderDonnees = viderDonnees;
window.testerConnexionKit = testerConnexionKit;
window.lancerDiagnostic = lancerDiagnostic;
window.testerEnvoiTracabiliteKit = testerEnvoiTracabiliteKit;

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (statusInterval) clearInterval(statusInterval);
    if (refreshInterval) clearInterval(refreshInterval);
});