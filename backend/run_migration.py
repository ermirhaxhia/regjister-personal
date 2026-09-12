import sys
from pathlib import Path

import psycopg


def db_url() -> str:
    for line in Path(".env").read_text(encoding="utf-8").splitlines():
        if line.startswith("DATABASE_URL="):
            return line.split("=", 1)[1].strip()
    raise SystemExit("DATABASE_URL mungon te .env")


def main() -> None:
    if len(sys.argv) != 2:
        print("Perdorimi: python run_migration.py <path-i .sql>")
        raise SystemExit(1)
    sql = Path(sys.argv[1]).read_text(encoding="utf-8")
    with psycopg.connect(db_url(), sslmode="require", connect_timeout=20, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
    print(f"OK — u ekzekutua {sys.argv[1]}")


if __name__ == "__main__":
    main()
