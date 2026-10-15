# 🗺️ EduScreen (Not-Weak-Mind) Strategic Roadmap & Implementation Plan
**Maintainer:** Aryan Kumar ([@aryanbarnvanshi-dev](https://github.com/aryanbarnvanshi-dev))  
**Target Repository:** `aryanbarnvanshi-dev/Not-Weak-Mind`  
**License:** MIT License  
**Updated:** October 15, 2026

---

## 📌 Vision Statement
To provide a 100% private, client-side, accessible educational screening questionnaire that helps students, parents, and educators identify learning challenges (such as dyslexia, dyscalculia, and ADHD) early, while promoting constructive dialogue with licensed educational psychologists.

---

## 🚀 Strategic Execution Phases

```
┌────────────────────────────────────────────────────────────────────────┐
│  Phase 1: Codebase Audit & Immediate Fixes (COMPLETED)                │
│  - Fixed broken markdown links & footer navigation                     │
│  - Extracted standalone PWA Service Worker (sw.js) & Manifest          │
│  - Added vector icon.svg & resolved offline caching crashes            │
│  - Created CODE_OF_CONDUCT.md, CONTRIBUTING.md, .gitignore             │
│  - Added verified README badges and fixed APK CI/CD pipeline           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase 2: Open Source Sponsorship Applications (NEXT STEP)             │
│  - JetBrains All Products Pack ($779/yr) -> Activity window refreshed   │
│  - 1Password for Open Source Teams ($240/yr)                           │
│  - Sentry Business Tier Observability ($348+/yr)                       │
│  - Snyk Enterprise Security Suite for Open Source ($1,000+/yr)         │
│  - BrowserStack Open Source Testing (3,500+ real devices)              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase 3: Client-Side Privacy-First AI & Smart Insights                │
│  - Local on-device AI suggestions (WebLLM / ONNX)                      │
│  - Dynamic recommendation generator tailored to user profile           │
│  - Zero data transmission to third parties                             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Phase 4: Multi-Language & Accessibility Expansion                     │
│  - Full Hindi & regional language translation support                  │
│  - Text-to-Speech (TTS) audio narration for questions                  │
│  - Enhanced screen reader (NVDA/JAWS) audit                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Phase Breakdown & Action Items

### Phase 1: Codebase Hygiene & Bug Fixes (✅ Completed)
- [x] Line-by-line audit of all repository files.
- [x] Documented all 11 deficiencies in `AUDIT_AND_FIXES.md`.
- [x] Fixed broken markdown link in `index.html` footer.
- [x] Extracted Service Worker to standalone `sw.js` with Stale-While-Revalidate caching.
- [x] Created `manifest.json` with standalone PWA support.
- [x] Created high-resolution SVG app icon `icon.svg`.
- [x] Streamlined question bank to a consistent 80 questions with smooth progress calculation.
- [x] Added `localStorage` persistence for Dark Mode and Dyslexia Font.
- [x] Added click-to-dismiss behavior to splash screen and suppressed it during printing.
- [x] Added standard `.gitignore`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md`.
- [x] Pinned Node 20 LTS and eliminated recursive asset copying in `.github/workflows/build-apk.yml`.
- [x] Updated `sitemap.xml` timestamp and enriched `README.md` with status badges.

---

### Phase 2: Open-Source Sponsorship Activations (Ready for Submission)
Now that the repository has fresh commits, an active MIT license, >8 months of history, and official governance files, it qualifies for top-tier open-source developer grants requiring **ZERO bank details and ZERO credit cards**:

1. **JetBrains Open Source Support Program ($779/yr value):**
   - **Form:** [jetbrains.com/shop/eform/opensource](https://www.jetbrains.com/shop/eform/opensource)
   - **Fields to submit:**
     - Project Name: `Not-Weak-Mind`
     - Repository URL: `https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind`
     - License URL: `https://github.com/aryanbarnvanshi-dev/Not-Weak-Mind/blob/main/LICENSE`
   - *Fresh code commits pushed today ensure the 90-day activity bot check passes immediately.*

2. **1Password for Open Source Teams ($240/yr value):**
   - **Step 1:** Create a 14-day trial team account at `start.1password.com/sign-up/team` (no payment method requested).
   - **Step 2:** Submit an issue at `github.com/1Password/for-open-source` or email `opensource@1password.com` with the repository URL.

3. **Sentry for Open Source (Business Tier - $348+/yr value):**
   - **Step 1:** Create a free organization at `sentry.io`.
   - **Step 2:** Apply at [sentry.io/for/open-source](https://sentry.io/for/open-source/) for the permanent Business Plan sponsorship.

4. **Snyk Secure Developer Program ($1,000+/yr value):**
   - **Step 1:** Install Snyk GitHub integration for automated vulnerability PR checks.
   - **Step 2:** Submit form at [snyk.io/open-source](https://snyk.io/open-source/).

5. **BrowserStack Open Source (Lifetime access to 3,500+ devices):**
   - **Step 1:** Apply at [browserstack.com/open-source](https://www.browserstack.com/open-source/) for automated and live cross-device browser testing.

---

### Phase 3: AI Inference & Smart Recommendations (Upcoming)
- Implement optional, local WebLLM or lightweight inference for generating personalized study suggestions without sending personal user answers to any external cloud server.
- Generate structured PDF summaries that parents can hand directly to school counselors.

---

### Phase 4: Localization & Accessibility (Upcoming)
- Support bilingual Hindi & English UI toggle (`hi` / `en`).
- Add HTML5 Web Speech API text-to-speech so younger children or students with severe dyslexia can listen to questions rather than reading.
