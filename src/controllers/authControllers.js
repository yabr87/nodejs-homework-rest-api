const { User } = require('../models/user');
const { HttpError, ctrlWrapper, resizeImage } = require('../helpers');
const generateAndSaveUserToken = require('../utils/generateAndSaveUserToken');

const gravatar = require('gravatar');
const path = require('path');
const bcrypt = require('bcryptjs');

const avatarsDir = path.join(__dirname, '../../', 'public', 'avatars');

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new HttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const registeredUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  const newToken = await generateAndSaveUserToken(registeredUser);

  res.status(201).json({
    user: {
      name: registeredUser.name,
      email: registeredUser.email,
    },
    token: newToken,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, 'Email  or password invalid');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw new HttpError(401, 'Email  or password invalid');
  }

  const newToken = await generateAndSaveUserToken(user);
  res.json({
    user: {
      name: user.name,
      email: user.email,
    },
    token: newToken,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });
  res.status(204).json({ message: 'Logout susses' });
};

const getCurrent = async (req, res) => {
  const { name, email } = req.user;

  res.json({ name, email });
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;

  await User.findByIdAndUpdate(_id, { subscription });
  res
    .status(201)
    .json({ message: `subscription upgraded to ${subscription} version` });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, filename } = req.file;

  const resultUpload = path.join(avatarsDir, filename);
  // await fs.rename(tempUpload, tempUpload);
  await resizeImage(tempUpload, resultUpload);

  const avatarURL = path.join('avatars', filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
