// Connect to the Socket.IO server
const socket = io("http://localhost:5000", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

// Handle successful login
socket.on("logged_success", (data) => {
  console.log("Logged in:", data.message);
  // document.getElementById("login-container").style.display = "none";
  // document.getElementById("chat-container").style.display = "block";
});

// Handle errors
socket.on("error", (err) => {
  console.error("Socket error:", err);
  alert("Error: " + err.message);
});

// Display received messages
socket.on("receive_message", (message) => {
  console.log("Received message:", message);
  displayMessage(message);
});

const token = localStorage.getItem("token");
socket.emit("join", { token });

document.getElementById("send-btn").addEventListener("click", () => {
  const messageInput = document.getElementById("message-input");
  const content = messageInput.value.trim();
  if (!content) return;

  const chatId = null;
  const receiverId = "67bc8ffaac5129ee4ca939fa"; // Change as needed

  socket.emit("send_message", { chatId, content, receiverId });
  messageInput.value = "";
});

// Send message event handler

// Function to display a message in the UI
function displayMessage(message) {
  const messagesDiv = document.getElementById("messages");
  const messageElem = document.createElement("div");
  messageElem.textContent = `From: ${message.sender} - ${message.content}`;
  messagesDiv.appendChild(messageElem);
}

// Sample RESTful API call: Create Chat
async function createChat(participantId) {
  try {
    const response = await fetch(`${baseUrl}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ participantId }),
    });
    const data = await response.json();
    console.log("Created chat:", data);
    return data;
  } catch (error) {
    console.error("Error creating chat:", error);
  }
}

// Sample RESTful API call: Get Chat History
async function getChatHistory() {
  try {
    const response = await fetch(`${baseUrl}/messages/chat/history`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Chat history:", data);
    return data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }
}

// Sample RESTful API call: Get Recent Chats
async function getRecentChats() {
  try {
    const response = await fetch(`${baseUrl}/messages/recent-chats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Recent chats:", data);
    return data;
  } catch (error) {
    console.error("Error fetching recent chats:", error);
  }
}
