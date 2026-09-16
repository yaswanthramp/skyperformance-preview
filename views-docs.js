/* skyPerformance: E8 documents and history, plus the rendered form and letter. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    if (APP.is('frontline')) return APP.tabs([
      ['coaching', 'Coaching about me', '#/docs', APP.forms().length],
      ['letters', 'Letters', '#/docs/letters', APP.cases().filter(function (c) { return c.letter; }).length],
      ['actions', 'Action items', '#/docs/actions', APP.actions().length]
    ], active);
    return APP.tabs([
      ['coaching', 'Coaching history', '#/docs', APP.forms().length],
      ['visits', 'Site visit log', '#/docs/visits', APP.visits().filter(function (v) { return v.status === 'Completed'; }).length],
      ['actions', 'Action item register', '#/docs/actions', APP.actions().length],
      ['deleted', 'Deleted records', '#/docs/deleted', D.DELETED_FORMS.length]
    ], active);
  }

  function filters() {
    var f = S.f;
    return '<div class="filter-bar">' +
      '<div class="search" style="min-width:240px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="docq" value="' + esc(f.docq || '') + '" placeholder="Employee, form id or word in the summary"></div>' +
      APP.dd('docType', [['All', 'All form types']].concat(D.FORM_TYPES.map(function (t) { return [t.id, t.name]; })), f.docType || 'All') +
      APP.dd('docPeriod', [['All', 'All periods'], ['Q3', 'This cycle, Q3 2026'], ['30', 'Last 30 days']], f.docPeriod || 'All') +
      APP.dd('docOut', [['All', 'Any outcome'], ['Needs improvement', 'Needs improvement'], ['Meets standard', 'Meets standard'], ['Recognition', 'Recognition'], ['Documented', 'Documented']], f.docOut || 'All') +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export selection', 'btn-surface', 'download', 'data-act="export" data-what="The filtered history as CSV"', 'is-sm') +
      (APP.isHR() || APP.isAdmin() ? APP.btn('Employee file export', 'btn-solid', 'package', 'data-act="file-export"', 'is-sm') : '') +
      '</div>';
  }

  function coachingTab() {
    var f = S.f, q = (f.docq || '').toLowerCase();
    var list = APP.forms().filter(function (x) {
      if (f.docType && f.docType !== 'All' && x.ft !== f.docType) return false;
      if (f.docOut && f.docOut !== 'All' && x.outcome !== f.docOut) return false;
      if (f.docPeriod === '30' && ['Sep', 'Aug'].indexOf(x.date.split(' ')[2]) < 0) return false;
      if (q && (x.id + ' ' + P(x.emp).name + ' ' + x.summary + ' ' + D.formType(x.ft).name).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    return filters() +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Form' }, { t: 'Employee' }, { t: 'Completed by' }, { t: 'Date' }, { t: 'Outcome' }, { t: 'Duration', num: true }, { t: 'Location' }, { t: '' }],
        list.map(function (x) {
          var ft = D.formType(x.ft);
          return { cells: [
            '<span class="cell-strong">' + esc(ft.name) + '</span><span class="cell-sub">' + esc(x.id) + '</span>',
            APP.personLine(x.emp, null, 28),
            APP.personLine(x.by, null, 28),
            esc(x.date) + '<span class="cell-sub">' + esc(x.time) + '</span>',
            APP.statusBadge(x.outcome),
            x.mins + ' min',
            x.geoFlag ? APP.badge('Off site', 'is-warning', 'map-pin') : APP.badge('Matched', 'is-success', 'map-pin'),
            APP.btn('Open', 'btn-surface', 'file-text', 'data-act="open-form" data-id="' + x.id + '"', 'is-sm')
          ] };
        }), { empty: 'No records match. Retrieval is scoped to your branch of the hierarchy.' }) + '</section>' +
      APP.callout('Any record here renders as the original document, with every question and answer intact, and prints the same way two years from now as it did on the day. <b>Retrieval target: under a minute by employee, community, form id or date.</b>', 'is-info', 'file-text');
  }

  function visitsTab() {
    var list = APP.visits().filter(function (v) { return v.status === 'Completed'; });
    return '<section class="card flush-card">' +
      APP.table([{ t: 'Visit' }, { t: 'Community' }, { t: 'By' }, { t: 'Date' }, { t: 'Questions', num: true }, { t: 'Score', num: true }, { t: 'Findings', num: true }, { t: '' }],
        list.map(function (v) {
          return { cells: ['<span class="cell-strong">' + esc(v.id) + '</span><span class="cell-sub">' + v.mins + ' min on site</span>', esc(D.cmName(v.cm)), APP.personLine(v.by, null, 28), esc(v.date),
            v.answered + ' of ' + v.total, v.score + '%', String(v.findings),
            APP.btn('Open', 'btn-surface', 'file-text', 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm')] };
        }), { empty: 'No completed visits in your scope.' }) + '</section>';
  }

  function actionsTab() {
    return '<section class="card flush-card">' +
      APP.table([{ t: 'Item' }, { t: 'Owner' }, { t: 'Source' }, { t: 'Due' }, { t: 'Status' }, { t: '' }],
        APP.actions().map(function (a) {
          return { cells: ['<span class="cell-strong">' + esc(a.t) + '</span><span class="cell-sub">' + esc(a.id) + '</span>', APP.personLine(a.owner, null, 28),
            '<button class="rowlink" data-act="' + (a.from.indexOf('SV') === 0 ? 'goto" data-href="#/visits/' + a.from : 'open-form" data-id="' + a.from) + '">' + esc(a.from) + '</button>',
            esc(a.due), APP.statusBadge(a.status), APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm')] };
        })) + '</section>';
  }

  function deletedTab() {
    return APP.callout('A deleted record is never gone. It leaves the active history, keeps its id, and carries who deleted it, when, and why. This view is what an auditor asks for first.', 'is-warning', 'trash-2') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Form' }, { t: 'Employee' }, { t: 'Originally by' }, { t: 'Deleted by' }, { t: 'Deleted on' }, { t: 'Reason' }],
        D.DELETED_FORMS.map(function (x) {
          return { cells: ['<span class="cell-strong">' + esc(D.formType(x.ft).name) + '</span><span class="cell-sub">' + esc(x.id) + ' · ' + esc(x.date) + '</span>',
            APP.personLine(x.emp, null, 28), APP.personLine(x.by, null, 28), APP.personLine(x.deletedBy, null, 28), esc(x.deletedOn), '<span class="mini-note">' + esc(x.reason) + '</span>'] };
        })) + '</section>';
  }

  function lettersTab() {
    var cases = APP.cases().filter(function (c) { return c.letter; });
    return (cases.length ? cases.map(function (c) {
      var waiting = c.status === 'Pending approval';
      return '<section class="card">' + APP.panelHead(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name, c.id + ' · opened ' + c.opened + ' by ' + P(c.by).name,
        APP.statusBadge(waiting ? 'Pending approval' : 'Active')) +
        (waiting ? APP.callout('This letter is still going through approval. You will be asked to acknowledge it once every approver has signed off. Acknowledging records that you received it, not that you agree with it.', 'is-warning', 'hourglass')
          : APP.callout('You acknowledged this letter on ' + esc(c.activated || c.opened) + '. Your comment is stored with it.', 'is-success', 'circle-check')) +
        APP.btn('Read the letter', 'btn-solid', 'file-text', 'data-act="open-letter" data-id="' + c.id + '"', 'is-sm') +
        '</section>';
    }).join('') : APP.emptyState('file-text', 'No letters on your record', 'Letters are generated only when a performance case reaches a step that requires one.', ''));
  }

  APP.VIEWS.docs = function (r) {
    var tab = r[1] || 'coaching';
    var body = tab === 'visits' ? visitsTab() : tab === 'actions' ? actionsTab() : tab === 'deleted' ? deletedTab() : tab === 'letters' ? lettersTab() : coachingTab();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Documents', '#/docs']],
      title: APP.is('frontline') ? 'My documents' : 'Documents and history',
      desc: APP.is('frontline') ? 'Everything on file about you, with the original document intact.' : 'Every interaction, retrievable by employee, community, form id or date.',
      tabs: tabsFor(tab), body: body
    });
  };
  APP.INPUT.docq = function (el) { S.f.docq = el.value; var p = el.selectionStart; APP.rerender(); var n = document.querySelector('[data-input="docq"]'); if (n) { n.focus(); n.setSelectionRange(p, p); } };

  /* ---------------- the rendered form ---------------- */
  APP.ACT['open-form'] = function (el) {
    var f = D.form(el.getAttribute('data-id'));
    if (!f) { APP.toast('Not found', 'That record is not in your scope.', 'warning'); return; }
    var ft = D.formType(f.ft), e = P(f.emp);
    var qs = [], i = 0;
    if (f.scores) D.questionsFor(f.ft).forEach(function (sec) { sec.qs.forEach(function (q) { qs.push([q, f.scores[i++]]); }); });
    APP.dialog({
      title: 'Documented record', sub: f.id + ' · immutable since ' + f.date + ', ' + f.time, size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">' + esc(ft.name) + '</div>' +
        '<div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(APP.crumbPath(f.cm)) + ' · ' + esc(f.dept) + '</div></div>' +
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
          ['Location', esc(f.geo)],
          ['Attestation', f.attested ? 'Signed by ' + esc(P(f.by).name) + ' at submission' : 'Not signed'],
          ['Employee acknowledgement', f.ack ? esc(f.ack) : APP.badge('Waiting', 'is-warning')],
          ['Hierarchy path', '<span class="cell-id">' + esc(APP.crumbPath(f.cm)) + ' / ' + esc(f.dept) + '</span>'],
          ['Version', '1 of 1. A correction creates version 2 and keeps this one.']
        ]) +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(f.by).name) + ', completed by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(e.name) + ', acknowledged</div></div></div>' +
        '</div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="Every question and answer renders, including the ones marked not applicable." data-k="info"') +
        (APP.is('frontline') && !f.ack ? APP.btn('Acknowledge', 'btn-solid', 'signature', 'data-act="ack-form" data-id="' + f.id + '"') : '')
    });
  };
  APP.ACT['ack-form'] = function (el) {
    var f = D.form(el.getAttribute('data-id'));
    f.ack = D.TODAY;
    APP.closeOverlay(); APP.rerender(); APP.toast('Acknowledged', 'Your acknowledgement is timestamped and stored with ' + f.id + '.');
  };

  /* ---------------- the generated letter ---------------- */
  APP.ACT['open-letter'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), L = D.LETTER(c), e = P(c.emp);
    APP.dialog({
      title: 'Generated letter', sub: c.id + ' · ' + L.title + ' · ' + (c.status === 'Pending approval' ? 'draft, pending approval' : 'issued ' + (c.activated || c.opened)), size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">' + esc(L.title) + '</div><div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(D.cmName(c.cm)) + '</div></div>' +
        '<div class="paper-id">' + esc(c.id) + '<br>' + esc(c.opened) + '</div></div>' +
        '<p>To: ' + esc(e.name) + ', ' + esc(e.title) + '</p>' +
        L.body.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') +
        '<h3>Evidence attached</h3>' + (c.evidence.length
          ? '<div class="qa-list">' + c.evidence.map(function (id) {
            var f = D.form(id);
            return '<div class="qa-row"><span class="qa-q">' + esc(f ? D.formType(f.ft).name : 'Form') + ' ' + esc(id) + '<span class="cell-sub">' + esc(f ? f.date : '') + ' · ' + esc(f ? f.summary.slice(0, 80) + '...' : '') + '</span></span><span class="qa-a">' + (f ? APP.statusBadge(f.outcome) : '') + '</span></div>';
          }).join('') + '</div>'
          : '<p>No prior coaching attached. A step above documented coaching cannot activate without it.</p>') +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(c.by).name) + ', issued by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(e.name) + ', acknowledged receipt</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="The letter and its evidence render as one document." data-k="info"') +
        (APP.is('frontline') && c.status !== 'Pending approval' ? APP.btn('Acknowledge receipt', 'btn-solid', 'signature', 'data-act="toast" data-t="Acknowledged" data-b="Timestamped and stored with the case. Acknowledgement is receipt, not agreement."') : '')
    });
  };

  APP.ACT['file-export'] = function () {
    APP.dialog({
      title: 'Employee file export', sub: 'One package, everything, for a grievance or a hearing.',
      body: APP.field('Employee', APP.dd('exp-emp', APP.people().filter(function (p) { return p.level === 'staff'; }).map(function (p) { return [p.id, p.name + ', ' + D.cmName(p.cm)]; }), 'dana', 'dd-block'), null, true) +
        '<h3 class="section-label">What goes in</h3>' +
        ['Every coaching form, rendered as its original document', 'Every action item with its follow up notes', 'Every performance case, letter and approval chain', 'The audit trail for each record', 'Geolocation and duration telemetry where still retained', 'A manifest listing what was included and what was withheld']
          .map(function (x) { return '<label class="checkbox"><input type="checkbox" checked><span>' + esc(x) + '</span></label>'; }).join('') +
        APP.callout('The export is logged against your name, with the reason you give below. It is the single most sensitive action in the product.', 'is-warning', 'shield-alert') +
        APP.field('Reason for export', '<textarea class="textarea" placeholder="Grievance hearing, 24 Sep 2026, reference HRG-2026-41."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Build the package', 'btn-solid', 'package', 'data-act="toast" data-t="Export queued" data-b="One zip, with a manifest. The request is now in the export log."')
    });
  };
})();
