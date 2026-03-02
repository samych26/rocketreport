# 🧪 Données de test — RocketReport

> Fichier de référence pour tester toutes les fonctionnalités depuis le frontend.
> URL frontend : **http://localhost:5173** · Backend : **http://localhost:8000**

---

## 1. Authentification

### Compte existant
| Champ    | Valeur            |
|----------|-------------------|
| Email    | `samy@gmail.com`  |
| Password | `samy123`         |

### Créer un nouveau compte (page `/register`)
| Champ    | Valeur               |
|----------|----------------------|
| Nom      | `Test User`          |
| Email    | `test@rocketreport.io` |
| Password | `Test1234!`          |

---

## 2. API Sources (`/api-sources`)

Crée ces sources une par une via **"Nouvelle source"**.

### Source 1 — JSONPlaceholder (publique, sans auth)
| Champ       | Valeur                          |
|-------------|---------------------------------|
| Nom         | `JSONPlaceholder`               |
| URL de base | `https://jsonplaceholder.typicode.com` |
| Auth        | `Aucune auth`                   |
| Description | `API de test publique — users, posts, todos` |

> ✅ Cliquer **"Tester la connexion"** → doit répondre HTTP 200

### Source 2 — Open Meteo (météo, sans auth)
| Champ       | Valeur                          |
|-------------|---------------------------------|
| Nom         | `Open Meteo`                    |
| URL de base | `https://api.open-meteo.com`    |
| Auth        | `Aucune auth`                   |
| Description | `API météo gratuite sans clé`   |

### Source 3 — API avec Bearer Token (simulée)
| Champ        | Valeur                          |
|--------------|---------------------------------|
| Nom          | `Mon API Interne`               |
| URL de base  | `https://api.monapp.internal`   |
| Auth         | `Bearer`                        |
| Token        | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test` |
| Description  | `Exemple auth Bearer (non testable sans VPN)` |

---

## 3. Templates (`/templates`)

Crée ces templates via **"Nouveau template"**.

### Template 1 — Rapport utilisateurs (HTML)
| Champ         | Valeur             |
|---------------|--------------------|
| Nom           | `Rapport Utilisateurs` |
| Format        | `HTML`             |
| Description   | `Liste des utilisateurs de l'API` |

