const reportCache = [];
const reportSchedules = [];
const reportExports = [];

function getCacheKey(companyId, reportType, startDate, endDate) {
  return `${companyId || 'all'}_${reportType}_${startDate}_${endDate}`;
}

function findCached(companyId, reportType, startDate, endDate) {
  const key = getCacheKey(companyId, reportType, startDate, endDate);
  const now = new Date();
  const cached = reportCache.find(
    (c) => c.key === key && c.report_type === reportType && (!c.expires_at || new Date(c.expires_at) > now)
  );
  return cached ? cached.data : null;
}

function setCache(companyId, reportType, startDate, endDate, data, ttlHours) {
  const ttl = ttlHours || 24;
  const key = getCacheKey(companyId, reportType, startDate, endDate);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttl);
  const existing = reportCache.findIndex((c) => c.key === key && c.report_type === reportType);
  const record = {
    key,
    company_id: companyId,
    report_type: reportType,
    period_start: startDate,
    period_end: endDate,
    data,
    generated_at: new Date(),
    expires_at: expiresAt,
  };
  if (existing >= 0) reportCache[existing] = record;
  else reportCache.push(record);
}

module.exports = { reportCache, reportSchedules, reportExports, findCached, setCache };
