---
description: start the backend and frontend servers
---

To start the RecipeMaker application locally, you need to run both the FastAPI backend and the Vite/React frontend.

### 1. Start the Backend (FastAPI)
Open a terminal and run:
```bash
cd server
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```
The backend will be available at `http://localhost:8000`.

### 2. Start the Frontend (Vite)
Open a **separate** terminal and run:
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173` (or the URL shown in the terminal).

### 3. Verification
Once both are running, open your browser and navigate to the frontend URL. You should see your recipe collection and be able to create new ones!
