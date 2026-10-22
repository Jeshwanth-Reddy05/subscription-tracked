export const CURRENCY_SYMBOL = "₹";

/**
 * Formats a monetary amount with the application's default currency symbol.
 *
 * @param {number|string} amount
 * @param {number} [decimals=2]
 * @returns {string}
 */
export const formatCurrency = (amount, decimals = 2) => {
  const num = Number(amount) || 0;
  return `${CURRENCY_SYMBOL}${num.toFixed(decimals)}`;
};
