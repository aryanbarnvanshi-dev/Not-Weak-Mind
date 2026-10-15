/**
 * EduScreen Test Suite Custom Assertions
 * Standards-based assertions for WCAG contrast, RFC-4180 CSV, JSON schema, and Canvas.
 */

const assert = require('node:assert/strict');

/**
 * Normalizes hex string (3, 6 digit) to RGB components [0..1]
 */
function parseHexColor(hex) {
    let clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB color.
 */
function getRelativeLuminance(rgb) {
    const srgb = rgb.map(val => {
        return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculates contrast ratio between two hex colors according to WCAG 2.1.
 */
function calculateContrastRatio(hex1, hex2) {
    const lum1 = getRelativeLuminance(parseHexColor(hex1));
    const lum2 = getRelativeLuminance(parseHexColor(hex2));
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Asserts contrast ratio between fg and bg meets or exceeds minRatio.
 */
function assertContrastRatio(fgHex, bgHex, minRatio, label = 'Contrast Ratio') {
    const ratio = calculateContrastRatio(fgHex, bgHex);
    assert.ok(
        ratio >= minRatio,
        `${label}: Expected contrast >= ${minRatio}:1, but got ${ratio.toFixed(2)}:1 between ${fgHex} and ${bgHex}`
    );
    return ratio;
}

/**
 * Asserts that canvas context received at least minCalls draw calls.
 */
function assertCanvasRendered(ctx, minCalls = 10, label = 'Canvas Rendering') {
    assert.ok(ctx, `${label}: Canvas 2D context must exist`);
    assert.ok(
        ctx._calls.length >= minCalls,
        `${label}: Expected at least ${minCalls} draw operations, recorded ${ctx._calls.length}`
    );
}

/**
 * Asserts that an object adheres to the diagnostic report JSON schema.
 */
function assertJsonSchema(payload, label = 'JSON Diagnostic Report') {
    assert.ok(payload && typeof payload === 'object', `${label}: Payload must be an object`);
    assert.equal(payload.app, 'EduScreen', `${label}: app property must be EduScreen`);
    assert.ok(typeof payload.version === 'string', `${label}: version must be string`);
    assert.ok(typeof payload.date === 'string', `${label}: date must be ISO string`);
    assert.ok(payload.student && typeof payload.student === 'object', `${label}: student must be object`);
    assert.ok(typeof payload.student.name === 'string', `${label}: student.name must be string`);
    assert.ok(typeof payload.student.age === 'number', `${label}: student.age must be number`);
    assert.ok(typeof payload.mode === 'string', `${label}: mode must be string`);
    assert.ok(payload.scores && typeof payload.scores === 'object', `${label}: scores must be object`);
    assert.ok(payload.categoryPercentages && typeof payload.categoryPercentages === 'object', `${label}: categoryPercentages must be object`);
    assert.ok(Array.isArray(payload.detailedResponses), `${label}: detailedResponses must be array`);
}

/**
 * Asserts that a CSV string conforms to RFC-4180 format requirements.
 */
function assertCsvRfc4180(csvString, label = 'CSV Export') {
    assert.ok(typeof csvString === 'string', `${label}: CSV payload must be a string`);
    assert.ok(csvString.length > 50, `${label}: CSV payload must not be empty`);

    const lines = csvString.split('\n');
    assert.ok(lines.length >= 5, `${label}: CSV must contain multiple lines`);

    // Verify first header line
    assert.ok(
        lines[0].includes('Domain') && lines[0].includes('Score') && lines[0].includes('RiskLevel'),
        `${label}: Header row must include Domain, Score, RiskLevel`
    );

    // Verify second section header
    const secondHeaderIdx = lines.findIndex(l => l.includes('QuestionIndex') && l.includes('SelectedValue'));
    assert.ok(secondHeaderIdx > 0, `${label}: CSV must contain item-level response section header`);

    // Verify quote escaping: if quote exists in unquoted position or double quotes
    lines.forEach((line, idx) => {
        let insideQuote = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                insideQuote = !insideQuote;
            }
        }
        assert.equal(
            insideQuote,
            false,
            `${label}: Line ${idx + 1} has unclosed quote: ${line}`
        );
    });
}

/**
 * Asserts that CSS contains valid :focus-visible accessibility ring definition.
 */
function assertFocusVisible(cssText, label = 'Focus-Visible Rings') {
    assert.ok(
        cssText.includes(':focus-visible'),
        `${label}: CSS must define :focus-visible rules`
    );
    assert.ok(
        cssText.includes('outline:') && cssText.includes('outline-offset:'),
        `${label}: :focus-visible must define outline and outline-offset`
    );
}

/**
 * Asserts safe-area notch and mobile ergonomic variables are defined.
 */
function assertSafeAreas(cssText, htmlContent, label = 'Safe-Area Ergonomics') {
    assert.ok(
        htmlContent.includes('viewport-fit=cover'),
        `${label}: meta viewport must include viewport-fit=cover`
    );
    assert.ok(
        cssText.includes('env(safe-area-inset-top') && cssText.includes('env(safe-area-inset-bottom'),
        `${label}: CSS must declare safe-area insets`
    );
}

/**
 * Asserts snapshot in localStorage is valid.
 */
function assertStorageSnapshot(storage, expectedKey, validatorFn, label = 'Storage Snapshot') {
    const raw = storage.getItem(expectedKey);
    assert.ok(raw !== null, `${label}: Key "${expectedKey}" must exist in storage`);
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        assert.fail(`${label}: Stored value is not valid JSON: ${raw}`);
    }
    if (typeof validatorFn === 'function') {
        assert.ok(validatorFn(parsed), `${label}: Stored snapshot failed validator function`);
    }
    return parsed;
}

module.exports = {
    parseHexColor,
    getRelativeLuminance,
    calculateContrastRatio,
    assertContrastRatio,
    assertCanvasRendered,
    assertJsonSchema,
    assertCsvRfc4180,
    assertFocusVisible,
    assertSafeAreas,
    assertStorageSnapshot
};
