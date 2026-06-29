/* Cloud sync (Google Drive) — opt-in, offline-first. Stores the progress save as a
 * private file in the user's Drive **app-data folder** (scope drive.appdata: this app
 * can ONLY see its own file, never your other Drive files). Uses the mergeable memory
 * model (window.cfpMergeState) so multiple devices reconcile instead of clobbering.
 *
 * The app keeps working fully offline on localStorage; this layer loads Google's
 * sign-in script ONLY when you connect, and syncs when online + signed in.
 * UI is injected into the ⋯ Backup & tools panel. Loaded after the app + flashcards.js.
 */
(function () {
  'use strict';
  if (window.__cfpSync) return; window.__cfpSync = true;

  var CLIENT_ID = '543572088355-5dlhcvovkpqgcoghm125acpcgd082seb.apps.googleusercontent.com';
  var SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  var FILE = 'cfp-study-progress.json';
  var LS = 'cfpStudyHome.v1', FLAG = 'cfpSyncEnabled', AT = 'cfpSyncAt';

  var token = null, tokenClient = null, fileId = null, busy = false, pushTimer = null, pendingRej = null;

  function enabled() { try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return false; } }
  function setEnabled(v) { try { v ? localStorage.setItem(FLAG, '1') : localStorage.removeItem(FLAG); } catch (e) {} }
  function localState() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function merge(a, b) { return (typeof window.cfpMergeState === 'function') ? window.cfpMergeState(a, b) : (b || a || {}); }
  function online() { return navigator.onLine !== false; }

  // ---- Google sign-in (lazy: only loaded when the user connects) ----
  function loadGIS() {
    return new Promise(function (res, rej) {
      if (window.google && google.accounts && google.accounts.oauth2) return res();
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error('Could not reach Google (are you offline?)')); };
      document.head.appendChild(s);
    });
  }
  function ensureTokenClient() {
    if (tokenClient) return;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID, scope: SCOPE, callback: function () {},
      // Fires when a token request fails without a token response (e.g. a silent
      // prompt:'none' attempt that needs interaction). Reject the pending promise
      // so silent refreshes fail quietly instead of hanging.
      error_callback: function (err) { var r = pendingRej; pendingRej = null; if (r) r(new Error((err && err.type) || 'sign-in failed')); }
    });
  }
  function getToken(interactive) {
    // Reuse the in-memory token (valid ~1h). For interactive calls (user gesture) we
    // open the normal consent flow. For background/auto calls we attempt a SILENT
    // refresh with prompt:'none' — Google returns a token without any UI while the
    // user's Google session + prior consent are alive, and fails quietly otherwise.
    // So the app still NEVER pops up on its own, but background pushes keep working
    // across token expiry and fresh app loads (no manual "Sync now" needed each time).
    if (token) return Promise.resolve(token);
    if (!interactive && !enabled()) return Promise.reject(new Error('not connected'));
    if (!interactive && !online()) return Promise.reject(new Error('offline'));
    return loadGIS().then(function () {
      return new Promise(function (res, rej) {
        ensureTokenClient();
        pendingRej = rej;
        tokenClient.callback = function (resp) {
          pendingRej = null;
          if (resp && resp.access_token) { token = resp.access_token; setTimeout(function () { token = null; }, 55 * 60 * 1000); res(token); }
          else rej(new Error((resp && resp.error) || (interactive ? 'sign-in cancelled' : 'silent refresh failed')));
        };
        try { tokenClient.requestAccessToken(interactive ? {} : { prompt: 'none' }); } catch (e) { pendingRej = null; rej(e); }
      });
    });
  }

  // ---- Drive REST (app-data folder) ----
  function api(url, opts) { opts = opts || {}; opts.headers = opts.headers || {}; opts.headers.Authorization = 'Bearer ' + token; return fetch(url, opts); }
  function findFile() {
    return api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q=' + encodeURIComponent("name='" + FILE + "'"))
      .then(function (r) { return r.json(); })
      .then(function (j) { fileId = (j.files && j.files[0] && j.files[0].id) || null; return fileId; });
  }
  function downloadFile() {
    if (!fileId) return Promise.resolve(null);
    return api('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function uploadFile(data) {
    var body = JSON.stringify(data);
    if (fileId) return api('https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body });
    return api('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: FILE, parents: ['appDataFolder'] }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { fileId = j.id; return api('https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: body }); });
  }

  // pull → merge → push. Returns whether local data changed.
  function fullSync(interactive) {
    if (busy) return Promise.resolve(false);
    busy = true; status('Syncing…');
    return getToken(interactive).then(findFile).then(downloadFile).then(function (remote) {
      var loc = localState();
      var merged = merge(loc, remote || {});
      var changed = JSON.stringify(merged) !== JSON.stringify(loc);
      return uploadFile(merged).then(function () {
        localStorage.setItem(LS, JSON.stringify(merged));
        setEnabled(true); try { localStorage.setItem(AT, String(Date.now())); } catch (e) {}
        busy = false; refreshUI(); status('Synced ✓');
        return changed;
      });
    }).catch(function (e) { busy = false; refreshUI(); status('⚠ ' + (e.message || e)); throw e; });
  }
  // background push only (upload current local; pull happens on next load — safe w/o touching running state)
  function pushOnly() {
    if (busy || !enabled() || !online()) return;
    getToken(false).then(findFile).then(function () { return uploadFile(localState()); })
      .then(function () { try { localStorage.setItem(AT, String(Date.now())); } catch (e) {} refreshUI(); })
      .catch(function () {});
  }
  function schedulePush() { if (!enabled()) return; clearTimeout(pushTimer); pushTimer = setTimeout(pushOnly, 8000); }

  // ---- UI (injected into the ⋯ Backup & tools modal) ----
  function status(m) { var s = document.getElementById('cfpSyncStatus'); if (s) s.textContent = m; }
  function lastSyncText() {
    var t = 0; try { t = +localStorage.getItem(AT) || 0; } catch (e) {}
    if (!enabled()) return 'Not connected — your progress stays on this device only.';
    if (!t) return 'Connected.';
    var d = new Date(t);
    return 'Last synced ' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function refreshUI() {
    var on = enabled();
    var c = document.getElementById('cfpSyncConnect'), n = document.getElementById('cfpSyncNow'), o = document.getElementById('cfpSyncOff');
    if (c) c.style.display = on ? 'none' : 'block';
    if (n) n.style.display = on ? 'block' : 'none';
    if (o) o.style.display = on ? 'block' : 'none';
    status(lastSyncText());
  }
  function btn(id, label, primary) {
    return '<button id="' + id + '" style="width:100%;padding:11px;border:' + (primary ? 'none' : '1px solid #dfe3ee') +
      ';border-radius:12px;background:' + (primary ? 'linear-gradient(135deg,#4285F4,#3367d6);color:#fff' : '#fff;color:#1d2433') +
      ';font:600 14px system-ui;cursor:pointer;margin-bottom:8px;display:none">' + label + '</button>';
  }
  function injectUI() {
    var inner = document.querySelector('#cfpTkModal > div'); if (!inner || document.getElementById('cfpSyncBox')) return;
    var box = document.createElement('div'); box.id = 'cfpSyncBox';
    box.style.cssText = 'margin-top:14px;padding-top:14px;border-top:1px solid #eee4d4';
    box.innerHTML =
      '<div style="font:700 14px system-ui;margin-bottom:4px">☁ Cloud sync (Google Drive)</div>' +
      '<div id="cfpSyncStatus" style="font-size:12px;color:#6b7385;margin:0 0 10px;line-height:1.4"></div>' +
      btn('cfpSyncConnect', 'Connect Google Drive', true) +
      btn('cfpSyncNow', '⟳ Sync now', true) +
      btn('cfpSyncOff', 'Disconnect', false);
    var stamp = inner.querySelector('div[style*="9aa3b5"]');
    inner.insertBefore(box, stamp || null);

    document.getElementById('cfpSyncConnect').style.display = 'block';
    document.getElementById('cfpSyncConnect').onclick = function () {
      status('Opening Google sign-in…');
      fullSync(true).then(function (changed) { if (changed) setTimeout(function () { location.reload(); }, 600); }).catch(function () {});
    };
    document.getElementById('cfpSyncNow').onclick = function () {
      fullSync(true).then(function (changed) { if (changed) setTimeout(function () { location.reload(); }, 600); }).catch(function () {});
    };
    document.getElementById('cfpSyncOff').onclick = function () {
      try { if (token && window.google && google.accounts && google.accounts.oauth2) google.accounts.oauth2.revoke(token, function () {}); } catch (e) {}
      token = null; setEnabled(false); refreshUI(); status('Disconnected. Local progress kept.');
    };
    refreshUI();
  }

  // ---- wire up ----
  function init() {
    injectUI();
    // wrap save() so studying schedules a background push
    if (typeof window.save === 'function' && !window.save.__cfpWrapped) {
      var orig = window.save;
      window.save = function () { var r = orig.apply(this, arguments); schedulePush(); return r; };
      window.save.__cfpWrapped = true;
    }
    // Background push self-refreshes its token silently (prompt:'none'), so it works
    // even after the ~1h token expires or a fresh app load — and still never pops up.
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') pushOnly(); });
    window.addEventListener('online', function () { if (enabled()) schedulePush(); });
    // On load, if connected, do ONE silent token refresh + pull/merge. prompt:'none'
    // shows no UI: if the Google session/consent is alive we sync automatically; if not,
    // we fall back to nudging the user to tap "Sync now" (no popup either way).
    if (enabled()) {
      status('Connected — syncing…');
      getToken(false).then(function () { return fullSync(false); })
        .then(function (changed) { if (changed) setTimeout(function () { location.reload(); }, 600); })
        .catch(function () { status('Connected — tap “Sync now” to pull the latest.'); });
    }
  }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
