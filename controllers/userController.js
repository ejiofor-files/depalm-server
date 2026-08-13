const { listUsers, getUserById } = require('../services/userService');

async function listUsersController(req, res) {
  try {
    const users = await listUsers();
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getUserController(req, res) {
  try {
    const user = await getUserById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  listUsersController,
  getUserController,
};
