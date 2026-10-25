/* Générateur PDF autonome pour le cahier de textes.
   Aucune librairie externe : écrit un PDF A4 portrait (texte Helvetica, tableaux,
   sauts de page, numérotation) directement en JavaScript, avec l'encodage WinAnsi
   pour les accents français. Utilisation :
     const blob = window.STI_PDF.cahier({ titre, sous, infos, colonnes, largeurs, rows, pied });
     // rows : {type:'sem', label}, {type:'row', cells:[…], etat} ou {type:'signature', label, value}
*/
(function (root) {
  'use strict';

  var W = 595.28, H = 841.89, M = 40;       // A4 portrait, marges

  /* ---------- encodage WinAnsi : les accents sont écrits en octal ---------- */
  var WIN = {
    '€': 128, '‚': 130, 'ƒ': 131, '„': 132, '…': 133, '†': 134, '‡': 135, 'ˆ': 136, '‰': 137,
    'Š': 138, '‹': 139, 'Œ': 140, '‘': 145, '’': 146, '“': 147, '”': 148, '•': 149, '–': 150,
    '—': 151, '˜': 152, '™': 153, 'š': 154, '›': 155, 'œ': 156, 'Ÿ': 159
  };
  function winByte(ch) {
    if (WIN[ch] != null) return WIN[ch];
    var c = ch.charCodeAt(0);
    if (c < 256) return c;                   // latin-1 : couvre é è à ç ù ô î …
    return 63;                               // ?
  }
  function pdfString(s) {
    var out = '';
    String(s == null ? '' : s).replace(/\u00a0/g, ' ').split('').forEach(function (ch) {
      var b = winByte(ch);
      if (ch === '(' || ch === ')' || ch === '\\') out += '\\' + ch;
      else if (b >= 32 && b < 127) out += ch;
      else out += '\\' + ('00' + b.toString(8)).slice(-3);
    });
    return out;
  }

  /* ---------- largeurs approx. Helvetica (en 1/1000 em) ---------- */
  var WR = { r: 333, i: 222, l: 222, t: 278, f: 278, j: 222, s: 500, m: 833, w: 722,
             k: 500, d: 556, b: 556, h: 556, n: 556, u: 556, v: 500, x: 500, y: 500,
             z: 500, c: 500, e: 556, o: 556, a: 556, g: 556, p: 556, q: 556,
             W: 944, M: 833, ' ': 278, '0': 556, '1': 556, '2': 556, '3': 556, '4': 556,
             '5': 556, '6': 556, '7': 556, '8': 556, '9': 556, '.': 278, ',': 278,
             ':': 333, ';': 333, '-': 333, '/': 278, '(': 333, ')': 333, "'": 191,
             'É': 667, 'È': 667, 'À': 667, 'Ç': 722, 'Ù': 722, 'Î': 278, 'Ô': 778, 'œ': 944 };
  function textW(s, size, bold) {
    var w = 0;
    String(s).split('').forEach(function (ch) {
      w += (WR[ch] != null ? WR[ch] : (ch >= 'A' && ch <= 'Z' ? 667 : 556));
    });
    return w * size / 1000 * (bold ? 1.05 : 1);
  }
  /* découpe un texte en lignes tenant dans la largeur donnée */
  function wrap(s, size, maxW, bold) {
    var mots = String(s == null ? '' : s).replace(/\s+/g, ' ').trim().split(' ');
    var lignes = [], cur = '';
    mots.forEach(function (m) {
      var essai = cur ? cur + ' ' + m : m;
      if (textW(essai, size, bold) <= maxW || !cur) cur = essai;
      else { lignes.push(cur); cur = m; }
    });
    if (cur) lignes.push(cur);
    return lignes.length ? lignes : [''];
  }

  /* ---------- écriture du PDF ---------- */
  function build(doc) {
    var pages = [], ops = null, y = 0, page = 0;

    function newPage() {
      ops = [];
      pages.push(ops);
      page++;
      y = H - M;
      /* bandeau de titre sur chaque page */
      if (page === 1) {
        ops.push('BT /F2 16 Tf 1 0 0 1 ' + M + ' ' + (y - 16) + ' Tm (' + pdfString(doc.titre) + ') Tj ET');
        y -= 24;
        if (doc.sous) {
          ops.push('BT /F1 9.5 Tf 1 0 0 1 ' + M + ' ' + (y - 10) + ' Tm (' + pdfString(doc.sous) + ') Tj ET');
          y -= 18;
        }
        ops.push('0.894 0.4 0.122 rg ' + M + ' ' + (y - 2) + ' ' + (W - 2 * M) + ' 2.6 re f 0 0 0 rg');
        y -= 14;
        if (doc.infos && doc.infos.length) {
          var x = M;
          doc.infos.forEach(function (it) {
            var t = it.k + ' : ' + it.v;
            ops.push('BT /F1 8.5 Tf 0.36 0.36 0.36 rg 1 0 0 1 ' + x + ' ' + (y - 9) + ' Tm (' + pdfString(t) + ') Tj ET 0 0 0 rg');
            x += textW(t, 8.5) + 16;
          });
          y -= 18;
        }
      } else {
        ops.push('BT /F1 8.5 Tf 0.45 0.45 0.45 rg 1 0 0 1 ' + M + ' ' + (y - 9) + ' Tm (' +
          pdfString(doc.titre + ' — suite') + ') Tj ET 0 0 0 rg');
        y -= 20;
      }
      /* ligne d'en-tête du tableau */
      headerRow();
    }

    var cols = doc.colonnes, wds = doc.largeurs;

    function headerRow() {
      var h = 16;
      ops.push('0.09 0.36 0.25 rg ' + M + ' ' + (y - h) + ' ' + (W - 2 * M) + ' ' + h + ' re f');
      var x = M;
      cols.forEach(function (c, i) {
        ops.push('BT /F2 7.5 Tf 1 1 1 rg 1 0 0 1 ' + (x + 4) + ' ' + (y - 11) + ' Tm (' + pdfString(c.toUpperCase()) + ') Tj ET');
        x += wds[i];
      });
      ops.push('0 0 0 rg');
      y -= h;
    }

    newPage();

    /* hauteur d'une ligne de données (utilisée aussi pour éviter les titres orphelins) */
    function hauteur(r) {
      var n = 1;
      r.cells.forEach(function (t, i) {
        var k = wrap(t, 8, wds[i] - 8, i === 0).length;
        if (k > n) n = k;
      });
      return n * 10.2 + 5;
    }

    function signatureStrokes(r) {
      if (!Array.isArray(r.strokes)) return [];
      return r.strokes.slice(0, 32).map(function (stroke) {
        if (!Array.isArray(stroke)) return [];
        return stroke.slice(0, 600).map(function (point) {
          if (!Array.isArray(point) || point.length < 2) return null;
          var x = Number(point[0]), yy = Number(point[1]);
          if (!isFinite(x) || !isFinite(yy)) return null;
          return [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, yy))];
        }).filter(Boolean);
      }).filter(function (stroke) { return stroke.length > 0; });
    }

    function signatureLines(r) {
      var value = String(r.value || '').trim();
      return value ? wrap(value, 9, 172, true) : [];
    }

    function signatureHeight(r) {
      if (signatureStrokes(r).length) return 72;
      var lines = signatureLines(r);
      return lines.length ? lines.length * 10 + 35 : 26;
    }

    function drawSignature(r) {
      var strokes = signatureStrokes(r), lines = signatureLines(r), h = signatureHeight(r);
      if (y - h < M + 24) newPage();
      var width = strokes.length ? 160 : 180, x = W - M - width;
      if (strokes.length) {
        var top = y - 4, inkHeight = 45;
        strokes.forEach(function (stroke) {
          var firstX = x + stroke[0][0] * width;
          var firstY = top - stroke[0][1] * inkHeight;
          if (stroke.length === 1) {
            ops.push('0.09 0.22 0.18 rg ' + (firstX - 1.2) + ' ' + (firstY - 1.2) + ' 2.4 2.4 re f 0 0 0 rg');
            return;
          }
          var path = '0.09 0.22 0.18 RG 1.3 w ' + firstX + ' ' + firstY + ' m';
          stroke.slice(1).forEach(function (point) {
            path += ' ' + (x + point[0] * width) + ' ' + (top - point[1] * inkHeight) + ' l';
          });
          ops.push(path + ' S 0 0 0 RG');
        });
        var imageLineY = y - 53;
        ops.push('0.68 0.68 0.68 RG 0.65 w ' + x + ' ' + imageLineY + ' m ' + (W - M) + ' ' + imageLineY + ' l S');
        ops.push('BT /F1 7 Tf 0.42 0.42 0.42 rg 1 0 0 1 ' + x + ' ' + (y - 65) + ' Tm (' + pdfString(r.label || 'Signature du professeur') + ') Tj ET 0 0 0 rg');
        y -= h;
        return;
      }
      var lineY = y - (lines.length ? lines.length * 10 + 2 : 5);
      ops.push('0.68 0.68 0.68 RG 0.65 w ' + x + ' ' + lineY + ' m ' + (W - M) + ' ' + lineY + ' l S');
      lines.forEach(function (line, i) {
        ops.push('BT /F2 9 Tf 0.12 0.24 0.17 rg 1 0 0 1 ' + (x + 4) + ' ' + (y - 10 - i * 10) + ' Tm (' + pdfString(line) + ') Tj ET 0 0 0 rg');
      });
      ops.push('BT /F1 7 Tf 0.42 0.42 0.42 rg 1 0 0 1 ' + x + ' ' + (lineY - 10) + ' Tm (' + pdfString(r.label || 'Signature du professeur') + ') Tj ET 0 0 0 rg');
      y -= h;
    }

    doc.rows.forEach(function (r, idx) {
      if (r.type === 'signature') {
        drawSignature(r);
        return;
      }
      if (r.type === 'sem') {
        /* ne jamais laisser un bandeau de semaine seul en bas de page */
        var nxt = doc.rows[idx + 1], besoin = 16;
        if (nxt && nxt.type === 'row') besoin += hauteur(nxt);
        if (y - besoin < M + 24) newPage();
        ops.push('0.992 0.957 0.925 rg ' + M + ' ' + (y - 14) + ' ' + (W - 2 * M) + ' 14 re f');
        ops.push('0.66 0.33 0.10 rg BT /F2 8 Tf 1 0 0 1 ' + (M + 4) + ' ' + (y - 10) + ' Tm (' +
          pdfString(r.label) + ') Tj ET 0 0 0 rg');
        y -= 16;
        return;
      }
      /* lignes du texte de chaque cellule */
      var cells = r.cells.map(function (t, i) {
        var bold = i === 0;
        return wrap(t, 8, wds[i] - 8, bold);
      });
      var h = hauteur(r);
      var suivant = doc.rows[idx + 1];
      var reserveSignature = suivant && suivant.type === 'signature' ? signatureHeight(suivant) : 0;
      if (y - h - reserveSignature < M + 24) newPage();
      if (r.fond) ops.push('0.97 0.97 0.96 rg ' + M + ' ' + (y - h) + ' ' + (W - 2 * M) + ' ' + h + ' re f 0 0 0 rg');
      var x = M;
      cells.forEach(function (lignes, i) {
        lignes.forEach(function (l, k) {
          var couleur = '0 0 0';
          if (i === 0) couleur = '0.10 0.24 0.16';
          if (i === 1) couleur = '0.08 0.41 0.29';
          if (r.etat && i === cols.length - 1) {
            couleur = r.etat === 'ok' ? '0.06 0.48 0.31' : (r.etat === 'no' ? '0.70 0.15 0.12' : '0.69 0.48 0.00');
          }
          ops.push('BT /F' + (i === 0 || (r.etat && i === cols.length - 1) ? '2' : '1') + ' 8 Tf ' +
            couleur + ' rg 1 0 0 1 ' + (x + 4) + ' ' + (y - 12 - k * 10.2) + ' Tm (' + pdfString(l) + ') Tj ET');
        });
        x += wds[i];
      });
      ops.push('0 0 0 rg 0.88 0.86 0.83 RG 0.5 w ' + M + ' ' + (y - h) + ' m ' + (W - M) + ' ' + (y - h) + ' l S');
      y -= h;
    });

    /* Le pied de page est placé dans la marge fixe de chaque page : ne pas
       créer une page vide quand la dernière signature approche du bas. */

    /* pied de page */
    pages.forEach(function (o, i) {
      o.push('0.55 0.55 0.55 rg BT /F1 7.5 Tf 1 0 0 1 ' + M + ' ' + (M - 12) + ' Tm (' +
        pdfString((doc.pied || '') + '  ·  page ' + (i + 1) + '/' + pages.length) + ') Tj ET 0 0 0 rg');
    });

    /* ---------- assemblage des objets ---------- */
    var objects = [];
    function obj(s) { objects.push(s); return objects.length; }

    var fontR = obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    var fontB = obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    var pageIds = [], contentIds = [];

    pages.forEach(function (o) {
      var stream = o.join('\n');
      var id = obj('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
      contentIds.push(id);
    });

    var pagesObjIndex = objects.length + pages.length + 1;   // = id de l'objet /Pages
    pages.forEach(function (_, i) {
      pageIds.push(obj('<< /Type /Page /Parent ' + pagesObjIndex + ' 0 R /MediaBox [0 0 ' + W.toFixed(2) + ' ' + H.toFixed(2) +
        '] /Resources << /Font << /F1 ' + fontR + ' 0 R /F2 ' + fontB + ' 0 R >> >> /Contents ' + contentIds[i] + ' 0 R >>'));
    });
    var pagesId = obj('<< /Type /Pages /Count ' + pages.length + ' /Kids [' + pageIds.map(function (i) { return i + ' 0 R'; }).join(' ') + '] >>');
    var catalogId = obj('<< /Type /Catalog /Pages ' + pagesId + ' 0 R >>');

    var out = '%PDF-1.4\n';
    var offsets = [];
    objects.forEach(function (o, i) {
      offsets.push(out.length);
      out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n';
    });
    var xref = out.length;
    out += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.forEach(function (o) { out += ('0000000000' + o).slice(-10) + ' 00000 n \n'; });
    out += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root ' + catalogId + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF';

    var bytes = new Uint8Array(out.length);
    for (var i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: 'application/pdf' });
  }

  root.STI_PDF = { cahier: build, _wrap: wrap, _textW: textW };
})(window);
