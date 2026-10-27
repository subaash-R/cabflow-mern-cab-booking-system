# 🚖 CabFlow - Modern MERN Stack Cab Booking System

A full-stack, enterprise-grade **Cab Booking & Dispatch Platform** built with **MongoDB, Express.js, React (Vite), and Node.js**, styled with modern CSS, glassmorphic UI components, and real-time interactive mapping.

---

## 🌟 Key Features

### 👤 1. Passenger Booking & Live Ride Tracking
- **Interactive OpenStreetMap & Leaflet**: Visual pickup marker (green), destination marker (red), route polyline, and real-time animated driver movement.
- **5 Vehicle Categories**:
  - 🛺 **Auto / E-Rickshaw**: Budget friendly & agile
  - 🚗 **CabFlow Mini**: Reliable everyday hatchback
  - 🚘 **Comfort Sedan**: Spacious premium ride
  - 🚙 **Prime SUV**: 6-passenger vehicle with large luggage capacity
  - ✨ **Executive Luxury**: Top-rated VIP chauffeurs
- **Transparent Upfront Fare Estimator**: Dynamic calculation based on distance, estimated duration, base fare, per-km rate, taxes, and surge multiplier.
- **Promo Codes & Coupons**: Validates promotional codes (`FIRST50`, `CABFLOW20`, `AIRPORT10`) and computes discounts instantly.
- **Flexible Scheduling**: Book immediate pickup or schedule for future dates.
- **Multi-Payment Support**: Credit/Debit Cards, Cash, Digital Wallet, UPI.
- **Secure 4-Digit Ride OTP**: Shared between passenger and driver to verify trip commencement.
- **Trip Invoice & Receipts**: Itemized fare receipts with print/download capability.
- **Interactive Rating & Reviews**: 1-5 star ratings with feedback compliment chips.

### 🛞 2. Driver Partner Portal
- **Online / Offline Availability Toggle**: Instant status toggle to start or stop receiving trip requests.
- **Live Ride Dispatch Radar**: Incoming trip alerts with pickup/drop locations, estimated payout, and accept/decline actions.
- **Trip Workflow Progression**:
  1. Driver Accepts Trip
  2. Driver marks "Arrived at Pickup"
  3. Driver verifies Passenger 4-Digit OTP to start trip
  4. Driver marks "Complete Trip" and collects payment
- **Driver Earnings & Stats**: Today's earnings, total lifetime earnings, completed trip counter, and driver rating.

### 🛡️ 3. Admin Operations Center
- **Live Platform Metrics**: Gross platform GMV, total completed trips, active drivers, and registered customers.
- **Fleet Management**: Real-time status of all drivers, vehicle models, categories, license plate numbers, and ratings.
- **System Bookings Log**: Full table of all rides with status filters and trip details.

### ⚡ 4. 1-Click Instant Demo Access
No need to fill out registration forms to test the application! Click any of the top banner demo buttons:
- **👤 Demo Passenger** (`passenger@cabflow.com` / `pass123`)
- **🛞 Demo Driver** (`driver@cabflow.com` / `driver123`)
- **🛡️ Demo Admin** (`admin@cabflow.com` / `admin123`)

---

## 📁 Project Structure

```
CAB BOOKING SYSTEM - PROJECT/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection with zero-config memory fallback
│   │   ├── controllers/     # Auth, Cab, Ride, Driver, Admin controllers
│   │   ├── middleware/      # JWT protection & role authorization
│   │   ├── models/          # Mongoose models: User, Driver, Ride, Coupon
│   │   ├── routes/          # Express API endpoints
│   │   ├── utils/           # Fare calculator, distance matrix, database seeders
│   │   └── server.js        # Express app entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/              # Icons & static assets
│   ├── src/
│   │   ├── components/      # Navbar, InteractiveMap, BookingWidget,
│   │   │                    # VehicleSelector, FareBreakdown, ActiveRideTracker,
│   │   │                    # RideReceiptModal, RatingModal
│   │   ├── context/         # AuthContext & RideContext
│   │   ├── pages/           # HomePage, MyRidesPage, DriverDashboardPage,
│   │   │                    # AdminDashboardPage, LoginPage
│   │   ├── services/        # Frontend API client
│   │   ├── index.css        # Modern glassmorphism & responsive design system
│   │   ├── App.jsx          # Main application layout & tab navigation
│   │   └── main.jsx         # React DOM root
│   ├── index.html
│   ├── vite.config.js       # Vite config with API proxy
│   └── package.json
│
├── package.json             # Root runner script (runs client & server together)
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local MongoDB on port 27017 or MongoDB Atlas URI).
  > *Note: If MongoDB is not running locally, the backend automatically activates its built-in in-memory engine so all features work seamlessly out of the box!*

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install-all
```
*(Or navigate to `backend` and `frontend` separately and run `npm install`)*

