const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EventModel = require('./models/event');
const UserModel = require('./models/user');

const app = express();

app.use(bodyParser.json());

const events = async (eventIds) => {
  try {
    const events = await EventModel.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
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

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
      }

      type User {
        _id: ID!
        username: String!
        email: String!
        password: String
        createdEvents: [Event!]
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        username: String!
        email: String!,
        password: String!
      }

      type RootQuery {
        events: [Event!]!
      }

      type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: async () => {
        try {
          const events = await EventModel.find();
          return events.map((event) => ({
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event._doc.creator)
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
            creator: user.bind(this, result._doc.creator)
          };
          const user = await UserModel.findById('5ef1418289e49ab3cac71067');
          if (!user) {
            throw new Error('User not found');
          }
          user.createdEvents.push(savedEvent);
          await user.save();
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
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@cluster0-wabpp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
