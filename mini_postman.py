import json
import requests
import sys

def send_request_from_file(file_path):
    print(f"📄 Loading request data from: {file_path}")

    # Load JSON file
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print("❌ Failed to load JSON file:", e)
        return

    method = data.get("method", "GET").upper()
    url = data.get("url")
    headers = data.get("headers", {})
    body = data.get("body", None)

    if not url:
        print("❌ Error: URL is required in the file")
        return

    print(f"\n➡️ Sending {method} request to {url}...\n")

    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=body
        )
    except Exception as e:
        print("❌ Request error:", e)
        return

    print("📌 Status:", response.status_code)
    print("\n📥 Response:")

    try:
        print(json.dumps(response.json(), indent=4, ensure_ascii=False))
    except:
        print(response.text)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage:")
        print("   python3 mini_postman.py request.json")
        sys.exit(1)

    send_request_from_file(sys.argv[1])
