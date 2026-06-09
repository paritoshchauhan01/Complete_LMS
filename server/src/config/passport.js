const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User, TeacherInvitation } = require('../models');
const { Op } = require('sequelize');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true, // allows us to read req.query.state (invite token)
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), null);

        // Check if there's a pending teacher invite token in state param
        let inviteToken = null;
        try {
          if (req.query.state) {
            const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
            inviteToken = stateData.inviteToken || null;
          }
        } catch (_) {}

        // If invite token provided, verify it
        let invitation = null;
        if (inviteToken) {
          invitation = await TeacherInvitation.findOne({
            where: {
              invitationToken: inviteToken,
              status: 'pending',
              expiresAt: { [Op.gt]: new Date() },
            },
          });

          if (!invitation) {
            return done(new Error('INVALID_INVITE_TOKEN'), null);
          }

          // The Google account email must match the invited email
          if (invitation.email.toLowerCase() !== email.toLowerCase()) {
            return done(new Error('WRONG_GOOGLE_ACCOUNT'), null);
          }
        }

        // Find or create the user
        let user = await User.findOne({ where: { email } });

        if (user) {
          // Existing user — update googleId / photo if needed
          const updates = {};
          if (!user.googleId) updates.googleId = profile.id;
          if (!user.profilePicture && profile.photos?.[0]?.value)
            updates.profilePicture = profile.photos[0].value;

          // If this user is accepting a teacher invite, upgrade their role
          if (invitation && user.role !== 'teacher' && user.role !== 'admin') {
            updates.role = 'teacher';
            updates.courseField = invitation.courseField || user.courseField;
          }

          if (Object.keys(updates).length > 0) await user.update(updates);
        } else {
          // Brand-new user
          const role = invitation ? 'teacher' : 'student';
          user = await User.create({
            firstName: profile.name?.givenName || profile.displayName.split(' ')[0] || 'User',
            lastName:
              profile.name?.familyName ||
              profile.displayName.split(' ').slice(1).join(' ') ||
              '',
            email,
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value || null,
            role,
            courseField: invitation?.courseField || null,
            isActive: true,
          });
        }

        // Mark invitation as accepted
        if (invitation) {
          invitation.status = 'accepted';
          await invitation.save();
          console.log(`✅ Teacher invite accepted: ${email} → role=teacher`);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
