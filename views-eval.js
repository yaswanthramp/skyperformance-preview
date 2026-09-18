/* skyPerformance: the annual evaluation, following the client exempt form.
   Scored 1 to 4, KPIs scored separately, at least three developmental
   opportunities, a total and a percentage. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function kpiCount(ev) { return ev.years >= 2 ? D.EVAL_KPI_COUNT.year2 : D.EVAL_KPI_COUNT.year1; }
  function maxScore(ev) { return ev.years >= 2 ? D.EVAL_MAX.year2 : D.EVAL_MAX.year1; }
  function total(ev) {
    var t = 0;
    D.EVAL_SECTIONS.forEach(function (sec) {
      if (sec.kpi || sec.dev) return;
      (ev.scores[sec.key] || []).forEach(function (v) { if (v) t += v; });
    });
    (ev.kpis || []).forEach(function (k) { if (k.v) t += k.v; });
    return t;
  }
  function answered(ev) {
    var n = 0, total_ = 0;
    D.EVAL_SECTIONS.forEach(function (sec) {
      if (sec.kpi || sec.dev) return;
      sec.qs.forEach(function (q, i) { total_++; if ((ev.scores[sec.key] || [])[i]) n++; });
    });
    (ev.kpis || []).forEach(function (k) { total_++; if (k.v) n++; });
    return { n: n, of: total_ };
  }
  function pct(ev) { return Math.round(total(ev) / maxScore(ev) * 100); }

  function tabsFor(active) {
    var all = APP.evaluations();
    return APP.tabs([
      ['open', 'In progress', '#/evaluations', all.filter(function (e) { return e.status === 'In progress'; }).length],
      ['done', 'Complete', '#/evaluations/done', all.filter(function (e) { return e.status === 'Complete'; }).length],
      ['all', 'All', '#/evaluations/all', all.length]
    ], active);
  }

  function list(tab) {
    var all = APP.evaluations();
    var rows = all.filter(function (e) { return tab === 'all' ? true : tab === 'done' ? e.status === 'Complete' : e.status === 'In progress'; });
    return APP.hint('One evaluation per person per year, scored 1 to 4. A total below 50% puts the employee on a Final Warning and the position is posted.', 'clipboard-list') +
      APP.glance([
        [all.length, 'Evaluations this cycle'],
        [all.filter(function (e) { return e.status === 'In progress'; }).length, 'In progress', all.some(function (e) { return e.status === 'In progress'; }) ? 'is-warn' : ''],
        [all.filter(function (e) { return e.status === 'Complete'; }).length, 'Complete', 'is-good'],
        [all.filter(function (e) { return e.total && Math.round(e.total / maxScore(e) * 100) < 50; }).length, 'Below 50%', 'is-bad']
      ]) +
      (APP.canCoach() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Evaluation scores as CSV"', 'is-sm') +
        APP.btn('Start an evaluation', 'btn-solid', 'plus', 'data-act="new-eval"', 'is-sm') + '</div>' : '') +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Employee' }, { t: 'Cycle' }, { t: 'Review date' }, { t: 'Progress', w: '18%' }, { t: 'Score', num: true }, { t: 'Status' }, { t: '' }],
        rows.map(function (e) {
          var a = answered(e), p = e.total ? Math.round(e.total / maxScore(e) * 100) : pct(e);
          return { cells: [
            APP.personLine(e.emp, esc(P(e.emp).title), 28), esc(e.cycle), esc(e.reviewDate.replace(/^\w+ /, '')),
            '<div style="min-width:110px">' + APP.progress(Math.round(a.n / a.of * 100)) + '<span class="cell-sub">' + a.n + ' of ' + a.of + ' scored</span></div>',
            (e.total ? e.total + ' / ' + maxScore(e) + '<span class="cell-sub">' + p + '%</span>' : '<span class="mini-note">—</span>'),
            e.status === 'Complete' ? APP.badge('Complete', 'is-success') : APP.badge('In progress', 'is-info'),
            APP.btn(e.status === 'Complete' ? 'Open' : 'Continue', e.status === 'Complete' ? 'btn-surface' : 'btn-solid', null, 'data-act="goto" data-href="#/evaluations/' + e.id + '"', 'is-sm')
          ] };
        }), { empty: 'No evaluations yet.' }) + '</section>' +
      APP.why('Why it is here and not on paper', '<p>The client asked for this to be a digital process with a saved copy. Scores total themselves, the developmental opportunities become to-do items, and the signed copy sits in the employee file rather than in somebody’s email.</p>');
  }

  /* ---------------- the form ---------------- */
  function scoreRow(ev, secKey, i, text, editable) {
    var v = (ev.scores[secKey] || [])[i];
    return '<div class="q-row"><span class="q-text">' + esc(text) + '</span><span class="q-score">' +
      D.EVAL_SCALE.map(function (s) {
        return '<button class="q-btn ev-btn' + (v === s.n ? ' is-on lvl' + s.n : '') + '"' +
          (editable ? ' data-act="ev-score" data-id="' + ev.id + '" data-s="' + secKey + '" data-i="' + i + '" data-v="' + s.n + '"' : ' disabled') +
          ' title="' + esc(s.name) + '">' + s.n + '</button>';
      }).join('') + '</span></div>';
  }

  function detail(id) {
    var ev = D.evaluation(id);
    if (!ev || !(APP.isHR() || APP.inScope(ev.emp) || ev.emp === APP.me().id)) {
      return APP.page({ crumbs: [['Home', '#/home'], ['Evaluations', '#/evaluations']], title: 'Not found', desc: '',
        body: APP.emptyState('clipboard-list', 'Not in your scope', 'Evaluations follow the reporting line.', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/evaluations"')) });
    }
    var e = P(ev.emp), editable = ev.status !== 'Complete' && ev.by === APP.me().id;
    var a = answered(ev), t = total(ev), p = pct(ev), max = maxScore(ev);
    var low = p < 50 && a.n === a.of;

    var sections = D.EVAL_SECTIONS.map(function (sec, si) {
      if (sec.kpi) {
        return '<section class="card">' + APP.panelHead('Section ' + (si + 1) + '. ' + sec.name,
          kpiCount(ev) + ' KPIs for year ' + (ev.years >= 2 ? '2 and beyond' : '1') + ', each scored separately',
          APP.badge('Total ' + (ev.kpis || []).reduce(function (n, k) { return n + (k.v || 0); }, 0), 'is-info')) +
          (ev.kpis || []).map(function (k, i) {
            return '<div class="q-row"><span class="q-text">' + esc(k.t) + '</span><span class="q-score">' +
              D.EVAL_SCALE.map(function (s) {
                return '<button class="q-btn ev-btn' + (k.v === s.n ? ' is-on lvl' + s.n : '') + '"' +
                  (editable ? ' data-act="ev-kpi" data-id="' + ev.id + '" data-i="' + i + '" data-v="' + s.n + '"' : ' disabled') + '>' + s.n + '</button>';
              }).join('') + '</span></div>';
          }).join('') +
          (editable ? '<div class="row-gap" style="margin-top:var(--space-3)">' + APP.btn('Add a KPI', 'btn-surface', 'plus', 'data-act="ev-add-kpi" data-id="' + ev.id + '"', 'is-sm') + '</div>' : '') +
          '</section>';
      }
      if (sec.dev) {
        return '<section class="card">' + APP.panelHead('Section ' + (si + 1) + '. ' + sec.name,
          'At least three, each with a way to measure progress',
          editable ? APP.btn('Add', 'btn-surface', 'plus', 'data-act="ev-add-dev" data-id="' + ev.id + '"', 'is-sm') : '') +
          (ev.priorDev ? APP.hint('Last year: ' + esc(ev.priorDev), 'history') : '') +
          (ev.dev.length ? ev.dev.map(function (d, i) {
            return '<div class="goal"><span class="goal-ic">' + ic('target', 16) + '</span><div class="goal-main">' +
              '<div class="goal-top"><span class="goal-t">' + esc(d.t) + '</span>' + APP.badge('Opportunity ' + (i + 1), 'is-info') + '</div>' +
              '<div class="goal-how">How progress is measured: ' + esc(d.how) + '</div></div></div>';
          }).join('') : APP.emptyState('target', 'None set yet', 'The form asks for at least three, with how each one is measured.',
            editable ? APP.btn('Add the first', 'btn-solid', 'plus', 'data-act="ev-add-dev" data-id="' + ev.id + '"') : '')) +
          (ev.dev.length && ev.dev.length < 3 ? APP.callout('<b>' + (3 - ev.dev.length) + ' more needed.</b> The form asks for at least three.', 'is-warning', 'triangle-alert') : '') +
          '</section>';
      }
      var scored = (ev.scores[sec.key] || []).filter(function (v) { return v; }).length;
      return '<section class="card">' + APP.panelHead('Section ' + (si + 1) + '. ' + sec.name, null,
        APP.badge(scored + ' of ' + sec.qs.length + ' scored', scored === sec.qs.length ? 'is-success' : 'is-neutral')) +
        sec.qs.map(function (q, i) { return scoreRow(ev, sec.key, i, q, editable); }).join('') + '</section>';
    }).join('');

    var body =
      (low ? APP.callout('<b>Total is ' + p + '%, below 50%.</b> On this form that means a Final Warning and the position being posted. Check the scores before completing.', 'is-danger', 'triangle-alert') : '') +
      (ev.selfEval ? APP.hint('Self-evaluation received. Compare it with your answers before the conversation.', 'user-check')
        : APP.hint('No self-evaluation received yet. The form asks you to review it alongside your answers.', 'triangle-alert')) +
      APP.glance([
        [a.n + ' of ' + a.of, 'Questions scored'],
        [t + ' / ' + max, 'Total score'],
        [p + '%', 'Percentage', p >= 75 ? 'is-good' : p >= 50 ? '' : 'is-bad'],
        [ev.dev.length, 'Development opportunities', ev.dev.length >= 3 ? 'is-good' : 'is-warn']
      ]) +
      '<div class="split-rail"><div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Scoring', 'The same scale on every question.') +
      '<div class="scale-row">' + D.EVAL_SCALE.map(function (s) {
        return '<div class="scale-item"><span class="scale-n lvl' + s.n + '">' + s.n + '</span><span class="scale-t"><b>' + esc(s.name) + '</b>' + (s.sub ? '<span>' + esc(s.sub) + '</span>' : '') + '</span></div>';
      }).join('') + '</div>' +
      APP.hint('Maximum ' + max + ' for year ' + (ev.years >= 2 ? '2 and beyond' : '1') + ', which is ' + kpiCount(ev) + ' KPIs.', 'info') +
      '</section>' + sections +
      '<section class="card">' + APP.panelHead('Employee comments', 'In their words, kept with the evaluation.') +
      (ev.comments ? '<p class="t-2">' + esc(ev.comments) + '</p>' : '<p class="mini-note">Captured at the review meeting.</p>') + '</section>' +
      '</div><div class="stack-4">' +
      '<section class="card">' + APP.panelHead('Evaluation') +
      APP.dataList([
        ['Employee', APP.personLine(e, esc(e.title), 28, false)],
        ['Supervisor', APP.personLine(ev.by, false, 28, false)],
        ['Review date', esc(ev.reviewDate)],
        ['Cycle', esc(ev.cycle)],
        ['Years in role', ev.years >= 2 ? '2 or more' : 'First year'],
        ['Self-evaluation', ev.selfEval ? 'Received' : 'Not received'],
        ['Status', ev.status === 'Complete' ? APP.badge('Complete', 'is-success') : APP.badge('In progress', 'is-info')]
      ]) + '</section>' +
      '<section class="card">' + APP.panelHead('Result') +
      '<div class="ph-stats"><div class="ph-stat"><span class="ph-stat-v">' + t + '</span><span class="ph-stat-l">of ' + max + '</span></div>' +
      '<div class="ph-stat"><span class="ph-stat-v">' + p + '%</span><span class="ph-stat-l">Percentage</span></div></div>' +
      APP.progress(p, p >= 50 ? '' : 'is-warn') +
      '<p class="mini-note" style="margin-top:var(--space-3)">Below 50% means a Final Warning and the position is posted.</p>' +
      (editable ? '<div class="stack-2" style="margin-top:var(--space-4)">' +
        APP.btn('Save and close', 'btn-surface', 'file-down', 'data-act="toast" data-t="Saved" data-b="Come back to it any time before the review date."', 'is-sm') +
        APP.btn('Complete and sign', 'btn-solid', 'signature', 'data-act="ev-complete" data-id="' + ev.id + '"', 'is-sm') + '</div>' : '') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Signatures') +
      '<div class="sign-list">' + [['Employee', ev.ack], ['Supervisor', ev.status === 'Complete' ? ev.reviewDate : null]].map(function (r) {
        return '<div class="sign-row"><span class="sign-role">' + r[0] + '</span><span class="sign-mark">' +
          (r[1] ? ic('signature', 16) + ' <span class="mini-note">' + esc(r[1]) + '</span>' : '<span class="mini-note">pending</span>') + '</span></div>';
      }).join('') + '</div>' +
      (ev.emp === APP.me().id && ev.status === 'Complete' && !ev.ack ?
        APP.btn('Acknowledge', 'btn-solid', 'signature', 'data-act="ev-ack" data-id="' + ev.id + '"', 'is-sm') : '') +
      '</section></div></div>';

    return APP.page({
      crumbs: [['Home', '#/home'], ['Evaluations', '#/evaluations'], [e.name, '#']],
      title: e.name + ' · ' + ev.cycle + ' evaluation',
      desc: e.title + ' · ' + D.siteName(ev.site) + ' · review ' + ev.reviewDate,
      action: ev.status === 'Complete' ? APP.badge('Complete', 'is-success') : APP.badge('In progress', 'is-info'),
      body: body
    });
  }

  APP.VIEWS.evaluations = function (r) {
    if (r[1] && r[1].indexOf('EV-') === 0) return detail(r[1]);
    var tab = r[1] || 'open';
    return APP.page({
      crumbs: [['Home', '#/home'], ['Evaluations', '#/evaluations']],
      title: APP.terms('eval'), desc: 'One per person per year, scored 1 to 4, saved to the file.',
      tabs: tabsFor(tab), body: list(tab)
    });
  };

  var A = APP.ACT;
  A['ev-score'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id')), k = el.getAttribute('data-s'), i = +el.getAttribute('data-i'), v = +el.getAttribute('data-v');
    ev.scores[k] = ev.scores[k] || [];
    ev.scores[k][i] = ev.scores[k][i] === v ? null : v;
    APP.rerender();
  };
  A['ev-kpi'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id')), i = +el.getAttribute('data-i'), v = +el.getAttribute('data-v');
    ev.kpis[i].v = ev.kpis[i].v === v ? null : v;
    APP.rerender();
  };
  A['ev-add-kpi'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({ title: 'Add a KPI', sub: 'Scored separately and added to the total.',
      body: APP.field('KPI', '<input class="input" data-input="ev-kpi-t" placeholder="Call light response within standard">', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add', 'btn-solid', 'plus', 'data-act="ev-kpi-save" data-id="' + id + '"') });
  };
  APP.INPUT['ev-kpi-t'] = function (el) { S.f.evKpi = el.value; };
  A['ev-kpi-save'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id'));
    ev.kpis.push({ t: S.f.evKpi || 'New KPI', v: null }); S.f.evKpi = '';
    APP.closeAll(); APP.rerender(); APP.toast('KPI added', 'It counts toward the maximum score.');
  };
  A['ev-add-dev'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({ title: 'Add a developmental opportunity', sub: 'The form asks for at least three.',
      body: APP.field('Opportunity', '<input class="input" data-input="ev-dev-t" placeholder="Lead the clinical team huddle once a month">', null, true) +
        APP.field('How progress is measured', '<input class="input" data-input="ev-dev-h" placeholder="Observed by the Director of Nursing">', null, true) +
        APP.callout('This also becomes a to-do item on the employee page, so it does not get forgotten between reviews.', 'is-info', 'list-checks'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add', 'btn-solid', 'plus', 'data-act="ev-dev-save" data-id="' + id + '"') });
  };
  APP.INPUT['ev-dev-t'] = function (el) { S.f.evDevT = el.value; };
  APP.INPUT['ev-dev-h'] = function (el) { S.f.evDevH = el.value; };
  A['ev-dev-save'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id'));
    var t = S.f.evDevT || 'Development opportunity';
    ev.dev.push({ t: t, how: S.f.evDevH || 'Reviewed with the supervisor' });
    D.ACTIONS.unshift({ id: 'AI-' + (8900 + Math.floor(Math.random() * 90)), t: t, owner: ev.emp, by: ev.by,
      from: ev.id, fromKind: 'eval', due: 'Reviewed at the next evaluation', status: 'Open', site: ev.site, notes: [] });
    S.f.evDevT = ''; S.f.evDevH = '';
    APP.closeAll(); APP.rerender(); APP.toast('Added', 'It is on the evaluation and on ' + P(ev.emp).name.split(' ')[0] + '’s to-do list.');
  };
  A['ev-complete'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id'));
    var a = answered(ev);
    if (a.n < a.of) { APP.toast('Not finished', (a.of - a.n) + ' questions still need a score.', 'warning'); return; }
    if (ev.dev.length < 3) { APP.toast('Needs three opportunities', 'The form asks for at least three developmental opportunities.', 'warning'); return; }
    ev.status = 'Complete'; ev.total = total(ev);
    APP.rerender();
    APP.toast('Evaluation complete', pct(ev) + '%. ' + P(ev.emp).name.split(' ')[0] + ' has been asked to acknowledge it.' + (pct(ev) < 50 ? ' Below 50%: a Final Warning applies.' : ''));
  };
  A['ev-ack'] = function (el) {
    var ev = D.evaluation(el.getAttribute('data-id'));
    ev.ack = D.TODAY; APP.rerender(); APP.toast('Acknowledged', 'Stored with the evaluation.');
  };
  A['new-eval'] = function (el) {
    var team = APP.people().filter(function (p) { return p.id !== APP.me().id; });
    APP.dialog({
      title: 'Start an evaluation', sub: 'One per person per cycle.',
      body: APP.field('Employee', APP.dd('ev-emp', team.map(function (p) { return [p.id, p.name + ', ' + p.title]; }), (team[0] || {}).id, 'dd-block'), null, true) +
        APP.field('Review date', APP.dd('ev-date', [['Fri 25 Sep 2026', 'Fri 25 Sep 2026'], ['Fri 16 Oct 2026', 'Fri 16 Oct 2026'], ['Fri 20 Nov 2026', 'Fri 20 Nov 2026']], 'Fri 25 Sep 2026', 'dd-block'), null, true) +
        APP.field('Years in role', APP.dd('ev-years', [['1', 'First year, maximum ' + D.EVAL_MAX.year1], ['2', 'Two or more, maximum ' + D.EVAL_MAX.year2]], '2', 'dd-block'), 'Sets how many KPIs are scored.', true) +
        APP.callout('The employee is asked for a self-evaluation first. You review it alongside your answers.', 'is-info', 'user-check'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create', 'btn-solid', 'plus', 'data-act="ev-create"')
    });
  };
  A['ev-create'] = function () {
    var team = APP.people().filter(function (p) { return p.id !== APP.me().id; });
    var emp = S.f['ev-emp'] || team[0].id, e = P(emp);
    var years = +(S.f['ev-years'] || 2);
    var id = 'EV-2026-' + (60 + Math.floor(Math.random() * 39));
    var kpis = []; for (var i = 0; i < (years >= 2 ? D.EVAL_KPI_COUNT.year2 : D.EVAL_KPI_COUNT.year1); i++) kpis.push({ t: 'KPI ' + (i + 1) + ', to be named', v: null });
    D.EVALUATIONS.unshift({ id: id, emp: emp, by: APP.me().id, site: e.site, cycle: D.CYCLE, status: 'In progress',
      reviewDate: S.f['ev-date'] || 'Fri 25 Sep 2026', years: years, scores: {}, kpis: kpis, dev: [], priorDev: '',
      selfEval: false, comments: '', total: null, ack: null });
    APP.closeAll(); APP.go('#/evaluations/' + id);
    APP.toast('Created', 'A self-evaluation request has gone to ' + e.name.split(' ')[0] + '.');
  };
})();
