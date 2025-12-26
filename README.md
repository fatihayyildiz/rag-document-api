# RAG Document Application

A **Retrieval-Augmented Generation (RAG)** API built with NestJS that enables document upload, text extraction, vector embedding storage, and intelligent Q&A powered by OpenAI.

## Features

- 📄 **Document Upload** – Upload PDF, TXT, and Markdown files
- 🔍 **Text Extraction** – Automatic text extraction from PDFs using `pdf-parse`
- 🧠 **Vector Embeddings** – Generate embeddings via OpenAI's embedding models
- 💾 **Vector Storage** – Store and query embeddings using ChromaDB
- 🤖 **RAG Query** – Ask questions and get answers based on your documents
- 🐘 **PostgreSQL** – Document metadata persistence with TypeORM
- 🔐 **JWT Authentication** – Secure API endpoints with JWT-based authentication
- 🔄 **Database Migrations** – Production-ready TypeORM migrations

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [NestJS](https://nestjs.com/) v11 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| Vector Store | [ChromaDB](https://www.trychroma.com/) |
| LLM Provider | OpenAI (GPT-4o-mini, text-embedding-3-small) |
| PDF Parsing | pdf-parse v2 |
| Package Manager | pnpm |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client/API    │────▶│   NestJS App    │────▶│    PostgreSQL   │
└─────────────────┘     └────────┬────────┘     │  (doc metadata) │
                                 │              └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
             ┌──────────┐ ┌──────────┐ ┌──────────┐
             │  OpenAI  │ │ ChromaDB │ │  Storage │
             │Embeddings│ │ (vectors)│ │ (files)  │
             └──────────┘ └──────────┘ └──────────┘
```

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose
- OpenAI API Key

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd rag-doc-app
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the project root

or run this command below:

```bash
cp .env.example .env
```

and update `.env` conent as shown below:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rag
POSTGRES_USER=rag
POSTGRES_PASSWORD=rag_password_change_me

# Database Options
DB_MIGRATIONS_RUN=true
DB_LOGGING=true

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=default_kb

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRES_IN=7d

# RAG Settings
RAG_TOP_K=5
RAG_MAX_CONTEXT_CHARS=12000
```

### 3. Start Infrastructure

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **ChromaDB** on port `8000`

### 4. Run the Application

```bash
# Development (watch mode)
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and get JWT token | No |
| `GET` | `/auth/me` | Get current user profile | Yes |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | Hello endpoint | No |
| `GET` | `/health` | Health check endpoint | No |

### Documents

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/documents/upload` | Upload a document (multipart/form-data with `file` field) | Yes |
| `GET` | `/documents/:id` | Get document metadata by ID | Yes |
| `GET` | `/documents/:id/download` | Download the original file | Yes |

### Ingestion

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/documents/:id/ingest` | Process document: extract text, chunk, embed, and store in vector DB | Yes |

### RAG Query

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/rag/query` | Ask a question against your knowledge base | Yes |

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_secure_password"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "user@example.com"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_secure_password"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "user@example.com"
  }
}
```

### Upload a Document (with Authentication)

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Response:**
```json
{
  "docId": "b61d7d5b-1485-4ea0-9c3d-442a9ca5d69d",
  "originalName": "document.pdf",
  "storedName": "document-1735123456789-123456789.pdf",
  "mimeType": "application/pdf",
  "size": 102400,
  "storagePath": "/path/to/storage/uploads/document-xxx.pdf",
  "status": "uploaded",
  "createdAt": "2025-12-25T10:00:00.000Z"
}
```

### Ingest a Document

```bash
curl -X POST http://localhost:3000/documents/b61d7d5b-1485-4ea0-9c3d-442a9ca5d69d/ingest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "docId": "b61d7d5b-1485-4ea0-9c3d-442a9ca5d69d",
  "status": "ingested",
  "chunks": 42,
  "embeddingModel": "text-embedding-3-small"
}
```

### Query the Knowledge Base

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "What is the main topic of the document?",
    "topK": 5
  }'
```

