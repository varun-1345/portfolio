export const profile = {
  name: 'Varun Varma Nampally',
  shortName: 'Varun',
  role: 'Project Manager',
  headline: 'I turn complex operations into systems that ship.',
  tagline:
    'Project Manager with ~2 years leading end-to-end Google Cloud go-to-market operations and enterprise IT initiatives. I own governance for high-stakes programs, build 0→1 internal tools, and run the operating cadences that keep large teams moving.',
  location: 'Hyderabad, India',
  email: 'nampallyvarunvarma@gmail.com',
  linkedin: 'https://www.linkedin.com/in/varunnampally/',
  resume: 'https://drive.google.com/file/d/1VCLXU12tfEf8Y_y85kA-2AfYmn2-KZev/view',
};

export const about = {
  paragraphs: [
    'I’m a Google-certified project manager with 2 years of experience across Google Cloud and enterprise IT, where I’ve led initiatives ranging from eight-figure account governance to an AI staffing tool adopted by 20+ managers. I bring together operational thinking, data-driven problem-solving, and cross-functional collaboration to navigate ambiguity and turn complex challenges into actionable outcomes. I enjoy building structure where it’s needed, improving how things work, and taking ownership from idea to execution. I’m looking to bring this approach to larger programs with greater scope and impact.',
  ],
  stats: [
    { value: '8-figure', label: 'Rebate program governed' },
    { value: '~90%', label: 'Faster project matching' },
    { value: '500', label: 'Person org operating rhythm' },
    { value: '0→1', label: 'Internal AI tool shipped' },
  ],
};

export interface Project {
  title: string;
  kicker: string;
  metric: string;
  metricLabel: string;
  summary: string;
  description: string;
  impact: string[];
  tags: string[];
  accent: 'primary' | 'secondary' | 'tertiary';
  icon: string;
}

export const projects: Project[] = [
  {
    title: 'AI Staffing Tool',
    kicker: 'Google Cloud India · 0→1',
    metric: '~90%',
    metricLabel: 'faster project matching',
    summary: 'RAG-based tool that matches 40+ apprentices to projects, built 0→1 on Cloud Run.',
    description:
      'A RAG-based AI staffing tool that matches 40+ apprentices to projects using live skill and evaluation data. Defined the MVP scope and led the 0→1 build on Cloud Run, Python, and Apps Script.',
    impact: [
      'Matching turnaround cut ~90%: 2–3 days to 1–2 hours',
      'Adopted across ~20 Google Cloud India managers',
      'Endorsed by the India MD for the FY27 roadmap',
    ],
    tags: ['Cloud Run', 'Python', 'Apps Script', 'Vertex AI'],
    accent: 'primary',
    icon: 'auto_awesome',
  },
  {
    title: 'Rebate Governance',
    kicker: 'Strategic Enterprise Account',
    metric: '100%',
    metricLabel: 'on time, 4 consecutive cycles',
    summary: 'Quarterly rebate governance for Google Cloud India’s largest enterprise account.',
    description:
      'Quarterly rebate governance for Google Cloud India’s largest enterprise account: multi-million-dollar annual value across multiple billing accounts, with workflows standardized across Finance and Order Management.',
    impact: [
      'Eight-figure annual rebate value, multiple billing accounts',
      'Standardized cross-functional reconciliation workflows',
    ],
    tags: ['Program Governance', 'Finance Ops', 'Stakeholder Mgmt'],
    accent: 'secondary',
    icon: 'account_balance',
  },
  {
    title: 'All-Teams Recognition Program',
    kicker: 'Operating Rhythm · ~500 attendees',
    metric: '+30%',
    metricLabel: 'participation',
    summary: 'Redesigned nomination workflows across six regional All-Teams.',
    description:
      'Ran recognition programs for six regional All-Teams and redesigned the nomination workflows so they reflected the work people were proud of.',
    impact: ['Participation up 30%', 'Six consecutive cycles delivered'],
    tags: ['Operating Cadence', 'Process Design', 'Comms'],
    accent: 'tertiary',
    icon: 'celebration',
  },
  {
    title: 'Startup Immersion Program',
    kicker: 'Market Access · 16 startups',
    metric: '16',
    metricLabel: 'startups, end to end',
    summary: 'Owned scheduling, speakers, and stakeholder logistics for a market-access program.',
    description:
      'Program-managed a market-access immersion program for 16 startups, owning end-to-end scheduling, speaker coordination, and stakeholder logistics.',
    impact: ['16 startups onboarded', 'End-to-end scheduling, speakers, and stakeholder logistics'],
    tags: ['Program Management', 'Events', 'Ecosystem'],
    accent: 'primary',
    icon: 'rocket_launch',
  },
];

