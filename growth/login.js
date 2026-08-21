const form = document.querySelector("#loginForm");
const status = document.querySelector("#loginStatus");
const setupNote = document.querySelector("#setupNote");

async function sessionState() {
  const response = await fetch("/api/session");
  const data = await response.json();
  if (data.authenticated) window.location.replace("/growth/");
  setupNote.hidden = !data.setupRequired;
  form.hidden = data.setupRequired;
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
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Sign in failed.");
    status.textContent = "Access granted. Opening dashboard…";
    window.location.replace("/growth/");
  } catch (error) {
    status.textContent = error.message;
    document.querySelector("#password").value = "";
    document.querySelector("#password").focus();
  } finally {
    button.disabled = false;
    button.firstChild.textContent = "Enter dashboard ";
  }
});

sessionState().catch(() => { status.textContent = "The dashboard service is unavailable."; });
