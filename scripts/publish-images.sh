#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
registry="188.212.97.228:5000"
image_tag="${IMAGE_TAG:-latest}"

# Authenticate first with: docker login 188.212.97.228:5000
# The registry uses HTTP; add it to Docker's insecure-registries on this machine.
for architecture in amd64 arm64; do
  docker build --platform "linux/${architecture}" \
    -t "${registry}/taj-back:${image_tag}-${architecture}" ./backend
  docker build --platform "linux/${architecture}" \
    -t "${registry}/taj-front:${image_tag}-${architecture}" ./storefront
  docker push "${registry}/taj-back:${image_tag}-${architecture}"
  docker push "${registry}/taj-front:${image_tag}-${architecture}"
done

for image_name in taj-back taj-front; do
  docker manifest create --insecure --amend "${registry}/${image_name}:${image_tag}" \
    "${registry}/${image_name}:${image_tag}-amd64" \
    "${registry}/${image_name}:${image_tag}-arm64"
  docker manifest push --insecure --purge "${registry}/${image_name}:${image_tag}"
done
