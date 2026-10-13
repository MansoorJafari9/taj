FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production \
    NITRO_PRESET=node-server
RUN npm run postinstall && npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3001
COPY --from=build --chown=node:node /app/.output ./.output

USER node
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
