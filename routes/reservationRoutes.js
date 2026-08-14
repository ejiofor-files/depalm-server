const express = require('express');
const { createReservationController, listReservationsController, getReservationController } = require('../controllers/reservationController');

const requireRole = require('../middleware/requireRole');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Public: allow unauthenticated users to create reservations (for website booking flow)
router.post('/', createReservationController);

// Protected: listing and retrieving reservations require auth + role
router.get('/', authMiddleware, requireRole(['ADMIN','RECEPTION']), listReservationsController);
router.get('/:id', authMiddleware, requireRole(['ADMIN','RECEPTION']), getReservationController);

module.exports = router;
