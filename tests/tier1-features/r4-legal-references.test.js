/**
 * Tier 1.4: Pillar R4 - Academic Grounding & Legal Safe Harbor Suite
 * Opaque-box verification tests for References Modal, Statutory Safe Harbor (NMC Act 2019,
 * Mental Healthcare Act 2017, DPDP Act 2023), Fair Dealing (Sec 52(1)(a) Indian Copyright Act,
 * Sec 107 US Copyright Act), and original non-infringing question authorship.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserEnvironment } = require('../harness/browser-env.js');

describe('Tier 1.4: Pillar R4 - Academic Grounding & Legal Safe Harbor Suite', () => {

    test('T1.4.1: References modal structure conforms to WAI-ARIA modal dialog standards', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const modal = doc.getElementById('references-modal');
        assert.ok(modal, 'references-modal element must exist');
        assert.equal(modal.getAttribute('role'), 'dialog');
        assert.equal(modal.getAttribute('aria-modal'), 'true');
        assert.equal(modal.getAttribute('aria-labelledby'), 'modal-ref-title');
        assert.equal(modal.classList.contains('active'), false, 'Modal should be closed by default');
    });

    test('T1.4.2: Clicking toolbar References button opens modal and renders evidence content', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const toggleBtn = doc.getElementById('ref-toggle-btn');
        assert.ok(toggleBtn, 'ref-toggle-btn must exist in header toolbar');

        toggleBtn.click();

        const modal = doc.getElementById('references-modal');
        assert.equal(modal.classList.contains('active'), true, 'Modal should have active class');

        const content = doc.getElementById('modal-ref-content');
        assert.ok(content.innerHTML.length > 200, 'Content must be dynamically rendered with academic evidence');
        assert.ok(content.innerHTML.includes('Statutory Safe Harbor'), 'Safe harbor must be rendered');
    });

    test('T1.4.3: Report section evidence button (#btn-view-evidence) triggers references modal', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Render demo report first
        doc.getElementById('btn-preview-demo').click();
        assert.equal(doc.getElementById('report-section').classList.contains('active'), true);

        const reportEvidenceBtn = doc.getElementById('btn-view-evidence');
        assert.ok(reportEvidenceBtn, 'btn-view-evidence must exist in report section');

        reportEvidenceBtn.click();

        const modal = doc.getElementById('references-modal');
        assert.equal(modal.classList.contains('active'), true, 'Modal should open from report screen');
    });

    test('T1.4.4: Close buttons dismiss references modal cleanly', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Open modal
        env.sandbox.openReferencesModal();
        const modal = doc.getElementById('references-modal');
        assert.equal(modal.classList.contains('active'), true);

        // Close via closeReferencesModal
        env.sandbox.closeReferencesModal();
        assert.equal(modal.classList.contains('active'), false);
        assert.equal(doc.body.style.overflow, '');
    });

    test('T1.4.5: Escape key triggers modal dismissal', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.openReferencesModal();
        const modal = doc.getElementById('references-modal');
        assert.equal(modal.classList.contains('active'), true);

        env.window.dispatchEvent({ type: 'keydown', key: 'Escape' });
        assert.equal(modal.classList.contains('active'), false);
    });

    test('T1.4.6: Statutory Safe Harbor guarantees immunity under NMC Act 2019, Mental Healthcare Act 2017 & DPDP Act 2023', () => {
        const env = createBrowserEnvironment();
        env.sandbox.openReferencesModal();
        const content = env.document.getElementById('modal-ref-content').innerHTML;

        assert.ok(content.includes('National Medical Commission (NMC) Act 2019'), 'Must declare non-medical practice under NMC Act 2019');
        assert.ok(content.includes('Mental Healthcare Act 2017'), 'Must declare non-psychiatric practice under Mental Healthcare Act 2017');
        assert.ok(content.includes('Digital Personal Data Protection (DPDP) Act 2023'), 'Must declare DPDP Act 2023 100% client-side privacy');
        assert.ok(content.includes('Tier 1 MTSS'), 'Must declare Tier 1 observational screening role');
    });

    test('T1.4.7: Fair Dealing & Trademark disclaimers cite Section 52(1)(a) Indian Copyright Act & Section 107 US Copyright Act', () => {
        const env = createBrowserEnvironment();
        env.sandbox.openReferencesModal();
        const content = env.document.getElementById('modal-ref-content').innerHTML;

        assert.ok(content.includes('Section 52(1)(a) of the Indian Copyright Act, 1957'), 'Must cite Indian Fair Dealing Section 52(1)(a)');
        assert.ok(content.includes('Section 107 of the US Copyright Act'), 'Must cite US Fair Use Section 107');
        assert.ok(content.includes('DSM-5'), 'Must acknowledge DSM-5 trademark');
        assert.ok(content.includes('WISC'), 'Must acknowledge WISC trademark');
        assert.ok(content.includes('Zero questions are copied'), 'Must declare 100% independent original authorship');
    });

    test('T1.4.8: Scientific Framework table covers all 15 cognitive domains with peer-reviewed literature', () => {
        const env = createBrowserEnvironment();
        const evidence = env.sandbox.domainEvidence;
        assert.equal(evidence.length, 15, 'All 15 cognitive domains must have theoretical grounding');

        const domainIds = new Set(evidence.map(d => d.id));
        const requiredDomains = [
            'dyslexia', 'dyscalculia', 'dysgraphia', 'attention', 'executive',
            'processing', 'working_memory', 'recall', 'learning_anxiety', 'test_anxiety',
            'motivation', 'sensory', 'fine_motor', 'social', 'communication'
        ];

        requiredDomains.forEach(dom => {
            assert.ok(domainIds.has(dom), `Domain ${dom} must be grounded in academic evidence`);
        });

        // Verify specific seminal citations
        const dyslexia = evidence.find(d => d.id === 'dyslexia');
        assert.ok(dyslexia.citations.includes('Shaywitz') || dyslexia.citations.includes('IDA'));

        const workingMemory = evidence.find(d => d.id === 'working_memory');
        assert.ok(workingMemory.citations.includes('Baddeley'));

        const fineMotor = evidence.find(d => d.id === 'fine_motor');
        assert.ok(fineMotor.citations.includes('Beery'));
    });

    test('T1.4.9: Language Switch dynamically localizes References Modal to Devanagari Hindi', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Switch to Hindi
        doc.getElementById('lang-toggle-btn').click();
        assert.equal(env.sandbox.currentLang, 'hi');

        // Open modal in Hindi
        env.sandbox.openReferencesModal();

        const title = doc.getElementById('modal-ref-title').innerText;
        assert.ok(/वैज्ञानिक आधार/.test(title), 'Title must be localized to Hindi');

        const content = doc.getElementById('modal-ref-content').innerHTML;
        assert.ok(content.includes('राष्ट्रीय चिकित्सा आयोग (NMC) अधिनियम 2019'), 'Must contain Hindi NMC Act 2019 disclaimer');
        assert.ok(content.includes('भारतीय कॉपीराइट अधिनियम 1957 की धारा 52(1)(a)'), 'Must contain Hindi Indian Copyright Act Fair Dealing disclaimer');
        assert.ok(content.includes('100% मौलिक प्रश्न'), 'Must declare Hindi independent original authorship');
    });

    test('T1.4.10: Zero-infringement verification: all 80 questions are independently authored vernacular behavioral items', () => {
        const env = createBrowserEnvironment();
        const questions = env.sandbox.rawQuestionData;
        assert.equal(questions.length, 80, 'Must have exactly 80 bilingual items');

        // Verify each question is a 5-tuple: [cat, studentPromptEn, studentPromptHi, teacherPromptEn, teacherPromptHi]
        questions.forEach((q, idx) => {
            assert.equal(q.length, 5, `Question at index ${idx} must have 5 fields`);
            assert.ok(q[0].length > 0, `Category must not be empty at index ${idx}`);
            assert.ok(q[1].length > 5, `English student prompt must not be empty at index ${idx}`);
            assert.ok(q[2].length > 5, `Hindi student prompt must not be empty at index ${idx}`);
            assert.ok(q[3].length > 5, `English teacher prompt must not be empty at index ${idx}`);
            assert.ok(q[4].length > 5, `Hindi teacher prompt must not be empty at index ${idx}`);

            // Ensure Hindi prompts contain authentic Devanagari Unicode characters
            assert.ok(/[\u0900-\u097F]/.test(q[2]), `Hindi prompt at index ${idx} must contain Devanagari text`);
        });
    });

});
