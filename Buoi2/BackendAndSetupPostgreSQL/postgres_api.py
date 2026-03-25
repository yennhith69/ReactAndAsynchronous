"""
API nho de cung cap danh sach san pham tu PostgreSQL cho React app.
Chay: python postgres_api.py
"""

import os

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor


def load_env_file(env_path):
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key and key not in os.environ:
                os.environ[key] = value


base_dir = os.path.dirname(__file__)
env_path = os.path.join(base_dir, ".env")
env_example_path = os.path.join(base_dir, ".env.example")

if os.path.exists(env_path):
    load_env_file(env_path)
else:
    load_env_file(env_example_path)

db_password = os.getenv("POSTGRES_PASSWORD", "")


DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", "5432")),
    "database": os.getenv("POSTGRES_DB", "learndb"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": db_password
}


def get_connection():
    if not DB_CONFIG["password"]:
        raise RuntimeError(
            "POSTGRES_PASSWORD chua duoc set. Hay tao learndb/.env hoac set env trong PowerShell."
        )

    return psycopg2.connect(**DB_CONFIG)


app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health_check():
    return jsonify({"ok": True, "service": "postgres-api"})


@app.get("/api/products")
def get_products():
    limit = request.args.get("limit", default=60, type=int)
    limit = max(1, min(limit, 500))

    query = """
        SELECT
            p.productkey,
            p.product_name,
            INITCAP(REPLACE(p.product_name, '_', ' ')) AS product_display_name,
            p.brand,
            p.category,
            p.unit_price_usd,
            p.color,
            CASE WHEN (MOD(p.productkey, 3) = 0) THEN TRUE ELSE FALSE END AS sale
        FROM products p
        ORDER BY p.productkey
        LIMIT %s;
    """

    try:
        with get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, (limit,))
                rows = cur.fetchall()

        items = []
        for row in rows:
            item = dict(row)
            item["image"] = f"https://picsum.photos/seed/postgres-{item['productkey']}/420/300"
            items.append(item)

        return jsonify({"items": items, "count": len(items)})
    except Exception as error:
        return jsonify({
            "error": str(error),
            "hint": "Kiem tra POSTGRES_PASSWORD, ten DB learndb, va bang products da import."
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
