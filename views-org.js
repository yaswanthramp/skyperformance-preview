/* skyPerformance: the org chart. Drawn as a chart, not a list, from the reporting
   line the HRIS exports. Everything on this screen is read only: skyPerformance
   consumes the hierarchy, it does not own it. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  /* which nodes are expanded. Defaults to the signed in person's line. */
  function defaults() {
    var open = {};
    D.path(APP.me().id).forEach(function (p) { open[p.id] = true; });
    return open;
  }
  function open() { if (!S.f.orgOpen) S.f.orgOpen = defaults(); return S.f.orgOpen; }
  /* The chart always starts at the top of the company. An org chart is a
     directory: who reports to whom is not confidential, what is on someone's
     record is. Out of scope nodes render dimmed and their record is closed. */
  function root() { return 'nadine'; }

  function stat(p) {
    var forms = D.FORMS.filter(function (f) { return f.emp === p.id; }).length;
    var acts = D.ACTIONS.filter(function (a) { return a.owner === p.id && a.status !== 'Closed'; }).length;
    var cases = D.CASES.filter(function (c) { return c.emp === p.id && (c.status === 'Open' || c.status === 'Pending approval'); }).length;
    var tasks = D.TASKS.filter(function (t) { return t.emp === p.id && t.status !== 'Completed'; }).length;
    return { forms: forms, acts: acts, cases: cases, tasks: tasks };
  }

  function node(p, depth) {
    var kids = D.reports(p.id), isOpen = !!open()[p.id], st = stat(p);
    var inScope = APP.inScope(p.id), me = p.id === APP.me().id;
    var sel = S.f.orgSel === p.id;
    var h = '<li class="oc-li">' +
      '<div class="oc-node' + (me ? ' is-me' : '') + (sel ? ' is-sel' : '') + (inScope ? '' : ' is-out') + '">' +
      '<button class="oc-card" data-act="org-select" data-id="' + p.id + '" aria-expanded="' + isOpen + '">' +
      APP.av(p, 34) +
      '<span class="oc-text"><span class="oc-name">' + esc(p.name) + (me ? ' <span class="oc-you">you</span>' : '') + '</span>' +
      '<span class="oc-title">' + esc(p.title) + '</span>' +
      '<span class="oc-where">' + esc(p.loc ? D.locName(p.loc) + ' · ' + p.dept : p.dept) + '</span></span>' +
      (st.cases ? '<span class="oc-flag is-danger" title="Open performance case">' + ic('gavel', 12) + '</span>'
        : st.acts ? '<span class="oc-flag is-warn" title="' + st.acts + ' open action items">' + st.acts + '</span>' : '') +
      '</button>' +
      (kids.length ? '<button class="oc-toggle" data-act="org-toggle" data-id="' + p.id + '" aria-label="' + (isOpen ? 'Collapse' : 'Expand') + ' ' + esc(p.name) + '">' +
        ic(isOpen ? 'chevron-up' : 'chevron-down', 14) + '<span>' + kids.length + '</span></button>' : '') +
      '</div>';
    if (kids.length && isOpen) {
      h += '<ul class="oc-children">' + kids.map(function (k) { return node(k, depth + 1); }).join('') + '</ul>';
    }
    return h + '</li>';
  }

  function chart() {
    var r = P(root());
    return '<div class="oc-scroll"><ul class="oc-tree">' + node(r, 0) + '</ul></div>';
  }

  /* right rail: the selected person */
  function rail() {
    var id = S.f.orgSel || APP.me().id, p = P(id);
    var kids = D.reports(id), st = stat(p), line = D.path(id);
    var inScope = APP.inScope(id);
    return '<aside class="stack-4">' +
      '<section class="card">' +
      '<div class="oc-rail-head">' + APP.av(p, 48) +
      '<div><div class="ph-name t-5">' + esc(p.name) + '</div><div class="ph-meta">' + esc(p.title) + '</div></div></div>' +
      APP.dataList([
        ['Location', esc(D.locName(p.loc))],
        ['Department', esc(p.dept)],
        ['Reports to', p.mgr ? APP.personLine(p.mgr, false, 24, false) : 'Nobody, top of the chart'],
        ['Direct reports', String(kids.length)],
        ['Started', esc(p.hired)]
      ]) +
      '<div class="path-block"><span class="path-label">Hierarchy path</span><span class="cell-id">' + esc(APP.hierPath(p.loc, p.dept)) + '</span></div>' +
      '</section>' +
      (inScope ? '<section class="card">' + APP.panelHead('On the record', 'Everything documented about this person.') +
        '<div class="ph-stats">' +
        '<div class="ph-stat"><span class="ph-stat-v">' + st.forms + '</span><span class="ph-stat-l">Forms</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + st.acts + '</span><span class="ph-stat-l">Open items</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + st.tasks + '</span><span class="ph-stat-l">Due</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + st.cases + '</span><span class="ph-stat-l">Cases</span></div>' +
        '</div>' +
        '<div class="stack-2" style="margin-top:var(--space-4)">' +
        APP.btn('Open the full record', 'btn-solid', 'circle-arrow-right', 'data-act="goto" data-href="#/org/' + p.id + '"', 'is-sm') +
        (APP.canRunForms() && p.id !== APP.me().id ? APP.btn('Run a form', 'btn-surface', 'circle-play', 'data-act="start-form" data-emp="' + p.id + '"', 'is-sm') : '') +
        '</div></section>'
        : '<section class="card">' + APP.callout('This person is outside your reporting line, so you can see where they sit but not what is on their record. HR sees the whole chart.', 'is-info', 'eye-off') + '</section>') +
      '<section class="card">' + APP.panelHead('Reporting line', 'Straight up the chart.') +
      '<div class="oc-line">' + line.map(function (x, i) {
        return '<button class="oc-line-row' + (x.id === id ? ' is-on' : '') + '" data-act="org-select" data-id="' + x.id + '" style="padding-left:' + (i * 14 + 8) + 'px">' +
          (i ? '<span class="oc-line-tick">' + ic('corner-down-right', 14) + '</span>' : '<span class="oc-line-tick">' + ic('building-2', 14) + '</span>') +
          APP.av(x, 22) + '<span class="oc-line-name">' + esc(x.name) + '<span class="oc-line-title">' + esc(x.title) + '</span></span></button>';
      }).join('') + '</div></section>' +
      '</aside>';
  }

  /* ---------------- the person record ---------------- */
  function record(id) {
    var p = P(id), tab = S.route[2] || 'overview';
    if (!APP.inScope(id)) {
      return APP.page({ crumbs: [['Home', '#/home'], ['Org chart', '#/org'], [p.name, '#']], title: p.name, desc: p.title + ' · ' + D.locName(p.loc),
        body: APP.emptyState('eye-off', 'Outside your reporting line', 'You can see where ' + esc(p.name.split(' ')[0]) + ' sits in the chart, but their record belongs to their own manager and to HR.', APP.btn('Back to the chart', 'btn-solid', 'network', 'data-act="goto" data-href="#/org"')) });
    }
    var forms = D.FORMS.filter(function (f) { return f.emp === id; });
    var acts = D.ACTIONS.filter(function (a) { return a.owner === id; });
    var cases = D.CASES.filter(function (c) { return c.emp === id; });
    var tasks = D.TASKS.filter(function (t) { return t.emp === id; });
    var msrs = D.EMP_MEASURES[id] || [];
    var live = cases.filter(function (c) { return c.status === 'Open' || c.status === 'Pending approval'; });

    var head = '<section class="card"><div class="profile-head">' + APP.av(p, 56) +
      '<div class="ph-id"><div class="ph-name">' + esc(p.name) + '</div><div class="ph-meta">' + esc(p.title) + ' · ' + esc(D.locName(p.loc)) + ' · ' + esc(p.dept) + ' · started ' + esc(p.hired) + '</div>' +
      '<div class="ph-path">' + esc(APP.hierPath(p.loc, p.dept)) + ' / ' + esc(p.name) + '</div></div>' +
      '<div class="ph-stats">' +
      '<div class="ph-stat"><span class="ph-stat-v">' + forms.length + '</span><span class="ph-stat-l">Documented forms</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + acts.filter(function (a) { return a.status !== 'Closed'; }).length + '</span><span class="ph-stat-l">Open items</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + live.length + '</span><span class="ph-stat-l">Open cases</span></div>' +
      '</div></div>' +
      (APP.canRunForms() && id !== APP.me().id ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Run a form', 'btn-solid', 'circle-play', 'data-act="start-form" data-emp="' + id + '"', 'is-sm') +
        APP.btn('Open a case', 'btn-surface', 'gavel', 'data-act="start-case" data-emp="' + id + '"', 'is-sm') +
        (APP.isHR() ? APP.btn('Employee file export', 'btn-surface', 'package', 'data-act="file-export"', 'is-sm') : '') +
        '</div>' : '') + '</section>';

    var tabs = APP.tabs([
      ['overview', 'Overview', '#/org/' + id],
      ['coaching', 'Coaching', '#/org/' + id + '/coaching', forms.length],
      ['actions', 'Action items', '#/org/' + id + '/actions', acts.length],
      ['cases', 'Cases', '#/org/' + id + '/cases', cases.length]
    ], tab);

    var body;
    if (tab === 'coaching') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Date' }, { t: 'Form' }, { t: 'By' }, { t: 'Outcome' }, { t: 'Summary' }, { t: '' }],
        forms.map(function (f) {
          return { cells: [esc(f.date), esc(D.formType(f.ft).name), APP.personLine(f.by, null, 28), APP.statusBadge(f.outcome),
            '<span class="mini-note">' + esc(f.summary.slice(0, 100)) + '...</span>', APP.btn('Open', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm')] };
        }), { empty: 'Nothing documented yet.' }) + '</section>' +
        '<section class="card">' + APP.panelHead('Open touch points', 'What the rules say is due on this person.') +
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
            esc(D.STEPS.filter(function (s) { return s.key === c.step; })[0].name), esc(c.opened), APP.statusBadge(c.disposition || c.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/cases/' + c.id + '"', 'is-sm')] };
        }), { empty: 'No cases on this record.' }) + '</section>';
    } else {
      body = '<div class="split-rail"><div class="stack-4">' +
        (live.length ? APP.callout('<b>' + esc(D.STEPS.filter(function (s) { return s.key === live[0].step; })[0].name) + ' ' + (live[0].status === 'Open' ? 'is active' : 'is pending approval') + ' on this record.</b> <button class="rowlink" data-act="goto" data-href="#/cases/' + live[0].id + '">Open ' + esc(live[0].id) + '</button>.', 'is-warning', 'gavel') : '') +
        '<section class="card">' + APP.panelHead('Performance measures', 'What the rules watch for this person.') +
        (msrs.length ? '<div class="snap">' + msrs.map(function (m) {
          var s = D.measure(m[0]), good = D.onTarget(m[0], m[1]);
          return '<div class="snap-row"><span class="snap-name">' + esc(s.name) + '<span class="snap-id">' + esc(m[0]) + '</span></span><span class="snap-val">' + s.fmt(m[1]) + '</span>' +
            '<span class="snap-tgt">Target ' + s.fmt(s.target) + '</span>' + APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>';
        }).join('') + '</div>' : '<p class="mini-note">No measures tracked for this role.</p>') + '</section>' +
        '<section class="card">' + APP.panelHead('Recent documentation', 'Most recent first.') +
        '<div class="wq">' + (forms.length ? forms.slice(0, 4).map(function (f) {
          return '<div class="wq-row"><span class="wq-ic' + (f.outcome === 'Needs improvement' ? ' is-late' : f.outcome === 'Recognition' ? ' is-good' : '') + '">' + ic(D.formType(f.ft).ic, 16) + '</span>' +
            '<div class="wq-main"><span class="wq-t">' + esc(D.formType(f.ft).name) + ' · ' + esc(f.date) + '</span><span class="wq-s">' + esc(f.summary.slice(0, 100)) + '...</span></div>' +
            '<div class="wq-right">' + APP.statusBadge(f.outcome) + APP.btn('Read', 'btn-surface', null, 'data-act="open-form" data-id="' + f.id + '"', 'is-sm') + '</div></div>';
        }).join('') : '<div class="table-empty">Nothing documented yet.</div>') + '</div></section></div>' +
        '<div class="stack-4">' +
        '<section class="card">' + APP.panelHead('From the HRIS', 'Read only. skyPerformance consumes the hierarchy, it does not own it.') +
        APP.dataList([
          ['Reports to', p.mgr ? APP.personLine(p.mgr, false, 24, false) : 'Top of the chart'],
          ['Direct reports', String(D.reports(id).length)],
          ['Location', esc(D.locName(p.loc))],
          ['Department', esc(p.dept)],
          ['Started', esc(p.hired)],
          ['Source', esc(D.HRIS) + ', synced nightly']
        ]) +
        APP.btn('Show in the chart', 'btn-surface', 'network', 'data-act="org-show" data-id="' + id + '"', 'is-sm') +
        '</section>' +
        '<section class="card">' + APP.panelHead('Open action items') +
        '<div class="wq">' + (acts.filter(function (a) { return a.status !== 'Closed'; }).length ? acts.filter(function (a) { return a.status !== 'Closed'; }).map(APP.actionRow).join('') : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
        '</div></div>';
    }
    return APP.page({
      crumbs: [['Home', '#/home'], ['Org chart', '#/org'], [p.name, '#/org/' + id]],
      title: p.name, desc: p.title + ' · ' + D.locName(p.loc) + ' · ' + p.dept, tabs: tabs, body: head + body
    });
  }

  /* ---------------- view ---------------- */
  APP.VIEWS.org = function (r) {
    if (r[1] && D.PEOPLE.some(function (p) { return p.id === r[1]; })) return record(r[1]);
    var q = (S.f.orgq || '').toLowerCase();
    var matches = q ? D.PEOPLE.filter(function (p) { return (p.name + ' ' + p.title + ' ' + p.dept + ' ' + D.locName(p.loc)).toLowerCase().indexOf(q) >= 0; }) : [];
    var body =
      APP.callout('The chart comes from <b>' + esc(D.HRIS) + '</b> and syncs nightly. skyPerformance never edits it: reporting lines, job titles and locations change in the HRIS and appear here the next morning. Approval routing and what each role can see are both derived from this chart, which is why nothing here is editable.' +
        (APP.isHR() ? '' : ' Everyone can see the whole chart. Records outside your reporting line stay closed, and those nodes are dimmed.'), 'is-info', 'network') +
      '<div class="filter-bar">' +
      '<div class="search" style="min-width:240px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="orgq" value="' + esc(S.f.orgq || '') + '" placeholder="Find a person in the chart"></div>' +
      APP.btn('Expand all', 'btn-surface', 'chevrons-down', 'data-act="org-expand"', 'is-sm') +
      APP.btn('Collapse to my line', 'btn-surface', 'chevrons-up', 'data-act="org-collapse"', 'is-sm') +
      '<span class="fb-spacer"></span>' +
      '<span class="mini-note">' + D.PEOPLE.length + ' people · ' + D.LOCATIONS.length + ' locations · synced ' + esc(D.TODAY) + '</span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The org chart as CSV"', 'is-sm') +
      '</div>' +
      (q ? '<section class="card">' + APP.panelHead('Search results', matches.length + ' people match "' + esc(q) + '"') +
        '<div class="wq">' + matches.slice(0, 8).map(function (p) {
          return '<div class="wq-row"><span class="wq-ic">' + ic('user', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(p.name) + '</span><span class="wq-s">' + esc(p.title) + ' · ' + esc(D.locName(p.loc)) + ' · ' + esc(p.dept) + '</span></div>' +
            '<div class="wq-right">' + APP.btn('Show in chart', 'btn-surface', 'network', 'data-act="org-show" data-id="' + p.id + '"', 'is-sm') + '</div></div>';
        }).join('') + (matches.length ? '' : '<div class="table-empty">Nobody matches.</div>') + '</div></section>' : '') +
      '<div class="org-layout">' +
      '<section class="card flush-card oc-wrap">' + chart() + '</section>' +
      rail() + '</div>';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Org chart', '#/org']],
      title: 'Org chart', desc: 'The reporting line as ' + D.HRIS + ' publishes it. Click anyone to see where they sit and what is on their record.',
      body: body
    });
  };

  /* Centre the chart on the selected node. A chart that opens scrolled into a
     corner reads as broken even when the tree is correct. */
  APP.AFTER.push(function (r) {
    if (r[0] !== 'org' || r[1]) return;
    var box = document.querySelector('.oc-scroll');
    if (!box) return;
    var n = box.querySelector('.oc-node.is-sel') || box.querySelector('.oc-node.is-me') || box.querySelector('.oc-node');
    if (!n) return;
    /* offsetLeft is relative to .oc-li, which is positioned, so measure with rects. */
    var nb = n.getBoundingClientRect(), bb = box.getBoundingClientRect();
    box.scrollLeft += (nb.left + nb.width / 2) - (bb.left + bb.width / 2);
    box.scrollTop += (nb.top + nb.height / 2) - (bb.top + bb.height / 2);
  });

  /* ---------------- actions ---------------- */
  APP.ACT['org-toggle'] = function (el) {
    var id = el.getAttribute('data-id');
    open()[id] = !open()[id];
    APP.rerender();
  };
  APP.ACT['org-select'] = function (el) {
    var id = el.getAttribute('data-id');
    S.f.orgSel = id;
    if (D.reports(id).length && !open()[id]) open()[id] = true;
    APP.rerender();
  };
  APP.ACT['org-expand'] = function () {
    var o = {}; D.PEOPLE.forEach(function (p) { o[p.id] = true; });
    S.f.orgOpen = o; APP.rerender();
  };
  APP.ACT['org-collapse'] = function () { S.f.orgOpen = defaults(); APP.rerender(); };
  APP.ACT['org-show'] = function (el) {
    var id = el.getAttribute('data-id');
    var o = S.f.orgOpen || defaults();
    D.path(id).forEach(function (p) { o[p.id] = true; });
    S.f.orgOpen = o; S.f.orgSel = id; S.f.orgq = '';
    APP.closeAll(); APP.go('#/org');
    setTimeout(function () {
      var n = document.querySelector('.oc-node.is-sel');
      if (n && n.scrollIntoView) n.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, 60);
  };
  APP.INPUT.orgq = function (el) {
    S.f.orgq = el.value; var c = el.selectionStart; APP.rerender();
    var n = document.querySelector('[data-input="orgq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); }
  };
  APP.ACT['open-hierarchy'] = function () {
    APP.dialog({
      title: 'What you are looking at', sub: APP.scopePath(), size: 'is-wide',
      body: APP.callout('Your scope is your position in the chart, not a filter you choose. To see a different branch, switch role with <b>View as</b> in the header.', 'is-info', 'info') +
        '<div class="tree-wrap">' + D.DIVISIONS.map(function (dv) {
          var locs = D.LOCATIONS.filter(function (l) { return l.div === dv.id; });
          var mine = APP.scopeLocs();
          var anyIn = locs.some(function (l) { return mine.indexOf(l.id) >= 0; });
          return '<details class="collapse tree-region"' + (anyIn || APP.isHR() ? ' open' : '') + '><summary>' + ic('network', 16) + '<span>' + esc(dv.name) + '</span><span class="tr-meta">' + locs.length + ' locations</span></summary>' +
            locs.map(function (l) {
              var on = mine.indexOf(l.id) >= 0;
              return '<div class="tree-row' + (on ? ' is-on' : '') + '">' + ic('building-2', 16) + '<span class="tw-name">' + esc(l.name) + '<span class="tw-sub">' + esc(l.type) + ', ' + l.size + ' people, led by ' + esc(P(l.head).name) + '</span></span>' +
                (on ? APP.badge('In your scope', 'is-success') : APP.badge('Out of scope', 'is-neutral')) + '</div>';
            }).join('') + '</details>';
        }).join('') + '</div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Open the org chart', 'btn-solid', 'network', 'data-act="goto" data-href="#/org"')
    });
  };
})();
