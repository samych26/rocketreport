# RocketReport SDK Demo 🚀

Cette démonstration illustre l'utilisation complète du package JavaScript `rocketreport` pour automatiser la création de rapports.

## Prérequis

1.  **Node.js** v18 ou supérieur.
2.  Le backend RocketReport doit être en cours d'exécution sur `http://localhost:8000`.

## Installation

```bash
# Se placer dans le dossier démo
cd demo-sdk

# Installer les dépendances (lie automatiquement le SDK local)
npm install
```

## Lancement

Avant de lancer la démo, assurez-vous de remplacer `'VOTRE_CLE_API_ICI'` par une clé valide générée depuis votre dashboard RocketReport dans le fichier `index.js`.

```bash
npm start
```

## Ce que fait cette démo

- **Initialisation** : Utilise la classe `RocketReport` pour se connecter à l'API.
- **Source API** : Configure dynamiquement une source (ex: JSONPlaceholder).
- **Document** : Crée un document "Liste des utilisateurs" en spécifiant uniquement les variables `id`, `name` et `website`.
- **Test** : Valide que l'API externe répond correctement et que le filtrage des variables fonctionne.
- **Génération** : Déclenche la création du rapport final.

---

*Note : Pour utiliser ce package dans un vrai projet, installez-le via npm :*
`npm install rocketreport`
