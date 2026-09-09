"""Tests for Saturn/PresetBridge auth endpoints + core endpoint spot-checks."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fall back to reading frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@saturn.dev"
ADMIN_PASSWORD = "Saturn2026!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


# ---------------- Auth: register ----------------
class TestRegister:
    def test_register_new_user(self, session):
        email = f"e2e-{uuid.uuid4().hex[:8]}@studio.com"
        r = session.post(f"{API}/auth/register", json={"email": email, "password": "password123", "name": "E2E"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data and data["token_type"] == "bearer"
        assert data["user"]["email"] == email
        assert data["user"]["name"] == "E2E"
        assert "id" in data["user"]

    def test_register_duplicate(self, session):
        email = f"dup-{uuid.uuid4().hex[:8]}@studio.com"
        r1 = session.post(f"{API}/auth/register", json={"email": email, "password": "password123"})
        assert r1.status_code == 200
        r2 = session.post(f"{API}/auth/register", json={"email": email, "password": "password123"})
        assert r2.status_code == 409

    def test_register_weak_password(self, session):
        email = f"weak-{uuid.uuid4().hex[:8]}@studio.com"
        r = session.post(f"{API}/auth/register", json={"email": email, "password": "short"})
        assert r.status_code == 422


# ---------------- Auth: login ----------------
class TestLogin:
    def test_login_admin_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["user"]["email"] == ADMIN_EMAIL
        assert r.json()["user"]["role"] == "admin"

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WrongPass!"})
        assert r.status_code == 401

    def test_brute_force_lockout(self, session):
        # Use throwaway email so admin isn't locked
        email = f"lock-{uuid.uuid4().hex[:8]}@studio.com"
        # register so email exists; still wrong password will fail
        session.post(f"{API}/auth/register", json={"email": email, "password": "password123"})
        got_429 = False
        for i in range(7):
            r = session.post(f"{API}/auth/login", json={"email": email, "password": "wrong-pass"})
            if r.status_code == 429:
                got_429 = True
                break
        assert got_429, "Expected 429 after 5 failed attempts"


# ---------------- Auth: me / logout ----------------
class TestMeLogout:
    def test_me_with_token(self, session, admin_token):
        r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_malformed_token(self, session):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer notatoken"})
        assert r.status_code == 401

    def test_logout_with_token(self, session, admin_token):
        r = requests.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_logout_without_token(self, session):
        r = requests.post(f"{API}/auth/logout")
        assert r.status_code == 401


# ---------------- Auth: forgot/reset password ----------------
class TestForgotReset:
    def test_forgot_nonexistent_returns_ok(self, session):
        r = session.post(f"{API}/auth/forgot-password", json={"email": f"nope-{uuid.uuid4().hex[:6]}@x.com"})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_forgot_then_reset_flow(self, session):
        # Create a fresh user
        email = f"reset-{uuid.uuid4().hex[:8]}@studio.com"
        session.post(f"{API}/auth/register", json={"email": email, "password": "password123"})
        r = session.post(f"{API}/auth/forgot-password", json={"email": email})
        assert r.status_code == 200
        # Retrieve token from backend log
        token = None
        try:
            for logf in ("/var/log/supervisor/backend.err.log", "/var/log/supervisor/backend.out.log"):
                if not os.path.exists(logf):
                    continue
                with open(logf) as f:
                    content = f.read()
                needle = f"password reset link for {email}: /reset-password?token="
                idx = content.rfind(needle)
                if idx >= 0:
                    token = content[idx + len(needle):].split()[0].strip()
                    break
        except Exception:
            pass
        if not token:
            pytest.skip("Could not read reset token from backend log")
        r2 = session.post(f"{API}/auth/reset-password", json={"token": token, "password": "newpassword123"})
        assert r2.status_code == 200
        # Login with new password
        r3 = session.post(f"{API}/auth/login", json={"email": email, "password": "newpassword123"})
        assert r3.status_code == 200
        # Reuse token -> 400
        r4 = session.post(f"{API}/auth/reset-password", json={"token": token, "password": "another123"})
        assert r4.status_code == 400


# ---------------- Existing endpoints spot-check ----------------
class TestCoreEndpoints:
    def test_rules(self, session):
        r = session.get(f"{API}/rules")
        assert r.status_code == 200

    def test_samples(self, session):
        r = session.get(f"{API}/samples")
        assert r.status_code == 200

    def test_history(self, session):
        r = session.get(f"{API}/history", headers={"X-Session-Id": "test-sess-1"})
        assert r.status_code == 200

    def test_presets(self, session):
        r = session.get(f"{API}/presets", headers={"X-Session-Id": "test-sess-1"})
        assert r.status_code == 200

    def test_settings(self, session):
        r = session.get(f"{API}/settings", headers={"X-Session-Id": "test-sess-1"})
        assert r.status_code == 200
