# Depalm Server

This folder contains the Node.js backend for the Depalm project.

## Setup

1. cd "depalm server"
2. npm install
3. npm run prisma generate
4. npm run dev

## Structure

- `index.js` - Express app entry point
- `routes/` - route definitions
- `controllers/` - request handlers
- `services/` - business logic
- `prisma/` - Prisma schema and generated client

## Notes

- The current database is SQLite using `DATABASE_URL=file:./dev.db`
- Add routes/controllers/services as needed for your API
