# Notes sur la Structure Clean Architecture

Voici un résumé des responsabilités de chaque dossier dans la nouvelle structure du projet :

## 1. Domain (`src/Domain`)
C'est le **cœur métier** (indépendant du framework).
- **Entity/** : Objets métier (ex: `User.php`).
- **Repository/** : Interfaces des dépôts (contrats).
- **Service/** : Logique métier complexe.

## 2. Application (`src/Application`)
Orchestration des actions utilisateur.
- **UseCase/** : Une classe par action (ex: `RegisterUser.php`).
- **DTO/** : Objets de transfert de données.

## 3. Infrastructure (`src/Infrastructure`)
Implémentations techniques et outils externes.
- **Persistence/Doctrine/** : Implémentations réelles des repositories.
- **Security/** : Logique d'authentification Symfony.
- **Service/** : Services techniques (Email, API externes).

## 4. UI (`src/Ui`)
Points d'entrée de l'application.
- **Http/Controller/** : Contrôleurs API/Web.
- **Cli/Command/** : Commandes de terminal.



