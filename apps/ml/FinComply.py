# Generated from: FinComply.ipynb
# Converted at: 2026-02-06T04:59:23.239Z
# Next step (optional): refactor into modules & generate tests with RunCell
# Quick start: pip install runcell

import os
import json
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from faker import Faker
import requests
from bs4 import BeautifulSoup

# Vector DB & Embeddings
from sentence_transformers import SentenceTransformer
import faiss

# Database
import psycopg2
from psycopg2.extras import execute_values

print("All imports successful!")

class SEBIDataGenerator:
    
    def __init__(self):
        self.faker = Faker()
        self.categories = [
            'Circular', 'Notification', 'Guidelines', 
            'Press Release', 'Master Circular', 'Amendment'
        ]
        
        self.topics = [
            'Insider Trading Regulations',
            'Mutual Fund Compliance',
            'Stock Exchange Listing Requirements',
            'Corporate Governance Norms',
            'Disclosure Requirements',
            'Alternative Investment Funds',
            'Portfolio Management Services',
            'Credit Rating Agencies',
            'Investment Advisers Registration',
            'Depository Participants Guidelines',
            'Takeover Regulations',
            'Delisting Procedures',
            'Research Analyst Regulations',
            'Foreign Portfolio Investors',
            'Real Estate Investment Trusts (REITs)'
        ]
    
    def generate_sebi_text(self, topic, category):
        """Generate realistic SEBI document content"""
        
        sections = []
        
        # Header
        sections.append(f"""
SECURITIES AND EXCHANGE BOARD OF INDIA
{category.upper()}
Reference: SEBI/HO/IMD/{random.randint(1,99)}/CIR/P/{random.randint(2020,2025)}/{random.randint(100,999)}
Date: {self.faker.date_between(start_date='-2y', end_date='today')}

Subject: {topic}
        """.strip())
        
        # Introduction
        sections.append(f"""
1. BACKGROUND AND CONTEXT

In exercise of powers conferred under Section {random.choice([11, 12, 19, 30])} of the Securities and 
Exchange Board of India Act, 1992, and in pursuance of the objectives of investor protection and 
development of the securities market, SEBI hereby issues the following {category.lower()} on {topic}.

This {category.lower()} supersedes all previous circulars on this subject and shall come into force 
with immediate effect from the date of issuance.
        """.strip())
        
        # Main Content
        sections.append(f"""
2. REGULATORY REQUIREMENTS

2.1 Compliance Obligations
All registered intermediaries, market participants, and listed entities must ensure strict adherence 
to the following provisions:

a) Maintenance of adequate internal controls and risk management systems
b) Timely disclosure of material events within {random.choice([24, 48, 72])} hours
c) Appointment of compliance officers with requisite qualifications
d) Quarterly reporting to SEBI through online portals
e) Annual certification by auditors regarding compliance status

2.2 Documentation Requirements
Entities must maintain comprehensive records including:
- Transaction logs with timestamps and IP addresses
- Client communication records for minimum {random.choice([3, 5, 7])} years
- Board meeting minutes and compliance committee reports
- KYC documents with periodic updates every {random.choice([12, 24, 36])} months

2.3 Financial Thresholds
Minimum net worth requirements: Rs. {random.choice([10, 25, 50, 100])} crores
Liquid assets requirement: Not less than {random.choice([15, 20, 25])}% of net worth
Professional indemnity insurance: Minimum coverage of Rs. {random.choice([5, 10, 25])} crores
        """.strip())
        
        # Penalties
        sections.append(f"""
3. PENAL PROVISIONS

3.1 Non-compliance shall attract the following actions:
- Monetary penalty up to Rs. {random.choice([1, 5, 10, 25])} crore or {random.choice([1, 2, 3])}% of turnover
- Suspension of registration for {random.choice([6, 12, 24])} months
- Debarment from accessing securities market
- Criminal prosecution under applicable laws

3.2 Entities must submit compliance reports within {random.choice([15, 30, 45])} days failing which 
late submission fees of Rs. {random.choice([1000, 5000, 10000])} per day
        """.strip())
        
        # Implementation
        sections.append(f"""
4. IMPLEMENTATION TIMELINE

Phase 1: Existing entities must comply within {random.choice([90, 120, 180])} days
Phase 2: New applicants must comply from date of registration
Phase 3: SEBI shall conduct inspections starting from {self.faker.date_between(start_date='today', end_date='+6m')}

All stock exchanges, depositories, and clearing corporations are directed to ensure implementation 
and report to SEBI on a monthly basis.
        """.strip())
        
        # Footer
        sections.append(f"""
This circular is issued in public interest and for investor protection.

For any clarifications, please contact:
Division of {random.choice(['Investment Management', 'Market Regulation', 'Enforcement'])}
Securities and Exchange Board of India
SEBI Bhavan, Plot No. C4-A, 'G' Block, Bandra-Kurla Complex
Bandra (East), Mumbai - 400 051
Email: {self.faker.email()}
        """.strip())
        
        return "\n\n".join(sections)
    
    def generate_dataset(self, num_documents=50):
        """Generate complete SEBI document dataset"""
        
        documents = []
        
        for i in range(num_documents):
            topic = random.choice(self.topics)
            category = random.choice(self.categories)
            
            doc = {
                'id': f'SEBI-{i+1:03d}',
                'title': f'{category} on {topic}',
                'category': category,
                'topic': topic,
                'published_date': self.faker.date_between(start_date='-2y', end_date='today').isoformat(),
                'source_url': f'https://www.sebi.gov.in/legal/circulars/{i+1}.html',
                'content': self.generate_sebi_text(topic, category),
                'document_type': random.choice(['PDF', 'HTML']),
                'metadata': {
                    'regulation_number': f'SEBI/HO/{random.choice(["IMD", "MRD", "CFD"])}/{random.randint(1,99)}/{random.randint(2020,2025)}',
                    'keywords': [topic, category, 'compliance', 'regulations'],
                    'word_count': 0  # Will calculate
                }
            }
            
            doc['metadata']['word_count'] = len(doc['content'].split())
            documents.append(doc)
        
        return documents

