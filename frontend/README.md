# Adwello CRM - Time Management Frontend

A modern, responsive time tracking and attendance management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Beautiful UI/UX**: Modern, clean interface with smooth animations
- **Time Tracking**: Visual timer with circular progress indicator
- **Real-time Updates**: Live attendance status and team activity
- **Responsive Design**: Mobile-first design that works on all devices
- **Authentication**: Secure JWT-based authentication with auto-refresh
- **Dashboard**: Comprehensive overview of attendance data and statistics

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **HTTP Client**: Axios with interceptors
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Django backend running on http://localhost:8000

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── TimeTracker.tsx # Main time tracking component
│   ├── AttendanceOverview.tsx
│   ├── LoginForm.tsx
│   ├── Header.tsx
│   └── Dashboard.tsx
├── contexts/           # React contexts
├── lib/                # Utilities and API
└── types/              # TypeScript type definitions
```

## Key Components

### TimeTracker
- Visual circular timer with progress indication
- Clock in/out functionality
- Break tracking
- Daily goal progress

### AttendanceOverview
- Team activity dashboard
- Real-time status updates
- Recent attendance history
- Statistics and insights

### LoginForm
- Secure authentication
- Form validation
- Error handling
- Beautiful animations

## API Integration

The frontend integrates with the Django backend through:

- **Authentication**: JWT tokens with auto-refresh
- **Attendance**: CRUD operations for attendance records
- **Employees**: Employee profile management
- **Real-time**: Live updates for team activity

## Design System

- **Colors**: Blue primary palette with semantic colors
- **Typography**: Inter font with clear hierarchy
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable UI components with variants
- **Animations**: Smooth, purposeful animations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new files
3. Implement proper error handling
4. Add animations for better UX
5. Ensure mobile responsiveness
6. Write meaningful commit messages

## License

Copyright © 2024 Adwello CRM. All rights reserved.