/**
 * Logs details about authentication failures for debugging purposes.
 * @param {Object} params
 * @param {string} params.provider - The auth provider (e.g., 'Google', 'Phone', 'Email/Password')
 * @param {string} params.funcName - The name of the failed function
 * @param {Error} params.error - The original error object
 * @param {Object} [params.details] - Additional request details
 */
export const logAuthError = ({ provider, funcName, error, details }) => {
  console.group('🔒 Authentication Failure Audit');
  console.error(`Failed Function: ${funcName}`);
  console.error(`Auth Provider:   ${provider}`);
  console.error(`Firebase Code:   ${error?.code || 'N/A'}`);
  console.error(`Error Message:   ${error?.message || error}`);
  if (details) {
    console.error('Request Details:', details);
  }
  if (error?.stack) {
    console.error('Stack Trace:', error.stack);
  }
  console.groupEnd();
};

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param {Error} error - The Firebase Error object
 * @returns {string} User-friendly message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const code = error.code;
  
  switch (code) {
    // Email / Password
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account was found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password is too weak. It must be at least 6 characters.';
    
    // Popup Google login
    case 'auth/unauthorized-domain':
      return `Domain (${window.location.hostname}) is not authorized in Firebase. Add "${window.location.hostname}" in Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in request was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please enable popups.';
    
    // Phone OTP
    case 'auth/code-expired':
      return 'The verification code has expired. Please request a new OTP.';
    case 'auth/invalid-verification-code':
      return 'The verification code is incorrect. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA validation failed. Please check your network connection.';
    
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};
