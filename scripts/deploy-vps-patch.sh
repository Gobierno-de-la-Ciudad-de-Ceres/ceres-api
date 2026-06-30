#!/usr/bin/env bash
# Deploy sin Docker Hub: compila con Node del VPS y parchea la imagen actual.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/ceres-api}"
BRANCH="${BRANCH:-prueba/deploy-test}"
BASE_IMAGE="${BASE_IMAGE:-ghcr.io/gianlucafarias/ceres-api:64d49917c7e668ebf20b49e0613126e6ded12d4e}"

cd "${APP_DIR}"
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

TAG="$(git rev-parse --short HEAD)"
echo "Compilando ceres-api (${TAG}) con Node del servidor..."
npm ci
npm run build

echo "Parcheando imagen Docker (sin pull de node:alpine)..."
docker build -f Dockerfile.patch \
  --build-arg "BASE_IMAGE=${BASE_IMAGE}" \
  -t "ghcr.io/gianlucafarias/ceres-api:${TAG}" .

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "docker-compose no encontrado"
  exit 1
fi

API_IMAGE_TAG="${TAG}" ${COMPOSE_CMD} up -d --remove-orphans api
sleep 6
docker exec ceres-api npm run migration:run:dist 2>/dev/null || true
echo "Deploy OK: ceres-api:${TAG}"
