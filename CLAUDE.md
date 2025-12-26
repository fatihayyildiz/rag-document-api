# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

## Project Overview

This is a **RAG (Retrieval-Augmented Generation) Document Application** built with NestJS. It allows users to upload documents, extract and embed text into a vector database, and query the knowledge base using natural language.

## Tech Stack

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL 16 (document metadata via TypeORM)
- **Vector Store**: ChromaDB
- **LLM/Embeddings**: OpenAI API (GPT-4o-mini, text-embedding-3-small)
- **PDF Parsing**: pdf-parse v2 (uses `PDFParse` class, not a function)
- **Package Manager**: pnpm

## Common Commands

```bash
# Start development server (watch mode)
pnpm run start:dev

# Build for production
pnpm run build

# Run production build
pnpm run start:prod

# Start infrastructure (PostgreSQL + ChromaDB)
docker compose up -d

# Stop infrastructure
docker compose down

# Run tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Lint and format
pnpm run lint
pnpm run format
```

## Architecture & Key Modules

### Module Structure

```
AppModule
├── AuthModule         → JWT authentication, user management
├── DocumentsModule    → Upload, metadata, file storage
├── IngestionModule    → Text extraction, chunking, embedding pipeline
├── EmbeddingsModule   → OpenAI embeddings generation
├── VectorStoreModule  → ChromaDB integration
├── LlmModule          → OpenAI chat completions
└── RagModule          → Query orchestration (retrieval + generation)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/auth/auth.service.ts` | User registration, login, JWT token generation |
| `src/auth/users.service.ts` | User CRUD operations |
| `src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy |
| `src/auth/guards/jwt-auth.guard.ts` | Global JWT authentication guard |
| `src/documents/documents.service.ts` | Document CRUD, file path resolution |
| `src/ingestion/ingestion.service.ts` | PDF/text extraction, chunking, embedding pipeline |
| `src/embeddings/embeddings.service.ts` | OpenAI embeddings via `text-embedding-3-small` |
| `src/vector-store/chroma.store.ts` | ChromaDB client wrapper (upsert, query) |
| `src/llm/llm.service.ts` | OpenAI chat completion with context |
| `src/rag/rag.service.ts` | RAG orchestration: embed query → retrieve → generate |

### Data Flow

1. **Register/Login**: `POST /auth/register` or `POST /auth/login` → receive JWT token
2. **Upload**: `POST /documents/upload` (with Bearer token) → file saved to `storage/uploads/`, metadata to PostgreSQL
3. **Ingest**: `POST /documents/:id/ingest` (with Bearer token) → extract text → chunk → embed → store in ChromaDB
4. **Query**: `POST /rag/query` (with Bearer token) → embed question → retrieve similar chunks → LLM generates answer

## Important Implementation Details

### PDF Parsing (pdf-parse v2)

The library uses a class-based API:

```typescript
import { PDFParse } from 'pdf-parse';

const buffer = await fs.readFile(filePath);
const pdfParser = new PDFParse({ data: buffer });
const result = await pdfParser.getText();
return result.text || '';
```

### Chunking Strategy

Text is chunked with overlap for better retrieval:
- **Chunk size**: 1200 characters
- **Overlap**: 200 characters

### Environment Variables

Required in `.env`:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=rag
POSTGRES_USER=rag
POSTGRES_PASSWORD=rag_password_change_me
DB_SYNCHRONIZE=true

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=default_kb

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRES_IN=7d

# RAG
RAG_TOP_K=5
RAG_MAX_CONTEXT_CHARS=12000
```

## Authentication

The API uses JWT-based authentication. All endpoints are protected by default except:
- `GET /` - Hello endpoint
- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Making Authenticated Requests

```bash
# Get token via login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' | jq -r '.accessToken')

# Use token in requests
curl http://localhost:3000/documents/some-id \
  -H "Authorization: Bearer $TOKEN"
```

### Key Auth Components

| File | Purpose |
|------|---------|
| `src/auth/decorators/public.decorator.ts` | `@Public()` decorator to skip auth |
| `src/auth/decorators/current-user.decorator.ts` | `@CurrentUser()` to get user in controllers |
| `src/auth/guards/jwt-auth.guard.ts` | Global guard checking JWT tokens |
| `src/auth/entities/user.entity.ts` | User entity (id, email, password, isActive) |

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, get JWT token |
| `GET` | `/auth/me` | Get current user (auth required) |

### Documents (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/upload` | Upload document (multipart `file` field) |
| `GET` | `/documents/:id` | Get document metadata |
| `GET` | `/documents/:id/download` | Download original file |
| `POST` | `/documents/:id/ingest` | Process & embed document |

### RAG (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rag/query` | Query knowledge base |

### RAG Query Body

```json
{
  "query": "What is...",
  "topK": 5,
  "docId": "optional-uuid-to-filter"
}
```

## File Storage

- **Uploads**: `storage/uploads/` (local disk)
- **ChromaDB data**: `storage/chroma/` (Docker volume)

## Testing

- Unit tests: `src/**/*.spec.ts`
- E2E tests: `test/*.e2e-spec.ts`
- Config: `test/jest-e2e.json`

## Path Aliases

TypeScript uses path aliases defined in `tsconfig.json`:
- `@/*` → `src/*`
- `utils/*` → `utils/*`
- `types/*` → `types/*`
