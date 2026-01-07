# AI Algorithm Engineer Module - Technical Documentation

## 1. System Architecture
The module is built as a full-stack web application integrated into the existing "Hack the Algorithm" platform.

### Backend (Flask)
- **Framework**: Flask (Python)
- **Database**: SQLite (managed via `database.py`)
- **Security**: Fernet symmetric encryption for API Keys (`cryptography` library)
- **AI Integration**: OpenAI API (via `openai` library)
- **API Style**: RESTful JSON API

### Frontend (React)
- **Framework**: React + Vite
- **UI Library**: Shadcn UI (Tailwind CSS)
- **Code Editor**: Monaco Editor
- **State Management**: Local React State + Context
- **Routing**: React Router (Lazy Loaded)

## 2. API Endpoints

### User Skills
- `GET /api/skills`: Retrieve current user's skill profile.
- `POST /api/skills`: Update user's skill ratings (1-5 scale).

### API Keys
- `GET /api/keys?provider=openai`: Check if at least one key is configured (never returns the actual key).
- `GET /api/keys?provider=openai&detailed=1[&model=...]`: List configured keys (never returns the actual key).
- `POST /api/keys`: Add a key (supports legacy single-key and multi-key payloads).
- `PATCH /api/keys/<id>`: Mutate a key with an action (`set_default`, `disable`).
- `DELETE /api/keys/<id>`: Delete a key.
- `POST /api/keys/validate`: Validate key format (does not call provider).

### AI Tutor & Chat
- `POST /api/chat`: Main interface for LLM interaction.
  - **Params**: `message`, `mode` (tutor, socratic, challenge), `topic`, `model`.
  - **Logic**: Selects an API key based on provider/model, then falls back to `*` keys.
  - **Errors**: Returns structured error `code` for invalid key, rate limit, quota, outages.

### Code Execution
- `POST /run`: Execute Python code in a sandboxed environment.
- `POST /api/chat` (Evaluation): Evaluates user code against best practices and correctness.

## 3. Database Schema

### Table: `user_skills`
| Column | Type | Description |
|--------|------|-------------|
| user_id | TEXT | Primary Key (default: 'user') |
| category | TEXT | Algorithm category (e.g., Arrays) |
| score | INTEGER | 1-5 rating |

### Table: `api_keys`
| Column | Type | Description |
|--------|------|-------------|
| provider | TEXT | Primary Key (e.g., 'openai') |
| api_key | BLOB | Encrypted API Key (legacy single-key storage) |

### Table: `api_keys_v2`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary Key |
| provider | TEXT | Provider name (e.g., `openai`) |
| model | TEXT | Model name or `*` wildcard |
| name | TEXT | Display name (optional) |
| api_key | BLOB | Encrypted API Key |
| is_default | INTEGER | Default for provider+model |
| quota_requests_per_day | INTEGER | Optional daily request quota |
| quota_tokens_per_day | INTEGER | Optional daily token quota |
| rate_limit_rpm | INTEGER | Optional per-minute request limit |
| rate_limit_tpm | INTEGER | Optional per-minute token limit |
| disabled | INTEGER | Disabled flag (1=disabled) |
| created_at | INTEGER | Unix timestamp |
| last_used_at | INTEGER | Unix timestamp (nullable) |
| window_start | INTEGER | Minute window start timestamp |
| window_requests | INTEGER | Requests in current minute window |
| window_tokens | INTEGER | Tokens in current minute window |
| day_start | TEXT | Day start (YYYY-MM-DD) |
| day_requests | INTEGER | Requests in current day |
| day_tokens | INTEGER | Tokens in current day |

## 4. Security Implementation
- **Encryption**: API keys are encrypted using Fernet (symmetric encryption) before storage.
- **Key File**: The encryption key is generated and stored in `encryption.key` (configurable via `APP_ENCRYPTION_KEY_FILE`).
- **Database File**: SQLite database path is configurable via `APP_DB_NAME`.
- **CORS**: Enabled to allow frontend communication.
- **Environment**: Sensitive configuration loaded from `config.py` and environment variables.
