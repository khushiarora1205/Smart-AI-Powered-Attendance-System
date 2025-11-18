# 🎓 FaceAttend Pro - Smart AI-Powered Attendance System

An intelligent facial recognition-based attendance management system with medical leave workflow, built using AI/ML technologies, Flask backend, and React frontend.

## 🚀 Features

### 👨‍💼 Admin Portal
- **User Management**: Add, edit, delete teachers and students
- **Auto Credential Generation**: Unique usernames (K4474 format) and 8-digit passwords
- **Email Integration**: Automatic credential delivery via Gmail SMTP
- **Subject Management**: 96+ subjects across 10 departments
- **Batch & Group Assignment**: Organize students by year and groups
- **Mentor Assignment**: Assign teachers as mentors to student groups
- **Data Export**: Download Excel reports with professional formatting

### 👨‍🏫 Teacher Portal
- **Lecture Management**: Start/end lecture sessions with subject selection
- **AI Attendance Marking**: Real-time facial recognition (DeepFace + FaceNet)
- **Manual Attendance**: Mark/edit attendance manually
- **Bulk Upload**: CSV import for attendance records
- **Medical Leave Approval**: Review and approve/reject ML requests with PDF proof
- **Reports & Analytics**: Generate Excel reports with attendance statistics
- **Dashboard**: View assigned subjects, lectures, and student lists

### 🎓 Student Portal
- **Face Enrollment**: Multi-image registration with duplicate detection
- **AI-Powered Check-in**: Automatic attendance via facial recognition
- **Medical Leave Requests**: Submit ML with PDF proof upload
- **Attendance History**: View personal attendance records
- **Real-time Feedback**: Instant recognition results with confidence scores

---

## 🤖 AI/ML Components

### Facial Recognition System
- **Model**: FaceNet (Google's deep neural network)
- **Library**: DeepFace 0.0.95
- **Face Detection**: MTCNN, OpenCV backends
- **Embedding**: 128-dimensional face vectors
- **Matching Algorithm**: Euclidean distance with threshold-based classification
- **Accuracy Enhancement**: CLAHE preprocessing, multi-backend fallback

### Key AI Features
- **Duplicate Detection**: Strict threshold (8.0) prevents duplicate enrollments
- **Attendance Matching**: Tolerant threshold (15.0) for real-world conditions
- **Image Preprocessing**: Automatic contrast enhancement and face detection
- **Multi-face Support**: Handles multiple images per student for better accuracy

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0+ (Python)
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: Flask-JWT-Extended (24-hour tokens)
- **AI/ML**: DeepFace, TensorFlow, OpenCV, NumPy
- **Email**: SMTP (Gmail)
- **Password Security**: SHA256 hashing

### Frontend
- **Framework**: React 19.1 + Vite
- **Styling**: Custom CSS with responsive design
- **State Management**: React Hooks
- **API Communication**: Axios
- **File Handling**: Base64 encoding, Excel export

### Database Collections
1. **users** - Admin authentication
2. **teachers** - Teacher profiles with credentials
3. **students** - Student profiles with face embeddings
4. **subjects** - Subject catalog (10 departments)
5. **lectures** - Lecture sessions
6. **attendance** - Attendance records (AI + manual)
7. **teacher_assignments** - Subject-semester mappings
8. **mentor_assignments** - Batch-group mentor links
9. **medical_leaves** - ML requests with approval workflow

---

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account
- Gmail account (for email features)

### Backend Setup
```bash
cd FED_Project_New

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit app.py)
# - Update MONGO_URI with your MongoDB connection string
# - Update email credentials (sender_email, sender_password)

# Run backend
python app.py
```

Backend runs on: `http://localhost:5001`

### Frontend Setup
```bash
cd FED_Project_New

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 Default Credentials

### Admin Login
- **Email**: `admin@faceattend.com`
- **Password**: `admin123`

### Teacher Login
- Generated automatically (e.g., K4474)
- Sent via email after admin adds teacher

### Student Login
- Generated automatically (e.g., K47117)
- Sent via email after admin adds student

---

## 📚 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/teacher/login` - Teacher login
- `POST /api/login` - General user login

### Admin Routes
- `POST /api/admin/add-teacher` - Add new teacher
- `POST /api/admin/add-student` - Add new student
- `GET /api/admin/teachers` - List all teachers
- `PUT /api/admin/teachers/:id` - Update teacher
- `DELETE /api/admin/teachers/:id` - Delete teacher
- `POST /api/admin/assign-subjects` - Assign subjects to teacher
- `POST /api/admin/initialize-subjects` - Initialize subject database

### Lecture Management
- `POST /api/set-lecture` - Start lecture session
- `POST /api/end-lecture` - End lecture session
- `GET /api/current-lecture` - Get active lecture
- `GET /api/lectures` - List all lectures

### Attendance
- `POST /api/mark-attendance` - AI-powered attendance (face recognition)
- `POST /api/mark-attendance-manual` - Manual attendance marking
- `POST /api/bulk-attendance` - Bulk upload via CSV
- `GET /api/attendance-records` - Fetch attendance records

### Medical Leave
- `POST /api/medical-leave/request` - Submit ML request
- `GET /api/medical-leave/mentor/pending` - Get pending requests (mentor)
- `PUT /api/medical-leave/:id/approve` - Approve ML request
- `PUT /api/medical-leave/:id/reject` - Reject ML request

---

## 🎯 Usage Guide

### For Admins
1. Login with admin credentials
2. Navigate to **Admin Dashboard**
3. Add teachers/students → Credentials auto-generated and emailed
4. Assign subjects to teachers by department
5. Assign mentors to student batches/groups
6. Export data as Excel reports

### For Teachers
1. Login with provided credentials
2. Start a lecture (select subject, batch, group)
3. Students mark attendance via face recognition
4. Manually mark/edit attendance if needed
5. Approve medical leave requests (if mentor)
6. Generate attendance reports for your lectures

### For Students
1. Enroll face (upload 3-5 clear photos)
2. Attend lectures and scan face for attendance
3. Submit medical leave with PDF proof
4. View attendance history

---

## 🔧 Configuration

### Email Setup
Edit `app.py` (lines 130-132):
```python
sender_email = "your_email@gmail.com"
sender_password = "your_app_password"  # Use Gmail App Password
smtp_server = "smtp.gmail.com"
smtp_port = 587
```

### MongoDB Connection
Edit `app.py` (line 49):
```python
MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/attendance_system"
```

### AI Thresholds
Edit `app.py`:
- **Enrollment duplicate detection** (line 1760): `enrollment_threshold = 8.0`
- **Attendance matching** (line 1851): `threshold = 15`

---

## 📊 Database Schema

### Students Collection
```javascript
{
  name: String,
  rollNo: String (unique),
  email: String (unique),
  username: String,
  password_hash: String,
  department: String,
  course: String,
  batch: String,
  group: String,
  embeddings: [Array],  // Face embeddings
  images: [Array],      // Base64 images
  created_at: DateTime
}
```

### Attendance Collection
```javascript
{
  rollNo: String,
  name: String,
  status: String,  // "present" or "absent"
  lectureNumber: Number,
  date: String,
  subject: String,
  time: String,
  method: String,  // "ai" or "manual"
  confidence: Number  // AI confidence score
}
```