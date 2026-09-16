/* skyPerformance: Records. Every documented form and location review, plus the
   rendered document, the generated letter, and the employee file export. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    if (APP.is('employee')) return APP.tabs([
      ['coaching', 'Coaching about me', '#/records', APP.forms().length],
      ['letters', 'Letters', '#/records/letters', APP.cases().filter(function (c) { return c.letter; }).length]
    ], active);
    var t = [
      ['coaching', 'Coaching forms', '#/records', APP.forms().length],
      ['reviews', 'Location reviews', '#/records/reviews', APP.reviews().length]
    ];
    if (APP.isHR()) {
      t.push(['deleted', 'Deleted', '#/records/deleted', D.DELETED_FORMS.length]);
      t.push(['exports', 'Exports', '#/records/exports']);
    }
    return APP.tabs(t, active);
  }

  function coaching() {
    var f = S.f, q = (f.recq || '').toLowerCase();
    var list = APP.forms().filter(function (x) {
      if (f.recType && f.recType !== 'All' && x.ft !== f.recType) return false;
      if (f.recOut && f.recOut !== 'All' && x.outcome !== f.recOut) return false;
      if (q && (x.id + ' ' + P(x.emp).name + ' ' + x.summary + ' ' + D.formType(x.ft).name).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var allF = APP.forms();
    return APP.glance([[allF.length, 'Records'], [allF.filter(function (x) { return x.outcome === 'Needs improvement'; }).length, 'Needs improvement', 'is-bad'], [allF.filter(function (x) { return x.outcome === 'Recognition'; }).length, 'Recognition', 'is-good'], [allF.filter(function (x) { return x.geoFlag; }).length, 'Recorded off site', 'is-warn']]) +
      '<div class="filter-bar">' +
      '<div class="search" style="min-width:260px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="recq" value="' + esc(f.recq || '') + '" placeholder="Person, form id or a word in the summary"></div>' +
      APP.dd('recType', [['All', 'All form types']].concat(D.FORM_TYPES.map(function (t) { return [t.id, t.name]; })), f.recType || 'All') +
      APP.dd('recOut', [['All', 'Any outcome'], ['Needs improvement', 'Needs improvement'], ['Meets standard', 'Meets standard'], ['Recognition', 'Recognition'], ['Documented', 'Documented']], f.recOut || 'All') +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The filtered history as CSV"', 'is-sm') +
      (APP.isHR() ? APP.btn('Employee file export', 'btn-solid', 'package', 'data-act="file-export"', 'is-sm') : '') +
      '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Form' }, { t: 'Employee' }, { t: 'Completed by' }, { t: 'Date' }, { t: 'Outcome' }, { t: 'Duration', num: true }, { t: 'Location check' }, { t: '' }],
        list.map(function (x) {
          return { cells: [
            '<span class="cell-strong">' + esc(D.formType(x.ft).name) + '</span><span class="cell-sub">' + esc(x.id) + '</span>',
            APP.personLine(x.emp, null, 28), APP.personLine(x.by, null, 28),
            esc(x.date) + '<span class="cell-sub">' + esc(x.time) + '</span>',
            APP.statusBadge(x.outcome), x.mins + ' min',
            x.geoFlag ? APP.badge('Off site', 'is-warning', 'map-pin') : APP.badge('Matched', 'is-success', 'map-pin'),
            APP.btn('Open', 'btn-surface', 'file-text', 'data-act="open-form" data-id="' + x.id + '"', 'is-sm')
          ] };
        }), { empty: 'No records match. Retrieval is scoped to your branch of the chart.' }) + '</section>' +
      APP.why('Why records never change', '<p>Every record renders as the original document with every answer intact. A correction creates a new version and keeps the old one.</p>');
  }

  function reviews() {
    var list = APP.reviews();
    return APP.hint('118 questions, eight sections, completed on site. Start one from <b>Start a form</b>, Operational review.', 'building-2') +
      APP.glance([[list.filter(function (v) { return v.status === 'Completed'; }).length, 'Completed', 'is-good'], [list.filter(function (v) { return v.status === 'In progress'; }).length, 'In progress'], [list.filter(function (v) { return v.status === 'Scheduled'; }).length, 'Scheduled'], [list.reduce(function (n, v) { return n + (v.findings || 0); }, 0), 'Findings', 'is-warn']]) +
      (APP.canRunForms() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export the review log', 'btn-surface', 'download', 'data-act="export" data-what="The location review log"', 'is-sm') +
        APP.btn('Start a review', 'btn-solid', 'circle-play', 'data-act="run-form" data-ft="FT-LOC"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Review' }, { t: 'Location' }, { t: 'By' }, { t: 'Date' }, { t: 'Progress' }, { t: 'Duration', num: true }, { t: 'Findings', num: true }, { t: 'Status' }, { t: '' }],
        list.map(function (v) {
          return { cells: [
            '<span class="cell-strong">' + esc(v.id) + '</span><span class="cell-sub">' + (v.photos ? v.photos + ' photos' : 'No photos') + '</span>',
            esc(D.locName(v.loc)) + '<span class="cell-sub">' + esc(D.loc(v.loc).type) + '</span>',
            APP.personLine(v.by, null, 28), esc(v.date),
            '<div style="min-width:110px">' + APP.progress(Math.round(v.answered / v.total * 100)) + '<span class="cell-sub">' + v.answered + ' of ' + v.total + '</span></div>',
            v.mins ? v.mins + ' min' : '—', v.findings != null ? String(v.findings) : '—',
            APP.statusBadge(v.status),
            v.status === 'Completed'
              ? APP.btn('Open', 'btn-surface', 'file-text', 'data-act="open-review" data-id="' + v.id + '"', 'is-sm')
              : APP.btn(v.status === 'In progress' ? 'Resume' : 'Start', 'btn-solid', null, 'data-act="run-form" data-ft="FT-LOC" data-review="' + v.id + '"', 'is-sm')
          ] };
        }), { empty: 'No reviews in your scope.' }) + '</section>';
  }

  function deleted() {
    return APP.hint('Deleted means removed from history, never from the file. Who, when and why are kept.', 'trash-2') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Form' }, { t: 'Employee' }, { t: 'Originally by' }, { t: 'Deleted by' }, { t: 'Deleted on' }, { t: 'Reason' }],
        D.DELETED_FORMS.map(function (x) {
          return { cells: ['<span class="cell-strong">' + esc(D.formType(x.ft).name) + '</span><span class="cell-sub">' + esc(x.id) + ' · ' + esc(x.date) + '</span>',
            APP.personLine(x.emp, null, 28), APP.personLine(x.by, null, 28), APP.personLine(x.deletedBy, null, 28), esc(x.deletedOn),
            '<span class="mini-note">' + esc(x.reason) + '</span>'] };
        })) + '</section>';
  }

  function exportsTab() {
    return APP.hint('Every export is logged against whoever asked for it.', 'package') +
      '<div class="card-grid">' +
      [['Completion by location', 'CSV, one row per location and manager', 'chart-column', false],
       ['Forms by type', 'CSV, counts and median duration', 'file-text', false],
       ['Case summary', 'CSV, one row per case', 'gavel', false],
       ['Case detail', 'CSV, one row per approval event', 'list-ordered', false],
       ['Org chart', 'CSV, as published by the HRIS', 'network', false],
       ['Employee file', 'One zip: forms, letters, action items, audit trail, manifest', 'package', true]
      ].map(function (x) {
        return '<section class="card vs-card"><div class="vs-head"><span class="vs-ic">' + ic(x[2], 18) + '</span><span class="vs-name">' + esc(x[0]) + '</span>' + (x[3] ? APP.badge('HR only', 'is-warning') : '') + '</div>' +
          '<p class="mini-note">' + esc(x[1]) + '</p>' +
          APP.btn(x[3] ? 'Build the package' : 'Export', x[3] ? 'btn-solid' : 'btn-surface', x[3] ? 'package' : 'download',
            x[3] ? 'data-act="file-export"' : 'data-act="export" data-what="' + esc(x[0]) + '"', 'is-sm') + '</section>';
      }).join('') + '</div>' +
      '<section class="card" style="margin-top:var(--space-5)">' + APP.panelHead('Export log', 'Who pulled what, and why. Kept for seven years.') +
      APP.table([{ t: 'Export' }, { t: 'Requested by' }, { t: 'Subject' }, { t: 'Reason' }, { t: 'When' }], [
        ['Employee file', 'grant', 'Dana Whitfield', 'Appeal hearing, reference HRG-2026-41', '15 Sep 2026 17:04'],
        ['Employee file', 'grant', 'Esther Vaneck', 'Unemployment claim response', '3 Sep 2026 11:20'],
        ['Completion by location', 'alexis', 'Northern Division', 'Monthly operations review', '1 Sep 2026 08:15'],
        ['Case summary', 'grant', 'All locations', 'Quarterly employee relations report', '1 Sep 2026 08:02']
      ].map(function (r) { return { cells: [esc(r[0]), APP.personLine(r[1], null, 28), esc(r[2]), '<span class="mini-note">' + esc(r[3]) + '</span>', esc(r[4])] }; })) + '</section>';
  }

  function letters() {
    var cases = APP.cases().filter(function (c) { return c.letter; });
    return cases.length ? cases.map(function (c) {
      var waiting = c.status === 'Pending approval';
      return '<section class="card">' + APP.panelHead(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name, c.id + ' · opened ' + c.opened + ' by ' + P(c.by).name, APP.statusBadge(c.disposition || c.status)) +
        (waiting ? APP.callout('This letter is still going through approval. You will be asked to acknowledge it once every approver has signed off. Acknowledging records that you received it, not that you agree with it.', 'is-warning', 'hourglass')
          : APP.callout('You acknowledged this letter on ' + esc(c.activated || c.opened) + '. Your comment is stored with it.', 'is-success', 'circle-check')) +
        APP.btn('Read the letter', 'btn-solid', 'file-text', 'data-act="open-letter" data-id="' + c.id + '"', 'is-sm') + '</section>';
    }).join('') : APP.emptyState('file-text', 'No letters on your record', 'Letters are generated only when a performance case reaches a step that requires one.', '');
  }

  APP.VIEWS.records = function (r) {
    var tab = r[1] || 'coaching';
    var body = tab === 'reviews' ? reviews() : tab === 'deleted' ? deleted() : tab === 'exports' ? exportsTab() : tab === 'letters' ? letters() : coaching();
    return APP.page({
      crumbs: [['Home', '#/home'], [APP.is('employee') ? 'My documents' : 'Records', '#/records']],
      title: APP.is('employee') ? 'My documents' : 'Records',
      desc: APP.is('employee') ? 'Everything on file about you.' : 'Find any record by person, id or date.',
      tabs: tabsFor(tab), body: body
    });
  };
  APP.INPUT.recq = function (el) { S.f.recq = el.value; var c = el.selectionStart; APP.rerender(); var n = document.querySelector('[data-input="recq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); } };

  /* ---------------- rendered documents ---------------- */
  APP.ACT['open-form'] = function (el) {
    var f = D.form(el.getAttribute('data-id'));
    if (!f) { APP.toast('Not found', 'That record is not in your scope.', 'warning'); return; }
    var ft = D.formType(f.ft), e = P(f.emp), qs = [], i = 0;
    if (f.scores) D.questionsFor(f.ft).forEach(function (sec) { sec.qs.forEach(function (q) { qs.push([q, f.scores[i++]]); }); });
    APP.dialog({
      title: 'Documented record', sub: f.id + ' · immutable since ' + f.date + ', ' + f.time, size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">' + esc(ft.name) + '</div>' +
        '<div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(APP.hierPath(f.loc, f.dept)) + '</div></div>' +
        '<div class="paper-id">' + esc(f.id) + '<br>' + esc(f.date) + '<br>' + esc(f.time) + '</div></div>' +
        '<h3>Who</h3>' + APP.dataList([
          ['Employee', esc(e.name) + ', ' + esc(e.title)],
          ['Completed by', esc(P(f.by).name) + ', ' + esc(P(f.by).title)],
          ['Outcome', APP.statusBadge(f.outcome) + (f.noCount != null ? ' <span class="mini-note">' + f.noCount + ' No score' + (f.noCount === 1 ? '' : 's') + '</span>' : '')]
        ]) +
        (qs.length ? '<h3>Observation</h3><div class="qa-list">' + qs.map(function (q) {
          return '<div class="qa-row"><span class="qa-q">' + esc(q[0]) + '</span><span class="qa-a">' + (q[1] === 2 ? APP.badge('2 Yes', 'is-success') : q[1] === 1 ? APP.badge('1 No', 'is-danger') : APP.badge('N/A', 'is-neutral')) + '</span></div>';
        }).join('') + '</div>' : '') +
        '<h3>Summary</h3><p>' + esc(f.summary) + '</p>' +
        '<h3>Action items</h3>' + (function () {
          var acts = D.ACTIONS.filter(function (a) { return a.from === f.id; });
          return acts.length ? '<div class="qa-list">' + acts.map(function (a) {
            return '<div class="qa-row"><span class="qa-q">' + esc(a.t) + '<span class="cell-sub">' + esc(a.id) + ' · owner ' + esc(P(a.owner).name) + ' · due ' + esc(a.due) + '</span></span><span class="qa-a">' + APP.statusBadge(a.status) + '</span></div>';
          }).join('') + '</div>' : '<p>None recorded.</p>';
        })() +
        '<h3>Record integrity</h3>' + APP.dataList([
          ['Duration', f.mins + ' minutes'],
          ['Location check', esc(f.geo)],
          ['Attestation', f.attested ? 'Signed by ' + esc(P(f.by).name) + ' at submission' : 'Not signed'],
          ['Employee acknowledgement', f.ack ? esc(f.ack) : APP.badge('Waiting', 'is-warning')],
          ['Hierarchy path', '<span class="cell-id">' + esc(APP.hierPath(f.loc, f.dept)) + '</span>'],
          ['Version', '1 of 1. A correction creates version 2 and keeps this one.']
        ]) +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(f.by).name) + ', completed by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(e.name) + ', acknowledged</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="Every question and answer renders, including the ones marked not applicable." data-k="info"') +
        (APP.is('employee') && !f.ack ? APP.btn('Acknowledge', 'btn-solid', 'signature', 'data-act="ack-form" data-id="' + f.id + '"') : '')
    });
  };
  APP.ACT['ack-form'] = function (el) {
    var f = D.form(el.getAttribute('data-id')); f.ack = D.TODAY;
    APP.closeOverlay(); APP.rerender(); APP.toast('Acknowledged', 'Your acknowledgement is timestamped and stored with ' + f.id + '.');
  };

  APP.ACT['open-review'] = function (el) {
    var v = D.review(el.getAttribute('data-id'));
    if (!v) { APP.toast('Not found', 'That review is not in your scope.', 'warning'); return; }
    var acts = D.ACTIONS.filter(function (a) { return a.from === v.id; });
    APP.dialog({
      title: 'Location review', sub: v.id + ' · ' + D.locName(v.loc) + ' · ' + v.date, size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">Location review</div><div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(APP.hierPath(v.loc)) + '</div></div>' +
        '<div class="paper-id">' + esc(v.id) + '<br>' + esc(v.date) + '</div></div>' +
        '<h3>Result</h3>' + APP.dataList([
          ['Completed by', esc(P(v.by).name) + ', ' + esc(P(v.by).title)],
          ['Questions answered', v.answered + ' of ' + v.total],
          ['Time on site', v.mins + ' minutes'],
          ['Location check', esc(v.geo || 'Not captured')],
          ['Photos attached', String(v.photos)],
          ['Score', v.score != null ? v.score + '%' : 'Not finished'],
          ['Findings below standard', v.findings != null ? String(v.findings) : '—']
        ]) +
        '<h3>Sections</h3><div class="qa-list">' + D.REVIEW_SECTIONS.map(function (s) {
          var d = v.status === 'Completed' ? s.qs : s.done;
          return '<div class="qa-row"><span class="qa-q">' + esc(s.name) + '<span class="cell-sub">' + s.items[0] + '</span></span><span class="qa-a">' + APP.badge(d + ' of ' + s.qs, d === s.qs ? 'is-success' : d ? 'is-warning' : 'is-neutral') + '</span></div>';
        }).join('') + '</div>' +
        '<h3>Action items raised</h3>' + (acts.length ? '<div class="qa-list">' + acts.map(function (a) {
          return '<div class="qa-row"><span class="qa-q">' + esc(a.t) + '<span class="cell-sub">' + esc(a.id) + ' · owner ' + esc(P(a.owner).name) + ' · due ' + esc(a.due) + '</span></span><span class="qa-a">' + APP.statusBadge(a.status) + '</span></div>';
        }).join('') + '</div>' : '<p>None recorded.</p>') +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(v.by).name) + ', completed by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(D.loc(v.loc).head).name) + ', debriefed</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="All 118 questions render with their answers, and the photos attach to the section they were taken in." data-k="info"')
    });
  };

  APP.ACT['open-letter'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), L = D.LETTER(c), e = P(c.emp);
    APP.dialog({
      title: 'Generated letter', sub: c.id + ' · ' + L.title + ' · ' + (c.status === 'Pending approval' ? 'draft, pending approval' : 'issued ' + (c.activated || c.opened)), size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">' + esc(L.title) + '</div><div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(D.locName(c.loc)) + '</div></div>' +
        '<div class="paper-id">' + esc(c.id) + '<br>' + esc(c.opened) + '</div></div>' +
        '<p>To: ' + esc(e.name) + ', ' + esc(e.title) + '</p>' +
        L.body.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') +
        '<h3>Documentation attached</h3>' + (c.evidence.length
          ? '<div class="qa-list">' + c.evidence.map(function (id) {
            var f = D.form(id);
            return '<div class="qa-row"><span class="qa-q">' + esc(f ? D.formType(f.ft).name : 'Form') + ' ' + esc(id) + '<span class="cell-sub">' + esc(f ? f.date : '') + ' · ' + esc(f ? f.summary.slice(0, 80) + '...' : '') + '</span></span><span class="qa-a">' + (f ? APP.statusBadge(f.outcome) : '') + '</span></div>';
          }).join('') + '</div>'
          : '<p>No prior coaching attached. A step above documented counselling cannot activate without it.</p>') +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(c.by).name) + ', issued by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(e.name) + ', acknowledged receipt</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="The letter and its documentation render as one file." data-k="info"') +
        (APP.is('employee') && c.status !== 'Pending approval' ? APP.btn('Acknowledge receipt', 'btn-solid', 'signature', 'data-act="toast" data-t="Acknowledged" data-b="Timestamped and stored with the case. Acknowledgement is receipt, not agreement."') : '')
    });
  };

  APP.ACT['file-export'] = function () {
    APP.dialog({
      title: 'Employee file export', sub: 'One package, everything, for an appeal or a hearing.',
      body: APP.field('Employee', APP.dd('exp-emp', APP.people().filter(function (p) { return p.level === 'staff'; }).map(function (p) { return [p.id, p.name + ', ' + D.locName(p.loc)]; }), 'dana', 'dd-block'), null, true) +
        '<h3 class="section-label">What goes in</h3>' +
        ['Every coaching form, rendered as its original document', 'Every action item with its follow up notes', 'Every performance case, letter and approval chain', 'The audit trail for each record', 'Location and duration telemetry where still retained', 'A manifest listing what was included and what was withheld']
          .map(function (x) { return '<label class="checkbox"><input type="checkbox" checked><span>' + esc(x) + '</span></label>'; }).join('') +
        APP.callout('The export is logged against your name, with the reason you give below. It is the single most sensitive action in the product.', 'is-warning', 'shield-alert') +
        APP.field('Reason for export', '<textarea class="textarea" placeholder="Appeal hearing, 24 Sep 2026, reference HRG-2026-41."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Build the package', 'btn-solid', 'package', 'data-act="toast" data-t="Export queued" data-b="One zip, with a manifest. The request is now in the export log."')
    });
  };
})();
