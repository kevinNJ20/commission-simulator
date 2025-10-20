// ============================================================================
// COMMISSION UEMOA - Script JavaScript Corrigé (Supervision Centrale)
// Rôle: ÉTAPES 20-21 (Libre Pratique) + ÉTAPE 16 (Transit)
// Siège: Ouagadougou, Burkina Faso
// ============================================================================

// Configuration API Commission UEMOA
const API_BASE = window.location.origin + '/api';
//const KIT_MULESOFT_URL = 'https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api/v1';
const KIT_MULESOFT_URL = process.env.KIT_MULESOFT_URL || '64.225.5.75:8086/api/v1';
window.SYSTEME_TYPE = 'COMMISSION_UEMOA';
window.ORGANISME_CODE = 'UEMOA';
window.SIEGE = 'OUAGADOUGOU_BURKINA_FASO';

let statusInterval;
let refreshInterval;
let chartEtapesWorkflows;
let activeTab = 'all';

// ✅ Pays membres UEMOA surveillés
const PAYS_UEMOA = {
    // Pays côtiers (de prime abord)
    'SEN': { nom: 'Sénégal', ville: 'Dakar', type: 'COTIER', flag: '🇸🇳' },
    'CIV': { nom: 'Côte d\'Ivoire', ville: 'Abidjan', type: 'COTIER', flag: '🇨🇮' },
    'BEN': { nom: 'Bénin', ville: 'Cotonou', type: 'COTIER', flag: '🇧🇯' },
    'TGO': { nom: 'Togo', ville: 'Lomé', type: 'COTIER', flag: '🇹🇬' },
    'GNB': { nom: 'Guinée-Bissau', ville: 'Bissau', type: 'COTIER', flag: '🇬🇼' },
    
    // Pays hinterland (de destination)
    'MLI': { nom: 'Mali', ville: 'Bamako', type: 'HINTERLAND', flag: '🇲🇱' },
    'BFA': { nom: 'Burkina Faso', ville: 'Ouagadougou', type: 'HINTERLAND', flag: '🇧🇫' },
    'NER': { nom: 'Niger', ville: 'Niamey', type: 'HINTERLAND', flag: '🇳🇪' }
};

// Initialisation Commission UEMOA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Initialisation Commission UEMOA - Supervision Centrale');
    console.log('📍 Siège: Ouagadougou, Burkina Faso');
    console.log('🔍 Rôle: Traçabilité ÉTAPES 20-21 (Libre Pratique) + ÉTAPE 16 (Transit)');
    
    initGraphiques();
    verifierStatutCommission();
    statusInterval = setInterval(verifierStatutCommission, 45000);
    
    chargerToutesLesDonneesCommission();
    refreshInterval = setInterval(chargerToutesLesDonneesCommission, 20000);
    
    ajouterLogSupervision('SYSTEME', 'Commission UEMOA démarrée', 'Supervision centrale UEMOA activée');
    initialiserSuiviPaysUEMOA();
});

// ✅ Vérification statut Commission UEMOA
async function verifierStatutCommission() {
    try {
        console.log('🏥 [Commission] Vérification statut système central...');
        
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (data.status === 'UP') {
            indicator.textContent = '🟢';
            text.textContent = 'Commission opérationnelle';
            document.getElementById('status').style.background = '#d4edda';
            
            // Mettre à jour les infos Commission dans le health check
            if (data.commission) {
                console.log('🏛️ Commission UEMOA:', data.commission.nom);
                console.log('📍 Siège:', data.commission.siege);
            }
            
        } else {
            indicator.textContent = '🔴';
            text.textContent = 'Commission indisponible';
            document.getElementById('status').style.background = '#f8d7da';
        }
    } catch (error) {
        console.error('❌ [Commission] Erreur vérification statut:', error);
        document.getElementById('status-indicator').textContent = '🔴';
        document.getElementById('status-text').textContent = 'Erreur système central';
        document.getElementById('status').style.background = '#f8d7da';
    }
}

// ✅ Gestion des onglets Commission
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    activeTab = tabName;
    
    switch(tabName) {
        case 'manifestes': chargerManifestes(); break;
        case 'declarations': chargerDeclarations(); break;
        case 'transit': chargerTransit(); break;
        default: chargerToutesOperations(); break;
    }
}

