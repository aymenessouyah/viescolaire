/* Lecture d'un classeur .xlsx sans bibliothèque externe.
   Un .xlsx est une archive ZIP contenant du XML. On lit l'annuaire central,
   on décompresse chaque partie utile (méthode « deflate » brute via
   DecompressionStream) puis on reconstruit les feuilles en tableaux.

   Exposé : window.STI_XLSX.lireFeuille(tableau d'octets) -> { feuilles:[{nom, lignes}] }
   Les valeurs sont toujours rendues en texte : aucune formule n'est évaluée. */
(function (root) {
'use strict';

/* ---------- lecture du ZIP ---------- */

function u16at(vue, p) { return vue.getUint16(p, true); }
function u32at(vue, p) { return vue.getUint32(p, true); }

function trouverAnnuaire(vue) {
  // signature de fin d'annuaire central : 0x06054b50, cherchée depuis la fin
  const fin = vue.byteLength;
  for (let p = fin - 22; p >= 0 && p > fin - 66000; p--) {
    if (u32at(vue, p) === 0x06054b50) return p;
  }
  throw new Error("Ce fichier n’est pas un classeur Excel (.xlsx) valide.");
}

function entrees(vue) {
  const eocd = trouverAnnuaire(vue);
  const total = u16at(vue, eocd + 10);
  let p = u32at(vue, eocd + 16);
  const decodeur = new TextDecoder('utf-8');
  const liste = [];
  for (let i = 0; i < total; i++) {
    if (u32at(vue, p) !== 0x02014b50) break;
    const methode = u16at(vue, p + 10);
    const tailleCompressee = u32at(vue, p + 20);
    const nomLongueur = u16at(vue, p + 28);
    const extraLongueur = u16at(vue, p + 30);
    const commLongueur = u16at(vue, p + 32);
    const offsetLocal = u32at(vue, p + 42);
    const nom = decodeur.decode(new Uint8Array(vue.buffer, vue.byteOffset + p + 46, nomLongueur));
    liste.push({ nom, methode, tailleCompressee, offsetLocal });
    p += 46 + nomLongueur + extraLongueur + commLongueur;
  }
  return liste;
}

/* ---------- décompression « deflate » brute ----------
   Écrite ici pour ne dépendre d'aucune API récente du navigateur :
   DecompressionStream manque encore sur plusieurs navigateurs de lycée. */

function longueursBase() {
  const t = new Uint16Array(29);
  const v = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  for (let i = 0; i < v.length; i++) t[i] = v[i];
  return t;
}
function longueursExtra() {
  const t = new Uint8Array(29);
  const v = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  for (let i = 0; i < v.length; i++) t[i] = v[i];
  return t;
}
function distancesBase() {
  const t = new Uint16Array(30);
  const v = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  for (let i = 0; i < v.length; i++) t[i] = v[i];
  return t;
}
function distancesExtra() {
  const t = new Uint8Array(30);
  const v = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  for (let i = 0; i < v.length; i++) t[i] = v[i];
  return t;
}

const ORDRE_CODES_LONGUEUR = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

/* Construit les tables de Huffman (une seule lecture par bit n'est pas
   nécessaire : on décodage bit à bit, largement assez rapide pour un relevé). */
function construireTable(longueurs) {
  const compte = new Uint16Array(16);
  const symbole = new Uint16Array(longueurs.length);
  for (let i = 0; i < longueurs.length; i++) compte[longueurs[i]]++;
  compte[0] = 0;
  const decalage = new Uint16Array(16);
  for (let i = 1; i < 16; i++) decalage[i] = decalage[i-1] + compte[i-1];
  for (let i = 0; i < longueurs.length; i++) if (longueurs[i]) symbole[decalage[longueurs[i]]++] = i;
  return { compte, symbole };
}

function inflate(source) {
  const LEN_BASE = longueursBase(), LEN_EXTRA = longueursExtra();
  const DIST_BASE = distancesBase(), DIST_EXTRA = distancesExtra();

  let pos = 0, bitBuf = 0, bitCnt = 0;
  const sortie = [];
  let octets = [];

  function bit() {
    if (bitCnt === 0) { if (pos >= source.length) throw new Error("Archive Excel tronquée."); bitBuf = source[pos++]; bitCnt = 8; }
    const b = bitBuf & 1; bitBuf >>= 1; bitCnt--; return b;
  }
  function bits(n) { let v = 0; for (let i = 0; i < n; i++) v |= bit() << i; return v; }
  function decoder(table) {
    let code = 0, premier = 0, index = 0;
    for (let longueur = 1; longueur < 16; longueur++) {
      code |= bit();
      const compte = table.compte[longueur];
      if (code - premier < compte) return table.symbole[index + (code - premier)];
      index += compte; premier = (premier + compte) << 1; code <<= 1;
    }
    throw new Error("Données Excel compressées illisibles.");
  }

  let fixeLong = null, fixeDist = null;
  function tablesFixes() {
    if (fixeLong) return [fixeLong, fixeDist];
    const l = new Uint8Array(288);
    for (let i = 0; i < 144; i++) l[i] = 8;
    for (let i = 144; i < 256; i++) l[i] = 9;
    for (let i = 256; i < 280; i++) l[i] = 7;
    for (let i = 280; i < 288; i++) l[i] = 8;
    fixeLong = construireTable(l);
    fixeDist = construireTable(new Uint8Array(30).fill(5));
    return [fixeLong, fixeDist];
  }

  let dernier = 0;
  while (!dernier) {
    dernier = bit();
    const type = bits(2);
    if (type === 0) {
      // bloc non compressé : on réaligne sur l'octet
      bitCnt = 0;
      const longueur = source[pos] | (source[pos+1] << 8); pos += 2;
      pos += 2; // contrôle de complément
      for (let i = 0; i < longueur; i++) octets.push(source[pos++]);
    } else if (type === 1 || type === 2) {
      let tableLong, tableDist;
      if (type === 1) { [tableLong, tableDist] = tablesFixes(); }
      else {
        const nLong = bits(5) + 257, nDist = bits(5) + 1, nCode = bits(4) + 4;
        const longueursCode = new Uint8Array(19);
        for (let i = 0; i < nCode; i++) longueursCode[ORDRE_CODES_LONGUEUR[i]] = bits(3);
        const tableCode = construireTable(longueursCode);
        const longueurs = new Uint8Array(nLong + nDist);
        for (let i = 0; i < longueurs.length; ) {
          const sym = decoder(tableCode);
          if (sym < 16) longueurs[i++] = sym;
          else if (sym === 16) {
            const precedent = longueurs[i-1]; let r = 3 + bits(2);
            while (r--) longueurs[i++] = precedent;
          } else if (sym === 17) { let r = 3 + bits(3); while (r--) longueurs[i++] = 0; }
          else { let r = 11 + bits(7); while (r--) longueurs[i++] = 0; }
        }
        tableLong = construireTable(longueurs.subarray(0, nLong));
        tableDist = construireTable(longueurs.subarray(nLong));
      }
      for (;;) {
        const sym = decoder(tableLong);
        if (sym === 256) break;
        if (sym < 256) octets.push(sym);
        else {
          const i = sym - 257;
          const longueur = LEN_BASE[i] + bits(LEN_EXTRA[i]);
          const d = decoder(tableDist);
          const distance = DIST_BASE[d] + bits(DIST_EXTRA[d]);
          const debut = octets.length - distance;
          if (debut < 0) throw new Error("Archive Excel illisible.");
          for (let k = 0; k < longueur; k++) octets.push(octets[debut + k]);
        }
      }
    } else throw new Error("Données Excel compressées illisibles.");
  }
  return new Uint8Array(octets);
}

function extraire(vue, entree) {
  const p = entree.offsetLocal;
  if (u32at(vue, p) !== 0x04034b50) throw new Error("Archive Excel endommagée.");
  const nomLongueur = u16at(vue, p + 26);
  const extraLongueur = u16at(vue, p + 28);
  const debut = p + 30 + nomLongueur + extraLongueur;
  const brut = new Uint8Array(vue.buffer, vue.byteOffset + debut, entree.tailleCompressee);
  if (entree.methode === 0) return brut;
  if (entree.methode !== 8) throw new Error("Compression Excel non prise en charge.");
  return inflate(brut);
}

/* ---------- lecture du XML ---------- */

function decoderEntites(texte) {
  return texte
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (m, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, '&');
}

function texteDesBalises(xml, balise) {
  const motif = new RegExp('<' + balise + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + balise + '>', 'g');
  const morceaux = [];
  let m;
  while ((m = motif.exec(xml))) morceaux.push(decoderEntites(m[1]));
  return morceaux.join('');
}

function chainesPartagees(xml) {
  if (!xml) return [];
  const liste = [];
  const motif = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = motif.exec(xml))) {
    // un <si> peut contenir plusieurs <t> (texte enrichi)
    liste.push(texteDesBalises(m[1], 't'));
  }
  return liste;
}

