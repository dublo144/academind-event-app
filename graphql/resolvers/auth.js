const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user');

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
  }
};
