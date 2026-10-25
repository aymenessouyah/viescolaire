const test = require('node:test');
const assert = require('node:assert/strict');
const ics = require('../assets/calendar-ics.js');

const timestamp = new Date('2026-10-25T10:20:30.000Z');

test('l’export iCalendar produit des événements horodatés pour le fuseau tunisien', () => {
  const text = ics.buildCalendar([{
    uid:'lesson-3si1-1@viescolaire.local',
    startDate:'2026-10-27', endDate:'2026-10-27', startTime:'08:00', endTime:'12:00',
    summary:'3SI1 — Séance n°1 : HTML5', description:'Groupe 1, puis Groupe 2'
  }], { name:'Calendrier STI', now:timestamp });
  assert.match(text, /BEGIN:VCALENDAR\r\n/);
  assert.match(text, /TZID:Africa\/Tunis/);
  assert.match(text, /DTSTAMP:20261025T102030Z/);
  assert.match(text, /DTSTART;TZID=Africa\/Tunis:20261027T080000/);
  assert.match(text, /DTEND;TZID=Africa\/Tunis:20261027T120000/);
  assert.match(text, /SUMMARY:3SI1 — Séance n°1 : HTML5/);
  assert.match(text, /END:VCALENDAR\r\n$/);
});

test('les événements d’une journée entière ont une date de fin exclusive', () => {
  const text = ics.buildCalendar([{
    uid:'deadline@viescolaire.local', date:'2027-01-02', allDay:true,
    summary:'Saisie des notes; T1'
  }], { now:timestamp });
  assert.match(text, /DTSTART;VALUE=DATE:20270102/);
  assert.match(text, /DTEND;VALUE=DATE:20270103/);
  assert.match(text, /SUMMARY:Saisie des notes\\; T1/);
});

test('les virgules, antislashs et retours à la ligne sont échappés et les lignes UTF-8 sont pliées', () => {
  const value = 'Évaluation, chapitre 1; rappel\\nImportant '.repeat(8);
  const text = ics.buildCalendar([{ date:'2027-02-10', summary:value, allDay:true }], { now:timestamp });
  assert.match(text, /Évaluation\\, chapitre 1\\; rappel\\\\nImportant/);
  for (const line of text.split('\r\n')) {
    if (line) assert.ok(Buffer.byteLength(line, 'utf8') <= 75, `ligne iCalendar trop longue (${Buffer.byteLength(line, 'utf8')} octets)`);
  }
});

test('rejette les dates et horaires invalides au lieu de produire un calendrier mal formé', () => {
  assert.throws(() => ics.buildCalendar([{ date:'2027-02-31', summary:'Erreur', allDay:true }]), /Date iCalendar invalide/);
  assert.throws(() => ics.buildCalendar([{ date:'2027-02-10T00:00:00', summary:'Erreur', allDay:true }]), /Date iCalendar invalide/);
  assert.throws(() => ics.buildCalendar([{ date:'2027-02-10', startTime:'25:00', endTime:'26:00' }]), /Heure iCalendar invalide/);
});
