/* skyPerformance: the form engine. One skeleton for every form type, six
   sections, scoring, carried forward action items, drafts, telemetry and an
   attestation before the record becomes immutable. Starting a form is the small
   Level / Type / Employee dialog the reference product uses. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  var BASE = function () { return APP.is('employee') ? '#/coaching' : '#/todo'; };
  function newRunner(o) {
    return { task: o.task || null, ft: o.ft, emp: o.emp, review: o.review || null, step: 0, scores: {}, notes: {},
      adds: [], started: Date.now(), attested: false, saved: false, geo: true, sec: 0 };
  }
  APP.newRunner = newRunner;
  function mmss(ms) { var s = Math.floor(ms / 1000), m = Math.floor(s / 60); return (m < 10 ? '0' : '') + m + ':' + ((s % 60) < 10 ? '0' : '') + (s % 60); }
  function isReview(ft) { return ft === 'FT-LOC'; }
  function secs(ft) { return isReview(ft) ? D.REVIEW_SECTIONS.map(function (s) { return { s: s.name, qs: s.items, ic: s.ic, total: s.qs }; }) : D.questionsFor(ft); }
  function flatQs(ft) { var out = []; secs(ft).forEach(function (s) { s.qs.forEach(function (q) { out.push(q); }); }); return out; }
  function noCount(r) { var n = 0; for (var k in r.scores) if (r.scores[k] === '1') n++; return n; }
  function answered(r) { var n = 0; for (var k in r.scores) if (r.scores[k]) n++; return n; }
  function scoredType(ft) { return !!D.formType(ft).scored; }
  function outcome(r) {
    var ft = D.formType(r.ft);
    if (ft.id === 'FT-REC') return 'Recognition';
    if (!ft.scored) return 'Documented';
    return noCount(r) >= 2 ? 'Needs improvement' : 'Meets standard';
  }
  function subject(r) { return r.emp ? P(r.emp) : null; }
  function locOf(r) { return r.emp ? P(r.emp).loc : (r.review ? D.review(r.review).loc : APP.me().loc); }

  /* ---------------- sections ---------------- */
  function secInstructions(r) {
    var ft = D.formType(r.ft), e = subject(r);
    var carried = e ? D.ACTIONS.filter(function (a) { return a.owner === e.id && a.status !== 'Closed'; }) : [];
    return '<section class="card">' + APP.panelHead(ft.name, ft.desc) +
      APP.dataList([
        [e ? 'Who this is about' : 'Where this is about', e ? APP.personLine(e, esc(e.title) + ', ' + esc(D.locName(e.loc)), 28, false) : esc(D.locName(locOf(r)))],
        ['Who is completing it', APP.personLine(APP.me(), null, 28, false)],
        ['Expected length', 'About ' + ft.mins + ' minutes, ' + ft.qs + ' questions'],
        ['Scoring', ft.scored ? '2 for Yes, 1 for No, or not applicable. Two or more No scores mark the form Needs improvement.' : 'Written. No score is applied.'],
        ['Where it binds', '<span class="cell-id">' + esc(APP.hierPath(locOf(r), e ? e.dept : null)) + '</span>']
      ]) + '</section>' +
      (carried.length ? '<section class="card">' + APP.panelHead('Carried forward from last time', 'These stay on every form for this person until they are closed.') +
        '<div class="wq">' + carried.map(APP.actionRow).join('') + '</div></section>' : '') +
      '<section class="card">' + APP.panelHead('Before you start') +
        '<ul class="tick-list"><li>' + ic('check', 14) + '<span><b>Write the behaviour, not the person.</b> "Out of date procedure on 3 of 5 tasks", not "careless".</span></li>' +
        '<li>' + ic('ban', 14) + '<span><b>No investigations here.</b> Those belong in the HR case system.</span></li></ul>' +
      '</section>';
  }

  function secSnapshot(r) {
    var e = subject(r), loc = locOf(r), msrs = e ? (D.EMP_MEASURES[e.id] || []) : [];
    return '<section class="card">' + APP.panelHead('Performance snapshot', 'Pulled at ' + esc(D.TODAY) + '. Read only, and stored with the form so the record keeps the numbers it was written against.') +
      (msrs.length ? '<div class="snap">' + msrs.map(function (m) {
        var s = D.measure(m[0]), good = D.onTarget(m[0], m[1]);
        return '<div class="snap-row"><span class="snap-name">' + esc(s.name) + '<span class="snap-id">' + esc(m[0]) + '</span></span>' +
          '<span class="snap-val">' + s.fmt(m[1]) + '</span><span class="snap-tgt">Target ' + s.fmt(s.target) + '</span>' +
          APP.badge(good ? 'On target' : 'Off target', good ? 'is-success' : 'is-danger') + '</div>';
      }).join('') + '</div>' : '<div class="table-empty">No measures are tracked for this person yet.</div>') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Location context', D.locName(loc)) +
      '<div class="stack-3">' + ['msr.quality', 'msr.adherence', 'msr.csat'].map(function (m) {
        var s = D.measure(m), x = D.metric(m, loc);
        return APP.meter(s.name, s.fmt(x.v) + ' vs ' + s.fmt(s.target), Math.min(100, D.attain(m, x.v)), D.onTarget(m, x.v) ? '' : 'is-warn');
      }).join('') + '</div>' +
      '<p class="mini-note" style="margin-top:var(--space-4)">A measure that is off target across the whole location is usually not one person to coach. Say so in the observation if that is what you are seeing.</p>' +
      '</section>';
  }

  function secObservation(r) {
    var ft = D.formType(r.ft);
    if (!ft.scored) {
      var prompts = ft.id === 'FT-REC'
        ? [['What they did', 'Be specific. Name the shift, the task or the customer reference.'], ['Why it mattered', 'Tie it to a standard or to an outcome.'], ['Who else should know', 'Recognition that stays between two people does not change anything.']]
        : ft.id === 'FT-HUD'
          ? [['Topic covered', 'One topic per huddle.'], ['Who attended', 'Names, not a headcount.'], ['What was agreed', 'Anything that needs a date goes in Action items.']]
          : [['What prompted this conversation', 'The measure, the event or the schedule.'], ['What was discussed', 'In their words as well as yours.'], ['What good looks like', 'The standard, stated plainly.'], ['What they said', 'Their account belongs in the record.']];
      return '<section class="card">' + APP.panelHead('Observation', 'Written form. Fill in the blanks so the wording stays consistent and defensible across managers.') +
        prompts.map(function (p, i) {
          return APP.field(esc(p[0]), '<textarea class="textarea" data-input="obs" data-k="' + i + '" placeholder="' + esc(p[1]) + '">' + esc(r.notes[i] || '') + '</textarea>', esc(p[1]), i < 2);
        }).join('') + '</section>';
    }
    var list = secs(r.ft), idx = 0, review = isReview(r.ft);
    var body = list.map(function (sec, si) {
      var rows = sec.qs.map(function (q) {
        var k = 'q' + (idx++), v = r.scores[k];
        return '<div class="q-row"><span class="q-text">' + esc(q) + '</span><span class="q-score">' +
          ['2', '1', 'na'].map(function (opt) {
            var cls = opt === '2' ? 'is-yes' : opt === '1' ? 'is-no' : 'is-na';
            var label = opt === '2' ? '2 Yes' : opt === '1' ? '1 No' : 'N/A';
            return '<button class="q-btn ' + cls + (v === opt ? ' is-on' : '') + '" data-act="score" data-k="' + k + '" data-v="' + opt + '" aria-pressed="' + (v === opt) + '">' + label + '</button>';
          }).join('') + '</span></div>';
      }).join('');
      if (review) {
        return '<details class="collapse q-collapse"' + (si === 0 ? ' open' : '') + '><summary>' + ic(sec.ic || 'clipboard-list', 16) + '<span>' + esc(sec.s) + '</span><span class="count-pill" style="margin-left:auto">' + sec.total + '</span></summary>' +
          rows + APP.field('Section summary', '<textarea class="textarea" placeholder="One paragraph. It is what the Location Director hears at the debrief."></textarea>') +
          '<div class="photo-row"><button class="photo-tile photo-add" data-act="toast" data-t="Camera" data-b="On a tablet this opens the camera. The photo attaches to this section with the same timestamp and location as the answers." data-k="info">' + ic('camera', 18) + '</button></div>' +
          '</details>';
      }
      return '<div class="q-section"><div class="q-sec-head"><span class="q-sec-name">' + esc(sec.s) + '</span><span class="count-pill">' + sec.qs.length + '</span></div>' + rows + '</div>';
    }).join('');
    var n = noCount(r), a = answered(r), total = flatQs(r.ft).length;
    return '<section class="card">' +
      APP.panelHead('Observation', review ? 'Eight sections, ' + D.formType(r.ft).qs + ' questions. Answer in any order, the draft saves on every answer.' : 'Score what you saw, not what you assume. Not applicable is a real answer and does not count against anyone.',
        '<span class="row-gap"><span class="mini-note">' + a + ' of ' + (review ? D.formType(r.ft).qs : total) + ' answered</span>' + APP.badge(n >= 2 ? 'Needs improvement' : n === 1 ? '1 No score' : 'Meets standard', n >= 2 ? 'is-danger' : n === 1 ? 'is-warning' : 'is-success') + '</span>') +
      (n >= 2 ? APP.callout('<b>Two or more No scores.</b> This form will submit as Needs improvement, and at least one action item is required before you can submit.', 'is-warning', 'triangle-alert') : '') +
      body +
      '<div class="row-gap" style="margin-top:var(--space-5)">' + APP.btn('Mark all remaining as Yes', 'btn-surface', 'check', 'data-act="score-all"', 'is-sm') + APP.btn('Clear scores', 'btn-ghost', null, 'data-act="score-clear"', 'is-sm') + '</div>' +
      '</section>' +
      '<section class="card">' + APP.panelHead('Summary', 'One paragraph a stranger could read in two years and understand.') +
      APP.field('What you observed', '<textarea class="textarea" data-input="obs" data-k="sum" placeholder="Two standards missed: the procedure version in use was out of date, and the work was recorded at the end of the shift rather than as it went.">' + esc(r.notes.sum || '') + '</textarea>', null, true) +
      '</section>';
  }

  function secActions(r) {
    var e = subject(r);
    var carried = e ? D.ACTIONS.filter(function (a) { return a.owner === e.id && a.status !== 'Closed'; }) : [];
    var need = scoredType(r.ft) && noCount(r) >= 2 && !r.adds.length;
    return (need ? APP.callout('<b>An action item is required.</b> This form scored two or more No, so it cannot submit without something that names an owner and a date.', 'is-warning', 'triangle-alert') : '') +
      '<section class="card">' + APP.panelHead('New action items', 'Each one gets an owner, a due date and a description. It appears on the owner to-do list and on the next form for this person until it is closed.',
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
    var e = subject(r);
    return '<section class="card">' + APP.panelHead('Form information', 'Captured in the background. You cannot edit it, which is the point.') +
      APP.dataList([
        ['Form type', esc(D.formType(r.ft).name)],
        [e ? 'Employee' : 'Location', e ? esc(e.name) + ', ' + esc(e.title) : esc(D.locName(locOf(r)))],
        ['Completed by', esc(APP.me().name) + ', ' + esc(APP.me().title)],
        ['Hierarchy path', '<span class="cell-id">' + esc(APP.hierPath(locOf(r), e ? e.dept : null)) + '</span>'],
        ['Started', esc(D.TODAY) + ', ' + new Date(r.started).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })],
        ['Duration so far', '<span id="runInfoTimer">' + mmss(Date.now() - r.started) + '</span>'],
        ['Location check', r.geo ? APP.badge('Matched, 18 m from the registered address', 'is-success', 'map-pin') : APP.badge('Not matched, 2.4 km from the registered address', 'is-warning', 'map-pin')],
        ['Device', 'Shared tablet, ' + D.locName(locOf(r))]
      ]) +
      '<div class="row-gap" style="margin-top:var(--space-4)">' + APP.btn(r.geo ? 'Simulate an off site submission' : 'Simulate an on site submission', 'btn-surface', 'map-pinned', 'data-act="toggle-geo"', 'is-sm') + '</div>' +
      (r.geo ? '' : APP.callout('Recording off site is allowed. It is not hidden: the record shows the distance, and a reviewer can ask why.', 'is-warning', 'map-pin')) +
      '</section>' +
      '<section class="card">' + APP.panelHead('Attestation', 'Required before submission. It is what makes the record stand up later.') +
      '<label class="checkbox"><input type="checkbox" data-change="attest"' + (r.attested ? ' checked' : '') + '><span>I have reviewed this documentation in its entirety and confirm that it is factual, accurate, and reflects the actions taken and the discussion held, at the time and place recorded above.</span></label>' +
      '<p class="mini-note" style="margin-top:var(--space-3)">Submission is immutable. A correction creates a new version and both stay in the file.</p>' +
      '</section>';
  }

  function secSubmit(r) {
    var ft = D.formType(r.ft), e = subject(r);
    var out = outcome(r), n = noCount(r), a = answered(r), total = flatQs(r.ft).length;
    var blockers = [];
    if (ft.scored && a < total) blockers.push((total - a) + ' questions are unanswered.');
    if (!r.notes.sum && ft.scored) blockers.push('The summary is empty.');
    if (ft.scored && n >= 2 && !r.adds.length) blockers.push('Two or more No scores need at least one action item.');
    if (!r.attested) blockers.push('The attestation is not ticked.');
    return (blockers.length
      ? APP.callout('<b>Not ready to submit.</b><ul class="co-list">' + blockers.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>', 'is-warning', 'triangle-alert')
      : APP.callout('<b>Ready to submit.</b> Once submitted this record cannot be edited' + (e ? ', and ' + esc(e.name.split(' ')[0]) + ' will be asked to acknowledge it' : '') + '.', 'is-success', 'circle-check')) +
      '<section class="card">' + APP.panelHead('Read it back', 'Exactly what will be stored.') +
      APP.dataList([
        ['Form', esc(ft.name)],
        [e ? 'Employee' : 'Location', e ? APP.personLine(e, null, 28, false) : esc(D.locName(locOf(r)))],
        ['Outcome', APP.statusBadge(out)],
        ['Score', ft.scored ? a + ' of ' + total + ' answered, ' + n + ' No' : 'Not scored'],
        ['Action items', r.adds.length ? r.adds.map(function (x) { return esc(x.t) + ' (' + esc(P(x.owner).name) + ', ' + esc(x.due) + ')'; }).join('<br>') : 'None'],
        ['Duration', '<span id="runInfoTimer2">' + mmss(Date.now() - r.started) + '</span>'],
        ['Location check', r.geo ? 'Matched' : 'Not matched, 2.4 km away'],
        ['Attested', r.attested ? 'Yes, by ' + esc(APP.me().name) : 'Not yet']
      ]) +
      (r.notes.sum ? '<h3 class="section-label">Summary</h3><p class="t-2">' + esc(r.notes.sum) + '</p>' : '') +
      '</section>';
  }

  /* ---------------- shell ---------------- */
  APP.formRunner = function () {
    var run = S.runner;
    if (!run) return APP.page({ crumbs: [['Home', '#/home'], ['To-do list', BASE()]], title: 'Nothing in progress', desc: 'Pick a touch point to start.',
      body: APP.emptyState('clipboard-list', 'No form open', 'Start one from the to-do list.', APP.btn('Open the to-do list', 'btn-solid', 'list-checks', 'data-act="goto" data-href="' + BASE() + '"')) });
    var ft = D.formType(run.ft), e = subject(run), step = run.step, sections = D.FORM_SKELETON;
    var rail = '<aside class="runner-rail">' +
      '<div class="rr-timer">' + ic('timer', 16) + '<span>On-site duration</span><span id="runTimer">' + mmss(Date.now() - run.started) + '</span></div>' +
      '<div class="rr-label">Sections</div>' +
      sections.map(function (s, i) {
        return '<button class="rr-step' + (i === step ? ' is-active' : '') + (i < step ? ' is-done' : '') + '" data-act="run-step" data-i="' + i + '">' +
          '<span class="rr-num">' + (i < step ? '&#10003;' : i + 1) + '</span><span class="rr-text"><span class="rr-t">' + esc(s.name) + '</span></span></button>';
      }).join('') +
      '<div style="margin-top:var(--space-4);display:flex;flex-direction:column;gap:var(--space-2)">' +
      APP.btn('Save and close', 'btn-surface', 'file-down', 'data-act="save-draft"', 'is-sm') +
      APP.btn('Cancel and close', 'btn-ghost', 'x', 'data-act="discard-form"', 'is-sm') + '</div></aside>';

    var content = step === 0 ? secInstructions(run) : step === 1 ? secSnapshot(run) : step === 2 ? secObservation(run)
      : step === 3 ? secActions(run) : step === 4 ? secInfo(run) : secSubmit(run);

    var head = '<div class="runner-head">' +
      '<span class="wq-ic">' + ic(ft.ic, 16) + '</span>' +
      '<div class="wq-main"><span class="wq-t">' + esc(ft.name) + (e ? ' · ' + esc(e.name) : ' · ' + esc(D.locName(locOf(run)))) + '</span>' +
      '<span class="wq-s">' + (run.task ? esc(run.task) + ' · ' : '') + esc(APP.hierPath(locOf(run), e ? e.dept : null)) + '</span></div>' +
      '<span class="rh-spacer"></span>' +
      '<span class="rh-geo">' + ic('map-pin', 14) + (run.geo ? 'Location matched' : 'Off site') + '</span>' +
      (run.saved ? APP.badge('Draft saved', 'is-info') : '') + '</div>';

    var foot = '<div class="runner-foot">' +
      (step > 0 ? APP.btn('Back', 'btn-surface', 'chevron-left', 'data-act="run-step" data-i="' + (step - 1) + '"') : '') +
      '<span class="rf-note">Section ' + (step + 1) + ' of ' + sections.length + ' · ' + esc(sections[step].name) + '</span>' +
      '<span class="rf-spacer"></span>' +
      (step < sections.length - 1
        ? APP.btn('Continue', 'btn-solid', 'chevron-right', 'data-act="run-step" data-i="' + (step + 1) + '"')
        : APP.btn('Submit', 'btn-solid', 'send', 'data-act="submit-form"')) + '</div>';

    return APP.page({
      crumbs: [['Home', '#/home'], [APP.is('employee') ? 'My coaching' : 'To-do list', BASE()], [ft.name, '#']],
      title: ft.name, desc: (e ? 'About ' + esc(e.name) + ', ' + esc(e.title) + '. ' : '') + 'Every form type uses these six sections.',
      body: head + '<div class="runner">' + rail + '<div>' + content + foot + '</div></div>'
    });
  };

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

  /* ---------------- start a form: Level, Type, Employee ---------------- */
  var A = APP.ACT;
  A['start-form'] = function (el) {
    var preset = el && el.getAttribute('data-emp');
    S.f.sfLevel = preset ? 'staff' : (S.f.sfLevel || 'staff');
    S.f.sfType = null; S.f.sfEmp = preset || null;
    openStart();
  };
  function openStart() {
    var fam = S.f.sfLevel || 'staff';
    var types = D.FORM_TYPES.filter(function (t) { return t.fam === fam; });
    var type = S.f.sfType || types[0].id;
    S.f.sfType = type;
    var needsPerson = fam !== 'ops';
    var pool = APP.people().filter(function (p) {
      if (p.id === APP.me().id) return false;
      return fam === 'leader' ? (p.level === 'dept' || p.level === 'location') : p.level === 'staff';
    });
    if (!pool.length) pool = APP.people().filter(function (p) { return p.id !== APP.me().id; });
    var emp = S.f.sfEmp || (pool[0] ? pool[0].id : null);
    S.f.sfEmp = emp;
    var locs = APP.scopeLocs();
    APP.closeAll();
    APP.dialog({
      title: 'Start a form', sub: 'Three choices, then you are in the form.',
      body: '<div class="sf-block"><span class="field-label">Level</span>' +
        '<div class="sf-radios">' + D.FORM_FAMILIES.map(function (f) {
          var on = f.key === fam;
          return '<button class="sf-radio' + (on ? ' is-on' : '') + '" data-act="sf-level" data-k="' + f.key + '" aria-pressed="' + on + '">' +
            '<span class="sf-dot"></span><span class="sf-rt"><span class="sf-rn">' + esc(f.name) + '</span><span class="sf-rs">' + esc(f.desc) + '</span></span></button>';
        }).join('') + '</div></div>' +
        APP.field('Form type', APP.dd('sfType', types.map(function (t) { return [t.id, t.name + ', about ' + t.mins + ' min']; }), type, 'dd-block'),
          esc(D.formType(type).desc), true) +
        (needsPerson
          ? APP.field('Employee', APP.dd('sfEmp', pool.map(function (p) { return [p.id, p.name + ', ' + p.title]; }), emp, 'dd-block'), 'Only people in your reporting line are listed.', true)
          : APP.field('Location', APP.dd('sfLoc', locs.map(function (l) { return [l, D.locName(l)]; }), S.f.sfLoc || locs[0], 'dd-block'), 'An operational review is run on a place, not a person.', true)),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Continue', 'btn-solid', 'circle-arrow-right', 'data-act="sf-go"')
    });
  }
  A['sf-level'] = function (el) { S.f.sfLevel = el.getAttribute('data-k'); S.f.sfType = null; openStart(); };
  APP.DD.sfType = function (v) { S.f.sfType = v; openStart(); };
  APP.DD.sfEmp = function (v) { S.f.sfEmp = v; };
  APP.DD.sfLoc = function (v) { S.f.sfLoc = v; };
  A['sf-go'] = function () {
    var fam = S.f.sfLevel || 'staff';
    S.runner = newRunner({ ft: S.f.sfType, emp: fam === 'ops' ? null : S.f.sfEmp, review: fam === 'ops' ? 'new' : null });
    APP.closeAll(); APP.go(BASE() + '/run');
  };
  A['run-form'] = function (el) {
    var taskId = el.getAttribute('data-task');
    var t = taskId ? D.TASKS.filter(function (x) { return x.id === taskId; })[0] : null;
    var ft = t ? t.ft : el.getAttribute('data-ft');
    var emp = t ? t.emp : el.getAttribute('data-emp');
    APP.closeAll();
    if (!ft) { A['start-form'](el); return; }
    if (!emp && !isReview(ft) && D.formType(ft).fam !== 'ops') { S.f.sfLevel = D.formType(ft).fam; S.f.sfType = ft; openStart(); return; }
    S.runner = newRunner({ task: taskId, ft: ft, emp: emp || null, review: el.getAttribute('data-review') });
    APP.go(BASE() + '/run');
  };
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
    var e = subject(S.runner) || APP.me();
    APP.dialog({
      title: 'Add an action item', sub: 'Owner and date are required. That is what makes it followable.',
      body: APP.field('What needs to happen', '<textarea class="textarea" data-input="ai-t" placeholder="Check the procedure version at the start of every shift, observed twice by the manager."></textarea>', null, true) +
        '<div class="form-grid">' +
        APP.field('Owner', APP.dd('ai-owner', [[e.id, e.name + (e.id === APP.me().id ? ' (you)' : ' (the employee)')], [APP.me().id, APP.me().name + ' (you)']], e.id, 'dd-block'), null, true) +
        APP.field('Due', APP.dd('ai-due', [['Fri 19 Sep 2026', 'Fri 19 Sep 2026, in 3 days'], ['Fri 26 Sep 2026', 'Fri 26 Sep 2026, in 10 days'], ['Fri 16 Oct 2026', 'Fri 16 Oct 2026, in 30 days']], 'Fri 19 Sep 2026', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Follow up note', '<textarea class="textarea" data-input="ai-n" placeholder="Optional. What you will look for when you check."></textarea>'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add item', 'btn-solid', 'plus', 'data-act="save-action"')
    });
  };
  APP.INPUT['ai-t'] = function (el) { S.f.aiT = el.value; };
  APP.INPUT['ai-n'] = function (el) { S.f.aiN = el.value; };
  A['save-action'] = function () {
    var e = subject(S.runner) || APP.me();
    S.runner.adds.push({ t: S.f.aiT || 'Check the procedure version at the start of every shift, observed twice by the manager',
      owner: S.f['ai-owner'] || e.id, due: S.f['ai-due'] || 'Fri 19 Sep 2026', note: S.f.aiN || '' });
    S.f.aiT = ''; S.f.aiN = '';
    APP.closeOverlay(); APP.rerender(); APP.toast('Action item added', 'It appears on the owner to-do list as soon as the form is submitted.');
  };
  A['rm-action'] = function (el) { S.runner.adds.splice(+el.getAttribute('data-i'), 1); APP.rerender(); };
  A['close-action'] = function (el) {
    var a = D.action(el.getAttribute('data-id'));
    a.status = 'Closed'; a.closedOn = D.TODAY;
    APP.rerender(); APP.toast('Action item closed', a.id + ' will stop appearing on forms for ' + P(a.owner).name.split(' ')[0] + '.');
  };
  A['save-draft'] = function () {
    S.runner.saved = true;
    var t = S.runner.task ? D.TASKS.filter(function (x) { return x.id === S.runner.task; })[0] : null;
    if (t && t.status !== 'Completed') t.status = 'Draft';
    S.runner = null; APP.go(BASE());
    APP.toast('Saved and closed', 'Drafts survive a closed tablet, a dropped session and a shift change. Resume it from the to-do list.', 'info');
  };
  A['discard-form'] = function () {
    APP.dialog({
      title: 'Cancel and close', sub: 'Nothing is kept.',
      body: APP.callout('Cancelling loses what you have entered. The touch point stays on the to-do list and stays due.', 'is-danger', 'triangle-alert'),
      footer: APP.btn('Keep working', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Cancel the form', 'btn-solid is-danger', 'trash-2', 'data-act="discard-confirm"')
    });
  };
  A['discard-confirm'] = function () { S.runner = null; APP.closeAll(); APP.go(BASE()); APP.toast('Cancelled', 'The touch point is still on your list.', 'info'); };
  A['submit-form'] = function () {
    var r = S.runner, ft = D.formType(r.ft), e = subject(r);
    var blocked = (ft.scored && (answered(r) < flatQs(r.ft).length || !r.notes.sum)) || !r.attested || (ft.scored && noCount(r) >= 2 && !r.adds.length);
    if (blocked) { APP.toast('Not ready', 'Fix what the panel lists before submitting.', 'warning'); return; }
    if (!e) {
      S.runner = null; APP.go('#/records/reviews');
      APP.toast('Review submitted', 'Immutable. Any action items raised are now on their owners to-do lists.');
      return;
    }
    var id = 'FM-' + (20940 + Math.floor(Math.random() * 40));
    D.FORMS.unshift({ id: id, ft: r.ft, emp: r.emp, by: APP.me().id, date: D.TODAY, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      mins: Math.max(1, Math.round((Date.now() - r.started) / 60000)), loc: e.loc, dept: e.dept, outcome: outcome(r), noCount: noCount(r),
      geo: r.geo ? 'Matched, 18 m from the registered address' : 'Not matched, 2.4 km from the registered address', geoFlag: !r.geo,
      summary: r.notes.sum || 'Documented conversation.', attested: true, ack: null, task: r.task });
    r.adds.forEach(function (a, i) {
      D.ACTIONS.unshift({ id: 'AI-' + (8900 + Math.floor(Math.random() * 90) + i), t: a.t, owner: a.owner, by: APP.me().id, from: id,
        due: a.due, status: 'Open', loc: e.loc, notes: a.note ? [{ on: D.TODAY, by: APP.me().id, t: a.note }] : [] });
    });
    if (r.task) { var t = D.TASKS.filter(function (x) { return x.id === r.task; })[0]; if (t) { t.status = 'Completed'; t.done = D.TODAY; t.formId = id; } }
    S.runner = null; APP.go(BASE());
    APP.toast('Form submitted', id + ' is now immutable. ' + e.name.split(' ')[0] + ' has been asked to acknowledge it.');
    setTimeout(function () { APP.ACT['open-form']({ getAttribute: function () { return id; } }); }, 400);
  };
})();
