# RAG Document Application

A **Retrieval-Augmented Generation (RAG)** API built with NestJS that enables document upload, text extraction, vector embedding storage, and intelligent Q&A powered by OpenAI.

## Features

- 📄 **Document Upload** – Upload PDF, TXT, and Markdown files
- 🔍 **Text Extraction** – Automatic text extraction from PDFs using `pdf-parse`
- 🧠 **Vector Embeddings** – Generate embeddings via OpenAI's embedding models
- 💾 **Vector Storage** – Store and query embeddings using ChromaDB
- 🤖 **RAG Query** – Ask questions and get answers based on your documents
- 🐘 **PostgreSQL** – Document metadata persistence with TypeORM

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
DB_SYNCHRONIZE=true
DB_LOGGING=true

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_COLLECTION=default_kb

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

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

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/upload` | Upload a document (multipart/form-data with `file` field) |
| `GET` | `/documents/:id` | Get document metadata by ID |
| `GET` | `/documents/:id/download` | Download the original file |

### Ingestion

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/documents/:id/ingest` | Process document: extract text, chunk, embed, and store in vector DB |

### RAG Query

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rag/query` | Ask a question against your knowledge base |

## Usage Examples

### Upload a Document

```bash
curl -X POST http://localhost:3000/documents/upload \
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
curl -X POST http://localhost:3000/documents/b61d7d5b-1485-4ea0-9c3d-442a9ca5d69d/ingest
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
└── rag/                    # RAG query orchestration
    ├── rag.controller.ts
    ├── rag.service.ts
    ├── rag.module.ts
    └── dto/
        └── rag-query.dto.ts
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