// ✅ Charger MANIFESTES (ÉTAPE 20)
// ✅ CORRECTION: Fonction chargerManifestes complète
async function chargerManifestes() {
    try {
        console.log('📦 [Commission] Chargement manifestes ÉTAPE 20...');
        
        const response = await fetch(`${API_BASE}/tracabilite/manifeste?limite=30`);
        const data = await response.json();
        
        const manifestesList = document.getElementById('manifestes-list');
        
        if (data.status === 'SUCCESS' && data.manifestes && data.manifestes.length > 0) {
            manifestesList.innerHTML = data.manifestes.map(manifeste => `
                <div class="operation-item manifeste-item commission-item">
                    <div class="operation-header">
                        <div class="operation-title">📦 ${manifeste.typeOperation || 'TRANSMISSION_MANIFESTE'}</div>
                        <div class="operation-time">${formatDateTime(manifeste.dateEnregistrement)}</div>
                        <div class="etape-badge etape-20">ÉTAPE 20</div>
                    </div>
                    <div class="operation-details commission-details">
                        <div><strong>N° Opération:</strong> ${manifeste.numeroOperation || manifeste.id}</div>
                        <div><strong>Corridor:</strong> ${manifeste.corridor}</div>
                        <div><strong>Navire:</strong> ${manifeste.navire || 'N/A'}</div>
                        <div><strong>Commission:</strong> <span class="badge badge-commission">TRACÉ UEMOA</span></div>
                    </div>
                </div>
            `).join('');
        } else {
            manifestesList.innerHTML = `
                <div class="no-data commission-no-data">
                    <h3>📦 Aucun manifeste tracé</h3>
                    <p>Aucune notification manifeste (ÉTAPE 20) reçue depuis le Kit d'Interconnexion.</p>
                    <button class="btn btn-accent" onclick="simulerManifeste()">🧪 Tester ÉTAPE 20</button>
                </div>
            `;
        }
        
        ajouterLogSupervision('LOAD_ETAPE_20', 'Manifestes chargés', `${data.manifestes?.length || 0} notifications`);
        
    } catch (error) {
        console.error('❌ [Commission] Erreur chargement manifestes:', error);
        document.getElementById('manifestes-list').innerHTML = `
            <div class="error-message commission-error">
                <p class="text-danger">❌ Erreur chargement manifestes ÉTAPE 20</p>
                <button class="btn btn-secondary" onclick="chargerManifestes()">🔄 Réessayer</button>
            </div>
        `;
    }
}

// ✅ Charger DÉCLARATIONS (ÉTAPE 21)
async function chargerDeclarations() {
    try {
        console.log('📋 [Commission] Chargement déclarations ÉTAPE 21...');
        
        const response = await fetch(`${API_BASE}/tracabilite/declaration?limite=30`);
        const data = await response.json();
        
        const declarationsList = document.getElementById('declarations-list');
        
        if (data.status === 'SUCCESS' && data.declarations && data.declarations.length > 0) {
            declarationsList.innerHTML = data.declarations.map(declaration => `
                <div class="operation-item declaration-item commission-item">
                    <div class="operation-header">
                        <div class="operation-title">📋 ${declaration.typeOperation || 'COMPLETION_LIBRE_PRATIQUE'}</div>
                        <div class="operation-time">${formatDateTime(declaration.dateEnregistrement)}</div>
                        <div class="etape-badge etape-21">ÉTAPE 21</div>
                    </div>
                    <div class="operation-details commission-details">
                        <div><strong>N° Opération:</strong> ${declaration.numeroOperation || declaration.id}</div>
                        <div><strong>Corridor:</strong> ${declaration.corridor}</div>
                        <div><strong>Déclaration:</strong> ${declaration.numeroDeclaration || 'N/A'}</div>
                        <div><strong>Finalisation:</strong> <span class="badge badge-final">WORKFLOW TERMINÉ</span></div>
                    </div>
                </div>
            `).join('');
        } else {
            declarationsList.innerHTML = `
                <div class="no-data commission-no-data">
                    <h3>📋 Aucune déclaration tracée</h3>
                    <p>Aucune finalisation workflow (ÉTAPE 21) reçue depuis le Kit d'Interconnexion.</p>
                    <button class="btn btn-accent" onclick="simulerDeclaration()">🧪 Tester ÉTAPE 21</button>
                </div>
            `;
        }
        
        ajouterLogSupervision('LOAD_ETAPE_21', 'Déclarations chargées', `${data.declarations?.length || 0} finalisations`);
        
    } catch (error) {
        console.error('❌ [Commission] Erreur chargement déclarations:', error);
        document.getElementById('declarations-list').innerHTML = `
            <div class="error-message commission-error">
                <p class="text-danger">❌ Erreur chargement déclarations ÉTAPE 21</p>
                <button class="btn btn-secondary" onclick="chargerDeclarations()">🔄 Réessayer</button>
            </div>
        `;
    }
}

