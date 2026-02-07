import numpy as np
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer


class VectorStore:
    def __init__(self, index_path, chunks_path, model_name):
        self.model = SentenceTransformer(model_name)
        self.index = faiss.read_index(str(index_path))
        self.chunks = pd.read_csv(chunks_path).to_dict(orient="records")

    def search(self, query, top_k=5):
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(
            np.array(query_embedding).astype("float32"), top_k
        )

        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < 0:
                continue
            chunk = self.chunks[idx]
            results.append(
                {
                    "chunk_text": chunk["chunk_text"],
                    "document_title": chunk["document_title"],
                    "category": chunk["category"],
                    "source_url": chunk["source_url"],
                    "published_date": chunk["published_date"],
                    "similarity_score": float(1 / (1 + dist)),
                    "distance": float(dist),
                }
            )

        return results
