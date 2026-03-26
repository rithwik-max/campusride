if (typeof SESSION_ID !== "undefined" && !IS_EXPIRED) {
  const socket = io();

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("joinRoom", { sessionId: SESSION_ID });
  });

  const chatMessages = document.getElementById("chatMessages");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  const scrollToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };
  scrollToBottom();

  const addMessage = ({ senderName, message, time, isMe }) => {
    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${isMe ? "me" : "other"}`;

    const timeStr = new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    bubble.innerHTML = `
      ${!isMe ? `<span class="msg-name">${senderName}</span>` : ""}
      <div class="msg-content">${message}</div>
      <span class="msg-time">${timeStr}</span>
    `;

    // Remove empty state if present
    const emptyState = chatMessages.querySelector(".empty-chat");
    if (emptyState) emptyState.remove();

    chatMessages.appendChild(bubble);
    scrollToBottom();
  };

  const sendMessage = () => {
    const message = msgInput.value.trim();
    if (!message) return;

    console.log("Sending message:", message);

    socket.emit("chatMessage", {
      sessionId: SESSION_ID,
      senderId: USER_ID,
      senderName: USER_NAME,
      message,
    });

    msgInput.value = "";
  };

  sendBtn.addEventListener("click", sendMessage);
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  socket.on("newMessage", (data) => {
    console.log("Received message:", data);
    addMessage({ ...data, isMe: data.senderName === USER_NAME });
  });

  socket.on("sessionExpired", ({ message }) => {
    msgInput.disabled = true;
    sendBtn.disabled = true;
    alert(message);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });
}