/**
 * Timestamp utilities
 */

/**
 * Get current Unix timestamp (seconds)
 * @returns {number} - Unix timestamp
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Convert Unix timestamp to ISO string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - ISO date string
 */
export function timestampToISO(timestamp) {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Convert ISO string to Unix timestamp
 * @param {string} isoString - ISO date string
 * @returns {number} - Unix timestamp
 */
export function isoToTimestamp(isoString) {
  return Math.floor(new Date(isoString).getTime() / 1000);
}
