from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import subprocess
import sys
import tempfile
import os

HOST = "127.0.0.1"
PORT = 5055
BUNDLE_ID =  "com.anonymous.ReactNativeShop"
DEVICE_ID = "7617FC90-4BCE-4D7F-A5A8-037B6B138C8A"


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw or b"{}")
        except Exception:
            data = {}

        # Create properly formatted APNs payload for iOS Simulator
        apns = {
            "aps": {
                "alert": {
                    "title": data.get("title", "Demo"),
                    "body": data.get("body", ""),
                },
                "sound": "default",
                "badge": 1
            }
        }

        print(f"📱 Received notification request: {data}")
        print(f"📦 APNs payload: {json.dumps(apns, indent=2)}")

        # Create temporary file with .apns extension
        with tempfile.NamedTemporaryFile("w", suffix=".apns", delete=False) as f:
            json.dump(apns, f, indent=2)
            path = f.name

        try:
            print(f"🚀 Sending notification to {BUNDLE_ID} on device {DEVICE_ID}: {data.get('title', 'Demo')}")
            print(f"📁 Using temp file: {path}")
            
            # First, let's check if simulator is running and get device info
            print("🔍 Checking simulator status...")
            sim_status = subprocess.run(
                ["xcrun", "simctl", "list", "devices", DEVICE_ID], 
                capture_output=True, 
                text=True
            )
            print(f"Simulator status: {sim_status.stdout}")
            
            # Run xcrun simctl push command with specific device ID
            result = subprocess.run(
                ["xcrun", "simctl", "push", DEVICE_ID, BUNDLE_ID, path], 
                capture_output=True, 
                text=True,
                check=True
            )
            
            print(f"✅ Notification sent successfully")
            if result.stdout:
                print(f"stdout: {result.stdout}")
            if result.stderr:
                print(f"stderr: {result.stderr}")
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to send notification: {e}")
            print(f"stdout: {e.stdout}")
            print(f"stderr: {e.stderr}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            # Clean up temporary file
            try:
                os.remove(path)
                print(f"🧹 Cleaned up temp file: {path}")
            except OSError:
                pass

        self.send_response(204)
        self.end_headers()


def main():
    try:
        server = HTTPServer((HOST, PORT), Handler)
        print(f"🚀 Simulator relay listening on http://{HOST}:{PORT}")
        print(f"📱 Bundle ID: {BUNDLE_ID}")
        print(f"📱 Device ID: {DEVICE_ID}")
        print(f"🔍 Make sure iOS Simulator is running and app is installed")
        print("⏹️  Press Ctrl+C to stop")
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
        server.server_close()
    except Exception as e:
        print(f"❌ Error: {e}")
        server.server_close()
        sys.exit(1)


if __name__ == "__main__":
    main()