const { createRoom, updateRoom, getRoomById, listRooms, addRoomImage } = require('../services/roomService');
const { replaceRoomImage } = require('../services/roomService');
const { uploadFile, deleteFile } = require('../services/storageService');

// multer file upload handled in route; req.file is available
async function uploadRoomMediaController(req, res) {
  try {
    const roomId = req.params.id;
    const index = req.body.index ? parseInt(req.body.index, 10) : 0;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const result = await uploadFile({
      fileBuffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      roomId,
      index,
    });

    // Persist uploaded media into RoomImage table and mark primary if index === 0
    try {
      const isPrimary = index === 0;
      const updatedRoom = await addRoomImage(roomId, { url: result.url, altText: '', isPrimary });
      // try to attach imageId for convenience: find image matching url
      const created = updatedRoom.images.find((i) => i.url === result.url);
      if (created) result.imageId = created.id;
      return res.status(201).json({ success: true, data: { upload: result, room: updatedRoom } });
    } catch (e) {
      console.error('failed to persist room image:', e);
      // still return upload result so frontend can show preview
      return res.status(201).json({ success: true, data: { upload: result } });
    }
  } catch (error) {
    console.error('uploadRoomMediaController error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}

async function replaceRoomMediaController(req, res) {
  try {
    const roomId = req.params.id;
    const imageId = req.params.imageId;
    const index = req.body.index ? parseInt(req.body.index, 10) : 0;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // find existing room/image
    const room = await getRoomById(roomId);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });

    const existing = room.images.find((i) => String(i.id) === String(imageId));
    const oldUrl = existing ? existing.url : null;

    const result = await uploadFile({
      fileBuffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      roomId,
      index,
    });

    const isPrimary = index === 0;
    const updatedRoom = await replaceRoomImage(roomId, imageId, { url: result.url, altText: '', isPrimary });

    // attempt to delete old file if it was in our bucket
    try {
      if (oldUrl && oldUrl.includes('/storage/v1/object/public/room-media/')) {
        const parts = oldUrl.split('/storage/v1/object/public/room-media/');
        if (parts[1]) {
          await deleteFile(parts[1]);
        }
      }
    } catch (delErr) {
      console.warn('failed to delete old file:', delErr?.message || delErr);
    }

    // include imageId on result
    result.imageId = Number(imageId);
    return res.status(200).json({ success: true, data: { upload: result, room: updatedRoom } });
  } catch (error) {
    console.error('replaceRoomMediaController error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}

async function deleteRoomMediaController(req, res) {
  try {
    const { path, imageId } = req.body;
    if (!path && !imageId) return res.status(400).json({ success: false, error: 'path or imageId is required' });

    // delete storage file if path provided
    if (path) {
      try {
        await deleteFile(path);
      } catch (err) {
        console.warn('failed to delete storage file:', err?.message || err);
      }
    }

    // delete DB record if imageId provided
    if (imageId) {
      const prisma = require('../services/prisma');
      try {
        await prisma.roomImage.delete({ where: { id: Number(imageId) } });
      } catch (err) {
        console.warn('failed to delete DB image record:', err?.message || err);
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function createRoomController(req, res) {
  try {
    const room = await createRoom(req.body);
    return res.status(201).json({ success: true, data: room });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function updateRoomController(req, res) {
  try {
    const room = await updateRoom(req.params.id, req.body);
    return res.json({ success: true, data: room });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function getRoomController(req, res) {
  try {
    const room = await getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found' });
    }
    return res.json({ success: true, data: room });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function listRoomsController(req, res) {
  try {
    const rooms = await listRooms();
    return res.json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createRoomController,
  updateRoomController,
  getRoomController,
  listRoomsController,
  uploadRoomMediaController,
  deleteRoomMediaController,
  replaceRoomMediaController,
};
