const User = require('../models/User');

exports.updateUser = async (req, res) => {
  try {
    const { username, email, profilePicture, firstName, lastName, birthday } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (profilePicture) user.profilePicture = profilePicture;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthday) user.birthday = birthday;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
