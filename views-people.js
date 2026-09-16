/* skyPerformance: E1 hierarchy, rosters and the employee record. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function roster() {
    var cms = APP.scopeCms(), pick = S.f.orgPick || 'all';
    var people = APP.people().filter(function (p) {
      if (pick === 'all') return true;
      if (pick.indexOf('CM-') === 0) return p.cm === pick;
      if (pick.indexOf('RGN-') === 0) return p.cm && D.cm(p.cm).region === pick;
      return p.cm === pick.split('|')[0] && p.dept === pick.split('|')[1];
    });
    var q = (S.f.pq || '').toLowerCase();
    if (q) people = people.filter(function (p) { return (p.name + ' ' + p.title + ' ' + p.dept).toLowerCase().indexOf(q) >= 0; });

    var tree = '<div class="org-tree">' +
      '<button class="ot-row' + (pick === 'all' ? ' is-on' : '') + '" data-act="org-pick" data-k="all">' + ic('network', 16) + esc(D.ORG) + '<span class="ot-count">' + APP.people().length + '</span></button>' +
      D.REGIONS.filter(function (r) { return D.COMMUNITIES.some(function (c) { return c.region === r.id && cms.indexOf(c.id) >= 0; }); }).map(function (r) {
        var out = '<button class="ot-row is-l2' + (pick === r.id ? ' is-on' : '') + '" data-act="org-pick" data-k="' + r.id + '">' + ic('map', 16) + esc(r.name) + '</button>';
        D.COMMUNITIES.filter(function (c) { return c.region === r.id && cms.indexOf(c.id) >= 0; }).forEach(function (c) {
          out += '<button class="ot-row is-l2' + (pick === c.id ? ' is-on' : '') + '" data-act="org-pick" data-k="' + c.id + '" style="padding-left:var(--space-6)">' + ic('building-2', 16) + esc(c.name) +
            '<span class="ot-count">' + APP.people().filter(function (p) { return p.cm === c.id; }).length + '</span></button>';
          if (pick === c.id || (pick.indexOf('|') > 0 && pick.split('|')[0] === c.id)) {
            D.DEPTS.filter(function (d) { return APP.people().some(function (p) { return p.cm === c.id && p.dept === d; }); }).forEach(function (d) {
              out += '<button class="ot-row is-l3' + (pick === c.id + '|' + d ? ' is-on' : '') + '" data-act="org-pick" data-k="' + c.id + '|' + d + '">' + ic('users', 16) + esc(d) + '</button>';
            });
          }
        });
        return out;
      }).join('') + '</div>';

    return '<div class="org-grid">' +
      '<section class="card">' + APP.panelHead('Hierarchy', 'Click a level to scope the roster.') + tree +
      '<p class="mini-note" style="margin-top:var(--space-4)">Branches outside your scope are not listed. That is the E1 rule: a leader at any level sees only their branch.</p>' +
      '</section>' +
      '<section class="card flush-card">' +
      '<div class="table-toolbar"><div class="search" style="min-width:240px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="pq" value="' + esc(S.f.pq || '') + '" placeholder="Name, title or department"></div>' +
      '<span class="toolbar-spacer"></span>' +
      APP.btn('Export roster', 'btn-surface', 'download', 'data-act="export" data-what="The roster as CSV"', 'is-sm') + '</div>' +
      APP.table([{ t: 'Person' }, { t: 'Title' }, { t: 'Community' }, { t: 'Department' }, { t: 'Hired' }, { t: 'Open items', num: true }, { t: 'Last coached' }, { t: '' }],
        people.map(function (p) {
          var forms = D.FORMS.filter(function (f) { return f.emp === p.id; });
          var acts = D.ACTIONS.filter(function (a) { return a.owner === p.id && a.status !== 'Closed'; });
          return { cells: [
            APP.personLine(p, false, 28), esc(p.title), esc(D.cmName(p.cm)), esc(p.dept), esc(p.hired),
            acts.length ? '<span class="count-pill">' + acts.length + '</span>' : '0',
            forms.length ? esc(forms[0].date) : '<span class="mini-note">Never</span>',
            APP.btn('Open record', 'btn-surface', null, 'data-act="goto-person" data-id="' + p.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nobody matches.' }) + '</section></div>';
  }

  function profile(id) {
    var p = P(id), tab = S.route[2] || 'overview';
    if (!APP.inScope(id)) return APP.page({ crumbs: [['Home', '#/home'], ['People', '#/people']], title: 'Outside your scope', desc: '', body: APP.emptyState('users', 'Not in your branch', 'Records are bound to the hierarchy path they were created under. Switch role to see a different branch.', APP.btn('Back to people', 'btn-solid', null, 'data-act="goto" data-href="#/people"')) });
    var forms = D.FORMS.filter(function (f) { return f.emp === id; });
    var acts = D.ACTIONS.filter(function (a) { return a.owner === id; });
    var cases = D.CASES.filter(function (c) { return c.emp === id; });
    var tasks = D.TASKS.filter(function (t) { return t.emp === id; });
    var sigs = D.EMP_SIGNALS[id] || [];
    var active = cases.filter(function (c) { return c.status === 'Active' || c.status === 'Pending approval'; });

    var head = '<section class="card"><div class="profile-head">' + APP.av(p, 56) +
      '<div class="ph-id"><div class="ph-name">' + esc(p.name) + '</div><div class="ph-meta">' + esc(p.title) + ' · ' + esc(D.cmName(p.cm)) + ' · ' + esc(p.dept) + ' · hired ' + esc(p.hired) + '</div>' +
      '<div class="ph-path">' + esc(APP.crumbPath(p.cm)) + ' / ' + esc(p.dept) + ' / ' + esc(p.name) + '</div></div>' +
      '<div class="ph-stats">' +
      '<div class="ph-stat"><span class="ph-stat-v">' + forms.length + '</span><span class="ph-stat-l">Documented forms</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + acts.filter(function (a) { return a.status !== 'Closed'; }).length + '</span><span class="ph-stat-l">Open items</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + active.length + '</span><span class="ph-stat-l">Active cases</span></div>' +
      '</div></div>' +
      (APP.canRunForms() || APP.canCase() ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        (APP.canRunForms() ? APP.btn('Run a form', 'btn-solid', 'circle-play', 'data-act="pick-form-for" data-emp="' + id + '"', 'is-sm') : '') +
        (APP.canCase() ? APP.btn('Open a case', 'btn-surface', 'gavel', 'data-act="start-case" data-emp="' + id + '"', 'is-sm') : '') +
        (APP.isHR() ? APP.btn('Employee file export', 'btn-surface', 'package', 'data-act="file-export"', 'is-sm') : '') +
        '</div>' : '') + '</section>';

    var tabs = APP.tabs([
      ['overview', 'Overview', '#/people/' + id],
      ['coaching', 'Coaching', '#/people/' + id + '/coaching', forms.length],
      ['actions', 'Action items', '#/people/' + id + '/actions', acts.length],
      ['cases', 'Cases', '#/people/' + id + '/cases', cases.length],
      ['file', 'Full file', '#/people/' + id + '/file']
    ], tab);

    var body;
    if (tab === 'coaching') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Date' }, { t: 'Form' }, { t: 'By' }, { t: 'Outcome' }, { t: 'Summary' }, { t: '' }],
        forms.map(function (f) {
          return { cells: [esc(f.date), esc(D.formType(f.ft).name), APP.personLine(f.by, null, 28), APP.statusBadge(f.outcome),
            '<span class="mini-note">' + esc(f.summary.slice(0, 100)) + '...</span>', APP.btn('Open', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm')] };
        }), { empty: 'Nothing documented yet.' }) + '</section>' +
        '<section class="card">' + APP.panelHead('Open touch points', 'What the engine says is due on this person.') +
        '<div class="wq">' + (tasks.filter(function (t) { return t.status !== 'Completed'; }).length ? tasks.filter(function (t) { return t.status !== 'Completed'; }).map(APP.taskRow).join('') : '<div class="table-empty">Nothing due.</div>') + '</div></section>';
    } else if (tab === 'actions') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Item' }, { t: 'From' }, { t: 'Due' }, { t: 'Status' }, { t: '' }],
        acts.map(function (a) {
          return { cells: ['<span class="cell-strong">' + esc(a.t) + '</span><span class="cell-sub">' + esc(a.id) + '</span>', esc(a.from), esc(a.due), APP.statusBadge(a.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="open-action" data-id="' + a.id + '"', 'is-sm')] };
        }), { empty: 'Nothing assigned.' }) + '</section>';
    } else if (tab === 'cases') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Case' }, { t: 'Track' }, { t: 'Step' }, { t: 'Opened' }, { t: 'Status' }, { t: '' }],
        cases.map(function (c) {
          return { cells: ['<span class="cell-strong">' + esc(c.id) + '</span>', esc(D.TRACKS.filter(function (t) { return t.key === c.track; })[0].name) + '<span class="cell-sub">' + esc(c.sub) + '</span>',
            esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name), esc(c.opened), APP.statusBadge(c.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm')] };
        }), { empty: 'No cases on this record.' }) + '</section>' +
        APP.callout('An expired or rescinded step stays visible here forever. It just stops counting toward the next step.', 'is-info', 'history');
    } else if (tab === 'file') {
      body = APP.callout('This is what an employee file export contains, in the order it is packaged. Every item renders as its original document.', 'is-info', 'package') +
        '<section class="card">' + APP.panelHead('File contents', esc(p.name) + ' · ' + forms.length + ' forms, ' + acts.length + ' action items, ' + cases.length + ' cases') +
        APP.table([{ t: 'Item' }, { t: 'Id' }, { t: 'Date' }, { t: 'Type' }], []
          .concat(forms.map(function (f) { return { cells: [esc(D.formType(f.ft).name), '<span class="cell-id">' + esc(f.id) + '</span>', esc(f.date), 'Coaching form'] }; }))
          .concat(cases.map(function (c) { return { cells: [esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name), '<span class="cell-id">' + esc(c.id) + '</span>', esc(c.opened), 'Performance case'] }; }))
          .concat(acts.map(function (a) { return { cells: [esc(a.t), '<span class="cell-id">' + esc(a.id) + '</span>', esc(a.due), 'Action item'] }; }))) +
        (APP.isHR() || APP.isAdmin() ? '<div style="margin-top:var(--space-4)">' + APP.btn('Build the export package', 'btn-solid', 'package', 'data-act="file-export"', 'is-sm') + '</div>'
          : '<p class="mini-note" style="margin-top:var(--space-4)">Only HR and Employee Relations can build the package. Everyone else reads the items individually.</p>') +
        '</section>';
    } else {
      body = '<div class="split-2"><div class="stack-4">' +
        (active.length ? APP.callout('<b>' + esc(D.STEPS.filter(function (s) { return s.key === active[0].step; })[0].name) + ' ' + (active[0].status === 'Active' ? 'is active' : 'is pending approval') + ' on this record.</b> <button class="rowlink" data-act="goto" data-href="#/cases/' + active[0].id + '">Open ' + esc(active[0].id) + '</button>.', 'is-warning', 'gavel') : '') +
        '<section class="card">' + APP.panelHead('Signals', 'What the coaching layer subscribes to for this person.') +
        (sigs.length ? '<div class="snap">' + sigs.map(function (s) {
          var sig = D.signal(s[0]), good = D.onTarget(s[0], s[1]);
          return '<div class="snap-row"><span class="snap-name">' + esc(sig.name) + '<span class="snap-id">' + esc(s[0]) + '</span></span><span class="snap-val">' + sig.fmt(s[1]) + '</span>' +
            '<span class="snap-tgt">Target ' + sig.fmt(sig.target) + '</span>' + APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>';
        }).join('') + '</div>' : '<p class="mini-note">No signals tracked for this role.</p>') + '</section>' +
        '<section class="card">' + APP.panelHead('Recent documentation', 'Most recent first.') +
        '<div class="wq">' + (forms.length ? forms.slice(0, 4).map(function (f) {
          return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : f.outcome === 'Recognition' ? ' is-good' : '') + '">' + ic(D.formType(f.ft).ic, 16) + '</span>' +
            '<div class="wq-main"><span class="wq-t">' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(f.summary.slice(0, 100)) + '...</span></div>' +
            '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm') + '</div></div>';
        }).join('') : '<div class="table-empty">Nothing documented yet.</div>') + '</div></section></div>' +
        '<div class="stack-4">' +
        '<section class="card">' + APP.panelHead('Identity') +
        APP.dataList([
          ['Reports to', p.mgr ? APP.personLine(p.mgr, null, 24, false) : 'Not set'],
          ['Community', esc(D.cmName(p.cm))],
          ['Department', esc(p.dept)],
          ['Hired', esc(p.hired)],
          ['Hierarchy path', '<span class="cell-id">' + esc(APP.crumbPath(p.cm)) + '</span>']
        ]) + '</section>' +
        '<section class="card">' + APP.panelHead('Open action items') +
        '<div class="wq">' + (acts.filter(function (a) { return a.status !== 'Closed'; }).length ? acts.filter(function (a) { return a.status !== 'Closed'; }).map(APP.actionRow).join('') : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
        '</div></div>';
    }
    return APP.page({
      crumbs: [['Home', '#/home'], ['People', '#/people'], [p.name, '#/people/' + id]],
      title: p.name, desc: p.title + ' · ' + D.cmName(p.cm), tabs: tabs, body: head + body
    });
  }

  APP.VIEWS.people = function (r) {
    if (r[1] && r[1].indexOf('?') < 0 && D.PEOPLE.some(function (p) { return p.id === r[1]; })) return profile(r[1]);
    return APP.page({
      crumbs: [['Home', '#/home'], ['People', '#/people']],
      title: APP.isAdmin() ? 'People and hierarchy' : APP.is('manager') ? 'My team' : 'People',
      desc: 'Every record is permanently bound to the hierarchy path it was created under.',
      body: roster()
    });
  };
  APP.ACT['org-pick'] = function (el) { S.f.orgPick = el.getAttribute('data-k'); APP.rerender(); };
  APP.INPUT.pq = function (el) { S.f.pq = el.value; var c = el.selectionStart; APP.rerender(); var n = document.querySelector('[data-input="pq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); } };
  APP.ACT['pick-form-for'] = function (el) {
    var emp = el.getAttribute('data-emp');
    APP.dialog({
      title: 'Run a form on ' + P(emp).name, sub: 'Ad hoc. It still binds to the hierarchy and still counts toward completion.', size: 'is-wide',
      body: '<div class="card-grid">' + D.FORM_TYPES.filter(function (t) { return t.fam !== 'ops'; }).map(function (t) {
        return '<button class="card vs-card" data-act="run-form" data-ft="' + t.id + '" data-emp="' + emp + '"><div class="vs-head"><span class="vs-ic">' + ic(t.ic, 18) + '</span><span class="vs-name">' + esc(t.name) + '</span></div><p class="mini-note">' + esc(t.desc) + '</p></button>';
      }).join('') + '</div>'
    });
  };
})();
