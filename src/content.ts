export const profile = {
  name: 'Varun Varma Nampally',
  shortName: 'Varun',
  role: 'Project / Program Manager',
  headline: 'I turn messy operations into systems that ship.',
  tagline:
    'Program Manager with ~2 years across Google Cloud go-to-market operations and enterprise IT. I own governance for high-stakes programs, build 0→1 internal tools, and run the operating rhythm that keeps large teams moving.',
  location: 'Hyderabad, India',
  email: 'varunvarmanampally@gmail.com',
  linkedin: 'https://www.linkedin.com/in/varunnampally/',
  resume: 'https://drive.google.com/file/d/1VCLXU12tfEf8Y_y85kA-2AfYmn2-KZev/view',
};

export const about = {
  paragraphs: [
    'I’m a Google Project Management Certified program manager who likes the parts of a project nobody else wants to touch: the reconciliation workflow with four stakeholders, the data that won’t flow through the standard connector, the recognition program that quietly stopped working.',
    'Most recently at Google Cloud, I owned quarterly rebate governance for India’s largest strategic enterprise account and led delivery of an internal AI staffing tool from idea to adoption by ~20 managers, now on the FY27 roadmap.',
    'I’m comfortable in both the spreadsheet and the terminal, and I care that the people around a project feel the cadence rather than fight it.',
  ],
  stats: [
    { value: '$50M+', label: 'Annual rebate value governed' },
    { value: '~90%', label: 'Faster project matching' },
    { value: '500', label: 'Person org operating rhythm' },
    { value: '0→1', label: 'Internal AI tool shipped' },
  ],
};

export interface Project {
  title: string;
  kicker: string;
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
    description:
      'A RAG-based internal tool that matches 40+ apprentices to projects using skill and performance data. Defined requirements and MVP scope, then built the data pipeline that pulled live evaluation data where the enterprise connector could not.',
    impact: [
      'Matching time cut from 2–3 business days to 1–2 hours',
      'Adopted by ~20 Google Cloud India managers',
      'Endorsed by the India MD for the FY27 roadmap',
    ],
    tags: ['Cloud Run', 'Python', 'Apps Script', 'Vertex AI'],
    accent: 'primary',
    icon: 'auto_awesome',
  },
  {
    title: 'Rebate Governance',
    kicker: 'Strategic Enterprise Account',
    description:
      'End-to-end quarterly rebate governance for Google Cloud India’s largest strategic enterprise account: $50M+ in annual rebate value across 9 billing accounts, reconciled with Finance and Order Management.',
    impact: [
      '100% on-time disbursement across 4 consecutive cycles',
      'Standardised the cross-functional reconciliation workflow',
    ],
    tags: ['Program Governance', 'Finance Ops', 'Stakeholder Mgmt'],
    accent: 'secondary',
    icon: 'account_balance',
  },
  {
    title: 'All-Hands Recognition Program',
    kicker: 'Operating Rhythm · ~500 attendees',
    description:
      'Ran the recognition program for six consecutive regional All-Hands and redesigned the nomination process so it actually reflected the work people were proud of.',
    impact: ['Participation up 30%', 'Six consecutive cycles delivered'],
    tags: ['Operating Cadence', 'Process Design', 'Comms'],
    accent: 'tertiary',
    icon: 'celebration',
  },
  {
    title: 'Startup Immersion Program',
    kicker: 'Market Access · 16 startups',
    description:
      'Program-managed a market-access immersion for 16 startups, coordinating sessions, speakers, and logistics end to end.',
    impact: ['16 startups onboarded', 'End-to-end logistics and speaker management'],
    tags: ['Program Management', 'Events', 'Ecosystem'],
    accent: 'primary',
    icon: 'rocket_launch',
  },
];

export interface Experience {
  company: string;
  role: string;
  team?: string;
  location: string;
  period: string;
  bullets: string[];
}

export const experience: Experience[] = [
  {
    company: 'Google',
    role: 'PJM Apprentice',
    team: 'Google Cloud Strategy & Operations',
    location: 'Gurgaon, India',
    period: 'Apr 2025 – Mar 2026',
    bullets: [
      'Owned quarterly rebate governance for Google Cloud India’s largest strategic enterprise account ($50M+, 9 billing accounts) with 100% on-time disbursement across 4 cycles.',
      'Led 0→1 delivery of an internal RAG-based staffing tool; ~90% faster project matching, adopted by ~20 managers, endorsed by the India MD for FY27.',
      'Ran the recognition program for 6 regional All-Hands (~500 attendees), lifting participation 30%.',
      'Program-managed a market-access immersion program for 16 startups end to end.',
    ],
  },
  {
    company: 'Hitachi Vantara',
    role: 'Associate Technical Consultant',
    location: 'Hyderabad, India',
    period: 'Dec 2024 – Mar 2025',
    bullets: [
      'Overhauled global tool provisioning and onboarding with APAC and EMEA PMs, establishing a 7-day onboarding standard.',
      'Delivered 24/7 infrastructure support for 5+ global enterprise clients against a 98% uptime SLA.',
      'Ran root-cause and trend analysis on recurring tickets, cutting repeat issues by 30%.',
    ],
  },
  {
    company: 'NxtWave',
    role: 'Associate Project Manager (Intern)',
    location: 'Hyderabad, India',
    period: 'Jun 2024 – Dec 2024',
    bullets: [
      'Coordinated cross-functional hiring loops for 5 curriculum engineers, reducing time-to-hire by 20%.',
      'Authored role rubrics and onboarding milestones for all five hires.',
    ],
  },
];

export const skills: { group: string; icon: string; items: string[] }[] = [
  {
    group: 'Program Management',
    icon: 'account_tree',
    items: [
      'Scope & schedule',
      'Stakeholder management',
      'Operating cadences',
      'Business reviews',
      'SLA & risk tracking',
      'Dependency management',
      'Process re-engineering',
      'Agile / Scrum',
    ],
  },
  {
    group: 'Product & Analytics',
    icon: 'insights',
    items: ['Requirements definition', 'MVP scoping', 'KPI tracking', 'Google Sheets', 'SQL', 'Looker'],
  },
  {
    group: 'Technical',
    icon: 'terminal',
    items: ['Google Cloud Platform', 'Cloud Run', 'Vertex AI', 'Python', 'Apps Script', 'REST APIs', 'Git'],
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
