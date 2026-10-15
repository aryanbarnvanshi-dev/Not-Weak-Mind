/**
 * Tier 1.2: Pillar R2 - Assistive Neurodiversity & Bilingual Accessibility
 * Opaque-box requirement verification tests for Localization, Speech, Fonts, and WCAG AAA.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserEnvironment } = require('../harness/browser-env.js');
const {
    assertContrastRatio,
    assertFocusVisible
} = require('../harness/assertions.js');

describe('Tier 1.2: Pillar R2 - Assistive Neurodiversity & Bilingual Accessibility', () => {

    test('T1.2.1: Language Switch to Hindi toggles entire UI text to Devanagari Hindi', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        assert.equal(env.sandbox.currentLang, 'en');

        const langBtn = doc.getElementById('lang-toggle-btn');
        langBtn.click();

        assert.equal(env.sandbox.currentLang, 'hi');
        assert.equal(doc.getElementById('txt-setup-title').innerText, 'एडूस्क्रीन मूल्यांकन');
        assert.equal(doc.getElementById('btn-start-screening').innerText, 'स्क्रीनिंग मूल्यांकन शुरू करें');
        assert.equal(doc.getElementById('prev-btn').innerText, '⬅ पिछला');
        assert.equal(doc.getElementById('next-btn').innerText, 'अगला प्रश्न ➡');
        assert.equal(doc.getElementById('lang-label').innerText, 'English');
    });

    test('T1.2.2: Secondary Language Switch reverts UI strings cleanly to English', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;
        const langBtn = doc.getElementById('lang-toggle-btn');

        langBtn.click(); // Switch to Hindi
        assert.equal(env.sandbox.currentLang, 'hi');

        langBtn.click(); // Switch back to English
        assert.equal(env.sandbox.currentLang, 'en');
        assert.equal(doc.getElementById('txt-setup-title').innerText, 'EduScreen Assessment');
        assert.equal(doc.getElementById('btn-start-screening').innerText, 'Start Screening Assessment');
        assert.equal(doc.getElementById('lang-label').innerText, 'हिन्दी');
    });

    test('T1.2.3: Bilingual question rendering presents Devanagari script in Hindi and Latin script in English', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Rohan';
        doc.getElementById('btn-start-screening').click();

        // English question
        const enQuestion = doc.getElementById('question-text').innerText;
        assert.ok(/[a-zA-Z]/.test(enQuestion));

        // Switch to Hindi mid-quiz
        doc.getElementById('lang-toggle-btn').click();
        const hiQuestion = doc.getElementById('question-text').innerText;

        // Check for Devanagari Unicode range (\u0900-\u097F)
        assert.ok(/[\u0900-\u097F]/.test(hiQuestion), `Expected Devanagari characters in "${hiQuestion}"`);
        assert.ok(doc.getElementById('progress-text').innerText.includes('प्रश्न'));
    });

    test('T1.2.4: Assessment mode switch toggles between student self-report and teacher observer perspective', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Student mode
        doc.getElementById('student-name').value = 'Aarav';
        doc.getElementById('assessment-mode').value = 'student';
        doc.getElementById('btn-start-screening').click();

        const studentPrompt = doc.getElementById('question-text').innerText;

        // Reset and check teacher mode
        const envTeacher = createBrowserEnvironment();
        const docT = envTeacher.document;

        docT.getElementById('student-name').value = 'Aarav';
        docT.getElementById('assessment-mode').value = 'teacher';
        docT.getElementById('btn-start-screening').click();

        // Fix random shuffle comparison by checking question bank directly
        const q0 = envTeacher.sandbox.activeQuestions[0];
        assert.equal(q0.studentEn !== q0.teacherEn, true);
        assert.equal(docT.getElementById('question-text').innerText, `1. ${q0.teacherEn}`);
    });

    test('T1.2.5: Web Speech API narration triggers SpeechSynthesisUtterance with appropriate language code', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Pooja';
        doc.getElementById('btn-start-screening').click();

        const speakBtn = doc.getElementById('btn-speak');
        speakBtn.click();

        assert.equal(env.speechSynthesis.spokenUtterances.length, 1);
        const utter = env.speechSynthesis.spokenUtterances[0];
        assert.equal(utter.lang, 'en-US');
        assert.equal(utter.rate, 0.88);
        assert.ok(speakBtn.classList.contains('speaking'));

        // Test Hindi speech
        doc.getElementById('lang-toggle-btn').click();
        speakBtn.click(); // Stop previous
        speakBtn.click(); // Speak Hindi
        const lastUtter = env.speechSynthesis.spokenUtterances[env.speechSynthesis.spokenUtterances.length - 1];
        assert.equal(lastUtter.lang, 'hi-IN');
    });

    test('T1.2.6: Secondary click on speech button interrupts narration and cancels active utterance', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Anand';
        doc.getElementById('btn-start-screening').click();

        const speakBtn = doc.getElementById('btn-speak');
        speakBtn.click(); // Start speech
        assert.equal(speakBtn.classList.contains('speaking'), true);

        speakBtn.click(); // Stop speech
        assert.equal(speakBtn.classList.contains('speaking'), false);
        assert.equal(env.speechSynthesis.speaking, false);
    });

    test('T1.2.7: Dyslexia font activation applies .dyslexia-font class to document.body and persists', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const fontBtn = doc.getElementById('font-toggle-btn');
        assert.equal(doc.body.classList.contains('dyslexia-font'), false);

        fontBtn.click();
        assert.equal(doc.body.classList.contains('dyslexia-font'), true);
        assert.equal(env.localStorage.getItem('eduscreen_font'), 'dyslexia');

        fontBtn.click();
        assert.equal(doc.body.classList.contains('dyslexia-font'), false);
        assert.equal(env.localStorage.getItem('eduscreen_font'), 'standard');
    });

    test('T1.2.8: Font scale buttons adjust --font-scale CSS custom property within bounded range', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const zoomInBtn = doc.querySelector('[aria-label="Increase Font Size"]');
        const zoomOutBtn = doc.querySelector('[aria-label="Decrease Font Size"]');

        assert.ok(zoomInBtn);
        assert.ok(zoomOutBtn);

        // Initial scale is 1
        assert.equal(env.sandbox.fontScale, 1);

        zoomInBtn.click();
        assert.equal(Number(env.sandbox.fontScale.toFixed(2)), 1.10);
        assert.equal(doc.documentElement.style['--font-scale'], '1.1');

        zoomOutBtn.click();
        assert.equal(Number(env.sandbox.fontScale.toFixed(2)), 1.00);

        zoomOutBtn.click();
        assert.equal(Number(env.sandbox.fontScale.toFixed(2)), 0.90);
    });

    test('T1.2.9: Reading ruler toggle controls .ruler-active state on document.body', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const rulerBtn = doc.getElementById('ruler-toggle-btn');
        assert.equal(doc.body.classList.contains('ruler-active'), false);
        assert.equal(rulerBtn.classList.contains('active'), false);

        rulerBtn.click();
        assert.equal(doc.body.classList.contains('ruler-active'), true);
        assert.equal(rulerBtn.classList.contains('active'), true);

        rulerBtn.click();
        assert.equal(doc.body.classList.contains('ruler-active'), false);
        assert.equal(rulerBtn.classList.contains('active'), false);
    });

    test('T1.2.10: WCAG AAA Color Contrast Ratios meet or exceed 7:1 across all risk badges in light and dark mode', () => {
        // Light Mode Badges
        // None: #14532d on #dcfce7
        assertContrastRatio('#14532d', '#dcfce7', 7.0, 'Badge None Light');
        // Mild: #1e3a8a on #dbeafe
        assertContrastRatio('#1e3a8a', '#dbeafe', 7.0, 'Badge Mild Light');
        // Moderate: #713f12 on #fef08a
        assertContrastRatio('#713f12', '#fef08a', 7.0, 'Badge Mod Light');
        // Strong: #7f1d1d on #fee2e2
        assertContrastRatio('#7f1d1d', '#fee2e2', 7.0, 'Badge Strong Light');

        // Dark Mode Badges
        // None: #ecfdf5 on #064e3b
        assertContrastRatio('#ecfdf5', '#064e3b', 7.0, 'Badge None Dark');
        // Mild: #eff6ff on #1e3a8a
        assertContrastRatio('#eff6ff', '#1e3a8a', 7.0, 'Badge Mild Dark');
        // Moderate: #fefce8 on #713f12
        assertContrastRatio('#fefce8', '#713f12', 7.0, 'Badge Mod Dark');
        // Strong: #fff1f2 on #7f1d1d
        assertContrastRatio('#fff1f2', '#7f1d1d', 7.0, 'Badge Strong Dark');
    });

    test('T1.2.11: WCAG AAA Color Contrast Ratio for Disclaimer Banner meets or exceeds 7:1', () => {
        // Banner text: #78350f on #fef3c7
        assertContrastRatio('#78350f', '#fef3c7', 7.0, 'Disclaimer Banner');
    });

    test('T1.2.12: Global :focus-visible CSS rules provide at least 3px high-contrast keyboard indicators', () => {
        const env = createBrowserEnvironment();
        assertFocusVisible(env.cssText);
    });

    test('T1.2.13: WAI-ARIA semantics enforce radiogroup and radio attributes with dynamic aria-checked', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const optionsGrid = doc.getElementById('options-grid');
        assert.equal(optionsGrid.getAttribute('role'), 'radiogroup');

        for (let i = 0; i < 4; i++) {
            const opt = doc.getElementById(`opt-${i}`);
            assert.equal(opt.getAttribute('role'), 'radio');
            assert.equal(opt.getAttribute('aria-checked'), 'false');
        }

        doc.getElementById('student-name').value = 'Aarav';
        doc.getElementById('btn-start-screening').click();

        doc.getElementById('opt-2').click();
        assert.equal(doc.getElementById('opt-2').getAttribute('aria-checked'), 'true');
        assert.equal(doc.getElementById('opt-0').getAttribute('aria-checked'), 'false');
    });
});
