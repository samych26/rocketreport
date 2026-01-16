# Données de Test - RocketReport

Voici des exemples de payloads JSON pour tester vos endpoints.

## 🔐 Authentification

### `POST /api/auth/register` (Créer un compte)
```json
{
  "email": "test@rocketreport.io",
  "name": "Utilisateur Test",
  "password": "Password123!"
}
```

### `POST /api/auth/login` (Se connecter)
```json
{
  "email": "test@rocketreport.io",
  "password": "Password123!"
}
```

---

## 🌐 Sources de Données (ApiSource)
*Note : Nécessite d'être authentifié*

### `POST /api/api-sources` (Créer une source)
```json
{
  "name": "Ma Source Externe",
  "url_base": "https://api.monserveur.com/v1",
  "auth_type": "bearer",
  "auth_token": "mon_super_token_secret",
  "headers": {
    "Accept": "application/json",
    "X-Project-Id": "123"
  }
}
```

### `PATCH /api/api-sources/{id}` (Mettre à jour)
```json
{
  "name": "Nouveau Nom de Source",
  "status": "inactive"
}
```

---

## 📄 Documents
*Note : `api_source_id` doit correspondre à une source existante.*

### `POST /api/documents` (Créer un document)
```json
{
  "name": "Rapport Mensuel",
  "api_source_id": 1,
  "endpoint": "/stats/monthly",
  "method": "GET",
  "query_params": {
    "year": "2025",
    "month": "01"
  }
}
```

---

## 🧩 Variables (Attachées au Document)

### `POST /api/documents/{docId}/variables` (Ajouter une variable)
```json
{
  "name": "Total Ventes",
  "type": "api_field",
  "json_path": "$.summary.total_sales",
  "format": "number",
  "required": true,
  "default_value": "0"
}
```

---

## 📝 Templates (Attachés au Document)

### `POST /api/documents/{docId}/templates` (Ajouter un template)
```json
{
  "content": "<h1>Rapport : {{name}}</h1><p>Ventes totales : {{total_sales}}€</p>",
  "output_format": "pdf",
  "description": "Template HTML de base pour le rapport"
}
```

---

## ⚙️ Processeurs de Code

### `POST /api/documents/{docId}/code` (Mettre à jour le script de transformation)
```json
{
  "code": "const data = payload;\nconst transformed = {\n  name: data.userName,\n  total_sales: data.sales.reduce((a, b) => a + b, 0)\n};\nreturn transformed;"
}
```
