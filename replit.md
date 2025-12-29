# CitizenVoice - Civic Engagement Platform

## Overview
A community engagement platform enabling citizens to:
- Report problems or request help (needs)
- Volunteer their time and skills (offers)
- Share ideas to improve the city (ideas)

The platform includes a dashboard displaying all submissions with filtering, statistics tracking (participants, volunteer hours, estimated citizen hours), and a clean, accessible interface.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn UI components
│   │   └── theme-toggle.tsx  # Dark/light mode toggle
│   ├── pages/
│   │   ├── home.tsx      # Landing page with hero and action cards
│   │   ├── dashboard.tsx # Submissions list with stats and filters
│   │   ├── submit.tsx    # Submission form
│   │   └── not-found.tsx # 404 page
│   ├── App.tsx           # Main app with routing
│   ├── index.css         # Tailwind/design tokens
│   └── main.tsx          # Entry point
server/
├── routes.ts             # API endpoints
├── storage.ts            # In-memory storage interface
└── index.ts              # Express server
shared/
└── schema.ts             # Data models and validation
```

## Key Features

### Data Model
- **Submissions**: Category (need/offer/idea), title, description, contact info, hours offered
- **Statistics**: Total participants, needs, offers, ideas, volunteer hours, estimated citizen hours

### API Endpoints
- `GET /api/submissions` - List all submissions (sorted by newest)
- `GET /api/submissions/:id` - Get single submission
- `POST /api/submissions` - Create new submission
- `GET /api/stats` - Get dashboard statistics

### Frontend Routes
- `/` - Homepage with hero, stats preview, and action cards
- `/dashboard` - Full dashboard with all submissions and filtering
- `/submit` - Submission form (accepts ?category=need|offer|idea)

## Tech Stack
- **Frontend**: React, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, Zod validation
- **Storage**: In-memory (MemStorage)

## Design System
- Green primary color (#22c55e / emerald-600) for civic trust
- Category colors: Green (needs), Blue (offers), Amber (ideas)
- Open Sans font family
- Dark mode support via class toggle

## Development
Run `npm run dev` to start the development server on port 5000.

## Recent Changes
- Initial MVP implementation (November 2025)
- Three-category submission system
- Dashboard with filtering and statistics
- Dark mode toggle
- Responsive design for all screen sizes
