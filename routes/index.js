const express = require('express');
const { getStatus } = require('../controllers');
const bookingRoutes = require('./bookingRoutes');
const reservationRoutes = require('./reservationRoutes');
const roomRoutes = require('./roomRoutes');
const userRoutes = require('./userRoutes');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getStatus);
// Protect API endpoints that modify or return sensitive data
router.use('/bookings', authMiddleware, bookingRoutes);
// Mount reservations without global auth so the POST route can be public (public reservations)
router.use('/reservations', reservationRoutes);
router.use('/rooms', authMiddleware, roomRoutes);
router.use('/users', authMiddleware, userRoutes);

module.exports = router;
