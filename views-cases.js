/* skyPerformance: E7 performance management. Track, subtrack, step; a five step
   wizard; a generated letter; an approval chain; an audit trail. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function stepName(k) { return D.STEPS.filter(function (s) { return s.key === k; })[0].name; }
  function trackName(k) { return D.TRACKS.filter(function (t) { return t.key === k; })[0].name; }

  function tabsFor(active) {
    var all = APP.cases();
    return APP.tabs([
      ['active', 'Active', '#/cases', all.filter(function (c) { return c.status === 'Active'; }).length],
      ['approvals', 'Waiting on approval', '#/cases/approvals', all.filter(function (c) { return c.status === 'Pending approval'; }).length],
      ['drafts', 'Drafts', '#/cases/drafts', all.filter(function (c) { return c.status === 'Draft'; }).length],
      ['closed', 'Expired and rescinded', '#/cases/closed', all.filter(function (c) { return c.status === 'Expired' || c.status === 'Rescinded'; }).length],
      ['all', 'Everything', '#/cases/all', all.length]
    ], active);
  }

  function list(tab) {
    var rows = APP.cases().filter(function (c) {
      if (tab === 'active') return c.status === 'Active';
      if (tab === 'approvals') return c.status === 'Pending approval';
      if (tab === 'drafts') return c.status === 'Draft';
      if (tab === 'closed') return c.status === 'Expired' || c.status === 'Rescinded';
      return true;
    });
    var mine = APP.approvalsFor();
    return (mine.length && (tab === 'approvals' || tab === 'active')
      ? APP.callout('<b>' + mine.length + ' case is waiting on you.</b> Approving records your decision with your name and a timestamp. It cannot be changed afterwards, only superseded.', 'is-warning', 'gavel') : '') +
      (APP.canCase() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export case summary', 'btn-surface', 'download', 'data-act="export" data-what="The case summary report"', 'is-sm') +
        APP.btn('Open a case', 'btn-solid', 'plus', 'data-act="start-case"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Case' }, { t: 'Employee' }, { t: 'Track' }, { t: 'Step' }, { t: 'Opened by' }, { t: 'Evidence', num: true }, { t: 'Status' }, { t: '' }],
        rows.map(function (c) {
          return { cells: [
            '<span class="cell-strong">' + esc(c.id) + '</span><span class="cell-sub">opened ' + esc(c.opened) + (c.expires ? ' · expires ' + esc(c.expires) : '') + '</span>',
            APP.personLine(c.emp, esc(D.cmName(c.cm)), 28),
            esc(trackName(c.track)) + '<span class="cell-sub">' + esc(c.sub) + '</span>',
            esc(stepName(c.step)),
            APP.personLine(c.by, null, 28),
            String(c.evidence.length),
            APP.statusBadge(c.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm')
          ] };
        }), { empty: 'No cases here.' }) + '</section>' +
      APP.callout('A case cannot activate without documented prior coaching, a completed letter where the step requires one, and every recorded approval. That constraint is the product.', 'is-info', 'shield-check');
  }

  /* ---------------- detail ---------------- */
  function detail(id) {
    var c = D.kase(id);
    if (!c) return APP.page({ crumbs: [['Home', '#/home'], ['Performance cases', '#/cases']], title: 'Case not found', desc: 'It may sit outside your branch of the hierarchy.', body: APP.emptyState('gavel', 'Not in your scope', 'Records are bound to the hierarchy path they were created under, and retrieval follows the same rule.', APP.btn('Back to cases', 'btn-solid', null, 'data-act="goto" data-href="#/cases"')) });
    var e = P(c.emp), me = APP.me();
    var myTurn = c.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    var prior = D.CASES.filter(function (x) { return x.emp === c.emp && x.id !== c.id; });
    var ladder = D.STEPS.map(function (s, i) {
      var atIdx = D.STEPS.map(function (x) { return x.key; }).indexOf(c.step);
      return '<div class="ladder-step' + (i === atIdx ? ' is-at' : i < atIdx ? ' is-past' : '') + '"><div class="ls-name">' + esc(s.name) + '</div>' +
        '<div class="ls-sub">' + (s.expiry ? 'Expires after ' + s.expiry : 'End of the ladder') + (s.letter ? ', letter required' : '') + '</div>' +
        (i === atIdx ? '<div style="margin-top:var(--space-2)">' + APP.badge('This case', 'is-warning') + '</div>' : '') + '</div>';
    }).join('');

    var body =
      (c.status === 'Pending approval' && myTurn ? APP.callout('<b>This case is waiting on your decision.</b> Read the evidence and the letter before you decide. Both are attached below.', 'is-warning', 'gavel') : '') +
      (c.status === 'Rescinded' ? APP.callout('<b>This case was rescinded.</b> The record is retained and flagged. It never counts toward a later step, and it still appears in the employee file export.', 'is-danger', 'undo-2') : '') +
      (c.status === 'Expired' ? APP.callout('<b>This step expired on ' + esc(c.expires) + '.</b> It left the ladder automatically. A new case starts from the bottom.', 'is-info', 'hourglass') : '') +
      '<div class="split-rail">' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Case', c.id + ' · opened ' + c.opened + ' by ' + P(c.by).name) +
      APP.dataList([
        ['Employee', APP.personLine(e, esc(e.title) + ', ' + esc(D.cmName(e.cm)), 28, false)],
        ['Track', esc(trackName(c.track))],
        ['Subtrack', esc(c.sub)],
        ['Step', esc(stepName(c.step))],
        ['Status', APP.statusBadge(c.status)],
        ['Activated', c.activated ? esc(c.activated) : 'Not yet'],
        ['Step expiry', c.expires ? esc(c.expires) : 'Not applicable'],
        ['Hierarchy path', '<span class="cell-id">' + esc(APP.crumbPath(c.cm)) + '</span>']
      ]) + '</section>' +
      '<section class="card">' + APP.panelHead('The ladder', 'Track ' + esc(trackName(c.track)) + ', subtrack ' + esc(c.sub) + '. A step is reached, never skipped.') +
      '<div class="ladder">' + ladder + '</div>' +
      (prior.length ? '<p class="mini-note" style="margin-top:var(--space-4)">' + prior.length + ' other case on this employee record: ' + prior.map(function (x) { return '<button class="rowlink" data-act="goto" data-href="#/cases/' + x.id + '">' + esc(x.id) + '</button> (' + esc(x.status.toLowerCase()) + ')'; }).join(', ') + '.</p>' : '') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Evidence', c.evidence.length ? 'Prior coaching attached automatically when the case opened.' : 'Nothing attached yet.',
        c.status === 'Draft' ? APP.btn('Attach coaching', 'btn-surface', 'paperclip', 'data-act="toast" data-t="Evidence picker" data-b="Prior coaching on this employee attaches itself. You choose what to leave out, with a reason." data-k="info"', 'is-sm') : '') +
      (c.evidence.length ? '<div class="wq">' + c.evidence.map(function (fid) {
        var f = D.form(fid);
        if (!f) return '';
        return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : '') + '">' + ic(D.formType(f.ft).ic, 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(fid) + ' · ' + esc(f.summary.slice(0, 90)) + '...</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + fid + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div>' : APP.callout('No prior coaching is attached. Any step above documented coaching is blocked until there is.', 'is-warning', 'triangle-alert')) +
      '</section>' +
      '<section class="card">' + APP.panelHead('Audit trail', 'Every state change, attributed and timestamped. Append only.') +
      '<div class="audit">' + c.audit.map(function (a) {
        return '<div class="audit-row"><span class="audit-when">' + esc(a.on) + '</span><span class="audit-what">' + esc(a.what) + '<span class="audit-who">' + esc(a.who === 'System' ? 'System' : P(a.who).name) + '</span></span></div>';
      }).join('') + '</div></section>' +
      '</div>' +
      '<div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Approval chain', c.approvals.length ? 'One level above, two levels above, then HR.' : 'Not routed yet.') +
      (c.approvals.length ? '<div class="chain-list">' + c.approvals.map(function (a) {
        return '<div class="ch-row"><span class="ch-state">' + (a.state === 'Approved' ? ic('circle-check', 18) : a.state === 'Waiting' ? ic('hourglass', 18) : ic('send', 18)) + '</span>' +
          '<div class="ch-main"><span class="ch-who">' + esc(P(a.who).name) + '</span><span class="ch-role">' + esc(a.role) + '</span></div>' +
          '<span class="ch-when">' + (a.on ? esc(a.on) : APP.statusBadge('Waiting')) + '</span></div>';
      }).join('') + '</div>' : '<div class="table-empty">Route it from the wizard.</div>') +
      (myTurn ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Send back', 'btn-surface', 'undo-2', 'data-act="case-reject" data-id="' + c.id + '"', 'is-sm') +
        APP.btn('Approve', 'btn-solid', 'check', 'data-act="case-approve" data-id="' + c.id + '"', 'is-sm') + '</div>' : '') +
      '</section>' +
      (c.letter ? '<section class="card">' + APP.panelHead('Letter', 'Generated from the ' + esc(stepName(c.step)) + ' template, then edited by the initiator.') +
        APP.btn('Read the letter', 'btn-solid', 'file-text', 'data-act="open-letter" data-id="' + c.id + '"', 'is-sm') +
        '<p class="mini-note" style="margin-top:var(--space-3)">The employee acknowledges receipt, which is recorded separately from agreement.</p></section>' : '') +
      '<section class="card">' + APP.panelHead('Actions') +
      '<div class="stack-2">' +
      (c.status === 'Draft' ? APP.btn('Continue the wizard', 'btn-solid', 'circle-arrow-right', 'data-act="resume-case" data-id="' + c.id + '"', 'is-sm') : '') +
      (c.status === 'Active' && (APP.isHR() || APP.isLeader()) ? APP.btn('Rescind this step', 'btn-surface is-danger', 'undo-2', 'data-act="rescind-case" data-id="' + c.id + '"', 'is-sm') : '') +
      APP.btn('Export this case', 'btn-surface', 'download', 'data-act="export" data-what="Case ' + c.id + ' with its evidence"', 'is-sm') +
      (APP.isHR() ? APP.btn('Employee file export', 'btn-surface', 'package', 'data-act="file-export"', 'is-sm') : '') +
      '</div></section>' +
      '</div></div>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases'], [c.id, '#']],
      title: stepName(c.step) + ' · ' + e.name,
      desc: trackName(c.track) + ', ' + c.sub + ' · ' + D.cmName(c.cm),
      action: APP.statusBadge(c.status), body: body
    });
  }

  /* ---------------- five step wizard ---------------- */
  var WSTEPS = ['Track and step', 'Evidence', 'Letter', 'Approval routing', 'Activate'];
  function wizard() {
    var w = S.wizard;
    var e = P(w.emp), steps = D.STEPS.map(function (s) { return s.key; });
    var evidence = D.FORMS.filter(function (f) { return f.emp === w.emp; });
    var content;
    if (w.step === 0) {
      content = '<section class="card">' + APP.panelHead('What is this case about', 'Track, then subtrack, then the step on that track. The step decides the letter, the approvals and the expiry.') +
        APP.field('Employee', APP.dd('w-emp', APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), w.emp, 'dd-block'), null, true) +
        '<div class="form-grid">' +
        APP.field('Track', APP.dd('w-track', D.TRACKS.map(function (t) { return [t.key, t.name]; }), w.track, 'dd-block'), null, true) +
        APP.field('Subtrack', APP.dd('w-sub', D.TRACKS.filter(function (t) { return t.key === w.track; })[0].subs, w.sub, 'dd-block'), null, true) +
        '</div>' +
        '<h3 class="section-label">Step on this track</h3>' +
        '<div class="ladder">' + D.STEPS.map(function (s) {
          return '<button class="ladder-step' + (w.stepKey === s.key ? ' is-at' : '') + '" data-act="w-step-pick" data-k="' + s.key + '" style="border:0;cursor:pointer;text-align:left;font:inherit">' +
            '<div class="ls-name">' + esc(s.name) + '</div><div class="ls-sub">' + (s.expiry ? 'Expires after ' + s.expiry : 'End of the ladder') + (s.letter ? ', letter required' : ', no letter') + '</div></button>';
        }).join('') + '</div>' +
        (w.stepKey !== 'coaching' ? APP.callout('A step above documented coaching requires prior coaching on the record. The next section shows what is available and blocks you if there is nothing.', 'is-warning', 'shield-alert') : '') +
        '</section>';
    } else if (w.step === 1) {
      content = '<section class="card">' + APP.panelHead('Attach the evidence', evidence.length ? 'Prior coaching on ' + e.name + ' attached automatically. Untick anything that does not belong, and say why.' : 'Nothing on record.') +
        (evidence.length ? evidence.map(function (f) {
          return '<label class="checkbox"><input type="checkbox" checked><span>' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + ' · ' + esc(f.outcome) + '<span class="cell-sub">' + esc(f.id) + ' · ' + esc(f.summary.slice(0, 100)) + '...</span></span></label>';
        }).join('') : APP.callout('No prior coaching exists for this employee. A written warning cannot activate from here. Run a documented coaching form first.', 'is-danger', 'ban')) +
        (evidence.length ? APP.callout('<b>Scope guardrail.</b> Only coaching and rounding records can attach. Investigatory material from Employee Relations is structurally blocked from entering this case.', 'is-info', 'shield') : '') +
        '</section>';
    } else if (w.step === 2) {
      var needsLetter = D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].letter;
      content = '<section class="card">' + APP.panelHead('Letter', needsLetter ? 'Generated from the template for this step. Edit the parts in your words, leave the structure alone.' : 'This step does not require a letter.') +
        (needsLetter
          ? APP.field('Expectation going forward', '<textarea class="textarea">Care plan documentation is completed before leaving the floor at the end of every shift, with no exceptions.</textarea>', 'Stated as a behaviour, at a frequency, with a standard.', true) +
            APP.field('Support provided', '<textarea class="textarea">A shadow shift with a peer, a documentation reminder on the shift device, and twice weekly check ins with the Nurse Manager for four weeks.</textarea>', 'A step without support is harder to defend.', true) +
            APP.field('Consequence if it is not met', '<textarea class="textarea">The next step on this track is a final written warning.</textarea>', null, true) +
            APP.btn('Preview the letter', 'btn-surface', 'eye', 'data-act="toast" data-t="Letter preview" data-b="The preview renders with the evidence attached, exactly as the employee will receive it." data-k="info"', 'is-sm')
          : APP.callout('Documented coaching records the conversation without issuing a letter. The employee still acknowledges the record.', 'is-info', 'info')) +
        '</section>';
    } else if (w.step === 3) {
      var chain = [
        [APP.me().id, 'Initiator, ' + APP.me().title],
        ['curtis', 'One level above, Executive Director'],
        ['alexis', 'Two levels above, Regional Director'],
        ['grant', 'HR and Employee Relations']
      ];
      content = '<section class="card">' + APP.panelHead('Approval routing', 'Derived from the hierarchy path, not chosen by you. This is what makes the chain defensible.') +
        '<div class="chain-list">' + chain.map(function (a, i) {
          return '<div class="ch-row"><span class="ch-state">' + ic(i === 0 ? 'send' : 'hourglass', 18) + '</span>' +
            '<div class="ch-main"><span class="ch-who">' + esc(P(a[0]).name) + '</span><span class="ch-role">' + esc(a[1]) + '</span></div>' +
            '<span class="ch-when">' + (i === 0 ? APP.badge('You', 'is-info') : APP.statusBadge('Waiting')) + '</span></div>';
        }).join('') + '</div>' +
        APP.callout('Every approver sees the same evidence and the same letter. A decision cannot be edited afterwards, only superseded by a later one, and both stay in the trail.', 'is-info', 'shield-check') +
        '</section>';
    } else {
      content = '<section class="card">' + APP.panelHead('Ready to route', 'Nothing activates until every approval is recorded.') +
        APP.dataList([
          ['Employee', APP.personLine(e, null, 28, false)],
          ['Track', esc(trackName(w.track)) + ', ' + esc(w.sub)],
          ['Step', esc(stepName(w.stepKey))],
          ['Evidence', evidence.length + ' coaching forms attached'],
          ['Letter', D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].letter ? 'Drafted from the template' : 'Not required at this step'],
          ['Approvers', '4, derived from the hierarchy'],
          ['Step expiry if activated', D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].expiry || 'Not applicable']
        ]) +
        APP.callout('Submitting routes the case. It does not issue anything to the employee. The letter reaches them only after the last approval.', 'is-info', 'route') +
        '</section>';
    }
    var body = '<div class="wiz-steps">' + WSTEPS.map(function (n, i) {
      return '<button class="wiz-step' + (i === w.step ? ' is-active' : i < w.step ? ' is-done' : '') + '" data-act="w-goto" data-i="' + i + '"><span class="wiz-num">' + (i < w.step ? '✓' : i + 1) + '</span><span class="wiz-t">' + esc(n) + '</span></button>';
    }).join('') + '</div>' + content +
      '<div class="runner-foot">' +
      (w.step > 0 ? APP.btn('Back', 'btn-surface', 'chevron-left', 'data-act="w-goto" data-i="' + (w.step - 1) + '"') : APP.btn('Cancel', 'btn-surface', null, 'data-act="goto" data-href="#/cases"')) +
      '<span class="rf-note">Step ' + (w.step + 1) + ' of 5 · ' + esc(WSTEPS[w.step]) + '</span><span class="rf-spacer"></span>' +
      (w.step < 4 ? APP.btn('Continue', 'btn-solid', 'chevron-right', 'data-act="w-goto" data-i="' + (w.step + 1) + '"')
        : APP.btn('Route for approval', 'btn-solid', 'send', 'data-act="w-submit"')) + '</div>';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases'], ['New case', '#']],
      title: 'Open a performance case', desc: 'Five steps. The case exists from step one as a draft, and drafts survive a lost session.',
      scope: false, body: body
    });
  }

  APP.VIEWS.cases = function (r) {
    if (r[1] === 'new') { if (!S.wizard) S.wizard = { emp: 'trevor', track: 'performance', sub: 'Care standard', stepKey: 'coaching', step: 0 }; return wizard(); }
    if (r[1] && r[1].indexOf('PC-') === 0) return detail(r[1]);
    var tab = r[1] || 'active';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Performance cases', '#/cases']],
      title: 'Performance cases', desc: 'Track, subtrack and step. Evidence, letter, approvals and audit trail on every one.',
      tabs: tabsFor(tab), body: list(tab)
    });
  };

  var A = APP.ACT;
  A['start-case'] = function (el) {
    S.wizard = { emp: (el && el.getAttribute('data-emp')) || 'trevor', track: 'performance', sub: 'Care standard', stepKey: 'coaching', step: 0 };
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
    D.CASES.unshift({ id: id, emp: w.emp, track: w.track, sub: w.sub, step: w.stepKey, status: 'Pending approval',
      opened: D.TODAY, by: APP.me().id, cm: e.cm, evidence: D.FORMS.filter(function (f) { return f.emp === w.emp; }).map(function (f) { return f.id; }).slice(0, 4),
      wizardStep: 4, letter: D.STEPS.filter(function (s) { return s.key === w.stepKey; })[0].letter,
      approvals: [
        { who: APP.me().id, role: 'Initiator, ' + APP.me().title, state: 'Submitted', on: D.TODAY },
        { who: 'curtis', role: 'One level above, Executive Director', state: 'Waiting', on: null },
        { who: 'alexis', role: 'Two levels above, Regional Director', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR and Employee Relations', state: 'Waiting', on: null }],
      audit: [{ on: D.TODAY, who: APP.me().id, what: 'Case opened on track ' + trackName(w.track) + ', subtrack ' + w.sub + '.' },
        { on: D.TODAY, who: APP.me().id, what: 'Routed for approval to three approvers.' }] });
    S.wizard = null; APP.go('#/cases/' + id);
    APP.toast('Case routed', id + ' is with the Executive Director. Nothing reaches ' + e.name.split(' ')[0] + ' until every approval is recorded.');
  };
  A['case-approve'] = function (el) {
    var c = D.kase(el.getAttribute('data-id')), me = APP.me();
    c.approvals.forEach(function (a) { if (a.who === me.id && a.state === 'Waiting') { a.state = 'Approved'; a.on = D.TODAY + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } });
    c.audit.push({ on: D.TODAY, who: me.id, what: 'Approved at ' + (APP.isHR() ? 'HR review' : 'the ' + APP.role().label.toLowerCase() + ' level') + '.' });
    if (c.approvals.every(function (a) { return a.state !== 'Waiting'; })) {
      c.status = 'Active'; c.activated = D.TODAY;
      var st = D.STEPS.filter(function (s) { return s.key === c.step; })[0];
      c.expires = st.expiry ? 'about ' + st.expiry + ' from today' : null;
      c.audit.push({ on: D.TODAY, who: 'System', what: 'All approvals recorded. Case activated' + (st.expiry ? ', step expires after ' + st.expiry : '') + '.' });
      APP.toast('Case activated', c.id + ' is now live. The letter has gone to ' + P(c.emp).name.split(' ')[0] + ' for acknowledgement.');
    } else {
      APP.toast('Approved', 'Your decision is recorded with your name and a timestamp. The case moves to the next approver.');
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
    c.status = 'Draft'; c.wizardStep = 2;
    c.approvals.forEach(function (a) { if (a.who === me.id) { a.state = 'Sent back'; a.on = D.TODAY; } });
    c.audit.push({ on: D.TODAY, who: me.id, what: 'Sent back to the initiator with a reason.' });
    APP.closeAll(); APP.rerender(); APP.toast('Sent back', c.id + ' is a draft again. The reason is in the audit trail.', 'info');
  };
  A['rescind-case'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Rescind this step', sub: 'The record stays. The step leaves the ladder.',
      body: APP.callout('Rescinding does not delete anything. The case is flagged, keeps its audit trail, and still appears in the employee file export. It stops counting toward a later step.', 'is-warning', 'undo-2') +
        APP.field('Reason', '<textarea class="textarea" placeholder="Grievance upheld. Documentation gap was a system outage, not the employee."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Rescind', 'btn-solid is-danger', 'undo-2', 'data-act="rescind-do" data-id="' + id + '"')
    });
  };
  A['rescind-do'] = function (el) {
    var c = D.kase(el.getAttribute('data-id'));
    c.status = 'Rescinded';
    c.audit.push({ on: D.TODAY, who: APP.me().id, what: 'Rescinded. Record retained, step removed from the ladder.' });
    APP.closeAll(); APP.rerender(); APP.toast('Rescinded', c.id + ' no longer counts toward a later step.', 'info');
  };
})();
