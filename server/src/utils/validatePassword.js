const PASSWORD_MIN_LENGTH = 8;

// Returns an error message string if the password is too weak, or null if it's valid.
// Shared by registration and profile password-change so both enforce the same rule.
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include a number';
  return null;
}

module.exports = { validatePassword, PASSWORD_MIN_LENGTH };
