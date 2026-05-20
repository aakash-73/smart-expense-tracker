# Smart Expense Tracker

A modern microservices-based web application for tracking personal expenses, setting budgets, and analysing spending patterns in real time.

---

## Getting Started

### Prerequisites

Make sure you have the following installed before running the project:

| Tool | Version | Download |
|---|---|---|
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Java JDK** | 17 | https://adoptium.net |
| **Node.js** | 18+ | https://nodejs.org |

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd smart-expense-tracker
```

---

### 2. Set up environment variables

The services read secrets from a `.env` file that is **not** committed to the repo.

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` and fill in `JWT_SECRET` with a long random string:

```bash
# Generate a secure secret (run this in your terminal):
openssl rand -base64 64
```

Paste the output as the value of `JWT_SECRET` in your `.env` file. The other values work as-is for local development.

---

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

---

### 4. Start infrastructure (Docker)

From the `docker/` folder:

```bash
cd docker
docker-compose up -d
```

This starts MongoDB (27017), Kafka (9092), Zookeeper (2181), and Ignite (18080).

---

### 5. Start backend services

Open a separate terminal for each service (from the `backend/` folder):

```bash
# Terminal 1 — Auth Service
.\mvnw spring-boot:run -pl auth-service          # Windows
./mvnw spring-boot:run -pl auth-service          # Mac/Linux

# Terminal 2 — Transaction Service
.\mvnw spring-boot:run -pl transaction-service

# Terminal 3 — Budget Service
.\mvnw spring-boot:run -pl budget-service

# Terminal 4 — Analytics Service
.\mvnw spring-boot:run -pl analytics-service

# Terminal 5 — API Gateway
.\mvnw spring-boot:run -pl gateway-service
```

| Service | Port |
|---|---|
| API Gateway | 8080 |
| Auth Service | 8081 |
| Transaction Service | 8082 |
| Analytics Service | 8083 |
| Budget Service | 8085 |

---

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### Stopping everything

```bash
# Stop backend services — Ctrl+C in each terminal

# Stop Docker containers
cd docker
docker-compose down
```

---

## System Architecture & Flow Diagrams

