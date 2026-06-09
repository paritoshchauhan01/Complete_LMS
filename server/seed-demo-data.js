/**
 * seed-demo-data.js
 * Run from server folder: node seed-demo-data.js
 *
 * Seeds the DB with demo teachers, students, courses, subjects, and assignments
 * so the LMS looks populated and engaging on first run.
 */

require('dotenv').config();
const {
  sequelize, User, Course, Subject,
  SubjectAssignment, Assignment, Enrollment, SubjectTeacher
} = require('./src/models');

// ─── Demo Teachers ────────────────────────────────────────────────────────────
const TEACHERS = [
  {
    firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.sharma.demo@edulmsdemo.in',
    courseField: 'B.Tech',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
  },
  {
    firstName: 'Rahul', lastName: 'Verma',
    email: 'rahul.verma.demo@edulmsdemo.in',
    courseField: 'BCA',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
  },
  {
    firstName: 'Anjali', lastName: 'Gupta',
    email: 'anjali.gupta.demo@edulmsdemo.in',
    courseField: 'MBA',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anjali',
  },
];

// ─── Demo Students ────────────────────────────────────────────────────────────
const STUDENTS = [
  { firstName: 'Arjun',  lastName: 'Singh',  email: 'arjun.singh.demo@edulmsdemo.in',  courseField: 'B.Tech' },
  { firstName: 'Meera',  lastName: 'Patel',  email: 'meera.patel.demo@edulmsdemo.in',  courseField: 'BCA'    },
  { firstName: 'Karan',  lastName: 'Mehta',  email: 'karan.mehta.demo@edulmsdemo.in',  courseField: 'B.Tech' },
  { firstName: 'Sneha',  lastName: 'Joshi',  email: 'sneha.joshi.demo@edulmsdemo.in',  courseField: 'MBA'    },
  { firstName: 'Rohan',  lastName: 'Kumar',  email: 'rohan.kumar.demo@edulmsdemo.in',  courseField: 'BCA'    },
  { firstName: 'Nisha',  lastName: 'Yadav',  email: 'nisha.yadav.demo@edulmsdemo.in',  courseField: 'B.Tech' },
  { firstName: 'Vivek',  lastName: 'Tiwari', email: 'vivek.tiwari.demo@edulmsdemo.in', courseField: 'MBA'    },
  { firstName: 'Pooja',  lastName: 'Mishra', email: 'pooja.mishra.demo@edulmsdemo.in', courseField: 'BCA'    },
];

