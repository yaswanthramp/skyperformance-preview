/* skyPerformance: settings. Roles, levels and terminology are labels an
   operator owns, not something baked into the product. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    return APP.tabs([
      ['labels', 'Roles and wording', '#/settings/labels'],
      ['types', APP.term('coaching') + ' types', '#/settings/types', D.COACHING_TYPES.length],
      ['record', 'System of record', '#/settings/record'],
      ['retention', 'Retention', '#/settings/retention', D.RETENTION.length]
    ], active);
  }

  function labelRow(path, label, hint) {
    var val = D.cfg(path);
    return '<div class="cfg-row"><span class="cfg-label">' + esc(label) + (hint ? '<span class="cfg-hint">' + esc(hint) + '</span>' : '') + '</span>' +
      '<input class="input cfg-input" data-input="cfg" data-path="' + path + '" value="' + esc(val) + '"></div>';
  }

  function labelsTab() {
    return APP.hint('Every name below is a label. Change one and it changes everywhere in the product, on this screen, in the navigation and in the ' + esc(APP.roleLabel('hr')) + ' switcher.', 'pen-line') +
      APP.callout('Try it: rename <b>' + esc(APP.roleLabel('manager')) + '</b> to Leader, or <b>' + esc(APP.term('coaching')) + '</b> to Feedback, and watch the left-hand navigation change as you type.', 'is-info', 'sparkles') +
      '<div class="split-even">' +
      '<section class="card">' + APP.panelHead('Roles', 'Three roles. Rename them to match your own language.') +
      labelRow('roles.employee', 'Employee role', 'The person the record is about') +
      labelRow('roles.manager', 'Manager role', 'Anyone with direct reports') +
      labelRow('roles.hr', 'HR role', 'Approves, configures, exports') +
      APP.hint('Roles stay at three. What changes is what each one is called.', 'info') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Levels', 'What a manager can reach depends on their level in the chart.') +
      labelRow('levels.staff', 'Team member') +
      labelRow('levels.dept', 'Department head') +
      labelRow('levels.community', 'Community leader') +
      labelRow('levels.regional', 'Regional leader', 'This level and above can run the ' + APP.term('visit').toLowerCase() + ' form') +
      labelRow('levels.corporate', 'Corporate') +
      '</section></div>' +
      '<div class="split-even">' +
      '<section class="card">' + APP.panelHead('Wording', 'What you call the things in the product.') +
      labelRow('terms.coaching', 'Documented conversations', 'Called Feedback in some organisations') +
      labelRow('terms.pip', 'Improvement plan, long form') +
      labelRow('terms.pipShort', 'Improvement plan, short form') +
      labelRow('terms.eval', 'Annual evaluation') +
      labelRow('terms.visit', 'Site visit') +
      labelRow('terms.site', 'A location', 'Community, site, branch, store') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Organisation') +
      labelRow('org', 'Operator name') +
      labelRow('orgShort', 'Short name', 'Used in the hierarchy path') +
      labelRow('hris', 'System of record', 'Where the org chart and the employee file live') +
      APP.hint('The system of record owns the org chart. skyPerformance reads it and never writes to it.', 'network') +
      '</section></div>' +
      '<section class="card">' + APP.panelHead('Preview', 'How the navigation reads with the current wording.') +
      '<div class="nav-preview">' + APP.nav().map(function (x) {
        return '<span class="np-chip">' + ic(x[2], 14) + esc(x[1]) + '</span>';
      }).join('') + '</div>' +
      '<div class="row-gap" style="margin-top:var(--space-4)">' +
      APP.btn('Reset to the defaults', 'btn-surface', 'rotate-ccw', 'data-act="cfg-reset"', 'is-sm') + '</div>' +
      '</section>';
  }

  function typesTab() {
    return APP.hint('The dropdown a manager sees when they document something. Adding a type is configuration, not a release.', 'layers') +
      '<div class="filter-bar"><span class="fb-spacer"></span>' + APP.btn('Add a type', 'btn-solid', 'plus', 'data-act="toast" data-t="Type added" data-b="It appears in the dropdown for every manager in scope."', 'is-sm') + '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Type' }, { t: 'What it is for' }, { t: 'Who can use it' }, { t: 'Opens' }, { t: '' }],
        D.COACHING_TYPES.map(function (t) {
          return { cells: [
            '<span class="row-gap">' + ic(t.ic, 16) + '<span class="cell-strong">' + esc(t.name) + '</span></span><span class="cell-sub">' + esc(t.id) + '</span>',
            '<span class="mini-note">' + esc(t.desc) + '</span>',
            t.minLevel ? APP.badge(D.CONFIG.levels[t.minLevel] + ' and above', 'is-warning') : APP.badge('Any manager', 'is-neutral'),
            t.form === 'eval' ? 'The evaluation form' : t.form === 'visit' ? 'The ' + APP.term('visit').toLowerCase() + ' form' : t.multi ? 'A text box, several people' : 'A text box',
            APP.btn('Configure', 'btn-surface', 'sliders-horizontal', 'data-act="toast" data-t="Type settings" data-b="Name, who can use it, whether it takes one person or several, and what form it opens." data-k="info"', 'is-sm')
          ] };
        })) + '</section>' +
      APP.why('Why the ' + APP.term('visit').toLowerCase() + ' sits in this list', '<p>The client asked for it to be one of the options a regional leader picks when they document something, not a separate part of the product. It is the same front door, with a longer form behind it.</p>');
  }

  function recordTab() {
    return APP.hint('skyPerformance is the working system. <b>' + esc(D.CONFIG.hris) + '</b> is the system of record. This decides what crosses over.', 'network') +
      '<div class="split-even">' +
      '<section class="card">' + APP.panelHead('What is written to ' + esc(D.CONFIG.hris), 'Everything else lives here and is exported with the file.') +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Record type</th><th style="width:150px">Goes across</th></tr></thead><tbody>' +
      D.TO_SYSTEM_OF_RECORD.map(function (r, i) {
        return '<tr><td data-label="Record type"><span class="cell-strong">' + esc(r.what) + '</span></td>' +
          '<td data-label="Goes across"><label class="switch"><input type="checkbox"' + (r.go ? ' checked' : '') + ' data-change="sor-toggle" data-i="' + i + '"><span class="switch-track"><span class="switch-thumb"></span></span></label></td></tr>';
      }).join('') + '</tbody></table></div>' +
      APP.callout('The client was clear that not everything should mirror. A documented team meeting does not need to be in the official file. A ' + APP.term('pipShort') + ' does.', 'is-info', 'info') +
      '</section>' +
      '<section class="card">' + APP.panelHead('What comes in from ' + esc(D.CONFIG.hris), 'Read only, synced nightly.') +
      '<ul class="tick-list">' + D.SYNC_FIELDS.map(function (f) { return '<li>' + ic('check', 14) + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' +
      APP.hint('A wrong reporting line is fixed in ' + esc(D.CONFIG.hris) + ' and appears here the next morning.', 'info') +
      '<div class="sec-label">On termination</div>' +
      '<p class="t-2">The whole file is compiled and exported once, automatically. After that the person leaves the active chart but stays searchable by name for the retention period.</p>' +
      APP.btn('Open the export log', 'btn-surface', 'package', 'data-act="goto" data-href="#/records/exports"', 'is-sm') +
      '</section></div>';
  }

  function retentionTab() {
    return APP.callout('<b>The retention period is still to be confirmed.</b> Until it is set, nothing is removed after an export. This is one of the open questions for the client.', 'is-warning', 'triangle-alert') +
      '<section class="card">' + APP.panelHead('Retention period for a terminated file', 'How long the file stays searchable in skyPerformance after the export.') +
      '<div class="sf-radios">' + [['2', '2 years'], ['7', '7 years'], ['10', '10 years, matching clinical and resident records'], ['never', 'Keep indefinitely']].map(function (o) {
        var on = (S.f.retention || 'unset') === o[0];
        return '<button class="sf-radio' + (on ? ' is-on' : '') + '" data-act="set-retention" data-k="' + o[0] + '"><span class="sf-dot"></span>' +
          '<span class="sf-rt"><span class="sf-rn">' + esc(o[1]) + '</span></span></button>';
      }).join('') + '</div>' +
      (S.f.retention ? APP.hint('Set to ' + esc(S.f.retention === 'never' ? 'indefinite' : S.f.retention + ' years') + ' in this session. In the product this is an audited change.', 'check') : '') +
      '</section>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Record class' }, { t: 'Held' }, { t: 'Then what' }],
        D.RETENTION.map(function (r) { return { cells: ['<span class="cell-strong">' + esc(r.what) + '</span>', esc(r.keep), '<span class="mini-note">' + esc(r.then) + '</span>'] }; })) + '</section>' +
      '<div class="split-even">' +
      '<section class="card">' + APP.panelHead('Deleting a record', 'Who can, and what survives.') +
      APP.dataList([
        ['Who can delete', esc(APP.roleLabel('hr')) + ' only'],
        ['Reason', 'Required, free text, kept forever'],
        ['What survives', 'The id, the original content, who deleted it and when'],
        ['In the export', 'Included, marked deleted, with the reason']
      ]) + APP.btn('Open the deleted view', 'btn-surface', 'trash-2', 'data-act="goto" data-href="#/records/deleted"', 'is-sm') + '</section>' +
      '<section class="card">' + APP.panelHead('What never enters skyPerformance') +
      APP.callout('Formal investigations belong in the HR case system, with different access and different disclosure rules. They are not stored here.', 'is-danger', 'ban') +
      '</section></div>';
  }

  APP.VIEWS.settings = function (r) {
    var tab = r[1] || 'labels';
    var body = tab === 'types' ? typesTab() : tab === 'record' ? recordTab() : tab === 'retention' ? retentionTab() : labelsTab();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Settings', '#/settings']],
      title: 'Settings', desc: 'Names, wording, the dropdown, and what reaches ' + D.CONFIG.hris + '.',
      tabs: tabsFor(tab), body: body
    });
  };

  APP.INPUT.cfg = function (el) {
    var path = el.getAttribute('data-path').split('.'), v = el.value;
    var obj = D.CONFIG;
    for (var i = 0; i < path.length - 1; i++) obj = obj[path[i]];
    obj[path[path.length - 1]] = v || ' ';
    var pos = el.selectionStart;
    APP.renderShellOnly();
    var again = document.querySelector('[data-path="' + el.getAttribute('data-path') + '"]');
    if (again) { again.focus(); again.setSelectionRange(pos, pos); }
  };
  APP.ACT['cfg-reset'] = function () {
    D.CONFIG.roles = { employee: 'Employee', manager: 'Manager', hr: 'HR' };
    D.CONFIG.levels = { staff: 'Team member', dept: 'Department head', community: 'Executive Director', regional: 'Regional Director', corporate: 'Corporate' };
    D.CONFIG.terms = { coaching: 'Coaching', pip: 'Performance Improvement Plan', pipShort: 'PIP', eval: 'Annual evaluation', visit: 'Site visit', site: 'Community' };
    APP.rerender(); APP.toast('Reset', 'Back to the default wording.');
  };
  APP.INPUT['sor-toggle'] = function (el) {
    var i = +el.getAttribute('data-i');
    D.TO_SYSTEM_OF_RECORD[i].go = el.checked;
    APP.toast(D.TO_SYSTEM_OF_RECORD[i].what, el.checked ? 'Now written to ' + D.CONFIG.hris + '.' : 'Stays in skyPerformance and exports with the file.', 'info');
  };
  APP.ACT['set-retention'] = function (el) {
    S.f.retention = el.getAttribute('data-k'); APP.rerender();
    APP.toast('Retention set', 'In the product this is an audited change and it applies to every terminated file.');
  };
})();
