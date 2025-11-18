from pymongo import MongoClient
import hashlib
import secrets
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# MongoDB connection
MONGO_URI = "mongodb+srv://flask_user:keshavjulka%40123@flask-cluster.rstc7gw.mongodb.net/attendance_system?retryWrites=true&w=majority&appName=flask-cluster"
client = MongoClient(MONGO_URI)
db = client['attendance_system']
students_col = db['students']

def generate_random_password():
    """Generate a random 8-character alphanumeric password"""
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for _ in range(8))
    return password

def send_student_credentials_email(student_name, username, password, email):
    """Send student credentials via email"""
    try:
        sender_email = "karanjulka2512@gmail.com"
        sender_password = "mdaw pumn vupx zxdg"
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        print(f"📧 Sending credentials to: {email}")
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Your Student Login Credentials – Smart AI Attendance System"
        
        # Email body
        body = f"""Hello {student_name},

Welcome to the Smart AI-Powered Attendance System!

Here are your login credentials:

Username: {username}
Password: {password}

Please log in using these credentials to access the student portal at the Student Login page.

IMPORTANT: Please change your password after your first login for security purposes.

Best regards,
Smart Attendance System Admin
"""
        
        message.attach(MIMEText(body, "plain"))
        
        # Connect to server and send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = message.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        print(f"✅ Email sent successfully to: {email}")
        
        return True
    except Exception as e:
        print(f"❌ Email sending error: {str(e)}")
        return False

def setup_student_passwords():
    """Generate random 8-character passwords for all students and send via email"""
    
    # Get all students
    students = list(students_col.find({}))
    
    print(f"Found {len(students)} students\n")
    
    for student in students:
        # Generate random 8-character password
        password = generate_random_password()
        
        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Update student document
        students_col.update_one(
            {'_id': student['_id']},
            {'$set': {
                'password_hash': password_hash,
                'email_sent': False
            }}
        )
        
        student_name = student.get('name', 'Student')
        username = student.get('username', 'N/A')
        email = student.get('email', '')
        
        print(f"Student: {student_name}")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        
        # Send email if email address exists
        if email:
            email_sent = send_student_credentials_email(student_name, username, password, email)
            if email_sent:
                students_col.update_one(
                    {'_id': student['_id']},
                    {'$set': {'email_sent': True}}
                )
                print(f"  Email: ✅ Sent to {email}")
            else:
                print(f"  Email: ❌ Failed to send to {email}")
        else:
            print(f"  Email: ⚠️ No email address")
        
        print()

if __name__ == "__main__":
    print("=" * 60)
    print("Setting up Random 8-Character Passwords for Students")
    print("=" * 60)
    print()
    setup_student_passwords()
    print("=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print("\nAll students have been assigned random 8-character passwords.")
    print("Credentials have been sent via email where available.")
