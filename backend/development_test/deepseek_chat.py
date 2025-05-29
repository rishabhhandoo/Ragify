import requests
import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Any, Union
from document_store import DocumentStore
HAVE_DOCUMENT_STORE = True



class DeepseekChat:
    """
    A class to interact with the Deepseek model through Ollama.
    Manages chat history and provides function-based chat interface.
    """
    
    def __init__(self, 
                model_name: str = "deepseek-r1", 
                history_file: str = "./backend/history/chat_history.json",
                max_context_messages: int = 20,
                document_store: Optional[Any] = None):
        """
        Initialize the DeepseekChat instance.
        
        Args:
            model_name: The name of the Ollama model to use
            history_file: Path to the file storing chat history
            max_context_messages: Maximum number of previous messages to include in context
            document_store: Optional DocumentStore instance for RAG
        """
        self.model_name = model_name
        self.history_file = history_file
        self.max_context_messages = max_context_messages
        self.api_url = "http://localhost:11434/api/chat"  # Default Ollama API endpoint
        self.history = []
        self.document_store = document_store
        
        # Load previous chat history if available
        self.load_history()
        
    def chat(self, message: str, use_rag: bool = True) -> str:
        """
        Send a message to the model and get a response.
        Automatically manages context and updates history.
        Additionally, creates document chunks if RAG is enabled.
        
        Args:
            message: The user message to send to the model
            use_rag: Whether to use RAG functionality if available
            
        Returns:
            The model's response as a string
        """
        # Add user message to history
        timestamp = datetime.now().isoformat()
        self.history.append({
            "role": "user",
            "content": message,
            "timestamp": timestamp
        })
        
        # Prepare context for the API request (most recent messages)
        context_messages = self._prepare_context()
        
        # Add relevant document context if RAG is enabled
        rag_context = ""
        if use_rag and self.document_store is not None:
            # Create document chunks
            chunks_dir = "./backend/documents/chunks"
            if not os.path.exists(chunks_dir):
                os.makedirs(chunks_dir)
            
            # Process documents and save chunks
            docs_dir = "./backend/documents"
            num_docs = self.document_store.add_document_dir(docs_dir, chunks_dir)
            print(f"Processed {num_docs} documents and saved chunks to {chunks_dir}")
            
            # Query document store
            retrieved_docs = self.document_store.query(message)
            if retrieved_docs:
                rag_context = self._format_retrieved_documents(retrieved_docs)
                
                # Add RAG context as a system message
                if rag_context:
                    context_messages.insert(0, {
                        "role": "system",
                        "content": f"Use the following information to help answer the user's question:\n\n{rag_context}"
                    })
        
        # Create request payload
        payload = {
            "model": self.model_name,
            "messages": context_messages,
            "stream": False  # For simplicity, we're not using streaming
        }
        
        try:
            # Send request to Ollama API
            response = requests.post(self.api_url, json=payload)
            response.raise_for_status()  # Raise exception for non-200 status codes
            
            # Extract assistant's response
            response_data = response.json()
            assistant_message = response_data.get("message", {}).get("content", "")
            
            # Add assistant response to history
            self.history.append({
                "role": "assistant",
                "content": assistant_message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Save updated history
            self.save_history()
            
            return assistant_message
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Error communicating with Ollama API: {str(e)}"
            print(error_msg)
            return error_msg
    
    def _prepare_context(self) -> List[Dict[str, str]]:
        """
        Prepare context messages for the API request.
        Formats the message history in the format expected by Ollama API.
        
        Returns:
            List of message dictionaries with role and content
        """
        # Get the most recent messages (limited by max_context_messages)
        recent_messages = self.history[-self.max_context_messages:] if self.history else []
        
        # Format messages for the API (removing timestamp)
        context = []
        for msg in recent_messages:
            context.append({
                "role": msg["role"],
                "content": msg["content"]
            })
            
        return context
    
    def save_history(self) -> None:
        """
        Save the current chat history to a file.
        """
        try:
            with open(self.history_file, 'w', encoding='utf-8') as f:
                json.dump(self.history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving chat history: {str(e)}")
    
    def load_history(self) -> None:
        """
        Load chat history from file if it exists.
        """
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
            except Exception as e:
                print(f"Error loading chat history: {str(e)}")
                # If loading fails, start with empty history
                self.history = []
        else:
            # If history file doesn't exist, start with empty history
            self.history = []
    
    def create_new_session(self) -> None:
        """
        Create a new chat session while preserving the old history file.
        Generates a timestamped backup of the current history.
        """
        self.history = []
        self.save_history()
    
    def _format_retrieved_documents(self, retrieved_docs: List[Dict[str, Any]]) -> str:
        """
        Format retrieved documents into a context string for the LLM.
        
        Args:
            retrieved_docs: List of retrieved document chunks with metadata
            
        Returns:
            Formatted context string
        """
        if not retrieved_docs:
            return ""
            
        context_parts = []
        
        for i, doc in enumerate(retrieved_docs):
            # Get document text and source information
            text = doc.get('text', '')
            source = doc.get('source', 'Unknown source')
            similarity = doc.get('similarity', 0.0)
            
            # Format each document chunk with source information
            doc_str = f"[Document {i+1}] (Source: {os.path.basename(source)}, Relevance: {similarity:.2f})\n{text}\n"
            context_parts.append(doc_str)
            
        return "\n".join(context_parts)
        
    def set_document_store(self, document_store: Any) -> None:
        """
        Set or update the document store used for RAG.
        
        Args:
            document_store: A DocumentStore instance
        """
        self.document_store = document_store
    
    def get_history(self) -> List[Dict[str, Any]]:
        """
        Get the current chat history.
        
        Returns:
            List of message dictionaries
        """
        return self.history
        if os.path.exists(self.history_file) and self.history:
            # Create backup with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"chat_history_{timestamp}.json"
            
            try:
                with open(backup_file, 'w', encoding='utf-8') as f:
                    json.dump(self.history, f, ensure_ascii=False, indent=2)
                print(f"Previous history saved to {backup_file}")
            except Exception as e:
                print(f"Error creating history backup: {str(e)}")
        
        # Clear current history
        self.clear_history()


# Example usage:
if __name__ == "__main__":
    # Initialize the chat
    chatbot = DeepseekChat()
    doc_store = DocumentStore()
    docs_dir = "./backend/documents"
    if not os.path.exists(docs_dir):
        os.makedirs(docs_dir)
        print(f"Created documents directory: {docs_dir}")
        print("Please add some document files to this directory and run again.")
        
    # Process documents
    num_docs = doc_store.add_document_dir(docs_dir)
    print(f"Processed {num_docs} documents from {docs_dir}")
    
    # Get document store stats
    stats = doc_store.get_stats()
    print(f"Document store contains {stats['chunk_count']} chunks from {stats['document_count']} documents")
    
    # Create chat instance with document store
    print("\nInitializing DeepseekChat with RAG...")
    chat = DeepseekChat(document_store=doc_store)
    stats = doc_store.get_stats()
    # # Example interaction
    # response = chatbot.chat("just say hi to me ")
    # print(f"Bot: {response}")
    
    response1 = chat.chat("explain as fast as u can what is in the document",use_rag=True)
    print(f"Bot: {response1}")