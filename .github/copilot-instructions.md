# Copilot Instructions for Kids App

## Repository Overview

This is an educational kids app built with React, TypeScript, Vite, and TanStack Router. The application features multiple educational games (Asteroids, German States, Clock Learning, Geometric Forms, Makeup Artist) and uses a Bun server backend with tRPC for type-safe API communication and PostgreSQL for data storage.

**Live Deployment**: https://kids.aiacta.com

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript 5** - Type safety throughout
- **Vite 7** - Build tool and dev server with HMR
- **TanStack Router** - File-based routing with automatic code splitting
- **Mantine UI** - Component library for UI elements
- **Framer Motion** - Animation library
- **PixiJS + @pixi/react** - For game rendering (especially Asteroids game)
- **Vite PWA Plugin** - Progressive Web App support with offline capabilities

### Backend
- **Bun** - JavaScript runtime, package manager, and HTTP server
- **tRPC** - End-to-end type-safe API communication
- **Drizzle ORM** - TypeScript ORM for database
- **PostgreSQL** - Database (via @electric-sql/pglite for embedded PostgreSQL)
- **SimpleWebAuthn** - WebAuthn authentication

### Build & Development
- **ESLint** - Code linting with TypeScript and React plugins
- **PostCSS** - CSS processing with Mantine preset
- **Docker** - Multi-stage builds for deployment
- **Kubernetes** - Production deployment with Helm charts

## Architecture

### Directory Structure
```
├── .github/                 # GitHub Actions workflows and configs
│   └── workflows/          # CI/CD pipelines (kubernetes.yml, pr-review-app.yml, etc.)
├── helm/                    # Kubernetes Helm charts for deployment
├── public/                  # Static assets
├── server/                  # Backend server code
│   ├── db/                 # Database setup, schema, and migrations
│   │   ├── schema.ts       # Drizzle ORM schema definitions
│   │   ├── migrate.ts      # Migration runner
│   │   └── migrations/     # Database migrations
│   ├── trpc/               # tRPC router and context
│   │   ├── router.ts       # Main API router
│   │   ├── authRouter.ts   # Authentication endpoints
│   │   ├── context.ts      # Request context creation
│   │   └── trpc.ts         # tRPC setup
│   ├── utils/              # Server utilities
│   └── index.ts            # Main Bun HTTP server
├── src/                     # Frontend source code
│   ├── components/         # React components (game components)
│   ├── hooks/              # Custom React hooks
│   ├── routes/             # TanStack Router file-based routes
│   │   ├── __root.tsx      # Root layout with Mantine provider
│   │   ├── index.tsx       # Dashboard/home page
│   │   └── [game].tsx      # Individual game routes
│   ├── utils/              # Frontend utilities
│   │   └── trpc.ts         # tRPC client setup
│   └── main.tsx            # App entry point
├── Dockerfile               # Multi-stage Docker build
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config for frontend
├── vite.config.ts          # Vite configuration
└── README.md               # Comprehensive project documentation
```

### Request Flow
1. **Development**: Vite dev server (port 5173) proxies `/api` requests to backend (port 3000)
2. **Production**: Bun server serves static files from `dist/` and handles `/api/trpc` requests
3. **Routing**: TanStack Router handles client-side routing with file-based route definitions
4. **API**: tRPC provides type-safe API calls from frontend to backend

## Development Commands

### Installation
```bash
# Install dependencies
npm install
# or with bun (if available)
bun install
```

### Development Workflow
For full-stack development, run both servers in separate terminals:

**Terminal 1 - Frontend (with hot reload)**:
```bash
npm run dev  # Starts Vite dev server on port 5173
```

**Terminal 2 - Backend (with auto-reload)**:
```bash
npm run server:dev  # Starts Bun server on port 3000
```

The Vite dev server automatically proxies `/api` requests to the backend server.

### Build & Production
```bash
# Build for production
npm run build

# Start production server (serves built frontend + API)
npm run start
```

### Linting
```bash
# Run ESLint
npm run lint
```

**Note**: There are existing lint warnings/errors in the codebase. When making changes, focus on not introducing new lint issues rather than fixing all existing ones.

### Database Commands
```bash
# Generate migrations from schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Drizzle Studio for database management
npm run db:studio
```

## Coding Conventions & Patterns

### File Organization
- **Components**: Place game components in `src/components/` (e.g., `AsteroidsGame.tsx`)
- **Routes**: Create route files in `src/routes/` (e.g., `asteroids.tsx`) - TanStack Router auto-generates route tree
- **Hooks**: Custom hooks go in `src/hooks/` (e.g., `useAuth.tsx`, `usePoints.tsx`)
- **Server Code**: Backend logic in `server/`, tRPC routers in `server/trpc/`

### TypeScript Conventions
- **Strict mode enabled**: All TypeScript strict checks are on
- **No unused variables**: The linter enforces no unused locals/parameters
- **Path mapping**: Use `~/*` alias for `./src/*` imports (e.g., `import { X } from '~/components/X'`)
- **Type inference**: Drizzle ORM provides type inference for database models (use `typeof users.$inferSelect`)

### React Patterns
- **Functional components**: All components are functional with hooks
- **File-based routing**: Use TanStack Router's `createFileRoute()` pattern
- **Component exports**: Route files should export a `Route` constant
- **Mantine UI**: Use Mantine components for UI (`Button`, `Container`, `Stack`, etc.)
- **tRPC hooks**: Use `useTRPC()` hook for API access, combine with `useQuery`/`useMutation` from TanStack Query

### Game Development (PixiJS)
- **Registration**: Register PixiJS components with `extend({ Container, Sprite, Text, Graphics })`
- **Game loop**: Use `useTick()` hook from `@pixi/react` for game loop
- **Collision detection**: Optimize with circle-based collision (no expensive `Math.sqrt`)
- **Example pattern**: See `src/components/AsteroidsGame.tsx` for reference