### 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend                              │
│                      http://localhost:5173                          │
│                                                                     │
│   Login / Register ──► Auth pages (no JWT needed)                  │
│   Dashboard / Transactions / Budgets / Analytics ──► Protected      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTP + Bearer JWT
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Gateway  :8080                               │
│                                                                     │
│  ① Receives every request from the browser                         │
│  ② /api/auth/** ──► forwards directly (public, no JWT check)       │
│  ③ All other routes ──► JwtGatewayFilter validates JWT locally      │
│       • valid   → injects X-User-Id + X-User-Roles headers         │
│       • invalid → returns 401 immediately                           │
│  ④ Routes to correct downstream service                             │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┘
   │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼
:8081      :8082      :8085      :8083      :8084      (future)
Auth    Transaction  Budget   Analytics  Notification
Service   Service   Service   Service    Service
```

---

### 2. Registration & Login Flow

```
Browser                  Gateway               Auth Service          MongoDB
  │                         │                      │                    │
  │──POST /api/auth/register►│                      │                    │
  │   { username,email,pw } │──────────────────────►│                    │
  │                         │  (no JWT check,       │──findByEmail()────►│
  │                         │   auth routes public) │◄──────────────────┤
  │                         │                       │  BCrypt hash pw    │
  │                         │                       │──save(user)───────►│
  │◄────────── 201 Created ─┤◄─────────────────────┤                    │
  │                         │                       │                    │
  │──POST /api/auth/login───►│                      │                    │
  │   { email, password }   │──────────────────────►│                    │
  │                         │                       │──findByEmail()────►│
  │                         │                       │◄──────────────────┤
  │                         │                       │  verify BCrypt     │
  │                         │                       │  generateToken()   │
  │                         │                       │  JWT payload:      │
  │                         │                       │  { sub: userId,    │
  │                         │                       │    email, username,│
  │                         │                       │    roles, exp }    │
  │◄── 200 OK  "ey..."  ────┤◄─────────────────────┤                    │
  │  (raw JWT string)       │                       │                    │
  │                         │                       │                    │
  │  Browser stores JWT     │                       │                    │
  │  in localStorage        │                       │                    │
```

---

### 3. Authenticated Request Flow (Gateway JWT Filter)

```
Browser                   Gateway (JwtGatewayFilter)        Downstream Service
  │                               │                                │
  │── GET /api/transactions ──────►│                               │
  │   Authorization: Bearer <JWT> │                               │
  │                               │  Parse JWT locally             │
  │                               │  (shared JWT_SECRET)           │
  │                               │                               │
  │                               │  ┌─ VALID? ──────────────────►│
  │                               │  │  Inject headers:           │
  │                               │  │  X-User-Id:    <userId>    │
  │                               │  │  X-User-Roles: ROLE_USER   │
  │                               │  │                            │
  │◄────────── 200 OK ────────────┤◄─┘                            │
  │                               │                               │
  │                               │  ✗ INVALID / EXPIRED          │
  │◄────────── 401 Unauthorized ──┤  (short-circuit, never        │
  │                               │   reaches service)            │
```

---

### 4. Transaction Creation → Event-Driven Chain

```
Browser          Gateway        Transaction Svc      Kafka: expense.events
  │                │                  │                       │
  │─POST /api/transactions──►│        │                       │
  │  { amount, category,    │──────►│                        │
  │    type:"DEBIT", date } │        │  userId = X-User-Id   │
  │                         │        │  save to MongoDB       │
  │                         │        │──publish(userId, ──────►│
  │                         │        │  ExpenseEvent{         │
  │◄── 201 Created ─────────┤◄──────┤   eventType,          │
  │                         │        │   transactionId,       │
  │                         │        │   userId, amount,      │
  │                         │        │   category, type,      │
  │                         │        │   date })              │
  │                         │        │                        │
  │                         │        │         ┌─────────────►│
  │                         │        │         │  Budget Svc  │
  │                         │        │         │  consumes    │
  │                         │        │         │  expense.events
  │                         │        │         │              │
  │                         │        │         ├─────────────►│
  │                         │        │         │  Analytics   │
  │                         │        │         │  Svc         │
  │                         │        │         │  consumes    │
  │                         │        │         │  expense.events
```

---

### 5. Budget Alert → Real-Time Notification Flow

```
Budget Service          Kafka: alert.events     Notification Service     Browser SSE
     │                         │                        │                    │
     │  Expense event received  │                       │                    │
     │  currentSpend += amount  │                       │                    │
     │                         │                        │                    │
     │  IF spend/limit >= 80%  │                        │                    │
     │    AND 80 not in         │                       │                    │
     │    alertsFired:          │                       │                    │
     │──publish(userId, ────────►│                      │                    │
     │  AlertEvent{             │                       │                    │
     │   category, limit,       │                       │                    │
     │   currentSpend,          │                       │                    │
     │   percentUsed:81,        │                       │                    │
     │   threshold:80 })        │──────────────────────►│                    │
     │                         │                        │  save to MongoDB   │
     │                         │                        │──push SSE event───►│
     │                         │                        │                    │ "budget-alert"
     │                         │                        │                    │ event received
     │                         │                        │                    │ in browser
```

---

### 6. Analytics Read Path (Ignite Cache)

```
Browser          Gateway        Analytics Svc        Ignite Cache      MongoDB
  │                │                  │                    │               │
  │─GET /api/analytics/summary/{id}─►│                    │               │
  │                         │──────►│                     │               │
  │                         │        │──get(cacheKey)─────►│               │
  │                         │        │                    │               │
  │                         │        │  ┌─ HIT (< 30 min TTL)            │
  │◄── 200 OK (fast) ───────┤◄──────┤◄─┘                 │               │
  │                         │        │                    │               │
  │                         │        │  ✗ MISS             │               │
  │                         │        │──────────────────────────────────►│
  │                         │        │◄──────────────────────────────────┤
  │                         │        │──put(cacheKey, summary)──────────►│
  │◄── 200 OK (slower) ─────┤◄──────┤  (re-warm cache)   │               │
```

---

### 7. Kafka Topics Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Topic: expense.events         Partition key: userId            │
│                                                                  │
│  Producer:  Transaction Service                                  │
│  Consumers: Budget Service (group: budget-service-group)        │
│             Analytics Service (group: analytics-service-group)  │
│                                                                  │
│  Message: { eventType, transactionId, userId, amount,          │
│             category, type, date, timestamp }                    │
├─────────────────────────────────────────────────────────────────┤
│  Topic: alert.events           Partition key: userId            │
│                                                                  │
│  Producer:  Budget Service                                       │
│  Consumer:  Notification Service (group: notification-service-  │
│             group)                                               │
│                                                                  │
│  Message: { eventType:"BUDGET_ALERT", userId, category,        │
│             limitAmount, currentSpend, percentUsed,             │
│             threshold, month, year, timestamp }                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8. Service Port Map

| Service              | Port  | Role                                           |
|----------------------|-------|------------------------------------------------|
| React Frontend       | 5173  | SPA — all user interaction                     |
| API Gateway          | 8080  | Single entry point, JWT validation, routing    |
| Auth Service         | 8081  | Register, login, `/auth/validate`              |
| Transaction Service  | 8082  | CRUD expenses, publishes `expense.events`      |
| Analytics Service    | 8083  | Ignite cache + MongoDB aggregates              |
| Notification Service | 8084  | SSE stream + `alert.events` consumer          |
| Budget Service       | 8085  | Budget limits, threshold alerts                |
| MongoDB              | 27017 | Primary data store (all services)             |
| Kafka                | 9092  | Async event bus                                |
| Ignite               | 10800 | In-memory analytics cache (30-min TTL)         |

---

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven

---

## Environment Configuration

All secrets live in `backend/.env` — **never commit this file**.

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=<base64-encoded-secret-min-32-bytes>
KAFKA_BROKER=localhost:9092
```

### Generating a secure JWT secret

The JWT secret **must be a Base64-encoded string** of at least 32 bytes:

```bash
# Linux / macOS
openssl rand -base64 48

# Windows PowerShell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Paste the output directly as the `JWT_SECRET` value.

---

## Running Locally

### Step 1 — Start infrastructure (MongoDB + Kafka + Ignite)

```bash
cd docker
docker-compose up -d
```

| Dependency | Port  |
|------------|-------|
| MongoDB    | 27017 |
| Kafka      | 9092  |
| Ignite     | 10800 |

### Step 2 — Build all backend services

```bash
cd backend
./mvnw clean install -DskipTests
```

### Step 3 — Start services in order

Start each in its own terminal. **Order matters** — the gateway needs auth-service running first.

```bash
# Terminal 1
./mvnw spring-boot:run -pl auth-service

# Terminal 2
./mvnw spring-boot:run -pl gateway-service

# Terminal 3
./mvnw spring-boot:run -pl transaction-service

# Terminal 4
./mvnw spring-boot:run -pl budget-service

# Terminal 5
./mvnw spring-boot:run -pl analytics-service

# Terminal 6
./mvnw spring-boot:run -pl notification-service
```

> **Note for Analytics Service (Java 17 + Ignite):** If you get `InaccessibleObjectException` errors, start it with:
> ```bash
> ./mvnw spring-boot:run -pl analytics-service \
>   -Dspring-boot.run.jvmArguments="--add-opens=java.base/jdk.internal.misc=ALL-UNNAMED \
>   --add-opens=java.base/java.lang=ALL-UNNAMED \
>   --add-opens=java.base/java.util=ALL-UNNAMED"
> ```

### Step 4 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

All requests go through the gateway at `http://localhost:8080`. Auth endpoints are public; all others require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint                  | Auth | Body                              | Response            |
|--------|---------------------------|------|-----------------------------------|---------------------|
| POST   | `/api/auth/register`      | ✗    | `{ username, email, password }`   | `201 No Body`       |
| POST   | `/api/auth/login`         | ✗    | `{ email, password }`             | `200 "<jwt>"`       |
| GET    | `/api/auth/validate`      | ✓    | —                                 | `{ userId, email, roles }` |

### Transactions

| Method | Endpoint                    | Query params                          |
|--------|-----------------------------|---------------------------------------|
| POST   | `/api/transactions`         | —                                     |
| GET    | `/api/transactions`         | `category`, `from`, `to`, `page`, `size` |
| GET    | `/api/transactions/{id}`    | —                                     |
| DELETE | `/api/transactions/{id}`    | —                                     |

### Budgets

| Method | Endpoint         | Body / Query                                    |
|--------|------------------|-------------------------------------------------|
| POST   | `/api/budgets`   | `{ category, limitAmount, month, year }`        |
| GET    | `/api/budgets`   | `?month=5&year=2025`                            |

### Analytics

| Method | Endpoint                          | Query              |
|--------|-----------------------------------|--------------------|
| GET    | `/api/analytics/summary/{userId}` | `?month=5&year=2025` |
| GET    | `/api/analytics/yearly/{userId}`  | `?year=2025`       |

### Notifications

| Method | Endpoint                          | Notes                       |
|--------|-----------------------------------|-----------------------------|
| GET    | `/api/notifications/stream`       | SSE — keep connection open  |
| GET    | `/api/notifications`              | `?unreadOnly=true`          |
| PATCH  | `/api/notifications/{id}/read`    | Mark a notification as read |

---

## MongoDB Collections

| Collection      | Service      | Key fields                                                     |
|-----------------|--------------|----------------------------------------------------------------|
| `users`         | Auth         | `email` (unique), `username` (unique), `passwordHash`, `roles` |
| `transactions`  | Transaction  | `userId`, `amount`, `type`, `category`, `date`                 |
| `budgets`       | Budget       | `userId`, `category`, `month`, `year`, `currentSpend`, `alertsFired` |
| `analytics`     | Analytics    | `userId`, `month`, `year`, `byCategory`                        |
| `notifications` | Notification | `userId`, `type`, `message`, `read`, `createdAt`               |

---

## Technology Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 19, Vite, TailwindCSS, Recharts |
| API Gateway    | Spring Cloud Gateway 3.1          |
| Backend        | Spring Boot 3.3 (Java 17)         |
| Auth / JWT     | JJWT 0.11.5, BCrypt               |
| Database       | MongoDB                           |
| Messaging      | Apache Kafka                      |
| Caching        | Apache Ignite 2.16 (REPLICATED)   |
| Real-time      | Server-Sent Events (SSE)          |
| Containerisation | Docker Compose                  |
