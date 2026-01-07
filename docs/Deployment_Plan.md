# Deployment Plan

## 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional but recommended)

## 2. Environment Setup

### Backend
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize Database:
   - The application automatically creates `database.db` and `secret.key` on first run.
   - **Important**: Back up `secret.key` securely. If lost, all stored API keys become unreadable.

### Frontend
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## 3. Production Deployment

### Option A: Manual Deployment
1. **Backend**: Run using a production WSGI server (e.g., Gunicorn or Waitress).
   ```bash
   pip install waitress
   waitress-serve --port=5000 app:app
   ```
2. **Frontend**: Serve the `frontend/dist` folder using Nginx or a static file server.
   - Configure Nginx to proxy `/api` requests to `localhost:5000`.

### Option B: Docker (Recommended)
Create a `Dockerfile`:
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```
(Note: For full production, use a multi-stage build to compile React frontend and serve via Nginx).

## 4. Security Checklist
- [ ] Ensure `secret.key` is stored in a secure location or injected via environment variables (requires code modification).
- [ ] Set `FLASK_ENV=production`.
- [ ] Enable HTTPS (SSL/TLS) on the reverse proxy (Nginx).
- [ ] Rate limit API endpoints (e.g., using Flask-Limiter).
- [ ] Sanitize user inputs in the sandbox (current implementation uses basic subprocess, consider using a proper containerized sandbox for untrusted code).

## 5. Monitoring & Maintenance
- Monitor `database.db` size.
- Check application logs for errors.
- Regularly update `requirements.txt` dependencies.
