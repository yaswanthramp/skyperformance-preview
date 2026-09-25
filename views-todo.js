/* skyPerformance: to-dos. Action items raised anywhere land on the owner's own
   page. Site visit findings land on the Executive Director's page, which is the
   specific thing the client asked for after the call. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function sourceLink(a) {
    if (a.fromKind === 'visit') return '<button class="rowlink" data-act="goto" data-href="#/visits/' + a.from + '/plan">' + esc(a.from) + '</button>';
    if (a.fromKind === 'pip') return '<button class="rowlink" data-act="goto" data-href="#/pips/' + a.from + '">' + esc(a.from) + '</button>';
    if (a.fromKind === 'eval') return '<button class="rowlink" data-act="goto" data-href="#/evaluations/' + a.from + '">' + esc(a.from) + '</button>';
    if (a.fromKind === 'coaching') return '<button class="rowlink" data-act="open-record" data-id="' + a.from + '">' + esc(a.from) + '</button>';
    return esc(a.from);
  }
  function sourceLabel(k) { return k === 'visit' ? APP.term('visit') : k === 'pip' ? APP.term('pip') : k === 'eval' ? 'Evaluation' : APP.term('coaching'); }

  function actionRow(a) {
    var late = a.status === 'Overdue';
    return '<div class="wq-row"><span class="wq-ic' + (late ? ' is-late' : a.status === 'Closed' ? ' is-good' : '') + '">' +
      ic(late ? 'triangle-alert' : a.status === 'Closed' ? 'check' : 'list-checks', 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(a.t) + '</span>' +
      '<span class="wq-s">' + esc(a.id) + ' · ' + esc(sourceLabel(a.fromKind)) + ' ' + esc(a.from) + ' · from ' + esc(P(a.by).name) + '</span></div>' +
      '<div class="wq-right">' + APP.statusBadge(a.status) + '<span class="mini-note">Due ' + esc(a.due) + '</span>' +
      APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm') + '</div></div>';
  }
  APP.actionRow = actionRow;

  function tabsFor(active) {
    var me = APP.me(), all = APP.actions();
    var mine = all.filter(function (a) { return a.owner === me.id; });
    var raised = all.filter(function (a) { return a.by === me.id; });
    if (APP.is('employee')) return APP.tabs([
      ['mine', 'Open', '#/todos', mine.filter(function (a) { return a.status !== 'Closed'; }).length],
      ['done', 'Closed', '#/todos/done', mine.filter(function (a) { return a.status === 'Closed'; }).length]
    ], active);
    return APP.tabs([
      ['mine', 'Assigned to me', '#/todos', mine.filter(function (a) { return a.status !== 'Closed'; }).length],
      ['raised', 'I assigned', '#/todos/raised', raised.filter(function (a) { return a.status !== 'Closed'; }).length],
      ['team', 'My team', '#/todos/team', all.filter(function (a) { return a.owner !== me.id && APP.inScope(a.owner) && a.status !== 'Closed'; }).length],
      ['all', 'Everything', '#/todos/all', all.length]
    ], active);
  }

  APP.VIEWS.todos = function (r) {
    var tab = r[1] || 'mine', me = APP.me(), all = APP.actions();
    var rows = all.filter(function (a) {
      if (tab === 'mine') return a.owner === me.id && a.status !== 'Closed';
      if (tab === 'done') return a.owner === me.id && a.status === 'Closed';
      if (tab === 'raised') return a.by === me.id;
      if (tab === 'team') return a.owner !== me.id && APP.inScope(a.owner);
      return true;
    });
    var mine = all.filter(function (a) { return a.owner === me.id; });
    function openFrom(kind) { return mine.filter(function (a) { return a.fromKind === kind && a.status !== 'Closed'; }); }
    var fromVisit = openFrom('visit'), fromPip = openFrom('pip');
    /* An item can come from a plan without being the subject's own action plan:
       HR gets work off a plan too. Only the employee on the plan sees that line. */
    var myPlanActions = fromPip.filter(function (a) { var x = D.pip(a.from); return x && x.emp === me.id; });

    var body =
      (myPlanActions.length ? APP.callout('<b>' + myPlanActions.length + ' of these are the action plan on your ' + esc(APP.term('pipShort')) + '.</b> They are the same items as on the plan, so closing one here ticks it there.', 'is-warning', 'clipboard-check') : '') +
      (fromVisit.length ? APP.callout('<b>' + fromVisit.length + ' of these came from a ' + esc(APP.term('visit').toLowerCase()) + '.</b> ' + esc(P(fromVisit[0].by).name) + ' assigned them during the walk-through, so they arrive here with an owner and a date already on them.', 'is-info', 'building-2') : '') +
      APP.hint('One list. Anything anyone assigns you, from a conversation, a visit, a plan or an evaluation, shows up here.', 'list-checks') +
      APP.glance([
        [mine.filter(function (a) { return a.status !== 'Closed'; }).length, 'Open for you'],
        [mine.filter(function (a) { return a.status === 'Overdue'; }).length, 'Overdue', mine.some(function (a) { return a.status === 'Overdue'; }) ? 'is-bad' : 'is-good'],
        [fromPip.length, 'From a plan', fromPip.length ? 'is-warn' : ''],
        [fromVisit.length, 'From a ' + APP.term('visit').toLowerCase(), fromVisit.length ? 'is-warn' : ''],
        [mine.filter(function (a) { return a.status === 'Closed'; }).length, 'Closed', 'is-good']
      ]) +
      '<section class="card flush-card">' +
      APP.table([{ t: 'To do', w: '38%' }, { t: 'Owner' }, { t: 'Came from' }, { t: 'Assigned by' }, { t: 'Due' }, { t: 'Status' }, { t: '' }],
        rows.map(function (a) {
          return { cells: [
            '<span class="cell-strong">' + esc(a.t) + '</span><span class="cell-sub">' + esc(a.id) + (a.notes.length ? ' · ' + a.notes.length + ' note' + (a.notes.length > 1 ? 's' : '') : '') + '</span>',
            APP.personLine(a.owner, false, 26),
            '<span class="cell-strong">' + esc(sourceLabel(a.fromKind)) + '</span><span class="cell-sub">' + sourceLink(a) + '</span>',
            APP.personLine(a.by, false, 26),
            esc(a.due.replace(/^\w+ /, '')) + (a.closedOn ? '<span class="cell-sub">closed ' + esc(a.closedOn.replace(/^\w+ /, '')) + '</span>' : ''),
            APP.statusBadge(a.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing here.' }) + '</section>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['To-dos', '#/todos']],
      title: APP.is('employee') ? 'My to-dos' : 'To-dos',
      desc: 'Everything assigned to you, and everything you have assigned.',
      tabs: tabsFor(tab), body: body
    });
  };

  var A = APP.ACT;
  A['open-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    var canClose = a.status !== 'Closed' && (a.owner === APP.me().id || a.by === APP.me().id || APP.isHR());
    APP.dialog({
      title: a.t, sub: a.id + ' · ' + sourceLabel(a.fromKind) + ' ' + a.from,
      body: APP.dataList([
        ['Owner', APP.personLine(a.owner, false, 26, false)],
        ['Assigned by', APP.personLine(a.by, false, 26, false)],
        ['Due', esc(a.due)],
        ['Status', APP.statusBadge(a.status)],
        ['Came from', sourceLink(a) + ' <span class="mini-note">' + esc(sourceLabel(a.fromKind)) + '</span>'],
        [APP.term('site'), esc(D.siteName(a.site))]
      ]) +
        '<h3 class="section-label">Notes</h3>' +
        (a.notes.length ? '<div class="wq">' + a.notes.map(function (n) {
          return '<div class="wq-row"><span class="wq-ic">' + ic('message-square-text', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(n.t) + '</span><span class="wq-s">' + esc(P(n.by).name) + ' · ' + esc(n.on) + '</span></div></div>';
        }).join('') + '</div>' : '<p class="mini-note">None yet.</p>') +
        (canClose ? APP.field('Add a note', '<textarea class="textarea" data-input="ai-note" placeholder="What you did, or where it stands."></textarea>') : ''),
      footer: canClose
        ? APP.btn('Add note', 'btn-surface', 'plus', 'data-act="note-action" data-id="' + a.id + '"') +
          APP.btn('Mark complete', 'btn-solid', 'check', 'data-act="close-action" data-id="' + a.id + '"')
        : APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"')
    });
  };
  APP.INPUT['ai-note'] = function (el) { S.f.aiNote = el.value; };
  A['note-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    if (!S.f.aiNote) { APP.toast('Nothing to add', 'Write a note first.', 'warning'); return; }
    a.notes.push({ on: D.TODAY.replace(/^\w+ /, ''), by: APP.me().id, t: S.f.aiNote }); S.f.aiNote = '';
    APP.closeOverlay(); APP.rerender(); APP.toast('Note added', esc(P(a.by).name.split(' ')[0]) + ' can see it.');
  };
  A['close-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    a.status = 'Closed'; a.closedOn = D.TODAY;
    /* An item from an improvement plan is the same thing as the ticked action on
       the plan itself, so closing it here ticks it there. */
    if (a.fromKind === 'pip' && APP.pipSyncFromTodo) APP.pipSyncFromTodo(a);
    APP.closeOverlay(); APP.rerender();
    APP.toast('Marked complete', P(a.by).name.split(' ')[0] + ' will see it closed on ' +
      (a.fromKind === 'visit' ? 'the visit action plan.' : a.fromKind === 'pip' ? 'the plan, ticked off.' : 'their list.'));
  };
})();
