"use strict";

const HISTORY_KEY = "orbitcalc.history";
const MAX_DIGITS = 15;
const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

const conversionCategories = {
  length: {
    description: "Convert between common metric and imperial length units.",
    defaultFrom: "meter",
    defaultTo: "foot",
    units: [
      { id: "micrometer", label: "Micrometers (µm)", factor: 0.000001 },
      { id: "millimeter", label: "Millimeters (mm)", factor: 0.001 },
      { id: "centimeter", label: "Centimeters (cm)", factor: 0.01 },
      { id: "meter", label: "Meters (m)", factor: 1 },
      { id: "kilometer", label: "Kilometers (km)", factor: 1000 },
      { id: "inch", label: "Inches (in)", factor: 0.0254 },
      { id: "foot", label: "Feet (ft)", factor: 0.3048 },
      { id: "yard", label: "Yards (yd)", factor: 0.9144 },
      { id: "mile", label: "Miles (mi)", factor: 1609.344 },
    ],
  },
  temperature: {
    description: "Convert between Celsius, Fahrenheit, and Kelvin.",
    defaultFrom: "celsius",
    defaultTo: "fahrenheit",
    units: [
      { id: "celsius", label: "Celsius (°C)" },
      { id: "fahrenheit", label: "Fahrenheit (°F)" },
      { id: "kelvin", label: "Kelvin (K)" },
    ],
  },
  area: {
    description: "Convert between common metric and imperial area units.",
    defaultFrom: "square-meter",
    defaultTo: "square-foot",
    units: [
      { id: "square-millimeter", label: "Square millimeters (mm²)", factor: 0.000001 },
      { id: "square-centimeter", label: "Square centimeters (cm²)", factor: 0.0001 },
      { id: "square-meter", label: "Square meters (m²)", factor: 1 },
      { id: "hectare", label: "Hectares (ha)", factor: 10000 },
      { id: "square-kilometer", label: "Square kilometers (km²)", factor: 1000000 },
      { id: "square-inch", label: "Square inches (in²)", factor: 0.00064516 },
      { id: "square-foot", label: "Square feet (ft²)", factor: 0.09290304 },
      { id: "square-yard", label: "Square yards (yd²)", factor: 0.83612736 },
      { id: "acre", label: "Acres (ac)", factor: 4046.8564224 },
      { id: "square-mile", label: "Square miles (mi²)", factor: 2589988.110336 },
    ],
  },
  volume: {
    description: "Convert between metric volumes, US and imperial liquid measures, and cubic units.",
    defaultFrom: "liter",
    defaultTo: "gallon-us",
    units: [
      { id: "milliliter", label: "Milliliters (mL)", factor: 0.000001 },
      { id: "liter", label: "Liters (L)", factor: 0.001 },
      { id: "cubic-meter", label: "Cubic meters (m³)", factor: 1 },
      { id: "teaspoon-us", label: "US teaspoons (tsp)", factor: 0.00000492892159375 },
      { id: "tablespoon-us", label: "US tablespoons (tbsp)", factor: 0.00001478676478125 },
      { id: "fluid-ounce-us", label: "US fluid ounces (fl oz)", factor: 0.0000295735295625 },
      { id: "cup-us", label: "US cups (cup)", factor: 0.0002365882365 },
      { id: "pint-us", label: "US pints (pt)", factor: 0.000473176473 },
      { id: "quart-us", label: "US quarts (qt)", factor: 0.000946352946 },
      { id: "gallon-us", label: "US gallons (gal)", factor: 0.003785411784 },
      { id: "fluid-ounce-imperial", label: "Imperial fluid ounces (imp fl oz)", factor: 0.0000284130625 },
      { id: "pint-imperial", label: "Imperial pints (imp pt)", factor: 0.00056826125 },
      { id: "quart-imperial", label: "Imperial quarts (imp qt)", factor: 0.0011365225 },
      { id: "gallon-imperial", label: "Imperial gallons (imp gal)", factor: 0.00454609 },
      { id: "cubic-inch", label: "Cubic inches (in³)", factor: 0.000016387064 },
      { id: "cubic-foot", label: "Cubic feet (ft³)", factor: 0.028316846592 },
    ],
  },
  weight: {
    description: "Convert between metric mass units and common US/imperial weight units.",
    defaultFrom: "kilogram",
    defaultTo: "pound",
    units: [
      { id: "milligram", label: "Milligrams (mg)", factor: 0.000001 },
      { id: "gram", label: "Grams (g)", factor: 0.001 },
      { id: "kilogram", label: "Kilograms (kg)", factor: 1 },
      { id: "metric-tonne", label: "Metric tonnes (t)", factor: 1000 },
      { id: "ounce", label: "Ounces (oz)", factor: 0.028349523125 },
      { id: "pound", label: "Pounds (lb)", factor: 0.45359237 },
      { id: "stone", label: "Stones (st)", factor: 6.35029318 },
      { id: "short-ton", label: "US short tons", factor: 907.18474 },
    ],
  },
};

