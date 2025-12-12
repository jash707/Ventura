# Ventura - VC Investment Dashboard

A comprehensive venture capital investment dashboard built with **Go** (Gin) backend and **Next.js** frontend for managing portfolio companies, deal flow, and investment analytics.

## Features

### 🔐 Authentication

- JWT-based authentication with access and refresh tokens
- Secure HTTP-only cookies for token storage
- User registration and login
- Role-based access (Admin, Editor, Viewer)

### 📊 Dashboard Analytics

- **Assets Under Management (AUM)**: Total deployed capital, current valuations, unrealized gains
- **Performance Metrics**: IRR and MOIC calculations
- **Sector Allocation**: Visual breakdown by industry sector
- **Portfolio Health**: Color-coded health status (green/yellow/red)
- **Historical Charts**: Portfolio performance over time, investment timeline, sector comparison

### 🏢 Portfolio Management

- Full CRUD operations for portfolio companies
- Financial metrics tracking (cash remaining, burn rate, monthly revenue)
- Automatic health status calculation
- Company detail pages with comprehensive metrics

### 📈 Deal Flow Management

- Kanban-style pipeline with drag-and-drop
- Deal stages: Sourcing → Screening → Due Diligence → Negotiation → Closed
- Deal scoring (team, product, market, traction)
- Deal creation and stage management

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Go (Gin Framework)      |
| Frontend | Next.js 14 (App Router) |
| Database | PostgreSQL (via Docker) |
| ORM      | GORM                    |
| Styling  | Tailwind CSS            |
| Charts   | Recharts                |
| Auth     | JWT (golang-jwt)        |

## Project Structure

```
ventura/
├── cmd/
│   └── api/              # Application entry point
├── internal/
│   ├── auth/             # JWT token generation & validation
│   ├── handler/          # HTTP request handlers
│   │   ├── auth.go       # Authentication endpoints
│   │   ├── dashboard.go  # Dashboard metrics endpoints
│   │   ├── deal.go       # Deal flow endpoints
│   │   ├── portfolio.go  # Portfolio CRUD endpoints
│   │   └── health.go     # Health check endpoint
│   ├── middleware/       # Auth middleware
│   ├── models/           # GORM database models
│   ├── repository/       # Database access layer
│   ├── service/          # Business logic (analytics)
│   └── worker/           # Background workers
├── frontend/
│   └── src/
│       ├── app/          # Next.js pages
│       │   ├── login/    # Login page
│       │   ├── register/ # Registration page
│       │   ├── portfolio/ # Portfolio pages
│       │   └── deals/    # Deal flow page
│       ├── components/   # React components
│       │   ├── dashboard/ # Dashboard widgets
│       │   ├── deals/    # Kanban board components
│       │   ├── portfolio/ # Portfolio components
│       │   └── ui/       # Reusable UI components
│       └── lib/          # Utilities and API client
└── docker-compose.yml    # PostgreSQL container setup
```

## API Endpoints

### Authentication

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/auth/register` | Create a new user account    |
| POST   | `/auth/login`    | Login and receive JWT tokens |
| POST   | `/auth/refresh`  | Refresh access token         |
| GET    | `/auth/me`       | Get current user info        |
| POST   | `/auth/logout`   | Logout and clear cookies     |

### Dashboard

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| GET    | `/dashboard`             | Full dashboard metrics     |
| GET    | `/dashboard/history`     | Historical data for charts |
| GET    | `/dashboard/aum`         | Assets under management    |
| GET    | `/dashboard/performance` | IRR and MOIC metrics       |
| GET    | `/dashboard/sectors`     | Sector allocation          |
| GET    | `/dashboard/health`      | Portfolio health breakdown |

### Portfolio Companies

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| GET    | `/portfolio`     | List all portfolio companies |
| GET    | `/portfolio/:id` | Get company details          |
| POST   | `/portfolio`     | Create a new company         |
| PUT    | `/portfolio/:id` | Update a company             |
| DELETE | `/portfolio/:id` | Delete a company             |

### Deal Flow

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| GET    | `/deals`           | List all deals             |
| GET    | `/deals?stage=X`   | Filter deals by stage      |
| POST   | `/deals`           | Create a new deal          |
| PUT    | `/deals/:id/stage` | Update deal pipeline stage |

### Other

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/health`      | Health check      |
| POST   | `/investments` | Create investment |

## Getting Started

### Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

### Running the Backend

1. **Start the database:**

   ```bash
   docker-compose up -d
   ```

   > ⚠️ The database runs on port **5433** (mapped from container's 5432) to avoid conflicts with local PostgreSQL installations.

2. **Run the API server:**

   ```bash
   go run cmd/api/main.go
   ```

   The API will be available at `http://localhost:8080`

### Running the Frontend

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Testing the API

```bash
# Health check
curl http://localhost:8080/health

# Register a new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get dashboard metrics (requires authentication)
curl http://localhost:8080/dashboard \
  -H "Cookie: access_token=<your_token>"

# Create a portfolio company
curl -X POST http://localhost:8080/portfolio \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=<your_token>" \
  -d '{
    "name": "Example Corp",
    "sector": "SaaS",
    "AmountInvested": 500000,
    "CurrentValuation": 2000000,
    "RoundStage": "Series A",
    "InvestedAt": "2024-01-15T00:00:00Z"
  }'
```

## Environment Variables

| Variable      | Default     | Description        |
| ------------- | ----------- | ------------------ |
| `DB_HOST`     | `localhost` | PostgreSQL host    |
| `DB_PORT`     | `5433`      | PostgreSQL port    |
| `DB_USER`     | `postgres`  | Database user      |
| `DB_PASSWORD` | `postgres`  | Database password  |
| `DB_NAME`     | `ventura`   | Database name      |
| `JWT_SECRET`  | (generated) | JWT signing secret |
| `PORT`        | `8080`      | API server port    |

## License

MIT