**Contenu Handlebars :**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; color: #333; }
    h1   { color: #6C47FF; border-bottom: 2px solid #6C47FF; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th   { background: #6C47FF; color: white; padding: 0.6rem 1rem; text-align: left; }
    td   { padding: 0.5rem 1rem; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 2rem; font-size: 0.8rem; color: #999; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Généré le : {{generated_at}}</p>
  <p>Total : <strong>{{total}}</strong> utilisateurs</p>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nom</th>
        <th>Email</th>
        <th>Ville</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{id}}</td>
        <td>{{name}}</td>
        <td>{{email}}</td>
        <td>{{address.city}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="footer">RocketReport — rapport auto-généré</div>
</body>
</html>
```

---

### Template 2 — Rapport posts (PDF)
| Champ         | Valeur             |
|---------------|--------------------|
| Nom           | `Rapport Posts`    |
| Format        | `PDF`              |
| Description   | `Résumé des posts du blog` |

**Contenu Handlebars :**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body  { font-family: Georgia, serif; padding: 2rem; color: #222; }
    h1    { font-size: 1.8rem; color: #e55; }
    .post { margin-bottom: 1.5rem; padding: 1rem; border-left: 4px solid #e55; background: #fff8f8; }
    .post h3  { margin: 0 0 0.3rem; }
    .post p   { margin: 0; font-size: 0.9rem; color: #555; }
    .badge    { display: inline-block; background: #e55; color: white; border-radius: 4px;
                padding: 2px 8px; font-size: 0.75rem; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>{{generated_at}} · {{total}} articles</p>

  {{#each items}}
  <div class="post">
    <span class="badge">Post #{{id}}</span>
    <h3>{{title}}</h3>
    <p>{{body}}</p>
  </div>
  {{/each}}
</body>
</html>
```

---

### Template 3 — Rapport simple (HTML, sans variable complexe)
| Champ         | Valeur             |
|---------------|--------------------|
| Nom           | `Rapport Simple`   |
| Format        | `HTML`             |
| Description   | `Template minimaliste pour tester rapidement` |

**Contenu Handlebars :**
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Rapport</title></head>
<body>
  <h1>{{title}}</h1>
  <pre>{{json_data}}</pre>
</body>
</html>
```

---

## 4. Builds (`/build`)

Crée ces builds via le wizard **"Nouveau build"** (4 étapes).

---

### Build 1 — Liste des utilisateurs

**Étape 1 — Source API**
- Source : `JSONPlaceholder`
- Méthode : `GET`
- Endpoint : `users`
- Cliquer **"Tester"** → doit afficher la liste JSON des 10 users

**Étape 2 — Code JavaScript**
```javascript
function processData(data) {
    return {
        title: "Rapport des utilisateurs",
        generated_at: new Date().toLocaleDateString('fr-FR'),
        total: data.length,
        items: data,
    };
}
```
> Cliquer **"Exécuter"** → doit afficher `{ title, generated_at, total: 10, items: [...] }`

**Étape 3 — Template** : Sélectionner `Rapport Utilisateurs`

**Étape 4 — Finaliser**
| Champ       | Valeur                  |
|-------------|-------------------------|
| Nom         | `Rapport Utilisateurs`  |
| Description | `Extrait les 10 users de JSONPlaceholder` |

---

### Build 2 — Posts du blog

**Étape 1 — Source API**
- Source : `JSONPlaceholder`
- Méthode : `GET`
- Endpoint : `posts`

**Étape 2 — Code JavaScript**
```javascript
function processData(data) {
    // Prendre seulement les 5 premiers posts
    const top5 = data.slice(0, 5);
    return {
        title: "Les 5 derniers articles",
        generated_at: new Date().toLocaleDateString('fr-FR'),
        total: top5.length,
        items: top5,
    };
}
```

**Étape 3 — Template** : Sélectionner `Rapport Posts`

**Étape 4 — Finaliser**
| Champ       | Valeur              |
|-------------|---------------------|
| Nom         | `Top 5 Posts`       |
| Description | `5 premiers posts du blog JSONPlaceholder` |

---

### Build 3 — Build sans template (JSON brut)

**Étape 1 — Source API**
- Source : `JSONPlaceholder`
- Méthode : `GET`
- Endpoint : `todos?userId=1`

**Étape 2 — Code JavaScript**
```javascript
function processData(data) {
    const done     = data.filter(t => t.completed).length;
    const pending  = data.filter(t => !t.completed).length;

    return {
        title: "Todos de l'utilisateur #1",
        generated_at: new Date().toISOString(),
        stats: { done, pending, total: data.length },
        items: data,
        json_data: JSON.stringify({ done, pending }, null, 2),
    };
}
```

**Étape 3 — Template** : `⊘ Aucun template`

**Étape 4 — Finaliser**
| Champ       | Valeur                |
|-------------|-----------------------|
| Nom         | `Todos User 1`        |
| Description | `Statistiques todos de l'utilisateur 1` |

---

## 5. Lancer une génération

Depuis la page **Builds**, cliquer **"Lancer la génération"** sur n'importe quel build créé.

- ✅ Résultat attendu : `Génération #X créée ✓`
- L'historique apparaît ensuite sur la page **Générations**

---

## 6. Flux de test complet recommandé

```
1. Se connecter          → /login         (samy@gmail.com / samy123)
2. Créer API Source      → /api-sources   (JSONPlaceholder)
3. Tester la connexion   → bouton "Tester" sur la carte
4. Créer un Template     → /templates     (Rapport Utilisateurs)
5. Créer un Build        → /build         (wizard 4 étapes)
6. Lancer la génération  → bouton "Lancer" sur la carte du build
7. Vérifier l'historique → /generations
```

---

## 7. APIs publiques utiles pour les tests

| API             | URL de base                          | Endpoint utile        | Auth     |
|-----------------|--------------------------------------|-----------------------|----------|
| JSONPlaceholder | `https://jsonplaceholder.typicode.com` | `users`, `posts`, `todos` | Aucune |
| Open Meteo      | `https://api.open-meteo.com`         | `v1/forecast?latitude=48.85&longitude=2.35&current_weather=true` | Aucune |
| Reqres          | `https://reqres.in/api`              | `users`, `users/1`    | Aucune |
| DummyJSON       | `https://dummyjson.com`              | `products`, `users`   | Aucune |
