# KCET Predictor Backend

This is the Node.js/Express backend for the KCET Predictor 2.0. It manages the college database, publication status, and provides the API for both the predictor frontend and the admin panel.

## Features

- **College Management**: Full CRUD for college details.
- **Publication Workflow**: Support for Draft vs. Published status.
- **Seeding**: Built-in scripts to seed initial college data from `data.json`.
- **Security**: Basic password protection for administrative routes.

## Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` and `ADMIN_PASSWORD`

3. Seed the database (optional):
   ```bash
   node seed-colleges.js
   ```

## Development

Run the server with hot-reload:
```bash
npm run dev
```

The server will be available at `http://localhost:5001`.

## API Endpoints

- `GET /api/colleges`: List all published colleges.
- `GET /api/colleges/:id`: Get detailed info for a specific college.
- `POST /api/colleges`: Create/Update a college (Requires ADMIN_PASSWORD).
- `GET /api/health`: Service health check.