### 2. Start Both Backend & Frontend Concurrently
From the root directory:
```bash
npm start
```

Or run them in separate terminal windows:
- **Backend API Server**:
  ```bash
  cd backend
  npm run dev
  ```
  *Runs on `http://localhost:5000`*

- **Frontend React Client**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Runs on `http://localhost:3000`*

---

## 📡 REST API Reference

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/health` | Server & DB health check | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login with email/password | No |
| `POST` | `/api/auth/demo-login` | 1-Click instant demo authentication | No |
| `GET` | `/api/auth/me` | Current authenticated user profile | Yes |
| `GET` | `/api/cabs/tiers` | Vehicle categories & fare rates | No |
| `GET` | `/api/cabs/locations` | Preset city landmarks & hotspots | No |
| `GET` | `/api/cabs/nearby` | Nearby active cabs with ETA | No |
| `POST` | `/api/rides/estimate` | Calculate fare breakdown & distance | No |
| `POST` | `/api/rides/coupon/verify` | Verify promo discount coupon | No |
| `POST` | `/api/rides/book` | Book a cab & assign driver | Yes |
| `GET` | `/api/rides/my-rides` | List user ride history | Yes |
| `GET` | `/api/rides/:id` | Full trip details & tracking status | Yes |
| `PATCH` | `/api/rides/:id/status`| Update trip status (accept, arrive, complete) | Yes |
| `POST` | `/api/rides/:id/rate` | Submit 1-5 star driver rating & review | Yes |
| `GET` | `/api/driver/profile` | Driver partner profile & earnings | Yes (Driver) |
| `PATCH` | `/api/driver/toggle-status`| Toggle online/offline status | Yes (Driver) |
| `GET` | `/api/driver/requests`| Radar incoming trip requests | Yes (Driver) |
| `POST` | `/api/driver/accept/:id`| Accept a ride request | Yes (Driver) |
| `GET` | `/api/admin/metrics` | Platform GMV, total trips, fleet stats | Yes (Admin) |
| `GET` | `/api/admin/rides` | All system bookings table | Yes (Admin) |
| `GET` | `/api/admin/drivers` | Complete fleet vehicle & driver roster | Yes (Admin) |

---

## ☁️ Production Deployment Guide

### Option 1: Free Tier Setup (Recommended: Render + Vercel)

#### 1. Database: MongoDB Atlas (Free M0 Cluster)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free **M0 Sandbox** cluster.
3. In **Database Access**, create a database user and copy the password.
4. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
5. In **Database** -> **Connect** -> **Drivers**, copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/cab_booking_db?retryWrites=true&w=majority
   ```

#### 2. Backend Deployment on Render
1. Create a new account at [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string (e.g. `jwt_secret_production_key_2026`)*
   - `FRONTEND_URL`: *Your Vercel frontend URL (e.g. `https://cabflow.vercel.app`)*
6. Click **Deploy Web Service** and note your backend URL (e.g., `https://cabflow-backend.onrender.com`).

#### 3. Frontend Deployment on Vercel
1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. Select **Framework Preset**: `Vite`.
3. Set **Root Directory**: `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://cabflow-backend.onrender.com/api` (your Render backend API URL)
5. Click **Deploy**. Vercel will build and assign your public HTTPS website URL!

---

## 🎨 UI & Design Highlights
- **Glassmorphic Theme**: Dark background (`#0b0f19`) with backdrop-filtered frosted glass cards, subtle neon borders, and accessible typography.
- **OpenStreetMap & Leaflet**: Custom markers for pickup points, dropoffs, moving cabs, and route polylines.
- **Interactive Animations**: Confetti explosions on ride completion, pulsating status indicators, and smooth card transitions.
