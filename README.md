# Kids App - React + TypeScript + Vite + TanStack Router + Bun + tRPC

This is an educational kids app built with React, TypeScript, Vite, and TanStack Router for file-based routing, with a Bun server backend using tRPC for API communication and SQLite for data storage.

## Features

- 🎮 Multiple educational games (Asteroids, German States, Clock Learning, Geometric Forms)
- 🧭 File-based routing with TanStack Router for better scalability
- 📱 PWA support with offline capabilities
- 🎨 Mantine UI components
- ⚡ Fast development with Vite and HMR
- 🚀 Bun server for high-performance backend
- 🔌 tRPC for type-safe API communication
- 💾 SQLite database with Drizzle ORM

## Architecture

### Frontend
The app uses TanStack Router for file-based routing, which provides:
- Type-safe routing
- Automatic code splitting
- Easy addition of new games/routes
- Better developer experience with route generation

Routes are defined in `src/routes/`:
- `__root.tsx` - Root layout with Mantine provider
- `index.tsx` - Dashboard/home page
- `asteroids.tsx` - Asteroids game
- `germanstates.tsx` - German States game
- `clock.tsx` - Clock learning game
- `geometricforms.tsx` - Geometric forms game

Game components are in `src/components/`.

### Backend
The app uses a Bun server with tRPC for API endpoints:
- **Server**: `server/index.ts` - Main Bun HTTP server
- **tRPC Router**: `server/trpc/router.ts` - API endpoints
- **Database**: SQLite with Drizzle ORM
- **Schema**: `server/db/schema.ts` - Database schema definitions

### API Endpoints
The tRPC API provides the following endpoints:
- `health` - Health check endpoint
- `user.list` - List all users
- `user.getById` - Get user by ID
- `user.create` - Create a new user
- `user.update` - Update an existing user
- `user.delete` - Delete a user

## Deployment

This application is deployed to Kubernetes at [https://kids.aiacta.com](https://kids.aiacta.com).

All deployments use git SHA-based versioning to ensure specific versions are always deployed.

### Production Deployment

The deployment process is automated through GitHub Actions:

1. **Build**: A multi-stage Docker image is built using Bun
   - Git SHA is embedded in the image as a build argument and label
   - Git SHA is stored in `/app/dist/version.txt` for runtime access
2. **Push**: The image is pushed to GitHub Container Registry (ghcr.io) with tags:
   - `latest` tag for the most recent main branch build
   - `main-{SHA}` tag for the specific commit
3. **Deploy**: A self-hosted runner deploys the application to the Kubernetes cluster
   - Uses the `main-{SHA}` tag to ensure a specific version is deployed
   - Adds deployment annotation with the git SHA for tracking

### PR Review Apps

Pull requests automatically deploy review apps to test changes before merging:

- **URL Pattern**: `https://pr-{number}.kids.aiacta.com` (e.g., `https://pr-42.kids.aiacta.com`)
- **Automatic Deployment**: Review apps are deployed when PRs are opened or updated
- **Automatic Cleanup**: Review apps are removed when PRs are closed or merged
- **Resources**: Each review app runs with 1 replica (vs 2 for production) in the `kids` namespace

### Kubernetes Resources

All resources are deployed to the `kids` namespace using Helm:

- **Helm Chart**: Located in `helm/kids/`
- **Namespace**: Dedicated namespace for the application
- **Deployment**: Runs 2 replicas with resource limits (1 replica for review apps)
- **Service**: ClusterIP service exposing port 3000
- **Ingress**: NGINX ingress with TLS using Let's Encrypt via cert-manager

### Manual Deployment

To manually deploy changes:

```bash
# Get the current git SHA
GIT_SHA=$(git rev-parse --short HEAD)

# Build and push the Docker image with git SHA
docker build --build-arg GIT_SHA=${GIT_SHA} -t ghcr.io/rouby/kids:main-${GIT_SHA} .
docker tag ghcr.io/rouby/kids:main-${GIT_SHA} ghcr.io/rouby/kids:latest
docker push ghcr.io/rouby/kids:main-${GIT_SHA}
docker push ghcr.io/rouby/kids:latest

# Deploy with Helm (requires kubectl and helm)
helm upgrade --install kids ./helm/kids \
  --namespace kids \
  --create-namespace \
  --set image.tag=main-${GIT_SHA} \
  --set-string deployment.annotations."deployment\.kubernetes\.io/revision-sha"=${GIT_SHA} \
  --wait

# Deploy a PR review app manually
PR_NUMBER=42
GIT_SHA=$(git rev-parse --short HEAD)
docker build --build-arg GIT_SHA=${GIT_SHA} -t ghcr.io/rouby/kids:pr-${PR_NUMBER}-${GIT_SHA} .
docker push ghcr.io/rouby/kids:pr-${PR_NUMBER}-${GIT_SHA}

helm upgrade --install kids-pr-${PR_NUMBER} ./helm/kids \
  --namespace kids \
  --create-namespace \
  --set fullnameOverride=kids-pr-${PR_NUMBER} \
  --set image.tag=pr-${PR_NUMBER}-${GIT_SHA} \
  --set-string deployment.annotations."deployment\.kubernetes\.io/revision-sha"=${GIT_SHA} \
  --set replicaCount=1 \
  --set ingress.hosts[0].host=pr-${PR_NUMBER}.kids.aiacta.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=Prefix \
  --set ingress.tls[0].secretName=kids-pr-${PR_NUMBER}-tls \
  --set ingress.tls[0].hosts[0]=pr-${PR_NUMBER}.kids.aiacta.com \
  --wait
```

### Version Information

The deployed git SHA can be accessed at runtime:
- In the container: `cat /app/dist/version.txt`
- Via HTTP: `https://kids.aiacta.com/version.txt`
- Docker image label: `git.sha`
- Deployment pod annotation: `deployment.kubernetes.io/revision-sha`

## Development

### Getting Started

```bash
# Install dependencies
bun install

# Start development server (frontend only - Vite dev server)
bun run dev

# Start backend server (for API development)
bun run server:dev

# Build for production
bun run build

# Start production server (serves built frontend + API)
bun run start

# Run linter
bun run lint

# Database commands
bun run db:generate  # Generate migrations from schema changes
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Drizzle Studio for database management
```

### Development Workflow

For full-stack development, run both servers:
1. Terminal 1: `bun run dev` (frontend with hot reload on port 5173)
2. Terminal 2: `bun run server:dev` (backend with auto-reload on port 3000)

The Vite dev server proxies `/api` requests to the backend server.

### Adding New Games/Routes

1. Create a new component in `src/components/` (e.g., `NewGame.tsx`)
2. Create a new route file in `src/routes/` (e.g., `newgame.tsx`)
3. Add a link to the game in `src/routes/index.tsx` (Dashboard)
4. TanStack Router will automatically generate the route tree

### Technology Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Bun** - JavaScript runtime, package manager, and HTTP server
- **TanStack Router** - File-based routing
- **tRPC** - End-to-end type-safe API
- **Drizzle ORM** - TypeScript ORM for database
- **SQLite** - Embedded database (via bun:sqlite)
- **Mantine** - UI component library
- **Framer Motion** - Animations
- **Vite PWA Plugin** - Progressive Web App support

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
