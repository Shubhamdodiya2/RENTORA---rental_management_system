/**
 * Date Utility Functions for Rentora Booking & Rental Workflows
 */

export const formatDateYYYYMMDD = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDateYYYYMMDD(d);
};

export const isDateInPast = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return true;
  const todayStr = getTodayStr(0);
  return dateStr < todayStr;
};

export const calculateDaysBetween = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 1;
  const s = new Date(`${startDateStr}T00:00:00`);
  const e = new Date(`${endDateStr}T00:00:00`);
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};