**Response:**
```json
{
  "answer": "The main topic of the document is...",
  "sources": [
    { "docId": "b61d7d5b-...", "source": "document.pdf", "chunkIndex": 3 }
  ],
  "debug": {
    "topK": 5,
    "embeddingModel": "text-embedding-3-small",
    "chatModel": "gpt-4o-mini",
    "matched": 5
  }
}
```

### Query a Specific Document

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "Summarize the key points",
    "docId": "b61d7d5b-1485-4ea0-9c3d-442a9ca5d69d"
  }'
```

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── documents/              # Document upload & metadata management
│   ├── document.entity.ts  # TypeORM entity
│   ├── documents.controller.ts
│   ├── documents.service.ts
│   └── documents.module.ts
├── ingestion/              # Text extraction & chunking
│   ├── ingestion.controller.ts
│   ├── ingestion.service.ts
│   └── ingestion.module.ts
├── embeddings/             # OpenAI embeddings generation
│   ├── embeddings.service.ts
│   └── embeddings.module.ts
├── vector-store/           # ChromaDB integration
│   ├── chroma.store.ts
│   └── vector-store.module.ts
├── llm/                    # OpenAI chat completion
│   ├── llm.service.ts
│   └── llm.module.ts
├── rag/                    # RAG query orchestration
    ├── rag.controller.ts
    ├── rag.service.ts
    ├── rag.module.ts
    └── dto/
        └── rag-query.dto.ts
└── auth/                   # JWT authentication
    ├── auth.controller.ts
    ├── auth.service.ts
    ├── auth.module.ts
    ├── users.service.ts
    ├── entities/
    │   └── user.entity.ts
    ├── dto/
    │   ├── login.dto.ts
    │   └── register.dto.ts
    ├── guards/
    │   └── jwt-auth.guard.ts
    ├── strategies/
    │   └── jwt.strategy.ts
    └── decorators/
        ├── public.decorator.ts
        └── current-user.decorator.ts
└── database/               # Database migrations
    ├── data-source.ts      # TypeORM CLI config
    └── migrations/         # Migration files
```

## Development

### Available Scripts

```bash
pnpm run start:dev    # Start in watch mode
pnpm run build        # Build for production
pnpm run start:prod   # Run production build
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier
pnpm run test         # Run unit tests
pnpm run test:e2e     # Run end-to-end tests
pnpm run test:cov     # Run tests with coverage

# Database Migrations
pnpm run migration:run      # Run pending migrations
pnpm run migration:revert   # Revert last migration
pnpm run migration:show     # Show migration status
pnpm run migration:generate src/database/migrations/Name  # Auto-generate from entity changes
pnpm run migration:create src/database/migrations/Name    # Create empty migration
```

### Database Migrations

The application uses TypeORM migrations for database schema management. **Migrations run automatically on startup** when `DB_MIGRATIONS_RUN=true` (default).

#### Creating a New Migration

1. Modify your entity (e.g., add a new column)
2. Generate migration: `pnpm run migration:generate src/database/migrations/AddNewColumn`
3. Review the generated file in `src/database/migrations/`
4. Commit the migration file

#### Production Deployment

Migrations run automatically on app startup. For manual control:

```bash
# Build first (required for migrations)
pnpm run build

# Run migrations manually
pnpm run migration:run

# Then start the app with migrations disabled
DB_MIGRATIONS_RUN=false pnpm run start:prod
```

### Supported File Types

| Type | Extensions | MIME Types |
|------|------------|------------|
| PDF | `.pdf` | `application/pdf` |
| Plain Text | `.txt` | `text/plain` |
| Markdown | `.md` | `text/markdown` |

## Configuration

### Chunking Parameters

Text is split into overlapping chunks for better context retrieval:

- **Chunk Size**: 1200 characters (default)
- **Overlap**: 200 characters (default)

### RAG Parameters

| Variable | Default | Description |
|----------|---------|-------------|
| `RAG_TOP_K` | 5 | Number of similar chunks to retrieve |
| `RAG_MAX_CONTEXT_CHARS` | 12000 | Maximum context length for LLM |

### Extra

You can adjust 
`tempeture` parameter and `system message` prompt under `src/llm/llm.service.ts` to adjust accuracy of answers and context scope.

## License

UNLICENSED - Private project
