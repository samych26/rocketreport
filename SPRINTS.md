# Sprints & Suivi - RocketReport

## 🚀 Phase 1 : Backend Core (Symfony 6.4 API)

### Sprint 1.1 : Architecture & Base (TERMINÉ)
- [x] Initialisation Symfony 6.4 (Clean Architecture)
- [x] Configuration Docker (PHP 8.2, MySQL 8, Redis)
- [x] Mise en place JWT Authentication (LexikJWT)

### Sprint 1.2 : Authentication (TERMINÉ)
- [x] Register (Inscription)
- [x] Login (Connexion avec HttpOnly Cookies)
- [x] Refresh Token (Rotation & Révocation)
- [x] Logout (Revocation Token)
- [x] Endpoint /me (Session persistante)

### Sprint 1.3 : Gestion des Ressources (TERMINÉ)
- [x] **API Sources** : CRUD complet (Connexions externes)
- [x] **Documents** : CRUD complet + Mapping endpoints
- [x] **Variables** : Gestion des variables + Typage
- [x] **Templates** : Gestion des templates Handlebars

### Sprint 1.4 : Moteur de Génération (TERMINÉ / AVANCÉ)
- [x] Service de Rendu (Handlebars + Helpers customs)
- [x] Sandbox Code Execution (Node.js runner sécurisé)
- [x] PDF Generation (Snappy / wkhtmltopdf)
- [x] Flow complet : API -> Code -> Template -> PDF

### Sprint 1.5 : Utilitaires & Optimisations (A FAIRE - Postponed)
- [ ] **Test de Connexion** : Endpoint pour valider une API Source
- [ ] **Duplication** : Cloner un Document avec ses Templates/Vars
- [ ] **Comparaison** : Diff visuel/code entre deux générations
- [ ] **Auto-détection** : Parser le Template pour créer les Variables
- [ ] **Public API** : Endpoint sécurisé pour déclencher une génération depuis l'extérieur (Webhook/API Key)

## 🎨 Phase 2 : Frontend (React + Vite + shadcn/ui) - A FAIRE

### Sprint 2.1 : Setup & Auth (A FAIRE)
- [ ] Initialisation React + Vite + TypeScript
- [ ] Configuration Tailwind v3 + shadcn/ui
- [ ] Login Page + Intégration Auth API
- [ ] Layout Dashboard (Sidebar, Header)

### Sprint 2.2 : Gestion (A FAIRE)
- [ ] Liste des Documents / Sources / Templates
- [ ] Formulaires de création/édition
- [ ] Éditeur de Code (Monaco Editor ?)

## 🔮 Phase 3 : Évolutions Futures (Idées & Améliorations)

### Gestion & Collaboration
- [ ] **Planification (Scheduler)** : Génération récurrente (Cron) + Envoi automatique par Email
- [ ] **Multi-utilisateurs / Teams** : Gestion des rôles (Admin, Éditeur, Lecteur) et Workspaces isolés
- [ ] **Audit Logs** : Historique des actions utilisateurs (Qui a modifié quoi ?)

### Stockage & Intégrations
- [ ] **Stockage Cloud** : Support AWS S3, Google Drive, Dropbox pour les PDFs (au lieu du local)
- [ ] **Webhooks** : Notifier une URL externe après génération (Succès/Échec)
- [ ] **Intégrations Chat** : Notifications Slack, Microsoft Teams, Discord

### Intelligence & Analytics
- [ ] **AI Assistant** : Génération de templates Handlebars et de code JS via LLM
- [ ] **Dashboard Analytics** : Statistiques d'usage, temps moyen de génération, taux d'erreur
- [ ] **Template Gallery** : Bibliothèque de templates communautaires ou partagés

---

## 🛠️ Stack Technique
- **Backend**: Symfony 6.4, PHP 8.2, MySQL 8.0, Redis.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui.
- **Infra**: Docker, Nginx.
