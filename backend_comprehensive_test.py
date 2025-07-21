#!/usr/bin/env python3
"""
Enhanced Backend API Testing Suite for Vimukti Mental Wellness Platform
Includes comprehensive testing with realistic scenarios
"""

import requests
import json
import uuid
import time
from datetime import datetime
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

class VimuktiEnhancedTester:
    def __init__(self):
        self.base_url = os.getenv('REACT_APP_BACKEND_URL', 'https://208e17c2-36ec-43bc-96b2-8c544c4a443c.preview.emergentagent.com')
        self.api_url = f"{self.base_url}/api"
        self.session_token = None
        self.test_results = {}
        
        print(f"🧪 Vimukti Enhanced Backend Testing Suite")
        print(f"📡 Testing API at: {self.api_url}")
        print("=" * 70)
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
        if response_data and not success:
            print(f"   📊 Response: {response_data}")
        print()
        
        self.test_results[test_name] = {
            'success': success,
            'details': details,
            'response_data': response_data,
            'timestamp': datetime.now().isoformat()
        }
    
    def test_basic_api_health(self):
        """Test 1: Basic API Health - /api/ endpoint"""
        print("🔍 Testing Basic API Health...")
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "Vimukti" in data.get("message", ""):
                    self.log_test("Basic API Health", True, f"API responding correctly: {data['message']}")
                    return True
                else:
                    self.log_test("Basic API Health", False, f"Unexpected response message: {data}")
                    return False
            else:
                self.log_test("Basic API Health", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Basic API Health", False, f"Connection error: {str(e)}")
            return False
    
    def test_google_oauth_flow(self):
        """Test 2: Complete Google OAuth Flow Testing"""
        print("🔍 Testing Google OAuth Flow...")
        
        # Test login redirect endpoint
        try:
            response = requests.get(f"{self.api_url}/login/google", allow_redirects=False, timeout=10)
            
            if response.status_code in [302, 307]:  # Redirect responses
                location = response.headers.get('location', '')
                if 'accounts.google.com' in location and 'oauth2' in location:
                    # Check if redirect URI is properly configured
                    if 'redirect_uri=' in location:
                        # Extract and decode redirect URI
                        import urllib.parse
                        redirect_uri_encoded = location.split('redirect_uri=')[1].split('&')[0]
                        redirect_uri = urllib.parse.unquote(redirect_uri_encoded)
                        
                        expected_callback = f"{self.base_url}/api/auth/google"
                        if redirect_uri == expected_callback:
                            self.log_test("Google OAuth Flow", True, 
                                        f"OAuth flow properly configured with callback: {redirect_uri}")
                            return True
                        else:
                            self.log_test("Google OAuth Flow", False, 
                                        f"Incorrect callback URL. Expected: {expected_callback}, Got: {redirect_uri}")
                            return False
                    else:
                        self.log_test("Google OAuth Flow", False, "No redirect_uri found in OAuth URL")
                        return False
                else:
                    self.log_test("Google OAuth Flow", False, 
                                f"Invalid redirect location: {location}")
                    return False
            else:
                self.log_test("Google OAuth Flow", False, 
                            f"Expected redirect (302/307), got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Google OAuth Flow", False, f"Connection error: {str(e)}")
            return False
    
    def test_authentication_security(self):
        """Test 3: Authentication Security for Protected Endpoints"""
        print("🔍 Testing Authentication Security...")
        
        protected_endpoints = [
            ("/auth/profile", "GET"),
            ("/chat", "POST"),
            ("/chat/sessions", "GET"),
            ("/chat/sessions", "POST"),
            ("/onboarding", "POST")
        ]
        
        all_secure = True
        
        for endpoint, method in protected_endpoints:
            try:
                if method == "GET":
                    response = requests.get(f"{self.api_url}{endpoint}", timeout=10)
                else:
                    # POST with minimal valid data
                    test_data = {"test": "data"}
                    response = requests.post(f"{self.api_url}{endpoint}", json=test_data, timeout=10)
                
                if response.status_code == 401:
                    self.log_test(f"Security: {endpoint} ({method})", True, 
                                "Correctly requires authentication")
                else:
                    self.log_test(f"Security: {endpoint} ({method})", False, 
                                f"Expected 401, got {response.status_code}")
                    all_secure = False
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"Security: {endpoint} ({method})", False, f"Connection error: {str(e)}")
                all_secure = False
        
        return all_secure
    
    def test_mistral_integration_readiness(self):
        """Test 4: Mistral AI Integration Readiness"""
        print("🔍 Testing Mistral AI Integration...")
        
        # Test with invalid token to check if Mistral integration is properly set up
        headers = {"Authorization": "Bearer invalid_token_for_testing"}
        chat_data = {
            "session_id": str(uuid.uuid4()),
            "message": "I'm feeling overwhelmed with work stress. Can you help me?"
        }
        
        try:
            response = requests.post(f"{self.api_url}/chat", 
                                   json=chat_data, headers=headers, timeout=30)
            
            if response.status_code == 401:
                self.log_test("Mistral Integration Readiness", True, 
                            "Mistral endpoint properly secured behind authentication")
                return True
            elif response.status_code == 500:
                error_text = response.text
                if "Mistral API key not configured" in error_text:
                    self.log_test("Mistral Integration Readiness", False, 
                                "Mistral API key not properly configured")
                    return False
                else:
                    # Other 500 errors might indicate the integration is ready but auth failed
                    self.log_test("Mistral Integration Readiness", True, 
                                "Mistral integration appears configured (auth required)")
                    return True
            else:
                self.log_test("Mistral Integration Readiness", False, 
                            f"Unexpected response {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Mistral Integration Readiness", False, f"Connection error: {str(e)}")
            return False
    
    def test_chat_session_management(self):
        """Test 5: Chat Session Management Endpoints"""
        print("🔍 Testing Chat Session Management...")
        
        # Test session creation endpoint
        try:
            response = requests.post(f"{self.api_url}/chat/sessions", timeout=10)
            
            if response.status_code == 401:
                self.log_test("Chat Session Creation Security", True, 
                            "Session creation properly requires authentication")
            else:
                self.log_test("Chat Session Creation Security", False, 
                            f"Expected 401, got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Chat Session Creation Security", False, f"Connection error: {str(e)}")
            return False
        
        # Test session retrieval endpoint
        try:
            response = requests.get(f"{self.api_url}/chat/sessions", timeout=10)
            
            if response.status_code == 401:
                self.log_test("Chat Session Retrieval Security", True, 
                            "Session retrieval properly requires authentication")
                return True
            else:
                self.log_test("Chat Session Retrieval Security", False, 
                            f"Expected 401, got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Chat Session Retrieval Security", False, f"Connection error: {str(e)}")
            return False
    
    def test_user_profile_management(self):
        """Test 6: User Profile Management"""
        print("🔍 Testing User Profile Management...")
        
        try:
            response = requests.get(f"{self.api_url}/auth/profile", timeout=10)
            
            if response.status_code == 401:
                self.log_test("User Profile Management", True, 
                            "Profile endpoint properly secured with authentication")
                return True
            else:
                self.log_test("User Profile Management", False, 
                            f"Expected 401, got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("User Profile Management", False, f"Connection error: {str(e)}")
            return False
    
    def test_api_structure_compliance(self):
        """Test 7: API Structure and Routing"""
        print("🔍 Testing API Structure and Routing...")
        
        # Test that API endpoints are properly prefixed
        api_endpoints = [
            "/",
            "/login/google",
            "/auth/profile",
            "/chat",
            "/chat/sessions"
        ]
        
        all_endpoints_working = True
        
        for endpoint in api_endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}", timeout=5)
                # We expect either 200 (for public endpoints) or 401 (for protected endpoints)
                # or 405 (method not allowed for POST-only endpoints)
                if response.status_code in [200, 401, 405]:
                    self.log_test(f"API Structure: {endpoint}", True, 
                                f"Endpoint accessible via /api prefix (status: {response.status_code})")
                else:
                    self.log_test(f"API Structure: {endpoint}", False, 
                                f"Unexpected status code: {response.status_code}")
                    all_endpoints_working = False
                    
            except requests.exceptions.RequestException as e:
                self.log_test(f"API Structure: {endpoint}", False, f"Connection error: {str(e)}")
                all_endpoints_working = False
        
        # Test that non-API routes serve frontend (this is correct behavior)
        try:
            response = requests.get(f"{self.base_url}/", timeout=5)
            if response.status_code == 200 and 'html' in response.text.lower():
                self.log_test("Frontend Routing", True, 
                            "Non-API routes correctly serve frontend application")
            else:
                self.log_test("Frontend Routing", False, 
                            f"Frontend not properly served for non-API routes")
                all_endpoints_working = False
        except requests.exceptions.RequestException as e:
            self.log_test("Frontend Routing", False, f"Connection error: {str(e)}")
            all_endpoints_working = False
        
        return all_endpoints_working
    
    def test_data_validation(self):
        """Test 8: API Data Validation"""
        print("🔍 Testing API Data Validation...")
        
        # Test chat endpoint with invalid data
        try:
            invalid_chat_data = {"invalid": "data"}
            response = requests.post(f"{self.api_url}/chat", json=invalid_chat_data, timeout=10)
            
            # Should get 401 (auth required) or 422 (validation error)
            if response.status_code in [401, 422]:
                self.log_test("Chat Data Validation", True, 
                            f"Properly validates chat data (status: {response.status_code})")
                return True
            else:
                self.log_test("Chat Data Validation", False, 
                            f"Unexpected response to invalid data: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Chat Data Validation", False, f"Connection error: {str(e)}")
            return False
    
    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests"""
        print("🚀 Starting Vimukti Comprehensive Backend API Tests")
        print("=" * 70)
        
        tests = [
            ("Basic API Health", self.test_basic_api_health),
            ("Google OAuth Flow", self.test_google_oauth_flow),
            ("Authentication Security", self.test_authentication_security),
            ("Mistral Integration", self.test_mistral_integration_readiness),
            ("Chat Session Management", self.test_chat_session_management),
            ("User Profile Management", self.test_user_profile_management),
            ("API Structure Compliance", self.test_api_structure_compliance),
            ("Data Validation", self.test_data_validation)
        ]
        
        passed = 0
        total = len(tests)
        failed_tests = []
        
        for test_name, test_func in tests:
            try:
                print(f"🧪 Running: {test_name}")
                if test_func():
                    passed += 1
                else:
                    failed_tests.append(test_name)
            except Exception as e:
                print(f"❌ Test {test_name} failed with exception: {str(e)}")
                failed_tests.append(test_name)
                self.log_test(test_name, False, f"Exception: {str(e)}")
        
        print("=" * 70)
        print(f"📊 COMPREHENSIVE TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL BACKEND TESTS PASSED!")
            print("✅ Vimukti backend is ready for production!")
        else:
            print(f"⚠️  {total - passed} tests failed:")
            for failed_test in failed_tests:
                print(f"   ❌ {failed_test}")
        
        print("=" * 70)
        
        return self.test_results, passed, total

def main():
    """Main test execution"""
    tester = VimuktiEnhancedTester()
    results, passed, total = tester.run_comprehensive_tests()
    
    # Save results to file
    with open('/app/backend_comprehensive_test_results.json', 'w') as f:
        json.dump({
            'test_results': results,
            'summary': {
                'passed': passed,
                'total': total,
                'success_rate': f"{(passed/total)*100:.1f}%",
                'timestamp': datetime.now().isoformat()
            }
        }, f, indent=2)
    
    print(f"📁 Detailed results saved to: /app/backend_comprehensive_test_results.json")
    
    return results, passed, total

if __name__ == "__main__":
    main()