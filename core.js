/* skyPerformance wireframe: shell, router, role scoping, overlays and the shared
   DS helpers every view builds from. Views register renderers on APP.VIEWS and
   click handlers on APP.ACT. Everything is event delegated through data-act, so
   re-rendered markup never needs rebinding. */
(function () {
  var D = window.SP;
  var APP = window.APP = { VIEWS: {}, ACT: {}, INPUT: {}, DD: {}, AFTER: [] };
  var S = APP.S = { roleKey: 'manager', route: [], f: {}, lastRouteKey: '', runner: null, wizard: null };

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
      Open: 'is-info', 'In progress': 'is-info', Scheduled: 'is-info', 'Sent to leader': 'is-info',
      Completed: 'is-success', Closed: 'is-success', Active: 'is-success', Approved: 'is-success', Accepted: 'is-success', 'Meets standard': 'is-success', Recognition: 'is-success', Acknowledged: 'is-success',
      Overdue: 'is-danger', 'Needs improvement': 'is-danger', Blocked: 'is-danger', Declined: 'is-danger',
      'Pending approval': 'is-warning', Waiting: 'is-warning', Warned: 'is-warning', 'Due today': 'is-warning',
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
  APP.bars = function (items, fmt, kind) {
    var max = Math.max.apply(null, items.map(function (i) { return i[1]; })) || 1;
    fmt = fmt || function (v) { return v; };
    return '<div class="hbars">' + items.map(function (i) {
      return '<div class="hbar' + (i[2] ? ' ' + i[2] : '') + '" title="' + esc(i[0]) + ': ' + esc(fmt(i[1])) + '"><span class="hbar-label">' + esc(i[0]) + '</span><span class="hbar-track"><span class="hbar-fill" style="width:' + Math.max(2, i[1] / max * 100).toFixed(1) + '%"></span></span><span class="hbar-val">' + fmt(i[1]) + '</span></div>';
    }).join('') + '</div>';
  };
  /* sparkline from a series, drawn with tokens only */
  APP.spark = function (series, invert) {
    var min = Math.min.apply(null, series), max = Math.max.apply(null, series), rng = (max - min) || 1;
    var pts = series.map(function (v, i) {
      var x = i / (series.length - 1) * 100;
      var y = 28 - (v - min) / rng * 24 - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
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
  APP.dataList = function (rows) {
    /* The DS .data-list is a two column grid over its direct children, so the
       label and value are emitted as siblings, never wrapped in a row div. */
    return '<dl class="data-list">' + rows.map(function (r) { return '<dt class="dl-label">' + r[0] + '</dt><dd class="dl-value">' + r[1] + '</dd>'; }).join('') + '</dl>';
  };
  APP.crumbPath = function (cm) {
    var c = D.cm(cm), r = D.REGIONS.filter(function (x) { return x.id === c.region; })[0];
    return [D.ORG_SHORT, r ? r.name : 'All regions', c.name].join(' / ');
  };

  /* ---------------- role, scope and permissions ---------------- */
  APP.role = function () { for (var i = 0; i < D.ROLES.length; i++) if (D.ROLES[i].key === S.roleKey) return D.ROLES[i]; return D.ROLES[1]; };
  APP.me = function () { return P(APP.role().person); };
  APP.is = function (k) { return S.roleKey === k; };
  APP.isLeader = function () { return ['manager', 'ed', 'regional'].indexOf(S.roleKey) >= 0; };
  APP.canRunForms = function () { return APP.isLeader(); };
  APP.canRunVisits = function () { return ['ed', 'regional', 'quality'].indexOf(S.roleKey) >= 0; };
  APP.canCase = function () { return ['manager', 'ed', 'regional', 'hr'].indexOf(S.roleKey) >= 0; };
  APP.isHR = function () { return S.roleKey === 'hr'; };
  APP.isAdmin = function () { return S.roleKey === 'admin'; };

  /* communities inside the role scope */
  APP.scopeCms = function () {
    var sc = APP.role().scope, me = APP.me();
    if (sc.kind === 'self') return [me.cm];
    if (sc.kind === 'dept' || sc.kind === 'community') return [sc.cm];
    if (sc.kind === 'region') return D.COMMUNITIES.filter(function (c) { return c.region === sc.region; }).map(function (c) { return c.id; });
    return D.COMMUNITIES.map(function (c) { return c.id; });
  };
  APP.scopeLabel = function () {
    var sc = APP.role().scope;
    if (sc.kind === 'self') return APP.me().name;
    if (sc.kind === 'dept') return D.cmName(sc.cm) + ' / ' + sc.dept.join(' and ');
    if (sc.kind === 'community') return D.cmName(sc.cm);
    if (sc.kind === 'region') return (D.REGIONS.filter(function (r) { return r.id === sc.region; })[0] || {}).name + ' region, ' + APP.scopeCms().length + ' communities';
    return D.ORG + ', all ' + D.COMMUNITIES.length + ' communities';
  };
  APP.scopePath = function () {
    var sc = APP.role().scope, me = APP.me();
    var parts = [D.ORG_SHORT];
    if (sc.kind === 'org') return parts.concat(['All regions']).join(' / ');
    if (sc.kind === 'region') return parts.concat([(D.REGIONS.filter(function (r) { return r.id === sc.region; })[0] || {}).name]).join(' / ');
    var c = D.cm(sc.cm || me.cm), r = D.REGIONS.filter(function (x) { return x.id === c.region; })[0];
    parts.push(r ? r.name : ''); parts.push(c.name);
    if (sc.kind === 'dept') parts.push(sc.dept.join(' + '));
    if (sc.kind === 'self') parts.push(me.name);
    return parts.filter(Boolean).join(' / ');
  };
  /* people the role may see */
  APP.people = function () {
    var sc = APP.role().scope, me = APP.me(), cms = APP.scopeCms();
    if (sc.kind === 'self') return [me];
    return D.PEOPLE.filter(function (p) {
      if (!p.cm) return sc.kind === 'org';
      if (cms.indexOf(p.cm) < 0) return false;
      if (sc.kind === 'dept') return sc.dept.indexOf(p.dept) >= 0 || p.id === me.id;
      return true;
    });
  };
  APP.inScope = function (personId) { return APP.people().some(function (p) { return p.id === personId; }); };
  /* records filtered to the scope */
  APP.tasks = function () {
    var me = APP.me();
    if (APP.is('frontline')) return D.TASKS.filter(function (t) { return t.emp === me.id; });
    if (APP.is('quality') || APP.isHR() || APP.isAdmin()) return D.TASKS.slice();
    var cms = APP.scopeCms();
    return D.TASKS.filter(function (t) { return cms.indexOf(t.cm) >= 0 && (APP.inScope(t.emp) || t.owner === me.id || t.emp === me.id); });
  };
  APP.myTasks = function () { var me = APP.me(); return APP.tasks().filter(function (t) { return t.owner === me.id; }); };
  APP.forms = function () {
    var me = APP.me();
    if (APP.is('frontline')) return D.FORMS.filter(function (f) { return f.emp === me.id; });
    var cms = APP.scopeCms();
    return D.FORMS.filter(function (f) { return cms.indexOf(f.cm) >= 0; });
  };
  APP.actions = function () {
    var me = APP.me();
    if (APP.is('frontline')) return D.ACTIONS.filter(function (a) { return a.owner === me.id; });
    var cms = APP.scopeCms();
    return D.ACTIONS.filter(function (a) { return cms.indexOf(a.cm) >= 0; });
  };
  APP.cases = function () {
    var me = APP.me();
    if (APP.is('frontline')) return D.CASES.filter(function (c) { return c.emp === me.id; });
    var cms = APP.scopeCms();
    return D.CASES.filter(function (c) { return cms.indexOf(c.cm) >= 0; });
  };
  APP.visits = function () {
    var cms = APP.scopeCms();
    return D.VISITS.filter(function (v) { return cms.indexOf(v.cm) >= 0; });
  };
  APP.approvalsFor = function () {
    var me = APP.me();
    return D.CASES.filter(function (c) {
      return c.status === 'Pending approval' && c.approvals.some(function (a) { return a.who === me.id && a.state === 'Waiting'; });
    });
  };
  APP.overdue = function (list) { return list.filter(function (x) { return x.status === 'Overdue'; }); };

  /* ---------------- navigation ---------------- */
  var NAV = {
    frontline: [['home', 'My dashboard', 'house', 'Home'], ['coaching', 'My coaching', 'clipboard-list', 'Coaching'], ['actions', 'My action items', 'list-checks', 'Actions'], ['docs', 'My documents', 'folder', 'Documents']],
    manager: [['home', 'My work', 'house', 'Home'], ['coaching', 'Coaching', 'clipboard-list', 'Coaching'], ['actions', 'Action items', 'list-checks', 'Actions'], ['cases', 'Performance cases', 'gavel', 'Cases'], ['people', 'My team', 'users', 'Team'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports', 'chart-column', 'Reports']],
    ed: [['home', 'My work', 'house', 'Home'], ['coaching', 'Coaching', 'clipboard-list', 'Coaching'], ['visits', 'Site visits', 'building-2', 'Visits'], ['actions', 'Action items', 'list-checks', 'Actions'], ['cases', 'Performance cases', 'gavel', 'Cases'], ['people', 'People', 'users', 'People'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports', 'chart-column', 'Reports']],
    regional: [['home', 'Region overview', 'house', 'Region'], ['coaching', 'Coaching', 'clipboard-list', 'Coaching'], ['visits', 'Site visits', 'building-2', 'Visits'], ['actions', 'Action items', 'list-checks', 'Actions'], ['cases', 'Performance cases', 'gavel', 'Cases'], ['people', 'People', 'users', 'People'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports', 'chart-column', 'Reports']],
    hr: [['home', 'My queue', 'house', 'Queue'], ['cases', 'Performance cases', 'gavel', 'Cases'], ['people', 'People', 'users', 'People'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports and export', 'chart-column', 'Reports'], ['settings', 'Configuration', 'settings', 'Config']],
    quality: [['home', 'My work', 'house', 'Home'], ['coaching', 'Cross group', 'shield', 'Cross group'], ['visits', 'Rounding', 'building-2', 'Rounding'], ['actions', 'Action items', 'list-checks', 'Actions'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports', 'chart-column', 'Reports']],
    admin: [['home', 'Platform health', 'house', 'Health'], ['people', 'People and hierarchy', 'users', 'People'], ['docs', 'Documents', 'folder', 'Docs'], ['reports', 'Reports', 'chart-column', 'Reports'], ['settings', 'Configuration', 'settings', 'Config']]
  };
  APP.nav = function () { return NAV[S.roleKey] || NAV.manager; };
  function allowed(r0) { return APP.nav().some(function (n) { return n[0] === r0; }); }

  /* ---------------- shell ---------------- */
  function renderShell() {
    var r = APP.role(), me = APP.me();
    document.getElementById('brandScope').innerHTML = ic('network', 14) + '<span>' + esc(APP.scopePath()) + '</span>';
    document.getElementById('roleValue').textContent = r.label;
    document.getElementById('rolePop').innerHTML =
      '<div class="list-item is-header">View the product as</div>' +
      D.ROLES.map(function (x) {
        var sel = x.key === S.roleKey, p = P(x.person);
        return '<button class="list-item role-item' + (sel ? ' is-selected' : '') + '" role="menuitemradio" aria-checked="' + sel + '" data-act="set-role" data-role="' + x.key + '">' + av(p, 28) +
          '<span class="ri-text"><span class="ri-title">' + esc(x.label) + '</span><span class="ri-sub">' + esc(p.name) + ', ' + esc(x.sub) + '</span></span><span class="list-check">' + (sel ? ic('check', 16) : '') + '</span></button>';
      }).join('') +
      '<div class="role-foot">' + ic('info', 14) + '<span>Switching role re-scopes every screen. Nothing else changes.</span></div>';
    document.getElementById('profileBtn').innerHTML = av(me, 28) + '<span class="pb-name desktop-only">' + esc(me.name.split(' ')[0]) + '</span><span class="pb-chevron desktop-only">' + ic('chevron-down', 16) + '</span>';
    document.getElementById('profilePop').innerHTML =
      '<div class="pm-head">' + av(me, 40) + '<div class="pm-id"><span class="pm-name">' + esc(me.name) + '</span><span class="pm-email">' + esc(me.title) + '</span>' +
      (me.cm ? '<a class="pm-viewprofile" href="#/people/' + me.id + '">Open my record</a>' : '<span class="pm-email">' + esc(D.ORG) + '</span>') + '</div></div>' +
      '<hr class="divider">' +
      '<div class="pm-scope"><span class="pm-field-label">Hierarchy scope</span><span class="pm-scope-path">' + esc(APP.scopePath()) + '</span><span class="pm-scope-note">' + esc(r.note) + '</span></div>' +
      '<hr class="divider">' +
      '<button class="pm-item" data-act="theme"><span>Switch theme</span>' + ic('moon', 16) + '</button>' +
      '<button class="pm-item" data-act="about"><span>About this wireframe</span>' + ic('info', 16) + '</button>' +
      '<button class="btn btn-solid pm-signout" data-act="sign-out">' + ic('log-out', 16, 'btn-icon') + 'Sign out</button>';
    renderNotifs();
  }
  function notifs() { return D.NOTIFS[S.roleKey] || []; }
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

  function renderNav() {
    var cur = S.route[0];
    var html = '<button class="sidebar-toggle desktop-only" aria-label="Collapse navigation" data-act="collapse-nav">' + ic('panel-left', 18) + '</button>';
    html += '<div class="nav-section">' + esc(APP.role().label) + '</div>';
    APP.nav().forEach(function (it) {
      var on = cur === it[0], n = APP.navCount(it[0]);
      html += '<a class="nav-item' + (on ? ' is-active' : '') + '" href="#/' + it[0] + '"' + (on ? ' aria-current="page"' : '') + ' title="' + esc(it[1]) + '">' + ic(it[2], 18, 'nav-icon') + '<span class="nav-label">' + esc(it[1]) + '</span>' + (n ? '<span class="nav-count">' + n + '</span>' : '') + '</a>';
    });
    html += '<div class="nav-foot"><button class="nav-help" data-act="about">' + ic('circle-help', 18, 'nav-icon') + '<span class="nav-label">How this maps to the spec</span></button></div>';
    document.getElementById('sidebar').innerHTML = html;
    var bn = APP.nav().slice(0, 5);
    document.getElementById('bottomNav').innerHTML = bn.map(function (b) {
      var on = cur === b[0], n = APP.navCount(b[0]);
      return '<a class="bn-item' + (on ? ' is-active' : '') + '" href="#/' + b[0] + '"' + (on ? ' aria-current="page"' : '') + '><span class="bn-ic">' + ic(b[2], 20) + (n ? '<span class="bn-count">' + n + '</span>' : '') + '</span><span>' + esc(b[3] || b[1]) + '</span></a>';
    }).join('');
  }
  APP.navCount = function (route) {
    if (route === 'coaching') return APP.is('quality') ? D.CROSS.filter(function (x) { return x.state === 'Sent to leader'; }).length : APP.myTasks().filter(function (t) { return t.status === 'Open' || t.status === 'Overdue' || t.status === 'Draft'; }).length;
    if (route === 'actions') return APP.actions().filter(function (a) { return a.status === 'Overdue' || (a.status === 'Open' && (APP.is('frontline') || a.owner === APP.me().id)); }).length;
    if (route === 'cases') return APP.approvalsFor().length;
    return 0;
  };

  /* ---------------- page frame ---------------- */
  APP.page = function (o) {
    var crumbs = '<div class="breadcrumbs">' + (o.crumbs || []).map(function (c, i, arr) {
      var last = i === arr.length - 1;
      return (i ? '<span class="sep">' + ic('chevron-right', 16) + '</span>' : '') + (last ? '<span class="current">' + esc(c[0]) + '</span>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>');
    }).join('') + '</div>';
    var head = o.title ? '<header class="page-header' + (o.action ? ' has-action' : '') + '"><div><h1>' + o.title + '</h1>' + (o.desc ? '<p>' + o.desc + '</p>' : '') + '</div>' + (o.action ? '<div class="page-action">' + o.action + '</div>' : '') + '</header>' : '';
    if (o.flush) return crumbs + '<div class="content-body is-flush">' + o.body + '</div>';
    return crumbs + '<div class="content-body">' + head + (o.scope === false ? '' : scopeStrip()) + (o.tabs || '') + '<div class="page-main">' + o.body + '</div></div>' +
      '<footer class="app-footer">skyPerformance wireframe for ' + esc(D.ORG) + '. Sample data only, no real employee records. <a href="#/home" data-act="about">How this maps to the spec</a></footer>';
  };
  function scopeStrip() {
    return '<div class="scope-strip">' + ic('network', 16) +
      '<span class="ss-path">' + esc(APP.scopePath()) + '</span>' +
      '<span class="ss-sep"></span>' +
      '<span class="ss-note">' + esc(APP.role().label) + ' scope, ' + APP.people().length + ' people, ' + APP.scopeCms().length + ' ' + (APP.scopeCms().length === 1 ? 'community' : 'communities') + '</span>' +
      '<span class="ss-spacer"></span>' +
      '<button class="btn btn-ghost is-sm" data-act="open-hierarchy">' + ic('chevrons-up-down', 16, 'btn-icon') + 'Change scope</button></div>';
  }

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
    var html = '<div class="overlay" data-overlay><div class="dialog ' + (o.size || '') + '" role="dialog" aria-modal="true" aria-labelledby="dlgTitle">' +
      '<div class="dlg-head"><div><div class="dialog-title" id="dlgTitle">' + o.title + '</div>' + (o.sub ? '<div class="dlg-sub">' + o.sub + '</div>' : '') + '</div><button class="btn btn-ghost is-icon" aria-label="Close" data-act="close-overlay">' + ic('x', 18) + '</button></div>' +
      '<div class="dialog-body dlg-scroll">' + o.body + '</div>' + (o.footer ? '<div class="dialog-footer">' + o.footer + '</div>' : '') + '</div></div>';
    host().insertAdjacentHTML('beforeend', html);
    var el = host().lastElementChild; APP.fillIcons(el);
    return el;
  };
  APP.drawer = function (o) {
    host().insertAdjacentHTML('beforeend', '<div class="overlay is-drawer" data-overlay><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drTitle">' +
      '<div class="dlg-head"><div><div class="dialog-title" id="drTitle">' + o.title + '</div>' + (o.sub ? '<div class="dlg-sub">' + o.sub + '</div>' : '') + '</div><button class="btn btn-ghost is-icon" aria-label="Close" data-act="close-overlay">' + ic('x', 18) + '</button></div>' +
      '<div class="drawer-body">' + o.body + '</div>' + (o.footer ? '<div class="drawer-foot">' + o.footer + '</div>' : '') + '</aside></div>');
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

  /* ---------------- global search ---------------- */
  APP.searchResults = function (q) {
    q = q.trim().toLowerCase(); if (!q) return '';
    var people = APP.people().filter(function (p) { return (p.name + ' ' + p.title + ' ' + p.dept).toLowerCase().indexOf(q) >= 0; }).slice(0, 4);
    var forms = APP.forms().filter(function (f) { return (f.id + ' ' + (D.formType(f.ft) || {}).name + ' ' + P(f.emp).name + ' ' + f.summary).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    var cases = APP.cases().filter(function (c) { return (c.id + ' ' + P(c.emp).name + ' ' + c.sub).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    var acts = APP.actions().filter(function (a) { return (a.id + ' ' + a.t).toLowerCase().indexOf(q) >= 0; }).slice(0, 3);
    if (!people.length && !forms.length && !cases.length && !acts.length) return '<div class="sp-empty">Nothing in your scope matches "' + esc(q) + '". Retrieval is scoped to the hierarchy branch you are in.</div>';
    var h = '';
    if (people.length) h += '<div class="sp-group">People</div>' + people.map(function (p) { return '<button class="sp-item" data-act="goto-person" data-id="' + p.id + '">' + av(p, 24) + '<span class="sp-text"><span>' + esc(p.name) + '</span><span class="sp-sub">' + esc(p.title) + ', ' + esc(D.cmName(p.cm)) + '</span></span></button>'; }).join('');
    if (forms.length) h += '<div class="sp-group">Documented forms</div>' + forms.map(function (f) { return '<button class="sp-item" data-act="open-form" data-id="' + f.id + '"><span class="sp-ic">' + ic('file-text', 16) + '</span><span class="sp-text"><span>' + esc(f.id) + ', ' + esc((D.formType(f.ft) || {}).name) + '</span><span class="sp-sub">' + esc(P(f.emp).name) + ', ' + esc(f.date) + '</span></span></button>'; }).join('');
    if (cases.length) h += '<div class="sp-group">Performance cases</div>' + cases.map(function (c) { return '<a class="sp-item" href="#/cases/' + c.id + '"><span class="sp-ic">' + ic('gavel', 16) + '</span><span class="sp-text"><span>' + esc(c.id) + ', ' + esc(c.sub) + '</span><span class="sp-sub">' + esc(P(c.emp).name) + ', ' + esc(c.status) + '</span></span></a>'; }).join('');
    if (acts.length) h += '<div class="sp-group">Action items</div>' + acts.map(function (a) { return '<button class="sp-item" data-act="open-action" data-id="' + a.id + '"><span class="sp-ic">' + ic('list-checks', 16) + '</span><span class="sp-text"><span>' + esc(a.t) + '</span><span class="sp-sub">' + esc(a.id) + ', owner ' + esc(P(a.owner).name) + '</span></span></button>'; }).join('');
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
    S.roleKey = el.getAttribute('data-role'); S.f = {}; S.runner = null; S.wizard = null;
    try { localStorage.setItem('sp-role', S.roleKey); } catch (e) {}
    APP.closeAll(); renderShell();
    if (!allowed(S.route[0])) location.hash = '#/home'; else APP.go('#/' + S.route[0]);
    APP.rerender();
    var r = APP.role();
    APP.toast('Viewing as ' + r.label, P(r.person).name + '. Scope: ' + APP.scopeLabel() + '.', 'info');
  };
  A['open-nav'] = openNav; A['close-nav'] = closeNav;
  A['collapse-nav'] = function () { document.body.classList.toggle('nav-collapsed'); };
  A['notifs-read'] = function () { notifs().forEach(function (n) { n.unread = false; }); renderNotifs(); document.getElementById('notifPop').hidden = false; };
  A['notif-go'] = function (el) {
    var n = notifs()[+el.getAttribute('data-i')]; n.unread = false; renderNotifs(); closePops(); APP.go(n.go);
  };
  A['goto-person'] = function (el) {
    var id = el.getAttribute('data-id');
    if (APP.is('frontline')) { APP.go('#/home'); return; }
    closePops(); APP.closeAll(); APP.go('#/people/' + id);
  };
  A['sign-out'] = function () {
    closePops();
    host().insertAdjacentHTML('beforeend', '<div class="signed-out" data-overlay><div class="so-card card">' + brandMark(40) +
      '<h2 class="t-6 fw-bold">You are signed out</h2><p class="text-low">Shared tablets sign out on their own after five minutes. Nothing from the session stays on the screen.</p>' +
      '<button class="btn btn-solid is-lg" data-act="sign-in">' + ic('log-in', 16, 'btn-icon') + 'Sign in with ' + esc(D.ORG) + ' single sign on</button></div></div>');
  };
  A['sign-in'] = function () { APP.closeAll(); APP.go('#/home'); APP.toast('Signed in', 'Welcome back, ' + APP.me().name.split(' ')[0] + '.'); };
  A['mobile-search'] = function () {
    APP.dialog({ title: 'Search', sub: 'Scoped to ' + APP.scopeLabel(), body: '<div class="search search-full"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="msearch" placeholder="Person, form id, case id or action" aria-label="Search"></div><div class="msearch-results" id="msearchResults"><p class="text-low t-1">Try a name, "FM-", "PC-" or "AI-".</p></div>' });
  };
  APP.INPUT.msearch = function (el) { var h = APP.searchResults(el.value); document.getElementById('msearchResults').innerHTML = h || '<p class="text-low t-1">Try a name, "FM-", "PC-" or "AI-".</p>'; APP.fillIcons(document.getElementById('msearchResults')); };
  A['copy'] = function (el) { APP.toast('Copied', el.getAttribute('data-what') || 'Copied to clipboard.'); };
  A['toast'] = function (el) { APP.toast(el.getAttribute('data-t') || 'Done', el.getAttribute('data-b') || '', el.getAttribute('data-k') || 'success'); };
  A['export'] = function (el) {
    APP.toast('Export queued', (el.getAttribute('data-what') || 'The file') + ' will download when it is built. Every export is logged against your name.', 'info');
  };
  A['open-hierarchy'] = function () {
    var cms = APP.scopeCms();
    var tree = D.REGIONS.map(function (r) {
      var inR = D.COMMUNITIES.filter(function (c) { return c.region === r.id; });
      var anyIn = inR.some(function (c) { return cms.indexOf(c.id) >= 0; });
      return '<details class="collapse tree-region"' + (anyIn ? ' open' : '') + '><summary>' + ic('network', 16) + '<span>' + esc(r.name) + ' region</span><span class="tr-meta">' + inR.length + ' communities</span></summary>' +
        inR.map(function (c) {
          var on = cms.indexOf(c.id) >= 0;
          return '<div class="tree-row' + (on ? ' is-on' : '') + '">' + ic('building-2', 16) + '<span class="tw-name">' + esc(c.name) + '<span class="tw-sub">' + esc(c.city) + ', ' + c.beds + ' beds, ' + esc(c.type) + '</span></span>' +
            (on ? APP.badge('In your scope', 'is-success') : APP.badge('Out of scope', 'is-neutral')) + '</div>';
        }).join('') + '</details>';
    }).join('');
    APP.dialog({
      title: 'Hierarchy scope', sub: APP.scopePath(), size: 'is-wide',
      body: APP.callout('Scope is set by your position in the hierarchy, not by a filter you choose. To see a different branch, switch role with <b>View as</b> in the header. Every record you create is permanently bound to the path it was created under.', 'is-info', 'info') +
        '<div class="tree-wrap">' + tree + '</div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"')
    });
  };
  A['about'] = function () {
    closePops();
    var epics = [
      ['E1', 'Org hierarchy and identity', 'The scope strip under every page header, the hierarchy dialog, and the People screen.'],
      ['E2', 'Performance signal layer', 'Signals screen inside Reports, the snapshot section of every form, and the KPI cards on Home.'],
      ['E3', 'Coaching to do and trends', 'Coaching, tabs To do, Trends and Cross group. Rules that generate the tasks live in Configuration.'],
      ['E4', 'Coaching form engine', 'Run form on any task. Six sections, scoring, drafts, and the form catalogue in Configuration.'],
      ['E5', 'Site visit and rounding', 'Site visits, the eight section walkthrough with photos, geo match and duration.'],
      ['E6', 'Action items and follow up', 'Action items, carried forward onto the next form until closed.'],
      ['E7', 'Performance management', 'Performance cases, the five step wizard, letter, approval chain and audit trail.'],
      ['E8', 'Documents and history', 'Documents, with the rendered form view and the deleted record log.'],
      ['E9', 'Reporting and export', 'Reports, completion by hierarchy and role, verbatims, and the employee file export.'],
      ['E10', 'Integrity and audit', 'Attestation on submit, geo and duration on every record, guardrails and retention in Configuration.']
    ];
    APP.dialog({
      title: 'How this wireframe maps to the spec', size: 'is-wide',
      sub: 'skyPerformance, built from a frontline coaching and discipline teardown. Ten epics, one chain.',
      body: APP.callout('The product claim in the teardown is the unbroken chain: a signal makes a task, the task makes a documented form, the form attaches to a case, the case routes for approval, and the whole file exports. Follow it end to end with the <b>Trace the chain</b> card on the dashboard.', 'is-info', 'route') +
        '<div class="epic-list">' + epics.map(function (e) {
          return '<div class="epic-row"><span class="epic-id">' + e[0] + '</span><div><div class="epic-name">' + esc(e[1]) + '</div><div class="epic-where">' + esc(e[2]) + '</div></div></div>';
        }).join('') + '</div>' +
        '<p class="text-low t-1 about-note">Wireframe only. The operator, the communities, the people, the metrics and the quotations are all invented for design review. No real employee record, customer or vendor appears anywhere in it.</p>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"')
    });
  };
  /* The skyPerformance mark: an amber figure beside two rising bars, the taller
     one capped with an arrow. Amber is the brand token, the bars follow the
     foreground token so the mark inverts with the theme. */
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
    var saved = null; try { saved = localStorage.getItem('sp-role'); } catch (e) {}
    S.roleKey = qs.get('role') || saved || 'manager';
    if (!D.ROLES.some(function (r) { return r.key === S.roleKey; })) S.roleKey = 'manager';
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