# Generate synthetic SEBI data
print("Generating synthetic SEBI documents...")
generator = SEBIDataGenerator()
sebi_documents = generator.generate_dataset(num_documents=100)

# Save to JSON
with open('sebi_documents.json', 'w') as f:
    json.dump(sebi_documents, f, indent=2)

# Save to CSV for easy viewing
df_docs = pd.DataFrame([
    {
        'id': doc['id'],
        'title': doc['title'],
        'category': doc['category'],
        'published_date': doc['published_date'],
        'word_count': doc['metadata']['word_count']
    }
    for doc in sebi_documents
])

df_docs.to_csv('sebi_documents_summary.csv', index=False)

print(f"Generated {len(sebi_documents)} SEBI documents")
print(f"Summary saved to: sebi_documents_summary.csv")
print(f"Full data saved to: sebi_documents.json")
print("\nSample document:")
print(f"Title: {sebi_documents[0]['title']}")
print(f"Content preview: {sebi_documents[0]['content'][:300]}...")


class TextChunker:
    
    def __init__(self, chunk_size=500, overlap=100):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_by_sentences(self, text):
        import re
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            if current_length + sentence_length > self.chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                # Keep overlap
                overlap_sentences = []
                overlap_length = 0
                for s in reversed(current_chunk):
                    if overlap_length < self.overlap:
                        overlap_sentences.insert(0, s)
                        overlap_length += len(s.split())
                    else:
                        break
                current_chunk = overlap_sentences
                current_length = overlap_length
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def create_chunks_with_metadata(self, documents):
        
        all_chunks = []
        
        for doc in documents:
            chunks = self.chunk_by_sentences(doc['content'])
            
            for idx, chunk in enumerate(chunks):
                chunk_data = {
                    'chunk_id': f"{doc['id']}-chunk-{idx}",
                    'document_id': doc['id'],
                    'chunk_index': idx,
                    'chunk_text': chunk,
                    'document_title': doc['title'],
                    'category': doc['category'],
                    'published_date': doc['published_date'],
                    'source_url': doc['source_url'],
                    'metadata': doc['metadata']
                }
                all_chunks.append(chunk_data)
        
        return all_chunks

# Create chunks
print("\nChunking documents...")
chunker = TextChunker(chunk_size=500, overlap=100)
chunks = chunker.create_chunks_with_metadata(sebi_documents)

print(f"Created {len(chunks)} chunks from {len(sebi_documents)} documents")
print(f"Average chunks per document: {len(chunks)/len(sebi_documents):.1f}")

# Save chunks
df_chunks = pd.DataFrame(chunks)
df_chunks.to_csv('sebi_chunks.csv', index=False)
print("Chunks saved to: sebi_chunks.csv")


