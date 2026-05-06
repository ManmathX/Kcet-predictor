# KCET Predictor Admin Panel

A management interface for the KCET Predictor 2.0 database. This portal allows administrators to view, edit, create, and publish colleges to the main predictor website.

## Features

- **College Dashboard**: Search and filter through the complete list of colleges.
- **Draft/Publish Workflow**: Toggle college visibility on the live site.
- **Real-time Editing**: Update college details, cutoff ranks, and placement info instantly.
- **Secure Access**: Protected by an administrative password (synced with the backend).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set `VITE_API_URL` to point to your running backend (e.g., `http://localhost:5001/api`).

## Development

Run the development server:
```bash
npm run dev
```

The admin portal will be available at `http://localhost:5174` (or the port shown in your terminal).

## Production

Build the application:
```bash
npm run build
```

The output will be in the `dist` folder, ready for static hosting.
