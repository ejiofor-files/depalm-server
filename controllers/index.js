const { fetchStatus } = require('../services');

function getStatus(req, res) {
  const data = fetchStatus();
  res.json({ success: true, data });
}

module.exports = {
  getStatus,
};
