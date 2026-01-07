import sqlite3
import os
import time
import datetime
from cryptography.fernet import Fernet

DB_NAME = os.environ.get("APP_DB_NAME", "app.db")
KEY_FILE = os.environ.get("APP_ENCRYPTION_KEY_FILE", "encryption.key")

def get_key():
    if not os.path.exists(KEY_FILE):
        key = Fernet.generate_key()
        with open(KEY_FILE, "wb") as key_file:
            key_file.write(key)
    else:
        with open(KEY_FILE, "rb") as key_file:
            key = key_file.read()
    return key

cipher_suite = Fernet(get_key())


class ApiKeyNotConfiguredError(Exception):
    pass


class ApiKeyRateLimitedError(Exception):
    pass


class ApiKeyQuotaExceededError(Exception):
    pass


def _connect():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def _now_ts() -> int:
    return int(time.time())


def _today_str() -> str:
    return datetime.date.today().isoformat()


def _minute_window_start(ts: int) -> int:
    return ts - (ts % 60)


def _coerce_blob(value):
    if value is None:
        return None
    if isinstance(value, (bytes, bytearray)):
        return bytes(value)
    if isinstance(value, memoryview):
        return value.tobytes()
    return value

def init_db():
    conn = _connect()
    c = conn.cursor()
    
    # User Skills Table
    c.execute('''CREATE TABLE IF NOT EXISTS user_skills
                 (user_id TEXT, category TEXT, score INTEGER, 
                 PRIMARY KEY (user_id, category))''')
    
    # API Keys Table (legacy single key)
    c.execute('''CREATE TABLE IF NOT EXISTS api_keys
                 (provider TEXT PRIMARY KEY, api_key BLOB)''')

    # API Keys Table (multi-key)
    c.execute('''CREATE TABLE IF NOT EXISTS api_keys_v2
                 (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    provider TEXT NOT NULL,
                    model TEXT NOT NULL,
                    name TEXT,
                    api_key BLOB NOT NULL,
                    is_default INTEGER NOT NULL DEFAULT 0,
                    quota_requests_per_day INTEGER,
                    quota_tokens_per_day INTEGER,
                    rate_limit_rpm INTEGER,
                    rate_limit_tpm INTEGER,
                    disabled INTEGER NOT NULL DEFAULT 0,
                    created_at INTEGER NOT NULL,
                    last_used_at INTEGER,
                    window_start INTEGER,
                    window_requests INTEGER NOT NULL DEFAULT 0,
                    window_tokens INTEGER NOT NULL DEFAULT 0,
                    day_start TEXT,
                    day_requests INTEGER NOT NULL DEFAULT 0,
                    day_tokens INTEGER NOT NULL DEFAULT 0
                 )''')

    c.execute('''CREATE INDEX IF NOT EXISTS idx_api_keys_v2_provider_model
                 ON api_keys_v2(provider, model)''')
    c.execute('''CREATE INDEX IF NOT EXISTS idx_api_keys_v2_default
                 ON api_keys_v2(provider, model, is_default)''')
    c.execute('''CREATE INDEX IF NOT EXISTS idx_api_keys_v2_disabled
                 ON api_keys_v2(provider, model, disabled)''')

    # One-time migration from legacy table if v2 is empty
    c.execute("SELECT COUNT(1) as cnt FROM api_keys_v2")
    v2_count = c.fetchone()["cnt"]
    if v2_count == 0:
        c.execute("SELECT provider, api_key FROM api_keys")
        legacy_rows = c.fetchall()
        if legacy_rows:
            now_ts = _now_ts()
            for row in legacy_rows:
                provider = row["provider"]
                api_key = row["api_key"]
                c.execute(
                    """INSERT INTO api_keys_v2
                    (provider, model, name, api_key, is_default, created_at, day_start, window_start)
                    VALUES (?, ?, ?, ?, 1, ?, ?, ?)""",
                    (provider, "*", "legacy", api_key, now_ts, _today_str(), _minute_window_start(now_ts)),
                )
    
    conn.commit()
    conn.close()

def save_user_skill(user_id, category, score):
    conn = _connect()
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO user_skills (user_id, category, score) VALUES (?, ?, ?)",
              (user_id, category, score))
    conn.commit()
    conn.close()

def get_user_skills(user_id):
    conn = _connect()
    c = conn.cursor()
    c.execute("SELECT category, score FROM user_skills WHERE user_id=?", (user_id,))
    rows = c.fetchall()
    conn.close()
    return {row[0]: row[1] for row in rows}

