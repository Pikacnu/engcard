# Cardlisher (English Card)

Cardlisher is a modern English vocabulary learning application built with Next.js 15, designed to help users learn English effectively through interactive flashcards, AI-powered word processing, and OCR image recognition.

> **Note**: This project is primarily designed for learning English with Traditional Chinese as the base language, providing comprehensive bilingual support.

## Features

- **Smart Card Management**: Create, edit, and organize vocabulary cards with AI-enhanced definitions and examples
- **OCR Image Recognition**: Upload images to automatically extract and generate vocabulary cards from text
- **AI-Powered Learning**: Advanced AI analyzes words and provides definitions, synonyms, antonyms, and contextual examples
- **Interactive Practice**: Engage with vocabulary through spelling challenges, quizzes, and speed reviews
- **Multilingual Support**: Full internationalization with English and Traditional Chinese interfaces
- **Progress Tracking**: Monitor learning progress with detailed analytics and performance insights
- **Dark Mode Support**: Modern UI with light/dark theme switching
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: Bun (preferred) / Node.js 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB with MongoDB Adapter
- **AI Integration**: Google Generative AI, OpenAI
- **Deployment**: Vercel with OpenTelemetry monitoring

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
│   ├── context/           # React contexts (Language, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core libraries and utilities
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions and configurations
├── public/                # Static assets
│   ├── locales/           # Internationalization files
│   ├── icons/             # UI icons
│   └── platform/          # Platform-specific assets
├── data_process/          # Data processing utilities
├── package.json           # Project dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── example.env            # Environment variables template
```

## Installation and Setup

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- MongoDB database (local or cloud)
- API keys for AI services (Google Generative AI, OpenAI)

### Environment Setup

1. Copy the environment template:
   ```bash
   cp example.env .env.local
   ```

2. Configure your environment variables in `.env.local`:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   AUTH_SECRET=your_auth_secret
   
   # AI Services
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
   OPENAI_API_KEY=your_openai_key
   ```

### Installation

Install dependencies using Bun (recommended):

```bash
bun install
```

Or with npm:
```bash
npm install
```

### Development

Start the development server with Turbopack:

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

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.