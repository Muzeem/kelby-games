// Word categories with hints
const wordCategories = {
    programming: {
        words: [
            { word: "JAVASCRIPT", hint: "Popular web programming language" },
            { word: "PYTHON", hint: "Snake-named programming language" },
            { word: "REACT", hint: "Popular JavaScript library for UI" },
            { word: "HTML", hint: "Markup language for web pages" },
            { word: "CSS", hint: "Styling language for web design" },
            { word: "NODE", hint: "JavaScript runtime environment" },
            { word: "GITHUB", hint: "Code hosting platform" },
            { word: "API", hint: "Application Programming Interface" },
            { word: "DATABASE", hint: "Organized collection of data" },
            { word: "ALGORITHM", hint: "Step-by-step problem solving method" }
        ]
    },
    animals: {
        words: [
            { word: "ELEPHANT", hint: "Largest land mammal" },
            { word: "GIRAFFE", hint: "Tallest animal in the world" },
            { word: "PENGUIN", hint: "Flightless bird from Antarctica" },
            { word: "DOLPHIN", hint: "Intelligent marine mammal" },
            { word: "BUTTERFLY", hint: "Colorful insect with wings" },
            { word: "KANGAROO", hint: "Hopping marsupial from Australia" },
            { word: "OCTOPUS", hint: "Eight-armed sea creature" },
            { word: "CHEETAH", hint: "Fastest land animal" },
            { word: "FLAMINGO", hint: "Pink bird that stands on one leg" },
            { word: "RHINOCEROS", hint: "Large mammal with a horn" }
        ]
    },
    countries: {
        words: [
            { word: "AUSTRALIA", hint: "Island continent country" },
            { word: "BRAZIL", hint: "Largest South American country" },
            { word: "CANADA", hint: "Northern neighbor of USA" },
            { word: "EGYPT", hint: "Home of the pyramids" },
            { word: "FRANCE", hint: "Country famous for the Eiffel Tower" },
            { word: "JAPAN", hint: "Land of the rising sun" },
            { word: "MEXICO", hint: "Country south of the United States" },
            { word: "NORWAY", hint: "Scandinavian country with fjords" },
            { word: "THAILAND", hint: "Southeast Asian kingdom" },
            { word: "SWITZERLAND", hint: "Alpine country famous for chocolate" }
        ]
    },
    movies: {
        words: [
            { word: "AVATAR", hint: "Blue aliens on Pandora" },
            { word: "TITANIC", hint: "Ship disaster romance film" },
            { word: "INCEPTION", hint: "Dreams within dreams" },
            { word: "MATRIX", hint: "Red pill or blue pill?" },
            { word: "FROZEN", hint: "Let it go, let it go..." },
            { word: "GLADIATOR", hint: "Are you not entertained?" },
            { word: "JAWS", hint: "You're gonna need a bigger boat" },
            { word: "ROCKY", hint: "Boxing underdog story" },
            { word: "SHREK", hint: "Green ogre animated film" },
            { word: "BATMAN", hint: "Dark Knight of Gotham" }
        ]
    },
    food: {
        words: [
            { word: "PIZZA", hint: "Italian flatbread with toppings" },
            { word: "SUSHI", hint: "Japanese raw fish dish" },
            { word: "BURGER", hint: "Meat patty in a bun" },
            { word: "CHOCOLATE", hint: "Sweet treat from cocoa" },
            { word: "PASTA", hint: "Italian noodles" },
            { word: "SANDWICH", hint: "Food between two slices of bread" },
            { word: "PANCAKE", hint: "Flat cake cooked on a griddle" },
            { word: "TACO", hint: "Mexican folded tortilla" },
            { word: "DONUT", hint: "Fried dough with a hole" },
            { word: "WAFFLE", hint: "Grid-patterned breakfast food" }
        ]
    }
};

// Game state
let currentCategory = 'programming';
let selectedWord = '';
let selectedHint = '';
let guessedWord = [];
let wrongGuesses = 0;
let maxWrongGuesses = 6;
let guessedLetters = [];
let score = parseInt(localStorage.getItem('hangman-score') || '0');
let streak = parseInt(localStorage.getItem('hangman-streak') || '0');
let hintUsed = false;

// DOM elements
const wordDisplay = document.getElementById('wordDisplay');
const wrongGuessesDisplay = document.getElementById('wrongGuesses');
const alphabetButtonsContainer = document.getElementById('alphabetButtons');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalScore = document.getElementById('modalScore');
const modalStreak = document.getElementById('modalStreak');
const categorySelect = document.getElementById('categorySelect');
const currentCategoryDisplay = document.getElementById('currentCategory');
const hintText = document.getElementById('hintText');
const usedLettersDisplay = document.getElementById('usedLetters');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const hintButton = document.getElementById('hintButton');

// Body parts for hangman drawing
const bodyParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// Initialize game
function initializeGame() {
    const categoryWords = wordCategories[currentCategory].words;
    const randomIndex = Math.floor(Math.random() * categoryWords.length);
    const selectedItem = categoryWords[randomIndex];
    
    selectedWord = selectedItem.word;
    selectedHint = selectedItem.hint;
    guessedWord = Array(selectedWord.length).fill('_');
    wrongGuesses = 0;
    guessedLetters = [];
    hintUsed = false;
    
    updateDisplay();
    createAlphabetButtons();
    resetHintButton();
    hideAllBodyParts();
    gameModal.classList.remove('show');
    
    // Clear hint text
    hintText.textContent = '';
    hintText.className = 'hint-text';
    
    // Update category display
    currentCategoryDisplay.textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    
    // Update score display
    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;
}

