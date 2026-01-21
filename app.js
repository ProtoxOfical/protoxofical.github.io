// ===== CONFIG =====
const START_DATE = new Date(2025, 11, 17); // Dec 17, 2025 (change this)
const YOU_NAME = "Lazare";
const HER_NAME = "Jaylee";

// Storage keys (demo only)
const KEY_HER = "love_clicks_jaylee";
const KEY_YOU = "love_clicks_lazare";

const getCount = (k) => Number(localStorage.getItem(k) || "0");
const setCount = (k, v) => localStorage.setItem(k, String(v));

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

  // share of PURPLE (you)
  let purpleShare = total === 0 ? 0.5 : (you / total);

  // clamp so one side never fully disappears
  purpleShare = Math.min(Math.max(purpleShare, 0.1), 0.9);

  // --split-point is where PINK ends; if purpleShare grows -> split moves LEFT
  const splitPoint = (1 - purpleShare) * 100;

  document.documentElement.style.setProperty("--split-point", `${splitPoint}%`);
}

function render(identity){
  const you = getCount(KEY_YOU);
  const her = getCount(KEY_HER);

  document.getElementById("scoreText").textContent =
    `${YOU_NAME}: ${you} | ${HER_NAME}: ${her}`;

  document.getElementById("leaderText").textContent = winnerLine(you, her);
  document.getElementById("daysCounter").textContent = `${daysTogether()} Days`;

  const idEl = document.getElementById("userIdentity");
  idEl.textContent =
    identity === "jaylee" ? `Logged in as: ${HER_NAME} (Pink)` :
    identity === "lazare" ? `Logged in as: ${YOU_NAME} (Purple)` :
    `Admin view (demo)`;

  updateGradient(you, her);

  // Admin hint
  const adminHint = document.getElementById("adminHint");
  if (adminHint){
    adminHint.style.display = identity === "admin" ? "block" : "none";
  }
}

function init(){
  // identity injected by each page
  const identity = window.IDENTITY || "admin";

  const btn = document.getElementById("clickHeart");
  if (identity === "admin"){
    // Disable clicks in admin (optional)
    btn.addEventListener("click", () => {
      // no-op
    });
  } else {
    btn.addEventListener("click", () => {
      if (identity === "jaylee") setCount(KEY_HER, getCount(KEY_HER) + 1);
      if (identity === "lazare") setCount(KEY_YOU, getCount(KEY_YOU) + 1);
      render(identity);
    });
  }

  render(identity);
  setInterval(() => render(identity), 60 * 1000);
}

window.addEventListener("DOMContentLoaded", init);
