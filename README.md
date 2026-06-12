# Media Share Frontend

Frontend for Temp Media Share, a YOPmail-inspired temporary file sharing app.

This app provides:

- Upload flow with expiry and optional limits
- Public download page for shared files
- QR code sharing support
- Responsive UI built with React + Vite + Tailwind CSS v4 + shadcn-style UI primitives

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4
- Radix/Base UI primitives

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend service from `../backend`

## Environment Variables

Create a `.env` file inside this `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_PUBLIC_BASE_URL=http://localhost:5173
```

- `VITE_API_BASE_URL`: Base URL of the Node backend API
- `VITE_PUBLIC_BASE_URL`: Public URL where this frontend is served

Use your LAN IP instead of `localhost` when testing from other devices on the network.

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

By default, Vite runs with `--host` so the app can be accessed from your local network.

## Available Scripts

- `npm run dev`: Start Vite development server
- `npm run build`: Type-check and create production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint
- `npm run typecheck`: Run TypeScript checks
- `npm run format`: Format `ts`/`tsx` files using Prettier

## Build For Production

```bash
npm run build
npm run preview
```

## Project Structure

```text
frontend/
	src/
		api/            # API clients and file endpoints
		components/     # Reusable UI + app-level components
		pages/          # Upload and download pages
		hooks/          # Shared hooks
		lib/            # Utilities
		types/          # Shared TypeScript types
```

## Backend Integration

The frontend calls file endpoints under `/api/files` exposed by the backend service.

Typical local setup:

1. Start backend in `../backend`.
2. Ensure `VITE_API_BASE_URL` points to backend.
3. Start frontend with `npm run dev`.

## Notes

- Keep backend CORS configuration aligned with this frontend URL.
- If links or QR codes point to the wrong host, verify `VITE_PUBLIC_BASE_URL`.
