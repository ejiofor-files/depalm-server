const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();
// Increase JSON/body size limits to accept image previews or larger payloads from the client
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api', apiRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Depalm server running on port ${port}`);
});
