const { createBooking, extendBooking, getBookingById, listBookings } = require('../services/bookingService');

async function createBookingController(req, res) {
  try {
    const booking = await createBooking(req.body);
    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function extendBookingController(req, res) {
  try {
    const booking = await extendBooking({ bookingId: Number(req.params.id), newCheckOutDate: req.body.newCheckOutDate });
    return res.json({ success: true, data: booking });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function listBookingsController(req, res) {
  try {
    const bookings = await listBookings();
    return res.json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getBookingController(req, res) {
  try {
    const booking = await getBookingById(Number(req.params.id));
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    return res.json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createBookingController,
  extendBookingController,
  listBookingsController,
  getBookingController,
};
