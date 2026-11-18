<div align="center">

# Fairly

**Split expenses and settle debts between individuals.** 💚

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-8.4-777BB4.svg?logo=php&logoColor=white)](https://www.php.net/)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Helm-326CE5?logo=kubernetes&logoColor=white)](https://helm.sh/)

![app-ci-workflow](https://github.com/makomweb/fairly/actions/workflows/app-ci.yaml/badge.svg)
[![Core Coverage](https://img.shields.io/codecov/c/github/makomweb/fairly/master.svg?flag=core&token=O6WQ8USL6T)](https://app.codecov.io/gh/makomweb/fairly)

</div>

---

## 🎯 Purpose

A full-stack, cloud-native web application for tracking and splitting expenses and settling debts among 2 individuals. Built on **PHP 8.4**, **Symfony 8**, **MySQL 8**, and **React 19**, featuring **event sourcing** for a complete audit trail.

By strictly isolating the **Core** from infrastructure and framework code (enforced via [deptrac](https://github.com/deptrac/deptrac)), the business logic achieves **100% test coverage**.

## 📸 Screenshots

<table>
  <tr>
    <td><img src="./images/login.png" alt="Login view" width="260px"></td>
    <td><img src="./images/track.png" alt="Track view" width="260px"></td>
    <td><img src="./images/calculate.png" alt="Calculate view" width="260px"></td>
  </tr>
</table>

## 🚀 Quick Start (Local Development)

### Prerequisites
* [Make](https://www.gnu.org/software/make/)
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Run
```bash
make start    # Build images, start services, and open in browser
make help     # Show all available targets
```
Visit `http://localhost:8000` in your browser.

## 🚢 Kubernetes & Helm Deployment

Deploy production-ready with Helm:
```bash
# Build production images & deploy
make prod
helm upgrade --install app ./helm --set replicaCount.app=3 --set replicaCount.worker=2
```
For detailed Kubernetes setup, port-forwarding, and architecture, see [docs/KUBERNETES.md](./docs/KUBERNETES.md).

## 🏛️ Architecture

* **Backend Layers:** Clear separation into 3 subdomains: *Core*, *Supporting*, and *Generic*.
* **Event Sourcing:** Full audit trail stored in MySQL.

For full system diagrams and deep-dive architecture insights, check out [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🤝 Contributing & Documentation

* **[Contributing Guide](./docs/CONTRIBUTING.md):** Running tests, code style, and database migrations.
* **[Kubernetes Guide](./docs/KUBERNETES.md):** Pod structure, storage, and monitoring.
* **[Architecture Overview](./docs/ARCHITECTURE.md):** Detailed flowcharts and DDD boundaries.