function indexColonne(reference) {
  const lettres = /^([A-Z]+)/.exec(String(reference || '').toUpperCase());
  if (!lettres) return 0;
  let n = 0;
  for (const c of lettres[1]) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

function ligneDuXml(xml, partagees) {
  const cellules = [];
  const motif = /<c\s+([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m, maximum = -1;
  while ((m = motif.exec(xml))) {
    const attributs = m[1] || '';
    const contenu = m[2] || '';
    const ref = /r="([A-Z]+\d+)"/.exec(attributs);
    const type = /\bt="([^"]+)"/.exec(attributs);
    const colonne = ref ? indexColonne(ref[1]) : cellules.length;
    let valeur = '';
    if (type && type[1] === 's') {
      const v = /<v>\s*([\s\S]*?)\s*<\/v>/.exec(contenu);
      const i = v ? Number(v[1]) : -1;
      valeur = i >= 0 && partagees[i] != null ? partagees[i] : '';
    } else if (type && type[1] === 'inlineStr') {
      valeur = texteDesBalises(contenu, 't');
    } else if (type && type[1] === 'str') {
      const v = /<v>\s*([\s\S]*?)\s*<\/v>/.exec(contenu);
      valeur = v ? decoderEntites(v[1]) : '';
    } else {
      const v = /<v>\s*([\s\S]*?)\s*<\/v>/.exec(contenu);
      valeur = v ? decoderEntites(v[1]) : '';
    }
    cellules[colonne] = valeur;
    if (colonne > maximum) maximum = colonne;
  }
  const sortie = [];
  for (let i = 0; i <= maximum; i++) sortie.push(cellules[i] == null ? '' : cellules[i]);
  return sortie;
}

function lignesDuXml(xml, partagees) {
  const lignes = [];
  const motif = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = motif.exec(xml))) {
    const ligne = ligneDuXml(m[1], partagees);
    if (ligne.some(c => String(c).trim() !== '')) lignes.push(ligne);
  }
  return lignes;
}

