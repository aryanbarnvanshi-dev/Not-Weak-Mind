# Contributing to Not-Weak-Mind (EduScreen)

Thank you for your interest in contributing to **Not-Weak-Mind (EduScreen)**! We welcome all contributions from developers, educators, designers, and students of all experience levels.

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [aryanbarnvanshi@gmail.com](mailto:aryanbarnvanshi@gmail.com).

---

## 💡 How You Can Contribute

1. **Bug Reports & Fixes:** Identify and fix issues in the screening questionnaire, chart rendering, or accessibility.
2. **Accessibility Improvements (A11y):** Enhance screen reader compatibility, high-contrast themes, or keyboard navigation.
3. **Language & Phrasing:** Suggest clearer, more empathetic phrasing for student and observer questions.
4. **Documentation:** Improve guides, instructions, or disclaimers for parents and educators.
5. **Offline & PWA Enhancements:** Optimize offline caching, Service Worker lifecycle, and mobile responsiveness.

---

## 🛠️ Local Development Setup

EduScreen is intentionally built with **Zero External Dependencies** to remain lightweight, private, and fully operable offline.

### Quick Start:
```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/Not-Weak-Mind.git

# 2. Navigate into project directory
cd Not-Weak-Mind

# 3. Open in any modern web browser
# On Windows:
start index.html
# On macOS:
open index.html
# On Linux:
xdg-open index.html
```
No `npm install`, compilers, or build steps are required for web testing!

---

## 🚀 Submitting a Pull Request (PR)

1. **Fork the Repository:** Click the "Fork" button on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes:** Test locally in multiple browsers (Chrome, Firefox, Safari/Edge).
4. **Ensure No Broken Links or Global Crashes:**
   - Verify Service Worker functions (`sw.js`).
   - Check developer console for zero errors or warnings.
5. **Commit Your Changes:**
   ```bash
   git commit -m "feat: describe your change clearly"
   ```
6. **Push and Open a Pull Request:**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## ⚠️ Important Educational & Medical Disclaimer

EduScreen is **strictly an awareness and educational screening tool created by a student**, NOT a diagnostic instrument. Contributions proposing clinical claims or diagnostic scores without prominent disclaimers cannot be accepted.

---

## 💬 Contact & Support

Maintainer: **Aryan Kumar**  
GitHub: [@aryanbarnvanshi-dev](https://github.com/aryanbarnvanshi-dev)  
Email: `aryanbarnvanshi@gmail.com`
