def send_teacher_credentials_email(teacher_name, username, password, email, department):
    """
    Send teacher credentials via email
    """
    try:
        # Email configuration
        sender_email = "khushi3860.beai23@chitkara.edu.in"
        sender_password = "PNEeshanvi@93159416"
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        print(f"📧 Sending email to: {email}")
        print(f"📤 From: {sender_email}")
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Your Faculty Login Credentials – Smart AI Attendance System"
        
        # Email body
        body = f"""Hello {teacher_name},

Welcome to the Smart AI-Powered Attendance System!

Here are your login credentials:

Username: {username}
Password: {password}
Email: {email}
Department: {department}

Please log in using these credentials to access the teacher portal.

Best regards,
Smart Attendance System Admin
"""
        
        message.attach(MIMEText(body, "plain"))
        
        # Connect to server and send email
        print(f"📧 Attempting to send email to: {email}")
        print(f"📡 Using SMTP server: {smtp_server}:{smtp_port}")
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable TLS encryption
        print(f"🔐 Logging in with email: {sender_email}")
        server.login(sender_email, sender_password)
        text = message.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        print(f"✅ Email sent successfully to: {email}")
        
        return True
    except Exception as e:
        print(f"❌ Email sending error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        return False