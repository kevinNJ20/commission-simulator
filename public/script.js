// Configuration API
const API_BASE = window.location.origin + '/api';
const KIT_URL = 'https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io';

let statusInterval;
let refreshInterval;
let chartOperationsType;
let chartPaysActivite;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation Dashboard Commission UEMOA');
    
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

// Vérification du statut du service
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

// Initialisation des graphiques
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

// Charger toutes les données
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

// Charger les statistiques globales
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

// Charger et afficher les opérations récentes
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

// Charger et mettre à jour les graphiques
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

// Afficher la liste des corridors
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

// Simuler une opération de test pour vérifier l'intégration Kit
async function simulerOperationTest() {
    try {
        const operationTest = {
            typeOperation: 'TEST_COMMISSION',
            numeroOperation: `COMM_TEST_${Date.now()}`,
            paysOrigine: 'TEST',
            paysDestination: 'TEST',
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

// Vider toutes les données (placeholder - à implémenter côté serveur)
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

// Exporter les données
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

// Ajouter une entrée dans le log d'activité
function ajouterLogOperation(type, source, description) {
    // Cette fonction peut être étendue pour afficher un log d'activité en temps réel
    console.log(`📊 [Commission] ${type}: ${source} - ${description}`);
}

// Fonctions utilitaires
function getOperationIcon(type) {
    const icons = {
        'TRANSMISSION_MANIFESTE': '📦',
        'NOTIFICATION_PAIEMENT': '💳',
        'AUTORISATION_MAINLEVEE': '✅',
        'TEST_COMMISSION': '🧪',
        'TEST_SIMULATION': '🔬',
        'TRANSIT': '🚛',
        'DECLARATION': '📋'
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

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (statusInterval) clearInterval(statusInterval);
    if (refreshInterval) clearInterval(refreshInterval);
});