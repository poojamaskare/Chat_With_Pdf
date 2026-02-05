# Chat with PDF

A **fully local AI-powered chatbot** that lets you upload PDF documents and ask questions about their content. Built with RAG (Retrieval Augmented Generation) architecture — runs 100% offline with no API keys required.



##  Features

- 🔒 **100% Local & Private** — No data leaves your machine
- 💰 **Zero API Costs** — Uses Ollama for free local AI
- 📄 **Multi-PDF Support** — Upload multiple PDFs, search across all
- 🔍 **Semantic Search** — Finds meaning, not just keywords
- 📑 **Source Citations** — Shows PDF name and page number for answers
- 🌐 **Works Offline** — No internet required after setup

---

##  Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Express Server │────▶│     Ollama      │
│   (Frontend)    │     │    (Backend)    │     │   (Local LLM)   │
│   Port: 3000    │     │   Port: 8000    │     │   Port: 11434   │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌───────────────┐         ┌───────────────┐
            │    Qdrant     │         │ Redis/Valkey  │
            │ (Vector DB)   │         │ (Job Queue)   │
            │  Port: 6333   │         │  Port: 6379   │
            └───────────────┘         └───────────────┘
```

---

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | Frontend UI with React |
| **Express.js** | Backend REST API |
| **Ollama** | Local LLM (llama3.2) & Embeddings (nomic-embed-text) |
| **Qdrant** | Vector database for semantic search |
| **Redis/Valkey** | Job queue for background processing |
| **BullMQ** | Queue management |
| **LangChain** | AI framework for RAG pipeline |
| **Docker** | Container runtime for databases |

---

##  Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.ai/)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/chat-with-pdf.git
cd chat-with-pdf
```

### 2. Install Ollama models
```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

### 3. Start Docker containers
```bash
cd server
docker-compose up -d
```

### 4. Install dependencies
```bash
# Server
cd server
pnpm install

# Client
cd ../client
pnpm install
```

### 5. Start the application
```bash
# Terminal 1 - Server
cd server
pnpm dev

# Terminal 2 - Worker
cd server
pnpm dev:worker

# Terminal 3 - Client
cd client
pnpm dev
```

### 6. Open the app
Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
chat_with_pdf/
├── client/                 # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   │   ├── chat.tsx      # Chat interface
│   │   └── File-upload.tsx
│   └── package.json
│
├── server/                 # Express backend
│   ├── index.js           # API endpoints
│   ├── worker.js          # Background job processor
│   ├── docker-compose.yml # Qdrant + Redis
│   ├── uploads/           # Uploaded PDFs
│   └── package.json
│
└── README.md
```

---

## 🔄 How It Works

### PDF Upload Flow
1. User uploads PDF via the UI
2. Express server saves file and adds job to Redis queue
3. Worker picks up the job and:
   - Extracts text from PDF
   - Splits text into chunks (300 chars each)
   - Creates embeddings using `nomic-embed-text`
   - Stores embeddings in Qdrant

### Chat Flow
1. User asks a question
2. Question is converted to an embedding
3. Qdrant finds the 2 most similar chunks (semantic search)
4. Chunks + question are sent to `llama3.2`
5. LLM generates answer based on the context
6. Response is returned with source citations

---

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8000 | Express server port |
| `OLLAMA_BASE_URL` | http://localhost:11434 | Ollama API URL |
| `QDRANT_URL` | http://localhost:6333 | Qdrant database URL |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/upload/pdf` | Upload a PDF file |
| `GET` | `/chat?message=...` | Ask a question |

---
#Results
<img width="940" height="458" alt="image" src="https://github.com/user-attachments/assets/bcab5100-8b98-4cd1-b62c-5aa6af8fb514" />
