# 🤖 AI Model API & Chat Client (Qwen3-0.6B)

A full-stack AI chat application featuring a high-performance **FastAPI** backend serving a local **Qwen3-0.6B** Large Language Model, paired with a modern, responsive **React + Vite** chat interface. Built to understand and generate responses in **English**, **Bengali (বাংলা)**, and **Banglish (Romanized Bengali)**.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Directory Structure](#-directory-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Backend Setup (`AI Server`)](#1-backend-setup-ai-server)
  - [2. Download the AI Model](#2-download-the-ai-model)
  - [3. Start the Backend Server](#3-start-the-backend-server)
  - [4. Frontend Setup (`client`)](#4-frontend-setup-client)
  - [5. Start the Frontend Client](#5-start-the-frontend-client)
- [API Endpoints](#-api-endpoints)
- [Environment Configuration](#-environment-configuration)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **Local LLM Inference**: Runs `Qwen/Qwen3-0.6B` locally using Hugging Face Transformers & PyTorch with automatic GPU/MPS/CPU device mapping and `bfloat16` precision.
- **Multilingual Support**: Tailored to respond fluently in English, Bengali (বাংলা), and Banglish.
- **FastAPI Backend**:
  - High-performance asynchronous API endpoints.
  - Built-in rate limiting (`3 requests / 5 seconds` via `slowapi`).
  - CORS enabled for seamless cross-origin communication.
  - Automatic `<think>` tag filtering for clean, direct responses.
- **Modern React Chat UI**:
  - Clean, ChatGPT-style chat interface built with React 19 and Vite.
  - Markdown rendering with GitHub Flavored Markdown (`react-markdown`, `remark-gfm`).
  - Customizable API endpoint settings modal.
  - Responsive design with sidebar navigation and prompt suggestions.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.10+, FastAPI, Uvicorn, PyTorch, Transformers, Hugging Face Hub, SlowAPI, Pydantic |
| **Model** | `Qwen/Qwen3-0.6B` (Causal Language Model) |
| **Frontend** | React 19, Vite 6+, Lucide React, React Markdown, CSS |
| **Package Managers** | `pip` (Python), `pnpm` or `npm` (Node.js) |

---

## 📁 Directory Structure

```text
├── AI Server/
│   ├── app/
│   │   └── Qwen3_0_6B_api.py         # FastAPI router, model loader & inference logic
│   ├── AI_Models/                    # Local directory where model weights are saved
│   │   └── Qwen/
│   │       └── Qwen3-0.6B/
│   ├── Qwen3_0_6B_Download.py        # Python script to download model weights from Hugging Face
│   ├── main.py                       # FastAPI application entry point
│   ├── requirements.txt              # Python dependencies
│   └── .gitignore
├── client/
│   ├── src/
│   │   ├── components/               # React UI components (Sidebar, MessageItem, SettingsModal)
│   │   ├── App.jsx                   # Main chat application logic
│   │   ├── App.css                   # Component styles
│   │   ├── index.css                 # Base stylesheet
│   │   └── main.jsx                  # React DOM entry point
│   ├── .env.example                  # Client environment template
│   ├── package.json                  # Node dependencies & scripts
│   ├── vite.config.js                # Vite configuration
│   └── .gitignore
├── .gitignore                        # Global repository gitignore
└── README.md                         # Project documentation
```

---

## ⚙️ Prerequisites

Before you start, ensure you have the following installed on your machine:

1. **Python 3.10+** (Python 3.11 or 3.12 recommended)
   ```bash
   python3 --version
   ```
2. **Node.js 18+** and **pnpm** (or `npm`)
   ```bash
   node --version
   pnpm --version   # If pnpm is not installed: npm install -g pnpm
   ```
3. **Git**
4. *(Optional but recommended)* A dedicated GPU (NVIDIA with CUDA) or Apple Silicon (M1/M2/M3/M4) for accelerated inference.

---

## 🚀 Getting Started

### 1. Backend Setup (`AI Server`)

Open your terminal and navigate to the `AI Server` directory:

```bash
cd "AI Server"
```

Create and activate a Python virtual environment:

- **macOS / Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

- **Windows:**
  ```powershell
  python -m venv .venv
  .venv\Scripts\activate
  ```

Install the required Python packages:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

> **Note for Apple Silicon (Mac M1/M2/M3/M4):** PyTorch natively supports Metal Performance Shaders (`mps`). The script will automatically load the model using `device_map="auto"`.
>
> **Note for NVIDIA GPUs (CUDA):** Ensure your PyTorch install matches your CUDA version. If needed, install via [PyTorch Get Started](https://pytorch.org/get-started/locally/).

---

### 2. Download the AI Model

Download the `Qwen/Qwen3-0.6B` weights locally:

```bash
python Qwen3_0_6B_Download.py
```

This will download the model files directly into `./AI_Models/Qwen/Qwen3-0.6B`. This only needs to be run once.

---

### 3. Start the Backend Server

Start the FastAPI development server with live reload:

```bash
python main.py
```

*(Alternatively, run using Uvicorn directly)*:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Once started, the backend will be accessible at:
- **API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/`

---

### 4. Frontend Setup (`client`)

Open a new terminal window and navigate to the `client` directory:

```bash
cd client
```

Copy the example environment configuration:

```bash
cp .env.example .env
```

Ensure your `.env` points to the running backend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Install frontend dependencies:

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

---

### 5. Start the Frontend Client

Start the Vite development server:

```bash
# Using pnpm
pnpm run dev

# Or using npm
npm run dev
```

Open your browser and navigate to the local URL displayed in your terminal (typically `http://localhost:5173`).

---

## 📡 API Endpoints

### 1. Health Check
- **Method:** `GET`
- **Path:** `/`
- **Response:**
  ```json
  {
    "Message": "Welcome to the Qwen3-0.6B Model API"
  }
  ```

### 2. Chat Completion
- **Method:** `POST`
- **Path:** `/chat`
- **Rate Limit:** `3 requests / 5 seconds`
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "prompt": "Hello! How can you help me today?",
    "enable_thinking": false,
    "max_tokens": 1024
  }
  ```
- **Response:**
  ```json
  {
    "content": "Hello! I am an AI assistant. I can help answer questions, write code, explain concepts, and chat in English, Bengali, or Banglish. How can I assist you?"
  }
  ```

---

## 🔒 Environment Configuration

### Client (`client/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

If you expose your backend via a public tunnel (like Cloudflare Tunnel or ngrok), update `VITE_API_BASE_URL` to your public URL (e.g., `https://your-tunnel-url.trycloudflare.com`).

---

## 🛠️ Troubleshooting

### 1. `FileNotFoundError: AI_Models/Qwen/Qwen3-0.6B`
- **Cause:** The model weights have not been downloaded yet.
- **Fix:** Run `python Qwen3_0_6B_Download.py` from inside the `AI Server` directory and wait for the download to finish before running `main.py`.

### 2. Out of Memory (OOM) Errors
- **Cause:** GPU VRAM or system RAM is exhausted.
- **Fix:** In `AI Server/app/Qwen3_0_6B_api.py`, change `device_map="auto"` to `device_map="cpu"` or reduce `max_tokens` in requests.

### 3. Rate Limit Exceeded (HTTP 429)
- **Cause:** Exceeded the `3 requests / 5 seconds` limit.
- **Fix:** Slow down request frequency or adjust `@limiter.limit("3/5seconds")` in `AI Server/app/Qwen3_0_6B_api.py`.

### 4. CORS Errors in Browser
- **Cause:** Frontend trying to reach a different host/port without CORS permissions.
- **Fix:** The backend is configured with `allow_origins=["*"]`. Ensure your backend server is running and the URL in `client/.env` matches the backend host.

---

## 📜 License

This project is licensed under the MIT License.
