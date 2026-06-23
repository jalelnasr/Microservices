# Kubernetes - Job Portal

Ces manifests permettent de presenter une valeur ajoutee Kubernetes pour le projet Job Portal.

## Prerequis

- Docker Desktop avec Kubernetes active, ou Minikube.
- `kubectl` installe.
- Les images applicatives doivent etre construites localement ou poussees dans un registry.

## Images attendues

Les manifests utilisent ces noms d'images:

```text
job-portal/config-server:latest
job-portal/eureka-server:latest
job-portal/api-gateway:latest
job-portal/offre-service:latest
job-portal/candidature-service-nodejs:latest
job-portal/auth-service:latest
job-portal/frontend:latest
```

Construire les images localement:

```powershell
docker build -t job-portal/config-server:latest ./config-server
docker build -t job-portal/eureka-server:latest ./eureka-server
docker build -t job-portal/api-gateway:latest ./api-gateway
docker build -t job-portal/offre-service:latest ./offre-service
docker build -t job-portal/candidature-service-nodejs:latest ./candidature-service-nodejs
docker build -t job-portal/auth-service:latest ./auth-service
docker build -t job-portal/frontend:latest ./frontend
```

Avec Minikube, executer avant le build:

```powershell
minikube docker-env | Invoke-Expression
```

## Deploiement

```powershell
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmaps-secrets.yaml
kubectl apply -f k8s/02-databases.yaml
kubectl apply -f k8s/03-infrastructure.yaml
kubectl apply -f k8s/04-backend-services.yaml
kubectl apply -f k8s/05-frontend.yaml
kubectl apply -f k8s/06-monitoring.yaml
```

Verifier:

```powershell
kubectl get pods -n job-portal
kubectl get svc -n job-portal
```

## Acces local par port-forward

```powershell
kubectl port-forward -n job-portal svc/frontend 3000:80
kubectl port-forward -n job-portal svc/api-gateway 8080:8080
kubectl port-forward -n job-portal svc/eureka-server 8761:8761
kubectl port-forward -n job-portal svc/keycloak 8180:8180
kubectl port-forward -n job-portal svc/rabbitmq 15672:15672
kubectl port-forward -n job-portal svc/prometheus 9090:9090
kubectl port-forward -n job-portal svc/grafana 3001:3000
```

URLs:

- Frontend: http://localhost:3000
- Gateway: http://localhost:8080
- Eureka: http://localhost:8761
- Keycloak: http://localhost:8180
- RabbitMQ: http://localhost:15672
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## Suppression

```powershell
kubectl delete namespace job-portal
```
