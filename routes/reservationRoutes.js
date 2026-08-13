const express = require('express');
const { createReservationController, listReservationsController, getReservationController } = require('../controllers/reservationController');

const requireRole = require('../middleware/requireRole');
const router = express.Router();

router.get('/', listReservationsController);
// allow both RECEPTION and ADMIN to create reservations
router.post('/', requireRole(['RECEPTION','ADMIN']), createReservationController);
router.get('/:id', getReservationController);

module.exports = router;
