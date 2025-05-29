from datetime import datetime
import os
import re
import json
import numpy as np
from typing import List, Dict, Optional, Any, Union, Tuple
from pathlib import Path
from sentence_transformers import SentenceTransformer
import PyPDF2
import docx


HAVE_DOCX = True
HAVE_PYPDF2 = True
HAVE_SENTENCE_TRANSFORMERS = True


class DocumentStore:
    """
    A simple vector-based RAG (Retrieval Augmented Generation) document store.
    
    This class provides functionality to:
    1. Process documents from a directory
    2. Create embeddings for document chunks
    3. Retrieve relevant document chunks for queries
    
    Uses sentence-transformers for embeddings and cosine similarity for retrieval.
    """
    
    def __init__(self, 
                embedding_model: str = "all-MiniLM-L6-v2",
                chunk_size: int = 1500,
                chunk_overlap: int = 200,
                index_file: str = "./backend/documents/chunks/document_index.json"):
        """
        Initialize the DocumentStore.
        
        Args:
            embedding_model: The sentence-transformers model to use for embeddings
            chunk_size: Maximum number of characters per document chunk
            chunk_overlap: Overlap between chunks to maintain context
            index_file: File to store document metadata and paths
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.index_file = index_file
        self.chunks_dir = "./backend/documents/chunks"  # Directory to store chunks
        self.document_chunks = []  # List to store text chunks
        self.embeddings = []       # List to store vector embeddings
        self.documents_info = {}   # Dict to store metadata about processed documents

        # Ensure chunks directory exists
        os.makedirs(self.chunks_dir, exist_ok=True)

        # Check for required dependencies
        if not HAVE_SENTENCE_TRANSFORMERS:
            print("Warning: sentence-transformers not installed. Install with: pip install sentence-transformers")
            self.model = None
        else:
            # Initialize embedding model
            try:
                self.model = SentenceTransformer(embedding_model)
                print(f"Loaded embedding model: {embedding_model}")
            except Exception as e:
                print(f"Error loading embedding model: {str(e)}")
                self.model = None

        # Load existing index if available
        self._load_index()
    
    def add_document_dir(self, directory_path: str, recursive: bool = True) -> int:
        """
        Process all supported documents in a directory.
        
        Args:
            directory_path: Path to directory containing documents
            recursive: Whether to recursively process subdirectories
            
        Returns:
            Number of documents successfully processed
        """
        if not os.path.isdir(directory_path):
            print(f"Error: {directory_path} is not a valid directory")
            return 0
        
        # Get all files in directory
        path = Path(directory_path)
        if recursive:
            files = list(path.rglob("*.*"))  # Get all files with recursion
        else:
            files = list(path.glob("*.*"))   # Get only files in this directory
            
        # Process each file
        processed_count = 0
        for file_path in files:
            if self._process_file(str(file_path)):
                processed_count += 1
                
        # After processing all files, update embeddings
        if processed_count > 0:
            self._update_embeddings()
            self._save_index()
            
        return processed_count
    
    def _process_file(self, file_path: str) -> bool:
        """
        Process a single file and add its content to the document store.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Whether the file was successfully processed
        """
        # Check if file already processed and has chunks
        if file_path in self.documents_info and any(chunk['source'] == file_path for chunk in self.document_chunks):
            print(f"File already processed: {file_path}")
            return False
            
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            # Process based on file type
            if file_ext == '.txt':
                self._process_text_file(file_path)
            elif file_ext == '.pdf' and HAVE_PYPDF2:
                self._process_pdf_file(file_path)
            elif file_ext in ['.docx', '.doc'] and HAVE_DOCX:
                self._process_docx_file(file_path)
            elif file_ext in ['.json']:
                self._process_json_file(file_path)
            else:
                print(f"Unsupported file type: {file_ext}")
                return False
                
            # Record file in documents_info
            self.documents_info[file_path] = {
                'added_date': datetime.now().isoformat(),
                'file_type': file_ext
            }
            
            return True
            
        except Exception as e:
            print(f"Error processing file {file_path}: {str(e)}")
            return False
    
    def _process_text_file(self, file_path: str) -> None:
        """Process a text file and create chunks."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
            self._create_chunks(text, file_path)
        except UnicodeDecodeError:
            # Try with different encoding if UTF-8 fails
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    text = f.read()
                self._create_chunks(text, file_path)
            except Exception as e:
                print(f"Error reading text file with alternative encoding: {str(e)}")
    
    def _process_pdf_file(self, file_path: str) -> None:
        """Process a PDF file and create chunks."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            self._create_chunks(text, file_path)
        except Exception as e:
            print(f"Error processing PDF file: {str(e)}")
    
    def _process_docx_file(self, file_path: str) -> None:
        """Process a DOCX file and create chunks."""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            self._create_chunks(text, file_path)
        except Exception as e:
            print(f"Error processing DOCX file: {str(e)}")
    
    def _process_json_file(self, file_path: str) -> None:
        """Process a JSON file and create chunks."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Convert JSON to text for chunks
            if isinstance(data, dict) or isinstance(data, list):
                text = json.dumps(data, indent=2)
                self._create_chunks(text, file_path)
        except Exception as e:
            print(f"Error processing JSON file: {str(e)}")
    
    def _create_chunks(self, text: str, source_file: str) -> None:
        """
        Split text into overlapping chunks and add to document_chunks.
        
        Args:
            text: The text to split into chunks
            source_file: Path to the source file for reference
        """
        # Clean text - remove excessive whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # If text is shorter than chunk size, add it as a single chunk
        if len(text) <= self.chunk_size:
            chunk_info = {
                'text': text,
                'source': source_file
            }
            self.document_chunks.append(chunk_info)
            return
            
        # Create overlapping chunks
        chunks = []
        start = 0
        
        while start < len(text):
            # Get chunk of specified size
            end = start + self.chunk_size
            
            # Try to find a good break point (e.g., end of sentence)
            if end < len(text):
                # Look for sentence endings within the last 20% of the chunk
                search_region_start = end - min(int(self.chunk_size * 0.2), 100)
                search_region = text[search_region_start:end]
                
                # Find last sentence ending in search region
                sentence_endings = list(re.finditer(r'[.!?]\s', search_region))
                if sentence_endings:
                    # Adjust end to the last sentence ending
                    last_match = sentence_endings[-1]
                    end = search_region_start + last_match.end()
            
            # Add chunk
            chunk = text[start:end].strip()
            if chunk:  # Only add non-empty chunks
                chunk_info = {
                    'text': chunk,
                    'source': source_file
                }
                chunks.append(chunk_info)
            
            # Move to next chunk with overlap
            start = end - self.chunk_overlap
        
        # Add all chunks to document_chunks
        self.document_chunks.extend(chunks)
    
    def _update_embeddings(self) -> None:
        """Update embeddings for all document chunks."""
        if not self.model or not self.document_chunks:
            return
            
        try:
            # Extract text from document chunks
            texts = [chunk['text'] for chunk in self.document_chunks]
            
            # Generate embeddings
            self.embeddings = self.model.encode(texts)
            
            print(f"Generated embeddings for {len(texts)} document chunks")
        except Exception as e:
            print(f"Error generating embeddings: {str(e)}")
    
    def query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve the most relevant document chunks for a query.
        
        Args:
            query_text: The query text
            top_k: Number of most relevant chunks to return
            
        Returns:
            List of relevant document chunks with metadata
        """
        if not self.model or len(self.embeddings) == 0 or len(self.document_chunks) == 0:
            print("Warning: Document store not ready (no model, embeddings, or documents)")
            return []
            
        try:
            # Generate embedding for query
            query_embedding = self.model.encode([query_text])[0]
            
            # Compute similarity to all document chunks
            similarities = []
            for doc_embedding in self.embeddings:
                # Compute cosine similarity
                similarity = np.dot(query_embedding, doc_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
                )
                similarities.append(similarity)
            
            # Get indices of top_k most similar chunks
            if not similarities:
                return []
                
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            # Return top_k chunks with similarity scores
            results = []
            for idx in top_indices:
                chunk = self.document_chunks[idx].copy()
                chunk['similarity'] = float(similarities[idx])
                results.append(chunk)
                
            return results
            
        except Exception as e:
            print(f"Error querying document store: {str(e)}")
            return []
    
    def _save_index(self) -> None:
        """Save document index and chunks to files."""
        try:
            # Save document metadata
            index_data = {
                'documents_info': self.documents_info,
                'chunk_size': self.chunk_size,
                'chunk_overlap': self.chunk_overlap,
                'document_count': len(self.documents_info),
                'chunk_count': len(self.document_chunks)
            }
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, ensure_ascii=False, indent=2)

            # Save chunks to a separate JSON file
            chunks_file = os.path.join(self.chunks_dir, "document_chunks.json")
            with open(chunks_file, 'w', encoding='utf-8') as f:
                json.dump(self.document_chunks, f, ensure_ascii=False, indent=2)

        except Exception as e:
            print(f"Error saving document index: {str(e)}")

    def _load_index(self) -> None:
        """Load document index and chunks from files if they exist."""
        if not os.path.exists(self.index_file):
            return

        try:
            # Load document metadata
            with open(self.index_file, 'r', encoding='utf-8') as f:
                index_data = json.load(f)

            self.documents_info = index_data.get('documents_info', {})
            self.chunk_size = index_data.get('chunk_size', self.chunk_size)
            self.chunk_overlap = index_data.get('chunk_overlap', self.chunk_overlap)

            # Load chunks from the separate JSON file
            chunks_file = os.path.join(self.chunks_dir, "document_chunks.json")
            if os.path.exists(chunks_file):
                with open(chunks_file, 'r', encoding='utf-8') as f:
                    self.document_chunks = json.load(f)

            # Update embeddings for all chunks
            if self.document_chunks:
                self._update_embeddings()

        except Exception as e:
            print(f"Error loading document index: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the document store.
        
        Returns:
            Dictionary with document store statistics
        """
        return {
            'document_count': len(self.documents_info),
            'chunk_count': len(self.document_chunks),
            'embedding_count': len(self.embeddings),
            'file_types': list(set(info['file_type'] for info in self.documents_info.values())),
            'chunk_size': self.chunk_size,
            'chunk_overlap': self.chunk_overlap
        }
    
    def clear(self) -> None:
        """Clear all documents and embeddings from the store."""
        self.document_chunks = []
        self.embeddings = []
        self.documents_info = {}
        
        # Remove index file if it exists
        if os.path.exists(self.index_file):
            try:
                os.remove(self.index_file)
            except Exception as e:
                print(f"Error removing index file: {str(e)}")
                
        print("Document store cleared")


if __name__ == "__main__":
    #yeah this works
    print('helo')