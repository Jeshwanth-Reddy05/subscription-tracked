/**
 * Advances a subscription renewal date forward to the next cycle if it has already passed.
 *
 * @param {Date|string} renewalDate - The current renewal date
 * @param {string} billingCycle - "monthly" or "yearly"
 * @param {Date} [referenceDate=new Date()] - Reference date (defaults to today)
 * @returns {Date} The next upcoming renewal date
 */
export const rollRenewalDateForward = (
  renewalDate,
  billingCycle,
  referenceDate = new Date(),
) => {
  if (!renewalDate) return renewalDate;

  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const current = new Date(renewalDate);
  if (isNaN(current.getTime())) return renewalDate;

  // Compare without hours/minutes
  const normalizedCurrent = new Date(current);
  normalizedCurrent.setHours(0, 0, 0, 0);

  if (normalizedCurrent >= ref) {
    return current;
  }

  const next = new Date(current);
  while (next < ref) {
    if (billingCycle === "yearly") {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
};
