const EventModel = require('../../models/event');
const BookingModel = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async () => {
    try {
      const bookings = await BookingModel.find();
      return bookings.map(transformBooking);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookEvent: async (args) => {
    try {
      const event = await EventModel.findOne({ _id: args.eventId });
      const booking = new BookingModel({
        user: '5ef1418289e49ab3cac71067',
        event
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await BookingModel.findById(bookingId).populate('event');
      const event = transformEvent(booking.event);
      await BookingModel.findByIdAndDelete(bookingId);
      return event;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
