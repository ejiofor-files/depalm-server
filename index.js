const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();
// Increase JSON/body size limits to accept image previews or larger payloads from the client
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// CORS: allow frontend origin(s) defined in FRONTEND_ORIGIN (comma-separated)
// Example: FRONTEND_ORIGIN=http://localhost:3000 or FRONTEND_ORIGIN=http://localhost:3000,https://app.example.com
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(cors({ origin: FRONTEND_ORIGIN ? FRONTEND_ORIGIN.split(',') : true, credentials: true }));

app.use('/api', apiRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Depalm server running on port ${port}`);
});
