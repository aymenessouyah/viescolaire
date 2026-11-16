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
    const rows = [['id','nom','prenom','nom_ar','prenom_ar','groupe','pc','action']];
    (students || []).forEach(student => rows.push([
      student.id, student.nom, student.prenom, student.nomAr, student.prenomAr, student.groupe, student.pc, ''
    ]));
    return encodeCsv(rows);
  }

  function normalizeName(value){
    return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
  }

  /* ---------- nettoyage et contrôle des noms ----------
     Les fichiers réels du lycée contiennent des minuscules, des espaces
     surnuméraires et des espaces finales (« ben ahmed », « Ezzine »). On ne
     renomme jamais d'office : on propose une graphie et on signale l'écart. */

  const PARTICULES = ['ben', 'bin', 'el', 'al', 'bou', 'bel', 'abou', 'ould', 'mohamed'];

  function nomPropre(value){
    return String(value || '')
      .normalize('NFC')
      .replace(/[\u0640\u200b\u200c\u200d\ufeff]/g, '')  // tatweel et caractères invisibles
      .replace(/\s+/g, ' ')
      .trim();
  }

  function majusculesNom(value){
    return nomPropre(value).split(' ').map(function(mot, index){
      const bas = mot.toLowerCase();
      if (index > 0 && PARTICULES.indexOf(bas) >= 0) return bas;
      return bas.charAt(0).toUpperCase() + bas.slice(1);
    }).join(' ');
  }

  /* Retourne la liste des retouches à faire valider, sans les appliquer. */
  function controlerNom(nom, prenom){
    const n = nomPropre(nom), p = nomPropre(prenom);
    const attenduN = majusculesNom(n), attenduP = majusculesNom(p);
    const raisons = [];
    if (String(nom || '') !== n) raisons.push('espace surnuméraire');
    if (String(prenom || '') !== p) raisons.push('espace surnuméraire');
    if (n !== attenduN) raisons.push('majuscules');
    if (p !== attenduP) raisons.push('majuscules');
    return {
      avant: { nom: String(nom || ''), prenom: String(prenom || '') },
      apres: { nom: attenduN, prenom: attenduP },
      raisons: Array.from(new Set(raisons)),
      aCorriger: raisons.length > 0
    };
  }

  const ROSTER_COLUMNS = {
    id:['id','ideleve','eleveid','identifiant'],
    nom:['nom','lastname','familyname','nomfamille'],
    prenom:['prenom','firstname','givenname'],
    nomAr:['nomar','nomarabe','arabiclastname'],
    prenomAr:['prenomar','prenomarabe','arabicfirstname'],
    groupe:['groupe','group','groupeno','groupenumber'],
    pc:['pc','numeropc','npc','posteenclasse'],
    action:['action','operation','commande','traitement']
  };

  function planRosterImport(text, students, groupCount){
    let table;
    try { table = readTable(text); }
    catch (error){ return { rows:[], errors:[error.message], adds:0, updates:0, deletes:0, total:0 }; }
    const columns = columnIndexes(table.headers, ROSTER_COLUMNS);
    if (columns.nom < 0 && columns.action < 0)
      return { rows:[], errors:['Colonne obligatoire manquante : nom.'], adds:0, updates:0, deletes:0, total:table.rows.length };

    const existingStudents = Array.isArray(students) ? students : [];
    const maxGroup = Math.max(1, Number(groupCount) || 1);
    const namesSeen = new Set(), idsSeen = new Set(), planned = [], errors = [];
    const deleteActions = new Set(['delete','remove','supprimer','supprime','retirer','retrait']);
    table.rows.forEach((cells,index) => {
      const value = key => columns[key] < 0 ? '' : String(cells[columns[key]] || '').trim();
      const line = index+2;
      const importedId = value('id');
      const requestedAction = normalizeName(value('action'));
      if (requestedAction && !deleteActions.has(requestedAction)){
        errors.push('Ligne ' + line + ' : action inconnue. Pour retirer un élève, utilisez « supprimer ».'); return;
      }
      if (requestedAction){
        if (!importedId){ errors.push('Ligne ' + line + ' : ID obligatoire pour supprimer un élève.'); return; }
        if (idsSeen.has(importedId)){ errors.push('Ligne ' + line + ' : identifiant répété dans le fichier.'); return; }
        idsSeen.add(importedId);
        const existing = existingStudents.find(student => String(student.id) === importedId);
        if (!existing){ errors.push('Ligne ' + line + ' : ID « ' + importedId + ' » absent de cette classe; suppression refusée.'); return; }
        planned.push({ action:'delete', matchId:existing.id, sourceRow:line, student:existing });
        return;
      }

      if (columns.nom < 0){ errors.push('Ligne ' + line + ' : colonne nom manquante pour ajouter ou modifier un élève.'); return; }
      const nom = value('nom'), prenom = value('prenom');
      if (!nom){ errors.push('Ligne ' + line + ' : nom manquant.'); return; }
      const rawGroup = value('groupe');
      const groupe = rawGroup ? Number(rawGroup) : 1;
      if (!Number.isInteger(groupe) || groupe < 1 || groupe > maxGroup){
        errors.push('Ligne ' + line + ' : groupe invalide (1 à ' + maxGroup + ').'); return;
      }
      const identity = normalizeName(nom) + '|' + normalizeName(prenom);
      if (namesSeen.has(identity)){ errors.push('Ligne ' + line + ' : doublon de nom dans le fichier.'); return; }
      namesSeen.add(identity);

      if (importedId && idsSeen.has(importedId)){ errors.push('Ligne ' + line + ' : identifiant répété dans le fichier.'); return; }
      if (importedId) idsSeen.add(importedId);
      const matchesById = importedId ? existingStudents.filter(student => String(student.id) === importedId) : [];
      const matchesByName = existingStudents.filter(student => normalizeName(student.nom) === normalizeName(nom) && normalizeName(student.prenom) === normalizeName(prenom));
      let existing = matchesById[0] || null;
      if (!existing && matchesByName.length === 1) existing = matchesByName[0];
      else if (!existing && matchesByName.length > 1){ errors.push('Ligne ' + line + ' : plusieurs élèves portent ce nom ; ajoutez leur ID exporté.'); return; }

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
        sourceRow:line,
        student
      });
    });
    return {
      rows:planned,
      errors,
      adds:planned.filter(row => row.action === 'add').length,
      updates:planned.filter(row => row.action === 'update').length,
      deletes:planned.filter(row => row.action === 'delete').length,
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

  /* ---------- import « une colonne par épreuve » ----------
     Les fichiers réels du lycée (classeur Excel exporté en CSV) portent
     dc1, dc2, ds1… ABS et * signifient « absent ». Une colonne reconnue
     devient une épreuve, créée à la volée si necessary. */

  const COLONNES_EPREUVE = /^(dc|ds)\s*([0-9]{1,2})$/;
  const VALEURS_ABSENCE = new Set(['abs', 'absent', 'absente', 'absence', 'nonjustifie', 'nonjustifiee']);

  function colonnesEpreuves(headers){
    const trouvees = [];
    headers.forEach(function(header, index){
      const m = COLONNES_EPREUVE.exec(header);
      if (m) trouvees.push({ index, cle: m[1] + m[2], type: m[1].toUpperCase(), num: Number(m[2]) });
    });
    return trouvees;
  }

  /* « * » est l'astérisque utilisé dans les relevés du lycée pour marquer
     une absence, exactement comme « ABS ». */
  function valeurAbsente(texte){
    const brut = String(texte == null ? '' : texte).trim();
    if (brut === '*') return true;
    return VALEURS_ABSENCE.has(normalizeName(brut));
  }

  function analyserColonnesEpreuves(text, students){
    let table;
    try { table = readTable(text); }
    catch (error){ return { epreuves:[], lignes:[], errors:[error.message], total:0 }; }

    const colonnes = colonnesEpreuves(table.headers);
    if (!colonnes.length)
      return { epreuves:[], lignes:[], errors:['Aucune colonne d’épreuve (dc1, dc2, ds1…).'], total:table.rows.length };

    const colonnesIdent = columnIndexes(table.headers, ROSTER_COLUMNS);
    const roster = Array.isArray(students) ? students : [];
    const parId = new Map(roster.map(function(e){ return [String(e.id), e]; }));
    const parNom = new Map();
    roster.forEach(function(e){
      const k = normalizeName(e.nom) + '|' + normalizeName(e.prenom);
      parNom.set(k, parNom.has(k) ? null : e);   // null = homonyme, ambigu
    });

    const lignes = [], errors = [];
    table.rows.forEach(function(cells, index){
      const ligne = index + 2;
      const identifiant = colonnesIdent.id >= 0 ? String(cells[colonnesIdent.id] || '').trim() : '';
      const nom = colonnesIdent.nom >= 0 ? String(cells[colonnesIdent.nom] || '').trim() : '';
      const prenom = colonnesIdent.prenom >= 0 ? String(cells[colonnesIdent.prenom] || '').trim() : '';
      let eleve = identifiant ? parId.get(identifiant) : null;
      if (!eleve && nom){
        const k = normalizeName(nom) + '|' + normalizeName(prenom);
        const candidat = parNom.get(k);
        if (candidat === null){ errors.push('Ligne ' + ligne + ' : plusieurs élèves portent « ' + nom + ' ' + prenom + ' » ; ajoutez leur ID.'); return; }
        eleve = candidat || null;
      }
      if (!eleve){ errors.push('Ligne ' + ligne + ' : élève introuvable dans cette classe (' + (nom || identifiant || 'sans nom') + ').'); return; }

      const cellules = {};
      colonnes.forEach(function(col){
        const brut = String(cells[col.index] == null ? '' : cells[col.index]).trim();
        cellules[col.cle] = valeurAbsente(brut) ? 'ABS' : brut;
      });
      lignes.push({ eleve, cellules, ligne });
    });

    const epreuves = colonnes.map(function(col){
      return { cle: col.cle, type: col.type, numero: col.num, titre: (col.type === 'DC' ? 'Devoir de contrôle n°' : 'Devoir de synthèse n°') + col.num };
    });
    return { epreuves, lignes, errors, total: table.rows.length };
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
    parseRows, readTable, exportRoster, planRosterImport, exportGrades, planGradeImport, normalizeHeader,
    nomPropre, majusculesNom, controlerNom, analyserColonnesEpreuves, colonnesEpreuves
  });
  root.STI_STUDENT_CSV = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
