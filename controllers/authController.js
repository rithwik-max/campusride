const passport = require("passport");
const User = require("../models/User");
const { validateUser } = require("../models/User");

exports.getRegister = (req, res) => {
  res.render("auth/register", { title: "Sign Up - CampusRide" });
};

exports.postRegister = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    const messages = error.details.map((d) => d.message);
    req.flash("error", messages.join(", "));
    return res.redirect("/register");
  }

  try {
    const { name, email, phone, rollNumber, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { rollNumber }] });
    if (existing) {
      req.flash("error", "Account already exists with this email or roll number.");
      return res.redirect("/register");
    }

    const user = new User({ name, email, phone, rollNumber, password });
    await user.save();

    req.login(user, (err) => {
      if (err) throw err;
      req.flash("success", `Welcome to CampusRide, ${user.name}! 🎉`);
      res.redirect("/announcements");
    });
  } catch (err) {
    req.flash("error", err.message || "Registration failed.");
    res.redirect("/register");
  }
};

exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Login - CampusRide" });
};

exports.postLogin = passport.authenticate("local", {
  successRedirect: "/announcements",
  failureRedirect: "/login",
  failureFlash: true,
});

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/login");
  });
};
