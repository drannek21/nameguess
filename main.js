// NAMEGUESS - consolidated script for all steps

// Global: fade-in on page load
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});

// STEP 1: Letter count page (index.html)
(function () {
  const questionEl = document.getElementById("question");
  const subtextEl = document.getElementById("subtext");
  const inputEl = document.getElementById("letterInput");
  const okBtn = document.getElementById("okBtn");

  if (!questionEl || !subtextEl || !inputEl || !okBtn) return;

  const questionText = "How many letters is the name you're thinking of?";
  const subText = "Shhhh... don't say the name out loud.";

  const maxVal = 15;
  const minVal = 0;

  // Type question on page load
  window.addEventListener("load", () => {
    typeText(questionEl, questionText);
  });

  // Show subtext when input is focused
  let subtextShown = false;
  inputEl.addEventListener("focus", () => {
    if (!subtextShown) {
      typeText(subtextEl, subText, 35);
      subtextShown = true;
    }
  });

  // Input validation - only numbers accepted
  inputEl.addEventListener("input", () => {
    // Remove any non-numeric characters
    let value = inputEl.value.replace(/\D/g, "");
    inputEl.value = value;

    if (value) {
      let numValue = parseInt(value, 10);
      if (numValue > maxVal) {
        inputEl.value = maxVal;
      } else if (numValue < minVal) {
        inputEl.value = minVal;
      }
    }
  });

  // OK button behavior
  okBtn.addEventListener("click", () => {
    const value = Number(inputEl.value);

    if (!value || value < 2 || value > 10) {
      alert("Oops... enter a valid number (2–15).");
      return;
    }

    localStorage.setItem("letterCount", value);
    window.location.href = "step2.html";
  });
})();

// Shared helper: get a random readable color for letters
function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 70%, 35%)`;
}

// Shared constants & helpers
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function typeText(el, text, speed = 40) {
  if (!el) return;
  el.textContent = "";
  let i = 0;
  const typing = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i === text.length) clearInterval(typing);
  }, speed);
}

function formatNumberSequence(inputEl, maxDigits, maxDigitValue) {
  let digits = inputEl.value.replace(/\D/g, "");
  let result = [];

  for (let char of digits) {
    const num = Number(char);
    if (num >= 1 && num <= maxDigitValue) result.push(num);
    if (result.length === maxDigits) break;
  }

  inputEl.value = result.join(" ");
}

function applyColorsToCells(container) {
  container.querySelectorAll('.cell').forEach(cell => {
    cell.style.color = getRandomColor();
  });
}

function buildNumberLabels(container, count) {
  container.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    container.appendChild(div);
  }
}

function getRandomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

// UI-only distraction questions (pure UI, no side effects)
// These questions are purely visual, never stored, and never used by any logic.
const personalQuestions = [
  "What is their favorite color?",
  "What is their favorite food?",
  "What's their favorite hobby?",
  "Which city do they like best?",
  "What's their favorite animal?",
  "What's their favorite movie?",
  "What's their favorite season?",
  "Do they prefer coffee or tea?",
  "What's their favorite number?",
  "What's their favorite sport?"
];

// Show a modal question that intentionally does not affect app state.
// Returns a Promise that resolves when the user completes the required UI-only answer.
function showPersonalQuestionModal(question) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'question-modal';

    overlay.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-question">${question}</div>
        <input class="modal-answer" placeholder="Type your answer (won't be saved)" aria-required="true" maxlength="12" />
        <div class="validation-message" aria-live="polite"></div>
        <div class="modal-actions">
          <button class="modal-continue" disabled>Continue</button>
        </div>
      </div>
    `;

    const MIN_LEN = 1;
    const MAX_LEN = 12;

    const inputEl = overlay.querySelector('.modal-answer');
    const continueBtn = overlay.querySelector('.modal-continue');
    const validationEl = overlay.querySelector('.validation-message');

    function cleanup() {
      // Remove modal and all listeners
      if (overlay && overlay.parentNode) document.body.removeChild(overlay);
      window.removeEventListener('beforeunload', onBeforeUnload);
      inputEl.removeEventListener('input', onInput);
      continueBtn.removeEventListener('click', onContinue);
      document.removeEventListener('keydown', onKey);
    }

    function onBeforeUnload() {
      // Ensure modal is removed if page changes; resolve so callers continue
      cleanup();
      resolve();
    }

    function onInput() {
      // Enforce letters only and max length in real time
      let filtered = inputEl.value.replace(/[^a-zA-Z]/g, '').slice(0, MAX_LEN);
      if (filtered !== inputEl.value) {
        inputEl.value = filtered;
      }

      if (filtered.length < MIN_LEN) {
        validationEl.textContent = 'Required — enter letters only (max 12).';
        continueBtn.disabled = true;
      } else {
        validationEl.textContent = '';
        continueBtn.disabled = false;
      }
    }

    function onContinue() {
      // Do not store or process the answer. This is UI-only.
      cleanup();
      resolve();
    }

    function onKey(e) {
      if (e.key === 'Enter') {
        // Only submit if input valid
        if (!continueBtn.disabled) onContinue();
      }
      // Intentionally ignore Escape to prevent skipping
    }

    // Do not close when clicking outside; only allow completion via Continue
    overlay.addEventListener('click', (e) => {
      // clicks outside are ignored intentionally
      // clicking inside the modal should not propagate to overlay handlers
      // nothing to do here
    });

    inputEl.addEventListener('input', onInput);
    continueBtn.addEventListener('click', onContinue);
    document.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onBeforeUnload);

    document.body.appendChild(overlay);

    // Focus and initialize validation state
    inputEl.focus();
    onInput();
  });
}

