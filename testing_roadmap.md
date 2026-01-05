# RocketReport - Feuille de Route de Test Détaillée

Ce document fournit un guide pas à pas pour valider l'intégralité du système RocketReport.

## 0. Prérequis
- **Base URL** : `http://localhost:8080`
- **Outil recommandé** : Thunder Client ou Postman.
- **Header par défaut** : Pour toutes les requêtes après le login, ajoutez le header `Authorization: Bearer <votre_jwt>`.

---

## 1. Cycle d'Authentification & Sécurité

### Étape 1 : Inscription (Register)
- **Action** : Créer un nouvel utilisateur.
- **Endpoint** : `POST /api/register`
- **Body** (JSON) :
```json
{
    "email": "dev@test.com",
    "password": "Password123!",
    "firstname": "Samy",
    "lastname": "Dev"
}
```
- **Validation** : Statut `201 Created`. Un message JSON confirmant la création.

### Étape 2 : Connexion (Login)
- **Action** : S'authentifier pour obtenir l'accès.
- **Endpoint** : `POST /api/login`
- **Body** (JSON) :
```json
{
    "email": "dev@test.com",
    "password": "Password123!"
}
```
- **Validation** : 
    - Statut `200 OK`.
    - **Le JWT** : Copiez la valeur du champ `token` reçu dans la réponse.
    - **Le Cookie** : Allez dans l'onglet "Cookies" de Thunder Client. Vous devez voir un cookie `refresh_token`. 

   a9d66419254f21ab818795aca817eb2f17d19d4427661fe62bb2768aee77cd08

### Étape 3 : Rotation du Refresh Token
- **Action** : Renouveler le JWT de manière sécurisée.
- **Endpoint** : `POST /api/auth/refresh`
- **Body** : Laisser **vide**.
- **Validation** : 
    - Statut `200 OK`.
    - Un **nouveau** `token` JWT est généré.
    - Le cookie `refresh_token` est mis à jour avec une nouvelle valeur aléatoire.

### Étape 4 : Test de Détection de Violation (Breach Detection)
- **Action** : Simuler le vol d'un jeton rejoué.
    1. Faites un login. Notez la valeur du cookie `refresh_token` (JETON_A).
    2. Faites un refresh. Vous recevez un nouveau cookie (JETON_B).
    3. **Testez la violation** : Comme Thunder Client peut bloquer l'édition des cookies, utilisez votre terminal :
    ```bash
    curl -X POST http://localhost:8080/api/auth/refresh -H "Cookie: refresh_token=VOTRE_JETON_A" -i
    ```
- **Validation** : 
    - Statut `401 Unauthorized`.
    - Message : `"error": "Breach detected. All sessions revoked."`.
    - **Vérification DB** : Tous les jetons de cet utilisateur ont désormais `revoked = 1` dans la table `refresh_tokens`.

---

## 2. Gestion des Sources de Données (CRUD)

### Étape 5 : Créer une Source API
- **Endpoint** : `POST /api/api-sources`
- **Body** (JSON) :
```json
{
    "name": "App Mobile Statistics",
    "baseUrl": "https://api.statscounter.com/v1",
    "method": "GET",
    "authType": "API_KEY",
    "endpoints": [
        {
            "path": "/users/active",
            "headers": {"X-API-KEY": "secret-123"},
            "queryParams": {"limit": "10"}
        }
    ]
}
```
- **Validation** : `201 Created`. Notez l'ID de la source (ex: `uuid-...`).
f7c554f1-19ed-4d4c-bb8a-5f70a0c809af

### Étape 6 : Lister et Modifier
- **Action** : `GET /api/api-sources` pour voir votre nouvelle source.
- **Action** : `PUT /api/api-sources/{id}` pour changer le nom.

---

## 3. Gestion des Templates & Documents

### Étape 7 : Créer un Template
- **Endpoint** : `POST /api/templates`
- **Body** (JSON) :
```json
{
    "name": "User Greeting Template",
    "content": "<h1>Bonjour {{ firstname }} {{ lastname }}!</h1><p>Date: {{ date }}</p>",
    "variables": [
        {"name": "firstname", "type": "string", "required": true},
        {"name": "lastname", "type": "string", "required": true},
        {"name": "date", "type": "string", "required": false}
    ]
}
```
- **Validation** : `201 Created`. Notez le `id` du template. 4d171a37-d15b-4b7a-a079-c0b367ada7fd

### Étape 8 : Générer un Document (Rendu avec Sources de Données)
- **Action** : Fusionner le template avec les données d'une API externe.
- **Endpoint** : `POST /api/documents/generate`
- **Body** (JSON) :
```json
{
    "templateId": "4d171a37-d15b-4b7a-a079-c0b367ada7fd",
    "apiSourceIds": ["f7c554f1-19ed-4d4c-bb8a-5f70a0c809af"],
    "outputFormat": "HTML",
    "overrideData": {
        "date": "2026-01-05"
    }
}
```
- **Fonctionnement** : 
    1. Le serveur va appeler la source `App Mobile Statistics`.
    2. Il va récupérer les données (ex: `{"firstname": "Utilisateur", "lastname": "API"}`).
    3. Il va fusionner ça avec ton template `Bonjour {{ firstname }} {{ lastname }}`.
- **Validation** : Statut `200 OK`. Le contenu généré doit afficher les données venant de l'API (ou du `overrideData`).

---

## 4. Clôture de Session

### Étape 9 : Déconnexion (Logout)
- **Endpoint** : `POST /api/auth/logout`
- **Body** : Vide.
- **Validation** : 
    - Statut `200 OK`.
    - Le cookie `refresh_token` est supprimé par le serveur.
    - Le JWT restant dans vos headers ne fonctionnera plus dès qu'il aura expiré.
