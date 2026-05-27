(function() {
    'use strict';

    const STORAGE_KEYS = {
        ACTIVE_TAB: 'workbench_activeTab',
        TODO_ITEMS: 'todo_items'
    };

    const EXCHANGE_RATES = {
        CNY: 1,
        USD: 0.14,
        EUR: 0.13,
        JPY: 21.0,
        GBP: 0.11,
        HKD: 1.09
    };

    const state = {
        calculator: {
            currentValue: '0',
            expression: '',
            lastOperator: null,
            lastOperand: null,
            shouldResetDisplay: false,
            isError: false
        },
        todo: [],
        exchange: {
            fromCurrency: 'CNY',
            toCurrency: 'USD',
            fromAmount: 1,
            toAmount: 0.14
        },
        activeTab: 'calculator'
    };

    const MAX_DISPLAY_LENGTH = 12;
    const MAX_DECIMAL_PLACES = 8;
    const ERROR_MESSAGE = 'Error';

    const elements = {
        tabBtns: document.querySelectorAll('.tab-btn'),
        toolContents: document.querySelectorAll('.tool-content'),
        toast: document.getElementById('toast'),
        calc: {
            result: document.getElementById('result'),
            expression: document.getElementById('expression'),
            btnAc: document.getElementById('btn-ac'),
            btnDel: document.getElementById('btn-del'),
            btnPercent: document.getElementById('btn-percent'),
            btnSign: document.getElementById('btn-sign'),
            btnDecimal: document.getElementById('btn-decimal'),
            btnEquals: document.getElementById('btn-equals'),
            btnAdd: document.getElementById('btn-add'),
            btnSubtract: document.getElementById('btn-subtract'),
            btnMultiply: document.getElementById('btn-multiply'),
            btnDivide: document.getElementById('btn-divide'),
            numberBtns: document.querySelectorAll('.btn-number:not(#btn-decimal)')
        },
        todo: {
            input: document.getElementById('todo-input'),
            addBtn: document.getElementById('todo-add'),
            list: document.getElementById('todo-list'),
            stats: document.getElementById('todo-stats'),
            clearBtn: document.getElementById('todo-clear-completed')
        },
        exchange: {
            fromAmount: document.getElementById('exchange-from-amount'),
            toAmount: document.getElementById('exchange-to-amount'),
            fromCurrency: document.getElementById('exchange-from-currency'),
            toCurrency: document.getElementById('exchange-to-currency'),
            swapBtn: document.getElementById('exchange-swap'),
            rateInfo: document.getElementById('exchange-rate-info')
        }
    };

    function showToast(message) {
        elements.toast.textContent = message;
        elements.toast.classList.add('show');
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 2000);
    }

    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Storage save error:', e);
        }
    }

    function loadFromStorage(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage load error:', e);
            return defaultValue;
        }
    }

    function switchTab(tabName) {
        state.activeTab = tabName;
        saveToStorage(STORAGE_KEYS.ACTIVE_TAB, tabName);

        elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        elements.toolContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tool`);
        });
    }

    function initTabManager() {
        const savedTab = loadFromStorage(STORAGE_KEYS.ACTIVE_TAB, 'calculator');
        
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.tab);
            });
        });

        if (savedTab) {
            switchTab(savedTab);
        }
    }

    function formatDisplay(value) {
        const numValue = typeof value === 'string' ? value : String(value);
        if (numValue === ERROR_MESSAGE || numValue === 'Overflow') {
            return numValue;
        }
        const num = parseFloat(numValue);
        if (Math.abs(num) > 1e308) {
            return 'Overflow';
        }
        if (Math.abs(num) >= 1e12 || numValue.length > MAX_DISPLAY_LENGTH) {
            return num.toExponential(5);
        }
        if (numValue.includes('.')) {
            const parts = numValue.split('.');
            const decimalPart = parts[1] || '';
            if (decimalPart.length > MAX_DECIMAL_PLACES) {
                return parseFloat(num).toFixed(MAX_DECIMAL_PLACES).replace(/\.?0+$/, '');
            }
        }
        if (numValue.includes('.') && !numValue.endsWith('.')) {
            const trimmed = parseFloat(numValue).toString();
            return trimmed;
        }
        return numValue;
    }

    function updateCalcDisplay() {
        const displayValue = formatDisplay(state.calculator.currentValue);
        elements.calc.result.textContent = displayValue;
        elements.calc.expression.textContent = state.calculator.expression;

        if (state.calculator.isError) {
            elements.calc.result.classList.add('error');
        } else {
            elements.calc.result.classList.remove('error');
        }

        elements.calc.result.classList.remove('small-text', 'extra-small-text');
        if (displayValue.length > 10) {
            elements.calc.result.classList.add('extra-small-text');
        } else if (displayValue.length > 7) {
            elements.calc.result.classList.add('small-text');
        }

        updateAcButton();
    }

    function updateAcButton() {
        const hasInput = state.calculator.currentValue !== '0' || state.calculator.expression !== '';
        elements.calc.btnAc.disabled = !hasInput && !state.calculator.isError;
    }

    function resetCalculator() {
        state.calculator.currentValue = '0';
        state.calculator.expression = '';
        state.calculator.lastOperator = null;
        state.calculator.lastOperand = null;
        state.calculator.shouldResetDisplay = false;
        state.calculator.isError = false;
        updateCalcDisplay();
        clearOperatorActive();
    }

    function clearOperatorActive() {
        document.querySelectorAll('.btn-operator').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    function setOperatorActive(operatorBtn) {
        clearOperatorActive();
        if (operatorBtn) {
            operatorBtn.classList.add('active');
        }
    }

    function inputNumber(digit) {
        if (state.calculator.isError) {
            resetCalculator();
        }
        if (state.calculator.shouldResetDisplay) {
            state.calculator.currentValue = digit;
            state.calculator.shouldResetDisplay = false;
            clearOperatorActive();
        } else {
            if (state.calculator.currentValue.replace(/[.-]/g, '').length >= MAX_DISPLAY_LENGTH) {
                return;
            }
            if (state.calculator.currentValue === '0' && digit !== '0') {
                state.calculator.currentValue = digit;
            } else if (state.calculator.currentValue !== '0') {
                state.calculator.currentValue += digit;
            }
        }
        updateCalcDisplay();
    }

    function inputDecimal() {
        if (state.calculator.isError) {
            resetCalculator();
        }
        if (state.calculator.shouldResetDisplay) {
            state.calculator.currentValue = '0.';
            state.calculator.shouldResetDisplay = false;
            clearOperatorActive();
            updateCalcDisplay();
            return;
        }
        if (state.calculator.currentValue.includes('.')) {
            return;
        }
        state.calculator.currentValue += '.';
        updateCalcDisplay();
    }

    function inputOperator(operator, btn) {
        if (state.calculator.isError) {
            return;
        }
        if (state.calculator.expression === '') {
            state.calculator.expression = state.calculator.currentValue + ' ' + operator + ' ';
        } else {
            const lastChar = state.calculator.expression.trim().slice(-1);
            if (['+', '-', '×', '÷'].includes(lastChar)) {
                if (!state.calculator.shouldResetDisplay) {
                    state.calculator.expression = state.calculator.expression + state.calculator.currentValue + ' ' + operator + ' ';
                } else {
                    state.calculator.expression = state.calculator.expression.trim().slice(0, -1) + operator + ' ';
                }
            } else {
                state.calculator.expression = state.calculator.expression + state.calculator.currentValue + ' ' + operator + ' ';
            }
        }
        state.calculator.lastOperator = operator;
        state.calculator.shouldResetDisplay = true;
        setOperatorActive(btn);
        updateCalcDisplay();
    }

    function evaluateExpression(expr) {
        try {
            let calcExpr = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');
            const result = Function('"use strict"; return (' + calcExpr + ')')();
            if (!isFinite(result)) {
                state.calculator.isError = true;
                return ERROR_MESSAGE;
            }
            if (Math.abs(result) > 1e308) {
                state.calculator.isError = true;
                return 'Overflow';
            }
            const formatted = formatNumber(result);
            return formatted;
        } catch (e) {
            state.calculator.isError = true;
            return ERROR_MESSAGE;
        }
    }

    function formatNumber(num) {
        if (Math.abs(num) >= 1e12) {
            return num.toExponential(5);
        }
        const rounded = parseFloat(num.toPrecision(12));
        if (Number.isInteger(rounded)) {
            return String(rounded);
        }
        return parseFloat(rounded.toFixed(MAX_DECIMAL_PLACES)).toString();
    }

    function calculateEquals() {
        if (state.calculator.isError) {
            return;
        }
        if (state.calculator.expression === '') {
            return;
        }
        let fullExpression;
        if (state.calculator.shouldResetDisplay && state.calculator.lastOperand !== null) {
            fullExpression = state.calculator.currentValue + ' ' + state.calculator.lastOperator + ' ' + state.calculator.lastOperand;
        } else {
            fullExpression = state.calculator.expression + state.calculator.currentValue;
            state.calculator.lastOperand = state.calculator.currentValue;
        }
        const result = evaluateExpression(fullExpression);
        state.calculator.expression = fullExpression + ' =';
        state.calculator.currentValue = result;
        state.calculator.shouldResetDisplay = true;
        clearOperatorActive();
        updateCalcDisplay();
    }

    function allClear() {
        resetCalculator();
    }

    function deleteLastChar() {
        if (state.calculator.isError) {
            resetCalculator();
            return;
        }
        if (state.calculator.shouldResetDisplay) {
            return;
        }
        if (state.calculator.currentValue.length > 1) {
            state.calculator.currentValue = state.calculator.currentValue.slice(0, -1);
        } else {
            state.calculator.currentValue = '0';
        }
        updateCalcDisplay();
    }

    function inputPercent() {
        if (state.calculator.isError) {
            return;
        }
        const num = parseFloat(state.calculator.currentValue);
        state.calculator.currentValue = formatNumber(num / 100);
        updateCalcDisplay();
    }

    function toggleSign() {
        if (state.calculator.isError) {
            return;
        }
        if (state.calculator.currentValue === '0') {
            return;
        }
        if (state.calculator.currentValue.startsWith('-')) {
            state.calculator.currentValue = state.calculator.currentValue.slice(1);
        } else {
            state.calculator.currentValue = '-' + state.calculator.currentValue;
        }
        updateCalcDisplay();
    }

    function handleCalcKeyboard(event) {
        const key = event.key;
        if (/^[0-9]$/.test(key)) {
            event.preventDefault();
            inputNumber(key);
            return;
        }
        switch (key) {
            case '+':
                event.preventDefault();
                inputOperator('+', elements.calc.btnAdd);
                break;
            case '-':
                event.preventDefault();
                inputOperator('-', elements.calc.btnSubtract);
                break;
            case '*':
                event.preventDefault();
                inputOperator('×', elements.calc.btnMultiply);
                break;
            case '/':
                event.preventDefault();
                inputOperator('÷', elements.calc.btnDivide);
                break;
            case '.':
            case ',':
                event.preventDefault();
                inputDecimal();
                break;
            case 'Enter':
            case '=':
                event.preventDefault();
                calculateEquals();
                break;
            case 'Escape':
                event.preventDefault();
                allClear();
                break;
            case 'Backspace':
                event.preventDefault();
                deleteLastChar();
                break;
            case '%':
                event.preventDefault();
                inputPercent();
                break;
        }
    }

    function initCalculator() {
        elements.calc.numberBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                inputNumber(btn.textContent);
            });
        });

        elements.calc.btnDecimal.addEventListener('click', inputDecimal);
        elements.calc.btnAdd.addEventListener('click', () => inputOperator('+', elements.calc.btnAdd));
        elements.calc.btnSubtract.addEventListener('click', () => inputOperator('-', elements.calc.btnSubtract));
        elements.calc.btnMultiply.addEventListener('click', () => inputOperator('×', elements.calc.btnMultiply));
        elements.calc.btnDivide.addEventListener('click', () => inputOperator('÷', elements.calc.btnDivide));
        elements.calc.btnEquals.addEventListener('click', calculateEquals);
        elements.calc.btnAc.addEventListener('click', allClear);
        elements.calc.btnDel.addEventListener('click', deleteLastChar);
        elements.calc.btnPercent.addEventListener('click', inputPercent);
        elements.calc.btnSign.addEventListener('click', toggleSign);

        document.addEventListener('keydown', handleCalcKeyboard);
        updateCalcDisplay();
    }

    function renderTodoList() {
        elements.todo.list.innerHTML = '';
        state.todo.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'todo-item' + (item.completed ? ' completed' : '');
            li.dataset.index = index;

            const checkbox = document.createElement('div');
            checkbox.className = 'todo-checkbox';
            checkbox.addEventListener('click', () => toggleTodoComplete(index));

            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = item.text;
            text.addEventListener('dblclick', () => startEditTodo(index));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'todo-delete';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => deleteTodo(index));

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);
            elements.todo.list.appendChild(li);
        });
        updateTodoStats();
    }

    function updateTodoStats() {
        const total = state.todo.length;
        const completed = state.todo.filter(item => item.completed).length;
        elements.todo.stats.textContent = `已完成: ${completed} / ${total}`;
    }

    function saveTodos() {
        saveToStorage(STORAGE_KEYS.TODO_ITEMS, state.todo);
    }

    function addTodo() {
        const text = elements.todo.input.value.trim();
        if (!text) {
            showToast('请输入待办事项');
            return;
        }
        const newItem = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        state.todo.unshift(newItem);
        saveTodos();
        renderTodoList();
        elements.todo.input.value = '';
        elements.todo.input.focus();
        showToast('待办已添加');
    }

    function deleteTodo(index) {
        const item = elements.todo.list.children[index];
        if (item) {
            item.classList.add('deleting');
            setTimeout(() => {
                state.todo.splice(index, 1);
                saveTodos();
                renderTodoList();
                showToast('待办已删除');
            }, 300);
        }
    }

    function toggleTodoComplete(index) {
        state.todo[index].completed = !state.todo[index].completed;
        state.todo[index].updatedAt = Date.now();
        saveTodos();
        renderTodoList();
    }

    function startEditTodo(index) {
        const li = elements.todo.list.children[index];
        if (!li) return;

        const textSpan = li.querySelector('.todo-text');
        const currentText = state.todo[index].text;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-edit-input';
        input.value = currentText;

        li.replaceChild(input, textSpan);
        input.focus();
        input.select();

        function finishEdit() {
            const newText = input.value.trim();
            if (newText) {
                state.todo[index].text = newText;
                state.todo[index].updatedAt = Date.now();
                saveTodos();
            }
            renderTodoList();
        }

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                input.value = currentText;
                input.blur();
            }
        });
    }

    function clearCompletedTodos() {
        const completedCount = state.todo.filter(item => item.completed).length;
        if (completedCount === 0) {
            showToast('没有已完成的待办');
            return;
        }
        state.todo = state.todo.filter(item => !item.completed);
        saveTodos();
        renderTodoList();
        showToast(`已清除 ${completedCount} 项已完成待办`);
    }

    function initTodo() {
        state.todo = loadFromStorage(STORAGE_KEYS.TODO_ITEMS, []);
        renderTodoList();

        elements.todo.addBtn.addEventListener('click', addTodo);
        elements.todo.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTodo();
            }
        });
        elements.todo.clearBtn.addEventListener('click', clearCompletedTodos);
    }

    function calculateExchange() {
        const fromRate = EXCHANGE_RATES[state.exchange.fromCurrency];
        const toRate = EXCHANGE_RATES[state.exchange.toCurrency];
        const result = (state.exchange.fromAmount / fromRate) * toRate;
        state.exchange.toAmount = parseFloat(result.toFixed(4));
        elements.exchange.toAmount.value = state.exchange.toAmount;
        
        const rate = (toRate / fromRate).toFixed(4);
        elements.exchange.rateInfo.textContent = `1 ${state.exchange.fromCurrency} = ${rate} ${state.exchange.toCurrency}`;
    }

    function swapCurrencies() {
        const tempCurrency = state.exchange.fromCurrency;
        const tempAmount = state.exchange.fromAmount;

        state.exchange.fromCurrency = state.exchange.toCurrency;
        state.exchange.toCurrency = tempCurrency;
        
        state.exchange.fromAmount = state.exchange.toAmount || 0;

        elements.exchange.fromCurrency.value = state.exchange.fromCurrency;
        elements.exchange.toCurrency.value = state.exchange.toCurrency;
        elements.exchange.fromAmount.value = state.exchange.fromAmount;

        calculateExchange();
    }

    function initExchange() {
        calculateExchange();

        elements.exchange.fromAmount.addEventListener('input', (e) => {
            state.exchange.fromAmount = parseFloat(e.target.value) || 0;
            calculateExchange();
        });

        elements.exchange.fromCurrency.addEventListener('change', (e) => {
            state.exchange.fromCurrency = e.target.value;
            calculateExchange();
        });

        elements.exchange.toCurrency.addEventListener('change', (e) => {
            state.exchange.toCurrency = e.target.value;
            calculateExchange();
        });

        elements.exchange.swapBtn.addEventListener('click', swapCurrencies);
    }

    function init() {
        initTabManager();
        initCalculator();
        initTodo();
        initExchange();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