// ─── Courses with Subjects ────────────────────────────────────────────────────
const COURSES_DATA = [
  {
    title: 'Data Structures & Algorithms',
    code: 'CS301',
    description: 'Master fundamental data structures—arrays, linked lists, trees, graphs—and algorithm design paradigms including sorting, searching, and dynamic programming.',
    courseField: 'B.Tech',
    teacherIndex: 0,
    subjects: [
      { name: 'Arrays & Strings',       code: 'CS301-01', desc: 'Array manipulation, string algorithms, and matrix problems.' },
      { name: 'Linked Lists & Stacks',  code: 'CS301-02', desc: 'Singly/doubly linked lists, stack and queue implementations.' },
      { name: 'Trees & Graphs',         code: 'CS301-03', desc: 'Binary trees, BST, DFS, BFS, shortest path algorithms.' },
      { name: 'Dynamic Programming',    code: 'CS301-04', desc: 'Memoization, tabulation, and classic DP problems.' },
    ],
  },
  {
    title: 'Web Development with React',
    code: 'CS402',
    description: 'Build modern, responsive web applications using React, REST APIs, and industry best practices. From HTML basics to full-stack integration.',
    courseField: 'BCA',
    teacherIndex: 1,
    subjects: [
      { name: 'HTML & CSS Fundamentals', code: 'CS402-01', desc: 'Semantic HTML, Flexbox, Grid, and responsive design.' },
      { name: 'JavaScript ES6+',         code: 'CS402-02', desc: 'Arrow functions, promises, async/await, and modules.' },
      { name: 'React Core Concepts',     code: 'CS402-03', desc: 'Components, props, state, hooks, and client-side routing.' },
      { name: 'Backend Integration',     code: 'CS402-04', desc: 'REST APIs, Axios, JWT auth, and deployment.' },
    ],
  },
  {
    title: 'Database Management Systems',
    code: 'CS201',
    description: 'Comprehensive study of relational databases, SQL query writing, normalization, transactions, indexing, and an introduction to NoSQL.',
    courseField: 'BCA',
    teacherIndex: 0,
    subjects: [
      { name: 'SQL Fundamentals',       code: 'CS201-01', desc: 'SELECT, JOINs, GROUP BY, subqueries, and aggregate functions.' },
      { name: 'Database Design',        code: 'CS201-02', desc: 'ER diagrams, normalization (1NF–3NF), schema design.' },
      { name: 'Transactions & Indexes', code: 'CS201-03', desc: 'ACID properties, indexing strategies, and query optimization.' },
    ],
  },
  {
    title: 'Business Strategy & Management',
    code: 'MBA501',
    description: 'Strategic management frameworks, competitive analysis, and leadership principles for modern organisations. Case study driven.',
    courseField: 'MBA',
    teacherIndex: 2,
    subjects: [
      { name: 'Strategic Analysis',      code: 'MBA501-01', desc: 'SWOT, PESTLE, Porter\'s Five Forces, and Blue Ocean Strategy.' },
      { name: 'Organisational Behaviour',code: 'MBA501-02', desc: 'Leadership styles, team dynamics, motivation theories.' },
      { name: 'Financial Management',    code: 'MBA501-03', desc: 'Budgeting, ratio analysis, and investment decisions.' },
    ],
  },
  {
    title: 'Machine Learning Fundamentals',
    code: 'CS501',
    description: 'Introduction to supervised and unsupervised learning, model evaluation, and practical ML projects using Python and scikit-learn.',
    courseField: 'B.Tech',
    teacherIndex: 2,
    subjects: [
      { name: 'Regression Models',         code: 'CS501-01', desc: 'Linear & logistic regression, cost functions, gradient descent.' },
      { name: 'Tree-Based Methods',        code: 'CS501-02', desc: 'Decision trees, random forests, and ensemble learning.' },
      { name: 'Neural Network Basics',     code: 'CS501-03', desc: 'Perceptrons, backpropagation, and activation functions.' },
    ],
  },
];

