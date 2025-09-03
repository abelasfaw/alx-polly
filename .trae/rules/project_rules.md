
---
description: Comprehensive rules, conventions, and architectural guidelines for the Polling App with QR Code Sharing project.
globs:
alwaysApply: true
---

## Project Overview: Polling App with QR Code Sharing
This document outlines the core rules, conventions, and architectural guidelines for the Polling App. The primary goal is to build a robust and maintainable web application that enables users to register, create polls, and share them via unique links and QR codes for others to vote on.

Adherence to these guidelines is crucial for ensuring code quality, consistency, and long-term maintainability of the codebase.

## Technology Stack
The project utilizes the following technologies. Introduction of new libraries or frameworks requires explicit approval.

- **Language**: TypeScript (Strict mode enabled)
- **Main Framework**: Next.js (App Router)
- **Database & Auth**: Supabase (PostgreSQL for database, Supabase Auth for authentication)
- **Styling**: Tailwind CSS with `shadcn/ui` components for a consistent and accessible UI.
- **State Management**: 
    - **Server State**: Primarily managed by Next.js Server Components for data fetching and display.
    - **Client State**: `useState` or `useReducer` for local component state in Client Components. Avoid global client-side state management unless absolutely necessary.
- **API Communication**: 
    - **Mutations**: Next.js Server Actions are the preferred method for all data mutations (e.g., creating polls, submitting votes).
    - **Data Fetching**: Data should be fetched directly in Server Components using the Supabase client. Avoid client-side data fetching with `useEffect` and `useState` in page components.
- **Utility Libraries**: `qrcode.react` for generating QR codes.

## Architecture & Code Style

- **Directory Structure**: Adhere to the standard Next.js App Router structure:
    - `/app`: Contains routes, pages, and layout files.
    - `/components/ui`: Dedicated for `shadcn/ui` components.
    - `/components`: For custom, reusable React components.
    - `/lib`: Houses Supabase client setup, utility functions, and Server Actions.
    - `/public`: For static assets like images and fonts.

- **Component Design**:
    - **Server Components**: Prefer Server Components for fetching and displaying data to leverage server-side rendering benefits and reduce client-side bundle size.
    - **Client Components**: Use `'use client'` directive only when interactivity (e.g., hooks, event listeners, browser-specific APIs) is strictly required.

- **Naming Conventions**:
    - **Component Files**: PascalCase (e.g., `CreatePollForm.tsx`, `PollCard.tsx`).
    - **Utility & Action Functions**: camelCase (e.g., `submitVote.ts`, `generateQRCode.ts`).
    - **Variables & Constants**: camelCase for variables, UPPER_SNAKE_CASE for global constants.

- **Error Handling**:
    - Implement `try/catch` blocks within Server Actions and Route Handlers to gracefully handle errors.
    - Utilize Next.js `error.tsx` files for handling errors within specific route segments, providing a better user experience.
    - Provide meaningful error messages to the user where appropriate.

- **API Keys & Secrets**:
    - **Never hardcode sensitive information**. All API keys, database credentials, and other secrets must be stored in environment variables.
    - Use `.env.local` for local development.
    - Access Supabase URL and keys via `process.env.NEXT_PUBLIC_SUPABASE_URL` (for client-side safe public keys) and `process.env.SUPABASE_SECRET_KEY` (for server-side only secret keys).

## Code Patterns to Follow

- **Form Submissions**: Always use a form that calls a Server Action to handle data submission. This minimizes client-side JavaScript and enhances performance.
- **API Routes**: Avoid creating separate API route handlers and using client-side `fetch` for form data submission. Server Actions are the designated mechanism for mutations.
- **Data Fetching**: Fetch data directly within Server Components. Do not use `useEffect` and `useState` for data fetching in page components.
- **Type Safety**: Leverage TypeScript's type system extensively for all data structures, function parameters, and return types to ensure type safety throughout the application.

## Verification Checklist
Before submitting any code, ensure the following points are verified:

- [ ] The code utilizes the Next.js App Router and prioritizes Server Components for data fetching.
- [ ] Server Actions are exclusively used for all data mutations (e.g., form submissions).
- [ ] The Supabase client is correctly configured and used for all database interactions.
- [ ] `shadcn/ui` components are used for UI elements where applicable, maintaining design consistency.
- [ ] All Supabase keys and other secrets are loaded from environment variables (`.env.local`) and are not hardcoded in the codebase.
- [ ] TypeScript is used effectively to ensure type safety.
- [ ] Error handling is implemented using `try/catch` blocks and `error.tsx` files where appropriate.
- [ ] Naming conventions are consistently applied across the project.