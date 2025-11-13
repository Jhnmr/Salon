# SALON - Development Guide

This guide will help you set up your local development environment for the SALON project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Architecture Overview](#architecture-overview)
- [Code Structure](#code-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guide](#testing-guide)
- [Debugging Tips](#debugging-tips)
- [Common Tasks](#common-tasks)
- [Contributing](#contributing)

## Prerequisites

### Required Software

- **Docker Desktop** (recommended) OR:
  - PHP 8.3+
  - Composer 2.x
  - PostgreSQL 15+
  - Redis 7+
  - Node.js 20+
  - npm 10+
- **Git**
- **IDE/Editor**: VS Code, PhpStorm, or similar

### Recommended VS Code Extensions

- PHP Intelephense
- Laravel Extension Pack
- ESLint
- Prettier
- Docker
- GitLens
- Tailwind CSS IntelliSense
- Error Lens

## Local Setup

### Option 1: Docker Setup (Recommended)

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/salon.git
cd salon
```

#### 2. Setup Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env || echo "VITE_API_URL=http://localhost:8000" > frontend/.env
```

#### 3. Start Docker Containers

```bash
docker-compose up -d
```

#### 4. Install Dependencies & Setup Database

```bash
# Generate Laravel app key
docker-compose exec app php artisan key:generate

# Install backend dependencies
docker-compose exec app composer install

# Run migrations
docker-compose exec app php artisan migrate

# Seed database with sample data
docker-compose exec app php artisan db:seed

# Install frontend dependencies
docker-compose exec frontend npm install
```

#### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/documentation

### Option 2: Local Installation (Without Docker)

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env
# DB_CONNECTION=pgsql
# DB_HOST=localhost
# DB_PORT=5432
# DB_DATABASE=salon
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Create database
createdb salon

# Run migrations and seeders
php artisan migrate
php artisan db:seed

# Start development server
php artisan serve
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

#### 3. Queue & Scheduler (Optional)

```bash
# Terminal 1 - Queue Worker
cd backend
php artisan queue:work

# Terminal 2 - Scheduler
cd backend
php artisan schedule:work
```

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├─────────────────────────────────────────────────────────────┤
│  React SPA (PWA)                                             │
│  - Service Worker (offline support)                          │
│  - React Router (client routing)                             │
│  - Framer Motion (animations)                                │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (Nginx)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Laravel API                                                 │
│  - RESTful Controllers                                       │
│  - Middleware (Auth, CORS, Rate Limiting)                    │
│  - Validation & Form Requests                                │
│  - Resources & Transformers                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
├─────────────────────────────────────────────────────────────┤
│  - Service Classes                                           │
│  - Repository Pattern                                        │
│  - Events & Listeners                                        │
│  - Queue Jobs                                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Access Layer                       │
├─────────────────────────────────────────────────────────────┤
│  - Eloquent ORM                                              │
│  - Database Migrations                                       │
│  - Model Relationships                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────┬──────────────────┬──────────────────────┐
│   PostgreSQL     │      Redis       │   File Storage       │
│   (Primary DB)   │  (Cache/Queue)   │   (Local/S3)         │
└──────────────────┴──────────────────┴──────────────────────┘
```

### Data Flow

1. **User Request** → React component triggers action
2. **API Call** → Service layer makes HTTP request to Laravel API
3. **Authentication** → Sanctum validates token
4. **Controller** → Receives request, validates input
5. **Service Layer** → Handles business logic
6. **Repository/Model** → Interacts with database
7. **Response** → Data transformed and returned to client
8. **Cache** → Redis caches frequently accessed data
9. **Queue** → Background jobs processed asynchronously

## Code Structure

### Backend (Laravel)

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/          # Artisan commands
│   ├── Events/                # Event classes
│   ├── Exceptions/            # Exception handlers
│   ├── Http/
│   │   ├── Controllers/       # API controllers
│   │   │   ├── Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ServiceController.php
│   │   │   │   ├── StylistController.php
│   │   │   │   └── ReservationController.php
│   │   ├── Middleware/        # Custom middleware
│   │   ├── Requests/          # Form request validation
│   │   └── Resources/         # API resources (transformers)
│   ├── Listeners/             # Event listeners
│   ├── Models/                # Eloquent models
│   │   ├── User.php
│   │   ├── Service.php
│   │   ├── Stylist.php
│   │   ├── Reservation.php
│   │   └── ...
│   ├── Observers/             # Model observers
│   ├── Policies/              # Authorization policies
│   ├── Providers/             # Service providers
│   ├── Repositories/          # Repository pattern
│   └── Services/              # Business logic services
├── config/                    # Configuration files
├── database/
│   ├── factories/             # Model factories for testing
│   ├── migrations/            # Database migrations
│   └── seeders/               # Database seeders
├── routes/
│   ├── api.php                # API routes
│   ├── web.php                # Web routes
│   └── channels.php           # Broadcasting channels
├── storage/
│   ├── app/                   # Application files
│   ├── framework/             # Framework files
│   └── logs/                  # Log files
└── tests/
    ├── Feature/               # Feature tests
    └── Unit/                  # Unit tests
```

### Frontend (React)

```
frontend/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   ├── offline.html           # Offline fallback
│   └── icons/                 # App icons
├── src/
│   ├── assets/                # Images, fonts, etc.
│   ├── components/            # Reusable components
│   │   ├── common/            # Common components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Modal.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   └── features/          # Feature-specific components
│   │       ├── services/
│   │       ├── stylists/
│   │       └── reservations/
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   ├── pages/                 # Page components
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── Stylists.jsx
│   │   ├── Reservations.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/              # API services
│   │   ├── api.js             # Axios instance
│   │   ├── auth.service.js
│   │   ├── service.service.js
│   │   ├── stylist.service.js
│   │   └── reservation.service.js
│   ├── store/                 # State management (Context/Redux)
│   │   ├── AuthContext.jsx
│   │   └── AppContext.jsx
│   ├── styles/                # Global styles
│   │   └── index.css
│   ├── utils/                 # Utility functions
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   └── constants.js
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Entry point
│   └── registerSW.js          # Service Worker registration
├── .eslintrc.json             # ESLint config
├── tailwind.config.js         # Tailwind config
├── vite.config.js             # Vite config
└── package.json               # Dependencies
```

## Development Workflow

### 1. Creating New Features

#### Backend (Laravel)

```bash
# Create a migration
php artisan make:migration create_feature_table

# Create a model with factory and seeder
php artisan make:model Feature -mfs

# Create a controller
php artisan make:controller Api/FeatureController --api

# Create a form request
php artisan make:request StoreFeatureRequest

# Create a resource
php artisan make:resource FeatureResource
```

#### Frontend (React)

```bash
# Create new component
mkdir -p src/components/features/feature
touch src/components/features/feature/FeatureList.jsx
touch src/components/features/feature/FeatureCard.jsx

# Create service
touch src/services/feature.service.js

# Create page
touch src/pages/Features.jsx
```

### 2. Database Workflow

```bash
# Create migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Refresh database (drop all tables and re-migrate)
php artisan migrate:fresh

# Seed database
php artisan db:seed

# Create seeder
php artisan make:seeder TableNameSeeder
```

### 3. Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request on GitHub
```

## Coding Standards

### PHP (Backend)

We follow **PSR-12** coding standards and use **Laravel Pint** for automatic formatting.

```bash
# Check code style
./vendor/bin/pint --test

# Fix code style
./vendor/bin/pint
```

#### Best Practices

- Use type hints for parameters and return types
- Write descriptive variable and method names
- Follow SOLID principles
- Use dependency injection
- Write PHPDoc comments for methods
- Keep controllers thin, use service classes for business logic

**Example Controller:**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;

class ReservationController extends Controller
{
    public function __construct(
        private ReservationService $reservationService
    ) {}

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $reservation = $this->reservationService->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Reservation created successfully',
            'data' => new ReservationResource($reservation),
        ], 201);
    }
}
```

### JavaScript (Frontend)

We follow **Airbnb JavaScript Style Guide** and use **ESLint** for linting.

```bash
# Check code
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

#### Best Practices

- Use functional components with hooks
- Prefer const over let, avoid var
- Use arrow functions
- Destructure props and state
- Use PropTypes or TypeScript for type checking
- Keep components small and focused
- Use meaningful variable names

**Example Component:**

```jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function ServiceCard({ service, onBook }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = async () => {
    setIsLoading(true);
    try {
      await onBook(service.id);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-xl font-bold">{service.name}</h3>
      <p className="text-gray-600">{service.description}</p>
      <p className="text-2xl font-bold mt-4">${service.price}</p>
      <button
        onClick={handleBooking}
        disabled={isLoading}
        className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
      >
        {isLoading ? 'Booking...' : 'Book Now'}
      </button>
    </motion.div>
  );
}

ServiceCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onBook: PropTypes.func.isRequired,
};
```

### Commit Messages

We use **Conventional Commits** format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(reservations): add booking confirmation email"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(api): update API documentation"
```

## Testing Guide

### Backend Tests (PHPUnit)

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test file
php artisan test tests/Feature/ReservationTest.php

# Run specific test method
php artisan test --filter testUserCanCreateReservation

# Run in parallel
php artisan test --parallel
```

#### Writing Tests

**Feature Test Example:**

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_reservation(): void
    {
        $user = User::factory()->create();
        $service = Service::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/reservations', [
                'service_id' => $service->id,
                'date' => '2024-12-01',
                'time' => '10:00',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'service_id',
                    'date',
                    'time',
                ],
            ]);

        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'service_id' => $service->id,
        ]);
    }
}
```

### Frontend Tests (Jest + React Testing Library)

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test ServiceCard.test.jsx
```

#### Writing Tests

**Component Test Example:**

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ServiceCard from './ServiceCard';

describe('ServiceCard', () => {
  const mockService = {
    id: 1,
    name: 'Haircut',
    description: 'Professional haircut',
    price: 50,
  };

  const mockOnBook = jest.fn();

  it('renders service information correctly', () => {
    render(<ServiceCard service={mockService} onBook={mockOnBook} />);

    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Professional haircut')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('calls onBook when button is clicked', () => {
    render(<ServiceCard service={mockService} onBook={mockOnBook} />);

    const bookButton = screen.getByText('Book Now');
    fireEvent.click(bookButton);

    expect(mockOnBook).toHaveBeenCalledWith(1);
  });
});
```

## Debugging Tips

### Backend Debugging

#### 1. Laravel Debugbar

```bash
# Install (dev only)
composer require barryvdh/laravel-debugbar --dev
```

#### 2. Laravel Telescope

```bash
# Install
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate

# Access at: http://localhost:8000/telescope
```

#### 3. Tinker (REPL)

```bash
php artisan tinker

# Query database
>>> User::count()
>>> Service::where('active', true)->get()

# Test code
>>> $service = Service::find(1)
>>> $service->reservations
```

#### 4. Logging

```php
// Use Log facade
use Illuminate\Support\Facades\Log;

Log::info('User created reservation', ['user_id' => $user->id]);
Log::error('Payment failed', ['error' => $e->getMessage()]);

// View logs
tail -f storage/logs/laravel.log
```

### Frontend Debugging

#### 1. React DevTools

Install React Developer Tools browser extension for component inspection.

#### 2. Console Logging

```javascript
console.log('Service data:', service);
console.table(services);
console.error('API Error:', error);
console.group('Booking Process');
console.log('Step 1: Validate');
console.log('Step 2: Submit');
console.groupEnd();
```

#### 3. Network Debugging

Use browser DevTools Network tab to inspect API requests.

#### 4. VS Code Debugger

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

## Common Tasks

### Clear Caches

```bash
# Backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Or all at once
php artisan optimize:clear

# Frontend
rm -rf frontend/node_modules/.vite
```

### Reset Database

```bash
# Drop all tables, re-run migrations, and seed
php artisan migrate:fresh --seed
```

### Update Dependencies

```bash
# Backend
composer update

# Frontend
npm update
```

### Generate API Documentation

```bash
# Install Scribe
composer require --dev knuckleswtf/scribe

# Generate docs
php artisan scribe:generate

# Access at: http://localhost:8000/docs
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch** from `develop`
3. **Write tests** for new features
4. **Follow coding standards**
5. **Commit with conventional commits**
6. **Push and create a pull request**
7. **Wait for code review**

### Pull Request Checklist

- [ ] Tests written and passing
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No console.log or dd() left in code
- [ ] Migrations tested
- [ ] No merge conflicts
- [ ] Descriptive PR title and description

## Resources

### Documentation
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools
- [Laravel Shift](https://laravelshift.com/) - Upgrade Laravel
- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database GUI
- [Redis Commander](http://joeferner.github.io/redis-commander/) - Redis GUI

## Getting Help

- **Discord**: Join our development Discord server
- **Email**: dev@salon.app
- **Issues**: https://github.com/yourusername/salon/issues
- **Wiki**: https://github.com/yourusername/salon/wiki

Happy coding!
