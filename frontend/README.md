# Ventura Frontend

Next.js 14 frontend for the Ventura VC Investment Dashboard.

## Features

### 📊 Dashboard

- **AUM Card**: Total deployed capital, current valuations, unrealized gains
- **Performance Metrics**: IRR and MOIC with visual indicators
- **Sector Allocation**: Pie chart showing investment distribution by sector
- **Portfolio Health**: Color-coded health status breakdown
- **Performance History Chart**: Historical IRR/MOIC trends
- **Investment Timeline**: Visual timeline of investments
- **Sector Comparison**: MOIC comparison across sectors

### 🏢 Portfolio

- Portfolio companies list with search and filtering
- Company detail pages with comprehensive metrics
- Full CRUD operations (Create, Read, Update, Delete)

### 📈 Deal Flow

- Kanban-style pipeline board with drag-and-drop
- Deal stages: Sourcing → Screening → Due Diligence → Negotiation → Closed
- Deal creation modal with scoring inputs
- Deal cards showing key information

### 🔐 Authentication

- Login and registration pages
- Protected routes with authentication guard
- Theme toggle (light/dark mode)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main dashboard
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── globals.css        # Global styles
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── portfolio/         # Portfolio pages
│   │   │   ├── page.tsx       # Portfolio list
│   │   │   └── [id]/          # Company detail page
│   │   └── deals/             # Deal flow page
│   ├── components/
│   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── aum-card.tsx
│   │   │   ├── performance-metrics.tsx
│   │   │   ├── sector-allocation.tsx
│   │   │   ├── portfolio-health.tsx
│   │   │   ├── performance-history-chart.tsx
│   │   │   ├── investment-timeline.tsx
│   │   │   └── sector-comparison-chart.tsx
│   │   ├── deals/             # Deal flow components
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   ├── deal-card.tsx
│   │   │   └── add-deal-modal.tsx
│   │   ├── portfolio/         # Portfolio components
│   │   ├── ui/                # Reusable UI components
│   │   ├── Footer.tsx         # App footer
│   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   └── ProtectedRoute.tsx # Auth guard component
│   └── lib/
│       ├── api.ts             # API client and types
│       └── utils.ts           # Utility functions
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript config
└── next.config.ts             # Next.js configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Font**: Geist (via next/font)

## API Integration

The frontend connects to the Go backend at `http://localhost:8080`. API calls are centralized in `src/lib/api.ts`.

Key API client functions:

- `fetchDashboard()` - Get all dashboard metrics
- `fetchDashboardHistory()` - Get historical chart data
- `fetchPortfolio()` - Get portfolio companies
- `fetchDeals()` - Get deal flow data
- Authentication via HTTP-only cookies

## Theming

Supports light and dark modes via the `ThemeToggle` component. Theme preference is persisted in localStorage.

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm run build
```

Then deploy the `.next` directory to Vercel or any Node.js hosting platform.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
