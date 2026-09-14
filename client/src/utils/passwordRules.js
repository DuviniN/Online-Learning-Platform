// Mirrors server/src/utils/validatePassword.js so the browser gives the same
// feedback before a round-trip, while the backend remains the real authority.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}';
export const PASSWORD_HINT = 'At least 8 characters, with an uppercase letter, a lowercase letter, and a number';
