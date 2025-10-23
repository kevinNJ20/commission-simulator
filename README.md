# 🏛️ Commission UEMOA - Système Central de Traçabilité

**Supervision Centrale des Workflows Douaniers UEMOA**  
*Ouagadougou, Burkina Faso*

[![Version](https://img.shields.io/badge/version-1.0.0--UEMOA--FINAL-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-22.x-green.svg)](package.json)

---

## 📋 Vue d'ensemble

Système de supervision centralisée des échanges douaniers entre les 8 États membres de l'UEMOA, conforme au Document d'Interconnexion des Systèmes Douaniers.

### 🎯 Rôle Commission UEMOA

La Commission intervient aux **étapes finales** des workflows douaniers :

| Workflow | Étapes Commission | Description |
|----------|-------------------|-------------|
| **Libre Pratique** | **20-21** (sur 21) | Notification manifeste + Traçabilité finale |
| **Transit** | **16** (sur 16) | Traçabilité finale transit |

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Cloner et installer
git clone <repository-url>
cd simulateur-commission-uemoa
npm install

# Lancer le serveur
npm start
```

Le système démarre sur **http://localhost:3003**

### 🔐 Connexion

**Page de login** : http://localhost:3003/login.html

| Utilisateur | Mot de passe | Rôle |
|-------------|--------------|------|
| `admin_commission` | `uemoa2025` | 👑 Administrateur |
| `superviseur` | `super2025` | 👁️ Superviseur |
| `analyste` | `analyse2025` | 📊 Analyste |
| `operateur` | `oper2025` | ⚙️ Opérateur |

---

## 📡 API Endpoints

### Authentification

```bash
POST /api/auth/login          # Connexion
POST /api/auth/logout         # Déconnexion
POST /api/auth/verify         # Vérification session
```

### Traçabilité (Étapes 20-21-16)

```bash
POST /api/tracabilite/enregistrer     # Endpoint principal
POST /api/tracabilite/manifeste       # ÉTAPE 20 (Manifestes)
POST /api/tracabilite/declaration     # ÉTAPE 21 (Déclarations)
GET  /api/tracabilite/lister          # Liste opérations
```

### Supervision

```bash
GET /api/health                # État système
GET /api/statistiques          # Stats supervision
GET /api/dashboard             # Métriques dashboard
```

### Kit d'Interconnexion

```bash
GET  /api/kit/test             # Test connectivité
GET  /api/kit/diagnostic       # Diagnostic complet
POST /api/kit/synchroniser     # Synchronisation
```

---

## 🧪 Tests

```bash
# Health check
npm test

# Tests par étape
npm run test-etape-20    # ÉTAPE 20 (Manifeste)
npm run test-etape-21    # ÉTAPE 21 (Déclaration)
npm run test-etape-16    # ÉTAPE 16 (Transit)

# Test Kit MuleSoft
npm run test-kit

# Tous les tests
npm run test-all-etapes
```

---

## 🌍 États Membres UEMOA

### Pays Côtiers (Prime abord)
🇸🇳 Sénégal • 🇨🇮 Côte d'Ivoire • 🇧🇯 Bénin • 🇹🇬 Togo • 🇬🇼 Guinée-Bissau

### Pays Hinterland (Destination)
🇲🇱 Mali • 🇧🇫 Burkina Faso • 🇳🇪 Niger

**Total : 8 États membres**

---

## 📁 Structure Clés

```
simulateur-commission-uemoa/
├── api/
│   ├── auth/                          # 🔐 Authentification
│   │   ├── login.js
│   │   ├── logout.js
│   │   └── verify.js
│   ├── tracabilite/
│   │   ├── enregistrer.js             # ⭐ ÉTAPES 20-21-16
│   │   ├── manifeste.js               # ⭐ ÉTAPE 20
│   │   └── declaration.js             # ⭐ ÉTAPE 21
│   ├── kit/                           # Kit MuleSoft
│   └── rapports/                      # Exports
├── lib/
│   ├── database.js                    # Base traçabilité
│   ├── analytics.js                   # Analytics
│   └── kit-client.js                  # Client Kit
├── public/
│   ├── index.html                     # 🌐 Dashboard
│   ├── login.html                     # 🔐 Login
│   ├── auth.js                        # Script auth
│   └── style.css
└── server.js                          # ⭐ Serveur
```

---

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
PORT=3003
NODE_ENV=production
KIT_MULESOFT_URL=http://64.225.5.75:8086/api/v1
```

---

## 📊 Workflows UEMOA

### Libre Pratique (21 étapes)

**Étapes 1-5** : Sénégal (Manifeste)  
**Étapes 6-16** : Mali (Déclaration, Contrôles, Paiement)  
**Étapes 17-19** : Sénégal (Autorisation, Apurement)  
**⭐ Étapes 20-21** : Commission UEMOA (Traçabilité centrale)

### Transit (16 étapes)

**Étapes 1-6** : Pays départ  
**Étapes 7-14** : Transit  
**Étape 15** : Apurement  
**⭐ Étape 16** : Commission UEMOA (Traçabilité finale)

---

## 🔒 Sécurité

- ✅ Authentification JWT avec expiration (12h)
- ✅ Vérification à chaque requête
- ✅ CORS configuré
- ✅ Sessions sécurisées

⚠️ **Important** : Ne jamais committer `.env` avec des secrets réels.

---

## 🚀 Déploiement

### Vercel

```bash
# Installation CLI
npm i -g vercel

# Déploiement
vercel --prod
```

### Variables Vercel

Dans le dashboard Vercel :
- `PORT` : 3003
- `NODE_ENV` : production
- `KIT_MULESOFT_URL` : <url-kit>

---

## 🐛 Dépannage

### Échec Authentification

```bash
# Nettoyer le cache navigateur
localStorage.clear()
```

### Port 3003 occupé

```bash
# Linux/Mac
lsof -ti:3003 | xargs kill -9

# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F
```

### Kit MuleSoft inaccessible

```bash
# Test manuel
curl http://64.225.5.75:8086/api/v1/health

# Ou
npm run test-kit
```

---

## 📞 Support

**Organisme** : Commission UEMOA  
**Siège** : Ouagadougou, Burkina Faso  
**Version** : 1.0.0-UEMOA-FINAL  
**Runtime** : Node.js 22.x

---

## 📄 Licence

**OPEN** - Projet supervision échanges douaniers UEMOA

---

## 🙏 Remerciements

- **Jasmine Conseil** - Développement prototype
- **Commission UEMOA** - Cahier des charges
- **États Membres UEMOA** - Collaboration
- **MuleSoft** - Plateforme d'interconnexion

---

*Commission UEMOA - Système Central de Traçabilité*  
**Dernière mise à jour** : Octobre 2025
