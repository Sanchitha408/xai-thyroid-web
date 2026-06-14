const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

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

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: Google OAuth credentials missing in .env');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0]
            ? profile.emails[0].value
            : null;

          if (!email) {
            return done(new Error('No email from Google profile'), null);
          }

          let user = await User.findOne({ where: { email } });

          if (!user) {
            user = await User.create({
              id: uuidv4(),
              email,
              full_name: profile.displayName || 'Google User',
              password_hash: 'GOOGLE_OAUTH',
              role: 'patient',
              preferred_lang: 'en',
            });
          }

          return done(null, user);
        } catch (err) {
          console.error('Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
