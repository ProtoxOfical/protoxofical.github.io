// ===== CONFIG =====
const START_DATE = new Date(2025, 0, 14); // Dec 17, 2025
const YOU_NAME = "Lazare";
const HER_NAME = "Jaylee";
const API = "https://tiny-shape-93d0.tamovacheishvili.workers.dev";

// ===== HELPERS =====
function daysTogether(){
  const now = new Date();
  const diff = now - START_DATE;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function winnerLine(you, her){
  if (you > her) return `Currently ${YOU_NAME} loves ${HER_NAME} more!`;
  if (her > you) return `Currently ${HER_NAME} loves ${YOU_NAME} more!`;
  return `It's a tie ❤️`;
}

function updateGradient(you, her){
  const total = you + her;
  let purpleShare = total === 0 ? 0.5 : you / total;

  // clamp so neither color disappears
  purpleShare = Math.min(Math.max(purpleShare, 0.1), 0.9);

  // --split-point = where pink ends
  const splitPoint = (1 - purpleShare) * 100;
  document.documentElement.style.setProperty("--split-point", `${splitPoint}%`);
}

// ===== API =====
async function fetchCounts(){
  const res = await fetch(API);
  return await res.json();
}

async function registerClick(identity){
  if (identity !== "jaylee" && identity !== "lazare") return;
  await fetch(`${API}?action=click&user=${identity}`);
}

// ===== UI =====
async function render(identity){
  const data = await fetchCounts();
  const you = data.lazare;
  const her = data.jaylee;

  document.getElementById("scoreText").textContent =
    `${YOU_NAME}: ${you} | ${HER_NAME}: ${her}`;

  document.getElementById("leaderText").textContent =
    winnerLine(you, her);

  document.getElementById("daysCounter").textContent =
    `${daysTogether()} Days`;

  const idEl = document.getElementById("userIdentity");
  idEl.textContent =
    identity === "jaylee" ? `Logged in as: ${HER_NAME} (Pink)` :
    identity === "lazare" ? `Logged in as: ${YOU_NAME} (Purple)` :
    `Admin view`;

  updateGradient(you, her);

  const adminHint = document.getElementById("adminHint");
  if (adminHint){
    adminHint.style.display = identity === "admin" ? "block" : "none";
  }
}

// ===== INIT =====
function init(){
  const identity = window.IDENTITY || "admin";
  const btn = document.getElementById("clickHeart");

  if (identity === "admin"){
    btn.addEventListener("click", () => {});
  } else {
    btn.addEventListener("click", async () => {
      await registerClick(identity);
      await render(identity);
    });
  }

  render(identity);
  setInterval(() => render(identity), 60 * 1000);
}

window.addEventListener("DOMContentLoaded", init);
