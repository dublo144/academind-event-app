const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const singleEvent = async (eventId) => {
  try {
    const event = await EventModel.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    const events = await EventModel.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return transformEvent(event);
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

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  };
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
