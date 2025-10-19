// ============================================================================
// FICHIER: api/auth/login.js
// Commission UEMOA - API Authentification
// ============================================================================

// Base de données des utilisateurs Commission UEMOA
const USERS_COMMISSION = {
    'admin_commission': { 
        password: 'uemoa2025', 
        role: 'ADMIN_COMMISSION',
        nom: 'Administrateur Commission',
        permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN']
    },
    'superviseur': { 
        password: 'super2025', 
        role: 'SUPERVISEUR',
        nom: 'Superviseur UEMOA',
        permissions: ['READ', 'WRITE', 'SUPERVISE']
    },
    'analyste': { 
        password: 'analyse2025', 
        role: 'ANALYSTE',
        nom: 'Analyste Traçabilité',
        permissions: ['READ', 'ANALYSE']
    },
    'operateur': { 
        password: 'oper2025', 
        role: 'OPERATEUR',
        nom: 'Opérateur Commission',
        permissions: ['READ']
    }
};

// Génération de token
function generateToken(username) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return Buffer.from(`UEMOA:${username}:${timestamp}:${random}`).toString('base64');
}

// Stockage des sessions
const sessions = new Map();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            const { username, password } = req.body;

            console.log(`🔐 [Commission UEMOA] Tentative connexion: ${username}`);

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Identifiant et mot de passe requis'
                });
            }

            const user = USERS_COMMISSION[username];
            
            if (!user) {
                console.log(`❌ [Commission] Utilisateur ${username} non trouvé`);
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants Commission incorrects'
                });
            }

            if (user.password !== password) {
                console.log(`❌ [Commission] Mot de passe incorrect pour ${username}`);
                return res.status(401).json({
                    success: false,
                    message: 'Identifiants Commission incorrects'
                });
            }

            const token = generateToken(username);
            
            sessions.set(token, {
                username,
                role: user.role,
                nom: user.nom,
                permissions: user.permissions,
                organisme: 'COMMISSION_UEMOA',
                loginTime: new Date(),
                expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 heures
            });

            console.log(`✅ [Commission UEMOA] Connexion réussie: ${username} - ${user.role}`);

            res.status(200).json({
                success: true,
                message: 'Connexion Commission réussie',
                token,
                user: {
                    username,
                    nom: user.nom,
                    role: user.role,
                    permissions: user.permissions
                },
                commission: {
                    nom: 'Commission UEMOA',
                    sigle: 'UEMOA',
                    siege: 'Ouagadougou, Burkina Faso',
                    role: 'SUPERVISION_CENTRALE_TRACABILITE'
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ [Commission] Erreur authentification:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur Commission',
                error: error.message
            });
        }
    } else {
        res.status(405).json({
            success: false,
            message: 'Méthode non autorisée'
        });
    }
};

module.exports.sessions = sessions;
module.exports.USERS_COMMISSION = USERS_COMMISSION;