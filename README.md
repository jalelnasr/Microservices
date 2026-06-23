# Job Portal - Applications Web Distribuees

Projet de rattrapage du module Applications Web Distribuees.

Application de recrutement basee sur une architecture microservices avec React, Spring Boot, Node.js, Docker, Eureka, Gateway, Config Server, Keycloak, RabbitMQ, Prometheus et Grafana.

## Table des matieres

- Architecture
- Technologies utilisees
- Structure du projet
- Lancer le projet
- Utilisateurs de test
- Endpoints API
- Communication entre microservices
- Securite Keycloak
- Monitoring Prometheus/Grafana
- CI/CD GitHub Actions
- Valeurs ajoutees

## Architecture

```text
Frontend React :3000
        |
        | HTTP + JWT Keycloak
        v
API Gateway Spring Cloud :8080
        |
        +--> Offre Service Spring Boot :8081 + MySQL
        |
        +--> Candidature Service Node.js :8082 + PostgreSQL

Services techniques:
- Eureka Discovery Server :8761
- Config Server :8888
- Keycloak :8180
- RabbitMQ :5672 / :15672
- Prometheus :9090
- Grafana :3001
```

## Technologies utilisees

| Composant | Technologie | Port |
|---|---:|---:|
| Frontend | React 18 + Material UI + Keycloak.js | 3000 |
| API Gateway | Spring Cloud Gateway | 8080 |
| MS1 - Offres | Spring Boot 3 + MySQL | 8081 |
| MS2 - Candidatures | Node.js + Express + PostgreSQL | 8082 |
| Discovery | Netflix Eureka | 8761 |
| Config Server | Spring Cloud Config | 8888 |
| Securite | Keycloak | 8180 |
| Messaging | RabbitMQ | 5672 / 15672 |
| Monitoring | Prometheus + Grafana | 9090 / 3001 |
| Conteneurisation | Docker Compose | - |
| CI/CD | GitHub Actions | - |

## Structure du projet

```text
microservices-project/
|-- frontend/                    # Interface React
|-- api-gateway/                 # Gateway Spring Cloud + securite JWT
|-- offre-service/               # Microservice Spring Boot + MySQL
|-- candidature-service-nodejs/  # Microservice Node.js + PostgreSQL
|-- auth-service/                # Service support pour Keycloak
|-- eureka-server/               # Serveur de decouverte
|-- config-server/               # Serveur de configuration
|-- config-repo/                 # Configurations centralisees
|-- docker/
|   |-- complete-stack.yml       # Stack Docker principale
|   |-- keycloak/                # Realm + theme Keycloak personnalise
|   |-- prometheus/              # Configuration Prometheus
|   `-- grafana/                 # Datasource Grafana
|-- .github/workflows/ci.yml     # Pipeline CI/CD
|-- DEMO_VALIDATION.md           # Script de demonstration
`-- README.md
```

## Lancer le projet

La version dockerisee est celle a presenter.

```powershell
cd C:\Users\DELL\Desktop\Web_Dest\microservices-project
docker compose -f docker\complete-stack.yml up -d --build
```

Verifier les conteneurs:

```powershell
docker compose -f docker\complete-stack.yml ps
```

Voir les logs:

```powershell
docker compose -f docker\complete-stack.yml logs -f
```

Arreter l'application:

```powershell
docker compose -f docker\complete-stack.yml down
```

## Liens utiles

| Outil | URL | Login |
|---|---|---|
| Frontend | http://localhost:3000 | comptes Keycloak |
| Gateway | http://localhost:8080 | token JWT |
| Eureka | http://localhost:8761 | public local |
| Config Server | http://localhost:8888 | public local |
| Keycloak | http://localhost:8180 | admin / admin |
| RabbitMQ | http://localhost:15672 | guest / guest |
| Prometheus | http://localhost:9090 | public local |
| Grafana | http://localhost:3001 | admin / admin |

## Utilisateurs de test

| Username | Password | Role | Acces |
|---|---|---|---|
| admin | adminpass | ADMIN | Voir et gerer toute la plateforme |
| recruiter1 | recruiter1pass | RECRUITER | CRUD offres + gestion candidatures |
| user1 | user1pass | USER | Voir les offres + postuler + mes candidatures |

## Endpoints API

Tous les appels applicatifs passent par la Gateway: `http://localhost:8080`.

### Offre Service - `/api/offres`

