/* skyPerformance: the site visit report. The client form: 17 sections, 172
   items, scored 2 / 1 / 0, with photos. Anything scored 0, flagged, or
   photographed drops into the action plan, and the action plan lands on the
   Executive Director's to-do list. Regional and up. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function state(vid) {
    S.f.visit = S.f.visit || {};
    S.f.visit[vid] = S.f.visit[vid] || { scores: {}, flags: {}, photos: {}, extra: [] };
    return S.f.visit[vid];
  }
  function seeded(v) {
    /* a completed or in-progress visit shows answers without needing clicks */
    var st = state(v.id);
    if (st.seeded) return st;
    st.seeded = true;
    var i = 0, target = v.status === 'Complete' ? 172 : v.answered;
    D.VISIT_SECTIONS.forEach(function (sec) {
      sec.items.forEach(function (item, ii) {
        var key = sec.key + ':' + ii;
        if (i < target && st.scores[key] == null) {
          var mod = (i * 7 + sec.key.length) % 11;
          st.scores[key] = mod === 0 ? 0 : mod < 3 ? 1 : 2;
          if (mod === 0) st.flags[key] = true;
        }
        i++;
      });
    });
    return st;
  }
  function counts(v) {
    var st = seeded(v), n = 0, pts = 0, zero = 0, flagged = 0;
    for (var k in st.scores) { if (st.scores[k] == null) continue; n++; pts += st.scores[k]; if (st.scores[k] === 0) zero++; }
    for (var f in st.flags) if (st.flags[f]) flagged++;
    return { answered: n, points: pts, max: n * 2, zero: zero, flagged: flagged, pct: n ? Math.round(pts / (n * 2) * 100) : 0 };
  }
  function findings(v) {
    var st = seeded(v), out = [];
    D.VISIT_SECTIONS.forEach(function (sec) {
      sec.items.forEach(function (item, ii) {
        var key = sec.key + ':' + ii;
        if (st.scores[key] === 0 || st.flags[key] || st.photos[key]) out.push({ key: key, section: sec.title, text: item, score: st.scores[key], flagged: !!st.flags[key] });
      });
    });
    return out;
  }
  function actionText(f) {
    var t = String(f.text).replace(/\s*\?+\s*$/, '').trim().replace(/^100% /, 'All ');
    return (f.score === 0 ? 'Put right: ' : f.flagged ? 'Follow up: ' : 'Check against the photo: ') + t;
  }
  function groups() {
    var g = {};
    D.VISIT_SECTIONS.forEach(function (s) { (g[s.group] = g[s.group] || []).push(s); });
    return g;
  }

  function tabsFor(v, active) {
    var f = findings(v).length + state(v.id).extra.length;
    return APP.tabs([
      ['visit', 'Site visit', '#/visits/' + v.id, 172],
      ['financial', 'Financial', '#/visits/' + v.id + '/financial', D.VISIT_FINANCIAL.length],
      ['plan', 'Action plan', '#/visits/' + v.id + '/plan', f],
      ['signoff', 'Sign-off', '#/visits/' + v.id + '/signoff']
    ], active);
  }

  /* ---------------- list ---------------- */
  function list() {
    var all = APP.visits();
    return APP.hint('The full community walk-through: 172 items across 17 sections, scored 2, 1 or 0, with photos taken as you walk.', 'building-2') +
      APP.glance([
        [all.filter(function (v) { return v.status === 'Complete'; }).length, 'Complete', 'is-good'],
        [all.filter(function (v) { return v.status === 'In progress'; }).length, 'In progress'],
        [all.filter(function (v) { return v.status === 'Scheduled'; }).length, 'Scheduled'],
        [all.reduce(function (n, v) { return n + (v.findings || 0); }, 0), 'Findings', 'is-warn']
      ]) +
      (APP.canVisit() ? '<div class="filter-bar"><span class="fb-spacer"></span>' +
        APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The visit log"', 'is-sm') +
        APP.btn('Start a ' + APP.term('visit').toLowerCase(), 'btn-solid', 'circle-play', 'data-act="new-visit"', 'is-sm') + '</div>'
        : APP.hint('You can read visits for your ' + APP.term('site').toLowerCase() + '. Running one is for ' + esc(D.CONFIG.levels.regional.toLowerCase()) + ' and above.', 'lock')) +
      '<section class="card flush-card">' +
      APP.table([{ t: APP.term('site') }, { t: 'Visit' }, { t: 'Conducted by' }, { t: 'Executive Director' }, { t: 'Date' }, { t: 'Progress', w: '15%' }, { t: 'Score', num: true }, { t: '' }],
        all.map(function (v) {
          return { cells: [
            '<span class="cell-strong">' + esc(D.siteName(v.site)) + '</span><span class="cell-sub">' + esc(D.site(v.site).city) + '</span>',
            esc(v.id) + '<span class="cell-sub">' + esc(v.reviewMonth) + '</span>',
            APP.personLine(v.by, false, 26), APP.personLine(v.ed, false, 26),
            esc(v.date.replace(/^\w+ /, '')),
            '<div style="min-width:100px">' + APP.progress(Math.round(v.answered / v.total * 100)) + '<span class="cell-sub">' + v.answered + ' of ' + v.total + '</span></div>',
            v.score != null ? v.score + '%' : '—',
            APP.btn(v.status === 'Complete' ? 'Open' : v.status === 'Scheduled' ? 'Start' : 'Resume', v.status === 'Complete' ? 'btn-surface' : 'btn-solid', null, 'data-act="goto" data-href="#/visits/' + v.id + '"', 'is-sm')
          ] };
        }), { empty: 'No visits in your scope.' }) + '</section>';
  }

  /* ---------------- the form ---------------- */
  function visitTab(v) {
    var st = seeded(v), c = counts(v), g = groups(), editable = APP.canVisit() && v.status !== 'Complete';
    return APP.glance([
      [c.answered + ' of 172', 'Answered'],
      [c.pct + '%', 'Score', c.pct >= 90 ? 'is-good' : c.pct >= 80 ? '' : 'is-warn'],
      [c.zero, 'Scored zero', c.zero ? 'is-bad' : 'is-good'],
      [findings(v).length, 'In the action plan', 'is-warn']
    ]) +
      APP.hint('Anything scored <b>0</b>, flagged, or photographed moves into the action plan automatically.', 'triangle-alert') +
      Object.keys(g).map(function (gname) {
        return APP.sectionLabel(gname, g[gname].length + ' sections') +
          g[gname].map(function (sec) {
            var done = sec.items.filter(function (_, ii) { return st.scores[sec.key + ':' + ii] != null; }).length;
            return '<details class="collapse q-collapse"><summary>' + ic('clipboard-list', 16) +
              '<span>' + esc(sec.title) + '</span>' +
              '<span class="count-pill" style="margin-left:auto">' + done + ' / ' + sec.items.length + '</span></summary>' +
              sec.items.map(function (item, ii) {
                var key = sec.key + ':' + ii, sc = st.scores[key];
                return '<div class="q-row"><span class="q-text">' + esc(item) +
                  (st.flags[key] ? ' ' + APP.badge('Flagged', 'is-warning', 'flag') : '') +
                  (st.photos[key] ? ' ' + APP.badge('Photo', 'is-info', 'camera') : '') + '</span>' +
                  '<span class="q-score">' +
                  D.VISIT_SCALE.map(function (s) {
                    return '<button class="q-btn vs-btn' + (sc === s.n ? ' is-on v' + s.n : '') + '"' +
                      (editable ? ' data-act="v-score" data-v="' + v.id + '" data-k="' + key + '" data-n="' + s.n + '"' : ' disabled') +
                      ' title="' + esc(s.label) + '">' + s.n + '</button>';
                  }).join('') +
                  (editable ? '<button class="q-icon" data-act="v-flag" data-v="' + v.id + '" data-k="' + key + '" title="Flag as a concern">' + ic('flag', 14) + '</button>' +
                    '<button class="q-icon" data-act="v-photo" data-v="' + v.id + '" data-k="' + key + '" title="Add a photo">' + ic('camera', 14) + '</button>' : '') +
                  '</span></div>';
              }).join('') +
              APP.field('Section notes', '<textarea class="textarea" placeholder="Anything worth writing down for this section."></textarea>') +
              '</details>';
          }).join('');
      }).join('');
  }

  function financialTab(v) {
    return APP.hint('Pre-visit and pre-call preparation. Anything below target or at risk flows into the action plan.', 'chart-column') +
      D.VISIT_FINANCIAL.map(function (b) {
        var body = '';
        if (b.type === 'scan') {
          body = (b.items || []).map(function (x) {
            return '<label class="checkbox"><input type="checkbox"><span>' + esc(x) + '</span></label>'; }).join('');
        } else if (b.type === 'metrics' || b.type === 'table') {
          body = '<div class="table-wrap"><table class="table"><thead><tr><th>' + (b.type === 'metrics' ? 'Metric' : 'Line') + '</th><th style="width:130px">Status</th><th>Notes</th></tr></thead><tbody>' +
            (b.rows || []).map(function (rw) {
              return '<tr><td data-label="Line"><span class="cell-strong">' + esc(rw) + '</span></td>' +
                '<td data-label="Status">' + APP.dd('fin-' + b.key + '-' + rw.replace(/\W/g, ''), [['', 'Not set'], ['good', 'On track'], ['watch', 'Watch'], ['below', 'Below target'], ['risk', 'At risk']], '') + '</td>' +
                '<td data-label="Notes"><input class="input" placeholder="What is happening"></td></tr>';
            }).join('') + '</tbody></table></div>';
        } else if (b.type === 'entry') {
          body = '<div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th style="width:22%">Owner</th><th style="width:18%">Due</th></tr></thead><tbody>' +
            [1, 2, 3].map(function () { return '<tr><td><input class="input" placeholder="Open item"></td><td><input class="input" placeholder="Owner"></td><td><input class="input" placeholder="Date"></td></tr>'; }).join('') +
            '</tbody></table></div>';
        } else {
          body = '<textarea class="textarea" placeholder="' + esc(b.hint || 'Notes') + '"></textarea>';
        }
        return '<section class="card">' + APP.panelHead(esc(b.title), b.hint ? esc(b.hint) : null) + body + '</section>';
      }).join('');
  }

  function planTab(v) {
    var st = state(v.id), auto = findings(v), manual = st.extra;
    var existing = D.ACTIONS.filter(function (a) { return a.from === v.id; });
    var ed = P(v.ed);
    return APP.hint('Every item here becomes a to-do on <b>' + esc(ed.name) + '</b>’s page, with an owner and a due date.', 'list-checks') +
      APP.glance([
        [auto.length, 'From the walk-through', auto.length ? 'is-warn' : 'is-good'],
        [manual.length, 'Added by hand'],
        [existing.length, 'Already sent'],
        [existing.filter(function (a) { return a.status === 'Closed'; }).length, 'Closed by the ED', 'is-good']
      ]) +
      '<section class="card">' + APP.panelHead('Action plan for next month', 'Pulled in automatically, grouped by section.',
        APP.canVisit() ? APP.btn('Add another action item', 'btn-surface', 'plus', 'data-act="v-add-action" data-v="' + v.id + '"', 'is-sm') : '') +
      (auto.length || manual.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th style="width:26%">Where it came from</th><th>Action to take</th><th style="width:16%">Owner</th><th style="width:15%">Due</th></tr></thead><tbody>' +
          auto.map(function (f) {
            return '<tr><td data-label="Where"><span class="cell-strong">' + esc(f.section) + '</span><span class="cell-sub">' +
              (f.score === 0 ? 'Scored 0' : 'Flagged') + '</span></td>' +
              '<td data-label="Action"><span class="cell-strong">' + esc(actionText(f)) + '</span><span class="cell-sub">' + esc(f.text) + '</span></td>' +
              '<td data-label="Owner">' + APP.personLine(v.ed, false, 24) + '</td>' +
              '<td data-label="Due">Fri 2 Oct 2026</td></tr>';
          }).join('') +
          manual.map(function (m) {
            return '<tr><td data-label="Where"><span class="mini-note">Added by hand</span></td><td data-label="Action">' + esc(m.t) + '</td>' +
              '<td data-label="Owner">' + APP.personLine(m.owner, false, 24) + '</td><td data-label="Due">' + esc(m.due) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
        : APP.emptyState('circle-check', 'Nothing in the plan yet', 'Score an item 0, flag it, or photograph it and it appears here.', '')) +
      (APP.canVisit() && (auto.length || manual.length) ? '<div class="row-gap" style="margin-top:var(--space-4)">' +
        APP.btn('Send ' + (auto.length + manual.length) + ' to ' + esc(ed.name.split(' ')[0]) + '’s to-do list', 'btn-solid', 'send', 'data-act="v-send-plan" data-v="' + v.id + '"') +
        '</div>' : '') +
      '</section>' +
      (existing.length ? '<section class="card">' + APP.panelHead('Already on the Executive Director’s list', existing.length + ' sent from this visit') +
        '<div class="wq">' + existing.map(APP.actionRow).join('') + '</div></section>' : '');
  }

  function signoffTab(v) {
    var c = counts(v);
    return '<div class="split-2">' +
      '<section class="card">' + APP.panelHead('Sign-off', 'Both signatures sit with the visit in the Executive Director’s file.') +
      '<div class="sign-list">' +
      '<div class="sign-row"><span class="sign-role">' + esc(P(v.by).name) + ', ' + esc(APP.levelLabel(P(v.by).level)) + '</span>' +
      '<span class="sign-mark">' + (v.status === 'Complete' ? ic('signature', 16) + ' <span class="mini-note">signed ' + esc(v.date) + '</span>' : '<span class="mini-note">on submission</span>') + '</span></div>' +
      '<div class="sign-row"><span class="sign-role">' + esc(P(v.ed).name) + ', Executive Director acknowledgement</span>' +
      '<span class="sign-mark">' + (v.status === 'Complete' ? ic('signature', 16) + ' <span class="mini-note">acknowledged</span>' : '<span class="mini-note">after the debrief</span>') + '</span></div>' +
      '</div>' +
      (APP.canVisit() && v.status !== 'Complete' ? '<div style="margin-top:var(--space-4)">' +
        APP.btn('Finish and debrief', 'btn-solid', 'check', 'data-act="v-finish" data-v="' + v.id + '"', 'is-sm') + '</div>' : '') +
      '</section>' +
      '<section class="card">' + APP.panelHead('Visit summary') +
      APP.dataList([
        [APP.term('site'), esc(D.siteName(v.site))],
        ['Visit date', esc(v.date)],
        ['Review month', esc(v.reviewMonth)],
        ['Prior visit', esc(v.priorDate)],
        ['Conducted by', APP.personLine(v.by, false, 26, false)],
        ['Executive Director', APP.personLine(v.ed, false, 26, false)],
        ['Answered', c.answered + ' of 172'],
        ['Overall score', c.pct + '%'],
        ['Photos', String(v.photos)]
      ]) +
      APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="All 172 questions render with their answers and the photos attached." data-k="info"', 'is-sm') +
      '</section></div>';
  }

  function detail(v, tab) {
    var c = counts(v);
    return APP.page({
      crumbs: [['Home', '#/home'], [APP.terms('visit'), '#/visits'], [D.siteName(v.site), '#']],
      title: D.siteName(v.site) + ' · ' + v.reviewMonth,
      desc: v.id + ' · ' + v.date + ' · ' + P(v.by).name + ' · Executive Director ' + P(v.ed).name,
      action: v.status === 'Complete' ? APP.badge('Complete', 'is-success') : APP.badge(c.answered + ' of 172 answered', 'is-info'),
      tabs: tabsFor(v, tab),
      body: tab === 'financial' ? financialTab(v) : tab === 'plan' ? planTab(v) : tab === 'signoff' ? signoffTab(v) : visitTab(v)
    });
  }

  APP.VIEWS.visits = function (r) {
    if (r[1] && r[1].indexOf('SV-') === 0) {
      var v = D.visit(r[1]);
      if (!v) return APP.page({ crumbs: [['Home', '#/home'], [APP.terms('visit'), '#/visits']], title: 'Not found', desc: '',
        body: APP.emptyState('building-2', 'Not in your scope', '', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/visits"')) });
      return detail(v, r[2] || 'visit');
    }
    return APP.page({
      crumbs: [['Home', '#/home'], [APP.terms('visit'), '#/visits']],
      title: APP.terms('visit'), desc: 'The community walk-through, and the action plan it produces.',
      body: list()
    });
  };

  var A = APP.ACT;
  A['v-score'] = function (el) {
    var st = state(el.getAttribute('data-v')), k = el.getAttribute('data-k'), n = +el.getAttribute('data-n');
    st.scores[k] = st.scores[k] === n ? null : n;
    if (n === 0) st.flags[k] = true;
    APP.rerender();
  };
  A['v-flag'] = function (el) {
    var st = state(el.getAttribute('data-v')), k = el.getAttribute('data-k');
    st.flags[k] = !st.flags[k]; APP.rerender();
    APP.toast(st.flags[k] ? 'Flagged' : 'Flag removed', st.flags[k] ? 'It is now in the action plan.' : 'Removed from the action plan.', 'info');
  };
  A['v-photo'] = function (el) {
    var st = state(el.getAttribute('data-v')), k = el.getAttribute('data-k');
    st.photos[k] = !st.photos[k]; APP.rerender();
    APP.toast('Photo attached', 'On a phone this opens the camera. A photographed item goes into the action plan.', 'info');
  };
  A['v-add-action'] = function (el) {
    var vid = el.getAttribute('data-v'), v = D.visit(vid);
    APP.dialog({
      title: 'Add an action item', sub: 'It lands on the owner’s to-do list when you send the plan.',
      body: APP.field('Action to take', '<textarea class="textarea" data-input="va-t" placeholder="Restock the creativity boxes and log them."></textarea>', null, true) +
        '<div class="form-grid">' +
        APP.field('Owner', APP.dd('va-owner', D.PEOPLE.filter(function (p) { return p.site === v.site && p.level !== 'staff'; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), v.ed, 'dd-block'), 'Defaults to the Executive Director.', true) +
        APP.field('Due', APP.dd('va-due', [['Fri 25 Sep 2026', 'Fri 25 Sep 2026'], ['Fri 2 Oct 2026', 'Fri 2 Oct 2026'], ['Fri 16 Oct 2026', 'Fri 16 Oct 2026']], 'Fri 2 Oct 2026', 'dd-block'), null, true) +
        '</div>',
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add', 'btn-solid', 'plus', 'data-act="va-save" data-v="' + vid + '"')
    });
  };
  APP.INPUT['va-t'] = function (el) { S.f.vaT = el.value; };
  A['va-save'] = function (el) {
    var vid = el.getAttribute('data-v'), st = state(vid), v = D.visit(vid);
    st.extra.push({ t: S.f.vaT || 'Action from the visit', owner: S.f['va-owner'] || v.ed, due: S.f['va-due'] || 'Fri 2 Oct 2026' });
    S.f.vaT = '';
    APP.closeAll(); APP.rerender(); APP.toast('Added to the plan', 'Send the plan to put it on their to-do list.');
  };
  A['v-send-plan'] = function (el) {
    var vid = el.getAttribute('data-v'), v = D.visit(vid), st = state(vid);
    var auto = findings(v), me = APP.me(), n = 0;
    auto.forEach(function (f) {
      D.ACTIONS.unshift({ id: 'AI-' + (8900 + Math.floor(Math.random() * 90) + n), t: actionText(f), owner: v.ed, by: me.id,
        from: v.id, fromKind: 'visit', due: 'Fri 2 Oct 2026', status: 'Open', site: v.site, notes: [] });
      n++;
    });
    st.extra.forEach(function (m) {
      D.ACTIONS.unshift({ id: 'AI-' + (8900 + Math.floor(Math.random() * 90) + n), t: m.t, owner: m.owner, by: me.id,
        from: v.id, fromKind: 'visit', due: m.due, status: 'Open', site: v.site, notes: [] });
      n++;
    });
    st.extra = [];
    APP.rerender();
    APP.toast(n + ' sent', 'They are on ' + P(v.ed).name.split(' ')[0] + '’s to-do list now. Switch to the Executive Director to see them.');
  };
  A['v-finish'] = function (el) {
    var v = D.visit(el.getAttribute('data-v')), c = counts(v);
    APP.dialog({
      title: 'Finish and debrief', sub: v.id + ' · ' + D.siteName(v.site),
      body: APP.callout('A visit is not finished when the questions are answered. It is finished when the Executive Director has heard it.', 'is-info', 'handshake') +
        APP.dataList([['Answered', c.answered + ' of 172'], ['Score', c.pct + '%'], ['Findings', String(findings(v).length)],
          ['Action items to send', String(findings(v).length + state(v.id).extra.length)]]) +
        APP.field('Biggest risk found', '<textarea class="textarea" placeholder="The one thing that needs attention before next month."></textarea>', null, true) +
        '<label class="checkbox"><input type="checkbox"><span>I debriefed the Executive Director before leaving</span></label>',
      footer: APP.btn('Keep working', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Submit the visit', 'btn-solid', 'send', 'data-act="v-submit" data-v="' + v.id + '"')
    });
  };
  A['v-submit'] = function (el) {
    var v = D.visit(el.getAttribute('data-v')), c = counts(v);
    v.status = 'Complete'; v.answered = 172; v.score = c.pct; v.findings = findings(v).length;
    D.RECORDS.unshift({ id: 'CR-' + (20950 + Math.floor(Math.random() * 40)), type: 'CT-VISIT', emp: v.ed, by: v.by,
      on: D.TODAY, at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      site: v.site, dept: 'Operations', topic: D.siteName(v.site) + ' site visit, ' + v.reviewMonth,
      text: 'Full walk-through completed. Score ' + c.pct + '%. ' + v.findings + ' findings.', visitId: v.id, ack: null, attachments: [] });
    APP.closeAll(); APP.rerender();
    APP.toast('Visit submitted', 'Filed on ' + P(v.ed).name.split(' ')[0] + '’s record. Send the action plan to put the findings on their to-do list.');
  };
  A['new-visit'] = function () {
    var sites = APP.scopeSites();
    APP.dialog({
      title: 'Start a ' + APP.term('visit').toLowerCase(), sub: 'The same form everywhere. Only the community changes.',
      body: APP.field(APP.term('site'), APP.dd('nv-site', sites.map(function (s) { return [s, D.siteName(s) + ', ' + D.site(s).city]; }), sites[0], 'dd-block'), null, true) +
        APP.field('Form', APP.dd('nv-form', [['rdo', 'Regional Director visit, 172 items'], ['clinical', 'Clinical visit, to be configured']], 'rdo', 'dd-block'), 'More variants are configured in Settings.', true) +
        APP.field('Review month', APP.dd('nv-month', [['September', 'September'], ['October', 'October']], 'September', 'dd-block'), null, true) +
        APP.callout('Built for a phone. Score as you walk, photograph what needs fixing, and the action plan writes itself.', 'is-info', 'camera'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Start', 'btn-solid', 'circle-play', 'data-act="goto" data-href="#/visits/SV-1190"')
    });
  };
})();
