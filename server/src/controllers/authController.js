const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// ─── Google OAuth callback ───────────────────────────────────────────────────
const googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Include role so frontend can redirect correctly (e.g., teacher → dashboard)
    res.redirect(`${clientUrl}/auth/callback?token=${token}&role=${req.user.role}`);
  } catch (err) {
    console.error('Google callback error:', err);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const userResponse = req.user.toJSON();
    delete userResponse.password;
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, courseField } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (courseField) updates.courseField = courseField;

    await req.user.update(updates);

    const userResponse = req.user.toJSON();
    delete userResponse.password;

    res.json({ message: 'Profile updated successfully', user: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = {
  googleCallback,
  getProfile,
  updateProfile,
};
