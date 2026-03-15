# ⚡ NutriGain

> **Track Your Macros. Dominate Your Goals.**

NutriGain is a full-stack fitness tracking web application built for people who take their nutrition and gym performance seriously. It combines a **daily macro / meal tracker** with a **gym workout tracker** — all behind a sleek, dark-mode dashboard that gives you a real-time view of your progress.

---

## 🧩 What is NutriGain?

NutriGain is designed for fitness enthusiasts who want a single, clean place to:

- Log their daily meals and automatically calculate calorie & macro (protein, carbs, fats) intake
- Track gym workout sessions, mark daily gym status, and visualize consistency via a GitHub-style activity calendar
- Monitor body weight over time with a visual line chart trending toward a target weight
- Follow a customizable weekly protein plan (e.g., Chicken vs Paneer days)
- Manage exercises grouped by muscle group with warm-up weights, working weights, and personal records (PRs)
- Access an Admin panel to manage the meal database, exercise library, and workout schedule

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router, server-side rendering, and API routes |
| **React 19** | Component-based UI with hooks |
| **Tailwind CSS v4** | Utility-first CSS framework for rapid, consistent styling |
| **Recharts** | Responsive line charts for body weight progression |
| **react-activity-calendar** | GitHub-style heatmap calendar for gym consistency |
| **react-tooltip** | Tooltips on the activity calendar |
| **date-fns** | Date formatting and manipulation |
| **Google Fonts (Inter, Playfair Display)** | Premium typography |

### Backend
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless REST API endpoints (no separate backend needed) |
| **MongoDB** | NoSQL database for storing users, meals, logs, and exercises |
| **Mongoose** | ODM for MongoDB schema definitions and queries |
| **bcryptjs** | Password hashing for secure credential storage |
| **JSON Web Tokens (jsonwebtoken)** | Stateless authentication via JWT stored in cookies |

### Dev & Config
| Technology | Purpose |
|---|---|
| **ESLint** | Code linting with Next.js rules |
| **PostCSS** | CSS processing pipeline for Tailwind |
| **jsconfig.json** | Path aliases (`@/` maps to project root) |
| **`.env.local`** | Environment variables for DB connection, JWT secret, and macro goals |

---

## 📁 Project Structure

```
NutriGain/
├── app/
│   ├── page.js                  # Landing / Home page
│   ├── layout.js                # Root layout with AuthProvider
│   ├── globals.css              # Global styles
│   ├── login/page.js            # Login page
│   ├── register/page.js         # Registration page
│   ├── dashboard/
│   │   ├── page.js              # Dashboard hub (choose Meal or Gym)
│   │   ├── meal/page.js         # Meal tracking page
│   │   └── gym/page.js          # Gym tracking page
│   ├── admin/
│   │   ├── page.js              # Admin panel (manage meals, exercises, schedule)
│   │   └── user/                # Per-user admin views
│   └── api/
│       ├── auth/                # Login & register endpoints
│       ├── daily-log/           # CRUD for daily meal logs
│       ├── meals/               # Meal database CRUD
│       ├── exercises/           # Exercise library CRUD
│       ├── workout-schedule/    # Weekly workout schedule
│       ├── weight/              # Weight entry CRUD
│       ├── settings/            # Meal schedule settings
│       ├── users/               # User management (admin)
│       ├── init-admin/          # One-time admin seed
│       └── migrate-*/           # Data migration scripts
├── models/
│   ├── User.js                  # User schema (auth, weight entries, meal plan)
│   ├── DailyLog.js              # Daily meal + gym status log
│   ├── Meal.js                  # Meal with macros schema
│   ├── Exercise.js              # Exercise with muscle group & type
│   ├── WorkoutSchedule.js       # Weekly day → muscle group mapping
│   ├── UserExerciseData.js      # Per-user exercise PR data
│   └── Settings.js              # App-wide settings
├── context/
│   └── AuthContext.js           # React context for auth state (login/logout/checkAuth)
├── public/                      # Static assets (favicons, PWA icons)
├── .env.local                   # Environment variables (not committed)
├── next.config.mjs              # Next.js configuration
└── package.json                 # Dependencies and scripts
```

---

## 🌊 Website Flow

### 1. 🏠 Landing Page (`/`)
The public-facing home page. It introduces NutriGain with:
- A bold hero section: *"Track Your Macros. Dominate Your Goals."*
- Feature highlight cards: Macro Tracking, Meal Database, Real-time Updates
- A **Get Started** CTA (→ `/register`) and a **Login** link (→ `/login`)
- If already logged in, the nav shows the user's name with links to Dashboard and Logout

---

### 2. 🔐 Authentication (`/login`, `/register`)
- **Login page**: Split-panel layout — left side has a gym motivational background image, right side has the login form. Authentication is done via a custom JWT-based system.
- **Register page**: User signs up with name, email, and password. Password is hashed with bcryptjs before storage.
- On success, the user is redirected:
  - Regular user → `/dashboard`
  - Admin user → `/admin`
