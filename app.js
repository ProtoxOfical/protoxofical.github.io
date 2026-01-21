// ===== CONFIG =====
const START_DATE = new Date(2025, 0, 14, 0, 0, 0); 
const YOU_NAME = "Lazare";
const HER_NAME = "Jaylee";
const API = "https://tiny-shape-93d0.tamovacheishvili.workers.dev";

// State
let localLazare = 0;
let localJaylee = 0;
let pendingClicks = 0;
let clickTimeout = null;

// ===== TIME CALCULATION =====
function updateTimer() {
  const now = new Date();
  let diff = now - START_DATE;

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;

  const setObj = (id, val) => {
      const el = document.getElementById(id);
      if(el) el.innerText = val;
  };

  setObj("t-years", years);
  setObj("t-days", remainingDays);
  setObj("t-hours", String(hours).padStart(2, '0'));
  setObj("t-minutes", String(minutes).padStart(2, '0'));
  setObj("t-seconds", String(seconds).padStart(2, '0'));
}

// ===== UI LOGIC =====
function getWinnerLine(you, her) {
  if (you > her) return `${YOU_NAME} is winning! 💜`;
  if (her > you) return `${HER_NAME} is winning! 💖`;
  return `It's a perfect tie ❤️`;
}

function updateGradient(you, her) {
  const total = you + her;
  let jayleeShare = total === 0 ? 0.5 : her / total;
  const splitPercent = jayleeShare * 100;
  document.documentElement.style.setProperty("--split-point", `${splitPercent}%`);
}

function render(you, her) {
  const scoreEl = document.getElementById("scoreText");
  const leaderEl = document.getElementById("leaderText");

  // Safety checks to prevent crash
  if (scoreEl) scoreEl.textContent = `${you} - ${her}`;
  if (leaderEl) leaderEl.textContent = getWinnerLine(you, her);
  
  updateGradient(you, her);
}

// ===== NETWORKING =====
async function fetchCounts() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    
    if (data.lazare > localLazare) localLazare = data.lazare;
    if (data.jaylee > localJaylee) localJaylee = data.jaylee;
    
    let displayLazare = localLazare;
    let displayJaylee = localJaylee;
    
    if (window.IDENTITY === "lazare") displayLazare += pendingClicks;
    if (window.IDENTITY === "jaylee") displayJaylee += pendingClicks;

    render(displayLazare, displayJaylee);
  } catch (e) {
    console.error("Fetch error", e);
  }
}

async function handleUserClick(identity) {
  pendingClicks++;
  
  if (identity === "lazare") render(localLazare + pendingClicks, localJaylee);
  else if (identity === "jaylee") render(localLazare, localJaylee + pendingClicks);

  if (clickTimeout) clearTimeout(clickTimeout);

  clickTimeout = setTimeout(async () => {
    const clicksToSend = pendingClicks;
    pendingClicks = 0; 
    
    for(let i=0; i<clicksToSend; i++){
       fetch(`${API}?action=click&user=${identity}`).catch(e => console.log(e));
    }
    setTimeout(fetchCounts, 500); 
  }, 2000); 
}

// ===== INIT =====
function init() {
  const identity = window.IDENTITY || "admin";
  const btn = document.getElementById("clickHeart");
  const idDisplay = document.getElementById("userIdentity");

  if(idDisplay) idDisplay.textContent = `User: ${identity}`;

  setInterval(updateTimer, 1000);
  updateTimer();

  fetchCounts();
  setInterval(fetchCounts, 2000);

  if (btn) {
      if (identity === "admin") {
        btn.textContent = "ADMIN MODE";
        btn.style.opacity = "0.5";
      } else {
        btn.addEventListener("click", () => handleUserClick(identity));
      }
  }
}

window.addEventListener("DOMContentLoaded", init);
