/* skyPerformance: development plans and the competency framework. The forward
   looking half of the product: goals, levels, check ins. Nothing here feeds the
   discipline ladder, which is deliberate and stated on the screen. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function plans() {
    if (APP.is('employee')) return D.DEV_PLANS.filter(function (p) { return p.emp === APP.me().id; });
    if (APP.isHR()) return D.DEV_PLANS.slice();
    return D.DEV_PLANS.filter(function (p) { return APP.inScope(p.emp) || p.emp === APP.me().id; });
  }
  function tabsFor(active) {
    var ps = plans();
    return APP.tabs([
      ['plans', APP.is('employee') ? 'My plan' : 'Plans', '#/develop', APP.is('employee') ? null : ps.length],
      ['skills', 'Skills and competency', '#/develop/skills'],
      ['framework', 'Framework', '#/develop/framework', D.COMPETENCIES.length]
    ], active);
  }
  function lvl(n) { return D.LEVELS_SKILL[Math.max(0, Math.min(3, n - 1))]; }

  function goalRow(g, editable) {
    var c = D.competency(g.c);
    return '<div class="goal"><span class="goal-ic">' + ic(g.status === 'Met' ? 'circle-check' : 'target', 16) + '</span>' +
      '<div class="goal-main">' +
      '<div class="goal-top"><span class="goal-t">' + esc(g.t) + '</span>' + APP.badge(g.status, g.status === 'Met' ? 'is-success' : 'is-info') + '</div>' +
      '<div class="goal-meta"><span>' + esc(c.name) + '</span><span>' + esc(lvl(g.from).name) + ' to ' + esc(lvl(g.to).name) + '</span><span>Due ' + esc(g.due) + '</span></div>' +
      '<div class="goal-bar">' + APP.progress(g.pct, g.pct >= 70 ? '' : g.pct >= 30 ? '' : 'is-warn') + '<span class="goal-pct">' + g.pct + '%</span></div>' +
      '<div class="goal-how">' + esc(g.how) + '</div>' +
      (editable ? '<div class="row-gap">' + APP.btn('Log progress', 'btn-surface', 'plus', 'data-act="dev-progress" data-g="' + g.id + '"', 'is-sm') +
        APP.btn('Mark met', 'btn-ghost', 'check', 'data-act="toast" data-t="Goal met" data-b="Recorded on the plan and on the competency ladder."', 'is-sm') + '</div>' : '') +
      '</div></div>';
  }

  function planCard(p, full) {
    var e = P(p.emp);
    var avg = p.goals.length ? Math.round(p.goals.reduce(function (n, g) { return n + g.pct; }, 0) / p.goals.length) : 0;
    return '<section class="card">' +
      APP.panelHead((full ? 'Development plan' : esc(e.name)), esc(p.id) + ' · ' + esc(p.cycle) + ' · owner ' + esc(P(p.owner).name) + ' · review ' + esc(p.review),
        APP.statusBadge(p.status) + (full ? '' : APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/develop/' + p.id + '"', 'is-sm'))) +
      (p.goals.length
        ? (full ? '' : '<div class="goal-bar" style="margin-bottom:var(--space-4)">' + APP.progress(avg) + '<span class="goal-pct">' + avg + '%</span></div>') +
          p.goals.map(function (g) { return goalRow(g, full && (p.owner === APP.me().id || p.emp === APP.me().id)); }).join('')
        : APP.emptyState('target', 'No goals yet', 'A plan with no goals is a placeholder. Add the first one.',
            APP.btn('Add a goal', 'btn-solid', 'plus', 'data-act="dev-add-goal" data-id="' + p.id + '"'))) +
      '</section>';
  }

  function listView() {
    var ps = plans(), me = APP.me();
    if (APP.is('employee')) {
      var mine = ps[0];
      if (!mine) return APP.emptyState('target', 'No development plan yet', 'Your manager opens one at the start of each cycle.', '');
      return APP.hint('Your plan is about where you are going, not what went wrong. It never feeds a performance case.', 'trending-up') +
        APP.glance([
          [mine.goals.length, 'Goals'],
          [mine.goals.filter(function (g) { return g.status === 'Met'; }).length, 'Met', mine.goals.some(function (g) { return g.status === 'Met'; }) ? 'is-good' : ''],
          [mine.checkins.length, 'Check ins'],
          [mine.review.replace(/^\w+ /, ''), 'Next review']
        ]) +
        planCard(mine, true) + checkins(mine) + skillCard(me.id);
    }
    var byStatus = { Active: 0, Draft: 0, Complete: 0 };
    ps.forEach(function (p) { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    var behind = ps.filter(function (p) { return p.status === 'Active' && p.goals.some(function (g) { return g.pct < 30; }); }).length;
    return APP.hint('One plan per person per cycle. <b>' + behind + '</b> ' + (behind === 1 ? 'plan has' : 'plans have') + ' a goal under 30% with the review date approaching.', 'target') +
      APP.glance([
        [ps.length, 'Plans in scope'],
        [byStatus.Active || 0, 'Active'],
        [byStatus.Draft || 0, 'Draft, not started', byStatus.Draft ? 'is-warn' : ''],
        [behind, 'Goals behind', behind ? 'is-bad' : 'is-good']
      ]) +
      '<div class="filter-bar"><span class="fb-spacer"></span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="Development plans as CSV"', 'is-sm') +
      APP.btn('New plan', 'btn-solid', 'plus', 'data-act="dev-new"', 'is-sm') + '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Person' }, { t: 'Plan' }, { t: 'Goals', num: true }, { t: 'Progress', w: '20%' }, { t: 'Next review' }, { t: 'Status' }, { t: '' }],
        ps.map(function (p) {
          var avg = p.goals.length ? Math.round(p.goals.reduce(function (n, g) { return n + g.pct; }, 0) / p.goals.length) : 0;
          return { cells: [
            APP.personLine(p.emp, null, 28),
            '<span class="cell-strong">' + esc(p.cycle) + '</span><span class="cell-sub">' + esc(p.id) + '</span>',
            String(p.goals.length),
            p.goals.length ? '<div class="goal-bar">' + APP.progress(avg, avg >= 30 ? '' : 'is-warn') + '<span class="goal-pct">' + avg + '%</span></div>' : '<span class="mini-note">None set</span>',
            esc(p.review), APP.statusBadge(p.status),
            APP.btn('Open', 'btn-surface', null, 'data-act="goto" data-href="#/develop/' + p.id + '"', 'is-sm')
          ] };
        }), { empty: 'No plans in scope.' }) + '</section>' +
      APP.why('How this differs from a PIP', '<p>A development plan is optional, forward looking and owned jointly. A PIP is a fixed length, measured recovery plan opened when a standard is not being met. A goal missed on a development plan never becomes evidence. An objective missed on a PIP does.</p>');
  }

  function checkins(p) {
    return '<section class="card">' + APP.panelHead('Check ins', p.checkins.length + ' recorded',
      p.owner === APP.me().id ? APP.btn('Add check in', 'btn-solid', 'plus', 'data-act="dev-checkin" data-id="' + p.id + '"', 'is-sm') : '') +
      (p.checkins.length ? '<div class="timeline">' + p.checkins.map(function (c, i) {
        return '<div class="tl-row is-done"><span class="tl-dot">' + ic('check', 14) + '</span>' +
          '<div class="tl-body"><div class="tl-top"><span class="tl-when">' + esc(c.on) + '</span><span class="mini-note">' + esc(P(c.by).name) + '</span></div>' +
          '<span class="tl-note">' + esc(c.t) + '</span></div></div>';
      }).join('') + '</div>' : '<p class="mini-note">None yet.</p>') + '</section>';
  }

  function skillCard(empId, compact) {
    var rows = D.SKILLS[empId] || [];
    if (!rows.length) return '';
    var gaps = rows.filter(function (r) { return r[1] < r[2]; }).length;
    return '<section class="card' + (compact ? ' skill-compact' : '') + '">' + APP.panelHead('Competency ladder', gaps ? gaps + ' of ' + rows.length + ' below target' : 'At target across the board',
      APP.btn('Open skills', 'btn-surface', null, 'data-act="goto" data-href="#/develop/skills"', 'is-sm')) +
      rows.map(function (r) {
        var c = D.competency(r[0]);
        return '<div class="skill-row"><span class="skill-name">' + esc(c.name) + '<span class="skill-area">' + esc(c.area) + '</span></span>' +
          '<span class="skill-steps">' + D.LEVELS_SKILL.map(function (l) {
            var have = l.n <= r[1], gap = l.n > r[1] && l.n <= r[2];
            return '<span class="skill-step' + (have ? ' is-have' : gap ? ' is-gap' : '') + '" title="' + esc(l.name) + ': ' + esc(l.desc) + '">' + l.n + '</span>';
          }).join('') + '</span>' +
          '<span class="skill-note">' + (r[1] >= r[2] ? 'At target' : 'Target ' + r[2]) + (r[3] && !compact ? '<br>Signed off ' + esc(r[3]) : '') + '</span></div>';
      }).join('') + '</section>';
  }

  function skillsView() {
    var people = APP.is('employee') ? [APP.me()] : APP.people().filter(function (p) { return D.SKILLS[p.id]; });
    var total = 0, gaps = 0, validated = 0;
    people.forEach(function (p) { (D.SKILLS[p.id] || []).forEach(function (r) { total++; if (r[1] < r[2]) gaps++; if (r[3]) validated++; }); });
    return APP.hint('Levels come from skill validations, not from self assessment. A level only moves when someone signs it off.', 'badge-check') +
      APP.glance([
        [people.length, 'People'],
        [total, 'Tracked competencies'],
        [gaps, 'Below target', gaps ? 'is-warn' : 'is-good'],
        [validated, 'Signed off']
      ]) +
      (APP.is('employee') ? skillCard(APP.me().id) :
        '<section class="card flush-card">' +
        APP.table([{ t: 'Person' }].concat(D.COMPETENCIES.slice(0, 6).map(function (c) { return { t: c.name.split(' ')[0], num: true }; })).concat([{ t: 'Below target', num: true }]),
          people.map(function (p) {
            var map = {}; (D.SKILLS[p.id] || []).forEach(function (r) { map[r[0]] = r; });
            var below = (D.SKILLS[p.id] || []).filter(function (r) { return r[1] < r[2]; }).length;
            return { attrs: '', cells: [APP.personLine(p, null, 28)].concat(D.COMPETENCIES.slice(0, 6).map(function (c) {
              var r = map[c.id];
              if (!r) return '<span class="mini-note">—</span>';
              return '<span class="lvl-chip' + (r[1] < r[2] ? ' is-gap' : '') + '" title="' + esc(c.name) + ': ' + esc(lvl(r[1]).name) + ', target ' + esc(lvl(r[2]).name) + '">' + r[1] + '</span>';
            })).concat([below ? APP.badge(String(below), 'is-warning') : APP.badge('0', 'is-success')]) };
          }), { empty: 'Nobody in scope has a competency record yet.' }) + '</section>' +
        APP.hint('Numbers are the current level. An amber chip means it is below the target set on that person development plan.', 'info')) +
      APP.why('What the four levels mean', '<p>' + D.LEVELS_SKILL.map(function (l) { return '<b>' + l.n + ' ' + l.name + '</b>, ' + l.desc.toLowerCase() + '.'; }).join(' ') + '</p><p>A level is evidence, not an opinion: it moves only when a skill validation form is completed and signed off, and the form stays in the record.</p>');
  }

  function frameworkView() {
    var areas = {};
    D.COMPETENCIES.forEach(function (c) { (areas[c.area] = areas[c.area] || []).push(c); });
    return APP.hint('The framework is configuration. Adding a competency makes it available to every plan and every skill validation.', 'layers') +
      Object.keys(areas).map(function (a) {
        return APP.sectionLabel(a, areas[a].length + ' competencies') +
          '<div class="card-grid">' + areas[a].map(function (c) {
            var used = 0; for (var k in D.SKILLS) if (D.SKILLS[k].some(function (r) { return r[0] === c.id; })) used++;
            return '<section class="card vs-card"><div class="vs-head"><span class="vs-ic">' + ic('badge-check', 18) + '</span><span class="vs-name">' + esc(c.name) + '</span></div>' +
              '<p class="mini-note">Tracked for ' + used + ' ' + (used === 1 ? 'person' : 'people') + ' · ' + esc(c.id) + '</p>' +
              '<div class="skill-steps">' + D.LEVELS_SKILL.map(function (l) { return '<span class="skill-step" title="' + esc(l.desc) + '">' + l.n + '</span>'; }).join('') + '</div></section>';
          }).join('') + '</div>';
      }).join('') +
      (APP.isHR() ? '<div class="filter-bar" style="margin-top:var(--space-5)"><span class="fb-spacer"></span>' +
        APP.btn('Add a competency', 'btn-solid', 'plus', 'data-act="toast" data-t="Competency added" data-b="Available on every development plan and skill validation from now."', 'is-sm') + '</div>' : '');
  }

  function detail(id) {
    var p = D.devPlan(id);
    if (!p || !(APP.isHR() || APP.inScope(p.emp) || p.emp === APP.me().id)) {
      return APP.page({ crumbs: [['Home', '#/home'], ['Development', '#/develop']], title: 'Plan not found', desc: '',
        body: APP.emptyState('target', 'Not in your scope', 'Development plans follow the reporting line.', APP.btn('Back', 'btn-solid', null, 'data-act="goto" data-href="#/develop"')) });
    }
    var e = P(p.emp), editable = p.owner === APP.me().id;
    var avg = p.goals.length ? Math.round(p.goals.reduce(function (n, g) { return n + g.pct; }, 0) / p.goals.length) : 0;
    return APP.page({
      crumbs: [['Home', '#/home'], ['Development', '#/develop'], [e.name, '#']],
      title: e.name + ' · development plan', desc: p.cycle + ' · owner ' + P(p.owner).name + ' · review ' + p.review,
      action: APP.statusBadge(p.status) + (editable ? ' ' + APP.btn('Add a goal', 'btn-solid', 'plus', 'data-act="dev-add-goal" data-id="' + p.id + '"', 'is-sm') : ''),
      body: APP.glance([
        [p.goals.length, 'Goals'],
        [avg + '%', 'Average progress', avg >= 50 ? 'is-good' : avg >= 25 ? '' : 'is-warn'],
        [p.goals.filter(function (g) { return g.status === 'Met'; }).length, 'Met', p.goals.some(function (g) { return g.status === 'Met'; }) ? 'is-good' : ''],
        [p.checkins.length, 'Check ins']
      ]) +
        '<div class="split-rail"><div class="stack-4">' + planCard(p, true) + checkins(p) + '</div>' +
        '<div class="stack-4">' + skillCard(p.emp, true) +
        '<section class="card">' + APP.panelHead('Linked records') +
        APP.dataList([
          ['Person', APP.personLine(e, null, 28, false)],
          ['Owner', APP.personLine(p.owner, null, 28, false)],
          ['Opened', esc(p.opened)],
          ['Coaching forms', String(D.FORMS.filter(function (f) { return f.emp === p.emp; }).length)],
          ['Open action items', String(D.ACTIONS.filter(function (a) { return a.owner === p.emp && a.status !== 'Closed'; }).length)]
        ]) +
        APP.btn('Open the full record', 'btn-surface', 'circle-arrow-right', 'data-act="goto" data-href="#/org/' + p.emp + '"', 'is-sm') +
        '</section></div></div>'
    });
  }

  APP.VIEWS.develop = function (r) {
    if (r[1] && r[1].indexOf('DP-') === 0) return detail(r[1]);
    var tab = r[1] || 'plans';
    var body = tab === 'skills' ? skillsView() : tab === 'framework' ? frameworkView() : listView();
    return APP.page({
      crumbs: [['Home', '#/home'], ['Development', '#/develop']],
      title: APP.is('employee') ? 'My development' : 'Development',
      desc: 'Goals, competency levels and check ins. The half of the product that is about growth.',
      tabs: tabsFor(tab), body: body
    });
  };

  var A = APP.ACT;
  A['dev-new'] = function () {
    APP.dialog({
      title: 'New development plan', sub: 'One per person per cycle.',
      body: APP.field('Person', APP.dd('dv-emp', APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return [p.id, p.name + ', ' + p.title]; }), (APP.team()[0] || APP.me()).id, 'dd-block'), null, true) +
        APP.field('Cycle', APP.dd('dv-cycle', [['H2 2026', 'H2 2026, Jul to Dec'], ['H1 2027', 'H1 2027, Jan to Jun']], 'H2 2026', 'dd-block'), null, true) +
        APP.field('Review date', APP.dd('dv-rev', [['Fri 2 Oct 2026', 'Fri 2 Oct 2026'], ['Fri 30 Oct 2026', 'Fri 30 Oct 2026'], ['Fri 18 Dec 2026', 'Fri 18 Dec 2026']], 'Fri 2 Oct 2026', 'dd-block'), 'Goals can run past it. The review is when you sit down.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Create plan', 'btn-solid', 'plus', 'data-act="toast" data-t="Plan created" data-b="Add the first goal to move it out of Draft."')
    });
  };
  A['dev-add-goal'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Add a goal', sub: 'A competency, a target level and a date.',
      body: APP.field('Goal', '<input class="input" placeholder="Reach Strong on exception handling">', null, true) +
        '<div class="form-grid">' +
        APP.field('Competency', APP.dd('g-comp', D.COMPETENCIES.map(function (c) { return [c.id, c.name]; }), 'C-EXC', 'dd-block'), null, true) +
        APP.field('Target level', APP.dd('g-lvl', D.LEVELS_SKILL.map(function (l) { return [String(l.n), l.n + ' ' + l.name]; }), '3', 'dd-block'), null, true) +
        '</div>' +
        APP.field('Due', APP.dd('g-due', [['Fri 2 Oct 2026', 'Fri 2 Oct 2026'], ['Fri 30 Oct 2026', 'Fri 30 Oct 2026'], ['Fri 18 Dec 2026', 'Fri 18 Dec 2026']], 'Fri 30 Oct 2026', 'dd-block'), null, true) +
        APP.field('How it gets there', '<textarea class="textarea" placeholder="Complete the module, then handle five exceptions with the manager observing."></textarea>', 'Name the activity, not the intention.', true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add goal', 'btn-solid', 'plus', 'data-act="dev-goal-saved" data-id="' + id + '"')
    });
  };
  A['dev-goal-saved'] = function (el) {
    var p = D.devPlan(el.getAttribute('data-id'));
    if (p) {
      p.goals.push({ id: 'G-' + (p.goals.length + 1), t: 'Reach Strong on exception handling', c: S.f['g-comp'] || 'C-EXC',
        from: 1, to: +(S.f['g-lvl'] || 3), due: S.f['g-due'] || 'Fri 30 Oct 2026', pct: 0, status: 'Open',
        how: 'Complete the module, then handle five exceptions with the manager observing.' });
      if (p.status === 'Draft') p.status = 'Active';
    }
    APP.closeAll(); APP.rerender(); APP.toast('Goal added', 'It shows on the plan and on the competency ladder.');
  };
  A['dev-progress'] = function (el) {
    APP.dialog({
      title: 'Log progress', sub: 'What moved, and what is next.',
      body: APP.field('Progress', '<input class="input" type="range" min="0" max="100" value="50" class="slider">', 'Drag to set where the goal is now.') +
        APP.field('What happened', '<textarea class="textarea" placeholder="Shadow shift completed. Skill validation booked for 24 Sep."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Save', 'btn-solid', 'check', 'data-act="toast" data-t="Progress logged" data-b="Recorded against the goal and visible to the employee."')
    });
  };
  A['dev-checkin'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.dialog({
      title: 'Add a check in', sub: 'Short, dated, and visible to both of you.',
      body: APP.field('Note', '<textarea class="textarea" data-input="dv-note" placeholder="Recording improving on early shifts, still slipping on lates."></textarea>', null, true),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') + APP.btn('Add', 'btn-solid', 'plus', 'data-act="dev-checkin-saved" data-id="' + id + '"')
    });
  };
  APP.INPUT['dv-note'] = function (el) { S.f.dvNote = el.value; };
  A['dev-checkin-saved'] = function (el) {
    var p = D.devPlan(el.getAttribute('data-id'));
    if (p) p.checkins.push({ on: D.TODAY, by: APP.me().id, t: S.f.dvNote || 'Check in recorded.' });
    S.f.dvNote = '';
    APP.closeAll(); APP.rerender(); APP.toast('Check in added', 'Dated and attributed. Both of you can see it.');
  };
})();
