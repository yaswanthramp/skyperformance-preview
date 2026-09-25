/* skyPerformance: the dashboards. One per persona, all built from the same
   pieces: what is waiting on you, what you owe, and what you just did. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function stat(label, value, icon, sub, kind, href) {
    var tag = href ? 'button' : 'section';
    var attrs = href ? ' class="card stat-card is-clickable" data-act="goto" data-href="' + href + '"' : ' class="card stat-card"';
    return '<' + tag + attrs + '><div class="sc-head"><span class="sc-label">' + esc(label) + '</span><span class="sc-icon">' + ic(icon, 18) + '</span></div>' +
      '<div class="sc-value">' + value + '</div>' +
      (sub ? '<div class="sc-delta ' + (kind || '') + '">' + (kind === 'is-down' ? ic('trending-down', 14) : '') + esc(sub) + '</div>' : '') +
      '</' + tag + '>';
  }
  APP.stat = stat;

  function recordRow(r) {
    var ct = D.coachingType(r.type);
    return '<div class="wq-row"><span class="wq-ic' + (ct.tone === 'good' ? ' is-good' : '') + '">' + ic(ct.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(r.topic || ct.name) + '</span>' +
      '<span class="wq-s">' + esc(ct.name) + ' · ' + (r.group ? r.group.length + ' people' : esc(P(r.emp).name)) + ' · ' + esc(r.on.replace(/^\w+ /, '')) + '</span></div>' +
      '<div class="wq-right">' + (r.group ? APP.badge('Team', 'is-neutral') : r.ack ? APP.badge('Acknowledged', 'is-success') : APP.badge('Waiting', 'is-warning')) +
      APP.btn('Open', 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm') + '</div></div>';
  }

  /* the chain, in the client's own order */
  function chainCard() {
    var t = D.CONFIG.terms;
    var steps = [
      ['Document it', 'A conversation, on the day', 'message-square-text', '#/coaching'],
      ['They acknowledge', 'Dual sign off', 'signature', '#/coaching'],
      ['It happens again', 'A second record', 'history', '#/coaching'],
      ['Start a ' + t.pipShort, 'Earlier records attach', 'clipboard-check', '#/pips'],
      ['Approve, then activate', 'After you meet them', 'user-check', '#/pips'],
      ['The file survives', 'Exported to ' + D.CONFIG.hris, 'package', '#/records/exports']
    ];
    var allowed = APP.nav().map(function (n) { return n[0]; });
    return '<section class="card">' + APP.panelHead('How the product works', 'Click any step') +
      '<div class="chain">' + steps.map(function (s, i) {
        var route = s[3].split('/')[1];
        var can = allowed.indexOf(route) >= 0;
        return '<button class="chain-step" ' + (can ? 'data-act="goto" data-href="' + s[3] + '"' : 'data-act="toast" data-t="Not in this role" data-b="Switch role with View as in the header." data-k="info"') + '>' +
          '<span class="chain-ic">' + ic(s[2], 16) + '</span><span class="chain-text"><span class="chain-t">' + esc(s[0]) + '</span><span class="chain-s">' + esc(s[1]) + '</span></span></button>' +
          (i < steps.length - 1 ? '<span class="chain-arrow">' + ic('chevron-right', 16) + '</span>' : '');
      }).join('') + '</div></section>';
  }

  /* ---------------- employee ---------------- */
  function employee() {
    var me = APP.me(), recs = D.recordsFor(me.id);
    var waiting = recs.filter(function (r) { return r.emp === me.id && !r.ack; });
    var todos = APP.actions().filter(function (a) { return a.status !== 'Closed'; });
    var pip = APP.pips()[0];
    var ev = APP.evaluations()[0];
    return (waiting.length ? APP.callout('<b>' + waiting.length + ' record is waiting for you to acknowledge.</b> <a href="#/mycoaching">Read it</a>', 'is-warning', 'hourglass') : '') +
      (pip && pip.status !== 'Closed' ? APP.callout('<b>You are on a ' + esc(D.pipLevel(pip.level).name) + ' plan.</b> Your manager reviews it with you on the dates in the plan. <a href="#/mypip">See the plan</a>', 'is-warning', 'clipboard-check') : '') +
      '<div class="kpi-row">' +
      stat('To acknowledge', String(waiting.length), 'signature', waiting.length ? 'Waiting on you' : 'Nothing waiting', waiting.length ? 'is-down' : '', '#/mycoaching') +
      stat('Your to-dos', String(todos.length), 'list-checks', todos.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/todos') +
      stat('Records about you', String(recs.length), 'message-square-text', recs.filter(function (r) { return r.type === 'CT-REC'; }).length + ' recognition', '', '#/mycoaching') +
      stat('Next evaluation', ev ? ev.reviewDate.replace(/^\w+ /, '') : '—', 'clipboard-list', ev ? ev.status : 'Not scheduled', '', '#/myfile') +
      '</div>' +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Recent records about you', 'In your manager’s words.', APP.btn('See all', 'btn-surface', null, 'data-act="goto" data-href="#/mycoaching"', 'is-sm')) +
      '<div class="wq">' + (recs.length ? recs.slice(0, 5).map(recordRow).join('') : '<div class="table-empty">Nothing yet.</div>') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Your to-dos', todos.length + ' open') +
      '<div class="wq">' + (todos.length ? todos.slice(0, 4).map(APP.actionRow).join('') : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
      '</div>';
  }

  /* ---------------- department head and Executive Director ---------------- */
  function manager() {
    var me = APP.me(), recs = APP.records();
    var mineRaised = recs.filter(function (r) { return r.by === me.id; });
    var todos = APP.actions().filter(function (a) { return a.owner === me.id && a.status !== 'Closed'; });
    var fromVisit = todos.filter(function (a) { return a.fromKind === 'visit'; });
    var pipsPending = APP.pips().filter(function (x) { return x.status === 'Pending approval'; });
    var approvals = APP.approvalsFor();
    var evalsOpen = APP.evaluations().filter(function (e) { return e.status === 'In progress'; });
    var noAck = recs.filter(function (r) { return r.emp && !r.ack; });
    var visits = APP.visits().filter(function (v) { return v.status === 'In progress'; });

    return (approvals.length ? APP.callout('<b>' + approvals.length + ' ' + APP.term('pipShort') + ' needs your approval.</b> <a href="#/pips">Open the queue</a>', 'is-warning', 'gavel') : '') +
      (fromVisit.length ? APP.callout('<b>' + fromVisit.length + ' to-dos came from the site visit.</b> ' + esc(P(fromVisit[0].by).name) + ' assigned them with owners and dates. <a href="#/todos">Work the list</a>', 'is-info', 'building-2') : '') +
      (visits.length ? APP.callout('<b>' + esc(P(visits[0].by).name) + ' is on site now.</b> ' + visits[0].answered + ' of 172 answered. <a href="#/visits/' + visits[0].id + '">Follow along</a>', 'is-info', 'building-2') : '') +
      '<div class="kpi-row">' +
      stat('Your to-dos', String(todos.length), 'list-checks', todos.filter(function (a) { return a.status === 'Overdue'; }).length + ' overdue', 'is-down', '#/todos') +
      stat('Documented this month', String(mineRaised.length), 'message-square-text', mineRaised.filter(function (r) { return r.type === 'CT-REC'; }).length + ' recognition', '', '#/coaching') +
      stat('Waiting on acknowledgement', String(noAck.length), 'hourglass', noAck.length ? 'Employees have not read them' : 'All acknowledged', noAck.length ? 'is-down' : '', '#/coaching') +
      stat('Evaluations open', String(evalsOpen.length), 'clipboard-list', evalsOpen.length ? 'Due this cycle' : 'None open', '', '#/evaluations') +
      '</div>' +
      chainCard() +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Recently documented', 'Everything you and your team have filed.',
        APP.btn('New ' + APP.term('coaching').toLowerCase(), 'btn-solid', 'plus', 'data-act="new-coaching"', 'is-sm')) +
      '<div class="wq">' + (recs.length ? recs.slice(0, 6).map(recordRow).join('') : '<div class="table-empty">Nothing yet. Start with a recognition.</div>') + '</div></section>' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Your team', APP.team().length + ' people') +
      '<div class="wq">' + APP.team().slice(0, 6).map(function (p) {
        var n = D.recordsFor(p.id).length;
        var open = D.ACTIONS.filter(function (a) { return a.owner === p.id && a.status !== 'Closed'; }).length;
        return '<button class="wq-row" data-act="goto-person" data-id="' + p.id + '" style="width:100%;border:0;background:none;cursor:pointer;text-align:left">' +
          APP.av(p, 30) + '<span class="wq-main"><span class="wq-t">' + esc(p.name) + '</span><span class="wq-s">' + esc(p.title) + '</span></span>' +
          '<span class="wq-right">' + (n ? APP.badge(n + ' records', 'is-neutral') : APP.badge('No records', 'is-warning')) +
          (open ? APP.badge(open + ' to-do', 'is-info') : '') + ic('chevron-right', 16) + '</span></button>';
      }).join('') + '</div></section>' +
      (pipsPending.length ? '<section class="card">' + APP.panelHead(APP.term('pipShort') + 's in flight') +
        '<div class="wq">' + pipsPending.map(function (x) {
          return '<div class="wq-row"><span class="wq-ic is-late">' + ic('clipboard-check', 16) + '</span>' +
            '<div class="wq-main"><span class="wq-t">' + esc(P(x.emp).name) + ' · ' + esc(D.pipLevel(x.level).name) + '</span>' +
            '<span class="wq-s">' + esc(x.id) + ' · with ' + esc(P(x.next).name) + '</span></div>' +
            '<div class="wq-right">' + APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/pips/' + x.id + '"', 'is-sm') + '</div></div>';
        }).join('') + '</div></section>' : '') +
      '</div></div>';
  }

  /* ---------------- regional ---------------- */
  function regional() {
    var visits = APP.visits();
    var inProg = visits.filter(function (v) { return v.status === 'In progress'; });
    var due = visits.filter(function (v) { return v.status === 'Scheduled'; });
    var approvals = APP.approvalsFor();
    var sent = D.ACTIONS.filter(function (a) { return a.by === APP.me().id; });
    return (inProg.length ? APP.callout('<b>' + esc(D.siteName(inProg[0].site)) + ' is in progress.</b> ' + inProg[0].answered + ' of 172 answered. <a href="#/visits/' + inProg[0].id + '">Carry on</a>', 'is-info', 'building-2') : '') +
      (approvals.length ? APP.callout('<b>' + approvals.length + ' ' + APP.term('pipShort') + ' waiting on you.</b> <a href="#/pips">Open the queue</a>', 'is-warning', 'gavel') : '') +
      '<div class="kpi-row">' +
      stat(APP.terms('site') + ' in your region', String(APP.scopeSites().length), 'building-2', 'Assigned to you', '', '#/org') +
      stat('Visits complete', String(visits.filter(function (v) { return v.status === 'Complete'; }).length), 'clipboard-check', due.length + ' scheduled', '', '#/visits') +
      stat('Actions you assigned', String(sent.length), 'list-checks', sent.filter(function (a) { return a.status === 'Closed'; }).length + ' closed by the community', '', '#/todos/raised') +
      stat(APP.term('pipShort') + 's to approve', String(approvals.length), 'gavel', approvals.length ? 'Waiting on you' : 'Nothing waiting', approvals.length ? 'is-down' : '', '#/pips') +
      '</div>' +
      chainCard() +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead(APP.terms('visit'), 'Your communities.',
        APP.btn('Start a visit', 'btn-solid', 'circle-play', 'data-act="new-visit"', 'is-sm')) +
      '<div class="wq">' + visits.map(function (v) {
        return '<div class="wq-row"><span class="wq-ic">' + ic('building-2', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(D.siteName(v.site)) + '</span>' +
          '<span class="wq-s">' + esc(v.id) + ' · ' + esc(v.date) + ' · Executive Director ' + esc(P(v.ed).name) + (v.score != null ? ' · ' + v.score + '%' : '') + '</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(v.status === 'Complete' ? 'Completed' : v.status) +
          APP.btn(v.status === 'Complete' ? 'Open' : v.status === 'Scheduled' ? 'Start' : 'Resume', v.status === 'Complete' ? 'btn-surface' : 'btn-solid', null, 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div></section>' +
      '<section class="card">' + APP.panelHead('Where the actions went', 'Assigned during a visit, worked by the community.') +
      '<div class="wq">' + (sent.length ? sent.slice(0, 6).map(APP.actionRow).join('') : '<div class="table-empty">Nothing assigned yet.</div>') + '</div></section>' +
      '</div>';
  }

  /* ---------------- HR ---------------- */
  function hr() {
    var approvals = APP.approvalsFor();
    var pips = D.PIPS, byLevel = {};
    pips.forEach(function (x) { var n = D.pipLevel(x.level).name; byLevel[n] = (byLevel[n] || 0) + 1; });
    var noAck = D.RECORDS.filter(function (r) { return r.emp && !r.ack; }).length;
    return (approvals.length ? APP.callout('<b>' + approvals.length + ' ' + APP.term('pipShort') + ' in your queue.</b> <a href="#/pips">Open it</a>', 'is-warning', 'gavel') : '') +
      APP.callout('<b>The retention period for terminated files is still unset.</b> Until it is, nothing is deleted. <a href="#/settings/retention">Set it</a>', 'is-warning', 'triangle-alert') +
      '<div class="kpi-row">' +
      stat('In your queue', String(approvals.length), 'gavel', approvals.length ? 'Waiting on HR review' : 'Nothing waiting', approvals.length ? 'is-down' : '', '#/pips') +
      stat('Records this cycle', String(D.RECORDS.length), 'message-square-text', noAck + ' not acknowledged', noAck ? 'is-down' : '', '#/coaching') +
      stat('Active plans', String(pips.filter(function (x) { return x.status === 'Active'; }).length), 'clipboard-check', 'Across all communities', '', '#/pips') +
      stat('Evaluations complete', String(D.EVALUATIONS.filter(function (e) { return e.status === 'Complete'; }).length) + ' of ' + D.EVALUATIONS.length, 'clipboard-list', 'This cycle', '', '#/evaluations') +
      '</div>' +
      chainCard() +
      '<div class="split-rail">' +
      '<section class="card">' + APP.panelHead('Approval queue', 'Nothing activates until every approval is in.', APP.btn('All plans', 'btn-surface', null, 'data-act="goto" data-href="#/pips"', 'is-sm')) +
      '<div class="wq">' + (approvals.length ? approvals.map(function (x) {
        return '<div class="wq-row"><span class="wq-ic is-late">' + ic('clipboard-check', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(P(x.emp).name) + ' · ' + esc(D.pipLevel(x.level).name) + '</span>' +
          '<span class="wq-s">' + esc(D.offenseText(x)) + ' · ' + esc(x.evidence.length) + ' records attached · ' + esc(D.siteName(x.site)) + '</span></div>' +
          '<div class="wq-right">' + APP.btn('Review', 'btn-solid', null, 'data-act="goto" data-href="#/pips/' + x.id + '"', 'is-sm') + '</div></div>';
      }).join('') : '<div class="table-empty">Nothing waiting on you.</div>') + '</div></section>' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Plans by level') +
      APP.bars(Object.keys(byLevel).map(function (k) { return [k, byLevel[k]]; })) + '</section>' +
      '<section class="card">' + APP.panelHead('Defensibility', 'What an appeal asks for.') +
      '<ul class="tick-list">' +
      '<li>' + ic('check', 14) + '<span>Coaching before the plan: ' + D.PIPS.filter(function (x) { return x.evidence.length; }).length + ' of ' + D.PIPS.length + ' plans have records attached</span></li>' +
      '<li>' + ic('check', 14) + '<span>Employee acknowledgement recorded on every record</span></li>' +
      '<li>' + ic('check', 14) + '<span>Approvals timestamped and attributed</span></li>' +
      '<li>' + ic('check', 14) + '<span>File exports to ' + esc(D.CONFIG.hris) + ' on termination</span></li>' +
      '</ul></section></div></div>';
  }

  APP.VIEWS.home = function () {
    var k = S.personaKey;
    var body = k === 'employee' ? employee() : k === 'regional' ? regional() : k === 'hr' ? hr() : manager();
    var title = k === 'employee' ? 'Your record, ' + APP.me().name.split(' ')[0]
      : k === 'hr' ? 'HR overview' : 'Good morning, ' + APP.me().name.split(' ')[0];
    return APP.page({
      crumbs: [['Home', '#/home']],
      title: title,
      desc: D.TODAY + ' · ' + APP.roleLabel() + (APP.isManager() ? ', ' + APP.levelLabel().toLowerCase() : '') + ' · ' + APP.scopePath(),
      body: body
    });
  };
})();
