const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_cabflow_jwt_key_2026_secure', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const { connected } = getDBStatus();

    if (connected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        phone: phone || '+1 (555) 000-0000',
        role: role || 'customer',
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    }

    // In-Memory store handling
    const existing = memoryStore.users.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '+1 (555) 000-0000',
      role: role || 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      savedPlaces: [],
      createdAt: new Date(),
    };

    memoryStore.users.push(newUser);

    return res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const { connected } = getDBStatus();

    let user;
    if (connected) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            savedPlaces: user.savedPlaces,
            token: generateToken(user._id),
          },
        });
      }
    } else {
      user = memoryStore.users.find((u) => u.email === email.toLowerCase());
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          success: true,
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
            savedPlaces: user.savedPlaces || [],
            token: generateToken(user._id),
          },
        });
      }
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Demo login with one click
// @route   POST /api/auth/demo-login
const demoLogin = async (req, res) => {
  try {
    const { role } = req.body; // 'customer' | 'driver' | 'admin'
    const targetRole = role || 'customer';

    const { connected } = getDBStatus();
    let user;

    if (connected) {
      user = await User.findOne({ role: targetRole });
    }

    if (!user) {
      user = memoryStore.users.find((u) => u.role === targetRole);
    }

    if (!user) {
      // Fallback first user
      user = memoryStore.users[0];
    }

    return res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedPlaces: user.savedPlaces || [],
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { connected } = getDBStatus();
    let user;

    if (connected) {
      user = await User.findById(req.user._id).select('-password');
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === req.user._id.toString());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        savedPlaces: user.savedPlaces || [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
};
