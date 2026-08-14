const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();
// Simple request logger to assist debugging (prints method, path and time)
app.use((req, res, next) => {
  console.info(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});
// Increase JSON/body size limits to accept image previews or larger payloads from the client
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// CORS: allow frontend origin(s) defined in FRONTEND_ORIGIN (comma-separated)
// Example: FRONTEND_ORIGIN=https://depalmapartment.vercel.app
// Example: FRONTEND_ORIGIN=http://localhost:3000,https://app.example.com
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const allowedOrigins = (FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/api', apiRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Depalm server running on port ${port}`);
});
