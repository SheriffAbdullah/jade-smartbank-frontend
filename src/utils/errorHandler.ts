/**
 * Format API errors for display in React components
 * Handles Pydantic validation errors, FastAPI errors, and Axios errors
 */

interface PydanticError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: any;
  ctx?: any;
  url?: string;
}

/**
 * Format API error for user-friendly display
 * @param error - The error object from API call
 * @returns Formatted error message string
 */
export const formatApiError = (error: any): string => {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // Handle Axios/Fetch response errors
  if (error?.response?.data) {
    return formatApiError(error.response.data);
  }

  // Handle API error response
  const detail = error?.detail;

  // Pydantic validation errors (array of error objects)
  if (Array.isArray(detail)) {
    return detail
      .map((err: PydanticError) => {
        // Format field name from location array
        const field = err.loc.length > 1 ? err.loc[err.loc.length - 1] : err.loc[0];
        return `${String(field)}: ${err.msg}`;
      })
      .join('; ');
  }

  // Standard FastAPI error (string detail)
  if (typeof detail === 'string') {
    return detail;
  }

  // Generic error message
  if (error?.message) {
    return error.message;
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extract first error message from validation errors
 * Useful for single-line error displays
 */
export const getFirstError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data) {
    return getFirstError(error.response.data);
  }

  const detail = error?.detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return detail[0].msg;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  return 'An error occurred';
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: any): boolean => {
  const detail = error?.response?.data?.detail || error?.detail;
  return Array.isArray(detail);
};

/**
 * Get validation errors as field-message map
 * Useful for inline field validation display
 */
export const getValidationErrors = (error: any): Record<string, string> => {
  const detail = error?.response?.data?.detail || error?.detail;

  if (!Array.isArray(detail)) {
    return {};
  }

  const errors: Record<string, string> = {};

  detail.forEach((err: PydanticError) => {
    const field = err.loc.length > 1 ? String(err.loc[err.loc.length - 1]) : String(err.loc[0]);
    errors[field] = err.msg;
  });

  return errors;
};