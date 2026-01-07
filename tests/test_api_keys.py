import importlib
import os
from pathlib import Path


def _load_database(tmp_path: Path):
    os.environ["APP_DB_NAME"] = str(tmp_path / "test.db")
    os.environ["APP_ENCRYPTION_KEY_FILE"] = str(tmp_path / "test_encryption.key")
    import database

    importlib.reload(database)
    database.init_db()
    return database


def test_key_format_validation(tmp_path: Path):
    db = _load_database(tmp_path)
    assert db.validate_api_key_format("openai", "sk-12345678901234567890")
    assert not db.validate_api_key_format("openai", "not-a-key")


def test_backward_compatible_single_key_migrates_to_v2(tmp_path: Path):
    db = _load_database(tmp_path)
    db.save_api_key("openai", "sk-12345678901234567890")
    keys = db.list_api_keys(provider="openai")
    assert len(keys) == 1
    assert keys[0]["model"] == "*"
    assert keys[0]["is_default"] == 1
    assert db.get_api_key("openai").startswith("sk-")


def test_fallback_when_default_rate_limited(tmp_path: Path):
    db = _load_database(tmp_path)
    k1 = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-11111111111111111111", name="k1", is_default=True, rate_limit_rpm=1)
    k2 = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-22222222222222222222", name="k2", is_default=False, rate_limit_rpm=999)

    first = db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
    assert first["id"] == k1

    second = db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
    assert second["id"] == k2


def test_load_balances_between_keys(tmp_path: Path):
    db = _load_database(tmp_path)
    k1 = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-aaaaaaaaaaaaaaaaaaaa", name="k1")
    k2 = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-bbbbbbbbbbbbbbbbbbbb", name="k2")

    first = db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
    second = db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)

    assert {first["id"], second["id"]} == {k1, k2}


def test_add_api_key_rejects_invalid_format(tmp_path: Path):
    db = _load_database(tmp_path)
    try:
        db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="not-a-key")
        assert False
    except ValueError:
        assert True


def test_fallback_to_star_model_when_no_model_specific_keys(tmp_path: Path):
    db = _load_database(tmp_path)
    k_star = db.add_api_key(provider="openai", model="*", key="sk-cccccccccccccccccccc", name="star", is_default=True)
    selected = db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
    assert selected["id"] == k_star
    assert selected["model"] == "*"


def test_quota_exceeded_raises(tmp_path: Path):
    db = _load_database(tmp_path)
    db.add_api_key(
        provider="openai",
        model="gpt-3.5-turbo",
        key="sk-dddddddddddddddddddd",
        quota_requests_per_day=1,
        is_default=True,
    )

    db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)

    try:
        db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
        assert False
    except db.ApiKeyQuotaExceededError:
        assert True


def test_disable_api_key_prevents_acquire(tmp_path: Path):
    db = _load_database(tmp_path)
    key_id = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-eeeeeeeeeeeeeeeeeeee", is_default=True)
    updated = db.disable_api_key(key_id)
    assert updated == 1

    try:
        db.acquire_api_key(provider="openai", model="gpt-3.5-turbo", estimated_tokens=1)
        assert False
    except db.ApiKeyNotConfiguredError:
        assert True


def test_delete_api_key_removes_key(tmp_path: Path):
    db = _load_database(tmp_path)
    key_id = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-ffffffffffffffffffff", is_default=True)
    deleted = db.delete_api_key(key_id)
    assert deleted == 1

    keys = db.list_api_keys(provider="openai", model="gpt-3.5-turbo")
    assert keys == []


def test_set_default_api_key_updates_default_flag(tmp_path: Path):
    db = _load_database(tmp_path)
    db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-11111111111111111111", name="k1", is_default=True)
    k2 = db.add_api_key(provider="openai", model="gpt-3.5-turbo", key="sk-22222222222222222222", name="k2", is_default=False)

    ok = db.set_default_api_key(k2)
    assert ok == 1

    rows = db.list_api_keys(provider="openai", model="gpt-3.5-turbo")
    defaults = [r for r in rows if r["is_default"] == 1]
    assert len(defaults) == 1
    assert defaults[0]["id"] == k2
