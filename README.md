# 🏛️ Commission UEMOA - Système Central de Traçabilité

**Supervision Centrale des Workflows Douaniers UEMOA**  
*Ouagadougou, Burkina Faso*

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-22.x-green.svg)](package.json)

---

## 📋 Vue d'ensemble

La **Commission UEMOA** assure la **supervision centralisée** des échanges douaniers entre les 8 États membres de l'Union Économique et Monétaire Ouest Africaine.

### 🎯 Rôle selon Document d'Interconnexion

La Commission UEMOA intervient à des **étapes finales spécifiques** des workflows douaniers:

| Workflow | Étapes Commission | Description |
|----------|-------------------|-------------|
| **Libre Pratique** (21 étapes) | **20-21** | Notification manifeste + Traçabilité finale |
| **Transit** (16 étapes) | **16** | Traçabilité finale opérations transit |

#### Détail des Étapes Commission

**ÉTAPE 20** - Notification Manifeste  
- Réception notification depuis Kit d'Interconnexion MuleSoft
- Traçabilité de la transmission du manifeste
- Enregistrement données pour supervision

**ÉTAPE 21** - Traçabilité Finale Libre Pratique  
- Confirmation finalisation workflow (21 étapes complètes)
- Enregistrement déclaration et paiement
- Archivage centralisé pour analyses UEMOA

**ÉTAPE 16** - Traçabilité Finale Transit  
- Confirmation opération transit terminée
- Apurement et traçabilité finale
- Supervision corridor commercial

### 🏗️ Architecture d'Interconnexion

```
Pays Côtier (ex: Sénégal - Dakar)
    ↓ Étapes 1-5, 17-19
Kit MuleSoft d'Interconnexion (hébergé localement)
    ↓ Étapes 6-16
Pays Hinterland (ex: Mali - Bamako)
    ↓ Étapes 20-21
🏛️ Commission UEMOA (Supervision Centrale - Ouagadougou)
```

---

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

Créer un fichier `.env` (optionnel):
```bash
PORT=3003
NODE_ENV=production
KIT_MULESOFT_URL=http://64.225.5.75:8086/api/v1
```

### Lancement

```bash
# Production
npm start

# Développement
npm run dev
```

Le système démarre sur **http://localhost:3003**

### 🔐 Authentification

Le système nécessite une authentification. **Comptes de démonstration**:

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| `admin_commission` | `uemoa2025` | Administrateur |
| `superviseur` | `super2025` | Superviseur |
| `analyste` | `analyse2025` | Analyste |
| `operateur` | `oper2025` | Opérateur |

**Page de connexion**: http://localhost:3003/login.html

---

## 📡 Endpoints API Commission

### Authentification
```bash
POST /api/auth/login          # Connexion
POST /api/auth/logout         # Déconnexion
POST /api/auth/verify         # Vérification session
```

### Supervision
```bash
GET /api/health               # État système Commission
GET /api/statistiques         # Stats supervision UEMOA
GET /api/dashboard            # Métriques dashboard
```

### Traçabilité Centrale (Étapes 20-21-16)

**Endpoint Principal**
```bash
POST /api/tracabilite/enregistrer

# Exemple ÉTAPE 20 (Manifeste)
{
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_MAN_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_manifeste": "MAN_SEN_2025_5016",
    "navire": "MARCO POLO",
    "consignataire": "MAERSK LINE SENEGAL",
    "nombre_articles": 3
  }
}
```

**Endpoints Spécialisés**
```bash
POST /api/tracabilite/manifeste      # ÉTAPE 20 (Notifications manifestes)
POST /api/tracabilite/declaration    # ÉTAPE 21 (Finalisations)
GET  /api/tracabilite/lister         # Liste opérations tracées
```

### Kit d'Interconnexion
```bash
GET  /api/kit/test              # Test connectivité Kit MuleSoft
GET  /api/kit/diagnostic        # Diagnostic complet
POST /api/kit/synchroniser      # Synchronisation
```

### Rapports
```bash
GET  /api/rapports/exporter     # Export CSV/JSON
POST /api/rapports/generer      # Génération rapport
```

---

## 🧪 Tests

