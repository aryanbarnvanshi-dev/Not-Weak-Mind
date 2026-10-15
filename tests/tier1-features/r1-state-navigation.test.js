/**
 * Tier 1.1: Pillar R1 - Resilient State & Bi-Directional Assessment Engine
 * Opaque-box requirement verification tests for Session Persistence & Navigation.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowserEnvironment } = require('../harness/browser-env.js');
const { assertStorageSnapshot } = require('../harness/assertions.js');

describe('Tier 1.1: Pillar R1 - Resilient State & Bi-Directional Navigation', () => {

    test('T1.1.1: Initial Setup transitions from setup to assessment section', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Aarav';
        doc.getElementById('student-age').value = '10';
        doc.getElementById('assessment-mode').value = 'student';

        doc.getElementById('btn-start-screening').click();

        assert.equal(doc.getElementById('assessment-section').classList.contains('active'), true);
        assert.equal(doc.getElementById('setup-section').classList.contains('active'), false);
        assert.equal(env.sandbox.studentData.name, 'Aarav');
        assert.equal(env.sandbox.studentData.age, 10);
        assert.equal(env.sandbox.currentMode, 'student');
        assert.equal(env.sandbox.currentIndex, 0);
        assert.equal(env.sandbox.activeQuestions.length, 80);
    });

    test('T1.1.2: Option button selection updates ARIA attributes and enables Next button', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Aarav';
        doc.getElementById('btn-start-screening').click();

        const opt1 = doc.getElementById('opt-1');
        assert.equal(opt1.getAttribute('aria-checked'), 'false');
        assert.equal(opt1.classList.contains('selected'), false);
        assert.equal(doc.getElementById('next-btn').disabled, true);

        opt1.click();

        assert.equal(opt1.getAttribute('aria-checked'), 'true');
        assert.equal(opt1.classList.contains('selected'), true);
        assert.equal(doc.getElementById('next-btn').disabled, false);
        assert.equal(env.sandbox.selectedValue, 1);
    });

    test('T1.1.3: Session auto-persistence saves full state payload to localStorage on advancing', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Ananya';
        doc.getElementById('student-age').value = '12';
        doc.getElementById('btn-start-screening').click();

        doc.getElementById('opt-2').click();
        doc.getElementById('next-btn').click();

        assert.equal(env.sandbox.currentIndex, 1);

        const storageKey = env.sandbox.STORAGE_KEY;
        const snapshot = assertStorageSnapshot(env.localStorage, storageKey, (data) => {
            return data.studentData.name === 'Ananya' &&
                   data.studentData.age === 12 &&
                   data.currentIndex === 1 &&
                   data.answerLog.length === 1 &&
                   data.activeQuestions.length === 80;
        });

        assert.ok(snapshot.timestamp > 0);
    });

    test('T1.1.4: Session resume modal displays on startup when unfinished session exists', () => {
        const existingSession = {
            studentData: { name: 'Vikram', age: 14 },
            currentMode: 'student',
            currentIndex: 12,
            activeQuestions: Array(80).fill(null).map((_, i) => ({ id: i + 1, cat: 'attention' })),
            answers: { attention: 8 },
            categoryCounts: { attention: 4 },
            answerLog: [{ id: 1, cat: 'attention', val: 2 }]
        };

        const env = createBrowserEnvironment({
            initialStorage: {
                'eduscreen_active_session_v12': JSON.stringify(existingSession)
            }
        });

        const banner = env.document.getElementById('resume-banner');
        assert.equal(banner.style.display, 'flex');
        const resumeText = env.document.getElementById('resume-text').innerText;
        assert.ok(resumeText.includes('Vikram'));
        assert.ok(resumeText.includes('13')); // Question 12 + 1 = 13
    });

    test('T1.1.5: Resume button action restores all prior answers, scores, and active question index', () => {
        const existingSession = {
            studentData: { name: 'Kavya', age: 9 },
            currentMode: 'teacher',
            currentIndex: 20,
            activeQuestions: Array(80).fill(null).map((_, i) => ({
                id: i + 1,
                cat: 'dyscalculia',
                studentEn: 'Student Q' + (i + 1),
                teacherEn: 'Observed Q' + (i + 1)
            })),
            answers: { dyscalculia: 15 },
            categoryCounts: { dyscalculia: 6 },
            answerLog: Array(20).fill({ id: 1, cat: 'dyscalculia', val: 1 })
        };

        const env = createBrowserEnvironment({
            initialStorage: {
                'eduscreen_active_session_v12': JSON.stringify(existingSession)
            }
        });

        env.sandbox.resumeSession();

        assert.equal(env.sandbox.currentIndex, 20);
        assert.equal(env.sandbox.studentData.name, 'Kavya');
        assert.equal(env.sandbox.currentMode, 'teacher');
        assert.equal(env.document.getElementById('resume-banner').style.display, 'none');
        assert.equal(env.document.getElementById('assessment-section').classList.contains('active'), true);
        assert.ok(env.document.getElementById('question-text').innerText.includes('21.'));
    });

    test('T1.1.6: Discard button action purges localStorage and dismisses resume banner', () => {
        const existingSession = {
            studentData: { name: 'Rohan', age: 11 },
            currentMode: 'student',
            currentIndex: 10,
            activeQuestions: []
        };

        const env = createBrowserEnvironment({
            initialStorage: {
                'eduscreen_active_session_v12': JSON.stringify(existingSession)
            }
        });

        assert.ok(env.localStorage.getItem('eduscreen_active_session_v12') !== null);
        env.sandbox.discardSession();

        assert.equal(env.localStorage.getItem('eduscreen_active_session_v12'), null);
        assert.equal(env.document.getElementById('resume-banner').style.display, 'none');
    });

    test('T1.1.7: Bi-directional Previous button decrements index and restores previous view', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Meera';
        doc.getElementById('btn-start-screening').click();

        // Answer Q1
        doc.getElementById('opt-3').click();
        doc.getElementById('next-btn').click();
        assert.equal(env.sandbox.currentIndex, 1);
        assert.equal(doc.getElementById('prev-btn').disabled, false);

        // Click Previous
        doc.getElementById('prev-btn').click();
        assert.equal(env.sandbox.currentIndex, 0);
        assert.equal(doc.getElementById('prev-btn').disabled, true);
        assert.ok(doc.getElementById('question-text').innerText.startsWith('1.'));
    });

    test('T1.1.8: Retroactive score adjustment accurately alters cumulative category counts and answer log', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Dev';
        doc.getElementById('btn-start-screening').click();

        const firstCat = env.sandbox.activeQuestions[0].cat;

        // Answer Q1 with value 3
        doc.getElementById('opt-3').click();
        doc.getElementById('next-btn').click();

        assert.equal(env.sandbox.answers[firstCat], 3);
        assert.equal(env.sandbox.categoryCounts[firstCat], 1);
        assert.equal(env.sandbox.answerLog.length, 1);

        // Backtrack
        doc.getElementById('prev-btn').click();
        assert.equal(env.sandbox.answers[firstCat], 0);
        assert.equal(env.sandbox.categoryCounts[firstCat], 0);
        assert.equal(env.sandbox.answerLog.length, 0);

        // Re-answer Q1 with value 1
        doc.getElementById('opt-1').click();
        doc.getElementById('next-btn').click();

        assert.equal(env.sandbox.answers[firstCat], 1);
        assert.equal(env.sandbox.categoryCounts[firstCat], 1);
        assert.equal(env.sandbox.answerLog.length, 1);
        assert.equal(env.sandbox.answerLog[0].val, 1);
    });

    test('T1.1.9: Fisher-Yates shuffle produces uniform permutation of all 80 questions without duplication', () => {
        const env = createBrowserEnvironment();
        const originalQuestions = env.sandbox.questionBank;

        assert.equal(originalQuestions.length, 80);

        const shuffled = env.sandbox.fisherYatesShuffle(originalQuestions);

        assert.equal(shuffled.length, 80);
        const originalIds = new Set(originalQuestions.map(q => q.id));
        const shuffledIds = new Set(shuffled.map(q => q.id));

        assert.equal(shuffledIds.size, 80);
        for (const id of originalIds) {
            assert.ok(shuffledIds.has(id));
        }
    });

    test('T1.1.10: Static button event delegation preserves DOM elements across question transitions', () => {
        const env = createBrowserEnvironment();
        const doc = env.document;

        doc.getElementById('student-name').value = 'Sara';
        doc.getElementById('btn-start-screening').click();

        const opt0Ref = doc.getElementById('opt-0');
        const opt3Ref = doc.getElementById('opt-3');

        // Transition through 3 questions
        for (let i = 0; i < 3; i++) {
            doc.getElementById('opt-2').click();
            doc.getElementById('next-btn').click();
        }

        assert.equal(env.sandbox.currentIndex, 3);
        // Ensure buttons have not been replaced or recreated
        assert.strictEqual(doc.getElementById('opt-0'), opt0Ref);
        assert.strictEqual(doc.getElementById('opt-3'), opt3Ref);
    });
});
