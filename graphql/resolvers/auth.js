const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user');
const jwt = require('jsonwebtoken');

module.exports = {
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
  login: async ({ email, password }) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log('User not found');
      throw new Error('Invalid Credentials.');
    }
    const authenticated = await bcrypt.compare(password, user.password);
    if (!authenticated) {
      console.log('Incorrect Password');
      throw new Error('Invalid credentials.');
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.SECRET,
      {
        expiresIn: '1h'
      }
    );
    return {
      userId: user.id,
      token,
      tokenExpiration: 1
    };
  }
};
