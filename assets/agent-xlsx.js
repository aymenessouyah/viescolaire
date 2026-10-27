/* Export XLSX autonome : chaînes toujours sérialisées en texte, jamais en formules. */
(function (root) {
'use strict';
const WARNING = 'Proposition à vérifier : aucune conformité au programme officiel n’a été vérifiée automatiquement.';
const list = value => Array.isArray(value) ? value : [];
const text = value => String(value ?? '');
function rowsFor(task, result, meta = {}, review = null) {
  const r = result || {};
  const rows = [['Document', r.titre || task], ['Classe', meta.classe || ''], ['Statut', WARNING]];
  list(meta.sources).forEach(source => rows.push(['Extrait transmis', [source.titre, source.provenance, source.date_edition, source.page_ou_section].filter(Boolean).join(' — ')]));
  if (task === 'repartition') {
    rows.push(['N°', 'Date', 'Trimestre', 'Titre', 'Domaine', 'Type', 'Objectif', 'Travail maison']);
    list(r.seances).forEach(s => {
      const original = list(meta.seances).find(item => Number(item.numero) === Number(s.numero ?? s.n) && item.date === s.date);
      rows.push([s.numero ?? s.n ?? '', s.date || '', s.trimestre ?? original?.trimestre ?? meta.trimestre ?? '', s.titre || '', s.domaine || '', s.type || '', s.objectif || '', s.travail_maison || '']);
    });
    list(r.avertissements).forEach(a => rows.push(['Point à vérifier', a]));
  } else if (task === 'exercices') {
    rows.push(['Exercice', 'Points exercice', 'Énoncé', 'Question', 'Barème question', 'Corrigé']);
    list(r.exercices).forEach((exercise, index) => {
      const questions = list(exercise.questions);
      if (!questions.length) rows.push([exercise.titre || `Exercice ${index + 1}`, exercise.points || '', exercise.enonce || '', '', '', exercise.correction || '']);
      questions.forEach(q => rows.push([exercise.titre || `Exercice ${index + 1}`, exercise.points || '', exercise.enonce || '', typeof q === 'object' ? q.enonce || q.question || '' : q, typeof q === 'object' ? q.bareme || '' : '', exercise.correction || '']));
    });
  } else if (task === 'correction') {
    const confirmed = review?.confirmed === true;
    rows.push(['Copie', meta.identifiant || 'Copie anonyme'], ['Note proposée par l’agent', r.note ?? '', 'Sur', r.sur ?? '']);
    rows.push(['Statut de la note', confirmed ? 'Validée par l’enseignant — non saisie dans le registre' : 'Proposition non validée — non saisie dans le registre']);
    if (confirmed) rows.push(['Note validée par l’enseignant', review.total, 'Sur', r.sur]);
    rows.push(['Question', 'Points proposés', 'Maximum', 'Justification de l’agent', 'Points validés', 'Justification de l’enseignant']);
    list(r.questions).forEach((q, i) => rows.push([q.question || q.numero || '', q.points_attribues ?? '', q.points_max ?? '', q.justification || '', confirmed ? review.points[i] : '', confirmed ? review.reasons[i] : '']));
    list(r.limites_analyse).forEach(l => rows.push(['Limite de l’analyse', l]));
    list(r.transcription_incertaine).forEach(l => rows.push(['Passage à relire', typeof l === 'object' ? JSON.stringify(l) : l]));
  } else if (task === 'fiche') {
    rows.push(['Rubrique', 'Contenu', 'Durée', 'Activité enseignant', 'Activité élève', 'Trace']);
    list(r.objectifs).forEach(x => rows.push(['Objectif', x]));
    list(r.prerequis).forEach(x => rows.push(['Prérequis', x]));
    list(r.deroulement).forEach(p => rows.push(['Phase', p.phase || '', p.duree || '', p.activite_enseignant || p.enseignant || '', p.activite_eleve || p.eleves || '', p.trace || '']));
    list(r.notions).forEach(x => rows.push(['Notion', x]));
    list(r.competences).forEach(x => rows.push(['Compétence', x]));
    rows.push(['Évaluation', r.evaluation || ''], ['Remédiation', r.remediation || ''], ['Travail maison', r.travail_maison || '']);
  } else throw new Error('L’export Excel n’est pas proposé pour ce type de document.');
  return rows;
}
function xml(value) {
  return text(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}
function column(index) {
  let n = index + 1, out = '';
  while (n > 0) { n--; out = String.fromCharCode(65 + n % 26) + out; n = Math.floor(n / 26); }
  return out;
}
function sheetXml(rows) {
  const body = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, i) => {
    const ref = `${column(i)}${rowIndex + 1}`;
    if (text(value).length > 32767) throw new Error('Une cellule dépasse la limite Excel de 32 767 caractères. Utilisez plutôt l’export HTML ou PDF.');
    if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"><v>${value}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
  }).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="24" customWidth="1"/><col min="2" max="8" width="32" customWidth="1"/></cols><sheetData>${body}</sheetData></worksheet>`;
}
const encoder = new TextEncoder();
const bytes = str => encoder.encode(str);
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let bit = 0; bit < 8; bit++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); table[i] = c >>> 0; }
  return table;
})();
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function u16(out, n) { out.push(n & 255, (n >>> 8) & 255); }
function u32(out, n) { u16(out, n & 65535); u16(out, (n >>> 16) & 65535); }
function zip(files) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, content] of files) {
    const filename = bytes(name), data = bytes(content), crc = crc32(data), local = [];
    u32(local, 0x04034b50); u16(local, 20); u16(local, 0x0800); u16(local, 0); u16(local, 0); u16(local, 0x0021);
    u32(local, crc); u32(local, data.length); u32(local, data.length); u16(local, filename.length); u16(local, 0);
    const header = new Uint8Array(local);
    parts.push(header, filename, data);
    const entry = [];
    u32(entry, 0x02014b50); u16(entry, 20); u16(entry, 20); u16(entry, 0x0800); u16(entry, 0); u16(entry, 0); u16(entry, 0x0021);
    u32(entry, crc); u32(entry, data.length); u32(entry, data.length); u16(entry, filename.length); u16(entry, 0); u16(entry, 0); u16(entry, 0); u16(entry, 0); u32(entry, 0); u32(entry, offset);
    central.push(new Uint8Array(entry), filename);
    offset += header.length + filename.length + data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0), end = [];
  u32(end, 0x06054b50); u16(end, 0); u16(end, 0); u16(end, files.length); u16(end, files.length); u32(end, centralSize); u32(end, offset); u16(end, 0);
  parts.push(...central, new Uint8Array(end));
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let position = 0; parts.forEach(part => { output.set(part, position); position += part.length; });
  return output;
}
function buildWorkbook(rows) {
  const files = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Document STI" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
    ['xl/worksheets/sheet1.xml', sheetXml(rows)]
  ];
  return zip(files);
}
function download(task, result, meta, review) {
  const file = buildWorkbook(rowsFor(task, result, meta, review));
  const url = URL.createObjectURL(new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url; link.download = `${task}-${meta.classe || 'STI'}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
root.STI_AGENT_XLSX = { rowsFor, buildWorkbook, download };
})(typeof window !== 'undefined' ? window : globalThis);
