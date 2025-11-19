# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Deployment

This application is deployed to Kubernetes at [https://kids.aiacta.com](https://kids.aiacta.com).

### Production Deployment

The deployment process is automated through GitHub Actions:

1. **Build**: A multi-stage Docker image is built using Bun and nginx
2. **Push**: The image is pushed to GitHub Container Registry (ghcr.io)
3. **Deploy**: A self-hosted runner deploys the application to the Kubernetes cluster

### PR Review Apps

Pull requests automatically deploy review apps to test changes before merging:

- **URL Pattern**: `https://pr-{number}.kids.aiacta.com` (e.g., `https://pr-42.kids.aiacta.com`)
- **Automatic Deployment**: Review apps are deployed when PRs are opened or updated
- **Automatic Cleanup**: Review apps are removed when PRs are closed or merged
- **Resources**: Each review app runs with 1 replica (vs 2 for production) in the `kids` namespace

### Kubernetes Resources

All resources are deployed to the `kids` namespace:

- **Namespace**: Dedicated namespace for the application
- **Deployment**: Runs 2 replicas with resource limits (1 replica for review apps)
- **Service**: ClusterIP service exposing port 80
- **Ingress**: NGINX ingress with TLS using Let's Encrypt via cert-manager

### Manual Deployment

To manually deploy changes:

```bash
# Build and push the Docker image
docker build -t ghcr.io/rouby/kids:latest .
docker push ghcr.io/rouby/kids:latest

# Apply Kubernetes manifests (requires kubectl access)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Force a rolling restart to pull the latest image
kubectl rollout restart deployment/kids -n kids
kubectl rollout status deployment/kids -n kids
```

## Development

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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
