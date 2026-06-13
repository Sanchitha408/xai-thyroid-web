// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase().trim() : null;
        if (!email) {
          return done(new Error('No email retrieved from Google profile.'), null);
        }

        // Check if user with this email already exists in DB
        let user = await User.findOne({ where: { email } });
        
        if (user) {
          // Link Google login to existing account and return
          return done(null, user);
        }

        // If no: create new user
        user = await User.create({
          full_name: profile.displayName || 'Google User',
          email,
          password_hash: 'GOOGLE_OAUTH', // placeholder, never used for standard login
          preferred_lang: 'en',
          role: 'patient',
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
