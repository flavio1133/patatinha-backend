/**
 * Períodos financeiros fechados: movimentações em meses fechados não podem ser editadas nem excluídas.
 */

const closedPeriods = []; // { month: 1-12, year: 2024 }

function isPeriodClosed(month, year) {
  return closedPeriods.some(p => p.month === month && p.year === year);
}

function isDateInClosedPeriod(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return isPeriodClosed(month, year);
}

function closePeriod(month, year) {
  if (isPeriodClosed(month, year)) return false;
  closedPeriods.push({ month, year });
  return true;
}

function getClosedPeriods() {
  return [...closedPeriods].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
}

module.exports = {
  isPeriodClosed,
  isDateInClosedPeriod,
  closePeriod,
  getClosedPeriods,
  closedPeriods,
};