// ✅ CORRECTION: Fonction chargerTransit complète
async function chargerTransit() {
    try {
        console.log('🚛 [Commission] Chargement transit ÉTAPE 16...');
        
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer?limite=30&etapeWorkflow=16`);
        const data = await response.json();
        
        const transitList = document.getElementById('transit-list');
        
        if (data.status === 'SUCCESS' && data.operations && data.operations.length > 0) {
            const operationsTransit = data.operations.filter(op => 
                op.typeOperation && (op.typeOperation.includes('TRANSIT') || op.etapeWorkflow === '16')
            );
            
            if (operationsTransit.length > 0) {
                transitList.innerHTML = operationsTransit.map(transit => `
                    <div class="operation-item transit-item commission-item">
                        <div class="operation-header">
                            <div class="operation-title">🚛 ${transit.typeOperation || 'COMPLETION_TRANSIT'}</div>
                            <div class="operation-time">${formatDateTime(transit.dateEnregistrement)}</div>
                            <div class="etape-badge etape-16">ÉTAPE 16</div>
                        </div>
                        <div class="operation-details commission-details">
                            <div><strong>N° Opération:</strong> ${transit.numeroOperation || transit.id}</div>
                            <div><strong>Corridor:</strong> ${transit.corridor}</div>
                            <div><strong>Transit:</strong> ${transit.donneesMetier?.numero_declaration_transit || 'N/A'}</div>
                            <div><strong>Traçabilité:</strong> <span class="badge badge-transit">TRANSIT FINALISÉ</span></div>
                        </div>
                    </div>
                `).join('');
            } else {
                transitList.innerHTML = `
                    <div class="no-data commission-no-data">
                        <h3>🚛 Aucune opération transit tracée</h3>
                        <p>Aucune finalisation transit (ÉTAPE 16) reçue depuis le Kit d'Interconnexion.</p>
                        <button class="btn btn-accent" onclick="simulerTransit()">🧪 Tester ÉTAPE 16</button>
                    </div>
                `;
            }
        } else {
            transitList.innerHTML = `
                <div class="no-data commission-no-data">
                    <h3>🚛 Aucune opération transit</h3>
                    <p>Aucune opération de transit tracée pour le moment.</p>
                    <button class="btn btn-accent" onclick="simulerTransit()">🧪 Tester ÉTAPE 16</button>
                </div>
            `;
        }
        
        ajouterLogSupervision('LOAD_ETAPE_16', 'Transit chargé', `${operationsTransit?.length || 0} opérations`);
        
    } catch (error) {
        console.error('❌ [Commission] Erreur chargement transit:', error);
        document.getElementById('transit-list').innerHTML = `
            <div class="error-message commission-error">
                <p class="text-danger">❌ Erreur chargement transit ÉTAPE 16</p>
                <button class="btn btn-secondary" onclick="chargerTransit()">🔄 Réessayer</button>
            </div>
        `;
    }
}

// ✅ CORRECTION: Fonction chargerToutesOperations complète
async function chargerToutesOperations() {
    try {
        console.log('🔍 [Commission] Chargement toutes opérations tracées...');
        
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer?limite=50`);
        const data = await response.json();
        
        const operationsList = document.getElementById('all-operations-list');
        
        if (data.status === 'SUCCESS' && data.operations && data.operations.length > 0) {
            operationsList.innerHTML = data.operations.map(op => {
                const isManifeste = op.typeOperation && op.typeOperation.includes('MANIFESTE');
                const isDeclaration = op.typeOperation && (op.typeOperation.includes('DECLARATION') || op.typeOperation.includes('COMPLETION'));
                const isTransit = op.typeOperation && op.typeOperation.includes('TRANSIT');
                
                let etapeClass = '';
                let etapeLabel = '';
                
                if (isManifeste || op.etapeWorkflow === '20') {
                    etapeClass = 'etape-20';
                    etapeLabel = 'ÉTAPE 20';
                } else if (isDeclaration || op.etapeWorkflow === '21') {
                    etapeClass = 'etape-21';  
                    etapeLabel = 'ÉTAPE 21';
                } else if (isTransit || op.etapeWorkflow === '16') {
                    etapeClass = 'etape-16';
                    etapeLabel = 'ÉTAPE 16';
                } else {
                    etapeClass = 'etape-other';
                    etapeLabel = 'AUTRE';
                }
                
                return `
                    <div class="operation-item commission-item">
                        <div class="operation-header">
                            <div class="operation-title">
                                ${getOperationIcon(op.typeOperation)} ${op.typeOperation || 'OPERATION'}
                            </div>
                            <div class="operation-time">
                                ${formatDateTime(op.dateEnregistrement)}
                            </div>
                            <div class="etape-badge ${etapeClass}">${etapeLabel}</div>
                        </div>
                        <div class="operation-details commission-details">
                            <div><strong>N° Opération:</strong> ${op.numeroOperation || op.id}</div>
                            <div><strong>Corridor:</strong> ${op.corridor || (op.paysOrigine + ' → ' + op.paysDestination)}</div>
                            <div><strong>Type:</strong> <span class="badge badge-${isManifeste ? 'manifeste' : isDeclaration ? 'declaration' : isTransit ? 'transit' : 'other'}">${isManifeste ? 'MANIFESTE' : isDeclaration ? 'DÉCLARATION' : isTransit ? 'TRANSIT' : 'AUTRE'}</span></div>
                            <div><strong>Statut:</strong> <span class="badge badge-commission">TRACÉ COMMISSION</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            operationsList.innerHTML = `
                <div class="no-data commission-no-data">
                    <h3>📊 Aucune opération tracée</h3>
                    <p>Aucune opération n'a encore été reçue depuis le Kit d'Interconnexion.</p>
                    <button class="btn btn-accent" onclick="simulerOperationTest()">🧪 Tester Commission</button>
                </div>
            `;
        }
        
        ajouterLogSupervision('LOAD_ALL', 'Toutes opérations chargées', `${data.operations?.length || 0} opérations`);
        
    } catch (error) {
        console.error('❌ [Commission] Erreur chargement opérations:', error);
        document.getElementById('all-operations-list').innerHTML = `
            <div class="error-message commission-error">
                <p class="text-danger">❌ Erreur chargement opérations Commission</p>
                <p class="text-muted">Détails: ${error.message}</p>
                <button class="btn btn-secondary" onclick="chargerToutesOperations()">🔄 Réessayer</button>
            </div>
        `;
        ajouterLogSupervision('ERROR', 'Échec chargement opérations', error.message);
    }
}

// ✅ CORRECTION: Fonction chargerStatistiques avec mise à jour graphique
async function chargerStatistiques() {
    try {
        const response = await fetch(`${API_BASE}/statistiques`);
        const data = await response.json();
        
        document.getElementById('workflows-libre-pratique').textContent = data.global?.workflowsLibrePratique || 0;
        document.getElementById('workflows-transit').textContent = data.global?.workflowsTransit || 0;
        document.getElementById('pays-actifs').textContent = data.global?.paysConnectes || 0;
        document.getElementById('corridors-surveilles').textContent = data.corridors?.length || 0;
        
        // ✅ CORRECTION: Mise à jour du graphique
        if (data.parType && Object.keys(data.parType).length > 0) {
            mettreAJourGraphiqueEtapes(data.parType);
        }
        
        // ✅ CORRECTION: Affichage des pays
        if (data.parPays && data.parPays.length > 0) {
            afficherPaysUEMOA(data.parPays);
        }
        
        ajouterLogSupervision('STATS', 'Statistiques mises à jour', 
            `${data.global?.operationsTotal || 0} opérations`);
        
    } catch (error) {
        console.error('❌ [Commission] Erreur chargement statistiques:', error);
        ajouterLogSupervision('ERROR', 'Erreur statistiques', error.message);
    }
}

// ✅ Charger toutes les données Commission
async function chargerToutesLesDonneesCommission() {
    await chargerStatistiques();
    if (activeTab === 'manifestes') await chargerManifestes();
    else if (activeTab === 'declarations') await chargerDeclarations();
    else if (activeTab === 'transit') await chargerTransit();
    else await chargerToutesOperations();
}

// ✅ Initialiser graphiques Commission
function initGraphiques() {
    const ctxEtapes = document.getElementById('chart-etapes-workflows');
    chartEtapesWorkflows = new Chart(ctxEtapes, {
        type: 'doughnut',
        data: {
            labels: ['Étape 20 (Manifeste)', 'Étape 21 (Finalisation)', 'Étape 16 (Transit)', 'Autres'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#feca57']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: {
                    display: true,
                    text: 'Répartition par Étape Commission UEMOA'
                }
            }
        }
    });
}

// ✅ CORRECTION: Mise à jour graphique étapes
function mettreAJourGraphiqueEtapes(operationsParType) {
    if (!chartEtapesWorkflows || !chartEtapesWorkflows.data) {
        console.log('⚠️ [Commission] Graphique non initialisé');
        return;
    }
    
    let etape20 = 0, etape21 = 0, etape16 = 0, autres = 0;
    
    Object.keys(operationsParType).forEach(type => {
        const count = operationsParType[type];
        const typeUpper = type.toUpperCase();
        
        if (typeUpper.includes('MANIFESTE') || typeUpper.includes('TRANSMISSION')) {
            etape20 += count;
        } else if (typeUpper.includes('COMPLETION') || typeUpper.includes('DECLARATION')) {
            etape21 += count;
        } else if (typeUpper.includes('TRANSIT')) {
            etape16 += count;
        } else {
            autres += count;
        }
    });
    
    chartEtapesWorkflows.data.datasets[0].data = [etape20, etape21, etape16, autres];
    chartEtapesWorkflows.update('none');
    
    console.log('📊 [Commission] Graphique mis à jour:', { etape20, etape21, etape16, autres });
}

// ✅ CORRECTION: Affichage pays UEMOA
function afficherPaysUEMOA(statistiquesParPays) {
    const paysUEMOAList = document.getElementById('pays-uemoa-list');
    
    if (!paysUEMOAList) {
        console.log('⚠️ [Commission] Element pays-uemoa-list non trouvé');
        return;
    }
    
    if (statistiquesParPays.length > 0) {
        paysUEMOAList.innerHTML = statistiquesParPays.map(pays => {
            const paysInfo = PAYS_UEMOA[pays.code] || { nom: pays.code, ville: 'N/A', type: 'INCONNU', flag: '🏳️' };
            const totalOperations = pays.operationsEnvoyees + pays.operationsRecues;
            
            return `
                <div class="pays-item ${paysInfo.type.toLowerCase()}" data-pays="${pays.code}">
                    <span class="pays-flag">${paysInfo.flag}</span>
                    <div class="pays-info">
                        <strong>${paysInfo.nom}</strong> (${pays.code})<br>
                        <small>${paysInfo.ville} - ${paysInfo.type === 'COTIER' ? 'Prime abord' : 'Destination'}</small>
                    </div>
                    <div class="pays-stats">
                        <div class="stat-item">
                            <span class="stat-value">${pays.operationsEnvoyees}</span>
                            <span class="stat-label">Envoyées</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${pays.operationsRecues}</span>
                            <span class="stat-label">Reçues</span>
                        </div>
                    </div>
                    <span class="pays-status ${totalOperations > 0 ? 'active' : 'inactive'}">
                        ${totalOperations > 0 ? '🟢' : '⚪'}
                    </span>
                </div>
            `;
        }).join('');
    } else {
        paysUEMOAList.innerHTML = `
            <div class="no-data commission-no-data">
                <p>Aucune activité détectée depuis les pays membres UEMOA.</p>
            </div>
        `;
    }
}

// Fonction pour initialiser le suivi des pays
function initialiserSuiviPaysUEMOA() {
    console.log('🌍 [Commission] Initialisation suivi pays membres UEMOA...');
    
    Object.keys(PAYS_UEMOA).forEach(codePays => {
        const paysInfo = PAYS_UEMOA[codePays];
        console.log(`📍 ${paysInfo.flag} ${paysInfo.nom} (${codePays})`);
        
        const statusElement = document.getElementById(`status-${codePays}`);
        if (statusElement) {
            statusElement.textContent = '⚪';
        }
    });
    
    ajouterLogSupervision('INIT_PAYS', 'Pays UEMOA initialisés', `${Object.keys(PAYS_UEMOA).length} pays membres`);
}

// ✅ Tests Kit d'Interconnexion depuis Commission

async function testerConnectiviteKit() {
    ajouterLogSupervision('TEST_KIT', 'Test connectivité Kit', 'Vérification Kit MuleSoft...');
    afficherNotification('🔧 Test connectivité Kit d\'Interconnexion...', 'info');
    
    try {
        // Test via l'API locale de la Commission (qui teste le Kit)
        const response = await fetch(`${API_BASE}/kit/test?type=health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            afficherNotification('✅ Kit d\'Interconnexion accessible', 'success');
            ajouterLogSupervision('TEST_KIT', 'Kit accessible', `Latence: ${data.resultat?.latence || 'N/A'}ms`);
            
            document.getElementById('test-results').innerHTML = `
                <div class="test-result success">
                    <h4>✅ Test Connectivité Kit Réussi</h4>
                    <p><strong>Status:</strong> ${data.resultat?.status || 'UP'}</p>
                    <p><strong>Latence:</strong> ${data.resultat?.latence || 'N/A'} ms</p>
                    <p><strong>Source:</strong> ${data.source || 'Commission → Kit MuleSoft'}</p>
                    <small>Testé le ${new Date().toLocaleString('fr-FR')}</small>
                </div>
            `;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        afficherNotification('❌ Kit d\'Interconnexion inaccessible', 'error');
        ajouterLogSupervision('TEST_KIT', 'Kit inaccessible', error.message);
        
        document.getElementById('test-results').innerHTML = `
            <div class="test-result error">
                <h4>❌ Test Connectivité Kit Échoué</h4>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <p>Le Kit MuleSoft d'Interconnexion n'est pas accessible depuis la Commission.</p>
                <small>Testé le ${new Date().toLocaleString('fr-FR')}</small>
            </div>
        `;
    }
}

async function lancerDiagnosticKit() {
    ajouterLogSupervision('DIAGNOSTIC_KIT', 'Diagnostic Kit', 'Diagnostic complet en cours...');
    afficherNotification('🩺 Diagnostic complet Kit d\'Interconnexion...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/kit/diagnostic`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const diagnostic = data.diagnostic;
            
            afficherNotification('✅ Diagnostic Kit terminé', 'success');
            ajouterLogSupervision('DIAGNOSTIC_KIT', 'Diagnostic terminé', 
                `${diagnostic.resume?.testsReussis || 0}/${diagnostic.resume?.totalTests || 0} tests`);
            
            document.getElementById('test-results').innerHTML = `
                <div class="test-result ${diagnostic.resume?.kitOperationnel ? 'success' : 'warning'}">
                    <h4>🩺 Diagnostic Kit d'Interconnexion</h4>
                    <p><strong>Tests réussis:</strong> ${diagnostic.resume?.testsReussis || 0}/${diagnostic.resume?.totalTests || 0}</p>
                    <p><strong>Taux de réussite:</strong> ${diagnostic.resume?.tauxReussite || 0}%</p>
                    <p><strong>Kit opérationnel:</strong> ${diagnostic.resume?.kitOperationnel ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Recommandation:</strong> ${diagnostic.resume?.recommandationCommission || 'N/A'}</p>
                    <small>Diagnostic effectué le ${new Date().toLocaleString('fr-FR')}</small>
                </div>
            `;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        afficherNotification('❌ Diagnostic Kit échoué', 'error');
        ajouterLogSupervision('DIAGNOSTIC_KIT', 'Diagnostic échoué', error.message);
        
        document.getElementById('test-results').innerHTML = `
            <div class="test-result error">
                <h4>❌ Diagnostic Kit Échoué</h4>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <p>Impossible d'effectuer le diagnostic complet du Kit d'Interconnexion.</p>
                <small>Tenté le ${new Date().toLocaleString('fr-FR')}</small>
            </div>
        `;
    }
}

async function testerNotificationVersKit() {
    ajouterLogSupervision('TEST_NOTIFICATION', 'Test notification Kit', 'Test envoi vers Kit...');
    
    const operationTest = {
        typeOperation: 'TEST_COMMISSION_UEMOA',
        numeroOperation: `COMM_TEST_${Date.now()}`,
        paysOrigine: 'UEMOA',
        paysDestination: 'TEST',
        donneesMetier: {
            test: true,
            source: 'Commission UEMOA Dashboard',
            timestamp: new Date().toISOString(),
            etape_workflow: 'TEST_NOTIFICATION',
            commission: {
                nom: 'Commission UEMOA',
                siege: 'Ouagadougou, Burkina Faso'
            }
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD_TEST'
            },
            body: JSON.stringify(operationTest)
        });
        
        if (response.ok) {
            const result = await response.json();
            afficherNotification('✅ Test notification Commission réussi', 'success');
            ajouterLogSupervision('TEST_NOTIFICATION', 'Test réussi', operationTest.numeroOperation);
            
            document.getElementById('test-results').innerHTML = `
                <div class="test-result success">
                    <h4>✅ Test Notification Commission Réussi</h4>
                    <p><strong>Opération:</strong> ${operationTest.numeroOperation}</p>
                    <p><strong>Status:</strong> ${result.status}</p>
                    <p><strong>Message:</strong> ${result.message}</p>
                    <small>Testé le ${new Date().toLocaleString('fr-FR')}</small>
                </div>
            `;
            
            // Actualiser les données après le test
            setTimeout(() => {
                chargerToutesLesDonneesCommission();
            }, 1000);
        } else {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
    } catch (error) {
        afficherNotification('❌ Test notification échoué', 'error');
        ajouterLogSupervision('TEST_NOTIFICATION', 'Test échoué', error.message);
        
        document.getElementById('test-results').innerHTML = `
            <div class="test-result error">
                <h4>❌ Test Notification Échoué</h4>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <small>Tenté le ${new Date().toLocaleString('fr-FR')}</small>
            </div>
        `;
    }
}

async function synchroniserAvecKit() {
    ajouterLogSupervision('SYNC_KIT', 'Synchronisation Kit', 'Synchronisation en cours...');
    afficherNotification('🔄 Synchronisation avec Kit d\'Interconnexion...', 'info');
    
    try {
        const response = await fetch(`${API_BASE}/kit/synchroniser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_UEMOA_DASHBOARD'
            },
            body: JSON.stringify({
                action: 'synchronisation',
                source: 'COMMISSION_UEMOA'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            const sync = data.synchronisation;
            
            if (sync.succes) {
                afficherNotification('✅ Synchronisation Kit réussie', 'success');
                ajouterLogSupervision('SYNC_KIT', 'Synchronisation réussie', `Latence: ${sync.latence || 'N/A'}ms`);
            } else {
                throw new Error(sync.message || 'Synchronisation échouée');
            }
            
            document.getElementById('test-results').innerHTML = `
                <div class="test-result ${sync.succes ? 'success' : 'error'}">
                    <h4>${sync.succes ? '✅' : '❌'} Synchronisation Kit</h4>
                    <p><strong>Status:</strong> ${sync.succes ? 'Réussie' : 'Échouée'}</p>
                    <p><strong>Message:</strong> ${sync.message}</p>
                    <p><strong>Latence:</strong> ${sync.latence || 'N/A'} ms</p>
                    <small>Synchronisé le ${new Date().toLocaleString('fr-FR')}</small>
                </div>
            `;
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        afficherNotification('❌ Synchronisation Kit échouée', 'error');
        ajouterLogSupervision('SYNC_KIT', 'Synchronisation échouée', error.message);
        
        document.getElementById('test-results').innerHTML = `
            <div class="test-result error">
                <h4>❌ Synchronisation Kit Échouée</h4>
                <p><strong>Erreur:</strong> ${error.message}</p>
                <small>Tentée le ${new Date().toLocaleString('fr-FR')}</small>
            </div>
        `;
    }
}

// ✅ Simulations spécifiques Commission

// ✅ Fonctions de simulation
async function simulerManifeste() {
    const manifesteTest = {
        typeOperation: 'TEST_TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE',
        numeroOperation: `TEST_ETAPE20_${Date.now()}`,
        paysOrigine: 'SEN',
        paysDestination: 'MLI',
        donneesMetier: {
            numero_manifeste: Math.floor(Math.random() * 9999) + 1000,
            navire: 'TEST VESSEL ETAPE 20',
            consignataire: 'TEST CONSIGNEE SENEGAL',
            port_debarquement: 'Port de Dakar',
            nombre_articles: Math.floor(Math.random() * 5) + 1,
            valeur_approximative: Math.floor(Math.random() * 50000000) + 1000000,
            etape_workflow: 20
        }
    };
    
    await envoyerOperationTestCommission(manifesteTest, 'manifeste ÉTAPE 20');
}

async function simulerDeclaration() {
    const declarationTest = {
        typeOperation: 'TEST_COMPLETION_LIBRE_PRATIQUE',
        numeroOperation: `TEST_ETAPE21_${Date.now()}`,
        paysOrigine: 'MLI',
        paysDestination: 'SEN',
        donneesMetier: {
            numero_declaration: `DEC_TEST_${Math.floor(Math.random() * 9999) + 1000}`,
            manifeste_origine: `MAN_${Math.floor(Math.random() * 9999) + 1000}`,
            montant_paye: Math.floor(Math.random() * 5000000) + 100000,
            reference_paiement: `PAY_TEST_${Date.now()}`,
            workflow_complete: true,
            etapes_totales: 21,
            etape_workflow: 21
        }
    };
    
    await envoyerOperationTestCommission(declarationTest, 'déclaration ÉTAPE 21');
}

async function simulerTransit() {
    const transitTest = {
        typeOperation: 'TEST_COMPLETION_TRANSIT',
        numeroOperation: `TEST_ETAPE16_${Date.now()}`,
        paysOrigine: 'SEN',
        paysDestination: 'MLI',
        donneesMetier: {
            numero_declaration_transit: `TRA_TEST_${Math.floor(Math.random() * 9999) + 1000}`,
            transporteur: 'TEST TRANSPORT SAHEL',
            delai_route: '72 heures',
            itineraire: 'Test Dakar-Bamako',
            arrivee_confirmee: true,
            etapes_totales: 16,
            etape_workflow: 16
        }
    };
    
    await envoyerOperationTestCommission(transitTest, 'transit ÉTAPE 16');
}

async function simulerOperationTest() {
    const operationTest = {
        typeOperation: 'TEST_COMMISSION_UEMOA',
        numeroOperation: `TEST_COMM_${Date.now()}`,
        paysOrigine: 'UEMOA',
        paysDestination: 'TEST',
        donneesMetier: {
            test: true,
            source: 'Commission UEMOA Dashboard Test',
            timestamp: new Date().toISOString(),
            commission: {
                nom: 'Commission UEMOA',
                siege: 'Ouagadougou, Burkina Faso'
            }
        }
    };
    
    await envoyerOperationTestCommission(operationTest, 'test général Commission');
}

// ✅ Fonction utilitaire pour envoyer les tests Commission
async function envoyerOperationTestCommission(operation, typeOperation) {
    try {
        ajouterLogSupervision('TEST_SIMULATION', `Simulation ${typeOperation}`, operation.numeroOperation);
        
        const response = await fetch(`${API_BASE}/tracabilite/enregistrer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Source-System': 'COMMISSION_DASHBOARD_TEST'
            },
            body: JSON.stringify(operation)
        });
        
        if (response.ok) {
            afficherNotification(`✅ ${typeOperation.toUpperCase()} test enregistré`, 'success');
            ajouterLogSupervision('TEST_SIMULATION', `Simulation ${typeOperation} réussie`, operation.numeroOperation);
            setTimeout(() => chargerToutesLesDonneesCommission(), 1000);
        } else {
            const error = await response.json();
            afficherNotification(`❌ Erreur test ${typeOperation}: ${error.message}`, 'error');
        }
    } catch (error) {
        afficherNotification(`❌ Erreur technique test ${typeOperation}`, 'error');
        ajouterLogSupervision('ERROR', `Échec simulation ${typeOperation}`, error.message);
    }
}

