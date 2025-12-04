# VC Investment Dashboard

## API Structure

### Endpoints

- `GET /health`: Health check.
- `POST /investments`: Create a new investment.

### Backend Architecture

- **Handler**: `internal/handler` - HTTP handlers.
- **Service**: `internal/service` - Business logic.
- **Repository**: `internal/repository` - Database interaction.
- **Models**: `internal/models` - GORM structs.

### Running the Backend

1. Start the database:

   ```bash
   docker-compose up -d
   ```

   **Note:** The database runs on port **5433** (mapped from container's 5432) to avoid conflicts with local PostgreSQL installations.

2. Run the application:
   ```bash
   go run cmd/api/main.go
   ```
   The API will be available at `http://localhost:8080`

### Testing the API

```bash
# Health check
curl http://localhost:8080/health

# Create an investment
curl -X POST http://localhost:8080/investments \
  -H "Content-Type: application/json" \
  -d '{"StartupName":"TestCo","AmountInvested":100000,"CurrentValuation":150000,"RoundStage":"Series A","InvestedAt":"2025-01-01T00:00:00Z"}'
```

## Frontend

Located in `/frontend`. Next.js App Router + Tailwind CSS.
