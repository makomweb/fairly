# 🚢 Kubernetes & Helm Deployment

This guide covers deploying **Fairly** to a Kubernetes cluster using Helm.

---

## Prerequisites

* [Make](https://www.gnu.org/software/make/)
* [Docker](https://www.docker.com/)
* [Kubernetes](https://kubernetes.io/) (kind, minikube, or Docker Desktop)
* [Helm 3](https://helm.sh/)

---

## Deployment Commands

```bash
# 1. Build production images
make prod

# 2. Deploy with 3 app pods + 2 worker pods
helm install app ./helm --set replicaCount.app=3 --set replicaCount.worker=2

# Or upgrade an existing release:
helm upgrade --install app ./helm
```

---

## Accessing the Application

* **Via NodePort:**
  Open [http://localhost:30190](http://localhost:30190) in your browser.
* **Via Port Forwarding:**
  ```bash
  kubectl port-forward svc/app-fairly-web 8080:80
  ```
  Then visit [http://localhost:8080](http://localhost:8080).

---

## Monitoring & Logs

View live logs for all pods with the PHP label (`app` + `worker`):

```bash
kubectl logs -f -l technology=php
```

---

## Cluster Components

* **nginx (web):** Serves React SPA frontend, static assets, and EasyAdmin UI. Proxies API requests to PHP-FPM via FastCGI.
* **PHP-FPM (app):** Symfony backend handling business logic, API endpoints, and session management (stored in MySQL).
* **Worker:** Processes async jobs via Symfony Messenger using a one-shot pattern (processes a single message per pod lifecycle, then restarts for a fresh environment).
* **MySQL:** Persistent data storage via StatefulSet and PVC (8Gi). Stores the event sourcing audit trail, sessions, and application data.
* **db-init Job:** One-time database initialization (schema, fixtures, migrations).
* **Grafana Alloy:** Log collection and metrics forwarding for observability across all cluster components.

---

> 💡 Looking for the cluster diagram? Check out [ARCHITECTURE.md](./ARCHITECTURE.md).