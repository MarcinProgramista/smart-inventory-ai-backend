import json
import requests
import sys
from pathlib import Path

COOKIES_FILE = Path("mini_postman_cookies.json")

# ------------------------------------
#  COOKIES — LOAD / SAVE
# ------------------------------------

def load_cookies():
    if COOKIES_FILE.exists():
        try:
            with open(COOKIES_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_cookies(cookie_dict):
    with open(COOKIES_FILE, "w") as f:
        json.dump(cookie_dict, f, indent=4)


def merge_cookies(existing, raw_cookie):
    """
    Parse full Set-Cookie header:
      refresh_token=XYZ; Path=/; HttpOnly
    """

    cookie_value = raw_cookie.split(";")[0]  # refresh_token=xxxxx
    key, value = cookie_value.split("=", 1)

    # ❗ Ignore empty cookies (logout sending refresh_token="")
    if value == "":
        return existing

    existing[key] = value
    return existing


def cookies_to_header(cookie_dict):
    """Turn dict into header string: a=1; b=2"""
    return "; ".join(f"{k}={v}" for k, v in cookie_dict.items())


# ------------------------------------
#  MAIN REQUEST LOGIC
# ------------------------------------

def send_request_from_file(request_file):
    print(f"📄 Loading request from: {request_file}")

    try:
        with open(request_file, "r") as f:
            req = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return

    method = req.get("method", "GET").upper()
    url = req.get("url")
    headers = req.get("headers", {})
    body = req.get("body", None)

    if not url:
        print("❌ URL missing in request file")
        return

    # Load cookies
    cookies = load_cookies()
    if cookies:
        headers["Cookie"] = cookies_to_header(cookies)

    print(f"➡️ Sending {method} {url}")

    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=body if method in ["POST", "PATCH", "PUT"] else None
        )
    except Exception as e:
        print(f"❌ Network error: {e}")
        return

    print("\n📌 Status:", response.status_code)
    print("📥 Response:")

    # Print JSON or text
    try:
        print(json.dumps(response.json(), indent=4))
    except:
        print(response.text)

    # Save cookies
    raw_cookie = response.headers.get("Set-Cookie")
    if raw_cookie:
        print("\n🍪 NEW COOKIE:", raw_cookie)
        cookies = merge_cookies(cookies, raw_cookie)
        save_cookies(cookies)
        print("💾 Cookies saved → mini_postman_cookies.json")


# ----------------------------------
#  ENTRY POINT
# ----------------------------------

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python mini_postman.py <request.json>")
        sys.exit(1)

    send_request_from_file(sys.argv[1])
