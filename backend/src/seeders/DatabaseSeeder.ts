import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { addDays, toIsoDate } from '../common/date.util.js';
import { hashPassword } from '../common/password.util.js';
import { Activity, Project, User } from '../entities/index.js';

export const SEED_ADMIN = { email: 'admin@care.org.rw', password: 'Admin@12345' };
export const SEED_STAFF_PASSWORD = 'Staff@12345';

const PROJECTS = [
  { code: 'WEE', name: "Women's Economic Empowerment", location: 'Nyamagabe' },
  { code: 'VSLA', name: 'Village Savings & Loan Associations', location: 'Gicumbi' },
  { code: 'CRA', name: 'Climate-Resilient Agriculture', location: 'Nyaruguru' },
  { code: 'GBV', name: 'GBV Prevention & Response', location: 'Kigali' },
  { code: 'YSE', name: 'Youth Skills & Employment', location: 'Rubavu' },
  { code: 'MCH', name: 'Maternal & Child Health', location: 'Kayonza' },
];

const STAFF: { name: string; jobTitle: string; projects: string[] }[] = [
  { name: 'Aline Uwase', jobTitle: 'Field Officer', projects: ['WEE', 'VSLA'] },
  { name: 'Jean Claude Habimana', jobTitle: 'Project Manager', projects: ['CRA'] },
  { name: 'Diane Mukamana', jobTitle: 'M&E Specialist', projects: ['WEE', 'GBV', 'MCH'] },
  { name: 'Eric Niyonzima', jobTitle: 'Agronomist', projects: ['CRA', 'YSE'] },
  { name: 'Grace Ingabire', jobTitle: 'Gender Advisor', projects: ['GBV'] },
  { name: 'Patrick Mugisha', jobTitle: 'Youth Coordinator', projects: ['YSE'] },
  { name: 'Clarisse Uwimana', jobTitle: 'Health Officer', projects: ['MCH'] },
  { name: 'Emmanuel Nsengimana', jobTitle: 'Finance Officer', projects: ['VSLA', 'WEE'] },
];

const TEMPLATES: Record<string, { title: string; description: string; place: string }[]> = {
  WEE: [
    { title: 'Business skills training for women entrepreneurs', description: 'Module 3: pricing and record keeping with 28 participants.', place: 'Kitabi Sector' },
    { title: 'Market linkage visit with cooperative leaders', description: 'Met buyers to agree on quarterly supply volumes.', place: 'Nyamagabe Market' },
    { title: 'Coaching session for women-led enterprises', description: 'One-on-one follow-ups on growth plans.', place: 'Gasaka Sector' },
  ],
  VSLA: [
    { title: 'VSLA share-out meeting', description: 'Annual share-out for three savings groups.', place: 'Byumba Sector' },
    { title: 'Financial literacy refresher', description: 'Savings, credit and loan repayment scheduling.', place: 'Rukomo Sector' },
    { title: 'Group formation and constitution drafting', description: 'Two new groups formed, 45 members.', place: 'Kageyo Sector' },
  ],
  CRA: [
    { title: 'Demo plot planting: drought-tolerant beans', description: 'Farmer field school with lead farmers.', place: 'Ruheru Sector' },
    { title: 'Soil conservation terracing works', description: 'Community work supervising 1.2 ha of terraces.', place: 'Kibeho Sector' },
    { title: 'Weather advisory SMS rollout', description: 'Registered farmers for seasonal forecast alerts.', place: 'Nyaruguru District Office' },
  ],
  GBV: [
    { title: 'Community dialogue on positive masculinity', description: 'Facilitated session with couples and local leaders.', place: 'Kimironko Sector' },
    { title: 'Safe space session for adolescent girls', description: 'Life skills and referral pathways.', place: 'Gikondo Youth Centre' },
    { title: 'Coordination meeting with Isange One Stop Centre', description: 'Reviewed referrals and case follow-up.', place: 'Kacyiru' },
  ],
  YSE: [
    { title: 'TVET enrolment drive', description: 'Registered youth for tailoring and welding courses.', place: 'Gisenyi Sector' },
    { title: 'Job fair with local employers', description: '12 employers and 150 youth attended.', place: 'Rubavu Youth Centre' },
    { title: 'Mentorship circle kickoff', description: 'Paired graduates with business mentors.', place: 'Nyamyumba Sector' },
  ],
  MCH: [
    { title: 'Community health worker refresher training', description: 'Danger signs in pregnancy and newborn care.', place: 'Kabarondo Health Centre' },
    { title: 'Nutrition demonstration for mothers', description: 'Cooking demo with locally available foods.', place: 'Mukarange Sector' },
    { title: 'Antenatal care outreach', description: 'Mobile ANC clinic with the district hospital.', place: 'Rwinkwavu Sector' },
  ],
};

const START_TIMES = ['08:00', '08:30', '09:00', '10:00', '11:00', '13:30', '14:00', '15:00'];

function mondayOf(date: Date): string {
  const offset = (date.getDay() + 6) % 7;
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset));
}

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const projects = new Map(
      PROJECTS.map((p) => [
        p.code,
        em.create(Project, {
          ...p,
          location: `${p.location} District`,
          description: `${p.name} programme implemented by CARE Rwanda and partners in ${p.location}.`,
        }),
      ]),
    );
    em.create(Project, {
      code: 'ERP24',
      name: 'Emergency Response 2024',
      location: 'Western Province',
      description: 'Closed flood response programme.',
      isActive: false,
    });

    em.create(User, {
      name: 'System Administrator',
      email: SEED_ADMIN.email,
      jobTitle: 'IT Officer',
      role: 'admin',
      passwordHash: await hashPassword(SEED_ADMIN.password),
    });

    const staffHash = await hashPassword(SEED_STAFF_PASSWORD);
    const staff = STAFF.map((s) => {
      const user = em.create(User, {
        name: s.name,
        email: `${s.name.split(' ')[0].toLowerCase()}@care.org.rw`,
        jobTitle: s.jobTitle,
        role: 'staff',
        passwordHash: staffHash,
      });
      user.projects.set(s.projects.map((code) => projects.get(code)!));
      return { user, projects: s.projects };
    });

    em.create(User, {
      name: 'Former Employee',
      email: 'former@care.org.rw',
      jobTitle: 'Driver',
      role: 'staff',
      passwordHash: staffHash,
      isActive: false,
    });

    // Previous, current and next week, weekdays only, so every dashboard view has data.
    const monday = mondayOf(new Date());
    let n = 0;
    for (let day = -7; day < 14; day++) {
      if ((day + 7) % 7 >= 5) continue;
      const date = addDays(monday, day);
      for (const [i, member] of staff.entries()) {
        if ((i + day + 21) % 3 === 0) continue;
        const code = member.projects[(day + 21 + i) % member.projects.length];
        const template = TEMPLATES[code][(n + i) % TEMPLATES[code].length];
        em.create(Activity, {
          title: template.title,
          description: template.description,
          date,
          startTime: START_TIMES[(n * 5 + i) % START_TIMES.length],
          location: template.place,
          project: projects.get(code)!,
          author: member.user,
        });
        n++;
      }
    }
  }
}
