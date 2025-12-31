# Ventura - VC Investment Dashboard

A comprehensive venture capital investment dashboard built with **Go** (Gin) backend and **Next.js** frontend for managing portfolio companies, deal flow, and investment analytics.

## Features

### 🔐 Authentication & User Management

- JWT-based authentication with access and refresh tokens
- Secure HTTP-only cookies for token storage
- User registration and login
- Role-based access (Admin, Editor, Viewer)
- Admin panel for user management and audit logs
- User invitation system with email-based onboarding

### 📊 Dashboard Analytics

- **Assets Under Management (AUM)**: Total deployed capital, current valuations, unrealized gains
- **Performance Metrics**: IRR and MOIC calculations
- **Sector Allocation**: Visual breakdown by industry sector
- **Portfolio Health**: Color-coded health status (green/yellow/red)
- **Historical Charts**: Portfolio performance over time, investment timeline, sector comparison

### 🏢 Portfolio Management

- Full CRUD operations for portfolio companies
- Financial metrics tracking (cash remaining, burn rate, monthly revenue)
- Automatic health status and runway calculation
- **Founder Management**: Track founder profiles with contact info and LinkedIn
- **Monthly Updates**: Companies submit MRR, ARR, cash, burn rate, and churn metrics
- **Team Assignments**: Assign internal team members to portfolio companies
- Company detail pages with comprehensive metrics

### 📈 Deal Flow Management

- Kanban-style pipeline with drag-and-drop
- Deal stages: Sourcing → Screening → Due Diligence → Negotiation → Closed
- Deal scoring (team, product, market, traction)
- **Auto-Portfolio Creation**: Closed deals automatically create portfolio companies
- Deal creation and stage management

### 💱 Multi-Currency Support

- **11 Supported Currencies**: USD, INR, EUR, GBP, AED, JPY, CAD, AUD, CHF, SGD, CNY
- Live exchange rate fetching from ExchangeRate API
- Currency preference persistence
- Dynamic conversion across all monetary displays

### 🎨 UI/UX

- **Dark/Light Mode**: System-aware theme with manual toggle
- Responsive design for all screen sizes
- Modern UI with Tailwind CSS, glassmorphism effects
- Interactive charts with Recharts

## Tech Stack

| Layer     | Technology               |
| --------- | ------------------------ |
| Backend   | Go (Gin Framework)       |
| Frontend  | Next.js 16 (App Router)  |
| Database  | PostgreSQL (Neon/Docker) |
| ORM       | GORM                     |
| Styling   | Tailwind CSS v4          |
| Charts    | Recharts                 |
| Auth      | JWT (golang-jwt)         |
| Drag/Drop | dnd-kit                  |

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

### Founders

| Method | Endpoint                  | Description                 |
| ------ | ------------------------- | --------------------------- |
| GET    | `/portfolio/:id/founders` | List founders for a company |
| POST   | `/portfolio/:id/founders` | Add a founder               |
| PUT    | `/founders/:id`           | Update a founder            |
| DELETE | `/founders/:id`           | Delete a founder            |

### Monthly Updates

| Method | Endpoint                         | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/portfolio/:id/monthly-updates` | List updates for a company |
| POST   | `/portfolio/:id/monthly-updates` | Create a monthly update    |
| DELETE | `/monthly-updates/:id`           | Delete a monthly update    |

### Team Assignments

| Method | Endpoint                      | Description            |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/portfolio/:id/team`         | List team assignments  |
| POST   | `/portfolio/:id/team`         | Assign a team member   |
| DELETE | `/portfolio/:id/team/:userId` | Remove team assignment |

### Admin (Requires Admin Role)

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/admin/users`       | List all users       |
| PUT    | `/admin/users/:id`   | Update user role     |
| DELETE | `/admin/users/:id`   | Delete a user        |
| POST   | `/admin/invitations` | Send user invitation |
| GET    | `/admin/audit-logs`  | View audit logs      |

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

### Backend (Render)

| Variable       | Default     | Description                                                           |
| -------------- | ----------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | (local DSN) | PostgreSQL connection string (Neon format supported)                  |
| `FRONTEND_URL` | -           | Production frontend URL for CORS (e.g., `https://ventura.vercel.app`) |
| `GIN_MODE`     | `debug`     | Set to `release` for production (enables Secure cookies)              |
| `JWT_SECRET`   | (generated) | JWT signing secret (set a strong secret in production)                |
| `PORT`         | `8080`      | API server port                                                       |

### Frontend (Vercel)

| Variable              | Default                 | Description     |
| --------------------- | ----------------------- | --------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API URL |

### Deployment Notes

1. **Render (Backend)**:

   - Set `DATABASE_URL` to your Neon connection string
   - Set `FRONTEND_URL` to your Vercel deployment URL
   - Set `GIN_MODE=release` for production
   - Set a strong `JWT_SECRET`

2. **Vercel (Frontend)**:

   - Set `NEXT_PUBLIC_API_URL` to your Render backend URL

3. **Neon (Database)**:
   - Use the connection string provided by Neon (format: `postgres://user:pass@host/db?sslmode=require`)

## License

MIT