class VectorStore:
    
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = None
        self.chunks = None
        print(f"Model loaded. Embedding dimension: {self.dimension}")
    
    def create_embeddings(self, chunks):
        
        print(f"\nGenerating embeddings for {len(chunks)} chunks...")
        
        texts = [chunk['chunk_text'] for chunk in chunks]
        
        # Generate embeddings in batches
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=True,
            convert_to_numpy=True
        )
        
        return embeddings
    
    def build_index(self, chunks):
        
        self.chunks = chunks
        embeddings = self.create_embeddings(chunks)
        
        # Create FAISS index
        print(f"\nBuilding FAISS index...")
        self.index = faiss.IndexFlatL2(self.dimension)
        self.index.add(embeddings.astype('float32'))
        
        print(f"FAISS index built with {self.index.ntotal} vectors")
        
        return embeddings
    
    def search(self, query, top_k=5):
        
        if self.index is None:
            raise ValueError("Index not built. Call build_index() first.")
        
        # Generate query embedding
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        
        # Search FAISS index
        distances, indices = self.index.search(
            query_embedding.astype('float32'), 
            top_k
        )
        
        # Return results with metadata
        results = []
        for idx, distance in zip(indices[0], distances[0]):
            chunk = self.chunks[idx]
            results.append({
                'chunk_text': chunk['chunk_text'],
                'document_title': chunk['document_title'],
                'category': chunk['category'],
                'source_url': chunk['source_url'],
                'published_date': chunk['published_date'],
                'similarity_score': 1 / (1 + distance), 
                'distance': float(distance)
            })
        
        return results
    
    def save_index(self, filepath='faiss_index.bin'):
        faiss.write_index(self.index, filepath)
        print(f"FAISS index saved to: {filepath}")
    
    def load_index(self, filepath='faiss_index.bin'):
        self.index = faiss.read_index(filepath)
        print(f"FAISS index loaded from: {filepath}")

# Build vector store
vector_store = VectorStore(model_name='all-MiniLM-L6-v2')
embeddings = vector_store.build_index(chunks)

# Save embeddings and index
np.save('embeddings.npy', embeddings)
vector_store.save_index('faiss_index.bin')

print("\nVector store ready!")

class RAGSystem:
    
    def __init__(self, vector_store):
        self.vector_store = vector_store
    
    def retrieve_context(self, query, top_k=5, min_similarity=0.3):
        
        results = self.vector_store.search(query, top_k=top_k)
        
        # Filter by similarity threshold
        filtered_results = [
            r for r in results 
            if r['similarity_score'] >= min_similarity
        ]
        
        return filtered_results
    
    def build_prompt(self, query, contexts):
        
        if not contexts:
            return f"""You are FinComply AI, a SEBI compliance expert.

USER QUERY: {query}

RESPONSE: I don't have specific SEBI regulations on this topic in my current database. Please try rephrasing your query or contact SEBI directly at www.sebi.gov.in
"""
        
        context_text = ""
        for idx, ctx in enumerate(contexts, 1):
            context_text += f"""
[Source {idx}]
Title: {ctx['document_title']}
Category: {ctx['category']}
Date: {ctx['published_date']}
URL: {ctx['source_url']}
Relevance: {ctx['similarity_score']:.2%}

Content:
{ctx['chunk_text']}

---
"""
        
        prompt = f"""You are FinComply AI, a SEBI compliance expert. Use ONLY the provided context to answer.

CRITICAL RULES:
1. Answer ONLY using information from the context below
2. If the context doesn't contain the answer, say so clearly
3. ALWAYS cite sources using [Source N] notation
4. Never make up regulations
5. Be precise and factual

CONTEXT:
{context_text}

USER QUERY: {query}

RESPONSE (with citations):"""
        
        return prompt
    
    def query(self, user_query, top_k=5):
        
        print(f"\nQuery: {user_query}")

        # Retrieve context
        contexts = self.retrieve_context(user_query, top_k=top_k)
        
        print(f"\nFound {len(contexts)} relevant chunks:")
        for idx, ctx in enumerate(contexts, 1):
            print(f"\n[{idx}] {ctx['document_title']}")
            print(f"    Category: {ctx['category']} | Date: {ctx['published_date']}")
            print(f"    Relevance: {ctx['similarity_score']:.2%}")
            print(f"    Preview: {ctx['chunk_text'][:150]}...")
        
        # Build prompt
        prompt = self.build_prompt(user_query, contexts)
        
        print(f"\nGenerated prompt ({len(prompt)} chars)")
        print("PROMPT FOR LLM:")
        print(prompt)
        
        return {
            'query': user_query,
            'contexts': contexts,
            'prompt': prompt,
            'num_sources': len(contexts)
        }

# Initialize RAG system
rag_system = RAGSystem(vector_store)

test_queries = [
    "What are the insider trading regulations?",
    "What are the compliance requirements for mutual funds?",
    "What are the penalties for non-compliance?",
    "What is the minimum net worth requirement?",
    "What are the disclosure requirements for listed entities?",
    "What documentation is required for registration?",
    "What are the timelines for implementation?",
    "What are the requirements for foreign portfolio investors?"
]

print("RUNNING TEST QUERIES")
results_summary = []

for query in test_queries[:3]:  
    result = rag_system.query(query, top_k=3)
    results_summary.append({
        'query': query,
        'sources_found': result['num_sources'],
        'avg_relevance': np.mean([c['similarity_score'] for c in result['contexts']]) if result['contexts'] else 0
    })

# Summary
df_results = pd.DataFrame(results_summary)
print("\nQUERY RESULTS SUMMARY:")
print(df_results.to_string(index=False))