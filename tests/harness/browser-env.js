/**
 * EduScreen In-Memory Browser Environment Harness
 * Zero-dependency DOM, LocalStorage, SpeechSynthesis, and Canvas 2D mocks
 * Designed for Node.js 24 native test runner (`node --test`).
 */

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class DOMTokenList {
    constructor(element) {
        this.element = element;
        this.tokens = new Set();
    }
    add(...tokens) {
        for (const t of tokens) {
            if (t) this.tokens.add(t);
        }
        this._sync();
    }
    remove(...tokens) {
        for (const t of tokens) {
            this.tokens.delete(t);
        }
        this._sync();
    }
    toggle(token, force) {
        let result;
        if (force !== undefined) {
            if (force) {
                this.tokens.add(token);
                result = true;
            } else {
                this.tokens.delete(token);
                result = false;
            }
        } else {
            if (this.tokens.has(token)) {
                this.tokens.delete(token);
                result = false;
            } else {
                this.tokens.add(token);
                result = true;
            }
        }
        this._sync();
        return result;
    }
    contains(token) {
        return this.tokens.has(token);
    }
    _sync() {
        if (this.element) {
            this.element._className = Array.from(this.tokens).join(' ');
        }
    }
}

class DOMElement {
    constructor(tagName = 'div', ownerDocument = null) {
        this.tagName = tagName.toUpperCase();
        this.ownerDocument = ownerDocument;
        this.id = '';
        this._className = '';
        this.classList = new DOMTokenList(this);
        this.attributes = Object.create(null);
        this.dataset = Object.create(null);
        this.style = {
            display: '',
            width: '',
            height: '',
            top: '',
            left: '',
            color: '',
            marginBottom: '',
            setProperty(prop, val) {
                this[prop] = String(val);
            },
            getPropertyValue(prop) {
                return this[prop] || '';
            }
        };
        this.children = [];
        this.parentElement = null;
        this.listeners = Object.create(null);
        this._innerText = '';
        this._innerHTML = '';
        this.disabled = false;
        this.checked = false;
        this.value = '';
        this.onclick = null;
        this.oninput = null;
    }

    get className() {
        return this._className;
    }
    set className(val) {
        this._className = val || '';
        this.classList.tokens.clear();
        if (val) {
            val.split(/\s+/).filter(Boolean).forEach(t => this.classList.tokens.add(t));
        }
    }

    get innerText() {
        if (this._innerText) return this._innerText;
        if (this.children.length > 0) {
            return this.children.map(c => c.innerText).filter(Boolean).join(' ');
        }
        return '';
    }
    set innerText(val) {
        this._innerText = String(val);
        this._innerHTML = String(val);
    }

    get textContent() {
        return this.innerText;
    }
    set textContent(val) {
        this.innerText = val;
    }

    get innerHTML() {
        return this._innerHTML;
    }
    set innerHTML(val) {
        this._innerHTML = String(val);
        if (val === '') {
            this.children = [];
            this._innerText = '';
        } else {
            this._innerText = val.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }

    setAttribute(name, value) {
        const valStr = String(value);
        this.attributes[name] = valStr;
        if (name === 'id') this.id = valStr;
        if (name === 'class') this.className = valStr;
        if (name.startsWith('data-')) {
            const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            this.dataset[key] = valStr;
        }
        if (name === 'disabled') this.disabled = true;
        if (name === 'value') this.value = valStr;
    }

    getAttribute(name) {
        return this.attributes[name] !== undefined ? this.attributes[name] : null;
    }

    hasAttribute(name) {
        return this.attributes[name] !== undefined;
    }

    removeAttribute(name) {
        delete this.attributes[name];
        if (name === 'id') this.id = '';
        if (name === 'class') this.className = '';
        if (name.startsWith('data-')) {
            const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            delete this.dataset[key];
        }
        if (name === 'disabled') this.disabled = false;
    }

    appendChild(child) {
        if (!child) return;
        child.parentElement = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            child.parentElement = null;
        }
        return child;
    }

