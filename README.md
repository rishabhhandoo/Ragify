# Ragify

Ragify is a peoject experimenting with Retrieval-Augmented Generation (RAG) workflows — with the primary focus on using a local LLM deployed inside Docker. The key idea: keep models local (for privacy, offline use, and low-latency), use a lightweight retriever to fetch relevant context from your document collection, and combine that context with the local LLM to generate high-quality answers.

Why local LLM + RAG?
- Privacy: keep data and models on your machine or private infra.
- Latency and reliability: avoid external API calls and rate limits.
- Flexibility: swap models, run offline, and control resources via Docker.

## Features
- Utilities to ingest and process documents
- Simple retriever interface and pluggable vector-store integrations
- Example scripts showing how to combine retrieval results with a local LLM HTTP API
- Lightweight codebase for learning and prototyping RAG patterns

## Requirements
- Python 3.8+
- Docker (to run a local LLM container)
- Optional: GPU drivers / CUDA if you intend to run GPU-backed containers

## Installation
Clone the repository and install Python dependencies:

git clone https://github.com/rishabhhandoo/Ragify.git
cd Ragify
pip install -r requirements.txt

(If this project is not packaged, run example scripts directly from the repo root.)

## Quickstart — run a local LLM in Docker
Below is a generic Docker template to run a local LLM server. Replace IMAGE_NAME and model mount/path with the concrete image and model you choose (localAI, text-generation-webui, llama.cpp wrappers, etc.). API paths vary between servers — adjust curl/HTTP examples accordingly.

Example Docker run (generic template):
docker run --rm -p 8080:8080 \
  -v /path/to/local/models:/models \
  -e MODEL_PATH=/models/your-model \
  IMAGE_NAME:latest

Notes:
- IMAGE_NAME: replace with the Docker image you choose (e.g., a local LLM server).
- MODEL_PATH / mount: point to where your model files live on the host.
- Port 8080 is used in examples below — change if your server uses a different port.

## Example: querying the local LLM + RAG (curl)
1) Use the retriever to get relevant passages (see examples in the repo).
2) Send a prompt + retrieved context to the local LLM HTTP endpoint.

curl example (adjust path and payload to your server's API):
curl -s -X POST "http://localhost:8080/v1/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my-local-model",
    "input": "Use the following context to answer the question:\n\nContext:\n<INSERT_RETRIEVED_TEXT_HERE>\n\nQuestion: What is the main idea?",
    "max_tokens": 512
  }'

(If your server uses /v1/generate or another path, switch accordingly.)

## Example: Python sketch (using requests)
This shows how to combine a Retriever (from this repo) and a local LLM HTTP API:

from ragify import DocumentLoader, Retriever
import requests, json

# 1) Load docs and create retriever
docs = DocumentLoader("data/").load()
retriever = Retriever.build_from_documents(docs)

# 2) Search for relevant context
query = "Explain the main idea of the project."
hits = retriever.search(query, top_k=4)  # returns list of passages
context = "\n\n".join(hit["text"] for hit in hits)

# 3) Send prompt + context to local LLM
llm_url = "http://localhost:8080/v1/complete"  # adjust for your server
prompt = f"Use the context to answer the question.\n\nContext:\n{context}\n\nQuestion: {query}\nAnswer:"

payload = {"model": "my-local-model", "input": prompt, "max_tokens": 512}
resp = requests.post(llm_url, json=payload)
print(resp.json())

Adjust the payload keys and endpoint to match the local LLM server you run.

## Configuration tips
- Keep models on a large, fast disk if possible (SSD).
- Tune retriever top_k to balance context size vs. answer relevance.
- If your local LLM server supports streaming, you can integrate streaming responses into UI/CLI flows.

## Examples and notebooks
See the `examples/` directory for runnable scripts demonstrating:
- Ingesting documents
- Building and saving a vector store
- Combining retrieval results with a local LLM request

## Contributing
Contributions are welcome:
- Open an issue to discuss feature requests or bugs
- Send a pull request for fixes, docs, or new examples
- If you add support for a specific local LLM server image, include setup and Docker examples in docs

## License
This project is provided under the MIT License. See the LICENSE file for details.

## Author
Created and maintained by rishabhhandoo.
