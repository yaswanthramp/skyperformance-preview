/* skyPerformance: continuous feedback and 360 reviews. Light by design: this is
   the low friction end of the product, and it must not read like documentation. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function visible() {
    var me = APP.me();
    if (APP.is('employee')) return D.FEEDBACK.filter(function (f) { return f.to === me.id || f.from === me.id; });
    if (APP.isHR()) return D.FEEDBACK.slice();
    return D.FEEDBACK.filter(function (f) { return APP.inScope(f.to) || f.to === me.id || f.from === me.id; });
  }
  function reviews360() {
    var me = APP.me();
    if (APP.is('employee')) return D.REVIEWS_360.filter(function (r) { return r.subject === me.id || r.raters.some(function (x) { return x.who === me.id; }); });
    if (APP.isHR()) return D.REVIEWS_360.slice();
    return D.REVIEWS_360.filter(function (r) { return r.subject === me.id || APP.inScope(r.subject) || r.raters.some(function (x) { return x.who === me.id; }); });
  }
  function tabsFor(active) {
    return APP.tabs([
      ['continuous', 'Continuous', '#/feedback', visible().length],
      ['threesixty', '360 reviews', '#/feedback/threesixty', reviews360().length]
    ], active);
  }

  function continuous() {
    var list = visible(), me = APP.me();
    var kind = S.f.fbKind || 'All';
    var shown = list.filter(function (f) { return kind === 'All' || f.kind === kind; });
    var toMe = list.filter(function (f) { return f.to === me.id; }).length;
    return APP.hint('Feedback is a note between two people, not a record. It never attaches to a case and it never scores anything.', 'message-square-text') +
      APP.glance([
        [list.length, 'In the last 30 days'],
        [list.filter(function (f) { return f.kind === 'Praise'; }).length, 'Praise', 'is-good'],
        [list.filter(function (f) { return f.kind === 'Suggestion'; }).length, 'Suggestions'],
        [toMe, 'About you']
      ]) +
      '<div class="filter-bar">' +
      APP.dd('fbKind', [['All', 'Everything'], ['Praise', 'Praise'], ['Suggestion', 'Suggestions']], kind) +
      '<span class="fb-spacer"></span>' +
      APP.btn('Give feedback', 'btn-solid', 'send', 'data-act="fb-new"', 'is-sm') + '</div>' +
      (shown.length ? '<div class="fb-grid">' + shown.map(function (f) {
        return '<section class="card fb-card">' +
          '<div class="fb-top">' + APP.badge(f.kind, f.kind === 'Praise' ? 'is-success' : 'is-info', f.kind === 'Praise' ? 'thumbs-up' : 'lightbulb') +
          '<span class="mini-note">' + esc(f.on) + '</span></div>' +
          '<p class="fb-text">' + esc(f.t) + '</p>' +
          '<div class="fb-meta">' + (f.vis.indexOf('Anonymous') === 0 ? '<span class="avatar is-neutral" style="width:22px;height:22px;font-size:10px">?</span><span>Anonymous</span>' : APP.av(f.from, 22) + '<span>' + esc(P(f.from).name) + '</span>') +
          ic('arrow-right', 14) + APP.av(f.to, 22) + '<span>' + esc(P(f.to).name) + '</span></div>' +
          '<span class="mini-note">' + ic('eye', 12) + ' ' + esc(f.vis) + '</span>' +
          '</section>';
      }).join('') + '</div>'
        : APP.emptyState('message-square-text', 'Nothing yet', 'Feedback works when it is frequent and small. Start with one.', APP.btn('Give feedback', 'btn-solid', 'send', 'data-act="fb-new"'))) +
      APP.why('Why this is separate from coaching', '<p>A coaching form is a record: attributed, immutable, and admissible in a case. Feedback is not. Keeping them apart is what lets people give feedback freely, and it is why nothing written here can be pulled into a performance case.</p>');
  }

  function threeSixty() {
    var list = reviews360(), me = APP.me();
    var asRater = list.filter(function (r) { return r.raters.some(function (x) { return x.who === me.id && x.state === 'Waiting'; }); });
    return APP.hint('Ratings are aggregated by theme and never attributed. A review only opens once it has four or more responses.', 'users-round') +
      (asRater.length ? APP.callout('<b>' + asRater.length + ' review is waiting on you.</b> Your individual answers are never shown to the subject.', 'is-warning', 'clock') : '') +
      APP.glance([
        [list.length, 'Reviews in scope'],
        [list.filter(function (r) { return r.status === 'In progress'; }).length, 'In progress'],
        [asRater.length, 'Waiting on you', asRater.length ? 'is-warn' : 'is-good'],
        [list.filter(function (r) { return r.status === 'Complete'; }).length, 'Complete']
      ]) +
      (APP.is('employee') ? '' : '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Start a 360', 'btn-solid', 'plus', 'data-act="r360-new"', 'is-sm') + '</div>') +
      list.map(function (r) {
        var done = r.raters.filter(function (x) { return x.state === 'Submitted'; }).length;
        var pct = Math.round(done / r.raters.length * 100);
        return '<section class="card">' +
          APP.panelHead(esc(P(r.subject).name), esc(r.id) + ' · ' + esc(r.cycle) + ' · due ' + esc(r.due),
            APP.statusBadge(r.status)) +
          '<div class="split-2">' +
          '<div><div class="goal-bar" style="margin-bottom:var(--space-4)">' + APP.progress(pct) + '<span class="goal-pct">' + done + '/' + r.raters.length + '</span></div>' +
          '<div class="chain-list">' + r.raters.map(function (x) {
            return '<div class="ch-row"><span class="ch-state">' + (x.state === 'Submitted' ? ic('circle-check', 18) : ic('hourglass', 18)) + '</span>' +
              '<div class="ch-main"><span class="ch-who">' + (x.who === me.id ? esc(P(x.who).name) + ' (you)' : esc(P(x.who).name)) + '</span><span class="ch-role">' + esc(x.rel) + '</span></div>' +
              '<span class="ch-when">' + (x.on ? esc(x.on) : (x.who === me.id ? APP.btn('Respond', 'btn-solid', null, 'data-act="r360-respond" data-id="' + r.id + '"', 'is-sm') : APP.statusBadge('Waiting'))) + '</span></div>';
          }).join('') + '</div></div>' +
          '<div>' + (done >= 4
            ? '<div class="sec-label">Themes</div>' + APP.bars(r.themes, function (v) { return v.toFixed(1); }) +
              '<p class="mini-note" style="margin-top:var(--space-3)">Out of 5. No individual answer is shown, ever.</p>'
            : APP.emptyState('lock', 'Locked until four responses', 'Themes open at four so nobody can be identified from the numbers.', '')) +
          '</div></div></section>';
      }).join('') +
      (list.length ? '' : APP.emptyState('users-round', 'No 360 reviews', 'A 360 runs once a cycle for anyone who manages people.', ''));
  }

  APP.VIEWS.feedback = function (r) {
    var tab = r[1] || 'continuous';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Feedback', '#/feedback']],
      title: 'Feedback', desc: 'Short notes between colleagues, and the once a cycle 360. Neither is a record.',
      tabs: tabsFor(tab), body: tab === 'threesixty' ? threeSixty() : continuous()
    });
  };

  var A = APP.ACT;
  /* single choice within a row of rating buttons */
  A['pick-one'] = function (el) {
    var row = el.closest('.q-score');
    row.querySelectorAll('.q-btn').forEach(function (b) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
    el.classList.add('is-on', 'is-yes'); el.setAttribute('aria-pressed', 'true');
  };
  A['fb-new'] = function () {
    var pool = D.PEOPLE.filter(function (p) { return p.id !== APP.me().id; });
    APP.dialog({
      title: 'Give feedback', sub: 'Anyone, any time. Two sentences is plenty.',
      body: APP.field('To', APP.dd('fb-to', pool.map(function (p) { return [p.id, p.name + ', ' + p.title]; }), pool[0].id, 'dd-block'), 'Anyone in the company, not just your team.', true) +
        APP.field('Kind', APP.dd('fb-kind', [['Praise', 'Praise'], ['Suggestion', 'Suggestion']], 'Praise', 'dd-block'), null, true) +
        APP.field('What you saw', '<textarea class="textarea" data-input="fb-t" placeholder="Picked up two escalations on Friday without being asked, and closed both the same day."></textarea>', 'Specific beats generous.', true) +
        APP.field('Visibility', APP.dd('fb-vis', [['named', 'Named, visible to them and their manager'], ['anon', 'Anonymous to the recipient']], 'named', 'dd-block'), 'Anonymous is available for upward feedback.'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send', 'btn-solid', 'send', 'data-act="fb-send"')
    });
  };
  APP.INPUT['fb-t'] = function (el) { S.f.fbT = el.value; };
  A['fb-send'] = function () {
    var to = S.f['fb-to'] || D.PEOPLE[0].id;
    D.FEEDBACK.unshift({ id: 'FB-' + (930 + Math.floor(Math.random() * 60)), to: to, from: APP.me().id, on: D.TODAY,
      kind: S.f['fb-kind'] || 'Praise', vis: S.f['fb-vis'] === 'anon' ? 'Anonymous to the recipient' : 'Visible to ' + P(to).name.split(' ')[0] + ' and their manager',
      t: S.f.fbT || 'Picked up two escalations on Friday without being asked.' });
    S.f.fbT = '';
    APP.closeAll(); APP.rerender(); APP.toast('Sent', P(to).name.split(' ')[0] + ' sees it now. It is not a record and it never enters a case.');
  };
  A['r360-new'] = function () {
    APP.dialog({
      title: 'Start a 360 review', sub: 'Raters come from the org chart. You can add or remove.',
      body: APP.field('Subject', APP.dd('r3-who', APP.people().filter(function (p) { return D.reports(p.id).length; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), 'priya', 'dd-block'), null, true) +
        APP.field('Due', APP.dd('r3-due', [['Fri 9 Oct 2026', 'Fri 9 Oct 2026'], ['Fri 30 Oct 2026', 'Fri 30 Oct 2026']], 'Fri 9 Oct 2026', 'dd-block'), null, true) +
        APP.callout('Themes stay locked until four people respond, so nobody can be identified from the numbers.', 'is-info', 'lock'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Send invitations', 'btn-solid', 'send', 'data-act="toast" data-t="Invitations sent" data-b="Raters get one reminder at the halfway point and one the day before it closes."')
    });
  };
  A['r360-respond'] = function (el) {
    var r = D.REVIEWS_360.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
    APP.dialog({
      title: '360 review: ' + P(r.subject).name, sub: 'Five themes, one comment. About four minutes.', size: 'is-wide',
      body: APP.callout('Your individual answers are never shown to ' + esc(P(r.subject).name.split(' ')[0]) + ', only the theme averages once four people have responded.', 'is-info', 'lock') +
        r.themes.map(function (t) {
          return '<div class="q-row"><span class="q-text">' + esc(t[0]) + '</span><span class="q-score">' +
            [1, 2, 3, 4, 5].map(function (n) { return '<button class="q-btn" data-act="pick-one">' + n + '</button>'; }).join('') + '</span></div>';
        }).join('') +
        APP.field('One thing they should keep doing', '<textarea class="textarea"></textarea>') +
        APP.field('One thing they should change', '<textarea class="textarea"></textarea>'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Submit response', 'btn-solid', 'send', 'data-act="r360-submitted" data-id="' + r.id + '"')
    });
  };
  A['r360-submitted'] = function (el) {
    var r = D.REVIEWS_360.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
    r.raters.forEach(function (x) { if (x.who === APP.me().id) { x.state = 'Submitted'; x.on = D.TODAY; } });
    APP.closeAll(); APP.rerender(); APP.toast('Response submitted', 'Anonymous in the aggregate. Nobody sees your individual answers.');
  };
})();
