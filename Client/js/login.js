// API base URL for RESTful endpoints (adjust as needed)
const baseUrl = "http://localhost:5000/api/v1";
let token = localStorage.getItem("token") || null;



// Login button event: emit "join" with token
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;
  if (!email || !password) return alert("Please enter email and password");

  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
        console.log(data);
      token = data.token;
      localStorage.setItem("token", token);
      console.log(data);
      
      alert("Login successful");
      window.location.href = "../index.html";
      
    } else {
      alert("Login failed: " + data.message);
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
});
