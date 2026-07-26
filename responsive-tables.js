/* Responsive tables (phone-only vertical stacking).
 *
 * On narrow phone screens the wide comparison tables in the Kaplan/AI slide
 * decks and the Interactive Readers used to require sideways scrolling (they
 * carry a min-width and sit in a horizontal-scroll box). This shared, self-
 * contained script turns each table into a stack of vertical "cards" on
 * phone-width screens only — one card per row, every cell shown as a
 * LABEL (its column header) + value — so nothing runs off the right edge.
 * Wider screens (tablet/desktop, landscape) keep the normal table.
 *
 * Reader- and deck-agnostic: it injects its own CSS (with sensible var()
 * fallbacks) and reads each table's own <thead> for the labels, so it needs
 * no per-file markup changes. Idempotent + safe to load more than once, and
 * re-scans after late DOM changes (reader-theme wraps tables after load;
 * readers switch tabs). */
(function () {
  var CSS = [
    '@media (max-width:560px){',
      '.tbl-scroll.rt-open{overflow-x:visible;border:0;-webkit-overflow-scrolling:auto;}',
      'table.rt-stack{display:block;min-width:0!important;width:100%!important;',
        'border:0!important;font-size:14px!important;}',
      'table.rt-stack caption{display:block;padding:0 2px 8px;}',
      'table.rt-stack thead{display:none!important;}',
      'table.rt-stack tbody{display:block;}',
      'table.rt-stack tbody tr{display:block;margin:0 0 12px;padding:2px 0;',
        'border:1px solid rgba(31,77,58,.20);border-left:4px solid var(--green,#1f4d3a);',
        'border-radius:12px;overflow:hidden;background:var(--card,#fffdf8);}',
      'table.rt-stack tbody td,table.rt-stack tbody th{display:block;width:auto!important;',
        'text-align:left!important;white-space:normal!important;border:0!important;',
        'background:transparent!important;padding:8px 14px!important;}',
      'table.rt-stack tbody tr>*+*{border-top:1px solid rgba(0,0,0,.07)!important;}',
      'table.rt-stack tbody [data-rtlabel]::before{content:attr(data-rtlabel);display:block;',
        'font:800 10px/1.3 system-ui,-apple-system,sans-serif;letter-spacing:.04em;',
        'text-transform:uppercase;color:var(--muted,#897357);margin-bottom:3px;}',
      'table.rt-stack tbody tr>:first-child{font-weight:700;}',
    '}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('rt-stack-css')) return;
    var s = document.createElement('style');
    s.id = 'rt-stack-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // Column labels from the table's own header (last header row handles grouped
  // headers). Returns null when there's no usable header.
  function labelsFor(tbl) {
    var head = tbl.tHead;
    if (!head || !head.rows.length) return null;
    var hr = head.rows[head.rows.length - 1];
    var out = [];
    for (var i = 0; i < hr.cells.length; i++) {
      out.push((hr.cells[i].textContent || '').replace(/\s+/g, ' ').trim());
    }
    return out;
  }

  function process(root) {
    var tables = (root || document).getElementsByTagName('table');
    for (var t = 0; t < tables.length; t++) {
      var tbl = tables[t];
      // Always make sure a wrapping scroll box opens up (a reader may wrap the
      // table only after our first pass), even for already-processed tables.
      var par = tbl.parentNode;
      if (par && par.classList && par.classList.contains('tbl-scroll')) par.classList.add('rt-open');

      if (tbl.getAttribute('data-rt')) continue;
      tbl.setAttribute('data-rt', '1');

      var labels = labelsFor(tbl);
      var body = tbl.tBodies && tbl.tBodies[0];
      if (labels && body) {
        for (var r = 0; r < body.rows.length; r++) {
          var cells = body.rows[r].cells;
          for (var c = 0; c < cells.length && c < labels.length; c++) {
            if (labels[c] && !cells[c].hasAttribute('data-rtlabel')) {
              cells[c].setAttribute('data-rtlabel', labels[c]);
            }
          }
        }
      }
      tbl.classList.add('rt-stack');
    }
  }

  function run() { injectCSS(); process(document); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);           // catch reader-theme's post-load table wrapping
  document.addEventListener('rt:rescan', run);    // manual hook if ever needed
})();
