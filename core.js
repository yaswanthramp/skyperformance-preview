/* skyPerformance wireframe: shell, router, role scoping, overlays and the shared
   DS helpers every view builds from. Three roles, five destinations each.
   Views register renderers on APP.VIEWS and click handlers on APP.ACT.
   Everything is event delegated through data-act. */
(function () {
  var D = window.SP;
  var APP = window.APP = { VIEWS: {}, ACT: {}, INPUT: {}, DD: {}, AFTER: [] };
  var S = APP.S = { personaKey: 'dept', route: [], f: {}, lastRouteKey: '', runner: null, wizard: null };

  /* ---------------- primitives ---------------- */
  var esc = APP.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = APP.ic = function (name, size, cls) {
    var inner = window.ICONS[name];
    if (inner == null) { console.warn('icon missing:', name); inner = window.ICONS['circle-dot']; }
    size = size || 18;
    return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  };
  var P = APP.P = function (id) { return D.byId(id); };
  var tone = APP.tone = function (name) { var s = 0; for (var i = 0; i < name.length; i++) s += name.charCodeAt(i); return 'c' + ((s % 8) + 1); };
  var av = APP.av = function (p, size) {
    if (typeof p === 'string') p = P(p);
    var st = size ? ' style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.max(10, Math.round(size * 0.38)) + 'px;"' : '';
    return '<span class="avatar ' + tone(p.name) + '"' + st + ' aria-hidden="true">' + p.ini + '</span>';
  };
  APP.personLine = function (p, sub, size, link) {
    if (typeof p === 'string') p = P(p);
    var a = link === false ? '' : ' data-act="goto-person" data-id="' + p.id + '" role="link" tabindex="0" data-enter="goto-person"';
    return '<span class="person-line' + (link === false ? '' : ' is-link') + '"' + a + '>' + av(p, size) +
      '<span class="pl-text"><span class="pl-name">' + esc(p.name) + '</span>' + (sub !== false ? '<span class="pl-sub">' + (sub || esc(p.title)) + '</span>' : '') + '</span></span>';
  };
  APP.badge = function (t, kind, icon) { return '<span class="badge ' + (kind || '') + '">' + (icon ? ic(icon, 12) : '') + esc(t) + '</span>'; };
  APP.btn = function (label, variant, icon, attrs, size) {
    return '<button class="btn ' + (variant || 'btn-surface') + (size ? ' ' + size : '') + '" ' + (attrs || '') + '>' + (icon ? ic(icon, 16, 'btn-icon') : '') + (label ? '<span>' + label + '</span>' : '') + '</button>';
  };
  APP.callout = function (html, kind, icon) { return '<div class="callout ' + (kind || '') + '"><span class="co-icon">' + ic(icon || 'info', 18) + '</span><div class="co-text">' + html + '</div></div>'; };
  APP.panelHead = function (title, sub, right) {
    return '<div class="panel-head"><div><div class="panel-title">' + title + '</div>' + (sub ? '<div class="panel-sub">' + sub + '</div>' : '') + '</div>' + (right ? '<div class="ph-right">' + right + '</div>' : '') + '</div>';
  };
  APP.statusBadge = function (s) {
    var map = {
      Open: 'is-info', 'In progress': 'is-info', Scheduled: 'is-info', 'Sent to manager': 'is-info',
      Completed: 'is-success', Closed: 'is-success', Active: 'is-success', Approved: 'is-success', Accepted: 'is-success', 'Meets standard': 'is-success', Recognition: 'is-success', Acknowledged: 'is-success',
      Overdue: 'is-danger', 'Needs improvement': 'is-danger', Blocked: 'is-danger', Declined: 'is-danger',
      'Pending approval': 'is-warning', Waiting: 'is-warning', Warned: 'is-warning',
      Draft: 'is-neutral', Documented: 'is-neutral', Submitted: 'is-neutral', Expired: 'is-neutral is-void', Rescinded: 'is-neutral is-void', Deleted: 'is-neutral is-void'
    };
    return APP.badge(s, map[s] || 'is-neutral');
  };
  APP.tabs = function (items, active) {
    return '<div class="tab-nav tab-scroll" role="tablist">' + items.map(function (t) {
      var on = t[0] === active;
      return '<a class="tab-nav-item' + (on ? ' is-active' : '') + '" href="' + t[2] + '" role="tab" aria-selected="' + on + '">' + esc(t[1]) + (t[3] != null ? ' <span class="tab-count">' + t[3] + '</span>' : '') + '</a>';
    }).join('') + '</div>';
  };
  APP.table = function (cols, rows, opts) {
    opts = opts || {};
    var h = '<div class="table-wrap"><table class="table"><thead><tr>' + cols.map(function (c) {
      var o = typeof c === 'string' ? { t: c } : c;
      return '<th class="' + (o.num ? 'is-numeric' : '') + '"' + (o.w ? ' style="width:' + o.w + '"' : '') + '>' + o.t + '</th>';
    }).join('') + '</tr></thead><tbody>';
    if (!rows.length) h += '<tr><td colspan="' + cols.length + '"><div class="table-empty">' + (opts.empty || 'Nothing here yet.') + '</div></td></tr>';
    rows.forEach(function (r) {
      var attrs = r.attrs || '', cells = r.cells || r;
      h += '<tr ' + attrs + '>' + cells.map(function (c, i) {
        var o = typeof cols[i] === 'string' ? { t: cols[i] } : cols[i];
        return '<td class="' + (o.num ? 'is-numeric' : '') + '" data-label="' + esc(o.t.replace(/<[^>]+>/g, '')) + '">' + c + '</td>';
      }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  };
  APP.progress = function (pct, kind) {
    return '<div class="progress ' + (kind || '') + '" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></div></div>';
  };
  APP.meter = function (label, right, pct, kind) {
    return '<div class="meter"><div class="meter-top"><span class="meter-label">' + label + '</span><span class="meter-val">' + right + '</span></div>' + APP.progress(pct, kind) + '</div>';
  };
  APP.bars = function (items, fmt) {
    var max = Math.max.apply(null, items.map(function (i) { return i[1]; })) || 1;
    fmt = fmt || function (v) { return v; };
    return '<div class="hbars">' + items.map(function (i) {
      return '<div class="hbar" title="' + esc(i[0]) + ': ' + esc(fmt(i[1])) + '"><span class="hbar-label">' + esc(i[0]) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' + Math.max(2, i[1] / max * 100).toFixed(1) + '%"></span></span><span class="hbar-val">' + fmt(i[1]) + '</span></div>';
    }).join('') + '</div>';
  };
  APP.spark = function (series, invert) {
    var min = Math.min.apply(null, series), max = Math.max.apply(null, series), rng = (max - min) || 1;
    var pts = series.map(function (v, i) {
      return (i / (series.length - 1) * 100).toFixed(1) + ',' + (28 - (v - min) / rng * 24 - 2).toFixed(1);
    }).join(' ');
    return '<svg class="spark' + (invert ? ' is-bad' : '') + '" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };
  APP.dd = function (key, options, value, cls) {
    var cur = options.filter(function (o) { return (o[0] || o) === value; })[0];
    var label = cur ? (cur[1] || cur) : (options[0][1] || options[0][0] || options[0]);
    return '<span class="pop-anchor ' + (cls || '') + '"><button class="dropdown" type="button" aria-haspopup="listbox" aria-expanded="false" data-act="toggle-pop" data-pop="dd-' + key + '"><span class="dd-value">' + esc(label) + '</span><span class="dropdown-chevron">' + ic('chevron-down', 16) + '</span></button>' +
      '<div class="dropdown-menu pop" id="dd-' + key + '" role="listbox" hidden>' + options.map(function (o) {
        var v = o[0] || o, l = o[1] || o, sel = v === value;
        return '<div class="list-item' + (sel ? ' is-selected' : '') + '" role="option" aria-selected="' + sel + '" data-act="dd-pick" data-key="' + key + '" data-val="' + esc(v) + '"><span class="list-check">' + (sel ? ic('check', 16) : '') + '</span>' + esc(l) + '</div>';
      }).join('') + '</div></span>';
  };
  APP.field = function (label, control, hint, req) {
    return '<label class="field"><span class="field-label">' + label + (req ? '<span class="req">*</span>' : '') + '</span>' + control + (hint ? '<span class="field-hint">' + hint + '</span>' : '') + '</label>';
  };
  APP.emptyState = function (icon, title, text, action) {
    return '<div class="empty-state"><div class="empty-art">' + ic(icon, 40) + '</div><h2>' + title + '</h2><p>' + text + '</p>' + (action || '') + '</div>';
  };
  /* Skimmability helpers.
     hint: one line of context under the tabs, never a paragraph.
     why:  the rationale, collapsed, for whoever wants it.
     glance: a row of compact counts so a screen answers "how much" at a glance. */
  APP.hint = function (text, icon) {
    return '<p class="page-hint">' + ic(icon || 'info', 14) + '<span>' + text + '</span></p>';
  };
  APP.why = function (label, html) {
    return '<details class="collapse is-quiet"><summary>' + ic('circle-help', 14) + '<span>' + esc(label) + '</span></summary><div class="why-body">' + html + '</div></details>';
  };
  APP.glance = function (items) {
    return '<div class="glance">' + items.map(function (i) {
      return '<' + (i[3] ? 'button' : 'div') + ' class="glance-item' + (i[2] ? ' ' + i[2] : '') + '"' + (i[3] ? ' data-act="goto" data-href="' + i[3] + '"' : '') + '>' +
        '<span class="glance-num">' + i[0] + '</span><span class="glance-label">' + esc(i[1]) + '</span></' + (i[3] ? 'button' : 'div') + '>';
    }).join('') + '</div>';
  };
  APP.sectionLabel = function (t, right) {
    return '<div class="sec-label">' + esc(t) + (right ? '<span class="sec-right">' + right + '</span>' : '') + '</div>';
  };
  APP.dataList = function (rows) {
    return '<dl class="data-list">' + rows.map(function (r) { return '<dt class="dl-label">' + r[0] + '</dt><dd class="dl-value">' + r[1] + '</dd>'; }).join('') + '</dl>';
  };
  /* Organization / Region / Community / Department, as a text path */
  APP.hierPath = function (siteId, dept) {
    var l = D.site(siteId), parts = [D.CONFIG.orgShort];
    if (l && l.region) parts.push(D.region(l.region).name);
    if (l && l.name && siteId) parts.push(l.name);
    if (dept) parts.push(dept);
    return parts.join(' / ');
  };

  /* ---------------- persona, role and scope ----------------
     Three roles, several personas. What a manager can reach depends on their
     level in the chart, not on a separate permission list. Every role and level
     name is a label an operator can change in Settings. */
  APP.persona = function () { for (var i = 0; i < D.PERSONAS.length; i++) if (D.PERSONAS[i].key === S.personaKey) return D.PERSONAS[i]; return D.PERSONAS[1]; };
  APP.role = function () { return APP.persona().role; };
  APP.me = function () { return P(APP.persona().person); };
  APP.level = function () { return APP.me().level; };
  APP.is = function (k) { return APP.role() === k; };
  APP.isHR = function () { return APP.role() === 'hr'; };
  APP.isManager = function () { return APP.role() === 'manager'; };
  APP.roleLabel = function (k) { return D.CONFIG.roles[k || APP.role()]; };
  APP.levelLabel = function (k) { return D.CONFIG.levels[k || APP.level()]; };
  APP.term = function (k) { return D.CONFIG.terms[k]; };
  APP.org = function () { return D.CONFIG.org; };
  APP.hris = function () { return D.CONFIG.hris; };
  /* the site visit form is regional and up, which is what the client asked for */
  APP.canVisit = function () { return APP.isHR() || D.atLeast(APP.level(), 'regional'); };
  APP.seesVisits = function () { return APP.canVisit() || D.atLeast(APP.level(), 'community'); };
  APP.canCoach = function () { return !APP.is('employee'); };

  APP.people = function () {
    var me = APP.me();
    if (APP.is('employee')) return [me];
    if (APP.isHR()) return D.PEOPLE.slice();
    return [me].concat(D.branch(me.id));
  };
  APP.team = function () { return D.branch(APP.me().id); };
  APP.inScope = function (id) { return APP.people().some(function (x) { return x.id === id; }); };
  APP.scopeSites = function () {
    var out = [];
    APP.people().forEach(function (x) { if (x.site && out.indexOf(x.site) < 0) out.push(x.site); });
    if (APP.isHR() || !out.length) return D.SITES.map(function (x) { return x.id; });
    return out;
  };
  APP.scopePath = function () {
    var me = APP.me();
    if (APP.isHR()) return D.CONFIG.orgShort + ' / All regions';
    return APP.hierPath(me.site, APP.is('employee') ? null : me.dept) + (APP.is('employee') ? ' / ' + me.name : '');
  };
  APP.scopeNote = function () {
    if (APP.is('employee')) return 'Your own file only';
    if (APP.isHR()) return D.PEOPLE.length + ' people, ' + D.SITES.length + ' communities';
    return APP.team().length + ' direct and indirect reports';
  };

  /* records filtered to the scope */
  APP.records = function () {
    var me = APP.me();
    if (APP.is('employee')) return D.recordsFor(me.id);
    if (APP.isHR()) return D.RECORDS.slice();
    return D.RECORDS.filter(function (r) {
      if (r.by === me.id) return true;
      if (r.emp && APP.inScope(r.emp)) return true;
      return r.group && r.group.some(function (g) { return APP.inScope(g); });
    });
  };
  APP.pips = function () {
    var me = APP.me();
    /* nothing reaches the employee until every approver has signed off */
    if (APP.is('employee')) return D.PIPS.filter(function (x) { return x.emp === me.id && x.status !== 'Pending approval'; });
    if (APP.isHR()) return D.PIPS.slice();
    return D.PIPS.filter(function (x) { return APP.inScope(x.emp) || x.by === me.id; });
  };
  APP.evaluations = function () {
    var me = APP.me();
    if (APP.is('employee')) return D.EVALUATIONS.filter(function (x) { return x.emp === me.id; });
    if (APP.isHR()) return D.EVALUATIONS.slice();
    return D.EVALUATIONS.filter(function (x) { return APP.inScope(x.emp) || x.by === me.id; });
  };
  APP.visits = function () {
    var me = APP.me();
    if (APP.is('employee')) return [];
    if (APP.isHR()) return D.VISITS.slice();
    if (APP.canVisit()) return D.VISITS.filter(function (v) { return v.by === me.id || APP.scopeSites().indexOf(v.site) >= 0; });
    return D.VISITS.filter(function (v) { return v.ed === me.id || v.site === me.site; });
  };
  APP.actions = function () {
    var me = APP.me();
    if (APP.is('employee')) return D.ACTIONS.filter(function (a) { return a.owner === me.id; });
    if (APP.isHR()) return D.ACTIONS.slice();
    return D.ACTIONS.filter(function (a) { return a.owner === me.id || a.by === me.id || APP.inScope(a.owner); });
  };
  APP.myActions = function () { var me = APP.me(); return D.ACTIONS.filter(function (a) { return a.owner === me.id; }); };
  APP.approvalsFor = function () {
    var me = APP.me();
    return D.PIPS.filter(function (x) {
      return x.status === 'Pending approval' && x.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    });
  };

  /* ---------------- navigation: five destinations, no more ---------------- */
  function nav() {
    var t = D.CONFIG.terms;
    if (APP.is('employee')) return [
      ['home', 'Home', 'house', 'Home'],
      ['mycoaching', 'My ' + t.coaching.toLowerCase(), 'message-square-text', 'Coaching'],
      ['todos', 'My to-dos', 'list-checks', 'To-dos'],
      ['myfile', 'My file', 'folder', 'File']
    ];
    if (APP.isHR()) return [
      ['home', 'Home', 'house', 'Home'],
      ['pips', APP.plural(t.pipShort), 'clipboard-check', APP.plural(t.pipShort)],
      ['evaluations', 'Evaluations', 'clipboard-list', 'Evals'],
      ['coaching', t.coaching, 'message-square-text', 'Coaching'],
      ['visits', APP.plural(t.visit), 'building-2', 'Visits'],
      ['org', 'Org chart', 'network', 'Org'],
      ['records', 'Records', 'folder', 'Records'],
      ['settings', 'Settings', 'settings', 'Settings']
    ];
    var n = [
      ['home', 'Home', 'house', 'Home'],
      ['coaching', t.coaching, 'message-square-text', 'Coaching'],
      ['todos', 'To-dos', 'list-checks', 'To-dos'],
      ['pips', APP.plural(t.pipShort), 'clipboard-check', APP.plural(t.pipShort)],
      ['evaluations', 'Evaluations', 'clipboard-list', 'Evals']
    ];
    if (APP.seesVisits()) n.push(['visits', APP.plural(t.visit), 'building-2', 'Visits']);
    n.push(['org', 'Org chart', 'network', 'Org']);
    n.push(['records', 'Records', 'folder', 'Records']);
    return n;
  }
  APP.nav = nav;
  function allowed(r0) {
    if (nav().some(function (x) { return x[0] === r0; })) return true;
    if (r0 === 'mypip' && APP.is('employee')) return true;
    return false;
  }
  APP.navCount = function (route) {
    if (route === 'todos') return APP.myActions().filter(function (a) { return a.status !== 'Closed'; }).length;
    if (route === 'pips') return APP.approvalsFor().length;
    if (route === 'mycoaching') return APP.records().filter(function (r) { return r.emp === APP.me().id && !r.ack; }).length;
    if (route === 'evaluations') return APP.evaluations().filter(function (e) { return e.status === 'In progress'; }).length;
    if (route === 'visits') return APP.visits().filter(function (v) { return v.status === 'In progress'; }).length;
    return 0;
  };

  /* ---------------- shell ---------------- */
  function renderShell() {
    var me = APP.me();
    document.getElementById('roleValue').textContent = APP.roleLabel() + (APP.isManager() ? ' \u00b7 ' + APP.levelLabel() : '');
    document.getElementById('rolePop').innerHTML =
      '<div class="list-item is-header">View the product as</div>' +
      D.PERSONAS.map(function (x) {
        var sel = x.key === S.personaKey, p = P(x.person);
        return '<button class="list-item role-item' + (sel ? ' is-selected' : '') + '" role="menuitemradio" aria-checked="' + sel + '" data-act="set-role" data-role="' + x.key + '">' + av(p, 28) +
          '<span class="ri-text"><span class="ri-title">' + esc(D.CONFIG.roles[x.role]) + (x.role === 'manager' ? ' \u00b7 ' + esc(D.CONFIG.levels[P(x.person).level]) : '') + '</span>' +
          '<span class="ri-sub">' + esc(p.name) + ', ' + esc(p.title) + '</span></span><span class="list-check">' + (sel ? ic('check', 16) : '') + '</span></button>';
      }).join('') +
      '<div class="role-foot">' + ic('info', 14) + '<span>Three roles, several examples of a manager. Rename any of them in Settings.</span></div>';
    var hs = document.getElementById('hierBtn');
    hs.innerHTML = ic('network', 14) + '<span class="hs-text">' + esc(APP.scopePath()) + '</span>' + ic('chevrons-up-down', 14);
    hs.hidden = APP.is('employee');
    document.getElementById('profileBtn').innerHTML = av(me, 28) + '<span class="pb-name desktop-only">' + esc(me.name.split(' ')[0]) + '</span><span class="pb-chevron desktop-only">' + ic('chevron-down', 16) + '</span>';
    document.getElementById('profilePop').innerHTML =
      '<div class="pm-head">' + av(me, 40) + '<div class="pm-id"><span class="pm-name">' + esc(me.name) + '</span><span class="pm-email">' + esc(me.title) + '</span>' +
      '<a class="pm-viewprofile" href="#/org/' + me.id + '">Open my record</a></div></div>' +
      '<hr class="divider">' +
      '<div class="pm-scope"><span class="pm-field-label">What this role sees</span><span class="pm-scope-path">' + esc(APP.scopePath()) + '</span><span class="pm-scope-note">' + esc(APP.persona().note) + '</span></div>' +
      '<hr class="divider">' +
      '<button class="pm-item" data-act="theme"><span>Switch theme</span>' + ic('moon', 16) + '</button>' +
      '<button class="pm-item" data-act="about"><span>About this wireframe</span>' + ic('info', 16) + '</button>' +
      '<button class="btn btn-solid pm-signout" data-act="sign-out">' + ic('log-out', 16, 'btn-icon') + 'Sign out</button>';
    renderNotifs();
  }
  function notifs() { return D.NOTIFS[S.personaKey] || []; }
  function renderNotifs() {
    var list = notifs(), unread = list.filter(function (n) { return n.unread; }).length;
    var b = document.getElementById('notifCount'); b.textContent = unread; b.hidden = !unread;
    document.getElementById('notifPop').innerHTML =
      '<div class="np-head"><span class="panel-title t-3">Notifications</span>' + (unread ? '<button class="btn btn-ghost is-sm" data-act="notifs-read">Mark all read</button>' : '') + '</div>' +
      '<div class="np-list">' + (list.length ? list.map(function (n, i) {
        return '<button class="np-item' + (n.unread ? ' is-unread' : '') + '" data-act="notif-go" data-i="' + i + '"><span class="np-ic">' + ic(n.ic, 16) + '</span><span class="np-text">' + esc(n.t) + '<span class="np-time">' + n.time + ' ago</span></span></button>';
      }).join('') : '<div class="np-empty">Nothing waiting for you.</div>') + '</div>';
  }
  APP.renderNotifs = renderNotifs;
  APP.plural = function (w) {
    w = String(w || '');
    if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
    if (/(s|x|z|ch|sh)$/i.test(w)) return w + 'es';
    return w + 's';
  };
  APP.terms = function (key) { return APP.plural(APP.term(key)); };
  APP.renderShellOnly = function () { renderShell(); APP.rerender(); };

  function renderNav() {
    var cur = S.route[0];
    var html = '<button class="sidebar-toggle desktop-only" aria-label="Collapse navigation" data-act="collapse-nav">' + ic('panel-left', 18) + '</button>';
    APP.nav().forEach(function (it) {
      var on = cur === it[0] || (cur === 'coaching' && it[0] === 'todo' && !APP.is('employee')), n = APP.navCount(it[0]);
      html += '<a class="nav-item' + (on ? ' is-active' : '') + '" href="#/' + it[0] + '"' + (on ? ' aria-current="page"' : '') + ' title="' + esc(it[1]) + '">' + ic(it[2], 18, 'nav-icon') + '<span class="nav-label">' + esc(it[1]) + '</span>' + (n ? '<span class="nav-count">' + n + '</span>' : '') + '</a>';
    });
    html += '<div class="nav-foot"><button class="nav-help" data-act="about">' + ic('circle-help', 18, 'nav-icon') + '<span class="nav-label">About this wireframe</span></button></div>';
    document.getElementById('sidebar').innerHTML = html;
    document.getElementById('bottomNav').innerHTML = APP.nav().slice(0, 5).map(function (b) {
      var on = cur === b[0], n = APP.navCount(b[0]);
      return '<a class="bn-item' + (on ? ' is-active' : '') + '" href="#/' + b[0] + '"' + (on ? ' aria-current="page"' : '') + '><span class="bn-ic">' + ic(b[2], 20) + (n ? '<span class="bn-count">' + n + '</span>' : '') + '</span><span>' + esc(b[3]) + '</span></a>';
    }).join('');
  }

  /* ---------------- page frame ---------------- */
  APP.page = function (o) {
    var crumbs = '<div class="breadcrumbs">' + (o.crumbs || []).map(function (c, i, arr) {
      var last = i === arr.length - 1;
      return (i ? '<span class="sep">' + ic('chevron-right', 16) + '</span>' : '') + (last ? '<span class="current">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>');
    }).join('') + '</div>';
    var head = o.title ? '<header class="page-header' + (o.action ? ' has-action' : '') + '"><div><h1>' + o.title + '</h1>' + (o.desc ? '<p>' + o.desc + '</p>' : '') + '</div>' + (o.action ? '<div class="page-action">' + o.action + '</div>' : '') + '</header>' : '';
    if (o.flush) return crumbs + '<div class="content-body is-flush">' + o.body + '</div>';
    return crumbs + '<div class="content-body">' + head + (o.tabs || '') + '<div class="page-main">' + o.body + '</div></div>' +
      '<footer class="app-footer">skyPerformance wireframe for ' + esc(D.CONFIG.org) + '. Fictional company, sample data only. <a href="#/home" data-act="about">About this wireframe</a></footer>';
  };

  /* ---------------- router ---------------- */
  function parse() { var h = (location.hash || '#/home').replace(/^#\/?/, ''); return h ? h.split('/') : ['home']; }
  function render() {
    var r = parse();
    if (!APP.VIEWS[r[0]] || !allowed(r[0])) { if (location.hash && location.hash !== '#/home') { location.replace('#/home'); } r = ['home']; }
    var key = r.join('/'), changed = key !== S.lastRouteKey;
    S.route = r; S.lastRouteKey = key;
    renderNav(); closePops();
    var c = document.getElementById('content');
    c.innerHTML = APP.VIEWS[r[0]](r);
    c.querySelectorAll('[data-ic]').forEach(fillIc);
    if (changed) c.scrollTop = 0;
    APP.AFTER.forEach(function (fn) { fn(r); });
    closeNav();
  }
  APP.rerender = function () { var c = document.getElementById('content'); var top = c.scrollTop; render(); c.scrollTop = top; };
  APP.go = function (hash) { if (location.hash === hash) APP.rerender(); else location.hash = hash; };
  function fillIc(el) { el.innerHTML = ic(el.getAttribute('data-ic'), +el.getAttribute('data-size') || 16); el.removeAttribute('data-ic'); }
  APP.fillIcons = function (root) { root.querySelectorAll('[data-ic]').forEach(fillIc); };

  /* ---------------- overlays ---------------- */
  var host = function () { return document.getElementById('overlayHost'); };
  APP.dialog = function (o) {
    host().insertAdjacentHTML('beforeend', '<div class="overlay" data-overlay><div class="dialog ' + (o.size || '') + '" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">' +
      '<div class="dlg-head"><div><div class="dialog-title" id="dlgTitle">' + o.title + '</div>' + (o.sub ? '<div class="dlg-sub">' + o.sub + '</div>' : '') + '</div><button class="btn btn-ghost is-icon" aria-label="Close" data-act="close-overlay">' + ic('x', 18) + '</button></div>' +
      '<div class="dialog-body dlg-scroll">' + o.body + '</div>' + (o.footer ? '<div class="dialog-footer">' + o.footer + '</div>' : '') + '</div></div>');
    var el = host().lastElementChild; APP.fillIcons(el); return el;
  };
  APP.closeOverlay = function () { var h = host(); if (h.lastElementChild) h.removeChild(h.lastElementChild); };
  APP.closeAll = function () { host().innerHTML = ''; };
  APP.toast = function (title, body, kind) {
    var t = document.createElement('div');
    t.className = 'toast is-' + (kind || 'success');
    t.innerHTML = '<span class="toast-ic">' + ic(kind === 'info' ? 'info' : kind === 'warning' ? 'triangle-alert' : kind === 'danger' ? 'circle-alert' : 'circle-check', 18) + '</span><div><div class="toast-title">' + esc(title) + '</div>' + (body ? '<div class="toast-body">' + esc(body) + '</div>' : '') + '</div>';
    document.getElementById('toastHost').appendChild(t);
    setTimeout(function () { t.classList.add('is-leaving'); setTimeout(function () { t.remove(); }, 220); }, 3800);
  };
  function closePops(except) {
    document.querySelectorAll('.pop').forEach(function (p) {
      if (p !== except && !p.hidden) { p.hidden = true; var b = document.querySelector('[data-pop="' + p.id + '"]'); if (b) b.setAttribute('aria-expanded', 'false'); }
    });
    var sp = document.getElementById('searchPop'); if (sp && except !== sp) sp.hidden = true;
  }
  APP.closePops = closePops;
  function openNav() { document.body.classList.add('nav-open'); document.getElementById('navScrim').hidden = false; }
  function closeNav() { document.body.classList.remove('nav-open'); document.getElementById('navScrim').hidden = true; }

  /* ---------------- search ---------------- */
  APP.searchResults = function (q) {
    q = q.trim().toLowerCase(); if (!q) return '';
    var people = APP.people().filter(function (x) { return (x.name + ' ' + x.title + ' ' + x.dept).toLowerCase().indexOf(q) >= 0; }).slice(0, 4);
    var recs = APP.records().filter(function (r) { return (r.id + ' ' + (r.topic || '') + ' ' + (r.text || '')).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    var pips = APP.pips().filter(function (x) { return (x.id + ' ' + P(x.emp).name + ' ' + x.offense).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    var acts = APP.actions().filter(function (a) { return (a.id + ' ' + a.t).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    if (!people.length && !recs.length && !pips.length && !acts.length) return '<div class="sp-empty">Nothing you can see matches "' + esc(q) + '".</div>';
    var h = '';
    if (people.length) h += '<div class="sp-group">People</div>' + people.map(function (x) {
      return '<button class="sp-item" data-act="goto-person" data-id="' + x.id + '">' + av(x, 24) + '<span class="sp-text"><span>' + esc(x.name) + '</span><span class="sp-sub">' + esc(x.title) + ', ' + esc(D.siteName(x.site)) + '</span></span></button>'; }).join('');
    if (recs.length) h += '<div class="sp-group">' + esc(APP.term('coaching')) + '</div>' + recs.map(function (r) {
      return '<button class="sp-item" data-act="open-record" data-id="' + r.id + '"><span class="sp-ic">' + ic('message-square-text', 16) + '</span><span class="sp-text"><span>' + esc(r.topic || D.coachingType(r.type).name) + '</span><span class="sp-sub">' + esc(r.id) + ', ' + esc(r.on) + '</span></span></button>'; }).join('');
    if (pips.length) h += '<div class="sp-group">' + esc(APP.term('pipShort')) + 's</div>' + pips.map(function (x) {
      return '<a class="sp-item" href="#/pips/' + x.id + '"><span class="sp-ic">' + ic('clipboard-check', 16) + '</span><span class="sp-text"><span>' + esc(x.id) + ', ' + esc(D.pipLevel(x.level).name) + '</span><span class="sp-sub">' + esc(P(x.emp).name) + ', ' + esc(x.status) + '</span></span></a>'; }).join('');
    if (acts.length) h += '<div class="sp-group">To-dos</div>' + acts.map(function (a) {
      return '<button class="sp-item" data-act="open-action" data-id="' + a.id + '"><span class="sp-ic">' + ic('list-checks', 16) + '</span><span class="sp-text"><span>' + esc(a.t) + '</span><span class="sp-sub">' + esc(a.id) + ', owner ' + esc(P(a.owner).name) + '</span></span></button>'; }).join('');
    return h;
  };

  /* ---------------- shared actions ---------------- */
  var A = APP.ACT;
  A['toggle-pop'] = function (el) {
    var p = document.getElementById(el.getAttribute('data-pop')); if (!p) return;
    var open = p.hidden; closePops(); p.hidden = !open; el.setAttribute('aria-expanded', String(open));
  };
  A['dd-pick'] = function (el) {
    var k = el.getAttribute('data-key'), v = el.getAttribute('data-val');
    S.f[k] = v; closePops();
    var trig = document.querySelector('[data-pop="dd-' + k + '"] .dd-value');
    if (trig) trig.textContent = el.textContent.trim();
    if (APP.DD[k]) APP.DD[k](v, el);
    else if (!el.closest('#overlayHost')) APP.rerender();
  };
  A['close-overlay'] = function () { APP.closeOverlay(); };
  A['dismiss-banner'] = function () { document.getElementById('demoBanner').hidden = true; };
  A.theme = function () {
    var h = document.documentElement, dark = h.getAttribute('data-theme') === 'dark';
    h.setAttribute('data-theme', dark ? 'light' : 'dark');
    try { localStorage.setItem('sp-theme', dark ? 'light' : 'dark'); } catch (e) {}
    closePops();
  };
  A['set-role'] = function (el) {
    S.personaKey = el.getAttribute('data-role'); S.f = {}; S.runner = null; S.wizard = null;
    try { localStorage.setItem('sp-persona', S.personaKey); } catch (e) {}
    APP.closeAll(); renderShell();
    if (!allowed(S.route[0])) location.hash = '#/home'; else APP.go('#/' + S.route[0]);
    APP.rerender();
    APP.toast('Viewing as ' + APP.roleLabel() + (APP.isManager() ? ', ' + APP.levelLabel().toLowerCase() : ''),
      APP.me().name + '. ' + APP.scopeNote() + '.', 'info');
  };
  A['open-nav'] = openNav; A['close-nav'] = closeNav;
  A['collapse-nav'] = function () { document.body.classList.toggle('nav-collapsed'); };
  A['notifs-read'] = function () { notifs().forEach(function (n) { n.unread = false; }); renderNotifs(); document.getElementById('notifPop').hidden = false; };
  A['notif-go'] = function (el) { var n = notifs()[+el.getAttribute('data-i')]; n.unread = false; renderNotifs(); closePops(); APP.go(n.go); };
  A['goto-person'] = function (el) {
    var id = el.getAttribute('data-id');
    if (APP.is('employee')) { APP.go('#/home'); return; }
    closePops(); APP.closeAll(); APP.go('#/org/' + id);
  };
  A.goto = function (el) { APP.closeAll(); APP.go(el.getAttribute('data-href')); };
  A['sign-out'] = function () {
    closePops();
    host().insertAdjacentHTML('beforeend', '<div class="signed-out" data-overlay><div class="so-card card">' + brandMark(40) +
      '<h2 class="t-6 fw-bold">You are signed out</h2><p class="text-low">Shared devices sign out on their own after five minutes. Nothing from the session stays on the screen.</p>' +
      '<button class="btn btn-solid is-lg" data-act="sign-in">' + ic('log-in', 16, 'btn-icon') + 'Sign in with ' + esc(D.CONFIG.org) + ' single sign on</button></div></div>');
  };
  A['sign-in'] = function () { APP.closeAll(); APP.go('#/home'); APP.toast('Signed in', 'Welcome back, ' + APP.me().name.split(' ')[0] + '.'); };
  A['mobile-search'] = function () {
    APP.dialog({ title: 'Search', sub: 'Scoped to what your role can see', body: '<div class="search search-full"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="msearch" placeholder="Person, form id, case id or action" aria-label="Search"></div><div class="msearch-results" id="msearchResults"><p class="text-low t-1">Try a name, "FM-", "PC-" or "AI-".</p></div>' });
  };
  APP.INPUT.msearch = function (el) { var h = APP.searchResults(el.value); document.getElementById('msearchResults').innerHTML = h || '<p class="text-low t-1">Try a name, "FM-", "PC-" or "AI-".</p>'; APP.fillIcons(document.getElementById('msearchResults')); };
  A.copy = function (el) { APP.toast('Copied', el.getAttribute('data-what') || 'Copied to clipboard.'); };
  A.toast = function (el) { APP.toast(el.getAttribute('data-t') || 'Done', el.getAttribute('data-b') || '', el.getAttribute('data-k') || 'success'); };
  A.export = function (el) { APP.toast('Export queued', (el.getAttribute('data-what') || 'The file') + ' will download when it is built. Every export is logged against your name.', 'info'); };
  A.about = function () {
    closePops();
    var t = D.CONFIG.terms;
    APP.dialog({
      title: 'About this wireframe', size: 'is-wide',
      sub: 'skyPerformance, scoped to the client functional scope v2.',
      body: APP.callout('One idea: managers need <b>one place to document a conversation</b>, and that record has to be there years later. Everything else hangs off it.', 'is-info', 'route') +
        '<h3 class="section-label">Three roles, renameable</h3>' +
        '<div class="epic-list">' + ['employee', 'manager', 'hr'].map(function (k) {
          var ex = D.PERSONAS.filter(function (x) { return x.role === k; });
          return '<div class="epic-row"><span class="epic-id">' + esc(D.CONFIG.roles[k].slice(0, 2).toUpperCase()) + '</span><div><div class="epic-name">' + esc(D.CONFIG.roles[k]) + '</div>' +
            '<div class="epic-where">' + esc(ex.map(function (x) { return P(x.person).name + (x.role === 'manager' ? ' (' + D.CONFIG.levels[P(x.person).level] + ')' : ''); }).join(', ')) + '</div></div></div>';
        }).join('') + '</div>' +
        '<h3 class="section-label">Where things live</h3>' +
        '<div class="epic-list">' + [
          [t.coaching, 'The front door. Pick a type, write what happened, submit. The employee is notified and acknowledges.'],
          ['To-dos', 'Action items raised anywhere, landing on the owner page. Site visit findings land on the Executive Director page.'],
          [APP.plural(t.pipShort), 'The client PIP form: four levels, SMART actions, meetings, resolution, termination detail.'],
          ['Evaluations', 'The exempt evaluation form, scored 1 to 4, with a total and a percentage.'],
          [APP.plural(t.visit), '172 items across 17 sections, regional and up, with photos and an action plan.'],
          ['Org chart', 'Read from ' + D.CONFIG.hris + '. It decides who can document whom.'],
          ['Records', 'Any file, any date range, plus deleted records and the export log.'],
          ['Settings', 'Rename roles, levels and terms. Choose what reaches ' + D.CONFIG.hris + '.']
        ].map(function (e) {
          return '<div class="epic-row"><span class="epic-id">' + ic('chevron-right', 14) + '</span><div><div class="epic-name">' + esc(e[0]) + '</div><div class="epic-where">' + esc(e[1]) + '</div></div></div>';
        }).join('') + '</div>' +
        '<p class="text-low t-1 about-note">Wireframe only. ' + esc(D.CONFIG.org) + ' is a fictional operator and every person, number and quotation is invented for design review. The forms follow the ones the client supplied.</p>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Rename roles and terms', 'btn-soft', 'settings', 'data-act="goto" data-href="#/settings/labels"')
    });
  };
  function brandMark(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" aria-hidden="true" role="img">' +
      '<circle cx="3.3" cy="12.6" r="2.1" fill="var(--accent-9)"/>' +
      '<path d="M0.6 21v-1.6a2.7 2.7 0 0 1 5.4 0V21z" fill="var(--accent-9)"/>' +
      '<rect x="8" y="12" width="4.2" height="9" rx="0.5" fill="var(--fg-high)"/>' +
      '<rect x="14.2" y="7.4" width="4.2" height="13.6" rx="0.5" fill="var(--fg-high)"/>' +
      '<path d="M16.3 1.8l4.3 5.6h-8.6z" fill="var(--fg-high)"/>' +
      '</svg>';
  }
  APP.brandMark = brandMark;

  /* ---------------- boot ---------------- */
  APP.start = function () {
    var qs = new URLSearchParams(location.search);
    var saved = null; try { saved = localStorage.getItem('sp-persona'); } catch (e) {}
    S.personaKey = qs.get('role') || saved || 'dept';
    if (!D.PERSONAS.some(function (r) { return r.key === S.personaKey; })) S.personaKey = 'dept';
    try { var th = localStorage.getItem('sp-theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
    document.querySelectorAll('[data-ic]').forEach(fillIc);
    document.getElementById('brandMark').innerHTML = brandMark(22);

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]');
      if (t && !t.disabled) { var fn = A[t.getAttribute('data-act')]; if (fn) { e.preventDefault(); fn(t, e); return; } }
      if (e.target.matches('[data-overlay]')) { APP.closeOverlay(); return; }
      if (!e.target.closest('.pop') && !e.target.closest('.header-search')) closePops();
      var a = e.target.closest('a[href^="#/"]');
      if (a && host().lastElementChild) APP.closeAll();
    });
    document.addEventListener('input', function (e) { var n = e.target.getAttribute('data-input'); if (n && APP.INPUT[n]) APP.INPUT[n](e.target, e); });
    document.addEventListener('change', function (e) { var n = e.target.getAttribute('data-change'); if (n && APP.INPUT[n]) APP.INPUT[n](e.target, e); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (document.querySelector('.pop:not([hidden])')) closePops(); else if (host().lastElementChild) APP.closeOverlay(); }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-enter]')) { e.preventDefault(); var fn = A[e.target.getAttribute('data-enter')]; if (fn) fn(e.target, e); }
    });
    var gs = document.getElementById('globalSearchInput'), sp = document.getElementById('searchPop');
    gs.addEventListener('input', function () { var h = APP.searchResults(gs.value); sp.innerHTML = h; sp.hidden = !h; APP.fillIcons(sp); });
    gs.addEventListener('focus', function () { if (gs.value) { sp.innerHTML = APP.searchResults(gs.value); sp.hidden = false; APP.fillIcons(sp); } });
    window.addEventListener('hashchange', render);
    renderShell(); render();
  };
})();