// ─── Assignment name bank ─────────────────────────────────────────────────────
const ASSIGNMENT_BANK = [
  { suffix: 'Weekly Quiz',         desc: 'Online quiz covering this week\'s topics. Complete all questions before the deadline.',            days: 7  },
  { suffix: 'Programming Lab',     desc: 'Implement the given problem with proper code, comments, and test cases. Upload as a ZIP.',         days: 12 },
  { suffix: 'Mid-Unit Project',    desc: 'Build a small project demonstrating your understanding of concepts covered so far.',               days: 20 },
  { suffix: 'Case Study Report',   desc: 'Analyse the provided case study and submit a 2-page report with findings and recommendations.',   days: 10 },
  { suffix: 'Lab Worksheet',       desc: 'Complete the worksheet, show your working, and upload a scanned PDF.',                            days: 5  },
  { suffix: 'Peer Review Exercise',desc: 'Review two of your classmates\' previous submissions and provide structured feedback.',            days: 9  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const addDays  = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const subDays  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

// ─── Main Seed ────────────────────────────────────────────────────────────────
async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // 1. Teachers
    console.log('👩‍🏫 Creating demo teachers...');
    const teacherUsers = [];
    for (const t of TEACHERS) {
      const [user, created] = await User.findOrCreate({
        where: { email: t.email },
        defaults: { ...t, role: 'teacher', isActive: true,
                    googleId: `demo_${Buffer.from(t.email).toString('base64').slice(0,20)}` },
      });
      console.log(`  ${created ? '✅' : '⚠️ '} ${t.firstName} ${t.lastName} (${t.courseField})`);
      teacherUsers.push(user);
    }

    // 2. Students
    console.log('\n👨‍🎓 Creating demo students...');
    const studentUsers = [];
    for (const s of STUDENTS) {
      const [user, created] = await User.findOrCreate({
        where: { email: s.email },
        defaults: {
          ...s, role: 'student', isActive: true,
          googleId: `demo_${Buffer.from(s.email).toString('base64').slice(0,20)}`,
          profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}`,
        },
      });
      console.log(`  ${created ? '✅' : '⚠️ '} ${s.firstName} ${s.lastName}`);
      studentUsers.push(user);
    }

    // 3. Courses → Subjects → Assignments
    console.log('\n🏫 Creating courses, subjects & assignments...');
    let totalSubjects = 0, totalAssignments = 0;

    for (const cd of COURSES_DATA) {
      const teacher = teacherUsers[cd.teacherIndex];

      // Course
      const [course, courseCreated] = await Course.findOrCreate({
        where: { code: cd.code },
        defaults: {
          title: cd.title, code: cd.code, description: cd.description,
          courseField: cd.courseField, teacherId: teacher.id,
          isPublished: true,
          startDate: subDays(30), endDate: addDays(120),
          enrollmentLimit: 60,
        },
      });
      console.log(`\n  ${courseCreated ? '✅' : '⚠️ '} Course: ${cd.title} [${cd.code}]`);

      // Enrol matching-field students in this course
      const matching = studentUsers.filter(s => s.courseField === cd.courseField);
      for (const student of matching) {
        await Enrollment.findOrCreate({
          where: { userId: student.id, courseId: course.id },
          defaults: { userId: student.id, courseId: course.id, enrollmentDate: subDays(20) },
        });
      }
      console.log(`     👥 Enrolled ${matching.length} students`);

      // Course-level final assessment
      await Assignment.findOrCreate({
        where: { title: `${cd.title} — Final Assessment`, courseId: course.id },
        defaults: {
          title: `${cd.title} — Final Assessment`,
          description: `Comprehensive semester-end assessment for ${cd.title}. Covers all topics. Open book.`,
          dueDate: addDays(90),
          courseId: course.id,
          totalPoints: 100,
          isPublished: true,
        },
      });
      totalAssignments++;

      // Subjects
      for (let si = 0; si < cd.subjects.length; si++) {
        const sd = cd.subjects[si];

        const [subject, subCreated] = await Subject.findOrCreate({
          where: { code: sd.code },
          defaults: {
            name: sd.name, code: sd.code,
            description: sd.desc,
            courseField: cd.courseField,
            isActive: true,
          },
        });
        if (subCreated) {
          console.log(`     📖 Subject: ${sd.name}`);
          totalSubjects++;
        }

        // Link teacher to subject via SubjectTeacher junction
        if (SubjectTeacher) {
          await SubjectTeacher.findOrCreate({
            where: { subjectId: subject.id, teacherId: teacher.id },
            defaults: { subjectId: subject.id, teacherId: teacher.id },
          }).catch(() => {}); // ignore if already exists
        }

        // 2 assignments per subject, rotating from the bank
        const a1 = ASSIGNMENT_BANK[si % ASSIGNMENT_BANK.length];
        const a2 = ASSIGNMENT_BANK[(si + 3) % ASSIGNMENT_BANK.length];

        await SubjectAssignment.findOrCreate({
          where: { title: `${sd.name}: ${a1.suffix}`, subjectId: subject.id },
          defaults: {
            title: `${sd.name}: ${a1.suffix}`,
            description: a1.desc, dueDate: addDays(a1.days),
            subjectId: subject.id, totalPoints: 50, isPublished: true,
          },
        });
        totalAssignments++;

        await SubjectAssignment.findOrCreate({
          where: { title: `${sd.name}: ${a2.suffix}`, subjectId: subject.id },
          defaults: {
            title: `${sd.name}: ${a2.suffix}`,
            description: a2.desc, dueDate: addDays(a2.days + 10),
            subjectId: subject.id, totalPoints: 30, isPublished: true,
          },
        });
        totalAssignments++;
      }
    }

    // 4. Summary
    console.log('\n' + '═'.repeat(52));
    console.log('🎉  Demo data seeded successfully!');
    console.log('═'.repeat(52));
    console.log(`  👩‍🏫  Teachers:    ${TEACHERS.length}`);
    console.log(`  👨‍🎓  Students:    ${STUDENTS.length}`);
    console.log(`  🏫   Courses:     ${COURSES_DATA.length}`);
    console.log(`  📖   Subjects:    ${totalSubjects}`);
    console.log(`  📝   Assignments: ${totalAssignments}`);
    console.log('═'.repeat(52));
    console.log('\n⚠️  Demo teachers have placeholder Google IDs.');
    console.log('   Real teachers must sign in via Google OAuth.');
    console.log('   Run:  node create-admin.js  to set up your admin.\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message || err);
    process.exit(1);
  }
}

seed();
