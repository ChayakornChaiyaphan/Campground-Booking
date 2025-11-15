const express = require('express');
const { getBookings, getBooking, createBooking, updateBooking, deleteBooking } = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(protect, getBookings).post(protect, authorize('user', 'admin'), createBooking);
router.route('/:id').get(protect, getBooking).put(protect, authorize('user', 'admin'), updateBooking).delete(protect, authorize('user', 'admin'), deleteBooking);

module.exports = router;