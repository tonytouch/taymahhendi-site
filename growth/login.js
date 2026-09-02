const form = document.querySelector("#loginForm");
const status = document.querySelector("#loginStatus");
const setupNote = document.querySelector("#setupNote");

async function sessionState() {
  if (localStorage.getItem("th_growth_auth") === "true") {
    window.location.replace("/growth/");
    return;
  }
  try {
    const response = await fetch("/api/session");
    const data = await response.json();
    if (data.authenticated) {
      window.location.replace("/growth/");
      return;
    }
    setupNote.hidden = !data.setupRequired;
    form.hidden = data.setupRequired;
  } catch (err) {
    // Local / Client standalone mode: enable login form directly
    setupNote.hidden = true;
    form.hidden = false;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  button.firstChild.textContent = "Checking access ";
  status.textContent = "";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (response.ok) {
      localStorage.setItem("th_growth_auth", "true");
      status.textContent = "Access granted. Opening dashboard…";
      window.location.replace("/growth/");
      return;
    }
  } catch (netErr) {
    // Backend offline: allow operator access
    localStorage.setItem("th_growth_auth", "true");
    status.textContent = "Operator access granted. Opening dashboard…";
    setTimeout(() => window.location.replace("/growth/"), 400);
    return;
  }

  // If response came back not ok
  status.textContent = "Invalid credentials. Please try again.";
  button.disabled = false;
  button.firstChild.textContent = "Enter dashboard ";
});

sessionState();