function updateDisplay() {
    wordDisplay.textContent = guessedWord.join(' ');
    wrongGuessesDisplay.textContent = wrongGuesses;
    
    // Update used letters
    if (guessedLetters.length === 0) {
        usedLettersDisplay.textContent = 'None';
    } else {
        usedLettersDisplay.textContent = guessedLetters.sort().join(', ');
    }
}

function createAlphabetButtons() {
    alphabetButtonsContainer.innerHTML = '';
    
    for (let i = 65; i <= 90; i++) {
        const letter = String.fromCharCode(i);
        const button = document.createElement('button');
        button.textContent = letter;
        button.className = 'letter-btn';
        button.addEventListener('click', () => handleGuess(letter));
        alphabetButtonsContainer.appendChild(button);
    }
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter)) {
        return;
    }
    
    guessedLetters.push(letter);
    const button = Array.from(alphabetButtonsContainer.children).find(btn => btn.textContent === letter);
    
    if (selectedWord.includes(letter)) {
        // Correct guess
        button.classList.add('correct');
        button.disabled = true;
        
        // Reveal letters
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === letter) {
                guessedWord[i] = letter;
            }
        }
        
        // Check win condition
        if (!guessedWord.includes('_')) {
            setTimeout(() => endGame(true), 500);
        }
    } else {
        // Wrong guess
        button.classList.add('wrong');
        button.disabled = true;
        wrongGuesses++;
        
        // Show body part
        if (wrongGuesses <= bodyParts.length) {
            const bodyPart = document.getElementById(bodyParts[wrongGuesses - 1]);
            bodyPart.classList.add('show');
        }
        
        // Shake animation
        wordDisplay.classList.add('shake');
        setTimeout(() => wordDisplay.classList.remove('shake'), 500);
        
        // Check lose condition
        if (wrongGuesses >= maxWrongGuesses) {
            setTimeout(() => endGame(false), 500);
        }
    }
    
    updateDisplay();
}

function hideAllBodyParts() {
    bodyParts.forEach(partId => {
        const part = document.getElementById(partId);
        part.classList.remove('show');
    });
}

function endGame(win) {
    // Disable all buttons
    Array.from(alphabetButtonsContainer.children).forEach(button => {
        button.disabled = true;
    });
    hintButton.disabled = true;
    
    if (win) {
        modalTitle.textContent = '🎉 Congratulations!';
        modalMessage.textContent = `You guessed "${selectedWord}" correctly!`;
        
        // Calculate score
        let points = 10;
        if (!hintUsed) points += 5; // Bonus for not using hint
        points += Math.max(0, 6 - wrongGuesses) * 2; // Bonus for fewer wrong guesses
        
        score += points;
        streak++;
        
        localStorage.setItem('hangman-score', score.toString());
        localStorage.setItem('hangman-streak', streak.toString());
    } else {
        modalTitle.textContent = '💀 Game Over!';
        modalMessage.textContent = `The word was "${selectedWord}". Better luck next time!`;
        
        streak = 0;
        localStorage.setItem('hangman-streak', '0');
    }
    
    modalScore.textContent = score;
    modalStreak.textContent = streak;
    
    setTimeout(() => {
        gameModal.classList.add('show');
    }, 1000);
}

/**
 * HINT SYSTEM - Rebuilt from scratch
 * Product Requirements:
 * 1. One hint per game (simple, clear UX)
 * 2. Shows the category hint text
 * 3. Reveals one unrevealed letter automatically
 * 4. Reduces score bonus (no hint bonus if used)
 * 5. Clear visual feedback
 */
function showHint() {
    // Prevent multiple hint uses
    if (hintUsed) {
        return;
    }
    
    hintUsed = true;
    
    // Step 1: Display the hint text
    hintText.textContent = `💡 ${selectedHint}`;
    hintText.className = 'hint-text hint-active';
    
    // Step 2: Find all unrevealed unique letters
    const unrevealedLetters = new Set();
    for (let i = 0; i < selectedWord.length; i++) {
        const letter = selectedWord[i];
        // Only add if not already guessed
        if (!guessedLetters.includes(letter)) {
            unrevealedLetters.add(letter);
        }
    }
    
    // Step 3: Reveal one random unrevealed letter
    if (unrevealedLetters.size > 0) {
        const lettersArray = Array.from(unrevealedLetters);
        const randomLetter = lettersArray[Math.floor(Math.random() * lettersArray.length)];
        
        // Add visual feedback before auto-guessing
        setTimeout(() => {
            // Find and highlight the button
            const button = Array.from(alphabetButtonsContainer.children).find(
                btn => btn.textContent === randomLetter
            );
            
            if (button) {
                button.classList.add('hint-reveal');
                setTimeout(() => {
                    handleGuess(randomLetter);
                }, 300);
            }
        }, 500);
    }
    
    // Step 4: Update hint button state
    hintButton.disabled = true;
    hintButton.textContent = 'Hint Used';
    hintButton.style.opacity = '0.5';
    hintButton.style.cursor = 'not-allowed';
}

function resetHintButton() {
    hintButton.disabled = false;
    hintButton.textContent = '💡 Hint';
    hintButton.style.opacity = '1';
    hintButton.style.cursor = 'pointer';
}

// Event listeners
document.getElementById('newGame').addEventListener('click', initializeGame);
hintButton.addEventListener('click', showHint);
document.getElementById('playAgain').addEventListener('click', initializeGame);
document.getElementById('changeCategory').addEventListener('click', () => {
    gameModal.classList.remove('show');
});

categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    initializeGame();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    const letter = e.key.toUpperCase();
    if (letter >= 'A' && letter <= 'Z' && !guessedLetters.includes(letter)) {
        handleGuess(letter);
    }
    
    // Press 'H' for hint
    if (e.key.toLowerCase() === 'h' && !hintUsed) {
        showHint();
    }
});

// Initialize game on load
initializeGame();
