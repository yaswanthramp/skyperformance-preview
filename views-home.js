/* skyPerformance: Home. Three tabs behind one nav item, so the dashboard, the
   measures and the reports are one destination rather than three. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function stat(label, value, icon, sub, kind, href) {
    var tag = href ? 'button' : 'section';
    var attrs = href ? ' class="card stat-card is-clickable" data-act="goto" data-href="' + href + '"' : ' class="card stat-card"';
    return '<' + tag + attrs + '><div class="sc-head"><span class="sc-label">' + esc(label) + '</span><span class="sc-icon">' + ic(icon, 18) + '</span></div>' +
      '<div class="sc-value">' + value + '</div>' +
      (sub ? '<div class="sc-delta ' + (kind || '') + '">' + (kind === 'is-down' ? ic('trending-down', 14) : kind === 'is-up' ? ic('trending-up', 14) : '') + esc(sub) + '</div>' : '') +
      '</' + tag + '>';
  }
  APP.stat = stat;

  function taskRow(t) {
    var e = P(t.emp), ft = D.formType(t.ft), late = t.status === 'Overdue';
    return '<div class="wq-row"><span class="wq-ic' + (late ? ' is-late' : '') + '">' + ic(ft.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(t.topic) + '</span>' +
      '<span class="wq-s">' + esc(e.name) + ', ' + esc(e.title) + ' · ' + esc(t.id) + '</span></div>' +
      '<div class="wq-right">' + APP.statusBadge(t.status) + '<span class="mini-note">Due ' + esc(t.due) + '</span>' +
      (t.status === 'Completed' ? APP.btn('Record', 'btn-surface', 'file-text', 'data-act="open-form" data-id="' + t.formId + '"', 'is-sm')
        : APP.btn(t.status === 'Draft' ? 'Resume' : 'Start', 'btn-solid', 'circle-play', 'data-act="run-form" data-task="' + t.id + '"', 'is-sm')) +
      '</div></div>';
  }
  APP.taskRow = taskRow;

  /* the product in one card */
  function chainCard() {
    var steps = [
      ['Measure', 'Quality 86.4%', 'activity', '#/home/measures'],
      ['Task', 'TP-4471, overdue', 'list-checks', '#/todo'],
      ['Form', 'FM-20904 documented', 'clipboard-list', '#/records'],
      ['Case', 'PC-3391 written warning', 'gavel', '#/cases/PC-3391'],
      ['Approval', '2 of 4 recorded', 'user-check', '#/cases/PC-3391'],
      ['Export', 'Employee file, one package', 'package', '#/records/exports']
    ];
    return '<section class="card">' + APP.panelHead('How the product works', 'One chain. Nothing falls out of it. Click any link to jump to that point in the record.') +
      '<div class="chain">' + steps.map(function (s, i) {
        var route = s[3].split('/')[1];
        var can = APP.nav().some(function (n) { return n[0] === route; }) || route === 'todo' || route === 'home';
        return '<button class="chain-step" ' + (can ? 'data-act="goto" data-href="' + s[3] + '"' : 'data-act="toast" data-t="Outside your role" data-b="Switch role with View as in the header to see this step." data-k="info"') + '>' +
          '<span class="chain-ic">' + ic(s[2], 16) + '</span><span class="chain-text"><span class="chain-t">' + esc(s[0]) + '</span><span class="chain-s">' + esc(s[1]) + '</span></span></button>' +
          (i < steps.length - 1 ? '<span class="chain-arrow">' + ic('chevron-right', 16) + '</span>' : '');
      }).join('') + '</div></section>';
  }

  function measureCard(id, loc) {
    var s = D.measure(id), m = D.metric(id, loc);
    if (!m) return '';
    var good = D.onTarget(id, m.v), moved = m.v - m.prior;
    var better = s.dir === 'up' ? moved > 0 : moved < 0;
    return '<button class="card sig-card" data-act="open-measure" data-id="' + id + '" data-loc="' + loc + '">' +
      '<div class="sig-head"><span class="sig-name">' + esc(s.name) + '</span>' + APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>' +
      '<div class="sig-val">' + s.fmt(m.v) + '</div>' +
      '<div class="sig-target">Target ' + s.fmt(s.target) + ' · ' + D.attain(id, m.v) + '% attainment</div>' +
      '<div class="sig-delta ' + (better ? 'is-good' : 'is-bad') + '">' + ic(moved > 0 ? 'trending-up' : moved < 0 ? 'trending-down' : 'minus', 14) +
      (moved === 0 ? 'Flat on last month' : Math.abs(moved).toFixed(2).replace(/\.00$/, '') + ' ' + (moved > 0 ? 'up' : 'down') + ' on last month') + '</div>' +
      APP.spark(m.trend, !better) + '<div class="sig-id">' + esc(id) + '</div></button>';
  }

  /* ---------------- tab: measures ---------------- */
  function measures() {
    var locs = APP.scopeLocs(), loc = S.f.mLoc || locs[0];
    if (locs.indexOf(loc) < 0) loc = locs[0];
    return APP.callout('A measure here is not a chart, it is a subscription. Each one has a stable id, refreshes on a fixed cadence, and the rule engine reads it. A miss becomes a coaching task without a manager deciding, which is the whole point.', 'is-info', 'activity') +
      '<div class="filter-bar">' + APP.dd('mLoc', locs.map(function (l) { return [l, D.locName(l)]; }), loc) +
      '<span class="fb-spacer"></span><span class="mini-note">Refreshed nightly at 02:00 local</span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The performance measures as CSV"', 'is-sm') + '</div>' +
      '<div class="sig-grid">' + D.MEASURES.map(function (m) { return measureCard(m.id, loc); }).join('') + '</div>' +
      '<section class="card" style="margin-top:var(--space-5)">' + APP.panelHead('What subscribes to what', 'Changing a target changes what gets coached. That is why this table exists.') +
      APP.table([{ t: 'Measure' }, { t: 'Id' }, { t: 'Target' }, { t: 'Direction' }, { t: 'Rules subscribed' }],
        D.MEASURES.map(function (s) {
          var rules = D.RULES.filter(function (r) { return r.msr === s.id; });
          return { cells: [esc(s.name), '<span class="cell-id">' + esc(s.id) + '</span>', s.fmt(s.target), s.dir === 'up' ? 'Higher is better' : 'Lower is better',
            rules.length ? rules.map(function (r) { return esc(r.name); }).join('<br>') : '<span class="mini-note">None. Visible, but it does not generate work.</span>'] };
        })) + '</section>';
  }

  /* ---------------- tab: reports ---------------- */
  function reports() {
    var locs = APP.scopeLocs();
    var rows = D.COMPLETION.filter(function (c) { return locs.indexOf(c.scope) >= 0; });
    var due = rows.reduce(function (n, r) { return n + r.due; }, 0) || 1;
    var done = rows.reduce(function (n, r) { return n + r.done; }, 0);
    var leaders = D.COMPLETION_BY_LEADER.filter(function (l) { return locs.indexOf(P(l.who).loc) >= 0; });
    return '<div class="kpi-row">' +
      stat('Completion', Math.round(done / due * 100) + '%', 'gauge', done + ' of ' + due + ' touch points', done / due >= 0.9 ? 'is-up' : 'is-down') +
      stat('Managers below standard', String(leaders.filter(function (l) { return l.done / l.due < 0.9; }).length) + ' of ' + leaders.length, 'users', 'Under 90% this cycle', 'is-down') +
      stat('Forms submitted', String(D.FORMS_BY_TYPE.reduce(function (n, t) { return n + t[1]; }, 0)), 'file-text', 'All types, this cycle') +
      stat('Median time to complete', '13 min', 'timer', 'Observation forms only') +
      '</div>' +
      '<section class="card">' + APP.panelHead('Completion by location', 'Who is and is not doing the work. This is the number leadership acts on.',
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Completion by location"', 'is-sm')) +
      APP.table([{ t: 'Location' }, { t: 'Due', num: true }, { t: 'Completed', num: true }, { t: 'Completion' }, { t: 'On time', num: true }, { t: 'Managers', num: true }],
        rows.map(function (r) {
          var pct = Math.round(r.done / r.due * 100);
          return { cells: [esc(r.label), String(r.due), String(r.done),
            '<div style="min-width:120px">' + APP.progress(pct, pct >= 90 ? '' : 'is-warn') + '<span class="cell-sub">' + pct + '%</span></div>',
            r.onTime + '%', String(r.leaders)] };
        }), { empty: 'Nothing in scope.' }) + '</section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Completion by manager', 'Completion is owed by the manager, not by the employee.') +
      APP.bars(leaders.map(function (l) { return [P(l.who).name, Math.round(l.done / l.due * 100)]; }).sort(function (a, b) { return a[1] - b[1]; }), function (v) { return v + '%'; }) +
      '</section>' +
      '<section class="card">' + APP.panelHead('Forms by type', 'This cycle.') +
      APP.bars(D.FORMS_BY_TYPE.map(function (t) { return [D.formType(t[0]).name, t[1]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8)) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Recognition is 88 of the 735 forms this cycle. A ratio below one in six is where people start reading the record as a threat.</p>' +
      '</section></div>';
  }

  /* ---------------- overview per role ---------------- */
  function employeeOverview() {
    var me = APP.me();
    var acts = APP.actions(), open = acts.filter(function (a) { return a.status !== 'Closed'; });
    var forms = APP.forms();
    var kase = APP.cases().filter(function (c) { return c.status === 'Pending approval' || c.status === 'Open'; })[0];
    return (kase ? APP.callout('<b>A ' + esc(D.STEPS.filter(function (s) { return s.key === kase.step; })[0].name.toLowerCase()) + ' is in progress on your record.</b> You will be asked to acknowledge the letter once it is approved. Acknowledging records that you received it, not that you agree with it. <a href="#/records">Read what is on file</a>.', 'is-warning', 'triangle-alert') : '') +
      '<div class="kpi-row">' +
      stat('Action items you own', String(open.length), 'list-checks', open.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/coaching/actions') +
      stat('Coaching on your record', String(forms.length), 'clipboard-list', 'Last on ' + (forms[0] ? forms[0].date : 'no record'), '', '#/coaching') +
      stat('Recognition received', String(forms.filter(function (f) { return f.outcome === 'Recognition'; }).length), 'award', 'Counts toward your file', '', '#/records') +
      stat('Waiting on you', kase && kase.letter ? '1' : '0', 'signature', kase && kase.letter ? 'A letter to acknowledge' : 'Nothing waiting', kase && kase.letter ? 'is-down' : '', '#/records/letters') +
      '</div>' +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Your action items', 'Each one came from a documented conversation and stays open until it is closed.') +
      '<div class="wq">' + (open.length ? open.map(APP.actionRow).join('') : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('What your manager sees', 'The same records, in the same words.') +
      APP.dataList([
        ['Your manager', APP.personLine(me.mgr, false, 24, false)],
        ['Records about you', forms.length + ' documented forms'],
        ['Measures tracked', (D.EMP_MEASURES[me.id] || []).length + ' measures']
      ]) +
      '<div class="path-block"><span class="path-label">Where you sit</span><span class="cell-id">' + esc(APP.hierPath(me.loc, me.dept)) + '</span></div>' +
      '<p class="mini-note" style="margin-top:var(--space-3)">Nothing about you is held outside this file. Formal investigations, if there are any, are kept in a separate system and never appear here.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Coaching you have received', 'Most recent first.', APP.btn('Open my coaching', 'btn-surface', 'clipboard-list', 'data-act="goto" data-href="#/coaching"', 'is-sm')) +
      '<div class="wq">' + forms.slice(0, 5).map(function (f) {
        var ft = D.formType(f.ft);
        return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : f.outcome === 'Recognition' || f.outcome === 'Meets standard' ? ' is-good' : '') + '">' + ic(ft.ic, 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(ft.name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(f.summary.slice(0, 110)) + '...</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div></section>';
  }

  function managerOverview() {
    var me = APP.me(), tasks = APP.myTasks();
    var open = tasks.filter(function (t) { return t.status !== 'Completed'; });
    var acts = APP.actions().filter(function (a) { return a.status !== 'Closed'; });
    var comp = D.COMPLETION_BY_LEADER.filter(function (c) { return c.who === me.id; })[0] || { due: 1, done: 0 };
    var pct = Math.round(comp.done / comp.due * 100);
    var team = APP.team();
    return '<div class="kpi-row">' +
      stat('Touch points due', String(open.length), 'list-checks', open.filter(function (t) { return t.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/todo') +
      stat('Action items open', String(acts.length), 'square-check-big', acts.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/todo/actions') +
      stat('Your completion', pct + '%', 'gauge', comp.done + ' of ' + comp.due + ' this cycle', pct >= 90 ? 'is-up' : 'is-down', '#/home/reports') +
      stat('Your team', String(team.length), 'users', 'Direct and indirect reports', '', '#/org') +
      '</div>' +
      (open.filter(function (t) { return t.status === 'Overdue'; }).length ?
        APP.callout('<b>' + open.filter(function (t) { return t.status === 'Overdue'; }).length + ' touch point is past its due date.</b> Overdue work rolls up to your Location Director, and an unresolved trend is what opens a performance case. <a href="#/todo">Work the list</a>.', 'is-warning', 'triangle-alert') : '') +
      chainCard() +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Your work today', 'The rules decide who to coach, on what, by when. You decide how.',
        APP.btn('Open the to-do list', 'btn-surface', null, 'data-act="goto" data-href="#/todo"', 'is-sm')) +
      '<div class="wq">' + (open.length ? open.slice(0, 6).map(taskRow).join('') : '<div class="table-empty">Nothing due. Rare, and worth enjoying.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Your team', esc(APP.hierPath(me.loc, me.dept))) +
      '<div class="wq">' + team.slice(0, 6).map(function (p) {
        var due = D.TASKS.filter(function (t) { return t.emp === p.id && t.status !== 'Completed'; }).length;
        var open2 = D.ACTIONS.filter(function (a) { return a.owner === p.id && a.status !== 'Closed'; }).length;
        return '<button class="wq-row" data-act="goto-person" data-id="' + p.id + '" style="width:100%;border:0;background:none;cursor:pointer;text-align:left">' +
          APP.av(p, 32) + '<span class="wq-main"><span class="wq-t">' + esc(p.name) + '</span><span class="wq-s">' + esc(p.title) + '</span></span>' +
          '<span class="wq-right">' + (due ? APP.badge(due + ' due', 'is-info') : '') + (open2 ? APP.badge(open2 + ' open', 'is-warning') : '') + ic('chevron-right', 16) + '</span></button>';
      }).join('') + '</div>' +
      APP.btn('Open the org chart', 'btn-soft', 'network', 'data-act="goto" data-href="#/org"', 'is-sm') +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Action items you are carrying', 'An item stays on this list, and on the next form for that person, until it is closed.',
        APP.btn('All action items', 'btn-surface', null, 'data-act="goto" data-href="#/todo/actions"', 'is-sm')) +
      '<div class="wq">' + acts.slice(0, 5).map(APP.actionRow).join('') + '</div></section>';
  }

  function hrOverview() {
    var approvals = APP.approvalsFor();
    var byStatus = {};
    D.CASES.forEach(function (c) { var k = c.disposition || c.status; byStatus[k] = (byStatus[k] || 0) + 1; });
    return (approvals.length ? APP.callout('<b>' + approvals.length + ' case is in your queue.</b> A case cannot activate without documented prior coaching, a completed letter where the step requires one, and every recorded approval. <a href="#/cases">Open the queue</a>.', 'is-warning', 'gavel') : '') +
      '<div class="kpi-row">' +
      stat('Cases in your queue', String(approvals.length), 'gavel', 'Waiting on HR review', approvals.length ? 'is-down' : '', '#/cases') +
      stat('Open steps', String(byStatus.Open || 0), 'shield', 'Across all locations', '', '#/cases') +
      stat('Expiring in 30 days', '2', 'hourglass', 'They leave the ladder automatically', '', '#/cases') +
      stat('File exports this month', '4', 'package', '2 for appeals, 2 for audit', '', '#/records/exports') +
      '</div>' +
      chainCard() +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Approval queue', 'Every state change is attributed and timestamped.', APP.btn('All cases', 'btn-surface', null, 'data-act="goto" data-href="#/cases"', 'is-sm')) +
      '<div class="wq">' + (approvals.length ? approvals.map(function (c) {
        var e = P(c.emp);
        return '<div class="wq-row"><span class="wq-ic is-late">' + ic('gavel', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(c.id) + ' · ' + esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name) + '</span>' +
          '<span class="wq-s">' + esc(e.name) + ', ' + esc(e.title) + ' · ' + esc(D.locName(c.loc)) + ' · ' + c.evidence.length + ' forms attached</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(c.status) + APP.btn('Review', 'btn-solid', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm') + '</div></div>';
      }).join('') : '<div class="table-empty">Nothing waiting on you.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Cases by state', 'All locations.') +
      APP.bars(Object.keys(byStatus).map(function (k) { return [k, byStatus[k]]; })) +
      '<p class="mini-note" style="margin-top:var(--space-4)">A rescinded record is retained and flagged. It never counts toward a later step.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Defensibility check', 'What an appeal or a tribunal asks for, and whether the file can produce it.') +
      APP.table([{ t: 'Question' }, { t: 'Where it comes from' }, { t: 'Status' }], [
        ['Was the employee coached before the step was issued', '4 forms attached to PC-3391, dated 22 Jul to 12 Sep', APP.statusBadge('Completed')],
        ['Did the employee receive the letter', 'Acknowledgement timestamp on the record', APP.statusBadge('Completed')],
        ['Who approved it and when', 'Approval chain with four recorded decisions', APP.statusBadge('Pending approval')],
        ['Was the record altered after submission', 'Immutable submission, a correction creates a new version', APP.statusBadge('Completed')],
        ['Can the whole file be produced', 'Employee file export, one package', APP.statusBadge('Completed')]
      ].map(function (r) { return { cells: r }; })) + '</section>';
  }

  APP.VIEWS.home = function (r) {
    var emp = APP.is('employee'), tab = r[1] || 'overview';
    if (emp) {
      return APP.page({ crumbs: [['Home', '#/home']], title: 'Your record, ' + esc(APP.me().name.split(' ')[0]),
        desc: 'Everything documented about your work, in the words it was written in.', body: employeeOverview() });
    }
    var tabs = APP.tabs([
      ['overview', 'Overview', '#/home'],
      ['measures', 'Performance measures', '#/home/measures', D.MEASURES.length],
      ['reports', 'Reports', '#/home/reports']
    ], tab);
    var body = tab === 'measures' ? measures() : tab === 'reports' ? reports() : (APP.isHR() ? hrOverview() : managerOverview());
    return APP.page({
      crumbs: [['Home', '#/home']],
      title: APP.isHR() ? 'HR overview' : 'Good morning, ' + esc(APP.me().name.split(' ')[0]),
      desc: D.TODAY + ' · ' + D.CYCLE + ' · ' + esc(APP.scopePath()),
      tabs: tabs, body: body
    });
  };

  APP.ACT['open-measure'] = function (el) {
    var id = el.getAttribute('data-id'), loc = el.getAttribute('data-loc');
    var s = D.measure(id), m = D.metric(id, loc);
    APP.dialog({
      title: s.name, sub: D.locName(loc) + ' · ' + s.domain,
      body: APP.dataList([
        ['Measure id', '<span class="cell-id">' + esc(id) + '</span>'],
        ['Current', s.fmt(m.v)], ['Target', s.fmt(s.target)],
        ['Attainment', D.attain(id, m.v) + '%'],
        ['Direction', s.dir === 'up' ? 'Higher is better' : 'Lower is better'],
        ['Refresh cadence', 'Nightly, 02:00 local'],
        ['Source', 'Operational reporting, joined to the HRIS person id'],
        ['Rules subscribed', D.RULES.filter(function (r) { return r.msr === id; }).map(function (r) { return esc(r.name); }).join('<br>') || 'None yet']
      ]) + '<div style="margin-top:var(--space-4)">' + APP.spark(m.trend, !D.onTarget(id, m.v)) + '<p class="mini-note">Last six months.</p></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        (APP.isHR() ? APP.btn('See the rules', 'btn-soft', 'sliders-horizontal', 'data-act="goto" data-href="#/settings/rules"') : '')
    });
  };
})();
