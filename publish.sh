#!/bin/bash
# Script pour publier les images RocketReport sur Docker Hub

# --- CONFIGURATION ---
DOCKER_USER="samych26"
VERSION="1.1.0"
# ---------------------

echo "🚀 Préparation de la publication RocketReport v$VERSION..."

# Vérification de la connexion Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Erreur: Docker n'est pas lancé."
    exit 1
fi

# 1. Build Backend
echo "📦 Build de l'image Backend..."
docker build -t $DOCKER_USER/rocketreport-backend:$VERSION -t $DOCKER_USER/rocketreport-backend:latest ./backend

# 2. Build Frontend
echo "📦 Build de l'image Frontend..."
docker build -t $DOCKER_USER/rocketreport-frontend:$VERSION -t $DOCKER_USER/rocketreport-frontend:latest ./frontend

# 3. Build & Publish SDK (NPM)
echo "📦 Build du SDK JavaScript..."
cd sdk/rocketreport-js && npm run build && cd ../..

# 4. Push des images Docker
echo "📤 Envoi des images vers Docker Hub..."
docker push $DOCKER_USER/rocketreport-backend:$VERSION
docker push $DOCKER_USER/rocketreport-backend:latest
docker push $DOCKER_USER/rocketreport-frontend:$VERSION
docker push $DOCKER_USER/rocketreport-frontend:latest

# 5. Optionnel : Publication NPM (nécessite d'être loggé)
# echo "📤 Publication du SDK sur NPM..."
 cd sdk/rocketreport-js && npm publish --access public && cd ../..

echo "✅ Publication terminée avec succès !"
echo "Images disponibles sur Docker Hub ($DOCKER_USER)"
echo "SDK prêt pour NPM (dossier sdk/rocketreport-js/dist)"
