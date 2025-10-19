// ============================================================================
// FICHIER: api/auth/verify.js
// Commission UEMOA - API Vérification Token
// ============================================================================

const loginModule = require('./login');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET' || req.method === 'POST') {
        try {
            let token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token && req.body) {
                token = req.body.token;
            }

            if (!token) {
                return res.status(401).json({
                    valid: false,
                    message: 'Token manquant'
                });
            }

            const sessions = loginModule.sessions;
            const session = sessions.get(token);

            if (!session) {
                return res.status(401).json({
                    valid: false,
                    message: 'Session Commission invalide ou expirée'
                });
            }

            if (new Date() > session.expiresAt) {
                sessions.delete(token);
                return res.status(401).json({
                    valid: false,
                    message: 'Session Commission expirée'
                });
            }

            res.status(200).json({
                valid: true,
                message: 'Session Commission valide',
                user: {
                    username: session.username,
                    nom: session.nom,
                    role: session.role,
                    permissions: session.permissions,
                    organisme: session.organisme
                },
                commission: {
                    nom: 'Commission UEMOA',
                    siege: 'Ouagadougou, Burkina Faso'
                },
                loginTime: session.loginTime,
                expiresAt: session.expiresAt
            });

        } catch (error) {
            console.error('❌ [Commission] Erreur vérification token:', error);
            res.status(500).json({
                valid: false,
                message: 'Erreur serveur',
                error: error.message
            });
        }
    } else {
        res.status(405).json({
            valid: false,
            message: 'Méthode non autorisée'
        });
    }
};