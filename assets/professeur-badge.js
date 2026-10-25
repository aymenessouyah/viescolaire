/* Badge personnel des professeurs — photos privées dans Supabase Storage. */
(function (root) {
  'use strict';

  const BUCKET = 'professeur-photos';
  const TABLE = 'profils_professeurs';
  const SUBJECT = 'Sciences et technologies de l’informatique';
  const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
  const MAX_PHOTO_BYTES = 1024 * 1024;
  let cachedUserId = '';
  let cachedProfile = null;
  let profileLoadedFor = '';
  let profileRequest = null;
  let storedPhotoPath = '';
  let storedPhotoUrl = '';
  let draftFile = null;
  let draftPhotoUrl = '';
  let lastError = '';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function currentUser() {
    return root.authSession && root.authSession() && root.authSession().user
      ? root.authSession().user : null;
  }

  function currentUserId() {
    const user = currentUser();
    return user && user.id ? String(user.id) : '';
  }

  function makeBadgeCode(userId) {
    const compact = String(userId || '').replace(/[^a-f0-9]/gi, '').toUpperCase();
    return compact ? 'STI-' + compact.slice(0, 8) : 'STI-À COMPLÉTER';
  }

  function config() {
    const value = root.cloudCfg ? root.cloudCfg() : {};
    if (!value.url || !value.key) throw new Error('La connexion Supabase n’est pas configurée.');
    return value;
  }

  async function accessToken() {
    if (!root.authToken) throw new Error('Connexion professeur requise.');
    const token = await root.authToken();
    if (!token) throw new Error('Session expirée. Reconnectez-vous pour accéder au badge.');
    return token;
  }

  function requestHeaders(token, extra) {
    const c = config();
    return Object.assign({ apikey: c.key, Authorization: 'Bearer ' + token }, extra || {});
  }

  function encodedPath(path) {
    return String(path || '').split('/').map(encodeURIComponent).join('/');
  }

  async function errorMessage(response, fallback) {
    const data = await response.json().catch(function () { return {}; });
    return data.message || data.error || data.msg || fallback + ' (HTTP ' + response.status + ')';
  }

  async function decodeImage(file) {
    if (root.createImageBitmap) {
      try { return await root.createImageBitmap(file); } catch (error) { /* image() fallback for older browsers */ }
    }
    return new Promise(function (resolve, reject) {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () { URL.revokeObjectURL(objectUrl); resolve(image); };
      image.onerror = function () { URL.revokeObjectURL(objectUrl); reject(new Error('Impossible de lire cette image.')); };
      image.src = objectUrl;
    });
  }

  async function compressPhoto(file) {
    if (!file) throw new Error('Choisissez la photo du professeur.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Formats acceptés : JPEG, PNG ou WebP.');
    }
    if (file.size > MAX_SOURCE_BYTES) throw new Error('La photo doit faire moins de 10 Mo.');
    const image = await decodeImage(file);
    const longest = Math.max(image.width || image.naturalWidth, image.height || image.naturalHeight);
    if (!longest) throw new Error('Cette image ne contient pas de dimensions valides.');
    const scale = Math.min(1, 640 / longest);
    const width = Math.max(1, Math.round((image.width || image.naturalWidth) * scale));
    const height = Math.max(1, Math.round((image.height || image.naturalHeight) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Compression de la photo indisponible dans ce navigateur.');
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    if (image.close) image.close();
    const blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', 0.84); });
    if (!blob) throw new Error('Impossible de préparer la photo.');
    if (blob.size > MAX_PHOTO_BYTES) throw new Error('La photo compressée dépasse 1 Mo. Choisissez une image plus légère.');
    return blob;
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || '')); };
      reader.onerror = function () { reject(new Error('Impossible de préparer le fichier photo.')); };
      reader.readAsDataURL(blob);
    });
  }

  function setDraftPhoto(file) {
    if (draftPhotoUrl) URL.revokeObjectURL(draftPhotoUrl);
    draftFile = null; draftPhotoUrl = '';
    if (!file) return Promise.resolve('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return Promise.reject(new Error('Formats acceptés : JPEG, PNG ou WebP.'));
    }
    if (file.size > MAX_SOURCE_BYTES) return Promise.reject(new Error('La photo doit faire moins de 10 Mo.'));
    draftFile = file;
    draftPhotoUrl = URL.createObjectURL(file);
    return Promise.resolve(draftPhotoUrl);
  }

  function clearDraftPhoto() {
    if (draftPhotoUrl) URL.revokeObjectURL(draftPhotoUrl);
    draftFile = null; draftPhotoUrl = '';
  }

  function activePhotoUrl() { return draftPhotoUrl || storedPhotoUrl; }

  async function loadProfilePhoto(path) {
    const userId = currentUserId();
    if (!userId || !path) return '';
    if (!String(path).startsWith(userId + '/')) throw new Error('Le chemin de cette photo ne correspond pas au compte connecté.');
    if (storedPhotoPath === path && storedPhotoUrl) return storedPhotoUrl;
    const c = config(), token = await accessToken();
    const url = c.url.replace(/\/$/, '') + '/storage/v1/object/authenticated/' +
      encodeURIComponent(BUCKET) + '/' + encodedPath(path);
    const response = await fetch(url, { headers: requestHeaders(token) });
    if (!response.ok) throw new Error(await errorMessage(response, 'Lecture de la photo impossible'));
    const blob = await response.blob();
    if (storedPhotoUrl) URL.revokeObjectURL(storedPhotoUrl);
    storedPhotoUrl = URL.createObjectURL(blob);
    storedPhotoPath = path;
    return storedPhotoUrl;
  }

  async function fetchProfileRow() {
    const userId = currentUserId();
    if (!userId) return null;
    const c = config(), token = await accessToken();
    const query = '?prof_id=eq.' + encodeURIComponent(userId) +
      '&select=prof_id,nom,fonction,matiere,signature,badge_code,photo_path,updated_at';
    const response = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/' + TABLE + query, {
      headers: requestHeaders(token, { Accept: 'application/json' })
    });
    if (!response.ok) throw new Error(await errorMessage(response, 'Lecture du profil Supabase impossible'));
    const rows = await response.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function bootstrap(options) {
    options = options || {};
    const userId = currentUserId();
    if (!userId || (root.isProfessorConnected && !root.isProfessorConnected())) return null;
    if (!options.force && profileLoadedFor === userId) return cachedProfile;
    if (profileRequest && cachedUserId === userId) return profileRequest;
    cachedUserId = userId;
    profileRequest = (async function () {
      try {
        const row = await fetchProfileRow();
        if (currentUserId() !== userId) return null;
        cachedProfile = row;
        profileLoadedFor = userId;
        lastError = '';
        const previous = root.store.profil || {};
        const activeEmail = String((currentUser() || {}).email || '').toLowerCase();
        const ownsPrevious = previous.prof_id
          ? String(previous.prof_id) === userId
          : !!(previous.email && activeEmail && String(previous.email).toLowerCase() === activeEmail);
        const old = ownsPrevious ? previous : {};
        const rowPhotoPath = row && row.photo_path && String(row.photo_path).startsWith(userId + '/')
          ? String(row.photo_path) : '';
        const oldPhotoPath = old.photo_path && String(old.photo_path).startsWith(userId + '/')
          ? String(old.photo_path) : '';
        if (row && row.photo_path && !rowPhotoPath) lastError = 'Le chemin de la photo Supabase ne correspond pas au compte connecté.';
        const merged = Object.assign({}, old, {
          prof_id: userId,
          nom: (row && row.nom) || old.nom || '',
          fonction: (row && row.fonction) || old.fonction || 'Professeur',
          matiere: (row && row.matiere && row.matiere !== 'STI') ? row.matiere : ((!old.matiere || old.matiere === 'STI') ? SUBJECT : old.matiere),
          signature: (row && row.signature) || old.signature || '',
          badge_code: (row && row.badge_code) || old.badge_code || makeBadgeCode(userId),
          photo_path: rowPhotoPath || oldPhotoPath,
          email: (currentUser() || {}).email || old.email || ''
        });
        const changed = JSON.stringify(previous) !== JSON.stringify(merged);
        root.store.profil = merged;
        if (merged.photo_path) {
          try { await loadProfilePhoto(merged.photo_path); }
          catch (error) { lastError = error.message || String(error); }
        }
        if (changed && root.save) root.save(true);
        return row;
      } catch (error) {
        cachedProfile = null;
        profileLoadedFor = '';
        lastError = error.message || String(error);
        return null;
      } finally {
        if (cachedUserId === userId) profileRequest = null;
      }
    })();
    return profileRequest;
  }

  async function uploadPhoto(userId, blob, token) {
    const c = config(), path = userId + '/portrait.jpg';
    const response = await fetch(c.url.replace(/\/$/, '') + '/storage/v1/object/' +
      encodeURIComponent(BUCKET) + '/' + encodedPath(path), {
        method: 'POST',
        headers: requestHeaders(token, {
          'Content-Type': 'image/jpeg',
          'Cache-Control': '3600',
          'x-upsert': 'true'
        }),
        body: blob
      });
    if (!response.ok) throw new Error(await errorMessage(response, 'Envoi de la photo impossible'));
    return path;
  }

  async function saveProfile(profile, file) {
    const userId = currentUserId();
    if (!userId || (root.isProfessorConnected && !root.isProfessorConnected())) {
      throw new Error('Connectez-vous au compte du professeur avant d’enregistrer le badge.');
    }
    const c = config(), token = await accessToken();
    let path = profile.photo_path || (root.store.profil && root.store.profil.photo_path) ||
      (cachedUserId === userId && cachedProfile && cachedProfile.photo_path) || '';
    if (path && !String(path).startsWith(userId + '/')) path = '';
    if (file) path = await uploadPhoto(userId, await compressPhoto(file), token);
    if (!path) throw new Error('La photo du professeur est obligatoire pour créer le badge.');
    const row = {
      prof_id: userId,
      nom: String(profile.nom || '').trim(),
      fonction: String(profile.fonction || 'Professeur').trim() || 'Professeur',
      matiere: String(profile.matiere || SUBJECT).trim() || SUBJECT,
      signature: String(profile.signature || '').trim().slice(0, 100),
      badge_code: String(profile.badge_code || (cachedProfile && cachedProfile.badge_code) || makeBadgeCode(userId)),
      photo_path: path,
      updated_at: new Date().toISOString()
    };
    if (!row.nom) throw new Error('Indiquez le nom et le prénom du professeur.');
    const response = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/' + TABLE + '?on_conflict=prof_id', {
      method: 'POST',
      headers: requestHeaders(token, {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      }),
      body: JSON.stringify(row)
    });
    if (!response.ok) throw new Error(await errorMessage(response, 'Enregistrement du profil professeur impossible'));
    const returned = await response.json().catch(function () { return []; });
    cachedProfile = Array.isArray(returned) && returned[0] ? returned[0] : row;
    cachedUserId = userId;
    profileLoadedFor = userId;
    lastError = '';
    if (file) {
      if (storedPhotoUrl) URL.revokeObjectURL(storedPhotoUrl);
      storedPhotoUrl = '';
      storedPhotoPath = '';
    }
    clearDraftPhoto();
    if (path) {
      try { await loadProfilePhoto(path); }
      catch (error) { lastError = error.message || String(error); }
    }
    return cachedProfile;
  }

  function renderMarkup(profile, photoUrl, options) {
    profile = profile || {};
    options = options || {};
    const user = currentUser() || {};
    const name = String(profile.nom || 'NOM PRÉNOM');
    const role = String(profile.fonction || 'Professeur');
    const school = String(profile.lycee || (root.STI_DATA && root.STI_DATA.reference && root.STI_DATA.reference.SCHOOL && root.STI_DATA.reference.SCHOOL.lycee) || 'Lycée Rafèha Ariana');
    const email = String(profile.email || user.email || 'Courriel du professeur');
    const subject = String(profile.matiere || SUBJECT);
    const code = String(profile.badge_code || makeBadgeCode(profile.prof_id || user.id));
    const photo = photoUrl
      ? '<img class="sti-badge-photo" src="' + escapeHtml(photoUrl) + '" alt="Portrait de ' + escapeHtml(name) + '">'
      : '<div class="sti-badge-photo-placeholder" aria-label="Photo du professeur à ajouter"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="22" r="12"></circle><path d="M9 58c2-13 10-20 23-20s21 7 23 20"></path></svg></div>';
    return '<article class="sti-professor-badge' + (options.compact ? ' is-compact' : '') + '" aria-label="Badge professionnel de ' + escapeHtml(name) + '">' +
      '<header class="sti-badge-header"><div class="sti-badge-mark" aria-hidden="true"><span>STI</span></div>' +
        '<div class="sti-badge-brand"><strong>Espace pédagogique</strong><small>' + escapeHtml(school) + '</small></div></header>' +
      '<div class="sti-badge-ribbon" aria-hidden="true"><span></span></div>' +
      '<div class="sti-badge-portrait">' + photo + '</div>' +
      '<section class="sti-badge-identity"><h2>' + escapeHtml(name) + '</h2><p>' + escapeHtml(role) + '</p></section>' +
      '<dl class="sti-badge-details"><div><dt>Identifiant</dt><dd>' + escapeHtml(code) + '</dd></div>' +
        '<div><dt>Courriel</dt><dd title="' + escapeHtml(email) + '">' + escapeHtml(email) + '</dd></div>' +
        '<div><dt>Discipline</dt><dd>' + escapeHtml(subject) + '</dd></div></dl>' +
      '<footer class="sti-badge-footer"><span>ENSEIGNEMENT · STI</span><span>' + escapeHtml(school) + '</span></footer></article>';
  }

  function renderInto(target, profile, photoUrl, options) {
    const node = typeof target === 'string' ? document.getElementById(target) : target;
    if (!node) return;
    node.innerHTML = renderMarkup(profile, photoUrl == null ? activePhotoUrl() : photoUrl, options);
  }

  function renderSiteBadge(target, profile, photoUrl) {
    const node = typeof target === 'string' ? document.getElementById(target) : target;
    if (!node) return;
    const user = currentUser();
    if (!user || !user.id || !root.isProfessorConnected || !root.isProfessorConnected()) {
      node.hidden = true;
      node.innerHTML = '';
      return;
    }
    profile = profile || {};
    const name = String(profile.nom || 'Profil à compléter');
    const role = String(profile.fonction || 'Professeur');
    const subject = String(profile.matiere || SUBJECT);
    const code = String(profile.badge_code || makeBadgeCode(profile.prof_id || user.id));
    const imageUrl = photoUrl == null ? activePhotoUrl() : photoUrl;
    const portrait = imageUrl
      ? '<img src="' + escapeHtml(imageUrl) + '" alt="">'
      : '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="22" r="12"></circle><path d="M9 58c2-13 10-20 23-20s21 7 23 20"></path></svg>';
    node.innerHTML = '<button class="site-professor-badge-trigger" type="button" onclick="openProfil()" aria-label="Ouvrir le badge de ' + escapeHtml(name) + '">' +
      '<span class="site-badge-avatar" aria-hidden="true">' + portrait + '</span>' +
      '<span class="site-badge-copy"><span class="site-badge-kicker">BADGE PROFESSEUR · STI</span>' +
      '<strong class="site-badge-name">' + escapeHtml(name) + '</strong>' +
      '<small class="site-badge-role">' + escapeHtml(role) + ' · ' + escapeHtml(subject) + '</small>' +
      '<code class="site-badge-code">' + escapeHtml(code) + '</code></span>' +
      '<span class="site-badge-arrow" aria-hidden="true">↗</span></button>';
    node.hidden = false;
  }

  async function printBadge(profile, photoUrl) {
    profile = profile || (root.store && root.store.profil) || {};
    let imageUrl = photoUrl || activePhotoUrl();
    if (!imageUrl && profile.photo_path) imageUrl = await loadProfilePhoto(profile.photo_path);
    if (!imageUrl) throw new Error('Ajoutez une photo au profil avant d’imprimer le badge.');
    const html = renderMarkup(profile, imageUrl);
    const cssUrl = new URL('assets/professeur-badge.css', root.location.href).href;
    let frame = document.getElementById('professeur-badge-print');
    if (frame) frame.remove();
    frame = document.createElement('iframe');
    frame.id = 'professeur-badge-print';
    frame.title = 'Aperçu imprimable du badge professeur';
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(frame);
    const d = frame.contentDocument;
    d.open();
    d.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><link rel="stylesheet" href="' + escapeHtml(cssUrl) + '"><style>@page{size:54mm 86mm;margin:0}html,body{width:54mm;height:86mm;margin:0;padding:0;overflow:hidden}body{display:flex;align-items:center;justify-content:center}.sti-professor-badge{width:54mm!important;height:86mm!important;min-height:86mm!important;border-radius:2.5mm!important;box-shadow:none!important}.sti-badge-header{height:29%!important}.sti-badge-portrait{top:24%!important;width:37%!important}.sti-badge-identity{top:47%!important}.sti-badge-details{top:59%!important}.sti-badge-footer{bottom:3.5%!important}</style></head><body>' + html + '</body></html>');
    d.close();
    const print = function () {
      const image = frame.contentDocument && frame.contentDocument.querySelector('img');
      const ready = function () {
        setTimeout(function () {
          try {
            frame.contentWindow.focus();
            frame.contentWindow.addEventListener('afterprint', function () { frame.remove(); }, { once: true });
            frame.contentWindow.print();
          } catch (error) { frame.remove(); throw error; }
        }, 120);
      };
      if (image && !image.complete) image.onload = ready;
      else ready();
    };
    const link = d.querySelector('link');
    if (link && !link.sheet) { link.onload = print; link.onerror = print; }
    else setTimeout(print, 60);
  }

  function onLogout() {
    clearDraftPhoto();
    if (storedPhotoUrl) URL.revokeObjectURL(storedPhotoUrl);
    storedPhotoUrl = ''; storedPhotoPath = '';
    cachedUserId = ''; cachedProfile = null; profileLoadedFor = ''; profileRequest = null; lastError = '';
  }

  root.STI_PROF_BADGE = {
    bucket: BUCKET,
    subject: SUBJECT,
    makeBadgeCode: makeBadgeCode,
    compressPhoto: compressPhoto,
    blobToDataUrl: blobToDataUrl,
    setDraftPhoto: setDraftPhoto,
    clearDraftPhoto: clearDraftPhoto,
    activePhotoUrl: activePhotoUrl,
    loadProfilePhoto: loadProfilePhoto,
    fetchProfileRow: fetchProfileRow,
    bootstrap: bootstrap,
    saveProfile: saveProfile,
    renderMarkup: renderMarkup,
    renderInto: renderInto,
    renderSiteBadge: renderSiteBadge,
    printBadge: printBadge,
    onLogout: onLogout,
    lastError: function () { return lastError; }
  };
})(window);