### Database Schema
- **PostgreSQL**: Using PostgreSQL (via @electric-sql/pglite) instead of SQLite
- **Schema definition**: Use Drizzle ORM in `server/db/schema.ts`
- **Migrations**: Generate migrations with `npm run db:generate`, then apply with `npm run db:push`
- **Tables**: Current tables are `users`, `highScores`, and `authenticators`

### API Development (tRPC)
- **Type-safe**: tRPC provides end-to-end type safety between client and server
- **Router structure**: Main router in `server/trpc/router.ts`, auth router in `authRouter.ts`
- **Procedures**: Use `.query()` for reads, `.mutation()` for writes
- **Validation**: Use Zod for input validation
- **Current endpoints**: health, user.*, auth.* (see router files for details)

## Adding New Features

### Adding a New Game
1. Create component in `src/components/NewGame.tsx`
2. Create route file in `src/routes/newgame.tsx`:
   ```typescript
   import { createFileRoute } from '@tanstack/react-router';
   import { NewGame } from '../components/NewGame';

   export const Route = createFileRoute('/newgame')({
     component: NewGame,
   });
   ```
3. Add link to dashboard in `src/routes/index.tsx`
4. TanStack Router will auto-generate the route

### Adding a New API Endpoint
1. Add procedure to `server/trpc/router.ts` or create new router
2. Use Zod for input validation
3. Access via tRPC client in frontend:
   ```typescript
   const trpc = useTRPC();
   const { data } = useQuery({
     queryKey: ['myEndpoint'],
     queryFn: () => trpc.myEndpoint.query(),
   });
   ```

## Deployment

### Docker Build
The project uses multi-stage Docker builds:
- **Stage 1**: Install dependencies and build frontend with Vite
- **Stage 2**: Production image with only runtime dependencies and built assets
- **Git SHA**: Embedded in image as build arg and accessible at `/app/dist/version.txt`

### Kubernetes
- **Namespace**: `kids`
- **Helm charts**: Located in `helm/kids/`
- **Production**: 2 replicas at https://kids.aiacta.com
- **PR review apps**: Auto-deployed to `https://pr-{number}.kids.aiacta.com` (1 replica)

### CI/CD Workflows
- **kubernetes.yml**: Main deployment workflow (on push to main)
- **pr-review-app.yml**: Automatic review app deployment for PRs
- **pr-cleanup.yml**: Cleanup review apps when PRs close
- **lighthouse-ci.yml**: Performance testing

## Common Pitfalls & Workarounds

### Package Manager Issues
- **Bun not available in development**: Use `npm` instead of `bun` commands during development
- **Lock file**: Project uses `bun.lock` but npm works fine for development
- **Install issues**: Run `npm install` to install dependencies

### TypeScript & ESLint
- **TypeScript version warning**: The project uses TypeScript 5.9.3 but @typescript-eslint officially supports <5.4.0. This is a warning only and works fine in practice.
- **Existing lint errors**: There are 2-3 existing lint errors in `server/db/index.ts` and `src/main.tsx`. Focus on not adding new issues.
- **Fast refresh warning**: The warning in `main.tsx` about fast refresh is expected for the main entry file.

### Database
- **Database location**: PostgreSQL database stored in `/app/data/` in production
- **Migration environment**: Set `DISABLE_MIGRATIONS=true` to skip auto-migrations on server start
- **Schema changes**: Always generate migrations with `db:generate` before deploying

### Routing
- **Generated route tree**: Don't edit `src/routeTree.gen.ts` manually - it's auto-generated
- **Route syntax**: Use `createFileRoute('/path')` pattern, not `createRoute()`
- **SPA fallback**: Server returns `index.html` for unknown routes (SPA routing)

### Development Server
- **Two servers needed**: For full-stack dev, run both `npm run dev` (frontend) and `npm run server:dev` (backend)
- **Proxy configuration**: Vite proxies `/api` to `http://localhost:3000` - make sure backend is running
- **Port conflicts**: Frontend on 5173, backend on 3000 - ensure ports are available

### PixiJS Games
- **Component registration**: Always `extend()` PixiJS components before use
- **Asset loading**: Use `Assets.load()` for loading game assets
- **Performance**: Avoid expensive operations in game loop (see collision detection optimization in Asteroids)
- **useTick hook**: This is the game loop hook from @pixi/react

## Testing

**Note**: This project does not currently have a test suite. When adding tests:
- Follow the project's TypeScript patterns
- Consider using Vitest (already configured with Vite)
- Place tests alongside components or in `__tests__` directories

## Security Considerations

- **Authentication**: Uses WebAuthn for passwordless authentication
- **Input validation**: Always validate inputs with Zod in tRPC procedures
- **Environment variables**: Database URL and other secrets via env vars
- **CORS**: Not currently configured - frontend and backend on same domain in production

## Getting Help

- **README.md**: Comprehensive documentation of the project
- **Package.json scripts**: All available commands are in `package.json`
- **TanStack Router docs**: https://tanstack.com/router
- **tRPC docs**: https://trpc.io
- **Drizzle ORM docs**: https://orm.drizzle.team
- **Mantine docs**: https://mantine.dev

## Key Files to Reference

- `README.md` - Complete project documentation
- `package.json` - All scripts and dependencies
- `src/components/AsteroidsGame.tsx` - Example of PixiJS game implementation
- `src/routes/index.tsx` - Dashboard showing all games
- `server/trpc/router.ts` - API endpoint definitions
- `server/db/schema.ts` - Database schema
- `vite.config.ts` - Build configuration and proxy setup
- `.github/workflows/kubernetes.yml` - Deployment pipeline
