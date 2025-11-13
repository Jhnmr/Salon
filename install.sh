#!/bin/bash

# SALON - Quick Installation Script
# This script will set up the entire SALON application with Docker

set -e

echo "=========================================="
echo "  SALON - Installation Script"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Docker Compose found: $(docker-compose --version)"
echo ""

# Step 1: Copy environment files
echo "📋 Step 1: Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists, skipping..."
fi

echo ""

# Step 2: Start Docker containers
echo "🐳 Step 2: Starting Docker containers..."
echo "This may take several minutes on first run..."
echo ""

docker-compose up -d

echo ""
echo "✅ Docker containers started"
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Step 3: Generate application key
echo "🔑 Step 3: Generating application key..."
docker-compose exec -T app php artisan key:generate

# Step 4: Install backend dependencies
echo "📦 Step 4: Installing backend dependencies..."
docker-compose exec -T app composer install

# Step 5: Run database migrations
echo "📊 Step 5: Running database migrations..."
docker-compose exec -T app php artisan migrate --force

# Step 6: Seed the database
echo "🌱 Step 6: Seeding database with sample data..."
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose exec -T app php artisan db:seed
    echo "✅ Database seeded successfully"
else
    echo "⏭️  Skipping database seeding"
fi

# Step 7: Create storage link
echo "🔗 Step 7: Creating storage symbolic link..."
docker-compose exec -T app php artisan storage:link

# Step 8: Install frontend dependencies
echo "📦 Step 8: Installing frontend dependencies..."
docker-compose exec -T frontend npm install

echo ""
echo "=========================================="
echo "  🎉 Installation Complete!"
echo "=========================================="
echo ""
echo "Access your application:"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/api/documentation"
echo ""
echo "Useful commands:"
echo ""
echo "  Start:     docker-compose up -d"
echo "  Stop:      docker-compose down"
echo "  Logs:      docker-compose logs -f"
echo "  Shell:     docker-compose exec app bash"
echo ""
echo "For more information, see:"
echo "  - README.md"
echo "  - DEVELOPMENT.md"
echo "  - DEPLOYMENT.md"
echo ""
echo "Happy coding! 🚀"
echo ""
