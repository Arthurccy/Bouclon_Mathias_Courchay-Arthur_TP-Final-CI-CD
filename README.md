# TaskFlow API

![Jenkins](https://img.shields.io/badge/Jenkins-pipeline-blue)

TaskFlow API est une API REST de gestion de tâches créée pour le projet final CI/CD. Elle expose les opérations CRUD minimum, stocke les tâches dans MongoDB et se déploie via Docker Compose derrière Nginx. Le pipeline Jenkins automatise l'installation, le lint, les tests, la construction Docker et le déploiement.

## Prérequis

- Docker et Docker Compose
- Jenkins avec les plugins Git, Docker Pipeline et Pipeline. Le service Jenkins du projet installe aussi ces plugins via `jenkins/plugins.txt`.
- Node.js 18 pour lancer les tests en local

## Démarrage rapide

```bash
git clone <url-du-repo>
cd Courchay-Arthur_TP-Final
docker compose up -d --build
```

Vérification:

```bash
curl http://localhost/health
curl http://localhost/api/tasks
```

## Variables d'environnement

| Nom | Description | Exemple |
| --- | --- | --- |
| `PORT` | Port interne de l'API Express | `5000` |
| `MONGO_URI` | URI MongoDB utilisée par l'API | `mongodb://mongodb:27017/taskflow` |
| `MONGO_INITDB_DATABASE` | Base créée au démarrage du conteneur MongoDB | `taskflow` |

Le projet démarre sans fichier `.env` grâce aux valeurs par défaut du `docker-compose.yml`. Pour personnaliser la configuration, copier `.env.example` vers `.env`; ce fichier reste volontairement absent du repo.

## Routes API

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Health-check Jenkins et Docker |
| `GET` | `/api/tasks` | Liste toutes les tâches |
| `POST` | `/api/tasks` | Crée une tâche |
| `GET` | `/api/tasks/:id` | Retourne une tâche par son id |
| `PUT` | `/api/tasks/:id` | Met à jour le statut |
| `DELETE` | `/api/tasks/:id` | Supprime une tâche |

## Exemple de création

```bash
curl -X POST http://localhost/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Configurer Jenkins","description":"Pipeline declarative","status":"todo"}'
```

## Architecture Docker

```text
                         GitHub
                           |
                           | webhook / push
                           v
                    Jenkins :8080
                           |
        Checkout -> Install -> Lint -> Test -> Build Docker -> Deploy
                           |
                           v
Utilisateur -> localhost:80 -> Nginx -> API Express :5000 -> MongoDB :27017
                                  réseau Docker interne: taskflow-network
```

Seul Nginx expose le port `80` pour l'application. Jenkins expose `8080` pour la CI/CD. MongoDB reste interne au réseau bridge `taskflow-network`, et l'API n'expose que le port `5000` aux services Docker.

## Pipeline Jenkins

```text
Checkout -> Install -> Lint -> Test -> Build Docker -> Deploy
```

- `Checkout`: récupère le code du repo GitHub.
- `Install`: exécute `npm ci`.
- `Lint`: exécute `npm run lint` avec zéro warning autorisé.
- `Test`: exécute `npm test` et génère la couverture Jest.
- `Build Docker`: construit `taskflow-api:latest` et `taskflow-api:build-${BUILD_NUMBER}`.
- `Deploy`: lance `docker compose up -d`.

Les secrets ne sont pas versionnés. Le Jenkinsfile attend un credential Jenkins `mongo-uri`, injecté avec `withCredentials`.

Le service `jenkins` utilise `Dockerfile.jenkins` pour installer Docker CLI, Docker Compose et les plugins nécessaires au pipeline.

## Tests et qualité

```bash
npm ci
npm run lint
npm test
```

Les tests Jest utilisent des mocks du modèle `Task`, donc ils ne nécessitent pas de connexion MongoDB réelle.

Couverture actuelle: `93.05%` des statements avec `npm test`.

## Vérifications rapides correcteur

```bash
docker compose up -d --build
curl http://localhost/health
curl http://localhost/api/tasks
docker ps
```

Points attendus:

- `.env` absent du repo, `.env.example` présent.
- Port `27017` non exposé sur l'hôte.
- `npm run lint` retourne `0`.
- `npm test` retourne `0` et affiche la couverture.
- Le Jenkinsfile contient les 6 stages demandés et référence TaskFlow API.

## Répartition des tâches

| Membre | Contributions |
| --- | --- |
| Arthur Courchay | Modèle `Task`, routes REST Express, validation métier, tests Jest sur les endpoints critiques, Dockerfile API non-root, rédaction des sections API/qualité du README |

| Mathias | Docker Compose, intégration MongoDB/Nginx, Jenkins comme service Docker, préparation des credentials Jenkins, webhook GitHub, captures Jenkins pour le rapport |

| Binôme | Relecture croisée, correction ESLint, test du build rouge volontaire, validation `docker compose up`, finalisation du rapport PDF |

Cette répartition doit rester cohérente avec ce que chacun sait expliquer à l'oral: chaque membre doit pouvoir présenter l'ensemble du pipeline, même si certaines parties ont un référent principal.

## Rapport

Le rapport PDF doit documenter l'architecture, les choix Docker, les 6 stages Jenkins, un build vert, un build rouge volontaire au stage Lint, le webhook GitHub et la répartition précise des tâches.


Test pour Ngrok numéro 2.