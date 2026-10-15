# 🔍 Codebase Audit & Deficiencies Report
**Repository:** `aryanbarnvanshi-dev/Not-Weak-Mind` (EduScreen)  
**Date of Audit:** October 15, 2026  
**Auditor:** Antigravity AI Engineering Assistant  
**Objective:** Identify all existing deficiencies, bugs, security issues, UX flaws, and open-source compliance gaps in the codebase, document them thoroughly, and fix them immediately.

---

## 📋 Executive Summary of Deficiencies Identified

Before making new architectural plans or applying for sponsorships, a comprehensive line-by-line audit of all 6 files in the repository was conducted. 

A total of **11 specific deficiencies** were uncovered across 4 categories:
1. **Critical Syntax & Runtime Bugs (PWA / Broken Links)**
2. **User Experience & Accessibility (A11y) Gaps**
3. **CI/CD & Android Build Pipeline Defects**
4. **Open-Source Compliance & Sponsorship Readiness Gaps**

Below is the exhaustive breakdown of each issue and the immediate correction applied.

---

## 🚨 Category 1: Critical Runtime & Structural Bugs

### 1. Broken Markdown Link inside HTML `href` Attribute
- **File:** `index.html` (Line 377)
- **Deficiency:**
  ```html
  <div class="app-sys-info"> EduScreen v1.0.4 (build_ref: <a href="[https://github.com/aryanbarnvanshi-dev](https://github.com/aryanbarnvanshi-dev)">aryanbarnvanshi-dev</a>) </div>
  ```
  The `href` attribute contained raw markdown link syntax (`[url](url)`). When clicked on the live site, the browser resolved this to a relative URL:
  `https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/%5Bhttps://github.com/aryanbarnvanshi-dev%5D(https://github.com/aryanbarnvanshi-dev)` resulting in a **404 Not Found error**.
- **Fix Applied:** Changed to standard, valid HTML link with `target="_blank"` and `rel="noopener noreferrer"`:
  ```html
  <a href="https://github.com/aryanbarnvanshi-dev" target="_blank" rel="noopener noreferrer">Aryan Kumar (aryanbarnvanshi-dev)</a>
  ```

---

### 2. Broken PWA Service Worker (Blob Protocol & Scope Crash)
- **File:** `index.html` (Lines 800–840)
- **Deficiencies:**
  1. **Runtime Crash:** The inline service worker script included `const URLS_TO_CACHE = [window.location.href];`. In a Service Worker execution context, the `window` object is **undefined**, throwing a fatal `ReferenceError: window is not defined` immediately upon script parsing.
  2. **Security Protocol Rejection:** Modern browsers (Chrome, Edge, Firefox, Safari) strictly reject registering service workers from `blob:` URLs (`TypeError: Failed to register a ServiceWorker... The URL protocol of the script ('blob:') is not supported`).
  Because of this, the PWA offline capability was failing silently with console errors.
- **Fix Applied:**
  - Extracted the Service Worker into a dedicated, standard root file `sw.js`.
  - Replaced `window.location.href` with self-contained cache endpoints (`./`, `./index.html`, `./manifest.json`, `./icon.svg`).
  - Implemented standard `navigator.serviceWorker.register('sw.js')` with proper lifecycle event listeners.

---

### 3. Dynamic Manifest Blob & Missing PWA Icons
- **File:** `index.html`
- **Deficiencies:**
  - The web manifest was generated on the fly as a Blob URL and dynamically assigned to `<link rel="manifest">`. While functional in some desktop browsers, Google Chrome, Android WebAPK, and Lighthouse require a static, fetchable `manifest.json` file in `<head>`.
  - The manifest lacked any `icons` array. Under Web App Manifest standards, a PWA **cannot be installed to the home screen** without at least a 192x192 and 512x512 icon.
- **Fix Applied:**
  - Created a dedicated `manifest.json` file with standalone display, theme colors, and proper icon references.
  - Created an official vector app icon `icon.svg` (maskable and adaptable).
  - Linked `<link rel="manifest" href="manifest.json">` and `<link rel="icon" type="image/svg+xml" href="icon.svg">` directly in `<head>`.

---

### 4. Question Bank Count Discrepancy & Dynamic Progress Jumps
- **File:** `index.html`
- **Deficiencies:**
  - The README, title, and marketing all advertised *"80 Questions"*. However, `questionDataRaw` contained exactly 75 questions (15 categories × 5).
  - The remaining 5 questions were placed in an `adaptiveQuestions` array and only injected if a user scored `>= 2` in a category. If a student scored low on all items, the quiz abruptly ended at Question 75 instead of 80.
  - Furthermore, dynamically splicing questions into `activeQuestions` caused the UI progress text (`Question X of Y`) to jump unpredictably (e.g., from "Question 40 of 75" to "Question 41 of 76").
- **Fix Applied:**
  - Structured the baseline question bank to consistently include all 80 questions (with the 5 deeper reflection indicators integrated seamlessly into their respective categories).
  - Stabilized progress bar and question numbering so the user always experiences a smooth, predictable 80-question assessment.

---

## 🎨 Category 2: UI/UX & Accessibility (A11y) Flaws

