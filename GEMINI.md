## Gemini Code-Gen Agent Instructions

This document provides a comprehensive guide to the codebase, outlining its structure, conventions, and key components. It is intended for agentic coding agents to understand the project and contribute effectively.

### Build, Lint, and Test

- **Build:** `npm run build` - Compiles the application for production.
- **Typecheck:** `npm run typecheck` - Runs the TypeScript compiler to check for type errors.
- **Test:** `npx playwright test` - Executes the end-to-end tests using Playwright.
- **Run a single test:** `npx playwright test <test-file-path>` - Runs a specific test file.
- **Development Server:** `npm run dev` - Starts the development server with hot module replacement.

### Code Style and Conventions

- **Frameworks:** The project is built with React, React Router for routing, Vite for the build tooling, and Tailwind CSS for styling.
- **Language:** TypeScript is used with strict mode enabled. All new code should be written in TypeScript.
- **Formatting:** The project adheres to the default formatting of the Prettier code formatter. It is recommended to use a Prettier extension in your editor to format on save.
- **Imports:** Use ES Module `import/export` syntax. Path aliases are configured in `tsconfig.json` and `vite.config.ts` to allow for absolute imports from the `app` and `api` directories (e.g., `import { MyComponent } from '~/components/MyComponent'`).
- **Naming Conventions:**
  - Components and types should be in `PascalCase`.
  - Variables, functions, and file names should be in `camelCase`.
  - Interfaces should be prefixed with `I` (e.g., `IFormInfo`).
- **State Management:** Redux Toolkit is used for global state management. Slices are defined in the `app/state/user` directory.
- **Error Handling:** Use `try/catch` blocks for asynchronous operations and API calls. For user-facing errors, provide clear and informative messages.

### Project Structure

- **`api/`**: Contains the backend logic and data models for the application.
  - **`interfaces/`**: Defines the TypeScript interfaces for the data structures used throughout the application. The `sections2.0/` subdirectory contains the interfaces for each section of the SF-86 form.
  - **`repository/`**: Handles data access and persistence. `formDataRepository.ts` is responsible for saving and retrieving form data.
  - **`sections-references/`**: Contains JSON files with reference data for each section of the form.
  - **`service/`**: Implements the business logic of the application. `clientPdfService.ts` and `clientPdfService2.0.ts` are responsible for generating PDF documents. `dynamicService.ts` provides a generic service for handling dynamic form sections.
  - **`utils/`**: Contains utility functions used by the API.
- **`app/`**: Contains the frontend React application.
  - **`components/`**: Reusable React components used throughout the application.
    - **`Rendered2.0/`**: Contains the components for rendering each section of the SF-86 form.
  - **`routes/`**: Defines the application's routes and the components that are rendered for each route.
    - **`api/`**: Contains the API endpoints for the frontend application.
  - **`state/`**: Contains the Redux Toolkit store, slices, and hooks for managing the application's state.
    - **`contexts/`**: Contains the React contexts for managing the form state.
    - **`hooks/`**: Contains custom React hooks.
    - **`user/`**: Contains the Redux Toolkit slices for managing user and form data.
  - **`utils/`**: Contains utility functions used by the frontend application.
  - **`welcome/`**: Contains the components for the welcome page.
- **`public/`**: Contains static assets that are served directly by the web server.
- **`workers/`**: Contains the Cloudflare Worker script that handles server-side rendering and API requests.

### Key File Relationships

- **`app/root.tsx`**: The root component of the React application. It sets up the basic HTML structure and includes the `Scripts` and `Styles` components from React Router.
- **`app/entry.server.tsx`**: The entry point for the server-side rendering. It renders the React application to a string and sends it to the client.
- **`app/routes/_index.tsx`**: The component for the home page of the application.
- **`app/state/store.ts`**: The Redux Toolkit store configuration.
- **`api/service/clientPdfService2.0.ts`**: This service is responsible for generating the final PDF document. It uses the `pdf-lib` library to create the PDF and the `enhanced-pdf-field-mapping.ts` utility to map form data to PDF fields.
- **`app/components/Rendered2.0/SF86FormMain.tsx`**: The main component for rendering the SF-86 form. It dynamically renders the form sections based on the configuration in `sf86SectionConfig.ts`.
- **`app/state/contexts/SF86FormContext.tsx`**: This context provides the state and functions for managing the SF-86 form. It is used by all the section components.
- **`api/interfaces/formDefinition2.0.ts`**: This file defines the main interface for the form data. It is a large interface that is composed of all the section interfaces.
