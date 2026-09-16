/* skyPerformance: E3 coaching to do, trends and cross group, plus the form catalogue. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    if (APP.is('quality')) return APP.tabs([['crossgroup', 'Cross group', '#/coaching/crossgroup', D.CROSS.length], ['catalogue', 'Form catalogue', '#/coaching/catalogue', D.FORM_TYPES.length]], active);
    if (APP.is('frontline')) return APP.tabs([['todo', 'Coaching about me', '#/coaching', APP.forms().length], ['actions', 'What I agreed to', '#/actions', APP.actions().filter(function (a) { return a.status !== 'Closed'; }).length]], active);
    var tasks = APP.tasks();
    return APP.tabs([
      ['todo', 'To do list', '#/coaching', tasks.filter(function (t) { return t.status !== 'Completed'; }).length],
      ['trends', 'Coaching trends', '#/coaching/trends', 3],
      ['crossgroup', 'Cross group', '#/coaching/crossgroup', D.CROSS.filter(function (x) { return x.leader === APP.me().id || APP.inScope(x.emp); }).length],
      ['catalogue', 'Form catalogue', '#/coaching/catalogue', D.FORM_TYPES.length]
    ], active);
  }

  /* ---------------- to do ---------------- */
  function todo() {
    var f = S.f, status = f.tstatus || 'All open', type = f.ttype || 'All types', owner = f.towner || 'Everyone';
    var list = APP.tasks().filter(function (t) {
      if (status === 'All open' && t.status === 'Completed') return false;
      if (status !== 'All open' && status !== 'All' && t.status !== status) return false;
      if (type !== 'All types' && t.ft !== type) return false;
      if (owner === 'Mine' && t.owner !== APP.me().id) return false;
      return true;
    });
    var counts = { Overdue: 0, Open: 0, Draft: 0, Completed: 0 };
    APP.tasks().forEach(function (t) { counts[t.status] = (counts[t.status] || 0) + 1; });
    var body =
      '<div class="summary-strip">' +
      ['Overdue', 'Open', 'Draft', 'Completed'].map(function (k) {
        return '<button class="ss-item' + (status === k ? ' is-on' : '') + '" data-act="task-filter" data-val="' + k + '"><span class="ss-num">' + (counts[k] || 0) + '</span><span class="ss-label">' + k + '</span></button>';
      }).join('') + '</div>' +
      '<div class="filter-bar">' +
      APP.dd('tstatus', [['All open', 'All open'], ['Overdue', 'Overdue'], ['Open', 'Open'], ['Draft', 'Draft'], ['Completed', 'Completed'], ['All', 'Everything']], status) +
      APP.dd('ttype', [['All types', 'All form types']].concat(D.FORM_TYPES.filter(function (t) { return t.fam !== 'ops'; }).map(function (t) { return [t.id, t.name]; })), type) +
      APP.dd('towner', [['Everyone', 'Every leader'], ['Mine', 'Assigned to me']], owner) +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export list', 'btn-surface', 'download', 'data-act="export" data-what="The to do list as CSV"', 'is-sm') +
      APP.btn('Run a form now', 'btn-solid', 'circle-play', 'data-act="pick-form"', 'is-sm') +
      '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Touch point', w: '22%' }, { t: 'Employee', w: '15%' }, { t: 'Form type', w: '11%' }, { t: 'Why it opened', w: '26%' }, { t: 'Due', w: '8%' }, { t: 'Status', w: '9%' }, { t: '', w: '9%' }],
        list.map(function (t) {
          var e = P(t.emp), ft = D.formType(t.ft);
          return { attrs: '', cells: [
            '<span class="cell-strong">' + esc(t.topic) + '</span><span class="cell-sub">' + esc(t.id) + ' · opened ' + esc(t.opened) + ' by ' + esc(t.rule) + '</span>',
            APP.personLine(e, esc(e.title) + ', ' + esc(D.cmName(e.cm)), 28),
            '<span class="row-gap">' + ic(ft.ic, 16) + esc(ft.name) + '</span>',
            '<span class="mini-note">' + esc(t.why || (t.done ? 'Completed ' + t.done : 'Recurring schedule')) + '</span>',
            esc(t.due),
            APP.statusBadge(t.status),
            t.status === 'Completed'
              ? APP.btn('Record', 'btn-surface', null, 'data-act="open-form" data-id="' + t.formId + '"', 'is-sm')
              : APP.btn(t.status === 'Draft' ? 'Resume' : 'Run form', 'btn-solid', null, 'data-act="run-form" data-task="' + t.id + '"', 'is-sm')
          ] };
        }), { empty: 'No touch points match this filter.' }) +
      '</section>' +
      APP.callout('The list is generated, not curated. A leader cannot add or remove a touch point by hand: they change the rule that made it, in <a href="#/settings/rules">Configuration</a>, and the change applies to everyone in scope.', 'is-info', 'sliders-horizontal');
    return body;
  }

  /* ---------------- trends ---------------- */
  function trends() {
    var trendRows = [
      { emp: 'dana', topic: 'Documentation timeliness', n: 4, span: '22 Jul to 12 Sep 2026', forms: ['FM-20831', 'FM-20862', 'FM-20877', 'FM-20904'], state: 'Escalated', kase: 'PC-3391' },
      { emp: 'trevor', topic: 'Transfer technique', n: 2, span: '18 Aug to 9 Sep 2026', forms: ['FM-20889'], state: 'Watch', kase: null },
      { emp: 'nadia', topic: 'Medication accuracy', n: 2, span: '1 Sep to 14 Sep 2026', forms: [], state: 'Watch', kase: null }
    ].filter(function (r) { return APP.inScope(r.emp); });
    return '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Repeat topics', 'The same standard coached more than twice in ninety days is a trend, not a conversation.') +
      APP.table([{ t: 'Employee' }, { t: 'Topic' }, { t: 'Times coached', num: true }, { t: 'Window' }, { t: 'State' }, { t: '' }],
        trendRows.map(function (r) {
          return { cells: [
            APP.personLine(r.emp, null, 28), esc(r.topic), String(r.n), esc(r.span),
            APP.statusBadge(r.state === 'Escalated' ? 'Pending approval' : 'Waiting').replace('Pending approval', 'Escalated').replace('Waiting', 'Watch'),
            r.kase ? APP.btn('Open case ' + r.kase, 'btn-surface', 'gavel', 'data-act="goto" data-href="#/cases/' + r.kase + '"', 'is-sm')
              : (APP.canCase() ? APP.btn('Open a case', 'btn-solid', 'gavel', 'data-act="start-case" data-emp="' + r.emp + '"', 'is-sm') : '')
          ] };
        }), { empty: 'No repeat topics in your scope.' }) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Escalation is a suggestion, never automatic. A case still needs a person to open it, and the prior forms attach themselves as evidence when they do.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Topics across the team', 'What the coaching is actually about, this cycle.') +
      APP.bars([['Documentation', 14], ['Call light response', 11], ['Transfer technique', 7], ['Dining service', 6], ['Medication accuracy', 5], ['Recognition', 9]]) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Recognition is counted here on purpose. A team coached only on failures stops reading the record.</p>' +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Trend detection rules', 'What the engine watches for, and what it opens when it sees it.') +
      APP.table([{ t: 'Pattern' }, { t: 'Window' }, { t: 'What it opens' }, { t: 'State' }], [
        ['Same topic coached three or more times', '90 days', 'Suggests a performance case to the leader', APP.statusBadge('Active')],
        ['Two or more "No" scores on one form', 'Single form', 'Marks the form Needs improvement and requires an action item', APP.statusBadge('Active')],
        ['Action item overdue twice', '60 days', 'Carries the item onto the next form automatically', APP.statusBadge('Active')],
        ['Leader completion below 75%', 'Monthly', 'Opens manager rounding coaching on the leader', APP.statusBadge('Active')]
      ].map(function (r) { return { cells: r }; })) + '</section>';
  }

  /* ---------------- cross group ---------------- */
  function crossgroup() {
    var mine = APP.is('quality') ? D.CROSS : D.CROSS.filter(function (x) { return APP.inScope(x.emp) || x.leader === APP.me().id; });
    return APP.callout(APP.is('quality')
      ? 'You can suggest coaching on anyone, anywhere in the organisation. You cannot write on their record. The suggestion goes to their leader, attributed to Quality and Compliance, and the leader decides.'
      : 'These came from outside your reporting line. Accepting one opens a normal coaching form with the context pre-filled. Declining one requires a reason, which the sender reads.', 'is-info', 'shield') +
      (APP.is('quality') ? '<div class="filter-bar">' + APP.btn('Suggest coaching', 'btn-solid', 'plus', 'data-act="new-cross"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Suggestion' }, { t: 'Employee' }, { t: 'Sent to' }, { t: 'Raised' }, { t: 'State' }, { t: '' }],
        mine.map(function (x) {
          var e = P(x.emp);
          return { cells: [
            '<span class="cell-strong">' + esc(x.topic) + '</span><span class="cell-sub">' + esc(x.id) + ' · by ' + esc(P(x.by).name) + ', ' + esc(P(x.by).dept) + '</span>',
            APP.personLine(e, esc(D.cmName(e.cm)), 28),
            APP.personLine(x.leader, null, 28),
            esc(x.on),
            APP.statusBadge(x.state),
            APP.btn('Open', 'btn-surface', null, 'data-act="open-cross" data-id="' + x.id + '"', 'is-sm')
          ] };
        }), { empty: 'No cross group suggestions in your scope.' }) + '</section>';
  }

  /* ---------------- catalogue ---------------- */
  function catalogue() {
    return APP.callout('A form type is configuration, not code. Every type below shares one skeleton: instructions, performance snapshot, observation, action items, form info, submit. Adding a type is a Configuration task, not a release.' + (APP.isAdmin() || APP.isHR() ? ' <a href="#/settings">Open the form builder</a>.' : ''), 'is-info', 'layers') +
      D.FORM_FAMILIES.map(function (fam) {
        var types = D.FORM_TYPES.filter(function (t) { return t.fam === fam.key; });
        return '<div class="section-label">' + esc(fam.name) + ' · ' + esc(fam.desc) + '</div>' +
          '<div class="card-grid">' + types.map(function (t) {
            return '<button class="card vs-card" data-act="run-form" data-ft="' + t.id + '">' +
              '<div class="vs-head"><span class="vs-ic">' + ic(t.ic, 18) + '</span><span class="vs-name">' + esc(t.name) + '</span>' + (t.scored ? APP.badge('Scored', 'is-info') : APP.badge('Written', 'is-neutral')) + '</div>' +
              '<p class="mini-note">' + esc(t.desc) + '</p>' +
              '<div class="tag-row"><span class="tag">' + t.qs + ' questions</span><span class="tag">about ' + t.mins + ' min</span><span class="tag">' + esc(t.level) + ' level</span></div>' +
              '<span class="rowlink">Run this form ' + '</span></button>';
          }).join('') + '</div>';
      }).join('');
  }

  /* ---------------- frontline variants ---------------- */
  function mine() {
    var forms = APP.forms();
    return APP.callout('This is every coaching record about you, in the words your leader wrote. You can read each one in full, including the scores. If something looks wrong, say so in the acknowledgement, which is kept with the record.', 'is-info', 'info') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Date' }, { t: 'Form' }, { t: 'By' }, { t: 'Outcome' }, { t: 'Summary' }, { t: '' }],
        forms.map(function (f) {
          var ft = D.formType(f.ft);
          return { cells: [esc(f.date), '<span class="row-gap">' + ic(ft.ic, 16) + esc(ft.name) + '</span>', APP.personLine(f.by, null, 28), APP.statusBadge(f.outcome),
            '<span class="mini-note">' + esc(f.summary.slice(0, 90)) + '...</span>',
            APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm')] };
        }), { empty: 'Nothing on your record yet.' }) + '</section>';
  }

  APP.VIEWS.coaching = function (r) {
    if (r[1] === 'run') return APP.formRunner(r);
    var tab = r[1] || (APP.is('quality') ? 'crossgroup' : 'todo');
    var body, title, desc;
    if (APP.is('frontline')) {
      title = 'My coaching'; desc = 'Every documented conversation about your work.';
      body = mine();
    } else if (tab === 'trends') { title = 'Coaching'; desc = 'Repeat topics, and what the engine does about them.'; body = trends(); }
    else if (tab === 'crossgroup') { title = APP.is('quality') ? 'Cross group' : 'Coaching'; desc = 'Suggestions raised outside the reporting line.'; body = crossgroup(); }
    else if (tab === 'catalogue') { title = APP.is('quality') ? 'Form catalogue' : 'Coaching'; desc = 'Every form type available to you, and what each one is for.'; body = catalogue(); }
    else { title = 'Coaching'; desc = 'The system decides who to coach, on what topic, by when. You decide how.'; body = todo(); }
    return APP.page({
      crumbs: [['Home', '#/home'], [title, '#/coaching']],
      title: title, desc: desc, tabs: tabsFor(tab), body: body
    });
  };

  /* ---------------- actions ---------------- */
  APP.ACT['task-filter'] = function (el) { S.f.tstatus = el.getAttribute('data-val'); APP.rerender(); };
  APP.ACT['open-cross'] = function (el) {
    var x = D.CROSS.filter(function (c) { return c.id === el.getAttribute('data-id'); })[0];
    var e = P(x.emp), canAct = x.leader === APP.me().id && x.state === 'Sent to leader';
    APP.dialog({
      title: 'Cross group suggestion', sub: x.id + ' · raised by ' + P(x.by).name + ', ' + P(x.by).dept,
      body: APP.dataList([
        ['Employee', APP.personLine(e, esc(e.title) + ', ' + esc(D.cmName(e.cm)), 28, false)],
        ['Their leader', APP.personLine(x.leader, null, 28, false)],
        ['What was seen', esc(x.topic)],
        ['Raised on', esc(x.on)],
        ['Suggested form', esc(D.formType(x.suggest).name)],
        ['State', APP.statusBadge(x.state)]
      ].concat(x.why ? [['Reason declined', esc(x.why)]] : [])) +
        APP.callout('The suggester never sees the resulting form. They see only whether it was accepted or declined, and the reason if it was declined.', 'is-info', 'eye-off'),
      footer: (canAct
        ? APP.btn('Decline with a reason', 'btn-surface', null, 'data-act="decline-cross" data-id="' + x.id + '"') + APP.btn('Accept and run the form', 'btn-solid', 'circle-play', 'data-act="run-form" data-ft="' + x.suggest + '" data-emp="' + x.emp + '"')
        : APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"'))
    });
  };
  APP.ACT['decline-cross'] = function (el) {
    APP.closeOverlay();
    APP.dialog({
      title: 'Decline this suggestion', sub: 'A reason is required. The sender reads it.',
      body: APP.field('Reason', '<textarea class="textarea" placeholder="Already coached on 18 Aug, form FM-20850."></textarea>', 'Kept with the suggestion, not on the employee record.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send decline', 'btn-solid', 'send', 'data-act="cross-declined" data-id="' + el.getAttribute('data-id') + '"')
    });
  };
  APP.ACT['cross-declined'] = function (el) {
    var x = D.CROSS.filter(function (c) { return c.id === el.getAttribute('data-id'); })[0];
    x.state = 'Declined'; x.why = 'Declined in this session for demonstration.';
    APP.closeAll(); APP.rerender(); APP.toast('Decline sent', P(x.by).name + ' will see the reason. Nothing was written to the employee record.', 'info');
  };
  APP.ACT['new-cross'] = function () {
    APP.dialog({
      title: 'Suggest coaching', sub: 'Outside your reporting line. Goes to the employee leader.',
      body: APP.field('Employee', APP.dd('xg-emp', D.PEOPLE.filter(function (p) { return p.level === 'staff'; }).map(function (p) { return [p.id, p.name + ', ' + D.cmName(p.cm)]; }), 'nadia', 'dd-block'), 'Their leader is notified, not the employee.', true) +
        APP.field('Suggested form', APP.dd('xg-ft', D.FORM_TYPES.filter(function (t) { return t.fam === 'staff'; }).map(function (t) { return [t.id, t.name]; }), 'FT-CHK', 'dd-block'), null, true) +
        APP.field('What you saw', '<textarea class="textarea" placeholder="Describe the behaviour, not the person. Use the room number rather than the resident name."></textarea>', 'Guardrail: resident names are flagged before this is sent.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send to leader', 'btn-solid', 'send', 'data-act="toast" data-t="Suggestion sent" data-b="Attributed to Quality and Compliance. The leader decides whether to run a form."')
    });
  };
  APP.ACT['pick-form'] = function () {
    APP.dialog({
      title: 'Run a form now', sub: 'Ad hoc, outside the to do list. It still binds to the hierarchy and still counts.', size: 'is-wide',
      body: '<div class="card-grid">' + D.FORM_TYPES.filter(function (t) { return APP.canRunVisits() || t.fam !== 'ops'; }).map(function (t) {
        return '<button class="card vs-card" data-act="run-form" data-ft="' + t.id + '"><div class="vs-head"><span class="vs-ic">' + ic(t.ic, 18) + '</span><span class="vs-name">' + esc(t.name) + '</span></div><p class="mini-note">' + esc(t.desc) + '</p></button>';
      }).join('') + '</div>'
    });
  };
})();
