/* skyPerformance: the org chart and the employee file. The chart is read from
   the system of record. The file is the thing a manager pulls up and filters by
   a date range they choose. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  /* ---------------- chart ---------------- */
  function defaults() {
    var open = {};
    D.path(APP.me().id).forEach(function (p) { open[p.id] = true; });
    return open;
  }
  function open() { if (!S.f.orgOpen) S.f.orgOpen = defaults(); return S.f.orgOpen; }

  function node(p) {
    var kids = D.reports(p.id), isOpen = !!open()[p.id];
    var me = p.id === APP.me().id, sel = S.f.orgSel === p.id, inScope = APP.inScope(p.id);
    var openTodos = D.ACTIONS.filter(function (a) { return a.owner === p.id && a.status !== 'Closed'; }).length;
    var pip = D.PIPS.filter(function (x) { return x.emp === p.id && x.status !== 'Closed'; }).length;
    return '<li class="oc-li">' +
      '<div class="oc-node' + (me ? ' is-me' : '') + (sel ? ' is-sel' : '') + (inScope ? '' : ' is-out') + '">' +
      '<button class="oc-card" data-act="org-select" data-id="' + p.id + '">' + APP.av(p, 34) +
      '<span class="oc-text"><span class="oc-name">' + esc(p.name) + (me ? ' <span class="oc-you">you</span>' : '') + '</span>' +
      '<span class="oc-title">' + esc(p.title) + '</span>' +
      '<span class="oc-where">' + esc(p.site ? D.siteName(p.site) : D.CONFIG.orgShort) + '</span></span>' +
      (pip ? '<span class="oc-flag is-danger" title="Improvement plan open">' + ic('clipboard-check', 12) + '</span>'
        : openTodos ? '<span class="oc-flag is-warn" title="' + openTodos + ' open to-dos">' + openTodos + '</span>' : '') +
      '</button>' +
      (kids.length ? '<button class="oc-toggle" data-act="org-toggle" data-id="' + p.id + '">' + ic(isOpen ? 'chevron-up' : 'chevron-down', 14) + '<span>' + kids.length + '</span></button>' : '') +
      '</div>' +
      (kids.length && isOpen ? '<ul class="oc-children">' + kids.map(node).join('') + '</ul>' : '') +
      '</li>';
  }

  function rail() {
    var id = S.f.orgSel || APP.me().id, p = P(id), kids = D.reports(id), line = D.path(id), inScope = APP.inScope(id);
    var recs = D.recordsFor(id).length;
    var todos = D.ACTIONS.filter(function (a) { return a.owner === id && a.status !== 'Closed'; }).length;
    var pips = D.PIPS.filter(function (x) { return x.emp === id; }).length;
    return '<aside class="stack-4">' +
      '<section class="card">' +
      '<div class="oc-rail-head">' + APP.av(p, 48) + '<div><div class="ph-name t-5">' + esc(p.name) + '</div><div class="ph-meta">' + esc(p.title) + '</div></div></div>' +
      APP.dataList([
        [APP.term('site'), esc(p.site ? D.siteName(p.site) : D.CONFIG.org)],
        ['Department', esc(p.dept)],
        ['Level', esc(APP.levelLabel(p.level))],
        ['Reports to', p.mgr ? APP.personLine(p.mgr, false, 24, false) : 'Top of the chart'],
        ['Direct reports', String(kids.length)],
        ['Started', esc(p.hired)]
      ]) +
      '<div class="path-block"><span class="path-label">Hierarchy path</span><span class="cell-id">' + esc(APP.hierPath(p.site, p.dept)) + '</span></div>' +
      '</section>' +
      (inScope ? '<section class="card">' + APP.panelHead('On file') +
        '<div class="ph-stats">' +
        '<div class="ph-stat"><span class="ph-stat-v">' + recs + '</span><span class="ph-stat-l">Records</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + todos + '</span><span class="ph-stat-l">Open to-dos</span></div>' +
        '<div class="ph-stat"><span class="ph-stat-v">' + pips + '</span><span class="ph-stat-l">' + esc(APP.term('pipShort')) + 's</span></div></div>' +
        '<div class="stack-2" style="margin-top:var(--space-4)">' +
        APP.btn('Open the file', 'btn-solid', 'circle-arrow-right', 'data-act="goto" data-href="#/org/' + id + '"', 'is-sm') +
        (APP.canCoach() && id !== APP.me().id ? APP.btn('Document something', 'btn-surface', 'plus', 'data-act="new-coaching" data-emp="' + id + '"', 'is-sm') : '') +
        '</div></section>'
        : '<section class="card">' + APP.hint('Outside your reporting line. You can see where they sit, not what is on their file.', 'eye-off') + '</section>') +
      '<section class="card">' + APP.panelHead('Reporting line') +
      '<div class="oc-line">' + line.map(function (x, i) {
        return '<button class="oc-line-row' + (x.id === id ? ' is-on' : '') + '" data-act="org-select" data-id="' + x.id + '" style="padding-left:' + (i * 14 + 8) + 'px">' +
          '<span class="oc-line-tick">' + ic(i ? 'corner-down-right' : 'building-2', 14) + '</span>' + APP.av(x, 22) +
          '<span class="oc-line-name">' + esc(x.name) + '<span class="oc-line-title">' + esc(x.title) + '</span></span></button>';
      }).join('') + '</div></section></aside>';
  }

  /* ---------------- the employee file ---------------- */
  function fileView(id, tab, isSelf) {
    var p = P(id);
    if (!APP.inScope(id)) {
      return APP.page({ crumbs: [['Home', '#/home'], ['Org chart', '#/org'], [p.name, '#']], title: p.name, desc: p.title,
        body: APP.emptyState('eye-off', 'Outside your reporting line', 'You can see where ' + esc(p.name.split(' ')[0]) + ' sits, but their file belongs to their own manager and to ' + esc(APP.roleLabel('hr')) + '.',
          APP.btn('Back to the chart', 'btn-solid', 'network', 'data-act="goto" data-href="#/org"')) });
    }
    var recs = D.recordsFor(id), pips = APP.pips().filter(function (x) { return x.emp === id; });
    var evals = D.EVALUATIONS.filter(function (e) { return e.emp === id; });
    var todos = D.ACTIONS.filter(function (a) { return a.owner === id; });
    var base = isSelf ? '#/myfile' : '#/org/' + id;
    var range = S.f.fileRange || 'All';
    function inRange(on) {
      if (range === 'All') return true;
      var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].findIndex(function (x) { return (on || '').indexOf(x) >= 0; });
      if (m < 0) return true;
      return range === '30' ? m >= 8 : range === '90' ? m >= 6 : true;
    }

    var head = '<section class="card"><div class="profile-head">' + APP.av(p, 56) +
      '<div class="ph-id"><div class="ph-name">' + esc(p.name) + '</div>' +
      '<div class="ph-meta">' + esc(p.title) + ' · ' + esc(D.siteName(p.site)) + ' · ' + esc(p.dept) + ' · started ' + esc(p.hired) + '</div>' +
      '<div class="ph-path">' + esc(APP.hierPath(p.site, p.dept)) + ' / ' + esc(p.name) + '</div></div>' +
      '<div class="ph-stats">' +
      '<div class="ph-stat"><span class="ph-stat-v">' + recs.length + '</span><span class="ph-stat-l">Records</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + todos.filter(function (a) { return a.status !== 'Closed'; }).length + '</span><span class="ph-stat-l">Open to-dos</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + pips.filter(function (x) { return x.status !== 'Closed'; }).length + '</span><span class="ph-stat-l">Live plans</span></div>' +
      '</div></div>' +
      (!isSelf && APP.canCoach() && id !== APP.me().id ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Document something', 'btn-solid', 'plus', 'data-act="new-coaching" data-emp="' + id + '"', 'is-sm') +
        APP.btn('Start a ' + APP.term('pipShort'), 'btn-surface', 'clipboard-check', 'data-act="new-pip" data-emp="' + id + '"', 'is-sm') +
        APP.btn('Start an evaluation', 'btn-surface', 'clipboard-list', 'data-act="new-eval"', 'is-sm') +
        (APP.isHR() ? APP.btn('Export the file', 'btn-surface', 'package', 'data-act="file-export"', 'is-sm') : '') +
        '</div>' : '') + '</section>';

    var tabs = APP.tabs([
      ['overview', 'Overview', base],
      ['coaching', APP.term('coaching'), base + '/coaching', recs.length],
      ['pips', APP.terms('pipShort'), base + '/pips', pips.length],
      ['evals', 'Evaluations', base + '/evals', evals.length],
      ['todos', 'To-dos', base + '/todos', todos.length]
    ], tab);

    var rangeBar = '<div class="filter-bar">' +
      '<span class="fb-label">Show</span>' +
      APP.dd('fileRange', [['All', 'Everything on file'], ['90', 'Last 90 days'], ['30', 'Last 30 days']], range) +
      '<span class="fb-spacer"></span>' +
      APP.btn('Print the file', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering" data-b="Everything in the selected range renders as one document." data-k="info"', 'is-sm') +
      '</div>';

    var body;
    if (tab === 'coaching') {
      var shown = recs.filter(function (r) { return inRange(r.on); });
      body = rangeBar + '<section class="card flush-card">' +
        APP.table([{ t: 'Date' }, { t: 'Type' }, { t: 'What was documented', w: '40%' }, { t: 'By' }, { t: 'Status' }, { t: '' }],
          shown.map(function (r) {
            var ct = D.coachingType(r.type);
            return { cells: [esc(r.on.replace(/^\w+ /, '')), '<span class="row-gap">' + ic(ct.ic, 14) + esc(ct.name) + '</span>',
              '<span class="cell-strong">' + esc(r.topic || '') + '</span><span class="cell-sub">' + esc((r.text || '').slice(0, 70)) + '...</span>',
              APP.personLine(r.by, false, 26), r.group ? APP.badge('Team', 'is-neutral') : r.ack ? APP.badge('Acknowledged', 'is-success') : APP.badge('Waiting', 'is-warning'),
              APP.btn('Open', 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm')] };
          }), { empty: 'Nothing in this range.' }) + '</section>';
    } else if (tab === 'pips') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Plan' }, { t: 'Level' }, { t: 'Offense' }, { t: 'Opened' }, { t: 'Status' }, { t: '' }],
        pips.map(function (x) {
          return { cells: ['<span class="cell-strong">' + esc(x.id) + '</span>', esc(D.pipLevel(x.level).name), esc(D.offenseText(x)), esc(x.opened.replace(/^\w+ /, '')),
            APP.statusBadge(x.outcome || x.status), APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/pips/' + x.id + '"', 'is-sm')] };
        }), { empty: 'No plans on this file.' }) + '</section>';
    } else if (tab === 'evals') {
      body = '<section class="card flush-card">' + APP.table([{ t: 'Cycle' }, { t: 'Review date' }, { t: 'Score', num: true }, { t: 'Status' }, { t: '' }],
        evals.map(function (e) {
          var max = e.years >= 2 ? D.EVAL_MAX.year2 : D.EVAL_MAX.year1;
          return { cells: [esc(e.cycle), esc(e.reviewDate.replace(/^\w+ /, '')),
            e.total ? e.total + ' / ' + max + '<span class="cell-sub">' + Math.round(e.total / max * 100) + '%</span>' : '—',
            e.status === 'Complete' ? APP.badge('Complete', 'is-success') : APP.badge('In progress', 'is-info'),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/evaluations/' + e.id + '"', 'is-sm')] };
        }), { empty: 'No evaluations on this file.' }) + '</section>';
    } else if (tab === 'todos') {
      body = '<section class="card">' + APP.panelHead('To-dos', todos.filter(function (a) { return a.status !== 'Closed'; }).length + ' open') +
        '<div class="wq">' + (todos.length ? todos.map(APP.actionRow).join('') : '<div class="table-empty">Nothing assigned.</div>') + '</div></section>';
    } else {
      var live = pips.filter(function (x) { return x.status !== 'Closed'; });
      body = (live.length ? APP.callout('<b>' + esc(D.pipLevel(live[0].level).name) + ' ' + esc(live[0].status.toLowerCase()) + '.</b> <button class="rowlink" data-act="goto" data-href="#/pips/' + live[0].id + '">Open ' + esc(live[0].id) + '</button>', 'is-warning', 'clipboard-check') : '') +
        APP.glance([
          [recs.length, 'Records', '', base + '/coaching'],
          [recs.filter(function (r) { return r.type === 'CT-REC'; }).length, 'Recognition', 'is-good'],
          [todos.filter(function (a) { return a.status !== 'Closed'; }).length, 'Open to-dos', todos.some(function (a) { return a.status === 'Overdue'; }) ? 'is-bad' : '', base + '/todos'],
          [pips.length, APP.terms('pipShort'), live.length ? 'is-warn' : '', base + '/pips']
        ]) +
        '<div class="split-rail"><div class="stack-4">' +
        '<section class="card">' + APP.panelHead('Recent records', 'Most recent first.', APP.btn('See all', 'btn-surface', null, 'data-act="goto" data-href="' + base + '/coaching"', 'is-sm')) +
        '<div class="wq">' + (recs.length ? recs.slice(0, 5).map(function (r) {
          var ct = D.coachingType(r.type);
          return '<div class="wq-row"><span class="wq-ic' + (ct.tone === 'good' ? ' is-good' : '') + '">' + ic(ct.ic, 16) + '</span>' +
            '<div class="wq-main"><span class="wq-t">' + esc(r.topic || ct.name) + '</span><span class="wq-s">' + esc(ct.name) + ' · ' + esc(r.on) + ' · ' + esc(P(r.by).name) + '</span></div>' +
            '<div class="wq-right">' + (r.group ? APP.badge('Team', 'is-neutral') : r.ack ? APP.badge('Acknowledged', 'is-success') : APP.badge('Waiting', 'is-warning')) +
            APP.btn('Open', 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm') + '</div></div>';
        }).join('') : '<div class="table-empty">Nothing documented yet.</div>') + '</section>' +
        '</div><div class="stack-4">' +
        '<section class="card">' + APP.panelHead('From ' + esc(D.CONFIG.hris), 'Read only.') +
        APP.dataList([
          ['Reports to', p.mgr ? APP.personLine(p.mgr, false, 24, false) : 'Top of the chart'],
          [APP.term('site'), esc(D.siteName(p.site))],
          ['Department', esc(p.dept)],
          ['Level', esc(APP.levelLabel(p.level))],
          ['Started', esc(p.hired)]
        ]) +
        (isSelf ? '' : APP.btn('Show in the chart', 'btn-surface', 'network', 'data-act="org-show" data-id="' + id + '"', 'is-sm')) +
        '</section>' +
        '<section class="card">' + APP.panelHead('Open to-dos') +
        '<div class="wq">' + (todos.filter(function (a) { return a.status !== 'Closed'; }).length
          ? todos.filter(function (a) { return a.status !== 'Closed'; }).map(APP.actionRow).join('')
          : '<div class="table-empty">Nothing open.</div>') + '</div></section>' +
        '</div></div>';
    }

    return APP.page({
      crumbs: isSelf ? [['Home', '#/home'], ['My file', '#/myfile']] : [['Home', '#/home'], ['Org chart', '#/org'], [p.name, '#/org/' + id]],
      title: isSelf ? 'My file' : p.name,
      desc: isSelf ? 'Everything on file about you.' : p.title + ' · ' + D.siteName(p.site),
      tabs: tabs, body: head + body
    });
  }

  APP.VIEWS.org = function (r) {
    if (r[1] && D.PEOPLE.some(function (p) { return p.id === r[1]; })) return fileView(r[1], r[2] || 'overview', false);
    var q = (S.f.orgq || '').toLowerCase();
    var matches = q ? D.PEOPLE.filter(function (p) { return (p.name + ' ' + p.title + ' ' + D.siteName(p.site)).toLowerCase().indexOf(q) >= 0; }) : [];
    return APP.page({
      crumbs: [['Home', '#/home'], ['Org chart', '#/org']],
      title: 'Org chart', desc: 'Click anyone to see where they sit and what is on their file.',
      body: APP.hint('From <b>' + esc(D.CONFIG.hris) + '</b>, synced nightly, read only.' + (APP.isHR() ? '' : ' Dimmed people are outside your reporting line.'), 'network') +
        '<div class="filter-bar">' +
        '<div class="search" style="min-width:230px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="orgq" value="' + esc(S.f.orgq || '') + '" placeholder="Find a person"></div>' +
        APP.btn('Expand all', 'btn-surface', 'chevrons-down', 'data-act="org-expand"', 'is-sm') +
        APP.btn('Collapse to my line', 'btn-surface', 'chevrons-up', 'data-act="org-collapse"', 'is-sm') +
        '<span class="fb-spacer"></span>' +
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The org chart as CSV"', 'is-sm') + '</div>' +
        (q ? '<section class="card">' + APP.panelHead('Search results', matches.length + ' match "' + esc(q) + '"') +
          '<div class="wq">' + matches.slice(0, 8).map(function (p) {
            return '<div class="wq-row"><span class="wq-ic">' + ic('user', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(p.name) + '</span>' +
              '<span class="wq-s">' + esc(p.title) + ' · ' + esc(D.siteName(p.site)) + '</span></div>' +
              '<div class="wq-right">' + APP.btn('Show in chart', 'btn-surface', 'network', 'data-act="org-show" data-id="' + p.id + '"', 'is-sm') + '</div></div>';
          }).join('') + (matches.length ? '' : '<div class="table-empty">Nobody matches.</div>') + '</div></section>' : '') +
        APP.glance([[D.PEOPLE.length, 'People'], [D.SITES.length, APP.terms('site')], [D.REGIONS.length, 'Regions'], [APP.people().length, 'In your scope']]) +
        '<div class="org-layout"><section class="card flush-card oc-wrap"><div class="oc-scroll"><ul class="oc-tree">' + node(P('nadine')) + '</ul></div></section>' + rail() + '</div>'
    });
  };
  APP.VIEWS.myfile = function (r) { return fileView(APP.me().id, r[1] || 'overview', true); };

  APP.AFTER.push(function (r) {
    if (r[0] !== 'org' || r[1]) return;
    var box = document.querySelector('.oc-scroll'); if (!box) return;
    var n = box.querySelector('.oc-node.is-sel') || box.querySelector('.oc-node.is-me') || box.querySelector('.oc-node');
    if (!n) return;
    var nb = n.getBoundingClientRect(), bb = box.getBoundingClientRect();
    box.scrollLeft += (nb.left + nb.width / 2) - (bb.left + bb.width / 2);
    box.scrollTop += (nb.top + nb.height / 2) - (bb.top + bb.height / 2);
  });

  APP.ACT['org-toggle'] = function (el) { var id = el.getAttribute('data-id'); open()[id] = !open()[id]; APP.rerender(); };
  APP.ACT['org-select'] = function (el) {
    var id = el.getAttribute('data-id'); S.f.orgSel = id;
    if (D.reports(id).length && !open()[id]) open()[id] = true;
    APP.rerender();
  };
  APP.ACT['org-expand'] = function () { var o = {}; D.PEOPLE.forEach(function (p) { o[p.id] = true; }); S.f.orgOpen = o; APP.rerender(); };
  APP.ACT['org-collapse'] = function () { S.f.orgOpen = defaults(); APP.rerender(); };
  APP.ACT['org-show'] = function (el) {
    var id = el.getAttribute('data-id'), o = S.f.orgOpen || defaults();
    D.path(id).forEach(function (p) { o[p.id] = true; });
    S.f.orgOpen = o; S.f.orgSel = id; S.f.orgq = '';
    APP.closeAll(); APP.go('#/org');
  };
  APP.INPUT.orgq = function (el) {
    S.f.orgq = el.value; var c = el.selectionStart; APP.rerender();
    var n = document.querySelector('[data-input="orgq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); }
  };
})();
