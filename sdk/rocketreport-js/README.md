# RocketReport JS SDK 🚀

Le SDK officiel pour intégrer **RocketReport** dans vos projets JavaScript/TypeScript.

## Installation

```bash
npm install rocketreport
```

## Utilisation Rapide

### Initialisation

```javascript
import { RocketReport } from 'rocketreport';

const rr = new RocketReport('VOTRE_CLE_API');
```

### 1. Connecter une Source API

```javascript
const source = await rr.createApiSource({
    name: 'Mon API Client',
    url_base: 'https://api.mon-projet.com/v1',
    auth_type: 'bearer',
    auth_token: 'SECRET_TOKEN'
});
```

### 2. Créer un Template

Une fois que vous avez un `buildId`, vous pouvez lui attacher un template Handlebars.

```javascript
const template = await rr.createTemplate(42, {
    content: '<h1>Bonjour {{user_name}} !</h1>',
    output_format: 'pdf',
    description: 'Facture client'
});
```

### 3. Créer un Build (Rapport dynamique)

```javascript
const build = await rr.createBuild({
    name: 'Rapport Mensuel',
    api_source_id: source.id,
    endpoint: '/metrics/monthly',
    code: 'return data.filter(d => d.value > 100);'
});
```

### 4. Générer le Rapport

```javascript
const result = await rr.generate(build.id, {
    user_name: 'Samy'
});

console.log('Téléchargement :', result.download_url);
```

## Licence
MIT
