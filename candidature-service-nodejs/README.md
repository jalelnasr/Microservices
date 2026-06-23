# Candidature Service - Node.js + PostgreSQL

Microservice de gestion des candidatures développé avec **Node.js**, **Express.js** et **PostgreSQL**.

## 🚀 Technologies

- **Node.js 18** + Express.js
- **PostgreSQL 15** avec Sequelize ORM
- **Eureka** pour service discovery
- **RabbitMQ** pour communication asynchrone
- **Keycloak** pour authentification JWT
- **Docker** pour conteneurisation

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` :

```env
NODE_ENV=docker
PORT=8082

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=candidature_db
DB_USER=candidature_user
DB_PASSWORD=candidature_password

# Eureka
EUREKA_HOST=eureka-server
EUREKA_PORT=8761

# Keycloak
KEYCLOAK_URL=http://keycloak:8180
KEYCLOAK_REALM=microservices-realm

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Offre Service
OFFRE_SERVICE_URL=http://offre-service:8081
```

## 🏃 Lancement

```bash
# Dev mode
npm run dev

# Production
npm start
```

## 🐳 Docker

```bash
docker build -t candidature-service-nodejs .
docker run -p 8082:8082 candidature-service-nodejs
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidatures` | Liste toutes les candidatures |
| GET | `/api/candidatures/:id` | Détails d'une candidature |
| POST | `/api/candidatures` | Créer une candidature |
| PATCH | `/api/candidatures/:id/statut` | Modifier le statut |
| GET | `/api/candidatures/user/:userId` | Candidatures d'un user |
| GET | `/api/candidatures/offre/:offreId` | Candidatures pour une offre |

## 🔐 Sécurité

Toutes les routes nécessitent un token JWT Keycloak valide dans le header:
```
Authorization: Bearer <token>
```

## 🔄 Communication

### Synchrone (HTTP/REST)
- Appel à Offre-Service pour vérifier existence de l'offre

### Asynchrone (RabbitMQ)
- Écoute les événements `offre.created` pour synchronisation
