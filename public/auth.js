// ============================================================================
// FICHIER: public/auth.js
// Commission UEMOA - Script Authentification Client
// ============================================================================

const AUTH_CONFIG = {
    TOKEN_KEY: 'auth_token',
    USERNAME_KEY: 'username',
    ROLE_KEY: 'user_role',
    ORGANISME_KEY: 'organisme'
};

// Vérifier l'authentification
async function checkAuth() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const organisme = localStorage.getItem(AUTH_CONFIG.ORGANISME_KEY);
    
    if (!token) {
        console.log('❌ [AUTH Commission] Aucun token trouvé');
        redirectToLogin();
        return false;
    }
    
    if (organisme !== 'COMMISSION_UEMOA') {
        console.log('❌ [AUTH Commission] Organisme incorrect');
        redirectToLogin();
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (response.ok && data.valid) {
            console.log('✅ [AUTH Commission] Session valide:', data.user);
            return true;
        } else {
            console.log('❌ [AUTH Commission] Session invalide:', data.message);
            clearAuth();
            redirectToLogin();
            return false;
        }
    } catch (error) {
        console.error('❌ [AUTH Commission] Erreur vérification:', error);
        redirectToLogin();
        return false;
    }
}

// Déconnexion
async function logout() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    if (token) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token })
            });
            console.log('🚪 [Commission] Déconnexion effectuée');
        } catch (error) {
            console.error('❌ [Commission] Erreur déconnexion:', error);
        }
    }
    
    clearAuth();
    redirectToLogin();
}

// Nettoyer les données d'authentification
function clearAuth() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USERNAME_KEY);
    localStorage.removeItem(AUTH_CONFIG.ROLE_KEY);
    localStorage.removeItem(AUTH_CONFIG.ORGANISME_KEY);
}

// Rediriger vers la page de login
function redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
    }
}

// Obtenir les informations utilisateur
function getUserInfo() {
    return {
        username: localStorage.getItem(AUTH_CONFIG.USERNAME_KEY),
        role: localStorage.getItem(AUTH_CONFIG.ROLE_KEY),
        organisme: localStorage.getItem(AUTH_CONFIG.ORGANISME_KEY),
        token: localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
    };
}

// Afficher les informations utilisateur dans l'interface
function displayUserInfo(containerId = 'user-info') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.log('⚠️ [AUTH Commission] Container user-info non trouvé');
        return;
    }
    
    const userInfo = getUserInfo();
    
    // Mapper les rôles en français
    const roleLabels = {
        'ADMIN_COMMISSION': '👑 Administrateur',
        'SUPERVISEUR': '👁️ Superviseur',
        'ANALYSTE': '📊 Analyste',
        'OPERATEUR': '⚙️ Opérateur'
    };
    
    const roleLabel = roleLabels[userInfo.role] || userInfo.role;
    
    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding: 10px 20px; background: rgba(255,255,255,0.95); border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 3px solid #ff9500;">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #2c3e50;">🏛️ ${userInfo.username}</div>
                <div style="font-size: 0.85em; color: #7f8c8d;">${roleLabel} - Commission UEMOA</div>
            </div>
            <button onclick="logout()" style="padding: 8px 16px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                🚪 Déconnexion
            </button>
        </div>
    `;
}

// Export des fonctions globales
window.checkAuth = checkAuth;
window.logout = logout;
window.getUserInfo = getUserInfo;
window.displayUserInfo = displayUserInfo;

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏛️ [Commission UEMOA] Vérification authentification...');
    
    // Ne pas vérifier l'auth sur la page de login
    if (window.location.pathname === '/login.html') {
        console.log('ℹ️ [Commission] Page de login, pas de vérification');
        return;
    }
    
    const isAuthenticated = await checkAuth();
    
    if (isAuthenticated) {
        console.log('✅ [Commission] Utilisateur authentifié');
        // Afficher les infos utilisateur si le container existe
        if (document.getElementById('user-info')) {
            displayUserInfo();
        }
    } else {
        console.log('❌ [Commission] Utilisateur non authentifié, redirection...');
    }
});