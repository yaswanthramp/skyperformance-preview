/* skyPerformance: records. Everything that was ever documented, searchable by
   person, type and date range. Plus the deleted view and the export log. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function monthOf(str) { for (var i = 0; i < MONTHS.length; i++) if (str.indexOf(MONTHS[i]) >= 0) return i; return -1; }
  function inRange(dateStr, range) {
    if (!range || range === 'All') return true;
    var m = monthOf(dateStr || '');
    if (m < 0) return true;
    if (range === '30') return m >= 8;
    if (range === '90') return m >= 6;
    if (range === 'ytd') return true;
    return true;
  }

  /* one list, every kind of record */
  function everything() {
    var out = [];
    APP.records().forEach(function (r) {
      out.push({ kind: 'Coaching', sub: D.coachingType(r.type).name, id: r.id, on: r.on, who: r.emp, group: r.group,
        by: r.by, title: r.topic || D.coachingType(r.type).name, site: r.site, act: 'open-record', ic: D.coachingType(r.type).ic });
    });
    APP.pips().forEach(function (x) {
      out.push({ kind: APP.term('pipShort'), sub: D.pipLevel(x.level).name, id: x.id, on: x.opened, who: x.emp,
        by: x.by, title: D.offenseText(x), site: x.site, href: '#/pips/' + x.id, ic: 'clipboard-check' });
    });
    APP.evaluations().forEach(function (e) {
      out.push({ kind: 'Evaluation', sub: e.cycle, id: e.id, on: e.reviewDate, who: e.emp,
        by: e.by, title: e.cycle + ' evaluation', site: e.site, href: '#/evaluations/' + e.id, ic: 'clipboard-list' });
    });
    APP.visits().forEach(function (v) {
      out.push({ kind: APP.term('visit'), sub: v.reviewMonth, id: v.id, on: v.date, who: v.ed,
        by: v.by, title: D.siteName(v.site) + ' walk-through', site: v.site, href: '#/visits/' + v.id, ic: 'building-2' });
    });
    return out;
  }

  function tabsFor(active) {
    var t = [['all', 'All records', '#/records', everything().length]];
    if (APP.isHR()) {
      t.push(['deleted', 'Deleted', '#/records/deleted', D.DELETED_RECORDS.length]);
      t.push(['exports', 'Exports and retention', '#/records/exports', D.EXPORT_LOG.length]);
    }
    return APP.tabs(t, active);
  }

  function allTab() {
    var f = S.f, list = everything();
    if (f.rKind && f.rKind !== 'All') list = list.filter(function (x) { return x.kind === f.rKind; });
    if (f.rWho && f.rWho !== 'All') list = list.filter(function (x) { return x.who === f.rWho || (x.group && x.group.indexOf(f.rWho) >= 0); });
    if (f.rRange && f.rRange !== 'All') list = list.filter(function (x) { return inRange(x.on, f.rRange); });
    var q = (f.rq || '').toLowerCase();
    if (q) list = list.filter(function (x) { return (x.title + ' ' + x.id + ' ' + x.sub).toLowerCase().indexOf(q) >= 0; });
    var people = APP.people().filter(function (p) { return p.id !== APP.me().id; });

    return APP.hint('One place to answer "what has been documented about this person, between these dates". Pick a person and a date range.', 'folder') +
      '<div class="filter-bar">' +
      '<div class="search" style="min-width:210px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="rq" value="' + esc(f.rq || '') + '" placeholder="Search records"></div>' +
      APP.dd('rWho', [['All', 'Anyone']].concat(people.map(function (p) { return [p.id, p.name]; })), f.rWho || 'All') +
      APP.dd('rKind', [['All', 'Every kind'], ['Coaching', APP.term('coaching')], [APP.term('pipShort'), APP.term('pipShort')], ['Evaluation', 'Evaluation'], [APP.term('visit'), APP.term('visit')]], f.rKind || 'All') +
      APP.dd('rRange', [['All', 'All time'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['ytd', 'This cycle']], f.rRange || 'All') +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The filtered list as CSV"', 'is-sm') +
      (APP.isHR() ? APP.btn('Employee file export', 'btn-solid', 'package', 'data-act="file-export"', 'is-sm') : '') +
      '</div>' +
      APP.glance([
        [list.length, 'Matching records'],
        [list.filter(function (x) { return x.kind === 'Coaching'; }).length, APP.term('coaching')],
        [list.filter(function (x) { return x.kind === APP.term('pipShort'); }).length, APP.terms('pipShort')],
        [list.filter(function (x) { return x.kind === 'Evaluation'; }).length, 'Evaluations']
      ]) +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Date' }, { t: 'Kind' }, { t: 'About' }, { t: 'What', w: '28%' }, { t: 'By' }, { t: '' }],
        list.map(function (x) {
          return { cells: [
            esc((x.on || '').replace(/^\w+ /, '')),
            '<span class="row-gap">' + ic(x.ic, 14) + '<span class="cell-strong">' + esc(x.kind) + '</span></span><span class="cell-sub">' + esc(x.sub) + '</span>',
            x.group ? APP.badge(x.group.length + ' people', 'is-neutral') : APP.personLine(x.who, false, 26),
            '<span class="cell-strong">' + esc(x.title) + '</span><span class="cell-sub">' + esc(x.id) + '</span>',
            APP.personLine(x.by, false, 26),
            x.href ? APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="' + x.href + '"', 'is-sm')
              : APP.btn('Open', 'btn-surface', null, 'data-act="' + x.act + '" data-id="' + x.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing matches. Try a wider date range.' }) + '</section>';
  }

  function deletedTab() {
    return APP.hint('Deleting removes a record from the active history, never from the file. Who, when and why are kept.', 'trash-2') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Record' }, { t: 'Employee' }, { t: 'Originally by' }, { t: 'Deleted by' }, { t: 'Deleted on' }, { t: 'Reason' }],
        D.DELETED_RECORDS.map(function (x) {
          return { cells: ['<span class="cell-strong">' + esc(D.coachingType(x.type).name) + '</span><span class="cell-sub">' + esc(x.id) + ' · ' + esc(x.on) + '</span>',
            APP.personLine(x.emp, false, 26), APP.personLine(x.by, false, 26), APP.personLine(x.deletedBy, false, 26),
            esc(x.deletedOn), '<span class="mini-note">' + esc(x.reason) + '</span>'] };
        }), { empty: 'Nothing has been deleted.' }) + '</section>';
  }

  function exportsTab() {
    return APP.hint('On termination the whole file is compiled and exported once to <b>' + esc(D.CONFIG.hris) + '</b>, so skyPerformance is not the long-term archive.', 'package') +
      APP.callout('<b>The retention period is not set.</b> Until it is, nothing is removed from skyPerformance after an export. <a href="#/settings/retention">Set it in Settings</a>', 'is-warning', 'triangle-alert') +
      '<div class="card-grid">' +
      [['Employee file export', 'Everything about one person as one package, and the one-time export on termination.', 'package', true],
       ['Records list', 'The filtered list as a spreadsheet.', 'file-spreadsheet', false],
       [APP.term('visit') + ' log', 'Visits, scores and findings.', 'building-2', false],
       ['Org chart', 'As published by ' + D.CONFIG.hris + '.', 'network', false]
      ].map(function (x) {
        return '<section class="card vs-card"><div class="vs-head"><span class="vs-ic">' + ic(x[2], 18) + '</span><span class="vs-name">' + esc(x[0]) + '</span>' + (x[3] ? APP.badge('HR only', 'is-warning') : '') + '</div>' +
          '<p class="mini-note">' + esc(x[1]) + '</p>' +
          APP.btn(x[3] ? 'Build a package' : 'Export', x[3] ? 'btn-solid' : 'btn-surface', x[3] ? 'package' : 'download',
            x[3] ? 'data-act="file-export"' : 'data-act="export" data-what="' + esc(x[0]) + '"', 'is-sm') + '</section>';
      }).join('') + '</div>' +
      APP.sectionLabel('Export log', 'Kept with the reason, for as long as the file is kept') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Export' }, { t: 'Subject' }, { t: 'Requested by' }, { t: 'Reason' }, { t: 'When' }],
        D.EXPORT_LOG.map(function (x) {
          return { cells: [esc(x.what), APP.personLine(x.subject, false, 26), APP.personLine(x.by, false, 26),
            '<span class="mini-note">' + esc(x.reason) + '</span>', esc(x.on)] };
        })) + '</section>';
  }

  APP.VIEWS.records = function (r) {
    var tab = r[1] || 'all';
    var body = tab === 'deleted' ? deletedTab() : tab === 'exports' ? exportsTab() : allTab();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Records', '#/records']],
      title: 'Records', desc: 'Every record, by person, kind and date range.',
      tabs: tabsFor(tab), body: body
    });
  };
  APP.INPUT.rq = function (el) { S.f.rq = el.value; var c = el.selectionStart; APP.rerender(); var n = document.querySelector('[data-input="rq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); } };

  APP.ACT['file-export'] = function () {
    var people = APP.people().filter(function (p) { return p.level === 'staff' || p.level === 'dept'; });
    APP.dialog({
      title: 'Employee file export', sub: 'One package. Everything about one person.',
      body: APP.field('Employee', APP.dd('exp-emp', people.map(function (p) { return [p.id, p.name + ', ' + D.siteName(p.site)]; }), people[0].id, 'dd-block'), null, true) +
        '<h3 class="section-label">What goes in</h3>' +
        [APP.term('coaching') + ' records, with acknowledgements', APP.term('pipShort') + 's, including any termination detail',
         'Evaluations with scores and signatures', 'To-do items and their notes', 'The audit trail for every record', 'A manifest of what was included']
          .map(function (x) { return '<label class="checkbox"><input type="checkbox" checked><span>' + esc(x) + '</span></label>'; }).join('') +
        APP.callout('Exports are logged against your name with the reason you give. On a termination this runs once, automatically, and hands the package to ' + esc(D.CONFIG.hris) + '.', 'is-warning', 'shield-alert') +
        APP.field('Reason', '<textarea class="textarea" placeholder="Termination, 18 September 2026. One-time export."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Build the package', 'btn-solid', 'package', 'data-act="toast" data-t="Export queued" data-b="One package, with a manifest, handed to ' + esc(D.CONFIG.hris) + '. The request is in the export log."')
    });
  };
})();
