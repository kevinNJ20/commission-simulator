# 🏛️ Commission UEMOA - Système Central de Traçabilité

**Supervision Centrale** - Conforme au rapport PDF d'interconnexion des systèmes douaniers UEMOA  
**ÉTAPES 20-21** (Libre Pratique) + **ÉTAPE 16** (Transit) selon Figure 19 et 20

---

## 📋 **Vue d'ensemble**

La **Commission UEMOA** implémente le système central de traçabilité pour la supervision des workflows d'interconnexion des systèmes douaniers selon l'architecture définie dans le rapport PDF. 

### 🎯 **Rôle selon Rapport PDF**

- **Organisme** : Commission de l'Union Économique et Monétaire Ouest Africaine
- **Siège** : Ouagadougou, Burkina Faso  
- **Fonction** : Supervision centralisée et traçabilité finale
- **Architecture** : Sénégal (Pays A) ↔ Kit MuleSoft ↔ Mali (Pays B) ↔ **Commission UEMOA**

---

## 🚀 **Démarrage rapide**

### **1. Lancement local**

```bash
# Option 1: Script npm (recommandé)
npm start

# Option 2: Node.js direct  
node server.js

# Option 3: Mode développement
npm run dev
```

### **2. Avec Vercel (déploiement)**

```bash
# Si Vercel CLI installée
vercel dev

# Sinon, mode local
npm start
```

### **3. URLs disponibles**

- **🏛️ Dashboard Commission** : http://localhost:3003
- **🏥 Health check** : http://localhost:3003/api/health
- **📊 Statistiques supervision** : http://localhost:3003/api/statistiques
- **📦 ÉTAPE 20 (Manifeste)** : http://localhost:3003/api/tracabilite/manifeste
- **📋 ÉTAPE 21 (Déclaration)** : http://localhost:3003/api/tracabilite/declaration
- **🚛 ÉTAPE 16 (Transit)** : http://localhost:3003/api/tracabilite/enregistrer

---

## 🔄 **Workflows Commission UEMOA selon Rapport PDF**

### **📦 Workflow Libre Pratique (21 étapes) - Étapes Commission 20-21**

La Commission UEMOA supervise les **ÉTAPES 20-21** du workflow libre pratique :

#### **ÉTAPE 20 : Notification Commission manifeste**
- ✅ **Source** : Kit MuleSoft d'Interconnexion
- ✅ **Déclencheur** : Transmission manifeste (Étape 5 Sénégal → Mali)
- ✅ **Fonction** : Traçabilité centrale notification manifeste
- ✅ **Endpoint** : `POST /api/tracabilite/manifeste`

#### **ÉTAPE 21 : Traçabilité finale libre pratique**
- ✅ **Source** : Kit MuleSoft après paiement Mali
- ✅ **Déclencheur** : Completion workflow libre pratique (Étape 16 Mali)
- ✅ **Fonction** : Supervision centralisée finale workflow 21 étapes
- ✅ **Endpoint** : `POST /api/tracabilite/declaration`

### **🚛 Workflow Transit (16 étapes) - Étape Commission 16**

- ✅ **ÉTAPE 16** : Traçabilité finale transit
- ✅ **Source** : Kit MuleSoft après confirmation arrivée Mali
- ✅ **Fonction** : Supervision centralisée finale transit
- ✅ **Endpoint** : `POST /api/tracabilite/enregistrer`

---

## 🛠️ **Architecture technique**

### **📁 Structure du projet**

```
simulateur-commission-uemoa/
├── api/                                    # APIs REST Commission
│   ├── health.js                          # Health check Commission
│   ├── statistiques.js                    # Métriques supervision
│   ├── dashboard.js                       # Dashboard données
│   ├── tracabilite/
│   │   ├── enregistrer.js                 # ÉTAPES 20-21 et 16 (principal)
│   │   ├── manifeste.js                   # ÉTAPE 20 spécialisé
│   │   ├── declaration.js                 # ÉTAPE 21 spécialisé
│   │   ├── lister.js                      # Liste opérations
│   │   └── rechercher.js                  # Recherche traçabilité
│   ├── rapports/
│   │   ├── exporter.js                    # Export données Commission
│   │   └── generer.js                     # Génération rapports
│   └── kit/
│       ├── test.js                        # Tests Kit MuleSoft
│       ├── diagnostic.js                  # Diagnostic Kit
│       └── synchroniser.js                # Synchronisation Kit
├── lib/                                    # Librairies Commission
│   ├── database.js                        # Base traçabilité centrale
│   ├── analytics.js                       # Analytics supervision
│   └── kit-client.js                      # Client Kit MuleSoft
├── public/                                 # Interface web Commission
│   ├── index.html                         # Dashboard Commission
│   ├── script.js                          # JavaScript spécialisé
│   └── style.css                          # Styles Commission UEMOA
├── server.js                               # Serveur HTTP Commission
├── package.json                           # Configuration Commission
├── vercel.json                            # Déploiement Vercel
└── README.md                              # Documentation
```

