/**
 * Seed script — adds pseudo courses, subjects & assignments for all courseFields
 * Run from server/ folder: node seed-all-fields.js
 */
require('dotenv').config();
const { sequelize, User, Course, Assignment, Subject, SubjectAssignment } = require('./src/models');

const FIELDS = ['B.Tech', 'BCA', 'MBA', 'MCA', 'B.Sc'];

const DATA = {
  'B.Tech': {
    courses: [
      { title: 'Data Structures & Algorithms', code: 'BT-DSA-101', description: 'Arrays, linked lists, trees, graphs, sorting and searching algorithms.' },
      { title: 'Operating Systems', code: 'BT-OS-102', description: 'Process management, memory management, file systems and concurrency.' },
      { title: 'Computer Organization', code: 'BT-CO-103', description: 'CPU architecture, instruction sets, memory hierarchy and I/O systems.' },
    ],
    subjects: [
      { name: 'Engineering Mathematics', code: 'BT-MATH-S01', description: 'Calculus, linear algebra and differential equations for engineers.' },
      { name: 'Computer Networks', code: 'BT-CN-S02', description: 'OSI model, TCP/IP, routing protocols and network security.' },
      { name: 'Software Engineering', code: 'BT-SE-S03', description: 'SDLC, agile, design patterns, testing and project management.' },
    ],
  },
  'BCA': {
    courses: [
      { title: 'Web Development Fundamentals', code: 'BCA-WEB-101', description: 'HTML, CSS, JavaScript and building responsive websites from scratch.' },
      { title: 'Database Management Systems', code: 'BCA-DBMS-102', description: 'Relational databases, SQL, normalization and transaction management.' },
      { title: 'Programming in Python', code: 'BCA-PY-103', description: 'Python basics, OOP, file handling and introduction to libraries.' },
    ],
    subjects: [
      { name: 'Programming in C', code: 'BCA-C-S01', description: 'C fundamentals, pointers, arrays and memory management.' },
      { name: 'Discrete Mathematics', code: 'BCA-DM-S02', description: 'Sets, logic, graph theory and combinatorics.' },
      { name: 'Computer Architecture', code: 'BCA-CA-S03', description: 'Digital logic, CPU design, memory and I/O organization.' },
    ],
  },
  'MBA': {
    courses: [
      { title: 'Business Strategy & Management', code: 'MBA-BSM-101', description: 'Strategic planning, competitive analysis and organizational management.' },
      { title: 'Financial Accounting', code: 'MBA-FA-102', description: 'Balance sheets, income statements, financial ratios and reporting.' },
      { title: 'Operations Management', code: 'MBA-OM-103', description: 'Supply chain, quality management, process optimization and logistics.' },
    ],
    subjects: [
      { name: 'Marketing Management', code: 'MBA-MKT-S01', description: 'Market segmentation, consumer behaviour and digital marketing.' },
      { name: 'Human Resource Management', code: 'MBA-HRM-S02', description: 'Recruitment, performance appraisal and organizational behaviour.' },
      { name: 'Business Analytics', code: 'MBA-BA-S03', description: 'Data-driven decision making, Excel, Power BI and basic statistics.' },
    ],
  },
  'MCA': {
    courses: [
      { title: 'Advanced Java Programming', code: 'MCA-JAVA-101', description: 'OOP, collections, multithreading, JDBC and Spring framework basics.' },
      { title: 'Machine Learning Fundamentals', code: 'MCA-ML-102', description: 'Supervised and unsupervised learning, model evaluation and scikit-learn.' },
      { title: 'Full Stack Web Development', code: 'MCA-FS-103', description: 'React, Node.js, REST APIs, databases and deployment.' },
    ],
    subjects: [
      { name: 'Cloud Computing', code: 'MCA-CC-S01', description: 'AWS, Azure basics, virtualization and serverless architecture.' },
      { name: 'Cyber Security', code: 'MCA-CS-S02', description: 'Ethical hacking, cryptography, network security and OWASP top 10.' },
      { name: 'Advanced DBMS', code: 'MCA-DBMS-S03', description: 'NoSQL, query optimization, distributed databases and transactions.' },
    ],
  },
  'B.Sc': {
    courses: [
      { title: 'Physics — Mechanics & Waves', code: 'BSC-PHY-101', description: 'Newtonian mechanics, oscillations, wave motion and thermodynamics.' },
      { title: 'Chemistry — Organic Fundamentals', code: 'BSC-CHEM-102', description: 'Functional groups, reaction mechanisms and organic synthesis.' },
      { title: 'Introduction to Programming', code: 'BSC-PROG-103', description: 'Programming basics using Python — logic, loops and functions.' },
    ],
    subjects: [
      { name: 'Statistics & Probability', code: 'BSC-STAT-S01', description: 'Descriptive statistics, probability distributions and hypothesis testing.' },
      { name: 'Environmental Science', code: 'BSC-ENV-S02', description: 'Ecosystems, biodiversity, climate change and sustainable development.' },
      { name: 'Calculus & Linear Algebra', code: 'BSC-MATH-S03', description: 'Limits, derivatives, integrals, matrices and vector spaces.' },
    ],
  },
};

function dueDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

const COURSE_ASSIGNMENTS = [
  { title: 'Unit 1 — Practice Problems', description: 'Solve the given problems from Unit 1 and submit as PDF.', totalPoints: 20, days: 15 },
  { title: 'Mid-Term Assignment', description: 'Detailed report covering topics from the first half of the course.', totalPoints: 50, days: 45 },
  { title: 'Final Project Submission', description: 'Comprehensive project covering all course topics. Include code/report.', totalPoints: 100, days: 90 },
];

const SUBJECT_ASSIGNMENTS = [
  { title: 'Chapter 1 Exercises', description: 'Complete all exercises from Chapter 1 and submit your answers.', totalPoints: 15, days: 10 },
  { title: 'Term Paper', description: 'Write a 1000-word term paper on any topic covered in this subject.', totalPoints: 40, days: 40 },
  { title: 'End Semester Assignment', description: 'Answer all questions in the given question bank. Submit before exam.', totalPoints: 80, days: 80 },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin first.');
      process.exit(1);
    }
    console.log(`👤 Using admin: ${admin.email}\n`);

    for (const field of FIELDS) {
      console.log(`\n📚 ── ${field} ──`);
      const { courses, subjects } = DATA[field];

      // Courses + their assignments
      for (const c of courses) {
        const exists = await Course.findOne({ where: { code: c.code } });
        if (exists) {
          console.log(`  ⏭  Course exists: ${c.title}`);
          continue;
        }
        const course = await Course.create({
          ...c,
          courseField: field,
          teacherId: admin.id,
          isPublished: true,
          startDate: new Date(),
          endDate: dueDate(180),
          enrollmentLimit: 100,
        });
        console.log(`  ✅ Course: ${c.title}`);

        for (const a of COURSE_ASSIGNMENTS) {
          await Assignment.create({
            title: a.title,
            description: a.description,
            totalPoints: a.totalPoints,
            dueDate: dueDate(a.days),
            isPublished: true,
            courseId: course.id,
          });
        }
        console.log(`     ↳ ${COURSE_ASSIGNMENTS.length} assignments added`);
      }

      // Subjects + their assignments
      for (const s of subjects) {
        const exists = await Subject.findOne({ where: { code: s.code } });
        if (exists) {
          console.log(`  ⏭  Subject exists: ${s.name}`);
          continue;
        }
        const subject = await Subject.create({
          ...s,
          courseField: field,
          isActive: true,
        });
        console.log(`  ✅ Subject: ${s.name}`);

        for (const a of SUBJECT_ASSIGNMENTS) {
          await SubjectAssignment.create({
            title: a.title,
            description: a.description,
            totalPoints: a.totalPoints,
            dueDate: dueDate(a.days),
            isPublished: true,
            subjectId: subject.id,
          });
        }
        console.log(`     ↳ ${SUBJECT_ASSIGNMENTS.length} assignments added`);
      }
    }

    console.log('\n🎉 All done! Fields seeded:', FIELDS.join(', '));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
