/* skyPerformance: E9 reporting and export, plus the E2 signal layer view. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    var t = [
      ['completion', 'Completion', '#/reports'],
      ['signals', 'Signal layer', '#/reports/signals'],
      ['forms', 'Forms by type', '#/reports/forms'],
      ['cases', 'Case summary', '#/reports/cases'],
      ['verbatims', 'Verbatim analysis', '#/reports/verbatims'],
      ['exports', 'Exports', '#/reports/exports']
    ];
    return APP.tabs(t, active);
  }

  function completion() {
    var cms = APP.scopeCms();
    var rows = D.COMPLETION.filter(function (c) { return cms.indexOf(c.scope) >= 0; });
    var due = rows.reduce(function (n, r) { return n + r.due; }, 0), done = rows.reduce(function (n, r) { return n + r.done; }, 0);
    var leaders = D.COMPLETION_BY_LEADER.filter(function (l) { return cms.indexOf(P(l.who).cm) >= 0; });
    return '<div class="kpi-row">' +
      APP.stat('Completion', Math.round(done / due * 100) + '%', 'gauge', done + ' of ' + due + ' touch points', done / due >= 0.9 ? 'is-up' : 'is-down') +
      APP.stat('Leaders below standard', String(leaders.filter(function (l) { return l.done / l.due < 0.9; }).length) + ' of ' + leaders.length, 'users', 'Under 90% this cycle', 'is-down') +
      APP.stat('Forms submitted', String(D.FORMS_BY_TYPE.reduce(function (n, t) { return n + t[1]; }, 0)), 'file-text', 'All types, this cycle') +
      APP.stat('Median time to complete', '13 min', 'timer', 'Observation forms only') +
      '</div>' +
      '<section class="card">' + APP.panelHead('By community', 'The hierarchy rollup. Click a row to open that community roster.',
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Completion by community"', 'is-sm')) +
      APP.table([{ t: 'Community' }, { t: 'Due', num: true }, { t: 'Completed', num: true }, { t: 'Completion', num: true }, { t: 'On time', num: true }, { t: 'Leaders', num: true }, { t: '' }],
        rows.map(function (r) {
          var pct = Math.round(r.done / r.due * 100);
          return { cells: [esc(r.label), String(r.due), String(r.done),
            '<div style="min-width:110px">' + APP.progress(pct, pct >= 90 ? '' : 'is-warn') + '<span class="cell-sub">' + pct + '%</span></div>',
            r.onTime + '%', String(r.leaders),
            APP.btn('Roster', 'btn-surface', null, 'data-act="goto" data-href="#/people"', 'is-sm')] };
        })) + '</section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('By leader', 'Completion is owed by the leader, not by the employee.') +
      APP.bars(leaders.map(function (l) { return [P(l.who).name, Math.round(l.done / l.due * 100)]; }).sort(function (a, b) { return a[1] - b[1]; }), function (v) { return v + '%'; }) +
      '</section>' +
      '<section class="card">' + APP.panelHead('By role level', 'Leader coaching is the level that slips first, everywhere.') +
      APP.bars([['Staff coaching', 92], ['Leader coaching', 61], ['Operations rounding', 78]], function (v) { return v + '%'; }) +
      '<p class="mini-note" style="margin-top:var(--space-4)">When leader coaching drops, staff coaching follows it about six weeks later. The rule engine opens manager rounding coaching at 75% for exactly that reason.</p>' +
      '</section></div>';
  }

  function signals() {
    var cms = APP.scopeCms(), cm = S.f.sigCm || cms[0];
    if (cms.indexOf(cm) < 0) cm = cms[0];
    return APP.callout('A metric here is not a chart. It is a subscription: each one exposes a stable id, refreshes on a fixed cadence, and the rule engine reads it. A miss is machine readable, which is what turns it into a coaching task without a leader deciding.', 'is-info', 'activity') +
      '<div class="filter-bar">' + APP.dd('sigCm', cms.map(function (c) { return [c, D.cmName(c)]; }), cm) +
      '<span class="fb-spacer"></span><span class="mini-note">Refreshed nightly at 02:00 local</span>' +
      APP.btn('Export signals', 'btn-surface', 'download', 'data-act="export" data-what="The signal layer as CSV"', 'is-sm') + '</div>' +
      '<div class="sig-grid">' + D.SIGNALS.map(function (s) { return APP.signalCard(s.id, cm); }).join('') + '</div>' +
      '<section class="card" style="margin-top:var(--space-5)">' + APP.panelHead('Subscriptions', 'Which rule reads which signal. Changing a target changes what gets coached.') +
      APP.table([{ t: 'Signal' }, { t: 'Id' }, { t: 'Target' }, { t: 'Direction' }, { t: 'Rules subscribed' }],
        D.SIGNALS.map(function (s) {
          var rules = D.RULES.filter(function (r) { return r.sig === s.id; });
          return { cells: [esc(s.name), '<span class="cell-id">' + esc(s.id) + '</span>', s.fmt(s.target), s.dir === 'up' ? 'Higher is better' : 'Lower is better',
            rules.length ? rules.map(function (r) { return esc(r.name); }).join('<br>') : '<span class="mini-note">None. The metric is visible but does not generate work.</span>'] };
        })) + '</section>';
  }

  function formsTab() {
    return '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Forms by type', 'This cycle, all communities in scope.') +
      APP.bars(D.FORMS_BY_TYPE.map(function (t) { return [D.formType(t[0]).name, t[1]]; }).sort(function (a, b) { return b[1] - a[1]; })) + '</section>' +
      '<section class="card">' + APP.panelHead('Forms by family') +
      APP.bars(D.FORM_FAMILIES.map(function (f) {
        return [f.name, D.FORMS_BY_TYPE.filter(function (t) { return D.formType(t[0]).fam === f.key; }).reduce(function (n, t) { return n + t[1]; }, 0)];
      })) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Recognition is 88 of the 522 forms this cycle. A ratio below one in six is where employees start reading the record as a threat.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Outcome mix', 'Scored forms only.') +
      APP.table([{ t: 'Outcome' }, { t: 'Forms', num: true }, { t: 'Share', num: true }, { t: 'What follows' }], [
        ['Meets standard', '141', '61%', 'Nothing. The record exists and that is the point.'],
        ['Needs improvement', '52', '23%', 'At least one action item is required before submission.'],
        ['Recognition', '88', '16%', 'Counts toward completion and appears in retention reporting.']
      ].map(function (r) { return { cells: [APP.statusBadge(r[0]), r[1], r[2], '<span class="mini-note">' + esc(r[3]) + '</span>'] }; })) + '</section>';
  }

  function casesTab() {
    var byTrack = {}, byStep = {};
    D.CASES.forEach(function (c) {
      var t = D.TRACKS.filter(function (x) { return x.key === c.track; })[0].name;
      var s = D.STEPS.filter(function (x) { return x.key === c.step; })[0].name;
      byTrack[t] = (byTrack[t] || 0) + 1; byStep[s] = (byStep[s] || 0) + 1;
    });
    return '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Cases by track') + APP.bars(Object.keys(byTrack).map(function (k) { return [k, byTrack[k]]; })) + '</section>' +
      '<section class="card">' + APP.panelHead('Cases by step') + APP.bars(Object.keys(byStep).map(function (k) { return [k, byStep[k]]; })) + '</section></div>' +
      '<section class="card">' + APP.panelHead('Case detail', 'Every case in scope, with its evidence count and where it sits in the chain.',
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The case detail report"', 'is-sm')) +
      APP.table([{ t: 'Case' }, { t: 'Employee' }, { t: 'Community' }, { t: 'Track' }, { t: 'Step' }, { t: 'Evidence', num: true }, { t: 'Status' }, { t: '' }],
        APP.cases().map(function (c) {
          return { cells: ['<span class="cell-id">' + esc(c.id) + '</span>', APP.personLine(c.emp, null, 28), esc(D.cmName(c.cm)),
            esc(D.TRACKS.filter(function (t) { return t.key === c.track; })[0].name), esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name),
            String(c.evidence.length), APP.statusBadge(c.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm')] };
        })) + '</section>' +
      APP.callout('The number that matters here is not how many cases there are. It is how many activated with fewer than two prior coaching forms attached. That number is currently zero, and the wizard is why.', 'is-info', 'shield-check');
  }

  function verbatims() {
    var f = S.f.vtone || 'All';
    var list = D.VERBATIMS.filter(function (v) { return f === 'All' || v.tone === f.toLowerCase(); });
    return '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Themes', 'Family survey and resident council, this quarter.') +
      APP.bars(D.VERBATIM_THEMES) +
      '<p class="mini-note" style="margin-top:var(--space-4)">A theme crossing its threshold is a signal like any other. Dining crossed it in August and opened six care observation tasks.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('What people actually said', 'Unedited. Names are removed before a verbatim reaches a leader.',
        APP.dd('vtone', [['All', 'All comments'], ['Positive', 'Positive'], ['Negative', 'Negative'], ['Mixed', 'Mixed']], f)) +
      '<div class="stack-3">' + list.map(function (v) {
        return '<div class="verb"><div class="verb-q">' + esc(v.t) + '</div>' +
          '<div class="verb-meta">' + APP.badge(v.theme, v.tone === 'positive' ? 'is-success' : v.tone === 'negative' ? 'is-danger' : 'is-warning') +
          '<span>' + esc(v.src) + '</span><span>·</span><span>' + esc(D.cmName(v.cm)) + '</span><span>·</span><span>' + esc(v.on) + '</span></div></div>';
      }).join('') + '</div></section></div>';
  }

  function exportsTab() {
    return APP.callout('Two kinds of export. A report export is a spreadsheet anybody in scope can pull. An employee file export is a single package containing everything about one person, and it is logged against the name of whoever asked for it.', 'is-info', 'package') +
      '<div class="card-grid">' +
      [['Completion by hierarchy', 'CSV, one row per community and leader', 'chart-column', false],
       ['Forms by level and type', 'CSV, counts and median duration', 'file-text', false],
       ['Case summary', 'CSV, one row per case', 'gavel', false],
       ['Case detail', 'CSV, one row per approval event', 'list-ordered', false],
       ['Verbatim analysis', 'CSV, comment, theme, source, community', 'quote', false],
       ['Employee file', 'One zip: forms, letters, action items, audit trail, manifest', 'package', true]
      ].map(function (x) {
        var gated = x[3] && !(APP.isHR() || APP.isAdmin());
        return '<section class="card vs-card"><div class="vs-head"><span class="vs-ic">' + ic(x[2], 18) + '</span><span class="vs-name">' + esc(x[0]) + '</span>' + (x[3] ? APP.badge('HR only', 'is-warning') : '') + '</div>' +
          '<p class="mini-note">' + esc(x[1]) + '</p>' +
          (gated ? '<p class="mini-note">Switch to HR and Employee Relations to build this.</p>'
            : APP.btn(x[3] ? 'Build the package' : 'Export', x[3] ? 'btn-solid' : 'btn-surface', x[3] ? 'package' : 'download',
              x[3] ? 'data-act="file-export"' : 'data-act="export" data-what="' + esc(x[0]) + '"', 'is-sm')) + '</section>';
      }).join('') + '</div>' +
      '<section class="card" style="margin-top:var(--space-5)">' + APP.panelHead('Export log', 'Who pulled what, and why. Kept for seven years.') +
      APP.table([{ t: 'Export' }, { t: 'Requested by' }, { t: 'Subject' }, { t: 'Reason' }, { t: 'When' }], [
        ['Employee file', 'grant', 'Dana Whitfield', 'Grievance hearing, reference HRG-2026-41', '15 Sep 2026 17:04'],
        ['Employee file', 'grant', 'Esther Vaneck', 'Unemployment claim response', '3 Sep 2026 11:20'],
        ['Completion by hierarchy', 'alexis', 'Northeast region', 'Monthly operations review', '1 Sep 2026 08:15'],
        ['Case summary', 'grant', 'All communities', 'Quarterly employee relations report', '1 Sep 2026 08:02']
      ].map(function (r) { return { cells: [esc(r[0]), APP.personLine(r[1], null, 28), esc(r[2]), '<span class="mini-note">' + esc(r[3]) + '</span>', esc(r[4])] }; })) + '</section>';
  }

  APP.VIEWS.reports = function (r) {
    var tab = r[1] || 'completion';
    var body = tab === 'signals' ? signals() : tab === 'forms' ? formsTab() : tab === 'cases' ? casesTab()
      : tab === 'verbatims' ? verbatims() : tab === 'exports' ? exportsTab() : completion();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Reports', '#/reports']],
      title: APP.isHR() ? 'Reports and export' : 'Reports',
      desc: 'Leadership can see who is and is not doing the work. A complete employee file exports as one package.',
      tabs: tabsFor(tab), body: body
    });
  };
})();
