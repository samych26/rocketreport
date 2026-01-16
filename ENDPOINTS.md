# Endpoints API - RocketReport

Voici la liste des endpoints disponibles sur le backend (Port 8080).

## 🔐 Authentification
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Créer un compte utilisateur |
| `POST` | `/api/auth/login` | Se connecter (Retourne HttpOnly Cookie) |
| `POST` | `/api/auth/refresh` | Rafraîchir le token d'accès |
| `POST` | `/api/auth/logout` | Se déconnecter (Supprime les cookies) |
| `GET` | `/api/auth/me` | Récupérer l'utilisateur courant |

## 🌐 Sources de Données (ApiSource)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/api-sources` | Lister les sources |
| `POST` | `/api/api-sources` | Créer une source |
| `GET` | `/api/api-sources/{id}` | Détails d'une source |
| `PUT` | `/api/api-sources/{id}` | Modifier une source |
| `DELETE` | `/api/api-sources/{id}` | Supprimer une source |

## 📄 Documents
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/documents` | Lister les documents |
| `POST` | `/api/documents` | Créer un document |
| `GET` | `/api/documents/{id}` | Détails d'un document |
| `PUT` | `/api/documents/{id}` | Modifier un document |
| `DELETE` | `/api/documents/{id}` | Supprimer un document |

## 🧩 Variables (Attachées au Document)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/documents/{docId}/variables` | Lister les variables |
| `POST` | `/api/documents/{docId}/variables` | Ajouter une variable |
| `PUT` | `/api/documents/{docId}/variables/{id}` | Modifier une variable |
| `DELETE` | `/api/documents/{docId}/variables/{id}` | Supprimer une variable |

## 📝 Templates (Attachés au Document)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/documents/{docId}/templates` | Lister les templates |
| `POST` | `/api/documents/{docId}/templates` | Ajouter un template |
| `PUT` | `/api/documents/{docId}/templates/{id}` | Modifier un template |
| `DELETE` | `/api/documents/{docId}/templates/{id}` | Supprimer un template |

## ⚙️ Processeurs de Code
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/documents/{docId}/code` | Récupérer le code processor |
| `POST` | `/api/documents/{docId}/code` | Créer/Maj le code processor |
| `POST` | `/api/documents/{docId}/code/test` | Tester l'exécution du code |

## 🚀 Génération
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/documents/{docId}/generations` | Lancer une génération |
| `GET` | `/api/documents/{docId}/generations` | Historique des générations |
| `GET` | `/api/documents/{docId}/generations/{id}` | Détails d'une génération |
| `GET` | `/api/documents/{docId}/generations/{id}/download` | Télécharger le PDF |
