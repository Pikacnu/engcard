# Cardlisher

Cardlisher is a modern English vocabulary learning application built with Next.js 15+, designed to help users learn English effectively through interactive flashcards, AI-powered word processing, and OCR image recognition.

> **Note**: This project is primarily designed for learning English with Traditional Chinese as the base language, providing comprehensive bilingual support.

## Features

- **Smart Card Management**: Create, edit, and organize vocabulary cards with AI-enhanced definitions and examples
- **OCR Image Recognition**: Upload images to automatically extract and generate vocabulary cards from text
- **AI-Powered Learning**: Advanced AI analyzes words and provides definitions, synonyms, antonyms, and contextual examples
- **Interactive Practice**: Engage with vocabulary through spelling challenges, quizzes, and speed reviews
- **FSRS Algorithm**: Implements the Free Spaced Repetition Scheduler for optimized learning
  - Full local computation with no server dependency
  - Personalized review scheduling with `ts-fsrs` library
  - Offline-first review logs stored in IndexedDB (Dexie)
  - Background sync for seamless online/offline transitions
- **Multilingual Support**: Full internationalization with English, Traditional Chinese, and Japanese interfaces
- **Progress Tracking**: Monitor learning progress with detailed analytics and performance insights
- **Dark Mode Support**: Modern UI with light/dark theme switching
- **Responsive Design**: Optimized for desktop and mobile devices
- **Complete PWA Support**: Enterprise-grade Progressive Web App
  - Installable on all platforms (Windows, macOS, iOS, Android)
  - Full offline functionality with Service Worker (Serwist)
  - Pre-cached critical routes (dashboard, chat, deck, search, settings, preview)
  - Background sync for failed requests
  - Runtime caching for visited pages with StaleWhileRevalidate strategy
  - Automatic updates with Git-based versioning
  - Optimized media caching (audio, images, fonts)

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Runtime**: Bun (Preferred)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Google Generative AI (Gemini), OpenAI
- **PWA**: Serwist (with Turbopack support)
- **Local Storage**: Dexie.js (IndexedDB wrapper)
- **Spaced Repetition**: ts-fsrs (FSRS 5.2+ algorithm)

## Project Structure

```
engcard/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Main dashboard pages
│   │   ├── auth/           # Authentication pages
│   │   └── ...             # Other app pages
│   ├── components/         # Reusable React components
│   ├── context/           # React contexts (Language, Theme, Settings)
│   ├── db/                # Database schema and client (Drizzle)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries and utilities
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions and AI configurations
├── drizzle/                # Database migrations
├── public/                # Static assets and PWA files
│   ├── locales/           # Internationalization files
│   ├── app-icon/          # UI icons
│   └── platform/          # Platform-specific assets
├── package.json           # Project dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── example.env            # Environment variables template
```

## Installation and Setup

### Prerequisites

- [Bun](https://bun.sh) (recommended)
- PostgreSQL database
- API keys for AI services (Google Generative AI, OpenAI, or xAI)

### Environment Setup

1. Copy the environment template:
   ```bash
   cp example.env .env.local
   ```

2. Configure your environment variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host:port/db
   
   # Authentication
   AUTH_SECRET=your_auth_secret
   AUTH_DISCORD_ID=your_discord_id
   AUTH_DISCORD_SECRET=your_discord_secret
   AUTH_GOOGLE_ID=your_google_id
   AUTH_GOOGLE_SECRET=your_google_secret
   
   # AI Services
   GEMINI_API_KEY=your_google_ai_key
   OPENAI_API_KEY=your_openai_key
   ```
3. Make sure PostgreSQL have Extension `vector`:
[pgvector](https://github.com/pgvector/pgvector) repo
### Installation

Install dependencies using Bun (recommended):

```bash
bun install
```

### Database Migration

Generate and run migrations:

```bash
bun run generate
bun run migrate
```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### Build and Deploy

Build for production:

```bash
bun run build
```

Start production server:
```bash
bun run start
```

## PWA & Offline Architecture

### Service Worker Strategy

Cardlisher implements a sophisticated offline-first strategy:

- **Precaching**: Critical routes are pre-downloaded during installation:
  - Entry points: `/appenter`, `/dashboard`
  - Dashboard routes: `/chat`, `/deck`, `/search`, `/settings`, `/preview`
  - Static assets: Icons, fonts, and core resources

- **Runtime Caching**:
  - **Navigation**: StaleWhileRevalidate for instant page loads
  - **Audio**: CacheFirst with Range Request support for offline playback
  - **Images & Fonts**: StaleWhileRevalidate for optimal performance
  - **API Calls**: Background Sync with 24-hour retry window

### Local Data Management (Dexie.js)

All critical data is stored locally for full offline functionality:

- **Decks & Cards**: Complete vocabulary database synced to IndexedDB
- **FSRS State**: Review schedules, card states, and learning progress
- **Review Logs**: Historical review data with pending sync queue
- **User Preferences**: Settings, theme, and language preferences
- **Analytics**: Hot words, recent history, and usage statistics

### Sync Strategy

1. **Online**: Real-time sync with PostgreSQL backend
2. **Offline**: Operations queued in `pendingFSRS` table
3. **Reconnect**: Automatic background sync via Service Worker
4. **Conflict Resolution**: Last-write-wins with timestamp-based merging

## How to Use

1. **Get Started**: Sign in to access your personal vocabulary dashboard
2. **Create Decks**: Organize your vocabulary into themed collections
3. **Add Words**: 
   - Search and add words with AI-generated definitions
   - Upload images to extract text using OCR technology
   - Manually create custom flashcards
4. **Practice**: Use interactive features like:
   - Speed review sessions
   - Spelling challenges
   - Definition matching
5. **Track Progress**: Monitor your learning statistics and performance
6. **Customize**: Switch between light/dark themes and language preferences

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Test your changes thoroughly
- Update documentation as needed
- Use conventional commit messages

## Live Demo

Experience Cardlisher live at: [https://eng.pikacnu.com/](https://eng.pikacnu.com/)
