const cron = require('node-cron');
const { completeEndedBookings } = require('./bookingService');

function startBookingStatusJob() {
  const timezone = process.env.CRON_TIMEZONE || 'Africa/Lagos';

  cron.schedule('0 12 * * *', async () => {
    try {
      const result = await completeEndedBookings();
      console.log(
        `Booking status cleanup complete: ${result.bookingsUpdated} bookings updated, ${result.roomsUpdated} rooms refreshed`,
      );
    } catch (error) {
      console.error('Booking status cleanup failed:', error.message || error);
    }
  }, { timezone });

  console.log(`Booking status cleanup scheduled for 12:00 daily (${timezone})`);
}

module.exports = { startBookingStatusJob };
