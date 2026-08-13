const { createReservation, listReservations, getReservationById } = require('../services/reservationService');

// basic validation middleware could be added here in future

async function createReservationController(req, res) {
  try {
    const reservation = await createReservation(req.body);
    return res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function listReservationsController(req, res) {
  try {
    const reservations = await listReservations();
    return res.json({ success: true, data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function getReservationController(req, res) {
  try {
    const reservation = await getReservationById(Number(req.params.id));
    if (!reservation) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    return res.json({ success: true, data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createReservationController,
  listReservationsController,
  getReservationController,
};
