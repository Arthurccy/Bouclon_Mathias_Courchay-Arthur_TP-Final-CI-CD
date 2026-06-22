# Rapport PDF - Plan conseillé

Ce fichier sert de brouillon pour produire le rapport PDF final de 20 pages maximum.

## 1. Page de garde

- Projet: TaskFlow API - Pipeline Jenkins CI/CD
- Formation: M1 DEVFLSTK
- Binôme: Arthur Courchay et Mathias
- Date
- URL du repo GitHub public

## 2. Architecture globale

Schéma à reprendre:

```text
GitHub -> Webhook -> Jenkins :8080
                  -> Checkout -> Install -> Lint -> Test -> Build Docker -> Deploy

Utilisateur -> localhost:80 -> Nginx -> API Express :5000 -> MongoDB :27017
```

Expliquer:

- Nginx est le seul point d'entrée applicatif exposé sur le port `80`.
- MongoDB reste dans le réseau Docker interne et n'expose pas `27017` sur l'hôte.
- Jenkins pilote le pipeline et exécute `docker compose up -d`.

## 3. Application TaskFlow API

- Stack: Node.js, Express, Mongoose, MongoDB.
- Modèle `Task`: `title`, `description`, `status`, `createdAt`.
- Routes: `GET /health`, `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`.
- Tests Jest: 14 tests, couverture supérieure à 90 %, MongoDB mocké.

## 4. Docker et infrastructure

- Dockerfile multi-stage: `builder` avec devDependencies, `production` sans devDependencies.
- Image `node:18-alpine`.
- Utilisateur non-root `taskflow`.
- Compose: services `api`, `mongodb`, `nginx`, `jenkins`.
- Volume nommé `mongodb_data`.
- Réseau dédié `taskflow-network`.

## 5. Jenkins

Captures à intégrer:

- Stage View verte.
- Console Output montrant `npm ci`, `npm run lint`, `npm test`, build Docker et deploy.
- Build rouge intentionnel au stage Lint.
- Configuration webhook GitHub.

Points à expliquer:

- Les 6 stages obligatoires.
- Le tag Docker `latest` et `build-${BUILD_NUMBER}`.
- L'utilisation de `withCredentials` pour `mongo-uri`.
- Aucun secret dans le repo.

## 6. Répartition des tâches

| Membre | Référent | Travail réalisé |
| --- | --- | --- |
| Arthur Courchay | Application et qualité | API Express, modèle Task, validation, tests Jest, ESLint, Dockerfile API, sections README liées à l'API |
| Mathias | Infrastructure et CI/CD | Compose, MongoDB, Nginx, Jenkins Docker, credentials, webhook GitHub, captures pipeline |
| Binôme | Validation finale | Relecture, build rouge volontaire, vérification clone propre, rapport PDF |

## 7. Difficultés rencontrées

Exemples crédibles à documenter seulement si vraiment observés:

- Le projet devait démarrer sans `.env`, tout en gardant `.env.example`; solution: valeurs par défaut dans `docker-compose.yml`.
- Les tests ne devaient pas dépendre d'un MongoDB réel; solution: mock Jest du modèle `Task`.
- Les ports `80` et `8080` étaient déjà utilisés par le TP ProShop local; solution: ne pas lancer les deux stacks en même temps pendant la validation.

## 8. Annexes utiles

Commandes de vérification:

```bash
npm run lint
npm test
docker compose up -d --build
curl http://localhost/health
curl http://localhost/api/tasks
docker ps
```
