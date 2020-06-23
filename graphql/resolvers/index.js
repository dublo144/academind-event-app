const bcrypt = require('bcryptjs');

const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
const BookingModel = require('../../models/booking');

const singleEvent = async (eventId) => {
  try {
    const event = await EventModel.findById(eventId);
    return {
      ...event._doc,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event.creator)
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    const events = await EventModel.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const user = async (userID) => {
  try {
    const user = await UserModel.findById(userID);
    return {
      ...user._doc,
      id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await EventModel.find();
      return events.map((event) => ({
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      }));
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await BookingModel.find();
      return bookings.map((booking) => ({
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: new Date(booking._doc.createdAt).toISOString(),
        updatedAt: new Date(booking._doc.updatedAt).toISOString()
      }));
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createEvent: async (args) => {
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5ef1418289e49ab3cac71067'
    });
    try {
      const result = await event.save();
      const savedEvent = {
        ...result._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await UserModel.findById('5ef1418289e49ab3cac71067');
      if (!creator) {
        throw new Error('User not found');
      }
      creator.createdEvents.push(savedEvent);
      await creator.save();
      return { ...savedEvent._doc, _id: event.id };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      // Check existing email
      const existingUser = await UserModel.findOne({
        email: args.userInput.email
      });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash PW
      const hashedPw = await bcrypt.hash(args.userInput.password, 12);
      const user = new UserModel({
        username: args.userInput.username,
        email: args.userInput.email,
        password: hashedPw
      });

      // Save User
      const savedUser = await user.save();
      return { ...savedUser._doc, password: null, id: savedUser.id };
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
      return {
        ...result._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: new Date(booking._doc.createdAt).toISOString(),
        updatedAt: new Date(booking._doc.updatedAt).toISOString()
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await BookingModel.findById(bookingId).populate('event');
      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await BookingModel.findByIdAndDelete(bookingId);
      return event;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
