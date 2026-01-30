#!/bin/bash

echo "🚀 Starting all services in development mode..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Run 'yarn setup' first."
    exit 1
fi

# Check if Docker services are running
if ! docker ps | grep -q vrm-postgres; then
    echo "⚠️  PostgreSQL container not running. Starting infrastructure..."
    yarn docker:up
    sleep 5
fi

# Generate Prisma client
echo "Generating Prisma client..."
yarn db:generate

# Start all services
echo ""
echo "Starting all services..."
echo "- Frontend: http://localhost:3000"
echo "- API Gateway: http://localhost:4000"
echo "- GraphQL: http://localhost:4000/graphql"
echo "- People Service: http://localhost:4001"
echo "- Project Service: http://localhost:4002"
echo ""

yarn dev
