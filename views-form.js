/* skyPerformance: E4 the coaching form engine. One skeleton for every form type,
   six sections, scoring, carried forward action items, drafts, telemetry and an
   attestation before the record becomes immutable. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function newRunner(o) {
    return { task: o.task || null, ft: o.ft, emp: o.emp, step: 0, scores: {}, notes: {}, adds: [],
      started: Date.now(), elapsed: 0, attested: false, saved: false, geo: true };
  }
  APP.newRunner = newRunner;

  function mmss(ms) {
    var s = Math.floor(ms / 1000), m = Math.floor(s / 60);
    return (m < 10 ? '0' : '') + m + ':' + ((s % 60) < 10 ? '0' : '') + (s % 60);
  }
  function scored(ft) { return !!D.formType(ft).scored; }
  function flatQs(ft) {
    var out = [];
    D.questionsFor(ft).forEach(function (sec) { sec.qs.forEach(function (q) { out.push(q); }); });
    return out;
  }
  function noCount(r) { var n = 0; for (var k in r.scores) if (r.scores[k] === '1') n++; return n; }
  function answered(r) { var n = 0; for (var k in r.scores) if (r.scores[k]) n++; return n; }
  function outcome(r) {
    var ft = D.formType(r.ft);
    if (ft.id === 'FT-REC') return 'Recognition';
    if (!ft.scored) return 'Documented';
    return noCount(r) >= 2 ? 'Needs improvement' : 'Meets standard';
  }

  /* ---------------- sections ---------------- */
  function secInstructions(r) {
    var ft = D.formType(r.ft), e = P(r.emp);
    var carried = D.ACTIONS.filter(function (a) { return a.owner === r.emp && a.status !== 'Closed'; });
    return '<section class="card">' + APP.panelHead(ft.name, ft.desc) +
      APP.dataList([
        ['Who this is about', APP.personLine(e, esc(e.title) + ', ' + esc(D.cmName(e.cm)), 28, false)],
        ['Who is completing it', APP.personLine(APP.me(), null, 28, false)],
        ['Expected length', 'About ' + ft.mins + ' minutes, ' + ft.qs + ' questions'],
        ['Scoring', ft.scored ? '2 for Yes, 1 for No, or not applicable. Two or more No scores mark the form Needs improvement.' : 'Written. No score is applied.'],
        ['Where it binds', '<span class="cell-id">' + esc(APP.crumbPath(e.cm)) + ' / ' + esc(e.dept) + '</span>']
      ]) + '</section>' +
      (carried.length ? '<section class="card">' + APP.panelHead('Carried forward from last time', 'These stay on every form for this employee until they are closed.') +
        '<div class="wq">' + carried.map(APP.actionRow).join('') + '</div></section>' : '') +
      '<section class="card">' + APP.panelHead('Before you start', 'Two rules that keep the record usable later.') +
        APP.callout('<b>Write the behaviour, not the person.</b> "Left the call light out of reach in room 214" is coachable and defensible. "Careless" is neither.', 'is-info', 'pen-line') +
        APP.callout('<b>Do not put an investigation in here.</b> Abuse, neglect and exploitation investigations belong in Employee Relations. This form will refuse text tagged to an open investigation.', 'is-warning', 'ban') +
      '</section>';
  }

  function secSnapshot(r) {
    var e = P(r.emp), sigs = D.EMP_SIGNALS[r.emp] || [];
    return '<section class="card">' + APP.panelHead('Performance snapshot', 'Pulled from the signal layer at ' + esc(D.TODAY) + '. Read only, and stored with the form so the record keeps the numbers it was written against.') +
      (sigs.length ? '<div class="snap">' + sigs.map(function (s) {
        var sig = D.signal(s[0]), good = D.onTarget(s[0], s[1]);
        return '<div class="snap-row"><span class="snap-name">' + esc(sig.name) + '<span class="snap-id">' + esc(s[0]) + '</span></span>' +
          '<span class="snap-val">' + sig.fmt(s[1]) + '</span>' +
          '<span class="snap-tgt">Target ' + sig.fmt(sig.target) + '</span>' +
          APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>';
      }).join('') + '</div>' : '<div class="table-empty">No signals are tracked for this role yet.</div>') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Community context', D.cmName(e.cm)) +
      '<div class="stack-3">' + ['sig.call_light', 'sig.fill', 'sig.csat'].map(function (s) {
        var sig = D.signal(s), m = D.metric(s, e.cm);
        return APP.meter(sig.name, sig.fmt(m.v) + ' vs ' + sig.fmt(sig.target), Math.min(100, D.attain(s, m.v)), D.onTarget(s, m.v) ? '' : 'is-warn');
      }).join('') + '</div>' +
      '<p class="mini-note" style="margin-top:var(--space-4)">A signal that is off target across the whole community is usually not one person to coach. Say so in the observation if that is what you are seeing.</p>' +
      '</section>';
  }

  function secObservation(r) {
    var ft = D.formType(r.ft);
    if (!ft.scored) {
      var prompts = ft.id === 'FT-REC'
        ? [['What they did', 'Be specific. Name the shift, the resident room or the task.'], ['Why it mattered', 'Tie it to a standard or to a resident outcome.'], ['Who else should know', 'Recognition that stays between two people does not change anything.']]
        : ft.id === 'FT-HUD'
          ? [['Topic covered', 'One topic per huddle.'], ['Who attended', 'Names, not a headcount.'], ['What was agreed', 'Anything that needs a date goes in Action items.']]
          : [['What prompted this conversation', 'The signal, the event or the schedule.'], ['What was discussed', 'In the employee words as well as yours.'], ['What good looks like', 'The standard, stated plainly.'], ['What the employee said', 'Their account belongs in the record.']];
      return '<section class="card">' + APP.panelHead('Observation', 'Written form. Fill in the blanks so the wording stays consistent and defensible across leaders.') +
        prompts.map(function (p, i) {
          return APP.field(esc(p[0]), '<textarea class="textarea" data-input="obs" data-k="' + i + '" placeholder="' + esc(p[1]) + '">' + esc(r.notes[i] || '') + '</textarea>', esc(p[1]), i < 2);
        }).join('') + '</section>';
    }
    var secs = D.questionsFor(r.ft), idx = 0;
    var body = secs.map(function (sec) {
      var rows = sec.qs.map(function (q) {
        var k = 'q' + (idx++), v = r.scores[k];
        return '<div class="q-row"><span class="q-text">' + esc(q) + '</span>' +
          '<span class="q-score">' +
          ['2', '1', 'na'].map(function (opt) {
            var cls = opt === '2' ? 'is-yes' : opt === '1' ? 'is-no' : 'is-na';
            var label = opt === '2' ? '2 Yes' : opt === '1' ? '1 No' : 'N/A';
            return '<button class="q-btn ' + cls + (v === opt ? ' is-on' : '') + '" data-act="score" data-k="' + k + '" data-v="' + opt + '" aria-pressed="' + (v === opt) + '">' + label + '</button>';
          }).join('') + '</span></div>';
      }).join('');
      return '<div class="q-section"><div class="q-sec-head"><span class="q-sec-name">' + esc(sec.s) + '</span><span class="count-pill">' + sec.qs.length + '</span></div>' + rows + '</div>';
    }).join('');
    var n = noCount(r), a = answered(r), total = flatQs(r.ft).length;
    return '<section class="card">' +
      APP.panelHead('Observation', 'Score what you saw, not what you assume. Not applicable is a real answer and does not count against anyone.',
        '<span class="row-gap"><span class="mini-note">' + a + ' of ' + total + ' answered</span>' + APP.badge(n >= 2 ? 'Needs improvement' : n === 1 ? '1 No score' : 'Meets standard', n >= 2 ? 'is-danger' : n === 1 ? 'is-warning' : 'is-success') + '</span>') +
      (n >= 2 ? APP.callout('<b>Two or more No scores.</b> This form will submit as Needs improvement, and at least one action item is required before you can submit.', 'is-warning', 'triangle-alert') : '') +
      body +
      '<div class="row-gap" style="margin-top:var(--space-5)">' + APP.btn('Mark all remaining as Yes', 'btn-surface', 'check', 'data-act="score-all"', 'is-sm') + APP.btn('Clear scores', 'btn-ghost', null, 'data-act="score-clear"', 'is-sm') + '</div>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Summary', 'One paragraph a stranger could read in two years and understand.') +
      APP.field('What you observed', '<textarea class="textarea" data-input="obs" data-k="sum" placeholder="Two standards missed during morning care: hand hygiene between residents and leaving the call light in reach.">' + esc(r.notes.sum || '') + '</textarea>', null, true) +
      '</section>';
  }

  function secActions(r) {
    var carried = D.ACTIONS.filter(function (a) { return a.owner === r.emp && a.status !== 'Closed'; });
    var need = scored(r.ft) && noCount(r) >= 2 && !r.adds.length;
    return (need ? APP.callout('<b>An action item is required.</b> This form scored two or more No, so it cannot submit without something that names an owner and a date.', 'is-warning', 'triangle-alert') : '') +
      '<section class="card">' + APP.panelHead('New action items', 'Each one gets an owner, a due date and a description. It appears on the owner to do list and on the next form for this employee until it is closed.',
        APP.btn('Add action item', 'btn-solid', 'plus', 'data-act="add-action"', 'is-sm')) +
      (r.adds.length ? '<div class="wq">' + r.adds.map(function (a, i) {
        return '<div class="wq-row"><span class="wq-ic">' + ic('list-checks', 16) + '</span><div class="wq-main"><span class="wq-t">' + esc(a.t) + '</span>' +
          '<span class="wq-s">Owner ' + esc(P(a.owner).name) + ' · due ' + esc(a.due) + '</span></div>' +
          '<div class="wq-right">' + APP.btn('Remove', 'btn-ghost', 'trash-2', 'data-act="rm-action" data-i="' + i + '"', 'is-sm') + '</div></div>';
      }).join('') + '</div>' : APP.emptyState('list-checks', 'No action items yet', 'A coaching form with nothing to do next is a note, not coaching. Add one if anything needs to change.', APP.btn('Add action item', 'btn-solid', 'plus', 'data-act="add-action"'))) +
      '</section>' +
      (carried.length ? '<section class="card">' + APP.panelHead('Open items from earlier forms', 'Close them here or leave them open. Nothing is orphaned either way.') +
        '<div class="wq">' + carried.map(function (a) {
          return '<div class="wq-row"><span class="wq-ic' + (a.status === 'Overdue' ? ' is-late' : '') + '">' + ic('history', 16) + '</span>' +
            '<div class="wq-main"><span class="wq-t">' + esc(a.t) + '</span><span class="wq-s">' + esc(a.id) + ' · from ' + esc(a.from) + ' · due ' + esc(a.due) + '</span></div>' +
            '<div class="wq-right">' + APP.statusBadge(a.status) + APP.btn('Close it', 'btn-surface', 'check', 'data-act="close-action" data-id="' + a.id + '"', 'is-sm') + '</div></div>';
        }).join('') + '</div></section>' : '');
  }

  function secInfo(r) {
    var e = P(r.emp);
    return '<section class="card">' + APP.panelHead('Form info', 'Telemetry captured in the background. You cannot edit it, which is the point.') +
      APP.dataList([
        ['Form type', esc(D.formType(r.ft).name)],
        ['Employee', esc(e.name) + ', ' + esc(e.title)],
        ['Completed by', esc(APP.me().name) + ', ' + esc(APP.me().title)],
        ['Hierarchy path', '<span class="cell-id">' + esc(APP.crumbPath(e.cm)) + ' / ' + esc(e.dept) + '</span>'],
        ['Started', esc(D.TODAY) + ', ' + new Date(r.started).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })],
        ['Duration so far', '<span id="runInfoTimer">' + mmss(Date.now() - r.started) + '</span>'],
        ['Location', r.geo ? APP.badge('Matched, 18 m from the community address', 'is-success', 'map-pin') : APP.badge('Not matched, 2.4 km from the community address', 'is-warning', 'map-pin')],
        ['Device', 'Shared tablet, Cedar Ridge nursing station']
      ]) +
      '<div class="row-gap" style="margin-top:var(--space-4)">' + APP.btn(r.geo ? 'Simulate an off site submission' : 'Simulate an on site submission', 'btn-surface', 'map-pinned', 'data-act="toggle-geo"', 'is-sm') + '</div>' +
      (r.geo ? '' : APP.callout('Recording off site is allowed. It is not hidden: the record shows the distance, and a reviewer can ask why.', 'is-warning', 'map-pin')) +
      '</section>' +
      '<section class="card">' + APP.panelHead('Attestation', 'Required before submission. It is what makes the record stand up later.') +
      '<label class="checkbox"><input type="checkbox" data-change="attest"' + (r.attested ? ' checked' : '') + '><span>I completed this form myself, from what I observed, at the time and place recorded above.</span></label>' +
      '<p class="mini-note" style="margin-top:var(--space-3)">Submission is immutable. A correction creates a new version and both stay in the file.</p>' +
      '</section>';
  }

  function secSubmit(r) {
    var ft = D.formType(r.ft), e = P(r.emp);
    var out = outcome(r), n = noCount(r), a = answered(r), total = flatQs(r.ft).length;
    var blockers = [];
    if (ft.scored && a < total) blockers.push(total - a + ' questions are unanswered.');
    if (!r.notes.sum && ft.scored) blockers.push('The summary is empty.');
    if (ft.scored && n >= 2 && !r.adds.length) blockers.push('Two or more No scores need at least one action item.');
    if (!r.attested) blockers.push('The attestation is not ticked.');
    return (blockers.length
      ? APP.callout('<b>Not ready to submit.</b><ul class="co-list">' + blockers.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>', 'is-warning', 'triangle-alert')
      : APP.callout('<b>Ready to submit.</b> Once submitted this record cannot be edited, and ' + esc(e.name.split(' ')[0]) + ' will be asked to acknowledge it.', 'is-success', 'circle-check')) +
      '<section class="card">' + APP.panelHead('Read it back', 'Exactly what will be stored.') +
      APP.dataList([
        ['Form', esc(ft.name)],
        ['Employee', APP.personLine(e, null, 28, false)],
        ['Outcome', APP.statusBadge(out)],
        ['Score', ft.scored ? a + ' of ' + total + ' answered, ' + n + ' No' : 'Not scored'],
        ['Action items', r.adds.length ? r.adds.map(function (x) { return esc(x.t) + ' (' + esc(P(x.owner).name) + ', ' + esc(x.due) + ')'; }).join('<br>') : 'None'],
        ['Duration', '<span id="runInfoTimer2">' + mmss(Date.now() - r.started) + '</span>'],
        ['Location', r.geo ? 'Matched' : 'Not matched, 2.4 km away'],
        ['Attested', r.attested ? 'Yes, by ' + esc(APP.me().name) : 'Not yet']
      ]) +
      (r.notes.sum ? '<h3 style="font-size:var(--fs-1);text-transform:uppercase;letter-spacing:.04em;color:var(--fg-low);margin:var(--space-5) 0 var(--space-2)">Summary</h3><p class="t-2">' + esc(r.notes.sum) + '</p>' : '') +
      '</section>';
  }

  /* ---------------- shell ---------------- */
  APP.formRunner = function (r) {
    var run = S.runner;
    if (!run) return APP.page({ crumbs: [['Home', '#/home'], ['Coaching', '#/coaching']], title: 'Nothing in progress', desc: 'Pick a touch point to run.', body: APP.emptyState('clipboard-list', 'No form open', 'Start one from the to do list or the form catalogue.', APP.btn('Open the to do list', 'btn-solid', 'list-checks', 'data-act="goto" data-href="#/coaching"')) });
    var ft = D.formType(run.ft), e = P(run.emp), step = run.step;
    var sections = D.FORM_SKELETON;
    var rail = '<aside class="runner-rail">' + sections.map(function (s, i) {
      return '<button class="rr-step' + (i === step ? ' is-active' : '') + (i < step ? ' is-done' : '') + '" data-act="run-step" data-i="' + i + '">' +
        '<span class="rr-num">' + (i < step ? '✓' : i + 1) + '</span><span class="rr-text"><span class="rr-t">' + esc(s.name) + '</span><span class="rr-sub">' + esc(s.desc.slice(0, 44)) + (s.desc.length > 44 ? '...' : '') + '</span></span></button>';
    }).join('') +
      '<div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)">' +
      APP.btn('Save draft and leave', 'btn-surface', 'file-down', 'data-act="save-draft"', 'is-sm') +
      APP.btn('Discard', 'btn-ghost', 'trash-2', 'data-act="discard-form"', 'is-sm') + '</div></aside>';

    var content = step === 0 ? secInstructions(run) : step === 1 ? secSnapshot(run) : step === 2 ? secObservation(run)
      : step === 3 ? secActions(run) : step === 4 ? secInfo(run) : secSubmit(run);

    var head = '<div class="runner-head">' +
      '<span class="wq-ic">' + ic(ft.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(ft.name) + ' · ' + esc(e.name) + '</span><span class="wq-s">' + (run.task ? esc(run.task) + ' · ' : '') + esc(D.cmName(e.cm)) + ' · ' + esc(e.dept) + '</span></div>' +
      '<span class="rh-spacer"></span>' +
      '<span class="rh-timer">' + ic('timer', 16) + '<span id="runTimer">' + mmss(Date.now() - run.started) + '</span></span>' +
      '<span class="rh-geo">' + ic('map-pin', 14) + (run.geo ? 'Geo matched' : 'Off site') + '</span>' +
      (run.saved ? APP.badge('Draft saved', 'is-info') : '') + '</div>';

    var foot = '<div class="runner-foot">' +
      (step > 0 ? APP.btn('Back', 'btn-surface', 'chevron-left', 'data-act="run-step" data-i="' + (step - 1) + '"') : '') +
      '<span class="rf-note">Section ' + (step + 1) + ' of ' + sections.length + ' · ' + esc(sections[step].name) + '</span>' +
      '<span class="rf-spacer"></span>' +
      (step < sections.length - 1
        ? APP.btn('Continue', 'btn-solid', 'chevron-right', 'data-act="run-step" data-i="' + (step + 1) + '"')
        : APP.btn('Submit form', 'btn-solid', 'send', 'data-act="submit-form"')) + '</div>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['Coaching', '#/coaching'], [ft.name, '#']],
      title: ft.name, desc: 'About ' + esc(e.name) + ', ' + esc(e.title) + '. Every form type uses these six sections.',
      scope: false,
      body: head + '<div class="runner">' + rail + '<div>' + content + foot + '</div></div>'
    });
  };

  /* keep the duration timer honest while the form is open */
  var tick = null;
  APP.AFTER.push(function () {
    if (tick) { clearInterval(tick); tick = null; }
    if (!document.getElementById('runTimer') || !S.runner) return;
    tick = setInterval(function () {
      var el = document.getElementById('runTimer');
      if (!el || !S.runner) { clearInterval(tick); tick = null; return; }
      var t = mmss(Date.now() - S.runner.started);
      el.textContent = t;
      ['runInfoTimer', 'runInfoTimer2'].forEach(function (id) { var x = document.getElementById(id); if (x) x.textContent = t; });
    }, 1000);
  });

  /* ---------------- actions ---------------- */
  var A = APP.ACT;
  A['run-form'] = function (el) {
    var taskId = el.getAttribute('data-task');
    var t = taskId ? D.TASKS.filter(function (x) { return x.id === taskId; })[0] : null;
    var ft = t ? t.ft : el.getAttribute('data-ft');
    var emp = t ? t.emp : (el.getAttribute('data-emp') || null);
    APP.closeAll();
    if (!emp) { pickEmployee(ft); return; }
    S.runner = newRunner({ task: taskId, ft: ft, emp: emp });
    APP.go('#/coaching/run');
  };
  function pickEmployee(ft) {
    var list = APP.people().filter(function (p) { return p.id !== APP.me().id; });
    APP.dialog({
      title: 'Who is this form about', sub: D.formType(ft).name + ' · scoped to ' + APP.scopeLabel(),
      body: '<div class="wq">' + list.map(function (p) {
        return '<button class="wq-row" data-act="run-form" data-ft="' + ft + '" data-emp="' + p.id + '" style="width:100%;border:0;background:none;cursor:pointer">' +
          '<span class="wq-ic">' + ic('user', 16) + '</span><span class="wq-main"><span class="wq-t">' + esc(p.name) + '</span><span class="wq-s">' + esc(p.title) + ' · ' + esc(D.cmName(p.cm)) + '</span></span>' +
          '<span class="wq-right">' + ic('chevron-right', 16) + '</span></button>';
      }).join('') + '</div>'
    });
  }
  A['run-step'] = function (el) { S.runner.step = +el.getAttribute('data-i'); APP.rerender(); };
  A.score = function (el) {
    var k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
    S.runner.scores[k] = S.runner.scores[k] === v ? null : v;
    APP.rerender();
  };
  A['score-all'] = function () {
    var total = flatQs(S.runner.ft).length;
    for (var i = 0; i < total; i++) if (!S.runner.scores['q' + i]) S.runner.scores['q' + i] = '2';
    APP.rerender();
  };
  A['score-clear'] = function () { S.runner.scores = {}; APP.rerender(); };
  APP.INPUT.obs = function (el) { S.runner.notes[el.getAttribute('data-k')] = el.value; };
  APP.INPUT.attest = function (el) { S.runner.attested = el.checked; };
  A['toggle-geo'] = function () { S.runner.geo = !S.runner.geo; APP.rerender(); };
  A['add-action'] = function () {
    var e = P(S.runner.emp);
    APP.dialog({
      title: 'Add an action item', sub: 'Owner and date are required. That is what makes it followable.',
      body: APP.field('What needs to happen', '<textarea class="textarea" data-input="ai-t" placeholder="Hand hygiene between every resident, observed twice by the nurse manager."></textarea>', null, true) +
        '<div class="form-grid">' +
        APP.field('Owner', APP.dd('ai-owner', [[e.id, e.name + ' (the employee)'], [APP.me().id, APP.me().name + ' (you)']], e.id, 'dd-block'), null, true) +
        APP.field('Due', APP.dd('ai-due', [['Fri 19 Sep 2026', 'Fri 19 Sep 2026, in 3 days'], ['Fri 26 Sep 2026', 'Fri 26 Sep 2026, in 10 days'], ['Fri 16 Oct 2026', 'Fri 16 Oct 2026, in 30 days']], 'Fri 19 Sep 2026', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Follow up note', '<textarea class="textarea" data-input="ai-n" placeholder="Optional. What you will look for when you check."></textarea>'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add item', 'btn-solid', 'plus', 'data-act="save-action"')
    });
  };
  APP.INPUT['ai-t'] = function (el) { S.f.aiT = el.value; };
  APP.INPUT['ai-n'] = function (el) { S.f.aiN = el.value; };
  A['save-action'] = function () {
    var t = S.f.aiT || 'Hand hygiene between every resident, observed twice by the nurse manager';
    S.runner.adds.push({ t: t, owner: S.f['ai-owner'] || S.runner.emp, due: S.f['ai-due'] || 'Fri 19 Sep 2026', note: S.f.aiN || '' });
    S.f.aiT = ''; S.f.aiN = '';
    APP.closeOverlay(); APP.rerender(); APP.toast('Action item added', 'It will appear on the owner to do list as soon as the form is submitted.');
  };
  A['rm-action'] = function (el) { S.runner.adds.splice(+el.getAttribute('data-i'), 1); APP.rerender(); };
  A['close-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    a.status = 'Closed'; a.closedOn = D.TODAY;
    APP.rerender(); APP.toast('Action item closed', a.id + ' will stop appearing on forms for ' + P(a.owner).name.split(' ')[0] + '.');
  };
  A['save-draft'] = function () {
    S.runner.saved = true;
    APP.toast('Draft saved', 'Drafts survive a closed tablet, a dropped session and a shift change. Resume it from the to do list.', 'info');
    var t = S.runner.task ? D.TASKS.filter(function (x) { return x.id === S.runner.task; })[0] : null;
    if (t && t.status !== 'Completed') t.status = 'Draft';
    S.runner = null; APP.go('#/coaching');
  };
  A['discard-form'] = function () {
    APP.dialog({
      title: 'Discard this form', sub: 'Nothing is kept.',
      body: APP.callout('Discarding loses what you have entered. The touch point stays on the to do list and stays due.', 'is-danger', 'triangle-alert'),
      footer: APP.btn('Keep working', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Discard', 'btn-solid is-danger', 'trash-2', 'data-act="discard-confirm"')
    });
  };
  A['discard-confirm'] = function () { S.runner = null; APP.closeAll(); APP.go('#/coaching'); APP.toast('Discarded', 'The touch point is still on your list.', 'info'); };
  A['submit-form'] = function () {
    var r = S.runner, ft = D.formType(r.ft), e = P(r.emp);
    var blocked = (ft.scored && (answered(r) < flatQs(r.ft).length || !r.notes.sum)) || !r.attested || (ft.scored && noCount(r) >= 2 && !r.adds.length);
    if (blocked) { APP.toast('Not ready', 'Fix what the panel lists before submitting.', 'warning'); return; }
    var id = 'FM-' + (20940 + Math.floor(Math.random() * 40));
    D.FORMS.unshift({ id: id, ft: r.ft, emp: r.emp, by: APP.me().id, date: D.TODAY, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      mins: Math.max(1, Math.round((Date.now() - r.started) / 60000)), cm: e.cm, dept: e.dept, outcome: outcome(r), noCount: noCount(r),
      geo: r.geo ? 'Matched, 18 m from the community address' : 'Not matched, 2.4 km from the community address', geoFlag: !r.geo,
      summary: r.notes.sum || 'Documented conversation.', scores: [], actions: [], attested: true, ack: null, task: r.task, fresh: true });
    r.adds.forEach(function (a, i) {
      var aid = 'AI-' + (8900 + Math.floor(Math.random() * 90) + i);
      D.ACTIONS.unshift({ id: aid, t: a.t, owner: a.owner, by: APP.me().id, from: id, due: a.due, status: 'Open', cm: e.cm, notes: a.note ? [{ on: D.TODAY, by: APP.me().id, t: a.note }] : [] });
    });
    if (r.task) { var t = D.TASKS.filter(function (x) { return x.id === r.task; })[0]; if (t) { t.status = 'Completed'; t.done = D.TODAY; t.formId = id; } }
    S.runner = null; APP.go('#/coaching');
    APP.toast('Form submitted', id + ' is now immutable. ' + e.name.split(' ')[0] + ' has been asked to acknowledge it.');
    setTimeout(function () { APP.ACT['open-form']({ getAttribute: function () { return id; } }); }, 400);
  };
})();
