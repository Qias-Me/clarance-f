# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "clarance-f", a React Router 7 + Cloudflare Workers application for SF-86 security clearance form processing. The application uses React 19, TypeScript, Tailwind CSS 4, and Redux Toolkit for state management. It's designed to generate, fill, and process PDF forms for government security clearance applications.

## Development Commands

- `npm run dev` - Start development server with React Router dev mode
- `npm run build` - Build for production using React Router
- `npm run typecheck` - Run full type checking (includes Cloudflare types, React Router typegen, and TypeScript)
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run preview` - Build and preview locally
- `npm run cf-typegen` - Generate Cloudflare Worker types

## Architecture

### Core Structure
- **app/** - React Router 7 application code
  - **components/Rendered2.0/** - SF-86 form section components (Section1Component.tsx through Section30Component.tsx)
  - **state/contexts/sections2.0/** - Context providers for each form section with field mapping and generators
  - **routes/api/** - API routes for PDF generation, validation, and proxy
  - **utils/** - PDF generation utilities and section configuration

- **api/** - Backend logic and interfaces
  - **interfaces/sections2.0/** - TypeScript interfaces for all 30 SF-86 sections
  - **service/** - PDF services (clientPdfService.ts, clientPdfService2.0.ts)
  - **sections-references/** - JSON reference data for form sections
  - **utils/** - Field generators and PDF mapping utilities

- **workers/** - Cloudflare Workers entry point (app.ts)

### Form Architecture 2.0
The application uses a modular section-based architecture where each SF-86 section has:
- Interface definition in `api/interfaces/sections2.0/sectionX.ts`
- Context provider in `app/state/contexts/sections2.0/sectionX.tsx`
- Component in `app/components/Rendered2.0/SectionXComponent.tsx`
- Field mapping in `app/state/contexts/sections2.0/sectionX-field-mapping.ts`
- Field generator in `app/state/contexts/sections2.0/sectionX-field-generator.ts`

### State Management
- Redux Toolkit with form slice and user slice
- React Context for section-specific state management
- SF86FormContext as the main form orchestrator

### PDF Processing
- Uses pdf-lib for PDF manipulation
- Client-side and server-side PDF generation options
- Field mapping system with 4-digit numeric IDs
- Clean.pdf template in public/ directory

## Testing

- Playwright for E2E testing: `npx playwright test`
- Test files in tests/ directory organized by sections
- Visual regression tests with screenshots in tests/sectionX/ directories

## Key Dependencies

- React Router 7 with SSR enabled
- Cloudflare Workers runtime
- Redux Toolkit for state management
- pdf-lib for PDF manipulation
- Tailwind CSS 4 for styling
- Zod for validation

## Development Notes

- The application is deployed on Cloudflare Workers
- Static assets (including clean.pdf) are served from public/ directory
- HMR overlay is disabled in vite config
- Uses TypeScript path mapping via vite-tsconfig-paths
- Form sections are incrementally developed (not all 30 sections are complete)

## Code Style Rules

The project follows rules defined in .rules/ directory:
- TypeScript strict mode with proper typing
- React functional components with hooks
- Tailwind CSS for styling
- Clean code principles with modular architecture
- DRY principles for form section patterns