/* skyPerformance: performance management. Pending, Open and Closed, exactly as
   the reference groups them, with a per case action menu and the five step
   wizard: Case info, Documentation, Summary and letters, Approve and review,
   Activate. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function stepName(k) { return D.STEPS.filter(function (s) { return s.key === k; })[0].name; }
  function trackName(k) { return D.TRACKS.filter(function (t) { return t.key === k; })[0].name; }

  function group(title, rows, cols, empty) {
    return '<section class="card flush-card case-group">' +
      '<div class="cg-head">' + esc(title) + '</div>' +
      APP.table(cols, rows, { empty: empty }) + '</section>';
  }

  function list() {
    var all = APP.cases(), mine = APP.approvalsFor();
    var pending = all.filter(function (c) { return c.status === 'Pending approval' || c.status === 'Draft'; });
    var open = all.filter(function (c) { return c.status === 'Open'; });
    var closed = all.filter(function (c) { return c.status === 'Closed'; });
    var who = S.f.caseWho || 'All';
    if (who !== 'All') { pending = pending.filter(function (c) { return c.emp === who; }); open = open.filter(function (c) { return c.emp === who; }); closed = closed.filter(function (c) { return c.emp === who; }); }
    var people = APP.people().filter(function (p) { return all.some(function (c) { return c.emp === p.id; }); });

    return APP.hint('Pending, open and closed. The step decides the letter, the approvers and the expiry.', 'gavel') +
      (mine.length ? APP.callout('<b>' + mine.length + ' waiting on your approval.</b>', 'is-warning', 'gavel') : '') +
      APP.glance([[pending.length, 'Pending', pending.length ? 'is-warn' : ''], [open.length, 'Open'], [open.filter(function (c) { return c.daysLeft != null && c.daysLeft < 60; }).length, 'Expiring in 60 days'], [closed.length, 'Closed']]) +
      '<div class="filter-bar">' +
      (APP.canCase() ? APP.btn('Initiate new case', 'btn-solid', 'plus', 'data-act="start-case"', 'is-sm') : '') +
      APP.dd('caseWho', [['All', 'Everyone in scope']].concat(people.map(function (p) { return [p.id, p.name]; })), who) +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The case summary report"', 'is-sm') +
      '</div>' +
      group('Pending', pending.map(function (c) {
        return { cells: [actionMenu(c), '<button class="rowlink" data-act="goto" data-href="#/cases/' + c.id + '">' + esc(c.id) + '</button>',
          APP.personLine(c.emp, null, 28), esc(trackName(c.track)), esc(c.sub), esc(stepName(c.step)), esc(c.opened),
          APP.personLine(c.by, null, 28), APP.statusBadge(c.status), c.next ? esc(P(c.next).name) : '—'] };
      }), [{ t: 'Case actions', w: '150px' }, { t: 'Case' }, { t: 'Employee' }, { t: 'Track' }, { t: 'Subtrack' }, { t: 'Recommended step' }, { t: 'Date created' }, { t: 'Created by' }, { t: 'Status' }, { t: 'Next approver' }], 'No pending cases.') +
      group('Open', open.map(function (c) {
        return { cells: [actionMenu(c), '<button class="rowlink" data-act="goto" data-href="#/cases/' + c.id + '">' + esc(c.id) + '</button>',
          APP.personLine(c.emp, null, 28), esc(trackName(c.track)), esc(c.sub), esc(stepName(c.step)), esc(c.activated || '—'),
          c.daysLeft != null ? String(c.daysLeft) : '—'] };
      }), [{ t: 'Case actions', w: '150px' }, { t: 'Case' }, { t: 'Employee' }, { t: 'Track' }, { t: 'Subtrack' }, { t: 'Current step' }, { t: 'Date activated' }, { t: 'Days remaining', num: true }], 'No open cases.') +
      group('Closed', closed.map(function (c) {
        return { cells: ['<button class="rowlink" data-act="goto" data-href="#/cases/' + c.id + '">' + esc(c.id) + '</button>',
          APP.personLine(c.emp, null, 28), esc(trackName(c.track)), esc(c.sub), esc(stepName(c.step)), esc(c.closed || '—'),
          APP.statusBadge(c.disposition || 'Closed')] };
      }), [{ t: 'Case' }, { t: 'Employee' }, { t: 'Track' }, { t: 'Subtrack' }, { t: 'Last step' }, { t: 'Date closed' }, { t: 'Disposition' }], 'No closed cases.') +
      APP.why('What stops a case activating', '<p>Three things, all required: documented prior coaching, a completed letter where the step needs one, and every approval recorded. A PIP closed as not met is the usual route in.</p>');
  }

  function actionMenu(c) {
    var acts = D.CASE_ACTIONS.filter(function (a) {
      if (c.status === 'Draft') return a === 'Close case' || a === 'Edit letter';
      if (c.status === 'Pending approval') return a === 'Edit letter' || a === 'Close case';
      return true;
    });
    return '<span class="pop-anchor"><button class="dropdown is-sm" data-act="toggle-pop" data-pop="ca-' + c.id + '" aria-haspopup="menu"><span class="dd-value">Select an action</span><span class="dropdown-chevron">' + ic('chevron-down', 14) + '</span></button>' +
      '<div class="dropdown-menu pop" id="ca-' + c.id + '" role="menu" hidden>' + acts.map(function (a) {
        return '<div class="list-item" role="menuitem" data-act="case-action" data-id="' + c.id + '" data-a="' + esc(a) + '">' + esc(a) + '</div>';
      }).join('') + '</div></span>';
  }

  /* ---------------- detail ---------------- */
  function detail(id) {
    var c = D.kase(id);
    if (!c) return APP.page({ crumbs: [['Home', '#/home'], ['Performance cases', '#/cases']], title: 'Case not found', desc: 'It may sit outside your branch of the chart.',
      body: APP.emptyState('gavel', 'Not in your scope', 'Records follow the reporting line, and so does retrieval.', APP.btn('Back to cases', 'btn-solid', null, 'data-act="goto" data-href="#/cases"')) });
    var e = P(c.emp), me = APP.me();
    var myTurn = c.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    var prior = D.CASES.filter(function (x) { return x.emp === c.emp && x.id !== c.id; });
    var atIdx = D.STEPS.map(function (x) { return x.key; }).indexOf(c.step);
    var ladder = D.STEPS.map(function (s, i) {
      return '<div class="ladder-step' + (i === atIdx ? ' is-at' : i < atIdx ? ' is-past' : '') + '"><div class="ls-name">' + esc(s.name) + '</div>' +
        '<div class="ls-sub">' + (s.expiry ? 'Expires after ' + s.expiry : 'End of the ladder') + (s.letter ? ', letter required' : '') + '</div>' +
        (i === atIdx ? '<div style="margin-top:var(--space-2)">' + APP.badge('This case', 'is-warning') + '</div>' : '') + '</div>';
    }).join('');

    var body =
      (c.status === 'Pending approval' && myTurn ? APP.callout('<b>This case is waiting on your decision.</b> Read the documentation and the letter before you decide. Both are attached below.', 'is-warning', 'gavel') : '') +
      (c.disposition === 'Rescinded' ? APP.callout('<b>This case was rescinded.</b> The record is retained and flagged. It never counts toward a later step, and it still appears in the employee file export.', 'is-danger', 'undo-2') : '') +
      (c.disposition === 'Expired' ? APP.callout('<b>This step expired on ' + esc(c.expires) + '.</b> It left the ladder automatically. A new case starts from the bottom.', 'is-info', 'hourglass') : '') +
      '<div class="split-rail"><div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Case info', c.id + ' · opened ' + c.opened + ' by ' + P(c.by).name) +
      APP.dataList([
        ['Employee', APP.personLine(e, esc(e.title) + ', ' + esc(D.locName(e.loc)), 28, false)],
        ['Track', esc(trackName(c.track))],
        ['Subtrack', esc(c.sub)],
        ['Step', esc(stepName(c.step))],
        ['Status', APP.statusBadge(c.disposition || c.status)],
        ['Activated', c.activated ? esc(c.activated) : 'Not yet'],
        ['Step expiry', c.expires ? esc(c.expires) + (c.daysLeft != null ? ' · ' + c.daysLeft + ' days remaining' : '') : 'Not applicable'],
        ['Hierarchy path', '<span class="cell-id">' + esc(APP.hierPath(c.loc, e.dept)) + '</span>']
      ]) + '</section>' +
      '<section class="card">' + APP.panelHead('The ladder', esc(trackName(c.track)) + ' · ' + esc(c.sub)) +
      '<div class="ladder">' + ladder + '</div>' +
      (prior.length ? '<p class="mini-note" style="margin-top:var(--space-4)">' + prior.length + ' other case on this record: ' + prior.map(function (x) { return '<button class="rowlink" data-act="goto" data-href="#/cases/' + x.id + '">' + esc(x.id) + '</button> (' + esc((x.disposition || x.status).toLowerCase()) + ')'; }).join(', ') + '.</p>' : '') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Documentation', c.evidence.length ? 'Prior coaching attached automatically when the case opened.' : 'Nothing attached yet.') +
      (c.evidence.length ? '<div class="wq">' + c.evidence.map(function (fid) {
        var f = D.form(fid); if (!f) return '';
        return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : '') + '">' + ic(D.formType(f.ft).ic, 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(fid) + ' · ' + esc(f.summary.slice(0, 90)) + '...</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + fid + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div>' : APP.callout('No prior coaching is attached. Any step above documented counselling is blocked until there is.', 'is-warning', 'triangle-alert')) +
      '</section>' +
      '<section class="card">' + APP.panelHead('Audit trail', 'Append only') +
      '<div class="audit">' + c.audit.map(function (a) {
        return '<div class="audit-row"><span class="audit-when">' + esc(a.on) + '</span><span class="audit-what">' + esc(a.what) + '<span class="audit-who">' + esc(a.who === 'System' ? 'System' : P(a.who).name) + '</span></span></div>';
      }).join('') + '</div></section></div>' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Approval workflow', c.approvals.length ? 'Approvers are in the employee reporting line. Reviewers are HR.' : 'Not submitted yet.') +
      (c.approvals.length ? '<div class="chain-list">' + c.approvals.map(function (a) {
        return '<div class="ch-row"><span class="ch-state">' + (a.state === 'Approved' ? ic('circle-check', 18) : a.state === 'Waiting' ? ic('hourglass', 18) : ic('send', 18)) + '</span>' +
          '<div class="ch-main"><span class="ch-who">' + esc(P(a.who).name) + '</span><span class="ch-role">' + esc(a.role) + '</span></div>' +
          '<span class="ch-when">' + (a.on ? esc(a.on) : APP.statusBadge('Waiting')) + '</span></div>';
      }).join('') + '</div>' : '<div class="table-empty">Submit it from the wizard.</div>') +
      (myTurn ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Send back', 'btn-surface', 'undo-2', 'data-act="case-reject" data-id="' + c.id + '"', 'is-sm') +
        APP.btn('Approve', 'btn-solid', 'check', 'data-act="case-approve" data-id="' + c.id + '"', 'is-sm') + '</div>' : '') +
      '</section>' +
      (c.letter ? '<section class="card">' + APP.panelHead('Letter', 'Generated from the ' + esc(stepName(c.step)) + ' template, then edited by the initiator.') +
        APP.btn('Read the letter', 'btn-solid', 'file-text', 'data-act="open-letter" data-id="' + c.id + '"', 'is-sm') +
        '<p class="mini-note" style="margin-top:var(--space-3)">The employee acknowledges receipt, which is recorded separately from agreement.</p></section>' : '') +
      '<section class="card">' + APP.panelHead('Case actions') +
      '<div class="stack-2">' +
      (c.status === 'Draft' ? APP.btn('Continue the wizard', 'btn-solid', 'circle-arrow-right', 'data-act="resume-case" data-id="' + c.id + '"', 'is-sm') : '') +
      (c.status === 'Open' && !APP.is('employee') ? APP.btn('Progress to next step', 'btn-surface', 'chevrons-up', 'data-act="case-action" data-id="' + c.id + '" data-a="Progress to next step"', 'is-sm') : '') +
      (c.status === 'Open' && !APP.is('employee') ? APP.btn('Rescind, as if it never existed', 'btn-surface is-danger', 'undo-2', 'data-act="case-action" data-id="' + c.id + '" data-a="Rescind, as if it never existed"', 'is-sm') : '') +
      APP.btn('Export this case', 'btn-surface', 'download', 'data-act="export" data-what="Case ' + c.id + ' with its documentation"', 'is-sm') +
      (APP.isHR() ? APP.btn('Employee file export', 'btn-surface', 'package', 'data-act="file-export"', 'is-sm') : '') +
      '</div></section></div></div>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases'], [c.id, '#']],
      title: stepName(c.step) + ' · ' + e.name,
      desc: trackName(c.track) + ', ' + c.sub + ' · ' + D.locName(c.loc),
      action: APP.statusBadge(c.disposition || c.status), body: body
    });
  }

  /* ---------------- the five step wizard ---------------- */
  var WSTEPS = [['Case info', 'Who, which track, which step'], ['Documentation', 'Attach the prior coaching'],
    ['Summary and letters', 'Generate and edit the letter'], ['Approve and review', 'Submit to the approval chain'], ['Activate', 'Meet the employee and activate']];
  function wizard() {
    var w = S.wizard, e = P(w.emp);
    var evidence = D.FORMS.filter(function (f) { return f.emp === w.emp; });
    var needsLetter = D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].letter;
    var content;
    if (w.step === 0) {
      content = '<section class="card">' + APP.panelHead('Case info', 'Track, then subtrack, then the step. The step decides the letter, the approvals and the expiry.') +
        APP.field('Employee', APP.dd('w-emp', APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), w.emp, 'dd-block'), null, true) +
        '<div class="form-grid">' +
        APP.field('Track', APP.dd('w-track', D.TRACKS.map(function (t) { return [t.key, t.name]; }), w.track, 'dd-block'), null, true) +
        APP.field('Subtrack', APP.dd('w-sub', D.TRACKS.filter(function (t) { return t.key === w.track; })[0].subs, w.sub, 'dd-block'), null, true) +
        '</div>' +
        '<h3 class="section-label">Step</h3>' +
        '<div class="ladder">' + D.STEPS.map(function (s) {
          return '<button class="ladder-step' + (w.stepKey === s.key ? ' is-at' : '') + '" data-act="w-step-pick" data-k="' + s.key + '" style="border:0;cursor:pointer;text-align:left;font:inherit">' +
            '<div class="ls-name">' + esc(s.name) + '</div><div class="ls-sub">' + (s.expiry ? 'Expires after ' + s.expiry : 'End of the ladder') + (s.letter ? ', letter required' : ', no letter') + '</div></button>';
        }).join('') + '</div>' +
        (w.stepKey !== 'counseling' ? APP.callout('A step above documented counselling requires prior coaching on the record. The next section shows what is available and blocks you if there is nothing.', 'is-warning', 'shield-alert') : '') +
        '</section>';
    } else if (w.step === 1) {
      content = '<section class="card">' + APP.panelHead('Documentation', evidence.length ? 'Prior coaching on ' + e.name + ' attached automatically. Untick anything that does not belong, and say why.' : 'Nothing on record.') +
        (evidence.length ? evidence.map(function (f) {
          return '<label class="checkbox"><input type="checkbox" checked><span>' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + ' · ' + esc(f.outcome) + '<span class="cell-sub">' + esc(f.id) + ' · ' + esc(f.summary.slice(0, 100)) + '...</span></span></label>';
        }).join('') : APP.callout('No prior coaching exists for this person. A written warning cannot activate from here. Run a documented coaching form first.', 'is-danger', 'ban')) +
        (evidence.length ? APP.callout('<b>Scope guardrail.</b> Only coaching and review records can attach. Investigatory material from the HR case system is structurally blocked.', 'is-info', 'shield') : '') +
        '</section>';
    } else if (w.step === 2) {
      content = '<section class="card">' + APP.panelHead('Summary and letters', needsLetter ? 'Generated from the template for this step. Edit the parts in your words, leave the structure alone.' : 'This step does not require a letter.') +
        (needsLetter
          ? APP.field('Expectation going forward', '<textarea class="textarea">Work is recorded in the system as it is completed, at the end of every task, with no exceptions.</textarea>', 'Stated as a behaviour, at a frequency, with a standard.', true) +
            APP.field('Support provided', '<textarea class="textarea">A shadow shift with a peer, a recording reminder on the shift device, and twice weekly check ins with the manager for four weeks.</textarea>', 'A step without support is harder to defend.', true) +
            APP.field('Consequence if it is not met', '<textarea class="textarea">The next step on this track is a final written warning.</textarea>', null, true) +
            APP.btn('Preview the letter', 'btn-surface', 'eye', 'data-act="toast" data-t="Letter preview" data-b="The preview renders with the documentation attached, exactly as the employee will receive it." data-k="info"', 'is-sm')
          : APP.callout('Documented counselling records the conversation without issuing a letter. The employee still acknowledges the record.', 'is-info', 'info')) +
        '</section>';
    } else if (w.step === 3) {
      var chain = [[APP.me().id, 'Initiator, ' + APP.me().title]].concat(
        D.path(w.emp).slice(0, -1).reverse().filter(function (p) { return p.id !== APP.me().id; }).slice(0, 2)
          .map(function (p, i) { return [p.id, (i === 0 ? 'One level above, ' : 'Two levels above, ') + p.title]; }));
      chain.push(['grant', 'HR review']);
      content = '<section class="card">' + APP.panelHead('Approve and review', 'Derived from the org chart, not chosen by you. That is what makes the chain defensible.') +
        '<div class="chain-list">' + chain.map(function (a, i) {
          return '<div class="ch-row"><span class="ch-state">' + ic(i === 0 ? 'send' : 'hourglass', 18) + '</span>' +
            '<div class="ch-main"><span class="ch-who">' + esc(P(a[0]).name) + '</span><span class="ch-role">' + esc(a[1]) + '</span></div>' +
            '<span class="ch-when">' + (i === 0 ? APP.badge('You', 'is-info') : APP.statusBadge('Waiting')) + '</span></div>';
        }).join('') + '</div>' +
        APP.callout('Every approver sees the same documentation and the same letter. A decision cannot be edited afterwards, only superseded by a later one, and both stay in the trail.', 'is-info', 'shield-check') +
        '</section>';
    } else {
      content = '<section class="card">' + APP.panelHead('Activate', 'Nothing activates until every approval is recorded.') +
        APP.dataList([
          ['Employee', APP.personLine(e, null, 28, false)],
          ['Track', esc(trackName(w.track)) + ', ' + esc(w.sub)],
          ['Step', esc(stepName(w.stepKey))],
          ['Documentation', evidence.length + ' coaching forms attached'],
          ['Letter', needsLetter ? 'Drafted from the template' : 'Not required at this step'],
          ['Approvers', '4, derived from the org chart'],
          ['Step expiry if activated', D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].expiry || 'Not applicable']
        ]) +
        APP.callout('Submitting routes the case. It does not issue anything to the employee. The letter reaches them only after the last approval, when you meet them and activate.', 'is-info', 'route') +
        '</section>';
    }
    var body = '<div class="wiz-steps">' + WSTEPS.map(function (n, i) {
      return '<button class="wiz-step' + (i === w.step ? ' is-active' : i < w.step ? ' is-done' : '') + '" data-act="w-goto" data-i="' + i + '">' +
        '<span class="wiz-num">' + (i < w.step ? '&#10003;' : i + 1) + '</span><span class="wiz-text"><span class="wiz-t">Step ' + (i + 1) + '</span><span class="wiz-s">' + esc(n[0]) + '</span></span></button>';
    }).join('') + '</div>' + content +
      '<div class="runner-foot">' +
      (w.step > 0 ? APP.btn('Back', 'btn-surface', 'chevron-left', 'data-act="w-goto" data-i="' + (w.step - 1) + '"') : APP.btn('Cancel', 'btn-surface', null, 'data-act="goto" data-href="#/cases"')) +
      '<span class="rf-note">Step ' + (w.step + 1) + ' of 5 · ' + esc(WSTEPS[w.step][1]) + '</span><span class="rf-spacer"></span>' +
      APP.btn('Save', 'btn-surface', 'file-down', 'data-act="toast" data-t="Saved" data-b="The case exists as a draft from step one. You can leave and come back."') +
      (w.step < 4 ? APP.btn('Next', 'btn-solid', 'chevron-right', 'data-act="w-goto" data-i="' + (w.step + 1) + '"')
        : APP.btn('Submit for approval and review', 'btn-solid', 'send', 'data-act="w-submit"')) + '</div>';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases'], ['New case', '#']],
      title: P(w.emp).name + ' · new case', desc: 'Five steps. The case exists as a draft from step one, and drafts survive a lost session.',
      body: body
    });
  }

  APP.VIEWS.cases = function (r) {
    if (r[1] === 'new') { if (!S.wizard) S.wizard = { emp: 'trevor', track: 'performance', sub: 'Work standard', stepKey: 'counseling', step: 0 }; return wizard(); }
    if (r[1] && r[1].indexOf('PC-') === 0) return detail(r[1]);
    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases']],
      title: 'Performance cases', desc: 'Progressive discipline, with the full audit trail.',
      body: list()
    });
  };

  var A = APP.ACT;
  A['start-case'] = function (el) {
    var emp = (el && el.getAttribute('data-emp')) || APP.people().filter(function (p) { return p.level === 'staff'; })[0].id;
    S.wizard = { emp: emp, track: 'performance', sub: 'Work standard', stepKey: 'counseling', step: 0 };
    APP.closeAll(); APP.go('#/cases/new');
  };
  A['resume-case'] = function (el) {
    var c = D.kase(el.getAttribute('data-id'));
    S.wizard = { emp: c.emp, track: c.track, sub: c.sub, stepKey: c.step, step: Math.max(0, (c.wizardStep || 1) - 1) };
    APP.go('#/cases/new');
  };
  A['w-goto'] = function (el) { S.wizard.step = +el.getAttribute('data-i'); APP.rerender(); };
  A['w-step-pick'] = function (el) { S.wizard.stepKey = el.getAttribute('data-k'); APP.rerender(); };
  APP.DD['w-emp'] = function (v) { S.wizard.emp = v; APP.rerender(); };
  APP.DD['w-track'] = function (v) { S.wizard.track = v; S.wizard.sub = D.TRACKS.filter(function (t) { return t.key === v; })[0].subs[0]; APP.rerender(); };
  APP.DD['w-sub'] = function (v) { S.wizard.sub = v; APP.rerender(); };
  A['w-submit'] = function () {
    var w = S.wizard, e = P(w.emp);
    var id = 'PC-' + (3410 + Math.floor(Math.random() * 40));
    var line = D.path(w.emp).slice(0, -1).reverse().filter(function (p) { return p.id !== APP.me().id; }).slice(0, 2);
    D.CASES.unshift({ id: id, emp: w.emp, track: w.track, sub: w.sub, step: w.stepKey, status: 'Pending approval',
      opened: D.TODAY, by: APP.me().id, loc: e.loc, evidence: D.FORMS.filter(function (f) { return f.emp === w.emp; }).map(function (f) { return f.id; }).slice(0, 4),
      wizardStep: 4, letter: D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].letter, next: line[0] ? line[0].id : 'grant',
      approvals: [{ who: APP.me().id, role: 'Initiator, ' + APP.me().title, state: 'Submitted', on: D.TODAY }]
        .concat(line.map(function (p, i) { return { who: p.id, role: (i === 0 ? 'One level above, ' : 'Two levels above, ') + p.title, state: 'Waiting', on: null }; }))
        .concat([{ who: 'grant', role: 'HR review', state: 'Waiting', on: null }]),
      audit: [{ on: D.TODAY, who: APP.me().id, what: 'Case opened on track ' + trackName(w.track) + ', subtrack ' + w.sub + '.' },
        { on: D.TODAY, who: APP.me().id, what: 'Submitted for approval and review.' }] });
    S.wizard = null; APP.go('#/cases/' + id);
    APP.toast('Submitted', id + ' is with the approval chain. Nothing reaches ' + e.name.split(' ')[0] + ' until every approval is recorded.');
  };
  A['case-approve'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), me = APP.me();
    c.approvals.forEach(function (a) { if (a.who === me.id && a.state === 'Waiting') { a.state = 'Approved'; a.on = D.TODAY + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } });
    c.audit.push({ on: D.TODAY, who: me.id, what: 'Approved by ' + me.title + '.' });
    var nextW = c.approvals.filter(function (a) { return a.state === 'Waiting'; })[0];
    c.next = nextW ? nextW.who : null;
    if (!nextW) {
      c.status = 'Open'; c.activated = D.TODAY;
      var st = D.STEPS.filter(function (s) { return s.key === c.step; })[0];
      c.expires = st.expiry ? 'about ' + st.expiry + ' from today' : null;
      c.daysLeft = st.expiry === '12 months' ? 365 : st.expiry === '6 months' ? 183 : null;
      c.audit.push({ on: D.TODAY, who: 'System', what: 'All approvals recorded. Case activated' + (st.expiry ? ', step expires after ' + st.expiry : '') + '.' });
      APP.toast('Case activated', c.id + ' is now open. The letter has gone to ' + P(c.emp).name.split(' ')[0] + ' for acknowledgement.');
    } else {
      APP.toast('Approved', 'Your decision is recorded with your name and a timestamp. The case moves to ' + P(nextW.who).name + '.');
    }
    APP.rerender();
  };
  A['case-reject'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Send this case back', sub: 'A reason is required. The initiator reads it.',
      body: APP.field('Reason', '<textarea class="textarea" placeholder="The third form is outside the ninety day window. Reattach or explain."></textarea>', 'Kept in the audit trail.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send back', 'btn-solid is-danger', 'undo-2', 'data-act="case-reject-do" data-id="' + id + '"')
    });
  };
  A['case-reject-do'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), me = APP.me();
    c.status = 'Draft'; c.wizardStep = 2; c.next = c.by;
    c.approvals.forEach(function (a) { if (a.who === me.id) { a.state = 'Sent back'; a.on = D.TODAY; } });
    c.audit.push({ on: D.TODAY, who: me.id, what: 'Sent back to the initiator with a reason.' });
    APP.closeAll(); APP.rerender(); APP.toast('Sent back', c.id + ' is a draft again. The reason is in the audit trail.', 'info');
  };
  A['case-action'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), a = el.getAttribute('data-a');
    APP.closePops();
    if (a === 'Rescind, as if it never existed') {
      APP.dialog({
        title: 'Rescind this step', sub: 'The record stays. The step leaves the ladder.',
        body: APP.callout('Rescinding does not delete anything. The case is flagged, keeps its audit trail, and still appears in the employee file export. It stops counting toward a later step.', 'is-warning', 'undo-2') +
          APP.field('Reason', '<textarea class="textarea" placeholder="Appeal upheld. The gap was a system outage, not the employee."></textarea>', null, true),
        footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Rescind', 'btn-solid is-danger', 'undo-2', 'data-act="rescind-do" data-id="' + c.id + '"')
      });
      return;
    }
    if (a === 'Progress to next step') {
      var idx = D.STEPS.map(function (s) { return s.key; }).indexOf(c.step);
      if (idx < D.STEPS.length - 1) {
        c.step = D.STEPS[idx + 1].key; c.letter = D.STEPS[idx + 1].letter;
        c.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Progressed to ' + stepName(c.step) + '. Requires a new approval round.' });
        c.status = 'Pending approval'; c.approvals.forEach(function (x, i) { if (i) { x.state = 'Waiting'; x.on = null; } });
        APP.rerender(); APP.toast('Moved up the ladder', c.id + ' is now at ' + stepName(c.step) + ' and back in the approval chain.');
      } else APP.toast('Already at the top', 'Termination is the end of the ladder.', 'warning');
      return;
    }
    if (a === 'Close case') {
      c.status = 'Closed'; c.closed = D.TODAY; c.disposition = 'Complete';
      c.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Case closed.' });
      APP.rerender(); APP.toast('Case closed', c.id + ' is in the closed group and stays in the file.');
      return;
    }
    if (a === 'Edit letter') { APP.ACT['open-letter']({ getAttribute: function () { return c.id; } }); return; }
    APP.toast(a, 'Recorded against ' + c.id + ' in the audit trail.', 'info');
    c.audit.push({ on: D.TODAY, who: APP.me().id, what: a + '.' });
    APP.rerender();
  };
  A['rescind-do'] = function (el) {
    var c = D.kase(el.getAttribute('data-id'));
    c.status = 'Closed'; c.disposition = 'Rescinded'; c.closed = D.TODAY;
    c.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Rescinded. Record retained, step removed from the ladder.' });
    APP.closeAll(); APP.rerender(); APP.toast('Rescinded', c.id + ' no longer counts toward a later step.', 'info');
  };
})();