- Auth state is managed globally via `AuthContext` using React Context API.

---

### 3. 📊 Dashboard Hub (`/dashboard`)
After login, users arrive at the main dashboard with two clickable cards:

| Card | Destination |
|---|---|
| 🥗 **Nutrition Log** | `/dashboard/meal` — track meals and macros |
| 🏋️ **Workout Log** | `/dashboard/gym` — track gym sessions and exercises |

---

### 4. 🥗 Meal Tracker (`/dashboard/meal`)
The core nutrition tracking page. Features:

- **Date picker** in the nav to browse any day's log (defaults to today)
- **Protein Plan banner**: Indicates whether today is a *Chicken Day* 🍗 or *Paneer Day* 🧀 based on the global weekly schedule
- **Macro Meter sidebar**: Real-time progress bars for Calories, Protein, Carbs, and Fats against configurable daily goals (set via env variables). Shows a live preview when a meal is selected before logging.
- **Add Meal form**: Search and filter from the meal database, pick meal type (Breakfast/Lunch/Dinner), set quantity, and submit. Macros update instantly.
- **Meal sections**: Logged meals grouped by Breakfast, Lunch, and Dinner. Each entry shows macros and allows quantity editing or deletion.
- **Remaining macros** grid: Shows how many calories/grams are left in each macro for the day.

---

### 5. 🏋️ Gym Tracker (`/dashboard/gym`)
The workout tracking page. Features:

- **Today's gym status** (in nav): A dropdown to mark the day as *Completed*, *Partial*, or *Not Done*. Color-coded (lime/amber/grey).
- **Activity Calendar**: A GitHub-style contribution heatmap showing all gym days in the current year. Hovering shows the date and completion status.
- **Streak stats**: Current streak and longest streak displayed as big numbers.
- **Weight Tracker**: Log daily body weight with a searchable line chart. A red dashed reference line shows the target weight goal.
- **Exercise Library (tabs)**:
  - *Exercises* tab: All exercises grouped by muscle group (Chest, Back, Bicep, Tricep, Legs, Shoulders, etc.). Each exercise shows type (Compound/Isolation), warm-up weight, working weight, personal record (PR), and PR date. Inline editing available.
  - *Schedule* tab: The weekly workout plan (Mon–Sun) with the muscle groups assigned to each day.

---

### 6. 🛠 Admin Panel (`/admin`)
Only accessible to users with `isAdmin: true`. Allows:

- **Meal Management**: Add, edit, and delete meals with full macro data
- **Exercise Management**: Add exercises to the library, assign muscle groups and types
- **Workout Schedule**: Configure which muscle groups are trained on each day of the week
- **User Management**: Browse registered users and manage their data
- **Global Meal Schedule**: Set the weekly Chicken/Paneer rotation used in the Meal Tracker

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root. See `.env.local.example` for the full template:

```env
MONGODB_URI=mongodb+srv://...        # MongoDB connection string
JWT_SECRET=your_jwt_secret           # Secret for signing JWTs

# Daily macro goals (shown as targets on the Meal Tracker)
NEXT_PUBLIC_GOAL_CALORIES=1900
NEXT_PUBLIC_GOAL_PROTEIN=120
NEXT_PUBLIC_GOAL_CARBS=170
NEXT_PUBLIC_GOAL_FATS=60
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/NutriGain.git
cd NutriGain

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your MongoDB URI and JWT secret

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🗃️ Data Models

| Model | Key Fields |
|---|---|
| `User` | `name`, `email`, `password`, `isAdmin`, `weightEntries[]`, `targetWeight`, `mealDays[]` |
| `DailyLog` | `user`, `date`, `meals[]`, `totalMacros`, `gymStatus` |
| `Meal` | `name`, `servingSize`, `macros { calories, protein, carbs, fats }`, `category` |
| `Exercise` | `muscleGroup`, `name`, `type (COMPOUND/ISOLATION)` |
| `WorkoutSchedule` | `day`, `muscleGroups[]` |
| `UserExerciseData` | Per-user warm-up weight, working weight, last PR, last PR date |

---

## 🎨 Design System

- **Color palette**: Dark neutral backgrounds (`neutral-950/900/800`) with **lime-500** (`#84cc16`) as the primary accent
- **Typography**: Inter (body/UI) + Playfair Display (headings), loaded via `next/font/google`
- **Theme**: Dark mode throughout with glassmorphism nav bars (`backdrop-blur`), glow shadows on CTAs, and hover micro-animations
- **Layout**: Responsive — mobile hamburger menu collapses the full nav; desktop uses a persistent sticky navbar

---

*Built with 💪 for athletes who obsess over the details.*
