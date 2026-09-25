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
        { t: 'Call the charge nurse at least two hours before shift if unable to attend', due: 'Ongoing', done: true, aid: 'AI-8895' }],
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
      actions: [{ t: 'Complete all charting before leaving the floor', due: 'Fri 18 Jul 2026', done: true, aid: 'AI-8830' }],
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
      actions: [{ t: 'No unplanned absence for ninety days', due: 'Mon 11 May 2026', done: false, aid: null }],
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
  D.VISIT_SECTIONS = [{"key":"ir","title":"Incident Reporting (IR)","group":"Opening","items":["ED understands reporting requirements, methods, and timeline?","IR guideline posted for associates to know who to contact in certain IRs?","ED understands regulatory reporting requirements and timeline?","Incidents reported within 24 hours of occurrence to RDO within last 30 days?","Incident reports completed in full and timely?","Total Incidents Reported Last Quarter","Total Closed?","Reviewed Concern/Grievance Log. Resolutions documented?","Incident reports reviewed during Safety Meetings?"]},{"key":"cdd","title":"Clinical Denial & Discharge (CDD)","group":"Opening","items":["Reviewed Clinical Denial & Discharge Policy with CRD/ED/DON?","# of Clinical Denials last quarter?"]},{"key":"standup","title":"Stand-Up","group":"Opening","items":["Sales team discussed move-ins, tour plans, etc... (Stand-up Board)?","New Resident Move-Ins reviewed?","24 Hour Communication Log reviewed by DON?","Incident/Accident Reports reviewed?","At Risk Residents discussed and plan is in place?","Prior weeks (30 Days) Stand-up minutes & boards available and complete?","Employee recognitions shared?"]},{"key":"impressions","title":"Impressions!","group":"Standards","items":["Drive-by/external appearance is clean and well manicured?","100% employees compliant with dress code (name badge, etc...)?","Lobby is set to standard, clean, warm, pleasant odor and inviting?","Front entrance/vestibule is inviting and free of clutter? (No DME, Packages, etc.)","Concierge greets visitors warmly, authentically and timely?","Residents in lobby/common areas groomed, engaged and active?","Concierge has visitor and resident logs in use?","Concierge answers phone correctly and timely?","Dining room clean, organized and set to standard?","Concierge desk is neat, organized, free of clutter and personal items?","Laundry room clean and chemicals secured?","Activity rooms clean, decluttered and orderly?","Nurses stations clean, neat, free of clutter and personal items?","Public restrooms clean and supplied?","Offices clean and orderly?","Hallways, nooks, sitting areas clean and orderly?","Maint/Mech/Storage rooms clean and organized?","Bistro clean, orderly and supplied?","Discovery Room clean and set to standard?","Public areas 100% free of taped/tacked items?","Memory care area clean, organized and set to standard?","100% vacant units rent ready?","Employee breakroom is clean and in good condition?","Employee breakroom has labor posters?","Model room is clean and set to standard?","Employees are friendly, interactive, good morale?","Employee recognition board in use and contains current month cards?","Employees know our Mission Statement? (ask 3)"]},{"key":"admin","title":"Administrative","group":"Standards","items":["Employee compliance training completed timely and to standard?","Dementia training completed timely and to regulation?","Review last quarter's staff evaluations and increases? (3)","Last 3 hires have TB test completed timely if applicable?","Last 5 new hires have completed orientation & documentation?","LTC insurance monthly process in place and timely?","Recruitment platform effectively and timely used?","Delinquent accounts in process per protocol?","Nurse Call Response Times discussed and acceptable?","Priorities/Plans from prior month variance implemented/accomplished?","Review Prior Months financial variance analysis?","Prior month credit card activity was necessary and non-routine?","Understands AP process, role and timelines? (PO Box, ISTA, etc.)","Review Rent Roll: Free of errors, charges correct?","Last 5 MIs paperwork complete and full funds collected?","Reviewed AR aging report, collection efforts and standards?","Ancillary charges and trended revenues are accurate?","Community AP processing times within standard?"]},{"key":"engagement","title":"Resident Engagement","group":"Standards","items":["Life Enrichment program is in use and to standard?","Activities are occurring as the calendar indicates at the posted times?","Residents are engaged, not clustered with nothing to do?","LED and MCD offices are tidy, clean and organized if supplies are in their offices?","Memory Care dining experience meets standards?","Creativity boxes in use, available, and stocked? (15+)","Staff are actively engaged throughout the day with programming?","Activity/Creativity boxes are readily available for resident use?"]},{"key":"maintenance","title":"Maintenance","group":"Standards","items":["State required inspections completed/scheduled timely?","Preventative maintenance items on-track and up-to-date? (Review TELS)","Reviewed last 3 fire drills?","Reviewed last elopement drill and disaster drill?","Chemicals labeled and stored appropriately? (Locked areas)","SDS Binders updated and placed appropriately?","Reviewed vendor contracting protocol, vendor approval, etc.?","Reviewed work order completion process, tracking and outcomes?","HSK carts locked and stored when not in use?","HSK/MTA task sheets accurate, detailed and time oriented?","Touch-up painting schedule/routine in place?","Reviewed room turn timeline and procedures?","Reviewed floor maintenance expectations/contract?","Review Fleet Safety Manual and Maintenance?","Reviewed Cap-X requests, process, and forms?","Reviewed expenses, budget adherence and priorities?"]},{"key":"culinary","title":"Culinary Services","group":"Standards","items":["Dining room set-up, clean and odor free?","Tables set-up, neat, orderly and consistent per policy?","Current and accurate menus posted and followed?","Week At A Glance Menu posted/distributed?","Daily menus are in place on each table in the dining room.","Food orders taken timely, professionally and accurately?","Drink and meal service was timely, presents well and professional?","Tables turned timely, orderly and professionally?","Plate presentation was professional?","Portion sizes appropriate?","Food was appropriate temperature and tasty?","Resident's assisted when necessary/requested?","Was the planned menu actually served? (Items available?)","Special Diet binder/board/process in place and in use?","Dining room tables, table legs and chairs clean without build-up?","Table condiments & caddy clean and appropriate for meal?","Food temperature logs used and omission free? (MC & AL)","Fridge/freezer/dishwasher temp logs used and omission free?","Fridges/freezer organized correctly and free of debris?","Food dated and labeled? (fridge, freezer and storage)","Monthly food committee notes are completed?","Kitchen sanitation schedule/task sheet is accurate, in use, and effective?","Par levels sufficient for china, glasses, utensils?","Substitution log is in use and substitutions are documented appropriately?","Kitchen walls are clean and free of splatter?","Kitchen floor is clean without build-up?","Proper process for vendor contracts and vendor approvals are followed?","Equipment/supplies in good working order?"]},{"key":"salesocc","title":"Sales & Occupancy","group":"Operations Review","items":["Current occupancy vs. budget","Move-ins / move-outs MTD and YTD","Review upcoming 30-day move-in pipeline","Review leads, tours, deposits and conversions","Review reasons for lost leads","Review reasons for resident move-outs","Tour available apartments; confirm market-ready"]},{"key":"clinicalops","title":"Clinical Operations","group":"Operations Review","items":["Review falls, injuries and trends","Review hospital/ER transfers","Review medication errors/variances","Review infections/outbreaks","Review residents with significant condition changes","Confirm assessments/service plans are current","Review high-risk residents","Review outstanding clinical follow-up items"]},{"key":"staffing","title":"Staffing & Labor","group":"Operations Review","items":["Review open positions","Review staffing schedule vs. census/acuity","Review overtime and agency usage","Review call-offs and attendance trends","Review turnover and retention","Confirm required training is current","Meet with department heads"]},{"key":"resexp","title":"Resident Experience","group":"Operations Review","items":["Speak with residents during visit","Observe staff/resident interactions","Review resident/family complaints","Review satisfaction results and action plans","Observe activities and resident engagement","Review dining experience during a meal period"]},{"key":"dining","title":"Dining","group":"Operations Review","items":["Observe food quality, presentation and temperature","Inspect kitchen cleanliness and sanitation","Review food cost vs. budget","Verify menus are being followed","Review dining complaints and follow-up"]},{"key":"physplant","title":"Maintenance / Physical Plant","group":"Operations Review","items":["Complete exterior walk-around","Tour common areas and resident corridors","Review cleanliness, odors and overall appearance","Inspect vacant apartments","Review open work orders","Review average time to close work orders","Review preventive maintenance completion","Review outstanding capital needs","Check life-safety equipment/inspection status"]},{"key":"housekeeping","title":"Housekeeping","group":"Operations Review","items":["Inspect common areas and restrooms","Inspect sample resident apartments","Review housekeeping staffing and schedules","Review deep-clean/floor-care schedule"]},{"key":"regulatory","title":"Regulatory / Compliance","group":"Operations Review","items":["Review open survey deficiencies/POCs","Review reportable incidents","Review licensing/inspection requirements","Verify required postings/documentation","Review outstanding compliance issues"]},{"key":"leadership","title":"Leadership","group":"Operations Review","items":["Review ED's top 3 priorities","Review department-head performance","Review outstanding action plans","Identify leadership/accountability concerns","Recognize strong performance/wins"]}];
  D.VISIT_FINANCIAL = [{"key":"fin_previsit","title":"Pre-Visit Financial Review","type":"table","hint":"RDO + ED complete together \u2014 accurate, current numbers","rows":["MTD / YTD NOI vs. budget","Revenue variances (vs. budget)","Major expense variances","Labor vs. budget \u2014 overtime & agency","Controllable expenses","NOI improvement actions in progress"],"items":null},{"key":"fin_scan","title":"Pre-Call Scan","type":"scan","hint":"walk in already knowing","rows":null,"items":["Pulled live SkyPoint dashboards","Pulled census & move-in/out trend","Reviewed labor hours, OT %, agency use","Checked last night's incidents / falls","Looked at budget vs. actual (earnings)","Reviewed open AR / collections","Scanned complaints & work orders","Confirmed survey-readiness / open POC items","Reviewed each department's status","Re-read last call's action items"]},{"key":"fin_numbers","title":"The Numbers","type":"metrics","hint":"know normal so the abnormal jumps out","rows":["Occupancy / census %","Move-ins / move-outs (net)","Labor hours & overtime %","Agency usage ($ / hrs)","Earnings vs. budget","AR / collections aging","Incidents / falls / transfers","Complaints / grievances","Open work orders / life-safety"],"items":null},{"key":"fin_depts","title":"Department-by-Department Review","type":"table","hint":"the department line \u2014 direction down, accountability up","rows":["Clinical","Dining","Life Enrichment","Marketing","Maintenance","Memory Care"],"items":null},{"key":"fin_followups","title":"Follow-Ups From Last Call","type":"entry","hint":"close the loop \u2014 accountability is the point","rows":null,"items":null},{"key":"fin_wins","title":"Wins to Recognize","type":"note","hint":"","rows":null,"items":null},{"key":"fin_issues","title":"Issues / Risks to Raise","type":"note","hint":"","rows":null,"items":null},{"key":"fin_decisions","title":"Decisions Needed Today","type":"note","hint":"","rows":null,"items":null},{"key":"fin_coaching","title":"Coaching Focus","type":"note","hint":"","rows":null,"items":null},{"key":"fin_risk","title":"Risk & Watch List","type":"entry","hint":"not a fire yet \u2014 catch it before it is","rows":null,"items":null},{"key":"fin_actions","title":"Action Items Out of This Call","type":"entry","hint":"these flow into the shared Action Plan","rows":null,"items":null},{"key":"fin_escalate","title":"Escalate to VP of Operations","type":"note","hint":"surface early \u2014 bad news travels up or it festers","rows":null,"items":null}];
})();
