"use strict";

const HISTORY_KEY = "orbitcalc.history";
const MAX_DIGITS = 15;
const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

const display = document.querySelector("#display");
const expressionDisplay = document.querySelector("#expression");
const statusDisplay = document.querySelector("#status");
const keypad = document.querySelector(".keypad");
const historyList = document.querySelector("#history-list");
const emptyHistory = document.querySelector("#empty-history");
const clearHistoryButton = document.querySelector("#clear-history");

let currentInput = "0";
let accumulator = null;
let pendingOperator = null;
let shouldStartNewInput = false;
let lastOperator = null;
let lastOperand = null;
let history = loadHistory();

renderHistory();
render();

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, value } = button.dataset;
  runAction(action, value);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  if (/^\d$/.test(event.key)) {
    runAction("digit", event.key);
  } else if (event.key === ".") {
    runAction("decimal");
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    runAction("operator", event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    runAction("equals");
  } else if (event.key === "Backspace") {
    event.preventDefault();
    runAction("backspace");
  } else if (event.key === "Escape" || event.key === "Delete") {
    runAction("clear");
  }
});

clearHistoryButton.addEventListener("click", clearHistory);

historyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-result]");
  if (!button) return;

  currentInput = button.dataset.result;
  accumulator = null;
  pendingOperator = null;
  lastOperator = null;
  lastOperand = null;
  shouldStartNewInput = true;
  expressionDisplay.textContent = "Recalled from history";
  setStatus("");
  render();
});

function runAction(action, value) {
  setStatus("");

  switch (action) {
    case "digit":
      enterDigit(value);
      break;
    case "decimal":
      enterDecimal();
      break;
    case "operator":
      chooseOperator(value);
      break;
    case "equals":
      calculate();
      break;
    case "clear":
      clearCalculator();
      break;
    case "backspace":
      deleteDigit();
      break;
    case "sign":
      changeSign();
      break;
    default:
      return;
  }

  render();
}

function enterDigit(digit) {
  if (currentInput === "Error") clearCalculator();

  if (shouldStartNewInput) {
    resetRepeatedCalculation();
    currentInput = digit;
    shouldStartNewInput = false;
    return;
  }

  const digits = currentInput.replace(/[-.]/g, "");
  if (digits.length >= MAX_DIGITS) return;

  currentInput = currentInput === "0" ? digit : currentInput + digit;
}

