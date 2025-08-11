#!/usr/bin/env python3
"""
Debug script to check all notification prerequisites for iOS Simulator
"""
import subprocess
import json
import sys
import os

# Use your specific device ID
DEVICE_ID = "7617FC90-4BCE-4D7F-A5A8-037B6B138C8A"

def run_command(cmd, description):
    """Run a command and return the result"""
    print(f"\n🔍 {description}")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Success")
        if result.stdout:
            print(f"Output: {result.stdout.strip()}")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout.strip()}")
        if e.stderr:
            print(f"stderr: {e.stderr.strip()}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def check_simulator_status():
    """Check if iOS Simulator is running and get device info"""
    print("\n📱 === SIMULATOR STATUS ===")
    
    # Check if specific simulator is running
    result = run_command(["xcrun", "simctl", "list", "devices", DEVICE_ID], f"Checking for simulator {DEVICE_ID}")
    if not result:
        print(f"❌ Simulator {DEVICE_ID} not found!")
        print("💡 Start iOS Simulator first")
        return False
    
    # Get device info
    result = run_command(["xcrun", "simctl", "list", "devices"], "Listing all devices")
    return True

def check_app_installation():
    """Check if the app is installed on the simulator"""
    print("\n📱 === APP INSTALLATION ===")
    
    bundle_id = "com.anonymous.ReactNativeShop"
    
    # Check if app is installed
    result = run_command(
        ["xcrun", "simctl", "get_app_container", "Booted", bundle_id], 
        f"Checking if {bundle_id} is installed"
    )
    
    if result:
        print(f"✅ App is installed at: {result.stdout.strip()}")
        return True
    else:
        print(f"❌ App {bundle_id} is not installed!")
        print("💡 Make sure to build and run your app in the simulator first")
        return False

def test_push_notification():
    """Test sending a push notification"""
    print("\n📱 === PUSH NOTIFICATION TEST ===")
    
    bundle_id = "com.anonymous.ReactNativeShop"
    
    # Create a test APNs payload
    apns_payload = {
        "aps": {
            "alert": {
                "title": "Test Notification",
                "body": "This is a test from debug script"
            },
            "sound": "default",
            "badge": 1
        }
    }
    
    # Create temporary file
    import tempfile
    with tempfile.NamedTemporaryFile("w", suffix=".apns", delete=False) as f:
        json.dump(apns_payload, f, indent=2)
        temp_path = f.name
    
    try:
        print(f"📁 Created temp file: {temp_path}")
        print(f"📦 APNs payload: {json.dumps(apns_payload, indent=2)}")
        
        # Send notification to specific device
        result = run_command(
            ["xcrun", "simctl", "push", DEVICE_ID, bundle_id, temp_path],
            "Sending test push notification"
        )
        
        if result:
            print("✅ Push notification sent successfully!")
            print("💡 Check your iOS Simulator for the notification")
        else:
            print("❌ Failed to send push notification")
            
    finally:
        # Clean up
        try:
            os.remove(temp_path)
            print(f"🧹 Cleaned up temp file: {temp_path}")
        except OSError:
            pass

def check_relay_server():
    """Check if relay server is running"""
    print("\n🌐 === RELAY SERVER STATUS ===")
    
    import socket
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('127.0.0.1', 5055))
        sock.close()
        
        if result == 0:
            print("✅ Relay server port 5055 is open")
            return True
        else:
            print("❌ Relay server is not running on port 5055")
            print("💡 Start the relay server: python3 relay.py")
            return False
    except Exception as e:
        print(f"❌ Error checking relay server: {e}")
        return False

def main():
    print("🚀 iOS Simulator Notification Debug Script")
    print("=" * 50)
    print(f"📱 Using Device ID: {DEVICE_ID}")
    
    # Check simulator status
    if not check_simulator_status():
        print(f"\n❌ Cannot proceed without simulator {DEVICE_ID}")
        return
    
    # Check app installation
    if not check_app_installation():
        print("\n❌ Cannot proceed without app installation")
        return
    
    # Test push notification
    test_push_notification()
    
    # Check relay server
    check_relay_server()
    
    print("\n" + "=" * 50)
    print("🎯 Debug complete!")
    print(f"\n💡 Next steps:")
    print(f"1. Make sure iOS Simulator {DEVICE_ID} is running")
    print("2. Build and run your app in the simulator")
    print("3. Start the relay server: python3 relay.py")
    print("4. Test with: python3 test_relay.py")

if __name__ == "__main__":
    main() 