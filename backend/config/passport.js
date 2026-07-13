const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (!email) {
        console.error("Google OAuth Error: No email found in profile");
        return done(null, false, { message: "No email provided by Google." });
      }

      let user = await User.findOne({ email });

      if (user) {
        if (user.authProvider === 'local') {
          return done(null, false, { message: 'Email already registered manually. Please login with password.' });
        }
        if (user.authProvider === 'google') {
          return done(null, user);
        }
      } else {
        user = await User.create({
          name:         profile.displayName,
          email:        email,
          authProvider: 'google',
          providerId:   profile.id,
          password:     null,
          avatar:       profile.photos?.[0]?.value || '',
        });
        return done(null, user);
      }
    } catch (error) {
      return done(error, false);
    }
  }
));

module.exports = passport;
