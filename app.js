const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const app = express();
const User = require("./models/User");
const { forwardAuthenticated, ensureAuthenticated } = require("./config/auth");
const { restrictTo } = require("./config/restrictTo.js");
// Passport Config
require("./config/passport.js")(passport);
const cors = require("cors");
// DB Config
const db = require("./config/key").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true })); // Parses form data (x-www-form-urlencoded)
app.use(express.json()); // Parses JSON data
app.use(cors());

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

app.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
app.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
app.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post("/login", (req, res, next) => {
  req.body.role = req.body.role || "user"; // Ensure role is always defined

  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error_msg", info.message);
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      // Redirect based on role
      if (user.role === "admin") {
        return res.redirect("/admin/dashboard");
      } else {
        return res.redirect("/users/dashboard");
      }
    });
  })(req, res, next);
});

// Routes
app.use("/users", ensureAuthenticated, require("./routes/user.js"));
app.use("/admin", ensureAuthenticated,restrictTo(['admin']), require("./routes/admin.js"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
