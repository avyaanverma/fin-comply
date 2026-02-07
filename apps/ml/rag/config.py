from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

DEFAULT_INDEX_PATH = DATA_DIR / "faiss_index.bin"
DEFAULT_CHUNKS_PATH = DATA_DIR / "sebi_chunks.csv"

DEFAULT_MODEL_NAME = "all-MiniLM-L6-v2"
DEFAULT_TOP_K = 5
DEFAULT_MIN_SIMILARITY = 0.3
