@echo off
REM ============================================================================
REM Script de génération automatique des certificats SSL pour Commission UEMOA
REM Génère des certificats auto-signés pour HTTPS (Windows)
REM ============================================================================

echo 🔐 Génération des certificats SSL pour Commission UEMOA...
echo.

REM Vérifier que OpenSSL est installé
where openssl >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur: OpenSSL n'est pas installé ou n'est pas dans le PATH.
    echo    Installez OpenSSL depuis: https://slproweb.com/products/Win32OpenSSL.html
    echo    Ou utilisez Git Bash qui inclut OpenSSL
    pause
    exit /b 1
)

REM Vérifier que le dossier ssl-certs existe
if not exist "ssl-certs" (
    echo ❌ Erreur: Le dossier ssl-certs n'existe pas.
    pause
    exit /b 1
)

REM Vérifier que openssl.cnf existe
if not exist "ssl-certs\openssl.cnf" (
    echo ❌ Erreur: Le fichier ssl-certs\openssl.cnf n'existe pas.
    pause
    exit /b 1
)

REM Aller dans le dossier ssl-certs
cd ssl-certs

REM Sauvegarder les anciens certificats s'ils existent
if exist "key.pem" (
    echo ⚠️  Anciens certificats détectés. Sauvegarde...
    set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_DIR=%BACKUP_DIR: =0%
    mkdir "%BACKUP_DIR%" 2>nul
    if exist "key.pem" move key.pem "%BACKUP_DIR%\" >nul
    if exist "cert.pem" move cert.pem "%BACKUP_DIR%\" >nul
    echo ✅ Anciens certificats sauvegardés dans ssl-certs\%BACKUP_DIR%\
    echo.
)

REM Générer la clé privée (4096 bits)
echo 📝 Génération de la clé privée (4096 bits)...
openssl genrsa -out key.pem 4096
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de la génération de la clé privée
    cd ..
    pause
    exit /b 1
)
echo ✅ Clé privée générée: ssl-certs\key.pem

REM Générer le certificat auto-signé (valide 365 jours)
echo 📝 Génération du certificat auto-signé (valide 365 jours)...
openssl req -new -x509 -key key.pem -out cert.pem -days 365 -config openssl.cnf
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de la génération du certificat
    cd ..
    pause
    exit /b 1
)
echo ✅ Certificat généré: ssl-certs\cert.pem

REM Retourner à la racine du projet
cd ..

REM Vérifier que les fichiers sont bien créés
if exist "ssl-certs\key.pem" if exist "ssl-certs\cert.pem" (
    echo.
    echo 🎉 Certificats SSL générés avec succès !
    echo.
    echo 📁 Fichiers créés:
    echo    • ssl-certs\key.pem (clé privée)
    echo    • ssl-certs\cert.pem (certificat)
    echo.
    echo 🚀 Prochaines étapes:
    echo    1. Lancer le serveur: npm start
    echo    2. Accéder à: https://localhost:3445
    echo    3. Accepter l'avertissement de sécurité du navigateur
    echo.
    echo ⚠️  Note: Les certificats sont auto-signés et valables 365 jours.
    echo    Le navigateur affichera un avertissement de sécurité (c'est normal).
    echo.
) else (
    echo ❌ Erreur: Les fichiers de certificats n'ont pas été créés correctement.
    pause
    exit /b 1
)

pause

