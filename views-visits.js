/* skyPerformance: E5 site visit and rounding. An eight section instrument built
   for a tablet on site, with photos, geo match, duration and section summaries. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    var v = APP.visits();
    return APP.tabs([
      ['due', 'Scheduled', '#/visits/due', v.filter(function (x) { return x.status === 'Scheduled'; }).length],
      ['active', 'In progress', '#/visits/active', v.filter(function (x) { return x.status === 'In progress'; }).length],
      ['done', 'Completed', '#/visits/done', v.filter(function (x) { return x.status === 'Completed'; }).length],
      ['all', 'Everything', '#/visits', v.length]
    ], active);
  }

  function list(tab) {
    var rows = APP.visits().filter(function (v) {
      if (tab === 'due') return v.status === 'Scheduled';
      if (tab === 'active') return v.status === 'In progress';
      if (tab === 'done') return v.status === 'Completed';
      return true;
    });
    return APP.callout('A walkthrough is 118 questions across eight sections, and it takes about 95 minutes. It is built to be completed on a tablet while walking, not typed up afterwards from memory, which is why duration and location are on the record.', 'is-info', 'building-2') +
      (APP.canRunVisits() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export visit log', 'btn-surface', 'download', 'data-act="export" data-what="The site visit log"', 'is-sm') +
        APP.btn('Start a walkthrough', 'btn-solid', 'circle-play', 'data-act="new-visit"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Visit' }, { t: 'Community' }, { t: 'Leader' }, { t: 'Date' }, { t: 'Progress' }, { t: 'Duration', num: true }, { t: 'Findings', num: true }, { t: 'Status' }, { t: '' }],
        rows.map(function (v) {
          return { cells: [
            '<span class="cell-strong">' + esc(v.id) + '</span><span class="cell-sub">' + (v.geo ? esc(v.geo.split(',')[0]) : 'Not started') + '</span>',
            esc(D.cmName(v.cm)) + '<span class="cell-sub">' + esc(D.cm(v.cm).city) + '</span>',
            APP.personLine(v.by, null, 28),
            esc(v.date),
            '<div style="min-width:120px">' + APP.progress(Math.round(v.answered / v.total * 100)) + '<span class="cell-sub">' + v.answered + ' of ' + v.total + '</span></div>',
            v.mins ? v.mins + ' min' : '—',
            v.findings != null ? String(v.findings) : '—',
            APP.statusBadge(v.status),
            APP.btn(v.status === 'In progress' ? 'Resume' : v.status === 'Scheduled' ? 'Start' : 'Open', v.status === 'Completed' ? 'btn-surface' : 'btn-solid', null, 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm')
          ] };
        }), { empty: 'No visits here.' }) + '</section>';
  }

  function overview(v) {
    var done = v.status === 'Completed';
    var secs = D.VISIT_SECTIONS.map(function (s) {
      var d = done ? s.qs : (v.status === 'Scheduled' ? 0 : s.done);
      var pct = Math.round(d / s.qs * 100);
      return '<button class="card vs-card" data-act="goto" data-href="#/visits/' + v.id + '/' + s.key + '">' +
        '<div class="vs-head"><span class="vs-ic">' + ic(s.ic, 18) + '</span><span class="vs-name">' + esc(s.name) + '</span>' +
        (pct === 100 ? APP.badge('Complete', 'is-success') : pct > 0 ? APP.badge(pct + '%', 'is-info') : APP.badge('Not started', 'is-neutral')) + '</div>' +
        APP.progress(pct, pct === 100 ? '' : pct === 0 ? '' : 'is-warn') +
        '<div class="vs-items">' + s.items.slice(0, 3).map(function (i) { return '<span class="vs-item">' + ic('circle-dot', 12) + esc(i) + '</span>'; }).join('') + '</div>' +
        '<span class="rowlink">' + (done ? 'Read answers' : 'Open section') + ' · ' + s.qs + ' questions</span></button>';
    }).join('');
    var body =
      (v.status === 'In progress' ? APP.callout('<b>In progress.</b> ' + v.answered + ' of ' + v.total + ' answered, ' + v.mins + ' minutes on site, ' + v.photos + ' photos attached. The draft is saved continuously: closing the tablet loses nothing.', 'is-info', 'clock') : '') +
      (v.status === 'Scheduled' ? APP.callout('<b>Not started.</b> Open any section to begin. The geo match runs when you answer the first question, not when you open the form.', 'is-warning', 'map-pin') : '') +
      '<div class="split-2"><section class="card">' + APP.panelHead('Sections', 'Answer in any order. Each section carries its own summary.') +
      '<div class="visit-grid">' + secs + '</div></section>' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Visit record') +
      APP.dataList([
        ['Community', esc(D.cmName(v.cm))],
        ['Hierarchy path', '<span class="cell-id">' + esc(APP.crumbPath(v.cm)) + '</span>'],
        ['Leader', APP.personLine(v.by, null, 28, false)],
        ['Date', esc(v.date)],
        ['Duration', v.mins ? v.mins + ' minutes' : 'Not started'],
        ['Location', v.geo ? APP.badge(esc(v.geo), 'is-success', 'map-pin') : APP.badge('Not captured yet', 'is-neutral', 'map-pin')],
        ['Photos', String(v.photos)],
        ['Progress', v.answered + ' of ' + v.total + ' questions']
      ]) + '</section>' +
      (done ? '<section class="card">' + APP.panelHead('Result', 'Score is the share of answered questions that met the standard.') +
        '<div class="ph-stats"><div class="ph-stat"><span class="ph-stat-v">' + v.score + '%</span><span class="ph-stat-l">Visit score</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + v.findings + '</span><span class="ph-stat-l">Findings</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + D.ACTIONS.filter(function (a) { return a.from === v.id; }).length + '</span><span class="ph-stat-l">Action items</span></div></div>' +
        '<div style="margin-top:var(--space-4)">' + APP.btn('Render the full PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="Every one of the 118 questions renders with its answer, including the ones marked not applicable." data-k="info"', 'is-sm') + '</div>' +
        '</section>' : '') +
      '<section class="card">' + APP.panelHead('Photos', 'Attached to the section they were taken in.') +
      '<div class="photo-row">' + (v.photos ? Array.apply(null, Array(Math.min(v.photos, 6))).map(function () { return '<span class="photo-tile">' + ic('image', 18) + '</span>'; }).join('') : '') +
      (v.status !== 'Completed' ? '<button class="photo-tile photo-add" data-act="toast" data-t="Camera" data-b="On a tablet this opens the camera. The photo attaches to the open section and carries the same timestamp and location as the answer." data-k="info">' + ic('camera', 18) + '</button>' : '') +
      '</div></section>' +
      '<section class="card">' + APP.panelHead('Action items raised') +
      (function () {
        var acts = D.ACTIONS.filter(function (a) { return a.from === v.id; });
        return acts.length ? '<div class="wq">' + acts.map(APP.actionRow).join('') + '</div>' : '<p class="mini-note">None yet. Anything found in a section becomes one here.</p>';
      })() + '</section></div></div>';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Site visits', '#/visits'], [v.id, '#']],
      title: D.cmName(v.cm) + ' walkthrough', desc: v.id + ' · ' + v.date + ' · ' + P(v.by).name,
      action: v.status === 'Completed' ? APP.statusBadge('Completed') : APP.btn(v.status === 'Scheduled' ? 'Start the walkthrough' : 'Resume', 'btn-solid', 'circle-play', 'data-act="goto" data-href="#/visits/' + v.id + '/' + D.VISIT_SECTIONS[0].key + '"'),
      body: body
    });
  }

  function section(v, key) {
    var s = D.VISIT_SECTIONS.filter(function (x) { return x.key === key; })[0];
    var idx = D.VISIT_SECTIONS.map(function (x) { return x.key; }).indexOf(key);
    var done = v.status === 'Completed';
    var qs = [];
    s.items.forEach(function (q) { qs.push(q); });
    while (qs.length < Math.min(s.qs, 8)) qs.push(s.items[qs.length % s.items.length]);
    var rail = '<aside class="runner-rail">' + D.VISIT_SECTIONS.map(function (x, i) {
      var d = done ? x.qs : (v.status === 'Scheduled' ? 0 : x.done);
      return '<button class="rr-step' + (x.key === key ? ' is-active' : '') + (d === x.qs ? ' is-done' : '') + '" data-act="goto" data-href="#/visits/' + v.id + '/' + x.key + '">' +
        '<span class="rr-num">' + (d === x.qs ? '✓' : i + 1) + '</span><span class="rr-text"><span class="rr-t">' + esc(x.name) + '</span><span class="rr-sub">' + d + ' of ' + x.qs + '</span></span></button>';
    }).join('') + '<div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)">' +
      APP.btn('Back to the visit', 'btn-surface', 'chevron-left', 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm') +
      (done ? '' : APP.btn('Save and leave', 'btn-ghost', 'file-down', 'data-act="toast" data-t="Saved" data-b="The draft saves on every answer. Nothing is lost if the tablet sleeps."', 'is-sm')) + '</div></aside>';

    var body = '<div class="runner-head"><span class="wq-ic">' + ic(s.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(s.name) + '</span><span class="wq-s">' + esc(v.id) + ' · ' + esc(D.cmName(v.cm)) + ' · section ' + (idx + 1) + ' of 8</span></div>' +
      '<span class="rh-spacer"></span><span class="rh-geo">' + ic('map-pin', 14) + (v.geo ? 'Geo matched' : 'Not captured') + '</span>' +
      APP.badge((done ? s.qs : v.status === 'Scheduled' ? 0 : s.done) + ' of ' + s.qs + ' answered', 'is-info') + '</div>' +
      '<div class="runner">' + rail + '<div>' +
      '<section class="card">' + APP.panelHead(s.name, 'Answer what you can see. Not applicable is a real answer and is stored as one.') +
      qs.map(function (q, i) {
        var pre = done || (v.status === 'In progress' && i < s.done / s.qs * qs.length);
        return '<div class="q-row"><span class="q-text">' + esc(q) + '</span><span class="q-score">' +
          ['2', '1', 'na'].map(function (opt) {
            var cls = opt === '2' ? 'is-yes' : opt === '1' ? 'is-no' : 'is-na';
            var label = opt === '2' ? '2 Yes' : opt === '1' ? '1 No' : 'N/A';
            var on = pre && ((i === 1 && opt === '1') || (i !== 1 && opt === '2'));
            return '<button class="q-btn ' + cls + (on ? ' is-on' : '') + '" data-act="visit-score" aria-pressed="' + on + '">' + label + '</button>';
          }).join('') + '</span></div>';
      }).join('') +
      '<p class="mini-note" style="margin-top:var(--space-4)">Showing ' + qs.length + ' of ' + s.qs + ' questions in this section. The full instrument runs to 118.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Section summary', 'One paragraph per section. It is what the Executive Director reads at the debrief.') +
      APP.field('What you found', '<textarea class="textarea" placeholder="Corridors clear and exits unobstructed. Water temperature out of range at the east wing sink, logged as a finding."></textarea>') +
      '<div class="photo-row">' + (done || v.status === 'In progress' ? '<span class="photo-tile">' + ic('image', 18) + '</span>' : '') +
      '<button class="photo-tile photo-add" data-act="toast" data-t="Camera" data-b="Photos attach to this section with the same timestamp and location as the answers." data-k="info">' + ic('camera', 18) + '</button></div>' +
      '<div style="margin-top:var(--space-4)">' + APP.btn('Raise an action item from this section', 'btn-soft', 'plus', 'data-act="toast" data-t="Action item" data-b="It gets an owner and a due date, and it reappears on the next visit form until it is closed."', 'is-sm') + '</div>' +
      '</section>' +
      '<div class="runner-foot">' +
      (idx > 0 ? APP.btn('Previous section', 'btn-surface', 'chevron-left', 'data-act="goto" data-href="#/visits/' + v.id + '/' + D.VISIT_SECTIONS[idx - 1].key + '"') : '') +
      '<span class="rf-note">Section ' + (idx + 1) + ' of 8</span><span class="rf-spacer"></span>' +
      (idx < 7 ? APP.btn('Next section', 'btn-solid', 'chevron-right', 'data-act="goto" data-href="#/visits/' + v.id + '/' + D.VISIT_SECTIONS[idx + 1].key + '"')
        : APP.btn('Finish and debrief', 'btn-solid', 'check', 'data-act="finish-visit" data-id="' + v.id + '"')) +
      '</div></div></div>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['Site visits', '#/visits'], [v.id, '#/visits/' + v.id], [s.name, '#']],
      title: s.name, desc: D.cmName(v.cm) + ' · ' + v.id, scope: false, body: body
    });
  }

  APP.VIEWS.visits = function (r) {
    if (r[1] && r[1].indexOf('SV-') === 0) {
      var v = D.visit(r[1]);
      if (!v) return APP.page({ crumbs: [['Home', '#/home'], ['Site visits', '#/visits']], title: 'Visit not found', desc: '', body: APP.emptyState('building-2', 'Not in your scope', 'Visits are bound to the community they were run in.', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/visits"')) });
      return r[2] ? section(v, r[2]) : overview(v);
    }
    var tab = r[1] || 'all';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Site visits', '#/visits']],
      title: APP.is('quality') ? 'Rounding' : 'Site visits',
      desc: 'A long form instrument, completed on site, with a PDF that renders every question and answer.',
      tabs: tabsFor(tab), body: list(tab)
    });
  };

  APP.ACT['new-visit'] = function () {
    APP.dialog({
      title: 'Start a walkthrough', sub: 'The instrument is the same everywhere. Only the community changes.',
      body: APP.field('Community', APP.dd('v-cm', APP.scopeCms().map(function (c) { return [c, D.cmName(c) + ', ' + D.cm(c).city]; }), APP.scopeCms()[0], 'dd-block'), null, true) +
        APP.field('Instrument', APP.dd('v-ft', [['FT-CWT', 'Community walkthrough, 118 questions'], ['FT-MRA', 'Med room audit, 22 questions'], ['FT-INF', 'Infection control round, 16 questions'], ['FT-DIN', 'Dining service observation, 19 questions']], 'FT-CWT', 'dd-block'), null, true) +
        APP.callout('The geo match runs on the first answer. If you are not on site, the record says so rather than refusing to open.', 'is-info', 'map-pin'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Start', 'btn-solid', 'circle-play', 'data-act="goto" data-href="#/visits/SV-1190/arrival"')
    });
  };
  APP.ACT['visit-score'] = function (el) {
    var row = el.closest('.q-score');
    row.querySelectorAll('.q-btn').forEach(function (b) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
    el.classList.add('is-on'); el.setAttribute('aria-pressed', 'true');
  };
  APP.ACT['finish-visit'] = function (el) {
    var v = D.visit(el.getAttribute('data-id'));
    APP.dialog({
      title: 'Finish and debrief', sub: v.id + ' · ' + D.cmName(v.cm),
      body: APP.callout('A walkthrough is not finished when the questions are answered. It is finished when the Executive Director has heard it. The debrief is the last section for a reason.', 'is-info', 'handshake') +
        APP.dataList([
          ['Questions answered', v.answered + ' of ' + v.total],
          ['Time on site', v.mins + ' minutes'],
          ['Findings', '6 below standard'],
          ['Action items to raise', '3'],
          ['Debriefed', APP.badge('Not yet', 'is-warning')]
        ]) +
        APP.field('Single biggest risk found', '<textarea class="textarea" placeholder="Agency use above 10% for a fourth month. It is behind the call light and satisfaction numbers."></textarea>', null, true) +
        '<label class="checkbox"><input type="checkbox"><span>I debriefed the Executive Director before leaving the building.</span></label>',
      footer: APP.btn('Keep working', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Submit the visit', 'btn-solid', 'send', 'data-act="toast" data-t="Visit submitted" data-b="Immutable. The three action items are now on their owners to do lists and will print on the next visit form."')
    });
  };
})();
