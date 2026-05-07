# Smart Expense Tracker

A modern, robust microservices-based web application for tracking personal expenses, setting budgets, and analyzing spending patterns.

## Architecture

The system is designed with a microservices architecture to ensure high scalability, reliability, and maintainability. It consists of the following components:

- **Frontend:** A React-based Single Page Application (SPA) built with Vite and TailwindCSS for a highly responsive, dynamic, and beautiful user experience.
- **API Gateway (`gateway-service`):** The single entry point for all client requests. It handles routing and CORS.
- **Auth Service (`auth-service`):** Manages user registration, authentication, and issues stateless JWT tokens.
- **Transaction Service (`transaction-service`):** Manages user expenses and incomes. Uses MongoDB for storage and publishes transaction events to Kafka.
- **Budget Service (`budget-service`):** Manages user budgets and thresholds.
- **Analytics Service (`analytics-service`):** Consumes events from Kafka to generate spending insights and reports. Uses MongoDB.
- **Notification Service (`notification-service`):** Sends alerts (e.g., when a budget is exceeded).
- **Caching (`ignite`):** Apache Ignite is used for distributed caching to improve performance.

## Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Kubernetes (Minikube or Docker Desktop with K8s enabled)
- Maven

## Environment Configuration

All secrets and credentials are managed via a `.env` file in the `backend/` directory. **This file is never committed to source control.**

### Setup

Copy the provided template and fill in your values:

```bash
cp backend/.env.example backend/.env
```

### Required Variables

| Variable | Description | How to Obtain |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Keep as `mongodb://localhost:27017/smart-expense-tracker` for local dev. For Atlas, get from [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | Generate one with `openssl rand -hex 64` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | See steps below |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | See steps below |
| `KAFKA_BROKER` | Kafka broker address | Keep as `localhost:9092` for local dev |

### Getting Google OAuth2 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → OAuth consent screen**
   - Set User Type to **External**, fill in App Name and support email, then save
4. Navigate to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add to **Authorised redirect URIs**: `http://localhost:8081/login/oauth2/code/google`
6. Click **Create** — copy the **Client ID** and **Client Secret** into your `backend/.env`

### Generating a Secure JWT Secret

```bash
# Using OpenSSL (recommended)
openssl rand -hex 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Example `backend/.env`

```env
MONGODB_URI=mongodb://localhost:27017/smart-expense-tracker
JWT_SECRET=your-generated-64-byte-hex-secret-here
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
KAFKA_BROKER=localhost:9092
```

> **Warning:** Never share or commit your `.env` file. It is already listed in `.gitignore`.

## Local Development Setup

### 1. Start Infrastructure Dependencies
The project relies on MongoDB, Kafka, and Apache Ignite. You can spin all of them up at once using the unified Docker Compose file:
```bash
cd docker
docker-compose up -d
```
This will expose:
- MongoDB on `localhost:27017`
- Kafka on `localhost:9092`
- Ignite on `localhost:10800` (Thin Client)

### 2. Run Backend Microservices
Navigate to the `backend` directory and compile the entire project:
```bash
cd backend
./mvnw clean install -DskipTests
```

Since this is a microservices architecture, you need to run the services individually. Open a new terminal for each service you wish to run:

**Terminal 1 (Auth Service):**
```bash
./mvnw spring-boot:run -pl auth-service
```

**Terminal 2 (Gateway Service):**
```bash
./mvnw spring-boot:run -pl gateway-service
```

**Terminal 3 (Transaction Service):**
```bash
./mvnw spring-boot:run -pl transaction-service
```

**Terminal 4 (Budget Service):**
```bash
./mvnw spring-boot:run -pl budget-service
```

**Terminal 5 (Analytics Service):**
```bash
./mvnw spring-boot:run -pl analytics-service
```

**Terminal 6 (Notification Service):**
```bash
./mvnw spring-boot:run -pl notification-service
```

### 3. Run the Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.