// ✅ CORRECTION: Export CSV
async function genererRapportSupervision() {
    try {
        ajouterLogSupervision('RAPPORT', 'Génération rapport', 'En cours...');
        afficherNotification('📊 Génération rapport supervision UEMOA...', 'info');
        
        const response = await fetch(`${API_BASE}/rapports/exporter?format=csv&type=commission`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `commission-uemoa-rapport-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            afficherNotification('📥 Rapport supervision UEMOA généré (CSV)', 'success');
            ajouterLogSupervision('RAPPORT', 'Rapport généré', 'Format CSV');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ [Commission] Erreur génération rapport:', error);
        afficherNotification('❌ Erreur génération rapport', 'error');
        ajouterLogSupervision('ERROR', 'Erreur rapport', error.message);
    }
}

// ✅ Fonction pour générer le CSV du rapport
function generateRapportCSV(rapport, operations) {
    let csv = '';
    
    // En-tête du rapport
    csv += 'COMMISSION UEMOA - RAPPORT DE SUPERVISION\n';
    csv += `Généré le,${new Date().toLocaleString('fr-FR')}\n`;
    csv += `Période,${rapport.periode.debut} au ${rapport.periode.fin}\n`;
    csv += '\n';
    
    // Résumé statistiques
    csv += 'STATISTIQUES GLOBALES\n';
    csv += 'Indicateur,Valeur\n';
    csv += `Opérations Total,${rapport.supervision.operationsTotal}\n`;
    csv += `Workflows Libre Pratique,${rapport.supervision.workflowsLibrePratique}\n`;
    csv += `Workflows Transit,${rapport.supervision.workflowsTransit}\n`;
    csv += `Pays Actifs,${rapport.supervision.paysActifs}\n`;
    csv += `Corridors Actifs,${rapport.supervision.corridorsActifs}\n`;
    csv += '\n';
    
    // Répartition par étapes
    csv += 'RÉPARTITION PAR ÉTAPES\n';
    csv += 'Étape,Nombre Opérations\n';
    csv += `Étape 20 (Manifestes),${rapport.etapes.etape20_manifestes}\n`;
    csv += `Étape 21 (Déclarations),${rapport.etapes.etape21_declarations}\n`;
    csv += `Étape 16 (Transit),${rapport.etapes.etape16_transit}\n`;
    csv += '\n';
    
    // Détail des opérations
    csv += 'DÉTAIL DES OPÉRATIONS\n';
    csv += 'ID,Numéro Opération,Type,Pays Origine,Pays Destination,Étape,Date\n';
    
    operations.forEach(op => {
        const id = (op.id || '').replace(/,/g, ';');
        const numero = (op.numeroOperation || '').replace(/,/g, ';');
        const type = (op.typeOperation || '').replace(/,/g, ';');
        const origine = op.paysOrigine || '';
        const destination = op.paysDestination || '';
        const etape = op.etapeWorkflow || '';
        const date = formatDateTime(op.dateEnregistrement);
        
        csv += `${id},${numero},${type},${origine},${destination},${etape},${date}\n`;
    });
    
    csv += '\n';
    
    // Recommandations
    csv += 'RECOMMANDATIONS\n';
    rapport.recommandations.forEach((rec, index) => {
        csv += `${index + 1},"${rec.replace(/"/g, '""')}"\n`;
    });
    
    return csv;
}

