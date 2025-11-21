/**
 * Error handling utilities for the application
 */

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Parse Web3 errors into user-friendly messages
 */
export function parseWeb3Error(error: any): AppError {
  // User rejected transaction
  if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
    return {
      message: "Transaction was rejected by user",
      code: "USER_REJECTED",
    };
  }

  // Insufficient funds
  if (
    error?.message?.includes("insufficient funds") ||
    error?.code === "INSUFFICIENT_FUNDS"
  ) {
    return {
      message: "Insufficient funds to complete transaction",
      code: "INSUFFICIENT_FUNDS",
    };
  }

  // Contract revert errors
  if (error?.message?.includes("execution reverted")) {
    const revertReason = extractRevertReason(error.message);
    return {
      message: revertReason || "Transaction failed: contract error",
      code: "CONTRACT_REVERT",
      details: error.message,
    };
  }

  // Network errors
  if (error?.code === "NETWORK_ERROR") {
    return {
      message: "Network error: please check your connection",
      code: "NETWORK_ERROR",
    };
  }

  // Default error
  return {
    message: error?.message || "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    details: error,
  };
}

/**
 * Extract revert reason from error message
 */
function extractRevertReason(message: string): string | null {
  const match = message.match(/reverted with reason string '(.+?)'/);
  if (match && match[1]) {
    return match[1];
  }

  const customMatch = message.match(/reverted with custom error '(.+?)'/);
  if (customMatch && customMatch[1]) {
    return customMatch[1];
  }

  return null;
}

/**
 * Format error for display to user
 */
export function formatErrorMessage(error: any): string {
  const parsed = parseWeb3Error(error);
  return parsed.message;
}

/**
 * Log error for debugging
 */
export function logError(context: string, error: any) {
  console.error(`[${context}]`, {
    message: error?.message,
    code: error?.code,
    stack: error?.stack,
    raw: error,
  });
}

