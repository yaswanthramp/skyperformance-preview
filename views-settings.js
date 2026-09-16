/* skyPerformance: E4 form configuration, E3 rule configuration, E10 integrity and retention. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    return APP.tabs([
      ['forms', 'Form types', '#/settings', D.FORM_TYPES.length],
      ['rules', 'Task rules', '#/settings/rules', D.RULES.length],
      ['hierarchy', 'Hierarchy', '#/settings/hierarchy', D.COMMUNITIES.length],
      ['integrity', 'Integrity guardrails', '#/settings/integrity', D.GUARDRAILS.length],
      ['retention', 'Retention', '#/settings/retention', D.RETENTION.length]
    ], active);
  }

  function formsTab() {
    return APP.callout('Every form type is the same six sections. What changes is the question set, the scoring and who can run it. That is why adding a type is configuration and not a release.', 'is-info', 'layers') +
      '<div class="filter-bar"><span class="fb-spacer"></span>' + APP.btn('New form type', 'btn-solid', 'plus', 'data-act="new-ft"', 'is-sm') + '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Form type' }, { t: 'Family' }, { t: 'Level' }, { t: 'Questions', num: true }, { t: 'Scoring' }, { t: 'Typical length', num: true }, { t: '' }],
        D.FORM_TYPES.map(function (t) {
          return { cells: [
            '<span class="row-gap">' + ic(t.ic, 16) + '<span class="cell-strong">' + esc(t.name) + '</span></span><span class="cell-sub">' + esc(t.id) + ' · ' + esc(t.desc.slice(0, 70)) + '...</span>',
            esc(D.FORM_FAMILIES.filter(function (f) { return f.key === t.fam; })[0].name), esc(t.level), String(t.qs),
            t.scored ? APP.badge('2 / 1 / N/A', 'is-info') : APP.badge('Written', 'is-neutral'),
            t.mins + ' min',
            APP.btn('Configure', 'btn-surface', 'sliders-horizontal', 'data-act="edit-ft" data-id="' + t.id + '"', 'is-sm')
          ] };
        })) + '</section>' +
      '<section class="card">' + APP.panelHead('The shared skeleton', 'Locked. A form type cannot add, remove or reorder a section.') +
      '<div class="chain">' + D.FORM_SKELETON.map(function (s, i) {
        return '<div class="chain-step" style="cursor:default"><span class="chain-ic">' + ic(s.ic, 16) + '</span><span class="chain-text"><span class="chain-t">' + (i + 1) + '. ' + esc(s.name) + '</span><span class="chain-s">' + esc(s.desc.slice(0, 40)) + '...</span></span></div>' +
          (i < D.FORM_SKELETON.length - 1 ? '<span class="chain-arrow">' + ic('chevron-right', 16) + '</span>' : '');
      }).join('') + '</div></section>';
  }

  function rulesTab() {
    return APP.callout('A rule is the only thing allowed to create a touch point. A leader cannot add or delete one by hand, which is what makes completion a fair number to be measured on.', 'is-info', 'sliders-horizontal') +
      '<div class="filter-bar"><span class="fb-spacer"></span>' + APP.btn('New rule', 'btn-solid', 'plus', 'data-act="new-rule"', 'is-sm') + '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Rule' }, { t: 'Watches' }, { t: 'Condition' }, { t: 'Creates' }, { t: 'Due in' }, { t: 'Recurrence' }, { t: 'Fired', num: true }, { t: 'State' }],
        D.RULES.map(function (r) {
          return { cells: [
            '<span class="cell-strong">' + esc(r.name) + '</span><span class="cell-sub">' + esc(r.id) + '</span>',
            r.sig ? '<span class="cell-id">' + esc(r.sig) + '</span>' : '<span class="mini-note">Schedule</span>',
            '<span class="mini-note">' + esc(r.when) + '</span>',
            esc(D.formType(r.makes).name), esc(r.due), esc(r.rec), String(r.fired),
            '<label class="switch"><input type="checkbox"' + (r.on ? ' checked' : '') + ' data-change="rule-toggle" data-id="' + r.id + '"><span class="switch-track"><span class="switch-thumb"></span></span></label>'
          ] };
        })) + '</section>';
  }

  function hierarchyTab() {
    return APP.callout('The hierarchy is the spine. Change it and every permission, rollup and approval route changes with it, which is why a move is an audited event rather than an edit.', 'is-info', 'network') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Community' }, { t: 'Region' }, { t: 'Location' }, { t: 'Beds', num: true }, { t: 'Type' }, { t: 'Executive Director' }, { t: 'People', num: true }, { t: '' }],
        D.COMMUNITIES.map(function (c) {
          return { cells: [esc(c.name) + '<span class="cell-sub">' + esc(c.id) + '</span>',
            esc(D.REGIONS.filter(function (r) { return r.id === c.region; })[0].name), esc(c.city), String(c.beds), esc(c.type),
            APP.personLine(c.ed, null, 28), String(D.PEOPLE.filter(function (p) { return p.cm === c.id; }).length),
            APP.btn('Configure', 'btn-surface', null, 'data-act="toast" data-t="Community settings" data-b="Address for geo matching, approval route overrides, and which form types are available here." data-k="info"', 'is-sm')] };
        })) + '</section>' +
      '<section class="card">' + APP.panelHead('Approval routing', 'Derived from the hierarchy, not configured per case.') +
      APP.dataList([
        ['One level above', 'The employee leader leader. Executive Director for a department manager.'],
        ['Two levels above', 'Regional Director of Operations.'],
        ['Always', 'HR and Employee Relations, on every step above documented coaching.'],
        ['Override', 'Allowed only when a level is vacant, and the override is recorded in the audit trail.']
      ]) + '</section>';
  }

  function integrityTab() {
    return APP.callout('The record has to survive a grievance, an arbitration and a state survey. These are the rules that decide what may never enter it, and what is always captured alongside it.', 'is-warning', 'shield-alert') +
      '<section class="card">' + APP.panelHead('Evidence guardrails', 'Applied at submission, before the record becomes immutable.') +
      '<div class="wq">' + D.GUARDRAILS.map(function (g) {
        return '<div class="wq-row"><span class="wq-ic' + (g.state === 'Blocked' ? ' is-late' : '') + '">' + ic(g.state === 'Blocked' ? 'ban' : g.state === 'Warned' ? 'triangle-alert' : 'shield', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(g.name) + '</span><span class="wq-s">' + esc(g.desc) + '</span></div>' +
          '<div class="wq-right">' + APP.statusBadge(g.state === 'Allowed with attribution' ? 'Active' : g.state).replace('Active', 'Allowed') + '</div></div>';
      }).join('') + '</div></section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Always captured', 'Not optional, not editable.') +
      APP.dataList([
        ['Attestation', 'Ticked by the person completing the form, at submission.'],
        ['Submitted timestamp', 'Server side. A late form records the true time and shows the gap.'],
        ['Location', 'Distance from the community address, matched or not.'],
        ['Duration', 'Time from opening to submission, including pauses.'],
        ['Hierarchy path', 'Bound permanently. A record does not move if a person does.'],
        ['Version', 'A correction creates a new version. Both stay.']
      ]) + '</section>' +
      '<section class="card">' + APP.panelHead('What this is not', 'Stated in the product so nobody has to guess.') +
      APP.callout('This is not an investigation system. Abuse, neglect and exploitation investigations belong in Employee Relations, with different access, different retention and different disclosure rules. Attempting to put one here is blocked at the field.', 'is-danger', 'ban') +
      APP.callout('This is not a surveillance tool. Geolocation records the distance from a community address at a moment of submission. It is not a location history, and it is dropped from the record after two years.', 'is-info', 'eye-off') +
      '</section></div>';
  }

  function retentionTab() {
    return '<section class="card flush-card">' +
      APP.table([{ t: 'Record class' }, { t: 'Retained' }, { t: 'Then what' }],
        D.RETENTION.map(function (r) { return { cells: ['<span class="cell-strong">' + esc(r.what) + '</span>', esc(r.keep), '<span class="mini-note">' + esc(r.then) + '</span>'] }; })) + '</section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Step expiry', 'How long a step counts toward the next one.') +
      APP.dataList(D.STEPS.map(function (s) { return [esc(s.name), s.expiry ? esc(s.expiry) : 'End of the ladder']; })) +
      '<p class="mini-note" style="margin-top:var(--space-4)">Expiry is automatic and dated at activation, not at the date of the event. An expired step stays in the file and stops counting on the same day.</p>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Deleted records', 'Deletion removes a record from the active history. It never removes it from the file.',
        APP.btn('Open the deleted view', 'btn-surface', 'trash-2', 'data-act="goto" data-href="#/docs/deleted"', 'is-sm')) +
      APP.dataList([
        ['Who can delete', 'HR and Employee Relations only'],
        ['Reason', 'Required, free text, kept forever'],
        ['What survives', 'The id, the original content, who deleted it and when'],
        ['In the export', 'Included, marked deleted, with the reason']
      ]) + '</section></div>';
  }

  APP.VIEWS.settings = function (r) {
    var tab = r[1] || 'forms';
    var body = tab === 'rules' ? rulesTab() : tab === 'hierarchy' ? hierarchyTab() : tab === 'integrity' ? integrityTab() : tab === 'retention' ? retentionTab() : formsTab();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Configuration', '#/settings']],
      title: 'Configuration', desc: 'Form types, task rules, hierarchy, guardrails and retention. Changed here, applied everywhere.',
      tabs: tabsFor(tab), body: body
    });
  };

  APP.INPUT['rule-toggle'] = function (el) {
    var r = D.RULES.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0];
    r.on = el.checked;
    APP.toast(r.on ? 'Rule switched on' : 'Rule switched off', r.on ? 'It will generate touch points from the next nightly run.' : 'Existing touch points stay. No new ones are created.', r.on ? 'success' : 'info');
  };
  APP.ACT['edit-ft'] = function (el) {
    var t = D.formType(el.getAttribute('data-id'));
    var secs = D.QUESTIONS[t.id];
    APP.dialog({
      title: t.name, sub: t.id + ' · ' + D.FORM_FAMILIES.filter(function (f) { return f.key === t.fam; })[0].name, size: 'is-wide',
      body: APP.dataList([
        ['Family', esc(D.FORM_FAMILIES.filter(function (f) { return f.key === t.fam; })[0].name)],
        ['Level', esc(t.level)],
        ['Questions', String(t.qs)],
        ['Scoring', t.scored ? '2 for Yes, 1 for No, not applicable. Two or more No marks Needs improvement.' : 'Written, no score'],
        ['Typical length', t.mins + ' minutes'],
        ['Who can run it', t.fam === 'leader' ? 'The leader above the subject' : t.fam === 'ops' ? 'Executive Director, Regional Director, Quality' : 'The employee direct leader']
      ]) +
        (secs ? '<h3 class="section-label">Question set</h3>' + secs.map(function (s) {
          return '<details class="collapse"><summary>' + esc(s.s) + '<span class="count-pill" style="margin-left:auto">' + s.qs.length + '</span></summary>' +
            s.qs.map(function (q) { return '<div class="qa-row"><span class="qa-q">' + esc(q) + '</span><span class="qa-a">' + (t.scored ? APP.badge('Scored', 'is-info') : '') + '</span></div>'; }).join('') + '</details>';
        }).join('') : '<p class="mini-note">Question set is inherited from the family default.</p>') +
        APP.callout('Editing a question set creates a new version of the form type. Records already submitted keep the version they were completed against, which is what keeps an old PDF readable.', 'is-info', 'history'),
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Run this form', 'btn-soft', 'circle-play', 'data-act="run-form" data-ft="' + t.id + '"') +
        APP.btn('Save as a new version', 'btn-solid', 'check', 'data-act="toast" data-t="Version 2 saved" data-b="New forms use it from now. Every submitted record keeps version 1."')
    });
  };
  APP.ACT['new-ft'] = function () {
    APP.dialog({
      title: 'New form type', sub: 'Configuration. No release required.',
      body: APP.field('Name', '<input class="input" placeholder="Bathing and dignity observation">', null, true) +
        '<div class="form-grid">' +
        APP.field('Family', APP.dd('nf-fam', D.FORM_FAMILIES.map(function (f) { return [f.key, f.name]; }), 'staff', 'dd-block'), null, true) +
        APP.field('Scoring', APP.dd('nf-score', [['scored', '2 / 1 / not applicable'], ['written', 'Written, no score']], 'scored', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Who can run it', APP.dd('nf-who', [['leader', 'The employee direct leader'], ['above', 'The leader above the subject'], ['ops', 'Executive Director, Regional, Quality']], 'leader', 'dd-block'), null, true) +
        APP.callout('The six sections are fixed. You are configuring the question set that goes in section three, and the rules for the rest.', 'is-info', 'layers'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create', 'btn-solid', 'plus', 'data-act="toast" data-t="Form type created" data-b="It is live in the catalogue and available to every leader in scope."')
    });
  };
  APP.ACT['new-rule'] = function () {
    APP.dialog({
      title: 'New task rule', sub: 'Watch a signal or a schedule, create a touch point.',
      body: APP.field('Rule name', '<input class="input" placeholder="Falls above threshold opens a unit huddle">', null, true) +
        APP.field('Watches', APP.dd('nr-sig', [['none', 'A schedule, not a signal']].concat(D.SIGNALS.map(function (s) { return [s.id, s.name + '  ' + s.id]; })), 'sig.falls', 'dd-block'), 'Only signals with a stable id can be watched.', true) +
        APP.field('Condition', '<input class="input" value="Above 4.5 per 1,000 resident days">', null, true) +
        '<div class="form-grid">' +
        APP.field('Creates', APP.dd('nr-ft', D.FORM_TYPES.map(function (t) { return [t.id, t.name]; }), 'FT-HUD', 'dd-block'), null, true) +
        APP.field('Due in', APP.dd('nr-due', [['2 days', '2 days'], ['5 days', '5 days'], ['7 days', '7 days'], ['14 days', '14 days']], '2 days', 'dd-block'), null, true) +
        '</div>' +
        APP.callout('A new rule runs against the current data on the next nightly refresh. It does not backfill, which stops a configuration change from burying a team in overdue work.', 'is-warning', 'clock'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create rule', 'btn-solid', 'plus', 'data-act="toast" data-t="Rule created" data-b="Off by default. Switch it on when you are ready for it to generate work."')
    });
  };
})();