function genererRecommandationsCommission(stats, operations) {
    const recommandations = [];
    
    const total = stats.global?.operationsTotal || 0;
    const paysActifs = stats.global?.paysConnectes || 0;
    
    if (total === 0) {
        recommandations.push('Aucune opération tracée - Vérifier connectivité Kit d\'Interconnexion');
    }
    
    if (paysActifs < 2) {
        recommandations.push('Peu de pays actifs - Promouvoir utilisation workflows UEMOA');
    }
    
    if (total > 100) {
        recommandations.push('Volume élevé d\'opérations - Excellent engagement des pays membres');
    }
    
    const manifestesCount = operations.filter(op => op.typeOperation?.includes('MANIFESTE')).length;
    const declarationsCount = operations.filter(op => op.typeOperation?.includes('COMPLETION')).length;
    
    if (manifestesCount > declarationsCount * 2) {
        recommandations.push('Déséquilibre manifestes/déclarations - Vérifier finalisation workflows');
    }
    
    if (recommandations.length === 0) {
        recommandations.push('Supervision normale - Continuer surveillance workflows UEMOA');
    }
    
    return recommandations;
}

// ✅ CORRECTION: Export données CSV
async function exporterDonnees() {
    try {
        const response = await fetch(`${API_BASE}/rapports/exporter?format=csv&type=commission`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `commission-uemoa-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            afficherNotification('📥 Données Commission UEMOA exportées (CSV)', 'success');
            ajouterLogSupervision('EXPORT', 'Export Commission effectué (CSV)');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ [Commission] Erreur export:', error);
        afficherNotification('❌ Erreur export données Commission', 'error');
        ajouterLogSupervision('ERROR', 'Erreur export', error.message);
    }
}

// ✅ Journal supervision Commission
function ajouterLogSupervision(type, operation, details = '') {
    const logContainer = document.getElementById('activity-log');
    const timestamp = new Date().toLocaleString('fr-FR');
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry commission-log ${type.toLowerCase()}`;
    logEntry.innerHTML = `
        <div class="log-timestamp">${timestamp}</div>
        <div class="log-type">${type}</div>
        <div class="log-operation">${operation}</div>
        ${details ? `<div class="log-details">${details}</div>` : ''}
    `;
    
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function viderJournal() {
    document.getElementById('activity-log').innerHTML = '';
    ajouterLogSupervision('ADMIN', 'Journal vidé', 'Nettoyage journal supervision');
}

// ✅ Filtrage journal par niveau
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'log-filter-level') {
        const filterLevel = e.target.value;
        const entries = document.querySelectorAll('.log-entry');
        
        entries.forEach(entry => {
            if (filterLevel === 'all') {
                entry.style.display = 'grid';
            } else {
                const logType = entry.querySelector('.log-type').textContent.split(' ')[1];
                entry.style.display = logType === filterLevel ? 'grid' : 'none';
            }
        });
        
        ajouterLogSupervision('FILTER', 'Filtre journal', `Niveau: ${filterLevel}`);
    }
});

