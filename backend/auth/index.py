"""
Аутентификация пользователей: регистрация, вход, выход, проверка сессии.
action передаётся в теле запроса: register | login | me | logout
v2
"""
import json
import os
import hashlib
import secrets
import random
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

AVATAR_COLORS = [
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-teal-500",
    "from-violet-500 to-purple-500",
    "from-blue-500 to-indigo-500",
    "from-pink-500 to-rose-500",
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(data)}


def err(msg: str, code: int = 400) -> dict:
    return {"statusCode": code, "headers": CORS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    headers = event.get("headers") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    action = body.get("action", "")
    schema = os.environ.get("MAIN_DB_SCHEMA", "public")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # ── register ────────────────────────────────────────────────────────
        if action == "register":
            username = body.get("username", "").strip().lower()
            email = body.get("email", "").strip().lower()
            password = body.get("password", "")
            display_name = body.get("display_name", "").strip()

            if not username or not email or not password or not display_name:
                return err("Все поля обязательны")
            if len(password) < 6:
                return err("Пароль должен быть минимум 6 символов")
            if len(username) < 3:
                return err("Имя пользователя минимум 3 символа")

            cur.execute(
                f"SELECT id FROM {schema}.users WHERE username = %s OR email = %s",
                (username, email),
            )
            if cur.fetchone():
                return err("Пользователь с таким именем или email уже существует", 409)

            avatar_color = random.choice(AVATAR_COLORS)
            cur.execute(
                f"INSERT INTO {schema}.users (username, email, password_hash, display_name, avatar_color) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (username, email, hash_password(password), display_name, avatar_color),
            )
            user_id = cur.fetchone()[0]

            token = secrets.token_hex(32)
            cur.execute(
                f"INSERT INTO {schema}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, token),
            )
            conn.commit()
            return ok({
                "token": token,
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "display_name": display_name,
                    "avatar_color": avatar_color,
                },
            })

        # ── login ───────────────────────────────────────────────────────────
        if action == "login":
            login = body.get("login", "").strip().lower()
            password = body.get("password", "")

            if not login or not password:
                return err("Введите логин и пароль")

            cur.execute(
                f"SELECT id, username, email, display_name, avatar_color FROM {schema}.users WHERE (username = %s OR email = %s) AND password_hash = %s",
                (login, login, hash_password(password)),
            )
            row = cur.fetchone()
            if not row:
                return err("Неверный логин или пароль", 401)

            user_id, username, email, display_name, avatar_color = row
            token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {schema}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            cur.execute(f"UPDATE {schema}.users SET last_seen = NOW() WHERE id = %s", (user_id,))
            conn.commit()
            return ok({
                "token": token,
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "display_name": display_name,
                    "avatar_color": avatar_color,
                },
            })

        # ── me ───────────────────────────────────────────────────────────────
        if action == "me":
            token = (
                headers.get("x-session-token")
                or headers.get("X-Session-Token")
                or body.get("token", "")
            )
            if not token:
                return err("Не авторизован", 401)

            cur.execute(
                f"""
                SELECT u.id, u.username, u.email, u.display_name, u.avatar_color
                FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,),
            )
            row = cur.fetchone()
            if not row:
                return err("Сессия истекла", 401)

            user_id, username, email, display_name, avatar_color = row
            return ok({
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "display_name": display_name,
                    "avatar_color": avatar_color,
                }
            })

        # ── logout ───────────────────────────────────────────────────────────
        if action == "logout":
            token = body.get("token", "")
            if token:
                cur.execute(f"UPDATE {schema}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return ok({"ok": True})

        return err("Неизвестный action")

    finally:
        conn.close()