def save_api_key(provider, key):
    encrypted_key = cipher_suite.encrypt(key.encode())
    conn = _connect()
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO api_keys (provider, api_key) VALUES (?, ?)", (provider, encrypted_key))
    c.execute(
        "DELETE FROM api_keys_v2 WHERE provider=? AND model=? AND name=?",
        (provider, "*", "legacy-default"),
    )
    _save_api_key_v2(
        conn=conn,
        provider=provider,
        model="*",
        key_encrypted=encrypted_key,
        name="legacy-default",
        is_default=True,
        quota_requests_per_day=None,
        quota_tokens_per_day=None,
        rate_limit_rpm=None,
        rate_limit_tpm=None,
        disabled=False,
    )
    conn.commit()
    conn.close()

def get_api_key(provider):
    row = get_default_api_key(provider=provider, model="*")
    if row:
        return row["api_key"]

    conn = _connect()
    c = conn.cursor()
    c.execute("SELECT api_key FROM api_keys WHERE provider=?", (provider,))
    legacy = c.fetchone()
    conn.close()
    if legacy and legacy["api_key"] is not None:
        blob = _coerce_blob(legacy["api_key"])
        return cipher_suite.decrypt(blob).decode()
    return None


def validate_api_key_format(provider: str, key: str) -> bool:
    provider = (provider or "").lower().strip()
    if provider == "openai":
        return key.startswith("sk-") and len(key) >= 20
    return bool(key and key.strip())