### 5. Lack of User Preference Persistence (Dark Mode & Dyslexia Font)
- **File:** `index.html`
- **Deficiency:** Toggling Dark Mode or the OpenDyslexic/Dyslexia Font was purely in-memory. If a user refreshed the page, clicked reset, or reopened the browser, their accessibility settings were lost.
- **Fix Applied:** Added `localStorage` synchronization (`eduscreen_theme` and `eduscreen_font`) so user preferences are saved and automatically restored on page load.

---

### 6. Unskippable Splash Screen Blocking Interaction
- **File:** `index.html`
- **Deficiency:** The splash screen had an unskippable 3000ms delay (`setTimeout(..., 3000)`). For repeat visitors, screen readers, or fast test-takers, waiting 3 seconds on every reload was frustrating.
- **Fix Applied:**
  - Added click and touch event listeners to dismiss the splash screen immediately if tapped.
  - Reduced default auto-fade from 3.0s to 1.8s for better fluidity.
  - Added `@media print { #splash-screen { display: none !important; } }` so the splash never interferes with PDF printing.

---

### 7. Form Input Sanitization & A11y Attributes
- **File:** `index.html`
- **Deficiencies:**
  - The age input (`type="number"`) allowed users to type negative numbers or arbitrary values like `999` without clamping.
  - The `<canvas id="resultsChart">` had no `role="img"` or `aria-label`, failing accessibility readers.
- **Fix Applied:**
  - Added boundary constraints (`min="5" max="18"`) and automatic clamping logic on input.
  - Added accessible `role="img"` and descriptive `aria-label` to the results canvas.

---

## ⚙️ Category 3: CI/CD & Build Workflow Issues

### 8. Recursive Directory Copy in `build-apk.yml`
- **File:** `.github/workflows/build-apk.yml`
- **Deficiency:**
  ```bash
  cordova create my-app com.pocket.app "NotWeakMind"
  rm -rf my-app/www/*
  cp -r * my-app/www/ 2>/dev/null || true
  ```
  Because `my-app` was created in the root directory `.`, the command `cp -r * my-app/www/` recursively copied `my-app` into `my-app/www/my-app/`, creating nested directory duplication, bloating build artifacts, and risking build failures.
- **Fix Applied:**
  - Cleaned up copy logic to selectively copy web assets (`index.html`, `manifest.json`, `sw.js`, `icon.svg`, `sitemap.xml`) into `my-app/www/`.
  - Pinned Node.js to Node `20` LTS (Cordova tooling has known deprecation warnings on Node 24).

---

## 🌐 Category 4: Open Source Governance & Sponsorship Compliance

### 9. Missing Standard Open Source Governance Files
- **Deficiency:** The repository was missing critical files required by the open-source community, GitHub Community Standards, and sponsorship evaluators (JetBrains, Netlify, Sentry):
  - Missing `.gitignore` (exposing temporary IDE, OS, and build artifacts to accidental git commits).
  - Missing `CODE_OF_CONDUCT.md` (mandated by Netlify Open Source Policy and Contributor Covenant).
  - Missing `CONTRIBUTING.md` (mandated by JetBrains Open Source License review).
- **Fix Applied:**
  - Created `.gitignore` with comprehensive web, Node, and IDE exclusions.
  - Created `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1).
  - Created `CONTRIBUTING.md` with issue reporting and PR guidelines.

---

### 10. Missing Open Source Status Badges in README
- **File:** `README.md`
- **Deficiency:** The README lacked visual verification badges for license, build status, and live site. Evaluators from JetBrains and OSS programs check for clear project metadata.
- **Fix Applied:** Added official Shields.io badges for MIT License, GitHub Pages Live Status, APK Build Status, PWA Readiness, and Open Source verification.

---

### 11. Stale Sitemap Timestamp
- **File:** `sitemap.xml`
- **Deficiency:** Last modified date was frozen at `2026-07-24`.
- **Fix Applied:** Updated `<lastmod>` to `2026-10-15` to ensure immediate search engine re-indexing.

---

## ✅ Summary of Resolved State

| ID | Issue | Affected File | Status |
|:---|:---|:---|:---|
| #1 | Broken Markdown link in footer | `index.html` | ✅ Fixed |
| #2 | Service Worker `window` crash & blob URL rejection | `index.html` -> `sw.js` | ✅ Fixed |
| #3 | Missing static PWA manifest & icon | `manifest.json`, `icon.svg` | ✅ Fixed |
| #4 | Question bank count & progress jump | `index.html` | ✅ Fixed |
| #5 | Theme & Font preferences not saved | `index.html` | ✅ Fixed |
| #6 | Splash screen delay & print collision | `index.html` | ✅ Fixed |
| #7 | Input clamping & Canvas accessibility | `index.html` | ✅ Fixed |
| #8 | Recursive directory copy in APK action | `.github/workflows/build-apk.yml` | ✅ Fixed |
| #9 | Missing governance files | `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `.gitignore` | ✅ Created |
| #10 | Missing badges in README | `README.md` | ✅ Updated |
| #11 | Stale sitemap date | `sitemap.xml` | ✅ Updated |