| Methode | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/api/offres` | Authentifie | Liste des offres |
| GET | `/api/offres/{id}` | Authentifie | Detail d'une offre |
| POST | `/api/offres` | ADMIN / RECRUITER | Creer une offre |
| PUT | `/api/offres/{id}` | ADMIN / RECRUITER | Modifier une offre |
| DELETE | `/api/offres/{id}` | ADMIN / RECRUITER | Supprimer une offre |
| GET | `/api/offres/{id}/stats-candidatures` | ADMIN / RECRUITER | Statistiques via Feign vers Node.js |

### Candidature Service - `/api/candidatures`

| Methode | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/api/candidatures` | USER / ADMIN / RECRUITER | Postuler a une offre |
| GET | `/api/candidatures` | ADMIN / RECRUITER | Toutes les candidatures |
| GET | `/api/candidatures/user/{userId}` | USER proprietaire / ADMIN / RECRUITER | Candidatures d'un utilisateur |
| GET | `/api/candidatures/{id}` | USER proprietaire / ADMIN / RECRUITER | Detail candidature |
| PUT | `/api/candidatures/{id}` | USER proprietaire / ADMIN / RECRUITER | Modifier candidature |
| PATCH | `/api/candidatures/{id}/status` | ADMIN / RECRUITER | Accepter ou refuser |
| DELETE | `/api/candidatures/{id}` | USER proprietaire / ADMIN / RECRUITER | Supprimer candidature |

## Communication entre microservices

### Communication synchrone

1. Node.js vers Spring Boot:
   - `candidature-service-nodejs` appelle `offre-service`.
   - Objectif: verifier l'existence d'une offre avant de sauvegarder une candidature.

2. Spring Boot vers Node.js avec OpenFeign:
   - `offre-service` appelle `candidature-service`.
   - Endpoint demo: `GET /api/offres/{id}/stats-candidatures`.
   - Objectif: recuperer le nombre de candidatures d'une offre.

### Communication asynchrone RabbitMQ

1. Creation d'une offre:
   - Exchange: `offre.exchange`
   - Routing key: `offre.created`
   - Queue: `offre.created.queue`

2. Creation d'une candidature:
   - Exchange: `candidature.exchange`
   - Routing key: `candidature.created`
   - Queue: `candidature.created.queue`

3. Changement de statut:
   - Exchange: `candidature.exchange`
   - Routing key: `candidature.status.updated`
   - Queue: `candidature.status.updated.queue`

## Securite Keycloak

- Realm: `microservices-realm`
- Client frontend: `frontend-client`
- Gateway protegee comme Resource Server OAuth2.
- JWT relaye depuis la Gateway vers les microservices.
- Roles applicatifs:
  - `USER`
  - `RECRUITER`
  - `ADMIN`
- Theme Keycloak personnalise: `job-portal`.

## Monitoring Prometheus/Grafana

Prometheus scrape:

- `api-gateway:8080/actuator/prometheus`
- `offre-service:8081/actuator/prometheus`
- `candidature-service:8082/metrics`
- `eureka-server:8761/actuator/prometheus`
- `config-server:8888/actuator/prometheus`

Grafana est disponible sur:

```text
http://localhost:3001
admin / admin
```

La datasource Prometheus est configuree automatiquement.

## CI/CD GitHub Actions

Le workflow `.github/workflows/ci.yml` execute:

- build Maven des services Spring
- installation des services Node.js
- build du frontend React
- validation de la configuration Docker Compose

Le workflow se lance automatiquement sur push vers `main` ou `master`.

## Demonstration rapide

1. Lancer Docker Compose.
2. Ouvrir Eureka et montrer les services enregistres.
3. Ouvrir Keycloak et montrer le realm, les roles et le theme.
4. Se connecter en recruteur et creer une offre.
5. Se connecter en candidat et postuler.
6. Se reconnecter en recruteur et accepter/refuser la candidature.
7. Ouvrir RabbitMQ et montrer les exchanges/queues.
8. Ouvrir Prometheus puis Grafana.
9. Montrer le fichier GitHub Actions.

## Valeurs ajoutees

- Monitoring Prometheus/Grafana.
- CI/CD avec GitHub Actions.
- Theme Keycloak personnalise.
- Securite par roles jusqu'au microservice candidature.
- Communication synchrone dans les deux sens.
- Communication asynchrone RabbitMQ avec plusieurs evenements metier.
- Documentation de demonstration dans `DEMO_VALIDATION.md`.
