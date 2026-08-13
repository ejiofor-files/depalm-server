const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
  createRoomController,
  updateRoomController,
  getRoomController,
  listRoomsController,
  uploadRoomMediaController,
  replaceRoomMediaController,
  deleteRoomMediaController,
} = require('../controllers/roomController');

const requireRole = require('../middleware/requireRole');
const router = express.Router();

router.get('/', listRoomsController);
router.post('/', requireRole(['ADMIN']), createRoomController);
router.get('/:id', getRoomController);
router.patch('/:id', requireRole(['ADMIN']), updateRoomController);

// Upload a single media file for a room. Body may include `index` to place ordering.
router.post('/:id/media', requireRole(['ADMIN']), upload.single('file'), uploadRoomMediaController);

// Replace an existing room image by image id
router.put('/:id/media/:imageId', requireRole(['ADMIN']), upload.single('file'), replaceRoomMediaController);

// Delete media by storage path
router.delete('/:id/media', requireRole(['ADMIN']), deleteRoomMediaController);
router.delete('/media', requireRole(['ADMIN']), deleteRoomMediaController);

module.exports = router;
