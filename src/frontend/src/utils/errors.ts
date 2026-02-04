/**
 * Normalizes backend errors into user-friendly English messages
 */
export function normalizeError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    
    // Check for authorization/authentication errors
    if (message.includes('Unauthorized') || message.includes('unauthorized')) {
      return message; // Backend already provides clear English messages
    }
    
    if (message.includes('Not authenticated') || message.includes('not authenticated')) {
      return 'Please log in to perform this action.';
    }
    
    if (message.includes('Anonymous principals')) {
      return 'Please log in to access this feature.';
    }
    
    // Return the original message if it's already clear
    return message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return normalizeError((error as { message: unknown }).message);
  }

  return 'An unexpected error occurred. Please try again.';
}
