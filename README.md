# SALON - Beauty & Wellness Booking Platform

[![CI](https://github.com/yourusername/salon/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/salon/actions/workflows/ci.yml)
[![Deploy](https://github.com/yourusername/salon/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/salon/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, full-stack Progressive Web Application (PWA) for beauty and wellness service booking. Book appointments with stylists, manage your beauty routine, and discover new services - all in one beautiful, offline-capable application.

## Features

### Core Functionality
- **Service Booking**: Browse and book beauty services with real-time availability
- **Stylist Profiles**: Detailed profiles with ratings, reviews, and portfolio
- **Appointment Management**: View, reschedule, and cancel appointments
- **Real-time Notifications**: Push notifications for appointment reminders
- **Reviews & Ratings**: Leave feedback and view service ratings
- **Multi-branch Support**: Book services across different salon locations
- **Service Categories**: 48+ service categories including hair, nails, spa, and more

### Progressive Web App (PWA)
- **Offline Support**: Browse cached services and make bookings offline
- **Installable**: Install on mobile and desktop devices
- **Background Sync**: Automatically sync bookings when connection is restored
- **Push Notifications**: Receive appointment reminders and updates
- **Fast Loading**: Optimized performance with service worker caching
- **Responsive Design**: Beautiful UI on all devices and screen sizes

### User Features
- **Client Portal**: Manage bookings, favorites, and payment methods
- **Stylist Dashboard**: Manage schedule, services, and client interactions
- **Admin Panel**: Comprehensive management of services, users, and analytics
- **Payment Integration**: Secure payment processing
- **Conversation System**: Chat with stylists before booking
- **Promotion System**: Special offers and discounts

## Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks and concurrent features
- **Vite**: Next-generation frontend tooling
- **Framer Motion**: Smooth animations and transitions
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **PWA**: Service Workers, Web App Manifest, offline support

### Backend
- **Laravel 11**: Robust PHP framework
- **PostgreSQL 15**: Reliable relational database
- **Redis 7**: High-performance caching and sessions
- **Laravel Sanctum**: API authentication
- **Laravel Queue**: Background job processing

### DevOps
- **Docker**: Containerization for all services
- **Docker Compose**: Multi-container orchestration
- **GitHub Actions**: CI/CD pipelines
- **Nginx**: High-performance web server
- **PHP-FPM**: FastCGI Process Manager

## Quick Start with Docker

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/salon.git
   cd salon
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Generate Laravel application key
   docker-compose run --rm app php artisan key:generate
   ```

3. **Configure environment variables**
   Edit `backend/.env` and update:
   ```env
   APP_NAME=SALON
   APP_ENV=local
   APP_KEY=base64:... # Generated in step 2
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=pgsql
   DB_HOST=postgres
   DB_PORT=5432
   DB_DATABASE=salon
   DB_USERNAME=salon
   DB_PASSWORD=secret

   REDIS_HOST=redis
   REDIS_PASSWORD=secret
   REDIS_PORT=6379

   CACHE_DRIVER=redis
   SESSION_DRIVER=redis
   QUEUE_CONNECTION=redis
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations and seeders**
   ```bash
   # Run migrations
   docker-compose exec app php artisan migrate

   # Seed the database with sample data
   docker-compose exec app php artisan db:seed
   ```

6. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Health Check**: http://localhost:8000/api/health

### Stopping the Application
```bash
docker-compose down
```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f frontend
```

## Development Setup

For detailed development setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Quick Development Start

1. **Backend (Laravel)**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan db:seed
   php artisan serve
   ```

2. **Frontend (React)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Project Structure

```
salon/
├── backend/                 # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/ # API controllers
│   │   ├── Models/          # Eloquent models
│   │   └── Services/        # Business logic
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── routes/
│   │   └── api.php          # API routes
│   ├── docker/              # Docker configuration
│   │   ├── nginx.conf       # Nginx config
│   │   └── php.ini          # PHP config
│   └── Dockerfile           # Backend Docker image
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── registerSW.js    # Service Worker registration
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   ├── sw.js            # Service Worker
│   │   └── offline.html     # Offline fallback
│   ├── docker/              # Docker configuration
│   │   └── nginx.conf       # Nginx config
│   └── Dockerfile           # Frontend Docker image
├── .github/
│   └── workflows/           # GitHub Actions
│       ├── ci.yml           # Continuous Integration
│       └── deploy.yml       # Deployment
├── docker-compose.yml       # Docker Compose config
├── README.md                # This file
├── DEPLOYMENT.md            # Deployment guide
└── DEVELOPMENT.md           # Development guide
```

## API Documentation

### Base URL
- Development: `http://localhost:8000/api`
- Production: `https://api.salon.app`

### Key Endpoints

#### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Get authenticated user

#### Services
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get service details
- `GET /api/service-categories` - List service categories

#### Stylists
- `GET /api/stylists` - List all stylists
- `GET /api/stylists/{id}` - Get stylist profile
- `GET /api/stylists/{id}/services` - Get stylist services
- `GET /api/stylists/{id}/availability` - Get stylist availability

#### Reservations
- `GET /api/reservations` - List user reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/{id}` - Get reservation details
- `PATCH /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

#### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `GET /api/stylists/{id}/reviews` - Get stylist reviews

For complete API documentation, visit `/api/documentation` when running the application.

## Environment Variables

### Backend (.env)
```env
APP_NAME=SALON
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://salon.app

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=salon
DB_USERNAME=salon
DB_PASSWORD=your_secure_password

REDIS_HOST=redis
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### Frontend (.env)
```env
VITE_API_URL=https://api.salon.app
```

## Testing

### Backend Tests (PHPUnit)
```bash
# Run all tests
docker-compose exec app php artisan test

# Run with coverage
docker-compose exec app php artisan test --coverage

# Run specific test
docker-compose exec app php artisan test --filter=ReservationTest
```

### Frontend Tests (Jest)
```bash
# Run all tests
cd frontend
npm run test

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

### End-to-End Tests
```bash
# Coming soon
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy with Docker

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Optimize Laravel
docker-compose exec app php artisan optimize
```

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- **PHP**: Follow PSR-12 coding standard, use Laravel Pint
- **JavaScript**: Follow Airbnb style guide, use ESLint
- **Commits**: Use conventional commits format

## Security

If you discover a security vulnerability, please email security@salon.app. All security vulnerabilities will be promptly addressed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.salon.app](https://docs.salon.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/salon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/salon/discussions)
- **Email**: support@salon.app

## Acknowledgments

- Laravel Framework
- React Team
- Vite
- PostgreSQL
- Redis
- Docker
- All open-source contributors

---

Made with ❤️ by the SALON Team