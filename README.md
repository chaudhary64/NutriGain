# NutriGain - Macro Tracking App

A Next.js application for tracking daily macros (calories, protein, carbs, and fats). Users can select meals from a database, adjust quantities, and see their macro meters update in real-time.

## Features

- 🔐 **Authentication**: Secure login and registration with MongoDB
- 👤 **User Dashboard**: Track daily macros with real-time updates
- 👨‍💼 **Admin Panel**: Manage meal database (add, edit, delete meals)
- 🍽️ **Meal Selection**: Choose from breakfast, lunch, dinner, and snacks
- 📊 **Real-time Macro Meters**: Visual progress bars for calories, protein, carbs, and fats
- 📅 **Date Navigation**: View and track macros for any date
- ⚡ **Quantity Adjustment**: Easily adjust meal quantities with +/- buttons

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nutrigain.git
cd nutrigain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your configuration:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" and select "Connect your application"
4. Copy the connection string and replace `<password>` with your database user password
5. Paste it in your `.env.local` file

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Admin Account

To create an admin account, you need to manually set `isAdmin: true` in MongoDB:

1. Register a normal user account
2. Open MongoDB Atlas > Browse Collections
3. Find your user in the `users` collection
4. Edit the document and set `isAdmin: true`

### Admin Features

- Access the admin panel at `/admin`
- Add new meals with nutritional information
- Edit existing meals
- Delete meals from the database
- Set meal categories (breakfast, lunch, dinner, snack, general)

### User Features

- Access the dashboard at `/dashboard`
- Select meals from the database
- Adjust quantities (supports decimals like 0.5, 1.5, etc.)
- View real-time macro meters
- Track different meal types (breakfast, lunch, dinner, snacks)
- Navigate between dates to view past logs

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

4. Deploy!

## Project Structure

```
nutrigain/
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── meals/         # Meal CRUD operations
│   │   └── daily-log/     # Daily tracking endpoints
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── layout.js         # Root layout
├── context/
│   └── AuthContext.js    # Authentication context
├── lib/
│   ├── mongodb.js        # MongoDB connection
│   └── auth.js           # Auth middleware
├── models/
│   ├── User.js           # User model
│   ├── Meal.js           # Meal model
│   └── DailyLog.js       # Daily log model
└── public/               # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Meals (Admin only for POST/PUT/DELETE)
- `GET /api/meals` - Get all meals
- `POST /api/meals` - Create new meal
- `PUT /api/meals/[id]` - Update meal
- `DELETE /api/meals/[id]` - Delete meal

### Daily Log
- `GET /api/daily-log?date=YYYY-MM-DD` - Get daily log
- `POST /api/daily-log` - Add meal to log
- `PUT /api/daily-log/[id]` - Update meal quantity
- `DELETE /api/daily-log/[id]?date=YYYY-MM-DD` - Remove meal from log

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

