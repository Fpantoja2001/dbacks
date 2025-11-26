#!/bin/bash
# Seed script runner - runs the seed script inside Docker

echo "Running seed script inside Docker container..."
docker-compose exec -T user_service python shared/seed.py

