/* Fonctions pures de sélection des séances à imprimer dans le cahier de textes. */
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
      return a.iso.localeCompare(b.iso) || a.cls.localeCompare(b.cls) || a.n - b.n;
    });
  }

  root.STI_CAHIER_PRINT_DATA = { state: state, select: select };
})(typeof window !== 'undefined' ? window : globalThis);
