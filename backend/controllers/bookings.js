const Booking = require('../models/Booking');
const Campground = require('../models/Campground');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
    let query;
    //General users can see only their bookings
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id }).populate({ path: 'campground', select: 'name address tel' });
    } else {
      //Admins can see all bookings
      if (req.params.bookingId) {
        query = Booking.find({ booking: req.params.bookingId }).populate({ path: 'campground', select: 'name address tel' });
      } else {
        query = Booking.find().populate({ path: 'campground', select: 'name address tel' });
      }
    }
    try {
      const bookings = await query;

      return res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Cannot find Bookings' });
    }
};

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({ path: 'campground', select: 'name address tel' });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        return res.status(200).json({ success: true, data: booking });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if (!campground) {
            return res.status(404).json({ success: false, message: 'Campground not found' });
        }

        req.body.user = req.user.id;

        const existingBooking = await Booking.find({ user: req.user.id });

        if (existingBooking.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({ success: false, message: 'The user has already made 3 bookings' });
        }        

        const booking = await Booking.create(req.body);

        return res.status(201).json({ success: true, data: booking });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        //Make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({ success: true, data: booking });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        //Make sure user is booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this booking' });
        }

        await booking.deleteOne();

        return res.status(200).json({ success: true, data: {} });
    }
    catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
};