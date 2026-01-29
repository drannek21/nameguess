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

  const questionText = "Ilang letra ang pangalan na naiisip mo?";
  const subText = "Shhhh... wag mong banggitin yung name ha.";

  const maxVal = 15;
  const minVal = 0;

  function typeText(element, text, speed = 40) {
    element.textContent = "";
    let i = 0;

    const typing = setInterval(() => {
      element.textContent += text.charAt(i);
      i++;
      if (i === text.length) clearInterval(typing);
    }, speed);
  }

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
      alert("Oopss.. lagay mo yung tamang numbers (2–15).");
      return;
    }

    localStorage.setItem("letterCount", value);
    window.location.href = "step2.html";
  });
})();

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

  const instructionText = "Spell mo yung nae sa isip mo, Column lang ang titingnan. piliin mo yung number in order dapat sa name)";
  const promptText = "";
  const subText = "";

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
  for (let i = 1; i <= letterCount; i++) {
    const div = document.createElement("div");
    div.textContent = i;
    colNumbers.appendChild(div);
  }

  // Build letter grid
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  grid.style.setProperty("--cols", letterCount);

  // Function to get random letter
  function getRandomLetter() {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }

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
      cell.textContent = getRandomLetter();
    }
    grid.appendChild(cell);
  }

  // Input control
  userInput.addEventListener("input", () => {
    let digits = userInput.value.replace(/\D/g, "");
    let result = [];

    for (let char of digits) {
      const num = Number(char);
      if (num >= 1 && num <= letterCount) result.push(num);
      if (result.length === letterCount) break;
    }

    userInput.value = result.join(" ");
  });

  // OK (STEP 2)
  okBtn.addEventListener("click", () => {
    if (!userInput.value) {
      alert("Maglagay ka ng numbers.");
      return;
    }

    const values = userInput.value.split(" ").map(Number);

    if (values.length !== letterCount) {
      alert(`Dapat eksaktong ${letterCount} numbers.`);
      return;
    }

    localStorage.setItem("columnChoices", JSON.stringify(values));
    window.location.href = "step3.html";
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
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Function to get random letter
  function getRandomLetter() {
    return alphabet[Math.floor(Math.random() * alphabet.length)];
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
        return letter || getRandomLetter();
      })
    );
  }

  const letterTable = buildTable();

  // Display instruction text above table with typing effect
  const instructionText = "Spell mo ulit sa isip mo, Row lang ang titingnan. piliin mo yung number in order dapat sa name";
  
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
  letterTable.forEach((_, i) => {
    const div = document.createElement("div");
    div.textContent = i + 1;
    rowNumbers.appendChild(div);
  });

  // Build grid
  grid.style.setProperty("--cols", letterCount);

  letterTable.forEach(row => {
    row.forEach(letter => {
      const cell = document.createElement("div");
      cell.className = "cell";
      // Ensure cell always has content (should already be filled by buildTable, but double-check)
      cell.textContent = letter || getRandomLetter();
      grid.appendChild(cell);
    });
  });

  // Input control
  rowInput.addEventListener("input", () => {
    let digits = rowInput.value.replace(/\D/g, "");
    let result = [];

    for (let d of digits) {
      const n = Number(d);
      if (n >= 1 && n <= letterTable.length) result.push(n);
      if (result.length === letterCount) break;
    }

    rowInput.value = result.join(" ");
  });

  // Final OK
  okBtn.addEventListener("click", () => {
    const picks = rowInput.value.split(" ").map(Number);

    if (picks.length !== letterCount) {
      alert(`Dapat eksaktong ${letterCount} numbers.`);
      return;
    }

    loading.style.display = "block";
    loading.textContent = "Binabasa ang isip mo...";

    setTimeout(() => {
      loading.style.display = "none";
      resultEl.style.display = "block";
      resultEl.textContent = getFinalName(picks);
    }, 3000);
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

