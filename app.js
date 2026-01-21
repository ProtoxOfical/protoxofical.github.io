// ===== CONFIG =====
// Month is 0-indexed (0 = Jan, 11 = Dec)
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

  // Calculate detailed units
  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // A simple approximation for years/months to match "rolling" style
  // For strict calendar accuracy, this requires heavier logic, 
  // but for a love counter, total days split up is usually standard.
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;

  // Update DOM
  document.getElementById("t-years").innerText = years;
  document.getElementById("t-days").innerText = remainingDays;
  document.getElementById("t-hours").innerText = String(hours).padStart(2, '0');
  document.getElementById("t-minutes").innerText = String(minutes).padStart(2, '0');
  document.getElementById("t-seconds").innerText = String(seconds).padStart(2, '0');
}

// ===== UI LOGIC =====
function getWinnerLine(you, her) {
  if (you > her) return `${YOU_NAME} is winning! 💜`;
  if (her > you) return `${HER_NAME} is winning! 💖`;
  return `It's a perfect tie ❤️`;
}

function updateGradient(you, her) {
  const total = you + her;
  // If 0, 50/50. 
  let jayleeShare = total === 0 ? 0.5 : her / total;
  
  // Convert to percentage for the CSS variable
  const splitPercent = jayleeShare * 100;
  
  // Update CSS variable
  document.documentElement.style.setProperty("--split-point", `${splitPercent}%`);
}

function render(you, her) {
  document.getElementById("scoreText").textContent = `${you} - ${her}`;
  document.getElementById("leaderText").textContent = getWinnerLine(you, her);
  updateGradient(you, her);
}

// ===== NETWORKING =====
async function fetchCounts() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    
    // Only update local if server has higher numbers 
    // (prevents glitching if we have pending local clicks)
    if (data.lazare > localLazare) localLazare = data.lazare;
    if (data.jaylee > localJaylee) localJaylee = data.jaylee;
    
    // Add pending clicks to the visual count so it doesn't jump back
    let displayLazare = localLazare;
    let displayJaylee = localJaylee;
    
    if (window.IDENTITY === "lazare") displayLazare += pendingClicks;
    if (window.IDENTITY === "jaylee") displayJaylee += pendingClicks;

    render(displayLazare, displayJaylee);
  } catch (e) {
    console.error("Fetch error", e);
  }
}

// The "Spam" Handler
async function handleUserClick(identity) {
  // 1. Immediate Local Update (Optimistic UI)
  pendingClicks++;
  
  if (identity === "lazare") render(localLazare + pendingClicks, localJaylee);
  else if (identity === "jaylee") render(localLazare, localJaylee + pendingClicks);

  // 2. Reset the debouncer
  if (clickTimeout) clearTimeout(clickTimeout);

  // 3. Set a delay. If user stops clicking for 2 seconds, send the batch.
  clickTimeout = setTimeout(async () => {
    const clicksToSend = pendingClicks;
    pendingClicks = 0; // Reset pending immediately so we don't double count
    
    // We have to loop requests if the API doesn't support "count=5"
    // Assuming API is basic and needs 1 request per click.
    // To be kind to the browser, we send them in a promise chain or loop.
    for(let i=0; i<clicksToSend; i++){
       fetch(`${API}?action=click&user=${identity}`).catch(e => console.log(e));
       // Small delay to ensure order if needed, but usually fire & forget is okay here
    }

    // Refresh data after sending
    setTimeout(fetchCounts, 500); 
  }, 2000); // 2 seconds delay
}

// ===== INIT =====
function init() {
  const identity = window.IDENTITY || "admin";
  const btn = document.getElementById("clickHeart");
  const idDisplay = document.getElementById("userIdentity");

  idDisplay.textContent = `User: ${identity}`;

  // Start the timer (ticks every second)
  setInterval(updateTimer, 1000);
  updateTimer();

  // Initial Data Load
  fetchCounts();

  // "Realtime" polling: Check server every 2 seconds
  // This is much faster than 60s, solving the "reload" issue.
  setInterval(fetchCounts, 2000);

  // Click Listener
  if (identity === "admin") {
    btn.textContent = "ADMIN MODE";
    btn.style.opacity = "0.5";
  } else {
    btn.addEventListener("click", () => handleUserClick(identity));
  }
}

window.addEventListener("DOMContentLoaded", init);
