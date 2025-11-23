import requests
import json

def ask_headers():
    print("\nPodaj nagłówki (ENTER aby zakończyć):")
    headers = {}
    while True:
        key = input("Nazwa nagłówka (lub ENTER): ")
        if not key:
            break
        value = input("Wartość: ")
        headers[key] = value
    return headers

def ask_json_body():
    print("\nPodaj body w formacie JSON (ENTER = brak):")
    body = input("> ")
    if not body.strip():
        return None
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        print("❌ Błąd — to nie jest poprawny JSON.")
        return ask_json_body()

def main():
    print("=== Mini-Postman w Pythonie ===")
    print("Wyślij zapytania HTTP (GET, POST, PUT, DELETE)\n")

    while True:
        method = input("\nMetoda HTTP: ").upper().strip()
        if method not in ["GET", "POST", "PUT", "DELETE"]:
            print("Dozwolone: GET, POST, PUT, DELETE")
            continue

        url = input("URL: ").strip()
        headers = ask_headers()
        json_body = ask_json_body() if method in ["POST", "PUT"] else None

        print("\n➡️ Wysyłam zapytanie...\n")

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=json_body
            )

            print("📌 Status:", response.status_code)
            print("\n📥 Odpowiedź:")
            try:
                print(json.dumps(response.json(), indent=4, ensure_ascii=False))
            except:
                print(response.text)

        except Exception as e:
            print("❌ Błąd:", e)

        if input("\nWysłać kolejne zapytanie? (t/n): ").lower() != "t":
            break

if __name__ == "__main__":
    main()
