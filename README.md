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
| 🍽️ **Meal Database** | Searchable database of meals with accurate macro breakdowns per 100g |
| 🏋️ **Gym Log & PR Tracking** | Log personal records and working weights categorized by muscle group |
| 📆 **Weekly Workout Schedules** | Define which muscle groups to train on which days of the week |
| 🔥 **Activity Heatmap** | GitHub-style heatmap to visualize gym consistency across the calendar year |
| 📊 **Weight Progression Charts** | Interactive Recharts graphs to track body weight trends over time |
| 📅 **Daily Log** | Unified per-day log linking meals (breakfast, lunch, dinner) with gym status |
| 🔒 **Secure Auth** | Passwords hashed with `bcryptjs`, sessions managed via JWT in `httpOnly` cookies |
| 📱 **Fully Responsive** | Fluid layout with a polished mobile experience |
| 🛡️ **Admin Panel** | Manage the global meal and exercise database from a dedicated admin interface |

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** — App Router, file-based routing, server-side rendering
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
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** — JWT-based session management
- **[next-auth](https://next-auth.js.org/)** — Auth utilities and session handling helpers

### Dev Tools
- **ESLint** — Code linting with Next.js config
- **PostCSS** — CSS processing pipeline

---

## 🗂️ Project Structure

```
NutriGain/
├── app/
│   ├── api/
│   │   ├── auth/               # POST login/register, GET me, POST logout
│   │   ├── daily-log/          # GET/POST/PUT daily log with meals & gym status
│   │   ├── exercises/          # GET/POST/PUT/DELETE exercise library
│   │   ├── meals/              # GET/POST/PUT/DELETE meal database
│   │   ├── settings/           # GET/PUT user macro settings & targets
│   │   ├── users/              # GET all users (admin)
│   │   ├── weight/             # GET/POST body weight entries
│   │   ├── workout-schedule/   # GET/PUT weekly per-day muscle group schedule
│   │   └── ...                 # (migration & debug utilities)
│   ├── admin/                  # Admin panel — manage meals, exercises, users
│   ├── dashboard/
│   │   ├── gym/                # Gym tracking: PRs, heatmap, workout log
│   │   ├── meal/               # Meal logging: search, add, daily macros
│   │   └── page.js             # Main dashboard overview
│   ├── login/                  # Login page
│   ├── register/               # Sign-up page
│   ├── globals.css             # Global design tokens & base styles
│   ├── layout.js               # Root layout with fonts & auth provider
│   └── page.js                 # Landing page with GSAP scroll animations
├── context/
│   └── AuthContext.js          # Global auth state via React context
├── lib/
│   ├── auth.js                 # JWT utility (sign / verify)
│   └── mongodb.js              # Mongoose connection singleton
├── models/
│   ├── DailyLog.js             # Per-day log: meals, macros, gym status
│   ├── Exercise.js             # Exercise library (muscle group, compound/isolation)
│   ├── Meal.js                 # Meal schema (name, macros per 100g)
│   ├── Settings.js             # User macro targets & preferences
│   ├── User.js                 # User schema (name, email, hashed password, role)
│   ├── UserExerciseData.js     # Per-user PR & working weight history
│   └── WorkoutSchedule.js      # Weekly day → muscle group mapping
├── public/
├── .env.local.example
├── package.json
├── next.config.mjs
└── jsconfig.json
```

---

## 🌐 Application Flow

```
1. Landing Page (/)
   └── GSAP-animated hero with scroll sections
       ├── "Get Started Free" → /register
       └── "Login" → /login

2. Auth (/login, /register)
   ├── Register: POST /api/auth/register → creates User + Settings, sets JWT cookie
   └── Login:    POST /api/auth/login    → validates credentials, sets JWT cookie

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
   └── View registered users

7. Sign Out
   └── POST /api/auth/logout → clears JWT cookie → redirect to /
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nutrigain.git
cd nutrigain
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root (see `.env.local.example` for reference):

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nutrigain?retryWrites=true&w=majority

# JWT secret — use a long, random string
JWT_SECRET=your-super-secret-jwt-key-here

# Node environment
NODE_ENV=development
```

> ⚠️ **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Seed the admin account

After registering your first account, you can promote it to admin directly in MongoDB by setting the `role` field on the `User` document to `"admin"`, then access the admin panel at `/admin`.

### 6. Build for production

```bash
npm run build
npm run start
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

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ and lots of ☕

*© 2026 NutriGain. Built for athletes.*

</div>