// STEP 2: Column selection page (step2.html)
(function () {
  const promptEl = document.getElementById("prompt");
  const subpromptEl = document.getElementById("subprompt");
  const tableInstructionEl = document.getElementById("tableInstruction");
  const userInput = document.getElementById("userInput");
  const okBtn = document.getElementById("okBtn");
  const colNumbers = document.getElementById("colNumbers");
  const grid = document.getElementById("letterGrid");
  

  if (!promptEl || !subpromptEl || !userInput || !okBtn || !colNumbers || !grid) return;

  // Get value from first page
  const letterCount = Number(localStorage.getItem("letterCount")) || 7;

  const instructionText =
"-Spell the name in your mind\n" +
"-Only look at Columns\n" +
"-Find each letter and choose its column number\n" +
"-Choose numbers in order following the name's spelling";

  const promptText = "";
  const subText = "";

  window.addEventListener("load", () => {
    
    // Display instruction above table
    if (tableInstructionEl && instructionText) {
      typeText(tableInstructionEl, instructionText);
    }
    // Hide prompt and subprompt if empty
    if (!promptText) {
      if (promptEl) promptEl.style.display = "none";
    } else {
      typeText(promptEl, promptText);
    }
    if (!subText) {
      if (subpromptEl) subpromptEl.style.display = "none";
    } else {
      setTimeout(() => {
        typeText(subpromptEl, subText, 50);
      }, 800);
    }
  });

  // Build column numbers
  buildNumberLabels(colNumbers, letterCount);

  // Build letter grid
  const alphabet = ALPHABET;
  grid.style.setProperty("--cols", letterCount);

  // Function to get random letter (uses shared helper)
  // getRandomLetter() is available globally




  // Calculate total cells needed (rows * columns)
  const totalRows = Math.ceil(alphabet.length / letterCount);
  const totalCells = totalRows * letterCount;

  // Fill all cells, using alphabet letters first, then random letters for empty cells
  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (i < alphabet.length) {
      cell.textContent = alphabet[i];
    } else {
      // Fill empty cells with random letters
      cell.textContent = "";
    }
    cell.style.color = getRandomColor();
    grid.appendChild(cell);
  }

  // Re-apply colors to every cell as a fallback to ensure none are left uncolored
  applyColorsToCells(grid);

  // Input control
  userInput.addEventListener("input", () => formatNumberSequence(userInput, letterCount, letterCount));

  // OK (STEP 2)
  okBtn.addEventListener("click", () => {
    if (!userInput.value) {
      alert("Please enter numbers.");
      return;
    }

    const values = userInput.value.split(" ").map(Number);

    if (values.length !== letterCount) {
      alert(`You must enter exactly ${letterCount} numbers.`);
      return;
    }

    localStorage.setItem("columnChoices", JSON.stringify(values));

    // Show UI-only personal question (purely visual; no state changes)
    const q = personalQuestions[Math.floor(Math.random() * personalQuestions.length)];
    showPersonalQuestionModal(q).then(() => {
      // After user dismisses the question, proceed to Step 3
      window.location.href = "step3.html";
    });
  });
})();