### **⚙️ Configuration technique**

- **Runtime** : Node.js 18.x
- **Port** : 3003 (configurable via PORT)
- **Rôle** : SUPERVISION_CENTRALE_TRACABILITE
- **Format** : UEMOA 2025.1 compatible
- **Kit MuleSoft** : https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io

---

## 📊 **APIs et Services Commission**

### **🏥 Health Check Commission** - `/api/health`

**Méthode** : `GET`  
**Fonction** : État système Commission et connectivité Kit MuleSoft

```json
{
  "service": "Commission UEMOA - Système Central de Traçabilité",
  "status": "UP",
  "commission": {
    "nom": "Commission UEMOA",
    "siege": "Ouagadougou, Burkina Faso",
    "role": "SUPERVISION_CENTRALE_TRACABILITE"
  },
  "workflow": {
    "libre_pratique": {
      "etapes_commission": "20-21"
    },
    "transit": {
      "etapes_commission": "16"
    }
  }
}
```

### **📦 ÉTAPE 20 : Notification Manifeste** - `/api/tracabilite/manifeste`

**Méthode** : `POST`  
**Fonction** : Traçabilité notification manifeste depuis Kit MuleSoft

**Headers requis** :
```http
Content-Type: application/json
X-Source-System: KIT_INTERCONNEXION_MULESOFT
X-Workflow-Step: 20_COMMISSION_MANIFESTE
```

**Payload UEMOA** :
```json
{
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_MAN_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_manifeste": "MAN_SEN_2025_5016",
    "navire": "MARCO POLO",
    "consignataire": "MAERSK LINE SENEGAL",
    "port_debarquement": "Port de Dakar",
    "nombre_articles": 3,
    "valeur_approximative": 25000000
  }
}
```

### **📋 ÉTAPE 21 : Finalisation Libre Pratique** - `/api/tracabilite/declaration`

**Méthode** : `POST`  
**Fonction** : Traçabilité finale workflow libre pratique (21 étapes)

**Payload** :
```json
{
  "typeOperation": "COMPLETION_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_FINAL_2025_001",
  "paysOrigine": "MLI",
  "paysDestination": "SEN",
  "donneesMetier": {
    "numero_declaration": "DEC_MLI_2025_001",
    "manifeste_origine": "MAN_SEN_2025_5016",
    "montant_paye": 3500000,
    "workflow_complete": true,
    "etapes_totales": 21
  }
}
```

### **🚛 ÉTAPE 16 : Traçabilité Transit** - `/api/tracabilite/enregistrer`

**Méthode** : `POST`  
**Fonction** : Traçabilité finale transit (16 étapes)

**Payload** :
```json
{
  "typeOperation": "COMPLETION_TRANSIT",
  "numeroOperation": "UEMOA_TRANSIT_2025_001",
  "paysOrigine": "SEN", 
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_declaration_transit": "TRA_SEN_2025_001",
    "transporteur": "TRANSPORT SAHEL",
    "arrivee_confirmee": true,
    "etapes_totales": 16
  }
}
```

### **📊 Statistiques Supervision** - `/api/statistiques`

**Méthode** : `GET`  
**Fonction** : Métriques supervision centralisée

```json
{
  "global": {
    "operationsTotal": 42,
    "workflowsLibrePratique": 28,
    "workflowsTransit": 14,
    "paysConnectes": 3
  },
  "commission": {
    "nom": "Commission UEMOA",
    "siege": "Ouagadougou, Burkina Faso"
  }
}
```

