/* skyPerformance: coaching. The front door. A manager picks a type, says what
   happened, and submits. The employee is notified and acknowledges. */
(function () {
  var D = window.SP, APP = window.APP, ic = APP.ic, esc = APP.esc, P = APP.P, S = APP.S;

  function typeBadge(t) {
    var ct = D.coachingType(t);
    return '<span class="row-gap">' + ic(ct.ic, 14) + '<span>' + esc(ct.name) + '</span></span>';
  }
  function who(r) {
    if (r.group) return '<span class="row-gap">' + r.group.slice(0, 3).map(function (g) { return APP.av(g, 24); }).join('') +
      (r.group.length > 3 ? '<span class="count-pill">+' + (r.group.length - 3) + '</span>' : '') + '</span>';
    return APP.personLine(r.emp, false, 26);
  }
  function ackBadge(r) {
    if (r.group) return APP.badge('Team record', 'is-neutral');
    return r.ack ? APP.badge('Acknowledged', 'is-success', 'check') : APP.badge('Waiting on employee', 'is-warning', 'hourglass');
  }

  /* ---------------- manager and HR view ---------------- */
  function log() {
    var f = S.f, list = APP.records();
    if (f.cType && f.cType !== 'All') list = list.filter(function (r) { return r.type === f.cType; });
    if (f.cWho && f.cWho !== 'All') list = list.filter(function (r) { return r.emp === f.cWho || (r.group && r.group.indexOf(f.cWho) >= 0); });
    if (f.cRange === '30') list = list.filter(function (r) { return /Sep|Aug/.test(r.on); });
    if (f.cRange === '90') list = list.filter(function (r) { return /Sep|Aug|Jul/.test(r.on); });
    var q = (f.cq || '').toLowerCase();
    if (q) list = list.filter(function (r) { return ((r.topic || '') + ' ' + (r.text || '') + ' ' + r.id).toLowerCase().indexOf(q) >= 0; });

    var all = APP.records();
    var waiting = all.filter(function (r) { return r.emp && !r.ack; }).length;
    var people = APP.people().filter(function (p) { return p.id !== APP.me().id; });

    return APP.hint('One entry covers a conversation, a policy reminder, recognition, or a whole team meeting. Everything here lands in the person’s file the moment you submit.', 'message-square-text') +
      APP.glance([
        [all.length, 'Records in your scope'],
        [all.filter(function (r) { return r.type === 'CT-REC'; }).length, 'Recognition', 'is-good'],
        [all.filter(function (r) { return r.type === 'CT-TEAM'; }).length, 'Team meetings'],
        [waiting, 'Waiting on acknowledgement', waiting ? 'is-warn' : 'is-good']
      ]) +
      '<div class="filter-bar">' +
      '<div class="search" style="min-width:220px"><span class="search-icon">' + ic('search', 16) + '</span><input class="input" data-input="cq" value="' + esc(f.cq || '') + '" placeholder="Search what was written"></div>' +
      APP.dd('cType', [['All', 'All types']].concat(D.COACHING_TYPES.map(function (t) { return [t.id, t.name]; })), f.cType || 'All') +
      APP.dd('cWho', [['All', 'Everyone']].concat(people.map(function (p) { return [p.id, p.name]; })), f.cWho || 'All') +
      APP.dd('cRange', [['All', 'All time'], ['30', 'Last 30 days'], ['90', 'Last 90 days']], f.cRange || 'All') +
      '<span class="fb-spacer"></span>' +
      APP.btn('Export', 'btn-surface', 'download', 'data-act="export" data-what="The coaching log as CSV"', 'is-sm') +
      (APP.canCoach() ? APP.btn('New ' + APP.term('coaching').toLowerCase(), 'btn-solid', 'plus', 'data-act="new-coaching"', 'is-sm') : '') +
      '</div>' +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Date' }, { t: 'Type', w: '15%' }, { t: 'Who', w: '14%' }, { t: 'What was documented', w: '34%' }, { t: 'By' }, { t: 'Status' }, { t: '' }],
        list.map(function (r) {
          return { cells: [
            esc(r.on.replace(/^\w+ /, '')) + '<span class="cell-sub">' + esc(r.at || '') + '</span>',
            typeBadge(r.type), who(r),
            '<span class="cell-strong">' + esc(r.topic || '') + '</span><span class="cell-sub">' + esc((r.text || '').slice(0, 80)) + '...</span>',
            APP.personLine(r.by, false, 26), ackBadge(r),
            APP.btn('Open', 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm')
          ] };
        }), { empty: 'Nothing matches. Try a wider date range.' }) + '</section>' +
      APP.why('Why this is the front door', '<p>Before this, a manager wrote an email and saved it. Anything documented here is timestamped, attributed, visible to the employee, and still retrievable years later. If it is faster than sending an email, it gets used.</p>');
  }

  /* ---------------- employee view ---------------- */
  function mine() {
    var me = APP.me(), list = D.recordsFor(me.id);
    var waiting = list.filter(function (r) { return r.emp === me.id && !r.ack; });
    return (waiting.length ? APP.callout('<b>' + waiting.length + ' record is waiting for you to acknowledge.</b> Acknowledging means you received it and read it, not that you agree with it.', 'is-warning', 'hourglass') : '') +
      APP.hint('Everything documented about you, in your manager’s words. If you disagree, say so in the acknowledgement: your comment is kept with the record.', 'info') +
      APP.glance([
        [list.length, 'Records about you'],
        [list.filter(function (r) { return r.type === 'CT-REC'; }).length, 'Recognition', 'is-good'],
        [waiting.length, 'To acknowledge', waiting.length ? 'is-warn' : 'is-good'],
        [D.recordsFor(me.id).filter(function (r) { return r.group; }).length, 'Team meetings']
      ]) +
      '<section class="card flush-card">' +
      APP.table([{ t: 'Date' }, { t: 'Type' }, { t: 'What was documented', w: '44%' }, { t: 'By' }, { t: 'Status' }, { t: '' }],
        list.map(function (r) {
          return { cells: [esc(r.on.replace(/^\w+ /, '')), typeBadge(r.type),
            '<span class="cell-strong">' + esc(r.topic || '') + '</span><span class="cell-sub">' + esc((r.text || '').slice(0, 70)) + '...</span>',
            APP.personLine(r.by, false, 26), ackBadge(r),
            APP.btn(r.emp === APP.me().id && !r.ack ? 'Read and acknowledge' : 'Read', r.emp === APP.me().id && !r.ack ? 'btn-solid' : 'btn-surface', null, 'data-act="open-record" data-id="' + r.id + '"', 'is-sm')] };
        }), { empty: 'Nothing on your record yet.' }) + '</section>';
  }

  APP.VIEWS.coaching = function () {
    return APP.page({
      crumbs: [['Home', '#/home'], [APP.term('coaching'), '#/coaching']],
      title: APP.term('coaching'), desc: 'Every documented conversation, for everyone you manage.',
      body: log()
    });
  };
  APP.VIEWS.mycoaching = function () {
    return APP.page({
      crumbs: [['Home', '#/home'], ['My ' + APP.term('coaching').toLowerCase(), '#/mycoaching']],
      title: 'My ' + APP.term('coaching').toLowerCase(), desc: 'What has been documented about your work.',
      body: mine()
    });
  };
  APP.INPUT.cq = function (el) { S.f.cq = el.value; var c = el.selectionStart; APP.rerender(); var n = document.querySelector('[data-input="cq"]'); if (n) { n.focus(); n.setSelectionRange(c, c); } };

  /* ---------------- the record itself ---------------- */
  var A = APP.ACT;
  A['open-record'] = function (el) {
    var r = D.record(el.getAttribute('data-id'));
    if (!r) { APP.toast('Not found', 'That record is not in your scope.', 'warning'); return; }
    var ct = D.coachingType(r.type), mine_ = r.emp === APP.me().id;
    APP.dialog({
      title: ct.name, sub: r.id + ' · documented ' + r.on + (r.at ? ', ' + r.at : ''), size: 'is-wide',
      body: '<div class="paper">' +
        '<div class="paper-head"><div><div class="paper-title">' + esc(r.topic || ct.name) + '</div>' +
        '<div class="paper-sub">' + esc(D.CONFIG.org) + ' · ' + esc(APP.hierPath(r.site, r.dept)) + '</div></div>' +
        '<div class="paper-id">' + esc(r.id) + '<br>' + esc(r.on) + '</div></div>' +
        APP.dataList([
          ['Type', esc(ct.name)],
          [r.group ? 'Attendees' : 'Employee', r.group
            ? r.group.map(function (g) { return esc(P(g).name); }).join(', ')
            : esc(P(r.emp).name) + ', ' + esc(P(r.emp).title)],
          ['Documented by', esc(P(r.by).name) + ', ' + esc(P(r.by).title)],
          ['Date of conversation', esc(r.on)],
          ['Entered', esc(r.on) + (r.at ? ', ' + esc(r.at) : '')]
        ]) +
        '<h3>What was documented</h3><p>' + esc(r.text) + '</p>' +
        (r.attachments && r.attachments.length ? '<h3>Attachments</h3><div class="qa-list">' + r.attachments.map(function (a) {
          return '<div class="qa-row"><span class="qa-q">' + ic('paperclip', 14) + ' ' + esc(a) + '</span></div>'; }).join('') + '</div>' : '') +
        (r.visitId ? '<h3>Linked</h3><p>Site visit ' + esc(r.visitId) + '. <button class="rowlink" data-act="goto" data-href="#/visits/' + r.visitId + '">Open the visit</button></p>' : '') +
        '<h3>Acknowledgement</h3>' +
        (r.group ? '<p>A team record. Each attendee acknowledges on their own file.</p>'
          : r.ack ? '<p>Acknowledged by ' + esc(P(r.emp).name) + ' on ' + esc(r.ack) + '.</p>'
            : '<p>Not yet acknowledged.</p>') +
        '<div class="paper-sign"><div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + esc(P(r.by).name) + ', documented by</div></div>' +
        '<div class="sign-block"><div class="sign-line"></div><div class="sign-label">' + (r.group ? 'Attendee' : esc(P(r.emp).name)) + ', acknowledged</div></div></div></div>',
      footer: APP.btn('Close', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Print or save as PDF', 'btn-surface', 'printer', 'data-act="toast" data-t="Rendering PDF" data-b="The record prints exactly as it is stored." data-k="info"') +
        (mine_ && !r.ack ? APP.btn('Acknowledge', 'btn-solid', 'signature', 'data-act="ack-record" data-id="' + r.id + '"') : '')
    });
  };
  A['ack-record'] = function (el) {
    var id = el.getAttribute('data-id');
    APP.closeOverlay();
    APP.dialog({
      title: 'Acknowledge this record', sub: 'Receipt, not agreement.',
      body: APP.callout('You are confirming you received and read it. If you disagree, write it below: your comment is stored with the record and nobody can remove it.', 'is-info', 'info') +
        APP.field('Your comment, optional', '<textarea class="textarea" data-input="ack-note" placeholder="Anything you want on the record."></textarea>'),
      footer: APP.btn('Cancel', 'btn-surface', null, 'data-act="close-overlay"') +
        APP.btn('Acknowledge', 'btn-solid', 'signature', 'data-act="ack-record-do" data-id="' + id + '"')
    });
  };
  APP.INPUT['ack-note'] = function (el) { S.f.ackNote = el.value; };
  A['ack-record-do'] = function (el) {
    var r = D.record(el.getAttribute('data-id'));
    r.ack = D.TODAY + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    if (S.f.ackNote) r.ackNote = S.f.ackNote;
    S.f.ackNote = '';
    APP.closeAll(); APP.rerender();
    APP.toast('Acknowledged', 'Timestamped and stored with ' + r.id + '. ' + P(r.by).name.split(' ')[0] + ' can see it.');
  };

  /* ---------------- new coaching: pick a type, then write ---------------- */
  A['new-coaching'] = function (el) {
    S.f.ncType = (el && el.getAttribute('data-type')) || null;
    S.f.ncWho = (el && el.getAttribute('data-emp')) || null;
    S.f.ncGroup = [];
    pickType();
  };
  function pickType() {
    var types = D.COACHING_TYPES.filter(function (t) { return !t.minLevel || D.atLeast(APP.level(), t.minLevel) || APP.isHR(); });
    APP.dialog({
      title: 'New ' + APP.term('coaching').toLowerCase(), sub: 'What kind of record is this?', size: 'is-wide',
      body: '<div class="type-grid">' + types.map(function (t) {
        return '<button class="type-card" data-act="nc-type" data-k="' + t.id + '">' +
          '<span class="type-ic' + (t.tone === 'good' ? ' is-good' : '') + '">' + ic(t.ic, 20) + '</span>' +
          '<span class="type-text"><span class="type-name">' + esc(t.name) + '</span><span class="type-desc">' + esc(t.desc) + '</span></span>' +
          ic('chevron-right', 16) + '</button>';
      }).join('') + '</div>' +
      (D.atLeast(APP.level(), 'regional') || APP.isHR() ? '' :
        APP.hint('The ' + APP.term('visit').toLowerCase() + ' form appears here for ' + esc(D.CONFIG.levels.regional.toLowerCase()) + ' and above.', 'lock'))
    });
  }
  A['nc-type'] = function (el) {
    var t = D.coachingType(el.getAttribute('data-k'));
    S.f.ncType = t.id;
    APP.closeAll();
    if (t.form === 'eval') { APP.ACT['new-eval']({ getAttribute: function () { return null; } }); return; }
    if (t.form === 'visit') { APP.ACT['new-visit']({ getAttribute: function () { return null; } }); return; }
    writeForm();
  };
  function writeForm() {
    var t = D.coachingType(S.f.ncType), team = APP.people().filter(function (p) { return p.id !== APP.me().id; });
    var picked = S.f.ncGroup || [];
    var whoBlock = t.multi
      ? '<div class="sf-block"><span class="field-label">Who was there<span class="req">*</span></span>' +
        '<div class="row-gap" style="margin-bottom:var(--space-2)">' +
        APP.btn('Select my whole team', 'btn-surface', 'users', 'data-act="nc-all"', 'is-sm') +
        APP.btn('Clear', 'btn-ghost', null, 'data-act="nc-none"', 'is-sm') +
        '<span class="mini-note">' + picked.length + ' selected</span></div>' +
        '<div class="pick-list">' + team.map(function (p) {
          var on = picked.indexOf(p.id) >= 0;
          return '<button class="pick-row' + (on ? ' is-on' : '') + '" data-act="nc-toggle" data-id="' + p.id + '">' +
            '<span class="pick-box">' + (on ? ic('check', 14) : '') + '</span>' + APP.av(p, 24) +
            '<span class="pick-text"><span class="pick-name">' + esc(p.name) + '</span><span class="pick-sub">' + esc(p.title) + '</span></span></button>';
        }).join('') + '</div></div>'
      : APP.field('Who is this about', APP.dd('nc-who', team.map(function (p) { return [p.id, p.name + ', ' + p.title]; }), S.f.ncWho || (team[0] || {}).id, 'dd-block'), 'Only people in your reporting line are listed.', true);

    APP.dialog({
      title: t.name, sub: 'It files the moment you submit.', size: 'is-wide',
      body: whoBlock +
        APP.field('What is this about', '<input class="input" data-input="nc-topic" placeholder="' + (t.id === 'CT-REC' ? 'Covered two open shifts' : t.id === 'CT-TEAM' ? 'Clinical team meeting: call light response' : 'Uniform and name badge') + '" value="' + esc(S.f.ncTopic || '') + '">', 'A short title, so it is findable later.', true) +
        APP.field('What happened', '<textarea class="textarea is-tall" data-input="nc-text" placeholder="' +
          (t.id === 'CT-REC' ? 'Say what they did and why it mattered.' : 'What was discussed, what was agreed, and anything they raised.') + '">' + esc(S.f.ncText || '') + '</textarea>', null, true) +
        '<div class="form-grid">' +
        APP.field('Date of the conversation', APP.dd('nc-date', [[D.TODAY, D.TODAY + ', today'], ['Thu 17 Sep 2026', 'Thu 17 Sep 2026'], ['Wed 16 Sep 2026', 'Wed 16 Sep 2026']], S.f['nc-date'] || D.TODAY, 'dd-block'), 'The date it happened, not the date you typed it.', true) +
        APP.field('Attachment', '<button class="btn btn-surface" data-act="toast" data-t="Attachment" data-b="On a phone this opens the camera or files. Agendas, photos and documents attach to the record.">' + ic('paperclip', 16, 'btn-icon') + (t.multi ? 'Attach the agenda' : 'Attach a file') + '</button>') +
        '</div>' +
        APP.callout('Submitting notifies ' + (t.multi ? 'everyone selected' : 'the employee') + ' and asks them to acknowledge. The record cannot be edited afterwards.', 'is-info', 'send'),
      footer: APP.btn('Back', 'btn-surface', 'chevron-left', 'data-act="new-coaching"') +
        APP.btn('Submit', 'btn-solid', 'send', 'data-act="nc-submit"')
    });
  }
  APP.INPUT['nc-topic'] = function (el) { S.f.ncTopic = el.value; };
  APP.INPUT['nc-text'] = function (el) { S.f.ncText = el.value; };
  APP.DD['nc-who'] = function (v) { S.f.ncWho = v; };
  A['nc-toggle'] = function (el) {
    var id = el.getAttribute('data-id'), g = S.f.ncGroup || [];
    var i = g.indexOf(id); if (i >= 0) g.splice(i, 1); else g.push(id);
    S.f.ncGroup = g; APP.closeOverlay(); writeForm();
  };
  A['nc-all'] = function () { S.f.ncGroup = APP.people().filter(function (p) { return p.id !== APP.me().id; }).map(function (p) { return p.id; }); APP.closeOverlay(); writeForm(); };
  A['nc-none'] = function () { S.f.ncGroup = []; APP.closeOverlay(); writeForm(); };
  A['nc-submit'] = function () {
    var t = D.coachingType(S.f.ncType), me = APP.me();
    var group = S.f.ncGroup || [];
    if (t.multi && !group.length) { APP.toast('Nobody selected', 'Pick at least one person, or use Select my whole team.', 'warning'); return; }
    if (!S.f.ncTopic) { APP.toast('Needs a title', 'A short title is what makes it findable later.', 'warning'); return; }
    var target = t.multi ? null : (S.f.ncWho || APP.people().filter(function (p) { return p.id !== me.id; })[0].id);
    var subject = t.multi ? P(group[0]) : P(target);
    var rec = { id: 'CR-' + (20940 + Math.floor(Math.random() * 50)), type: t.id, emp: target, group: t.multi ? group.slice() : null,
      by: me.id, on: S.f['nc-date'] || D.TODAY, at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      site: subject.site, dept: subject.dept, topic: S.f.ncTopic, text: S.f.ncText || 'Documented conversation.',
      ack: null, attachments: t.multi ? ['Meeting agenda.pdf'] : [] };
    D.RECORDS.unshift(rec);
    S.f.ncTopic = ''; S.f.ncText = ''; S.f.ncGroup = [];
    APP.closeAll(); APP.go('#/coaching');
    APP.toast('Filed', rec.id + ' is on ' + (t.multi ? group.length + ' files' : P(target).name.split(' ')[0] + '’s file') + '. They have been asked to acknowledge it.');
    setTimeout(function () { A['open-record']({ getAttribute: function () { return rec.id; } }); }, 400);
  };
})();
