/* skyPerformance: Performance Improvement Plan, following the client form.
   Four levels, SMART actions, initial meeting, reviews, resolution, and the
   termination section. Approved before it is activated. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function levelBadge(k) {
    var l = D.pipLevel(k);
    var kind = k === 'termination' ? 'is-danger' : k === 'final' ? 'is-warning' : k === 'written' ? 'is-warning' : 'is-info';
    return APP.badge(l.name, kind);
  }
  function statusBadge(x) {
    if (x.status === 'Closed') return APP.badge(x.outcome || 'Closed', x.outcome === 'Successfully completed' ? 'is-success' : 'is-neutral is-void');
    return APP.statusBadge(x.status);
  }

  function tabsFor(active) {
    var all = APP.pips();
    return APP.tabs([
      ['pending', 'Pending approval', '#/pips/t/pending', all.filter(function (x) { return x.status === 'Pending approval'; }).length],
      ['active', 'Active', '#/pips/t/active', all.filter(function (x) { return x.status === 'Active'; }).length],
      ['closed', 'Closed', '#/pips/t/closed', all.filter(function (x) { return x.status === 'Closed'; }).length],
      ['all', 'All', '#/pips/t/all', all.length]
    ], active);
  }

  function list(tab) {
    var all = APP.pips();
    var rows = all.filter(function (x) {
      if (tab === 'pending') return x.status === 'Pending approval';
      if (tab === 'active') return x.status === 'Active';
      if (tab === 'closed') return x.status === 'Closed';
      return true;
    });
    var mine = APP.approvalsFor();
    return APP.hint('A ' + APP.term('pipShort') + ' stays active for ' + D.PIP_ACTIVE_MONTHS + ' months. Coaching already on file attaches as the supporting documentation.', 'clipboard-check') +
      (mine.length ? APP.callout('<b>' + mine.length + ' waiting on your approval.</b> Nothing reaches the employee until every approver has signed off.', 'is-warning', 'gavel') : '') +
      APP.glance([
        [all.filter(function (x) { return x.status === 'Pending approval'; }).length, 'Pending', all.some(function (x) { return x.status === 'Pending approval'; }) ? 'is-warn' : ''],
        [all.filter(function (x) { return x.status === 'Active'; }).length, 'Active'],
        [all.filter(function (x) { return x.outcome === 'Successfully completed'; }).length, 'Completed', 'is-good'],
        [all.filter(function (x) { return x.level === 'termination' || x.outcome === 'Advanced to termination'; }).length, 'Ended in termination']
      ]) +
      (APP.canCoach() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The ' + APP.term('pipShort') + ' report"', 'is-sm') +
        APP.btn('Start a ' + APP.term('pipShort'), 'btn-solid', 'plus', 'data-act="new-pip"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Employee' }, { t: 'Level' }, { t: 'Type of offense' }, { t: 'Opened' }, { t: 'Active until' }, { t: 'Status' }, { t: 'Next' }, { t: '' }],
        rows.map(function (x) {
          return { cells: [
            APP.personLine(x.emp, esc(D.siteName(x.site)), 28),
            levelBadge(x.level), esc(x.offense),
            esc(x.opened.replace(/^\w+ /, '')), esc((x.end || '').replace(/^\w+ /, '') || '—'),
            statusBadge(x),
            x.status === 'Pending approval' && x.next ? esc(P(x.next).name.split(' ')[0]) : '—',
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/pips/' + x.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing here.' }) + '</section>' +
      APP.why('How a ' + APP.term('pipShort') + ' ends', '<p>Successfully completed, extended, or advanced to the next level. The level of corrective action is at management discretion and depends on the severity. Advancing past a Final Written Counseling opens the termination section of the same form.</p>');
  }

  /* ---------------- detail: the form itself ---------------- */
  function detail(id) {
    var x = D.pip(id);
    if (!x || !(APP.isHR() || APP.inScope(x.emp) || x.emp === APP.me().id || x.by === APP.me().id)) {
      return APP.page({ crumbs: [['Home', '#/home'], [APP.terms('pipShort'), '#/pips']], title: 'Not found', desc: '',
        body: APP.emptyState('clipboard-check', 'Not in your scope', 'Plans follow the reporting line.', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/pips"')) });
    }
    var e = P(x.emp), me = APP.me();
    var myTurn = x.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    var owner = x.by === me.id;
    var isEmp = x.emp === me.id;

    var body =
      (myTurn ? APP.callout('<b>Waiting on your approval.</b> Read the reason and the supporting records before you decide.', 'is-warning', 'gavel') : '') +
      (x.status === 'Pending approval' && owner ? APP.callout('Submitted and waiting on ' + esc(P(x.next).name) + '. Once every approval is in, it comes back to you to activate after you meet ' + esc(e.name.split(' ')[0]) + '.', 'is-info', 'hourglass') : '') +
      (isEmp && x.status === 'Pending approval' ? APP.callout('This plan has not been activated. Your manager will meet you before anything takes effect.', 'is-info', 'info') : '') +
      APP.glance([
        [D.pipLevel(x.level).name, 'Level'],
        [x.actions.filter(function (a) { return a.done; }).length + ' of ' + x.actions.length, 'Actions met'],
        [x.reviews.filter(function (r) { return r.note; }).length + ' of ' + x.reviews.length, 'Reviews recorded'],
        [x.evidence.length, 'Records attached']
      ]) +
      '<div class="split-rail"><div class="stack-4">' +

      '<section class="card">' + APP.panelHead('Plan details') +
      APP.dataList([
        ['Employee', APP.personLine(e, esc(e.title), 28, false)],
        ['Supervisor', APP.personLine(x.by, false, 28, false)],
        ['Level of discipline', levelBadge(x.level)],
        ['Type of offense', esc(x.offense)],
        ['Plan start date', esc(x.start)],
        ['Plan end date', esc(x.end) + ' <span class="mini-note">(' + D.PIP_ACTIVE_MONTHS + ' months)</span>'],
        ['Status', statusBadge(x)]
      ]) + '</section>' +

      '<section class="card">' + APP.panelHead('Summary and reasons', 'Including previous counseling dates.') +
      '<p class="t-2">' + esc(x.reason) + '</p>' +
      (x.evidence.length ? '<div class="sec-label">Previous counselings attached</div><div class="wq">' + x.evidence.map(function (rid) {
        var r = D.record(rid); if (!r) return '';
        return '<div class="wq-row"><span class="wq-ic">' + ic(D.coachingType(r.type).ic, 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(r.topic) + '</span><span class="wq-s">' + esc(r.id) + ' · ' + esc(r.on) + ' · ' + esc(D.coachingType(r.type).name) + '</span></div>' +
          '<div class="wq-right">' + (r.ack ? APP.badge('Acknowledged', 'is-success') : APP.badge('Not acknowledged', 'is-warning')) +
          APP.btn('Read', 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div>'
        : APP.callout('No previous counselings attached. Anything above a first counseling is hard to defend without them.', 'is-warning', 'triangle-alert')) +
      '</section>' +

      '<section class="card">' + APP.panelHead('Required actions', 'All action items follow the SMART framework.',
        owner && x.status === 'Active' ? APP.btn('Add action', 'btn-surface', 'plus', 'data-act="pip-add-action" data-id="' + x.id + '"', 'is-sm') : '') +
      '<div class="table-wrap"><table class="table"><thead><tr><th style="width:56px"></th><th>Action</th><th style="width:26%">Due date</th></tr></thead><tbody>' +
      x.actions.map(function (a, i) {
        return '<tr><td data-label=""><button class="tick' + (a.done ? ' is-on' : '') + '" data-act="pip-tick" data-id="' + x.id + '" data-i="' + i + '" aria-pressed="' + a.done + '">' + (a.done ? ic('check', 14) : '') + '</button></td>' +
          '<td data-label="Action"><span class="cell-strong">' + esc(a.t) + '</span></td>' +
          '<td data-label="Due date">' + esc(a.due) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      APP.hint('Specific, measurable, attainable, relevant, time oriented.', 'target') +
      '</section>' +

      '<section class="card">' + APP.panelHead('Meetings and follow-up') +
      '<div class="timeline">' +
      '<div class="tl-row' + (x.initial.note ? ' is-done' : ' is-next') + '"><span class="tl-dot">' + ic(x.initial.note ? 'check' : 'clock', 14) + '</span>' +
      '<div class="tl-body"><div class="tl-top"><span class="tl-when">Initial meeting · ' + esc(x.initial.on) + '</span>' +
      (x.initial.note ? APP.badge('Recorded', 'is-success') : APP.badge('Not recorded', 'is-neutral')) + '</div>' +
      '<span class="tl-note">' + (x.initial.note ? esc(x.initial.note) : 'Summary and feedback recorded when the plan is activated.') + '</span></div></div>' +
      x.reviews.map(function (r, i) {
        return '<div class="tl-row' + (r.note ? ' is-done' : '') + '"><span class="tl-dot">' + ic(r.note ? 'check' : 'circle-dot', 14) + '</span>' +
          '<div class="tl-body"><div class="tl-top"><span class="tl-when">Review ' + (i + 1) + ' · ' + esc(r.on) + '</span>' +
          (r.note ? APP.badge('Recorded', 'is-success') : APP.badge('Scheduled', 'is-neutral')) +
          (!r.note && owner && x.status === 'Active' ? APP.btn('Record', 'btn-solid', null, 'data-act="pip-review" data-id="' + x.id + '" data-i="' + i + '"', 'is-sm') : '') + '</div>' +
          '<span class="tl-note">' + (r.note ? esc(r.note) : 'Meeting notes recorded on the day.') + '</span></div></div>';
      }).join('') +
      '<div class="tl-row' + (x.resolution ? ' is-done' : '') + '"><span class="tl-dot">' + ic(x.resolution ? 'check' : 'flag', 14) + '</span>' +
      '<div class="tl-body"><div class="tl-top"><span class="tl-when">Resolution' + (x.resolution ? ' · ' + esc(x.resolution.on) : '') + '</span>' +
      (x.resolution ? APP.badge(x.resolution.next, 'is-info') : APP.badge('Open', 'is-neutral')) + '</div>' +
      '<span class="tl-note">' + (x.resolution ? esc(x.resolution.note) : 'Completed, extended, or advanced to the next level.') + '</span></div></div>' +
      '</div></section>' +

      (x.termination ? '<section class="card">' + APP.panelHead('Termination details') +
        APP.dataList([
          ['Supervisor', APP.personLine(x.termination.supervisor, false, 26, false)],
          ['Final date of employment', esc(x.termination.finalDay)],
          ['Reason for termination', esc(x.termination.reason)],
          ['Exit meeting conducted by', APP.personLine(x.termination.exitBy, false, 26, false)],
          ['Company belongings returned', esc(x.termination.belongings)],
          ['Alarms and safe codes changed', esc(x.termination.codes)],
          ['System and email access', esc(x.termination.access)]
        ]) + '</section>' : '') +

      '<section class="card">' + APP.panelHead('Audit trail', 'Append only.') +
      '<div class="audit">' + x.audit.map(function (a) {
        return '<div class="audit-row"><span class="audit-when">' + esc(a.on) + '</span><span class="audit-what">' + esc(a.what) + '<span class="audit-who">' + esc(a.who === 'System' ? 'System' : P(a.who).name) + '</span></span></div>';
      }).join('') + '</div></section></div>' +

      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Approval') +
      '<div class="chain-list">' + x.approvals.map(function (a) {
        return '<div class="ch-row"><span class="ch-state">' + (a.state === 'Approved' ? ic('circle-check', 18) : a.state === 'Waiting' ? ic('hourglass', 18) : ic('send', 18)) + '</span>' +
          '<div class="ch-main"><span class="ch-who">' + esc(P(a.who).name) + '</span><span class="ch-role">' + esc(a.role) + '</span></div>' +
          '<span class="ch-when">' + (a.on ? esc(a.on) : APP.statusBadge('Waiting')) + '</span></div>';
      }).join('') + '</div>' +
      (myTurn ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Send back', 'btn-surface', 'undo-2', 'data-act="pip-reject" data-id="' + x.id + '"', 'is-sm') +
        APP.btn('Approve', 'btn-solid', 'check', 'data-act="pip-approve" data-id="' + x.id + '"', 'is-sm') + '</div>' : '') +
      (x.status === 'Approved' && owner ? '<div style="margin-top:var(--space-4)">' +
        APP.btn('Activate after meeting the employee', 'btn-solid', 'circle-play', 'data-act="pip-activate" data-id="' + x.id + '"', 'is-sm') + '</div>' : '') +
      '</section>' +

      '<section class="card">' + APP.panelHead('Support available', 'Standing text on every plan.') +
      '<ul class="tick-list">' +
      '<li>' + ic('phone', 14) + '<span>Employee Assistance Program, 24 hour hotline</span></li>' +
      '<li>' + ic('shield-check', 14) + '<span>Reasonable accommodation, through your supervisor and HR</span></li>' +
      '<li>' + ic('calendar', 14) + '<span>FMLA, paid sick leave and short term disability guidance</span></li>' +
      '</ul></section>' +

      (x.status === 'Active' && owner ? '<section class="card">' + APP.panelHead('Close the plan') +
        '<div class="stack-2">' +
        APP.btn('Successfully completed', 'btn-solid', 'circle-check', 'data-act="pip-close" data-id="' + x.id + '" data-o="Successfully completed"', 'is-sm') +
        APP.btn('Extend the plan', 'btn-surface', 'clock', 'data-act="pip-close" data-id="' + x.id + '" data-o="Extended"', 'is-sm') +
        APP.btn('Advance to the next level', 'btn-surface is-danger', 'chevrons-up', 'data-act="pip-close" data-id="' + x.id + '" data-o="Advanced"', 'is-sm') +
        '</div></section>' : '') +

      '<section class="card">' + APP.panelHead('Signatures', 'Captured when the plan is activated.') +
      '<div class="sign-list">' +
      [['Employee', e.id], ['Supervisor', x.by], ['Witness', null]].map(function (r) {
        return '<div class="sign-row"><span class="sign-role">' + r[0] + '</span>' +
          '<span class="sign-mark">' + (x.status === 'Active' || x.status === 'Closed' ? ic('signature', 16) + ' <span class="mini-note">signed ' + esc(x.start) + '</span>' : '<span class="mini-note">on activation</span>') + '</span></div>';
      }).join('') + '</div></section>' +
      '</div></div>';

    return APP.page({
      crumbs: [['Home', '#/home'], [APP.terms('pipShort'), '#/pips'], [x.id, '#']],
      title: D.pipLevel(x.level).name + ' · ' + e.name,
      desc: x.offense + ' · ' + D.siteName(x.site) + ' · opened ' + x.opened,
      action: statusBadge(x), body: body
    });
  }

  APP.VIEWS.pips = function (r) {
    if (r[1] === 't') return APP.page({ crumbs: [['Home', '#/home'], [APP.terms('pipShort'), '#/pips']],
      title: APP.terms('pip'), desc: 'Four levels, active for ' + D.PIP_ACTIVE_MONTHS + ' months, approved before they start.',
      tabs: tabsFor(r[2] || 'pending'), body: list(r[2] || 'pending') });
    if (r[1] && r[1].indexOf('PIP-') === 0) return detail(r[1]);
    var all = APP.pips();
    var tab = all.some(function (x) { return x.status === 'Pending approval'; }) ? 'pending' : 'active';
    return APP.page({ crumbs: [['Home', '#/home'], [APP.terms('pipShort'), '#/pips']],
      title: APP.terms('pip'), desc: 'Four levels, active for ' + D.PIP_ACTIVE_MONTHS + ' months, approved before they start.',
      tabs: tabsFor(tab), body: list(tab) });
  };
  APP.VIEWS.mypip = function () {
    var mine = APP.pips();
    if (!mine.length) return APP.page({ crumbs: [['Home', '#/home'], ['My plan', '#/mypip']], title: 'No plan on your record',
      desc: '', body: APP.emptyState('clipboard-check', 'Nothing here', 'A plan only exists if one has been opened with you.', '') });
    return detail(mine[0].id);
  };

  /* ---------------- actions ---------------- */
  var A = APP.ACT;
  A['new-pip'] = function (el) {
    var emp = (el && el.getAttribute('data-emp')) || (APP.team()[0] || APP.me()).id;
    S.f.pipEmp = emp; S.f.pipLevel = 'first'; S.f.pipOffense = D.OFFENSE_TYPES[0];
    pipForm();
  };
  function pipForm() {
    var emp = S.f.pipEmp, e = P(emp);
    var prior = D.recordsFor(emp).filter(function (r) { return r.type === 'CT-DISC' || r.type === 'CT-POL'; });
    APP.dialog({
      title: 'Start a ' + APP.term('pipShort'), sub: 'It goes for approval before anything reaches ' + e.name.split(' ')[0] + '.', size: 'is-wide',
      body: '<div class="form-grid">' +
        APP.field('Employee', APP.dd('pip-emp', APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), emp, 'dd-block'), null, true) +
        APP.field('Type of offense', APP.dd('pip-offense', D.OFFENSE_TYPES, S.f.pipOffense, 'dd-block'), null, true) +
        '</div>' +
        '<div class="sf-block"><span class="field-label">Level of discipline<span class="req">*</span></span>' +
        '<div class="sf-radios">' + D.PIP_LEVELS.map(function (l) {
          var on = l.key === S.f.pipLevel;
          return '<button class="sf-radio' + (on ? ' is-on' : '') + '" data-act="pip-level" data-k="' + l.key + '"><span class="sf-dot"></span>' +
            '<span class="sf-rt"><span class="sf-rn">' + esc(l.name) + '</span><span class="sf-rs">' +
            (l.key === 'termination' ? 'Opens the termination section of this form' : 'Active for ' + D.PIP_ACTIVE_MONTHS + ' months from activation') + '</span></span></button>';
        }).join('') + '</div></div>' +
        (prior.length ? APP.callout('<b>' + prior.length + ' previous ' + (prior.length === 1 ? 'counseling' : 'counselings') + ' found</b> and attached automatically: ' +
          prior.map(function (r) { return esc(r.on.replace(/^\w+ /, '')); }).join(', ') + '.', 'is-info', 'paperclip')
          : APP.callout('No previous counselings on file for ' + esc(e.name.split(' ')[0]) + '. Anything above a first counseling is hard to defend without them.', 'is-warning', 'triangle-alert')) +
        APP.field('Summary and reasons', '<textarea class="textarea is-tall" data-input="pip-reason" placeholder="Due to ongoing concerns related to ..., you are being placed on a ... Performance Improvement Plan."></textarea>', 'The examples below should summarise results, coaching discussions and documented concerns.', true) +
        APP.field('First required action', '<input class="input" data-input="pip-action" placeholder="Arrive in full uniform with a name badge for every scheduled shift">', 'Specific, measurable, attainable, relevant, time oriented.', true) +
        APP.field('Due', APP.dd('pip-due', [['Fri 16 Oct 2026', 'Fri 16 Oct 2026'], ['Fri 20 Nov 2026', 'Fri 20 Nov 2026'], ['Ongoing, reviewed weekly', 'Ongoing, reviewed weekly']], 'Fri 16 Oct 2026', 'dd-block'), null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Submit for approval', 'btn-solid', 'send', 'data-act="pip-create"')
    });
  }
  A['pip-level'] = function (el) { S.f.pipLevel = el.getAttribute('data-k'); APP.closeOverlay(); pipForm(); };
  APP.DD['pip-emp'] = function (v) { S.f.pipEmp = v; APP.closeOverlay(); pipForm(); };
  APP.DD['pip-offense'] = function (v) { S.f.pipOffense = v; };
  APP.INPUT['pip-reason'] = function (el) { S.f.pipReason = el.value; };
  APP.INPUT['pip-action'] = function (el) { S.f.pipAction = el.value; };
  A['pip-create'] = function () {
    var emp = S.f.pipEmp, e = P(emp), me = APP.me();
    var lvl = D.pipLevel(S.f.pipLevel);
    var id = 'PIP-' + (420 + Math.floor(Math.random() * 60));
    var chain = D.path(emp).slice(0, -1).reverse().filter(function (p) { return p.id !== me.id; }).slice(0, 1);
    D.PIPS.unshift({ id: id, emp: emp, by: me.id, level: lvl.key, status: 'Pending approval', site: e.site,
      offense: S.f.pipOffense || D.OFFENSE_TYPES[0], opened: D.TODAY, start: 'Mon 21 Sep 2026', end: 'Mon 21 Sep 2027',
      reason: S.f.pipReason || 'Due to ongoing concerns, you are being placed on a ' + lvl.name + ' Performance Improvement Plan.',
      evidence: D.recordsFor(emp).filter(function (r) { return r.type === 'CT-DISC' || r.type === 'CT-POL'; }).map(function (r) { return r.id; }),
      actions: [{ t: S.f.pipAction || 'Meet the standard set out above', due: S.f['pip-due'] || 'Fri 16 Oct 2026', done: false }],
      initial: { on: 'Mon 21 Sep 2026', note: null },
      reviews: [{ on: 'Fri 16 Oct 2026', note: null }, { on: 'Fri 20 Nov 2026', note: null }],
      resolution: null, next: chain[0] ? chain[0].id : 'grant',
      approvals: [{ who: me.id, role: 'Initiator, ' + me.title, state: 'Submitted', on: D.TODAY }]
        .concat(chain.map(function (p) { return { who: p.id, role: 'One level above, ' + p.title, state: 'Waiting', on: null }; }))
        .concat([{ who: 'grant', role: 'HR review', state: 'Waiting', on: null }]),
      audit: [{ on: D.TODAY, who: me.id, what: 'Plan opened at ' + lvl.name + '.' },
              { on: D.TODAY, who: me.id, what: 'Submitted for approval and review.' }] });
    S.f.pipReason = ''; S.f.pipAction = '';
    APP.closeAll(); APP.go('#/pips/' + id);
    APP.toast('Submitted', id + ' is with the approval chain. Nothing reaches ' + e.name.split(' ')[0] + ' yet.');
  };
  A['pip-approve'] = function (el) {
    var x = D.pip(el.getAttribute('data-id')), me = APP.me();
    x.approvals.forEach(function (a) { if (a.who === me.id && a.state === 'Waiting') { a.state = 'Approved'; a.on = D.TODAY + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } });
    x.audit.push({ on: D.TODAY, who: me.id, what: 'Approved by ' + me.title + '.' });
    var nxt = x.approvals.filter(function (a) { return a.state === 'Waiting'; })[0];
    x.next = nxt ? nxt.who : null;
    if (!nxt) {
      x.status = 'Approved';
      x.audit.push({ on: D.TODAY, who: 'System', what: 'All approvals recorded. Returned to ' + P(x.by).name + ' to activate.' });
      APP.toast('Fully approved', 'It goes back to ' + P(x.by).name.split(' ')[0] + ' to meet the employee and activate.');
    } else APP.toast('Approved', 'Recorded with your name and a timestamp. Next: ' + P(nxt.who).name + '.');
    APP.rerender();
  };
  A['pip-reject'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({ title: 'Send this plan back', sub: 'A reason is required.',
      body: APP.field('Reason', '<textarea class="textarea" placeholder="The third record is outside the window. Reattach or explain."></textarea>', 'Kept in the audit trail.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send back', 'btn-solid is-danger', 'undo-2', 'data-act="pip-reject-do" data-id="' + id + '"') });
  };
  A['pip-reject-do'] = function (el) {
    var x = D.pip(el.getAttribute('data-id'));
    x.status = 'Draft'; x.next = x.by;
    x.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Sent back to the initiator with a reason.' });
    APP.closeAll(); APP.rerender(); APP.toast('Sent back', x.id + ' is a draft again.', 'info');
  };
  A['pip-activate'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({ title: 'Activate the plan', sub: 'Confirm you have met the employee.',
      body: APP.callout('Activating records that you sat down with the employee, went through the plan, and captured the signatures. The ' + D.PIP_ACTIVE_MONTHS + ' month period starts today.', 'is-info', 'signature') +
        APP.field('Initial meeting summary and feedback', '<textarea class="textarea" data-input="pip-initial" placeholder="Reviewed the plan. Employee raised ... Agreed ..."></textarea>', null, true) +
        '<label class="checkbox"><input type="checkbox" checked><span>Employee signature captured</span></label>' +
        '<label class="checkbox"><input type="checkbox" checked><span>Supervisor signature captured</span></label>' +
        '<label class="checkbox"><input type="checkbox"><span>Witness signature captured</span></label>',
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Activate', 'btn-solid', 'circle-play', 'data-act="pip-activate-do" data-id="' + id + '"') });
  };
  APP.INPUT['pip-initial'] = function (el) { S.f.pipInitial = el.value; };
  A['pip-activate-do'] = function (el) {
    var x = D.pip(el.getAttribute('data-id'));
    x.status = 'Active'; x.initial.on = D.TODAY; x.initial.note = S.f.pipInitial || 'Plan reviewed with the employee.';
    x.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Activated after the meeting with the employee. Signatures captured.' });
    S.f.pipInitial = '';
    APP.closeAll(); APP.rerender(); APP.toast('Active', x.id + ' runs to ' + x.end + '.');
  };
  A['pip-tick'] = function (el) {
    var x = D.pip(el.getAttribute('data-id')), i = +el.getAttribute('data-i');
    x.actions[i].done = !x.actions[i].done; APP.rerender();
  };
  A['pip-add-action'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({ title: 'Add a required action', sub: 'SMART: specific, measurable, attainable, relevant, time oriented.',
      body: APP.field('Action', '<textarea class="textarea" data-input="pip-action"></textarea>', null, true) +
        APP.field('Due', APP.dd('pip-due2', [['Fri 16 Oct 2026', 'Fri 16 Oct 2026'], ['Fri 20 Nov 2026', 'Fri 20 Nov 2026'], ['Ongoing', 'Ongoing']], 'Fri 16 Oct 2026', 'dd-block'), null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add', 'btn-solid', 'plus', 'data-act="pip-action-save" data-id="' + id + '"') });
  };
  A['pip-action-save'] = function (el) {
    var x = D.pip(el.getAttribute('data-id'));
    x.actions.push({ t: S.f.pipAction || 'Meet the standard set out above', due: S.f['pip-due2'] || 'Fri 16 Oct 2026', done: false });
    S.f.pipAction = '';
    APP.closeAll(); APP.rerender(); APP.toast('Action added', 'It also appears on the employee to-do list.');
  };
  A['pip-review'] = function (el) {
    var id = el.getAttribute('data-id'), i = el.getAttribute('data-i');
    APP.dialog({ title: 'Record the review', sub: 'The employee sees this the same day.',
      body: APP.field('Meeting notes', '<textarea class="textarea is-tall" data-input="pip-note" placeholder="What has changed, what has not, and what happens next."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Record', 'btn-solid', 'check', 'data-act="pip-review-save" data-id="' + id + '" data-i="' + i + '"') });
  };
  APP.INPUT['pip-note'] = function (el) { S.f.pipNote = el.value; };
  A['pip-review-save'] = function (el) {
    var x = D.pip(el.getAttribute('data-id')), i = +el.getAttribute('data-i');
    x.reviews[i].note = S.f.pipNote || 'Review held.';
    x.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Review ' + (i + 1) + ' recorded.' });
    S.f.pipNote = '';
    APP.closeAll(); APP.rerender(); APP.toast('Review recorded', 'Dated and attributed.');
  };
  A['pip-close'] = function (el) {
    var id = el.getAttribute('data-id'), o = el.getAttribute('data-o'), x = D.pip(id);
    var idx = D.PIP_LEVELS.map(function (l) { return l.key; }).indexOf(x.level);
    var nextLevel = D.PIP_LEVELS[Math.min(idx + 1, D.PIP_LEVELS.length - 1)];
    APP.dialog({
      title: o === 'Advanced' ? 'Advance to ' + nextLevel.name : o === 'Extended' ? 'Extend the plan' : 'Close as successfully completed',
      sub: x.id + ' · ' + P(x.emp).name,
      body: (o === 'Advanced'
        ? APP.callout('<b>This opens a new plan at ' + esc(nextLevel.name) + '.</b> This plan and everything on it attaches as the supporting documentation.' +
            (nextLevel.key === 'termination' ? ' The termination section of the form is completed as part of it.' : ''), 'is-danger', 'triangle-alert')
        : o === 'Extended' ? APP.callout('Extending keeps the same plan and adds a further review date.', 'is-warning', 'clock')
          : APP.callout('Closing as successfully completed ends it. The plan stays in the file as evidence it worked.', 'is-success', 'circle-check')) +
        APP.field('Resolution notes', '<textarea class="textarea" data-input="pip-note" placeholder="What was achieved or not achieved."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Confirm', 'btn-solid' + (o === 'Advanced' ? ' is-danger' : ''), 'check', 'data-act="pip-close-do" data-id="' + id + '" data-o="' + o + '"')
    });
  };
  A['pip-close-do'] = function (el) {
    var x = D.pip(el.getAttribute('data-id')), o = el.getAttribute('data-o');
    var idx = D.PIP_LEVELS.map(function (l) { return l.key; }).indexOf(x.level);
    var nextLevel = D.PIP_LEVELS[Math.min(idx + 1, D.PIP_LEVELS.length - 1)];
    var note = S.f.pipNote || '';
    S.f.pipNote = '';
    if (o === 'Extended') {
      x.reviews.push({ on: 'Fri 18 Dec 2026', note: null });
      x.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Plan extended, a further review added.' });
      APP.closeAll(); APP.rerender(); APP.toast('Extended', 'A further review has been scheduled.', 'info'); return;
    }
    x.status = 'Closed';
    x.resolution = { on: D.TODAY, next: o === 'Advanced' ? 'Advanced to ' + nextLevel.name : 'Successfully completed', note: note || 'Recorded at resolution.' };
    x.outcome = o === 'Advanced' ? (nextLevel.key === 'termination' ? 'Advanced to termination' : 'Advanced to ' + nextLevel.name) : 'Successfully completed';
    x.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Closed as ' + x.outcome + '.' });
    APP.closeAll(); APP.rerender();
    if (o === 'Advanced') APP.toast('Advanced', 'A new plan at ' + nextLevel.name + ' has been drafted with this one attached.', 'warning');
    else APP.toast('Closed', x.id + ' stays in the file.');
  };
})();
