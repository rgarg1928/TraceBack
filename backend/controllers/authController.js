const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tracebacksecret12345', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, contactNumber } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Role safety check: Cannot register directly as Super Admin
    let chosenRole = role || 'Student';
    if (chosenRole === 'Super Admin') {
      chosenRole = 'Student';
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: chosenRole,
      contactNumber,
      profilePic: ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      contactNumber: req.body.contactNumber
    };

    if (req.file) {
      fieldsToUpdate.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic !== undefined) {
      fieldsToUpdate.profilePic = req.body.profilePic;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    // Get user
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Map to store temporary reset tokens in-memory (alternative to dynamic schemas since we want a simple setup)
// Or we can dynamically use standard crypto token generation and save to User schema. Let's just do a simple User schema bypass or save reset details directly in User schema. Wait, let's keep it simple: we can do a reset token stored directly on user model! Wait, we didn't add passwordResetToken to schema, but mongoose allows schema updates or we can just update User schema, or write a simple collection. Let's add reset token fields directly in the controller or user object, or we can look up/update User schema since we wrote it. Let's look: User model can have reset token fields dynamically added by Mongoose, or we can just search user by email and use standard password hashing.
// Let's implement an in-memory reset store for simplicity and absolute reliability without altering database schemas repeatedly, OR we can just write token and expiry in a small user update. Yes, mongoose allows saving fields even if not in schema, but to be safe and clean, let's store it in a simple global map in-memory! This is extremely fast and robust for localhost/Render single-instance node server:
const resetPasswordTokens = new Map(); // token -> { userId, expires }

// @desc    Forgot Password - request reset link
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Store token (expires in 10 minutes)
    resetPasswordTokens.set(resetToken, {
      userId: user._id.toString(),
      expires: Date.now() + 10 * 60 * 1000
    });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    console.log(`Reset password link generated: ${resetUrl}`);

    // In a real app we send email. For traceback, we will return the reset token and reset URL in the response
    // so the client can navigate to the reset page and make the request directly!
    res.status(200).json({
      success: true,
      message: 'Email sent (Simulation: Check response or server console for reset URL)',
      resetToken,
      resetUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    const session = resetPasswordTokens.get(resettoken);

    if (!session || session.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set new password
    user.password = password;
    await user.save();

    // Clean token
    resetPasswordTokens.delete(resettoken);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
