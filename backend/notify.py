from flask import Flask, request, jsonify
import json
import subprocess
import tempfile
import os
import logging

app = Flask(__name__)

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "5055"))
BUNDLE_ID = os.getenv("BUNDLE_ID", "com.anonymous.ReactNativeShop")
DEVICE_ID = os.getenv("DEVICE_ID", "7617FC90-4BCE-4D7F-A5A8-037B6B138C8A")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/notify', methods=['POST'])
def send_notification():
    """Send push notification to iOS Simulator"""
    try:
        # Get notification data from requet
        data = request.get_json() or {}
        title = data.get("title", "Demo")
        body = data.get("body", "")
        
        logger.info(f"📱 Received notification request: {data}")
        
        apns = {
            "aps": {
                "alert": {
                    "title": title,
                    "body": body,
                },
                "sound": "default",
                "badge": 1
            }
        }
        
        logger.info(f"📦 APNs payload: {json.dumps(apns, indent=4)}")
        
        with tempfile.NamedTemporaryFile("w", suffix=".apns", delete=False) as f:
            json.dump(apns, f, indent=2)
            temp_path = f.name
        
        try:
            logger.info(f"🚀 Sending notification to {BUNDLE_ID} on device {DEVICE_ID}: {title}")
            logger.info(f"📁 Using temp file: {temp_path}")
            
            logger.info("🔍 Checking simulator status...")
            sim_status = subprocess.run(
                ["xcrun", "simctl", "list", "devices", DEVICE_ID], 
                capture_output=True, 
                text=True,
                check=True
            )
            logger.info(f"Simulator status: {sim_status.stdout}")
            
            result = subprocess.run(
                ["xcrun", "simctl", "push", DEVICE_ID, BUNDLE_ID, temp_path], 
                capture_output=True, 
                text=True,
                check=True
            )
            
            logger.info("✅ Notification sent successfully")
            if result.stdout:
                logger.info(f"stdout: {result.stdout}")
            if result.stderr:
                logger.info(f"stderr: {result.stderr}")
                
            return jsonify({"success": True, "message": "Notification sent successfully"}), 200
                
        except subprocess.CalledProcessError as e:
            error_msg = f"Failed to send notification: {e}"
            logger.error(f"❌ {error_msg}")
            logger.error(f"stdout: {e.stdout}")
            logger.error(f"stderr: {e.stderr}")
            return jsonify({"success": False, "error": error_msg}), 500
            
        except Exception as e:
            error_msg = f"Unexpected error: {e}"
            logger.error(f"❌ {error_msg}")
            return jsonify({"success": False, "error": error_msg}), 500
            
        finally:
            # Clean up temporary file
            try:
                os.remove(temp_path)
                logger.info(f"🧹 Cleaned up temp file: {temp_path}")
            except OSError as e:
                logger.warning(f"⚠️  Could not remove temp file {temp_path}: {e}")
    
    except Exception as e:
        error_msg = f"Failed to process request: {e}"
        logger.error(f"❌ {error_msg}")
        return jsonify({"success": False, "error": error_msg}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "iOS Simulator Relay"}), 200


@app.route('/', methods=['GET'])
def index():
    """Simple info page"""
    return jsonify({
        "service": "iOS Simulator Relay",
        "endpoints": {
            "POST /notify": "Send push notification",
            "GET /health": "Health check",
            "GET /": "This info"
        },
        "config": {
            "host": HOST,
            "port": PORT,
            "bundle_id": BUNDLE_ID,
            "device_id": DEVICE_ID
        }
    }), 200


if __name__ == "__main__":
    logger.info(f"🚀 Simulator relay starting on http://{HOST}:{PORT}")
    logger.info(f"📱 Bundle ID: {BUNDLE_ID}")
    logger.info(f"📱 Device ID: {DEVICE_ID}")
    
    app.run(host=HOST, port=PORT, debug=False)
   