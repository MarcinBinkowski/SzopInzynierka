from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import subprocess
import tempfile
import os

HOST = os.environ.get("RELAY_HOST", "127.0.0.1")
PORT = int(os.environ.get("RELAY_PORT", "5055"))
BUNDLE_ID = os.environ.get("RELAY_BUNDLE_ID", "com.anonymous.ReactNativeShop")


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw or b"{}")
        except Exception:
            data = {}

        apns = {
            "aps": {
                "alert": {
                    "title": data.get("title", "Demo"),
                    "body": data.get("body", ""),
                }
            }
        }

        with tempfile.NamedTemporaryFile("w", suffix=".apns", delete=False) as f:
            json.dump(apns, f)
            path = f.name

        try:
            subprocess.run(["xcrun", "simctl", "push", "booted", BUNDLE_ID, path], check=True)
        finally:
            try:
                os.remove(path)
            except OSError:
                pass

        self.send_response(204)
        self.end_headers()


def main():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Simulator relay listening on http://{HOST}:{PORT} for bundle {BUNDLE_ID}")
    server.serve_forever()


if __name__ == "__main__":
    main()

