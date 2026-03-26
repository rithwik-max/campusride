const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { isLoggedIn } = require("../middlewares/auth");

router.get("/", isLoggedIn, chatController.getMySessions);
router.get("/:sessionId", isLoggedIn, chatController.getChat);

module.exports = router;
