const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createBrowserEnvironment } = require('../harness/browser-env');

const REPO_ROOT = path.resolve(__dirname, '../..');

test('Tier 1.6: Pillar R6 - Pure Game-Based Cognitive Assessment & Telemetry Synthesis', async (t) => {

    await t.test('T1.6.1: Rapid Number Dash (Game 4) generates valid dot SVG and records ANS telemetry', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Test SVG dot generation helper
        const svg10 = env.sandbox.generateDotSvg(10, 160, 120);
        assert.ok(svg10.includes('<svg'), 'Must produce an svg root tag');
        assert.ok(svg10.includes('viewBox="0 0 160 120"'), 'SVG must have correct viewBox');
        const circleMatches = svg10.match(/<circle /g);
        assert.equal(circleMatches?.length, 10, 'Must contain exactly 10 circle elements');

        // Open Activity lab modal to number dash
        env.sandbox.openActivityLabModal('number');
        const numPane = doc.getElementById('lab-pane-number');
        assert.ok(numPane.classList.contains('active'), 'Number dash pane must be active');

        // Start Rapid Number Drill
        env.sandbox.startRapidNumberGame();
        const leftCard = doc.getElementById('number-card-left');
        const rightCard = doc.getElementById('number-card-right');
        assert.ok(leftCard.innerHTML.includes('<svg'), 'Left card must have dot SVG stimulus');
        assert.ok(rightCard.innerHTML.includes('<svg'), 'Right card must have dot SVG stimulus');

        // Click cards to register trials
        env.sandbox.handleNumberCardClick('left');
        env.sandbox.handleNumberCardClick('right');

        // End drill
        env.sandbox.endRapidNumberGame();
        const summary = doc.getElementById('number-summary');
        assert.equal(summary.style.display, 'block');

        // Telemetry must be captured in gameTelemetry
        const tel = env.sandbox.gameTelemetry.number;
        assert.ok(typeof tel.hits === 'number', 'Hits must be a number');
        assert.ok(typeof tel.errors === 'number', 'Errors must be a number');
        assert.ok((tel.hits + tel.errors) >= 2, 'Total trials must be at least 2');
    });

    await t.test('T1.6.2: Cognitive Circuit initialization displays arena and hides survey questionnaire', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const nameInput = doc.getElementById('student-name');
        nameInput.value = 'Rohan Verma';

        const btnStartCircuit = doc.getElementById('btn-start-circuit');
        assert.ok(btnStartCircuit, 'Hero card start circuit button must exist');

        // Start cognitive circuit
        env.sandbox.startCognitiveCircuit(0);

        const arena = doc.getElementById('circuit-arena');
        const qContainer = doc.getElementById('questionnaire-container');
        const assessmentSection = doc.getElementById('assessment-section');

        assert.equal(assessmentSection.classList.contains('active'), true, 'Assessment section must be active');
        assert.equal(arena.style.display, 'block', 'Circuit arena must be visible');
        assert.equal(qContainer.style.display, 'none', 'Survey questionnaire must be hidden in pure game mode');
        assert.equal(env.sandbox.isCircuitActive, true, 'isCircuitActive flag must be true');
        assert.equal(env.sandbox.activeCircuitStage, 0, 'Initial active circuit stage must be 0 (Letter Mirror)');

        env.sandbox.stopAllLabGames();
    });

    await t.test('T1.6.3: Cognitive Circuit stage progression advances through all 4 cognitive games', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.startCognitiveCircuit(0);
        assert.equal(env.sandbox.activeCircuitStage, 0);

        // Stage 0 -> Stage 1
        env.sandbox.advanceCircuitStage();
        assert.equal(env.sandbox.activeCircuitStage, 1, 'Stage must advance to 1 (Go/No-Go Focus)');

        // Stage 1 -> Stage 2
        env.sandbox.advanceCircuitStage();
        assert.equal(env.sandbox.activeCircuitStage, 2, 'Stage must advance to 2 (Memory Echo)');

        // Stage 2 -> Stage 3
        env.sandbox.advanceCircuitStage();
        assert.equal(env.sandbox.activeCircuitStage, 3, 'Stage must advance to 3 (Rapid Number Dash)');

        // Final transition terminates circuit and enters report section
        env.sandbox.advanceCircuitStage();
        const reportSection = doc.getElementById('report-section');
        assert.equal(reportSection.classList.contains('active'), true, 'Completing stage 4 must switch to report section');

        env.sandbox.stopAllLabGames();
    });

    await t.test('T1.6.4: Telemetry Synthesis Algorithm derives 5 Cognitive Pillars within [15, 100]', () => {
        const env = createBrowserEnvironment();

        // Feed mock game telemetry
        env.sandbox.gameTelemetry = {
            letter: { hits: 14, misses: 2, inversions: 2, avgLatency: 350 },
            focus: { hits: 18, falseAlarms: 2, avgLatency: 380, latencies: [380] },
            memory: { maxSpan: 6, rounds: 5, errors: 1 },
            number: { hits: 16, errors: 2, avgLatency: 410, latencies: [410] }
        };

        env.sandbox.calculateCognitiveScores();
        const scores = env.sandbox.cognitiveScores;

        assert.ok(scores.attention >= 15 && scores.attention <= 100, `Attention score out of range: ${scores.attention}`);
        assert.ok(scores.visual_spatial >= 15 && scores.visual_spatial <= 100, `Visual-Spatial score out of range: ${scores.visual_spatial}`);
        assert.ok(scores.working_memory >= 15 && scores.working_memory <= 100, `Working Memory score out of range: ${scores.working_memory}`);
        assert.ok(scores.numerical >= 15 && scores.numerical <= 100, `Numerical score out of range: ${scores.numerical}`);
        assert.ok(scores.processing_speed >= 15 && scores.processing_speed <= 100, `Processing Speed score out of range: ${scores.processing_speed}`);

        // Verify high attention given low false alarms
        assert.ok(scores.attention >= 80, 'Low false alarm rate must yield high attention percentile');
        // Verify working memory scaled from span 6/7
        assert.ok(scores.working_memory >= 80, 'Memory span of 6 must yield high working memory score');
    });

    await t.test('T1.6.5: Clinical Report renders Objective Telemetry Table with 4 game rows', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.gameTelemetry = {
            letter: { hits: 12, misses: 1, inversions: 1, avgLatency: 360 },
            focus: { hits: 15, falseAlarms: 1, avgLatency: 320, latencies: [320] },
            memory: { maxSpan: 5, rounds: 4, errors: 0 },
            number: { hits: 14, errors: 1, avgLatency: 390, latencies: [390] }
        };

        env.sandbox.populateTelemetryTable();
        const tbody = doc.getElementById('telemetry-table-body');
        assert.ok(tbody, '#telemetry-table-body must exist in DOM');
        assert.ok(tbody.innerHTML.includes('Letter Mirror Detective'), 'Must include Letter Mirror row');
        assert.ok(tbody.innerHTML.includes('Go / No-Go Sustained Focus'), 'Must include Focus row');
        assert.ok(tbody.innerHTML.includes('Memory Echo Sequence'), 'Must include Memory row');
        assert.ok(tbody.innerHTML.includes('Rapid Number Dash'), 'Must include Number Dash row');
        assert.ok(tbody.innerHTML.includes('12 hits'), 'Must render hits');
        assert.ok(tbody.innerHTML.includes('320 ms'), 'Must render latency');
    });

    await t.test('T1.6.6: CBSE Accommodations generator dynamically maps cognitive flags', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Flag dyscalculia and visual-spatial
        env.sandbox.populateCBSEAccommodations([{ cat: 'dyscalculia' }, { cat: 'visual_spatial' }]);

        const container = doc.getElementById('accommodations-container');
        assert.ok(container, '#accommodations-container must exist');
        assert.ok(container.innerHTML.includes('CBSE Rule 24.1 (Mathematics Exemption'), 'Must recommend math exemption');
        assert.ok(container.innerHTML.includes('CBSE Compensatory Extra Time (20 Minutes Per Hour)'), 'Must recommend extra time');
        assert.ok(container.innerHTML.includes('Recommended for this Profile'), 'Must flag recommended accommodations');
    });

    await t.test('T1.6.7: Bilingual toggle localizes Game Circuit UI and accommodations into Hindi', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Switch language to Hindi
        env.sandbox.toggleLanguage();

        const heroTitle = doc.getElementById('txt-circuit-title');
        const btnCircuit = doc.getElementById('btn-start-circuit');
        const tabNumber = doc.getElementById('tab-btn-number');

        assert.ok(heroTitle.innerText.includes('संज्ञानात्मक खेल सर्किट'), 'Hero title must be localized in Hindi');
        assert.ok(btnCircuit.innerText.includes('संज्ञानात्मक खेल'), 'Hero button must be localized in Hindi');
        assert.ok(tabNumber.innerText.includes('संख्या डैश'), 'Game 4 tab must be localized in Hindi');

        // Populate CBSE Accommodations in Hindi
        env.sandbox.populateCBSEAccommodations([{ cat: 'dyscalculia' }]);
        const container = doc.getElementById('accommodations-container');
        assert.ok(container.innerHTML.includes('सीबीएसई नियम 24.1'), 'CBSE accommodations must render in Devanagari Hindi');
        assert.ok(container.innerHTML.includes('बेसिक गणित विकल्प'), 'Basic math option description must be in Hindi');
    });

});
