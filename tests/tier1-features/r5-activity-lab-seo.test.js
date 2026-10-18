const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createBrowserEnvironment } = require('../harness/browser-env');

const REPO_ROOT = path.resolve(__dirname, '../..');

test('Tier 1.5: Pillar R5 - Cognitive Activity Lab, SEO Suite & Store Metadata', async (t) => {

    await t.test('T1.5.1: Schema.org EducationalApplication JSON-LD is valid and complete', () => {
        const html = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf-8');
        const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert.ok(ldJsonMatch, 'Schema.org JSON-LD script block must exist');

        const parsed = JSON.parse(ldJsonMatch[1]);
        assert.equal(parsed['@context'], 'https://schema.org');
        assert.equal(parsed['@type'], 'EducationalApplication');
        assert.ok(parsed.name.includes('EduScreen'));
        assert.equal(parsed.applicationCategory, 'EducationalApplication');
        assert.ok(Array.isArray(parsed.inLanguage));
        assert.ok(parsed.inLanguage.includes('en'));
        assert.ok(parsed.inLanguage.includes('hi'));
        assert.equal(parsed.offers?.price, '0');
        assert.ok(parsed.educationalUse.includes('Cognitive Screening'));
    });

    await t.test('T1.5.2: OpenGraph, Twitter Cards, and bilingual SEO keywords are present', () => {
        const html = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf-8');
        
        assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
        assert.ok(html.includes('<meta property="og:type" content="website">'));
        assert.ok(html.includes('EduScreen - Learning Screener & Cognitive Activity Lab'));
        
        // Bilingual keywords
        assert.ok(html.includes('dyslexia test in hindi'));
        assert.ok(html.includes('adhd screening tool'));
        assert.ok(html.includes('bacho ki padhai me problem'));
        assert.ok(html.includes('learning disability test india'));

        // Sitemap check
        const sitemap = fs.readFileSync(path.join(REPO_ROOT, 'sitemap.xml'), 'utf-8');
        assert.ok(sitemap.includes('<loc>https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/</loc>'));
        assert.ok(sitemap.includes('<lastmod>2026-10-18</lastmod>'));
    });

    await t.test('T1.5.3: F-Droid Fastlane bilingual metadata suite is intact and compliant', () => {
        const fastlaneDir = path.join(REPO_ROOT, 'fastlane/metadata/android');
        const files = [
            'en-US/title.txt',
            'en-US/short_description.txt',
            'en-US/full_description.txt',
            'hi-IN/title.txt',
            'hi-IN/short_description.txt',
            'hi-IN/full_description.txt'
        ];

        for (const file of files) {
            const filePath = path.join(fastlaneDir, file);
            assert.ok(fs.existsSync(filePath), `Fastlane file missing: ${file}`);
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            assert.ok(content.length > 0, `Fastlane file cannot be empty: ${file}`);

            // F-Droid strictly enforces short_description <= 80 characters
            if (file.endsWith('short_description.txt')) {
                assert.ok(content.length <= 80, `Short description exceeds 80 characters (${content.length} chars): ${file}`);
            }
        }
    });

    await t.test('T1.5.4: Activity Lab modal opens, toggles tabs, and closes cleanly', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        const labBtn = doc.getElementById('lab-toggle-btn');
        assert.ok(labBtn, '#lab-toggle-btn must exist in toolbar');

        // Open modal
        labBtn.click();
        const modal = doc.getElementById('activity-lab-modal');
        assert.ok(modal.classList.contains('active'), 'Modal must have .active class');

        // Test tab switching
        const tabFocus = doc.getElementById('tab-btn-focus');
        const paneFocus = doc.getElementById('lab-pane-focus');
        const tabLetter = doc.getElementById('tab-btn-letter');
        const paneLetter = doc.getElementById('lab-pane-letter');

        tabFocus.click();
        assert.ok(tabFocus.classList.contains('active'), 'Focus tab button must be active');
        assert.ok(paneFocus.classList.contains('active'), 'Focus pane must be active');
        assert.ok(!tabLetter.classList.contains('active'), 'Letter tab button must not be active');
        assert.ok(!paneLetter.classList.contains('active'), 'Letter pane must not be active');

        // Switch to memory tab
        const tabMem = doc.getElementById('tab-btn-memory');
        const paneMem = doc.getElementById('lab-pane-memory');
        tabMem.click();
        assert.ok(tabMem.classList.contains('active'));
        assert.ok(paneMem.classList.contains('active'));

        // Close modal
        doc.getElementById('modal-lab-close-btn').click();
        assert.ok(!modal.classList.contains('active'), 'Modal must be closed after clicking close button');
    });

    await t.test('T1.5.5: Letter Mirror Detective game runs and records hits/misses', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.openActivityLabModal('letter');
        env.sandbox.startLetterMirrorGame();

        const grid = doc.getElementById('letter-grid');
        assert.ok(grid.children.length === 16, 'Letter grid must have 16 tiles');

        const targetLetter = doc.getElementById('letter-target-display').innerText.trim();
        assert.ok(['b', 'd', 'p', 'q'].includes(targetLetter), 'Target letter must be one of b, d, p, q');

        // Find a tile matching the target and a foil tile
        const targetTile = Array.from(grid.children).find(t => t.innerText.trim() === targetLetter);
        const foilTile = Array.from(grid.children).find(t => t.innerText.trim() !== targetLetter);

        assert.ok(targetTile, 'Must have at least one target tile');
        assert.ok(foilTile, 'Must have at least one foil tile');

        // Click target tile -> should register hit
        targetTile.click();
        assert.ok(targetTile.classList.contains('correct'), 'Target tile must get .correct class');
        assert.equal(doc.getElementById('letter-stat-hits').innerText, '1');

        // Click foil tile -> should register miss
        foilTile.click();
        assert.ok(foilTile.classList.contains('incorrect'), 'Foil tile must get .incorrect class');
        assert.equal(doc.getElementById('letter-stat-misses').innerText, '1');

        // End game and verify summary
        env.sandbox.endLetterMirrorGame();
        const summary = doc.getElementById('letter-summary');
        assert.equal(summary.style.display, 'block');
        assert.ok(summary.innerText.includes('Hits: 1'));
        assert.ok(summary.innerText.includes('Misses: 1'));
    });

    await t.test('T1.5.6: Go / No-Go Sustained Focus game detects hits and false alarms with latency', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.openActivityLabModal('focus');
        env.sandbox.startGoNoGoGame();

        const box = doc.getElementById('focus-stimulus-box');
        assert.ok(box, 'Focus stimulus box must exist');

        // Test Go hit: simulate go trial
        env.sandbox.focusTrialActive = true;
        env.sandbox.focusCurrentStimulus = 'go';
        env.sandbox.focusStimulusStartTime = Date.now() - 250;

        env.sandbox.handleFocusStimulusClick();
        assert.equal(doc.getElementById('focus-stat-hits').innerText, '1', 'Hits should be 1');
        assert.ok(doc.getElementById('focus-stat-latency').innerText.includes('ms'), 'Latency should be calculated');

        // Test False Alarm: simulate nogo trial
        env.sandbox.focusTrialActive = true;
        env.sandbox.focusCurrentStimulus = 'nogo';

        env.sandbox.handleFocusStimulusClick();
        assert.equal(doc.getElementById('focus-stat-fa').innerText, '1', 'False alarms should be 1');

        // End game and verify summary
        env.sandbox.endGoNoGoGame();
        const summary = doc.getElementById('focus-summary');
        assert.equal(summary.style.display, 'block');
        assert.ok(summary.innerText.includes('Hits: 1'));
        assert.ok(summary.innerText.includes('False Alarms: 1'));
    });

    await t.test('T1.5.7: Memory Echo Sequence handles audio-visual sequence progression', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        env.sandbox.openActivityLabModal('memory');
        env.sandbox.startMemoryEchoGame();

        assert.equal(doc.getElementById('memory-stat-round').innerText, '1');
        assert.equal(doc.getElementById('memory-stat-span').innerText, '0');

        // Simulate successful player response sequence
        env.sandbox.memoryPlayerTurn = true;
        env.sandbox.memorySequence = [0, 2];
        env.sandbox.memoryPlayerStep = 0;

        // Click correct pad 0
        env.sandbox.handleMemoryPadClick(0);
        assert.equal(env.sandbox.memoryPlayerStep, 1);

        // Click correct pad 2
        env.sandbox.handleMemoryPadClick(2);
        assert.equal(doc.getElementById('memory-stat-span').innerText, '2', 'Max span should be recorded as 2');

        // End game and check summary
        env.sandbox.endMemoryEchoGame();
        const summary = doc.getElementById('memory-summary');
        assert.equal(summary.style.display, 'block');
        assert.ok(summary.innerText.includes('Max Span: 2'));
    });

    await t.test('T1.5.8: Clinical Report generates Targeted Cognitive Drill recommendations', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Run instant demo which flags dyslexia and dysgraphia
        doc.getElementById('btn-preview-demo').click();

        const card = doc.getElementById('targeted-drills-card');
        assert.ok(card, '#targeted-drills-card must exist in report');

        const drillsList = doc.getElementById('targeted-drills-list');
        assert.ok(drillsList.children.length >= 3, 'Must render targeted drill buttons');

        // Letter Mirror drill should be highlighted because sample demo has 73% dyslexia risk
        const letterDrillBadge = Array.from(drillsList.children).find(b => b.innerText.includes('Letter Mirror') || b.innerText.includes('लेटर'));
        assert.ok(letterDrillBadge, 'Letter Mirror drill button must exist in recommendations');
        assert.ok(letterDrillBadge.classList.contains('highlight'), 'Letter Mirror should be highlighted for dyslexia');

        // Clicking the badge must open Activity Lab modal directly to letter tab
        letterDrillBadge.click();
        const modal = doc.getElementById('activity-lab-modal');
        assert.ok(modal.classList.contains('active'), 'Modal must open on clicking drill badge');
        assert.ok(doc.getElementById('lab-pane-letter').classList.contains('active'), 'Letter pane must be active');
    });

    await t.test('T1.5.9: Bilingual language toggle localizes Activity Lab and drill titles', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        // Switch to Hindi
        doc.getElementById('lang-toggle-btn').click();

        assert.equal(doc.getElementById('lab-label').innerText, 'एक्टिविटी लैब');
        assert.ok(doc.getElementById('modal-lab-title').innerText.includes('कॉग्निटिव एक्टिविटी लैब'));
        assert.ok(doc.getElementById('tab-btn-letter').innerText.includes('लेटर मिरर'));
        assert.ok(doc.getElementById('tab-btn-focus').innerText.includes('गो / नो-गो'));
        assert.ok(doc.getElementById('tab-btn-memory').innerText.includes('मेमोरी'));

        // Generate report in Hindi
        doc.getElementById('btn-preview-demo').click();
        assert.ok(doc.getElementById('txt-drills-title').innerText.includes('लक्षित कॉग्निटिव ड्रिल्स'));

        // Switch back to English
        doc.getElementById('lang-toggle-btn').click();
        assert.equal(doc.getElementById('lab-label').innerText, 'Activity Lab');
        assert.ok(doc.getElementById('tab-btn-letter').innerText.includes('Letter Mirror'));
    });
});
