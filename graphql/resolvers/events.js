const EventModel = require('../../models/event');
const UserModel = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await EventModel.find();
      return events.map(transformEvent);
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated.');
    }
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });
    try {
      const result = await event.save();
      const savedEvent = transformEvent(result);
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
  }
};
