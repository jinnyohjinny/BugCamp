#!/usr/bin/env python3
"""
Test script for Web Attacker Server
Generates test requests to verify functionality
"""

import requests
import time
import json
import random
from urllib.parse import urljoin

BASE_URL = "http://localhost:8083"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_dashboard():
    """Test dashboard endpoint"""
    print("🔍 Testing dashboard...")
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Dashboard accessible")
            return True
        else:
            print(f"❌ Dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
        return False

def test_upload():
    """Test file upload"""
    print("🔍 Testing file upload...")
    try:
        # Create a test file
        test_content = f"Test file created at {time.time()}"
        files = {'file': ('test_file.txt', test_content, 'text/plain')}
        
        response = requests.post(f"{BASE_URL}/upload", files=files, timeout=10)
        if response.status_code == 200:
            print("✅ File upload successful")
            return True
        else:
            print(f"❌ File upload failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ File upload error: {e}")
        return False

def test_download():
    """Test file download"""
    print("🔍 Testing file download...")
    try:
        response = requests.get(f"{BASE_URL}/files/test_file.txt", timeout=5)
        if response.status_code == 200:
            print("✅ File download successful")
            return True
        else:
            print(f"❌ File download failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ File download error: {e}")
        return False

def test_logs():
    """Test logs endpoint"""
    print("🔍 Testing logs endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/logs", timeout=5)
        if response.status_code == 200:
            print("✅ Logs page accessible")
            return True
        else:
            print(f"❌ Logs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Logs error: {e}")
        return False

def test_api_logs():
    """Test API logs endpoint"""
    print("🔍 Testing API logs...")
    try:
        response = requests.get(f"{BASE_URL}/api/logs", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API logs accessible: {len(data.get('logs', []))} logs")
            return True
        else:
            print(f"❌ API logs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API logs error: {e}")
        return False

def test_api_stats():
    """Test API stats endpoint"""
    print("🔍 Testing API stats...")
    try:
        response = requests.get(f"{BASE_URL}/api/stats", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API stats accessible: {data}")
            return True
        else:
            print(f"❌ API stats failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API stats error: {e}")
        return False

def test_webhook():
    """Test webhook endpoint"""
    print("🔍 Testing webhook endpoint...")
    try:
        test_data = {
            "test": "data",
            "timestamp": time.time(),
            "message": "Test webhook"
        }
        
        response = requests.post(f"{BASE_URL}/webhook", 
                               json=test_data, 
                               headers={'Content-Type': 'application/json'},
                               timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Webhook test successful: {data}")
            return True
        else:
            print(f"❌ Webhook test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Webhook test error: {e}")
        return False

def generate_test_requests():
    """Generate various test requests to populate logs"""
    print("🔍 Generating test requests...")
    
    test_urls = [
        "/",
        "/logs",
        "/upload",
        "/health",
        "/api/stats",
        "/api/logs",
        "/files/test_file.txt",
        "/nonexistent",
        "/robots.txt"
    ]
    
    test_methods = ["GET", "POST"]
    test_headers = [
        {"User-Agent": "TestBot/1.0"},
        {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
        {"User-Agent": "curl/7.68.0"},
        {"User-Agent": "python-requests/2.31.0"}
    ]
    
    for i in range(10):
        url = random.choice(test_urls)
        method = random.choice(test_methods)
        headers = random.choice(test_headers)
        
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{url}", 
                                     headers=headers, 
                                     timeout=3)
            else:
                response = requests.post(f"{BASE_URL}{url}", 
                                      headers=headers, 
                                      timeout=3)
            
            print(f"  {method} {url} -> {response.status_code}")
            time.sleep(0.1)  # Small delay between requests
            
        except Exception as e:
            print(f"  {method} {url} -> Error: {e}")
    
    print("✅ Test requests completed")

def main():
    print("🚀 Starting Web Attacker Server Tests")
    print("=" * 50)
    
    # Wait for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    tests = [
        test_health,
        test_dashboard,
        test_upload,
        test_download,
        test_logs,
        test_api_logs,
        test_api_stats,
        test_webhook
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Server is working correctly.")
    else:
        print("⚠️  Some tests failed. Check server logs for details.")
    
    print("\n🔍 Generating additional test requests...")
    generate_test_requests()
    
    print("\n✅ Testing completed!")
    print(f"🌐 Access the dashboard at: {BASE_URL}")
    print(f"📋 View logs at: {BASE_URL}/logs")

if __name__ == "__main__":
    main()
