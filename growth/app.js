const $ = (selector) => document.querySelector(selector);
const fmt = (date) => date ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) : "Not run";
let toastTimer;

function toast(message) {
  const node = $("#toast"); node.textContent = message; node.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

async function request(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (response.status === 401) { window.location.replace("/growth/login.html"); throw new Error("Your session has ended."); }
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

function renderAgents(state) {
  $("#activeCount").textContent = `${Object.values(state.latest).filter(Boolean).length}/${state.agents.length}`;
  $("#agents").innerHTML = state.agents.map((agent) => {
    const run = state.latest[agent.id];
    return `<article class="agent ${run ? "has-run" : ""}">
      <div class="agent-top"><span class="agent-id">${agent.id}</span><span class="agent-state">${run ? run.status.replaceAll("_", " ") : "standby"}</span></div>
      <h3>${agent.name}</h3><p>${agent.purpose}</p>
      <p class="agent-last">${run ? `${fmt(run.completedAt)} · ${run.source}` : `${agent.cadence} · ${agent.mode}`}</p>
      <div class="agent-actions"><span>${agent.cadence}</span><button class="agent-run" data-run="${agent.id}" type="button">Run now</button></div>
    </article>`;
  }).join("");
}

function renderApprovals(state) {
  const pending = state.approvals.filter((item) => item.status === "pending");
  $("#pendingCount").textContent = pending.length;
  $("#approvals").innerHTML = pending.length ? pending.map((item) => `<article class="approval">
    <span class="approval-agent">${item.agentName}</span>
    <div><h3>${item.action.label}</h3><p>${item.action.kind.replaceAll("_", " ")} · ${item.action.connector || "manual"}</p>${item.action.blockedReason ? `<p class="blocked">${item.action.blockedReason}</p>` : ""}</div>
    <div class="decision"><button class="approve" data-decision="approve" data-id="${item.id}" type="button">Approve</button><button data-decision="reject" data-id="${item.id}" type="button">Reject</button></div>
  </article>`).join("") : '<p class="empty">No pending actions. External work will pause here for review.</p>';
}

function renderIntegrations(state) {
  $("#integrations").innerHTML = Object.entries(state.integrations).map(([name, connected]) => `<article class="integration ${connected ? "connected" : ""}"><strong>${name}</strong><span>${connected ? "connected" : "pending"}</span></article>`).join("");
}

function renderRuns(state) {
  $("#activity").innerHTML = state.runs.length ? state.runs.map((run) => `<article class="run"><span class="run-agent">${run.agentName}</span><span class="run-summary">${run.summary}</span><span class="run-meta">${fmt(run.completedAt)}<br>${run.source}</span></article>`).join("") : '<p class="empty">No runs yet. Run all agents to initialize the system.</p>';
}

async function refresh() {
  const state = await request("/api/state");
  renderAgents(state); renderApprovals(state); renderIntegrations(state); renderRuns(state);
}

document.addEventListener("click", async (event) => {
  const runButton = event.target.closest("[data-run]");
  const decisionButton = event.target.closest("[data-decision]");
  try {
    if (runButton) {
      runButton.disabled = true; runButton.textContent = "Running…";
      await request(`/api/run/${encodeURIComponent(runButton.dataset.run)}`, { method: "POST" });
      toast("Agent run completed."); await refresh();
    }
    if (decisionButton) {
      decisionButton.disabled = true;
      await request(`/api/approvals/${encodeURIComponent(decisionButton.dataset.id)}/${decisionButton.dataset.decision}`, { method: "POST" });
      toast(decisionButton.dataset.decision === "approve" ? "Approved. Waiting for a tested connector." : "Action rejected."); await refresh();
    }
  } catch (error) { toast(error.message); await refresh(); }
});

$("#runAll").addEventListener("click", async () => {
  const button = $("#runAll"); button.disabled = true; button.firstChild.textContent = "Running agents ";
  try { await request("/api/run/all", { method: "POST" }); toast("All agent runs completed."); await refresh(); }
  catch (error) { toast(error.message); }
  finally { button.disabled = false; button.firstChild.textContent = "Run all agents "; }
});

$("#signOut").addEventListener("click", async () => {
  await request("/api/logout", { method: "POST" });
  window.location.replace("/growth/login.html");
});

refresh().catch((error) => toast(error.message));
