const prisma = require('./prisma');

async function createReservation({ roomId, guestName, guestEmail, holdFrom, holdUntil, guests = 1, notes }) {
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

async function listReservations() {
  return prisma.reservation.findMany({ include: { room: true }, orderBy: { holdFrom: 'asc' } });
}

async function getReservationById(id) {
  return prisma.reservation.findUnique({ where: { id }, include: { room: true } });
}

module.exports = {
  createReservation,
  listReservations,
  getReservationById,
};
