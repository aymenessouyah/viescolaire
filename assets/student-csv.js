/* CSV utilities for a teacher's own class rosters and grade books. */
(function(root){
  'use strict';

  function normalizeHeader(value){
    return String(value || '').replace(/^\uFEFF/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function detectDelimiter(text){
    const source = String(text || '').replace(/^\uFEFF/, '');
    const counts = { ';':0, ',':0, '\t':0 };
    let quoted = false;
    for (let i=0; i<source.length; i++){
      const char = source[i];
      if (char === '"'){
        if (quoted && source[i+1] === '"'){ i++; continue; }
        quoted = !quoted;
      } else if (!quoted && (char === '\r' || char === '\n')) break;
      else if (!quoted && Object.prototype.hasOwnProperty.call(counts, char)) counts[char]++;
    }
    return Object.keys(counts).sort((a,b) => counts[b]-counts[a])[0] || ';';
  }

  function parseRows(text, delimiter){
    const source = String(text || '').replace(/^\uFEFF/, '');
    const separator = delimiter || detectDelimiter(source);
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i=0; i<source.length; i++){
      const char = source[i];
      if (quoted){
        if (char === '"' && source[i+1] === '"'){ field += '"'; i++; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"' && field.length === 0) quoted = true;
      else if (char === separator){ row.push(field); field = ''; }
      else if (char === '\r' || char === '\n'){
        if (char === '\r' && source[i+1] === '\n') i++;
        row.push(field); field = '';
        if (row.some(cell => cell.trim() !== '')) rows.push(row);
        row = [];
      } else field += char;
    }
    if (quoted) throw new Error('Le fichier CSV contient un guillemet non fermé.');
    row.push(field);
    if (row.some(cell => cell.trim() !== '')) rows.push(row);
    return rows;
  }

  function readTable(text){
    const rows = parseRows(text);
    if (!rows.length) throw new Error('Le fichier CSV est vide.');
    const headers = rows[0].map(normalizeHeader);
    if (headers.some(header => !header)) throw new Error('Chaque colonne doit avoir un en-tête.');
    if (new Set(headers).size !== headers.length) throw new Error('Le fichier contient des en-têtes en double.');
    return { headers, rows:rows.slice(1) };
  }

  function columnIndexes(headers, aliases){
    const indexes = {};
    Object.keys(aliases).forEach(key => {
      indexes[key] = headers.findIndex(header => aliases[key].includes(header));
    });
    return indexes;
  }

  function csvCell(value){
    const text = value == null ? '' : String(value);
    return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function encodeCsv(rows){
    return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
  }

  function exportRoster(students){
    const rows = [['id','nom','prenom','nom_ar','prenom_ar','groupe','pc']];
    (students || []).forEach(student => rows.push([
      student.id, student.nom, student.prenom, student.nomAr, student.prenomAr, student.groupe, student.pc
    ]));
    return encodeCsv(rows);
  }

  function normalizeName(value){
    return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  }

  const ROSTER_COLUMNS = {
    id:['id','ideleve','eleveid','identifiant'],
    nom:['nom','lastname','familyname','nomfamille'],
    prenom:['prenom','firstname','givenname'],
    nomAr:['nomar','nomarabe','arabiclastname'],
    prenomAr:['prenomar','prenomarabe','arabicfirstname'],
    groupe:['groupe','group','groupeno','groupenumber'],
    pc:['pc','numeropc','npc','posteenclasse']
  };

  function planRosterImport(text, students, groupCount){
    let table;
    try { table = readTable(text); }
    catch (error){ return { rows:[], errors:[error.message], adds:0, updates:0, total:0 }; }
    const columns = columnIndexes(table.headers, ROSTER_COLUMNS);
    if (columns.nom < 0) return { rows:[], errors:['Colonne obligatoire manquante : nom.'], adds:0, updates:0, total:table.rows.length };

    const existingStudents = Array.isArray(students) ? students : [];
    const maxGroup = Math.max(1, Number(groupCount) || 1);
    const namesSeen = new Set(), idsSeen = new Set(), planned = [], errors = [];
    table.rows.forEach((cells,index) => {
      const value = key => columns[key] < 0 ? '' : String(cells[columns[key]] || '').trim();
      const nom = value('nom'), prenom = value('prenom');
      if (!nom){ errors.push('Ligne ' + (index+2) + ' : nom manquant.'); return; }
      const rawGroup = value('groupe');
      const groupe = rawGroup ? Number(rawGroup) : 1;
      if (!Number.isInteger(groupe) || groupe < 1 || groupe > maxGroup){
        errors.push('Ligne ' + (index+2) + ' : groupe invalide (1 à ' + maxGroup + ').'); return;
      }
      const identity = normalizeName(nom) + '|' + normalizeName(prenom);
      if (namesSeen.has(identity)){ errors.push('Ligne ' + (index+2) + ' : doublon de nom dans le fichier.'); return; }
      namesSeen.add(identity);

      const importedId = value('id');
      if (importedId && idsSeen.has(importedId)){ errors.push('Ligne ' + (index+2) + ' : identifiant répété dans le fichier.'); return; }
      if (importedId) idsSeen.add(importedId);
      const matchesById = importedId ? existingStudents.filter(student => String(student.id) === importedId) : [];
      const matchesByName = existingStudents.filter(student => normalizeName(student.nom) === normalizeName(nom) && normalizeName(student.prenom) === normalizeName(prenom));
      let existing = matchesById[0] || null;
      if (!existing && matchesByName.length === 1) existing = matchesByName[0];
      else if (!existing && matchesByName.length > 1){ errors.push('Ligne ' + (index+2) + ' : plusieurs élèves portent ce nom ; ajoutez leur ID exporté.'); return; }

      const student = { nom };
      const optionalFields = ['prenom','nomAr','prenomAr','pc'];
      optionalFields.forEach(key => {
        if (columns[key] >= 0){
          const fieldValue=value(key);
          if (!existing || fieldValue) student[key]=fieldValue;
        } else if (!existing) student[key]='';
      });
      if (columns.groupe >= 0 && rawGroup) student.groupe=groupe;
      else if (!existing) student.groupe=1;
      planned.push({
        action:existing ? 'update' : 'add',
        matchId:existing ? existing.id : null,
        sourceRow:index+2,
        student
      });
    });
    return {
      rows:planned,
      errors,
      adds:planned.filter(row => row.action === 'add').length,
      updates:planned.filter(row => row.action === 'update').length,
      total:table.rows.length
    };
  }

  function exportGrades(exam, students, notesByStudent){
    const rows = [['id','nom','prenom','note','bareme','absent','effacer']];
    (students || []).forEach(student => {
      const note = (notesByStudent || {})[student.id] || {};
      rows.push([student.id, student.nom, student.prenom, note.abs ? '' : note.n, exam.bareme || 20, note.abs ? 1 : 0, '']);
    });
    return encodeCsv(rows);
  }

  const GRADE_COLUMNS = {
    id:['id','ideleve','eleveid','identifiant'],
    note:['note','score','resultat'],
    absent:['absent','absence'],
    clear:['effacer','supprimer','clear']
  };

  function parseFlag(value, label, line, errors){
    const normalized = normalizeName(value);
    if (!normalized || ['0','false','non','no'].includes(normalized)) return false;
    if (['1','true','oui','yes','x'].includes(normalized)) return true;
    errors.push('Ligne ' + line + ' : valeur « ' + label + ' » invalide. Utilisez 1 ou 0.');
    return false;
  }

  function planGradeImport(text, exam, students){
    let table;
    try { table = readTable(text); }
    catch (error){ return { rows:[], errors:[error.message], total:0 }; }
    const columns = columnIndexes(table.headers, GRADE_COLUMNS);
    if (columns.id < 0) return { rows:[], errors:['Colonne obligatoire manquante : id (exportez d’abord le modèle de notes).'], total:table.rows.length };
    if (columns.note < 0 && columns.absent < 0 && columns.clear < 0)
      return { rows:[], errors:['Aucune colonne note, absent ou effacer.'], total:table.rows.length };

    const roster = Array.isArray(students) ? students : [];
    const byId = new Map(roster.map(student => [String(student.id), student]));
    const seen = new Set(), planned = [], errors = [];
    const bareme = Number(exam && exam.bareme) || 20;
    table.rows.forEach((cells,index) => {
      const line = index+2;
      const value = key => columns[key] < 0 ? '' : String(cells[columns[key]] || '').trim();
      const id = value('id');
      if (!id){ errors.push('Ligne ' + line + ' : ID élève manquant.'); return; }
      if (seen.has(id)){ errors.push('Ligne ' + line + ' : ID élève répété.'); return; }
      seen.add(id);
      const student = byId.get(id);
      if (!student){ errors.push('Ligne ' + line + ' : ID « ' + id + ' » absent de cette classe.'); return; }
      const noteText = value('note');
      const absent = parseFlag(value('absent'), 'absent', line, errors);
      const clear = parseFlag(value('clear'), 'effacer', line, errors);
      if (absent && (noteText || clear)){ errors.push('Ligne ' + line + ' : une note ne peut pas être à la fois saisie, absente et effacée.'); return; }
      if (clear && noteText){ errors.push('Ligne ' + line + ' : effacer et note sont incompatibles.'); return; }
      if (absent){ planned.push({ action:'absent', id, student }); return; }
      if (clear){ planned.push({ action:'clear', id, student }); return; }
      if (!noteText) return;
      const note = Number(noteText.replace(',', '.'));
      if (!Number.isFinite(note) || note < 0 || note > bareme){
        errors.push('Ligne ' + line + ' : note invalide (de 0 à ' + bareme + ').'); return;
      }
      planned.push({ action:'note', id, student, note });
    });
    return { rows:planned, errors, total:table.rows.length };
  }

  const api = Object.freeze({
    parseRows, readTable, exportRoster, planRosterImport, exportGrades, planGradeImport, normalizeHeader
  });
  root.STI_STUDENT_CSV = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
