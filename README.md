<div align="center">

<br/>

# 🎯 NutriGain

### *Track Your Macros. Dominate Your Goals.*

**A full-stack fitness tracking hub for athletes who take their nutrition and lifting seriously — monitor calories, log gym sessions, and visualize consistency through a premium, data-driven interface.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock)](https://gsap.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3-FF6384?style=for-the-badge&logo=chartdotjs)](https://recharts.org/)

<br/>

</div>

---

## 📖 What Is NutriGain?

Most fitness apps either track food *or* training — NutriGain does both, and does them beautifully. Designed for athletes who obsess over the details, **NutriGain** is a precision-first fitness tracking platform built to eliminate guesswork from your diet and training.

Instead of scattered spreadsheets and basic calorie counters, NutriGain gives you a unified, data-rich dashboard where you can:

- **Hit your macros** — track calories, protein, carbs, and fats in real time with a curated meal database
- **Log your lifts** — record personal records and working weights, organized by muscle group and exercise type
- **Stay consistent** — a GitHub-style gym activity heatmap makes your habits impossible to ignore
- **See progress** — visualize body weight trends over time with interactive charts
- **Stay accountable** — a day-level daily log ties nutrition and gym sessions together in one place

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Macro Tracking** | Real-time calorie, protein, carb, and fat monitoring with visual progress meters |
| 🍽️ **Meal Database** | Searchable database of meals with macro breakdowns per serving |
| 🏋️ **Gym Log & PR Tracking** | Log personal records and working weights categorized by muscle group |
| 📆 **Weekly Workout Schedules** | Define which muscle groups to train on which days of the week |
| 🔥 **Activity Heatmap** | GitHub-style heatmap to visualize gym consistency across the calendar year |
| 📊 **Weight Progression Charts** | Interactive Recharts graphs to track body weight trends over time |
| 📅 **Daily Log** | Unified per-day log linking meals (breakfast, lunch, dinner) with gym status |
| 🔒 **Secure Auth** | Passwords hashed with `bcryptjs`, JWT sessions in `httpOnly` cookies, route guards via a Next.js proxy, login rate limiting, and server-side input validation |
| 📱 **Fully Responsive** | Fluid layout with a polished mobile experience |
| 🛡️ **Admin Panel** | Manage the global meal and exercise database from a dedicated admin interface |

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — App Router, file-based routing, route guards via the proxy convention
- **[React 19](https://react.dev/)** — UI library with hooks and context
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling with dark, premium aesthetics
- **[GSAP 3](https://gsap.com/)** — High-performance animations (hero reveals, scroll triggers, cursor glow)
- **[Lenis](https://lenis.studiofreight.com/)** — Buttery smooth scrolling across the entire app
- **[Recharts 3](https://recharts.org/)** — Composable data visualization for weight charts
- **[react-activity-calendar](https://www.npmjs.com/package/react-activity-calendar)** — GitHub-style gym heatmap
- **[react-tooltip](https://www.npmjs.com/package/react-tooltip)** — Contextual tooltips for heatmap cells
- **[date-fns](https://date-fns.org/)** — Lightweight date utility library

### Backend & Database
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** — Serverless REST API endpoints
- **[MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/)** — NoSQL database with schema validation
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** — Password hashing
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** — JWT-based session management (verified at the edge with `jose`)

### Dev Tools
- **ESLint** — Code linting with Next.js config
- **PostCSS** — CSS processing pipeline
- **pnpm** — Fast, disk-efficient package management

---

## 🗂️ Project Structure

```
NutriGain/
├── app/
│   ├── api/
│   │   ├── auth/               # POST login/register, GET me, PUT me, POST logout
│   │   ├── daily-log/          # GET/POST/PATCH daily log, PUT/DELETE meal entries
│   │   ├── exercises/          # GET exercise library, PUT/DELETE per-user PR data
│   │   ├── meals/              # GET meal database (admin CRUD)
│   │   ├── settings/           # GET/PUT global meal schedule (admin)
│   │   ├── users/              # GET all users & details (admin)
│   │   ├── weight/             # GET/POST/PUT/DELETE body weight entries
│   │   └── workout-schedule/   # GET weekly schedule, PUT single day (admin)
│   ├── admin/                  # Admin panel — manage meals, exercises, users
│   ├── dashboard/
│   │   ├── gym/                # Gym tracking: PRs, heatmap, workout log
│   │   ├── meal/               # Meal logging: search, add, daily macros
│   │   └── profile/            # Profile: preferences & settings
│   ├── login/                  # Login page
│   ├── register/               # Sign-up page
│   ├── globals.css             # Global design tokens & base styles
│   ├── layout.js               # Root layout with fonts & providers
│   └── page.js                 # Landing page with GSAP scroll animations
├── components/
│   ├── LenisProvider.js        # Global smooth-scroll provider
│   └── Loader.js               # Full-screen loading state
├── context/
│   ├── AuthContext.js          # Global auth state via React context
│   └── UserSettingsContext.js  # Smooth-scroll & UI preferences
├── lib/
│   ├── auth.js                 # JWT sign/verify, cookie options, auth helpers
│   ├── mongodb.js              # Mongoose connection singleton
│   ├── rate-limit.js           # Login rate limiting
│   └── validation.js           # Server-side input validation helpers
├── models/                     # Mongoose schemas (User, Meal, DailyLog, ...)
├── proxy.js                    # Route guard for protected pages & APIs
├── scripts/
│   └── seed-admin.js           # Manual admin seeding (pnpm run seed)
├── public/                     # Icons & web manifest
├── .env.local.example          # Environment variable template
└── package.json
```

---

## 🌐 Application Flow

```
1. Landing Page (/)
   └── GSAP-animated hero with scroll sections
       ├── "Get Started Free" → /register
       └── "Login" → /login

2. Auth (/login, /register)
   ├── Register: POST /api/auth/register → creates User, sets JWT cookie
   └── Login:    POST /api/auth/login    → validates credentials (rate limited), sets JWT cookie

3. Dashboard (/dashboard)
   ├── Overview of today's macros, gym status, and streaks
   ├── Quick-navigate to Meal or Gym sub-dashboards
   └── Date navigation for past logs

4. Meal Dashboard (/dashboard/meal)
   ├── Search the meal database → add entries at breakfast, lunch, or dinner
   ├── Real-time macro countdown meters (calories, protein, carbs, fats)
   └── Daily log backed by GET/POST /api/daily-log

5. Gym Dashboard (/dashboard/gym)
   ├── Log today's exercises: select muscle group → exercise → sets/reps/weight
   ├── View personal records (PRs) per exercise
   ├── Activity heatmap showing gym sessions over the past year
   ├── Body weight chart via Recharts (GET /api/weight)
   └── Mark workout as completed → updates gymStatus in DailyLog

6. Admin Panel (/admin)
   ├── Manage the global meal database (add, edit, delete meals)
   ├── Manage the exercise library (add, edit, delete exercises)
   ├── Edit the weekly workout schedule and global meal schedule
   └── View registered users and their stats

7. Sign Out
   └── POST /api/auth/logout → clears JWT cookie → redirect to /
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **pnpm** (`npm install -g pnpm` or see [pnpm.io/installation](https://pnpm.io/installation))
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nutrigain.git
cd nutrigain
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root (see `.env.local.example` for reference):

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nutrigain?retryWrites=true&w=majority

# JWT secret — required, at least 32 characters
# Generate one with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-here

# Node environment
NODE_ENV=development
```

> ⚠️ **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

### 4. Run the development server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Seed the admin account

Create (or promote) an admin account with the seed script:

```bash
pnpm run seed
```

Defaults come from optional env overrides — set these before running to customize:

```env
SEED_ADMIN_EMAIL=you@example.com
SEED_ADMIN_NAME=Your Name
SEED_ADMIN_PASSWORD=choose-a-strong-password
```

Then access the admin panel at `/admin`.

### 6. Build for production

```bash
pnpm run build
pnpm run start
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Open a Pull Request

---

<div align="center">

Made with ❤️ and lots of ☕

*© 2026 NutriGain. Built for athletes.*

</div>
