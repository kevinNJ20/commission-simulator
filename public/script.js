// Configuration API
const API_BASE = 'https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api';
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
        document.getElementById('operations-total').textContent = data.global.operationsTotal || 0;
        document.getElementById('operations-aujourd-hui').textContent = data.global.operationsAujourdhui || 0;
        document.getElementById('pays-actifs').textContent = data.global.paysActifs?.length || 0;
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
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer`);
        const data = await response.json();
        
        const operationsList = document.getElementById('operations-list');
        
        if (data.operations && data.operations.length > 0) {
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
                        <div><strong>Pays:</strong> ${op.paysOrigine || '?'} → ${op.paysDestination || '?'}</div>
                        <div><strong>Statut:</strong> <span class="badge badge-${op.statut?.toLowerCase()}">${op.statut || 'INCONNUE'}</span></div>
                        ${op.donneesMetier ? `<div><strong>Détails:</strong> ${JSON.stringify(op.donneesMetier).substring(0, 100)}...</div>` : ''}
                    </div>
                </div>
            `).join('');
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
            chartPaysActivite.data.labels = paysAvecActivite.map(p => p.code);
            chartPaysActivite.data.datasets[0].data = paysAvecActivite.map(p => p.operationsEnvoyees);
            chartPaysActivite.data.datasets[1].data = paysAvecActivite.map(p => p.operationsRecues);
            chartPaysActivite.update();
        }
        
    } catch (error) {
        console.error('Erreur chargement graphiques:', error);
    }
}

// Afficher la liste des corridors
function afficherCorridors(corridors) {
    const corridorsList = document.getElementById('corridors-list');
    
    if (corridors.length > 0) {
        corridorsList.innerHTML = corridors.map(([route, count]) => `
            <div class="corridor-item">
                <span class="corridor-route">🚛 ${route}</span>
                <span class="corridor-count">${count}</span>
            </div>
        `).join('');
    } else {
        corridorsList.innerHTML = '<p class="text-muted">Aucun corridor actif pour le moment.</p>';
    }
}

// Simuler une opération de test
async function simulerOperationTest() {
    try {
        const operationTest = {
            typeOperation: 'TEST_SIMULATION',
            numeroOperation: `TEST-${Date.now()}`,
            paysOrigine: 'CIV',
            paysDestination: 'BFA',
            donneesMetier: {
                numeroManifeste: `MAN-TEST-${Date.now()}`,
                transporteur: 'SIMULATION CARRIER',
                nombreMarchandises: Math.floor(Math.random() * 5) + 1,
                valeurEstimee: Math.floor(Math.random() * 1000000) + 100000
            }
        };
        
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(operationTest)
        });
        
        if (response.ok) {
            afficherNotification('✅ Opération test simulée avec succès', 'success');
            setTimeout(() => chargerToutesLesDonnees(), 1000);
        } else {
            afficherNotification('❌ Erreur lors de la simulation', 'error');
        }
        
    } catch (error) {
        console.error('Erreur simulation:', error);
        afficherNotification('❌ Erreur technique lors de la simulation', 'error');
    }
}

// Vider toutes les données
async function viderDonnees() {
    if (confirm('⚠️ Êtes-vous sûr de vouloir vider toutes les données de traçabilité ?')) {
        try {
            // Note: Cette fonctionnalité devrait être implémentée côté serveur
            afficherNotification('🗑️ Fonctionnalité de vidage en cours de développement', 'info');
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
        
    } catch (error) {
        console.error('Erreur export:', error);
        afficherNotification('❌ Erreur lors de l\'export', 'error');
    }
}

// Fonctions utilitaires
function getOperationIcon(type) {
    const icons = {
        'TRANSMISSION_MANIFESTE': '📦',
        'NOTIFICATION_PAIEMENT': '💳',
        'AUTORISATION_MAINLEVEE': '✅',
        'TEST_SIMULATION': '🧪',
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

// Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (statusInterval) clearInterval(statusInterval);
    if (refreshInterval) clearInterval(refreshInterval);
});