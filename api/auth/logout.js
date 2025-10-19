// ============================================================================
// FICHIER: api/auth/logout.js
// Commission UEMOA - API Déconnexion
// ============================================================================

const loginModule = require('./login');

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
            let token = req.headers.authorization?.replace('Bearer ', '');
            
            if (!token && req.body) {
                token = req.body.token;
            }

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Token manquant'
                });
            }

            const sessions = loginModule.sessions;
            const session = sessions.get(token);
            
            if (session) {
                console.log(`🚪 [Commission UEMOA] Déconnexion: ${session.username} - ${session.role}`);
                sessions.delete(token);
            }

            res.status(200).json({
                success: true,
                message: 'Déconnexion Commission réussie',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ [Commission] Erreur déconnexion:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur',
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