    addEventListener(event, fn, options) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== fn);
    }

    dispatchEvent(event) {
        if (!event.target) event.target = this;
        event.currentTarget = this;

        const handlers = this.listeners[event.type] || [];
        for (const handler of handlers) {
            try {
                handler.call(this, event);
            } catch (err) {
                console.error(`Error in ${event.type} event listener:`, err);
            }
        }

        // Event bubbling
        if (event.bubbles !== false && this.parentElement) {
            this.parentElement.dispatchEvent(event);
        }
        return !event.defaultPrevented;
    }

    click() {
        if (this.disabled) return;

        const event = {
            type: 'click',
            target: this,
            currentTarget: this,
            bubbles: true,
            defaultPrevented: false,
            preventDefault() { this.defaultPrevented = true; },
            stopPropagation() { this.bubbles = false; }
        };

        // 1. Inline onclick if set as function or string
        if (typeof this.onclick === 'function') {
            this.onclick.call(this, event);
        } else if (typeof this.onclick === 'string' && this.ownerDocument && this.ownerDocument._sandbox) {
            try {
                vm.runInContext(this.onclick, this.ownerDocument._sandbox);
            } catch (err) {
                console.error(`Error in onclick handler "${this.onclick}":`, err);
            }
        }

        // 2. Attached listeners and bubbling
        this.dispatchEvent(event);
    }

    focus() {
        if (this.ownerDocument) {
            this.ownerDocument.activeElement = this;
        }
    }

    blur() {
        if (this.ownerDocument && this.ownerDocument.activeElement === this) {
            this.ownerDocument.activeElement = null;
        }
    }

    matches(selector) {
        if (selector.startsWith('.')) {
            return this.classList.contains(selector.slice(1));
        }
        if (selector.startsWith('#')) {
            return this.id === selector.slice(1);
        }
        if (selector.includes('[')) {
            const attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]/);
            if (attrMatch) {
                const [, attrName, attrVal] = attrMatch;
                if (attrVal !== undefined) {
                    return this.getAttribute(attrName) === attrVal;
                }
                return this.hasAttribute(attrName);
            }
        }
        return this.tagName.toLowerCase() === selector.toLowerCase();
    }

    closest(selector) {
        let el = this;
        while (el) {
            if (el.matches && el.matches(selector)) return el;
            el = el.parentElement;
        }
        return null;
    }

    querySelector(selector) {
        for (const child of this.children) {
            if (child.matches(selector)) return child;
            const found = child.querySelector(selector);
            if (found) return found;
        }
        return null;
    }

    querySelectorAll(selector) {
        const matches = [];
        function recurse(el) {
            for (const child of el.children) {
                if (child.matches(selector)) {
                    matches.push(child);
                }
                recurse(child);
            }
        }
        recurse(this);
        return matches;
    }

    getBoundingClientRect() {
        return {
            width: this.style.width ? parseFloat(this.style.width) : 800,
            height: this.style.height ? parseFloat(this.style.height) : 400,
            top: 0,
            left: 0,
            right: 800,
            bottom: 400
        };
    }

    getContext(type) {
        if (this.tagName === 'CANVAS' && type === '2d') {
            if (!this._ctx) {
                this._ctx = new Canvas2DContextMock(this);
            }
            return this._ctx;
        }
        return null;
    }
}

class Canvas2DContextMock {
    constructor(canvas) {
        this.canvas = canvas;
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.font = '10px sans-serif';
        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.shadowColor = 'transparent';
        this.shadowBlur = 0;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this._calls = [];
        this._paths = [];
        this._currentPath = [];
    }

    _record(method, args) {
        this._calls.push({ method, args: Array.from(args) });
    }

    getCalls(methodName) {
        return this._calls.filter(c => c.method === methodName);
    }

    clearRect(x, y, w, h) { this._record('clearRect', arguments); }
    fillRect(x, y, w, h) { this._record('fillRect', arguments); }
    strokeRect(x, y, w, h) { this._record('strokeRect', arguments); }
    fillText(text, x, y, maxW) { this._record('fillText', arguments); }
    strokeText(text, x, y, maxW) { this._record('strokeText', arguments); }

