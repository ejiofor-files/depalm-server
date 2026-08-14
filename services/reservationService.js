const prisma = require('./prisma');

async function createReservation({ roomId, guestName, guestEmail, holdFrom, holdUntil, guests = 1, notes, source = 'PUBLIC' }) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('Room not found');

  const from = new Date(holdFrom);
  const until = new Date(holdUntil);
  if (until <= from) throw new Error('Hold end must be after start');

  const reservation = await prisma.reservation.create({
    data: {
      roomId,
      guestName,
      guestEmail,
      holdFrom: from,
      holdUntil: until,
      guests,
      notes,
      source: source,
      status: 'RESERVED',
    },
  });

  // Optionally refresh room status using bookingService logic
  try {
    const { refreshRoomStatus } = require('./bookingService');
    await refreshRoomStatus(roomId);
  } catch (e) {
    // ignore if bookingService not available
  }

  return reservation;
}

async function listReservations({ page = 1, perPage = 50, where = {} } = {}) {
  const skip = (page - 1) * perPage;
  
  const [data, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: { room: true },
      orderBy: { holdFrom: 'asc' },
      skip,
      take: perPage,
    }),
    prisma.reservation.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      perPage,
      total,
      pages: Math.ceil(total / perPage),
    },
  };
}

async function getReservationById(id) {
  return prisma.reservation.findUnique({ where: { id }, include: { room: true } });
}

module.exports = {
  createReservation,
  listReservations,
  getReservationById,
};