// STEP 3: Row selection + final name (step3.html)
(function () {
  const rowInput = document.getElementById("rowInput");
  const rowNumbers = document.getElementById("rowNumbers");
  const grid = document.getElementById("letterGrid");
  const okBtn = document.getElementById("okBtn");
  const loading = document.getElementById("loading");
  const resultEl = document.getElementById("result");
  const promptEl = document.getElementById("prompt");
  const tableInstructionEl = document.getElementById("tableInstruction");

  if (!rowInput || !rowNumbers || !grid || !okBtn || !loading || !resultEl) return;

  const letterCount = Number(localStorage.getItem("letterCount"));
  const columnChoices = JSON.parse(localStorage.getItem("columnChoices"));
  const alphabet = ALPHABET;
    const usedLetters = new Set(alphabet);

  // Function to get random letter
function getSafeRandomLetter() {
  const safeLetters = alphabet.filter(l => !usedLetters.has(l));

  // fallback (just in case)
  if (safeLetters.length === 0) {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return safeLetters[Math.floor(Math.random() * safeLetters.length)];
}




  // Build table (same logic as original step3.js)
  function buildTable() {
    const rows = [];
    let index = 0;

    while (index < alphabet.length) {
      rows.push(alphabet.slice(index, index + letterCount));
      index += letterCount;
    }

    return rows.map(row =>
      columnChoices.map(col => {
        const letter = row[col - 1];
        // If cell is empty, fill with random letter
        return letter || getSafeRandomLetter();
      })
    );
  }

  const letterTable = buildTable();

  // Display instruction text above table with typing effect
   const instructionText =
"-Spell the name in your mind again.\n" +
"-Only look at Rows.\n" +
"-Find each letter and choose the corresponding column number.\n" +
"-In order of the name's spelling.";
  
  window.addEventListener("load", () => {
    // Display instruction above table
    if (tableInstructionEl && instructionText) {
      typeText(tableInstructionEl, instructionText);
    }
    // Hide prompt if not needed
    if (promptEl) {
      promptEl.style.display = "none";
    }
  });

  // Build row numbers
  buildNumberLabels(rowNumbers, letterTable.length);

  // Build grid
  grid.style.setProperty("--cols", letterCount);

  letterTable.forEach(row => {
    row.forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "cell";
      // Ensure cell always has content (should already be filled by buildTable, but double-check)
      cell.textContent = letter || getSafeRandomLetter();
      cell.style.color = getRandomColor();
      grid.appendChild(cell);
    });
  });

  // Re-apply colors to every cell as a fallback to ensure none are left uncolored
  applyColorsToCells(grid);

  // Input control
  rowInput.addEventListener("input", () => formatNumberSequence(rowInput, letterCount, letterTable.length));

  // Final OK
  okBtn.addEventListener("click", () => {
    const picks = rowInput.value.split(" ").map(Number);

    if (picks.length !== letterCount) {
      alert(`You must enter exactly ${letterCount} numbers.`);
      return;
    }

    // Show UI-only personal question (purely visual; no state changes)
    const q = personalQuestions[Math.floor(Math.random() * personalQuestions.length)];
    showPersonalQuestionModal(q).then(() => {
      loading.style.display = "block";
      loading.textContent = "Reading your mind...";

      setTimeout(() => {
        loading.style.display = "none";
        resultEl.style.display = "block";
        resultEl.textContent = getFinalName(picks);
      }, 3000);
    });
  });

  // Core magic
  function getFinalName(picks) {
    let name = "";

    for (let i = 0; i < picks.length; i++) {
      name += letterTable[picks[i] - 1][i];
    }

    return name;
  }
})();

//for reset buton
const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
      if (!confirm("Do you want to start over from the beginning?")) return;

    // nice exit animation
    document.body.style.transition = "opacity 0.4s ease";
    document.body.style.opacity = "0";

    setTimeout(() => {
      localStorage.clear();
      window.location.href = "index.html";
    }, 400);
  });
}


