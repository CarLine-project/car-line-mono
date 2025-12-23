# CarLine - Car Management Application

A full-stack application for managing car expenses, maintenance records, and mileage tracking.

## Project Structure

```
CarLine/
├── car-line-back/      # NestJS Backend API
├── car-line-front/     # React + Ionic Frontend + FSD
└── README.md          # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Docker** and **Docker Compose** (for PostgreSQL database)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CarLine
```

### 2. Backend Setup

#### 2.1 Install Dependencies

```bash
cd car-line-back
npm install
```

#### 2.2 Configure Environment Variables

Create a `.env` file in the `car-line-back` directory:

```bash
cd car-line-back
touch .env
```

Add the following environment variables to `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=carline_user
DB_PASSWORD=carline_password
DB_DATABASE=carline_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-token-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI API (Optional - for receipt processing)
OPENAI_API_KEY=your-openai-api-key-here
```

**Important Notes:**

- Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with strong, random strings
- `OPENAI_API_KEY` is optional - only needed if you want to use AI receipt processing features
- For production, use strong, randomly generated secrets

#### 2.3 Start PostgreSQL Database

```bash
npm run db:start
```

This will start a PostgreSQL container using Docker Compose.

#### 2.4 Initialize Database

```bash
npm run db:init
```

This script waits for PostgreSQL to be ready and verifies the connection.

#### 2.5 Start Backend Server

```bash
npm run start:dev
```

The backend will start on `http://localhost:3001`

**Available Backend Scripts:**

- `npm run start:dev` - Start in development mode with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run db:start` - Start PostgreSQL database
- `npm run db:stop` - Stop PostgreSQL database
- `npm run db:init` - Initialize database connection
- `npm run db:reset` - Reset database (removes all data)
- `npm run db:seed` - Seed database with test data
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### 3. Frontend Setup

#### 3.1 Install Dependencies

Open a new terminal window:

```bash
cd car-line-front
npm install
```

#### 3.2 Configure Environment Variables

Create a `.env` file in the `car-line-front` directory (optional):

```bash
cd car-line-front
touch .env
```

Add the following if you need to change the API URL:

```env
VITE_API_URL=http://localhost:3001
```

By default, the frontend connects to `http://localhost:3000` (which should proxy to backend at `http://localhost:3001`).

#### 3.3 Start Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

**Available Frontend Scripts:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test.unit` - Run unit tests
- `npm run test.e2e` - Run end-to-end tests

## Database Management

### Starting the Database

```bash
cd car-line-back
npm run db:start
```

### Stopping the Database

```bash
cd car-line-back
npm run db:stop
```

### Resetting the Database

⚠️ **Warning:** This will delete all data!

```bash
cd car-line-back
npm run db:reset
```


## Troubleshooting

### Database Connection Issues

1. **Check if Docker is running:**

   ```bash
   docker ps
   ```

2. **Check if PostgreSQL container is running:**

   ```bash
   docker-compose -f car-line-back/docker-compose.yml ps
   ```

3. **Restart the database:**
   ```bash
   cd car-line-back
   npm run db:stop
   npm run db:start
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

1. **Backend:** Change `PORT` in `car-line-back/.env`
2. **Frontend:** Change port in `car-line-front/vite.config.ts` or use:
   ```bash
   npm run dev -- --port 3002
   ```

### JWT Secret Errors

If you see errors about JWT_SECRET:

- Make sure `.env` file exists in `car-line-back` directory
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `.env`
- Restart the backend server after adding environment variables

### CORS Errors

If you see CORS errors:

- Verify `FRONTEND_URL` in `car-line-back/.env` matches your frontend URL
- Default is `http://localhost:3000`
- Restart backend after changing `FRONTEND_URL`


## Development

### Backend Development

The backend uses:

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Passport** - Authentication strategies

### Frontend Development

The frontend uses:

- **React 19** - UI library
- **Ionic React** - Mobile-first UI components
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Zustand** - State management
- **React Query** - Data fetching
- **Axios** - HTTP client

## Production Deployment

### Backend

1. Build the application:

   ```bash
   cd car-line-back
   npm run build
   ```

2. Set production environment variables:

   - `NODE_ENV=production`
   - Use strong, randomly generated JWT secrets
   - Configure production database credentials

3. Start the server:
   ```bash
   npm run start:prod
   ```

### Frontend

1. Build the application:

   ```bash
   cd car-line-front
   npm run build
   ```

2. The build output will be in `dist/` directory

3. Deploy the `dist/` directory to your hosting service

## License

UNLICENSED