export interface Experience {
  company: string;
  role: string;
  summary: string;
  team?: string;
  location: string;
  period: string;
  bullets: string[];
}

export const experience: Experience[] = [
  {
    company: 'Google',
    role: 'Project Management Apprentice',
    summary: 'Rebate governance for the largest enterprise account, a 0→1 AI staffing tool, and the operating cadence for a 500-person org.',
    team: 'Google Cloud Strategy & Operations',
    location: 'Gurgaon, India',
    period: 'Apr 2025 – Mar 2026',
    bullets: [
      'Commercial governance: owned quarterly rebate governance for Google Cloud India’s largest enterprise account (multi-million-dollar annual value across multiple billing accounts), achieving 100% on-time execution over 4 consecutive cycles by standardizing workflows across Finance and Order Management.',
      '0→1 product & technical delivery: defined MVP scope and led the build of a RAG-based AI staffing tool (Cloud Run, Python, Apps Script) integrating live evaluation data for 40+ apprentices; cut matching turnaround ~90% (2–3 days to 1–2 hours) and drove adoption across ~20 managers.',
      'Cross-functional program execution: program-managed a market-access immersion program for 16 startups, owning end-to-end scheduling, speaker coordination, and stakeholder logistics.',
      'Operating cadence: ran recognition programs for 6 regional All-Teams (~500 attendees), redesigning nomination workflows to boost participation by 30%.',
    ],
  },
  {
    company: 'Hitachi Vantara',
    role: 'Associate Technical Consultant',
    summary: 'Global onboarding standard (7 days), 24/7 support for 5+ enterprise clients at 98% uptime, repeat incidents down 30%.',
    location: 'Hyderabad, India',
    period: 'Dec 2024 – Mar 2025',
    bullets: [
      'Process standardization: partnered with APAC and EMEA PMs to overhaul global tool provisioning and onboarding, establishing a 7-day standard and onboarding 5 engineers.',
      'SLA governance: managed 24/7 infrastructure support for 5+ global enterprise clients, consistently maintaining a 98% uptime SLA.',
      'Root-cause analysis: conducted trend analysis on recurring operational tickets, reducing repeat incidents by 30%.',
    ],
  },
  {
    company: 'NxtWave',
    role: 'Associate Project Manager (Intern)',
    summary: 'Ran hiring loops for 5 curriculum engineers, cutting time-to-hire 20%.',
    location: 'Hyderabad, India',
    period: 'Jun 2024 – Dec 2024',
    bullets: [
      'Hiring operations: coordinated cross-functional hiring loops across Talent Acquisition and Curriculum for 5 curriculum engineers, cutting time-to-hire by 20%.',
      'Authored role rubrics and onboarding milestones for all five hires.',
    ],
  },
];

export const skills: { group: string; icon: string; items: string[] }[] = [
  {
    group: 'Program Management',
    icon: 'account_tree',
    items: [
      'End-to-end delivery',
      'Scope & schedule management',
      'Cross-functional stakeholder management',
      'Executive stakeholder management',
      'Operating cadences',
      'SLA & risk tracking',
      'Process re-engineering',
      'Agile / Scrum',
    ],
  },
  {
    group: 'Product & Technical',
    icon: 'terminal',
    items: [
      'Requirements definition',
      'KPI tracking',
      'Google Cloud Platform',
      'Cloud Run',
      'Vertex AI',
      'Python',
      'Apps Script',
      'Git',
      'Google Sheets',
    ],
  },
];

export const education = [
  {
    title: 'B.Tech, Electronics & Communication Engineering',
    org: 'MLR Institute of Technology, Hyderabad',
    period: '2019 – 2023 · CGPA 8.6 / 10',
    icon: 'school',
  },
  {
    title: 'Google Project Management Professional Certificate',
    org: 'Google / Coursera',
    period: '2024',
    icon: 'workspace_premium',
  },
  {
    title: 'Oracle Certified Associate – Java SE 8 Programmer',
    org: 'Oracle',
    period: '2023',
    icon: 'verified',
  },
];

export const recognition = [
  {
    title: 'Peer Excellence Recognition',
    org: 'Google Cloud',
    description:
      'Awarded for leading event operations, registration pipelines, and technical demo logistics for an enterprise Cloud summit engaging 300+ stakeholders.',
    icon: 'emoji_events',
  },
];
