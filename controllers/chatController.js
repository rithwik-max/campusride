const ChatSession = require("../models/ChatSession");
const ChatMessage = require("../models/ChatMessage");

// Auto numbers for Hyderabad/college area autos
const AUTO_CONTACTS = [
  { name: "Raju Auto", number: "9876543210" },
  { name: "Suresh Auto", number: "9845678901" },
  { name: "Venkat Auto", number: "9123456789" },
  { name: "Reddy Auto", number: "9988776655" },
  { name: "Kiran Auto", number: "9765432109" },
];

exports.getChat = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId).populate(
      "participants",
      "name rollNumber"
    );

    if (!session) {
      req.flash("error", "Chat session not found.");
      return res.redirect("/announcements");
    }

    const isParticipant = session.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      req.flash("error", "You are not part of this chat.");
      return res.redirect("/announcements");
    }

    const now = new Date();
    const isExpired = now > new Date(session.expiresAt);

    const messages = await ChatMessage.find({ session: session._id }).sort({ createdAt: 1 });

    res.render("chat/room", {
      title: "Chat Room - CampusRide",
      session,
      messages,
      isExpired,
      autoContacts: AUTO_CONTACTS,
    });
  } catch (err) {
    req.flash("error", "Failed to load chat.");
    res.redirect("/announcements");
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ participants: req.user._id })
      .populate("announcement")
      .populate("participants", "name")
      .sort({ createdAt: -1 });

    res.render("chat/index", { title: "My Chats - CampusRide", sessions });
  } catch (err) {
    req.flash("error", "Failed to load chat sessions.");
    res.redirect("/announcements");
  }
};
