#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
registry="188.212.97.228:5000"
image_tag="${IMAGE_TAG:-latest}"
image="${registry}/taj-back"

# Run on your development machine with Docker running.
# Build for the x86_64 server, including when running on an Apple Silicon Mac.
# The HTTP registry must be listed in Docker's insecure-registries.
# Optional version tag: IMAGE_TAG=v1 ./scripts/publish-backend.sh
docker info >/dev/null

printf '\n[1/3] Log in to %s\n' "$registry"
docker login "$registry"

printf '\n[2/3] Build the backend and dashboard for Linux AMD64\n'
docker build --platform linux/amd64 -t "${image}:${image_tag}" ./backend

printf '\n[3/3] Push the backend image\n'
docker push "${image}:${image_tag}"

printf '\nPublished: %s:%s\n' "$image" "$image_tag"
if [[ "$image_tag" != latest ]]; then
  printf 'Set IMAGE_TAG=%s in the server Compose .env before running the commands below.\n' "$image_tag"
fi
printf '\nOn the server, from the Compose directory, run in order (stop if any command fails):\n'
printf '%s\n' \
  'docker compose pull migrate backend worker' \
  'docker compose run --rm migrate' \
  'docker compose up -d --no-deps backend worker'