    beginPath() {
        this._currentPath = [];
        this._record('beginPath', arguments);
    }
    closePath() {
        this._record('closePath', arguments);
    }
    moveTo(x, y) {
        this._currentPath.push({ type: 'moveTo', x, y });
        this._record('moveTo', arguments);
    }
    lineTo(x, y) {
        this._currentPath.push({ type: 'lineTo', x, y });
        this._record('lineTo', arguments);
    }
    arc(x, y, r, s, e, ccw) {
        this._currentPath.push({ type: 'arc', x, y, r, s, e, ccw });
        this._record('arc', arguments);
    }
    stroke() {
        this._paths.push({ path: [...this._currentPath], style: this.strokeStyle, action: 'stroke' });
        this._record('stroke', arguments);
    }
    fill() {
        this._paths.push({ path: [...this._currentPath], style: this.fillStyle, action: 'fill' });
        this._record('fill', arguments);
    }
    save() { this._record('save', arguments); }
    restore() { this._record('restore', arguments); }
    translate(x, y) { this._record('translate', arguments); }
    rotate(angle) { this._record('rotate', arguments); }
    scale(x, y) { this._record('scale', arguments); }
    setTransform() { this._record('setTransform', arguments); }
    resetTransform() { this._record('resetTransform', arguments); }
    measureText(text) {
        return { width: (String(text).length || 1) * 8 };
    }
}

class SpeechSynthesisUtteranceMock {
    constructor(text = '') {
        this.text = text;
        this.lang = 'en-US';
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.voice = null;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
    }
}

class SpeechSynthesisMock {
    constructor() {
        this.speaking = false;
        this.paused = false;
        this.pending = false;
        this.spokenUtterances = [];
    }

    speak(utterance) {
        this.spokenUtterances.push(utterance);
        this.speaking = true;
        if (typeof utterance.onstart === 'function') {
            utterance.onstart({ type: 'start', utterance });
        }
    }

    cancel() {
        this.speaking = false;
        const current = [...this.spokenUtterances];
        current.forEach(u => {
            if (typeof u.onerror === 'function') {
                try {
                    u.onerror({ type: 'error', error: 'canceled' });
                } catch(e) {}
            }
        });
    }

    pause() { this.paused = true; }
    resume() { this.paused = false; }
}

