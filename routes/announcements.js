const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/announcementController");
const { isLoggedIn } = require("../middlewares/auth");

router.get("/", isLoggedIn, ctrl.getAll);
router.get("/new", isLoggedIn, ctrl.getNew);
router.post("/new", isLoggedIn, ctrl.postNew);
router.get("/my", isLoggedIn, ctrl.getMyAnnouncements);
router.post("/:id/request", isLoggedIn, ctrl.requestJoin);
router.post("/:id/accept/:reqId", isLoggedIn, ctrl.acceptRequest);
router.post("/:id/reject/:reqId", isLoggedIn, ctrl.rejectRequest);
router.post("/:id/close", isLoggedIn, ctrl.closeAnnouncement);

module.exports = router;
