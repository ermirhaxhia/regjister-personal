import sys

from core.database import get_client
from core.security import hash_pin


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].isdigit() or not (4 <= len(sys.argv[1]) <= 8):
        print("Perdorimi: python set_pin.py <PIN 4-8 shifra>")
        raise SystemExit(1)

    client = get_client()
    pin_hash = hash_pin(sys.argv[1])
    existing = client.table("app_auth").select("id").eq("id", 1).execute().data
    if existing:
        client.table("app_auth").update({"pin_hash": pin_hash}).eq("id", 1).execute()
        print("PIN u perditesua.")
    else:
        client.table("app_auth").insert({"id": 1, "pin_hash": pin_hash}).execute()
        print("PIN u vendos.")


if __name__ == "__main__":
    main()