/* ---------- adaptation au carnet de notes ----------

   Le classeur du lycée porte : العدد | القسم | الاسم واللقب | DC1…DS3.
   On le convertit en un tableau CSV « une colonne par épreuve » que le
   module student-csv sait déjà lire, en rapprochant le nom arabe du
   classeur et le nom français de la classe quand c'est possible. */

const COLONNES_ARABE = {
  numero: ['العدد', 'الرقم', 'عدد'],
  classe: ['القسم', 'الفصل', 'القسم الدراسي'],
  nom:    ['الاسم واللقب', 'الاسم و اللقب', 'الاسم', 'اللقب والاسم', 'الاسم الكامل'],
  nomSeul:['اللقب', 'اسم العائلة'],
  prenom: ['الاسم الشخصي', 'الاسم فقط']
};

function normaliserArabe(valeur) {
  return String(valeur == null ? '' : valeur)
    .replace(/[\u0640\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\s+/g, ' ')
    .trim();
}

function trouverColonne(entetes, cle) {
  const cibles = COLONNES_ARABE[cle] || [];
  for (let i = 0; i < entetes.length; i++) {
    const h = normaliserArabe(entetes[i]);
    if (cibles.some(c => normaliserArabe(c) === h)) return i;
  }
  return -1;
}

/* entetes : ligne d'en-têtes du classeur ; lignes : les lignes de données ;
   eleves : liste des élèves de la classe (nom, prenom, nomAr, prenomAr). */
function classeurVersEpreuves(feuille, eleves) {
  const lignes = (feuille && feuille.lignes) || [];
  if (lignes.length < 2) throw new Error("La feuille ne contient pas de données.");
  const entetes = lignes[0].map(v => String(v == null ? '' : v));
  const iNom = trouverColonne(entetes, 'nom');
  const iPrenom = trouverColonne(entetes, 'prenom');
  const iNomSeul = trouverColonne(entetes, 'nomSeul');

  const colonnesEpreuve = [];
  entetes.forEach(function (entete, index) {
    const m = /^\s*(DC|DS)\s*([0-9]{1,2})\s*$/i.exec(String(entete));
    if (m) colonnesEpreuve.push({ index, cle: m[1].toLowerCase() + Number(m[2]) });
  });
  if (!colonnesEpreuve.length) throw new Error("Aucune colonne DC ou DS reconnue dans cette feuille.");
  if (iNom < 0 && iNomSeul < 0) throw new Error("Colonne « الاسم واللقب » introuvable.");

  /* L'ordre des mots varie d'une source à l'autre (« الزواوي احمد » dans
     l'app, « احمد الزواوي » dans le classeur). On compare donc des mots
     triés, pas des chaînes telles quelles. */
  function cleMots(valeurs) {
    const mots = [].concat(valeurs).filter(Boolean)
      .map(normaliserArabe).join(' ').split(' ').map(m => m.trim()).filter(Boolean)
      .filter(m => m !== 'بن' && m !== 'بو').sort();
    return mots.join(' ');
  }

  const roster = Array.isArray(eleves) ? eleves : [];
  const parArabe = new Map();
  roster.forEach(function (e) {
    const cle = cleMots([e.nomAr, e.prenomAr]);
    if (cle) parArabe.set(cle, parArabe.has(cle) ? null : e);
  });

  const sortie = [['id', 'nom', 'prenom'].concat(colonnesEpreuve.map(c => c.cle))];
  const erreurs = [], avertissements = [];
  lignes.slice(1).forEach(function (ligne, index) {
    const numero = index + 2;
    const complet = iNom >= 0 ? normaliserArabe(ligne[iNom]) : '';
    const nomSeul = iNomSeul >= 0 ? normaliserArabe(ligne[iNomSeul]) : '';
    const prenomSeul = iPrenom >= 0 ? normaliserArabe(ligne[iPrenom]) : '';
    const arabes = [complet, prenomSeul ? (nomSeul + ' ' + prenomSeul).trim() : nomSeul].filter(Boolean);
    let trouve = null, ambigu = false;
    for (const a of arabes.map(a => cleMots([a]))) {
      if (parArabe.has(a)) {
        const candidat = parArabe.get(a);
        if (candidat === null) { ambigu = true; break; }
        trouve = candidat;
        break;
      }
    }
    if (ambigu) { erreurs.push('Ligne ' + numero + ' : deux élèves portent ce nom arabe ; importer par ID.'); return; }

    const cellules = colonnesEpreuve.map(function (col) {
      const v = ligne[col.index];
      const t = String(v == null ? '' : v).trim();
      return t === '' ? '' : t.replace('.', ',');
    });

    if (trouve) {
      sortie.push([trouve.id, trouve.nom || '', trouve.prenom || ''].concat(cellules));
      return;
    }
    /* Élève absent de la classe : on ne le jette pas. On garde son nom arabe
       pour que l'appariement se fasse à l'import, et on prévient. */
    if (!complet && !nomSeul) return;
    avertissements.push('Ligne ' + numero + ' : « ' + (complet || nomSeul) + ' » ne correspond à aucun élève ; à rapprocher à la main.');
    /* Le nom arabe va dans la colonne « nom » : c'est là que l'app le cherche,
       et c'est ce qui rend la ligne lisible au lieu d'être ignorée. */
    sortie.push(['', complet || nomSeul, ''].concat(cellules));
  });
  return { csv: sortie.map(l => l.join(';')).join('\r\n'), lignes: sortie.length - 1, erreurs, avertissements, epreuves: colonnesEpreuve.map(c => c.cle) };
}

/* ---------- point d'entrée ---------- */

async function lireFeuilles(donnees) {
  const octets = donnees instanceof Uint8Array ? donnees : new Uint8Array(donnees);
  const vue = new DataView(octets.buffer, octets.byteOffset, octets.byteLength);
  const liste = entrees(vue);
  const parNom = new Map(liste.map(e => [e.nom, e]));
  if (!parNom.has('xl/workbook.xml')) throw new Error("Ce fichier ne contient pas de classeur Excel.");

  const decodeur = new TextDecoder('utf-8');
  const partagees = parNom.has('xl/sharedStrings.xml')
    ? chainesPartagees(decodeur.decode(extraire(vue, parNom.get('xl/sharedStrings.xml'))))
    : [];

  const classeur = decodeur.decode(extraire(vue, parNom.get('xl/workbook.xml')));
  const noms = [];
  const motif = /<sheet\b[^>]*name="([^"]*)"[^>]*\/?>/g;
  let m;
  while ((m = motif.exec(classeur))) noms.push(decoderEntites(m[1]));

  const feuilles = [];
  const fichiers = liste.filter(e => /^xl\/worksheets\/sheet\d+\.xml$/.test(e.nom))
    .sort((a, b) => Number(a.nom.match(/(\d+)/)[1]) - Number(b.nom.match(/(\d+)/)[1]));
  for (let i = 0; i < fichiers.length; i++) {
    const xml = decodeur.decode(extraire(vue, fichiers[i]));
    feuilles.push({ nom: noms[i] || ('Feuille ' + (i + 1)), lignes: lignesDuXml(xml, partagees) });
  }
  return { feuilles };
}

const api = { lireFeuilles, indexColonne, chainesPartagees, lignesDuXml, classeurVersEpreuves, normaliserArabe };
root.STI_XLSX = api;
if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
