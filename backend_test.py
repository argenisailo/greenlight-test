import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class ClientManagementAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = "mock-token"  # Mock token for authentication
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.created_client_id = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_get_clients_empty(self):
        """Test getting clients when database is empty"""
        try:
            response = requests.get(f"{self.base_url}/api/clients", headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                clients = response.json()
                details += f", Count: {len(clients)}"
            self.log_test("Get Clients (Empty)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Clients (Empty)", False, f"Error: {str(e)}")
            return False

    def test_create_person_client(self):
        """Test creating a person client"""
        try:
            person_data = {
                "type": "person",
                "data": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "phone": "+1-555-0123",
                    "address": "123 Main St, City, State 12345",
                    "company": "Tech Corp",
                    "position": "Software Engineer"
                },
                "ownership": {
                    "primary_owner": "user@company.com",
                    "department": "Sales",
                    "account_manager": "Manager Name"
                }
            }
            
            response = requests.post(f"{self.base_url}/api/clients", 
                                   json=person_data, headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                client = response.json()
                self.created_client_id = client.get('id')
                details += f", Client ID: {self.created_client_id}"
            
            self.log_test("Create Person Client", success, details)
            return success
        except Exception as e:
            self.log_test("Create Person Client", False, f"Error: {str(e)}")
            return False

    def test_create_company_client(self):
        """Test creating a company client"""
        try:
            company_data = {
                "type": "company",
                "data": {
                    "company_name": "Acme Corporation",
                    "contact_person": "Jane Smith",
                    "email": "contact@acme.com",
                    "phone": "+1-555-0456",
                    "address": "456 Business Ave, City, State 67890",
                    "website": "https://acme.com",
                    "industry": "Technology",
                    "size": "50-100 employees"
                },
                "ownership": {
                    "primary_owner": "user@company.com",
                    "department": "Business Development",
                    "account_manager": "Account Manager"
                }
            }
            
            response = requests.post(f"{self.base_url}/api/clients", 
                                   json=company_data, headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                client = response.json()
                details += f", Client ID: {client.get('id')}"
            
            self.log_test("Create Company Client", success, details)
            return success
        except Exception as e:
            self.log_test("Create Company Client", False, f"Error: {str(e)}")
            return False

    def test_get_clients_with_data(self):
        """Test getting clients after creating some"""
        try:
            response = requests.get(f"{self.base_url}/api/clients", headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                clients = response.json()
                details += f", Count: {len(clients)}"
                success = len(clients) >= 1  # Should have at least the clients we created
            
            self.log_test("Get Clients (With Data)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Clients (With Data)", False, f"Error: {str(e)}")
            return False

    def test_search_clients(self):
        """Test client search functionality"""
        try:
            # Search by first name
            response = requests.get(f"{self.base_url}/api/clients?search=John", headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                clients = response.json()
                details += f", Search Results: {len(clients)}"
            
            self.log_test("Search Clients", success, details)
            return success
        except Exception as e:
            self.log_test("Search Clients", False, f"Error: {str(e)}")
            return False

    def test_filter_clients_by_type(self):
        """Test client filtering by type"""
        try:
            # Filter by person type
            response = requests.get(f"{self.base_url}/api/clients?client_type=person", headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                clients = response.json()
                details += f", Person Clients: {len(clients)}"
            
            self.log_test("Filter Clients by Type", success, details)
            return success
        except Exception as e:
            self.log_test("Filter Clients by Type", False, f"Error: {str(e)}")
            return False

    def test_get_specific_client(self):
        """Test getting a specific client by ID"""
        if not self.created_client_id:
            self.log_test("Get Specific Client", False, "No client ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/api/clients/{self.created_client_id}", 
                                  headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                client = response.json()
                details += f", Client Type: {client.get('type')}"
            
            self.log_test("Get Specific Client", success, details)
            return success
        except Exception as e:
            self.log_test("Get Specific Client", False, f"Error: {str(e)}")
            return False

    def test_update_client(self):
        """Test updating a client"""
        if not self.created_client_id:
            self.log_test("Update Client", False, "No client ID available")
            return False
            
        try:
            update_data = {
                "data": {
                    "phone": "+1-555-9999"  # Update phone number
                }
            }
            
            response = requests.put(f"{self.base_url}/api/clients/{self.created_client_id}", 
                                  json=update_data, headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            self.log_test("Update Client", success, details)
            return success
        except Exception as e:
            self.log_test("Update Client", False, f"Error: {str(e)}")
            return False

    def test_add_note(self):
        """Test adding a note to a client"""
        if not self.created_client_id:
            self.log_test("Add Note", False, "No client ID available")
            return False
            
        try:
            # Note: The API expects note_content as a query parameter, not JSON body
            response = requests.post(f"{self.base_url}/api/clients/{self.created_client_id}/notes?note_content=Test note content", 
                                   headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                note = response.json()
                details += f", Note ID: {note.get('id')}"
            
            self.log_test("Add Note", success, details)
            return success
        except Exception as e:
            self.log_test("Add Note", False, f"Error: {str(e)}")
            return False

    def test_add_tracking_entry(self):
        """Test adding a tracking entry to a client"""
        if not self.created_client_id:
            self.log_test("Add Tracking Entry", False, "No client ID available")
            return False
            
        try:
            # Note: The API expects parameters as query parameters
            params = {
                "activity_type": "call",
                "description": "Initial contact call",
                "outcome": "Positive response"
            }
            
            response = requests.post(f"{self.base_url}/api/clients/{self.created_client_id}/tracking", 
                                   params=params, headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                tracking = response.json()
                details += f", Tracking ID: {tracking.get('id')}"
            
            self.log_test("Add Tracking Entry", success, details)
            return success
        except Exception as e:
            self.log_test("Add Tracking Entry", False, f"Error: {str(e)}")
            return False

    def test_get_sharepoint_url(self):
        """Test getting SharePoint URL for a client"""
        if not self.created_client_id:
            self.log_test("Get SharePoint URL", False, "No client ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/api/clients/{self.created_client_id}/sharepoint-url", 
                                  headers=self.headers)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", URL: {data.get('sharepoint_url', 'N/A')[:50]}..."
            
            self.log_test("Get SharePoint URL", success, details)
            return success
        except Exception as e:
            self.log_test("Get SharePoint URL", False, f"Error: {str(e)}")
            return False

    def test_microsoft_auth(self):
        """Test mock Microsoft authentication"""
        try:
            auth_data = {"token": "mock-microsoft-token"}
            response = requests.post(f"{self.base_url}/api/auth/microsoft", 
                                   json=auth_data)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Access Token: {data.get('access_token', 'N/A')}"
            
            self.log_test("Microsoft Auth", success, details)
            return success
        except Exception as e:
            self.log_test("Microsoft Auth", False, f"Error: {str(e)}")
            return False

    def test_unauthorized_access(self):
        """Test API without authentication token"""
        try:
            headers_no_auth = {'Content-Type': 'application/json'}
            response = requests.get(f"{self.base_url}/api/clients", headers=headers_no_auth)
            success = response.status_code == 401  # Should be unauthorized
            details = f"Status: {response.status_code} (Expected 401)"
            
            self.log_test("Unauthorized Access", success, details)
            return success
        except Exception as e:
            self.log_test("Unauthorized Access", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Client Management API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_health_endpoint,
            self.test_unauthorized_access,
            self.test_microsoft_auth,
            self.test_get_clients_empty,
            self.test_create_person_client,
            self.test_create_company_client,
            self.test_get_clients_with_data,
            self.test_search_clients,
            self.test_filter_clients_by_type,
            self.test_get_specific_client,
            self.test_update_client,
            self.test_add_note,
            self.test_add_tracking_entry,
            self.test_get_sharepoint_url,
        ]
        
        for test in tests:
            test()
            print()  # Add spacing between tests
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = ClientManagementAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())