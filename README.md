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
  - [Prise en Main Rapide](#-prise-en-main-rapide)
  - [Démarrage en HTTP](#-démarrage-en-http-mode-développement)
  - [Démarrage en HTTPS](#-démarrage-en-https-mode-production)
  - [Déploiement sur Serveur](#-déploiement-sur-serveur-digitalocean-etc)
- [Tests](#-tests)
- [Comprendre l'Application](#-comprendre-lapplication)
- [Déploiement](#-déploiement)
- [Support & Dépannage](#-support--dépannage)

---

## ⚡ Démarrage Rapide (TL;DR)

**Vous voulez démarrer l'application maintenant ?**

```bash
# 1. Cloner le projet
git clone <repository-url>
cd commission-simulator

# 2. Installer les dépendances
npm install

# 3a. Lancer en HTTP (recommandé pour débuter)
npm run dev
# Puis accéder à http://localhost:3003

# 3b. OU lancer en HTTPS (après génération des certificats)
# Générer les certificats SSL automatiquement :
./generate-ssl.sh        # Linux/Mac
# ou
generate-ssl.bat         # Windows
# Puis lancer :
npm start
# Puis accéder à https://localhost:3445
```

**Compte de test :** `admin_commission` / `uemoa2025`

Pour plus de détails, consultez les sections [Installation & Démarrage](#-installation--démarrage) et [Tests](#-tests).

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

### ⚡ Prise en Main Rapide

**Vous voulez tester rapidement ? Suivez ces 3 étapes :**

```bash
# 1. Cloner le projet
git clone <repository-url>
cd commission-simulator

# 2. Installer les dépendances
npm install

# 3. Lancer en mode HTTP (développement)
npm run dev
# ou
npm start
```

L'application sera accessible sur **http://localhost:3003**

### 📋 Prérequis

- **Node.js 22.x** ou supérieur ([Télécharger Node.js](https://nodejs.org/))
- **NPM** (inclus avec Node.js)
- **Git** (pour cloner le repository)
- **OpenSSL** (pour générer les certificats SSL en HTTPS - optionnel)

**Vérifier votre installation :**
```bash
node --version  # Doit afficher v22.x ou supérieur
npm --version   # Doit afficher 9.x ou supérieur
git --version   # Doit afficher la version Git
```

### 📦 Installation Complète

#### Sur votre Machine Locale

```bash
# 1. Cloner le repository
git clone <repository-url>
cd commission-simulator

# 2. Installer les dépendances
npm install
```

#### Sur un Serveur (DigitalOcean, AWS, etc.)

```bash
# Se connecter au serveur via SSH
ssh root@64.225.5.75  # Remplacez par votre adresse IP

# Cloner le projet
git clone <repository-url>
cd commission-simulator

# Installer les dépendances
npm install
```

### ⚙️ Configuration

#### Variables d'Environnement (Optionnel)

Vous pouvez créer un fichier `.env` à la racine du projet pour personnaliser la configuration :

```env
# Ports du serveur
HTTP_PORT=3003
HTTPS_PORT=3445

# Environnement
NODE_ENV=development

# URL du Kit MuleSoft d'Interconnexion
KIT_MULESOFT_URL=http://64.225.5.75:8086/api/v1

# Configuration HTTPS
USE_HTTPS=false                    # true pour forcer HTTPS même sans certificats
REDIRECT_TO_HTTPS=false           # true pour rediriger automatiquement HTTP → HTTPS
```

**Note :** Les variables d'environnement sont optionnelles. Le serveur utilise des valeurs par défaut si elles ne sont pas définies.

---

## 🌐 Démarrage en HTTP (Mode Développement)

### 🚀 Démarrage Rapide HTTP

```bash
# Méthode 1: Utiliser npm
npm run dev
# ou
npm start

# Méthode 2: Utiliser Node directement
node server.js
```

**Résultat attendu :**
```
🏛️ Démarrage Commission UEMOA - Ouagadougou, Burkina Faso...
🏛️ ============================================================
🏛️ Commission UEMOA - Système Central de Traçabilité DÉMARRÉ
📍 Siège: Ouagadougou, Burkina Faso
🌍 HTTP: http://0.0.0.0:3003
📊 Dashboard HTTP: http://localhost:3003
```

### 🔗 Accéder à l'Application en HTTP

1. **Dashboard de Supervision :**
   - URL : `http://localhost:3003`
   - URL distante : `http://64.225.5.75:3003` (si déployé sur un serveur)

2. **Page de Connexion :**
   - URL : `http://localhost:3003/login.html`

3. **API Health Check :**
   - URL : `http://localhost:3003/api/health`

### 👤 Comptes de Test

Une fois l'application lancée, connectez-vous avec un des comptes suivants :

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| **Administrateur** | `admin_commission` | `uemoa2025` |
| **Superviseur** | `superviseur` | `super2025` |
| **Analyste** | `analyste` | `analyse2025` |
| **Opérateur** | `operateur` | `oper2025` |

---

## 🔐 Démarrage en HTTPS (Mode Production)

### 📜 Génération des Certificats SSL

Pour activer HTTPS, vous devez d'abord générer les certificats SSL auto-signés.

#### Méthode 1 : Script Automatique (Recommandée)

Des scripts sont fournis pour automatiser la génération des certificats :

**Linux/Mac :**
```bash
# Rendre le script exécutable
chmod +x generate-ssl.sh

# Exécuter le script
./generate-ssl.sh
```

**Windows :**
```cmd
# Double-cliquer sur generate-ssl.bat
# Ou depuis l'invite de commande :
generate-ssl.bat
```

**Fonctionnalités des scripts :**
- ✅ Vérifie que OpenSSL est installé
- ✅ Sauvegarde les anciens certificats s'ils existent
- ✅ Génère automatiquement `key.pem` et `cert.pem`
- ✅ Configure les permissions correctement (Linux/Mac uniquement)
- ✅ Affiche un résumé des fichiers créés

**Note :** Sur Windows, vous pouvez aussi utiliser Git Bash, WSL, ou PowerShell avec OpenSSL installé.

#### Méthode 2 : Génération Manuelle

Si vous préférez générer les certificats manuellement :

```bash
# Se placer dans le dossier ssl-certs
cd ssl-certs

# Générer la clé privée (4096 bits)
openssl genrsa -out key.pem 4096

# Générer le certificat auto-signé (valide 365 jours)
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf

# Définir les permissions (Linux/Mac)
chmod 600 key.pem
chmod 644 cert.pem

# Vérifier que les fichiers sont créés
ls -la key.pem cert.pem

# Retourner à la racine du projet
cd ..
```

**Note :** Le fichier `ssl-certs/openssl.cnf` est déjà configuré pour l'IP `64.225.5.75` et `localhost`. Pour changer l'IP, modifiez le fichier `ssl-certs/openssl.cnf` avant de générer les certificats.

#### Méthode 3 : Génération avec IP/domaine Personnalisé

Si vous voulez utiliser une autre IP ou un nom de domaine :

```bash
cd ssl-certs

# 1. Modifier openssl.cnf et changer :
#    - CN = VOTRE_IP_OU_DOMAINE
#    - IP.1 = VOTRE_IP (si IP)
#    - DNS.1 = VOTRE_DOMAINE (si domaine)

# 2. Puis générer :
openssl genrsa -out key.pem 4096
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
chmod 600 key.pem
chmod 644 cert.pem

cd ..
```

#### Vérification des Certificats

Après génération, vérifiez que tout est correct :

```bash
# Voir les informations du certificat
openssl x509 -in ssl-certs/cert.pem -text -noout

# Vérifier la validité du certificat
openssl x509 -in ssl-certs/cert.pem -noout -dates
```

### 🚀 Démarrage en HTTPS

Une fois les certificats générés (`ssl-certs/key.pem` et `ssl-certs/cert.pem`), le serveur détecte automatiquement HTTPS :

```bash
# Le serveur démarre en HTTP ET HTTPS automatiquement
npm start
# ou
node server.js
```

**Résultat attendu :**
```
🏛️ Démarrage Commission UEMOA - Ouagadougou, Burkina Faso...
🔐 Mode HTTPS activé
🔐 Certificats SSL chargés avec succès
🏛️ ============================================================
🏛️ Commission UEMOA - Système Central de Traçabilité DÉMARRÉ
🌍 HTTP: http://0.0.0.0:3003
📊 Dashboard HTTP: http://localhost:3003
🔐 ============================================================
🔐 Serveur HTTPS Commission UEMOA prêt sur le port 3445
🌍 HTTPS: https://0.0.0.0:3445
📊 Dashboard HTTPS: https://localhost:3445
```

### 🔗 Accéder à l'Application en HTTPS

1. **Dashboard HTTPS :**
   - URL : `https://localhost:3445`
   - URL distante : `https://64.225.5.75:3445`

2. **Page de Connexion HTTPS :**
   - URL : `https://localhost:3445/login.html`

3. **API Health Check HTTPS :**
   - URL : `https://localhost:3445/api/health`

### ⚠️ Avertissement de Sécurité du Navigateur

Avec des certificats auto-signés, votre navigateur affichera un avertissement de sécurité. C'est normal et attendu.

**Pour accéder au site :**

- **Chrome/Edge :**
  1. Cliquez sur "Avancé" ou "Advanced"
  2. Cliquez sur "Continuer vers le site" ou "Proceed to localhost (unsafe)"

- **Firefox :**
  1. Cliquez sur "Avancé" ou "Advanced"
  2. Cliquez sur "Accepter le risque et continuer" ou "Accept the Risk and Continue"

- **Safari :**
  1. Cliquez sur "Afficher les détails" ou "Show Details"
  2. Cliquez sur "Visiter ce site web" ou "Visit this website"

**Note :** Les certificats auto-signés sont parfaits pour le développement et les tests. Pour la production, utilisez des certificats Let's Encrypt (gratuits) ou des certificats émis par une autorité de certification.

### 🔀 Redirection HTTP → HTTPS (Optionnel)

Pour forcer la redirection de toutes les requêtes HTTP vers HTTPS :

```bash
# Définir la variable d'environnement
export REDIRECT_TO_HTTPS=true

# Puis démarrer le serveur
npm start
```

Ou créer/modifier le fichier `.env` :
```env
REDIRECT_TO_HTTPS=true
```

**Comportement :** Toutes les requêtes sur `http://localhost:3003` seront automatiquement redirigées vers `https://localhost:3445`.

---

## 🖥️ Déploiement sur Serveur (DigitalOcean, etc.)

### 📋 Étapes de Déploiement

#### 1. Connexion au Serveur

```bash
ssh root@64.225.5.75  # Remplacez par votre adresse IP
```

#### 2. Installation de Node.js (si nécessaire)

```bash
# Sur Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

#### 3. Cloner et Configurer le Projet

```bash
# Cloner le repository
git clone <repository-url>
cd commission-simulator

# Installer les dépendances
npm install
```

#### 4. Générer les Certificats SSL (pour HTTPS)

```bash
cd ssl-certs
openssl genrsa -out key.pem 4096
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
cd ..
```

#### 5. Lancer l'Application

**En mode HTTP (Développement) :**
```bash
npm run dev
# ou
npm start
```

**En mode HTTPS (Production) :**
```bash
# Les certificats sont détectés automatiquement
npm start
```

**En arrière-plan (avec PM2 - recommandé pour la production) :**
```bash
# Installer PM2
npm install -g pm2

# Lancer l'application
pm2 start server.js --name "commission-uemoa"

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
```

#### 6. Ouvrir les Ports du Pare-feu

```bash
# Autoriser HTTP (port 3003)
sudo ufw allow 3003/tcp

# Autoriser HTTPS (port 3445)
sudo ufw allow 3445/tcp

# Vérifier le statut
sudo ufw status
```

### 🔍 Vérification du Déploiement

1. **Test HTTP :**
   ```bash
   curl http://64.225.5.75:3003/api/health
   ```

2. **Test HTTPS :**
   ```bash
   curl -k https://64.225.5.75:3445/api/health
   ```

3. **Accès depuis un navigateur :**
   - HTTP : `http://64.225.5.75:3003`
   - HTTPS : `https://64.225.5.75:3445`

---

## 🧪 Tests

### 🔍 Tests Disponibles

L'application inclut plusieurs scripts de test pour vérifier le bon fonctionnement :

```bash
# Test 1: Health check système
npm test

# Test 2: Test ÉTAPE 20 (Notification manifeste)
npm run test-etape-20

# Test 3: Test ÉTAPE 21 (Finalisation libre pratique)
npm run test-etape-21

# Test 4: Test ÉTAPE 16 (Traçabilité transit)
npm run test-etape-16

# Test 5: Test connectivité Kit MuleSoft
npm run test-kit

# Test 6: Tous les tests d'un coup
npm run test-all-etapes
```

### 🧪 Tests Manuels avec cURL

#### Test Health Check

```bash
# HTTP
curl http://localhost:3003/api/health

# HTTPS
curl -k https://localhost:3445/api/health
```

#### Test ÉTAPE 20 - Notification Manifeste

```bash
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
      "consignataire": "TEST COMPANY",
      "nombre_articles": 10,
      "valeur_approximative": 5000000
    }
  }'
```

#### Test ÉTAPE 21 - Finalisation Libre Pratique

```bash
curl -X POST http://localhost:3003/api/tracabilite/declaration \
  -H "Content-Type: application/json" \
  -d '{
    "typeOperation": "COMPLETION_LIBRE_PRATIQUE",
    "numeroOperation": "TEST_DEC_001",
    "paysOrigine": "MLI",
    "paysDestination": "SEN",
    "donneesMetier": {
      "numero_declaration": "DEC_MLI_TEST_001",
      "montant_paye": 3500000,
      "reference_paiement": "PAY_TEST_001",
      "workflow_complete": true
    }
  }'
```

#### Test ÉTAPE 16 - Traçabilité Transit

```bash
curl -X POST http://localhost:3003/api/tracabilite/transit \
  -H "Content-Type: application/json" \
  -d '{
    "typeOperation": "TRACABILITE_FINALE_TRANSIT",
    "numeroOperation": "TEST_TRANSIT_001",
    "paysOrigine": "SEN",
    "paysDestination": "MLI",
    "donneesMetier": {
      "numero_transit": "TRANSIT_TEST_001",
      "confirmation_retour": true
    }
  }'
```

#### Test Statistiques

```bash
curl http://localhost:3003/api/statistiques
```

### 🧪 Tests depuis l'Interface Web

1. **Accéder au Dashboard :**
   - Connectez-vous sur `http://localhost:3003/login.html`
   - Utilisez le compte `admin_commission` / `uemoa2025`

2. **Tester les Endpoints :**
   - Allez dans la section "Tests Kit d'Interconnexion"
   - Utilisez les boutons de test disponibles

3. **Visualiser les Statistiques :**
   - Le dashboard affiche les statistiques en temps réel
   - Les graphiques se mettent à jour automatiquement toutes les 20 secondes

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

## 📚 Comprendre l'Application

### 🎯 Qu'est-ce que cette Application ?

Cette application est le **Système Central de Traçabilité** de la Commission UEMOA. Elle supervise et trace les workflows douaniers entre les 8 États membres de l'UEMOA (Union Économique et Monétaire Ouest Africaine).

### 🔄 Fonctionnement Global

1. **Réception des Notifications :**
   - Les pays membres (Sénégal, Mali, etc.) envoient des notifications via le Kit MuleSoft d'Interconnexion
   - La Commission UEMOA reçoit ces notifications pour les étapes critiques (20, 21, 16)

2. **Traçabilité Centralisée :**
   - Toutes les opérations sont enregistrées dans la base de données centrale
   - Les données sont stockées en mémoire (Map/Set JavaScript)
   - Chaque opération est tracée avec un timestamp et des métadonnées

3. **Supervision & Analytics :**
   - Le système calcule des statistiques en temps réel
   - Il génère des rapports sur les corridors commerciaux
   - Il fournit une vue d'ensemble des échanges entre pays

4. **Interface Web :**
   - Un dashboard permet de visualiser les données en temps réel
   - Des graphiques montrent les tendances et statistiques
   - L'interface est mise à jour automatiquement toutes les 20 secondes

### 🏗️ Architecture Technique

```
┌─────────────────────────────────────────┐
│         INTERFACE WEB (Frontend)        │
│     - Dashboard de supervision          │
│     - Graphiques temps réel             │
│     - Authentification                  │
└─────────────────┬───────────────────────┘
                  │ HTTP/HTTPS
┌─────────────────▼───────────────────────┐
│       SERVEUR NODE.JS (Backend)         │
│  - API REST (Endpoints Commission)      │
│  - Router HTTP/HTTPS                    │
│  - Gestion requêtes                     │
└───────┬───────────────────┬─────────────┘
        │                   │
┌───────▼────────┐  ┌──────▼───────────┐
│   DATABASE     │  │   ANALYTICS      │
│   (In-Memory)  │  │   - Statistiques │
│   - Opérations │  │   - Tendances    │
│   - Traçabilité│  │   - Alertes      │
└────────────────┘  └──────────────────┘
        │
┌───────▼───────────────────────────────┐
│    KIT CLIENT MULESOFT                │
│    Communication avec Kit              │
│    d'Interconnexion                    │
└───────────────────────────────────────┘
```

### 📊 Flux de Données

1. **Reception d'une Notification :**
   ```
   Kit MuleSoft → POST /api/tracabilite/manifeste
   → Base de données (enregistrement)
   → Analytics (calcul statistiques)
   → Dashboard (affichage temps réel)
   ```

2. **Consultation des Données :**
   ```
   Dashboard → GET /api/statistiques
   → Base de données (lecture)
   → Dashboard (affichage graphiques)
   ```

3. **Export de Rapports :**
   ```
   Dashboard → GET /api/rapports/exporter
   → Base de données (extraction)
   → Format CSV/JSON
   ```

### 🔐 Sécurité

- **Authentification JWT :** Les utilisateurs doivent se connecter avec un compte
- **Session 12h :** Les sessions expirent après 12 heures d'inactivité
- **HTTPS Support :** Le serveur peut fonctionner en HTTPS avec certificats SSL
- **CORS Configuré :** Les requêtes cross-origin sont autorisées pour l'intégration

### 💾 Stockage des Données

- **Base en Mémoire :** Les données sont stockées en mémoire JavaScript (Map/Set)
- **Avantages :** Accès ultra-rapide (millisecondes)
- **Limitation :** Les données sont perdues au redémarrage du serveur
- **Production :** Pour la production, il faudrait ajouter une base de données persistante (MongoDB, PostgreSQL, etc.)

---

## 🆘 Support & Dépannage

### ❌ Problèmes Courants

#### Port 3003 ou 3445 occupé

**Sur Linux/Mac :**
```bash
# Trouver le processus utilisant le port 3003
lsof -ti:3003
# Tuer le processus
lsof -ti:3003 | xargs kill -9

# Pour le port HTTPS 3445
lsof -ti:3445 | xargs kill -9
```

**Sur Windows :**
```bash
# Trouver le processus
netstat -ano | findstr :3003
# Tuer le processus (remplacez <PID> par le numéro trouvé)
taskkill /PID <PID> /F

# Pour le port HTTPS 3445
netstat -ano | findstr :3445
taskkill /PID <PID> /F
```

#### Certificats SSL manquants ou invalides

**Erreur :** `❌ Erreur chargement certificats SSL: ENOENT: no such file or directory`

**Solution :**
```bash
# 1. Vérifier que le dossier ssl-certs existe
ls -la ssl-certs/

# 2. Générer les certificats
cd ssl-certs
openssl genrsa -out key.pem 4096
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
cd ..

# 3. Vérifier que les fichiers sont créés
ls -la ssl-certs/key.pem ssl-certs/cert.pem

# 4. Redémarrer le serveur
npm start
```

**Erreur :** `❌ Erreur chargement certificats SSL: error:0906D06C:PEM routines`

**Solution :** Les fichiers de certificat sont corrompus. Supprimez-les et régénérez :
```bash
rm ssl-certs/key.pem ssl-certs/cert.pem
cd ssl-certs
openssl genrsa -out key.pem 4096
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
cd ..
npm start
```

#### Avertissement de sécurité du navigateur (HTTPS)

**Problème :** Le navigateur affiche "Votre connexion n'est pas privée" avec un certificat auto-signé.

**Solution :** C'est normal ! Les certificats auto-signés déclenchent cet avertissement. Pour continuer :
- **Chrome/Edge :** Cliquez "Avancé" → "Continuer vers le site"
- **Firefox :** Cliquez "Avancé" → "Accepter le risque"
- **Safari :** Cliquez "Afficher les détails" → "Visiter ce site"

**Pour éviter l'avertissement :** Utilisez des certificats Let's Encrypt (gratuits) pour la production.

#### Le serveur ne démarre pas en HTTPS

**Problème :** Le serveur démarre uniquement en HTTP, pas en HTTPS.

**Vérifications :**
```bash
# 1. Vérifier que les certificats existent
ls -la ssl-certs/cert.pem ssl-certs/key.pem

# 2. Vérifier les permissions des fichiers
chmod 600 ssl-certs/key.pem
chmod 644 ssl-certs/cert.pem

# 3. Forcer HTTPS via variable d'environnement
export USE_HTTPS=true
npm start
```

#### Kit MuleSoft inaccessible

**Problème :** Les requêtes vers le Kit MuleSoft échouent.

**Test manuel :**
```bash
# Test de connectivité
curl http://64.225.5.75:8086/api/v1/health

# Test depuis l'application
curl http://localhost:3003/api/kit/test?type=health
```

**Depuis l'interface web :**
1. Connectez-vous au dashboard
2. Allez dans "Tests Kit d'Interconnexion"
3. Cliquez sur "Test Kit"

**Solutions :**
- Vérifier que l'IP `64.225.5.75` est accessible
- Vérifier que le port `8086` n'est pas bloqué par un pare-feu
- Vérifier l'URL dans la variable d'environnement `KIT_MULESOFT_URL`

#### Erreur d'authentification

**Problème :** Impossible de se connecter au dashboard.

**Solution :**
```javascript
// Ouvrir la console du navigateur (F12)
// Nettoyer le cache localStorage
localStorage.clear()
sessionStorage.clear()

// Recharger la page et réessayer de se connecter
// Comptes disponibles :
// - admin_commission / uemoa2025
// - superviseur / super2025
// - analyste / analyse2025
// - operateur / oper2025
```

#### Module npm manquant

**Erreur :** `Cannot find module 'xxx'`

**Solution :**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

#### Node.js version incorrecte

**Erreur :** Le serveur ne démarre pas avec une erreur liée à Node.js.

**Vérification :**
```bash
node --version  # Doit être v22.x ou supérieur
```

**Solution :**
- Télécharger Node.js 22.x depuis [nodejs.org](https://nodejs.org/)
- Ou utiliser NVM (Node Version Manager) :
  ```bash
  nvm install 22
  nvm use 22
  ```

### 🔍 Logs et Debugging

#### Voir les logs du serveur

Les logs sont affichés directement dans la console où vous avez lancé `npm start`. Vous verrez :
- Les requêtes entrantes (méthode, URL, timestamp)
- Les opérations de traçabilité
- Les erreurs éventuelles

#### Mode Debug (si implémenté)

Pour plus de détails, vous pouvez activer le mode debug :
```bash
DEBUG=* npm start
```

### 📞 Obtenir de l'Aide

1. **Consulter les logs :** Les erreurs sont affichées dans la console
2. **Vérifier la documentation :** Relire cette section README
3. **Tester les endpoints :** Utiliser `curl` ou Postman pour tester les API
4. **Vérifier la configuration :** Vérifier les variables d'environnement et les fichiers de configuration

### ✅ Checklist de Vérification

Avant de demander de l'aide, vérifiez :

- [ ] Node.js 22.x installé et accessible
- [ ] Dépendances installées (`npm install` exécuté)
- [ ] Ports 3003 (HTTP) et/ou 3445 (HTTPS) disponibles
- [ ] Certificats SSL générés (si utilisation HTTPS)
- [ ] Fichiers `ssl-certs/key.pem` et `ssl-certs/cert.pem` présents (pour HTTPS)
- [ ] Serveur accessible (test avec `curl http://localhost:3003/api/health`)
- [ ] Connexion au Kit MuleSoft fonctionnelle (si nécessaire)

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
