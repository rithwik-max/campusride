const Announcement = require("../models/Announcement");
const ChatSession = require("../models/ChatSession");
const { validateAnnouncement } = require("../models/Announcement");

exports.getAll = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate("creator", "name rollNumber phone")
      .sort({ travelDate: 1 });
    res.render("announcements/index", { title: "Ride Board - CampusRide", announcements });
  } catch (err) {
    req.flash("error", "Failed to load announcements.");
    res.redirect("/");
  }
};

exports.getNew = (req, res) => {
  res.render("announcements/new", { title: "Post a Ride - CampusRide" });
};

exports.postNew = async (req, res) => {
  const { error } = validateAnnouncement(req.body);
  if (error) {
    const messages = error.details.map((d) => d.message);
    req.flash("error", messages.join(", "));
    return res.redirect("/announcements/new");
  }

  try {
    const ann = new Announcement({ ...req.body, creator: req.user._id });
    await ann.save();
    req.flash("success", "Ride announcement posted! 🚌");
    res.redirect("/announcements");
  } catch (err) {
    req.flash("error", "Failed to post announcement.");
    res.redirect("/announcements/new");
  }
};

exports.requestJoin = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann || !ann.isActive) {
      req.flash("error", "Announcement not found or closed.");
      return res.redirect("/announcements");
    }

    if (ann.creator.toString() === req.user._id.toString()) {
      req.flash("error", "You cannot request to join your own ride.");
      return res.redirect("/announcements");
    }

    const alreadyRequested = ann.requests.some(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyRequested) {
      req.flash("error", "You have already sent a request.");
      return res.redirect("/announcements");
    }

    ann.requests.push({ user: req.user._id, name: req.user.name });
    await ann.save();

    req.flash("success", "Join request sent! Wait for the host to accept.");
    res.redirect("/announcements");
  } catch (err) {
    req.flash("error", "Failed to send request.");
    res.redirect("/announcements");
  }
};

exports.getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ creator: req.user._id })
      .populate("requests.user", "name rollNumber phone")
      .sort({ createdAt: -1 });
    res.render("announcements/my", { title: "My Rides - CampusRide", announcements });
  } catch (err) {
    req.flash("error", "Failed to load your announcements.");
    res.redirect("/announcements");
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id).populate("requests.user");
    if (!ann || ann.creator.toString() !== req.user._id.toString()) {
      req.flash("error", "Not authorized.");
      return res.redirect("/announcements/my");
    }

    const request = ann.requests.id(req.params.reqId);
    if (!request) {
      req.flash("error", "Request not found.");
      return res.redirect("/announcements/my");
    }

    request.status = "accepted";
    await ann.save();

    // Create or find chat session
    let chatSession = await ChatSession.findOne({ announcement: ann._id });
    if (!chatSession) {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      chatSession = await ChatSession.create({
        announcement: ann._id,
        participants: [ann.creator, request.user._id],
        expiresAt,
      });
    } else {
      if (!chatSession.participants.includes(request.user._id)) {
        chatSession.participants.push(request.user._id);
        await chatSession.save();
      }
    }

    req.flash("success", `Accepted! You can now chat with ${request.name}.`);
    res.redirect("/announcements/my");
  } catch (err) {
    req.flash("error", "Failed to accept request.");
    res.redirect("/announcements/my");
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann || ann.creator.toString() !== req.user._id.toString()) {
      req.flash("error", "Not authorized.");
      return res.redirect("/announcements/my");
    }

    const request = ann.requests.id(req.params.reqId);
    if (request) {
      request.status = "rejected";
      await ann.save();
    }

    req.flash("success", "Request rejected.");
    res.redirect("/announcements/my");
  } catch (err) {
    req.flash("error", "Failed to reject request.");
    res.redirect("/announcements/my");
  }
};

exports.closeAnnouncement = async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann || ann.creator.toString() !== req.user._id.toString()) {
      req.flash("error", "Not authorized.");
      return res.redirect("/announcements/my");
    }
    ann.isActive = false;
    await ann.save();
    req.flash("success", "Announcement closed.");
    res.redirect("/announcements/my");
  } catch (err) {
    req.flash("error", "Failed to close announcement.");
    res.redirect("/announcements/my");
  }
};
