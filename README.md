# English Card

English Card is a multi-package project built with Turborepo, designed to help users learn English effectively through vocabulary cards, OCR recognition, and multilingual support.

> **Note**: This project is primarily designed for learning English with Traditional Chinese as the base language, so it does not have comprehensive support for other languages.

## Features

- **Vocabulary Card Management**: Create, edit, and delete vocabulary cards with ease.
- **Multilingual Support**: Provides translations and examples in English and Traditional Chinese.
- **Extensive Dataset**: Includes a rich dataset of vocabulary for quick reference and usage.
- **Interactive Learning**: Engage with vocabulary through quizzes, examples, and definitions.

## Project Structure

```
english-card/
├── apps/
│   ├── api/          # Backend API application
│   ├── web/          # Frontend web application
├── packages/
│   ├── eslint-config/ # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   ├── ui/           # Shared UI component library
├── [`turbo.json`](turbo.json )        # Turborepo configuration
├── [`package.json`](package.json )      # Project dependencies and scripts
├── [`.env.local`](example.env )     # Environment variables template (Need Change)
└── [`README.md`](README.md )         # Project documentation
```

## Installation and Usage

### Prerequisites

- [Bun](https://bun.sh) installed
- Node.js version 18 or higher

### Installation

Run the following command to install dependencies:

```bash
bun install
```

### Development

Start the development server:

```bash
bun run dev
```

### Build

Build all applications and packages:

```bash
bun run build
```

## How to Use
1. **Search for Words**: Utilize the search functionality to look up words. The application fetches data from a dictionary API and uses AI to organize and enrich the content with definitions, synonyms, antonyms, and example sentences.
2. **Create Vocabulary Decks**: Organize your vocabulary into decks for better learning.
3. **Add New Words**: Add custom words to your decks with definitions, examples, and translations.
4. **Practice with Quizzes**: Test your knowledge with interactive quizzes and spelling challenges.
5. **OCR Integration**: Upload images to extract text and generate vocabulary cards automatically.

# Live Demo:

[https://eng.pikacnu.com/](https://eng.pikacnu.com/)