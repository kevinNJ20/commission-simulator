# 🏛️ Commission UEMOA - Système Central de Traçabilité

**Supervision Centrale des Workflows Douaniers UEMOA**  
*Ouagadougou, Burkina Faso*

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-22.x-green.svg)](package.json)
[![License](https://img.shields.io/badge/license-OPEN-brightgreen.svg)](LICENSE)

---

## 📋 Vue d'ensemble

La **Commission UEMOA** assure la supervision centralisée des échanges douaniers entre les 8 États membres de l'Union Économique et Monétaire Ouest Africaine.

### 🎯 Rôle selon Rapport PDF

| Étape | Workflow | Description |
|-------|----------|-------------|
| **20** | Libre Pratique (21 étapes) | Notification manifeste depuis Kit MuleSoft |
| **21** | Libre Pratique (21 étapes) | Traçabilité finale workflow complet |
| **16** | Transit (16 étapes) | Traçabilité finale opérations transit |

### 🏗️ Architecture

```
Pays Côtier (ex: Sénégal)
    ↓
Kit MuleSoft d'Interconnexion
    ↓
Pays Hinterland (ex: Mali)
    ↓
🏛️ Commission UEMOA (Supervision Centrale)
```

---

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Lancement

```bash
# Démarrage normal
npm start

# Mode développement
npm run dev

# Avec Vercel CLI
vercel dev
```

Le système démarre sur **http://64.225.5.75:3003**

### URLs principales

- 🏛️ **Dashboard** : http://64.225.5.75:3003
- 🏥 **Health Check** : http://64.225.5.75:3003/api/health
- 📊 **Statistiques** : http://64.225.5.75:3003/api/statistiques
- 📦 **ÉTAPE 20** : http://64.225.5.75:3003/api/tracabilite/manifeste
- 📋 **ÉTAPE 21** : http://64.225.5.75:3003/api/tracabilite/declaration
- 🚛 **ÉTAPE 16** : http://64.225.5.75:3003/api/tracabilite/enregistrer

---

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```
Vérification système et connectivité Kit MuleSoft.

### Traçabilité ÉTAPE 20 (Manifeste)
```bash
POST /api/tracabilite/manifeste

{
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_MAN_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_manifeste": "MAN_SEN_2025_5016",
    "navire": "MARCO POLO",
    "consignataire": "MAERSK LINE SENEGAL",
    "nombre_articles": 3,
    "valeur_approximative": 25000000
  }
}
```

### Traçabilité ÉTAPE 21 (Finalisation)
```bash
POST /api/tracabilite/declaration

{
  "typeOperation": "COMPLETION_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_FINAL_2025_001",
  "paysOrigine": "MLI",
  "paysDestination": "SEN",
  "donneesMetier": {
    "numero_declaration": "DEC_MLI_2025_001",
    "montant_paye": 3500000,
    "workflow_complete": true,
    "etapes_totales": 21
  }
}
```

### Traçabilité ÉTAPE 16 (Transit)
```bash
POST /api/tracabilite/enregistrer

{
  "typeOperation": "COMPLETION_TRANSIT",
  "numeroOperation": "UEMOA_TRANSIT_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_declaration_transit": "TRA_SEN_2025_001",
    "arrivee_confirmee": true,
    "etapes_totales": 16
  }
}
```

---

## 🌍 États Membres UEMOA

### Pays Côtiers (Prime abord)
- 🇸🇳 **Sénégal** - Dakar
- 🇨🇮 **Côte d'Ivoire** - Abidjan
- 🇧🇯 **Bénin** - Cotonou
- 🇹🇬 **Togo** - Lomé
- 🇬🇼 **Guinée-Bissau** - Bissau

### Pays Hinterland (Destination)
- 🇲🇱 **Mali** - Bamako
- 🇧🇫 **Burkina Faso** - Ouagadougou
- 🇳🇪 **Niger** - Niamey

---

## 🧪 Tests

```bash
# Test health check
npm test

# Test ÉTAPE 20
npm run test-etape-20

# Test ÉTAPE 21
npm run test-etape-21

# Test ÉTAPE 16
npm run test-etape-16

# Test Kit MuleSoft
npm run test-kit

# Tous les tests
npm run test-all-etapes
```

---

## 📁 Structure du projet

```
simulateur-commission-uemoa/
├── api/                           # APIs REST Commission
│   ├── health.js                  # Health check
│   ├── statistiques.js            # Stats supervision
│   ├── tracabilite/
│   │   ├── enregistrer.js         # ÉTAPES 20-21-16 (principal)
│   │   ├── manifeste.js           # ÉTAPE 20 (spécialisé)
│   │   └── declaration.js         # ÉTAPE 21 (spécialisé)
│   └── kit/
│       └── test.js                # Tests Kit MuleSoft
├── lib/                           # Librairies
│   ├── database.js                # Base traçabilité
│   ├── analytics.js               # Analytics supervision
│   └── kit-client.js              # Client Kit MuleSoft
├── public/                        # Interface web
│   ├── index.html                 # Dashboard Commission
│   ├── script.js                  # JavaScript
│   └── style.css                  # Styles
├── server.js                      # Serveur HTTP
├── package.json                   # Configuration
└── README.md                      # Documentation
```

---

## ⚙️ Configuration

### Variables d'environnement

```bash
PORT=3003
NODE_ENV=production
KIT_MULESOFT_URL=https://kit-interconnexion-uemoa-v4320.m3jzw3-1.deu-c1.cloudhub.io/api/v1
```

### Kit MuleSoft

Le système communique avec le Kit d'Interconnexion MuleSoft hébergé par chaque pays membre pour recevoir les notifications des étapes 20, 21 et 16.

---

## 📊 Dashboard Commission

Le dashboard web permet de :
- ✅ Visualiser les workflows libre pratique et transit
- ✅ Suivre l'activité des 8 pays membres
- ✅ Consulter les statistiques de supervision
- ✅ Tester la connectivité Kit MuleSoft
- ✅ Générer des rapports de supervision
- ✅ Exporter les données tracées

---

## 🔧 Dépannage

### Erreur: Fichiers API manquants

Vérifier que tous les fichiers suivants existent :
- `api/tracabilite/enregistrer.js`
- `api/tracabilite/manifeste.js`
- `api/tracabilite/declaration.js`
- `lib/database.js`
- `lib/kit-client.js`

### Erreur: Kit MuleSoft inaccessible

1. Vérifier l'URL du Kit dans les variables d'environnement
2. Tester la connectivité : `npm run test-kit`
3. Consulter les logs serveur pour plus de détails

---

## 📚 Documentation complète

Pour plus d'informations sur :
- Les workflows détaillés (21 et 16 étapes)
- L'architecture d'interconnexion
- Les spécifications techniques
- Les exemples de payloads

Consulter la documentation technique du projet.

---

## 👥 Support

**Organisme** : Commission UEMOA  
**Siège** : Ouagadougou, Burkina Faso  
**Rôle** : Supervision Centrale et Traçabilité  
**Version** : 1.0.0-UEMOA-FINAL  
**Runtime** : Node.js 22.x

---

## 📄 Licence

OPEN - Projet de supervision des échanges douaniers UEMOA

---

*Commission UEMOA - Supervision Centrale selon Rapport PDF d'Interconnexion des Systèmes Douaniers*
