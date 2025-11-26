// src/utils/format.js
export function formatCurrency(value) {
  // fallback simple formatter (Egyptian Pound)
  try {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value).replace(/\u00A0/g, " "); // keep spacing safe
  } catch {
    // if Intl not available, simple fallback
    return `جنيه ${Number(value).toFixed(2)}`;
  }
}
