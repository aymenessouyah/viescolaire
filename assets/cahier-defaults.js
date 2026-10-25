/* Defaults for the digital class register, derived from dated scheduled sessions. */
(function(root){
  'use strict';

  const VALID_STATUSES = ['pending', 'all', 'done', 'reported'];
  const VALID_CLASSES = ['both', '3SI1', '4SI2'];
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function asISODate(value){
    let text = '';
    if (value instanceof Date && Number.isFinite(value.getTime())){
      text = value.getFullYear() + '-' + String(value.getMonth()+1).padStart(2,'0') + '-' + String(value.getDate()).padStart(2,'0');
    } else if (typeof value === 'string') {
      text = value.slice(0,10);
    }
    if (!ISO_DATE.test(text)) return null;
    const parts = text.split('-').map(Number);
    const check = new Date(Date.UTC(parts[0], parts[1]-1, parts[2]));
    return check.getUTCFullYear() === parts[0] && check.getUTCMonth() === parts[1]-1 && check.getUTCDate() === parts[2] ? text : null;
  }

  function dayNumber(iso){
    const parts = iso.split('-').map(Number);
    return Date.UTC(parts[0], parts[1]-1, parts[2]) / 86400000;
  }

  function currentTrimester(sessionsByClass, date, plansByClass){
    const target = asISODate(date) || asISODate(new Date());
    const sessions = sessionsByClass || {};
    const plans = plansByClass || {};
    const classNames = new Set(Object.keys(sessions).concat(Object.keys(plans)));
    const periodsByTrimester = new Map();

    classNames.forEach(cls => {
      /* The dated annual allocations are authoritative where available; generated
         sessions are the fallback for classes without a dated allocation. */
      const plan = plans[cls];
      const rows = Array.isArray(plan) && plan.length ? plan : sessions[cls];
      if (!Array.isArray(rows)) return;
      rows.forEach(session => {
        const trimester = Number(session && session.tri);
        const iso = asISODate(session && session.iso);
        if (!iso || !Number.isInteger(trimester) || trimester < 1 || trimester > 3) return;
        const period = periodsByTrimester.get(trimester) || { trimester, start: iso, end: iso };
        if (iso < period.start) period.start = iso;
        if (iso > period.end) period.end = iso;
        periodsByTrimester.set(trimester, period);
      });
    });

    const periods = Array.from(periodsByTrimester.values()).sort((a,b) => a.start.localeCompare(b.start) || a.trimester-b.trimester);
    if (!periods.length) return 1;

    const active = periods.filter(period => period.start <= target && target <= period.end);
    if (active.length){
      active.sort((a,b) => b.start.localeCompare(a.start) || a.end.localeCompare(b.end) || a.trimester-b.trimester);
      return active[0].trimester;
    }

    const previous = periods.filter(period => period.end < target)
      .sort((a,b) => b.end.localeCompare(a.end) || b.trimester-a.trimester)[0];
    const upcoming = periods.filter(period => period.start > target)
      .sort((a,b) => a.start.localeCompare(b.start) || a.trimester-b.trimester)[0];
    if (!previous) return upcoming ? upcoming.trimester : periods[0].trimester;
    if (!upcoming) return previous.trimester;

    const daysSincePrevious = dayNumber(target) - dayNumber(previous.end);
    const daysUntilUpcoming = dayNumber(upcoming.start) - dayNumber(target);
    return daysSincePrevious < daysUntilUpcoming ? previous.trimester : upcoming.trimester;
  }

  function initialFilters(sessionsByClass, date, plansByClass){
    return { tri: currentTrimester(sessionsByClass, date, plansByClass), status: 'done' };
  }

  function filtersForOpen(sessionsByClass, date, status, cls, plansByClass){
    const defaults = initialFilters(sessionsByClass, date, plansByClass);
    return {
      tri: defaults.tri,
      status: VALID_STATUSES.includes(status) ? status : defaults.status,
      cls: VALID_CLASSES.includes(cls) ? cls : 'both'
    };
  }

  const api = Object.freeze({ currentTrimester, initialFilters, filtersForOpen });
  root.STI_CAHIER_DEFAULTS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
