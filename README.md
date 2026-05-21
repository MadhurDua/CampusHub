<div align="center">

# 🎓 CampusHub

### A Modern Campus Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-brightgreen.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)

[Features](#-features) • [Getting Started](#-getting-started) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**CampusHub** is a comprehensive, full-stack campus management system designed to streamline academic and extracurricular activities for modern educational institutions. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), it provides a unified platform for students, faculty, and administrators to collaborate and manage campus life efficiently.

### ✨ Why CampusHub?

- 🔐 **Secure & Scalable** - Enterprise-grade security with JWT authentication
- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark/light themes
- 🚀 **Performance First** - Optimized for speed and efficiency
- 📱 **Mobile Friendly** - Works seamlessly across all devices
- 🔄 **Real-time Updates** - Stay connected with instant notifications

---

## 🚀 Features

### 👥 User Management
- ✅ Secure JWT authentication with refresh tokens
- ✅ Role-based access control (Student, Faculty, College Admin)
- ✅ User profile management with avatars
- ✅ Password reset and email verification
- ✅ Session management and security

### 🏫 Academic Tools
- 📚 Course management and enrollment
- 📝 Assignment creation and submissions
- 📅 Academic calendar with events
- 📊 Grade tracking and analytics
- 🎓 Student performance dashboard

### 🎯 Campus Life
- 🏛️ **Clubs & Organizations** - Create, join, and manage campus clubs
- 🎉 **Events** - Plan and register for campus events
- 🔍 **Lost & Found** - Report and track lost items
- 🛒 **Marketplace** - Buy, sell, and share items within campus
- 📖 **Resources** - Share and access academic resources
- 📰 **Feed** - Campus-wide social feed and announcements

### 🛠️ Technical Highlights
- **Frontend**: React 19, React Router, Axios, TailwindCSS, Vite
- **Backend**: Node.js, Express.js, Mongoose ODM
- **Database**: MongoDB with optimized indexing
- **Authentication**: JWT with bcrypt hashing
- **Security**: Helmet, CORS, Rate Limiting, Input Validation
- **File Uploads**: Multer with file type validation
- **State Management**: React Context API

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/HARSHARORA2812/CampusHub.git
cd CampusHub
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campushub
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads/
```

```bash
# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**

```env
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
REACT_APP_NAME=CampusHub
REACT_APP_VERSION=1.0.0
```

```bash
# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📁 Project Structure

```
CampusHub/
│
├── backend/                 # Backend API (Node.js/Express)
│   ├── config/             # Configuration files
│   │   └── db.js          # MongoDB connection
│   ├── controllers/        # Request handlers
│   │   ├── auth.js
│   │   ├── clubs.js
│   │   ├── events.js
│   │   └── ...
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js        # Authentication middleware
│   │   └── upload.js      # File upload middleware
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Club.js
│   │   ├── Event.js
│   │   └── ...
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── clubs.js
│   │   └── ...
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/               # Frontend App (React)
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, icons
│   │   ├── components/    # Reusable components
│   │   │   ├── cards/
│   │   │   ├── layout/
│   │   │   ├── modals/
│   │   │   └── ui/
│   │   ├── contexts/      # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── ClubsPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   └── ...
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── .env.example       # Environment variables template
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| PUT | `/auth/update` | Update user profile | ✅ |

### Clubs Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/clubs` | Get all clubs | ❌ |
| POST | `/clubs` | Create new club | ✅ (Faculty/Admin) |
| GET | `/clubs/:id` | Get club by ID | ❌ |
| PUT | `/clubs/:id` | Update club | ✅ (Owner/Admin) |
| DELETE | `/clubs/:id` | Delete club | ✅ (Owner/Admin) |
| POST | `/clubs/:id/join` | Join club | ✅ |

### Events Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/events` | Get all events | ❌ |
| POST | `/events` | Create event | ✅ |
| GET | `/events/:id` | Get event by ID | ❌ |
| POST | `/events/:id/register` | Register for event | ✅ |

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/campushub

# JWT Configuration
JWT_SECRET=your_secret_key_min_32_characters
JWT_EXPIRE=30d

# Security
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=uploads/
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# App Configuration
NODE_ENV=development
REACT_APP_NAME=CampusHub
REACT_APP_VERSION=1.0.0
```

---

## 🧪 Available Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Harsh Arora**

- GitHub: [@HARSHARORA2812](https://github.com/HARSHARORA2812)
- Repository: [CampusHub](https://github.com/HARSHARORA2812/CampusHub)

---

## 🙏 Acknowledgments

- Built with ❤️ using the MERN Stack
- UI Components inspired by modern design principles
- Icons from Lucide React
- Special thanks to the open-source community

---

## 📧 Support

If you have any questions or need help, please:

- 📫 Open an [issue](https://github.com/HARSHARORA2812/CampusHub/issues)
- 💬 Start a [discussion](https://github.com/HARSHARORA2812/CampusHub/discussions)

---

<div align="center">

Made with ❤️ by Harsh Arora

⭐ Star this repository if you find it helpful!

</div>
