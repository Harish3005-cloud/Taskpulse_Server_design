const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const env = require('./env');
const User = require('../../modules/auth/auth.model');
const Workspace = require('../../modules/workspaces/workspaces.model');
const { logger } = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // 1. Find or create user
        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
          isNewUser = true;
          user = await User.create({ email, name, googleId, avatar });

          // Create default workspace and add user as owner
          await Workspace.create({
            name: `${name}'s Workspace`,
            createdBy: user._id,
            members: [{ userId: user._id, role: 'owner' }]
          });
        } else if (!user.googleId || user.avatar !== avatar) {
            // Update existing user with google info if it wasn't there
            user.googleId = googleId;
            user.avatar = avatar;
            await user.save();
        }

        // Pass user object to the next stage
        return done(null, { user, isNewUser });
      } catch (error) {
        logger.error('Error during Google OAuth:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