function parseHTMLToElements(htmlContent, document) {
    const elementsById = Object.create(null);
    const allElements = [];
    const voidTags = new Set(['meta', 'link', 'input', 'img', 'br', 'hr', 'source', 'track', 'wbr']);
    const stack = [];

    // Tokenize tags and text content
    const tokenRegex = /<\/?([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
    let match;

    while ((match = tokenRegex.exec(htmlContent)) !== null) {
        const fullMatch = match[0];
        const tagName = match[1] ? match[1].toLowerCase() : null;
        const rawAttrs = match[2];
        const textChunk = match[3];

        if (tagName) {
            const isClosing = fullMatch.startsWith('</');
            if (isClosing) {
                if (stack.length > 0 && stack[stack.length - 1].tagName.toLowerCase() === tagName) {
                    stack.pop();
                }
            } else {
                if (tagName === '!doctype' || tagName === 'script' || tagName === 'style') {
                    continue;
                }

                const el = new DOMElement(tagName, document);

                // Parse attributes
                const attrRegex = /([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
                    const name = attrMatch[1];
                    const val = attrMatch[2] !== undefined ? attrMatch[2] :
                                attrMatch[3] !== undefined ? attrMatch[3] :
                                attrMatch[4] !== undefined ? attrMatch[4] : '';
                    el.setAttribute(name, val);
                    if (name === 'id') {
                        elementsById[val] = el;
                    }
                    if (name === 'onclick') {
                        el.onclick = val;
                    }
                    if (name === 'oninput') {
                        el.oninput = val;
                    }
                    if (name === 'disabled') {
                        el.disabled = true;
                    }
                    if (name === 'value') {
                        el.value = val;
                    }
                }

                if (stack.length > 0) {
                    const parent = stack[stack.length - 1];
                    parent.appendChild(el);
                }

                allElements.push(el);

                if (!voidTags.has(tagName) && !fullMatch.endsWith('/>')) {
                    stack.push(el);
                }
            }
        } else if (textChunk && stack.length > 0) {
            const trimmed = textChunk.trim();
            if (trimmed) {
                const current = stack[stack.length - 1];
                current._innerText += (current._innerText ? ' ' : '') + trimmed;
                current._innerHTML += (current._innerHTML ? ' ' : '') + trimmed;
            }
        }
    }

    return { elementsById, allElements };
}

function createBrowserEnvironment(options = {}) {
    const htmlPath = path.resolve(__dirname, '../../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Extract CSS stylesheet content for verification
    const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
    const cssText = styleMatch ? styleMatch[1] : '';

    // In-memory Storage
    const storageStore = Object.assign({}, options.initialStorage || {});
    const localStorage = {
        _store: storageStore,
        getItem: (k) => (storageStore[k] !== undefined ? storageStore[k] : null),
        setItem: (k, v) => {
            if (options.throwQuotaExceeded) {
                const err = new Error('QuotaExceededError: Failed to execute setItem on Storage: Setting the value exceeded the quota.');
                err.name = 'QuotaExceededError';
                throw err;
            }
            storageStore[k] = String(v);
        },
        removeItem: (k) => { delete storageStore[k]; },
        clear: () => { Object.keys(storageStore).forEach(k => delete storageStore[k]); },
        key: (idx) => Object.keys(storageStore)[idx] || null,
        get length() { return Object.keys(storageStore).length; }
    };

    // Dialog & navigation telemetry
    const alertCalls = [];
    const confirmCalls = [];
    let printCalls = 0;
    let reloadCalls = 0;
    const blobUrls = {};

    // Document mock
    const document = {
        _sandbox: null,
        elementsById: Object.create(null),
        allElements: [],
        activeElement: null,
        body: new DOMElement('body'),
        documentElement: new DOMElement('html'),
        getElementById(id) {
            return this.elementsById[id] || null;
        },
        querySelector(selector) {
            if (selector.startsWith('#')) {
                return this.getElementById(selector.slice(1));
            }
            for (const el of this.allElements) {
                if (el.matches(selector)) return el;
            }
            return null;
        },
        querySelectorAll(selector) {
            return this.allElements.filter(el => el.matches(selector));
        },
        createElement(tagName) {
            const el = new DOMElement(tagName, this);
            this.allElements.push(el);
            return el;
        }
    };
    document.body.ownerDocument = document;
    document.documentElement.ownerDocument = document;

    // Parse all elements from index.html into document
    const parsed = parseHTMLToElements(htmlContent, document);
    document.elementsById = parsed.elementsById;
    document.allElements = parsed.allElements;

    // Default input values
    const studentNameInput = document.getElementById('student-name');
    if (studentNameInput) studentNameInput.value = '';
    const studentAgeInput = document.getElementById('student-age');
    if (studentAgeInput) studentAgeInput.value = '10';
    const assessmentModeSelect = document.getElementById('assessment-mode');
    if (assessmentModeSelect) assessmentModeSelect.value = 'student';

    // Canvas elements default size
    const resultsChart = document.getElementById('resultsChart');
    if (resultsChart) {
        resultsChart.width = 800;
        resultsChart.height = 400;
    }
    const radarChart = document.getElementById('radarChart');
    if (radarChart) {
        radarChart.width = 400;
        radarChart.height = 400;
    }

    // Speech synthesis mock
    const speechSynthesis = options.speechSynthesisUnavailable ? undefined : new SpeechSynthesisMock();

    // Event listeners map on window
    const windowListeners = Object.create(null);

    // Sandbox
    const sandbox = {
        window: null,
        document,
        localStorage,
        speechSynthesis,
        SpeechSynthesisUtterance: SpeechSynthesisUtteranceMock,
        console: {
            log: () => {},
            warn: () => {},
            error: () => {},
            info: () => {}
        },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Date,
        Math,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Error,
        parseInt,
        parseFloat,
        isNaN,
        Blob: globalThis.Blob || class Blob {
            constructor(parts, opts) {
                this.parts = parts;
                this.type = opts?.type || '';
            }
        },
        URL: {
            createObjectURL: (blob) => {
                const u = 'blob:eduscreen-' + Math.random().toString(36).slice(2);
                blobUrls[u] = blob;
                return u;
            },
            revokeObjectURL: (u) => {
                delete blobUrls[u];
            }
        },
        location: {
            href: 'https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/',
            protocol: options.protocol || 'https:',
            origin: 'https://aryanbarnvanshi-dev.github.io',
            reload: () => { reloadCalls++; }
        },
        navigator: {
            userAgent: 'Mozilla/5.0 (EduScreen Test Runner)',
            serviceWorker: {
                register: (path) => Promise.resolve({ scope: '/' })
            }
        },
        devicePixelRatio: options.dpr || 1,
        innerWidth: options.innerWidth || 1024,
        innerHeight: options.innerHeight || 768,
        alert: (msg) => { alertCalls.push(msg); },
        confirm: (msg) => {
            confirmCalls.push(msg);
            return options.confirmResult !== undefined ? options.confirmResult : true;
        },
        prompt: (msg, def) => def,
        print: () => { printCalls++; },
        addEventListener: (event, fn, opts) => {
            if (!windowListeners[event]) windowListeners[event] = [];
            windowListeners[event].push(fn);
        },
        removeEventListener: (event, fn) => {
            if (!windowListeners[event]) return;
            windowListeners[event] = windowListeners[event].filter(l => l !== fn);
        },
        dispatchEvent: (event) => {
            const handlers = windowListeners[event.type] || [];
            for (const handler of handlers) {
                try { handler(event); } catch (e) { console.error(e); }
            }
        }
    };

    sandbox.window = sandbox;
    document._sandbox = sandbox;

    // Extract script code from index.html
    const scriptStart = htmlContent.indexOf('<script>') + '<script>'.length;
    const scriptEnd = htmlContent.lastIndexOf('</script>');
    let scriptCode = htmlContent.substring(scriptStart, scriptEnd);

    // Append state inspection bridge to sandbox
    const stateBridge = `
        Object.defineProperty(globalThis, '__state', {
            get: () => ({
                currentLang,
                studentData,
                currentMode,
                currentIndex,
                activeQuestions,
                answers,
                categoryCounts,
                answerLog,
                fontScale,
                STORAGE_KEY,
                i18n,
                categories,
                questionBank,
                tieredPlans,
                selectedValue,
                selectedCategory
            })
        });
        Object.defineProperty(globalThis, 'currentLang', {
            get: () => currentLang,
            set: (v) => { currentLang = v; }
        });
        Object.defineProperty(globalThis, 'currentIndex', {
            get: () => currentIndex,
            set: (v) => { currentIndex = v; }
        });
        Object.defineProperty(globalThis, 'studentData', {
            get: () => studentData,
            set: (v) => { studentData = v; }
        });
        Object.defineProperty(globalThis, 'currentMode', {
            get: () => currentMode,
            set: (v) => { currentMode = v; }
        });
        Object.defineProperty(globalThis, 'activeQuestions', {
            get: () => activeQuestions,
            set: (v) => { activeQuestions = v; }
        });
        Object.defineProperty(globalThis, 'answers', {
            get: () => answers,
            set: (v) => { answers = v; }
        });
        Object.defineProperty(globalThis, 'categoryCounts', {
            get: () => categoryCounts,
            set: (v) => { categoryCounts = v; }
        });
        Object.defineProperty(globalThis, 'answerLog', {
            get: () => answerLog,
            set: (v) => { answerLog = v; }
        });
        Object.defineProperty(globalThis, 'STORAGE_KEY', {
            get: () => STORAGE_KEY
        });
        Object.defineProperty(globalThis, 'i18n', {
            get: () => i18n
        });
        Object.defineProperty(globalThis, 'categories', {
            get: () => categories
        });
        Object.defineProperty(globalThis, 'questionBank', {
            get: () => questionBank
        });
        Object.defineProperty(globalThis, 'tieredPlans', {
            get: () => tieredPlans
        });
        Object.defineProperty(globalThis, 'fontScale', {
            get: () => fontScale,
            set: (v) => { fontScale = v; }
        });
        Object.defineProperty(globalThis, 'selectedValue', {
            get: () => selectedValue,
            set: (v) => { selectedValue = v; }
        });
        Object.defineProperty(globalThis, 'selectedCategory', {
            get: () => selectedCategory,
            set: (v) => { selectedCategory = v; }
        });
    `;

    vm.createContext(sandbox);
    vm.runInContext(scriptCode + stateBridge, sandbox);

    // Fire DOMContentLoaded event to trigger initial setup (auto-dismiss, session restore)
    const domContentLoadedHandlers = windowListeners['DOMContentLoaded'] || [];
    for (const handler of domContentLoadedHandlers) {
        try { handler({ type: 'DOMContentLoaded' }); } catch (e) { /* ignore */ }
    }

    return {
        sandbox,
        document,
        window: sandbox,
        localStorage,
        speechSynthesis,
        cssText,
        htmlContent,
        alertCalls,
        confirmCalls,
        blobUrls,
        get printCalls() { return printCalls; },
        get reloadCalls() { return reloadCalls; },
        fireWindowEvent: (type, data = {}) => {
            const handlers = windowListeners[type] || [];
            for (const handler of handlers) {
                handler({ type, ...data });
            }
        }
    };
}

module.exports = { createBrowserEnvironment, DOMElement, Canvas2DContextMock, SpeechSynthesisMock };
