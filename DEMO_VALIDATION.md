# Demo validation - Applications Web Distribuees

## Lancement Docker

```powershell
cd C:\Users\DELL\Desktop\Web_Dest\microservices-project
docker compose -f docker\complete-stack.yml up -d --build
```

## Liens

- Frontend: http://localhost:3000
- Gateway: http://localhost:8080
- Eureka: http://localhost:8761
- RabbitMQ: http://localhost:15672 (`guest` / `guest`)
- Keycloak: http://localhost:8180
- Config Server: http://localhost:8888

## Comptes

- Admin: `admin` / `adminpass`
- Recruteur: `recruiter1` / `recruiter1pass`
- Candidat: `user1` / `user1pass`

## Scenarios a montrer

1. Eureka: montrer `API-GATEWAY`, `OFFRE-SERVICE`, `CANDIDATURE-SERVICE`, `AUTH-SERVICE`.
2. Gateway + Keycloak: se connecter via frontend, puis appeler les APIs avec token.
3. CRUD offres: recruteur cree/modifie/supprime une offre.
4. CRUD candidatures: candidat postule, recruteur accepte/refuse, admin consulte.
5. Communication synchrone REST Node vers Spring: `candidature-service-nodejs` verifie l'existence de l'offre avant de creer une candidature.
6. Communication synchrone Feign Spring vers Node:

```powershell
# avec un token recruteur/admin
GET http://localhost:8080/api/offres/1/stats-candidatures
```

7. Communication asynchrone RabbitMQ:
   - `offre.exchange` avec `offre.created`
   - `candidature.exchange` avec `candidature.created`
   - `candidature.exchange` avec `candidature.status.updated`

## Valeurs ajoutees defendables

- Dashboards separes par roles: ADMIN, RECRUITER, USER.
- Communication asynchrone bidirectionnelle visible dans RabbitMQ.
- Docker Compose complet avec bases de donnees, Gateway, Eureka, Config Server, Keycloak, RabbitMQ et frontend.
- Theme Keycloak personnalise `job-portal`.
