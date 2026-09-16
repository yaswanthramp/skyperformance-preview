/* skyPerformance wireframe: sample data.
   Deliberately industry neutral. The hierarchy is Organization > Division >
   Location > Department > Employee, which is the shape most HRIS systems
   export, so the product reads the same for a retailer, a manufacturer, a
   contact centre or a care provider. Fictional company, fictional people,
   fabricated numbers. */
(function () {
  var D = window.SP = {};

  D.ORG = 'Northwind Group';
  D.ORG_SHORT = 'Northwind';
  D.ORG_DESC = 'Multi-site operations and customer service business, 6 locations';
  D.TODAY = 'Tue 16 Sep 2026';
  D.CYCLE = 'Q3 2026 (Jul to Sep)';
  D.HRIS = 'Workforce HRIS';

  /* ---------------- hierarchy (synced from the HRIS, read only here) ---------------- */
  D.LEVELS = ['Organization', 'Division', 'Location', 'Department', 'Employee'];
  D.DIVISIONS = [
    { id: 'DIV-N', name: 'Northern Division', lead: 'alexis' },
    { id: 'DIV-S', name: 'Southern Division', lead: 'dominic' }
  ];
  D.LOCATIONS = [
    { id: 'LOC-AS', name: 'Ashford', div: 'DIV-N', city: 'Ashford', head: 'curtis', size: 96, type: 'Operations and service centre' },
    { id: 'LOC-BR', name: 'Brackenfield', div: 'DIV-N', city: 'Brackenfield', head: 'ruben', size: 120, type: 'Operations and service centre' },
    { id: 'LOC-CA', name: 'Calderton', div: 'DIV-N', city: 'Calderton', head: 'bernadette', size: 74, type: 'Service centre' },
    { id: 'LOC-DU', name: 'Dunmore', div: 'DIV-S', city: 'Dunmore', head: 'harriet', size: 110, type: 'Operations and service centre' },
    { id: 'LOC-EA', name: 'Eastgate', div: 'DIV-S', city: 'Eastgate', head: 'jonah', size: 88, type: 'Operations centre' },
    { id: 'LOC-FA', name: 'Fairhaven', div: 'DIV-S', city: 'Fairhaven', head: 'harriet', size: 64, type: 'Service centre' }
  ];
  D.DEPTS = ['Operations', 'Customer Service', 'Quality', 'Logistics', 'Technical Support', 'Facilities'];

  /* ---------------- people ---------------- */
  function p(id, name, title, dept, loc, level, mgr, hired, extra) {
    var o = { id: id, name: name, title: title, dept: dept, loc: loc, level: level, mgr: mgr, hired: hired,
      ini: name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  /* level: org | division | location | dept | staff. mgr is the HRIS reporting line. */
  D.PEOPLE = [
    p('nadine', 'Nadine Okonkwo', 'Chief Operating Officer', 'Executive', null, 'org', null, 'Apr 2017'),
    p('alexis', 'Alexis Moreau', 'Division Director', 'Operations', null, 'division', 'nadine', 'Mar 2021', { div: 'DIV-N' }),
    p('dominic', 'Dominic Sarr', 'Division Director', 'Operations', null, 'division', 'nadine', 'Aug 2019', { div: 'DIV-S' }),
    p('grant', 'Grant Ihejirika', 'HR Business Partner', 'People', null, 'org', 'nadine', 'Jan 2018'),
    p('talia', 'Talia Brennan', 'Head of Quality and Compliance', 'Quality', null, 'org', 'nadine', 'Jun 2020'),

    /* Ashford */
    p('curtis', 'Curtis Nakamura', 'Location Director', 'Operations', 'LOC-AS', 'location', 'alexis', 'Sep 2019'),
    p('priya', 'Priya Raghavan', 'Operations Manager', 'Operations', 'LOC-AS', 'dept', 'curtis', 'Apr 2022'),
    p('dana', 'Dana Whitfield', 'Operations Associate', 'Operations', 'LOC-AS', 'staff', 'priya', 'Feb 2025'),
    p('lorna', 'Lorna Bekele', 'Operations Associate', 'Operations', 'LOC-AS', 'staff', 'priya', 'Nov 2023'),
    p('trevor', 'Trevor Ansley', 'Operations Associate', 'Operations', 'LOC-AS', 'staff', 'priya', 'Jun 2026'),
    p('marisol', 'Marisol Quintero', 'Senior Operations Associate', 'Operations', 'LOC-AS', 'staff', 'priya', 'Aug 2021'),
    p('nadia', 'Nadia Farouk', 'Operations Associate', 'Operations', 'LOC-AS', 'staff', 'priya', 'Mar 2024'),
    p('imani', 'Imani Clarke', 'Customer Service Manager', 'Customer Service', 'LOC-AS', 'dept', 'curtis', 'May 2020'),
    p('devon', 'Devon Pryce', 'Customer Service Advisor', 'Customer Service', 'LOC-AS', 'staff', 'imani', 'Jan 2026'),
    p('yolanda', 'Yolanda Briggs', 'Customer Service Advisor', 'Customer Service', 'LOC-AS', 'staff', 'imani', 'Sep 2022'),
    p('oscar', 'Oscar Lindqvist', 'Facilities Manager', 'Facilities', 'LOC-AS', 'dept', 'curtis', 'Oct 2017'),
    p('halle', 'Halle Ostrom', 'Facilities Technician', 'Facilities', 'LOC-AS', 'staff', 'oscar', 'Jul 2024'),

    /* Brackenfield */
    p('ruben', 'Ruben Castellanos', 'Location Director', 'Operations', 'LOC-BR', 'location', 'alexis', 'Feb 2018'),
    p('simone', 'Simone Adeyemi', 'Operations Manager', 'Operations', 'LOC-BR', 'dept', 'ruben', 'Sep 2023'),
    p('kai', 'Kai Thornbury', 'Operations Associate', 'Operations', 'LOC-BR', 'staff', 'simone', 'Apr 2024'),
    p('esther', 'Esther Vaneck', 'Operations Associate', 'Operations', 'LOC-BR', 'staff', 'simone', 'Dec 2022'),
    p('malik', 'Malik Osei', 'Logistics Manager', 'Logistics', 'LOC-BR', 'dept', 'ruben', 'Mar 2021'),

    /* Calderton */
    p('bernadette', 'Bernadette Kohl', 'Location Director', 'Operations', 'LOC-CA', 'location', 'alexis', 'Nov 2020'),
    p('ivan', 'Ivan Petrosyan', 'Customer Service Manager', 'Customer Service', 'LOC-CA', 'dept', 'bernadette', 'Jan 2024'),
    p('camille', 'Camille Doucet', 'Customer Service Advisor', 'Customer Service', 'LOC-CA', 'staff', 'ivan', 'Aug 2025'),

    /* Southern */
    p('harriet', 'Harriet Odum', 'Location Director', 'Operations', 'LOC-DU', 'location', 'dominic', 'Jun 2016'),
    p('jonah', 'Jonah Reyes-Pike', 'Location Director', 'Operations', 'LOC-EA', 'location', 'dominic', 'Feb 2022'),
    p('wren', 'Wren Abbasi', 'Operations Manager', 'Operations', 'LOC-DU', 'dept', 'harriet', 'Jul 2023'),
    p('teodor', 'Teodor Balan', 'Operations Associate', 'Operations', 'LOC-DU', 'staff', 'wren', 'Mar 2023'),
    p('junie', 'Junie Mbeki', 'Technical Support Analyst', 'Technical Support', 'LOC-EA', 'staff', 'jonah', 'Oct 2024')
  ];
  D.byId = function (id) { for (var i = 0; i < D.PEOPLE.length; i++) if (D.PEOPLE[i].id === id) return D.PEOPLE[i]; return { id: id, name: id, ini: '?', title: '', dept: '', loc: null }; };
  D.loc = function (id) { for (var i = 0; i < D.LOCATIONS.length; i++) if (D.LOCATIONS[i].id === id) return D.LOCATIONS[i]; return { id: id, name: 'All locations', div: null }; };
  D.locName = function (id) { return id ? D.loc(id).name : D.ORG; };
  D.div = function (id) { for (var i = 0; i < D.DIVISIONS.length; i++) if (D.DIVISIONS[i].id === id) return D.DIVISIONS[i]; return { id: id, name: 'All divisions' }; };
  D.reports = function (id) { return D.PEOPLE.filter(function (x) { return x.mgr === id; }); };
  /* every person under someone, at any depth */
  D.branch = function (id) {
    var out = [], q = D.reports(id);
    while (q.length) { var x = q.shift(); out.push(x); q = q.concat(D.reports(x.id)); }
    return out;
  };
  D.path = function (id) {
    var out = [], cur = D.byId(id);
    while (cur && cur.id) { out.unshift(cur); cur = cur.mgr ? D.byId(cur.mgr) : null; }
    return out;
  };

  /* ---------------- roles: three, as the client uses them ---------------- */
  D.ROLES = [
    { key: 'employee', person: 'dana', label: 'Employee', sub: 'Subject of the record',
      note: 'Sees only their own file: coaching they received, what they agreed to, and anything waiting to be acknowledged.' },
    { key: 'manager', person: 'priya', label: 'Manager', sub: 'Runs the coaching',
      note: 'Runs the coaching, owns the completion number, and starts a performance case. Scope follows the reporting line and can be changed to any branch at or below their own.' },
    { key: 'hr', person: 'grant', label: 'HR', sub: 'Approver, configuration and the file',
      note: 'Reviews every case, configures form types and rules, and owns the employee file export. Sees the whole organisation.' }
  ];

  /* ---------------- performance measures (E2), industry neutral ---------------- */
  D.MEASURES = [
    { id: 'msr.quality', name: 'Quality score', unit: '%', dir: 'up', target: 95, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Work quality' },
    { id: 'msr.output', name: 'Output per shift', unit: 'units', dir: 'up', target: 42, fmt: function (v) { return v.toFixed(1); }, domain: 'Productivity' },
    { id: 'msr.csat', name: 'Customer satisfaction', unit: '/5', dir: 'up', target: 4.4, fmt: function (v) { return v.toFixed(2) + ' / 5'; }, domain: 'Experience' },
    { id: 'msr.adherence', name: 'Schedule adherence', unit: '%', dir: 'up', target: 95, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Workforce' },
    { id: 'msr.absence', name: 'Unplanned absence', unit: '%', dir: 'down', target: 4, fmt: function (v) { return v.toFixed(1) + '%'; }, domain: 'Workforce' },
    { id: 'msr.safety', name: 'Safety incidents per 100 staff', unit: 'rate', dir: 'down', target: 2.5, fmt: function (v) { return v.toFixed(1); }, domain: 'Safety' },
    { id: 'msr.retention', name: '90 day new starter retention', unit: '%', dir: 'up', target: 80, fmt: function (v) { return v.toFixed(0) + '%'; }, domain: 'Workforce' },
    { id: 'msr.training', name: 'Training completion', unit: '%', dir: 'up', target: 95, fmt: function (v) { return v.toFixed(0) + '%'; }, domain: 'Capability' }
  ];
  D.measure = function (id) { for (var i = 0; i < D.MEASURES.length; i++) if (D.MEASURES[i].id === id) return D.MEASURES[i]; return null; };

  /* [measure, location, value, priorMonth, last six months] */
  D.METRICS = [
    ['msr.quality', 'LOC-AS', 91.2, 92.4, [95.1, 94.4, 93.8, 93.2, 92.4, 91.2]],
    ['msr.quality', 'LOC-BR', 96.4, 96.1, [95.2, 95.5, 95.8, 96.0, 96.1, 96.4]],
    ['msr.quality', 'LOC-CA', 97.8, 97.6, [97.1, 97.2, 97.4, 97.5, 97.6, 97.8]],
    ['msr.quality', 'LOC-DU', 89.6, 90.4, [92.8, 92.1, 91.5, 90.9, 90.4, 89.6]],
    ['msr.quality', 'LOC-EA', 94.7, 94.3, [93.4, 93.6, 93.9, 94.1, 94.3, 94.7]],
    ['msr.quality', 'LOC-FA', 98.1, 98.0, [97.6, 97.7, 97.8, 97.9, 98.0, 98.1]],
    ['msr.output', 'LOC-AS', 36.4, 38.1, [41.2, 40.4, 39.6, 38.9, 38.1, 36.4]],
    ['msr.output', 'LOC-BR', 44.2, 43.6, [42.1, 42.5, 42.9, 43.2, 43.6, 44.2]],
    ['msr.output', 'LOC-CA', 45.8, 45.4, [44.2, 44.6, 44.9, 45.1, 45.4, 45.8]],
    ['msr.output', 'LOC-DU', 38.2, 39.0, [41.0, 40.6, 40.1, 39.6, 39.0, 38.2]],
    ['msr.output', 'LOC-EA', 43.1, 42.7, [41.6, 41.9, 42.2, 42.4, 42.7, 43.1]],
    ['msr.output', 'LOC-FA', 46.3, 46.1, [45.4, 45.6, 45.8, 45.9, 46.1, 46.3]],
    ['msr.csat', 'LOC-AS', 4.21, 4.28, [4.40, 4.36, 4.33, 4.30, 4.28, 4.21]],
    ['msr.csat', 'LOC-BR', 4.52, 4.49, [4.42, 4.44, 4.46, 4.47, 4.49, 4.52]],
    ['msr.csat', 'LOC-CA', 4.61, 4.60, [4.55, 4.57, 4.58, 4.59, 4.60, 4.61]],
    ['msr.csat', 'LOC-DU', 4.18, 4.22, [4.31, 4.29, 4.27, 4.25, 4.22, 4.18]],
    ['msr.csat', 'LOC-EA', 4.44, 4.41, [4.34, 4.36, 4.38, 4.40, 4.41, 4.44]],
    ['msr.csat', 'LOC-FA', 4.58, 4.56, [4.50, 4.52, 4.54, 4.55, 4.56, 4.58]],
    ['msr.adherence', 'LOC-AS', 90.4, 91.8, [94.1, 93.4, 92.8, 92.2, 91.8, 90.4]],
    ['msr.adherence', 'LOC-BR', 96.2, 95.9, [95.0, 95.2, 95.5, 95.7, 95.9, 96.2]],
    ['msr.adherence', 'LOC-CA', 97.4, 97.2, [96.7, 96.8, 97.0, 97.1, 97.2, 97.4]],
    ['msr.adherence', 'LOC-DU', 88.9, 89.7, [92.1, 91.4, 90.8, 90.2, 89.7, 88.9]],
    ['msr.adherence', 'LOC-EA', 94.3, 93.9, [93.0, 93.2, 93.5, 93.7, 93.9, 94.3]],
    ['msr.adherence', 'LOC-FA', 97.8, 97.7, [97.3, 97.4, 97.5, 97.6, 97.7, 97.8]],
    ['msr.absence', 'LOC-AS', 8.6, 7.4, [4.2, 5.1, 6.0, 6.8, 7.4, 8.6]],
    ['msr.absence', 'LOC-BR', 3.1, 3.6, [5.0, 4.6, 4.2, 3.9, 3.6, 3.1]],
    ['msr.absence', 'LOC-CA', 2.2, 2.4, [3.0, 2.8, 2.7, 2.5, 2.4, 2.2]],
    ['msr.absence', 'LOC-DU', 9.2, 8.1, [5.8, 6.6, 7.0, 7.6, 8.1, 9.2]],
    ['msr.absence', 'LOC-EA', 4.4, 4.8, [5.9, 5.6, 5.3, 5.0, 4.8, 4.4]],
    ['msr.absence', 'LOC-FA', 1.9, 2.0, [2.4, 2.3, 2.2, 2.1, 2.0, 1.9]],
    ['msr.safety', 'LOC-AS', 3.4, 3.1, [2.2, 2.5, 2.7, 2.9, 3.1, 3.4]],
    ['msr.safety', 'LOC-BR', 2.1, 2.2, [2.6, 2.5, 2.4, 2.3, 2.2, 2.1]],
    ['msr.safety', 'LOC-CA', 1.4, 1.5, [1.8, 1.7, 1.7, 1.6, 1.5, 1.4]],
    ['msr.safety', 'LOC-DU', 4.1, 3.8, [3.0, 3.2, 3.4, 3.6, 3.8, 4.1]],
    ['msr.safety', 'LOC-EA', 2.3, 2.4, [2.7, 2.6, 2.6, 2.5, 2.4, 2.3]],
    ['msr.safety', 'LOC-FA', 1.2, 1.3, [1.5, 1.4, 1.4, 1.3, 1.3, 1.2]],
    ['msr.retention', 'LOC-AS', 64, 69, [78, 76, 74, 72, 69, 64]],
    ['msr.retention', 'LOC-BR', 82, 81, [77, 78, 79, 80, 81, 82]],
    ['msr.retention', 'LOC-CA', 88, 87, [84, 85, 86, 86, 87, 88]],
    ['msr.retention', 'LOC-DU', 58, 61, [70, 68, 66, 64, 61, 58]],
    ['msr.retention', 'LOC-EA', 79, 78, [74, 75, 76, 77, 78, 79]],
    ['msr.retention', 'LOC-FA', 91, 90, [88, 88, 89, 89, 90, 91]],
    ['msr.training', 'LOC-AS', 88, 91, [97, 95, 94, 93, 91, 88]],
    ['msr.training', 'LOC-BR', 96, 95, [93, 94, 94, 95, 95, 96]],
    ['msr.training', 'LOC-CA', 98, 98, [97, 97, 98, 98, 98, 98]],
    ['msr.training', 'LOC-DU', 90, 91, [94, 93, 93, 92, 91, 90]],
    ['msr.training', 'LOC-EA', 95, 95, [94, 94, 95, 95, 95, 95]],
    ['msr.training', 'LOC-FA', 97, 97, [96, 96, 97, 97, 97, 97]]
  ];
  D.metric = function (m, loc) {
    for (var i = 0; i < D.METRICS.length; i++) if (D.METRICS[i][0] === m && D.METRICS[i][1] === loc) {
      var x = D.METRICS[i]; return { m: m, loc: loc, v: x[2], prior: x[3], trend: x[4] };
    }
    return null;
  };
  D.attain = function (m, v) { var s = D.measure(m); return s.dir === 'up' ? Math.round(v / s.target * 100) : Math.round(s.target / v * 100); };
  D.onTarget = function (m, v) { var s = D.measure(m); return s.dir === 'up' ? v >= s.target : v <= s.target; };
  D.EMP_MEASURES = {
    dana: [['msr.quality', 86.4], ['msr.output', 33.2], ['msr.adherence', 88.1]],
    lorna: [['msr.quality', 97.8], ['msr.output', 44.6], ['msr.adherence', 98.2]],
    trevor: [['msr.quality', 88.2], ['msr.output', 31.4], ['msr.training', 62]],
    marisol: [['msr.quality', 98.1], ['msr.output', 46.2], ['msr.adherence', 97.4]],
    nadia: [['msr.quality', 92.6], ['msr.output', 38.8], ['msr.adherence', 93.0]],
    devon: [['msr.csat', 4.05], ['msr.adherence', 90.2]],
    yolanda: [['msr.csat', 4.62], ['msr.adherence', 96.8]],
    halle: [['msr.safety', 1.0], ['msr.quality', 94.2]],
    kai: [['msr.quality', 96.1], ['msr.output', 43.9]],
    esther: [['msr.quality', 91.4], ['msr.adherence', 89.6]],
    camille: [['msr.csat', 4.71], ['msr.adherence', 98.0]],
    teodor: [['msr.quality', 87.9], ['msr.absence', 9.8]],
    junie: [['msr.csat', 4.55], ['msr.quality', 95.2]]
  };

  /* ---------------- form catalogue (E4) ----------------
     Three families, one shared skeleton. Adding a type is configuration. */
  D.FORM_FAMILIES = [
    { key: 'staff', name: 'Employee coaching', desc: 'Run on an individual by their direct manager.' },
    { key: 'leader', name: 'Leader coaching', desc: 'Run on a manager by the leader above them.' },
    { key: 'ops', name: 'Operational review', desc: 'Run on a location or a process rather than a person.' }
  ];
  D.FORM_TYPES = [
    { id: 'FT-OBS', name: 'Performance observation', fam: 'staff', ic: 'binoculars', mins: 12, qs: 9, scored: true, level: 'Employee', desc: 'Watch a task end to end and score it against the standard.' },
    { id: 'FT-HUD', name: 'Team huddle', fam: 'staff', ic: 'users', mins: 8, qs: 6, scored: false, level: 'Employee', desc: 'Group touch point at shift change. Records who attended and the topic covered.' },
    { id: 'FT-REC', name: 'Recognition', fam: 'staff', ic: 'award', mins: 4, qs: 4, scored: false, level: 'Employee', desc: 'Positive documentation. Counts toward the touch point target and toward retention reporting.' },
    { id: 'FT-CHK', name: 'Check in', fam: 'staff', ic: 'message-square-text', mins: 10, qs: 7, scored: false, level: 'Employee', desc: 'Measure driven conversation on one topic. Opened automatically by a rule.' },
    { id: 'FT-SKV', name: 'Skill validation', fam: 'staff', ic: 'badge-check', mins: 20, qs: 14, scored: true, level: 'Employee', desc: 'Competency sign off against a checklist. Feeds the capability record.' },
    { id: 'FT-GPL', name: 'Mid cycle goal plan', fam: 'staff', ic: 'target', mins: 18, qs: 10, scored: false, level: 'Employee', desc: 'Sets the goals the rest of the cycle is coached against.' },
    { id: 'FT-L11', name: 'Leader one to one', fam: 'leader', ic: 'handshake', mins: 25, qs: 11, scored: false, level: 'Manager', desc: 'Standing conversation between a manager and the leader above them.' },
    { id: 'FT-LDP', name: 'Leader development plan', fam: 'leader', ic: 'graduation-cap', mins: 30, qs: 12, scored: false, level: 'Manager', desc: 'Ninety day development plan for a manager.' },
    { id: 'FT-MRC', name: 'Manager coaching review', fam: 'leader', ic: 'compass', mins: 22, qs: 13, scored: true, level: 'Manager', desc: 'Coaches the coach. Scores how the manager ran their own coaching.' },
    { id: 'FT-LOC', name: 'Location review', fam: 'ops', ic: 'building-2', mins: 95, qs: 118, scored: true, level: 'Location', desc: 'The full eight section operational review. Long form, completed on site.' },
    { id: 'FT-CMP', name: 'Compliance audit', fam: 'ops', ic: 'shield-check', mins: 25, qs: 22, scored: true, level: 'Location', desc: 'Records, controls and sign offs against policy.' },
    { id: 'FT-SVC', name: 'Service observation', fam: 'ops', ic: 'headphones', mins: 30, qs: 19, scored: true, level: 'Department', desc: 'End to end customer interaction, from first contact to resolution.' },
    { id: 'FT-SAF', name: 'Safety walk', fam: 'ops', ic: 'shield-alert', mins: 20, qs: 16, scored: true, level: 'Location', desc: 'Hazards, equipment, signage and protective equipment.' }
  ];
  D.formType = function (id) { for (var i = 0; i < D.FORM_TYPES.length; i++) if (D.FORM_TYPES[i].id === id) return D.FORM_TYPES[i]; return null; };

  /* the one skeleton every form type shares */
  D.FORM_SKELETON = [
    { key: 'instructions', name: 'Instructions', ic: 'info', desc: 'Why this form exists and how to use it. Read only.' },
    { key: 'snapshot', name: 'Performance snapshot', ic: 'chart-column', desc: 'Measures pulled live at the moment the form opens.' },
    { key: 'observation', name: 'Observation', ic: 'clipboard-list', desc: 'The scored or written body of the form.' },
    { key: 'actions', name: 'Action items', ic: 'list-checks', desc: 'What happens next, who owns it and by when.' },
    { key: 'info', name: 'Form information', ic: 'file-text', desc: 'Duration, location, attestation and the hierarchy path.' },
    { key: 'submit', name: 'Submit, cancel or close', ic: 'send', desc: 'Read the whole record back before it becomes immutable.' }
  ];

  D.QUESTIONS = {
    'FT-OBS': [
      { s: 'Preparation', qs: [
        'Had everything needed to start the task without leaving the workstation.',
        'Confirmed the request and the expected outcome before starting.',
        'Followed the current version of the procedure, not a remembered one.'] },
      { s: 'Execution', qs: [
        'Completed each step in the required order.',
        'Used the correct system and recorded the work as they went.',
        'Asked for help at the point of doubt rather than after the error.'] },
      { s: 'Close out', qs: [
        'Checked their own work before marking it complete.',
        'Recorded the outcome in the system before the end of the shift.',
        'Handed off anything unresolved to the next shift.'] }
    ],
    'FT-SKV': [
      { s: 'Preparation', qs: ['Gathered what was needed before starting.', 'Confirmed the task and the acceptance criteria.', 'Explained what they were about to do.', 'Set up safely and correctly.'] },
      { s: 'Procedure', qs: ['Followed each step of the checklist in order.', 'Kept to the quality standard throughout.', 'Handled the exception case correctly.', 'Used the correct settings and tools.', 'Kept the customer or colleague informed.'] },
      { s: 'Documentation', qs: ['Recorded the outcome in the system.', 'Reported the variance to the manager.', 'Completed the task within the expected time.'] },
      { s: 'Sign off', qs: ['Able to perform this task unsupervised.', 'Validator observed the whole task, not a part of it.'] }
    ],
    'FT-MRC': [
      { s: 'Preparation', qs: ['Reviewed the measures before the conversation.', 'Knew who on the team was behind on touch points.', 'Had prior action items to hand.'] },
      { s: 'In the conversation', qs: ['Asked open questions rather than checking boxes.', 'Observed the work rather than only talking about it.', 'Gave a specific example rather than a general comment.', 'Named the standard being coached to.'] },
      { s: 'Documentation', qs: ['Completed the form within twenty four hours.', 'Wrote action items that name an owner and a date.', 'Language is specific enough to be defensible.'] },
      { s: 'Follow through', qs: ['Closed prior action items that were due.', 'Escalated the repeat trend rather than recoaching it a fourth time.', 'Recognised as well as corrected.'] }
    ],
    'FT-CMP': [
      { s: 'Records', qs: ['Required records complete for the last thirty days.', 'Sign offs present and by the right person.', 'Exceptions logged with a reason.', 'No out of date documents in use.'] },
      { s: 'Controls', qs: ['Access rights match the current role list.', 'Dual control applied where the policy requires it.', 'Discrepancies from the last thirty days closed out.'] },
      { s: 'Training', qs: ['Mandatory training complete for everyone on shift.', 'New starters signed off before working unsupervised.', 'Refresher training in date.'] },
      { s: 'Environment', qs: ['Work area clean and uncluttered.', 'Equipment in date and serviceable.', 'Emergency equipment sealed and accessible.'] }
    ],
    'FT-SVC': [
      { s: 'Opening', qs: ['Greeted the customer and confirmed who they were.', 'Set expectations for how long it would take.', 'Checked the account or record before asking the customer to repeat it.'] },
      { s: 'Handling', qs: ['Listened without interrupting.', 'Used plain language rather than internal jargon.', 'Offered the right option rather than the easiest one.', 'Kept the customer informed during any hold or wait.'] },
      { s: 'Resolution', qs: ['Resolved at first contact where it was possible.', 'Explained clearly what happens next and when.', 'Confirmed the customer was satisfied before closing.'] },
      { s: 'After the contact', qs: ['Recorded the contact accurately.', 'Raised the follow up where one was needed.', 'Flagged the process fault rather than working around it again.'] }
    ],
    'FT-SAF': [
      { s: 'Hazards', qs: ['Walkways clear and unobstructed.', 'Spills and trip hazards dealt with at the point of use.', 'Signage current and visible.'] },
      { s: 'Equipment', qs: ['Equipment inspected and in date.', 'Guards and cut outs in place and working.', 'Faulty equipment tagged and removed from use.'] },
      { s: 'Protective equipment', qs: ['Correct equipment available at the point of need.', 'Staff observed using it.', 'Stock levels adequate for the next week.'] },
      { s: 'Records', qs: ['Incident log current.', 'Near misses recorded, not just incidents.', 'Last inspection actions closed.'] }
    ]
  };
  D.questionsFor = function (id) { return D.QUESTIONS[id] || D.QUESTIONS['FT-OBS']; };

  /* the eight section long form (E5), generic */
  D.REVIEW_SECTIONS = [
    { key: 'readiness', name: 'Opening and readiness', ic: 'map-pin', qs: 12, done: 12,
      items: ['Site opened on time and to standard.', 'Reception and entry clean and in repair.', 'Sign in and access process followed.', 'Public areas free of clutter.'] },
    { key: 'process', name: 'Process and compliance', ic: 'clipboard-check', qs: 18, done: 18,
      items: ['Current procedure version in use at every workstation.', 'Records complete for the last seven days.', 'Exceptions escalated within twenty four hours.', 'Sign offs by the right person.'] },
    { key: 'customer', name: 'Customer experience', ic: 'heart-handshake', qs: 16, done: 16,
      items: ['Spoke with at least three customers about their experience.', 'Wait times within the standard during the visit.', 'Staff presentable and identifiable.', 'Published service information matches what actually happens.'] },
    { key: 'service', name: 'Service delivery', ic: 'headphones', qs: 14, done: 14,
      items: ['Observed a full service cycle end to end.', 'Handover between shifts complete.', 'Staffing matches the assessed demand.', 'Backlog visible and being worked.'] },
    { key: 'environment', name: 'Environment and safety', ic: 'shield-check', qs: 20, done: 11,
      items: ['Walkways clear of obstruction.', 'Equipment inspected and in date.', 'Exits unobstructed and alarmed.', 'Protective equipment stocked at the point of need.'] },
    { key: 'staffing', name: 'Staffing and scheduling', ic: 'users-round', qs: 15, done: 0,
      items: ['Published rota matches the actual assignment.', 'Open shifts for the next fourteen days reviewed.', 'Overtime and agency use explained by the schedule, not by habit.', 'Break coverage planned.'] },
    { key: 'records', name: 'Records and audit readiness', ic: 'folder-open', qs: 13, done: 0,
      items: ['Audit file current.', 'Last audit findings closed with evidence.', 'Governance minutes filed for the last quarter.', 'Training attendance complete.'] },
    { key: 'debrief', name: 'Leader debrief and summary', ic: 'notebook-text', qs: 10, done: 0,
      items: ['Debriefed the Location Director before leaving.', 'Named the single biggest risk found.', 'Agreed the follow up date.', 'Recognised one thing done well.'] }
  ];

  /* ---------------- to do list (E3) ---------------- */
  function T(id, emp, ft, topic, target, due, status, rule, msr, owner, loc, extra) {
    var o = { id: id, emp: emp, ft: ft, topic: topic, target: target, due: due, status: status, rule: rule, msr: msr, owner: owner, loc: loc };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  D.TASKS = [
    T('TP-4471', 'dana', 'FT-CHK', 'Check in: quality score', 'Quality improvement', 'Thu 18 Sep', 'Overdue', 'RULE-07', 'msr.quality', 'priya', 'LOC-AS', { opened: 'Fri 11 Sep', last: '22 Jul', lastBy: 'priya', why: 'Quality score 86.4% across the last 9 shifts against a 95% standard.' }),
    T('TP-4488', 'trevor', 'FT-SKV', 'Skill validation: exception handling', 'New starter sign off', 'Wed 17 Sep', 'Open', 'RULE-02', null, 'priya', 'LOC-AS', { opened: 'Wed 10 Sep', last: '-', lastBy: '-', why: 'New starter at day 90. Sign off required before working unsupervised.' }),
    T('TP-4492', 'nadia', 'FT-CHK', 'Check in: output per shift', 'Productivity', 'Fri 19 Sep', 'Open', 'RULE-04', 'msr.output', 'priya', 'LOC-AS', { opened: 'Mon 14 Sep', last: '5 Aug', lastBy: 'priya', why: 'Output 38.8 against a 42 standard for two consecutive weeks.' }),
    T('TP-4495', 'lorna', 'FT-REC', 'Recognition: sustained top quartile', 'Recognition', 'Fri 19 Sep', 'Open', 'RULE-11', 'msr.quality', 'priya', 'LOC-AS', { opened: 'Mon 14 Sep', last: '1 Aug', lastBy: 'priya', why: 'Top decile on quality for three consecutive months. Recognition is a rule, not a favour.' }),
    T('TP-4501', 'devon', 'FT-OBS', 'Performance observation: customer contact', 'Customer experience', 'Mon 22 Sep', 'Open', 'RULE-09', 'msr.csat', 'imani', 'LOC-AS', { opened: 'Tue 15 Sep', last: '-', lastBy: '-', why: 'Two customer comments this month named handling pace.' }),
    T('TP-4504', 'marisol', 'FT-GPL', 'Mid cycle goal plan', 'Goal plan', 'Tue 30 Sep', 'Open', 'RULE-01', null, 'priya', 'LOC-AS', { opened: 'Tue 1 Sep', last: '1 Jun', lastBy: 'priya', why: 'Every employee gets a mid cycle goal plan in the second month of the cycle.' }),
    T('TP-4460', 'halle', 'FT-OBS', 'Performance observation: equipment check', 'Quality improvement', 'Mon 15 Sep', 'Completed', 'RULE-03', null, 'oscar', 'LOC-AS', { opened: 'Mon 8 Sep', done: 'Mon 15 Sep', formId: 'FM-20918', last: '8 Aug', lastBy: 'oscar' }),
    T('TP-4455', 'dana', 'FT-OBS', 'Performance observation: morning run', 'Quality improvement', 'Fri 12 Sep', 'Completed', 'RULE-03', null, 'priya', 'LOC-AS', { opened: 'Fri 5 Sep', done: 'Fri 12 Sep', formId: 'FM-20904', last: '13 Aug', lastBy: 'priya' }),
    T('TP-4509', 'yolanda', 'FT-HUD', 'Team huddle: customer service', 'Weekly huddle', 'Wed 17 Sep', 'Draft', 'RULE-06', null, 'imani', 'LOC-AS', { opened: 'Tue 15 Sep', draftPct: 60, last: '9 Sep', lastBy: 'imani' }),
    T('TP-4512', 'esther', 'FT-CHK', 'Check in: schedule adherence', 'Workforce', 'Thu 18 Sep', 'Open', 'RULE-07', 'msr.adherence', 'simone', 'LOC-BR', { opened: 'Thu 11 Sep', last: '-', lastBy: '-', why: 'Adherence 89.6% against a 95% standard.' }),
    T('TP-4515', 'teodor', 'FT-CHK', 'Check in: unplanned absence', 'Workforce', 'Thu 18 Sep', 'Overdue', 'RULE-07', 'msr.absence', 'wren', 'LOC-DU', { opened: 'Tue 2 Sep', last: '14 Jul', lastBy: 'wren', why: 'Unplanned absence 9.8% against a 4% standard.' }),
    T('TP-4520', 'priya', 'FT-MRC', 'Manager coaching review', 'Coach the coach', 'Fri 19 Sep', 'Open', 'RULE-12', null, 'curtis', 'LOC-AS', { opened: 'Mon 14 Sep', last: '-', lastBy: '-', why: 'Ashford touch point completion is 68% against a 90% standard.' }),
    T('TP-4524', 'imani', 'FT-L11', 'Leader one to one', 'Standing one to one', 'Mon 22 Sep', 'Open', 'RULE-13', null, 'curtis', 'LOC-AS', { opened: 'Mon 8 Sep', last: '11 Aug', lastBy: 'curtis' }),
    T('TP-4527', 'junie', 'FT-REC', 'Recognition: customer compliment', 'Recognition', 'Wed 24 Sep', 'Open', 'RULE-11', 'msr.csat', 'jonah', 'LOC-EA', { opened: 'Tue 15 Sep', last: '-', lastBy: '-', why: 'Named twice in customer feedback this month.' })
  ];

  D.RULES = [
    { id: 'RULE-01', name: 'Mid cycle goal plan for everyone', msr: null, when: 'Day 45 of a performance cycle', makes: 'FT-GPL', due: '15 days', rec: 'Every cycle', on: true, fired: 41 },
    { id: 'RULE-02', name: 'New starter skill validation at 90 days', msr: null, when: 'Employee reaches day 83 of employment', makes: 'FT-SKV', due: '7 days', rec: 'Once per hire', on: true, fired: 12 },
    { id: 'RULE-03', name: 'Monthly observation per employee', msr: null, when: 'No observation in the last 30 days', makes: 'FT-OBS', due: '7 days', rec: 'Monthly', on: true, fired: 186 },
    { id: 'RULE-04', name: 'Output below standard', msr: 'msr.output', when: 'Below target for 2 consecutive weeks', makes: 'FT-CHK', due: '5 days', rec: 'Once per breach', on: true, fired: 9 },
    { id: 'RULE-05', name: 'Training completion below standard', msr: 'msr.training', when: 'Below 95% in a month', makes: 'FT-CHK', due: '7 days', rec: 'Monthly while breached', on: true, fired: 14 },
    { id: 'RULE-06', name: 'Weekly team huddle per department', msr: null, when: 'Start of each week', makes: 'FT-HUD', due: '5 days', rec: 'Weekly', on: true, fired: 312 },
    { id: 'RULE-07', name: 'Any measure below standard for 5 periods', msr: 'msr.quality', when: 'Below target across 5 consecutive periods', makes: 'FT-CHK', due: '7 days', rec: 'Once per breach', on: true, fired: 23 },
    { id: 'RULE-09', name: 'Customer comment threshold', msr: 'msr.csat', when: 'Two or more comments on one theme in a month', makes: 'FT-OBS', due: '7 days', rec: 'Monthly', on: true, fired: 6 },
    { id: 'RULE-11', name: 'Recognition for sustained top decile', msr: 'msr.quality', when: 'Top decile for 3 consecutive months', makes: 'FT-REC', due: '5 days', rec: 'Quarterly', on: true, fired: 18 },
    { id: 'RULE-12', name: 'Coach the coach on low completion', msr: null, when: 'Manager touch point completion below 75%', makes: 'FT-MRC', due: '5 days', rec: 'Monthly while breached', on: true, fired: 7 },
    { id: 'RULE-13', name: 'Monthly leader one to one', msr: null, when: 'Start of each month', makes: 'FT-L11', due: '14 days', rec: 'Monthly', on: true, fired: 96 },
    { id: 'RULE-14', name: 'Safety incident opens a team huddle', msr: 'msr.safety', when: 'Above 3.0 per 100 staff', makes: 'FT-HUD', due: '2 days', rec: 'Once per breach', on: false, fired: 0 }
  ];

  /* ---------------- documented forms (E8) ---------------- */
  D.FORMS = [
    { id: 'FM-20904', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Fri 12 Sep 2026', time: '09:14', mins: 14, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Needs improvement', noCount: 2, geo: 'Matched, 18 m from the registered address', task: 'TP-4455',
      summary: 'Two standards missed on the morning run: the procedure version in use was out of date, and the work was recorded at the end of the shift rather than as it went. Accuracy of the work itself was good.',
      scores: [2, 2, 1, 2, 2, 2, 2, 1, 2], attested: true, ack: 'Fri 12 Sep 2026' },
    { id: 'FM-20877', ft: 'FT-CHK', emp: 'dana', by: 'priya', date: 'Thu 28 Aug 2026', time: '15:40', mins: 11, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Documented', geo: 'Matched, 22 m from the registered address', task: 'TP-4433',
      summary: 'Quality score at 86%. Agreed to record work as it is completed rather than batching it at the end of the week.', attested: true, ack: 'Thu 28 Aug 2026' },
    { id: 'FM-20918', ft: 'FT-OBS', emp: 'halle', by: 'oscar', date: 'Mon 15 Sep 2026', time: '11:02', mins: 16, loc: 'LOC-AS', dept: 'Facilities',
      outcome: 'Meets standard', noCount: 0, geo: 'Matched, 9 m from the registered address', task: 'TP-4460',
      summary: 'Equipment check ran to standard including the tagging steps. Nothing to correct.',
      scores: [2, 2, 2, 2, 2, 2, 2, 2, 2], attested: true, ack: 'Mon 15 Sep 2026' },
    { id: 'FM-20862', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Wed 13 Aug 2026', time: '08:55', mins: 13, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Needs improvement', noCount: 3, geo: 'Matched, 14 m from the registered address',
      summary: 'Recording and self check both missed. Third observation in a row with the same recording gap.',
      scores: [2, 1, 2, 2, 2, 1, 1, 2, 2], attested: true, ack: 'Wed 13 Aug 2026' },
    { id: 'FM-20840', ft: 'FT-REC', emp: 'lorna', by: 'priya', date: 'Fri 1 Aug 2026', time: '16:20', mins: 5, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Recognition', geo: 'Matched, 11 m from the registered address',
      summary: 'Covered two unfilled shifts and still finished every task on time. Named by a customer in the July feedback.', attested: true, ack: 'Fri 1 Aug 2026' },
    { id: 'FM-20831', ft: 'FT-CHK', emp: 'dana', by: 'priya', date: 'Tue 22 Jul 2026', time: '14:05', mins: 9, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Documented', geo: 'Matched, 20 m from the registered address',
      summary: 'First conversation about recording work as it is done. Agreed a reminder at the two hour mark of each shift.', attested: true, ack: 'Tue 22 Jul 2026' },
    { id: 'FM-20795', ft: 'FT-SKV', emp: 'kai', by: 'simone', date: 'Thu 10 Jul 2026', time: '10:30', mins: 24, loc: 'LOC-BR', dept: 'Operations',
      outcome: 'Meets standard', noCount: 0, geo: 'Matched, 6 m from the registered address',
      summary: 'Exception handling validated. Cleared to work unsupervised.', attested: true, ack: 'Thu 10 Jul 2026' },
    { id: 'FM-20930', ft: 'FT-MRC', emp: 'simone', by: 'ruben', date: 'Mon 8 Sep 2026', time: '13:15', mins: 28, loc: 'LOC-BR', dept: 'Operations',
      outcome: 'Meets standard', noCount: 1, geo: 'Matched, 12 m from the registered address',
      summary: 'Coaching is consistent and documented on the day. One gap: prior action items were not reviewed before the conversation.', attested: true, ack: 'Mon 8 Sep 2026' },
    { id: 'FM-20812', ft: 'FT-CHK', emp: 'teodor', by: 'wren', date: 'Mon 14 Jul 2026', time: '09:45', mins: 10, loc: 'LOC-DU', dept: 'Operations',
      outcome: 'Documented', geo: 'Not matched, 2.4 km from the registered address', geoFlag: true,
      summary: 'Conversation about unplanned absence. Recorded off site, which the record shows.', attested: true, ack: 'Mon 14 Jul 2026' },
    { id: 'FM-20699', ft: 'FT-OBS', emp: 'dana', by: 'priya', date: 'Mon 16 Jun 2026', time: '08:40', mins: 15, loc: 'LOC-AS', dept: 'Operations',
      outcome: 'Meets standard', noCount: 1, geo: 'Matched, 16 m from the registered address',
      summary: 'Strong customer interaction. Work recorded before the end of shift.', scores: [2, 2, 2, 2, 2, 2, 2, 1, 2], attested: true, ack: 'Mon 16 Jun 2026' }
  ];
  D.form = function (id) { for (var i = 0; i < D.FORMS.length; i++) if (D.FORMS[i].id === id) return D.FORMS[i]; return null; };
  D.DELETED_FORMS = [
    { id: 'FM-20889', ft: 'FT-OBS', emp: 'trevor', by: 'priya', date: 'Tue 2 Sep 2026', loc: 'LOC-AS', deletedBy: 'grant', deletedOn: 'Wed 3 Sep 2026', reason: 'Recorded against the wrong employee. Reissued as FM-20893.' },
    { id: 'FM-20701', ft: 'FT-CHK', emp: 'camille', by: 'ivan', date: 'Mon 16 Jun 2026', loc: 'LOC-CA', deletedBy: 'grant', deletedOn: 'Mon 16 Jun 2026', reason: 'Duplicate submission, same conversation captured twice.' }
  ];

  /* ---------------- location reviews (E5) ---------------- */
  D.REVIEWS = [
    { id: 'LR-1182', loc: 'LOC-AS', by: 'alexis', date: 'Tue 16 Sep 2026', status: 'In progress', answered: 57, total: 118, mins: 41, geo: 'Matched, 24 m from the registered address', started: '09:05', photos: 3 },
    { id: 'LR-1176', loc: 'LOC-BR', by: 'alexis', date: 'Thu 4 Sep 2026', status: 'Completed', answered: 118, total: 118, mins: 96, geo: 'Matched, 8 m from the registered address', score: 92, findings: 6, photos: 11 },
    { id: 'LR-1171', loc: 'LOC-CA', by: 'alexis', date: 'Wed 20 Aug 2026', status: 'Completed', answered: 118, total: 118, mins: 88, geo: 'Matched, 15 m from the registered address', score: 96, findings: 2, photos: 7 },
    { id: 'LR-1164', loc: 'LOC-AS', by: 'alexis', date: 'Mon 4 Aug 2026', status: 'Completed', answered: 118, total: 118, mins: 104, geo: 'Matched, 19 m from the registered address', score: 81, findings: 12, photos: 14 },
    { id: 'LR-1158', loc: 'LOC-DU', by: 'dominic', date: 'Tue 22 Jul 2026', status: 'Completed', answered: 118, total: 118, mins: 91, geo: 'Matched, 11 m from the registered address', score: 78, findings: 15, photos: 9 },
    { id: 'LR-1190', loc: 'LOC-CA', by: 'alexis', date: 'Due Fri 26 Sep 2026', status: 'Scheduled', answered: 0, total: 118, mins: 0, geo: null, photos: 0 }
  ];
  D.review = function (id) { for (var i = 0; i < D.REVIEWS.length; i++) if (D.REVIEWS[i].id === id) return D.REVIEWS[i]; return null; };

  /* ---------------- action items (E6) ---------------- */
  D.ACTIONS = [
    { id: 'AI-8821', t: 'Check the procedure version at the start of every shift, observed twice by the manager', owner: 'dana', by: 'priya', from: 'FM-20904', due: 'Fri 19 Sep 2026', status: 'Open', loc: 'LOC-AS', notes: [{ on: 'Mon 15 Sep', by: 'priya', t: 'Observed once, correct. One more to close.' }] },
    { id: 'AI-8822', t: 'Record work in the system as it is completed, not at the end of the shift', owner: 'dana', by: 'priya', from: 'FM-20904', due: 'Fri 19 Sep 2026', status: 'Open', loc: 'LOC-AS', notes: [] },
    { id: 'AI-8794', t: 'Close recording before leaving the workstation', owner: 'dana', by: 'priya', from: 'FM-20877', due: 'Fri 12 Sep 2026', status: 'Overdue', loc: 'LOC-AS', notes: [{ on: 'Fri 12 Sep', by: 'priya', t: 'Still batching at the end of the week. Carried into the next observation.' }], carried: true },
    { id: 'AI-8760', t: 'Shadow Lorna Bekele for one shift on recording discipline', owner: 'dana', by: 'priya', from: 'FM-20862', due: 'Fri 29 Aug 2026', status: 'Closed', loc: 'LOC-AS', closedOn: 'Thu 28 Aug 2026', notes: [{ on: 'Thu 28 Aug', by: 'priya', t: 'Shadow shift completed.' }] },
    { id: 'AI-8702', t: 'Set a two hour recording reminder on the shift device', owner: 'dana', by: 'priya', from: 'FM-20831', due: 'Fri 1 Aug 2026', status: 'Closed', loc: 'LOC-AS', closedOn: 'Wed 30 Jul 2026', notes: [] },
    { id: 'AI-8840', t: 'Review open action items before each conversation, not after', owner: 'simone', by: 'ruben', from: 'FM-20930', due: 'Mon 22 Sep 2026', status: 'Open', loc: 'LOC-BR', notes: [] },
    { id: 'AI-8851', t: 'Equipment in the east bay out of inspection date, log and service', owner: 'oscar', by: 'alexis', from: 'LR-1164', due: 'Fri 8 Aug 2026', status: 'Closed', loc: 'LOC-AS', closedOn: 'Wed 6 Aug 2026', notes: [{ on: 'Wed 6 Aug', by: 'oscar', t: 'Serviced and retagged.' }] },
    { id: 'AI-8852', t: 'Unplanned absence above 8% for four months, build a cover plan with HR', owner: 'curtis', by: 'alexis', from: 'LR-1164', due: 'Fri 19 Sep 2026', status: 'Open', loc: 'LOC-AS', notes: [{ on: 'Mon 1 Sep', by: 'curtis', t: 'Two internal hires start 22 Sep. Plan drafted, not yet agreed with HR.' }], carried: true },
    { id: 'AI-8853', t: 'Audit file missing the last two governance minutes', owner: 'curtis', by: 'alexis', from: 'LR-1164', due: 'Mon 18 Aug 2026', status: 'Closed', loc: 'LOC-AS', closedOn: 'Fri 15 Aug 2026', notes: [] },
    { id: 'AI-8860', t: 'Service desk staffed below the assessed demand at peak', owner: 'imani', by: 'alexis', from: 'LR-1176', due: 'Fri 26 Sep 2026', status: 'Open', loc: 'LOC-BR', notes: [] },
    { id: 'AI-8861', t: 'Signage did not match the current procedure on two workstations', owner: 'simone', by: 'alexis', from: 'LR-1176', due: 'Fri 12 Sep 2026', status: 'Overdue', loc: 'LOC-BR', notes: [] },
    { id: 'AI-8870', t: 'Stock discrepancy from 3 Sep still open', owner: 'wren', by: 'dominic', from: 'LR-1158', due: 'Fri 19 Sep 2026', status: 'Open', loc: 'LOC-DU', notes: [] }
  ];
  D.action = function (id) { for (var i = 0; i < D.ACTIONS.length; i++) if (D.ACTIONS[i].id === id) return D.ACTIONS[i]; return null; };

  /* ---------------- performance management (E7) ---------------- */
  D.TRACKS = [
    { key: 'attendance', name: 'Attendance', subs: ['Unplanned absence', 'Lateness', 'No call no show'] },
    { key: 'performance', name: 'Job performance', subs: ['Work standard', 'Recording and accuracy', 'Skill competency'] },
    { key: 'conduct', name: 'Conduct', subs: ['Respect at work', 'Policy breach', 'Failure to follow procedure'] }
  ];
  D.STEPS = [
    { key: 'counseling', name: 'Documented counselling', expiry: '6 months', letter: false },
    { key: 'written', name: 'Written warning', expiry: '12 months', letter: true },
    { key: 'final', name: 'Final written warning', expiry: '12 months', letter: true },
    { key: 'termination', name: 'Termination', expiry: null, letter: true }
  ];
  D.CASE_ACTIONS = ['Progress to next step', 'Move down a step', 'Change activation date', 'Change expiration date', 'Edit letter', 'Close case', 'Rescind, as if it never existed'];

  D.CASES = [
    { id: 'PC-3391', emp: 'dana', track: 'performance', sub: 'Recording and accuracy', step: 'written', status: 'Pending approval', opened: 'Mon 15 Sep 2026', by: 'priya', loc: 'LOC-AS',
      evidence: ['FM-20831', 'FM-20877', 'FM-20862', 'FM-20904'], wizardStep: 4, letter: true, next: 'alexis',
      approvals: [
        { who: 'priya', role: 'Initiator, Operations Manager', state: 'Submitted', on: 'Mon 15 Sep 2026 16:22' },
        { who: 'curtis', role: 'One level above, Location Director', state: 'Approved', on: 'Tue 16 Sep 2026 08:10' },
        { who: 'alexis', role: 'Two levels above, Division Director', state: 'Waiting', on: null },
        { who: 'grant', role: 'HR review', state: 'Waiting', on: null }],
      audit: [
        { on: 'Mon 15 Sep 2026 15:48', who: 'priya', what: 'Case opened on track Job performance, subtrack Recording and accuracy.' },
        { on: 'Mon 15 Sep 2026 15:52', who: 'priya', what: 'Four prior coaching forms attached automatically as documentation.' },
        { on: 'Mon 15 Sep 2026 16:09', who: 'priya', what: 'Letter generated from the Written warning template.' },
        { on: 'Mon 15 Sep 2026 16:22', who: 'priya', what: 'Submitted for approval and review.' },
        { on: 'Tue 16 Sep 2026 08:10', who: 'curtis', what: 'Approved at one level above.' }] },
    { id: 'PC-3374', emp: 'teodor', track: 'attendance', sub: 'Unplanned absence', step: 'counseling', status: 'Open', opened: 'Thu 21 Aug 2026', by: 'wren', loc: 'LOC-DU',
      evidence: ['FM-20812'], activated: 'Fri 22 Aug 2026', expires: 'Sun 22 Feb 2027', daysLeft: 159, wizardStep: 5, letter: false,
      approvals: [
        { who: 'wren', role: 'Initiator, Operations Manager', state: 'Submitted', on: 'Thu 21 Aug 2026 11:30' },
        { who: 'harriet', role: 'One level above, Location Director', state: 'Approved', on: 'Thu 21 Aug 2026 16:02' },
        { who: 'dominic', role: 'Two levels above, Division Director', state: 'Approved', on: 'Fri 22 Aug 2026 09:14' },
        { who: 'grant', role: 'HR review', state: 'Approved', on: 'Fri 22 Aug 2026 10:41' }],
      audit: [
        { on: 'Thu 21 Aug 2026 11:12', who: 'wren', what: 'Case opened on track Attendance, subtrack Unplanned absence.' },
        { on: 'Fri 22 Aug 2026 10:41', who: 'grant', what: 'All approvals recorded. Case activated, step expires 22 Feb 2027.' }] },
    { id: 'PC-3360', emp: 'esther', track: 'conduct', sub: 'Policy breach', step: 'written', status: 'Open', opened: 'Tue 5 Aug 2026', by: 'simone', loc: 'LOC-BR',
      evidence: [], activated: 'Thu 7 Aug 2026', expires: 'Fri 7 Aug 2027', daysLeft: 325, wizardStep: 5, letter: true,
      approvals: [
        { who: 'simone', role: 'Initiator, Operations Manager', state: 'Submitted', on: 'Tue 5 Aug 2026 09:00' },
        { who: 'ruben', role: 'One level above, Location Director', state: 'Approved', on: 'Tue 5 Aug 2026 14:20' },
        { who: 'alexis', role: 'Two levels above, Division Director', state: 'Approved', on: 'Wed 6 Aug 2026 08:45' },
        { who: 'grant', role: 'HR review', state: 'Approved', on: 'Thu 7 Aug 2026 11:05' }],
      audit: [{ on: 'Thu 7 Aug 2026 11:05', who: 'grant', what: 'Case activated. Letter acknowledged by the employee the same day.' }] },
    { id: 'PC-3402', emp: 'trevor', track: 'performance', sub: 'Skill competency', step: 'counseling', status: 'Draft', opened: 'Tue 16 Sep 2026', by: 'priya', loc: 'LOC-AS',
      evidence: [], wizardStep: 2, letter: false, approvals: [], audit: [{ on: 'Tue 16 Sep 2026 10:02', who: 'priya', what: 'Draft opened. Not yet submitted.' }] },
    { id: 'PC-3298', emp: 'camille', track: 'attendance', sub: 'Lateness', step: 'counseling', status: 'Closed', opened: 'Mon 10 Mar 2026', by: 'ivan', loc: 'LOC-CA',
      evidence: [], activated: 'Wed 12 Mar 2026', expires: 'Sat 12 Sep 2026', closed: 'Sat 12 Sep 2026', disposition: 'Expired', wizardStep: 5, letter: false,
      approvals: [{ who: 'ivan', role: 'Initiator, Customer Service Manager', state: 'Submitted', on: 'Mon 10 Mar 2026 13:00' }],
      audit: [{ on: 'Sat 12 Sep 2026 00:00', who: 'System', what: 'Step expired after 6 months. No longer counts toward the ladder.' }] },
    { id: 'PC-3301', emp: 'kai', track: 'conduct', sub: 'Respect at work', step: 'written', status: 'Closed', opened: 'Thu 19 Mar 2026', by: 'simone', loc: 'LOC-BR',
      evidence: [], wizardStep: 5, letter: true, closed: 'Tue 7 Apr 2026', disposition: 'Rescinded',
      approvals: [{ who: 'simone', role: 'Initiator, Operations Manager', state: 'Submitted', on: 'Thu 19 Mar 2026 09:20' }],
      audit: [{ on: 'Tue 7 Apr 2026 15:30', who: 'grant', what: 'Rescinded after appeal. Record retained, step removed from the ladder.' }] }
  ];
  D.kase = function (id) { for (var i = 0; i < D.CASES.length; i++) if (D.CASES[i].id === id) return D.CASES[i]; return null; };

  D.LETTER = function (c) {
    var e = D.byId(c.emp), s = D.STEPS.filter(function (x) { return x.key === c.step; })[0];
    return {
      title: s.name,
      body: [
        'This letter confirms a ' + s.name.toLowerCase() + ' issued to ' + e.name + ', ' + e.title + ' at ' + D.locName(c.loc) + '.',
        'Concern: ' + D.TRACKS.filter(function (t) { return t.key === c.track; })[0].name + ', ' + c.sub + '.',
        'Prior coaching on record: ' + (c.evidence.length ? c.evidence.length + ' documented conversations between 22 Jul 2026 and 12 Sep 2026' : 'none attached') + '.',
        'Expectation going forward: work is recorded in the system as it is completed, at the end of every task, with no exceptions.',
        'Support provided: a shadow shift with a peer, a recording reminder on the shift device, and twice weekly check ins with the manager for four weeks.',
        'Consequence if the expectation is not met: the next step on this track is a final written warning.',
        (s.expiry ? 'This step remains active for ' + s.expiry + ' from the date of activation.' : '')
      ].filter(Boolean)
    };
  };

  /* ---------------- reporting (E9) ---------------- */
  D.COMPLETION = [
    { scope: 'LOC-AS', label: 'Ashford', due: 62, done: 42, leaders: 5, onTime: 71 },
    { scope: 'LOC-BR', label: 'Brackenfield', due: 74, done: 68, leaders: 6, onTime: 92 },
    { scope: 'LOC-CA', label: 'Calderton', due: 41, done: 39, leaders: 4, onTime: 95 },
    { scope: 'LOC-DU', label: 'Dunmore', due: 69, done: 44, leaders: 6, onTime: 64 },
    { scope: 'LOC-EA', label: 'Eastgate', due: 52, done: 47, leaders: 5, onTime: 90 },
    { scope: 'LOC-FA', label: 'Fairhaven', due: 34, done: 33, leaders: 3, onTime: 97 }
  ];
  D.COMPLETION_BY_LEADER = [
    { who: 'priya', due: 22, done: 15 }, { who: 'imani', due: 11, done: 9 }, { who: 'oscar', due: 9, done: 8 },
    { who: 'curtis', due: 12, done: 6 }, { who: 'simone', due: 24, done: 23 }, { who: 'malik', due: 12, done: 11 },
    { who: 'ruben', due: 14, done: 13 }, { who: 'ivan', due: 18, done: 17 }, { who: 'wren', due: 26, done: 16 },
    { who: 'harriet', due: 13, done: 8 }, { who: 'jonah', due: 15, done: 14 }
  ];
  D.FORMS_BY_TYPE = [
    ['FT-OBS', 186], ['FT-HUD', 142], ['FT-REC', 88], ['FT-CHK', 71], ['FT-SKV', 34], ['FT-GPL', 41],
    ['FT-L11', 63], ['FT-MRC', 19], ['FT-LDP', 11], ['FT-LOC', 14], ['FT-CMP', 22], ['FT-SVC', 18], ['FT-SAF', 26]
  ];

  /* ---------------- cross group (E3) ---------------- */
  D.CROSS = [
    { id: 'XG-221', emp: 'nadia', by: 'talia', loc: 'LOC-AS', on: 'Mon 14 Sep 2026', topic: 'Secure area left unlocked during a compliance audit', state: 'Sent to manager', leader: 'priya', suggest: 'FT-CHK' },
    { id: 'XG-219', emp: 'halle', by: 'talia', loc: 'LOC-AS', on: 'Thu 10 Sep 2026', topic: 'Restocked protective equipment without being asked, twice in one week', state: 'Accepted', leader: 'oscar', suggest: 'FT-REC' },
    { id: 'XG-214', emp: 'teodor', by: 'talia', loc: 'LOC-DU', on: 'Tue 2 Sep 2026', topic: 'Waste handled in the walkway rather than at the point of use', state: 'Sent to manager', leader: 'wren', suggest: 'FT-CHK' },
    { id: 'XG-208', emp: 'esther', by: 'talia', loc: 'LOC-BR', on: 'Wed 20 Aug 2026', topic: 'Procedure step skipped during a safety walk', state: 'Declined', leader: 'simone', suggest: 'FT-CHK', why: 'Already coached on 18 Aug, form FM-20850.' }
  ];

  /* ---------------- integrity (E10) ---------------- */
  D.GUARDRAILS = [
    { id: 'GR-1', name: 'Restricted investigatory material', state: 'Blocked', desc: 'Formal investigations are held in the HR case system, not here. Free text fields and uploads reject anything tagged to an open investigation.' },
    { id: 'GR-2', name: 'Third party personal data in free text', state: 'Warned', desc: 'Customer or patient names typed into an observation are flagged before submission. The manager is asked to use a reference instead.' },
    { id: 'GR-3', name: 'Protected characteristic language', state: 'Warned', desc: 'Language describing age, disability, pregnancy, religion or national origin is flagged for rewording before the record becomes immutable.' },
    { id: 'GR-4', name: 'Coaching outside the reporting line', state: 'Allowed with attribution', desc: 'Cross group suggestions are visible to the employee manager and are always attributed to the suggesting department.' },
    { id: 'GR-5', name: 'Backdating a submission', state: 'Blocked', desc: 'The submitted timestamp is server side. A form completed late records the true time and shows the gap.' }
  ];
  D.RETENTION = [
    { what: 'Coaching forms and location reviews', keep: '7 years from submission', then: 'Anonymised, aggregate reporting retained' },
    { what: 'Active discipline steps', keep: 'Until step expiry, then 7 years', then: 'Removed from the ladder, retained in the file' },
    { what: 'Rescinded records', keep: '7 years, flagged as rescinded', then: 'Never counted toward a later step' },
    { what: 'Employee file exports', keep: 'Export log kept 7 years', then: 'The export package itself is not stored' },
    { what: 'Location and duration telemetry', keep: '2 years', then: 'Dropped from the record, form remains' }
  ];

  /* ---------------- notifications ---------------- */
  D.NOTIFS = {
    employee: [
      { t: 'A written warning letter is waiting for your acknowledgement', time: '2h', ic: 'file-text', go: '#/records', unread: true },
      { t: 'Action item AI-8794 is overdue', time: '1d', ic: 'triangle-alert', go: '#/coaching/actions', unread: true },
      { t: 'Priya Raghavan documented a performance observation about you', time: '4d', ic: 'clipboard-list', go: '#/coaching', unread: false }
    ],
    manager: [
      { t: 'TP-4471 for Dana Whitfield is overdue', time: '3h', ic: 'triangle-alert', go: '#/todo', unread: true },
      { t: 'Case PC-3391 approved by Curtis Nakamura', time: '6h', ic: 'circle-check', go: '#/cases/PC-3391', unread: true },
      { t: 'Quality sent you a cross group suggestion for Nadia Farouk', time: '2d', ic: 'shield', go: '#/todo/crossgroup', unread: true },
      { t: 'Your manager coaching review TP-4520 is due Friday', time: '2d', ic: 'compass', go: '#/todo', unread: false }
    ],
    hr: [
      { t: 'Case PC-3391 reaches you after the division approval', time: '5h', ic: 'gavel', go: '#/cases/PC-3391', unread: true },
      { t: 'Employee file export requested for an appeal hearing', time: '1d', ic: 'package', go: '#/records/exports', unread: true },
      { t: 'PC-3298 expired on 12 Sep and left the ladder', time: '4d', ic: 'hourglass', go: '#/cases/PC-3298', unread: false }
    ]
  };
})();
