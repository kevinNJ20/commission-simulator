// Configuration API
const API_BASE = window.location.origin + '/api';
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
        } else {
            indicator.textContent = '🔴';
            text.textContent = 'Système indisponible';
        }
    } catch (