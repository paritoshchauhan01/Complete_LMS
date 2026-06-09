const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { updateProfileValidation } = require('../middleware/validations/authValidation');
const validate = require('../middleware/validate');

// ─── Google OAuth ──────────────────────────────────────────────────────────
// Step 1: Redirect to Google
// Optional: pass ?inviteToken=xxx to link a teacher invite to the OAuth flow
router.get('/google', (req, res, next) => {
  const inviteToken = req.query.inviteToken;

  // Encode extra data in the OAuth state param (base64 JSON)
  const state = inviteToken
    ? Buffer.from(JSON.stringify({ inviteToken })).toString('base64')
    : undefined;

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    ...(state ? { state } : {}),
  })(req, res, next);
});

// Step 2: Google redirects back here
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_failed`,
    })(req, res, next);
  },
  authController.googleCallback
);

// ─── Teacher invitation info (for accept page) ─────────────────────────────
router.get('/register/teacher/:token', adminController.getInvitationByToken);

// ─── Protected routes ──────────────────────────────────────────────────────
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, updateProfileValidation, validate, authController.updateProfile);

module.exports = router;
