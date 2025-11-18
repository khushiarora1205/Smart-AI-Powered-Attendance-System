#!/usr/bin/env python3
"""
Simple test to check if subjects database has ECE subjects
"""

# Check if we can import pymongo and access the database
try:
    from pymongo import MongoClient
    import os
    
    # MongoDB connection
    MONGO_URL = "mongodb+srv://keshav:AvA2Ia2FNnMOLOlf@sih2023.0q9qzjj.mongodb.net/sih2023?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"
    
    client = MongoClient(MONGO_URL)
    db = client['sih2023']
    subjects_col = db['subjects']
    
    print("🧪 Testing Subject Database Content\n")
    
    # Check if subjects collection exists and has data
    total_subjects = subjects_col.count_documents({})
    print(f"📊 Total subjects in database: {total_subjects}")
    
    if total_subjects == 0:
        print("❌ No subjects found in database!")
        print("💡 Need to initialize subjects database")
    else:
        print("✅ Subjects database has data")
        
        # Check ECE subjects specifically
        ece_subjects = list(subjects_col.find({"departments": "ECE"}, {"name": 1, "_id": 0}))
        ece_count = len(ece_subjects)
        
        print(f"\n📚 ECE Department Analysis:")
        print(f"   └─ ECE subjects found: {ece_count}")
        
        if ece_count > 0:
            print("   └─ ECE Subjects List:")
            for i, subject in enumerate(ece_subjects, 1):
                print(f"      {i:2d}. {subject['name']}")
            print("   └─ Status: ✅ ECE subjects available!")
        else:
            print("   └─ Status: ❌ No ECE subjects found!")
        
        # Check other departments
        print(f"\n📋 Department Summary:")
        departments = ["Computer Science", "Mathematics", "Physics", "Business", 
                      "Engineering", "ECE", "Mechanical", "Civil", "Electrical", "Chemical"]
        
        for dept in departments:
            count = subjects_col.count_documents({"departments": dept})
            status = "✅" if count > 0 else "❌"
            print(f"   {status} {dept}: {count} subjects")
    
    client.close()
    print(f"\n🏁 Database check completed!")
    
except ImportError:
    print("❌ PyMongo not available. Cannot test database directly.")
    print("💡 Please ensure the Flask server is running and use the web interface.")
    
except Exception as e:
    print(f"❌ Database connection error: {e}")
    print("💡 Please check MongoDB connection and credentials.")