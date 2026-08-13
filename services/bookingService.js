const prisma = require('./prisma');

function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  return dayCount * pricePerNight;
}

async function isRoomAvailableForRange(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const where = {
    roomId,
    status: {
      in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'RESERVED'],
    },
    AND: [
      {
        checkInDate: {
          lt: checkOut,
        },
      },
      {
        checkOutDate: {
          gt: checkIn,
        },
      },
    ],
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  const overlapping = await prisma.booking.findFirst({ where });
  return !overlapping;
}

async function getRoomCurrentStatus(roomId) {
  const today = new Date();

  const activeBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
      },
      checkInDate: {
        lte: today,
      },
      checkOutDate: {
        gt: today,
      },
    },
  });

  if (activeBooking) {
    return 'BOOKED';
  }

  const futureReservationOrBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: {
        in: ['RESERVED', 'CONFIRMED', 'PENDING'],
      },
      checkInDate: {
        gt: today,
      },
    },
    orderBy: {
      checkInDate: 'asc',
    },
  });

  if (futureReservationOrBooking) {
    return 'RESERVED';
  }

  return 'AVAILABLE';
}

async function refreshRoomStatus(roomId) {
  const status = await getRoomCurrentStatus(roomId);
  await prisma.room.update({
    where: { id: roomId },
    data: { status },
  });
}


async function createBooking({ roomId, guestName, guestEmail, checkInDate, checkOutDate, guests = 1 }) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw new Error('Room not found');
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  if (checkOut <= checkIn) {
    throw new Error('Checkout date must be after check-in date');
  }

  const available = await isRoomAvailableForRange(roomId, checkIn, checkOut);
  if (!available) {
    throw new Error('Room is already booked or reserved for the selected dates');
  }

  const totalPrice = calculateTotalPrice(room.pricePerNight, checkIn, checkOut);

  const booking = await prisma.booking.create({
    data: {
      roomId,
      guestName,
      guestEmail,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests,
      totalPrice,
      status: 'CONFIRMED',
    },
  });

  await refreshRoomStatus(roomId);
  return booking;
}

async function extendBooking({ bookingId, newCheckOutDate }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { room: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const currentCheckOut = new Date(booking.checkOutDate);
  const extendedDate = new Date(newCheckOutDate);

  if (extendedDate <= currentCheckOut) {
    throw new Error('New checkout date must be later than current checkout date');
  }

  const available = await isRoomAvailableForRange(booking.roomId, booking.checkInDate, extendedDate, bookingId);
  if (!available) {
    throw new Error('The room is not available for the extended booking period');
  }

  const totalPrice = calculateTotalPrice(booking.room.pricePerNight, booking.checkInDate, extendedDate);

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      checkOutDate: extendedDate,
      totalPrice,
      status: 'CONFIRMED',
    },
  });

  await refreshRoomStatus(booking.roomId);
  return updatedBooking;
}

async function getBookingById(bookingId) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: true,
    },
  });
}

async function listBookings() {
  return prisma.booking.findMany({
    include: { room: true },
    orderBy: { checkInDate: 'asc' },
  });
}

module.exports = {
  createBooking,
  extendBooking,
  getBookingById,
  listBookings,
};
