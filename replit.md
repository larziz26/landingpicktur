# Picktur Landing Page

## Overview
A French-language landing page for **Picktur**, a platform for modern wedding photographers. Features include AI photo sorting, premium galleries, facial recognition, and physical albums.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 + tailwindcss-animate
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Routing**: Wouter

## Project Structure
```
/
├── index.html          # HTML entry point
├── src/
│   ├── main.tsx        # React entry point
│   ├── index.css       # Global styles
│   └── LandingPage.tsx # Main landing page component
├── vite.config.ts      # Vite config (host: 0.0.0.0, port: 5000)
├── tailwind.config.ts  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Development
- **Run**: `npm run dev` (starts on port 5000)
- **Build**: `npm run build` (outputs to `dist/`)
- **Preview**: `npm run preview`

## Deployment
Configured as a **static** site:
- Build command: `npm run build`
- Public directory: `dist`
