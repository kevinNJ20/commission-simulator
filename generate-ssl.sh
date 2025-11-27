#!/bin/bash

# ============================================================================
# Script de génération automatique des certificats SSL pour Commission UEMOA
# Génère des certificats auto-signés pour HTTPS
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🔐 Génération des certificats SSL pour Commission UEMOA..."
echo ""

# Vérifier que OpenSSL est installé
if ! command -v openssl &> /dev/null; then
    echo "❌ Erreur: OpenSSL n'est pas installé."
    echo "   Installez OpenSSL:"
    echo "   - Ubuntu/Debian: sudo apt-get install openssl"
    echo "   - macOS: brew install openssl"
    echo "   - Windows: Téléchargez depuis https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

# Vérifier que le dossier ssl-certs existe
if [ ! -d "ssl-certs" ]; then
    echo "❌ Erreur: Le dossier ssl-certs n'existe pas."
    exit 1
fi

# Vérifier que openssl.cnf existe
if [ ! -f "ssl-certs/openssl.cnf" ]; then
    echo "❌ Erreur: Le fichier ssl-certs/openssl.cnf n'existe pas."
    exit 1
fi

# Aller dans le dossier ssl-certs
cd ssl-certs

# Sauvegarder les anciens certificats s'ils existent
if [ -f "key.pem" ] || [ -f "cert.pem" ]; then
    echo "⚠️  Anciens certificats détectés. Sauvegarde..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    [ -f "key.pem" ] && mv key.pem "$BACKUP_DIR/"
    [ -f "cert.pem" ] && mv cert.pem "$BACKUP_DIR/"
    echo "✅ Anciens certificats sauvegardés dans ssl-certs/$BACKUP_DIR/"
    echo ""
fi

# Générer la clé privée (4096 bits)
echo "📝 Génération de la clé privée (4096 bits)..."
openssl genrsa -out key.pem 4096
if [ $? -eq 0 ]; then
    echo "✅ Clé privée générée: ssl-certs/key.pem"
else
    echo "❌ Erreur lors de la génération de la clé privée"
    exit 1
fi

# Générer le certificat auto-signé (valide 365 jours)
echo "📝 Génération du certificat auto-signé (valide 365 jours)..."
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
if [ $? -eq 0 ]; then
    echo "✅ Certificat généré: ssl-certs/cert.pem"
else
    echo "❌ Erreur lors de la génération du certificat"
    exit 1
fi

# Définir les permissions appropriées
chmod 600 key.pem
chmod 644 cert.pem

# Retourner à la racine du projet
cd ..

# Vérifier que les fichiers sont bien créés
if [ -f "ssl-certs/key.pem" ] && [ -f "ssl-certs/cert.pem" ]; then
    echo ""
    echo "🎉 Certificats SSL générés avec succès !"
    echo ""
    echo "📁 Fichiers créés:"
    echo "   • ssl-certs/key.pem (clé privée - permissions 600)"
    echo "   • ssl-certs/cert.pem (certificat - permissions 644)"
    echo ""
    echo "🚀 Prochaines étapes:"
    echo "   1. Lancer le serveur: npm start"
    echo "   2. Accéder à: https://localhost:3445"
    echo "   3. Accepter l'avertissement de sécurité du navigateur"
    echo ""
    echo "⚠️  Note: Les certificats sont auto-signés et valables 365 jours."
    echo "   Le navigateur affichera un avertissement de sécurité (c'est normal)."
    echo ""
else
    echo "❌ Erreur: Les fichiers de certificats n'ont pas été créés correctement."
    exit 1
fi

