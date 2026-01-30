#!/bin/bash

set -e

echo "🚀 Setting up Valliance Resource Management System..."
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check Yarn
echo ""
echo "Checking Yarn..."
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn not found. Please install Yarn 4+"
    exit 1
fi
echo "✅ Yarn version: $(yarn -v)"

# Check Docker
echo ""
echo "Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You'll need to run PostgreSQL and Redis manually."
else
    echo "✅ Docker version: $(docker -v)"
fi

# Copy .env.example if .env doesn't exist
echo ""
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
yarn install

# Generate Prisma client
echo ""
echo "🗄️  Generating Prisma client..."
yarn db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration (especially DATABASE_URL and ANTHROPIC_API_KEY)"
echo "2. Start infrastructure: yarn docker:up"
echo "3. Run migrations: yarn db:migrate"
echo "4. Seed database: yarn db:seed"
echo "5. Start development: yarn dev"
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "API Gateway will be available at: http://localhost:4000"
echo "GraphQL Playground: http://localhost:4000/graphql"
echo ""
echo "Happy coding! 🎉"
