document.addEventListener("DOMContentLoaded", () => {
  const socket = io("http://localhost:5000", {
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
  });

  socket.on("logged_success", (data) => {
    console.log("Login successful:", data.message);
    alert("تم تسجيل الدخول بنجاح!");
  });

  socket.on("error", (data) => {
    console.error("Error:", data.message);
    alert("حدث خطأ: " + data.message);
  });

  socket.on("receive_message", (message) => {
    console.log("New message received:", message);
    alert(`رسالة جديدة من ${message.sender}: ${message.content}`);
  });

  document.getElementById("loginBtn").addEventListener("click", () => {
    const token = document.getElementById("tokenInput").value;
    if (token) {
      socket.emit("login", token);
    } else {
      alert("يرجى إدخال التوكن!");
    }
  });

  document.getElementById("sendMessageBtn").addEventListener("click", () => {
    const receiverId = document.getElementById("receiverId").value;
    const messageContent = document.getElementById("messageContent").value;

    if (receiverId && messageContent) {
      socket.emit("send_message", {
        receiverId,
        content: messageContent,
      });
    } else {
      alert("يرجى إدخال معرف المستقبل والرسالة!");
    }
  });
});
