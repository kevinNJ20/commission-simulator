# 🏛️ Commission UEMOA - Système Central de Traçabilité

**Supervision Centralisée des Workflows Douaniers UEMOA**  
*Ouagadougou, Burkina Faso*

[![Version](https://img.shields.io/badge/version-1.0.0--UEMOA-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-22.x-green.svg)](package.json)
[![License](https://img.shields.io/badge/license-OPEN-brightgreen.svg)](LICENSE)

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Services & Endpoints](#-services--endpoints)
- [Structures de Données](#-structures-de-données)
- [Workflows](#-workflows)
- [Installation & Démarrage](#-installation--démarrage)
- [Tests](#-tests)
- [Déploiement](#-déploiement)

---

## 🎯 Vue d'ensemble

### Rôle Commission UEMOA

La Commission UEMOA assure la **supervision centralisée et la traçabilité finale** des workflows douaniers entre les 8 États membres. Elle intervient aux dernières étapes critiques :

| Workflow | Étapes Commission | Responsabilité |
|----------|-------------------|----------------|
| **Libre Pratique** | **20-21** (sur 21 étapes) | Notification manifeste + Traçabilité finale |
| **Transit** | **16** (sur 16 étapes) | Confirmation retour + Traçabilité finale |

### États Membres Surveillés

**Pays Côtiers (Prime Abord)** : 🇸🇳 Sénégal • 🇨🇮 Côte d'Ivoire • 🇧🇯 Bénin • 🇹🇬 Togo • 🇬🇼 Guinée-Bissau

**Pays Hinterland (Destination)** : 🇲🇱 Mali • 🇧🇫 Burkina Faso • 🇳🇪 Niger

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMISSION UEMOA                              │
│              Ouagadougou, Burkina Faso                          │
│                   (Port 3003 / 3445)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐      │
│  │   API REST   │  │  Base de     │  │   Analytics     │      │
│  │   Endpoints  │──│  Traçabilité │──│   Supervision   │      │
│  └──────┬───────┘  └──────────────┘  └─────────────────┘      │
│         │                                                        │
│         │ HTTP/HTTPS                                            │
└─────────┼────────────────────────────────────────────────────────┘
          │
          │ Notifications Workflows
          │
┌─────────▼────────────────────────────────────────────────────────┐
│              KIT D'INTERCONNEXION MULESOFT                        │
│         (Hébergé dans chaque pays membre)                        │
│         https://kit-interconnexion-uemoa.cloudhub.io             │
└──────────┬────────────────────────────────────┬──────────────────┘
           │                                     │
    ┌──────▼──────┐                      ┌──────▼──────┐
    │  SÉNÉGAL    │                      │    MALI     │
    │  (Dakar)    │ ◄─── Transit ───►    │  (Bamako)   │
    │  Port 3001  │                      │  Port 3002  │
    └─────────────┘                      └─────────────┘
```

### Composants Principaux

#### 1. **Serveur Node.js** (`server.js`)
- Serveur HTTP/HTTPS dual-mode
- Routage API REST
- Serveur de fichiers statiques
- Support CORS pour intégration

#### 2. **Base de Données** (`lib/database.js`)
- Stockage en mémoire (Map/Set JavaScript)
- Traçabilité centralisée des opérations
- Statistiques temps réel
- Gestion des corridors commerciaux

#### 3. **Analytics** (`lib/analytics.js`)
- Métriques de supervision avancées
- Calcul de tendances UEMOA
- Système d'alertes intelligent
- Monitoring des performances

#### 4. **Client Kit MuleSoft** (`lib/kit-client.js`)
- Communication avec le Kit d'Interconnexion
- Gestion des retries automatiques
- Diagnostics de connectivité
- Synchronisation bidirectionnelle

---

## 📡 Services & Endpoints

### 🔐 Authentification

```javascript
POST /api/auth/login
// Connexion utilisateur Commission
{
  "username": "admin_commission",
  "password": "uemoa2025"
}

POST /api/auth/logout
// Déconnexion

GET /api/auth/verify
// Vérification session active
```

**Comptes disponibles** :
- `admin_commission` / `uemoa2025` (Administrateur)
- `superviseur` / `super2025` (Superviseur)
- `analyste` / `analyse2025` (Analyste)
- `operateur` / `oper2025` (Opérateur)

### 📊 Traçabilité (ÉTAPES 20-21-16)

```javascript
POST /api/tracabilite/enregistrer
// Endpoint principal - Reçoit toutes les notifications
// du Kit MuleSoft pour les étapes Commission
{
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "numeroOperation": "UEMOA_MAN_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_manifeste": "MAN_SEN_2025_5016",
    "navire": "MARCO POLO",
    "consignataire": "MAERSK LINE",
    "nombre_articles": 3,
    "valeur_approximative": 25000000
  }
}

GET /api/tracabilite/enregistrer?limite=50
// Liste les opérations tracées
```

### 📦 Manifestes - ÉTAPE 20

```javascript
POST /api/tracabilite/manifeste
// Endpoint spécialisé pour notifications manifestes
{
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "numeroOperation": "MAN_2025_001",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "donneesMetier": {
    "numero_manifeste": "MAN123",
    "navire": "VESSEL_NAME",
    "consignataire": "COMPANY",
    "port_debarquement": "Port de Dakar"
  }
}

GET /api/tracabilite/manifeste?limite=30
// Liste les manifestes tracés (ÉTAPE 20)
```

### 📋 Déclarations - ÉTAPE 21

```javascript
POST /api/tracabilite/declaration
// Endpoint spécialisé pour finalisations workflow
{
  "typeOperation": "COMPLETION_LIBRE_PRATIQUE",
  "numeroOperation": "DEC_2025_001",
  "paysOrigine": "MLI",
  "paysDestination": "SEN",
  "donneesMetier": {
    "numero_declaration": "DEC_MLI_001",
    "montant_paye": 3500000,
    "reference_paiement": "PAY_001",
    "workflow_complete": true
  }
}

GET /api/tracabilite/declaration?limite=30
// Liste les déclarations finalisées (ÉTAPE 21)
```

### 🔧 Kit d'Interconnexion

```javascript
GET /api/kit/test?type=health
// Test connectivité Kit MuleSoft

GET /api/kit/diagnostic
// Diagnostic complet (5 tests)

POST /api/kit/synchroniser
// Synchronisation Commission ↔ Kit
```

### 📈 Statistiques & Rapports

```javascript
GET /api/statistiques
// Statistiques globales et par pays

GET /api/dashboard
// Données dashboard en temps réel

GET /api/rapports/exporter?format=csv
// Export CSV des données Commission
```

### 🏥 Monitoring

```javascript
GET /api/health
// État du système central
```

---

## 📦 Structures de Données

### Opération de Traçabilité

```javascript
{
  "id": "uuid-v4",
  "numeroOperation": "UEMOA_MAN_2025_001",
  "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
  "paysOrigine": "SEN",
  "paysDestination": "MLI",
  "etapeWorkflow": "20", // ou "21" ou "16"
  "dateEnregistrement": "2025-10-27T14:30:00.000Z",
  "statut": "TRACE_COMMISSION",
  "source": "KIT_INTERCONNEXION_MULESOFT",
  
  "donneesMetier": {
    // Spécifique au type d'opération
    "numero_manifeste": "MAN_SEN_2025_5016",
    "navire": "MARCO POLO",
    // ... autres champs métier
  },
  
  "commission": {
    "siege": "Ouagadougou, Burkina Faso",
    "dateReception": "2025-10-27T14:30:00.000Z",
    "fonction": "TRACABILITE_CENTRALE_UEMOA"
  }
}
```

### Statistiques Globales

```javascript
{
  "operationsTotal": 150,
  "operationsAujourdhui": 12,
  "paysConnectes": 6,
  "corridorsActifs": 8,
  "workflowsLibrePratique": 95,
  "workflowsTransit": 55,
  "derniereMiseAJour": "2025-10-27T14:30:00.000Z"
}
```

### Corridor Commercial

```javascript
{
  "id": "SEN-MLI",
  "origine": "SEN",
  "destination": "MLI",
  "nomOrigine": "Sénégal",
  "nomDestination": "Mali",
  "nombreOperations": 45,
  "workflowsLibrePratique": 30,
  "workflowsTransit": 15,
  "volumeEstime": 125000000, // FCFA
  "premiereOperation": "2025-01-15T10:00:00.000Z",
  "derniereOperation": "2025-10-27T14:30:00.000Z"
}
```

---

## 🔄 Workflows

### Workflow Libre Pratique (21 étapes)

```
SÉNÉGAL (Pays côtier)              MALI (Pays hinterland)
Port de Dakar                       Bamako
     │                                    │
     ├──► ÉTAPE 1-5                      │
     │    Création manifeste             │
     │    Transmission Kit ───────────►  │
     │                                    ├──► ÉTAPE 6-16
     │                                    │    Réception manifeste
     │                                    │    Déclaration GUCE
     │                                    │    Contrôles & Paiement
     │                                    │    Transmission Kit ◄────┐
     │                                    │                           │
     ├──► ÉTAPE 17-19                    │                           │
     │    Réception autorisation ◄───────┘                           │
     │    Apurement & Levée                                          │
     │    Notification Commission ──────────────────────────────┐    │
     │                                                           │    │
     ▼                                                           ▼    │
┌────────────────────────────────────────────────────────────────────┘
│  COMMISSION UEMOA (Ouagadougou)
│  
│  ÉTAPE 20: Notification manifeste reçue
│            ├─ Enregistrement traçabilité centrale
│            └─ Mise à jour statistiques
│  
│  ÉTAPE 21: Finalisation workflow (confirmation paiement Mali)
│            ├─ Workflow 21 étapes complet
│            ├─ Traçabilité finale
│            └─ Archivage supervision
└────────────────────────────────────────────────────────────────────
```

### Workflow Transit (16 étapes)

```
SÉNÉGAL (Départ)                   MALI (Arrivée)
Port de Dakar                       Bamako
     │                                    │
     ├──► ÉTAPE 1-6                      │
     │    Création transit                │
     │    Transmission Kit ───────────►   │
     │                                    ├──► ÉTAPE 11-14
     │                                    │    Réception & Arrivée
     │                                    │    Notification Kit ◄────┐
     │                                    │                           │
     ├──► ÉTAPE 15                       │                           │
     │    Apurement ◄─────────────────────┘                          │
     │    Notification Commission ───────────────────────────────┐   │
     ▼                                                            │   │
┌─────────────────────────────────────────────────────────────────────┘
│  COMMISSION UEMOA (Ouagadougou)
│  
│  ÉTAPE 16: Traçabilité finale transit
│            ├─ Confirmation retour marchandises
│            ├─ Workflow 16 étapes complet
│            └─ Archivage supervision
└─────────────────────────────────────────────────────────────────────
```

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 22.x ou supérieur
- NPM ou Yarn

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd simulateur-commission-uemoa

# Installer les dépendances
npm install
```

### Configuration

Créer un fichier `.env` :

```env
PORT=3003
NODE_ENV=production
KIT_MULESOFT_URL=http://64.225.5.75:8086/api/v1
```

### Démarrage

```bash
# Mode développement
npm start

# Ou directement avec Node
node server.js
```

Le système démarre sur **http://localhost:3003**

### Connexion

1. Accéder à **http://localhost:3003/login.html**
2. Se connecter avec un compte (ex: `admin_commission` / `uemoa2025`)
3. Accéder au dashboard de supervision

---

## 🧪 Tests

### Tests Disponibles

```bash
# Health check système
npm test

# Test ÉTAPE 20 (Manifeste)
npm run test-etape-20

# Test ÉTAPE 21 (Déclaration)
npm run test-etape-21

# Test ÉTAPE 16 (Transit)
npm run test-etape-16

# Test connectivité Kit MuleSoft
npm run test-kit

# Tous les tests
npm run test-all-etapes
```

### Exemple Test Manuel

```bash
# Test ÉTAPE 20 - Notification manifeste
curl -X POST http://localhost:3003/api/tracabilite/manifeste \
  -H "Content-Type: application/json" \
  -d '{
    "typeOperation": "TRANSMISSION_MANIFESTE_LIBRE_PRATIQUE",
    "numeroOperation": "TEST_MAN_001",
    "paysOrigine": "SEN",
    "paysDestination": "MLI",
    "donneesMetier": {
      "numero_manifeste": "MAN_TEST_001",
      "navire": "TEST VESSEL",
      "consignataire": "TEST COMPANY"
    }
  }'
```

---

## 📦 Déploiement

### Vercel

```bash
# Installation CLI Vercel
npm i -g vercel

# Connexion
vercel login

# Déploiement
vercel --prod
```

### Variables d'Environnement Vercel

Dans le dashboard Vercel, configurer :

- `PORT` : 3003
- `NODE_ENV` : production
- `KIT_MULESOFT_URL` : <url-kit-mulesoft>

### Docker (Optionnel)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3003
CMD ["node", "server.js"]
```

---

## 🔧 Architecture Technique

### Technologies

- **Runtime** : Node.js 22.x
- **Framework** : Express-like custom (natif HTTP)
- **Base de données** : In-memory (Map/Set)
- **Client HTTP** : Axios
- **Frontend** : Vanilla JS + Chart.js
- **CSS** : Custom (gradients UEMOA)

### Sécurité

- ✅ Authentification JWT (12h expiration)
- ✅ Vérification session à chaque requête
- ✅ CORS configuré pour intégration
- ✅ Headers sécurisés
- ✅ Support HTTPS (certificats auto-signés inclus)

### Performance

- ⚡ Base en mémoire (milliseconde access)
- ⚡ Cache navigateur optimisé
- ⚡ Refresh automatique 20s
- ⚡ Pagination des listes
- ⚡ Compression activée

---

## 📚 Documentation Complémentaire

### Fichiers Importants

```
simulateur-commission-uemoa/
├── api/
│   ├── auth/               # Authentification
│   ├── tracabilite/        # ⭐ Endpoints ÉTAPES 20-21-16
│   ├── kit/                # Communication Kit MuleSoft
│   └── rapports/           # Exports & Rapports
├── lib/
│   ├── database.js         # ⭐ Base traçabilité centrale
│   ├── analytics.js        # ⭐ Analytics supervision
│   └── kit-client.js       # ⭐ Client Kit MuleSoft
├── public/
│   ├── index.html          # Dashboard Commission
│   ├── login.html          # Page connexion
│   ├── style.css           # Styles UEMOA
│   └── auth.js             # Client auth
└── server.js               # ⭐ Serveur principal
```

### Logs & Monitoring

Le système génère des logs détaillés :

```
🏛️ [Commission UEMOA] Opération tracée: UEMOA_MAN_2025_001
📊 [Commission] ÉTAPE 20 - Manifeste: SEN → MLI
✅ [Commission] Workflow Libre Pratique (21 étapes) terminé
```

---

## 🆘 Support & Dépannage

### Problèmes Courants

**Port 3003 occupé**
```bash
# Linux/Mac
lsof -ti:3003 | xargs kill -9

# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F
```

**Kit MuleSoft inaccessible**
```bash
# Test manuel
curl http://64.225.5.75:8086/api/v1/health

# Depuis l'interface
Aller dans "Tests Kit d'Interconnexion" → "Test Kit"
```

**Erreur authentification**
```javascript
// Nettoyer le cache navigateur
localStorage.clear()
```

---

## 👥 Contributeurs

**Développement** : Jasmine Conseil  
**Commanditaire** : Commission UEMOA  
**Siège** : Ouagadougou, Burkina Faso

---

## 📄 Licence

**OPEN** - Projet de supervision des échanges douaniers UEMOA

---

## 🔗 Liens Utiles

- **Commission UEMOA** : https://www.uemoa.int
- **Kit MuleSoft** : https://kit-interconnexion-uemoa.cloudhub.io
- **Documentation MuleSoft** : https://docs.mulesoft.com

---

**Commission UEMOA - Système Central de Traçabilité**  
*Version 1.0.0-UEMOA-FINAL*  
*Dernière mise à jour : Octobre 2025*
