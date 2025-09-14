#!/bin/bash

echo "🍗 Setting up Chicken Rater for local testing..."

# Create .env file with SQLite for local testing
cat > .env << EOL
# For local testing with SQLite
DATABASE_URL="file:./dev.db"
PORT=3000
SESSION_SECRET="local-dev-secret-123"
ADMIN_SECRET="admin123"
EOL

echo "✅ Created .env file with SQLite configuration"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd web && npm install && cd ..

# Update Prisma schema to support SQLite
echo "🔧 Updating Prisma schema for SQLite..."
sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "🗄️ Running database migrations..."
npm run prisma:migrate -- --name init

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo "✅ Setup complete!"
echo ""
echo "To start the app:"
echo "  Terminal 1: npm run dev"
echo "  Terminal 2: npm run dev:web"
echo ""
echo "Then visit:"
echo "  Player: http://localhost:5173"
echo "  Admin: http://localhost:5173/admin (password: admin123)"
echo ""
echo "Test event code: TEST"
