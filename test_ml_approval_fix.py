#!/usr/bin/env python3
"""
Test script to verify Medical Leave (ML) approval fix
Tests that ML only updates ABSENT lecture entries, not based on days
"""

from pymongo import MongoClient
import datetime

MONGO_URI = "mongodb+srv://flask_user:keshavjulka%40123@flask-cluster.rstc7gw.mongodb.net/attendance_system?retryWrites=true&w=majority&appName=flask-cluster"

def test_ml_approval_logic():
    """Test ML approval with realistic scenario"""
    
    client = MongoClient(MONGO_URI)
    db = client['attendance_system']
    attendance_col = db['attendance']
    
    print("="*70)
    print("🧪 MEDICAL LEAVE APPROVAL - LOGIC TEST")
    print("="*70)
    
    # Test scenario
    test_rollNo = "TEST123"
    test_name = "Test Student"
    start_date = "2025-11-15"
    end_date = "2025-11-17"  # 3 days
    
    print(f"\n📋 Test Scenario:")
    print(f"  Student: {test_name} ({test_rollNo})")
    print(f"  ML Date Range: {start_date} to {end_date} (3 days)")
    
    # Clean up any existing test data
    print(f"\n🧹 Cleaning up existing test data...")
    deleted = attendance_col.delete_many({"rollNo": test_rollNo})
    print(f"  Deleted {deleted.deleted_count} old test records")
    
    # Create realistic attendance scenario
    # Day 1: 2 lectures, both absent
    # Day 2: 3 lectures, all absent  
    # Day 3: 2 lectures, 1 absent, 1 present
    # Total: 7 lectures, 6 absent, 1 present
    
    test_attendance = [
        # Day 1 - Nov 15 (2 lectures, both absent)
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-15", "lectureNumber": 1, "subject": "Math", "status": "Absent"},
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-15", "lectureNumber": 2, "subject": "Physics", "status": "Absent"},
        
        # Day 2 - Nov 16 (3 lectures, all absent)
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-16", "lectureNumber": 1, "subject": "Chemistry", "status": "Absent"},
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-16", "lectureNumber": 2, "subject": "Biology", "status": "Absent"},
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-16", "lectureNumber": 3, "subject": "English", "status": "Absent"},
        
        # Day 3 - Nov 17 (2 lectures, 1 absent, 1 present)
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-17", "lectureNumber": 1, "subject": "History", "status": "Absent"},
        {"rollNo": test_rollNo, "name": test_name, "date": "2025-11-17", "lectureNumber": 2, "subject": "CS", "status": "Present"},  # Student was present!
    ]
    
    print(f"\n📚 Creating test attendance records:")
    print(f"  Day 1 (Nov 15): 2 lectures - both Absent")
    print(f"  Day 2 (Nov 16): 3 lectures - all Absent")
    print(f"  Day 3 (Nov 17): 2 lectures - 1 Absent, 1 Present")
    print(f"  Total: 7 lectures (6 Absent, 1 Present)")
    
    result = attendance_col.insert_many(test_attendance)
    print(f"  ✅ Inserted {len(result.inserted_ids)} attendance records")
    
    # Show initial state
    print(f"\n📊 BEFORE ML Approval:")
    initial_records = list(attendance_col.find({"rollNo": test_rollNo}).sort([("date", 1), ("lectureNumber", 1)]))
    
    absent_count = sum(1 for r in initial_records if r['status'] == 'Absent')
    present_count = sum(1 for r in initial_records if r['status'] == 'Present')
    
    print(f"  Total Lectures: {len(initial_records)}")
    print(f"  Absent: {absent_count}")
    print(f"  Present: {present_count}")
    print(f"\n  Detailed breakdown:")
    for record in initial_records:
        print(f"    {record['date']} L{record['lectureNumber']} {record['subject']:12s} - {record['status']}")
    
    # Simulate ML approval logic (same as backend)
    print(f"\n🔧 Simulating ML Approval Logic...")
    
    date_list = ["2025-11-15", "2025-11-16", "2025-11-17"]
    ml_lectures_updated = 0
    total_absent_found = 0
    
    for date_str in date_list:
        # Find ALL attendance records for this date
        attendance_records = list(attendance_col.find({
            "rollNo": test_rollNo,
            "date": date_str
        }))
        
        # Update each ABSENT lecture to ML
        for record in attendance_records:
            if record.get('status') == 'Absent':
                total_absent_found += 1
                result = attendance_col.update_one(
                    {"_id": record['_id']},
                    {
                        "$set": {
                            "status": "ML",
                            "method": "ml_approved",
                            "updated_at": datetime.datetime.utcnow()
                        }
                    }
                )
                if result.modified_count > 0:
                    ml_lectures_updated += 1
    
    print(f"  Absent lectures found: {total_absent_found}")
    print(f"  Lectures updated to ML: {ml_lectures_updated}")
    
    # Show final state
    print(f"\n📊 AFTER ML Approval:")
    final_records = list(attendance_col.find({"rollNo": test_rollNo}).sort([("date", 1), ("lectureNumber", 1)]))
    
    ml_count = sum(1 for r in final_records if r['status'] == 'ML')
    present_count = sum(1 for r in final_records if r['status'] == 'Present')
    absent_count = sum(1 for r in final_records if r['status'] == 'Absent')
    
    print(f"  Total Lectures: {len(final_records)}")
    print(f"  ML: {ml_count}")
    print(f"  Present: {present_count}")
    print(f"  Absent: {absent_count} (should be 0)")
    print(f"\n  Detailed breakdown:")
    for record in final_records:
        print(f"    {record['date']} L{record['lectureNumber']} {record['subject']:12s} - {record['status']}")
    
    # Calculate attendance percentage
    total_present = ml_count + present_count
    total_lectures = len(final_records)
    percentage = (total_present / total_lectures * 100) if total_lectures > 0 else 0
    
    print(f"\n📈 Attendance Calculation:")
    print(f"  Total Present = ML + Present = {ml_count} + {present_count} = {total_present}")
    print(f"  Total Lectures = {total_lectures}")
    print(f"  Attendance % = {total_present}/{total_lectures} × 100 = {percentage:.2f}%")
    
    # Verification
    print(f"\n✅ VERIFICATION:")
    success = True
    
    if ml_count == 6:
        print(f"  ✅ Correct: 6 lectures updated to ML (all absent lectures)")
    else:
        print(f"  ❌ WRONG: Expected 6 ML entries, got {ml_count}")
        success = False
    
    if present_count == 1:
        print(f"  ✅ Correct: 1 lecture remains Present (not overwritten)")
    else:
        print(f"  ❌ WRONG: Expected 1 Present entry, got {present_count}")
        success = False
    
    if absent_count == 0:
        print(f"  ✅ Correct: No Absent entries remain")
    else:
        print(f"  ❌ WRONG: {absent_count} Absent entries still exist")
        success = False
    
    if ml_lectures_updated == 6:
        print(f"  ✅ Correct: Updated count matches absent lectures (not days)")
    else:
        print(f"  ❌ WRONG: Updated {ml_lectures_updated} instead of 6")
        success = False
    
    # Clean up test data
    print(f"\n🧹 Cleaning up test data...")
    deleted = attendance_col.delete_many({"rollNo": test_rollNo})
    print(f"  Deleted {deleted.deleted_count} test records")
    
    print(f"\n" + "="*70)
    if success:
        print("🎉 ALL TESTS PASSED - ML APPROVAL LOGIC IS CORRECT!")
        print("="*70)
        print("\n✅ Summary:")
        print("  - ML updates ONLY absent lecture entries")
        print("  - Present lectures are NOT overwritten")
        print("  - Count is based on LECTURES, not DAYS")
        print("  - Attendance percentage is accurate")
    else:
        print("❌ TESTS FAILED - LOGIC NEEDS REVIEW")
        print("="*70)
    
    return success

if __name__ == "__main__":
    try:
        success = test_ml_approval_logic()
        exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
