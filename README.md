# Competency Assessment Platform — Backend

A **Node.js + Express + MongoDB** backend for a **multi-stage digital competency assessment platform**.  
It supports **authentication**, **content management**, **adaptive assessments**, **automated certification**, **secure exam features**, **video proctoring**, and **role-based dashboards**.

---
## Base URL

- **Live:** [https://competency-assessment-platform.onrender.com/api/v1](https://competency-assessment-platform.onrender.com/api/v1)  
- **Local:** http://localhost:5007/api/v1

##  Features

### Core
- **Authentication & User Management**
  - OTP-based registration, email verification
  - Login, refresh token, logout
  - Forgot/reset/change password
  - Role-based access: `STUDENT` (default), `ADMIN`, `SUPERVISOR`
  - JWT Access & Refresh tokens
  - Profile updates & file uploads
  - Assessment progress tracking per user

- **Competencies**
  - CRUD with unique human-readable `code`
  - Pagination, search, and active/inactive filtering
  - Bulk upload via CSV or JSON

- **Questions**
  - CRUD with competency & level filters
  - Per-question `timeLimitSec` (default: 60s)
  - Bulk upload (CSV/JSON)
  - Stats by level
  - Correct answers hidden in API responses

- **3-Step Adaptive Assessment Engine**
  - Step progression: A1/A2 → B1/B2 → C1/C2
  - Timer per question & step (server-enforced)
  - Lockout rules on low scores
  - Automatic certificate issuance on completion
  - One active session per user

- **Certificates**
  - Auto-generated after final step
  - Public verification via UID
  - PDF storage & download
  - Email notification with verification link

- **Admin Dashboard**
  - User signups timeseries
  - Question statistics
  - Session overviews with filters
  - Level & competency-based analytics

- **Supervisor Console**
  - Monitor active assessment sessions
  - View current step details
  - Force-submit ongoing steps (emergency)

- **Secure Exam & Proctoring**
  - **SEB Guard** — Requires SafeExamBrowser or exam key
  - **Video Proctoring** — Chunked video uploads to Cloudinary

---

## 🛠 Tech Stack

| Layer       | Technology |
|-------------|------------|
| Runtime     | Node.js (ES Modules) |
| Framework   | Express.js |
| Database    | MongoDB + Mongoose |
| Auth        | JWT (Access & Refresh) |
| Email       | Nodemailer |
| Storage     | Cloudinary |
| Validation  | Custom middlewares, sanitization |
| Other       | Multer, CSV/JSON parsing, rate limiting |

---

## 📂 Project Structure

```
src/
├── app.js
├── core/
│   ├── app/appRouter.js
│   ├── config/ (logger, config, env)
│   ├── middlewares/ (auth, error, multer, SEB guard, proctor upload)
├── entities/
│   ├── auth/
│   ├── user/
│   ├── competency/
│   ├── question/
│   ├── assessments/
│   ├── certificates/
│   ├── admin/dashboard/
│   ├── supervisor/
├── lib/ (Cloudinary, email, response formatter)
├── utils/ (JSON, CSV, bulk upload helpers)
```

---

## 📑 Core Models

### User
- `name`, `email`, `password`, `role` (`STUDENT|ADMIN|SUPERVISOR`), `isVerified`
- `assessmentStatus`: `{ status, finalLevel, certificateId }`
- `refreshToken`

### Competency
- `name`, `description`, `code` (unique), `isActive`

### Question
- `competencyId` / `competencyCode`
- `level` (A1–C2), `text`, `options[{ key, label }]`
- `correctOptionKey`, `timeLimitSec`, `isActive`

### TestSession
- `userId`, `status`, `currentStepEndsAt`
- `steps[]`: `{ stepNumber, levelPair, questions, answers, scorePercent, awardedLevel, canProceed, startedAt, submittedAt, stepDurationSec, totalQuestionsInStep }`
- `finalCertificationLevel`

### Certificate
- `userId`, `testSessionId`, `level`, `certificateUID`, `pdfUrl`, `issuedAt`

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| **Server & DB** |
| `MONGO_URI` | MongoDB connection URI |
| `PORT` | Server port |
| `NODE_ENV` | Environment (development/production) |
| **JWT** |
| `ACCESS_TOKEN_SECRET` | Secret for access token |
| `ACCESS_TOKEN_EXPIRES` | Expiry time for access token |
| `REFRESH_TOKEN_SECRET` | Secret for refresh token |
| `REFRESH_TOKEN_EXPIRES` | Expiry time for refresh token |
| **Email** |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_ADDRESS`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP configuration |
| **Cloudinary** |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| **Public URL** |
| `PUBLIC_BASE_URL` | Public server origin |
| **Secure Exam Browser** |
| `SEB_ENFORCED` | `true`/`false` |
| `SEB_EXAM_KEY` | Exam key string |

---

## 🖥 Setup & Installation

```bash
# Install dependencies
npm install

# Create .env file and configure variables

# Run in development
npm run dev

# Run in production
npm start
```

**Deploying to Render**
- Root Directory: `server` (if applicable)
- Build Command: `npm install`
- Start Command: `npm start`

---

## 📌 API Documentation

**Postman Collections**  
- [General API Docs](https://documenter.getpostman.com/view/36748794/2sB3BEnA2Y#1e9f579a-651a-4ec6-8173-7f19c1d19f56)  
- In repo: `postman/` folder

---

## 🧮 Assessment Logic

### Step Timer
- `timeLimitSec` per question (default: 60s)
- Step time = sum of all question limits
- Server-enforced; submissions allowed after expiry

### Scoring
| Step | Score <25% | 25–49.99% | 50–74.99% | ≥75% |
|------|------------|-----------|-----------|------|
| **1** | Fail (no retake) | A1 | A2 | A2 + proceed |
| **2** | A2 | B1 | B2 | B2 + proceed |
| **3** | B2 | C1 | C2 |

---

## 🔒 Security
- Role-based JWT authentication
- Rate limiting & input sanitization
- One active session per user
- SEB Guard for secure exam sessions
- Cloud storage for proctoring videos

---

## 👤 Test Credentials

### Admin
```
email: shahariarronok41@gmail.com
password: pass123
```

### Supervisor
```
email: 2031361@iub.edu.bd
password: pass123
```

---

## 📄 License
This project is proprietary and intended for authorized educational or corporate use only.

---


---

## 🔧 Quick Start (Backend)

```bash
# Clone the repository
git clone https://github.com/ronok420/Competency-Assessment-Platform.git

# Navigate to backend folder
cd Competency-Assessment-Platform

# Install dependencies
npm install

# Run in development mode
npm run dev
```
