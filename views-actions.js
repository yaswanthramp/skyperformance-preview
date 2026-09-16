/* skyPerformance: E6 action items and follow up. Nothing is orphaned. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    var all = APP.actions();
    return APP.tabs([
      ['open', 'Open', '#/actions', all.filter(function (a) { return a.status !== 'Closed'; }).length],
      ['mine', APP.is('frontline') ? 'Overdue' : 'Owned by me', '#/actions/mine', APP.is('frontline') ? all.filter(function (a) { return a.status === 'Overdue'; }).length : all.filter(function (a) { return a.owner === APP.me().id && a.status !== 'Closed'; }).length],
      ['closed', 'Closed', '#/actions/closed', all.filter(function (a) { return a.status === 'Closed'; }).length],
      ['all', 'Everything', '#/actions/all', all.length]
    ], active);
  }

  APP.VIEWS.actions = function (r) {
    var tab = r[1] || 'open', me = APP.me();
    var list = APP.actions().filter(function (a) {
      if (tab === 'open') return a.status !== 'Closed';
      if (tab === 'mine') return APP.is('frontline') ? a.status === 'Overdue' : (a.owner === me.id && a.status !== 'Closed');
      if (tab === 'closed') return a.status === 'Closed';
      return true;
    });
    var carried = APP.actions().filter(function (a) { return a.carried; });
    var body =
      APP.callout('An action item lives on two lists at once: the owner to do list, and the next form for that employee. It stays on both until someone closes it, which is what stops a follow up from quietly evaporating.', 'is-info', 'list-checks') +
      (carried.length && tab !== 'closed' ? APP.callout('<b>' + carried.length + ' item has been carried forward.</b> Carried means it was still open when the next form ran, so it printed on that form too. A second carry is what the trend engine watches for.', 'is-warning', 'history') : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Action item' }, { t: 'Owner' }, { t: 'Raised by' }, { t: 'From' }, { t: 'Due' }, { t: 'Status' }, { t: '' }],
        list.map(function (a) {
          return { cells: [
            '<span class="cell-strong">' + esc(a.t) + '</span><span class="cell-sub">' + esc(a.id) + (a.carried ? ' · carried forward' : '') + (a.notes.length ? ' · ' + a.notes.length + ' follow up note' + (a.notes.length > 1 ? 's' : '') : '') + '</span>',
            APP.personLine(a.owner, null, 28),
            APP.personLine(a.by, null, 28),
            '<button class="rowlink" data-act="' + (a.from.indexOf('SV') === 0 ? 'goto" data-href="#/visits/' + a.from : 'open-form" data-id="' + a.from) + '">' + esc(a.from) + '</button>',
            esc(a.due) + (a.closedOn ? '<span class="cell-sub">closed ' + esc(a.closedOn) + '</span>' : ''),
            APP.statusBadge(a.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing here.' }) + '</section>';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Action items', '#/actions']],
      title: APP.is('frontline') ? 'What you agreed to' : 'Action items',
      desc: APP.is('frontline') ? 'Each one came from a conversation you were part of.' : 'Owner, due date, status and follow up notes. Carried forward until closed.',
      tabs: tabsFor(tab), body: body
    });
  };

  APP.ACT['open-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    var canClose = a.status !== 'Closed' && (a.owner === APP.me().id || APP.isLeader() || APP.isHR());
    APP.dialog({
      title: a.t, sub: a.id + ' · raised by ' + P(a.by).name + ' on form ' + a.from,
      body: APP.dataList([
        ['Owner', APP.personLine(a.owner, null, 28, false)],
        ['Due', esc(a.due)],
        ['Status', APP.statusBadge(a.status)],
        ['Source', '<button class="rowlink" data-act="' + (a.from.indexOf('SV') === 0 ? 'goto" data-href="#/visits/' + a.from : 'open-form" data-id="' + a.from) + '">' + esc(a.from) + '</button>'],
        ['Community', esc(D.cmName(a.cm))],
        ['Carried forward', a.carried ? 'Yes, it printed on the next form for this employee' : 'No']
      ]) +
        '<h3 class="section-label">Follow up notes</h3>' +
        (a.notes.length ? '<div class="wq">' + a.notes.map(function (n) {
          return '<div class="wq-row"><span class="wq-ic">' + ic('message-square-text', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(n.t) + '</span><span class="wq-s">' + esc(P(n.by).name) + ' · ' + esc(n.on) + '</span></div></div>';
        }).join('') + '</div>' : '<p class="mini-note">No notes yet.</p>') +
        (canClose ? APP.field('Add a note', '<textarea class="textarea" data-input="ai-note" placeholder="What you saw when you checked."></textarea>', 'Notes are kept with the item and appear in the employee file export.') : ''),
      footer: canClose
        ? APP.btn('Add note', 'btn-surface', 'plus', 'data-act="note-action" data-id="' + a.id + '"') + APP.btn('Close this item', 'btn-solid', 'check', 'data-act="close-action-d" data-id="' + a.id + '"')
        : APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"')
    });
  };
  APP.INPUT['ai-note'] = function (el) { S.f.aiNote = el.value; };
  APP.ACT['note-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    if (!S.f.aiNote) { APP.toast('Nothing to add', 'Write a note first.', 'warning'); return; }
    a.notes.push({ on: D.TODAY, by: APP.me().id, t: S.f.aiNote }); S.f.aiNote = '';
    APP.closeOverlay(); APP.rerender(); APP.toast('Note added', 'Kept with ' + a.id + '.');
  };
  APP.ACT['close-action-d'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    a.status = 'Closed'; a.closedOn = D.TODAY;
    APP.closeOverlay(); APP.rerender(); APP.toast('Item closed', a.id + ' will stop printing on forms for ' + P(a.owner).name.split(' ')[0] + '.');
  };
})();