def _save_api_key_v2(
    *,
    conn,
    provider: str,
    model: str,
    key_encrypted,
    name: str | None,
    is_default: bool,
    quota_requests_per_day: int | None,
    quota_tokens_per_day: int | None,
    rate_limit_rpm: int | None,
    rate_limit_tpm: int | None,
    disabled: bool,
):
    c = conn.cursor()
    now_ts = _now_ts()
    window_start = _minute_window_start(now_ts)
    day_start = _today_str()

    c.execute(
        """INSERT INTO api_keys_v2
        (provider, model, name, api_key, is_default, quota_requests_per_day, quota_tokens_per_day, rate_limit_rpm, rate_limit_tpm,
         disabled, created_at, last_used_at, window_start, day_start)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            provider,
            model,
            name,
            key_encrypted,
            1 if is_default else 0,
            quota_requests_per_day,
            quota_tokens_per_day,
            rate_limit_rpm,
            rate_limit_tpm,
            1 if disabled else 0,
            now_ts,
            None,
            window_start,
            day_start,
        ),
    )

    if is_default:
        new_id = c.lastrowid
        c.execute(
            "UPDATE api_keys_v2 SET is_default=0 WHERE provider=? AND model=? AND id!=?",
            (provider, model, new_id),
        )
    return c.lastrowid


def add_api_key(
    *,
    provider: str,
    model: str,
    key: str,
    name: str | None = None,
    is_default: bool = False,
    quota_requests_per_day: int | None = None,
    quota_tokens_per_day: int | None = None,
    rate_limit_rpm: int | None = None,
    rate_limit_tpm: int | None = None,
):
    if not validate_api_key_format(provider, key):
        raise ValueError("Invalid API key format")

    encrypted_key = cipher_suite.encrypt(key.encode())
    conn = _connect()
    try:
        key_id = _save_api_key_v2(
            conn=conn,
            provider=provider,
            model=model,
            key_encrypted=encrypted_key,
            name=name,
            is_default=is_default,
            quota_requests_per_day=quota_requests_per_day,
            quota_tokens_per_day=quota_tokens_per_day,
            rate_limit_rpm=rate_limit_rpm,
            rate_limit_tpm=rate_limit_tpm,
            disabled=False,
        )
        conn.commit()
        return key_id
    finally:
        conn.close()


def list_api_keys(provider: str | None = None, model: str | None = None):
    conn = _connect()
    try:
        c = conn.cursor()
        where = []
        params = []
        if provider:
            where.append("provider=?")
            params.append(provider)
        if model:
            where.append("model=?")
            params.append(model)
        where_sql = (" WHERE " + " AND ".join(where)) if where else ""
        c.execute(
            """SELECT id, provider, model, name, is_default, quota_requests_per_day, quota_tokens_per_day,
                      rate_limit_rpm, rate_limit_tpm, disabled, created_at, last_used_at,
                      window_start, window_requests, window_tokens, day_start, day_requests, day_tokens
               FROM api_keys_v2""" + where_sql + " ORDER BY provider, model, is_default DESC, id ASC",
            params,
        )
        rows = c.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def delete_api_key(key_id: int):
    conn = _connect()
    try:
        c = conn.cursor()
        c.execute("DELETE FROM api_keys_v2 WHERE id=?", (key_id,))
        conn.commit()
        return c.rowcount
    finally:
        conn.close()


def set_default_api_key(key_id: int):
    conn = _connect()
    try:
        c = conn.cursor()
        c.execute("SELECT provider, model FROM api_keys_v2 WHERE id=?", (key_id,))
        row = c.fetchone()
        if not row:
            return 0
        provider = row["provider"]
        model = row["model"]
        c.execute("UPDATE api_keys_v2 SET is_default=0 WHERE provider=? AND model=?", (provider, model))
        c.execute("UPDATE api_keys_v2 SET is_default=1 WHERE id=?", (key_id,))
        conn.commit()
        return 1
    finally:
        conn.close()


def disable_api_key(key_id: int):
    conn = _connect()
    try:
        c = conn.cursor()
        c.execute("UPDATE api_keys_v2 SET disabled=1 WHERE id=?", (key_id,))
        conn.commit()
        return c.rowcount
    finally:
        conn.close()


def get_default_api_key(*, provider: str, model: str):
    conn = _connect()
    try:
        c = conn.cursor()
        c.execute(
            """SELECT id, api_key, provider, model
               FROM api_keys_v2
               WHERE provider=? AND model=? AND disabled=0
               ORDER BY is_default DESC, (last_used_at IS NOT NULL) ASC, last_used_at ASC, id ASC
               LIMIT 1""",
            (provider, model),
        )
        row = c.fetchone()
        if not row:
            return None
        blob = _coerce_blob(row["api_key"])
        return {
            "id": row["id"],
            "provider": row["provider"],
            "model": row["model"],
            "api_key": cipher_suite.decrypt(blob).decode(),
        }
    finally:
        conn.close()


def acquire_api_key(
    *,
    provider: str,
    model: str | None,
    estimated_tokens: int = 0,
    exclude_key_ids: set[int] | None = None,
):
    exclude_key_ids = exclude_key_ids or set()
    candidate_models = [model, "*"] if model else ["*"]

    conn = _connect()
    try:
        c = conn.cursor()
        any_found = False
        any_rate_limited = False
        any_quota_exceeded = False
        now_ts = _now_ts()
        current_window = _minute_window_start(now_ts)
        today = _today_str()

        for m in candidate_models:
            c.execute(
                """SELECT id, api_key, provider, model, is_default, quota_requests_per_day, quota_tokens_per_day,
                          rate_limit_rpm, rate_limit_tpm, disabled, last_used_at,
                          window_start, window_requests, window_tokens,
                          day_start, day_requests, day_tokens
                   FROM api_keys_v2
                   WHERE provider=? AND model=? AND disabled=0
                   ORDER BY is_default DESC, window_requests ASC, (last_used_at IS NOT NULL) ASC, last_used_at ASC, id ASC""",
                (provider, m),
            )
            rows = c.fetchall()
            if rows:
                any_found = True

            for row in rows:
                key_id = row["id"]
                if key_id in exclude_key_ids:
                    continue

                window_start = row["window_start"]
                window_requests = row["window_requests"]
                window_tokens = row["window_tokens"]
                day_start = row["day_start"]
                day_requests = row["day_requests"]
                day_tokens = row["day_tokens"]

                if window_start != current_window:
                    window_start = current_window
                    window_requests = 0
                    window_tokens = 0

                if day_start != today:
                    day_start = today
                    day_requests = 0
                    day_tokens = 0

                rate_limit_rpm = row["rate_limit_rpm"]
                rate_limit_tpm = row["rate_limit_tpm"]
                quota_requests_per_day = row["quota_requests_per_day"]
                quota_tokens_per_day = row["quota_tokens_per_day"]

                if rate_limit_rpm is not None and window_requests >= int(rate_limit_rpm):
                    any_rate_limited = True
                    continue
                if rate_limit_tpm is not None and (window_tokens + int(estimated_tokens)) > int(rate_limit_tpm):
                    any_rate_limited = True
                    continue
                if quota_requests_per_day is not None and day_requests >= int(quota_requests_per_day):
                    any_quota_exceeded = True
                    continue
                if quota_tokens_per_day is not None and (day_tokens + int(estimated_tokens)) > int(quota_tokens_per_day):
                    any_quota_exceeded = True
                    continue

                blob = _coerce_blob(row["api_key"])
                api_key = cipher_suite.decrypt(blob).decode()

                c.execute(
                    """UPDATE api_keys_v2
                       SET last_used_at=?,
                           window_start=?,
                           window_requests=?,
                           window_tokens=?,
                           day_start=?,
                           day_requests=?,
                           day_tokens=?
                       WHERE id=?""",
                    (
                        now_ts,
                        window_start,
                        window_requests + 1,
                        window_tokens + int(estimated_tokens),
                        day_start,
                        day_requests + 1,
                        day_tokens + int(estimated_tokens),
                        key_id,
                    ),
                )
                conn.commit()
                return {"id": key_id, "provider": provider, "model": m, "api_key": api_key}

        if not any_found:
            raise ApiKeyNotConfiguredError("No API keys configured")
        if any_quota_exceeded:
            raise ApiKeyQuotaExceededError("API key quota exceeded")
        if any_rate_limited:
            raise ApiKeyRateLimitedError("API key rate limit exceeded")
        raise ApiKeyRateLimitedError("No usable API key available")
    finally:
        conn.close()
