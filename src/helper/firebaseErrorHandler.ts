/**
 * Returns a user-friendly message for Firebase Auth errors.
 */
export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred. Please try again.';
  let code = '';

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  ) {
    code = (error as { code: string }).code;
  }

  switch (code) {
    // Authentication / Sign-in errors
    case 'auth/invalid-email':
      return 'The email address is invalid. Please check and try again.';
    case 'auth/user-disabled':
      return 'Your account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email or phone number.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered.';
    case 'auth/operation-not-allowed':
      return 'Sign-in method not enabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';

    // Phone authentication specific
    case 'auth/invalid-verification-code':
      return 'The OTP entered is invalid. Please check and try again.';
    case 'auth/missing-verification-code':
      return 'Please enter the verification code sent to your phone.';
    case 'auth/invalid-verification-id':
      return 'Verification session expired. Please request a new OTP.';
    case 'auth/code-expired':
      return 'The OTP has expired. Please request a new one.';
    case 'auth/missing-verification-id':
      return 'Verification ID missing. Please request a new code.';
    case 'auth/session-expired':
      return 'Your verification session has expired. Please resend the OTP.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for this device. Please try again later.';

    // Credentials
    case 'auth/invalid-credential':
      return 'Invalid or expired credential. Please sign in again.';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with another account.';

    // ReCAPTCHA or verification flow
    case 'auth/app-not-authorized':
      return 'This app is not authorized to use Firebase Authentication.';
    case 'auth/invalid-app-credential':
      return 'Invalid app credential. Please try again.';
    case 'auth/missing-app-credential':
      return 'Missing app credential. Please try again.';

    // Others
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again.';
    case 'auth/invalid-api-key':
      return 'Invalid API key. Please check your Firebase configuration.';
    case 'auth/timeout':
      return 'Request timed out. Please check your connection and try again.';
    case 'auth/unverified-email':
      return 'Please verify your email before signing in.';

    // Default / unknown errors
    default:
      if (error instanceof Error && error.message) {
        // Optionally log to a remote error tracking service
        // console.log('Firebase error:', error.message);
      }
      return 'Something went wrong. Please try again later.';
  }
}