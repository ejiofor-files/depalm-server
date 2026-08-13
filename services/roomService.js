const prisma = require('./prisma');

async function createRoom({
  name,
  slug,
  type,
  description,
  capacity = 1,
  pricePerNight = 0,
  status = 'AVAILABLE',
  features,
  images,
}) {
  const data = {
    name,
    slug,
    type,
    description,
    capacity,
    pricePerNight,
    status,
    features,
  };

  if (images && Array.isArray(images)) {
    data.images = {
      create: images.map((image) => ({
        url: image.url,
        altText: image.altText ?? null,
        isPrimary: image.isPrimary ?? false,
      })),
    };
  }

  return prisma.room.create({
    data,
    include: { images: true },
  });
}

async function updateRoom(roomId, updates) {
  const data = {};
  const fields = [
    'name',
    'slug',
    'type',
    'description',
    'capacity',
    'pricePerNight',
    'status',
    'features',
  ];

  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      data[field] = updates[field];
    }
  });

  if (updates.images && Array.isArray(updates.images)) {
    data.images = {
      deleteMany: {},
      create: updates.images.map((image) => ({
        url: image.url,
        altText: image.altText ?? null,
        isPrimary: image.isPrimary ?? false,
      })),
    };
  }

  return prisma.room.update({
    where: { id: Number(roomId) },
    data,
    include: { images: true },
  });
}

async function getRoomById(roomId) {
  return prisma.room.findUnique({
    where: { id: Number(roomId) },
    include: { images: true },
  });
}

async function listRooms() {
  return prisma.room.findMany({
    include: { images: true },
    orderBy: { name: 'asc' },
  });
}

module.exports = {
  createRoom,
  updateRoom,
  getRoomById,
  listRooms,
  addRoomImage,
};

async function addRoomImage(roomId, { url, altText = null, isPrimary = false }) {
  const rId = Number(roomId);
  if (isPrimary) {
    // unset previous primary
    await prisma.roomImage.updateMany({ where: { roomId: rId }, data: { isPrimary: false } });
  }

  const img = await prisma.roomImage.create({
    data: {
      roomId: rId,
      url,
      altText,
      isPrimary,
    },
  });

  // return updated room with images
  return prisma.room.findUnique({ where: { id: rId }, include: { images: true } });
}

async function replaceRoomImage(roomId, imageId, { url, altText = null, isPrimary = false }) {
  const rId = Number(roomId);
  if (isPrimary) {
    await prisma.roomImage.updateMany({ where: { roomId: rId }, data: { isPrimary: false } });
  }

  await prisma.roomImage.update({
    where: { id: Number(imageId) },
    data: { url, altText, isPrimary },
  });

  return prisma.room.findUnique({ where: { id: rId }, include: { images: true } });
}

module.exports.replaceRoomImage = replaceRoomImage;

