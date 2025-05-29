# RAG-enabled DeepseekChat Example Usage
import os

from development_test.deepseek_chat import DeepseekChat
from development_test.document_store import DocumentStore

def rag_demo(docs_dir: str = "./documents"):
    """
    Demonstration of DeepseekChat with RAG functionality.
    
    Args:
        docs_dir: Directory containing documents for RAG
    """
    print("\n=== DeepseekChat with RAG Demo ===\n")
    
    # Create document store
    print("Initializing Document Store...")
    try:
        doc_store = DocumentStore()
        
        # Check if documents directory exists
        if not os.path.exists(docs_dir):
            os.makedirs(docs_dir)
            print(f"Created documents directory: {docs_dir}")
            print("Please add some document files to this directory and run again.")
            return
            
        # Process documents
        num_docs = doc_store.add_document_dir(docs_dir)
        print(f"Processed {num_docs} documents from {docs_dir}")
        
        # Get document store stats
        stats = doc_store.get_stats()
        print(f"Document store contains {stats['chunk_count']} chunks from {stats['document_count']} documents")
        
        # Create chat instance with document store
        print("\nInitializing DeepseekChat with RAG...")
        chat = DeepseekChat(document_store=doc_store)
        
        # Example interaction
        # print("\nSending a query that can use document knowledge...")
        # question = "What information do you have in your documents?"
        # print(f"Question: {question}")
        # response = chat.chat(question, use_rag=True)
        # print(f"Response: {response}")
        
        # Follow-up question
        print("\nSending a follow-up question...")
        follow_up = "what all awards has he achieved?"
        print(f"Question: {follow_up}")
        response = chat.chat(follow_up, use_rag=True)
        print(f"Response: {response}")
        
        print("\nRAG demo completed. The chat history has been saved.")
        
    except Exception as e:
        print(f"Error in RAG demo: {str(e)}")
        print("Note: You may need to install required dependencies:")
        print("pip install sentence-transformers")
        print("For PDF support: pip install PyPDF2")
        print("For DOCX support: pip install python-docx")

if __name__ == "__main__":
    rag_demo()