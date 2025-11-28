# 🚀 MediVaultAI – Smart Medical Report Management System

📢 **LinkedIn Post About This Project:**  
👉 [View the LinkedIn Announcement](YOUR_LINKEDIN_POST_URL)

MediVaultAI is a modern digital solution designed to solve a very common healthcare problem:
People forget to carry their medical reports when visiting hospitals, resulting in delays and repeated visits.

This platform allows users to securely upload, store, analyze, download, and email medical reports with ease.

⭐ Features
🔐 Authentication & Security

User registration with email verification

OTP-based email verification

Secure login with JWT

Forgot-password with OTP

Rate limiting + Helmet for security

Password hashing using Bcrypt

👨‍👩‍👧 Family Member Management

Add unlimited family members

Maintain individual medical records

📄 Medical Report Upload

Upload PDF and image reports

Cloud storage via Cloudinary

OCR text extraction using Tesseract.js

🤖 AI-Powered Report Analysis

Uses Gemini API to generate:

Intelligent health summary

Key findings

Simple language interpretation

Important recommendations

📥 PDF Generation

Export analyzed reports as clean, formatted PDF

Generated using Puppeteer

📧 Email Integration

Send analyzed PDF report directly to the user’s email

Powered by Nodemailer

🎨 Modern Frontend UI

Built with React + Vite

Redux Toolkit state management

Tailwind CSS for fast, responsive design

Smooth animations using Framer Motion

🛠️ Tech Stack
Frontend

React.js

Redux Toolkit

Tailwind CSS

Lucide Icons

React Router DOM

Framer Motion

Axios

Vite

Backend

Node.js

Express.js

MongoDB & Mongoose

JWT Authentication

Zod Validation

Nodemailer

Multer

Cloudinary

Puppeteer

Helmet

Rate Limiting

Tesseract.js (OCR)

Gemini API

MediVaultAI/
│
├── client/                         # Frontend (React + Vite)
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/                    # Axios API services
│   │   ├── assets/                 # Images, icons, static files
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Application pages (Dashboard, Login, etc.)
│   │   ├── store/                  # Redux Toolkit slices & store
│   │   └── utils/                  # Helper functions
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
└── server/                         # Backend (Node + Express)
    ├── config/                     # DB connection, cloudinary, environment setup
    ├── controllers/                # All controller logic (auth, reports, users)
    ├── middleware/                 # Auth, error handling, rate limit, etc.
    ├── models/                     # Mongoose models (User, Family, Report)
    ├── public/                     # Public static files (if any)
    ├── routes/                     # API routes
    ├── services/                   # Extra services (email, puppeteer, OCR, AI)
    ├── templates/                  # Email templates (HTML)
    ├── validators/                 # Zod schemas for validation
    │
    ├── eng.traineddata             # Tesseract OCR trained model
    ├── .env
    ├── index.js                    # Server entry point
    ├── package.json
    ├── package-lock.json
    └── .gitignore


🚀 Installation & Setup
Clone the Repository
git clone <https://github.com/Aashir-Siddiqui/MediVaultAI.git>
cd MediVaultAI

🔧 Backend Setup
cd server
npm install


# -----------------------------------------
# 🔗 Database & Server Configuration
# -----------------------------------------
MONGO_URL=
PORT=
NODE_ENV=

# -----------------------------------------
# 🔐 Authentication & Security
# -----------------------------------------
JWT_SECRET=
SALT_ROUNDS=
SESSION_SECRET=
SESSION_LIFETIME=
COOKIE_NAME=
COOKIE_EXPIRES=

# -----------------------------------------
# 🌐 Client URL
# -----------------------------------------
CLIENT_URL=

# -----------------------------------------
# 📧 Email / SMTP Configuration
# -----------------------------------------
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=

# -----------------------------------------
# ☁️ Cloudinary Configuration (Image/File Storage)
# -----------------------------------------
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# -----------------------------------------
# 📁 File Upload Limits
# 10MB in bytes = 10 * 1024 * 1024
# -----------------------------------------
MAX_FILE_SIZE=

# -----------------------------------------
# 🤖 Gemini AI API Key
# -----------------------------------------
GEMINI_API_KEY=



Start backend:

npm start

🎨 Frontend Setup
cd client
npm install
npm run dev

📡 API Endpoints Overview
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