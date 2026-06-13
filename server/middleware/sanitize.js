// middleware/sanitize.js — Strip potentially dangerous content from request inputs
const { body, query, param } = require('express-validator');

/**
 * SQL injection keyword detector.
 * Rejects strings containing obvious SQL injection patterns.
 */
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|HAVING|BENCHMARK|SLEEP|WAITFOR|CAST|CONVERT)\b)/i;

/**
 * Returns a validator chain that sanitizes a string field:
 * - Trim whitespace
 * - Escape HTML entities
 * - Block SQL injection attempts
 */
const sanitizeStringField = (fieldName) =>
  body(fieldName)
    .optional()
    .trim()
    .escape()
    .custom((value) => {
      if (SQL_INJECTION_PATTERN.test(value)) {
        throw new Error(`Invalid characters in field: ${fieldName}`);
      }
      return true;
    });

module.exports = { sanitizeStringField, SQL_INJECTION_PATTERN };
