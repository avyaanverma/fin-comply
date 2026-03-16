# FinComply — AI-Powered SEBI Compliance Assistant

FinComply is an AI-powered regulatory intelligence platform designed to help individuals and organizations understand and comply with updates issued by the Securities and Exchange Board of India (SEBI).

The system converts SEBI circulars and regulatory updates into interactive discussion threads where users can ask questions and receive context-aware answers generated through a Retrieval-Augmented Generation (RAG) model.

Instead of manually reading lengthy legal documents, users can interact with regulatory updates through a conversational interface and receive grounded explanations with references to the original SEBI documents.

---

# Project Overview

Regulatory documents are often lengthy and difficult to interpret. FinComply simplifies this process by combining:

• Automated ingestion of SEBI updates
• Document processing and semantic indexing
• AI-powered question answering
• Community-based regulatory discussion threads

Each SEBI update becomes a community discussion room where users can ask questions and receive AI-generated responses grounded in the official SEBI documentation.

The system ensures that responses remain context-aware and traceable to the original regulatory text.

---

# Key Features

## SEBI Update Ingestion

SEBI circulars and regulatory documents are automatically processed and converted into structured text. Each update is stored and used as the context for community discussions.

## Community Discussion Threads

Each SEBI update generates a dedicated community chat thread where multiple users can discuss and ask questions related to that update.

## AI-Powered Question Answering

A Retrieval-Augmented Generation (RAG) model retrieves relevant regulatory clauses and generates responses grounded in SEBI documentation.

## Personalized Compliance Queries

Users can also ask personal compliance questions based on their company profile, industry sector, or operational context.

## Source-Grounded Responses

All AI responses include references to the SEBI documents used to generate the answer.

---

# System Architecture

The system is built using a **multi-service architecture** consisting of three main components.

```
Frontend (Next.js UI)
        │
        ▼
Backend Orchestrator (Next.js API)
        │
        ├── MongoDB (Users, Threads, Messages)
        │
        ▼
RAG Model API (Python / FastAPI)
        │
        ▼
Vector Search (FAISS)
```

### Component Responsibilities

**Frontend**

* Provides the chat interface
* Displays community threads and messages
* Sends user questions to the backend

**Backend (Next.js API)**

* Handles authentication and user sessions
* Manages threads and messages
* Orchestrates communication with the RAG API
* Stores chat history and citations in MongoDB

**RAG Model API**

* Performs semantic retrieval over SEBI documents
* Uses embeddings and vector search
* Generates context-aware AI responses

---

# Technology Stack

## Frontend

Next.js
React
TypeScript

## Backend

Next.js API Routes (Node.js)
MongoDB with Mongoose

## AI / Machine Learning

Python
FastAPI
Sentence Transformers
FAISS (Vector Search)

## Data Processing

PDF Text Extraction
Document Chunking
Embedding Generation

---

# Project Structure

```
fin-comply
│
├── apps
│   ├── web                 # Next.js frontend + backend APIs
│   └── ml                  # Python RAG model API
│
├── services
│   └── sebi-processor      # SEBI document ingestion and cleaning
│
├── docs                    # Architecture and documentation
│
└── README.md
```

---

# Backend API Endpoints

### Authentication

POST /api/auth/login
Authenticate user and create session

POST /api/auth/register
Register a new user

GET /api/auth/session
Retrieve active user session

---

### Thread Management

GET /api/threads?mode=community
Fetch all SEBI community discussion threads

GET /api/threads?mode=personal
Fetch personal user threads

---

### Messages & AI Interaction

POST /api/messages
Send a user message, call the RAG model, and store the AI response

GET /api/threads/{threadId}/messages
Retrieve the full message history of a thread

---

### SEBI Update Processing

POST /api/sebi/ingest
Ingest a processed SEBI update and create a new discussion thread

---

# RAG Model API

The RAG service is a stateless Python API responsible for AI reasoning.

Responsibilities include:

• Retrieving relevant SEBI document chunks
• Performing semantic similarity search
• Generating grounded AI responses
• Returning supporting citations

### Example Request

```
POST /rag/answer
```

Payload

```
{
  "sebi_title": "Mutual Fund Compliance",
  "sebi_summary": "...",
  "user_question": "What are the compliance requirements?"
}
```

---

# Installation & Setup

## Clone the Repository

```
git clone https://github.com/yourusername/fincomply.git
cd fincomply
```

---

## Install Frontend & Backend

```
cd apps/web
pnpm install
pnpm dev
```

The application will run on

```
http://localhost:3000
```

---

## Run the RAG Model API

```
cd apps/ml
pip install -r requirements.txt
python api.py
```

The RAG API will run on

```
http://localhost:8000
```

---

# Example Workflow

1. SEBI update is ingested and processed
2. Backend creates a community thread for the update
3. Users open the thread and ask questions
4. Backend sends the question and context to the RAG API
5. The RAG model retrieves relevant clauses and generates an answer
6. Response and citations are stored and displayed in the chat

---

# Future Improvements

• Automated SEBI crawler for real-time updates
• Compliance dashboards for organizations
• Improved citation highlighting in responses
• Notification system for regulatory changes
• Advanced compliance rule extraction

---

# Capstone Project

This project was developed as a **capstone project** to explore the application of Retrieval-Augmented Generation in regulatory compliance systems.

The goal is to demonstrate how AI systems can improve accessibility and understanding of complex financial regulations.

---

# License

This project is intended for educational and research purposes.
