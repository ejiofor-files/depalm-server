const prisma = require('./prisma');

// Helper to format reservation response with ISO 8601 dates
function formatReservationResponse(reservation) {
  return {
    ...reservation,
    holdFrom: reservation.holdFrom.toISOString(),
    holdUntil: reservation.holdUntil.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  };
}

async function createReservation({ roomId, guestName, guestEmail, holdFrom, holdUntil, guests = 1, notes, source = 'PUBLIC' }) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('Room not found');

  // Parse as ISO 8601 UTC
  const from = new Date(holdFrom);
  const until = new Date(holdUntil);
  
  // Validate dates are valid
  if (isNaN(from.getTime()) || isNaN(until.getTime())) {
    throw new Error('Invalid date format. Use ISO 8601: YYYY-MM-DDTHH:mm:ssZ');
  }
  
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

  return formatReservationResponse(reservation);
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
    data: data.map(formatReservationResponse),
    meta: {
      page,
      perPage,
      total,
      pages: Math.ceil(total / perPage),
    },
  };
}

async function getReservationById(id) {
  const reservation = await prisma.reservation.findUnique({ 
    where: { id }, 
    include: { room: true } 
  });
  
  return reservation ? formatReservationResponse(reservation) : null;
}

module.exports = {
  createReservation,
  listReservations,
  getReservationById,
  formatReservationResponse,
};