// ✅ Fonctions utilitaires Commission

function getOperationIcon(type) {
    const icons = {
        'TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE': '📦',
        'TRANSMISSION_MANIFESTE': '📦',
        'COMPLETION_LIBRE_PRATIQUE': '📋',
        'SOUMISSION_DECLARATION_DOUANIERE': '📋', 
        'COMPLETION_TRANSIT': '🚛',
        'TRANSIT': '🚛',
        'TEST_COMMISSION_UEMOA': '🧪',
        'TEST_COMMISSION': '🧪',
        'ETAPE_20': '📦',
        'ETAPE_21': '📋',
        'ETAPE_16': '🚛',
        'TEST_KIT': '🔧',
        'DIAGNOSTIC_KIT': '🩺',
        'TEST_NOTIFICATION': '📊',
        'SYNC_KIT': '🔄',
        'TEST_SIMULATION': '🧪',
        'SYSTEME': '🏛️',
        'LOAD_ETAPE_20': '📦',
        'LOAD_ETAPE_21': '📋',
        'LOAD_ETAPE_16': '🚛',
        'LOAD_ALL': '📥',
        'STATS': '📊',
        'RAPPORT': '📊',
        'EXPORT': '📥',
        'NAVIGATION': '🧭',
        'INIT_PAYS': '🌍',
        'FILTER': '🔍',
        'ADMIN': '⚙️',
        'ERROR': '❌'
    };
    return icons[type] || '📄';
}