```bash
# Health check
npm test

# Tests par étape
npm run test-etape-20    # Test ÉTAPE 20 (Manifeste)
npm run test-etape-21    # Test ÉTAPE 21 (Déclaration)
npm run test-etape-16    # Test ÉTAPE 16 (Transit)

# Test Kit MuleSoft
npm run test-kit

# Tous les tests
npm run test-all-etapes
```

---

## 🌍 États Membres UEMOA Surveillés

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

## 📁 Structure du Projet

```
simulateur-commission-uemoa/
├── api/
│   ├── auth/                          # Authentification
│   │   ├── login.js
│   │   ├── logout.js
│   │   └── verify.js
│   ├── health.js                      # Health check
│   ├── statistiques.js                # Stats supervision
│   ├── dashboard.js                   # Dashboard métriques
│   ├── tracabilite/
│   │   ├── enregistrer.js             # ÉTAPES 20-21-16 (principal)
│   │   ├── manifeste.js               # ÉTAPE 20 (spécialisé)
│   │   ├── declaration.js             # ÉTAPE 21 (spécialisé)
│   │   ├── lister.js
│   │   └── rechercher.js
│   ├── kit/
│   │   ├── test.js                    # Tests Kit MuleSoft
│   │   ├── diagnostic.js
│   │   └── synchroniser.js
│   └── rapports/
│       ├── exporter.js
│       └── generer.js
├── lib/
│   ├── database.js                    # Base traçabilité
│   ├── analytics.js                   # Analytics supervision
│   └── kit-client.js                  # Client Kit MuleSoft
├── public/
│   ├── index.html                     # Dashboard Commission
│   ├── login.html                     # Page authentification
│   ├── auth.js                        # Script auth client
│   ├── script.js
│   └── style.css
├── server.js                          # Serveur HTTP
├── package.json
└── README.md
```

---

## 📊 Dashboard Commission

Le dashboard web permet de:
- ✅ Visualiser workflows libre pratique et transit
- ✅ Suivre activité des 8 pays membres
- ✅ Consulter statistiques supervision en temps réel
- ✅ Tester connectivité Kit d'Interconnexion
- ✅ Générer rapports de supervision
- ✅ Exporter données tracées (CSV/JSON)

**Accès**: http://localhost:3003 (authentification requise)

---

## 🔧 Dépannage

### Problème: Fichiers API manquants
Vérifier l'existence des fichiers essentiels:
- `api/tracabilite/enregistrer.js`
- `api/tracabilite/manifeste.js`
- `api/tracabilite/declaration.js`
- `lib/database.js`
- `lib/kit-client.js`

### Problème: Kit MuleSoft inaccessible
1. Vérifier URL Kit dans `.env`
2. Tester: `npm run test-kit`
3. Consulter logs serveur

### Problème: Échec authentification
1. Utiliser comptes démo (voir section Authentification)
2. Vérifier que `api/auth/login.js` existe
3. Effacer localStorage navigateur: `localStorage.clear()`

---

## 📚 Documentation Technique

### Workflows UEMOA

**Libre Pratique (21 étapes)**
- Étapes 1-5: Sénégal (Manifeste)
- Étapes 6-16: Mali (Déclaration, Contrôles, Paiement)
- Étapes 17-19: Sénégal (Autorisation, Apurement)
- **Étapes 20-21: Commission UEMOA (Traçabilité centrale)**

**Transit (16 étapes)**
- Étapes 1-6: Pays départ (Déclaration transit)
- Étapes 7-14: Circulation et arrivée
- Étapes 15-16: **Commission UEMOA (Traçabilité finale)**

### Kit d'Interconnexion MuleSoft

Composant technique déployé dans chaque pays membre:
- Gère échanges entre systèmes douaniers
- Notifie Commission aux étapes 20-21 et 16
- Basé sur plateforme API Management
- Hébergé localement dans chaque SI Douanier

---

## 👥 Support

**Organisme**: Commission UEMOA  
**Siège**: Ouagadougou, Burkina Faso  
**Rôle**: Supervision Centrale Traçabilité  
**Version**: 1.0.0-UEMOA-FINAL  
**Runtime**: Node.js 22.x

---

## 📄 Licence

OPEN - Projet supervision échanges douaniers UEMOA

---

*Commission UEMOA - Système Central de Traçabilité selon Document d'Interconnexion des Systèmes Douaniers*
