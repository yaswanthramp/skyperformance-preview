/* skyPerformance: performance improvement plans. A PIP is not discipline. It is
   a fixed length, measured chance to recover, sitting between coaching and the
   ladder, and it ends one of three ways. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function mine() {
    if (APP.is('employee')) return D.PIPS.filter(function (p) { return p.emp === APP.me().id; });
    if (APP.isHR()) return D.PIPS.slice();
    return D.PIPS.filter(function (p) { return APP.inScope(p.emp) || p.owner === APP.me().id; });
  }
  function tabsFor(active) {
    var ps = mine();
    return APP.tabs([
      ['active', 'Active', '#/pips', ps.filter(function (p) { return p.status === 'Active'; }).length],
      ['pending', 'Pending approval', '#/pips/pending', ps.filter(function (p) { return p.status === 'Pending approval' || p.status === 'Draft'; }).length],
      ['closed', 'Closed', '#/pips/closed', ps.filter(function (p) { return p.status === 'Completed'; }).length],
      ['all', 'All', '#/pips/all', ps.length]
    ], active);
  }
  function objStatus(s) { return s === 'Met' ? 'is-success' : s === 'Behind' ? 'is-danger' : s === 'On track' ? 'is-info' : 'is-neutral'; }

  function listView(tab) {
    var ps = mine().filter(function (p) {
      if (tab === 'active') return p.status === 'Active';
      if (tab === 'pending') return p.status === 'Pending approval' || p.status === 'Draft';
      if (tab === 'closed') return p.status === 'Completed';
      return true;
    });
    var all = mine();
    var behind = all.filter(function (p) { return p.status === 'Active' && p.objectives.some(function (o) { return o.status === 'Behind'; }); }).length;
    var met = all.filter(function (p) { return p.outcome === 'Met'; }).length;
    var closed = all.filter(function (p) { return p.status === 'Completed'; }).length;
    return APP.hint('A PIP is a chance to recover, not a step on the discipline ladder. It has a start, an end, named objectives and a recorded outcome.', 'clipboard-check') +
      APP.glance([
        [all.filter(function (p) { return p.status === 'Active'; }).length, 'Active'],
        [behind, 'With an objective behind', behind ? 'is-bad' : 'is-good'],
        [all.filter(function (p) { return p.status === 'Pending approval'; }).length, 'Awaiting approval', all.filter(function (p) { return p.status === 'Pending approval'; }).length ? 'is-warn' : ''],
        [closed ? Math.round(met / closed * 100) + '%' : '—', 'Closed as met', met ? 'is-good' : '']
      ]) +
      (APP.is('employee') ? '' : '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="PIPs as CSV"', 'is-sm') +
        APP.btn('Open a PIP', 'btn-solid', 'plus', 'data-act="pip-new"', 'is-sm') + '</div>') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Person' }, { t: 'PIP' }, { t: 'Reason', w: '22%' }, { t: 'Objectives', w: '16%' }, { t: 'Window' }, { t: 'Days left', num: true }, { t: 'Status' }, { t: '' }],
        ps.map(function (p) {
          var beh = p.objectives.filter(function (o) { return o.status === 'Behind'; }).length;
          var metN = p.objectives.filter(function (o) { return o.status === 'Met'; }).length;
          return { cells: [
            APP.personLine(p.emp, esc(D.locName(p.loc)), 28),
            '<span class="cell-strong">' + esc(p.id) + '</span><span class="cell-sub">' + p.days + ' days · owner ' + esc(P(p.owner).name.split(' ')[0]) + '</span>',
            '<span class="mini-note">' + esc(p.reason) + '</span>',
            '<span class="row-gap">' + (metN ? APP.badge(metN + ' met', 'is-success') : '') + (beh ? APP.badge(beh + ' behind', 'is-danger') : '') +
              (!metN && !beh ? APP.badge(p.objectives.length + ' set', 'is-neutral') : '') + '</span>',
            esc(p.start.replace(/^\w+ /, '')) + ' to ' + esc(p.end.replace(/^\w+ /, '')),
            p.daysLeft != null ? String(p.daysLeft) : '—',
            APP.statusBadge(p.outcome || p.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/pips/' + p.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing here.' }) + '</section>' +
      APP.why('How a PIP ends', '<p>Three ways, and the ending is recorded on the plan. <b>Met</b> closes it and nothing follows. <b>Extended</b> adds a fixed period once, and only once. <b>Not met</b> is the only route that hands the file to the discipline ladder, and it does so with every checkpoint attached as documentation.</p>');
  }

  function detail(id) {
    var p = D.pip(id);
    if (!p || !(APP.isHR() || APP.inScope(p.emp) || p.emp === APP.me().id || p.owner === APP.me().id)) {
      return APP.page({ crumbs: [['Home', '#/home'], ['PIPs', '#/pips']], title: 'PIP not found', desc: '',
        body: APP.emptyState('clipboard-check', 'Not in your scope', 'PIPs follow the reporting line.', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/pips"')) });
    }
    var e = P(p.emp), me = APP.me();
    var myTurn = p.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    var owner = p.owner === me.id;
    var done = p.checkpoints.filter(function (c) { return c.done; }).length;
    var nextIdx = p.checkpoints.map(function (c) { return c.done; }).indexOf(false);
    var beh = p.objectives.filter(function (o) { return o.status === 'Behind'; }).length;

    return APP.page({
      crumbs: [['Home', '#/home'], ['PIPs', '#/pips'], [p.id, '#']],
      title: e.name + ' · ' + p.days + ' day plan',
      desc: p.start + ' to ' + p.end + ' · owner ' + P(p.owner).name,
      action: APP.statusBadge(p.outcome || p.status),
      body:
        (myTurn ? APP.callout('<b>Waiting on your approval.</b> Read the objectives and the support before you decide.', 'is-warning', 'gavel') : '') +
        (p.status === 'Active' && beh ? APP.callout('<b>' + beh + ' of ' + p.objectives.length + ' objectives are behind</b> with ' + p.daysLeft + ' days left.', 'is-warning', 'triangle-alert') : '') +
        (p.outcome ? APP.callout('<b>Closed as ' + esc(p.outcome) + '.</b> ' + (p.outcome === 'Met' ? 'Nothing follows. The plan stays in the file.' : p.outcome === 'Extended' ? 'Extended once, which is the limit.' : 'The file went to the discipline ladder with every checkpoint attached.') , p.outcome === 'Met' ? 'is-success' : 'is-info', p.outcome === 'Met' ? 'circle-check' : 'info') : '') +
        APP.glance([
          [p.daysLeft != null ? p.daysLeft : '—', 'Days left', p.daysLeft != null && p.daysLeft < 20 ? 'is-warn' : ''],
          [done + ' of ' + p.checkpoints.length, 'Checkpoints done'],
          [p.objectives.filter(function (o) { return o.status === 'Met'; }).length + ' of ' + p.objectives.length, 'Objectives met', beh ? 'is-bad' : ''],
          [p.evidence.length, 'Prior forms attached']
        ]) +
        '<div class="split-rail"><div class="stack-4">' +
        '<section class="card">' + APP.panelHead('Objectives', 'Each one names a measure, a target and where it is now.',
          owner && p.status === 'Active' ? APP.btn('Update', 'btn-surface', 'pen-line', 'data-act="toast" data-t="Objectives refresh nightly" data-b="Current values come from the measure layer. Only the written objectives are editable." data-k="info"', 'is-sm') : '') +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Objective</th><th>Target</th><th>Now</th><th>Status</th></tr></thead><tbody>' +
        p.objectives.map(function (o) {
          return '<tr><td data-label="Objective"><span class="cell-strong">' + esc(o.t) + '</span>' + (o.m ? '<span class="cell-sub cell-id">' + esc(o.m) + '</span>' : '') + '</td>' +
            '<td data-label="Target">' + esc(o.target) + '</td><td data-label="Now">' + esc(o.current) + '</td>' +
            '<td data-label="Status">' + APP.badge(o.status, objStatus(o.status)) + '</td></tr>';
        }).join('') + '</tbody></table></div></section>' +
        '<section class="card">' + APP.panelHead('Checkpoints', done + ' of ' + p.checkpoints.length + ' recorded',
          owner && p.status === 'Active' && nextIdx >= 0 ? APP.btn('Record checkpoint', 'btn-solid', 'plus', 'data-act="pip-checkpoint" data-id="' + p.id + '"', 'is-sm') : '') +
        '<div class="timeline">' + p.checkpoints.map(function (c, i) {
          var isNext = !c.done && i === nextIdx;
          return '<div class="tl-row' + (c.done ? ' is-done' : isNext ? ' is-next' : '') + '">' +
            '<span class="tl-dot">' + ic(c.done ? 'check' : isNext ? 'clock' : 'circle-dot', 14) + '</span>' +
            '<div class="tl-body"><div class="tl-top"><span class="tl-when">' + esc(c.on) + '</span>' +
            (c.rating ? APP.badge(c.rating, c.rating === 'Met' ? 'is-success' : c.rating === 'On track' ? 'is-info' : 'is-warning') : isNext ? APP.badge('Next', 'is-info') : APP.badge('Scheduled', 'is-neutral')) + '</div>' +
            (c.t ? '<span class="tl-note">' + esc(c.t) + '</span>' : '<span class="tl-note text-low">Not recorded yet.</span>') + '</div></div>';
        }).join('') + '</div></section>' +
        '<section class="card">' + APP.panelHead('Audit trail', 'Append only, attributed and timestamped.') +
        '<div class="audit">' + p.audit.map(function (a) {
          return '<div class="audit-row"><span class="audit-when">' + esc(a.on) + '</span><span class="audit-what">' + esc(a.what) + '<span class="audit-who">' + esc(a.who === 'System' ? 'System' : P(a.who).name) + '</span></span></div>';
        }).join('') + '</div></section></div>' +
        '<div class="stack-4">' +
        '<section class="card">' + APP.panelHead('Why it was opened') +
        '<p class="t-2">' + esc(p.reason) + '</p>' +
        (p.evidence.length ? '<div class="sec-label">Documentation attached</div><div class="wq">' + p.evidence.map(function (fid) {
          var f = D.form(fid); if (!f) return '';
          return '<div class="wq-row"><span class="wq-ic">' + ic(D.formType(f.ft).ic, 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(D.formType(f.ft).name) + '</span><span class="wq-s">' + esc(fid) + ' · ' + esc(f.date) + '</span></div>' +
            '<div class="wq-right">' + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + fid + '"', 'is-sm') + '</div></div>';
        }).join('') + '</div>' : '') + '</section>' +
        '<section class="card">' + APP.panelHead('Support provided', 'A plan without support is hard to defend.') +
        '<ul class="tick-list">' + p.support.map(function (x) { return '<li>' + ic('check', 14) + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></section>' +
        '<section class="card">' + APP.panelHead('Approval', p.approvals.length ? 'Derived from the org chart.' : 'Not submitted yet.') +
        '<div class="chain-list">' + p.approvals.map(function (a) {
          return '<div class="ch-row"><span class="ch-state">' + (a.state === 'Approved' ? ic('circle-check', 18) : a.state === 'Waiting' ? ic('hourglass', 18) : ic('send', 18)) + '</span>' +
            '<div class="ch-main"><span class="ch-who">' + esc(P(a.who).name) + '</span><span class="ch-role">' + esc(a.role) + '</span></div>' +
            '<span class="ch-when">' + (a.on ? esc(a.on) : APP.statusBadge('Waiting')) + '</span></div>';
        }).join('') + '</div>' +
        (myTurn ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
          APP.btn('Send back', 'btn-surface', 'undo-2', 'data-act="pip-reject" data-id="' + p.id + '"', 'is-sm') +
          APP.btn('Approve', 'btn-solid', 'check', 'data-act="pip-approve" data-id="' + p.id + '"', 'is-sm') + '</div>' : '') +
        '</section>' +
        (p.status === 'Active' && owner ? '<section class="card">' + APP.panelHead('Close the plan', 'Three endings. The ending is the record.') +
          '<div class="stack-2">' +
          APP.btn('Close as met', 'btn-solid', 'circle-check', 'data-act="pip-close" data-id="' + p.id + '" data-o="Met"', 'is-sm') +
          APP.btn('Extend once', 'btn-surface', 'clock', 'data-act="pip-close" data-id="' + p.id + '" data-o="Extended"', 'is-sm') +
          APP.btn('Close as not met', 'btn-surface is-danger', 'circle-x', 'data-act="pip-close" data-id="' + p.id + '" data-o="Not met"', 'is-sm') +
          '</div></section>' : '') +
        (p.letter ? '<section class="card">' + APP.panelHead('Plan document', 'What the employee receives and acknowledges.') +
          APP.btn('Read the plan document', 'btn-surface', 'file-text', 'data-act="pip-doc" data-id="' + p.id + '"', 'is-sm') + '</section>' : '') +
        '</div></div>'
    });
  }

  APP.VIEWS.pips = function (r) {
    if (r[1] && r[1].indexOf('PIP-') === 0) return detail(r[1]);
    var tab = r[1];
    if (!tab) {
      var m = mine();
      tab = m.some(function (p) { return p.status === 'Active'; }) ? 'active' : m.some(function (p) { return p.status === 'Pending approval'; }) ? 'pending' : 'all';
    }
    return APP.page({
      crumbs: [['Home', '#/home'], ['PIPs', '#/pips']],
      title: APP.is('employee') ? 'My improvement plan' : 'Performance improvement plans',
      desc: 'Fixed length, measured, with a recorded outcome. Between coaching and the discipline ladder.',
      tabs: tabsFor(tab), body: listView(tab)
    });
  };

  var A = APP.ACT;
  A['pip-new'] = function (el) {
    var emp = (el && el.getAttribute('data-emp')) || (APP.team()[0] || APP.me()).id;
    APP.dialog({
      title: 'Open a performance improvement plan', sub: 'Length, objectives and support. Approved before it starts.', size: 'is-wide',
      body: APP.callout('A PIP needs documented coaching behind it. Anything already on the record attaches automatically.', 'is-info', 'paperclip') +
        '<div class="form-grid">' +
        APP.field('Person', APP.dd('pp-emp', APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), emp, 'dd-block'), null, true) +
        APP.field('Length', APP.dd('pp-days', D.PIP_LENGTHS.map(function (d) { return [String(d), d + ' days']; }), '30', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Why it is being opened', '<textarea class="textarea" placeholder="Recording and accuracy coached four times in ninety days without sustained change."></textarea>', 'State the standard and the gap, not a judgement.', true) +
        APP.field('First objective', '<input class="input" placeholder="Quality score at or above 95% for three consecutive weeks">', 'Must be measurable. Pick the measure below so progress updates itself.', true) +
        APP.field('Measure', APP.dd('pp-msr', [['none', 'No measure, assessed by the manager']].concat(D.MEASURES.map(function (m) { return [m.id, m.name]; })), 'msr.quality', 'dd-block')) +
        APP.field('Support provided', '<textarea class="textarea" placeholder="Twice weekly check in, recording reminder on the device, shadow shift with a peer."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Submit for approval', 'btn-solid', 'send', 'data-act="pip-created"')
    });
  };
  A['pip-created'] = function () {
    var emp = S.f['pp-emp'] || (APP.team()[0] || APP.me()).id, e = P(emp);
    var id = 'PIP-' + (420 + Math.floor(Math.random() * 40));
    var days = +(S.f['pp-days'] || 30);
    D.PIPS.unshift({ id: id, emp: emp, owner: APP.me().id, status: 'Pending approval', days: days,
      opened: D.TODAY, start: 'Mon 22 Sep 2026', end: 'Fri 23 Oct 2026', daysLeft: null, loc: e.loc,
      reason: 'Standard not met across repeated coaching.', evidence: D.FORMS.filter(function (f) { return f.emp === emp; }).map(function (f) { return f.id; }).slice(0, 4),
      letter: true, next: e.mgr,
      objectives: [{ id: 'O-1', t: 'Quality score at or above 95% for three consecutive weeks', m: S.f['pp-msr'] === 'none' ? null : (S.f['pp-msr'] || 'msr.quality'), target: '95%', current: 'Not started', status: 'Not started' }],
      support: ['Twice weekly check in with the manager', 'Shadow shift with a peer'],
      checkpoints: [{ on: 'Mon 6 Oct 2026', done: false, by: APP.me().id, rating: null, t: null }, { on: 'Fri 23 Oct 2026', done: false, by: APP.me().id, rating: null, t: null }],
      approvals: [{ who: APP.me().id, role: 'Initiator, ' + APP.me().title, state: 'Submitted', on: D.TODAY },
        { who: P(emp).mgr === APP.me().id ? 'curtis' : P(emp).mgr, role: 'One level above', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR review', state: 'Waiting', on: null }],
      audit: [{ on: D.TODAY, who: APP.me().id, what: 'PIP opened, ' + days + ' days. Prior coaching attached.' },
        { on: D.TODAY, who: APP.me().id, what: 'Submitted for approval and review.' }] });
    APP.closeAll(); APP.go('#/pips/' + id);
    APP.toast('Submitted', id + ' is with the approval chain. It does not start until it is approved.');
  };
  A['pip-approve'] = function (el) {
    var p = D.pip(el.getAttribute('data-id')), me = APP.me();
    p.approvals.forEach(function (a) { if (a.who === me.id && a.state === 'Waiting') { a.state = 'Approved'; a.on = D.TODAY; } });
    p.audit.push({ on: D.TODAY, who: me.id, what: 'Approved by ' + me.title + '.' });
    if (!p.approvals.some(function (a) { return a.state === 'Waiting'; })) {
      p.status = 'Active'; p.daysLeft = p.days;
      p.audit.push({ on: D.TODAY, who: 'System', what: 'All approvals recorded. Plan starts ' + p.start + '.' });
      APP.toast('Plan approved', p.id + ' starts ' + p.start + '. ' + P(p.emp).name.split(' ')[0] + ' has been sent the plan document.');
    } else APP.toast('Approved', 'Recorded with your name and a timestamp.');
    APP.rerender();
  };
  A['pip-reject'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Send this plan back', sub: 'A reason is required.',
      body: APP.field('Reason', '<textarea class="textarea" placeholder="Objective two is not measurable. Rewrite it against a measure."></textarea>', 'Kept in the audit trail.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send back', 'btn-solid is-danger', 'undo-2', 'data-act="pip-reject-do" data-id="' + id + '"')
    });
  };
  A['pip-reject-do'] = function (el) {
    var p = D.pip(el.getAttribute('data-id'));
    p.status = 'Draft';
    p.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Sent back to the initiator with a reason.' });
    APP.closeAll(); APP.rerender(); APP.toast('Sent back', p.id + ' is a draft again.', 'info');
  };
  A['pip-checkpoint'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Record a checkpoint', sub: 'The employee sees this the same day.',
      body: APP.field('Rating', APP.dd('cp-rating', [['On track', 'On track'], ['Partly met', 'Partly met'], ['Behind', 'Behind'], ['Met', 'Met']], 'On track', 'dd-block'), null, true) +
        APP.field('What you saw', '<textarea class="textarea" data-input="cp-note" placeholder="Quality up to 91%. Absence occurrence on 3 Sep is the setback."></textarea>', 'Against the objectives, not in general.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Record', 'btn-solid', 'check', 'data-act="pip-checkpoint-saved" data-id="' + id + '"')
    });
  };
  APP.INPUT['cp-note'] = function (el) { S.f.cpNote = el.value; };
  A['pip-checkpoint-saved'] = function (el) {
    var p = D.pip(el.getAttribute('data-id'));
    var i = p.checkpoints.map(function (c) { return c.done; }).indexOf(false);
    if (i >= 0) {
      p.checkpoints[i].done = true;
      p.checkpoints[i].rating = S.f['cp-rating'] || 'On track';
      p.checkpoints[i].t = S.f.cpNote || 'Checkpoint recorded.';
      p.checkpoints[i].by = APP.me().id;
      p.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Checkpoint ' + (i + 1) + ' recorded as ' + p.checkpoints[i].rating + '.' });
    }
    S.f.cpNote = '';
    APP.closeAll(); APP.rerender(); APP.toast('Checkpoint recorded', 'Dated, attributed and visible to ' + P(p.emp).name.split(' ')[0] + '.');
  };
  A['pip-close'] = function (el) {
    var id = el.getAttribute('data-id'), o = el.getAttribute('data-o'), p = D.pip(id);
    APP.dialog({
      title: 'Close as ' + o.toLowerCase(), sub: p.id + ' · ' + P(p.emp).name,
      body: (o === 'Not met'
        ? APP.callout('<b>This is the only ending that escalates.</b> Closing as not met opens a performance case with every checkpoint and every attached form as documentation. It does not issue anything on its own.', 'is-danger', 'triangle-alert')
        : o === 'Extended'
          ? APP.callout('A plan can be extended once. A second extension is not available, because an open ended plan is not a plan.', 'is-warning', 'clock')
          : APP.callout('Closing as met ends it. Nothing follows, and the plan stays in the file as evidence that it worked.', 'is-success', 'circle-check')) +
        APP.field('Closing note', '<textarea class="textarea" placeholder="Sustained above target for six weeks."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Close as ' + o.toLowerCase(), 'btn-solid' + (o === 'Not met' ? ' is-danger' : ''), 'check', 'data-act="pip-close-do" data-id="' + id + '" data-o="' + o + '"')
    });
  };
  A['pip-close-do'] = function (el) {
    var p = D.pip(el.getAttribute('data-id')), o = el.getAttribute('data-o');
    p.status = 'Completed'; p.outcome = o; p.daysLeft = null;
    p.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Closed as ' + o + '.' });
    APP.closeAll(); APP.rerender();
    if (o === 'Not met') APP.toast('Closed as not met', 'A performance case draft has been opened with the plan attached. Nothing has been issued.', 'warning');
    else APP.toast('Closed as ' + o.toLowerCase(), p.id + ' stays in the file.');
  };
  A['pip-doc'] = function (el) {
    var p = D.pip(el.getAttribute('data-id')), e = P(p.emp);
    APP.dialog({
      title: 'Plan document', sub: p.id + ' · ' + p.days + ' days · ' + p.start + ' to ' + p.end, size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">Performance improvement plan</div><div class="paper-sub">' + esc(D.ORG) + ' · ' + esc(APP.hierPath(p.loc, e.dept)) + '</div></div>' +
        '<div class="paper-id">' + esc(p.id) + '<br>' + esc(p.opened) + '</div></div>' +
        '<p>To: ' + esc(e.name) + ', ' + esc(e.title) + '</p>' +
        '<p>This plan runs for ' + p.days + ' days, from ' + esc(p.start) + ' to ' + esc(p.end) + '. It is not a disciplinary step. It sets out what needs to change, how it will be measured, and what support you will get.</p>' +
        '<p>Why it was opened: ' + esc(p.reason) + '</p>' +
        '<h3>Objectives</h3><div class="qa-list">' + p.objectives.map(function (o) {
          return '<div class="qa-row"><span class="qa-q">' + esc(o.t) + '</span><span class="qa-a">' + esc(o.target) + '</span></div>';
        }).join('') + '</div>' +
        '<h3>Support provided</h3><div class="qa-list">' + p.support.map(function (x) { return '<div class="qa-row"><span class="qa-q">' + esc(x) + '</span></div>'; }).join('') + '</div>' +
        '<h3>Checkpoints</h3><div class="qa-list">' + p.checkpoints.map(function (c) {
          return '<div class="qa-row"><span class="qa-q">' + esc(c.on) + '</span><span class="qa-a">' + (c.rating ? APP.badge(c.rating, 'is-info') : APP.badge('Scheduled', 'is-neutral')) + '</span></div>';
        }).join('') + '</div>' +
        '<h3>How it ends</h3><p>Met, and nothing follows. Extended once, if you are close. Not met, and the documented file moves to the formal process. The outcome is recorded either way.</p>' +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(p.owner).name) + ', manager</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(e.name) + ', acknowledged receipt</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="The plan, its objectives and every recorded checkpoint render as one file." data-k="info"') +
        (APP.is('employee') ? APP.btn('Acknowledge receipt', 'btn-solid', 'signature', 'data-act="toast" data-t="Acknowledged" data-b="Receipt, not agreement. Timestamped and stored with the plan."') : '')
    });
  };
})();
