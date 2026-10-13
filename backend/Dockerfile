FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    APP_ENV=prod \
    VENDURE_SERVER_PORT=3000

COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/static/email/templates ./static/email/templates
RUN mkdir -p static/assets static/email/test-emails && chown -R node:node static

USER node
EXPOSE 3000
# Run a separate worker container from this image with: node dist/index-worker.js
CMD ["node", "dist/index.js"]
