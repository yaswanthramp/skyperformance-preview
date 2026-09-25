/* skyPerformance wireframe: sample data, scoped to the customer functional scope v2.
   Fictional operator, fictional people, fabricated numbers. The structures
   (coaching types, PIP levels, evaluation sections, site visit form) follow the
   forms the client supplied. */
(function () {
  var D = window.SP = {};

  /* ---------------- configuration ----------------
     Everything an operator can rename lives here. Roles, levels and the name of
     the system of record are all labels, never logic. Settings edits this. */
  D.CONFIG = {
    org: 'Riverbend Senior Living',
    orgShort: 'Riverbend',
    hris: 'Riverbend HRIS',
    roles: { employee: 'Employee', manager: 'Manager', hr: 'HR' },
    levels: { staff: 'Team member', dept: 'Department head', community: 'Executive Director', regional: 'Regional Director', corporate: 'Corporate' },
    terms: { coaching: 'Coaching', pip: 'Performance Improvement Plan', pipShort: 'PIP', eval: 'Annual evaluation', visit: 'Site visit', site: 'Community' }
  };
  D.cfg = function (path) {
    var parts = path.split('.'), v = D.CONFIG;
    for (var i = 0; i < parts.length; i++) v = v[parts[i]];
    return v;
  };
  D.TODAY = 'Fri 18 Sep 2026';
  D.CYCLE = 'FY 2026';

  /* ---------------- hierarchy, synced from the system of record ---------------- */
  D.REGIONS = [
    { id: 'RG-MW', name: 'Midwest', lead: 'alexis' },
    { id: 'RG-MA', name: 'Mid-Atlantic', lead: 'dominic' }
  ];
  D.SITES = [
    { id: 'CM-CH', name: 'Cedar Hollow', region: 'RG-MW', city: 'Fort Wayne, IN', beds: 96, ed: 'curtis', type: 'Assisted living and memory care' },
    { id: 'CM-MC', name: 'Maple Court', region: 'RG-MW', city: 'Kokomo, IN', beds: 74, ed: 'ruben', type: 'Assisted living' },
    { id: 'CM-LV', name: 'Lakeview Manor', region: 'RG-MW', city: 'Elkhart, IN', beds: 110, ed: 'bernadette', type: 'Assisted living and memory care' },
    { id: 'CM-SB', name: 'Stonebridge Place', region: 'RG-MA', city: 'Hershey, PA', beds: 88, ed: 'harriet', type: 'Personal care' },
    { id: 'CM-WC', name: 'Willow Crossing', region: 'RG-MA', city: 'Altoona, PA', beds: 64, ed: 'jonah', type: 'Assisted living' },
    { id: 'CM-BG', name: 'Birch Grove', region: 'RG-MA', city: 'Dover, DE', beds: 72, ed: 'harriet', type: 'Assisted living' }
  ];
  D.DEPTS = ['Clinical', 'Dining', 'Life Enrichment', 'Maintenance', 'Memory Care', 'Business Office', 'Housekeeping', 'Marketing'];

  function p(id, name, title, dept, site, level, mgr, hired, extra) {
    var o = { id: id, name: name, title: title, dept: dept, site: site, level: level, mgr: mgr, hired: hired,
      ini: name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  D.PEOPLE = [
    p('nadine', 'Nadine Okonkwo', 'VP of Operations', 'Operations', null, 'corporate', null, 'Apr 2017'),
    p('grant', 'Grant Ihejirika', 'HR Business Partner', 'People', null, 'corporate', 'nadine', 'Jan 2018'),
    p('alexis', 'Alexis Moreau', 'Regional Director of Operations', 'Operations', null, 'regional', 'nadine', 'Mar 2021', { region: 'RG-MW' }),
    p('dominic', 'Dominic Sarr', 'Regional Director of Operations', 'Operations', null, 'regional', 'nadine', 'Aug 2019', { region: 'RG-MA' }),
    p('talia', 'Talia Brennan', 'Regional Director of Clinical Services', 'Clinical', null, 'regional', 'nadine', 'Jun 2020', { region: 'RG-MW', clinical: true }),

    /* Cedar Hollow */
    p('curtis', 'Curtis Nakamura', 'Executive Director', 'Operations', 'CM-CH', 'community', 'alexis', 'Sep 2019'),
    p('priya', 'Priya Raghavan', 'Director of Nursing', 'Clinical', 'CM-CH', 'dept', 'curtis', 'Apr 2022'),
    p('imani', 'Imani Clarke', 'Dining Services Director', 'Dining', 'CM-CH', 'dept', 'curtis', 'May 2020'),
    p('oscar', 'Oscar Lindqvist', 'Maintenance Director', 'Maintenance', 'CM-CH', 'dept', 'curtis', 'Oct 2017'),
    p('yolanda', 'Yolanda Briggs', 'Life Enrichment Director', 'Life Enrichment', 'CM-CH', 'dept', 'curtis', 'Sep 2022'),
    p('dana', 'Dana Whitfield', 'Resident Assistant', 'Clinical', 'CM-CH', 'staff', 'priya', 'Feb 2025'),
    p('lorna', 'Lorna Bekele', 'Resident Assistant', 'Clinical', 'CM-CH', 'staff', 'priya', 'Nov 2023'),
    p('trevor', 'Trevor Ansley', 'Resident Assistant', 'Clinical', 'CM-CH', 'staff', 'priya', 'Jun 2026'),
    p('marisol', 'Marisol Quintero', 'Medication Technician', 'Clinical', 'CM-CH', 'staff', 'priya', 'Aug 2021'),
    p('nadia', 'Nadia Farouk', 'Medication Technician', 'Clinical', 'CM-CH', 'staff', 'priya', 'Mar 2024'),
    p('devon', 'Devon Pryce', 'Dining Server', 'Dining', 'CM-CH', 'staff', 'imani', 'Jan 2026'),
    p('halle', 'Halle Ostrom', 'Housekeeper', 'Housekeeping', 'CM-CH', 'staff', 'oscar', 'Jul 2024'),

    /* Maple Court */
    p('ruben', 'Ruben Castellanos', 'Executive Director', 'Operations', 'CM-MC', 'community', 'alexis', 'Feb 2018'),
    p('simone', 'Simone Adeyemi', 'Director of Nursing', 'Clinical', 'CM-MC', 'dept', 'ruben', 'Sep 2023'),
    p('kai', 'Kai Thornbury', 'Resident Assistant', 'Clinical', 'CM-MC', 'staff', 'simone', 'Apr 2024'),
    p('esther', 'Esther Vaneck', 'Resident Assistant', 'Clinical', 'CM-MC', 'staff', 'simone', 'Dec 2022'),

    /* Lakeview Manor */
    p('bernadette', 'Bernadette Kohl', 'Executive Director', 'Operations', 'CM-LV', 'community', 'alexis', 'Nov 2020'),
    p('ivan', 'Ivan Petrosyan', 'Memory Care Director', 'Memory Care', 'CM-LV', 'dept', 'bernadette', 'Jan 2024'),
    p('camille', 'Camille Doucet', 'Resident Assistant', 'Memory Care', 'CM-LV', 'staff', 'ivan', 'Aug 2025'),

    /* Mid-Atlantic */
    p('harriet', 'Harriet Odum', 'Executive Director', 'Operations', 'CM-SB', 'community', 'dominic', 'Jun 2016'),
    p('jonah', 'Jonah Reyes-Pike', 'Executive Director', 'Operations', 'CM-WC', 'community', 'dominic', 'Feb 2022'),
    p('wren', 'Wren Abbasi', 'Director of Nursing', 'Clinical', 'CM-SB', 'dept', 'harriet', 'Jul 2023'),
    p('teodor', 'Teodor Balan', 'Resident Assistant', 'Clinical', 'CM-SB', 'staff', 'wren', 'Mar 2023'),
    p('junie', 'Junie Mbeki', 'Business Office Manager', 'Business Office', 'CM-WC', 'dept', 'jonah', 'Oct 2024')
  ];
  D.byId = function (id) { for (var i = 0; i < D.PEOPLE.length; i++) if (D.PEOPLE[i].id === id) return D.PEOPLE[i]; return { id: id, name: id, ini: '?', title: '', dept: '', site: null, level: 'staff' }; };
  D.site = function (id) { for (var i = 0; i < D.SITES.length; i++) if (D.SITES[i].id === id) return D.SITES[i]; return { id: id, name: D.CONFIG.org, region: null, type: '' }; };
  D.siteName = function (id) { return id ? D.site(id).name : D.CONFIG.org; };
  D.region = function (id) { for (var i = 0; i < D.REGIONS.length; i++) if (D.REGIONS[i].id === id) return D.REGIONS[i]; return { id: id, name: 'All regions' }; };
  D.reports = function (id) { return D.PEOPLE.filter(function (x) { return x.mgr === id; }); };
  D.branch = function (id) {
    var out = [], q = D.reports(id);
    while (q.length) { var x = q.shift(); out.push(x); q = q.concat(D.reports(x.id)); }
    return out;
  };
  D.path = function (id) {
    var out = [], cur = D.byId(id);
    while (cur && cur.id && cur.name !== cur.id) { out.unshift(cur); cur = cur.mgr ? D.byId(cur.mgr) : null; }
    return out;
  };
  /* who counts as regional and up, which is what unlocks the site visit form */
  D.LEVEL_ORDER = ['staff', 'dept', 'community', 'regional', 'corporate'];
  D.atLeast = function (level, min) { return D.LEVEL_ORDER.indexOf(level) >= D.LEVEL_ORDER.indexOf(min); };

  /* ---------------- personas for the View as switcher ----------------
     Three roles. Several manager examples, because what a manager can reach
     depends on where they sit, not on a separate permission list. */
  D.PERSONAS = [
    { key: 'employee', role: 'employee', person: 'dana', note: 'Sees only their own file, acknowledges what was documented, works their to-do list.' },
    { key: 'dept', role: 'manager', person: 'priya', note: 'Documents coaching for the clinical team, runs evaluations, starts a PIP.' },
    { key: 'ed', role: 'manager', person: 'curtis', note: 'Same as a department head, plus everything in the community. Receives site visit action items.' },
    { key: 'regional', role: 'manager', person: 'alexis', note: 'Everything in the region, plus the site visit form.' },
    { key: 'hr', role: 'hr', person: 'grant', note: 'Reviews and approves PIPs, sees every file, runs the termination export, configures the product.' }
  ];

  /* ---------------- coaching types (the dropdown) ---------------- */
  D.COACHING_TYPES = [
    { id: 'CT-REC', name: 'Recognition', ic: 'award', desc: 'Positive documentation. Says what they did and why it mattered.', tone: 'good' },
    { id: 'CT-DISC', name: 'Coaching discussion', ic: 'message-square-text', desc: 'A conversation about performance or behaviour.', tone: 'neutral' },
    { id: 'CT-POL', name: 'Policy and procedure', ic: 'shield-check', desc: 'Resetting an expectation, or covering a policy.', tone: 'neutral' },
    { id: 'CT-TEAM', name: 'Team meeting', ic: 'users', desc: 'One entry filed to everyone who attended. Attach the agenda.', tone: 'neutral', multi: true },
    { id: 'CT-EVAL', name: 'Annual evaluation', ic: 'clipboard-check', desc: 'Opens the evaluation form.', tone: 'neutral', form: 'eval' },
    { id: 'CT-VISIT', name: 'Site visit form', ic: 'building-2', desc: 'The community walk-through. Regional and up.', tone: 'neutral', form: 'visit', minLevel: 'regional' }
  ];
  D.coachingType = function (id) { for (var i = 0; i < D.COACHING_TYPES.length; i++) if (D.COACHING_TYPES[i].id === id) return D.COACHING_TYPES[i]; return D.COACHING_TYPES[1]; };

  /* ---------------- coaching records ---------------- */
  function C(o) { return o; }
  D.RECORDS = [
    C({ id: 'CR-20918', type: 'CT-DISC', emp: 'dana', by: 'priya', on: 'Fri 12 Sep 2026', at: '09:14', site: 'CM-CH', dept: 'Clinical',
      topic: 'Uniform and name badge',
      text: 'Third shift this month arriving without a name badge. Reset the expectation: badge on before clocking in, spares are at the front desk. Dana understood and had no barriers to raise.',
      ack: 'Fri 12 Sep 2026 17:40', attachments: [] }),
    C({ id: 'CR-20904', type: 'CT-DISC', emp: 'dana', by: 'priya', on: 'Tue 26 Aug 2026', at: '15:20', site: 'CM-CH', dept: 'Clinical',
      topic: 'Uniform and name badge',
      text: 'Second conversation about arriving out of uniform. Reviewed the dress code and why residents and families rely on badges.',
      ack: 'Tue 26 Aug 2026 18:02', attachments: [] }),
    C({ id: 'CR-20877', type: 'CT-DISC', emp: 'dana', by: 'priya', on: 'Mon 10 Aug 2026', at: '08:35', site: 'CM-CH', dept: 'Clinical',
      topic: 'Uniform and name badge',
      text: 'Arrived in the wrong uniform. First conversation. Sent home to change, returned within the hour.',
      ack: 'Mon 10 Aug 2026 12:15', attachments: [] }),
    C({ id: 'CR-20930', type: 'CT-REC', emp: 'lorna', by: 'priya', on: 'Mon 15 Sep 2026', at: '16:05', site: 'CM-CH', dept: 'Clinical',
      topic: 'Covered two open shifts',
      text: 'Picked up two unfilled shifts at short notice and still finished every care task on time. Named by a family member in the September survey.',
      ack: 'Mon 15 Sep 2026 19:30', attachments: [] }),
    C({ id: 'CR-20926', type: 'CT-TEAM', emp: null, group: ['dana', 'lorna', 'trevor', 'marisol', 'nadia'], by: 'priya', on: 'Wed 10 Sep 2026', at: '07:00', site: 'CM-CH', dept: 'Clinical',
      topic: 'Clinical team meeting: call light response',
      text: 'Covered the new call light standard, the escalation path, and the September survey comments. Agenda attached. Every attendee has this on their file.',
      attachments: ['Clinical team meeting agenda, 10 Sep 2026.pdf'] }),
    C({ id: 'CR-20912', type: 'CT-POL', emp: 'nadia', by: 'priya', on: 'Mon 8 Sep 2026', at: '13:45', site: 'CM-CH', dept: 'Clinical',
      topic: 'Medication room door',
      text: 'Med room found unlocked during a walk-through. Reviewed the policy and the reason for it. Nadia agreed to check the door on every exit.',
      ack: 'Mon 8 Sep 2026 15:10', attachments: [] }),
    C({ id: 'CR-20899', type: 'CT-REC', emp: 'devon', by: 'imani', on: 'Thu 4 Sep 2026', at: '11:20', site: 'CM-CH', dept: 'Dining',
      topic: 'Handled a difficult meal service',
      text: 'Stayed calm through a short-staffed lunch and kept residents informed. Two families commented on it.',
      ack: null, attachments: [] }),
    C({ id: 'CR-20880', type: 'CT-DISC', emp: 'teodor', by: 'wren', on: 'Mon 14 Jul 2026', at: '09:45', site: 'CM-SB', dept: 'Clinical',
      topic: 'Unplanned absence',
      text: 'Third unplanned absence in sixty days. Reviewed the attendance policy and the effect on the floor.',
      ack: 'Mon 14 Jul 2026 16:00', attachments: [] }),
    C({ id: 'CR-20865', type: 'CT-VISIT', emp: 'curtis', by: 'alexis', on: 'Tue 4 Aug 2026', at: '09:05', site: 'CM-CH', dept: 'Operations',
      topic: 'Community site visit, August',
      text: 'Full walk-through completed. Score 81%. Twelve findings, six action items assigned. Debriefed with the Executive Director before leaving.',
      visitId: 'SV-1164', ack: 'Tue 4 Aug 2026 17:30', attachments: [] })
  ];
  D.record = function (id) { for (var i = 0; i < D.RECORDS.length; i++) if (D.RECORDS[i].id === id) return D.RECORDS[i]; return null; };
  D.recordsFor = function (empId) {
    return D.RECORDS.filter(function (r) { return r.emp === empId || (r.group && r.group.indexOf(empId) >= 0); });
  };
  D.DELETED_RECORDS = [
    { id: 'CR-20889', type: 'CT-DISC', emp: 'trevor', by: 'priya', on: 'Tue 2 Sep 2026', site: 'CM-CH', deletedBy: 'grant', deletedOn: 'Wed 3 Sep 2026', reason: 'Recorded against the wrong team member. Reissued as CR-20893.' }
  ];

  /* ---------------- PIP, following the client form ---------------- */
  D.PIP_LEVELS = [
    { key: 'first', name: 'First Counseling', letter: false },
    { key: 'written', name: 'Written Counseling', letter: true },
    { key: 'final', name: 'Final Written Counseling', letter: true },
    { key: 'termination', name: 'Termination', letter: true }
  ];
  D.OFFENSE_TYPES = ['Attendance Issues', 'Violation of Company Policy', 'Substandard Work', 'Safety Violation', 'Lack of Professionalism', 'Other'];
  D.PIP_ACTIVE_MONTHS = 12;
  /* The paper form allows five action items and four reviews. */
  D.PIP_MAX_ACTIONS = 5;
  D.PIP_MAX_REVIEWS = 4;
  D.offenseText = function (x) {
    var list = (x.offenses || []).map(function (o) { return o === 'Other' && x.offenseOther ? 'Other: ' + x.offenseOther : o; });
    return list.length ? list.join(', ') : 'Not stated';
  };
  D.PIPS = [
    { id: 'PIP-412', emp: 'dana', by: 'priya', level: 'written', status: 'Pending approval', site: 'CM-CH',
      offenses: ['Violation of Company Policy', 'Lack of Professionalism'], offenseOther: null, opened: 'Thu 17 Sep 2026', start: 'Mon 21 Sep 2026', end: 'Mon 21 Sep 2027',
      reason: 'Due to ongoing concerns related to policy compliance, you are being placed on a Written Counseling Performance Improvement Plan. Three documented conversations about uniform and name badge have not produced sustained change.',
      evidence: ['CR-20877', 'CR-20904', 'CR-20918'],
      actions: [
        { t: 'Arrive in full uniform with a name badge for every scheduled shift', due: 'Ongoing, reviewed weekly', done: false, aid: null },
        { t: 'Confirm uniform and badge with the charge nurse at the start of each shift for four weeks', due: 'Fri 16 Oct 2026', done: false, aid: null },
        { t: 'Complete the dress code module in the learning system', due: 'Fri 9 Oct 2026', done: false, aid: null }],
      initial: { on: 'Mon 21 Sep 2026', note: null },
      reviews: [{ on: 'Fri 16 Oct 2026', note: null }, { on: 'Fri 20 Nov 2026', note: null }],
      resolution: null, next: 'curtis', employeeComments: null,
      approvals: [
        { who: 'priya', role: 'Initiator, Director of Nursing', state: 'Submitted', on: 'Thu 17 Sep 2026 11:05' },
        { who: 'curtis', role: 'One level above, Executive Director', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR review', state: 'Waiting', on: null }],
      audit: [
        { on: 'Thu 17 Sep 2026 10:48', who: 'priya', what: 'PIP opened at Written Counseling. Three coaching records attached automatically.' },
        { on: 'Thu 17 Sep 2026 11:05', who: 'priya', what: 'Submitted for approval and review.' }] },
    { id: 'PIP-408', emp: 'teodor', by: 'wren', level: 'first', status: 'Active', site: 'CM-SB',
      offenses: ['Attendance Issues'], offenseOther: null, opened: 'Mon 21 Jul 2026', start: 'Mon 28 Jul 2026', end: 'Tue 28 Jul 2027',
      reason: 'Due to ongoing concerns related to attendance, you are being placed on a First Counseling Performance Improvement Plan.',
      evidence: ['CR-20880'],
      actions: [
        { t: 'No unplanned absence for the next ninety days', due: 'Mon 26 Oct 2026', done: false, aid: 'AI-8894' },
        { t: 'Call the charge nurse at least two hours before shift if unable to attend', due: 'Ongoing', done: true, aid: 'AI-8895' },
        { t: 'Complete the outstanding mandatory training modules', due: 'Fri 11 Sep 2026', done: false, aid: 'AI-8940' },
        { t: 'Meet the Director of Nursing every Friday to review the week', due: 'Ongoing, reviewed weekly', done: false, aid: 'AI-8941' }],
      initial: { on: 'Mon 28 Jul 2026', note: 'Reviewed the plan with Teodor. He raised a transport issue; schedule adjusted to the later start.' },
      reviews: [{ on: 'Fri 29 Aug 2026', note: 'No occurrences since the plan started. Transport arrangement holding.' },
                { on: 'Fri 26 Sep 2026', note: null }],
      resolution: null,
      employeeComments: 'I accept the plan. The absences were transport related and the later start has fixed it.',
      approvals: [
        { who: 'wren', role: 'Initiator, Director of Nursing', state: 'Submitted', on: 'Mon 21 Jul 2026 09:30' },
        { who: 'harriet', role: 'One level above, Executive Director', state: 'Approved', on: 'Mon 21 Jul 2026 14:10' },
        { who: 'grant', role: 'HR review', state: 'Approved', on: 'Tue 22 Jul 2026 10:02' }],
      audit: [{ on: 'Tue 22 Jul 2026 10:02', who: 'grant', what: 'Approved by HR.' },
              { on: 'Mon 28 Jul 2026 09:00', who: 'wren', what: 'Activated after the meeting with the employee.' },
              { on: 'Fri 29 Aug 2026 16:20', who: 'wren', what: 'First review recorded.' }] },
    { id: 'PIP-395', emp: 'esther', by: 'simone', level: 'first', status: 'Closed', site: 'CM-MC',
      offenses: ['Substandard Work'], offenseOther: null, opened: 'Mon 12 May 2026', start: 'Mon 19 May 2026', end: 'Tue 19 May 2027',
      reason: 'Documentation not completed before end of shift on repeated occasions.',
      evidence: [], outcome: 'Successfully completed',
      actions: [
        { t: 'Complete all charting before leaving the floor', due: 'Fri 18 Jul 2026', done: true, aid: 'AI-8830' },
        { t: 'Have charting spot-checked on five shifts a month', due: 'Fri 18 Jul 2026', done: true, aid: 'AI-8944' }],
      initial: { on: 'Mon 19 May 2026', note: 'Plan discussed and understood.' },
      reviews: [{ on: 'Fri 20 Jun 2026', note: 'Charting complete on every audited shift.' }],
      resolution: { on: 'Fri 18 Jul 2026', next: 'Successfully completed. No further action.', note: 'Sustained for eight weeks.' },
      employeeComments: null,
      approvals: [{ who: 'simone', role: 'Initiator, Director of Nursing', state: 'Submitted', on: 'Mon 12 May 2026 10:00' },
                  { who: 'grant', role: 'HR review', state: 'Approved', on: 'Tue 13 May 2026 09:15' }],
      audit: [{ on: 'Fri 18 Jul 2026 16:00', who: 'simone', what: 'Closed as successfully completed.' }] },
    { id: 'PIP-380', emp: 'camille', by: 'ivan', level: 'final', status: 'Closed', site: 'CM-LV',
      offenses: ['Attendance Issues'], offenseOther: null, opened: 'Mon 3 Feb 2026', start: 'Mon 10 Feb 2026', end: 'Tue 10 Feb 2027',
      reason: 'Final Written Counseling following two prior counselings on attendance.',
      evidence: [], outcome: 'Advanced to termination',
      actions: [
        { t: 'No unplanned absence for ninety days', due: 'Mon 11 May 2026', done: false, aid: 'AI-8835' },
        { t: 'Meet the Memory Care Director weekly to review attendance', due: 'Ongoing, reviewed weekly', done: false, aid: 'AI-8836' }],
      initial: { on: 'Mon 10 Feb 2026', note: 'Plan discussed.' },
      reviews: [{ on: 'Fri 13 Mar 2026', note: 'One further occurrence on 6 March.' }],
      employeeComments: null,
      resolution: { on: 'Mon 11 May 2026', next: 'Advanced to termination.', note: 'Standard not sustained.' },
      termination: { supervisor: 'ivan', finalDay: 'Mon 11 May 2026', reason: 'Attendance, following a Final Written Counseling.',
        exitBy: 'grant', belongings: 'Badge and keys returned', codes: 'Door codes changed 11 May', access: 'System and email access closed 11 May' },
      approvals: [{ who: 'ivan', role: 'Initiator, Memory Care Director', state: 'Submitted', on: 'Mon 3 Feb 2026 09:00' },
                  { who: 'grant', role: 'HR review', state: 'Approved', on: 'Wed 5 Feb 2026 11:00' }],
      audit: [{ on: 'Mon 11 May 2026 15:00', who: 'grant', what: 'Advanced to termination. File compiled for export.' }] }
  ];
  D.pip = function (id) { for (var i = 0; i < D.PIPS.length; i++) if (D.PIPS[i].id === id) return D.PIPS[i]; return null; };
  D.pipLevel = function (k) { for (var i = 0; i < D.PIP_LEVELS.length; i++) if (D.PIP_LEVELS[i].key === k) return D.PIP_LEVELS[i]; return D.PIP_LEVELS[0]; };

  /* ---------------- annual evaluation, following the client form ---------------- */
  D.EVAL_SCALE = [
    { n: 1, name: 'Below expectations', sub: 'Needs improvement' },
    { n: 2, name: 'Approaching expectations', sub: 'Room for improvement' },
    { n: 3, name: 'Meeting expectations', sub: 'Proficient' },
    { n: 4, name: 'Exceeds expectations', sub: '' }
  ];
  D.EVAL_SECTIONS = [
    { key: 's1', name: 'Understanding of job expectations', qs: [
      'Does the employee understand what the expectations of this role are and what is expected of them to be successful?',
      'Does the employee understand and fulfil the job responsibilities in a timely manner, meeting all deadlines?',
      'Does the employee appropriately take initiative, prioritise responsibilities and apply urgency when necessary?',
      'Does the employee abide by company policies and procedures?',
      'Does the employee accept direction and execute each directive timely and effectively?',
      'Are training and compliance requirements being met?'] },
    { key: 's2', name: 'Communication', qs: [
      'Does the employee communicate professionally and effectively with all employees, residents, families and third parties?',
      'Is the employee professional and respectful in all communications, written and verbal?',
      'Does the employee communicate all pertinent details to the appropriate person within a reasonable timeframe?',
      'Does the employee communicate effectively interdepartmentally?',
      'If applicable, do direct reports feel supported and comfortable raising concerns?'] },
    { key: 's3', name: 'Key performance indicators', kpi: true, qs: [] },
    { key: 's4', name: 'Core company competency', qs: [
      'Does the employee exercise actions that align with the mission and vision?',
      'Does the employee focus on the development of direct reports and collaborate effectively?',
      'Does the employee lead by example, representing the company positively and professionally?'] },
    { key: 's5', name: 'Developmental opportunities', dev: true, qs: [] }
  ];
  D.EVAL_MAX = { year1: 68, year2: 72 };
  D.EVAL_KPI_COUNT = { year1: 3, year2: 4 };
  D.EVALUATIONS = [
    { id: 'EV-2026-041', emp: 'lorna', by: 'priya', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Fri 5 Sep 2026',
      years: 2, scores: { s1: [4, 3, 4, 4, 3, 4], s2: [4, 4, 3, 3, 3], s4: [4, 3, 4] },
      kpis: [{ t: 'Call light response within standard', v: 4 }, { t: 'Charting complete before end of shift', v: 4 }, { t: 'Mandatory training current', v: 3 }, { t: 'Attendance', v: 4 }],
      dev: [{ t: 'Lead the clinical team huddle once a month', how: 'Observed by the Director of Nursing' },
            { t: 'Complete the medication technician pathway', how: 'Certificate on file by March' },
            { t: 'Mentor one new hire through their first thirty days', how: 'New hire retained at day 30' }],
      priorDev: 'Last year: complete dementia training, achieved.', selfEval: true,
      comments: 'Happy with the plan. Would like more memory care hours.', total: 65, ack: 'Fri 5 Sep 2026' },
    { id: 'EV-2026-052', emp: 'dana', by: 'priya', site: 'CM-CH', cycle: 'FY 2026', status: 'In progress', reviewDate: 'Fri 25 Sep 2026',
      years: 1, scores: { s1: [3, 3, 2, 1, 3, 3], s2: [3, 3, 2, null, null], s4: [3, null, 2] },
      kpis: [{ t: 'Call light response within standard', v: 2 }, { t: 'Charting complete before end of shift', v: 2 }, { t: 'Uniform and badge compliance', v: 1 }],
      dev: [], priorDev: '', selfEval: false, comments: '', total: null, ack: null },
    { id: 'EV-2026-033', emp: 'priya', by: 'curtis', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Mon 18 Aug 2026',
      years: 2, scores: { s1: [4, 3, 3, 4, 4, 3], s2: [4, 4, 4, 3, 4], s4: [4, 3, 4] },
      kpis: [{ t: 'Clinical survey readiness', v: 3 }, { t: 'Agency hours against budget', v: 2 }, { t: 'Team retention at ninety days', v: 3 }, { t: 'Documentation completion', v: 4 }],
      dev: [{ t: 'Reduce agency use below 8%', how: 'Monthly review with the Executive Director' },
            { t: 'Build a charge nurse bench of two', how: 'Two named and in the pathway by January' },
            { t: 'Document every clinical team meeting', how: 'Records visible in skyPerformance' }],
      priorDev: 'Last year: complete the leadership pathway, achieved.', selfEval: true,
      comments: '', total: 63, ack: 'Mon 18 Aug 2026' }
  ];
  D.evaluation = function (id) { for (var i = 0; i < D.EVALUATIONS.length; i++) if (D.EVALUATIONS[i].id === id) return D.EVALUATIONS[i]; return null; };

  /* ---------------- site visits ---------------- */
  D.VISIT_SCALE = [
    { n: 2, label: 'Meets or exceeds standards' },
    { n: 1, label: 'Improved, not yet meeting standards' },
    { n: 0, label: 'No improvement, needs immediate attention' }
  ];
  D.VISITS = [
    { id: 'SV-1182', site: 'CM-CH', by: 'alexis', ed: 'curtis', date: 'Fri 18 Sep 2026', reviewMonth: 'September', status: 'In progress',
      answered: 57, total: 172, score: null, priorDate: 'Tue 4 Aug 2026', photos: 3, findings: 4, started: '09:05' },
    { id: 'SV-1176', site: 'CM-MC', by: 'alexis', ed: 'ruben', date: 'Thu 4 Sep 2026', reviewMonth: 'September', status: 'Complete',
      answered: 172, total: 172, score: 92, priorDate: 'Wed 6 Aug 2026', photos: 11, findings: 6 },
    { id: 'SV-1164', site: 'CM-CH', by: 'alexis', ed: 'curtis', date: 'Tue 4 Aug 2026', reviewMonth: 'August', status: 'Complete',
      answered: 172, total: 172, score: 81, priorDate: 'Mon 7 Jul 2026', photos: 14, findings: 12 },
    { id: 'SV-1158', site: 'CM-SB', by: 'dominic', ed: 'harriet', date: 'Tue 22 Jul 2026', reviewMonth: 'July', status: 'Complete',
      answered: 172, total: 172, score: 78, priorDate: 'Thu 19 Jun 2026', photos: 9, findings: 15 },
    { id: 'SV-1190', site: 'CM-LV', by: 'alexis', ed: 'bernadette', date: 'Fri 26 Sep 2026', reviewMonth: 'September', status: 'Scheduled',
      answered: 0, total: 172, score: null, priorDate: 'Fri 22 Aug 2026', photos: 0, findings: 0 }
  ];
  D.visit = function (id) { for (var i = 0; i < D.VISITS.length; i++) if (D.VISITS[i].id === id) return D.VISITS[i]; return null; };

  /* ---------------- action items and to-dos ---------------- */
  D.ACTIONS = [
    { id: 'AI-8851', t: 'Water temperature out of range at the east wing sink. Log it and repair.', owner: 'oscar', by: 'alexis',
      from: 'SV-1164', fromKind: 'visit', due: 'Fri 8 Aug 2026', status: 'Closed', site: 'CM-CH', closedOn: 'Wed 6 Aug 2026',
      notes: [{ on: 'Wed 6 Aug', by: 'oscar', t: 'Mixing valve replaced, retested at 43 C.' }] },
    { id: 'AI-8852', t: 'Agency use above 10% for four months. Build a staffing plan with HR.', owner: 'curtis', by: 'alexis',
      from: 'SV-1164', fromKind: 'visit', due: 'Fri 19 Sep 2026', status: 'Overdue', site: 'CM-CH',
      notes: [{ on: 'Mon 1 Sep', by: 'curtis', t: 'Two internal hires start 22 Sep. Plan drafted, not yet agreed with HR.' }] },
    { id: 'AI-8853', t: 'Survey binder missing the last two QAPI minutes.', owner: 'curtis', by: 'alexis',
      from: 'SV-1164', fromKind: 'visit', due: 'Mon 18 Aug 2026', status: 'Closed', site: 'CM-CH', closedOn: 'Fri 15 Aug 2026', notes: [] },
    { id: 'AI-8870', t: 'Creativity boxes below the fifteen minimum. Restock and log.', owner: 'yolanda', by: 'alexis',
      from: 'SV-1182', fromKind: 'visit', due: 'Fri 2 Oct 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8871', t: 'Dining room tables not set to standard at lunch. Reset and audit for two weeks.', owner: 'imani', by: 'alexis',
      from: 'SV-1182', fromKind: 'visit', due: 'Fri 25 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8872', t: 'Last three fire drills not documented. Complete and file.', owner: 'oscar', by: 'alexis',
      from: 'SV-1182', fromKind: 'visit', due: 'Fri 25 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8873', t: 'Incident reports not reaching the Regional within 24 hours. Review the process with the leadership team.',
      owner: 'curtis', by: 'alexis', from: 'SV-1182', fromKind: 'visit', due: 'Fri 25 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8894', t: 'No unplanned absence for the next ninety days', owner: 'teodor', by: 'wren',
      from: 'PIP-408', fromKind: 'pip', due: 'Mon 26 Oct 2026', status: 'Open', site: 'CM-SB', notes: [] },
    { id: 'AI-8895', t: 'Call the charge nurse at least two hours before shift if unable to attend', owner: 'teodor', by: 'wren',
      from: 'PIP-408', fromKind: 'pip', due: 'Ongoing', status: 'Closed', site: 'CM-SB', closedOn: 'Fri 29 Aug 2026',
      notes: [{ on: 'Fri 29 Aug', by: 'teodor', t: 'Called ahead on both occasions since the plan started.' }] },
    { id: 'AI-8830', t: 'Complete all charting before leaving the floor', owner: 'esther', by: 'simone',
      from: 'PIP-395', fromKind: 'pip', due: 'Fri 18 Jul 2026', status: 'Closed', site: 'CM-MC', closedOn: 'Wed 16 Jul 2026', notes: [] },
    { id: 'AI-8885', t: 'Complete the medication technician pathway.', owner: 'lorna', by: 'priya',
      from: 'EV-2026-041', fromKind: 'eval', due: 'Fri 27 Mar 2027', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8886', t: 'Lead the clinical team huddle once a month.', owner: 'lorna', by: 'priya',
      from: 'EV-2026-041', fromKind: 'eval', due: 'Ongoing', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8890', t: 'Reduce agency use below 8%.', owner: 'priya', by: 'curtis',
      from: 'EV-2026-033', fromKind: 'eval', due: 'Fri 31 Jul 2027', status: 'Open', site: 'CM-CH', notes: [] }
  ];
  D.action = function (id) { for (var i = 0; i < D.ACTIONS.length; i++) if (D.ACTIONS[i].id === id) return D.ACTIONS[i]; return null; };

  /* ---------------- retention and the system of record ---------------- */
  D.EXPORT_LOG = [
    { what: 'Employee file', by: 'grant', subject: 'camille', reason: 'Termination, 11 May 2026. One-time export.', on: 'Mon 11 May 2026 16:20' },
    { what: 'Employee file', by: 'grant', subject: 'esther', reason: 'Unemployment claim response', on: 'Thu 3 Sep 2026 11:20' }
  ];
  D.SYNC_FIELDS = ['Reporting line', 'Job title', 'Community', 'Department', 'Start date', 'Employment status'];
  D.RETENTION = [
    { what: 'Coaching records', keep: 'Held while the employee is active', then: 'Exported with the file on termination' },
    { what: 'PIPs and evaluations', keep: 'Held while the employee is active', then: 'Exported with the file, and written to the employee file during the plan' },
    { what: 'Site visits', keep: 'Held against the community and the Executive Director', then: 'Retained, not part of a personal export' },
    { what: 'Terminated employee file', keep: 'Retention period to be confirmed', then: 'One-time export, then searchable by name for the retention period' }
  ];
  D.TO_SYSTEM_OF_RECORD = [
    { what: 'Recognition', go: false }, { what: 'Coaching discussion', go: false },
    { what: 'Policy and procedure', go: false }, { what: 'Team meeting', go: false },
    { what: 'Annual evaluation', go: true }, { what: 'PIP, any level', go: true },
    { what: 'Termination detail', go: true }, { what: 'Site visit', go: false }
  ];

  /* ---------------- notifications ---------------- */
  D.NOTIFS = {
    employee: [
      { t: 'Priya Raghavan documented a coaching discussion about you', time: '2h', ic: 'message-square-text', go: '#/mycoaching', unread: true },
      { t: 'A Performance Improvement Plan is pending approval on your record', time: '1d', ic: 'clipboard-check', go: '#/mypip', unread: true },
      { t: 'Your annual evaluation is scheduled for 25 September', time: '3d', ic: 'clipboard-list', go: '#/myfile', unread: false }
    ],
    dept: [
      { t: 'PIP-412 is with the Executive Director for approval', time: '4h', ic: 'clipboard-check', go: '#/pips/PIP-412', unread: true },
      { t: 'Dana Whitfield acknowledged your coaching record', time: '6h', ic: 'circle-check', go: '#/coaching', unread: true },
      { t: 'Annual evaluation for Dana Whitfield is due 25 September', time: '2d', ic: 'clipboard-list', go: '#/evaluations', unread: false }
    ],
    ed: [
      { t: 'Alexis Moreau is on site now, site visit in progress', time: '1h', ic: 'building-2', go: '#/visits/SV-1182', unread: true },
      { t: '4 action items assigned to you from the August site visit', time: '1d', ic: 'list-checks', go: '#/todos', unread: true },
      { t: 'PIP-412 needs your approval', time: '4h', ic: 'gavel', go: '#/pips/PIP-412', unread: true }
    ],
    regional: [
      { t: 'Cedar Hollow site visit is 57 of 172 answered', time: '1h', ic: 'building-2', go: '#/visits/SV-1182', unread: true },
      { t: 'Lakeview Manor visit is due 26 September', time: '2d', ic: 'calendar', go: '#/visits', unread: false }
    ],
    hr: [
      { t: 'PIP-412 reaches you after the Executive Director approves', time: '4h', ic: 'clipboard-check', go: '#/pips/PIP-412', unread: true },
      { t: 'Retention period for terminated files is still unset', time: '1d', ic: 'triangle-alert', go: '#/settings/retention', unread: true },
      { t: 'One record was deleted this month', time: '6d', ic: 'trash-2', go: '#/records/deleted', unread: false }
    ]
  };

  /* ================================================================
     More sample data, so every role opens on a populated screen.
     Same shapes as above; nothing here changes behaviour.
     ================================================================ */

  /* ---- documented conversations, spread across communities and types ---- */
  D.RECORDS.push(
    /* Cedar Hollow, clinical (Priya) */
    C({ id: 'CR-20790', type: 'CT-DISC', emp: 'dana', by: 'priya', on: 'Tue 17 Feb 2026', at: '08:15', site: 'CM-CH', dept: 'Clinical',
      topic: 'Unplanned absence, third in sixty days',
      text: 'Third unplanned absence since December, twice without calling ahead. Went through the attendance policy and the effect on the floor.',
      ack: 'Tue 17 Feb 2026 16:40', attachments: [] }),
    C({ id: 'CR-20938', type: 'CT-POL', emp: 'dana', by: 'priya', on: 'Wed 16 Sep 2026', at: '13:10', site: 'CM-CH', dept: 'Clinical',
      topic: 'Break returns running over',
      text: 'Back on the floor fifteen minutes late from break twice this week. Went through the break policy and the cover arrangement.',
      ack: null, attachments: [] }),
    C({ id: 'CR-20937', type: 'CT-REC', emp: 'dana', by: 'priya', on: 'Wed 2 Sep 2026', at: '19:30', site: 'CM-CH', dept: 'Clinical',
      topic: 'Stayed with a distressed resident',
      text: 'Stayed past the end of shift with a resident whose family had not arrived, and handed over properly when they did. The family asked for her by name the next day.',
      ack: 'Thu 3 Sep 2026 08:15', attachments: [] }),
    C({ id: 'CR-20931', type: 'CT-REC', emp: 'marisol', by: 'priya', on: 'Tue 15 Sep 2026', at: '14:20', site: 'CM-CH', dept: 'Clinical',
      topic: 'Caught a medication discrepancy',
      text: 'Spotted a dose that did not match the order and stopped before administering. Called the pharmacy and the physician. Exactly right.',
      ack: 'Tue 15 Sep 2026 18:05', attachments: [] }),
    C({ id: 'CR-20928', type: 'CT-DISC', emp: 'trevor', by: 'priya', on: 'Mon 14 Sep 2026', at: '08:40', site: 'CM-CH', dept: 'Clinical',
      topic: 'Charting left until the end of shift',
      text: 'Third shift this month where charting was completed after handover. Walked through the expectation to chart at the point of care.',
      ack: null, attachments: [] }),
    C({ id: 'CR-20925', type: 'CT-POL', emp: 'nadia', by: 'priya', on: 'Thu 10 Sep 2026', at: '11:15', site: 'CM-CH', dept: 'Clinical',
      topic: 'Phone use on the floor',
      text: 'Reviewed the personal device policy. Agreed phones stay in the locker except on break.',
      ack: 'Thu 10 Sep 2026 16:40', attachments: [] }),
    C({ id: 'CR-20921', type: 'CT-REC', emp: 'lorna', by: 'priya', on: 'Fri 4 Sep 2026', at: '16:00', site: 'CM-CH', dept: 'Clinical',
      topic: 'Covered two open shifts',
      text: 'Picked up both weekend shifts at short notice and still finished her own charting. The floor ran without agency.',
      ack: 'Fri 4 Sep 2026 17:10', attachments: [] }),
    C({ id: 'CR-20915', type: 'CT-DISC', emp: 'marisol', by: 'priya', on: 'Wed 26 Aug 2026', at: '09:30', site: 'CM-CH', dept: 'Clinical',
      topic: 'Handover missed two residents',
      text: 'Two residents with condition changes were not passed on at handover. Agreed to use the written handover sheet every shift.',
      ack: 'Wed 26 Aug 2026 15:00', attachments: [] }),
    C({ id: 'CR-20908', type: 'CT-TEAM', emp: 'priya', by: 'priya', on: 'Tue 12 Aug 2026', at: '07:30', site: 'CM-CH', dept: 'Clinical',
      group: ['dana', 'lorna', 'trevor', 'marisol', 'nadia'],
      topic: 'Clinical team meeting: falls and handover',
      text: 'Reviewed the three falls last month, the new handover sheet, and the October training dates. Questions on agency cover answered.',
      ack: null, attachments: [] }),

    /* Cedar Hollow, other departments */
    C({ id: 'CR-20927', type: 'CT-REC', emp: 'devon', by: 'imani', on: 'Fri 11 Sep 2026', at: '13:05', site: 'CM-CH', dept: 'Dining',
      topic: 'Family compliment at the Sunday service',
      text: 'A family wrote in about how he handled a difficult dietary request without making a fuss of it. Passed on at stand-up.',
      ack: 'Fri 11 Sep 2026 19:00', attachments: [] }),
    C({ id: 'CR-20936', type: 'CT-DISC', emp: 'halle', by: 'oscar', on: 'Mon 7 Sep 2026', at: '10:00', site: 'CM-CH', dept: 'Housekeeping',
      topic: 'Cart left unlocked on the corridor',
      text: 'Second time this month a housekeeping cart with chemicals was left unattended. Reviewed why this one is not negotiable.',
      ack: 'Mon 7 Sep 2026 14:30', attachments: [] }),
    C({ id: 'CR-20933', type: 'CT-DISC', emp: 'yolanda', by: 'curtis', on: 'Thu 20 Aug 2026', at: '15:40', site: 'CM-CH', dept: 'Life Enrichment',
      topic: 'Calendar not matching what is running',
      text: 'Residents arriving for activities that had moved. Agreed the calendar is updated by Friday for the following week.',
      ack: 'Thu 20 Aug 2026 17:20', attachments: [] }),
    C({ id: 'CR-20906', type: 'CT-REC', emp: 'imani', by: 'curtis', on: 'Fri 7 Aug 2026', at: '11:00', site: 'CM-CH', dept: 'Dining',
      topic: 'Food cost back within budget',
      text: 'Third month running inside budget without a drop in the satisfaction scores. Menu changes worked.',
      ack: 'Fri 7 Aug 2026 12:15', attachments: [] }),
    C({ id: 'CR-20898', type: 'CT-POL', emp: 'oscar', by: 'curtis', on: 'Tue 21 Jul 2026', at: '09:00', site: 'CM-CH', dept: 'Maintenance',
      topic: 'Work order sign-off',
      text: 'Reviewed the requirement to close work orders in the system on the day, not weekly in a batch.',
      ack: 'Tue 21 Jul 2026 16:00', attachments: [] }),

    /* Maple Court */
    C({ id: 'CR-20934', type: 'CT-DISC', emp: 'kai', by: 'simone', on: 'Mon 14 Sep 2026', at: '07:50', site: 'CM-MC', dept: 'Clinical',
      topic: 'Late for three shifts',
      text: 'Arrived after handover three times in two weeks. Discussed the effect on the outgoing shift and agreed a plan.',
      ack: null, attachments: [] }),
    C({ id: 'CR-20922', type: 'CT-REC', emp: 'esther', by: 'simone', on: 'Mon 7 Sep 2026', at: '12:00', site: 'CM-MC', dept: 'Clinical',
      topic: 'Charting sustained since the plan closed',
      text: 'Every audited shift complete since May. Told her so, and put it on the file.',
      ack: 'Mon 7 Sep 2026 16:30', attachments: [] }),
    C({ id: 'CR-20910', type: 'CT-TEAM', emp: 'ruben', by: 'ruben', on: 'Mon 10 Aug 2026', at: '08:00', site: 'CM-MC', dept: 'Operations',
      group: ['simone', 'kai', 'esther'],
      topic: 'All-community meeting: survey preparation',
      text: 'Walked the team through the survey window, the binder, and who does what on the day.',
      ack: null, attachments: [] }),

    /* Lakeview Manor */
    C({ id: 'CR-20935', type: 'CT-POL', emp: 'camille', by: 'ivan', on: 'Wed 9 Sep 2026', at: '10:20', site: 'CM-LV', dept: 'Memory Care',
      topic: 'Door code shared with a colleague',
      text: 'Reviewed the access policy. Codes are individual and are not passed on, including to cover a shift.',
      ack: 'Wed 9 Sep 2026 15:10', attachments: [] }),
    C({ id: 'CR-20903', type: 'CT-REC', emp: 'ivan', by: 'bernadette', on: 'Fri 31 Jul 2026', at: '14:00', site: 'CM-LV', dept: 'Memory Care',
      topic: 'Elopement drill run properly',
      text: 'First drill under the new procedure, finished inside the target time with the whole team accounted for.',
      ack: 'Fri 31 Jul 2026 15:45', attachments: [] }),

    /* Stonebridge Place and Willow Crossing */
    C({ id: 'CR-20929', type: 'CT-DISC', emp: 'junie', by: 'jonah', on: 'Fri 11 Sep 2026', at: '16:10', site: 'CM-WC', dept: 'Business Office',
      topic: 'Aged debt not worked for three weeks',
      text: 'The ageing report has not moved since August. Went through the collection steps and the escalation point.',
      ack: null, attachments: [] }),
    C({ id: 'CR-20920', type: 'CT-REC', emp: 'teodor', by: 'wren', on: 'Fri 29 Aug 2026', at: '17:00', site: 'CM-SB', dept: 'Clinical',
      topic: 'No occurrences since the plan started',
      text: 'Called ahead on both occasions he could not attend and has not missed a shift since July. Recognised at stand-up.',
      ack: 'Fri 29 Aug 2026 18:20', attachments: [] }),
    C({ id: 'CR-20901', type: 'CT-POL', emp: 'wren', by: 'harriet', on: 'Mon 27 Jul 2026', at: '09:15', site: 'CM-SB', dept: 'Clinical',
      topic: 'Incident reporting timeline',
      text: 'Two incidents reached the Regional outside twenty four hours. Reviewed the reporting chain and the deadline.',
      ack: 'Mon 27 Jul 2026 11:00', attachments: [] }),

    /* Executive Directors, documented by their Regional */
    C({ id: 'CR-20924', type: 'CT-DISC', emp: 'bernadette', by: 'alexis', on: 'Tue 8 Sep 2026', at: '11:30', site: 'CM-LV', dept: 'Operations',
      topic: 'Agency spend above plan for a third month',
      text: 'Went through the staffing plan line by line. Two internal hires start in October; agreed a weekly check until agency is inside budget.',
      ack: 'Tue 8 Sep 2026 17:00', attachments: [] }),
    C({ id: 'CR-20913', type: 'CT-REC', emp: 'ruben', by: 'alexis', on: 'Fri 21 Aug 2026', at: '10:00', site: 'CM-MC', dept: 'Operations',
      topic: 'Best visit score in the region',
      text: '92% on the September walk-through with no zeros in clinical or culinary. The standard the others should look at.',
      ack: 'Fri 21 Aug 2026 13:30', attachments: [] }),
    C({ id: 'CR-20905', type: 'CT-DISC', emp: 'jonah', by: 'dominic', on: 'Wed 5 Aug 2026', at: '13:00', site: 'CM-WC', dept: 'Operations',
      topic: 'Occupancy below budget for two quarters',
      text: 'Reviewed the pipeline, the tour conversion and the reasons for lost leads. Sales plan due at the end of the month.',
      ack: 'Wed 5 Aug 2026 16:00', attachments: [] })
  );

  /* ---- more evaluations, including one below the threshold ---- */
  D.EVALUATIONS.push(
    { id: 'EV-2026-058', emp: 'trevor', by: 'priya', site: 'CM-CH', cycle: 'FY 2026', status: 'In progress', reviewDate: 'Fri 2 Oct 2026',
      years: 1, scores: { s1: [3, 2, 3, 3, null, null], s2: [3, 3, null, null, null], s4: [null, null, null] },
      kpis: [{ t: 'Charting complete before end of shift', v: 2 }, { t: 'Call light response within standard', v: 3 }, { t: 'Attendance', v: 3 }],
      dev: [], priorDev: '', selfEval: false, comments: '', total: null, ack: null },
    { id: 'EV-2026-047', emp: 'marisol', by: 'priya', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Fri 28 Aug 2026',
      years: 2, scores: { s1: [4, 4, 3, 4, 4, 4], s2: [3, 4, 3, 3, 4], s4: [4, 4, 3] },
      kpis: [{ t: 'Medication pass accuracy', v: 4 }, { t: 'Charting complete before end of shift', v: 3 }, { t: 'Mandatory training current', v: 4 }, { t: 'Attendance', v: 3 }],
      dev: [{ t: 'Train two colleagues on the medication cart audit', how: 'Both signed off by December' },
            { t: 'Take the charge nurse pathway', how: 'Enrolled by November, first module by January' },
            { t: 'Run one clinical huddle a month', how: 'Observed by the Director of Nursing' }],
      priorDev: 'Last year: lead the medication audit, achieved.', selfEval: true,
      comments: 'Would like more hours on the memory care side.', total: 67, ack: 'Fri 28 Aug 2026' },
    { id: 'EV-2026-044', emp: 'devon', by: 'imani', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Thu 13 Aug 2026',
      years: 1, scores: { s1: [3, 4, 3, 4, 3, 3], s2: [4, 4, 3, 3, 4], s4: [3, 4, 3] },
      kpis: [{ t: 'Service times within standard', v: 3 }, { t: 'Special diet accuracy', v: 4 }, { t: 'Attendance', v: 4 }],
      dev: [{ t: 'Learn the special diet board end to end', how: 'Cover the board unaided for a week in November' },
            { t: 'Shadow the cook for four shifts', how: 'Four shifts logged by January' },
            { t: 'Take the food safety refresher', how: 'Certificate on file by February' }],
      priorDev: 'First full year in role.', selfEval: true, comments: '', total: 58, ack: 'Thu 13 Aug 2026' },
    { id: 'EV-2026-039', emp: 'imani', by: 'curtis', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Tue 11 Aug 2026',
      years: 2, scores: { s1: [4, 4, 4, 3, 4, 4], s2: [4, 3, 4, 4, 4], s4: [4, 4, 4] },
      kpis: [{ t: 'Food cost against budget', v: 4 }, { t: 'Dining satisfaction score', v: 4 }, { t: 'Health inspection findings', v: 4 }, { t: 'Team retention at ninety days', v: 3 }],
      dev: [{ t: 'Build a cook bench of two', how: 'Two named and trained by March' },
            { t: 'Take the culinary leadership pathway', how: 'Enrolled by December' },
            { t: 'Run the dining committee without support', how: 'Three consecutive meetings by February' }],
      priorDev: 'Last year: bring food cost inside budget, achieved.', selfEval: true, comments: '', total: 70, ack: 'Tue 11 Aug 2026' },
    { id: 'EV-2026-029', emp: 'curtis', by: 'alexis', site: 'CM-CH', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Fri 24 Jul 2026',
      years: 2, scores: { s1: [4, 3, 4, 3, 4, 3], s2: [4, 4, 3, 4, 3], s4: [4, 3, 3] },
      kpis: [{ t: 'Occupancy against budget', v: 3 }, { t: 'NOI against budget', v: 3 }, { t: 'Site visit score', v: 3 }, { t: 'Team retention at ninety days', v: 2 }],
      dev: [{ t: 'Bring agency use below 8% by March', how: 'Monthly review with the Regional' },
            { t: 'Document every department head conversation', how: 'Records visible in skyPerformance' },
            { t: 'Close site visit actions inside thirty days', how: 'Measured on the next three visits' }],
      priorDev: 'Last year: complete the Executive Director pathway, achieved.', selfEval: true,
      comments: 'Retention is the one I want help with.', total: 61, ack: 'Fri 24 Jul 2026' },
    { id: 'EV-2026-021', emp: 'teodor', by: 'wren', site: 'CM-SB', cycle: 'FY 2026', status: 'Complete', reviewDate: 'Fri 10 Jul 2026',
      years: 2, scores: { s1: [2, 2, 3, 2, 2, 2], s2: [2, 3, 2, 2, 2], s4: [2, 2, 3] },
      kpis: [{ t: 'Attendance', v: 1 }, { t: 'Charting complete before end of shift', v: 2 }, { t: 'Mandatory training current', v: 3 }, { t: 'Call light response within standard', v: 2 }],
      dev: [{ t: 'No unplanned absence for ninety days', how: 'Reviewed weekly with the Director of Nursing' },
            { t: 'Complete the outstanding mandatory training', how: 'All modules current by September' },
            { t: 'Charting complete before leaving the floor', how: 'Audited on five shifts a month' }],
      priorDev: 'Last year: attendance, not achieved.', selfEval: false,
      comments: 'Transport has been the problem. The later start helps.', total: 34, ack: 'Fri 10 Jul 2026' }
  );

  /* ---- more improvement plans, at every level and across communities ---- */
  D.PIPS.push(
    { id: 'PIP-405', emp: 'dana', by: 'priya', level: 'first', status: 'Active', site: 'CM-CH',
      offenses: ['Attendance Issues'], offenseOther: null, opened: 'Mon 9 Mar 2026', start: 'Mon 16 Mar 2026', end: 'Tue 16 Mar 2027',
      reason: 'Due to ongoing concerns related to attendance, you are being placed on a First Counseling Performance Improvement Plan. Three unplanned absences in sixty days, twice without calling ahead.',
      evidence: ['CR-20790'],
      actions: [
        { t: 'No unplanned absence for the next ninety days', due: 'Mon 15 Jun 2026', done: true, aid: 'AI-8820' },
        { t: 'Call the charge nurse at least two hours before shift if unable to attend', due: 'Ongoing', done: false, aid: 'AI-8821' },
        { t: 'Meet the Director of Nursing on the first Friday of each month', due: 'Ongoing, reviewed monthly', done: false, aid: 'AI-8822' }],
      initial: { on: 'Mon 16 Mar 2026', note: 'Plan reviewed with Dana. She raised a bus timetable change; the shift start was moved by thirty minutes.' },
      reviews: [{ on: 'Fri 17 Apr 2026', note: 'No occurrences since the plan started. The later start is working.' },
                { on: 'Fri 19 Jun 2026', note: 'Ninety days clear. Attendance is no longer the concern.' }],
      resolution: null, employeeComments: 'The timetable change was the problem and the later start has fixed it.',
      approvals: [
        { who: 'priya', role: 'Initiator, Director of Nursing', state: 'Submitted', on: 'Mon 9 Mar 2026 09:20' },
        { who: 'curtis', role: 'One level above, Executive Director', state: 'Approved', on: 'Mon 9 Mar 2026 15:00' },
        { who: 'grant', role: 'HR review', state: 'Approved', on: 'Tue 10 Mar 2026 10:30' }],
      audit: [{ on: 'Mon 9 Mar 2026 09:05', who: 'priya', what: 'Plan opened at First Counseling. One coaching record attached automatically.' },
              { on: 'Tue 10 Mar 2026 10:30', who: 'grant', what: 'Approved by HR.' },
              { on: 'Mon 16 Mar 2026 08:00', who: 'priya', what: 'Activated after the meeting with the employee. Signatures captured.' },
              { on: 'Mon 16 Mar 2026 08:00', who: 'priya', what: '3 action items sent to Dana Whitfield\u2019s to-do list.' },
              { on: 'Fri 19 Jun 2026 16:10', who: 'priya', what: 'Second review recorded.' }] },
    { id: 'PIP-418', emp: 'kai', by: 'simone', level: 'first', status: 'Active', site: 'CM-MC',
      offenses: ['Attendance Issues'], offenseOther: null, opened: 'Mon 14 Sep 2026', start: 'Fri 18 Sep 2026', end: 'Sat 18 Sep 2027',
      reason: 'Arrived after handover on three occasions in two weeks. A First Counseling plan is in place to establish reliable attendance.',
      evidence: ['CR-20934'],
      actions: [
        { t: 'Arrive and be ready on the floor before handover for every scheduled shift', due: 'Ongoing, reviewed weekly', done: false, aid: 'AI-8896' },
        { t: 'Call the Director of Nursing at least two hours ahead if unable to attend', due: 'Ongoing', done: false, aid: 'AI-8897' },
        { t: 'Complete the attendance and punctuality module', due: 'Fri 2 Oct 2026', done: false, aid: 'AI-8942' }],
      initial: { on: 'Fri 18 Sep 2026', note: 'Plan discussed. Kai raised a childcare handover clash on Mondays; start time adjusted.' },
      reviews: [{ on: 'Fri 16 Oct 2026', note: null }, { on: 'Fri 20 Nov 2026', note: null }],
      resolution: null, employeeComments: null,
      approvals: [
        { who: 'simone', role: 'Initiator, Director of Nursing', state: 'Submitted', on: 'Mon 14 Sep 2026 10:15' },
        { who: 'ruben', role: 'One level above, Executive Director', state: 'Approved', on: 'Mon 14 Sep 2026 16:40' },
        { who: 'grant', role: 'HR review', state: 'Approved', on: 'Tue 15 Sep 2026 09:20' }],
      audit: [{ on: 'Mon 14 Sep 2026 10:15', who: 'simone', what: 'Plan opened at First Counseling. One coaching record attached automatically.' },
              { on: 'Tue 15 Sep 2026 09:20', who: 'grant', what: 'Approved by HR.' },
              { on: 'Fri 18 Sep 2026 08:30', who: 'simone', what: 'Activated after the meeting with the employee. Signatures captured.' },
              { on: 'Fri 18 Sep 2026 08:30', who: 'simone', what: '2 action items sent to Kai Thornbury’s to-do list.' }] },
    { id: 'PIP-417', emp: 'junie', by: 'jonah', level: 'written', status: 'Pending approval', site: 'CM-WC',
      offenses: ['Substandard Work'], offenseOther: null, opened: 'Tue 15 Sep 2026', start: 'Mon 21 Sep 2026', end: 'Tue 21 Sep 2027',
      reason: 'The accounts receivable ageing report has not been worked since August and delinquent accounts are outside protocol. A Written Counseling plan follows a documented conversation on the same subject.',
      evidence: ['CR-20929'],
      actions: [
        { t: 'Work the ageing report weekly and record the collection steps taken', due: 'Ongoing, reviewed weekly', done: false, aid: null },
        { t: 'Bring accounts over ninety days below five per cent of the ledger', due: 'Fri 30 Oct 2026', done: false, aid: null }],
      initial: { on: 'Mon 21 Sep 2026', note: null },
      reviews: [{ on: 'Fri 23 Oct 2026', note: null }, { on: 'Fri 20 Nov 2026', note: null }],
      resolution: null, next: 'dominic', employeeComments: null,
      approvals: [
        { who: 'jonah', role: 'Initiator, Executive Director', state: 'Submitted', on: 'Tue 15 Sep 2026 14:05' },
        { who: 'dominic', role: 'One level above, Regional Director of Operations', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR review', state: 'Waiting', on: null }],
      audit: [{ on: 'Tue 15 Sep 2026 13:50', who: 'jonah', what: 'Plan opened at Written Counseling. One coaching record attached automatically.' },
              { on: 'Tue 15 Sep 2026 14:05', who: 'jonah', what: 'Submitted for approval and review.' }] },
    { id: 'PIP-401', emp: 'halle', by: 'oscar', level: 'first', status: 'Closed', site: 'CM-CH',
      offenses: ['Safety Violation'], offenseOther: null, opened: 'Mon 15 Jun 2026', start: 'Mon 22 Jun 2026', end: 'Tue 22 Jun 2027',
      reason: 'Housekeeping cart with chemicals left unattended on a resident corridor.',
      evidence: [], outcome: 'Extended',
      actions: [
        { t: 'Cart locked and stored whenever it is out of sight', due: 'Ongoing, reviewed weekly', done: true, aid: 'AI-8832' },
        { t: 'Complete the chemical safety refresher', due: 'Fri 24 Jul 2026', done: true, aid: 'AI-8943' }],
      initial: { on: 'Mon 22 Jun 2026', note: 'Plan discussed and understood.' },
      reviews: [{ on: 'Fri 24 Jul 2026', note: 'No further occurrences on any audited round.' },
                { on: 'Fri 21 Aug 2026', note: 'One cart found unlocked on 18 August. Plan extended rather than advanced.' }],
      resolution: { on: 'Fri 28 Aug 2026', next: 'Extended', note: 'Extended by sixty days after a further occurrence in August.' },
      employeeComments: 'I understand. The cart was out of sight for a minute while I answered a call bell, but I know that is not the standard.',
      approvals: [{ who: 'oscar', role: 'Initiator, Maintenance Director', state: 'Submitted', on: 'Mon 15 Jun 2026 09:00' },
                  { who: 'curtis', role: 'One level above, Executive Director', state: 'Approved', on: 'Mon 15 Jun 2026 15:30' },
                  { who: 'grant', role: 'HR review', state: 'Approved', on: 'Tue 16 Jun 2026 10:00' }],
      audit: [{ on: 'Tue 16 Jun 2026 10:00', who: 'grant', what: 'Approved by HR.' },
              { on: 'Mon 22 Jun 2026 08:00', who: 'oscar', what: 'Activated after the meeting with the employee.' },
              { on: 'Fri 28 Aug 2026 16:00', who: 'oscar', what: 'Closed as extended.' }] }
  );

  /* ---- action items, so every role has a list of its own ---- */
  D.ACTIONS.push(
    /* from the new plans */
    { id: 'AI-8820', t: 'No unplanned absence for the next ninety days', owner: 'dana', by: 'priya',
      from: 'PIP-405', fromKind: 'pip', due: 'Mon 15 Jun 2026', status: 'Closed', site: 'CM-CH', closedOn: 'Mon 15 Jun 2026',
      notes: [{ on: 'Mon 15 Jun', by: 'priya', t: 'Ninety days clear. Ticked off on the plan at the June review.' }] },
    { id: 'AI-8821', t: 'Call the charge nurse at least two hours before shift if unable to attend', owner: 'dana', by: 'priya',
      from: 'PIP-405', fromKind: 'pip', due: 'Ongoing', status: 'Open', site: 'CM-CH',
      notes: [{ on: 'Tue 4 Aug', by: 'dana', t: 'Called ahead on the one occasion I could not attend.' }] },
    { id: 'AI-8822', t: 'Meet the Director of Nursing on the first Friday of each month', owner: 'dana', by: 'priya',
      from: 'PIP-405', fromKind: 'pip', due: 'Ongoing, reviewed monthly', status: 'Open', site: 'CM-CH',
      notes: [{ on: 'Fri 4 Sep', by: 'priya', t: 'September check-in done. Attendance holding.' }] },
    { id: 'AI-8896', t: 'Arrive and be ready on the floor before handover for every scheduled shift', owner: 'kai', by: 'simone',
      from: 'PIP-418', fromKind: 'pip', due: 'Ongoing, reviewed weekly', status: 'Open', site: 'CM-MC', notes: [] },
    { id: 'AI-8897', t: 'Call the Director of Nursing at least two hours ahead if unable to attend', owner: 'kai', by: 'simone',
      from: 'PIP-418', fromKind: 'pip', due: 'Ongoing', status: 'Open', site: 'CM-MC', notes: [] },
    { id: 'AI-8832', t: 'Cart locked and stored whenever it is out of sight', owner: 'halle', by: 'oscar',
      from: 'PIP-401', fromKind: 'pip', due: 'Ongoing, reviewed weekly', status: 'Closed', site: 'CM-CH', closedOn: 'Fri 28 Aug 2026', notes: [] },

    { id: 'AI-8940', t: 'Complete the outstanding mandatory training modules', owner: 'teodor', by: 'wren',
      from: 'PIP-408', fromKind: 'pip', due: 'Fri 11 Sep 2026', status: 'Overdue', site: 'CM-SB',
      notes: [{ on: 'Mon 14 Sep', by: 'teodor', t: 'Two of the four done. Booked on the next classroom session for the rest.' }] },
    { id: 'AI-8941', t: 'Meet the Director of Nursing every Friday to review the week', owner: 'teodor', by: 'wren',
      from: 'PIP-408', fromKind: 'pip', due: 'Ongoing, reviewed weekly', status: 'Open', site: 'CM-SB',
      notes: [{ on: 'Fri 12 Sep', by: 'wren', t: 'Fifth week running. No occurrences since the plan started.' }] },
    { id: 'AI-8942', t: 'Complete the attendance and punctuality module', owner: 'kai', by: 'simone',
      from: 'PIP-418', fromKind: 'pip', due: 'Fri 2 Oct 2026', status: 'Open', site: 'CM-MC', notes: [] },
    { id: 'AI-8943', t: 'Complete the chemical safety refresher', owner: 'halle', by: 'oscar',
      from: 'PIP-401', fromKind: 'pip', due: 'Fri 24 Jul 2026', status: 'Closed', site: 'CM-CH', closedOn: 'Wed 22 Jul 2026',
      notes: [{ on: 'Wed 22 Jul', by: 'halle', t: 'Certificate sent to the office.' }] },
    { id: 'AI-8944', t: 'Have charting spot-checked on five shifts a month', owner: 'esther', by: 'simone',
      from: 'PIP-395', fromKind: 'pip', due: 'Fri 18 Jul 2026', status: 'Closed', site: 'CM-MC', closedOn: 'Fri 18 Jul 2026',
      notes: [{ on: 'Fri 18 Jul', by: 'simone', t: 'Every audited shift complete. Plan closed as successfully completed.' }] },
    { id: 'AI-8835', t: 'No unplanned absence for ninety days', owner: 'camille', by: 'ivan',
      from: 'PIP-380', fromKind: 'pip', due: 'Mon 11 May 2026', status: 'Closed', site: 'CM-LV', closedOn: 'Mon 11 May 2026',
      notes: [{ on: 'Mon 11 May', by: 'ivan', t: 'Closed when the plan ended. The standard was not met.' }] },
    { id: 'AI-8836', t: 'Meet the Memory Care Director weekly to review attendance', owner: 'camille', by: 'ivan',
      from: 'PIP-380', fromKind: 'pip', due: 'Ongoing, reviewed weekly', status: 'Closed', site: 'CM-LV', closedOn: 'Mon 11 May 2026',
      notes: [{ on: 'Mon 11 May', by: 'ivan', t: 'Closed when the plan ended.' }] },

    /* from evaluations */
    { id: 'AI-8887', t: 'Train two colleagues on the medication cart audit', owner: 'marisol', by: 'priya',
      from: 'EV-2026-047', fromKind: 'eval', due: 'Thu 31 Dec 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8888', t: 'Take the charge nurse pathway', owner: 'marisol', by: 'priya',
      from: 'EV-2026-047', fromKind: 'eval', due: 'Fri 30 Jan 2027', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8891', t: 'Bring agency use below 8% by March', owner: 'curtis', by: 'alexis',
      from: 'EV-2026-029', fromKind: 'eval', due: 'Tue 31 Mar 2027', status: 'Open', site: 'CM-CH',
      notes: [{ on: 'Mon 14 Sep', by: 'curtis', t: 'Two internal hires start 22 September. Agency down to 11% from 16%.' }] },
    { id: 'AI-8892', t: 'Close site visit actions inside thirty days', owner: 'curtis', by: 'alexis',
      from: 'EV-2026-029', fromKind: 'eval', due: 'Ongoing', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8893', t: 'Build a cook bench of two', owner: 'imani', by: 'curtis',
      from: 'EV-2026-039', fromKind: 'eval', due: 'Tue 31 Mar 2027', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8898', t: 'Learn the special diet board end to end', owner: 'devon', by: 'imani',
      from: 'EV-2026-044', fromKind: 'eval', due: 'Fri 27 Nov 2026', status: 'Open', site: 'CM-CH', notes: [] },

    /* raised straight off a documented conversation */
    { id: 'AI-8921', t: 'Use the written handover sheet on every shift for four weeks', owner: 'marisol', by: 'priya',
      from: 'CR-20915', fromKind: 'coaching', due: 'Wed 23 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8922', t: 'Chart at the point of care and finish before handover', owner: 'trevor', by: 'priya',
      from: 'CR-20928', fromKind: 'coaching', due: 'Mon 12 Oct 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8903', t: 'Update next week’s activity calendar every Friday', owner: 'yolanda', by: 'curtis',
      from: 'CR-20933', fromKind: 'coaching', due: 'Ongoing', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8904', t: 'Produce a sales and occupancy plan for Willow Crossing', owner: 'jonah', by: 'dominic',
      from: 'CR-20905', fromKind: 'coaching', due: 'Mon 31 Aug 2026', status: 'Overdue', site: 'CM-WC',
      notes: [{ on: 'Tue 1 Sep', by: 'jonah', t: 'Draft with the regional sales lead. Waiting on the competitor pricing review.' }] },
    { id: 'AI-8907', t: 'Weekly agency check-in until spend is inside budget', owner: 'bernadette', by: 'alexis',
      from: 'CR-20924', fromKind: 'coaching', due: 'Ongoing', status: 'Open', site: 'CM-LV', notes: [] },

    /* the regional and HR have their own work too */
    { id: 'AI-8911', t: 'Agree the staffing plan for Lakeview Manor with HR', owner: 'alexis', by: 'nadine',
      from: 'CR-20924', fromKind: 'coaching', due: 'Fri 26 Sep 2026', status: 'Open', site: 'CM-LV', notes: [] },
    { id: 'AI-8912', t: 'Schedule the October walk-through for all three Midwest communities', owner: 'alexis', by: 'nadine',
      from: 'SV-1182', fromKind: 'visit', due: 'Wed 30 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8913', t: 'Review the Willow Crossing plan before it reaches the Regional', owner: 'grant', by: 'nadine',
      from: 'PIP-417', fromKind: 'pip', due: 'Fri 19 Sep 2026', status: 'Open', site: 'CM-WC', notes: [] },
    { id: 'AI-8914', t: 'Confirm the retention period with legal before the next export', owner: 'grant', by: 'nadine',
      from: 'PIP-380', fromKind: 'pip', due: 'Fri 12 Sep 2026', status: 'Overdue', site: 'CM-LV',
      notes: [{ on: 'Mon 15 Sep', by: 'grant', t: 'Draft policy with legal. Expecting a view this week.' }] },
    { id: 'AI-8915', t: 'Complete the dementia refresher module', owner: 'dana', by: 'priya',
      from: 'CR-20918', fromKind: 'coaching', due: 'Fri 3 Oct 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8916', t: 'Shadow a full medication pass with Marisol', owner: 'dana', by: 'priya',
      from: 'CR-20904', fromKind: 'coaching', due: 'Fri 26 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8917', t: 'Sign off the October clinical training dates', owner: 'priya', by: 'curtis',
      from: 'CR-20908', fromKind: 'coaching', due: 'Mon 22 Sep 2026', status: 'Open', site: 'CM-CH', notes: [] },
    { id: 'AI-8918', t: 'Close the outstanding fire drill documentation', owner: 'priya', by: 'curtis',
      from: 'SV-1182', fromKind: 'visit', due: 'Fri 11 Sep 2026', status: 'Overdue', site: 'CM-CH', notes: [] }
  );

  D.VISIT_SECTIONS = [{"key":"ir","title":"Incident Reporting (IR)","group":"Opening","items":["ED understands reporting requirements, methods, and timeline?","IR guideline posted for associates to know who to contact in certain IRs?","ED understands regulatory reporting requirements and timeline?","Incidents reported within 24 hours of occurrence to RDO within last 30 days?","Incident reports completed in full and timely?","Total Incidents Reported Last Quarter","Total Closed?","Reviewed Concern/Grievance Log. Resolutions documented?","Incident reports reviewed during Safety Meetings?"]},{"key":"cdd","title":"Clinical Denial & Discharge (CDD)","group":"Opening","items":["Reviewed Clinical Denial & Discharge Policy with CRD/ED/DON?","# of Clinical Denials last quarter?"]},{"key":"standup","title":"Stand-Up","group":"Opening","items":["Sales team discussed move-ins, tour plans, etc... (Stand-up Board)?","New Resident Move-Ins reviewed?","24 Hour Communication Log reviewed by DON?","Incident/Accident Reports reviewed?","At Risk Residents discussed and plan is in place?","Prior weeks (30 Days) Stand-up minutes & boards available and complete?","Employee recognitions shared?"]},{"key":"impressions","title":"Impressions!","group":"Standards","items":["Drive-by/external appearance is clean and well manicured?","100% employees compliant with dress code (name badge, etc...)?","Lobby is set to standard, clean, warm, pleasant odor and inviting?","Front entrance/vestibule is inviting and free of clutter? (No DME, Packages, etc.)","Concierge greets visitors warmly, authentically and timely?","Residents in lobby/common areas groomed, engaged and active?","Concierge has visitor and resident logs in use?","Concierge answers phone correctly and timely?","Dining room clean, organized and set to standard?","Concierge desk is neat, organized, free of clutter and personal items?","Laundry room clean and chemicals secured?","Activity rooms clean, decluttered and orderly?","Nurses stations clean, neat, free of clutter and personal items?","Public restrooms clean and supplied?","Offices clean and orderly?","Hallways, nooks, sitting areas clean and orderly?","Maint/Mech/Storage rooms clean and organized?","Bistro clean, orderly and supplied?","Discovery Room clean and set to standard?","Public areas 100% free of taped/tacked items?","Memory care area clean, organized and set to standard?","100% vacant units rent ready?","Employee breakroom is clean and in good condition?","Employee breakroom has labor posters?","Model room is clean and set to standard?","Employees are friendly, interactive, good morale?","Employee recognition board in use and contains current month cards?","Employees know our Mission Statement? (ask 3)"]},{"key":"admin","title":"Administrative","group":"Standards","items":["Employee compliance training completed timely and to standard?","Dementia training completed timely and to regulation?","Review last quarter's staff evaluations and increases? (3)","Last 3 hires have TB test completed timely if applicable?","Last 5 new hires have completed orientation & documentation?","LTC insurance monthly process in place and timely?","Recruitment platform effectively and timely used?","Delinquent accounts in process per protocol?","Nurse Call Response Times discussed and acceptable?","Priorities/Plans from prior month variance implemented/accomplished?","Review Prior Months financial variance analysis?","Prior month credit card activity was necessary and non-routine?","Understands AP process, role and timelines? (PO Box, ISTA, etc.)","Review Rent Roll: Free of errors, charges correct?","Last 5 MIs paperwork complete and full funds collected?","Reviewed AR aging report, collection efforts and standards?","Ancillary charges and trended revenues are accurate?","Community AP processing times within standard?"]},{"key":"engagement","title":"Resident Engagement","group":"Standards","items":["Life Enrichment program is in use and to standard?","Activities are occurring as the calendar indicates at the posted times?","Residents are engaged, not clustered with nothing to do?","LED and MCD offices are tidy, clean and organized if supplies are in their offices?","Memory Care dining experience meets standards?","Creativity boxes in use, available, and stocked? (15+)","Staff are actively engaged throughout the day with programming?","Activity/Creativity boxes are readily available for resident use?"]},{"key":"maintenance","title":"Maintenance","group":"Standards","items":["State required inspections completed/scheduled timely?","Preventative maintenance items on-track and up-to-date? (Review TELS)","Reviewed last 3 fire drills?","Reviewed last elopement drill and disaster drill?","Chemicals labeled and stored appropriately? (Locked areas)","SDS Binders updated and placed appropriately?","Reviewed vendor contracting protocol, vendor approval, etc.?","Reviewed work order completion process, tracking and outcomes?","HSK carts locked and stored when not in use?","HSK/MTA task sheets accurate, detailed and time oriented?","Touch-up painting schedule/routine in place?","Reviewed room turn timeline and procedures?","Reviewed floor maintenance expectations/contract?","Review Fleet Safety Manual and Maintenance?","Reviewed Cap-X requests, process, and forms?","Reviewed expenses, budget adherence and priorities?"]},{"key":"culinary","title":"Culinary Services","group":"Standards","items":["Dining room set-up, clean and odor free?","Tables set-up, neat, orderly and consistent per policy?","Current and accurate menus posted and followed?","Week At A Glance Menu posted/distributed?","Daily menus are in place on each table in the dining room.","Food orders taken timely, professionally and accurately?","Drink and meal service was timely, presents well and professional?","Tables turned timely, orderly and professionally?","Plate presentation was professional?","Portion sizes appropriate?","Food was appropriate temperature and tasty?","Resident's assisted when necessary/requested?","Was the planned menu actually served? (Items available?)","Special Diet binder/board/process in place and in use?","Dining room tables, table legs and chairs clean without build-up?","Table condiments & caddy clean and appropriate for meal?","Food temperature logs used and omission free? (MC & AL)","Fridge/freezer/dishwasher temp logs used and omission free?","Fridges/freezer organized correctly and free of debris?","Food dated and labeled? (fridge, freezer and storage)","Monthly food committee notes are completed?","Kitchen sanitation schedule/task sheet is accurate, in use, and effective?","Par levels sufficient for china, glasses, utensils?","Substitution log is in use and substitutions are documented appropriately?","Kitchen walls are clean and free of splatter?","Kitchen floor is clean without build-up?","Proper process for vendor contracts and vendor approvals are followed?","Equipment/supplies in good working order?"]},{"key":"salesocc","title":"Sales & Occupancy","group":"Operations Review","items":["Current occupancy vs. budget","Move-ins / move-outs MTD and YTD","Review upcoming 30-day move-in pipeline","Review leads, tours, deposits and conversions","Review reasons for lost leads","Review reasons for resident move-outs","Tour available apartments; confirm market-ready"]},{"key":"clinicalops","title":"Clinical Operations","group":"Operations Review","items":["Review falls, injuries and trends","Review hospital/ER transfers","Review medication errors/variances","Review infections/outbreaks","Review residents with significant condition changes","Confirm assessments/service plans are current","Review high-risk residents","Review outstanding clinical follow-up items"]},{"key":"staffing","title":"Staffing & Labor","group":"Operations Review","items":["Review open positions","Review staffing schedule vs. census/acuity","Review overtime and agency usage","Review call-offs and attendance trends","Review turnover and retention","Confirm required training is current","Meet with department heads"]},{"key":"resexp","title":"Resident Experience","group":"Operations Review","items":["Speak with residents during visit","Observe staff/resident interactions","Review resident/family complaints","Review satisfaction results and action plans","Observe activities and resident engagement","Review dining experience during a meal period"]},{"key":"dining","title":"Dining","group":"Operations Review","items":["Observe food quality, presentation and temperature","Inspect kitchen cleanliness and sanitation","Review food cost vs. budget","Verify menus are being followed","Review dining complaints and follow-up"]},{"key":"physplant","title":"Maintenance / Physical Plant","group":"Operations Review","items":["Complete exterior walk-around","Tour common areas and resident corridors","Review cleanliness, odors and overall appearance","Inspect vacant apartments","Review open work orders","Review average time to close work orders","Review preventive maintenance completion","Review outstanding capital needs","Check life-safety equipment/inspection status"]},{"key":"housekeeping","title":"Housekeeping","group":"Operations Review","items":["Inspect common areas and restrooms","Inspect sample resident apartments","Review housekeeping staffing and schedules","Review deep-clean/floor-care schedule"]},{"key":"regulatory","title":"Regulatory / Compliance","group":"Operations Review","items":["Review open survey deficiencies/POCs","Review reportable incidents","Review licensing/inspection requirements","Verify required postings/documentation","Review outstanding compliance issues"]},{"key":"leadership","title":"Leadership","group":"Operations Review","items":["Review ED's top 3 priorities","Review department-head performance","Review outstanding action plans","Identify leadership/accountability concerns","Recognize strong performance/wins"]}];
  D.VISIT_FINANCIAL = [{"key":"fin_previsit","title":"Pre-Visit Financial Review","type":"table","hint":"RDO + ED complete together \u2014 accurate, current numbers","rows":["MTD / YTD NOI vs. budget","Revenue variances (vs. budget)","Major expense variances","Labor vs. budget \u2014 overtime & agency","Controllable expenses","NOI improvement actions in progress"],"items":null},{"key":"fin_scan","title":"Pre-Call Scan","type":"scan","hint":"walk in already knowing","rows":null,"items":["Pulled live SkyPoint dashboards","Pulled census & move-in/out trend","Reviewed labor hours, OT %, agency use","Checked last night's incidents / falls","Looked at budget vs. actual (earnings)","Reviewed open AR / collections","Scanned complaints & work orders","Confirmed survey-readiness / open POC items","Reviewed each department's status","Re-read last call's action items"]},{"key":"fin_numbers","title":"The Numbers","type":"metrics","hint":"know normal so the abnormal jumps out","rows":["Occupancy / census %","Move-ins / move-outs (net)","Labor hours & overtime %","Agency usage ($ / hrs)","Earnings vs. budget","AR / collections aging","Incidents / falls / transfers","Complaints / grievances","Open work orders / life-safety"],"items":null},{"key":"fin_depts","title":"Department-by-Department Review","type":"table","hint":"the department line \u2014 direction down, accountability up","rows":["Clinical","Dining","Life Enrichment","Marketing","Maintenance","Memory Care"],"items":null},{"key":"fin_followups","title":"Follow-Ups From Last Call","type":"entry","hint":"close the loop \u2014 accountability is the point","rows":null,"items":null},{"key":"fin_wins","title":"Wins to Recognize","type":"note","hint":"","rows":null,"items":null},{"key":"fin_issues","title":"Issues / Risks to Raise","type":"note","hint":"","rows":null,"items":null},{"key":"fin_decisions","title":"Decisions Needed Today","type":"note","hint":"","rows":null,"items":null},{"key":"fin_coaching","title":"Coaching Focus","type":"note","hint":"","rows":null,"items":null},{"key":"fin_risk","title":"Risk & Watch List","type":"entry","hint":"not a fire yet \u2014 catch it before it is","rows":null,"items":null},{"key":"fin_actions","title":"Action Items Out of This Call","type":"entry","hint":"these flow into the shared Action Plan","rows":null,"items":null},{"key":"fin_escalate","title":"Escalate to VP of Operations","type":"note","hint":"surface early \u2014 bad news travels up or it festers","rows":null,"items":null}];
})();
