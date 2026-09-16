/* skyPerformance: Settings, HR only. Form types, task rules, guardrails, retention. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function tabsFor(active) {
    return APP.tabs([
      ['forms', 'Form types', '#/settings', D.FORM_TYPES.length],
      ['rules', 'Task rules', '#/settings/rules', D.RULES.length],
      ['integrity', 'Guardrails', '#/settings/integrity', D.GUARDRAILS.length],
      ['retention', 'Retention', '#/settings/retention', D.RETENTION.length]
    ], active);
  }

  function formsTab() {
    return APP.hint('Every type shares six sections. Only the questions, scoring and who runs it change.', 'layers') +
      '<div class="filter-bar"><span class="fb-spacer"></span>' + APP.btn('New form type', 'btn-solid', 'plus', 'data-act="new-ft"', 'is-sm') + '</div>' +
      D.FORM_FAMILIES.map(function (fam) {
        var types = D.FORM_TYPES.filter(function (t) { return t.fam === fam.key; });
        return '<div class="section-label">' + esc(fam.name) + ' · ' + esc(fam.desc) + '</div>' +
          '<section class="card flush-card">' +
          APP.table([{ t: 'Form type' }, { t: 'Level' }, { t: 'Questions', num: true }, { t: 'Scoring' }, { t: 'Length', num: true }, { t: '' }],
            types.map(function (t) {
              return { cells: [
                '<span class="row-gap">' + ic(t.ic, 16) + '<span class="cell-strong">' + esc(t.name) + '</span></span><span class="cell-sub">' + esc(t.id) + ' · ' + esc(t.desc) + '</span>',
                esc(t.level), String(t.qs),
                t.scored ? APP.badge('2 / 1 / N/A', 'is-info') : APP.badge('Written', 'is-neutral'),
                t.mins + ' min',
                APP.btn('Configure', 'btn-surface', 'sliders-horizontal', 'data-act="edit-ft" data-id="' + t.id + '"', 'is-sm')
              ] };
            })) + '</section>';
      }).join('') +
      '<section class="card">' + APP.panelHead('The shared skeleton', 'Locked. A form type cannot add, remove or reorder a section.') +
      '<div class="chain">' + D.FORM_SKELETON.map(function (s, i) {
        return '<div class="chain-step" style="cursor:default"><span class="chain-ic">' + ic(s.ic, 16) + '</span><span class="chain-text"><span class="chain-t">' + (i + 1) + '. ' + esc(s.name) + '</span><span class="chain-s">' + esc(s.desc.slice(0, 38)) + '...</span></span></div>' +
          (i < D.FORM_SKELETON.length - 1 ? '<span class="chain-arrow">' + ic('chevron-right', 16) + '</span>' : '');
      }).join('') + '</div></section>';
  }

  function rulesTab() {
    return APP.hint('Rules are the only thing that create a touch point.', 'sliders-horizontal') +
      APP.glance([[D.RULES.length, 'Rules'], [D.RULES.filter(function (r) { return r.on; }).length, 'On', 'is-good'], [D.RULES.filter(function (r) { return !r.on; }).length, 'Off', 'is-warn'], [D.RULES.reduce(function (n, r) { return n + r.fired; }, 0), 'Fired this cycle']]) +
      '<div class="filter-bar"><span class="fb-spacer"></span>' + APP.btn('New rule', 'btn-solid', 'plus', 'data-act="new-rule"', 'is-sm') + '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Rule' }, { t: 'Watches' }, { t: 'Condition' }, { t: 'Creates' }, { t: 'Due in' }, { t: 'Recurrence' }, { t: 'Fired', num: true }, { t: 'State' }],
        D.RULES.map(function (r) {
          return { cells: [
            '<span class="cell-strong">' + esc(r.name) + '</span><span class="cell-sub">' + esc(r.id) + '</span>',
            r.msr ? '<span class="cell-id">' + esc(r.msr) + '</span>' : '<span class="mini-note">Schedule</span>',
            '<span class="mini-note">' + esc(r.when) + '</span>',
            esc(D.formType(r.makes).name), esc(r.due), esc(r.rec), String(r.fired),
            '<label class="switch"><input type="checkbox"' + (r.on ? ' checked' : '') + ' data-change="rule-toggle" data-id="' + r.id + '"><span class="switch-track"><span class="switch-thumb"></span></span></label>'
          ] };
        })) + '</section>';
  }

  function integrityTab() {
    return APP.hint('What may never enter a record, and what is always captured with it.', 'shield-alert') +
      '<section class="card">' + APP.panelHead('Evidence guardrails', 'Applied at submission, before the record becomes immutable.') +
      '<div class="wq">' + D.GUARDRAILS.map(function (g) {
        return '<div class="wq-row"><span class="wq-ic' + (g.state === 'Blocked' ? ' is-late' : '') + '">' + ic(g.state === 'Blocked' ? 'ban' : g.state === 'Warned' ? 'triangle-alert' : 'shield', 16) + '</span>' +
          '<div class="wq-main"><span class="wq-t">' + esc(g.name) + '</span><span class="wq-s">' + esc(g.desc) + '</span></div>' +
          '<div class="wq-right">' + APP.badge(g.state, g.state === 'Blocked' ? 'is-danger' : g.state === 'Warned' ? 'is-warning' : 'is-success') + '</div></div>';
      }).join('') + '</div></section>' +
      '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Always captured', 'Not optional, not editable.') +
      APP.dataList([
        ['Attestation', 'Ticked by the person completing the form, at submission.'],
        ['Submitted timestamp', 'Server side. A late form records the true time and shows the gap.'],
        ['Location check', 'Distance from the registered address, matched or not.'],
        ['Duration', 'Time from opening to submission, including pauses.'],
        ['Hierarchy path', 'Bound permanently. A record does not move if a person does.'],
        ['Version', 'A correction creates a new version. Both stay.']
      ]) + '</section>' +
      '<section class="card">' + APP.panelHead('What this is not', 'Stated in the product so nobody has to guess.') +
      APP.callout('This is not an investigation system. Formal investigations belong in the HR case system, with different access, different retention and different disclosure rules. Attempting to put one here is blocked at the field.', 'is-danger', 'ban') +
      APP.callout('This is not a surveillance tool. The location check records a distance at a moment of submission. It is not a location history, and it is dropped from the record after two years.', 'is-info', 'eye-off') +
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
        APP.btn('Open the deleted view', 'btn-surface', 'trash-2', 'data-act="goto" data-href="#/records/deleted"', 'is-sm')) +
      APP.dataList([
        ['Who can delete', 'HR only'],
        ['Reason', 'Required, free text, kept forever'],
        ['What survives', 'The id, the original content, who deleted it and when'],
        ['In the export', 'Included, marked deleted, with the reason']
      ]) + '</section></div>' +
      '<section class="card">' + APP.panelHead('Hierarchy source', 'skyPerformance consumes the org chart, it does not own it.') +
      APP.dataList([
        ['Source system', esc(D.HRIS)],
        ['Sync', 'Nightly, full replace'],
        ['What it sets', 'Reporting line, job title, location, department, start date'],
        ['What it drives', 'Who can see what, approval routing, and every rollup'],
        ['Editable here', 'No. A wrong line is fixed in the HRIS and appears here the next morning.']
      ]) +
      APP.btn('Open the org chart', 'btn-surface', 'network', 'data-act="goto" data-href="#/org"', 'is-sm') +
      '</section>';
  }

  APP.VIEWS.settings = function (r) {
    var tab = r[1] || 'forms';
    var body = tab === 'rules' ? rulesTab() : tab === 'integrity' ? integrityTab() : tab === 'retention' ? retentionTab() : formsTab();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Settings', '#/settings']],
      title: 'Settings', desc: 'Form types, task rules, guardrails and retention. Changed here, applied everywhere.',
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
    var secs = t.id === 'FT-LOC' ? null : D.QUESTIONS[t.id];
    APP.dialog({
      title: t.name, sub: t.id + ' · ' + D.FORM_FAMILIES.filter(function (f) { return f.key === t.fam; })[0].name, size: 'is-wide',
      body: APP.dataList([
        ['Family', esc(D.FORM_FAMILIES.filter(function (f) { return f.key === t.fam; })[0].name)],
        ['Level', esc(t.level)],
        ['Questions', String(t.qs)],
        ['Scoring', t.scored ? '2 for Yes, 1 for No, not applicable. Two or more No marks Needs improvement.' : 'Written, no score'],
        ['Typical length', t.mins + ' minutes'],
        ['Who can run it', t.fam === 'leader' ? 'The leader above the subject' : t.fam === 'ops' ? 'Anyone above location level' : 'The employee direct manager']
      ]) +
        (secs ? '<h3 class="section-label">Question set</h3>' + secs.map(function (s) {
          return '<details class="collapse"><summary>' + esc(s.s) + '<span class="count-pill" style="margin-left:auto">' + s.qs.length + '</span></summary>' +
            s.qs.map(function (q) { return '<div class="qa-row"><span class="qa-q">' + esc(q) + '</span><span class="qa-a">' + (t.scored ? APP.badge('Scored', 'is-info') : '') + '</span></div>'; }).join('') + '</details>';
        }).join('')
          : '<h3 class="section-label">Sections</h3>' + D.REVIEW_SECTIONS.map(function (s) {
            return '<div class="qa-row"><span class="qa-q">' + esc(s.name) + '</span><span class="qa-a">' + APP.badge(s.qs + ' questions', 'is-neutral') + '</span></div>';
          }).join('')) +
        APP.callout('Editing a question set creates a new version of the form type. Records already submitted keep the version they were completed against, which is what keeps an old PDF readable.', 'is-info', 'history'),
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Save as a new version', 'btn-solid', 'check', 'data-act="toast" data-t="Version 2 saved" data-b="New forms use it from now. Every submitted record keeps version 1."')
    });
  };
  APP.ACT['new-ft'] = function () {
    APP.dialog({
      title: 'New form type', sub: 'Configuration. No release required.',
      body: APP.field('Name', '<input class="input" placeholder="Handover observation">', null, true) +
        '<div class="form-grid">' +
        APP.field('Family', APP.dd('nf-fam', D.FORM_FAMILIES.map(function (f) { return [f.key, f.name]; }), 'staff', 'dd-block'), null, true) +
        APP.field('Scoring', APP.dd('nf-score', [['scored', '2 / 1 / not applicable'], ['written', 'Written, no score']], 'scored', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Who can run it', APP.dd('nf-who', [['leader', 'The employee direct manager'], ['above', 'The leader above the subject'], ['ops', 'Anyone above location level']], 'leader', 'dd-block'), null, true) +
        APP.callout('The six sections are fixed. You are configuring the question set that goes in section three, and the rules for the rest.', 'is-info', 'layers'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create', 'btn-solid', 'plus', 'data-act="toast" data-t="Form type created" data-b="It is live in the Start a form dialog for every manager in scope."')
    });
  };
  APP.ACT['new-rule'] = function () {
    APP.dialog({
      title: 'New task rule', sub: 'Watch a measure or a schedule, create a touch point.',
      body: APP.field('Rule name', '<input class="input" placeholder="Safety incident opens a team huddle">', null, true) +
        APP.field('Watches', APP.dd('nr-msr', [['none', 'A schedule, not a measure']].concat(D.MEASURES.map(function (m) { return [m.id, m.name + '  ' + m.id]; })), 'msr.safety', 'dd-block'), 'Only measures with a stable id can be watched.', true) +
        APP.field('Condition', '<input class="input" value="Above 3.0 per 100 staff">', null, true) +
        '<div class="form-grid">' +
        APP.field('Creates', APP.dd('nr-ft', D.FORM_TYPES.map(function (t) { return [t.id, t.name]; }), 'FT-HUD', 'dd-block'), null, true) +
        APP.field('Due in', APP.dd('nr-due', [['2 days', '2 days'], ['5 days', '5 days'], ['7 days', '7 days'], ['14 days', '14 days']], '2 days', 'dd-block'), null, true) +
        '</div>' +
        APP.callout('A new rule runs against the current data on the next nightly refresh. It does not backfill, which stops a configuration change from burying a team in overdue work.', 'is-warning', 'clock'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create rule', 'btn-solid', 'plus', 'data-act="toast" data-t="Rule created" data-b="Off by default. Switch it on when you are ready for it to generate work."')
    });
  };
})();