---

## 🗄️ **Base de données Commission**

### **Modèle traçabilité centralisée**

```javascript
// Structure opérations Commission
const operationCommission = {
  id: "COMM_2025_001",
  typeOperation: "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  numeroOperation: "UEMOA_MAN_2025_001",
  
  // Étape workflow Commission
  etapeWorkflow: "20", // 20, 21, ou 16
  
  // Pays UEMOA
  paysOrigine: "SEN", // Sénégal
  paysDestination: "MLI", // Mali
  
  // Commission UEMOA
  commission: {
    siege: "Ouagadougou, Burkina Faso",
    fonction: "TRACABILITE_CENTRALE_UEMOA",
    dateReception: Date
  },
  
  // Source
  source: "KIT_INTERCONNEXION_MULESOFT",
  statut: "TRACE_COMMISSION",
  dateEnregistrement: Date
};
```

### **États supervision Commission**

| Statut | Étapes | Description |
|--------|--------|-------------|
| `MANIFESTE_TRACE_ETAPE_20` | 20 | Notification manifeste tracée |
| `LIBRE_PRATIQUE_FINALISE_ETAPE_21` | 21 | Workflow 21 étapes terminé |
| `TRANSIT_FINALISE_ETAPE_16` | 16 | Workflow 16 étapes terminé |
| `SUPERVISION_COMPLETE` | Toutes | Traçabilité Commission OK |

---

## 🌍 **États membres UEMOA surveillés**

### **Pays Côtiers (Prime abord)**
- 🇸🇳 **SEN** : Sénégal (Dakar) - Port de Dakar
- 🇨🇮 **CIV** : Côte d'Ivoire (Abidjan) - Port d'Abidjan  
- 🇧🇯 **BEN** : Bénin (Cotonou) - Port de Cotonou
- 🇹🇬 **TGO** : Togo (Lomé) - Port de Lomé
- 🇬🇼 **GNB** : Guinée-Bissau (Bissau) - Port de Bissau

### **Pays Hinterland (Destination)**
- 🇲🇱 **MLI** : Mali (Bamako) - Destination
- 🇧🇫 **BFA** : Burkina Faso (Ouagadougou) - Destination
- 🇳🇪 **NER** : Niger (Niamey) - Destination

---

## 🎨 **Interface Commission UEMOA**

### **🖥️ Dashboard supervision spécialisé** - `public/index.html`

**Fonctionnalités spécifiques Commission** :
- ✅ **Métriques supervision** : Workflows libre pratique et transit
- ✅ **Onglets spécialisés** : ÉTAPE 20, ÉTAPE 21, ÉTAPE 16
- ✅ **Pays UEMOA** : Suivi activité 8 États membres
- ✅ **Tests Kit MuleSoft** : Connectivité et diagnostic
- ✅ **Journal supervision** : Logs traçabilité centralisée
- ✅ **Graphiques** : Répartition par étape workflow
- ✅ **Export Commission** : Données supervision

---

## 🔧 **Kit MuleSoft Integration**

### **Communication Commission ↔ Kit**

```javascript
// Configuration Commission vers Kit
const KitClientCommission = {
  baseURL: 'https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api/v1',
  role: 'SUPERVISION_CENTRALE_TRACABILITE',
  headers: {
    'X-Source-System': 'COMMISSION_UEMOA_SUPERVISION',
    'X-Commission-Role': 'TRACABILITE_CENTRALE'
  }
};
```

### **Réception notifications Kit**

Le Kit MuleSoft notifie la Commission aux étapes :
- **ÉTAPE 20** : Après transmission manifeste Sénégal → Mali
- **ÉTAPE 21** : Après finalisation paiement Mali → Sénégal
- **ÉTAPE 16** : Après confirmation arrivée transit Mali

---

## 🧪 **Tests et Validation Commission**

### **Tests automatiques**

```bash
# Test health check Commission
curl http://localhost:3003/api/health

# Test ÉTAPE 20 - Notification manifeste
npm run test-etape-20

# Test ÉTAPE 21 - Finalisation libre pratique  
npm run test-etape-21

# Test ÉTAPE 16 - Transit
npm run test-etape-16

# Test connectivité Kit MuleSoft
npm run test-kit

# Tous les tests
npm run test-all-etapes
```

