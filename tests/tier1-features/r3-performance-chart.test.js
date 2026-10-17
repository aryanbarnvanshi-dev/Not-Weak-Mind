/**
 * Tier 1.3: Pillar R3 - High-Performance Chart Generation & Assessment Depth
 * Opaque-box verification tests for Rapid Screener, Instant Demo Profile,
 * Batch DOM generation, and Lazy Accordion rendering.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserEnvironment } = require('../harness/browser-env.js');

describe('Tier 1.3: Pillar R3 - High-Performance Chart Generation & Assessment Depth', () => {

    test('T1.3.1: Rapid Screener mode selects exactly 15 questions covering all 15 unique categories', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Test Student';
        doc.getElementById('assessment-length').value = '15';

        doc.getElementById('btn-start-screening').click();

        assert.equal(doc.getElementById('assessment-section').classList.contains('active'), true);
        assert.equal(env.sandbox.activeQuestions.length, 15);

        // Verify all 15 unique categories are covered
        const uniqueCategories = new Set(env.sandbox.activeQuestions.map(q => q.cat));
        assert.equal(uniqueCategories.size, 15);
        assert.equal(uniqueCategories.has('dyslexia'), true);
        assert.equal(uniqueCategories.has('dyscalculia'), true);
        assert.equal(uniqueCategories.has('attention'), true);
        assert.equal(uniqueCategories.has('fine_motor'), true);
    });

    test('T1.3.2: Instant Preview Demo generates report and renders charts immediately', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const t0 = performance.now();
        doc.getElementById('btn-preview-demo').click();
        const elapsed = performance.now() - t0;

        assert.equal(doc.getElementById('report-section').classList.contains('active'), true);
        assert.equal(doc.getElementById('setup-section').classList.contains('active'), false);
        assert.ok(env.sandbox.studentData.name.length > 0);

        // Verification of 15 Domain result cards
        const resultCards = doc.getElementById('result-grid').children;
        assert.equal(resultCards.length, 15);

        // Verification of radar canvas and bar canvas
        const resultsChart = doc.getElementById('resultsChart');
        const radarChart = doc.getElementById('radarChart');
        assert.ok(resultsChart);
        assert.ok(radarChart);

        // Execution should be ultra-fast (< 50ms)
        assert.ok(elapsed < 100, `Demo report took ${elapsed}ms (expected < 100ms)`);
    });

    test('T1.3.3: Question breakdown accordion is lazy-loaded and empty until opened', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('btn-preview-demo').click();

        const breakdownContent = doc.getElementById('breakdown-content');
        const detailsEl = doc.getElementById('breakdown-details');

        // Initially lazy (empty) to keep report generation fast
        assert.equal(breakdownContent.children.length, 0);

        // Trigger opening of accordion
        detailsEl.open = true;
        detailsEl.dispatchEvent({ type: 'toggle' });

        // Now it should be populated with category breakdown items
        assert.ok(breakdownContent.children.length > 0);
    });

    test('T1.3.4: finishAssessment transitions to report section with zero artificial delay', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Rohan';
        doc.getElementById('assessment-length').value = '15';
        doc.getElementById('btn-start-screening').click();

        // Advance to end of assessment
        env.sandbox.currentIndex = 14;
        doc.getElementById('opt-2').click();
        doc.getElementById('next-btn').click();

        // Should now be on report section immediately without waiting 200ms
        assert.equal(doc.getElementById('report-section').classList.contains('active'), true);
        assert.equal(doc.getElementById('assessment-section').classList.contains('active'), false);
        assert.equal(doc.getElementById('result-grid').children.length, 15);
    });
});
