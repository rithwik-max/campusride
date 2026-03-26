require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const ejsMate = require("ejs-mate");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// DB Connect
const MONGO_URL = process.env.MONGO_URI;

if (!MONGO_URL) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Passport config
require("./config/passport")(passport);

// Engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "campusride_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URL,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Global locals
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const announcementRoutes = require("./routes/announcements");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");

app.use("/", authRoutes);
app.use("/announcements", announcementRoutes);
app.use("/chat", chatRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("/announcements");
  res.redirect("/login");
});

// Socket.IO for chat
const ChatMessage = require("./models/ChatMessage");
const ChatSession = require("./models/ChatSession");

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ sessionId }) => {
    socket.join(sessionId);
  });

  socket.on("chatMessage", async ({ sessionId, senderId, senderName, message }) => {
    try {
      const chatSession = await ChatSession.findById(sessionId);
      if (!chatSession) return;

      const now = new Date();
      const diff = (now - new Date(chatSession.createdAt)) / (1000 * 60 * 60);
      if (diff > 24) {
        socket.emit("sessionExpired", { message: "Chat session has expired (24 hours limit)." });
        return;
      }

      const msg = await ChatMessage.create({
        session: sessionId,
        sender: senderId,
        senderName,
        message,
      });

      io.to(sessionId).emit("newMessage", {
        senderName,
        message,
        time: msg.createdAt,
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {});
});

// 404
app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found", code: 404 });
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message, code: statusCode });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CampusRide running on http://localhost:${PORT}`));