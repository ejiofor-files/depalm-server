const express = require('express');
const { createBookingController, extendBookingController, listBookingsController, getBookingController } = require('../controllers/bookingController');

const requireRole = require('../middleware/requireRole');
const router = express.Router();

router.get('/', listBookingsController);
// allow both RECEPTION and ADMIN to create bookings
router.post('/', requireRole(['RECEPTION','ADMIN']), createBookingController);
router.patch('/:id/extend', requireRole(['RECEPTION','ADMIN']), extendBookingController);
router.get('/:id', getBookingController);

module.exports = router;
