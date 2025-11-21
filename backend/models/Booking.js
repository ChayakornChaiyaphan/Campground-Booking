const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookDate: {
        type: Date,
        required: [true, 'Please add a booking date'],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campground',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);