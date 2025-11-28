import json
import requests
import sys
from pathlib import Path

COOKIES_FILE = Path("mini_postman_cookies.json")


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


def merge_cookies(existing, new_raw_cookie):
    """
    Extract cookie key=value from 'Set-Cookie' header
    Example: refresh_token=abcde123; HttpOnly; Path=/
    """
    cookie_value = new_raw_cookie.split(";")[0]  # refresh_token=xxxx
    key, value = cookie_value.split("=", 1)
    existing[key] = value
    return existing


def cookies_to_header(cookie_dict):
    """
    Convert JSON cookies to string for header
    Example: "a=1; b=2"
    """
    return "; ".join([f"{k}={v}" for k, v in cookie_dict.items()])


def main():
    if len(sys.argv) != 2:
        print("Usage: python mini_postman.py <request.json>")
        return

    request_file = sys.argv[1]

    try:
        with open(request_file, "r") as file:
            request_data = json.load(file)
    except Exception as e:
        print(f"❌ Error loading {request_file}: {e}")
        return

    method = request_data.get("method")
    url = request_data.get("url")
    headers = request_data.get("headers", {})
    body = request_data.get("body", {})

    # Load cookies
    cookies = load_cookies()
    if cookies:
        headers["Cookie"] = cookies_to_header(cookies)

    print(f"📄 Loading request from: {request_file}")
    print(f"➡️ Sending {method} to {url} ...")

    try:
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            json=body if method != "GET" else None
        )
    except Exception as e:
        print("❌ Request error:", e)
        return

    print("\n📌 Status:", response.status_code)
    print("📥 Response:")
    try:
        print(json.dumps(response.json(), indent=4))
    except:
        print(response.text)

    # Save cookies if received
    raw_cookies = response.headers.get("Set-Cookie")

    if raw_cookies:
        print("\n🍪 Cookies received:", raw_cookies)
        cookies = merge_cookies(cookies, raw_cookies)
        save_cookies(cookies)
        print("💾 Cookies saved to mini_postman_cookies.json")


if __name__ == "__main__":
    main()
