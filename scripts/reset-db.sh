#!/bin/bash

set -e

echo "⚠️  WARNING: This will delete all data in your database!"
echo "Are you sure you want to continue? (yes/no)"
read -r response

if [ "$response" != "yes" ]; then
    echo "❌ Aborted"
    exit 0
fi

echo ""
echo "🗑️  Resetting database..."

# Reset database
yarn db:reset

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Next steps:"
echo "1. Run migrations: yarn db:migrate"
echo "2. Seed database: yarn db:seed"
