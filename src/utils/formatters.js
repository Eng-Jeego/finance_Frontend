/**
 * Formats a numerical amount into a localized currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch (error) {
    // Fallback if unrecognized currency code
    return `${currency} ${numericAmount.toFixed(2)}`;
  }
};

/**
 * Formats ISO date string into readable format (e.g. Sep 15, 2026)
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};

/**
 * Formats date into YYYY-MM-DD string for HTML <input type="date" />
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Formats percentage value (e.g., 45.2%)
 */
export const formatPercentage = (val) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return `${num.toFixed(1)}%`;
};
