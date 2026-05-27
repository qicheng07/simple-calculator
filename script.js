/**
 * 简易计算器 - JavaScript逻辑
 * 实现基础四则运算、小数运算、清除功能、错误处理、运算优先级、连续运算
 */

(function() {
    'use strict';

    // ==================== 状态管理 ====================

    // 计算器状态
    const state = {
        currentValue: '0',      // 当前显示的值
        expression: '',         // 表达式字符串
        lastOperator: null,     // 最后一个运算符
        lastOperand: null,      // 最后一个操作数（用于连续等号）
        shouldResetDisplay: false, // 是否需要重置显示
        isError: false          // 是否处于错误状态
    };

    // 常量定义
    const MAX_DISPLAY_LENGTH = 12;     // 最大显示位数
    const MAX_DECIMAL_PLACES = 8;      // 小数最大位数
    const ERROR_MESSAGE = 'Error';     // 错误提示信息

    // ==================== DOM元素获取 ====================

    const elements = {
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
        numberButtons: document.querySelectorAll('.btn-number:not(#btn-decimal)')
    };

    // ==================== 工具函数 ====================

    /**
     * 格式化数字显示
     * @param {string|number} value - 要格式化的值
     * @returns {string} 格式化后的字符串
     */
    function formatDisplay(value) {
        const numValue = typeof value === 'string' ? value : String(value);

        // 错误状态直接返回
        if (numValue === ERROR_MESSAGE || numValue === 'Overflow') {
            return numValue;
        }

        // 转换为数字
        const num = parseFloat(numValue);

        // 检查是否溢出
        if (Math.abs(num) > 1e308) {
            return 'Overflow';
        }

        // 检查是否需要科学计数法（数字绝对值大于等于1e12或字符串长度超过12）
        if (Math.abs(num) >= 1e12 || numValue.length > MAX_DISPLAY_LENGTH) {
            return num.toExponential(5);
        }

        // 处理小数精度
        if (numValue.includes('.')) {
            const parts = numValue.split('.');
            const decimalPart = parts[1] || '';

            // 如果小数位数超过最大值，进行截断
            if (decimalPart.length > MAX_DECIMAL_PLACES) {
                return parseFloat(num).toFixed(MAX_DECIMAL_PLACES).replace(/\.?0+$/, '');
            }
        }

        // 移除整数部分末尾的零（如 5.0 -> 5）
        if (numValue.includes('.') && !numValue.endsWith('.')) {
            const trimmed = parseFloat(numValue).toString();
            return trimmed;
        }

        return numValue;
    }

    /**
     * 更新显示区域
     */
    function updateDisplay() {
        // 更新结果区域
        const displayValue = formatDisplay(state.currentValue);
        elements.result.textContent = displayValue;

        // 更新表达式区域
        elements.expression.textContent = state.expression;

        // 处理错误状态样式
        if (state.isError) {
            elements.result.classList.add('error');
        } else {
            elements.result.classList.remove('error');
        }

        // 根据长度调整字体大小
        elements.result.classList.remove('small-text', 'extra-small-text');
        if (displayValue.length > 10) {
            elements.result.classList.add('extra-small-text');
        } else if (displayValue.length > 7) {
            elements.result.classList.add('small-text');
        }

        // 更新AC按钮状态
        updateAcButton();
    }

    /**
     * 更新AC按钮状态
     */
    function updateAcButton() {
        const hasInput = state.currentValue !== '0' || state.expression !== '';
        elements.btnAc.disabled = !hasInput && !state.isError;
    }

    /**
     * 重置计算器状态
     */
    function resetCalculator() {
        state.currentValue = '0';
        state.expression = '';
        state.lastOperator = null;
        state.lastOperand = null;
        state.shouldResetDisplay = false;
        state.isError = false;
        updateDisplay();

        // 清除运算符激活状态
        clearOperatorActive();
    }

    /**
     * 清除运算符激活状态
     */
    function clearOperatorActive() {
        document.querySelectorAll('.btn-operator').forEach(function(btn) {
            btn.classList.remove('active');
        });
    }

    /**
     * 设置运算符激活状态
     * @param {HTMLElement} operatorBtn - 运算符按钮
     */
    function setOperatorActive(operatorBtn) {
        clearOperatorActive();
        if (operatorBtn) {
            operatorBtn.classList.add('active');
        }
    }

    // ==================== 数字输入处理 ====================

    /**
     * 处理数字输入
     * @param {string} digit - 输入的数字
     */
    function inputNumber(digit) {
        // 如果处于错误状态，先清除
        if (state.isError) {
            resetCalculator();
        }

        // 如果需要重置显示
        if (state.shouldResetDisplay) {
            state.currentValue = digit;
            state.shouldResetDisplay = false;
            clearOperatorActive();
        } else {
            // 检查最大长度限制
            if (state.currentValue.replace(/[.-]/g, '').length >= MAX_DISPLAY_LENGTH) {
                return;
            }

            // 替换初始值0或追加数字
            if (state.currentValue === '0' && digit !== '0') {
                state.currentValue = digit;
            } else if (state.currentValue !== '0') {
                state.currentValue += digit;
            }
            // 如果当前是0，再输入0，保持不变
        }

        updateDisplay();
    }

    /**
     * 处理小数点输入
     */
    function inputDecimal() {
        // 如果处于错误状态，先清除
        if (state.isError) {
            resetCalculator();
        }

        // 如果需要重置显示
        if (state.shouldResetDisplay) {
            state.currentValue = '0.';
            state.shouldResetDisplay = false;
            clearOperatorActive();
            updateDisplay();
            return;
        }

        // 检查是否已有小数点
        if (state.currentValue.includes('.')) {
            return;
        }

        // 添加小数点
        state.currentValue += '.';
        updateDisplay();
    }

    // ==================== 运算符处理 ====================

    /**
     * 处理运算符输入
     * @param {string} operator - 运算符
     * @param {HTMLElement} btn - 按钮元素
     */
    function inputOperator(operator, btn) {
        // 如果处于错误状态，不处理
        if (state.isError) {
            return;
        }

        // 如果表达式为空，将当前值作为第一个操作数
        if (state.expression === '') {
            state.expression = state.currentValue + ' ' + operator + ' ';
        } else {
            // 检查表达式是否以运算符结尾
            const lastChar = state.expression.trim().slice(-1);
            if (['+', '-', '×', '÷'].includes(lastChar)) {
                // 如果需要重置显示（用户刚输入完数字），追加当前值和运算符
                if (!state.shouldResetDisplay) {
                    // 构建完整表达式（不计算，等号时才计算）
                    state.expression = state.expression + state.currentValue + ' ' + operator + ' ';
                } else {
                    // 用户连续输入运算符，替换最后一个运算符
                    state.expression = state.expression.trim().slice(0, -1) + operator + ' ';
                }
            } else {
                // 表达式不以运算符结尾（正常情况），追加当前值和运算符
                state.expression = state.expression + state.currentValue + ' ' + operator + ' ';
            }
        }

        state.lastOperator = operator;
        state.shouldResetDisplay = true;
        setOperatorActive(btn);
        updateDisplay();
    }

    /**
     * 计算中间结果（用于连续运算）
     * @returns {string} 计算结果
     */
    function calculateIntermediate() {
        const fullExpression = state.expression + state.currentValue;
        return evaluateExpression(fullExpression);
    }

    // ==================== 表达式计算 ====================

    /**
     * 计算表达式结果
     * @param {string} expr - 表达式字符串
     * @returns {string} 计算结果
     */
    function evaluateExpression(expr) {
        try {
            // 将显示符号转换为计算符号
            let calcExpr = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-');

            // 使用 Function 构造器安全计算（比 eval 更可控）
            // 先处理乘除，再处理加减（通过 JavaScript 的运算优先级）
            const result = Function('"use strict"; return (' + calcExpr + ')')();

            // 检查除以零
            if (!isFinite(result)) {
                state.isError = true;
                return ERROR_MESSAGE;
            }

            // 检查溢出
            if (Math.abs(result) > 1e308) {
                state.isError = true;
                return 'Overflow';
            }

            // 格式化结果
            const formatted = formatNumber(result);
            return formatted;
        } catch (e) {
            state.isError = true;
            return ERROR_MESSAGE;
        }
    }

    /**
     * 格式化数字结果
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    function formatNumber(num) {
        // 检查是否需要科学计数法
        if (Math.abs(num) >= 1e12) {
            return num.toExponential(5);
        }

        // 处理浮点数精度问题
        const rounded = parseFloat(num.toPrecision(12));

        // 如果是整数，返回整数形式
        if (Number.isInteger(rounded)) {
            return String(rounded);
        }

        // 保留最多8位小数，去除末尾零
        return parseFloat(rounded.toFixed(MAX_DECIMAL_PLACES)).toString();
    }

    // ==================== 等号处理 ====================

    /**
     * 执行等于计算
     */
    function calculateEquals() {
        // 如果处于错误状态，不处理
        if (state.isError) {
            return;
        }

        // 如果表达式为空，无操作
        if (state.expression === '') {
            return;
        }

        // 构建完整表达式
        let fullExpression;
        if (state.shouldResetDisplay && state.lastOperand !== null) {
            // 连续等号：使用上次的操作数
            fullExpression = state.currentValue + ' ' + state.lastOperator + ' ' + state.lastOperand;
        } else {
            fullExpression = state.expression + state.currentValue;
            // 保存当前操作数用于连续等号
            state.lastOperand = state.currentValue;
        }

        // 计算结果
        const result = evaluateExpression(fullExpression);

        // 更新显示
        state.expression = fullExpression + ' =';
        state.currentValue = result;
        state.shouldResetDisplay = true;
        clearOperatorActive();
        updateDisplay();
    }

    // ==================== 清除功能 ====================

    /**
     * 全部清除（AC）
     */
    function allClear() {
        resetCalculator();
    }

    /**
     * 退格删除（DEL）
     */
    function deleteLastChar() {
        // 如果处于错误状态，清除错误
        if (state.isError) {
            resetCalculator();
            return;
        }

        // 如果需要重置显示，不执行删除
        if (state.shouldResetDisplay) {
            return;
        }

        // 删除最后一位
        if (state.currentValue.length > 1) {
            state.currentValue = state.currentValue.slice(0, -1);
        } else {
            state.currentValue = '0';
        }

        updateDisplay();
    }

    // ==================== 百分比功能 ====================

    /**
     * 处理百分比输入
     */
    function inputPercent() {
        // 如果处于错误状态，不处理
        if (state.isError) {
            return;
        }

        const num = parseFloat(state.currentValue);
        state.currentValue = formatNumber(num / 100);
        updateDisplay();
    }

    // ==================== 正负切换 ====================

    /**
     * 切换正负号
     */
    function toggleSign() {
        // 如果处于错误状态，不处理
        if (state.isError) {
            return;
        }

        if (state.currentValue === '0') {
            return;
        }

        if (state.currentValue.startsWith('-')) {
            state.currentValue = state.currentValue.slice(1);
        } else {
            state.currentValue = '-' + state.currentValue;
        }

        updateDisplay();
    }

    // ==================== 键盘支持 ====================

    /**
     * 处理键盘输入
     * @param {KeyboardEvent} event - 键盘事件
     */
    function handleKeyboard(event) {
        const key = event.key;

        // 数字键
        if (/^[0-9]$/.test(key)) {
            event.preventDefault();
            inputNumber(key);
            return;
        }

        // 运算符键
        switch (key) {
            case '+':
                event.preventDefault();
                inputOperator('+', elements.btnAdd);
                break;
            case '-':
                event.preventDefault();
                inputOperator('-', elements.btnSubtract);
                break;
            case '*':
                event.preventDefault();
                inputOperator('×', elements.btnMultiply);
                break;
            case '/':
                event.preventDefault();
                inputOperator('÷', elements.btnDivide);
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

    // ==================== 事件绑定 ====================

    /**
     * 初始化事件监听器
     */
    function initEventListeners() {
        // 数字按钮
        elements.numberButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                inputNumber(btn.textContent);
            });
        });

        // 小数点按钮
        elements.btnDecimal.addEventListener('click', inputDecimal);

        // 运算符按钮
        elements.btnAdd.addEventListener('click', function() {
            inputOperator('+', elements.btnAdd);
        });
        elements.btnSubtract.addEventListener('click', function() {
            inputOperator('-', elements.btnSubtract);
        });
        elements.btnMultiply.addEventListener('click', function() {
            inputOperator('×', elements.btnMultiply);
        });
        elements.btnDivide.addEventListener('click', function() {
            inputOperator('÷', elements.btnDivide);
        });

        // 等号按钮
        elements.btnEquals.addEventListener('click', calculateEquals);

        // 清除按钮
        elements.btnAc.addEventListener('click', allClear);
        elements.btnDel.addEventListener('click', deleteLastChar);

        // 百分比按钮
        elements.btnPercent.addEventListener('click', inputPercent);

        // 正负切换按钮
        elements.btnSign.addEventListener('click', toggleSign);

        // 键盘事件
        document.addEventListener('keydown', handleKeyboard);
    }

    // ==================== 初始化 ====================

    /**
     * 初始化计算器
     */
    function init() {
        initEventListeners();
        updateDisplay();
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();