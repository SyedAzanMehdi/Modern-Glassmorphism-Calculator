// DOM Elements
const previousOperandEl = document.getElementById('previous-operand');
const currentOperandEl = document.getElementById('current-operand');
const keypad = document.getElementById('keypad');

// Calculator State
let currentOperand = '0';
let previousOperand = '';
let operator = undefined;
let shouldResetScreen = false;

// Format numbers with commas
function getDisplayNumber(number) {
    // If it's the precise "Error" string, just return it
    if (number === 'Error') return 'Error';

    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split('.')[0]);
    const decimalDigits = stringNumber.split('.')[1];
    let integerDisplay;
    
    if (isNaN(integerDigits)) {
        integerDisplay = '';
    } else {
        integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }
    
    if (decimalDigits != null) {
        return `${integerDisplay}.${decimalDigits}`;
    } else {
        return integerDisplay;
    }
}

// Update the display area
function updateDisplay() {
    // Current operand display
    if (currentOperand === '' || currentOperand === '-') {
         currentOperandEl.textContent = currentOperand === '' ? '0' : currentOperand;
    } else if (currentOperand === 'Error') {
         currentOperandEl.textContent = 'Error';
    } else {
         currentOperandEl.textContent = getDisplayNumber(currentOperand);
    }
    
    // Previous operand display
    if (operator != null) {
        // Map operators to more readable symbols for UI
        let displayOp = operator;
        if (operator === '*') displayOp = '×';
        if (operator === '/') displayOp = '÷';
        
        previousOperandEl.textContent = `${getDisplayNumber(previousOperand)} ${displayOp}`;
    } else {
        previousOperandEl.textContent = '';
    }
}

// Clear all bindings
function clear() {
    currentOperand = '0';
    previousOperand = '';
    operator = undefined;
}

// Delete last character
function deleteNumber() {
    if (currentOperand === 'Error') return;
    if (shouldResetScreen) {
        currentOperand = '0';
        shouldResetScreen = false;
        return;
    }
    
    // Slice off the last character
    currentOperand = currentOperand.toString().slice(0, -1);
    
    // Default to '0' if empty
    if (currentOperand === '' || currentOperand === '-') {
        currentOperand = '0';
    }
}

// Append a number or decimal point
function appendNumber(number) {
    if (currentOperand === 'Error') currentOperand = '0';
    
    // Prevent multiple decimals
    if (number === '.' && currentOperand.includes('.')) return;
    
    if (shouldResetScreen) {
        currentOperand = number === '.' ? '0.' : number;
        shouldResetScreen = false;
        return;
    }
    
    if (currentOperand === '0' && number !== '.') {
        currentOperand = number;
    } else {
        currentOperand = currentOperand.toString() + number.toString();
    }
}

// Select an operator (+, -, *, /, %)
function chooseOperator(selectedOperator) {
    if (currentOperand === 'Error') return;
    if (currentOperand === '') return;
    
    if (previousOperand !== '') {
        calculate();
    }
    
    operator = selectedOperator;
    previousOperand = currentOperand;
    shouldResetScreen = true;
}

// Perform the calculation string logic
function calculate() {
    let result;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    
    // Validate bounds
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                result = 'Error';
            } else {
                result = prev / current;
            }
            break;
        case '%':
             // basic modulo check
             if (current === 0) {
                 result = 'Error';
             } else {
                 result = prev % current;
             }
             break;
        default:
            return;
    }
    
    // Handle floating point precision issues (e.g., 0.1 + 0.2)
    if (typeof result === 'number') {
        const factor = Math.pow(10, 10);
        result = Math.round(result * factor) / factor;
        currentOperand = result.toString();
    } else {
        currentOperand = result; // Error string bypasses
    }
    
    operator = undefined;
    previousOperand = '';
    shouldResetScreen = true;
}

// Implement Event Delegation for the keypad
keypad.addEventListener('click', (e) => {
    // Target only buttons
    const btn = e.target.closest('button');
    if (!btn) return;

    // Grab values stored in custom data attributes
    const value = btn.dataset.value;
    const action = btn.dataset.action;

    // Router logic
    if (action === 'clear') {
        clear();
    } else if (action === 'delete') {
        deleteNumber();
    } else if (action === 'operator') {
        chooseOperator(value);
    } else if (action === 'calculate') {
        calculate();
    } else if (value !== undefined) {
        appendNumber(value);
    }

    updateDisplay();
});

// Initial render
updateDisplay();
