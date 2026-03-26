const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash("error", "Please login to continue.");
  res.redirect("/login");
};

const isGuest = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.redirect("/announcements");
};

module.exports = { isLoggedIn, isGuest };
