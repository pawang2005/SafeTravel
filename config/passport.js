const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true }, 
      (req, email, password, done) => {
        const { role } = req.body; // Get role from the request body

        // Find user by email
        User.findOne({ email: email }).then((user) => {
          if (!user) {
            return done(null, false, { message: "That email is not registered" });
          }

          // Check if role matches
          if (user.role !== role) {
            return done(null, false, { message: "Invalid Email or Password" });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
