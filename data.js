/* skyPerformance wireframe: sample data.
   Fictional operator, fictional people, fabricated numbers. Nothing here is a
   real employee record. The shape mirrors the ten epics in the product spec:
   hierarchy, signals, tasks, forms, visits, action items, cases, documents,
   reporting and audit. */
(function () {
  var D = window.SP = {};

  D.ORG = 'Harborlight Senior Living';
  D.ORG_SHORT = 'Harborlight';
  D.TODAY = 'Tue 16 Sep 2026';
  D.CYCLE = 'Q3 2026 (Jul to Sep)';

  /* ---------------- E1 hierarchy ----------------
     Organization > Region > Community > Department > Employee.
     Every record in this file is bound to a hierarchy path and never moves off it. */
  D.REGIONS = [
    { id: 'RGN-NE', name: 'Northeast', lead: 'alexis' },
    { id: 'RGN-MW', name: 'Midwest', lead: 'dominic' }
  ];
  D.COMMUNITIES = [
    { id: 'CM-CR', name: 'Cedar Ridge', region: 'RGN-NE', city: 'Portland, ME', beds: 96, ed: 'curtis', type: 'Assisted living + memory care' },
    { id: 'CM-MG', name: 'Maple Grove', region: 'RGN-NE', city: 'Nashua, NH', beds: 120, ed: 'ruben', type: 'Skilled nursing' },
    { id: 'CM-LC', name: 'Lakeview Commons', region: 'RGN-NE', city: 'Burlington, VT', beds: 74, ed: 'bernadette', type: 'Assisted living' },
    { id: 'CM-SB', name: 'Stonebrook', region: 'RGN-MW', city: 'Madison, WI', beds: 110, ed: 'harriet', type: 'Skilled nursing' },
    { id: 'CM-WP', name: 'Willow Park', region: 'RGN-MW', city: 'Rockford, IL', beds: 88, ed: 'jonah', type: 'Assisted living + memory care' },
    { id: 'CM-BT', name: 'Birchwood Terrace', region: 'RGN-MW', city: 'Dayton, OH', beds: 64, ed: 'harriet', type: 'Independent living' }
  ];
  D.DEPTS = ['Nursing', 'Resident Care', 'Dining', 'Housekeeping', 'Life Enrichment', 'Maintenance'];

  /* ---------------- People ---------------- */
  function p(id, name, title, dept, cm, level, mgr, hired, extra) {
    var o = { id: id, name: name, title: title, dept: dept, cm: cm, level: level, mgr: mgr, hired: hired,
      ini: name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  D.PEOPLE = [
    /* regional and corporate */
    p('alexis', 'Alexis Moreau', 'Regional Director of Operations', 'Operations', null, 'region', null, 'Mar 2021', { region: 'RGN-NE' }),
    p('dominic', 'Dominic Sarr', 'Regional Director of Operations', 'Operations', null, 'region', null, 'Aug 2019', { region: 'RGN-MW' }),
    p('grant', 'Grant Ihejirika', 'HR Business Partner, Employee Relations', 'People', null, 'org', null, 'Jan 2018'),
    p('talia', 'Talia Brennan', 'Director of Quality and Compliance', 'Quality', null, 'org', null, 'Jun 2020'),
    p('rosalind', 'Rosalind Achebe', 'Platform Administrator', 'People', null, 'org', null, 'Feb 2022'),

    /* Cedar Ridge */
    p('curtis', 'Curtis Nakamura', 'Executive Director', 'Operations', 'CM-CR', 'community', 'alexis', 'Sep 2019'),
    p('priya', 'Priya Raghavan', 'Nurse Manager', 'Nursing', 'CM-CR', 'dept', 'curtis', 'Apr 2022'),
    p('dana', 'Dana Whitfield', 'Certified Nursing Assistant', 'Resident Care', 'CM-CR', 'staff', 'priya', 'Feb 2025'),
    p('lorna', 'Lorna Bekele', 'Certified Nursing Assistant', 'Resident Care', 'CM-CR', 'staff', 'priya', 'Nov 2023'),
    p('trevor', 'Trevor Ansley', 'Certified Nursing Assistant', 'Resident Care', 'CM-CR', 'staff', 'priya', 'Jun 2026'),
    p('marisol', 'Marisol Quintero', 'Licensed Practical Nurse', 'Nursing', 'CM-CR', 'staff', 'priya', 'Aug 2021'),
    p('nadia', 'Nadia Farouk', 'Medication Technician', 'Nursing', 'CM-CR', 'staff', 'priya', 'Mar 2024'),
    p('devon', 'Devon Pryce', 'Dining Services Aide', 'Dining', 'CM-CR', 'staff', 'imani', 'Jan 2026'),
    p('imani', 'Imani Clarke', 'Dining Services Manager', 'Dining', 'CM-CR', 'dept', 'curtis', 'May 2020'),
    p('halle', 'Halle Ostrom', 'Housekeeping Aide', 'Housekeeping', 'CM-CR', 'staff', 'oscar', 'Jul 2024'),
    p('oscar', 'Oscar Lindqvist', 'Environmental Services Manager', 'Maintenance', 'CM-CR', 'dept', 'curtis', 'Oct 2017'),
    p('yolanda', 'Yolanda Briggs', 'Life Enrichment Assistant', 'Life Enrichment', 'CM-CR', 'staff', 'curtis', 'Sep 2022'),

    /* Maple Grove */
    p('ruben', 'Ruben Castellanos', 'Executive Director', 'Operations', 'CM-MG', 'community', 'alexis', 'Feb 2018'),
    p('simone', 'Simone Adeyemi', 'Nurse Manager', 'Nursing', 'CM-MG', 'dept', 'ruben', 'Sep 2023'),
    p('kai', 'Kai Thornbury', 'Certified Nursing Assistant', 'Resident Care', 'CM-MG', 'staff', 'simone', 'Apr 2024'),
    p('esther', 'Esther Vaneck', 'Certified Nursing Assistant', 'Resident Care', 'CM-MG', 'staff', 'simone', 'Dec 2022'),
    p('malik', 'Malik Osei', 'Dining Services Manager', 'Dining', 'CM-MG', 'dept', 'ruben', 'Mar 2021'),

    /* Lakeview Commons */
    p('bernadette', 'Bernadette Kohl', 'Executive Director', 'Operations', 'CM-LC', 'community', 'alexis', 'Nov 2020'),
    p('ivan', 'Ivan Petrosyan', 'Nurse Manager', 'Nursing', 'CM-LC', 'dept', 'bernadette', 'Jan 2024'),
    p('camille', 'Camille Doucet', 'Certified Nursing Assistant', 'Resident Care', 'CM-LC', 'staff', 'ivan', 'Aug 2025'),

    /* Midwest */
    p('harriet', 'Harriet Odum', 'Executive Director', 'Operations', 'CM-SB', 'community', 'dominic', 'Jun 2016'),
    p('jonah', 'Jonah Reyes-Pike', 'Executive Director', 'Operations', 'CM-WP', 'community', 'dominic', 'Feb 2022'),
    p('wren', 'Wren Abbasi', 'Nurse Manager', 'Nursing', 'CM-SB', 'dept', 'harriet', 'Jul 2023'),
    p('teodor', 'Teodor Balan', 'Certified Nursing Assistant', 'Resident Care', 'CM-SB', 'staff', 'wren', 'Mar 2023'),
    p('junie', 'Junie Mbeki', 'Certified Nursing Assistant', 'Resident Care', 'CM-WP', 'staff', 'jonah', 'Oct 2024')
  ];
  D.byId = function (id) { for (var i = 0; i < D.PEOPLE.length; i++) if (D.PEOPLE[i].id === id) return D.PEOPLE[i]; return { id: id, name: id, ini: '?', title: '', dept: '', cm: null }; };
  D.cm = function (id) { for (var i = 0; i < D.COMMUNITIES.length; i++) if (D.COMMUNITIES[i].id === id) return D.COMMUNITIES[i]; return { id: id, name: 'All communities', region: null }; };
  D.cmName = function (id) { return id ? D.cm(id).name : 'All communities'; };

  /* ---------------- Roles (the View as switcher) ----------------
     scope is the hierarchy branch the role can see. Everything the app shows is
     filtered to it, which is the E1 promise: a leader sees only their branch. */
  D.ROLES = [
    { key: 'frontline', person: 'dana', label: 'Frontline employee', sub: 'Subject of the record, not a leader', scope: { kind: 'self' },
      note: 'Sees only their own file: coaching they received, action items they own, and letters awaiting acknowledgement.' },
    { key: 'manager', person: 'priya', label: 'Department manager', sub: 'Highest volume user', scope: { kind: 'dept', cm: 'CM-CR', dept: ['Nursing', 'Resident Care'] },
      note: 'Runs observations, huddles and recognition, and starts performance cases.' },
    { key: 'ed', person: 'curtis', label: 'Executive Director', sub: 'Community leader', scope: { kind: 'community', cm: 'CM-CR' },
      note: 'Runs community rounding and leader coaching. Coaches the coaches.' },
    { key: 'regional', person: 'alexis', label: 'Regional Director', sub: 'Multi-community rollup', scope: { kind: 'region', region: 'RGN-NE' },
      note: 'Consumes completion rate and trend rollups across six communities.' },
    { key: 'hr', person: 'grant', label: 'HR and Employee Relations', sub: 'Approver and file owner', scope: { kind: 'org' },
      note: 'Reviews every case in the approval chain and owns the employee file export.' },
    { key: 'quality', person: 'talia', label: 'Quality and Compliance', sub: 'Cross group', scope: { kind: 'org', crossGroup: true },
      note: 'Suggests coaching on employees outside the reporting line and watches survey readiness.' },
    { key: 'admin', person: 'rosalind', label: 'Platform administrator', sub: 'Configuration and retention', scope: { kind: 'org' },
      note: 'Configures form types, task rules, retention and evidence guardrails. No coaching of their own.' }
  ];

  /* ---------------- E2 performance signal layer ----------------
     Each metric exposes a stable id the coaching layer subscribes to. dir:'down'
     means lower is better. */
  D.SIGNALS = [
    { id: 'sig.call_light', name: 'Call light response', unit: 'min', dir: 'down', target: 4, fmt: function (v) { return v.toFixed(1) + ' min'; }, domain: 'Resident care' },
    { id: 'sig.med_pass', name: 'Med pass accuracy', unit: '%', dir: 'up', target: 98, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Clinical' },
    { id: 'sig.falls', name: 'Falls per 1,000 resident days', unit: 'rate', dir: 'down', target: 3.5, fmt: function (v) { return v.toFixed(1); }, domain: 'Clinical' },
    { id: 'sig.csat', name: 'Resident and family satisfaction', unit: '/5', dir: 'up', target: 4.4, fmt: function (v) { return v.toFixed(2) + ' / 5'; }, domain: 'Experience' },
    { id: 'sig.fill', name: 'Shift fill rate', unit: '%', dir: 'up', target: 95, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Workforce' },
    { id: 'sig.agency', name: 'Agency hours', unit: '% of worked', dir: 'down', target: 6, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Workforce' },
    { id: 'sig.retention', name: '90 day new hire retention', unit: '%', dir: 'up', target: 80, fmt: function (v) { return v.toFixed(0) + '%'; }, domain: 'Workforce' },
    { id: 'sig.careplan', name: 'Care plan timeliness', unit: '%', dir: 'up', target: 95, fmt: function (v) { return v.toFixed(0) + '%'; }, domain: 'Clinical' }
  ];
  D.signal = function (id) { for (var i = 0; i < D.SIGNALS.length; i++) if (D.SIGNALS[i].id === id) return D.SIGNALS[i]; return null; };

  /* actual by community: [sig, community, value, priorMonth, trend6] */
  D.METRICS = [
    ['sig.call_light', 'CM-CR', 5.2, 4.8, [4.1, 4.3, 4.6, 4.7, 4.8, 5.2]],
    ['sig.call_light', 'CM-MG', 3.6, 3.7, [4.2, 4.0, 3.9, 3.8, 3.7, 3.6]],
    ['sig.call_light', 'CM-LC', 3.1, 3.2, [3.5, 3.4, 3.3, 3.3, 3.2, 3.1]],
    ['sig.call_light', 'CM-SB', 4.4, 4.6, [5.0, 4.9, 4.8, 4.7, 4.6, 4.4]],
    ['sig.call_light', 'CM-WP', 3.9, 3.8, [3.6, 3.6, 3.7, 3.8, 3.8, 3.9]],
    ['sig.call_light', 'CM-BT', 2.8, 2.9, [3.1, 3.0, 3.0, 2.9, 2.9, 2.8]],
    ['sig.med_pass', 'CM-CR', 97.1, 96.4, [95.8, 96.0, 96.1, 96.3, 96.4, 97.1]],
    ['sig.med_pass', 'CM-MG', 98.6, 98.4, [98.1, 98.2, 98.3, 98.3, 98.4, 98.6]],
    ['sig.med_pass', 'CM-LC', 99.1, 99.0, [98.7, 98.8, 98.9, 99.0, 99.0, 99.1]],
    ['sig.med_pass', 'CM-SB', 96.2, 96.6, [97.2, 97.0, 96.9, 96.8, 96.6, 96.2]],
    ['sig.med_pass', 'CM-WP', 98.0, 97.8, [97.4, 97.5, 97.6, 97.7, 97.8, 98.0]],
    ['sig.med_pass', 'CM-BT', 98.9, 98.9, [98.8, 98.8, 98.9, 98.9, 98.9, 98.9]],
    ['sig.falls', 'CM-CR', 4.1, 4.4, [5.1, 4.9, 4.7, 4.6, 4.4, 4.1]],
    ['sig.falls', 'CM-MG', 3.2, 3.1, [3.0, 3.0, 3.1, 3.1, 3.1, 3.2]],
    ['sig.falls', 'CM-LC', 2.6, 2.7, [2.9, 2.9, 2.8, 2.8, 2.7, 2.6]],
    ['sig.falls', 'CM-SB', 5.3, 5.0, [4.4, 4.6, 4.7, 4.9, 5.0, 5.3]],
    ['sig.falls', 'CM-WP', 3.4, 3.5, [3.8, 3.7, 3.6, 3.6, 3.5, 3.4]],
    ['sig.falls', 'CM-BT', 2.2, 2.3, [2.5, 2.4, 2.4, 2.3, 2.3, 2.2]],
    ['sig.csat', 'CM-CR', 4.21, 4.28, [4.40, 4.36, 4.33, 4.30, 4.28, 4.21]],
    ['sig.csat', 'CM-MG', 4.52, 4.49, [4.42, 4.44, 4.46, 4.47, 4.49, 4.52]],
    ['sig.csat', 'CM-LC', 4.61, 4.60, [4.55, 4.57, 4.58, 4.59, 4.60, 4.61]],
    ['sig.csat', 'CM-SB', 4.18, 4.22, [4.31, 4.29, 4.27, 4.25, 4.22, 4.18]],
    ['sig.csat', 'CM-WP', 4.44, 4.41, [4.34, 4.36, 4.38, 4.40, 4.41, 4.44]],
    ['sig.csat', 'CM-BT', 4.58, 4.56, [4.50, 4.52, 4.54, 4.55, 4.56, 4.58]],
    ['sig.fill', 'CM-CR', 91.4, 92.8, [95.1, 94.4, 93.8, 93.2, 92.8, 91.4]],
    ['sig.fill', 'CM-MG', 96.2, 95.9, [95.0, 95.2, 95.5, 95.7, 95.9, 96.2]],
    ['sig.fill', 'CM-LC', 97.8, 97.6, [97.1, 97.2, 97.4, 97.5, 97.6, 97.8]],
    ['sig.fill', 'CM-SB', 89.6, 90.4, [92.8, 92.1, 91.5, 90.9, 90.4, 89.6]],
    ['sig.fill', 'CM-WP', 94.7, 94.3, [93.4, 93.6, 93.9, 94.1, 94.3, 94.7]],
    ['sig.fill', 'CM-BT', 98.1, 98.0, [97.6, 97.7, 97.8, 97.9, 98.0, 98.1]],
    ['sig.agency', 'CM-CR', 11.8, 10.4, [7.2, 8.1, 9.0, 9.8, 10.4, 11.8]],
    ['sig.agency', 'CM-MG', 5.1, 5.6, [7.0, 6.6, 6.2, 5.9, 5.6, 5.1]],
    ['sig.agency', 'CM-LC', 3.2, 3.4, [4.0, 3.8, 3.7, 3.5, 3.4, 3.2]],
    ['sig.agency', 'CM-SB', 14.2, 13.1, [9.8, 10.6, 11.4, 12.3, 13.1, 14.2]],
    ['sig.agency', 'CM-WP', 6.4, 6.8, [7.9, 7.6, 7.3, 7.0, 6.8, 6.4]],
    ['sig.agency', 'CM-BT', 2.1, 2.2, [2.6, 2.5, 2.4, 2.3, 2.2, 2.1]],
    ['sig.retention', 'CM-CR', 64, 69, [78, 76, 74, 72, 69, 64]],
    ['sig.retention', 'CM-MG', 82, 81, [77, 78, 79, 80, 81, 82]],
    ['sig.retention', 'CM-LC', 88, 87, [84, 85, 86, 86, 87, 88]],
    ['sig.retention', 'CM-SB', 58, 61, [70, 68, 66, 64, 61, 58]],
    ['sig.retention', 'CM-WP', 79, 78, [74, 75, 76, 77, 78, 79]],
    ['sig.retention', 'CM-BT', 91, 90, [88, 88, 89, 89, 90, 91]],
    ['sig.careplan', 'CM-CR', 92, 94, [97, 96, 95, 95, 94, 92]],
    ['sig.careplan', 'CM-MG', 96, 95, [93, 94, 94, 95, 95, 96]],
    ['sig.careplan', 'CM-LC', 98, 98, [97, 97, 98, 98, 98, 98]],
    ['sig.careplan', 'CM-SB', 90, 91, [94, 93, 93, 92, 91, 90]],
    ['sig.careplan', 'CM-WP', 95, 95, [94, 94, 95, 95, 95, 95]],
    ['sig.careplan', 'CM-BT', 97, 97, [96, 96, 97, 97, 97, 97]]
  ];
  D.metric = function (sig, cm) {
    for (var i = 0; i < D.METRICS.length; i++) if (D.METRICS[i][0] === sig && D.METRICS[i][1] === cm) {
      var m = D.METRICS[i];
      return { sig: sig, cm: cm, v: m[2], prior: m[3], trend: m[4] };
    }
    return null;
  };
  D.attain = function (sig, v) {
    var s = D.signal(sig);
    return s.dir === 'up' ? Math.round(v / s.target * 100) : Math.round(s.target / v * 100);
  };
  D.onTarget = function (sig, v) {
    var s = D.signal(sig);
    return s.dir === 'up' ? v >= s.target : v <= s.target;
  };
  /* per employee signal, used on the profile and inside the form snapshot */
  D.EMP_SIGNALS = {
    dana: [['sig.call_light', 6.1], ['sig.careplan', 86], ['sig.med_pass', 97.4]],
    lorna: [['sig.call_light', 3.4], ['sig.careplan', 98], ['sig.med_pass', 99.0]],
    trevor: [['sig.call_light', 5.8], ['sig.careplan', 88], ['sig.med_pass', 96.2]],
    marisol: [['sig.med_pass', 99.2], ['sig.careplan', 97], ['sig.call_light', 3.2]],
    nadia: [['sig.med_pass', 95.1], ['sig.careplan', 93], ['sig.call_light', 4.4]],
    devon: [['sig.csat', 4.05], ['sig.call_light', 4.9]],
    halle: [['sig.csat', 4.38]],
    kai: [['sig.call_light', 3.3], ['sig.careplan', 96]],
    esther: [['sig.call_light', 4.8], ['sig.careplan', 91]],
    camille: [['sig.call_light', 2.9], ['sig.careplan', 99]],
    teodor: [['sig.call_light', 5.4], ['sig.careplan', 89]],
    junie: [['sig.call_light', 3.7], ['sig.careplan', 94]],
    yolanda: [['sig.csat', 4.62]]
  };

  /* ---------------- E4 form catalogue ----------------
     Three families. Every type shares one skeleton, which is what makes a new
     type configuration rather than code. */
  D.FORM_FAMILIES = [
    { key: 'staff', name: 'Staff coaching', desc: 'Run on a frontline employee by their direct leader.' },
    { key: 'leader', name: 'Leader coaching', desc: 'Run on a manager or director by the leader above them.' },
    { key: 'ops', name: 'Operations', desc: 'Run on a place or a process rather than a person.' }
  ];
  D.FORM_TYPES = [
    { id: 'FT-OBS', name: 'Care observation', fam: 'staff', ic: 'binoculars', mins: 12, qs: 9, scored: true, desc: 'Watch a care interaction end to end and score it against the standard.', level: 'Staff' },
    { id: 'FT-HUD', name: 'Shift huddle', fam: 'staff', ic: 'users', mins: 8, qs: 6, scored: false, desc: 'Group touch point at shift change. Records attendance and the topic covered.', level: 'Staff' },
    { id: 'FT-REC', name: 'Recognition', fam: 'staff', ic: 'award', mins: 4, qs: 4, scored: false, desc: 'Positive documentation. Counts toward the touch point target and toward retention reporting.', level: 'Staff' },
    { id: 'FT-CHK', name: 'Check in', fam: 'staff', ic: 'message-square-text', mins: 10, qs: 7, scored: false, desc: 'Signal driven conversation on one topic. Opened automatically by a rule.', level: 'Staff' },
    { id: 'FT-SKV', name: 'Skill validation', fam: 'staff', ic: 'badge-check', mins: 20, qs: 14, scored: true, desc: 'Competency sign off against a skill checklist. Feeds the skill transfer record.', level: 'Staff' },
    { id: 'FT-GPL', name: 'Mid cycle goal plan', fam: 'staff', ic: 'target', mins: 18, qs: 10, scored: false, desc: 'Sets the goals the rest of the cycle is coached against.', level: 'Staff' },
    { id: 'FT-L11', name: 'Leader one to one', fam: 'leader', ic: 'handshake', mins: 25, qs: 11, scored: false, desc: 'Standing conversation between a leader and the leader above them.', level: 'Leader' },
    { id: 'FT-LDP', name: 'Leader development plan', fam: 'leader', ic: 'graduation-cap', mins: 30, qs: 12, scored: false, desc: 'Ninety day development plan for a manager or director.', level: 'Leader' },
    { id: 'FT-MRC', name: 'Manager rounding coaching', fam: 'leader', ic: 'compass', mins: 22, qs: 13, scored: true, desc: 'Coaches the coach. Scores how the manager ran their own rounding.', level: 'Leader' },
    { id: 'FT-CWT', name: 'Community walkthrough', fam: 'ops', ic: 'building-2', mins: 95, qs: 118, scored: true, desc: 'The full eight section rounding instrument. Tablet, on site, geo matched.', level: 'Community' },
    { id: 'FT-MRA', name: 'Med room audit', fam: 'ops', ic: 'shield-check', mins: 25, qs: 22, scored: true, desc: 'Storage, counts, disposal and documentation in the medication room.', level: 'Community' },
    { id: 'FT-DIN', name: 'Dining service observation', fam: 'ops', ic: 'utensils', mins: 30, qs: 19, scored: true, desc: 'Meal service from tray line to table, including assisted dining.', level: 'Community' },
    { id: 'FT-INF', name: 'Infection control round', fam: 'ops', ic: 'shield-alert', mins: 20, qs: 16, scored: true, desc: 'Hand hygiene, isolation signage, PPE stock and linen handling.', level: 'Community' }
  ];
  D.formType = function (id) { for (var i = 0; i < D.FORM_TYPES.length; i++) if (D.FORM_TYPES[i].id === id) return D.FORM_TYPES[i]; return null; };

  /* the one skeleton every form type shares (E4) */
  D.FORM_SKELETON = [
    { key: 'instructions', name: 'Instructions', ic: 'info', desc: 'Why this form exists and how to use it. Read only.' },
    { key: 'snapshot', name: 'Performance snapshot', ic: 'chart-column', desc: 'Signals pulled live from the performance layer at the moment the form opens.' },
    { key: 'observation', name: 'Observation', ic: 'clipboard-list', desc: 'The scored or written body of the form.' },
    { key: 'actions', name: 'Action items', ic: 'list-checks', desc: 'What happens next, who owns it and by when.' },
    { key: 'info', name: 'Form info', ic: 'file-text', desc: 'Duration, location, attestation and the hierarchy path the record binds to.' },
    { key: 'submit', name: 'Review and submit', ic: 'send', desc: 'Read the whole record back before it becomes immutable.' }
  ];

  /* observation questions by form type, grouped into sections */
  D.QUESTIONS = {
    'FT-OBS': [
      { s: 'Approach and dignity', qs: [
        'Knocked and waited for a response before entering the resident room.',
        'Greeted the resident by their preferred name and explained what was about to happen.',
        'Kept the resident covered and the door closed during personal care.'] },
      { s: 'Technique', qs: [
        'Performed hand hygiene before and after contact.',
        'Used the transfer method written in the care plan, with the right equipment.',
        'Checked skin during care and reported what they found.'] },
      { s: 'Close out', qs: [
        'Left the call light, water and personal items within reach.',
        'Documented the care in the record before the end of the shift.',
        'Handed off anything unresolved to the oncoming shift.'] }
    ],
    'FT-SKV': [
      { s: 'Preparation', qs: ['Gathered supplies before starting.', 'Confirmed the resident identity two ways.', 'Explained the procedure in plain language.', 'Positioned the resident safely.'] },
      { s: 'Procedure', qs: ['Followed each step of the checklist in order.', 'Maintained a clean field throughout.', 'Responded correctly when the resident declined part of the care.', 'Used the correct equipment settings.', 'Kept the resident comfortable and informed.'] },
      { s: 'Documentation', qs: ['Recorded the outcome in the resident record.', 'Reported the variance to the nurse.', 'Completed the task within the expected time.'] },
      { s: 'Sign off', qs: ['Able to perform the skill unsupervised.', 'Validator observed the full skill, not a partial.'] }
    ],
    'FT-MRC': [
      { s: 'Preparation', qs: ['Reviewed the signal layer before the round.', 'Knew which employees were behind on touch points.', 'Had prior action items to hand.'] },
      { s: 'In the round', qs: ['Asked open questions rather than checking boxes.', 'Observed care rather than only talking about it.', 'Gave a specific example rather than a general comment.', 'Named the standard being coached to.'] },
      { s: 'Documentation', qs: ['Completed the form within twenty four hours.', 'Wrote action items that name an owner and a date.', 'Language is specific enough to be defensible.'] },
      { s: 'Follow through', qs: ['Closed prior action items that were due.', 'Escalated the repeat trend rather than recoaching it a fourth time.', 'Recognised as well as corrected.'] }
    ],
    'FT-MRA': [
      { s: 'Storage', qs: ['Cart locked when unattended.', 'Refrigerated medication within range and logged twice daily.', 'Controlled substances double locked.', 'No expired stock on the shelf.'] },
      { s: 'Counts', qs: ['Shift to shift count signed by both nurses.', 'Count discrepancies from the last thirty days closed out.', 'Waste witnessed and co signed.'] },
      { s: 'Documentation', qs: ['Administration record complete for the last seven days.', 'Holds and refusals documented with a reason.', 'Allergy list current in the record.'] },
      { s: 'Environment', qs: ['Room clean, uncluttered and free of food.', 'Sharps container below the fill line.', 'Emergency kit sealed and in date.'] }
    ],
    'FT-DIN': [
      { s: 'Tray line', qs: ['Food temperatures taken and logged before service.', 'Therapeutic diets match the current diet list.', 'Staff in clean uniform with hair restrained.'] },
      { s: 'Service', qs: ['Residents seated and ready before trays arrive.', 'Meals served within fifteen minutes of leaving the kitchen.', 'Adaptive equipment in place for residents who need it.', 'Staff sat at eye level when assisting.'] },
      { s: 'Experience', qs: ['Alternatives offered and honoured.', 'Dining room calm and unhurried.', 'Residents asked about the meal, not just handed it.'] },
      { s: 'After service', qs: ['Intake recorded for residents on monitoring.', 'Leftovers dated and stored correctly.', 'Dining room reset for the next meal.'] }
    ],
    'FT-INF': [
      { s: 'Hand hygiene', qs: ['Dispensers stocked and within reach at the point of care.', 'Staff observed performing hygiene at the right moments.', 'Nails and jewellery within policy.'] },
      { s: 'Isolation', qs: ['Signage current and matches the order.', 'PPE cart stocked outside the room.', 'Dedicated equipment kept in the room.'] },
      { s: 'Linen and waste', qs: ['Soiled linen bagged at the point of use.', 'Clean linen covered in transit.', 'Waste segregated correctly.'] },
      { s: 'Records', qs: ['Line list current.', 'Staff illness log complete.', 'Outbreak plan accessible on the unit.'] }
    ]
  };
  D.questionsFor = function (ftId) { return D.QUESTIONS[ftId] || D.QUESTIONS['FT-OBS']; };

  /* ---------------- E5 the eight section walkthrough ---------------- */
  D.VISIT_SECTIONS = [
    { key: 'arrival', name: 'Arrival and first impression', ic: 'map-pin', qs: 12, done: 12,
      items: ['Exterior, signage and entry are clean and in repair.', 'Front desk greeted the visitor within one minute.', 'Sign in and badge process followed.', 'Lobby free of clutter and odour.'] },
    { key: 'clinical', name: 'Clinical and medication', ic: 'stethoscope', qs: 18, done: 18,
      items: ['Med carts locked and in date.', 'Treatment records complete for the last seven days.', 'Change of condition notes closed within twenty four hours.', 'Care plans reviewed on schedule.'] },
    { key: 'resident', name: 'Resident experience', ic: 'heart-handshake', qs: 16, done: 16,
      items: ['Spoke with at least three residents about their care.', 'Call lights answered within the standard during the visit.', 'Residents dressed and groomed appropriately for the time of day.', 'Activity calendar matches what is actually happening.'] },
    { key: 'dining', name: 'Dining and nutrition', ic: 'utensils', qs: 14, done: 14,
      items: ['Observed a full meal service.', 'Temperatures logged.', 'Assisted dining staffed to the assessed need.', 'Hydration passes happening between meals.'] },
    { key: 'environment', name: 'Environment and safety', ic: 'shield-check', qs: 20, done: 11,
      items: ['Corridors clear of obstruction.', 'Water temperatures within range at three fixtures.', 'Exit doors alarmed and unobstructed.', 'Wander management system tested.'] },
    { key: 'staffing', name: 'Staffing and scheduling', ic: 'users-round', qs: 15, done: 0,
      items: ['Posted staffing matches the actual assignment sheet.', 'Open shifts for the next fourteen days reviewed.', 'Agency use explained by the schedule, not by habit.', 'Break coverage planned.'] },
    { key: 'records', name: 'Records and survey readiness', ic: 'folder-open', qs: 13, done: 0,
      items: ['Survey binder current.', 'Last survey deficiencies closed with evidence.', 'QAPI minutes filed for the last quarter.', 'In service attendance complete.'] },
    { key: 'summary', name: 'Leader debrief and summary', ic: 'notebook-text', qs: 10, done: 0,
      items: ['Debriefed the Executive Director before leaving.', 'Named the single biggest risk found.', 'Agreed the follow up date.', 'Recognised one thing done well.'] }
  ];

  /* ---------------- E3 to do list ---------------- */
  var T = function (id, emp, ft, topic, due, status, rule, sig, owner, cm, extra) {
    var o = { id: id, emp: emp, ft: ft, topic: topic, due: due, status: status, rule: rule, sig: sig, owner: owner, cm: cm };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  };
  D.TASKS = [
    T('TP-4471', 'dana', 'FT-CHK', 'Check in: call light response', 'Thu 18 Sep', 'Overdue', 'RULE-07', 'sig.call_light', 'priya', 'CM-CR', { due_iso: '2026-09-11', opened: 'Fri 11 Sep', why: 'Call light response averaged 6.1 min across the last 9 shifts against a 4.0 min standard.' }),
    T('TP-4488', 'trevor', 'FT-SKV', 'Skill validation: mechanical lift transfer', 'Wed 17 Sep', 'Open', 'RULE-02', null, 'priya', 'CM-CR', { opened: 'Wed 10 Sep', why: 'New hire at day 90. Skill validation is required before unsupervised transfers.' }),
    T('TP-4492', 'nadia', 'FT-CHK', 'Check in: med pass accuracy', 'Fri 19 Sep', 'Open', 'RULE-04', 'sig.med_pass', 'priya', 'CM-CR', { opened: 'Mon 14 Sep', why: 'Med pass accuracy 95.1% against a 98% standard for two consecutive weeks.' }),
    T('TP-4495', 'lorna', 'FT-REC', 'Recognition: zero call light misses in August', 'Fri 19 Sep', 'Open', 'RULE-11', 'sig.call_light', 'priya', 'CM-CR', { opened: 'Mon 14 Sep', why: 'Top decile on call light response for three consecutive months. Recognition is a rule, not a favour.' }),
    T('TP-4501', 'devon', 'FT-OBS', 'Care observation: assisted dining', 'Mon 22 Sep', 'Open', 'RULE-09', 'sig.csat', 'imani', 'CM-CR', { opened: 'Tue 15 Sep', why: 'Two dining comments in the family survey named service pace.' }),
    T('TP-4504', 'marisol', 'FT-GPL', 'Mid cycle goal plan', 'Tue 30 Sep', 'Open', 'RULE-01', null, 'priya', 'CM-CR', { opened: 'Tue 1 Sep', why: 'Every employee gets a mid cycle goal plan in the second month of the cycle.' }),
    T('TP-4460', 'halle', 'FT-OBS', 'Care observation: room turnover', 'Mon 15 Sep', 'Completed', 'RULE-03', null, 'oscar', 'CM-CR', { opened: 'Mon 8 Sep', done: 'Mon 15 Sep', formId: 'FM-20918' }),
    T('TP-4455', 'dana', 'FT-OBS', 'Care observation: morning care', 'Fri 12 Sep', 'Completed', 'RULE-03', null, 'priya', 'CM-CR', { opened: 'Fri 5 Sep', done: 'Fri 12 Sep', formId: 'FM-20904' }),
    T('TP-4433', 'dana', 'FT-CHK', 'Check in: care plan timeliness', 'Fri 29 Aug', 'Completed', 'RULE-05', 'sig.careplan', 'priya', 'CM-CR', { opened: 'Fri 22 Aug', done: 'Thu 28 Aug', formId: 'FM-20877' }),
    T('TP-4509', 'yolanda', 'FT-HUD', 'Shift huddle: life enrichment', 'Wed 17 Sep', 'Draft', 'RULE-06', null, 'curtis', 'CM-CR', { opened: 'Tue 15 Sep', draftPct: 60 }),
    T('TP-4512', 'esther', 'FT-CHK', 'Check in: call light response', 'Thu 18 Sep', 'Open', 'RULE-07', 'sig.call_light', 'simone', 'CM-MG', { opened: 'Thu 11 Sep', why: 'Call light response 4.8 min against a 4.0 min standard.' }),
    T('TP-4515', 'teodor', 'FT-CHK', 'Check in: call light response', 'Thu 18 Sep', 'Overdue', 'RULE-07', 'sig.call_light', 'wren', 'CM-SB', { due_iso: '2026-09-09', opened: 'Tue 2 Sep', why: 'Call light response 5.4 min against a 4.0 min standard.' }),
    T('TP-4520', 'priya', 'FT-MRC', 'Manager rounding coaching', 'Fri 19 Sep', 'Open', 'RULE-12', null, 'curtis', 'CM-CR', { opened: 'Mon 14 Sep', why: 'Cedar Ridge touch point completion is 68% against a 90% standard. Coach the coach before coaching the team.' }),
    T('TP-4522', 'simone', 'FT-L11', 'Leader one to one', 'Mon 22 Sep', 'Open', 'RULE-13', null, 'ruben', 'CM-MG', { opened: 'Mon 8 Sep', why: 'Standing monthly conversation.' }),
    T('TP-4524', 'imani', 'FT-L11', 'Leader one to one', 'Mon 22 Sep', 'Open', 'RULE-13', null, 'curtis', 'CM-CR', { opened: 'Mon 8 Sep', why: 'Standing monthly conversation.' }),
    T('TP-4527', 'junie', 'FT-REC', 'Recognition: family compliment', 'Wed 24 Sep', 'Open', 'RULE-11', 'sig.csat', 'jonah', 'CM-WP', { opened: 'Tue 15 Sep', why: 'Named twice in the family survey verbatims this month.' })
  ];

  /* rules that generate the tasks above (E3, configured in Settings) */
  D.RULES = [
    { id: 'RULE-01', name: 'Mid cycle goal plan for everyone', sig: null, when: 'Day 45 of a performance cycle', makes: 'FT-GPL', due: '15 days', rec: 'Every cycle', on: true, fired: 41 },
    { id: 'RULE-02', name: 'New hire skill validation at 90 days', sig: null, when: 'Employee reaches day 83 of employment', makes: 'FT-SKV', due: '7 days', rec: 'Once per hire', on: true, fired: 12 },
    { id: 'RULE-03', name: 'Monthly care observation per employee', sig: null, when: 'No care observation in the last 30 days', makes: 'FT-OBS', due: '7 days', rec: 'Monthly', on: true, fired: 186 },
    { id: 'RULE-04', name: 'Med pass accuracy below standard', sig: 'sig.med_pass', when: 'Below 98% for 2 consecutive weeks', makes: 'FT-CHK', due: '5 days', rec: 'Once per breach', on: true, fired: 9 },
    { id: 'RULE-05', name: 'Care plan timeliness below standard', sig: 'sig.careplan', when: 'Below 95% in a month', makes: 'FT-CHK', due: '7 days', rec: 'Monthly while breached', on: true, fired: 14 },
    { id: 'RULE-06', name: 'Weekly shift huddle per department', sig: null, when: 'Start of each week', makes: 'FT-HUD', due: '5 days', rec: 'Weekly', on: true, fired: 312 },
    { id: 'RULE-07', name: 'Call light response above standard', sig: 'sig.call_light', when: 'Above 4.0 min across 5 consecutive shifts', makes: 'FT-CHK', due: '7 days', rec: 'Once per breach', on: true, fired: 23 },
    { id: 'RULE-09', name: 'Dining comment in family survey', sig: 'sig.csat', when: 'Two or more dining verbatims in a month', makes: 'FT-OBS', due: '7 days', rec: 'Monthly', on: true, fired: 6 },
    { id: 'RULE-11', name: 'Recognition for sustained top decile', sig: 'sig.call_light', when: 'Top decile for 3 consecutive months', makes: 'FT-REC', due: '5 days', rec: 'Quarterly', on: true, fired: 18 },
    { id: 'RULE-12', name: 'Coach the coach on low completion', sig: null, when: 'Leader touch point completion below 75%', makes: 'FT-MRC', due: '5 days', rec: 'Monthly while breached', on: true, fired: 7 },
    { id: 'RULE-13', name: 'Monthly leader one to one', sig: null, when: 'Start of each month', makes: 'FT-L11', due: '14 days', rec: 'Monthly', on: true, fired: 96 },
    { id: 'RULE-14', name: 'Falls above threshold triggers unit huddle', sig: 'sig.falls', when: 'Above 4.5 per 1,000 resident days', makes: 'FT-HUD', due: '2 days', rec: 'Once per breach', on: false, fired: 0 }
  ];

  /* ---------------- E8 completed forms (the documentation record) ---------------- */
  var F = function (o) { return o; };
  D.FORMS = [
    F({ id: 'FM-20904', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Fri 12 Sep 2026', time: '09:14', mins: 14, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Needs improvement', noCount: 2, geo: 'Matched, 18 m from the community address', task: 'TP-4455',
      summary: 'Two standards missed during morning care: hand hygiene between residents and leaving the call light in reach. Technique on the transfer was correct and the resident was comfortable throughout.',
      scores: [2, 2, 2, 1, 2, 2, 1, 2, 2], actions: ['AI-8821'], attested: true, ack: 'Fri 12 Sep 2026' }),
    F({ id: 'FM-20877', ft: 'FT-CHK', emp: 'dana', by: 'priya', date: 'Thu 28 Aug 2026', time: '15:40', mins: 11, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Documented', geo: 'Matched, 22 m from the community address', task: 'TP-4433',
      summary: 'Care plan timeliness at 86%. Agreed to close documentation before leaving the floor rather than at the end of the week.', actions: ['AI-8794'], attested: true, ack: 'Thu 28 Aug 2026' }),
    F({ id: 'FM-20918', ft: 'FT-OBS', emp: 'halle', by: 'oscar', date: 'Mon 15 Sep 2026', time: '11:02', mins: 16, cm: 'CM-CR', dept: 'Housekeeping',
      outcome: 'Meets standard', noCount: 0, geo: 'Matched, 9 m from the community address', task: 'TP-4460',
      summary: 'Room turnover ran to standard including terminal clean steps. Nothing to correct.', scores: [2, 2, 2, 2, 2, 2, 2, 2, 2], actions: [], attested: true, ack: 'Mon 15 Sep 2026' }),
    F({ id: 'FM-20862', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Wed 13 Aug 2026', time: '08:55', mins: 13, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Needs improvement', noCount: 3, geo: 'Matched, 14 m from the community address',
      summary: 'Call light response and documentation both missed. Third observation in a row with the same documentation gap.',
      scores: [2, 1, 2, 2, 2, 1, 1, 2, 2], actions: ['AI-8760'], attested: true, ack: 'Wed 13 Aug 2026' }),
    F({ id: 'FM-20840', ft: 'FT-REC', emp: 'lorna', by: 'priya', date: 'Fri 1 Aug 2026', time: '16:20', mins: 5, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Recognition', geo: 'Matched, 11 m from the community address',
      summary: 'Covered two unfilled shifts and still finished every care plan on time. Named by a family member in the July survey.', actions: [], attested: true, ack: 'Fri 1 Aug 2026' }),
    F({ id: 'FM-20831', ft: 'FT-CHK', emp: 'dana', by: 'priya', date: 'Tue 22 Jul 2026', time: '14:05', mins: 9, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Documented', geo: 'Matched, 20 m from the community address',
      summary: 'First conversation about documentation timing. Agreed a reminder at the two hour mark of each shift.', actions: ['AI-8702'], attested: true, ack: 'Tue 22 Jul 2026' }),
    F({ id: 'FM-20795', ft: 'FT-SKV', emp: 'kai', by: 'simone', date: 'Thu 10 Jul 2026', time: '10:30', mins: 24, cm: 'CM-MG', dept: 'Resident Care',
      outcome: 'Meets standard', noCount: 0, geo: 'Matched, 6 m from the community address',
      summary: 'Mechanical lift transfer validated. Cleared for unsupervised transfers.', actions: [], attested: true, ack: 'Thu 10 Jul 2026' }),
    F({ id: 'FM-20930', ft: 'FT-MRC', emp: 'simone', by: 'ruben', date: 'Mon 8 Sep 2026', time: '13:15', mins: 28, cm: 'CM-MG', dept: 'Nursing',
      outcome: 'Meets standard', noCount: 1, geo: 'Matched, 12 m from the community address',
      summary: 'Rounding is consistent and documented on the day. One gap: prior action items were not reviewed before the round.', actions: ['AI-8840'], attested: true, ack: 'Mon 8 Sep 2026' }),
    F({ id: 'FM-20812', ft: 'FT-CHK', emp: 'teodor', by: 'wren', date: 'Mon 14 Jul 2026', time: '09:45', mins: 10, cm: 'CM-SB', dept: 'Resident Care',
      outcome: 'Documented', geo: 'Not matched, 2.4 km from the community address', geoFlag: true,
      summary: 'Conversation about call light response. Recorded off site, which the record shows.', actions: [], attested: true, ack: 'Mon 14 Jul 2026' }),
    F({ id: 'FM-20699', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Mon 16 Jun 2026', time: '08:40', mins: 15, cm: 'CM-CR', dept: 'Resident Care',
      outcome: 'Meets standard', noCount: 1, geo: 'Matched, 16 m from the community address',
      summary: 'Strong resident interaction. Documentation completed before the end of shift.', scores: [2, 2, 2, 2, 2, 2, 2, 1, 2], actions: [], attested: true, ack: 'Mon 16 Jun 2026' })
  ];
  D.form = function (id) { for (var i = 0; i < D.FORMS.length; i++) if (D.FORMS[i].id === id) return D.FORMS[i]; return null; };
  D.DELETED_FORMS = [
    { id: 'FM-20889', ft: 'FT-OBS', emp: 'trevor', by: 'priya', date: 'Tue 2 Sep 2026', cm: 'CM-CR', deletedBy: 'grant', deletedOn: 'Wed 3 Sep 2026', reason: 'Recorded against the wrong employee. Reissued as FM-20893.' },
    { id: 'FM-20701', ft: 'FT-CHK', emp: 'camille', by: 'ivan', date: 'Mon 16 Jun 2026', cm: 'CM-LC', deletedBy: 'grant', deletedOn: 'Mon 16 Jun 2026', reason: 'Duplicate submission, same conversation captured twice.' }
  ];

  /* ---------------- E5 site visits ---------------- */
  D.VISITS = [
    { id: 'SV-1182', cm: 'CM-CR', by: 'alexis', date: 'Tue 16 Sep 2026', status: 'In progress', answered: 57, total: 118, mins: 41, geo: 'Matched, 24 m from the community address', started: '09:05', photos: 3 },
    { id: 'SV-1176', cm: 'CM-MG', by: 'alexis', date: 'Thu 4 Sep 2026', status: 'Completed', answered: 118, total: 118, mins: 96, geo: 'Matched, 8 m from the community address', score: 92, findings: 6, photos: 11 },
    { id: 'SV-1171', cm: 'CM-LC', by: 'alexis', date: 'Wed 20 Aug 2026', status: 'Completed', answered: 118, total: 118, mins: 88, geo: 'Matched, 15 m from the community address', score: 96, findings: 2, photos: 7 },
    { id: 'SV-1164', cm: 'CM-CR', by: 'alexis', date: 'Mon 4 Aug 2026', status: 'Completed', answered: 118, total: 118, mins: 104, geo: 'Matched, 19 m from the community address', score: 81, findings: 12, photos: 14 },
    { id: 'SV-1158', cm: 'CM-SB', by: 'dominic', date: 'Tue 22 Jul 2026', status: 'Completed', answered: 118, total: 118, mins: 91, geo: 'Matched, 11 m from the community address', score: 78, findings: 15, photos: 9 },
    { id: 'SV-1190', cm: 'CM-LC', by: 'alexis', date: 'Due Fri 26 Sep 2026', status: 'Scheduled', answered: 0, total: 118, mins: 0, geo: null, photos: 0 }
  ];
  D.visit = function (id) { for (var i = 0; i < D.VISITS.length; i++) if (D.VISITS[i].id === id) return D.VISITS[i]; return null; };

  /* ---------------- E6 action items ---------------- */
  D.ACTIONS = [
    { id: 'AI-8821', t: 'Hand hygiene between every resident, observed twice by the nurse manager', owner: 'dana', by: 'priya', from: 'FM-20904', due: 'Fri 19 Sep 2026', status: 'Open', cm: 'CM-CR', notes: [{ on: 'Mon 15 Sep', by: 'priya', t: 'Observed once, correct. One more to close.' }] },
    { id: 'AI-8822', t: 'Call light left in reach at the end of every care task', owner: 'dana', by: 'priya', from: 'FM-20904', due: 'Fri 19 Sep 2026', status: 'Open', cm: 'CM-CR', notes: [] },
    { id: 'AI-8794', t: 'Close care plan documentation before leaving the floor', owner: 'dana', by: 'priya', from: 'FM-20877', due: 'Fri 12 Sep 2026', status: 'Overdue', cm: 'CM-CR', notes: [{ on: 'Fri 12 Sep', by: 'priya', t: 'Still finishing documentation at the end of the week. Carried into the next observation.' }], carried: true },
    { id: 'AI-8760', t: 'Shadow Lorna Bekele for one shift on documentation timing', owner: 'dana', by: 'priya', from: 'FM-20862', due: 'Fri 29 Aug 2026', status: 'Closed', cm: 'CM-CR', closedOn: 'Thu 28 Aug 2026', notes: [{ on: 'Thu 28 Aug', by: 'priya', t: 'Shadow shift completed.' }] },
    { id: 'AI-8702', t: 'Set a two hour documentation reminder on the shift phone', owner: 'dana', by: 'priya', from: 'FM-20831', due: 'Fri 1 Aug 2026', status: 'Closed', cm: 'CM-CR', closedOn: 'Wed 30 Jul 2026', notes: [] },
    { id: 'AI-8840', t: 'Review open action items before each round, not after', owner: 'simone', by: 'ruben', from: 'FM-20930', due: 'Mon 22 Sep 2026', status: 'Open', cm: 'CM-MG', notes: [] },
    { id: 'AI-8851', t: 'Water temperature at the east wing sink out of range, log and repair', owner: 'oscar', by: 'alexis', from: 'SV-1164', due: 'Fri 8 Aug 2026', status: 'Closed', cm: 'CM-CR', closedOn: 'Wed 6 Aug 2026', notes: [{ on: 'Wed 6 Aug', by: 'oscar', t: 'Mixing valve replaced, retested at 43 C.' }] },
    { id: 'AI-8852', t: 'Agency use above 10% for four months, build a fill plan with HR', owner: 'curtis', by: 'alexis', from: 'SV-1164', due: 'Fri 19 Sep 2026', status: 'Open', cm: 'CM-CR', notes: [{ on: 'Mon 1 Sep', by: 'curtis', t: 'Two internal hires start 22 Sep. Plan drafted, not yet agreed with HR.' }], carried: true },
    { id: 'AI-8853', t: 'Survey binder missing the last two QAPI minutes', owner: 'curtis', by: 'alexis', from: 'SV-1164', due: 'Mon 18 Aug 2026', status: 'Closed', cm: 'CM-CR', closedOn: 'Fri 15 Aug 2026', notes: [] },
    { id: 'AI-8860', t: 'Assisted dining staffed below the assessed need at lunch', owner: 'imani', by: 'alexis', from: 'SV-1176', due: 'Fri 26 Sep 2026', status: 'Open', cm: 'CM-MG', notes: [] },
    { id: 'AI-8861', t: 'Isolation signage did not match the order on two rooms', owner: 'simone', by: 'alexis', from: 'SV-1176', due: 'Fri 12 Sep 2026', status: 'Overdue', cm: 'CM-MG', notes: [] },
    { id: 'AI-8870', t: 'Med room count discrepancy from 3 Sep still open', owner: 'wren', by: 'dominic', from: 'SV-1158', due: 'Fri 19 Sep 2026', status: 'Open', cm: 'CM-SB', notes: [] }
  ];
  D.action = function (id) { for (var i = 0; i < D.ACTIONS.length; i++) if (D.ACTIONS[i].id === id) return D.ACTIONS[i]; return null; };

  /* ---------------- E7 performance management ---------------- */
  D.TRACKS = [
    { key: 'attendance', name: 'Attendance', subs: ['Unscheduled absence', 'Late arrival', 'No call no show'] },
    { key: 'performance', name: 'Performance', subs: ['Care standard', 'Documentation', 'Skill competency'] },
    { key: 'conduct', name: 'Conduct', subs: ['Resident dignity', 'Policy breach', 'Insubordination'] }
  ];
  D.STEPS = [
    { key: 'coaching', name: 'Documented coaching', expiry: '6 months', letter: false },
    { key: 'written', name: 'Written warning', expiry: '12 months', letter: true },
    { key: 'final', name: 'Final written warning', expiry: '12 months', letter: true },
    { key: 'termination', name: 'Termination', expiry: null, letter: true }
  ];
  D.CASES = [
    { id: 'PC-3391', emp: 'dana', track: 'performance', sub: 'Documentation', step: 'written', status: 'Pending approval', opened: 'Mon 15 Sep 2026', by: 'priya', cm: 'CM-CR',
      evidence: ['FM-20831', 'FM-20877', 'FM-20862', 'FM-20904'], wizardStep: 4,
      approvals: [
        { who: 'priya', role: 'Initiator, Nurse Manager', state: 'Submitted', on: 'Mon 15 Sep 2026 16:22' },
        { who: 'curtis', role: 'One level above, Executive Director', state: 'Approved', on: 'Tue 16 Sep 2026 08:10' },
        { who: 'alexis', role: 'Two levels above, Regional Director', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR and Employee Relations', state: 'Waiting', on: null }],
      letter: true,
      audit: [
        { on: 'Mon 15 Sep 2026 15:48', who: 'priya', what: 'Case opened on track Performance, subtrack Documentation.' },
        { on: 'Mon 15 Sep 2026 15:52', who: 'priya', what: 'Four prior coaching forms attached automatically as evidence.' },
        { on: 'Mon 15 Sep 2026 16:09', who: 'priya', what: 'Letter generated from the Written warning template.' },
        { on: 'Mon 15 Sep 2026 16:22', who: 'priya', what: 'Routed for approval to Executive Director, Regional Director and HR.' },
        { on: 'Tue 16 Sep 2026 08:10', who: 'curtis', what: 'Approved at one level above.' }] },
    { id: 'PC-3374', emp: 'teodor', track: 'attendance', sub: 'Unscheduled absence', step: 'coaching', status: 'Active', opened: 'Thu 21 Aug 2026', by: 'wren', cm: 'CM-SB',
      evidence: ['FM-20812'], activated: 'Fri 22 Aug 2026', expires: 'Sun 22 Feb 2027', wizardStep: 5,
      approvals: [
        { who: 'wren', role: 'Initiator, Nurse Manager', state: 'Submitted', on: 'Thu 21 Aug 2026 11:30' },
        { who: 'harriet', role: 'One level above, Executive Director', state: 'Approved', on: 'Thu 21 Aug 2026 16:02' },
        { who: 'dominic', role: 'Two levels above, Regional Director', state: 'Approved', on: 'Fri 22 Aug 2026 09:14' },
        { who: 'grant', role: 'HR and Employee Relations', state: 'Approved', on: 'Fri 22 Aug 2026 10:41' }],
      letter: false,
      audit: [
        { on: 'Thu 21 Aug 2026 11:12', who: 'wren', what: 'Case opened on track Attendance, subtrack Unscheduled absence.' },
        { on: 'Fri 22 Aug 2026 10:41', who: 'grant', what: 'All approvals recorded. Case activated, step expires 22 Feb 2027.' }] },
    { id: 'PC-3360', emp: 'esther', track: 'conduct', sub: 'Policy breach', step: 'written', status: 'Active', opened: 'Tue 5 Aug 2026', by: 'simone', cm: 'CM-MG',
      evidence: [], activated: 'Thu 7 Aug 2026', expires: 'Fri 7 Aug 2027', wizardStep: 5, letter: true,
      approvals: [
        { who: 'simone', role: 'Initiator, Nurse Manager', state: 'Submitted', on: 'Tue 5 Aug 2026 09:00' },
        { who: 'ruben', role: 'One level above, Executive Director', state: 'Approved', on: 'Tue 5 Aug 2026 14:20' },
        { who: 'alexis', role: 'Two levels above, Regional Director', state: 'Approved', on: 'Wed 6 Aug 2026 08:45' },
        { who: 'grant', role: 'HR and Employee Relations', state: 'Approved', on: 'Thu 7 Aug 2026 11:05' }],
      audit: [{ on: 'Thu 7 Aug 2026 11:05', who: 'grant', what: 'Case activated. Letter acknowledged by the employee the same day.' }] },
    { id: 'PC-3402', emp: 'trevor', track: 'performance', sub: 'Skill competency', step: 'coaching', status: 'Draft', opened: 'Tue 16 Sep 2026', by: 'priya', cm: 'CM-CR',
      evidence: [], wizardStep: 2, letter: false, approvals: [], audit: [{ on: 'Tue 16 Sep 2026 10:02', who: 'priya', what: 'Draft opened. Not yet routed.' }] },
    { id: 'PC-3298', emp: 'camille', track: 'attendance', sub: 'Late arrival', step: 'coaching', status: 'Expired', opened: 'Mon 10 Mar 2026', by: 'ivan', cm: 'CM-LC',
      evidence: [], activated: 'Wed 12 Mar 2026', expires: 'Sat 12 Sep 2026', wizardStep: 5, letter: false,
      approvals: [{ who: 'ivan', role: 'Initiator, Nurse Manager', state: 'Submitted', on: 'Mon 10 Mar 2026 13:00' }],
      audit: [{ on: 'Sat 12 Sep 2026 00:00', who: 'System', what: 'Step expired after 6 months. No longer counts toward the ladder.' }] },
    { id: 'PC-3301', emp: 'kai', track: 'conduct', sub: 'Resident dignity', step: 'written', status: 'Rescinded', opened: 'Thu 19 Mar 2026', by: 'simone', cm: 'CM-MG',
      evidence: [], wizardStep: 5, letter: true,
      approvals: [{ who: 'simone', role: 'Initiator, Nurse Manager', state: 'Submitted', on: 'Thu 19 Mar 2026 09:20' }],
      audit: [{ on: 'Tue 7 Apr 2026 15:30', who: 'grant', what: 'Rescinded after grievance. Record retained, step removed from the ladder.' }] }
  ];
  D.kase = function (id) { for (var i = 0; i < D.CASES.length; i++) if (D.CASES[i].id === id) return D.CASES[i]; return null; };

  /* letter template text used by the case wizard */
  D.LETTER = function (c) {
    var e = D.byId(c.emp), s = D.STEPS.filter(function (x) { return x.key === c.step; })[0];
    return {
      title: s.name,
      body: [
        'This letter confirms a ' + s.name.toLowerCase() + ' issued to ' + e.name + ', ' + e.title + ' at ' + D.cmName(c.cm) + '.',
        'Concern: ' + D.TRACKS.filter(function (t) { return t.key === c.track; })[0].name + ', ' + c.sub + '.',
        'Prior coaching on record: ' + (c.evidence.length ? c.evidence.length + ' documented conversations between ' + '22 Jul 2026 and 12 Sep 2026' : 'none attached') + '.',
        'Expectation going forward: care plan documentation is completed before leaving the floor at the end of every shift, with no exceptions.',
        'Support provided: a shadow shift with a peer, a documentation reminder on the shift device, and twice weekly check ins with the Nurse Manager for four weeks.',
        'Consequence if the expectation is not met: the next step on this track is a final written warning.',
        (s.expiry ? 'This step remains active for ' + s.expiry + ' from the date of activation.' : '')
      ].filter(Boolean)
    };
  };

  /* ---------------- E9 reporting ---------------- */
  D.COMPLETION = [
    { scope: 'CM-CR', label: 'Cedar Ridge', due: 62, done: 42, leaders: 5, onTime: 71 },
    { scope: 'CM-MG', label: 'Maple Grove', due: 74, done: 68, leaders: 6, onTime: 92 },
    { scope: 'CM-LC', label: 'Lakeview Commons', due: 41, done: 39, leaders: 4, onTime: 95 },
    { scope: 'CM-SB', label: 'Stonebrook', due: 69, done: 44, leaders: 6, onTime: 64 },
    { scope: 'CM-WP', label: 'Willow Park', due: 52, done: 47, leaders: 5, onTime: 90 },
    { scope: 'CM-BT', label: 'Birchwood Terrace', due: 34, done: 33, leaders: 3, onTime: 97 }
  ];
  D.COMPLETION_BY_LEADER = [
    { who: 'priya', due: 22, done: 15 }, { who: 'imani', due: 11, done: 9 }, { who: 'oscar', due: 9, done: 8 },
    { who: 'curtis', due: 12, done: 6 }, { who: 'simone', due: 24, done: 23 }, { who: 'malik', due: 12, done: 11 },
    { who: 'ruben', due: 14, done: 13 }, { who: 'ivan', due: 18, done: 17 }, { who: 'wren', due: 26, done: 16 },
    { who: 'harriet', due: 13, done: 8 }, { who: 'jonah', due: 15, done: 14 }
  ];
  D.FORMS_BY_TYPE = [
    ['FT-OBS', 186], ['FT-HUD', 142], ['FT-REC', 88], ['FT-CHK', 71], ['FT-SKV', 34], ['FT-GPL', 41],
    ['FT-L11', 63], ['FT-MRC', 19], ['FT-LDP', 11], ['FT-CWT', 14], ['FT-MRA', 22], ['FT-DIN', 18], ['FT-INF', 26]
  ];
  D.VERBATIMS = [
    { t: 'The night shift answers the light before I finish pressing it. The evening shift is a different story.', src: 'Family survey', cm: 'CM-CR', on: 'Sep 2026', theme: 'Call light response', tone: 'mixed' },
    { t: 'Dana always explains what she is doing before she does it. My mother is not startled any more.', src: 'Family survey', cm: 'CM-CR', on: 'Sep 2026', theme: 'Dignity and approach', tone: 'positive' },
    { t: 'Lunch arrives cold twice a week. Nobody asks whether she wants something else.', src: 'Resident council', cm: 'CM-CR', on: 'Aug 2026', theme: 'Dining', tone: 'negative' },
    { t: 'There are too many agency faces. Mum asks who they are every morning.', src: 'Family survey', cm: 'CM-SB', on: 'Sep 2026', theme: 'Staffing consistency', tone: 'negative' },
    { t: 'The care plan meeting actually happened on the day it was booked, which is new.', src: 'Family survey', cm: 'CM-MG', on: 'Sep 2026', theme: 'Care planning', tone: 'positive' },
    { t: 'Junie noticed the rash before anyone else did and got the nurse straight away.', src: 'Family survey', cm: 'CM-WP', on: 'Sep 2026', theme: 'Clinical vigilance', tone: 'positive' },
    { t: 'I waited forty minutes for help to the bathroom on a Sunday.', src: 'Resident council', cm: 'CM-SB', on: 'Sep 2026', theme: 'Call light response', tone: 'negative' },
    { t: 'The activities calendar on the wall has not matched what happens for a month.', src: 'Resident council', cm: 'CM-CR', on: 'Aug 2026', theme: 'Life enrichment', tone: 'negative' }
  ];
  D.VERBATIM_THEMES = [['Call light response', 34], ['Staffing consistency', 26], ['Dining', 21], ['Dignity and approach', 18], ['Care planning', 14], ['Life enrichment', 9], ['Clinical vigilance', 7]];

  /* ---------------- E10 integrity ---------------- */
  D.GUARDRAILS = [
    { id: 'GR-1', name: 'Restricted investigatory material', state: 'Blocked', desc: 'Abuse, neglect and exploitation investigations are held in the Employee Relations case system, not here. Free text fields reject uploads and text tagged to an open investigation.' },
    { id: 'GR-2', name: 'Protected health information in free text', state: 'Warned', desc: 'Resident names typed into an observation are flagged before submission. The leader is asked to use the room or initials instead.' },
    { id: 'GR-3', name: 'Protected characteristic language', state: 'Warned', desc: 'Language describing age, disability, pregnancy, religion or national origin is flagged for rewording before the record becomes immutable.' },
    { id: 'GR-4', name: 'Coaching outside the reporting line', state: 'Allowed with attribution', desc: 'Cross group suggestions are visible to the employee leader and are always attributed to the suggesting department.' },
    { id: 'GR-5', name: 'Backdating a submission', state: 'Blocked', desc: 'The submitted timestamp is server side. A form completed late records the true time and shows the gap.' }
  ];
  D.RETENTION = [
    { what: 'Coaching forms and site visits', keep: '7 years from submission', then: 'Anonymised, aggregate reporting retained' },
    { what: 'Active discipline steps', keep: 'Until step expiry, then 7 years', then: 'Removed from the ladder, retained in the file' },
    { what: 'Rescinded records', keep: '7 years, flagged as rescinded', then: 'Never counted toward a later step' },
    { what: 'Employee file exports', keep: 'Export log kept 7 years', then: 'The export package itself is not stored' },
    { what: 'Geolocation and duration telemetry', keep: '2 years', then: 'Dropped from the record, form remains' }
  ];

  /* ---------------- cross group (E3) ---------------- */
  D.CROSS = [
    { id: 'XG-221', emp: 'nadia', by: 'talia', cm: 'CM-CR', on: 'Mon 14 Sep 2026', topic: 'Med room door found unlocked during an infection control round', state: 'Sent to leader', leader: 'priya', suggest: 'FT-CHK' },
    { id: 'XG-219', emp: 'halle', by: 'talia', cm: 'CM-CR', on: 'Thu 10 Sep 2026', topic: 'Isolation PPE cart restocked without being asked, twice in one week', state: 'Accepted', leader: 'oscar', suggest: 'FT-REC' },
    { id: 'XG-214', emp: 'teodor', by: 'talia', cm: 'CM-SB', on: 'Tue 2 Sep 2026', topic: 'Linen bagged in the corridor rather than at the point of use', state: 'Sent to leader', leader: 'wren', suggest: 'FT-CHK' },
    { id: 'XG-208', emp: 'esther', by: 'talia', cm: 'CM-MG', on: 'Wed 20 Aug 2026', topic: 'Hand hygiene missed between two residents during a walkthrough', state: 'Declined', leader: 'simone', suggest: 'FT-CHK', why: 'Already coached on 18 Aug, form FM-20850.' }
  ];

  /* ---------------- notifications ---------------- */
  D.NOTIFS = {
    frontline: [
      { t: 'Your written warning letter is waiting for acknowledgement', time: '2h', ic: 'file-text', go: '#/mydocs', unread: true },
      { t: 'Action item AI-8794 is overdue', time: '1d', ic: 'triangle-alert', go: '#/actions', unread: true },
      { t: 'Priya Raghavan documented a care observation about you', time: '4d', ic: 'clipboard-list', go: '#/mydocs', unread: false }
    ],
    manager: [
      { t: 'TP-4471 for Dana Whitfield is overdue', time: '3h', ic: 'triangle-alert', go: '#/coaching', unread: true },
      { t: 'Case PC-3391 approved by Curtis Nakamura', time: '6h', ic: 'circle-check', go: '#/cases/PC-3391', unread: true },
      { t: 'Quality sent you a cross group suggestion for Nadia Farouk', time: '2d', ic: 'shield', go: '#/coaching/crossgroup', unread: true },
      { t: 'Your manager rounding coaching TP-4520 is due Friday', time: '2d', ic: 'compass', go: '#/coaching', unread: false }
    ],
    ed: [
      { t: 'Regional site visit SV-1182 is in progress at Cedar Ridge', time: '1h', ic: 'building-2', go: '#/visits/SV-1182', unread: true },
      { t: 'Case PC-3391 needs your approval', time: '1d', ic: 'gavel', go: '#/cases/PC-3391', unread: false },
      { t: 'Cedar Ridge touch point completion is 68%', time: '2d', ic: 'chart-column', go: '#/reports', unread: true }
    ],
    regional: [
      { t: 'Case PC-3391 is waiting for your approval', time: '5h', ic: 'gavel', go: '#/cases/PC-3391', unread: true },
      { t: 'Cedar Ridge agency hours passed 11% for a fourth month', time: '1d', ic: 'trending-up', go: '#/reports', unread: true },
      { t: 'Site visit SV-1190 at Lakeview Commons is due 26 Sep', time: '3d', ic: 'calendar', go: '#/visits', unread: false }
    ],
    hr: [
      { t: 'Case PC-3391 will reach you after the regional approval', time: '5h', ic: 'gavel', go: '#/cases/PC-3391', unread: true },
      { t: 'Employee file export requested for a grievance hearing', time: '1d', ic: 'package', go: '#/reports/exports', unread: true },
      { t: 'PC-3298 expired on 12 Sep and left the ladder', time: '4d', ic: 'hourglass', go: '#/cases/PC-3298', unread: false }
    ],
    quality: [
      { t: 'Cross group suggestion XG-221 was sent to the leader', time: '2d', ic: 'shield', go: '#/coaching/crossgroup', unread: true },
      { t: 'Stonebrook falls rate passed the survey threshold', time: '3d', ic: 'triangle-alert', go: '#/reports', unread: true }
    ],
    admin: [
      { t: 'RULE-14 is still switched off after 21 days in draft', time: '1d', ic: 'sliders-horizontal', go: '#/settings/rules', unread: true },
      { t: 'Two forms were deleted this month and are in the deleted view', time: '6d', ic: 'trash-2', go: '#/docs/deleted', unread: false }
    ]
  };
})();
