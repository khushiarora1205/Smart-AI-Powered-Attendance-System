#!/usr/bin/env python3
"""
Test script to verify subject availability by department
"""
import requests
import json

API_BASE_URL = "http://localhost:5001"

def test_subject_availability():
    print("🧪 Testing Subject Availability by Department\n")
    
    # Test departments
    departments = ["ECE", "Computer Science", "Mechanical", "Civil", "Electrical", "Chemical"]
    
    # First, try to refresh subjects database
    print("1. Refreshing subjects database...")
    try:
        # This would need admin authentication in real scenario
        # For testing, we'll just check if endpoint exists
        response = requests.post(f"{API_BASE_URL}/api/admin/refresh-subjects")
        print(f"   Refresh attempt status: {response.status_code}")
    except Exception as e:
        print(f"   Refresh endpoint check: {e}")
    
    print("\n2. Testing subject availability by department:")
    print("-" * 60)
    
    for dept in departments:
        try:
            # Test the subjects endpoint for each department
            response = requests.get(f"{API_BASE_URL}/api/subjects", 
                                  params={"department": dept})
            
            if response.status_code == 200:
                data = response.json()
                subject_count = data.get('count', 0)
                subjects = data.get('subjects', [])
                
                print(f"📚 {dept} Department:")
                print(f"   └─ {subject_count} subjects available")
                
                if subject_count > 0:
                    print(f"   └─ Sample subjects: {', '.join(subjects[:3])}{'...' if len(subjects) > 3 else ''}")
                    status = "✅ PASS"
                else:
                    status = "❌ FAIL - No subjects found"
                    
                print(f"   └─ Status: {status}")
                
            else:
                print(f"📚 {dept} Department:")
                print(f"   └─ Status: ❌ FAIL - API Error {response.status_code}")
                
        except Exception as e:
            print(f"📚 {dept} Department:")
            print(f"   └─ Status: ❌ FAIL - Connection Error: {e}")
        
        print()
    
    print("-" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_subject_availability()