### **Validation workflows Commission**

1. **ÉTAPE 20** : Notification manifeste → Vérifier traçabilité Commission
2. **ÉTAPE 21** : Finalisation libre pratique → Vérifier supervision
3. **ÉTAPE 16** : Transit → Vérifier enregistrement Commission
4. **Intégration** : Workflow complet avec Kit MuleSoft

---

## 📈 **Monitoring et Observabilité**

### **Métriques Commission disponibles**

- **Volume** : Opérations tracées par type d'étape
- **Workflows** : Libre pratique vs Transit
- **Pays** : Activité par État membre UEMOA
- **Performance** : Temps traitement supervision
- **Kit** : Connectivité Kit MuleSoft

### **Logs structurés Commission**

```javascript
// Exemples logs supervision Commission
console.log('🏛️ [Commission] ÉTAPE 20: Notification manifeste tracée');
console.log('🏛️ [Commission] ÉTAPE 21: Workflow libre pratique finalisé');
console.log('🏛️ [Commission] ÉTAPE 16: Transit tracé avec succès');
console.log('📊 [Commission] Supervision centralisée activée');
```

---

## 🚀 **Déploiement Commission**

### **Variables d'environnement**

```env
# Configuration Commission
PORT=3003
NODE_ENV=production

# Kit MuleSoft
KIT_MULESOFT_URL=https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api/v1

# Commission UEMOA
ORGANISME_CODE=UEMOA
ORGANISME_NOM=Commission UEMOA
SIEGE=Ouagadougou, Burkina Faso
ROLE=SUPERVISION_CENTRALE_TRACABILITE
```

### **Scripts npm Commission**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "test": "curl http://localhost:3003/api/health",
    "test-etape-20": "Test notification manifeste ÉTAPE 20",
    "test-etape-21": "Test finalisation libre pratique ÉTAPE 21", 
    "test-etape-16": "Test traçabilité transit ÉTAPE 16"
  }
}
```

---

## 🔒 **Sécurité et Authentification Commission**

### **Headers spécifiques Commission**

```http
X-Source-System: COMMISSION_UEMOA_SUPERVISION
X-Commission-Role: TRACABILITE_CENTRALE
X-Workflow-Step: 20_COMMISSION_MANIFESTE
X-Kit-Source: KIT_INTERCONNEXION_MULESOFT
```

---

## 📚 **Conformité Rapport PDF**

### **Architecture conforme Figure 19 et 20**

- ✅ **ÉTAPE 20** : "Transmission des informations à la commission de l'UEMOA"
- ✅ **ÉTAPE 21** : Traçabilité finale libre pratique  
- ✅ **ÉTAPE 16** : "Transmission des informations à la commission de l'UEMOA grâce à l'exécution de batchs périodiques"
- ✅ **Supervision centralisée** : Ouagadougou, Burkina Faso
- ✅ **8 États membres** : Côtiers + Hinterland

### **Standards supportés**

- ✅ **Format UEMOA 2025.1** : Compatible Kit MuleSoft
- ✅ **Codes pays UEMOA** : SEN, MLI, BFA, CIV, BEN, TGO, NER, GNB
- ✅ **Workflow Commission** : Conforme rapport PDF
- ✅ **API REST** : Intégration Kit d'Interconnexion

---

## 👥 **Équipe et Support**

**Développé par** : Cabinet Jasmine Conseil  
**Conformité** : Rapport PDF UEMOA - Interconnexion SI Douaniers  
**Version** : 1.0.0-UEMOA-FINAL  
**Format** : UEMOA 2025.1  
**Runtime** : Node.js 18.x  

**Contact** : Commission UEMOA - Ouagadougou, Burkina Faso  
**Support** : Interface supervision avec diagnostic intégré

---

## 📊 **Écosystème complet selon Rapport PDF**

1. **🇸🇳 Sénégal** (Pays A) - Prime abord côtier  
2. **🔗 Kit MuleSoft** - Interconnexion décentralisée
3. **🇲🇱 Mali** (Pays B) - Destination hinterland
4. **🏛️ Commission UEMOA** (ce projet) - Supervision centrale

---

*Commission UEMOA - Ouagadougou, Burkina Faso - Supervision Centrale selon Rapport PDF*