# 🚀 MediVaultAI – Smart Medical Report Management System

📢 **LinkedIn Post About This Project:**  
👉 [View the LinkedIn Announcement](https://www.linkedin.com/posts/aashir-siddiqui-88a676394_medivaultai-healthcareinnovation-ai-activity-7400170217194102784-TbUH?utm_source=share&utm_medium=member_desktop&rcm=ACoAAGDrLGoBeEuEu1gaDjIXZ9HNcEuQYxa-IYY)

MediVaultAI is a modern digital solution to a common healthcare problem:  
People forget to carry their medical reports during hospital visits, causing delays and repeated checkups.

This platform allows users to securely upload, store, analyze, download, and email medical reports with ease.

---

## ⭐ Features

### 🔐 Authentication & Security
- User registration with email verification
- OTP-based email verification
- Secure login with JWT
- Forgot-password with OTP
- Rate limiting + Helmet for security
- Password hashing using Bcrypt

### 👨‍👩‍👧 Family Member Management
- Add unlimited family members
- Maintain individual medical records

### 📄 Medical Report Upload
- Upload image reports
- Cloud storage via Cloudinary
- OCR text extraction using Tesseract.js

### 🤖 AI-Powered Report Analysis
- Uses Gemini API to generate:
  - Intelligent health summary
  - Key findings
  - Simple language interpretation
  - Important recommendations

### 📥 PDF Generation
- Export analyzed reports as clean, formatted PDF using Puppeteer

### 📧 Email Integration
- Send analyzed PDF report directly to email using Nodemailer

### 🎨 Modern Frontend UI
- React + Vite
- Redux Toolkit for state management
- Tailwind CSS
- Smooth animations using Framer Motion

---

## 🛠️ Tech Stack

**Frontend:** React.js, Redux Toolkit, Tailwind CSS, Lucide Icons, React Router DOM, Framer Motion, Axios, Vite  
**Backend:** Node.js, Express.js, MongoDB & Mongoose, JWT, Zod, Nodemailer, Multer, Cloudinary, Puppeteer, Helmet, Rate Limiting, Tesseract.js, Gemini API  

---

## 📂 Project Structure

```plaintext
MediVaultAI/
│
├── client/                         # Frontend (React + Vite)
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/                    # Axios API services
│   │   ├── assets/                 # Images, icons, static files
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # App pages (Dashboard, Login, etc.)
│   │   ├── store/                  # Redux Toolkit slices & store
│   │   └── utils/                  # Helper functions
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── server/                         # Backend (Node + Express)
    ├── config/                     # DB connection, Cloudinary, env setup
    ├── controllers/                # Controller logic (auth, reports, users)
    ├── middleware/                 # Auth, error handling, rate limit, etc.
    ├── models/                     # Mongoose models (User, Family, Report)
    ├── routes/                     # API routes
    ├── services/                   # Extra services (email, puppeteer, OCR, AI)
    ├── templates/                  # Email templates (HTML)
    ├── validators/                 # Zod schemas for validation
    ├── eng.traineddata             # Tesseract OCR trained model
    ├── .env                        # Environment variables
    ├── index.js                     # Server entry point
    ├── package.json
    └── .gitignore

🚀 Installation & Setup

git clone https://github.com/Aashir-Siddiqui/MediVaultAI.git
cd MediVaultAI

cd server
npm install

Environment Variables
Create a .env file in server/:

# Database
MONGO_URL=
PORT=
NODE_ENV=

# Authentication
JWT_SECRET=
SALT_ROUNDS=
SESSION_SECRET=
SESSION_LIFETIME=
COOKIE_NAME=
COOKIE_EXPIRES=

# Client URL
CLIENT_URL=

# SMTP / Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Upload Limits
MAX_FILE_SIZE=10485760  # 10MB in bytes

# AI API
GEMINI_API_KEY=

Start Backend
npm start

Frontend Setup
cd client
npm install
npm run dev

📡 API Endpoints
Method	Endpoint	Description
POST	/auth/register	Register new user
POST	/auth/verify	Verify email using OTP
POST	/auth/login	Login
POST	/auth/forgot	Send password reset OTP
POST	/auth/reset	Reset password
POST	/report/upload	Upload medical report
POST	/report/analyze	Analyze report using Gemini
GET	/report/download/:id	Download analyzed PDF
POST	/report/email/:id	Email the analyzed report

🧭 Future Enhancements
AI-based disease risk prediction

🤝 Contributing
Feel free to submit issues or pull requests.