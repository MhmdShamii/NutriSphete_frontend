# NutriSphere Frontend

A React + TypeScript web and mobile application for nutrition tracking, meal creation, and social engagement around healthy eating. Built with Vite and packaged as a native mobile app via Capacitor.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4, MUI 7, Emotion |
| State management | Redux Toolkit |
| Routing | React Router v7 |
| Charts | Recharts |
| Mobile | Capacitor 8 (Android & iOS) |
| Auth | Google OAuth (GIS / `@codetrix-studio/capacitor-google-auth`) |

## Features

- **Authentication** — Email/password sign-up (2-step) and Google OAuth, email verification flow
- **Onboarding** — 3-step profile setup: personal info → body metrics → nutrition targets
- **Home dashboard** — Today's calorie & macro summary, streak tracking, quick-log meals
- **Meal creation** — Build meals from ingredients, search ingredient database
- **Social feed** — Browse posts, like, comment, follow other users
- **Profile** — View own/others' profile, saved meals, recipes, follower/following lists
- **My Stats** — Calorie and macro history charts, weight log
- **AI Chat** — In-app nutrition assistant chatbot
- **Admin** — User management, ingredient management, coach applications, analytics (admin role only)
- **Coach badges** — Verified coach indicator on profiles

## Project Structure

```
src/
├── app/            # Redux store
├── assets/         # Static assets (images, country data)
├── components/
│   ├── auth/       # LoginForm, SignupForm, step components
│   ├── Home/       # NavBar, TopBar
│   └── ui/         # Shared UI primitives (Button, Input, SelectDropdown, DatePicker, ...)
├── context/        # ToastContext
├── features/       # Page-level feature modules
│   ├── auth/       # AuthPage, authSlice, types
│   ├── feed/       # FeedPage, Feed
│   ├── meal/       # MealPage, CommentsSheet
│   ├── mealCreation/
│   ├── onboarding/ # 3-step onboarding flow
│   ├── profile/    # Profile, FollowListModal, MealSheet, SavedMeals
│   ├── admin/      # AdminDashboard
│   ├── aiChat/     # AiChat
│   ├── Home.tsx
│   ├── MyStats.tsx
│   └── Settings.tsx
├── hooks/          # useTheme
├── routes/         # ProtectedRoute, OnboardedRoute guards
├── services/       # API modules (auth, meals, feed, social, stats, admin, ...)
└── utils/          # apiError helper
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://api.nutrispher.dev/api/v1
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

### Run in development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
# or serve the dist folder:
npm start
```

## Mobile (Capacitor)

### Sync web build to native projects

```bash
npm run cap:sync
```

### Open in Android Studio

```bash
npm run cap:android
```

### Open in Xcode (iOS)

```bash
npm run cap:ios
```

### Build & install APK directly on a connected Android device

```bash
npm run cap:run
```

> Requires Android Studio, the Android SDK platform-tools on `PATH`, and `JAVA_HOME` set to the JBR bundled with Android Studio (path may vary by installation).

## Route Guards

| Guard | File | Behavior |
|---|---|---|
| `ProtectedRoute` | `src/routes/ProtectedRoute.tsx` | Redirects unauthenticated users to `/auth` |
| `OnboardedRoute` | `src/routes/OnboardedRoute.tsx` | Redirects users who haven't completed onboarding |

## API

Production base URL: `https://api.nutrispher.dev/api/v1`

All API calls go through `src/services/apiClient.ts` (Axios instance). Auth token is attached via request interceptor and stored in Redux via `authSlice`.

## Linting

```bash
npm run lint
```