function enterDecimal() {
  if (currentInput === "Error") clearCalculator();

  if (shouldStartNewInput) {
    resetRepeatedCalculation();
    currentInput = "0.";
    shouldStartNewInput = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
}

function chooseOperator(nextOperator) {
  if (currentInput === "Error") return;

  const inputValue = Number(currentInput);
  if (pendingOperator && !shouldStartNewInput) {
    const result = performOperation(accumulator, inputValue, pendingOperator);
    if (result === null) return showCalculationError();
    accumulator = result;
    currentInput = formatNumber(result);
  } else {
    accumulator = inputValue;
  }

  pendingOperator = nextOperator;
  shouldStartNewInput = true;
  lastOperator = null;
  lastOperand = null;
  expressionDisplay.textContent = `${formatNumber(accumulator)} ${operatorSymbols[nextOperator]}`;
}

function calculate() {
  if (currentInput === "Error") return;

  let operation = pendingOperator;
  let left = accumulator;
  let right = Number(currentInput);

  if (operation && left !== null) {
    const equation = `${formatNumber(left)} ${operatorSymbols[operation]} ${formatNumber(right)}`;
    const result = performOperation(left, right, operation);
    if (result === null) return showCalculationError();

    currentInput = formatNumber(result);
    expressionDisplay.textContent = equation;
    lastOperator = operation;
    lastOperand = right;
    pendingOperator = null;
    accumulator = null;
    shouldStartNewInput = true;
    addHistory(equation, currentInput);
    return;
  }

  if (lastOperator && lastOperand !== null) {
    operation = lastOperator;
    left = Number(currentInput);
    right = lastOperand;
    const equation = `${formatNumber(left)} ${operatorSymbols[operation]} ${formatNumber(right)}`;
    const result = performOperation(left, right, operation);
    if (result === null) return showCalculationError();

    currentInput = formatNumber(result);
    expressionDisplay.textContent = equation;
    addHistory(equation, currentInput);
    shouldStartNewInput = true;
  }
}

function performOperation(left, right, operation) {
  let result;
  switch (operation) {
    case "+":
      result = left + right;
      break;
    case "-":
      result = left - right;
      break;
    case "*":
      result = left * right;
      break;
    case "/":
      if (right === 0) return null;
      result = left / right;
      break;
    default:
      return null;
  }

  return Number.isFinite(result) ? Number(result.toPrecision(12)) : null;
}

function formatNumber(number) {
  return Object.is(number, -0) ? "0" : String(number);
}

function showCalculationError() {
  currentInput = "Error";
  accumulator = null;
  pendingOperator = null;
  lastOperator = null;
  lastOperand = null;
  shouldStartNewInput = true;
  expressionDisplay.textContent = "Unable to calculate";
  setStatus("Check the numbers and try again.");
}

function clearCalculator() {
  currentInput = "0";
  accumulator = null;
  pendingOperator = null;
  shouldStartNewInput = false;
  lastOperator = null;
  lastOperand = null;
  expressionDisplay.textContent = "Ready when you are";
}

function deleteDigit() {
  if (currentInput === "Error") return clearCalculator();
  if (shouldStartNewInput) return;

  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  if (currentInput === "-") currentInput = "0";
}

function changeSign() {
  if (currentInput === "Error" || Number(currentInput) === 0) return;
  currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : `-${currentInput}`;
  if (shouldStartNewInput && pendingOperator === null) resetRepeatedCalculation();
}

function resetRepeatedCalculation() {
  if (pendingOperator !== null) return;
  lastOperator = null;
  lastOperand = null;
  expressionDisplay.textContent = "Ready when you are";
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.some((item) =>
      !item || typeof item.expression !== "string" || typeof item.result !== "string" ||
      !Number.isFinite(Number(item.result)) || typeof item.timestamp !== "number"
    )) {
      throw new Error("Saved calculator history has an invalid format.");
    }
    return parsed;
  } catch (error) {
    console.error("Unable to read calculator history.", error);
    setStatus("Saved history couldn't be loaded.");
    return [];
  }
}

function addHistory(equation, result) {
  history.unshift({ expression: equation, result, timestamp: Date.now() });
  renderHistory();
  saveHistory();
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Unable to save calculator history.", error);
    setStatus("Calculation worked, but history couldn't be saved.");
  }
}

function clearHistory() {
  if (history.length === 0) return;
  const previousHistory = history;
  history = [];
  renderHistory();

  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    history = previousHistory;
    renderHistory();
    console.error("Unable to clear calculator history.", error);
    setStatus("History couldn't be cleared. Please try again.");
  }
}

function renderHistory() {
  historyList.replaceChildren();
  for (const item of history) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    const expression = document.createElement("span");
    const result = document.createElement("span");

    button.className = "history-entry";
    button.type = "button";
    button.dataset.result = item.result;
    button.setAttribute("aria-label", `Recall ${item.expression} equals ${item.result}`);
    expression.className = "history-expression";
    expression.textContent = item.expression;
    result.className = "history-result";
    result.textContent = `= ${item.result}`;
    button.append(expression, result);
    listItem.append(button);
    historyList.append(listItem);
  }

  const hasHistory = history.length > 0;
  emptyHistory.hidden = hasHistory;
  historyList.hidden = !hasHistory;
  clearHistoryButton.disabled = !hasHistory;
}

function setStatus(message) {
  statusDisplay.textContent = message;
}

function render() {
  display.textContent = currentInput;
}
