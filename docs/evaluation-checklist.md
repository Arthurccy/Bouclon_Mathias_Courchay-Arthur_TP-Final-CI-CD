# Checklist grille d'évaluation

## A - Application TaskFlow API

- [x] `npm install` puis `npm start` possible.
- [x] 6 routes REST implémentées.
- [x] `GET /health` retourne `status`, `uptime`, `version`.
- [x] Modèle `Task` conforme.
- [x] Tests Jest: 14 tests verts.
- [x] ESLint: `npm run lint` retourne 0.
- [x] Code structuré par routes, contrôleur, modèle.

## B - Docker & Infrastructure

- [x] Dockerfile multi-stage.
- [x] `node:18-alpine` et utilisateur non-root.
- [x] Services `api`, `mongodb`, `nginx`.
- [x] Volume nommé `mongodb_data`.
- [x] Réseau dédié `taskflow-network`.
- [x] Nginx route `/api/tasks` vers l'API.
- [x] `.env.example` présent, `.env` ignoré.

## C - Pipeline Jenkins

- [x] Jenkins présent dans `docker-compose.yml`.
- [x] Plugins listés dans `jenkins/plugins.txt`.
- [x] Jenkinsfile TaskFlow à la racine.
- [x] Stages: Checkout, Install, Lint, Test, Build Docker, Deploy.
- [x] Tags Docker: `latest` et `build-${BUILD_NUMBER}`.
- [x] `post { always, success, failure }`.
- [x] `withCredentials` utilisé pour `mongo-uri`.
- [ ] Webhook GitHub à configurer après création du repo.
- [ ] Captures Stage View verte et build rouge à produire.

## D - Rapport

- [ ] Page de garde avec URL GitHub.
- [ ] Schéma architecture.
- [ ] Captures Jenkins.
- [ ] Build rouge intentionnel documenté.
- [ ] Répartition Arthur/Mathias validée.
- [ ] Difficultés et solutions documentées.
