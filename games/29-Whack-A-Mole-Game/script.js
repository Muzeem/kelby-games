if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const stageBoard = document.querySelector(".stage");
const targetBoard = document.querySelector(".target");
const timerBoard = document.querySelector(".timer");
const moles = document.querySelectorAll(".mole");
const button = document.querySelector("#start");
const modal = document.getElementById("gameOverModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");

let lastHole;
let timeUp = false;
let score = 0;
let stage = 1;
let target = 5;
let timeLimit = 30;
let timerInterval;
let timeRemaining;
let gameActive = false;

// Stage configuration
const stages = [
  { stage: 1, target: 5, time: 30, speed: { min: 600, max: 1200 } },
  { stage: 2, target: 10, time: 35, speed: { min: 500, max: 1000 } },
  { stage: 3, target: 15, time: 40, speed: { min: 400, max: 900 } },
  { stage: 4, target: 20, time: 45, speed: { min: 350, max: 800 } },
  { stage: 5, target: 25, time: 50, speed: { min: 300, max: 700 } },
  { stage: 6, target: 30, time: 50, speed: { min: 250, max: 600 } },
  { stage: 7, target: 35, time: 55, speed: { min: 200, max: 500 } },
  { stage: 8, target: 40, time: 60, speed: { min: 150, max: 450 } },
  { stage: 9, target: 50, time: 60, speed: { min: 100, max: 400 } },
  { stage: 10, target: 60, time: 70, speed: { min: 80, max: 350 } }
];

// Create hammer cursor (hidden initially)
const hammer = document.createElement('div');
hammer.className = 'hammer hidden';
hammer.innerHTML = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Hammer handle -->
    <rect x="60" y="30" width="8" height="60" fill="#8B4513" rx="2"/>
    <!-- Hammer head -->
    <rect x="45" y="20" width="35" height="20" fill="#696969" rx="2"/>
    <rect x="48" y="18" width="29" height="4" fill="#808080"/>
  </svg>
`;
document.body.appendChild(hammer);

// Track mouse movement
document.addEventListener('mousemove', (e) => {
  hammer.style.left = e.clientX + 'px';
  hammer.style.top = e.clientY + 'px';
});

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];

  if (hole === lastHole) {
    return randomHole(holes);
  }

  lastHole = hole;
  return hole;
}

function peep() {
  if (!gameActive) return;
  
  const currentStage = stages[stage - 1];
  const time = randomTime(currentStage.speed.min, currentStage.speed.max);
  const hole = randomHole(holes);
  hole.classList.add("up");
  
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp && gameActive) peep();
  }, time);
}

function updateTimer() {
  timeRemaining--;
  timerBoard.textContent = timeRemaining;
  
  if (timeRemaining <= 0) {
    endGame(false);
  }
}

function startGame() {
  // Reset game state
  score = 0;
  stage = 1;
  timeUp = false;
  gameActive = true;
  
  // Load stage 1 config
  const currentStage = stages[stage - 1];
  target = currentStage.target;
  timeLimit = currentStage.time;
  timeRemaining = timeLimit;
  
  // Update UI
  scoreBoard.textContent = score;
  stageBoard.textContent = stage;
  targetBoard.textContent = target;
  timerBoard.textContent = timeRemaining;
  button.style.display = "none";
  hammer.classList.remove('hidden');
  
  // Start timer
  timerInterval = setInterval(updateTimer, 1000);
  
  // Start moles
  peep();
}

function nextStage() {
  stage++;
  
  if (stage > stages.length) {
    // Won the game!
    gameActive = false;
    clearInterval(timerInterval);
    showModal("🎉 YOU WIN! 🎉", `Congratulations! You completed all ${stages.length} stages with a total score of ${score}!`);
    return;
  }
  
  // Reset score for new stage
  score = 0;
  
  // Load next stage
  const currentStage = stages[stage - 1];
  target = currentStage.target;
  timeLimit = currentStage.time;
  timeRemaining = timeLimit;
  
  // Update UI
  scoreBoard.textContent = score;
  stageBoard.textContent = stage;
  targetBoard.textContent = target;
  timerBoard.textContent = timeRemaining;
  
  // Show stage transition and restart game
  showStageTransition();
  
  // Restart game mechanics after transition
  setTimeout(() => {
    gameActive = true;
    timeUp = false;
    hammer.classList.remove('hidden');
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    peep();
  }, 2000);
}

function showStageTransition() {
  const transition = document.createElement('div');
  transition.className = 'stage-transition';
  transition.innerHTML = `<h2>Stage ${stage}</h2><p>Hit ${target} moles in ${timeLimit} seconds!</p>`;
  document.body.appendChild(transition);
  
  setTimeout(() => {
    transition.remove();
  }, 2000);
}

function endGame(success) {
  gameActive = false;
  timeUp = true;
  clearInterval(timerInterval);
  hammer.classList.add('hidden');
  
  if (success) {
    showModal("🎯 Stage Complete!", `Great job! You hit ${score} out of ${target} moles!`);
    setTimeout(() => {
      modal.style.display = 'none';
      nextStage();
    }, 2000);
  } else {
    showModal("⏰ Time's Up!", `You scored ${score} out of ${target} required hits. Try again!`);
  }
}

function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.style.display = 'flex';
  hammer.classList.add('hidden');
  button.style.display = 'none';
}

function restartGame() {
  modal.style.display = 'none';
  button.style.display = 'inline-block';
  button.textContent = 'Start Game';
  hammer.classList.add('hidden');
  
  // Reset to stage 1
  score = 0;
  stage = 1;
  const currentStage = stages[0];
  target = currentStage.target;
  timeLimit = currentStage.time;
  
  // Update UI
  scoreBoard.textContent = score;
  stageBoard.textContent = stage;
  targetBoard.textContent = target;
  timerBoard.textContent = timeLimit;
}

function bonk(e) {
  if (!e.isTrusted || !gameActive) return;
  
  score++;
  const mole = this;
  const hole = mole.parentElement;
  mole.classList.remove("up");
  hole.classList.remove("up");
  scoreBoard.textContent = score;
  
  // Hammer hit animation
  hammer.classList.add('hitting');
  setTimeout(() => {
    hammer.classList.remove('hitting');
  }, 100);
  
  // Mole hit animation
  mole.classList.add('hit');
  setTimeout(() => {
    mole.classList.remove('hit');
  }, 300);
  
  // Get click position relative to hole
  const rect = hole.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Create star burst effect
  const stars = document.createElement('div');
  stars.className = 'hit-effect hit-stars';
  stars.textContent = '⭐💥⭐';
  stars.style.left = x + 'px';
  stars.style.top = y + 'px';
  hole.appendChild(stars);
  setTimeout(() => stars.remove(), 600);
  
  // Create score popup
  const scorePopup = document.createElement('div');
  scorePopup.className = 'score-popup';
  scorePopup.textContent = '+1';
  scorePopup.style.left = x + 'px';
  scorePopup.style.top = y + 'px';
  hole.appendChild(scorePopup);
  setTimeout(() => scorePopup.remove(), 800);
  
  // Check if stage is complete
  if (score >= target) {
    endGame(true);
  }
}

moles.forEach((mole) => mole.addEventListener("click", bonk));

document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = '/';
});
