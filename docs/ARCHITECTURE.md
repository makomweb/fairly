# 🏛️ Architecture

This document provides an overview of the local development environment, backend domain boundaries, and Kubernetes cluster architecture for **Fairly**.

---

## System & Local Development Architecture

```
                        Browser / Client
                               │
              ┌────────────────┼─────────────────┐
              │ :8000          │ :8080           │ :5173 (dev)
              ▼                ▼                 ▼
       ┌────────────┐  ┌──────────────┐  ┌───────────────┐
       │  dashboard │  │  web (Nginx) │  │  npm-dev      │
       │  (Homer)   │  │              │  │  (Vite/React/ │
       └────────────┘  └──────┬───────┘  │   TypeScript) │
                              │ FastCGI  └───────────────┘
                              │ :9000
                              ▼
                    ┌──────────────────┐     async       ┌──────────────┐
                    │  app (PHP-FPM)   │────messages────▶│  worker      │
                    │  Symfony         │                 │  (Messenger) │
                    └──────────────────┘                 └──────────────┘
                              │                                 │
                              └────────────────┬────────────────┘
                                               │ SQL
                                               ▼
                                      ┌─────────────────┐
                                      │  db (MySQL)     │
                                      └─────────────────┘
```

---

## Backend Layers (DDD)

Fairly follows Domain-Driven Design (DDD) principles to separate the application into generic, core, and supporting domains — enforced by [deptrac](https://github.com/deptrac/deptrac). This isolation makes it easy to achieve full code coverage for the core domain.

```
  ───────────────────────── Backend Layers ─────────────────────────

  ┌─────────────────────────────────────────────────────────────────┐
  │  Supporting  │ Controllers · Auth · Repositories · Async        │
  │              │ Normalizers · Instrumentation · EventListeners   │
  ├──────────────┴──────────────────────────────────────────────────┤
  │  Core        │ ExpenseTracker · Calculator                      │
  │              │ Event Sourcing · Expenses · Compensation         │
  ├──────────────┴──────────────────────────────────────────────────┤
  │  Generic     │ Symfony · Doctrine · Twig · DomPDF · Monolog     │
  │              │ PhpParser · phpDocumenter · OpenAPI              │
  └─────────────────────────────────────────────────────────────────┘
         Supporting depends on Core & Generic · Core has no deps
```

---

## Kubernetes Cluster Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Kubernetes Cluster                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   nginx (web)    │  │ app (PHP-FPM)    │  │ worker           │      │
│  │ Deployment       │  │ Deployment       │  │ (Messenger)      │      │
│  │ NodePort:30190   │  │ Pod × 1          │  │ Pod × 1          │      │
│  │ Pods × 1         │─→│ FastCGI :9000    │  │ One-shot pattern │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│         │                       │                       │              │
│         │ Serves SPA            │ Business logic        │ Async tasks  │
│         │ EasyAdmin             │ API endpoints         │ from queue   │
│         │ Static assets         │ Session mgmt (DB)     │              │
│         │                       │ Event sourcing (DB)   │              │
│         │                       │                       │              │
│         └───────────┬───────────┴───────────┬───────────┘              │
│                     │                       │                          │
│              ┌──────▼───────────────────────▼──┐                       │
│              │   MySQL StatefulSet             │                       │
│              │   PVC Storage (8Gi)             │                       │
│              │   - Event store                 │                       │
│              │   - Sessions                    │                       │
│              │   - Application data            │                       │
│              └─────────────────────────────────┘                       │
│                     △                                                  │
│                     │ init Job                                         │
│              ┌──────┴──────┐                                           │
│              │ db-init     │                                           │
│              │ (one-time)  │                                           │
│              └─────────────┘                                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Grafana Alloy (k8s-monitoring)                               │      │
│  │ - Collects logs from all pods                                │      │
│  │ - Metrics collection & forwarding                            │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```