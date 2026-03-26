const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/auth");

router.get("/profile", isLoggedIn, (req, res) => {
  res.render("user/profile", { title: "My Profile - CampusRide" });
});

module.exports = router;
