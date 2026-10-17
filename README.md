# 🎓 Not-Weak-Mind (EduScreen)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/Live%20App-Launch%20EduScreen-brightgreen)](https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/)
[![Android APK Release](https://img.shields.io/badge/Android%20App-Download%20APK-blue?logo=android)](https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/releases)
[![Tests CI](https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/actions/workflows/test.yml/badge.svg)](https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/actions)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-blue)](https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20On--Device-success)](https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/)

> **"A child who struggles with reading, math, or focus is NOT a weak mind. Their cognitive wiring simply processes the world differently."**  
> *Not-Weak-Mind (EduScreen)* is a 100% free, private, client-side educational screening questionnaire and cognitive visualizer designed to help teachers, parents, and students identify specific learning challenges early—without stigma, subscription paywalls, or cloud data harvesting.

---

## ⚡ Quick Access Center

| Platform | Action | Details |
| :--- | :--- | :--- |
| 🌐 **Web Browser** | [**Launch Live Web App**](https://aryanbarnvanshi-dev.github.io/Not-Weak-Mind/) | Zero installation required. Runs locally in Chrome, Safari, Firefox, or Edge. |
| 📱 **Android Phone** | [**Download Android APK**](https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/releases) | Free offline `.apk` for Android 7.0+ (API 24+). Works without an internet connection. |
| ⚡ **Rapid Screener** | **15 Questions (~2 Mins)** | 1 curated question per domain for quick cognitive triage. |
| 🔬 **Full Clinical Survey** | **80 Questions (~10 Mins)** | Deep, comprehensive diagnostic inventory covering 15 development domains. |
| 📊 **Instant Demo** | **1-Click Preview** | Click *"📊 Preview Sample Profile"* on the start screen to test the visualizers instantly. |

---

## 📖 The "Not-Weak-Mind" Mission

In many households and classrooms across India and worldwide, millions of neurodivergent children are punished, beaten, or labeled as **"kamzor dimaag" (weak-minded)**, **"lazy"**, or **"deliberately misbehaving"** because their struggles are invisible:
* A child with **Dyslexia** sees letter inversions (like mixing 'b' and 'd') and feels physically exhausted reading text.
* A child with **ADHD / Executive Dysfunction** genuinely forgets the second step of an instruction because their working memory is overloaded.
* A child with **Dysgraphia** experiences severe hand cramping holding a pencil.

Formal neuropsychological assessments often cost **₹5,000 to ₹25,000**, creating an insurmountable barrier for 95% of families.

**EduScreen acts as a "Cognitive Thermometer":**
Just as a thermometer doesn't cure an illness but alerts parents that a child has a fever rather than making excuses, EduScreen objectively visualizes cognitive balance across 15 domains, turning a punishing conflict (*"Why are you so lazy?"*) into constructive support (*"Let's try a visual checklist and audio tools"*).

---

## 🌟 Key Features

### 1. 🌐 Bilingual by Design (English & हिन्दी)
Instant 1-click toggle between English and Devanagari Hindi. Translates all 80 questions, 15 domain explanations, risk badges, and recommendations to bridge language barriers.

### 2. 🔊 Integrated Audio Narration (Web Speech API)
Testing a dyslexic child with dense blocks of text is a clinical paradox. EduScreen includes a built-in **`🔊 Read Aloud`** button that reads questions out loud in natural English (`en-US`) or Hindi (`hi-IN`) with measured pacing.

### 3. 📊 Dual Multidimensional Visualizations
* **15-Domain Score Profile:** High-DPI bar visualizer with color-coded risk stratification (Green: Strength/Low, Blue: Mild, Amber: Moderate, Red: Strong).
* **4-Quadrant Cognitive Radar (Spider) Chart:** Plots balance across:
  1. *Academic & Language* (Dyslexia, Dyscalculia, Dysgraphia, Communication)
  2. *Executive & Attention* (Focus, Working Memory, Processing Speed, Planning)
  3. *Affective & Behavioral* (Learning Anxiety, Test Anxiety, Motivation, Social)
  4. *Sensorimotor* (Sensory Sensitivity, Fine Motor Coordination, Recall)

### 4. 🏫 Tiered MTSS Action Plans
Provides actionable, practical interventions across 4 levels:
* 🏫 **Classroom Accommodations:** Untimed tests, visual checklists, slant boards, oral response alternatives.
* 🏠 **Home Exercises:** Bilateral crafting, 4-7-8 calming routines, backpack landing pads.
* 💻 **Assistive Technology:** Phonics apps, Speech-to-Text tools, blue-light filters.
* 🩺 **Clinical Guidance:** Explicit recommendations for Educational Psychologists, Speech-Language Pathologists (SLP), or Occupational Therapists (OT).

### 5. 🛡️ 100% Client-Side Privacy Architecture
* **Zero Cloud Storage:** Student names and test results exist solely in volatile device memory and local browser cache.
* **Zero Telemetry or Cookies:** No third-party trackers, analytics, or behavioral cookies.
* **Offline PWA:** Caches locally via Service Worker `sw.js` for full offline functionality.

### 6. 📁 Clinical Multi-Format Exports
* 🖨️ **Print / PDF Export:** Tailored `@media print` layout formatting A4 clinical summaries with clean margins and risk badges.
* 📥 **JSON Psychometric Payload:** Download raw assessment state for educational psychologists or archival records.
* 📊 **CSV Export:** Tabular comma-separated values for school records or multi-student comparison.

---

## ⚠️ Important Educational Disclaimer

> **EduScreen is an educational awareness screening survey, NOT a formal medical, psychiatric, or diagnostic evaluation.**

* **What it is:** A structured psychometric questionnaire designed to identify cognitive patterns, stimulate constructive discussions between parents and teachers, and guide supportive classroom accommodations.
* **What it is NOT:** A medical diagnosis or psychological certification. It does not replace comprehensive evaluation by licensed clinicians (such as Clinical Psychologists, Developmental Pediatricians, or Certified Special Educators).
* If high risk indicators (≥50%) are consistently flagged, we strongly recommend seeking a formal psycho-educational assessment.

---

## 🛠️ Technology Stack & Engineering Standards

* **Zero-Dependency Architecture:** Written in vanilla HTML5, CSS3 Custom Properties, and modular ES6 JavaScript. No heavy frameworks, no external runtime dependencies.
* **High-DPI Canvas Rendering:** Double-buffered Canvas 2D engine with devicePixelRatio auto-scaling and fallback bounding.
* **Accessibility (WCAG 2.1 AAA Compliant):**
  * Atkinson Hyperlegible accessible typography.
  * Reading ruler tracking guide.
  * Contrast ratios exceeding 7:1 across all risk badges and disclaimers.
  * High-visibility `:focus-visible` indicators and WAI-ARIA `radiogroup`/`radio` attributes.
* **Automated CI Test Suite:** 27 integration tests running on native Node.js 24 test runner (`node --test tests/tier1-features/*.test.js`) executed automatically on every push via GitHub Actions.

---

## 🚀 Local Development & Testing

```bash
# Clone repository
git clone https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind.git
cd Not-Weak-Mind

# Run automated integration test suite
node --test tests/tier1-features/*.test.js

# Launch local server
npx serve .
# Or open index.html directly in any browser
```

---

## 🤝 Contributing & Community Support

Contributions from educators, child psychologists, translators, and developers are warmly welcomed!
* Read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
* Check [MASTER_AUDIT_REPORT.md](MASTER_AUDIT_REPORT.md) for recent audit findings.
* Found a bug or have question bank suggestions? [Open an issue](https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/issues).

---

## 📄 License & Author

* **Author:** Aryan Kumar ([@aryanbarnvanshi-dev](https://github.com/aryanbarnvanshi-dev))
* **License:** [MIT License](LICENSE) — 100% Free and Open Source for schools, NGOs, parents, and educators everywhere.
