# Contributing to Fairly

## Development Setup

```bash
make start    # Build images, start services, and open in browser
make help     # Show all available targets
```

Visit `http://localhost:8000` in your browser.

## Running Tests

```bash
# Run all tests (backend + frontend)
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Run quality checks (phpstan, php-cs-fixer, etc.)
make quality

# Generate coverage report
make coverage
```

## Backend Development

The backend runs in a Docker container. Always run commands inside the container:

```bash
# Open shell on app container
make shell

# Run composer commands
make composer cmd='install'

# Run Symfony console commands
docker compose exec -T app bin/console <command>
```

## Frontend Development

The frontend dev server runs with HMR (Hot Module Replacement):

```bash
# The dev server auto-starts with `make start`
# It's available at http://localhost:5173

# Manual start
cd frontend
npm run dev

# Build for production
npm run build
```

## Code Style

```bash
# Fix code style (PHP)
make style

# Run static analysis
make phpstan

# Check architecture constraints
make arch
```

## Testing Guidelines

- Write tests alongside the code you implement
- For backend: Use PHPUnit, extend appropriate test base class
- For frontend: Use Vitest, test components and functions
- Aim for coverage of feature behavior, not just line coverage

## Database Migrations

After entity changes:

```bash
docker compose exec -T app bin/console make:migration
docker compose exec -T app bin/console doctrine:migrations:migrate
```

## Common Workflows

### Adding a new feature

1. Create a branch from `main`
2. Implement feature with tests
3. Run `make test` & `make quality` to verify
4. Create a pull request

### Debugging

- **Backend logs**: `docker compose logs app`
- **Frontend console**: Browser DevTools (F12)
- **Database**: Connect via `docker compose ps` (port 3306)
- **Profiler**: Visit `http://localhost:8080/_profiler`

## Deployment

See `helm/` directory for Kubernetes deployment configuration.

For Docker Compose production deployment:

```bash
make prod      # Build production images
docker compose -f docker-compose.prod.yaml up -d
```
