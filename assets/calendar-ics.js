/* RFC 5545 iCalendar writer (Africa/Tunis local time, no external dependency). */
(function(root){
  'use strict';

  function validDate(value){
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('Date iCalendar invalide : ' + text);
    const [year,month,day] = text.split('-').map(Number);
    const check = new Date(Date.UTC(year,month-1,day));
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month-1 || check.getUTCDate() !== day)
      throw new Error('Date iCalendar invalide : ' + text);
    return text;
  }

  function compactDate(value){ return validDate(value).replace(/-/g,''); }
  function nextDate(value){
    const [year,month,day] = validDate(value).split('-').map(Number);
    return new Date(Date.UTC(year,month-1,day+1)).toISOString().slice(0,10);
  }
  function compactTime(value){
    const text = String(value || '');
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new Error('Heure iCalendar invalide : ' + text);
    return text.replace(':','') + '00';
  }
  function escapeText(value){
    return String(value == null ? '' : value).replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  }
  function utf8Length(value){
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(value).length;
    return unescape(encodeURIComponent(value)).length;
  }
  function foldLine(line){
    const parts = [];
    let current = '', bytes = 0;
    Array.from(String(line)).forEach(char => {
      const size = utf8Length(char);
      if (bytes + size > 75){ parts.push(current); current = ' ' + char; bytes = 1 + size; }
      else { current += char; bytes += size; }
    });
    parts.push(current);
    return parts.join('\r\n');
  }
  function stamp(value){
    const date = value instanceof Date ? value : value ? new Date(value) : new Date();
    if (!Number.isFinite(date.getTime())) throw new Error('Horodatage iCalendar invalide.');
    return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  }

  function buildCalendar(events, options){
    const settings = options || {};
    const calendarName = settings.name || 'Calendrier scolaire STI';
    const timestamp = stamp(settings.now);
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vie scolaire STI//Calendrier 1.0//FR',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:' + escapeText(calendarName),
      'X-WR-TIMEZONE:Africa/Tunis',
      'BEGIN:VTIMEZONE', 'TZID:Africa/Tunis', 'X-LIC-LOCATION:Africa/Tunis',
      'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0100',
      'TZNAME:CET', 'END:STANDARD', 'END:VTIMEZONE'
    ];

    (events || []).forEach((event,index) => {
      const uid = String(event.uid || ('event-' + index + '@viescolaire.local')).replace(/[\r\n]/g,'');
      const startDate = validDate(event.startDate || event.date);
      const endDate = validDate(event.endDate || event.startDate || event.date || startDate);
      lines.push('BEGIN:VEVENT', 'UID:' + escapeText(uid), 'DTSTAMP:' + timestamp);
      if (event.allDay || (!event.startTime && !event.endTime)){
        lines.push('DTSTART;VALUE=DATE:' + compactDate(startDate));
        lines.push('DTEND;VALUE=DATE:' + compactDate(nextDate(endDate)));
      } else {
        if (!event.startTime || !event.endTime) throw new Error('Début et fin doivent être fournis pour un événement horaire.');
        lines.push('DTSTART;TZID=Africa/Tunis:' + compactDate(startDate) + 'T' + compactTime(event.startTime));
        lines.push('DTEND;TZID=Africa/Tunis:' + compactDate(endDate) + 'T' + compactTime(event.endTime));
      }
      lines.push('SUMMARY:' + escapeText(event.summary || 'Événement scolaire'));
      if (event.description) lines.push('DESCRIPTION:' + escapeText(event.description));
      if (event.location) lines.push('LOCATION:' + escapeText(event.location));
      if (event.categories) lines.push('CATEGORIES:' + escapeText(Array.isArray(event.categories) ? event.categories.join(',') : event.categories));
      lines.push('STATUS:CONFIRMED', 'END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.map(foldLine).join('\r\n') + '\r\n';
  }

  const api = Object.freeze({ buildCalendar, escapeText, foldLine, compactDate, nextDate });
  root.STI_CALENDAR_ICS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