const display = document.querySelector("#display");
const expressionDisplay = document.querySelector("#expression");
const statusDisplay = document.querySelector("#status");
const keypad = document.querySelector(".keypad");
const historyList = document.querySelector("#history-list");
const emptyHistory = document.querySelector("#empty-history");
const clearHistoryButton = document.querySelector("#clear-history");
const appTabs = document.querySelector(".app-tabs");
const calculatorPanel = document.querySelector("#calculator-panel");
const conversionPanel = document.querySelector("#conversion-panel");
const categoryTabs = document.querySelector(".category-tabs");
const converterPanel = document.querySelector("#converter-panel");
const conversionDescription = document.querySelector(".conversion-description");
const conversionInput = document.querySelector("#conversion-input");
const fromUnit = document.querySelector("#from-unit");
const toUnit = document.querySelector("#to-unit");
const swapUnitsButton = document.querySelector("#swap-units");
const conversionResult = document.querySelector("#conversion-result");

let currentInput = "0";
let accumulator = null;
let pendingOperator = null;
let shouldStartNewInput = false;
let lastOperator = null;
let lastOperand = null;
let history = loadHistory();

setupTabList(appTabs, ".app-tab", (button) => {
  const showCalculator = button.id === "calculator-tab";
  calculatorPanel.hidden = !showCalculator;
  conversionPanel.hidden = showCalculator;
});

setupTabList(categoryTabs, ".category-tab", (button) => {
  setConversionCategory(button.dataset.category);
});

conversionInput.addEventListener("input", updateConversion);
fromUnit.addEventListener("change", updateConversion);
toUnit.addEventListener("change", updateConversion);
swapUnitsButton.addEventListener("click", () => {
  const previousFrom = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = previousFrom;
  updateConversion();
});

renderHistory();
render();
setConversionCategory("length");

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, value } = button.dataset;
  runAction(action, value);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (calculatorPanel.hidden) return;
  if (event.target instanceof HTMLElement && event.target.closest("input, select, textarea, button, [contenteditable='true']")) return;

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

function setupTabList(tabList, tabSelector, onActivate) {
  tabList.addEventListener("click", (event) => {
    const button = event.target.closest(tabSelector);
    if (button) activateTab(button, tabList, tabSelector, onActivate);
  });

  tabList.addEventListener("keydown", (event) => {
    const tabs = [...tabList.querySelectorAll(tabSelector)];
    const currentIndex = tabs.indexOf(event.target);
    if (currentIndex === -1) return;

    let nextIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex], tabList, tabSelector, onActivate);
  });
}

function activateTab(activeTab, tabList, tabSelector, onActivate) {
  for (const tab of tabList.querySelectorAll(tabSelector)) {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  }
  onActivate(activeTab);
}

function setConversionCategory(categoryId) {
  const category = conversionCategories[categoryId];
  if (!category) return;

  const activeTab = categoryTabs.querySelector(`[data-category="${categoryId}"]`);
  converterPanel.setAttribute("aria-labelledby", activeTab.id);
  conversionDescription.textContent = category.description;

  for (const select of [fromUnit, toUnit]) {
    select.replaceChildren();
    for (const unit of category.units) {
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = unit.label;
      select.append(option);
    }
  }

  fromUnit.value = category.defaultFrom;
  toUnit.value = category.defaultTo;
  updateConversion();
}

function updateConversion() {
  const valueText = conversionInput.value.trim();
  if (valueText === "") {
    conversionResult.textContent = "Enter a value to convert";
    return;
  }

  const value = Number(valueText);
  if (!Number.isFinite(value)) {
    conversionResult.textContent = "Enter a valid number";
    return;
  }

  const categoryTab = categoryTabs.querySelector('[role="tab"][aria-selected="true"]');
  const category = conversionCategories[categoryTab.dataset.category];
  const source = category.units.find((unit) => unit.id === fromUnit.value);
  const destination = category.units.find((unit) => unit.id === toUnit.value);
  let result;

  if (categoryTab.dataset.category === "temperature") {
    result = convertTemperature(value, source.id, destination.id);
    if (result === null) {
      conversionResult.textContent = "Temperature cannot be below absolute zero";
      return;
    }
  } else {
    if (value < 0) {
      conversionResult.textContent = "Enter a non-negative value";
      return;
    }
    result = value * source.factor / destination.factor;
  }

  if (!Number.isFinite(result)) {
    conversionResult.textContent = "This value is too large to convert";
    return;
  }

  const rounded = Number(result.toPrecision(12));
  const formatted = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 }).format(rounded);
  const unitSymbol = destination.label.match(/\(([^)]+)\)$/)?.[1] ?? destination.label;
  conversionResult.textContent = `${formatted} ${unitSymbol}`;
}

function convertTemperature(value, sourceId, destinationId) {
  const kelvin = {
    celsius: value + 273.15,
    fahrenheit: (value - 32) * 5 / 9 + 273.15,
    kelvin: value,
  }[sourceId];

  if (!Number.isFinite(kelvin) || kelvin < -1e-10) return null;
  const absoluteTemperature = Math.max(0, kelvin);
  return {
    celsius: absoluteTemperature - 273.15,
    fahrenheit: (absoluteTemperature - 273.15) * 9 / 5 + 32,
    kelvin: absoluteTemperature,
  }[destinationId];
}