function formatDateTime(dateString) {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function afficherNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => notification.classList.remove('show'), 4000);
}

// ✅ Fonctions publiques pour les boutons HTML
window.chargerStatistiques = chargerStatistiques;
window.chargerToutesOperations = chargerToutesOperations;
window.chargerManifestes = chargerManifestes;
window.chargerDeclarations = chargerDeclarations;
window.chargerTransit = chargerTransit;
window.exporterDonnees = exporterDonnees;
window.simulerOperationTest = simulerOperationTest;
window.simulerManifeste = simulerManifeste;
window.simulerDeclaration = simulerDeclaration;
window.simulerTransit = simulerTransit;
window.genererRapportSupervision = genererRapportSupervision;
window.testerConnectiviteKit = testerConnectiviteKit;
window.lancerDiagnosticKit = lancerDiagnosticKit;
window.testerNotificationVersKit = testerNotificationVersKit;
window.synchroniserAvecKit = synchroniserAvecKit;
window.showTab = showTab;
window.viderJournal = viderJournal;

// ✅ Nettoyage lors de la fermeture
window.addEventListener('beforeunload', () => {
    if (statusInterval) clearInterval(statusInterval);
    if (refreshInterval) clearInterval(refreshInterval);
    
    console.log('🏛️ [Commission UEMOA] Dashboard fermé - Supervision terminée');
});