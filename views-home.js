/* skyPerformance: the role dashboards. One screen per persona, built from the
   same components, scoped by APP.role(). */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P;

  function stat(label, value, icon, sub, kind, href) {
    var tag = href ? 'button' : 'section';
    var attrs = href ? ' class="card stat-card is-clickable" data-act="goto" data-href="' + href + '"' : ' class="card stat-card"';
    return '<' + tag + attrs + '><div class="sc-head"><span class="sc-label">' + esc(label) + '</span><span class="sc-icon">' + ic(icon, 18) + '</span></div>' +
      '<div class="sc-value">' + value + '</div>' +
      (sub ? '<div class="sc-delta ' + (kind || '') + '">' + (kind === 'is-down' ? ic('trending-down', 14) : kind === 'is-up' ? ic('trending-up', 14) : '') + esc(sub) + '</div>' : '') +
      '</' + tag + '>';
  }
  APP.stat = stat;

  /* the product claim: signal to task to form to case to approval to export */
  function chainCard() {
    var steps = [
      ['Signal', 'Call light 6.1 min', 'activity', '#/reports/signals'],
      ['Task', 'TP-4471, overdue', 'list-checks', '#/coaching'],
      ['Form', 'FM-20904 documented', 'clipboard-list', '#/docs'],
      ['Case', 'PC-3391 written warning', 'gavel', '#/cases/PC-3391'],
      ['Approval', '2 of 4 recorded', 'user-check', '#/cases/PC-3391'],
      ['Export', 'Employee file, one package', 'package', '#/reports/exports']
    ];
    var allowed = APP.nav().map(function (n) { return n[0]; });
    return '<section class="card">' + APP.panelHead('Trace the chain', 'Nothing falls out of it. Click any link to jump to that point in the record.') +
      '<div class="chain">' + steps.map(function (s, i) {
        var route = s[3].split('/')[1];
        var can = allowed.indexOf(route) >= 0;
        return '<button class="chain-step" ' + (can ? 'data-act="goto" data-href="' + s[3] + '"' : 'data-act="toast" data-t="Outside your scope" data-b="' + esc(APP.role().label) + ' does not see this step. Switch role with View as." data-k="info"') + '>' +
          '<span class="chain-ic">' + ic(s[2], 16) + '</span><span class="chain-text"><span class="chain-t">' + esc(s[0]) + '</span><span class="chain-s">' + esc(s[1]) + '</span></span></button>' +
          (i < steps.length - 1 ? '<span class="chain-arrow">' + ic('chevron-right', 16) + '</span>' : '');
      }).join('') + '</div></section>';
  }

  function taskRow(t) {
    var e = P(t.emp), ft = D.formType(t.ft), late = t.status === 'Overdue';
    return '<div class="wq-row"><span class="wq-ic' + (late ? ' is-late' : '') + '">' + ic(ft.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(t.topic) + '</span>' +
      '<span class="wq-s">' + esc(e.name) + ', ' + esc(e.title) + ' · ' + esc(ft.name) + ' · ' + esc(t.id) + '</span></div>' +
      '<div class="wq-right">' + APP.statusBadge(t.status) + '<span class="mini-note">Due ' + esc(t.due) + '</span>' +
      (t.status === 'Completed' ? APP.btn('Open record', 'btn-surface', 'file-text', 'data-act="open-form" data-id="' + t.formId + '"', 'is-sm')
        : APP.btn(t.status === 'Draft' ? 'Resume draft' : 'Run form', 'btn-solid', 'circle-play', 'data-act="run-form" data-task="' + t.id + '"', 'is-sm')) +
      '</div></div>';
  }
  APP.taskRow = taskRow;

  function actionRow(a) {
    var late = a.status === 'Overdue';
    return '<div class="wq-row"><span class="wq-ic' + (late ? ' is-late' : a.status === 'Closed' ? ' is-good' : '') + '">' + ic(late ? 'triangle-alert' : a.status === 'Closed' ? 'check' : 'list-checks', 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(a.t) + '</span>' +
      '<span class="wq-s">' + esc(a.id) + ' · owner ' + esc(P(a.owner).name) + ' · from ' + esc(a.from) + (a.carried ? ' · carried forward' : '') + '</span></div>' +
      '<div class="wq-right">' + APP.statusBadge(a.status) + '<span class="mini-note">Due ' + esc(a.due) + '</span>' +
      APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm') + '</div></div>';
  }
  APP.actionRow = actionRow;

  function signalCard(sigId, cm) {
    var s = D.signal(sigId), m = D.metric(sigId, cm);
    if (!m) return '';
    var good = D.onTarget(sigId, m.v);
    var moved = m.v - m.prior;
    var better = s.dir === 'up' ? moved > 0 : moved < 0;
    return '<button class="card sig-card" data-act="open-signal" data-id="' + sigId + '" data-cm="' + cm + '">' +
      '<div class="sig-head"><span class="sig-name">' + esc(s.name) + '</span>' + APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>' +
      '<div class="sig-val">' + s.fmt(m.v) + '</div>' +
      '<div class="sig-target">Target ' + s.fmt(s.target) + ' · ' + D.attain(sigId, m.v) + '% attainment</div>' +
      '<div class="sig-delta ' + (better ? 'is-good' : 'is-bad') + '">' + ic(moved > 0 ? 'trending-up' : moved < 0 ? 'trending-down' : 'minus', 14) +
      (moved === 0 ? 'Flat on last month' : Math.abs(moved).toFixed(2).replace(/\.00$/, '') + ' ' + (moved > 0 ? 'up' : 'down') + ' on last month') + '</div>' +
      APP.spark(m.trend, !better) +
      '<div class="sig-id">' + esc(sigId) + '</div></button>';
  }
  APP.signalCard = signalCard;

  /* ---------------- per role ---------------- */
  function frontline() {
    var me = APP.me();
    var acts = APP.actions(), open = acts.filter(function (a) { return a.status !== 'Closed'; });
    var forms = APP.forms();
    var kase = APP.cases().filter(function (c) { return c.status === 'Pending approval' || c.status === 'Active'; })[0];
    var body =
      (kase ? APP.callout('<b>A ' + esc(D.STEPS.filter(function (s) { return s.key === kase.step; })[0].name.toLowerCase()) + ' is in progress on your record.</b> You will be asked to acknowledge the letter once it is approved. Acknowledging records that you received it, not that you agree with it. <a href="#/docs">Read what is on file</a>.', 'is-warning', 'triangle-alert') : '') +
      '<div class="kpi-row">' +
      stat('Action items you own', String(open.length), 'list-checks', open.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/actions') +
      stat('Coaching on your record', String(forms.length), 'clipboard-list', 'Last on ' + (forms[0] ? forms[0].date : 'no record'), '', '#/docs') +
      stat('Recognition received', String(forms.filter(function (f) { return f.outcome === 'Recognition'; }).length), 'award', 'Counts toward your file', '', '#/docs') +
      stat('Letters to acknowledge', kase && kase.letter ? '1' : '0', 'signature', kase && kase.letter ? 'Waiting on you' : 'Nothing waiting', kase && kase.letter ? 'is-down' : '', '#/docs') +
      '</div>' +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Your action items', 'Each one came from a documented conversation and stays open until it is closed.') +
      '<div class="wq">' + (open.length ? open.map(actionRow).join('') : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('What your leader sees', 'The same records, in the same words.') +
      APP.dataList([
        ['Your leader', APP.personLine(me.mgr, false, 24, false)],
        ['Records about you', forms.length + ' documented forms'],
        ['Your signals', (D.EMP_SIGNALS[me.id] || []).length + ' metrics tracked']
      ]) +
      '<div class="path-block"><span class="path-label">Hierarchy path</span><span class="cell-id">' + esc(APP.crumbPath(me.cm)) + '</span></div>' +
      '<p class="mini-note" style="margin-top:var(--space-4)">Nothing about you is held outside this file. Investigations, if there are any, are kept in a separate system and never appear here.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Coaching you have received', 'Most recent first.', APP.btn('Open my documents', 'btn-surface', 'folder', 'data-act="goto" data-href="#/docs"', 'is-sm')) +
      '<div class="wq">' + forms.slice(0, 5).map(function (f) {
        var ft = D.formType(f.ft);
        return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : f.outcome === 'Recognition' || f.outcome === 'Meets standard' ? ' is-good' : '') + '">' + ic(ft.ic, 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(ft.name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(f.summary.slice(0, 110)) + (f.summary.length > 110 ? '...' : '') + '</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div></section>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Your record, ' + esc(me.name.split(' ')[0]), desc: 'Everything documented about your work, in the words it was written in.', body: body });
  }

  function manager() {
    var me = APP.me(), tasks = APP.myTasks();
    var open = tasks.filter(function (t) { return t.status === 'Open' || t.status === 'Overdue' || t.status === 'Draft'; });
    var acts = APP.actions().filter(function (a) { return a.status !== 'Closed'; });
    var comp = D.COMPLETION_BY_LEADER.filter(function (c) { return c.who === me.id; })[0] || { due: 0, done: 0 };
    var pct = comp.due ? Math.round(comp.done / comp.due * 100) : 0;
    var body =
      '<div class="kpi-row">' +
      stat('Touch points due', String(open.length), 'list-checks', open.filter(function (t) { return t.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/coaching') +
      stat('Action items open', String(acts.length), 'square-check-big', acts.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/actions') +
      stat('Your completion', pct + '%', 'gauge', comp.done + ' of ' + comp.due + ' this cycle', pct >= 90 ? 'is-up' : 'is-down', '#/reports') +
      stat('Cases you started', String(APP.cases().filter(function (c) { return c.by === me.id; }).length), 'gavel', '1 waiting on approval', '', '#/cases') +
      '</div>' +
      (open.filter(function (t) { return t.status === 'Overdue'; }).length ?
        APP.callout('<b>' + open.filter(function (t) { return t.status === 'Overdue'; }).length + ' touch point is past its due date.</b> Overdue work rolls up to your Executive Director and to the region, and an unresolved trend is what opens a performance case. <a href="#/coaching">Work the list</a>.', 'is-warning', 'triangle-alert') : '') +
      chainCard() +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Your work today', 'The system decides who to coach, on what, by when. You decide how.', APP.btn('See all', 'btn-surface', null, 'data-act="goto" data-href="#/coaching"', 'is-sm')) +
      '<div class="wq">' + open.slice(0, 6).map(taskRow).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Team signals', esc(APP.scopeLabel())) +
      '<div class="stack-3">' + (D.EMP_SIGNALS.dana || []).map(function (s) {
        var sig = D.signal(s[0]), good = D.onTarget(s[0], s[1]);
        return APP.meter(sig.name, sig.fmt(s[1]) + ' vs ' + sig.fmt(sig.target), Math.min(100, D.attain(s[0], s[1])), good ? '' : 'is-warn');
      }).join('') + '</div>' +
      '<p class="mini-note" style="margin-top:var(--space-4)">Every metric here has a stable id the rule engine subscribes to. A miss is machine readable, not just visible.</p>' +
      APP.btn('Open the signal layer', 'btn-soft', 'activity', 'data-act="goto" data-href="#/reports/signals"', 'is-sm') +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Action items you are carrying', 'An item stays on this list, and on the next form for that employee, until it is closed.', APP.btn('All action items', 'btn-surface', null, 'data-act="goto" data-href="#/actions"', 'is-sm')) +
      '<div class="wq">' + acts.slice(0, 5).map(actionRow).join('') + '</div></section>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Good morning, ' + esc(me.name.split(' ')[0]), desc: D.TODAY + ' · ' + D.CYCLE + ' · ' + esc(APP.scopeLabel()), body: body });
  }

  function ed() {
    var me = APP.me(), cm = APP.role().scope.cm;
    var comp = D.COMPLETION.filter(function (c) { return c.scope === cm; })[0];
    var pct = Math.round(comp.done / comp.due * 100);
    var approvals = APP.approvalsFor();
    var visit = APP.visits().filter(function (v) { return v.status === 'In progress'; })[0];
    var leaders = D.COMPLETION_BY_LEADER.filter(function (l) { return P(l.who).cm === cm; });
    var body =
      (visit ? APP.callout('<b>' + esc(P(visit.by).name) + ' is on site now.</b> Site visit ' + esc(visit.id) + ' is ' + visit.answered + ' of ' + visit.total + ' questions in, started at ' + esc(visit.started) + '. You will be debriefed before they leave. <a href="#/visits/' + visit.id + '">Follow along</a>.', 'is-info', 'building-2') : '') +
      '<div class="kpi-row">' +
      stat('Community completion', pct + '%', 'gauge', comp.done + ' of ' + comp.due + ' touch points', pct >= 90 ? 'is-up' : 'is-down', '#/reports') +
      stat('On time rate', comp.onTime + '%', 'clock', 'Completed before the due date', comp.onTime >= 85 ? 'is-up' : 'is-down', '#/reports') +
      stat('Cases needing you', String(approvals.length), 'gavel', approvals.length ? 'Waiting on your approval' : 'Nothing waiting', approvals.length ? 'is-down' : '', '#/cases') +
      stat('Open action items', String(APP.actions().filter(function (a) { return a.status !== 'Closed'; }).length), 'list-checks', 'Across the community', '', '#/actions') +
      '</div>' +
      chainCard() +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Are your leaders doing the work', 'Completion by the leader who owes the touch point, not by the employee.', APP.btn('Full report', 'btn-surface', null, 'data-act="goto" data-href="#/reports"', 'is-sm')) +
      APP.bars(leaders.map(function (l) { return [P(l.who).name, Math.round(l.done / l.due * 100)]; }), function (v) { return v + '%'; }) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Curtis Nakamura is at 50%. Coaching the coach is itself a task type, and the rule engine has already opened one.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Community signals', D.cmName(cm)) +
      '<div class="stack-3">' + ['sig.call_light', 'sig.agency', 'sig.retention', 'sig.csat'].map(function (s) {
        var sig = D.signal(s), m = D.metric(s, cm), good = D.onTarget(s, m.v);
        return APP.meter(sig.name, sig.fmt(m.v) + ' vs ' + sig.fmt(sig.target), Math.min(100, D.attain(s, m.v)), good ? '' : 'is-warn');
      }).join('') + '</div></section></div>' +
      '<section class="card">' + APP.panelHead('Your own touch points', 'Leader coaching you owe, on the same list as everyone else.') +
      '<div class="wq">' + APP.myTasks().filter(function (t) { return t.status !== 'Completed'; }).map(taskRow).join('') + '</div></section>';
    return APP.page({ crumbs: [['Home', '#/home']], title: D.cmName(cm), desc: D.TODAY + ' · ' + esc(D.cm(cm).type) + ' · ' + D.cm(cm).beds + ' beds · ' + esc(D.cm(cm).city), body: body });
  }

  function regional() {
    var cms = APP.scopeCms();
    var rows = D.COMPLETION.filter(function (c) { return cms.indexOf(c.scope) >= 0; });
    var due = rows.reduce(function (n, r) { return n + r.due; }, 0), done = rows.reduce(function (n, r) { return n + r.done; }, 0);
    var approvals = APP.approvalsFor();
    var body =
      '<div class="kpi-row">' +
      stat('Region completion', Math.round(done / due * 100) + '%', 'gauge', done + ' of ' + due + ' touch points', 'is-down', '#/reports') +
      stat('Communities off target', String(rows.filter(function (r) { return r.done / r.due < 0.9; }).length) + ' of ' + rows.length, 'building-2', 'Below the 90% standard', 'is-down', '#/reports') +
      stat('Cases awaiting you', String(approvals.length), 'gavel', 'Two levels above approval', approvals.length ? 'is-down' : '', '#/cases') +
      stat('Site visits this quarter', String(APP.visits().filter(function (v) { return v.status === 'Completed'; }).length), 'building-2', '1 in progress, 1 scheduled', '', '#/visits') +
      '</div>' +
      chainCard() +
      '<section class="card">' + APP.panelHead('Completion by community', 'Who is and is not doing the work. This is the number leadership acts on.', APP.btn('Open reports', 'btn-surface', 'chart-column', 'data-act="goto" data-href="#/reports"', 'is-sm')) +
      APP.table([{ t: 'Community' }, { t: 'Touch points due', num: true }, { t: 'Completed', num: true }, { t: 'Completion', num: true }, { t: 'On time', num: true }, { t: 'Leaders', num: true }, { t: 'Status' }],
        rows.map(function (r) {
          var pct = Math.round(r.done / r.due * 100);
          return { attrs: 'class="is-clickable" data-act="goto" data-href="#/people?cm=' + r.scope + '"',
            cells: [esc(r.label), String(r.due), String(r.done), pct + '%', r.onTime + '%', String(r.leaders), APP.statusBadge(pct >= 90 ? 'Active' : pct >= 75 ? 'Pending approval' : 'Overdue').replace('Active', 'On standard').replace('Pending approval', 'Watch').replace('Overdue', 'Off standard')] };
        })) +
      '</section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Signals that are moving the wrong way', 'Ranked by distance from target across the region.') +
      APP.bars([['Cedar Ridge agency hours', 197], ['Cedar Ridge 90 day retention', 80], ['Cedar Ridge call light', 130], ['Cedar Ridge satisfaction', 96], ['Maple Grove falls', 91]].map(function (x) { return [x[0], x[1]]; }), function (v) { return v + '%'; }) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Shown as attainment against target. Above 100% on a lower is better metric means the community is over the line.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Site visits', 'Rounding is how a regional leader sees what a report cannot show.', APP.btn('All visits', 'btn-surface', null, 'data-act="goto" data-href="#/visits"', 'is-sm')) +
      '<div class="wq">' + APP.visits().slice(0, 4).map(function (v) {
        return '<div class="wq-row"><span class="wq-ic">' + ic('building-2', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(D.cmName(v.cm)) + '</span><span class="wq-s">' + esc(v.id) + ' · ' + esc(v.date) + (v.score ? ' · score ' + v.score + '%' : '') + '</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(v.status) + APP.btn(v.status === 'In progress' ? 'Resume' : v.status === 'Scheduled' ? 'Start' : 'Open', v.status === 'Completed' ? 'btn-surface' : 'btn-solid', null, 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div></section></div>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Northeast region', desc: D.TODAY + ' · ' + cms.length + ' communities · ' + APP.people().length + ' people in scope', body: body });
  }

  function hr() {
    var approvals = APP.approvalsFor();
    var byStatus = {};
    D.CASES.forEach(function (c) { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
    var body =
      (approvals.length ? APP.callout('<b>' + approvals.length + ' case is in your queue.</b> A case cannot activate without documented prior coaching, a completed letter and every recorded approval. <a href="#/cases">Open the queue</a>.', 'is-warning', 'gavel') : '') +
      '<div class="kpi-row">' +
      stat('Cases in your queue', String(approvals.length), 'gavel', 'Waiting on HR review', approvals.length ? 'is-down' : '', '#/cases') +
      stat('Active steps', String(byStatus.Active || 0), 'shield', 'Across all communities', '', '#/cases') +
      stat('Expiring in 30 days', '2', 'hourglass', 'They leave the ladder automatically', '', '#/cases') +
      stat('File exports this month', '4', 'package', '2 for grievance, 2 for audit', '', '#/reports/exports') +
      '</div>' +
      chainCard() +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Approval queue', 'Every state change is attributed and timestamped.', APP.btn('All cases', 'btn-surface', null, 'data-act="goto" data-href="#/cases"', 'is-sm')) +
      '<div class="wq">' + (approvals.length ? approvals.map(function (c) {
        var e = P(c.emp);
        return '<div class="wq-row"><span class="wq-ic is-late">' + ic('gavel', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(c.id) + ' · ' + esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name) + '</span>' +
          '<span class="wq-s">' + esc(e.name) + ', ' + esc(e.title) + ' · ' + esc(D.cmName(c.cm)) + ' · ' + c.evidence.length + ' coaching forms attached</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(c.status) + APP.btn('Review', 'btn-solid', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm') + '</div></div>';
      }).join('') : '<div class="table-empty">Nothing waiting on you.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Cases by state', 'All communities.') +
      APP.bars(Object.keys(byStatus).map(function (k) { return [k, byStatus[k]]; })) +
      '<p class="mini-note" style="margin-top:var(--space-4)">A rescinded record is retained and flagged. It never counts toward a later step.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Defensibility check', 'What a grievance or hearing asks for, and whether the file can produce it.') +
      APP.table([{ t: 'Question' }, { t: 'Where it comes from' }, { t: 'Status' }], [
        ['Was the employee coached before the step was issued', '4 forms attached to PC-3391, dated 22 Jul to 12 Sep', APP.statusBadge('Completed')],
        ['Did the employee receive the letter', 'Acknowledgement timestamp on the record', APP.statusBadge('Completed')],
        ['Who approved it and when', 'Approval chain with four recorded decisions', APP.statusBadge('Pending approval')],
        ['Was the record altered after submission', 'Immutable submission, edits create a new version', APP.statusBadge('Completed')],
        ['Can the whole file be produced', 'Employee file export, one package', APP.statusBadge('Completed')]
      ].map(function (r) { return { cells: r }; })) +
      '</section>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Employee relations queue', desc: D.TODAY + ' · ' + D.ORG + ' · all ' + D.COMMUNITIES.length + ' communities', body: body });
  }

  function quality() {
    var open = D.CROSS.filter(function (x) { return x.state === 'Sent to leader'; });
    var body =
      APP.callout('You sit outside the reporting line. A cross group suggestion goes to the employee leader with your department attributed, and the leader decides whether to run a form. You never write on the employee record directly.', 'is-info', 'shield') +
      '<div class="kpi-row">' +
      stat('Suggestions open', String(open.length), 'shield', 'Waiting on a leader', '', '#/coaching') +
      stat('Accepted this quarter', String(D.CROSS.filter(function (x) { return x.state === 'Accepted'; }).length), 'circle-check', 'Turned into a documented form', 'is-up', '#/coaching') +
      stat('Rounds completed', String(APP.visits().filter(function (v) { return v.status === 'Completed'; }).length), 'building-2', 'Infection control and med room', '', '#/visits') +
      stat('Communities at survey risk', '2', 'triangle-alert', 'Falls and staffing consistency', 'is-down', '#/reports') +
      '</div>' +
      chainCard() +
      '<section class="card">' + APP.panelHead('Cross group suggestions', 'Attributed to Quality and Compliance, actioned by the employee leader.', APP.btn('Open cross group', 'btn-surface', null, 'data-act="goto" data-href="#/coaching/crossgroup"', 'is-sm')) +
      '<div class="wq">' + D.CROSS.map(function (x) {
        var e = P(x.emp);
        return '<div class="wq-row"><span class="wq-ic' + (x.state === 'Declined' ? ' is-late' : x.state === 'Accepted' ? ' is-good' : '') + '">' + ic('shield', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(x.topic) + '</span><span class="wq-s">' + esc(e.name) + ' · ' + esc(D.cmName(x.cm)) + ' · to ' + esc(P(x.leader).name) + ' · ' + esc(x.id) + '</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(x.state) + APP.btn('Open', 'btn-surface', null, 'data-act="open-cross" data-id="' + x.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div></section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Survey readiness signals', 'The metrics a state surveyor walks in asking about.') +
      '<div class="stack-3">' + ['sig.falls', 'sig.med_pass', 'sig.careplan'].map(function (s) {
        var sig = D.signal(s), m = D.metric(s, 'CM-SB'), good = D.onTarget(s, m.v);
        return APP.meter(sig.name + ', Stonebrook', sig.fmt(m.v) + ' vs ' + sig.fmt(sig.target), Math.min(100, D.attain(s, m.v)), good ? '' : 'is-warn');
      }).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Verbatim themes', 'Family survey and resident council, this quarter.', APP.btn('Verbatim analysis', 'btn-surface', null, 'data-act="goto" data-href="#/reports/verbatims"', 'is-sm')) +
      APP.bars(D.VERBATIM_THEMES.slice(0, 6)) + '</section></div>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Quality and compliance', desc: D.TODAY + ' · cross group scope · ' + D.ORG, body: body });
  }

  function admin() {
    var on = D.RULES.filter(function (r) { return r.on; });
    var body =
      '<div class="kpi-row">' +
      stat('Form types configured', String(D.FORM_TYPES.length), 'file-text', 'Across three families', '', '#/settings') +
      stat('Task rules live', on.length + ' of ' + D.RULES.length, 'sliders-horizontal', '1 off, 21 days in draft', 'is-down', '#/settings/rules') +
      stat('Tasks generated this cycle', String(D.RULES.reduce(function (n, r) { return n + r.fired; }, 0)), 'activity', 'No leader decided any of them', '', '#/settings/rules') +
      stat('Deleted records', String(D.DELETED_FORMS.length), 'trash-2', 'Retained with a reason', '', '#/docs/deleted') +
      '</div>' +
      chainCard() +
      '<section class="card">' + APP.panelHead('Rules that fired this cycle', 'A rule is the only thing allowed to create a task.', APP.btn('Configure rules', 'btn-surface', 'sliders-horizontal', 'data-act="goto" data-href="#/settings/rules"', 'is-sm')) +
      APP.bars(D.RULES.filter(function (r) { return r.fired; }).sort(function (a, b) { return b.fired - a.fired; }).slice(0, 8).map(function (r) { return [r.name, r.fired]; })) +
      '</section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Evidence guardrails', 'What the system structurally refuses to hold.', APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/settings/integrity"', 'is-sm')) +
      '<div class="wq">' + D.GUARDRAILS.slice(0, 4).map(function (g) {
        return '<div class="wq-row"><span class="wq-ic' + (g.state === 'Blocked' ? ' is-late' : '') + '">' + ic(g.state === 'Blocked' ? 'ban' : 'triangle-alert', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(g.name) + '</span><span class="wq-s">' + esc(g.desc.slice(0, 90)) + '...</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(g.state) + '</div></div>';
      }).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Retention', 'Every class of record has one rule and no exceptions.') +
      APP.dataList(D.RETENTION.slice(0, 4).map(function (r) { return [esc(r.what), esc(r.keep)]; })) +
      APP.btn('Open retention', 'btn-soft', 'history', 'data-act="goto" data-href="#/settings/retention"', 'is-sm') +
      '</section></div>';
    return APP.page({ crumbs: [['Home', '#/home']], title: 'Platform health', desc: D.TODAY + ' · configuration and audit · ' + D.ORG, body: body });
  }

  APP.VIEWS.home = function () {
    var k = APP.S.roleKey;
    if (k === 'frontline') return frontline();
    if (k === 'ed') return ed();
    if (k === 'regional') return regional();
    if (k === 'hr') return hr();
    if (k === 'quality') return quality();
    if (k === 'admin') return admin();
    return manager();
  };

  APP.ACT.goto = function (el) { APP.closeAll(); APP.go(el.getAttribute('data-href')); };
  APP.ACT['open-signal'] = function (el) {
    var id = el.getAttribute('data-id'), cm = el.getAttribute('data-cm');
    var s = D.signal(id), m = D.metric(id, cm);
    APP.dialog({
      title: s.name, sub: D.cmName(cm) + ' · ' + s.domain,
      body: APP.dataList([
        ['Signal id', '<span class="cell-id">' + esc(id) + '</span>'],
        ['Current', s.fmt(m.v)], ['Target', s.fmt(s.target)],
        ['Attainment', D.attain(id, m.v) + '%'],
        ['Direction', s.dir === 'up' ? 'Higher is better' : 'Lower is better'],
        ['Refresh cadence', 'Nightly, 02:00 local'],
        ['Subscribed rules', D.RULES.filter(function (r) { return r.sig === id; }).map(function (r) { return esc(r.name); }).join('<br>') || 'None yet']
      ]) + '<div style="margin-top:var(--space-4)">' + APP.spark(m.trend, !D.onTarget(id, m.v)) + '<p class="mini-note">Last six months.</p></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('See rules on this signal', 'btn-soft', 'sliders-horizontal', 'data-act="goto" data-href="#/settings/rules"')
    });
  };
})();
