# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered video advertisement creation tool built with React, TypeScript, and Vite. The application generates storyboards for video advertisements using the Gemini API.

## Common Development Commands

```bash
# Install dependencies
npm install

# Run development server (starts on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture & Structure

### Core Application Flow
1. **Input Layer**: User provides advertising concept, optional YouTube reference URL, and video duration
2. **API Service Layer**: `geminiService.ts` handles all Gemini AI interactions for content generation
3. **State Management**: React hooks manage application state with TypeScript interfaces
4. **Modal System**: Modular modal components for different features (model, product, creative direction, etc.)

### Key Components

- **App.tsx**: Main application component orchestrating the entire workflow
- **services/geminiService.ts**: Core AI service handling prompt generation and Gemini API interactions
- **services/apiKeyManager.ts**: Manages Gemini API key storage and validation
- **types.ts**: TypeScript interfaces defining the data model (Scene, Model, Product, Storyboard, etc.)

### Modal Components (`components/modals/`)
- `ApiKeyModal`: API key configuration
- `ModelModal`: Model selection and management
- `ProductModal`: Product configuration
- `CreativeDirectionModal`: Style guide and creative direction
- `ImageEditorModal`: Image editing functionality
- `PromptGuideModal`: User guidance for prompt writing
- `VideoModal`: Video preview and management

### Environment Setup

The application requires a Gemini API key. Set it in `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### Type System

The application uses comprehensive TypeScript interfaces:
- `Scene`: Video scene with timing, images, and descriptions
- `Model` & `Product`: Advertisement assets
- `Storyboard`: Complete video structure with style guide
- `OtherAIModel`: Enum for different AI video generation services
- `AdaptedPrompts`: Model-specific prompt adaptations

### Deployment

Configured for Netlify deployment via `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18
- SPA routing configured with redirects

### Development Notes

- The application is Korean-language focused (광고 영상 제작 = "Advertisement Video Production")
- Uses Tailwind CSS for styling (via CDN or build process)
- Lucide React icons for UI elements
- Path aliasing configured: `@/` maps to project root