const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// hena b t clean up el uploaded files
const cleanupFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  }
};


const signup = async (req, res) => {
  try {
    console.log('Signup Data:', req.body, 'File:', req.file);
    const { username, email, password, confirmPassword } = req.body;
    const photo = req.file?.filename || 'profile.png';

    if (!username || !email || !password || !confirmPassword) {
      if (req.file) cleanupFile(photo);
      return res.status(400).json({ status: 'fail', message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      if (req.file) cleanupFile(photo);
      return res.status(400).json({ status: 'fail', message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (req.file) cleanupFile(photo);
      return res.status(400).json({ status: 'fail', message: 'User already exists' });
    }

    const user = await User.create({ username, email, password, photo });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: 'success',
      token,
      data: { user: { id: user._id, username, email, photo } },
    });
  } catch (error) {
    if (req.file) cleanupFile(req.file?.filename);
    console.error('Signup Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};


const login = async (req, res) => {
  try {
    console.log('Login Data:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ status: 'fail', message: 'Incorrect password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: 'success',
      token,
      data: { user: { id: user._id, username: user.username, email: user.email, photo: user.photo } },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Protect routes middleware 34an el security for users
const protectRoutes = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer')) {
      token = token.split(' ')[1];
    }

    if (!token) return res.status(401).json({ status: 'fail', message: 'Not logged in' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ status: 'fail', message: 'User not found' });

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Protect Routes Error:', error);
    res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
};

// Add toy to favorites
const addToFavorites = async (req, res) => {
  try {
    console.log('Add to Favorites Data:', req.body);
    const user = await User.findById(req.userId);
    const { toyId } = req.body;

    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    if (!toyId) return res.status(400).json({ status: 'fail', message: 'toyId is required' });

    if (user.favToys?.includes(toyId)) {
      return res.status(400).json({ status: 'fail', message: 'Toy already in favorites' });
    }

    user.favToys = user.favToys || [];
    user.favToys.push(toyId);
    await user.save();

    res.status(200).json({ status: 'success', message: 'Toy added to favorites' });
  } catch (error) {
    console.error('Add to Favorites Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ status: 'success', count: users.length, users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

    res.status(200).json({ status: 'success', user });
  } catch (error) {
    console.error('Get User by ID Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

// Update user by ID
const updateUser = async (req, res) => {
  try {
    console.log('Update User Data:', req.body, 'File:', req.file);
    const { username, email } = req.body;
    const photo = req.file?.filename;

    const updateData = { username, email, photo };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      if (req.file) cleanupFile(req.file.filename);
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', user: updatedUser });
  } catch (error) {
    if (req.file) cleanupFile(req.file.filename);
    console.error('Update User Error:', error);
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

module.exports = {
  signup,
  login,
  protectRoutes,
  addToFavorites,
  getAllUsers,
  getUserById,
  updateUser,
};