# Docker images

Run these commands from the repository root:

```sh
docker build -t taj-backend:local ./backend
docker build -t taj-storefront:local ./storefront
```

Both Dockerfiles use Node 22 and multi-stage builds. Each project directory is its
own build context. Local environment files, dependencies, build outputs and uploaded
assets are excluded by `.dockerignore`. Supply configuration when starting containers.

## Backend

Prepare the root `.env` using `.env.example`. Set the database connection, cookie
secret, administrator credentials, payment settings and `CORS_ORIGINS` before starting.
The database must be reachable from inside Docker; `localhost` inside the container
refers to that container. For a database on Docker Desktop's host use
`DB_HOST=host.docker.internal` and the database's published port.

```sh
docker run -d --init --name taj-api -p 3000:3000 \
  --env-file .env -e APP_ENV=prod -e DB_HOST=host.docker.internal \
  -v taj-assets:/app/static/assets \
  -v taj-email-output:/app/static/email/test-emails \
  taj-backend:local

# Start after the API has completed migrations and is listening.
docker run -d --init --name taj-worker \
  --env-file .env -e APP_ENV=prod -e DB_HOST=host.docker.internal \
  -v taj-assets:/app/static/assets \
  -v taj-email-output:/app/static/email/test-emails \
  taj-backend:local node dist/index-worker.js
```

The default command runs migrations and starts the API on port 3000. The same image
starts a worker when its command is overridden. The worker does not need a published
port. The dashboard is included and served at `/dashboard`.

Set `ASSET_URL_PREFIX` to the backend's public asset URL (with a trailing slash).
The current application configuration uses email dev mode; configure real email
delivery separately. The initial migration creates the core Vendure tables on an
empty database before the feature migrations run. Building the image does not
connect to or initialize a database.

## Storefront

The Nuxt image runs the standalone Node SSR server on port 3001. Runtime variables
can be set without rebuilding the image:

```sh
docker run -d --init --name taj-storefront -p 3001:3001 \
  -e NUXT_PUBLIC_API_BASE_URL=https://api.example.com/shop-api \
  -e NUXT_PUBLIC_SITE_URL=https://shop.example.com \
  -e NUXT_PUBLIC_CHANNEL_TOKEN= \
  taj-storefront:local
```

Replace the example domains with your actual addresses. `NUXT_PUBLIC_API_BASE_URL`
is used by both the browser and SSR, so it must be reachable from both environments.
An internal Docker service name alone is not a suitable public API URL. Set backend
`CORS_ORIGINS` and `STOREFRONT_URL` to the storefront origin. For local testing on
Docker Desktop, an API URL based on `host.docker.internal` requires that hostname
to resolve in the host browser as well, or use a shared reachable host address.

References: [Docker Node guide](https://docs.docker.com/guides/nodejs/) and
[Nitro Node deployment](https://nitro.build/deploy/runtimes/node).

For the private registry and the server Compose file, see [DEPLOYMENT.md](../DEPLOYMENT.md).
