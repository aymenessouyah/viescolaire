/* Fonctions pures de sélection et d'organisation des séances du cahier imprimé. */
(function (root) {
  'use strict';

  const CLASSES = ['3SI1', '4SI2'];
  const STATUSES = ['all', 'pending', 'done', 'reported', 'future'];

  function state(session, record, today) {
    const data = record || {};
    const currentDay = String(today || '');
    if (data.done === true && session.iso <= currentDay) return 'done';
    if (data.done === false) return 'reported';
    if (session.iso < currentDay) return 'pending';
    if (session.iso === currentDay) return 'today';
    return 'future';
  }

  function planNumber(entry, index) {
    const number = Number(entry && entry.num);
    return Number.isInteger(number) && number > 0 ? number : index + 1;
  }

  /* Les répartitions datées par classe sont la source d'autorité pour le trimestre
     (certaines séances de reprise du T1 ont lieu après les vacances d'hiver). */
  function withPlans(sessionsByClass, plansByClass) {
    const source = sessionsByClass || {};
    const plans = plansByClass || {};
    const result = {};

    CLASSES.forEach(function (className) {
      const sessions = Array.isArray(source[className]) ? source[className] : [];
      const plan = Array.isArray(plans[className]) ? plans[className] : [];
      const byNumber = new Map();
      plan.forEach(function (entry, index) {
        byNumber.set(planNumber(entry, index), entry);
      });
      const seen = new Set();

      result[className] = sessions.map(function (session) {
        const number = Number(session.n);
        const entry = byNumber.get(number);
        if (!entry) return Object.assign({}, session);
        seen.add(number);
        const block = Object.assign({}, session.blk || {});
        if (entry.t) block.t = entry.t;
        if (entry.det) block.det = entry.det;
        if (entry.k) block.k = entry.k;
        if (entry.d) block.d = entry.d;
        return Object.assign({}, session, {
          iso: entry.iso || session.iso,
          tri: Number(entry.tri) || Number(session.tri) || 0,
          blk: block,
          plan: entry
        });
      });

      plan.forEach(function (entry, index) {
        const number = planNumber(entry, index);
        if (seen.has(number)) return;
        result[className].push({
          cls: className,
          n: number,
          iso: entry.iso || '',
          tri: Number(entry.tri) || 0,
          blk: { t: entry.t || '', det: entry.det || '', k: entry.k || '', d: entry.d || '' },
          plan: entry
        });
      });

      result[className].sort(function (a, b) {
        return String(a.iso).localeCompare(String(b.iso)) ||
          (Number(a.tri) - Number(b.tri)) ||
          String(a.cls).localeCompare(String(b.cls)) ||
          (Number(a.n) - Number(b.n));
      });
    });

    return result;
  }

  function select(sessionsByClass, records, filters, today) {
    const options = filters || {};
    const classe = options.classe || 'both';
    const classes = classe === 'both' ? CLASSES : (CLASSES.includes(classe) ? [classe] : []);
    const trimester = Number(options.trimestre) || 0;
    const status = STATUSES.includes(options.statut) ? options.statut : 'all';
    const entries = records || {};
    const source = sessionsByClass || {};

    return classes.flatMap(function (className) {
      return source[className] || [];
    }).filter(function (session) {
      if (trimester && Number(session.tri) !== trimester) return false;
      if (status === 'all') return true;
      return state(session, entries[session.cls + '|' + session.n], today) === status;
    }).sort(function (a, b) {
      return a.iso.localeCompare(b.iso) ||
        (Number(a.tri) - Number(b.tri)) ||
        a.cls.localeCompare(b.cls) || a.n - b.n;
    });
  }

  /* Regroupe toutes les séances d'une même date pour n'ajouter qu'une signature
     quotidienne, y compris lorsque plusieurs classes ont cours le même jour. */
  function groupByDate(sessions) {
    const ordered = (sessions || []).slice().sort(function (a, b) {
      return String(a.iso).localeCompare(String(b.iso)) ||
        String(a.cls).localeCompare(String(b.cls)) ||
        (Number(a.n) - Number(b.n));
    });
    const days = [];
    ordered.forEach(function (session) {
      const iso = String(session.iso || '');
      let day = days[days.length - 1];
      if (!day || day.iso !== iso) {
        day = { iso: iso, items: [] };
        days.push(day);
      }
      day.items.push(session);
    });
    return days;
  }

  /* Ajoute un repère de clôture par trimestre antérieur lorsqu'un filtre
     (trimestre ou état) masque la séance qui doit précéder la répartition suivante. */
  function chronology(selectedSessions, sessionsByClass, filters) {
    const options = filters || {};
    const classe = options.classe || 'both';
    const classes = classe === 'both' ? CLASSES : (CLASSES.includes(classe) ? [classe] : []);
    const selected = (selectedSessions || []).map(function (session) {
      return Object.assign({}, session, { contextOnly: false });
    });
    const seen = new Set(selected.map(function (session) {
      return session.cls + '|' + session.n;
    }));
    const selectedQuarters = selected.map(function (session) { return Number(session.tri) || 0; });
    const highestQuarter = Math.max(Number(options.trimestre) || 0, 0, ...selectedQuarters);
    const source = sessionsByClass || {};

    for (let quarter = 1; quarter < highestQuarter; quarter++) {
      classes.forEach(function (className) {
        const laterSelected = selected.some(function (session) {
          return session.cls === className && Number(session.tri) > quarter;
        });
        if (!laterSelected) return;
        const previous = (source[className] || []).filter(function (session) {
          return Number(session.tri) === quarter;
        }).sort(function (a, b) {
          return a.iso.localeCompare(b.iso) || Number(a.n) - Number(b.n);
        });
        const last = previous[previous.length - 1];
        if (!last) return;
        const key = last.cls + '|' + last.n;
        if (seen.has(key)) return;
        seen.add(key);
        selected.push(Object.assign({}, last, {
          contextOnly: true,
          contextForTrimester: quarter + 1
        }));
      });
    }

    return selected.sort(function (a, b) {
      return String(a.iso).localeCompare(String(b.iso)) ||
        (Number(a.tri) - Number(b.tri)) ||
        (a.contextOnly === b.contextOnly ? 0 : (a.contextOnly ? -1 : 1)) ||
        String(a.cls).localeCompare(String(b.cls)) ||
        (Number(a.n) - Number(b.n));
    });
  }

  root.STI_CAHIER_PRINT_DATA = {
    state: state,
    withPlans: withPlans,
    select: select,
    groupByDate: groupByDate,
    chronology: chronology
  };
})(typeof window !== 'undefined' ? window : globalThis);
