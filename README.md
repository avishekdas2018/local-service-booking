# ⚡ LocalPro — Local Services Booking Platform

A full-stack **MERN** (MongoDB, Express, React, Node.js) platform that connects customers with verified local service professionals and manages the complete job lifecycle — from booking to completion and review.

---

## 📋 Project Overview

LocalPro is a modern, role-based platform with three portals:

| Portal       | Purpose                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| **Customer** | Browse services, filter by city/area, book professionals, track status, reschedule/cancel, leave reviews       |
| **Provider** | Manage profile & availability, accept/reject bookings, update job status, add work notes & before/after photos |
| **Admin**    | Approve providers, CRUD service categories, moderate customer reviews                                          |

### Booking Lifecycle

```
Requested → Confirmed → In-Progress → Completed
    ↓           ↓
 Cancelled   Cancelled (only from Requested/Confirmed)
```

Customers can **reschedule** from `Requested` or `Confirmed` state.

---

## ✨ Features Implemented

### 🏠 Customer Side

- Browse services by category with icon grid
- Filter providers by **city**, **area**, **category**, and **price range**
- View provider profiles with ratings, bio, portfolio, and reviews
- Create booking with address, date/time, notes, and optional image upload
- **Pricing display** (hourly rate × estimated hours + GST) before confirmation
- Track booking status with a visual **status timeline**
- Reschedule or cancel bookings
- Submit star rating and written review for completed jobs

### 🔧 Service Provider Side

- Professional profile management (bio, categories, hourly rate, city/area, portfolio images)
- **Availability toggle** (online/offline)
- Kanban-style and list-view booking management
- Accept or reject incoming booking requests
- Update job status through the lifecycle
- Add **work notes** and upload **before/after images**
- View received reviews and ratings

### 🛡️ Admin Side

- Dashboard with platform-wide stats
- Approve or reject provider registrations
- Full CRUD management of service categories with icon picker
- Review moderation — show/hide customer reviews

### 🎨 UI & Design

- **Dark glassmorphism** design system with gradient accents
- Inter font from Google Fonts
- Responsive layout for all screen sizes
- Status badges with distinct color coding
- Smooth hover transitions and micro-animations
- Sidebar navigation for provider/admin dashboards

### 🔐 Auth & Security

- JWT-based authentication with role guard
- Password hashing with bcrypt
- Protected routes (role-based access control)
- Axios interceptor for automatic token injection and 401 redirect

---

## 🚀 Tech Stack

| Layer       | Technology                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| Frontend    | React 18, Vite, React Router v6, React Query, React Hot Toast, React Icons |
| Backend     | Node.js, Express 5, Mongoose (MongoDB ODM)                                 |
| Database    | MongoDB                                                                    |
| Auth        | JSON Web Tokens (JWT), bcryptjs                                            |
| File Upload | Multer (disk storage, 5MB limit, image-only)                               |
| Styling     | Vanilla CSS (custom design system)                                         |

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB** v6+ — [Install locally](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/local-services-booking-platform.git
cd local-services-booking-platform
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/local-services-booking
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

> For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string.

### 3. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 4. Seed the Database (Optional)

Populate the database with sample categories, users, providers, bookings, and reviews:

```bash
npm run seed
```

**Test Accounts created by seed:**

| Role                | Email                   | Password  |
| ------------------- | ----------------------- | --------- |
| Admin               | admin@localservices.com | admin1234 |
| Customer            | aarav@example.com       | pass1234  |
| Provider (Approved) | rajesh@example.com      | pass1234  |

### 5. Start the Application

```bash
# Terminal 1 — Start the backend (port 5000)
npm run dev

# Terminal 2 — Start the frontend (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
local-services-booking-platform/
├── config/              # Database connection
├── controllers/         # Route handlers (auth, admin, customer, provider)
├── middleware/           # JWT auth guard, Multer upload
├── models/              # Mongoose schemas (User, Booking, Review, etc.)
├── routes/              # Express route definitions
├── uploads/             # Uploaded images (auto-created)
├── server.js            # Express entry point
├── .env                 # Environment config
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios client with interceptors
    │   ├── components/  # Navbar, Sidebar
    │   ├── context/     # AuthContext (React Context)
    │   ├── pages/
    │   │   ├── auth/    # Login, Register
    │   │   ├── customer/# Home, Browse, ProviderDetail, Booking, MyBookings
    │   │   ├── provider/# Dashboard, Profile, Bookings (Kanban), JobDetail
    │   │   └── admin/   # Dashboard, ProviderApproval, Categories, Reviews
    │   ├── App.jsx      # Router with role-based protected routes
    │   ├── main.jsx     # Entry point
    │   └── index.css    # Design system
    ├── index.html
    └── vite.config.js   # Vite + dev proxy
```

---

## 🌐 Deployment Link

> 🔗 **Live Demo**: [https://local-service-booking-seven.vercel.app](https://local-service-booking-seven.vercel.app)

---
