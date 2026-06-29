/* GitHub Gist sync — popup-free, token-based cross-device progress sync.
 *
 * Stores the progress save as one file in a SECRET gist, authenticated with a
 * GitHub personal access token (classic, `gist` scope) the user pastes in ONCE.
 * Unlike Google's session tokens (which expire ~hourly and need a silent refresh
 * that iOS blocks inside an installed PWA), a PAT does not expire — so sync is
 * fully silent here: no popups, ever, even on the home-screen iPhone app.
 *
 * Cross-device: paste the SAME token on another device and it auto-discovers the
 * same gist (by filename) and links up — no extra setup. Uses the mergeable
 * memory model (window.cfpMergeState) so devices combine instead of clobbering.
 *
 * The token lives only in this device's localStorage (never in the repo). The app
 * stays fully offline/local; this layer only talks to GitHub when online + connected.
 * This is the SOLE cloud-sync backend (Google Drive sync was removed in v2.23.0
 * because its silent token refresh tripped iOS's repeated "allow sign-in" prompt).
 * UI injected into the ⋯ Backup & tools modal.
 */
(function () {
  'use strict';
  if (window.__cfpGist) return; window.__cfpGist = true;

  var LS = 'cfpStudyHome.v1';
  var TOK = 'cfpGistToken', GID = 'cfpGistId', AT = 'cfpGistAt';
  var FILE = 'cfp-study-progress.json';
  var API = 'https://api.github.com';
  var busy = false, pushTimer = null;

  function tok() { try { return localStorage.getItem(TOK) || ''; } catch (e) { return ''; } }
  function gid() { try { return localStorage.getItem(GID) || ''; } catch (e) { return ''; } }
  function enabled() { return !!tok(); }
  function localState() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function merge(a, b) { return (typeof window.cfpMergeState === 'function') ? window.cfpMergeState(a, b) : (b || a || {}); }
  function online() { return navigator.onLine !== false; }

  // ---- GitHub REST (gists) ----
  function headers() { return { 'Authorization': 'Bearer ' + tok(), 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }; }
  // Find an existing gist holding our file so a 2nd device with the same token links up.
  function findGist() {
    if (gid()) return Promise.resolve(gid());
    return fetch(API + '/gists?per_page=100', { headers: headers() }).then(function (r) {
      if (!r.ok) throw new Error(r.status === 401 ? 'bad token (check it has the gist scope)' : ('GitHub ' + r.status));
      return r.json();
    }).then(function (list) {
      var found = (list || []).filter(function (g) { return g.files && g.files[FILE]; })[0];
      if (found) { try { localStorage.setItem(GID, found.id); } catch (e) {} return found.id; }
      return '';
    });
  }
  function createGist(data) {
    var body = { description: 'CFP Study Lab progress (private cross-device sync)', public: false, files: {} };
    body.files[FILE] = { content: JSON.stringify(data) };
    return fetch(API + '/gists', { method: 'POST', headers: headers(), body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('could not create gist (' + r.status + ')'); return r.json(); })
      .then(function (j) { try { localStorage.setItem(GID, j.id); } catch (e) {} return j.id; });
  }
  function readGist() {
    var id = gid(); if (!id) return Promise.resolve(null);
    return fetch(API + '/gists/' + id, { headers: headers() }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { try { var c = j && j.files && j.files[FILE] && j.files[FILE].content; return c ? JSON.parse(c) : null; } catch (e) { return null; } })
      .catch(function () { return null; });
  }
  function writeGist(data) {
    if (!gid()) return createGist(data);
    var body = { files: {} }; body.files[FILE] = { content: JSON.stringify(data) };
    return fetch(API + '/gists/' + gid(), { method: 'PATCH', headers: headers(), body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error('could not save (' + r.status + ')'); return r.json(); });
  }

  // pull → merge → push. Returns whether local data changed.
  function fullSync() {
    if (busy || !enabled()) return Promise.resolve(false);
    busy = true; status('Syncing…');
    return findGist().then(readGist).then(function (remote) {
      var loc = localState();
      var merged = merge(loc, remote || {});
      var changed = JSON.stringify(merged) !== JSON.stringify(loc);
      return writeGist(merged).then(function () {
        localStorage.setItem(LS, JSON.stringify(merged));
        try { localStorage.setItem(AT, String(Date.now())); } catch (e) {}
        busy = false; refreshUI(); status('Synced ✓');
        return changed;
      });
    }).catch(function (e) { busy = false; refreshUI(); status('⚠ ' + (e.message || e)); throw e; });
  }
  // background push only (upload current local; pull happens on next load — safe w/o touching running state)
  function pushOnly() {
    if (busy || !enabled() || !online()) return;
    findGist().then(function () { return writeGist(localState()); })
      .then(function () { try { localStorage.setItem(AT, String(Date.now())); } catch (e) {} refreshUI(); })
      .catch(function () {});
  }
  function schedulePush() { if (!enabled()) return; clearTimeout(pushTimer); pushTimer = setTimeout(pushOnly, 5000); }

  // ---- UI (injected into the ⋯ Backup & tools modal) ----
  function status(m) { var s = document.getElementById('cfpGistStatus'); if (s) s.textContent = m; }
  function lastSyncText() {
    var t = 0; try { t = +localStorage.getItem(AT) || 0; } catch (e) {}
    if (!enabled()) return 'Not connected. Paste a GitHub token for silent, popup-free auto-sync (works on iPhone).';
    if (!t) return 'Connected — tap “Sync now” to link this device.';
    var d = new Date(t);
    return 'Auto-syncing ✓ · last ' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function refreshUI() {
    var on = enabled();
    var f = document.getElementById('cfpGistFields'), n = document.getElementById('cfpGistNow'), o = document.getElementById('cfpGistOff');
    if (f) f.style.display = on ? 'none' : 'block';
    if (n) n.style.display = on ? 'block' : 'none';
    if (o) o.style.display = on ? 'block' : 'none';
    status(lastSyncText());
  }
  function btn(id, label, primary, show) {
    return '<button id="' + id + '" style="width:100%;padding:11px;border:' + (primary ? 'none' : '1px solid #dfe3ee') +
      ';border-radius:12px;background:' + (primary ? 'linear-gradient(135deg,#2d8a4e,#246b3e);color:#fff' : '#fff;color:#1d2433') +
      ';font:600 14px system-ui;cursor:pointer;margin-bottom:8px;display:' + (show ? 'block' : 'none') + '">' + label + '</button>';
  }
  function injectUI() {
    var inner = document.querySelector('#cfpTkModal > div'); if (!inner || document.getElementById('cfpGistBox')) return;
    var box = document.createElement('div'); box.id = 'cfpGistBox';
    box.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid #eee4d4';
    box.innerHTML =
      '<div style="font:700 14px system-ui;margin-bottom:4px">🔁 Auto-sync (GitHub · no popups)</div>' +
      '<div id="cfpGistStatus" style="font-size:12px;color:#6b7385;margin:0 0 10px;line-height:1.4"></div>' +
      '<div id="cfpGistFields" style="display:none">' +
        '<input id="cfpGistTok" type="password" placeholder="Paste GitHub token (gist scope)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
          'style="width:100%;padding:10px;border:1px solid #dfe3ee;border-radius:10px;font:13px system-ui;margin-bottom:8px;box-sizing:border-box">' +
        btn('cfpGistConnect', 'Connect & sync', true, true) +
        '<a href="https://github.com/settings/tokens/new?scopes=gist&description=CFP+Study+Lab+sync" target="_blank" rel="noopener" ' +
          'style="display:block;text-align:center;font-size:12px;color:#2d8a4e;text-decoration:none;margin-bottom:4px">→ Create a token on GitHub (gist scope)</a>' +
      '</div>' +
      btn('cfpGistNow', '⟳ Sync now', true, false) +
      btn('cfpGistOff', 'Disconnect', false, false);
    var stamp = inner.querySelector('div[style*="9aa3b5"]');
    inner.insertBefore(box, stamp || null);

    document.getElementById('cfpGistConnect').onclick = function () {
      var el = document.getElementById('cfpGistTok'), v = (el && el.value || '').trim();
      if (!v) { status('Paste a token first.'); return; }
      try { localStorage.setItem(TOK, v); } catch (e) {}
      if (el) el.value = '';
      status('Connecting…');
      fullSync().then(function (changed) { refreshUI(); if (changed) setTimeout(function () { location.reload(); }, 600); })
        .catch(function (e) { if (/bad token/.test(e && e.message || '')) { try { localStorage.removeItem(TOK); } catch (_) {} } refreshUI(); });
    };
    document.getElementById('cfpGistNow').onclick = function () {
      fullSync().then(function (changed) { if (changed) setTimeout(function () { location.reload(); }, 600); }).catch(function () {});
    };
    document.getElementById('cfpGistOff').onclick = function () {
      try { localStorage.removeItem(TOK); localStorage.removeItem(GID); } catch (e) {}
      refreshUI(); status('Disconnected. Local progress kept on this device.');
    };
    refreshUI();
  }

  // ---- wire up ----
  function init() {
    injectUI();
    // wrap save() so studying schedules a silent background push (chains after cfp-sync's wrap)
    if (typeof window.save === 'function' && !window.save.__cfpGistWrapped) {
      var orig = window.save;
      window.save = function () { var r = orig.apply(this, arguments); schedulePush(); return r; };
      window.save.__cfpGistWrapped = true;
    }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') pushOnly(); });
    window.addEventListener('online', function () { if (enabled()) schedulePush(); });
    // On load, if connected: pull+merge+push once. The PAT never expires, so this is
    // fully silent — no popup on any platform (this is the whole point vs. Drive sync).
    if (enabled()) {
      status('Auto-syncing…');
      fullSync().then(function (changed) { if (changed) setTimeout(function () { location.reload(); }, 600); }).catch(function () {});
    }
  }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
