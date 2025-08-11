#!/usr/bin/env python3
"""
Simple test script to verify the simulator relay works.
Run this after starting the relay: python3 test_relay.py
"""

import urllib.request
import urllib.parse
import json

RELAY_URL = "http://127.0.0.1:5055"

def test_relay():
    """Test the relay with a sample notification."""
    payload = {
        "title": "🔥 Test Notification",
        "body": "This is a test notification from the relay!",
        "data": { "type": "test", "source": "test_relay.py" }
    }
    
    try:
        print(f"Sending test notification to {RELAY_URL}...")
        
        # Convert payload to JSON bytes
        data = json.dumps(payload).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(
            RELAY_URL,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        # Send request
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 204:
                print("✅ Relay test successful! Check your iOS Simulator.")
            else:
                print(f"❌ Relay test failed with status {response.status}")
                
    except urllib.error.URLError as e:
        print("❌ Could not connect to relay. Make sure it's running:")
        print("   python3 relay.py")
    except Exception as e:
        print(f"❌ Error testing relay: {e}")

if __name__ == "__main__":
    test_relay() 