const form = document.querySelector("#loginForm");
const status = document.querySelector("#loginStatus");
const quickAccessBtn = document.querySelector("#quickAccessBtn");
const toggleResetBtn = document.querySelector("#toggleResetBtn");
const resetFormWrap = document.querySelector("#resetFormWrap");
const newPasswordInput = document.querySelector("#newPassword");
const saveNewPassBtn = document.querySelector("#saveNewPassBtn");

async function sessionState() {
  if (localStorage.getItem("th_growth_auth") === "true") {
    window.location.replace("/growth/");
    return;
  }
}

// 1-Click Instant Artist Access
if (quickAccessBtn) {
  quickAccessBtn.addEventListener("click", () => {
    localStorage.setItem("th_growth_auth", "true");
    status.textContent = "Verified artist session. Entering dashboard…";
    setTimeout(() => window.location.replace("/growth/"), 250);
  });
}

// Toggle custom password box
if (toggleResetBtn && resetFormWrap) {
  toggleResetBtn.addEventListener("click", () => {
    const isHidden = resetFormWrap.style.display === "none";
    resetFormWrap.style.display = isHidden ? "block" : "none";
    toggleResetBtn.textContent = isHidden ? "Hide custom password ▴" : "Set custom password ▾";
  });
}

// Save new password
if (saveNewPassBtn && newPasswordInput) {
  saveNewPassBtn.addEventListener("click", () => {
    const val = newPasswordInput.value.trim();
    if (!val) {
      status.textContent = "Please enter a valid password.";
      return;
    }
    localStorage.setItem("th_custom_password", val);
    localStorage.setItem("th_growth_auth", "true");
    status.textContent = "Password updated! Entering dashboard…";
    setTimeout(() => window.location.replace("/growth/"), 300);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.firstChild.textContent = "Checking access ";
  status.textContent = "";

  const formData = Object.fromEntries(new FormData(form));
  const enteredUsername = (formData.username || "").trim().toLowerCase();
  const enteredPassword = (formData.password || "").trim();
  const customPassword = localStorage.getItem("th_custom_password");

  // Check against master default passcode or custom passcode
  const isMasterKey = (enteredPassword === "zeroto40" || enteredPassword === "taymah" || enteredPassword === "admin" || (customPassword && enteredPassword === customPassword));

  if (isMasterKey) {
    localStorage.setItem("th_growth_auth", "true");
    status.textContent = "Access granted. Opening dashboard…";
    setTimeout(() => window.location.replace("/growth/"), 250);
    return;
  }

  // Also try remote backend if present
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (response.ok) {
      localStorage.setItem("th_growth_auth", "true");
      status.textContent = "Access granted. Opening dashboard…";
      window.location.replace("/growth/");
      return;
    }
  } catch (netErr) {
    // If backend is offline, grant operator access
    localStorage.setItem("th_growth_auth", "true");
    status.textContent = "Operator access granted. Opening dashboard…";
    setTimeout(() => window.location.replace("/growth/"), 300);
    return;
  }

  status.textContent = "Passcode incorrect. Use 'zeroto40' or click Instant Artist Access above.";
  button.disabled = false;
  button.firstChild.textContent = "Enter dashboard ";
});

sessionState();
