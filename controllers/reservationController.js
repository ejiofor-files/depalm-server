const { createReservation, listReservations, getReservationById } = require('../services/reservationService');

// basic validation middleware could be added here in future

async function createReservationController(req, res) {
  try {
    const actor = req.user?.email || 'public';
    const userRole = req.user?.role || null;
    
    // Determine source based on auth and role
    let source = 'PUBLIC';
    if (req.user && userRole === 'ADMIN') {
      source = 'ADMIN';
    } else if (req.user && userRole === 'RECEPTION') {
      source = 'RECEPTION';
    }
    
    console.info('[createReservation] request by', actor, 'source=', source, 'payloadKeys=', Object.keys(req.body || {}));

    // Basic validation
    const { roomId, guestName, holdFrom, holdUntil, guests } = req.body || {};
    if (!roomId || !guestName || !holdFrom || !holdUntil) {
      console.warn('[createReservation] validation failed', { actor, body: req.body });
      return res.status(400).json({ success: false, error: 'Missing required fields: roomId, guestName, holdFrom, holdUntil' });
    }

    // normalize types
    const payload = {
      roomId: Number(roomId),
      guestName: String(guestName),
      guestEmail: req.body.guestEmail || null,
      holdFrom: holdFrom,
      holdUntil: holdUntil,
      guests: guests ? Number(guests) : 1,
      notes: req.body.notes || null,
      source: source,
    };

    const reservation = await createReservation(payload);
    console.info('[createReservation] created', { id: reservation.id, actor, source });
    return res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error('[createReservation] failed', { message: error.message, stack: error.stack });
    return res.status(400).json({ success: false, error: error.message });
  }
}

async function listReservationsController(req, res) {
  try {
    const { page = 1, perPage = 50, source, status, roomId } = req.query;
    
    // Build filter
    const where = {};
    if (source) where.source = source;
    if (status) where.status = status;
    if (roomId) where.roomId = Number(roomId);
    
    const reservations = await listReservations({ 
      page: Number(page), 
      perPage: Number(perPage),
      where 
    });
    
    return res.json({ success: true, ...reservations });
  } catch (error) {
    console.error('[listReservations] failed', error.message);
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
