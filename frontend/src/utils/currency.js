// ─── Currency utilities ────────────────────────────────────────────────────────
// Import these instead of ever hardcoding ₹ or $ in JSX.

import { CURRENCY } from '../config'

/**
 * Format a monetary amount with the app currency symbol.
 * @param {number} amount
 * @param {number} decimals — default 2
 * @returns {string}  e.g. "₹1,234.56"
 */
export function formatCurrency(amount, decimals = 2) {
  if (amount == null || isNaN(amount)) return `${CURRENCY.symbol}0.${'0'.repeat(decimals)}`
  return `${CURRENCY.symbol}${Number(amount).toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

/**
 * Format a per-1000 rate.
 * @param {number} rate
 * @returns {string}  e.g. "₹12.3456/1k"
 */
export function formatRate(rate) {
  if (rate == null || isNaN(rate)) return `${CURRENCY.symbol}0.0000/1k`
  return `${CURRENCY.symbol}${Number(rate).toFixed(4)}/1k`
}

/**
 * Format a small precision amount (4 decimal places).
 * @param {number} amount
 * @returns {string}  e.g. "₹0.0012"
 */
export function formatPrecise(amount) {
  return formatCurrency(amount, 4)
}
