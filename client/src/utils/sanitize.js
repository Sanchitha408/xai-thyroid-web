// utils/sanitize.js — Client-side input sanitization helpers
/**
 * Strip HTML tags from a string (defense-in-depth on top of server sanitization).
 */
export function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Clamp a numeric value to [min, max].
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

/**
 * Format a float to N decimal places.
 */
export function toFixed(value, decimals = 2) {
  return parseFloat(Number(value).toFixed(decimals));
}

/**
 * Sanitize diagnosis form inputs before sending to API.
 */
export function sanitizeDiagnosisInputs({ tsh, t3, tt4, fti, age, sex }) {
  return {
    tsh: clamp(toFixed(tsh, 1), 0, 30),
    t3:  clamp(toFixed(t3, 1),  0, 15),
    tt4: clamp(toFixed(tt4, 0), 0, 300),
    fti: clamp(toFixed(fti, 0), 0, 400),
    age: clamp(Math.round(age), 1, 120),
    sex: ['Male', 'Female'].includes(sex) ? sex : 'Male',
  };
}
