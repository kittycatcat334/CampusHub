import {
  UniversityClass,
  Assignment,
  Submission,
  Announcement,
  ClassResource,
  Enrollment,
  User,
  UserRole,
  AcademicWorkItem,
  DailyClassScheduleItem,
  Classroom,
  Institution,
  PersonalScheduleItem,
  AcademicNote
} from '../types';

// Pre-seeded Multi-Tenant Universities / Institutions
export const DEFAULT_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-campushub',
    name: 'CampusHub Global University',
    shortName: 'CampusHub',
    code: 'CHUB',
    domain: 'campushub.edu',
    tagline: 'Excellence in Higher Education, Applied Computing & Research',
    location: 'Cambridge, Massachusetts',
    brandColor: 'indigo',
    logoText: 'CH',
    licenseTier: 'Enterprise Global',
    licenseStatus: 'active',
    licenseExpiresAt: '2028-12-31',
    contactAdminName: 'University Super Administrator',
    contactAdminEmail: 'admin@campushub.edu',
    principalName: 'Dr. Evelyn Montgomery',
    principalEmail: 'principal@campushub.edu',
    principalTitle: 'Institutional Principal & Academic Dean',
    staffVerificationCode: '6565',
    portalSubdomain: 'portal.campushub.edu',
    isPrimary: true,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'inst-apex',
    name: 'Apex Institute of Technology',
    shortName: 'Apex Tech',
    code: 'APEX',
    domain: 'apextech.edu',
    tagline: 'Engineering the Future Through Applied Robotics, Systems & AI',
    location: 'Austin, Texas',
    brandColor: 'emerald',
    logoText: 'APEX',
    licenseTier: 'Professional Multi-School',
    licenseStatus: 'active',
    licenseExpiresAt: '2027-09-30',
    contactAdminName: 'Dr. Marcus Vance (Dean)',
    contactAdminEmail: 'admin@apextech.edu',
    principalName: 'Dr. Arthur Sterling',
    principalEmail: 'principal@apextech.edu',
    principalTitle: 'Principal & Rector of Technology',
    staffVerificationCode: '6565',
    portalSubdomain: 'apex.campushub.edu',
    isPrimary: false,
    createdAt: '2026-08-15T00:00:00Z'
  }
];

// Default initial users for CampusHub & Multi-Tenant Demo Institutions
export const DEFAULT_USERS: User[] = [
  // Primary Institution (CampusHub Global University)
  {
    id: 'admin-1',
    institutionId: 'inst-campushub',
    name: 'University Super Administrator',
    email: 'admin@campushub.edu',
    password: 'admin',
    role: 'admin',
    adminId: 'ADMIN-EXEC-01',
    title: 'Dean of Academic Operations & Technology',
    department: 'University Administration & Governance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-1',
    institutionId: 'inst-campushub',
    name: 'Alex Rivera',
    email: 'a.rivera@university.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU-2024-8841',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-2',
    institutionId: 'inst-campushub',
    name: 'Maya Lin',
    email: 'm.lin@university.edu',
    password: 'student123',
    role: 'student',
    studentId: 'STU-2024-9120',
    department: 'Data Science & Mathematics',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher-1',
    institutionId: 'inst-campushub',
    name: 'Dr. Robert Chen',
    email: 'r.chen@university.edu',
    password: 'faculty123',
    role: 'teacher',
    facultyId: 'FAC-ENG-104',
    title: 'Associate Professor of Computer Science',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher-2',
    institutionId: 'inst-campushub',
    name: 'Prof. Sarah Williams',
    email: 's.williams@university.edu',
    password: 'faculty123',
    role: 'teacher',
    facultyId: 'FAC-SCI-088',
    title: 'Professor of Applied Mathematics',
    department: 'Department of Mathematics',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'principal-campushub',
    institutionId: 'inst-campushub',
    name: 'Dr. Evelyn Montgomery',
    email: 'principal@campushub.edu',
    password: 'principal123',
    role: 'principal',
    principalId: 'PRIN-CHUB-01',
    title: 'Institutional Principal & Academic Dean',
    department: 'Executive Leadership & Governance',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80'
  },

  // Apex Institute of Technology Demo Tenant Accounts
  {
    id: 'admin-apex',
    institutionId: 'inst-apex',
    name: 'Dr. Marcus Vance',
    email: 'admin@apextech.edu',
    password: 'admin',
    role: 'admin',
    adminId: 'APEX-ADM-01',
    title: 'Dean of Computing & Applied Science',
    department: 'Institutional Leadership',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'teacher-apex',
    institutionId: 'inst-apex',
    name: 'Prof. Elena Rostova',
    email: 'faculty@apextech.edu',
    password: 'faculty123',
    role: 'teacher',
    facultyId: 'APEX-FAC-12',
    title: 'Professor of Robotics & Artificial Intelligence',
    department: 'Robotics Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'student-apex',
    institutionId: 'inst-apex',
    name: 'Jordan Bell',
    email: 'student@apextech.edu',
    password: 'student123',
    role: 'student',
    studentId: 'APEX-2026-104',
    department: 'Robotics & Autonomous Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'principal-apex',
    institutionId: 'inst-apex',
    name: 'Dr. Arthur Sterling',
    email: 'principal@apextech.edu',
    password: 'principal123',
    role: 'principal',
    principalId: 'PRIN-APEX-01',
    title: 'Principal & Rector of Technology',
    department: 'Institutional Executive Office',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  }
];

export const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'room-1',
    roomNumber: 'Turing Hall 304',
    building: 'Alan Turing Computer Science Center',
    capacity: 65,
    type: 'Computer Lab',
    equipment: ['High-DPI Projector', 'Audio PA System', '45 Workstations', 'Dual Smartboards'],
    courseSubject: 'Data Structures & Algorithm Analysis',
    courseCode: 'CS201',
    teacherName: 'Dr. Robert Chen',
    teacherEmail: 'r.chen@university.edu',
    teacherId: 'teacher-1',
    days: ['Monday', 'Wednesday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    classId: 'class-1',
    notes: 'Main CS department lecture lab. Fiber LAN installed.',
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'room-2',
    roomNumber: 'Euler Science Center 110',
    building: 'Leonhard Euler Mathematics & Sciences Complex',
    capacity: 80,
    type: 'Lecture Hall',
    equipment: ['Triple Chalkboards', 'Laser Projector', 'Acoustic Ceiling Panels', 'Lapel Mics'],
    courseSubject: 'Linear Algebra & Matrix Computation',
    courseCode: 'MATH152',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    teacherId: 'teacher-2',
    days: ['Tuesday', 'Thursday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '01:00 PM',
    endTime: '02:30 PM',
    classId: 'class-2',
    notes: 'Tiered seating auditorium. Wheelchair accessible front row.',
    createdAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'room-3',
    roomNumber: 'Hopper Tech Lab 202',
    building: 'Grace Hopper Software Engineering Hall',
    capacity: 50,
    type: 'Computer Lab',
    equipment: ['Dual Displays', 'PostgreSQL Database Servers', 'Smart Whiteboard'],
    courseSubject: 'Database Management Systems',
    courseCode: 'CS340',
    teacherName: 'Dr. Robert Chen',
    teacherEmail: 'r.chen@university.edu',
    teacherId: 'teacher-1',
    days: ['Monday', 'Wednesday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    classId: 'class-3',
    notes: 'Dedicated server racks for student project deployments.',
    createdAt: '2026-08-16T10:00:00Z'
  },
  {
    id: 'room-4',
    roomNumber: 'Maxwell Hall 108',
    building: 'James Clerk Maxwell Physics Wing',
    capacity: 40,
    type: 'Science Lab',
    equipment: ['High-Voltage DC Supplies', 'Oscilloscopes', 'Safety Eyewash Station', 'Fume Hood'],
    courseSubject: 'University Physics II: Electromagnetism & Optics',
    courseCode: 'PHYS210',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    teacherId: 'teacher-2',
    days: ['Thursday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '03:30 PM',
    endTime: '05:30 PM',
    classId: 'class-4',
    notes: 'Strict lab safety rules enforced. Closed-toe shoes mandatory.',
    createdAt: '2026-08-16T11:00:00Z'
  },
  {
    id: 'room-5',
    institutionId: 'inst-campushub',
    roomNumber: 'Humanities & Arts 415',
    building: 'Central Humanities Building',
    capacity: 35,
    type: 'Seminar Room',
    equipment: ['Conference Table', 'Zoom Teleconference Rig', 'Smart 4K TV'],
    courseSubject: 'Technical Writing & Scientific Communication',
    courseCode: 'ENG102',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    teacherId: 'teacher-2',
    days: ['Friday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    classId: 'class-5',
    notes: 'Roundtable discussion and workshop format.',
    createdAt: '2026-08-17T08:30:00Z'
  },
  // Apex Institute of Technology Demo Classrooms
  {
    id: 'room-apex-1',
    institutionId: 'inst-apex',
    roomNumber: 'Robotics Lab A1',
    building: 'Nikola Tesla Applied Engineering Complex',
    capacity: 45,
    type: 'Computer Lab',
    equipment: ['High-Power GPU Workstations', 'ROS2 Test Rig', 'Drone Flight Cage'],
    courseSubject: 'Autonomous Aerial Robotics & SLAM',
    courseCode: 'ROB401',
    teacherName: 'Prof. Elena Rostova',
    teacherEmail: 'faculty@apextech.edu',
    teacherId: 'teacher-apex',
    days: ['Monday', 'Wednesday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    classId: 'class-apex-1',
    notes: 'State of the art autonomous systems laboratory at Apex Tech.',
    createdAt: '2026-08-18T09:00:00Z'
  },
  {
    id: 'room-apex-2',
    institutionId: 'inst-apex',
    roomNumber: 'Cybernetics Auditorium 500',
    building: 'Turing-Von Neumann Science Hall',
    capacity: 120,
    type: 'Lecture Hall',
    equipment: ['Laser Projection Array', '4K Surround AV', 'Interactive Podium'],
    courseSubject: 'Deep Learning & Neural Architectures',
    courseCode: 'AI310',
    teacherName: 'Prof. Elena Rostova',
    teacherEmail: 'faculty@apextech.edu',
    teacherId: 'teacher-apex',
    days: ['Tuesday', 'Thursday'],
    startDate: '2026-09-01',
    endDate: '2026-12-18',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    classId: 'class-apex-2',
    notes: 'Primary lecture theatre for artificial intelligence cohort.',
    createdAt: '2026-08-18T10:00:00Z'
  }
];

const DEFAULT_CLASSES: UniversityClass[] = [
  {
    id: 'class-1',
    institutionId: 'inst-campushub',
    code: 'CS201',
    name: 'Data Structures & Algorithm Analysis',
    section: 'Section 01',
    semester: 'Fall 2026',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    teacherEmail: 'r.chen@university.edu',
    room: 'Turing Hall 304',
    schedule: 'Mon & Wed 10:00 AM - 11:30 AM',
    color: 'indigo',
    joinCode: 'CS201A',
    description: 'Fundamental data structures including balanced trees, hash tables, graphs, heaps, and asymptotic runtime analysis.',
    enrolledStudentCount: 28
  },
  {
    id: 'class-2',
    institutionId: 'inst-campushub',
    code: 'MATH152',
    name: 'Linear Algebra & Matrix Computation',
    section: 'Section 03',
    semester: 'Fall 2026',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    room: 'Euler Science Center 110',
    schedule: 'Tue & Thu 01:00 PM - 02:30 PM',
    color: 'emerald',
    joinCode: 'MATH52',
    description: 'Vector spaces, eigenvalues, eigenvectors, orthogonal projections, Singular Value Decomposition (SVD), and computational applications.',
    enrolledStudentCount: 34
  },
  {
    id: 'class-3',
    institutionId: 'inst-campushub',
    code: 'CS340',
    name: 'Database Management Systems',
    section: 'Section 02',
    semester: 'Fall 2026',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    teacherEmail: 'r.chen@university.edu',
    room: 'Hopper Lab 202',
    schedule: 'Mon & Wed 02:00 PM - 03:30 PM',
    color: 'amber',
    joinCode: 'CS340X',
    description: 'Relational algebra, SQL, database normalization, B-trees, indexing, ACID transactions, and NoSQL document models.',
    enrolledStudentCount: 22
  },
  {
    id: 'class-4',
    institutionId: 'inst-campushub',
    code: 'PHYS210',
    name: 'University Physics II: Electromagnetism & Optics',
    section: 'Section 01',
    semester: 'Fall 2026',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    room: 'Maxwell Hall 108',
    schedule: 'Tue & Thu 03:30 PM - 05:00 PM',
    color: 'sky',
    joinCode: 'PHYS21',
    description: 'Electric and magnetic fields, Gauss’s Law, electromagnetic waves, circuit elements, geometric optics, and interference.',
    enrolledStudentCount: 30
  },
  {
    id: 'class-5',
    institutionId: 'inst-campushub',
    code: 'ENG102',
    name: 'Technical Writing & Scientific Communication',
    section: 'Section 04',
    semester: 'Fall 2026',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    teacherEmail: 's.williams@university.edu',
    room: 'Franklin Humanities 204',
    schedule: 'Friday 09:30 AM - 11:30 AM',
    color: 'rose',
    joinCode: 'ENG102',
    description: 'Engineering proposals, peer-reviewed paper structures, technical specifications, and ethical presentation of scientific research.',
    enrolledStudentCount: 26
  },
  // Apex Institute of Technology Demo Classes
  {
    id: 'class-apex-1',
    institutionId: 'inst-apex',
    code: 'ROB401',
    name: 'Autonomous Aerial Robotics & SLAM',
    section: 'Section 01',
    semester: 'Fall 2026',
    teacherId: 'teacher-apex',
    teacherName: 'Prof. Elena Rostova',
    teacherEmail: 'faculty@apextech.edu',
    room: 'Robotics Lab A1',
    schedule: 'Mon & Wed 09:30 AM - 11:00 AM',
    color: 'emerald',
    joinCode: 'ROB401',
    description: 'Autonomous state estimation, Kalman filters, point-cloud mapping, and quadrotor drone control.',
    enrolledStudentCount: 18
  },
  {
    id: 'class-apex-2',
    institutionId: 'inst-apex',
    code: 'AI310',
    name: 'Deep Learning & Neural Architectures',
    section: 'Section 02',
    semester: 'Fall 2026',
    teacherId: 'teacher-apex',
    teacherName: 'Prof. Elena Rostova',
    teacherEmail: 'faculty@apextech.edu',
    room: 'Cybernetics Auditorium 500',
    schedule: 'Tue & Thu 02:00 PM - 03:30 PM',
    color: 'sky',
    joinCode: 'AI310X',
    description: 'Attention mechanisms, diffusion generative models, convolution topologies, and model training.',
    enrolledStudentCount: 26
  }
];

const DEFAULT_ENROLLMENTS: Enrollment[] = [
  { id: 'enr-1', classId: 'class-1', studentId: 'student-1', enrolledAt: '2026-08-25T09:00:00Z' },
  { id: 'enr-2', classId: 'class-2', studentId: 'student-1', enrolledAt: '2026-08-25T09:15:00Z' },
  { id: 'enr-3', classId: 'class-3', studentId: 'student-1', enrolledAt: '2026-08-26T11:00:00Z' },
  { id: 'enr-4', classId: 'class-4', studentId: 'student-1', enrolledAt: '2026-08-26T11:30:00Z' },
  { id: 'enr-5', classId: 'class-5', studentId: 'student-1', enrolledAt: '2026-08-27T08:00:00Z' },
  { id: 'enr-6', classId: 'class-1', studentId: 'student-2', enrolledAt: '2026-08-25T10:00:00Z' },
  { id: 'enr-7', classId: 'class-2', studentId: 'student-2', enrolledAt: '2026-08-25T10:30:00Z' }
];

// Reference date: 2026-09-17 12:44:38
const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-today',
    classId: 'class-2',
    teacherId: 'teacher-2',
    title: 'Problem Set 3: Matrix Transformations & Rank-Nullity Theorem',
    description: 'Complete questions 3.1 through 3.8 covering kernel and image vector spaces, basis transformations, and the Rank-Nullity theorem. Scanned handwritten or LaTeX derivations accepted.',
    dueDate: '2026-09-17T17:00:00', // Today at 5:00 PM (urgent real-time cutoff!)
    points: 40,
    category: 'Homework',
    attachments: [
      { name: 'ProblemSet3_Prompts.pdf', url: '#', size: '280 KB' },
      { name: 'LaTeX_Template.tex', url: '#', size: '15 KB' }
    ],
    createdAt: '2026-09-08T09:00:00Z'
  },
  {
    id: 'assign-1',
    classId: 'class-1',
    teacherId: 'teacher-1',
    title: 'Lab 3: Red-Black Tree Balancing Implementation',
    description: 'Implement insertion and rebalancing operations for a Red-Black Tree in C++ or Java. Your implementation must satisfy all four RB-tree properties and provide O(log n) search and insertion benchmarks.',
    dueDate: '2026-09-18T23:59:00', // Tomorrow
    points: 50,
    category: 'Lab',
    attachments: [
      { name: 'RBTree_Starter_Kit.zip', url: '#', size: '1.4 MB' },
      { name: 'Specification_Rubric.pdf', url: '#', size: '320 KB' }
    ],
    createdAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'assign-phys',
    classId: 'class-4',
    teacherId: 'teacher-2',
    title: 'Lab Experiment 2: Coulomb’s Law & Equipotential Mapping',
    description: 'Calculate electrostatic force constants between charged conductors, graph measured voltage equipotentials, and quantify measurement error margins.',
    dueDate: '2026-09-20T23:59:00', // Sunday
    points: 60,
    category: 'Lab',
    attachments: [
      { name: 'Coulomb_Lab_Manual.pdf', url: '#', size: '540 KB' }
    ],
    createdAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'assign-2',
    classId: 'class-2',
    teacherId: 'teacher-2',
    title: 'Problem Set 4: Eigenvalues & Principal Component Analysis',
    description: 'Complete problem sets 4.1 through 4.6 from Chapter 5. Show full mathematical derivation for matrix diagonalization and explain geometric projection in problem 4.5.',
    dueDate: '2026-09-22T17:00:00', // In 5 days
    points: 100,
    category: 'Homework',
    attachments: [
      { name: 'ProblemSet_4_Handout.pdf', url: '#', size: '540 KB' }
    ],
    createdAt: '2026-09-12T14:30:00Z'
  },
  {
    id: 'assign-3',
    classId: 'class-3',
    teacherId: 'teacher-1',
    title: 'Milestone 2: Schema Design & 3NF Normalization Report',
    description: 'Submit an Entity-Relationship (ER) diagram for your course project along with relational schema mapping in Third Normal Form (3NF). Include functional dependencies table.',
    dueDate: '2026-09-24T23:59:00', // In 7 days
    points: 75,
    category: 'Project',
    attachments: [
      { name: 'Normalization_Guidelines.pdf', url: '#', size: '820 KB' }
    ],
    createdAt: '2026-09-14T09:00:00Z'
  },
  {
    id: 'assign-4',
    classId: 'class-1',
    teacherId: 'teacher-1',
    title: 'Assignment 1: Asymptotic Big-O Proofs & Master Theorem',
    description: 'Solve the recurrence relations using the Master Method and recursion tree visualization. Provide tight bound proofs.',
    dueDate: '2026-09-08T23:59:00', // Past assignment (already reviewed)
    points: 40,
    category: 'Homework',
    attachments: [],
    createdAt: '2026-09-01T08:00:00Z'
  }
];

const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'assign-4',
    studentId: 'student-1',
    studentName: 'Alex Rivera',
    studentEmail: 'a.rivera@university.edu',
    submittedAt: '2026-09-08T21:40:00',
    submissionType: 'file',
    content: 'Rivera_Alex_CS201_HW1_Proofs.pdf',
    fileSize: '412 KB',
    status: 'reviewed',
    grade: 38,
    feedback: 'Excellent rigor on Problem 3 recursion tree proof. Watch out for Case 2 log factor base notation in Question 4.',
    reviewedAt: '2026-09-11T16:20:00',
    reviewedBy: 'Dr. Robert Chen'
  },
  {
    id: 'sub-2',
    assignmentId: 'assign-4',
    studentId: 'student-2',
    studentName: 'Maya Lin',
    studentEmail: 'm.lin@university.edu',
    submittedAt: '2026-09-08T22:10:00',
    submissionType: 'file',
    content: 'MayaLin_HW1_RecurrenceProofs.pdf',
    fileSize: '680 KB',
    status: 'reviewed',
    grade: 40,
    feedback: 'Flawless proofs and clear step-by-step mathematical reasoning.',
    reviewedAt: '2026-09-11T16:30:00',
    reviewedBy: 'Dr. Robert Chen'
  }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-urgent-ps3',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    authorName: 'Prof. Sarah Williams',
    authorRole: 'Associate Professor & Dept Chair • Dept of Mathematics',
    authorEmail: 's.williams@university.edu',
    title: 'Submission Reminder: Problem Set 3 due Today at 5:00 PM',
    content: 'A reminder that Problem Set 3 (Matrix Transformations & Rank-Nullity Theorem) is due today at 5:00 PM sharp. If you have questions on Problem 3.5 (kernel basis verification), stop by Euler Science Center 110 before our 1:00 PM lecture.',
    priority: 'urgent',
    pinned: true,
    createdAt: '2026-09-17T09:15:00',
    attachments: [
      { name: 'ProblemSet3_Prompts.pdf', url: '#', size: '280 KB' },
      { name: 'LaTeX_Template.tex', url: '#', size: '15 KB' }
    ]
  },
  {
    id: 'ann-1',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    authorName: 'Dr. Robert Chen',
    authorRole: 'Lead Instructor • Dept of Computer Science',
    authorEmail: 'r.chen@university.edu',
    title: 'Midterm 1 Review Session & Extra Office Hours',
    content: 'We will hold an optional review session this Friday at 4:00 PM in Turing Hall 304. We will walk through previous exam problems on binary heaps, red-black trees, and amortized analysis. Bring your questions!',
    priority: 'important',
    pinned: true,
    createdAt: '2026-09-16T15:30:00',
    attachments: [
      { name: 'Midterm1_Sample_Problems.pdf', url: '#', size: '420 KB' }
    ]
  },
  {
    id: 'ann-phys',
    classId: 'class-4',
    className: 'University Physics II: Electromagnetism & Optics',
    classCode: 'PHYS210',
    teacherId: 'teacher-2',
    authorName: 'Prof. Sarah Williams',
    authorRole: 'Visiting Faculty • Dept of Physics & Applied Sciences',
    authorEmail: 's.williams@university.edu',
    title: 'Lab 2 Safety Protocol & Equipotential Mapping Equipment',
    content: 'For our Thursday 3:30 PM lab in Maxwell Hall 108, please review the safety protocol for high-voltage DC power sources. Closed-toe shoes and safety glasses are strictly required.',
    priority: 'important',
    pinned: false,
    createdAt: '2026-09-16T10:00:00',
    attachments: [
      { name: 'Lab2_Safety_Rules.pdf', url: '#', size: '185 KB' }
    ]
  },
  {
    id: 'ann-2',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    authorName: 'Prof. Sarah Williams',
    authorRole: 'Associate Professor & Dept Chair • Dept of Mathematics',
    authorEmail: 's.williams@university.edu',
    title: 'Quiz 2 Solutions & SVD Computational Notes Posted',
    content: 'The complete answer key with worked step-by-step solutions for Tuesday\'s matrix determinant quiz has been added to the Resources section under Exam Prep.',
    priority: 'normal',
    pinned: false,
    createdAt: '2026-09-15T11:00:00'
  },
  {
    id: 'ann-3',
    classId: 'class-3',
    className: 'Database Management Systems',
    classCode: 'CS340',
    teacherId: 'teacher-1',
    authorName: 'Dr. Robert Chen',
    authorRole: 'Lead Instructor • Dept of Computer Science',
    authorEmail: 'r.chen@university.edu',
    title: 'Guest Lecture next Wednesday: Scaling Databases at Uber',
    content: 'Staff Infrastructure Engineer Jessica Taylor will join us via live teleconference to discuss distributed transactions, Raft consensus, and multi-region sharding strategies.',
    priority: 'normal',
    pinned: false,
    createdAt: '2026-09-14T09:45:00'
  }
];

const DEFAULT_RESOURCES: ClassResource[] = [
  // CS201 - Data Structures & Algorithms
  {
    id: 'res-cs201-syl',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'Official Course Syllabus & Academic Integrity Policy',
    description: 'Comprehensive breakdown of grading policy, exam schedules, late allowances, and code plagiarism rules.',
    topic: 'Course Administration',
    category: 'Syllabus',
    fileType: 'pdf',
    url: 'https://example.edu/cs201/syllabus_fall2026.pdf',
    fileSize: '240 KB',
    uploadedAt: '2026-08-24T10:00:00',
    contentPreview: 'Course: CS201 Fall 2026\nInstructor: Dr. Robert Chen\nGrading: Midterm 1 (20%), Midterm 2 (20%), Final Project (25%), Homeworks (15%), Labs (20%).\nPrerequisites: CS101 or equivalent programming mastery in C++/Java.'
  },
  {
    id: 'res-cs201-slides',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'Lecture 05: Self-Balancing Binary Trees & Rotations',
    description: 'Detailed slide deck covering AVL balance factors, Red-Black color invariants, and single/double rotations.',
    topic: 'Balanced Search Trees',
    category: 'Lecture Notes',
    fileType: 'slide',
    url: 'https://example.edu/cs201/lecture05_trees.pdf',
    fileSize: '4.8 MB',
    uploadedAt: '2026-09-12T17:00:00',
    contentPreview: 'Slide Deck: 42 Slides\nTopics: Binary Search Tree worst-case O(n), height definition, rotation primitives, AVL insertion rebalance, Red-Black 4 properties.'
  },
  {
    id: 'res-cs201-starter',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'Lab 3 Starter Code & Benchmark Suite (C++ / Java)',
    description: 'Makefile, node struct definitions, test harness with 10,000 randomized insertion test cases.',
    topic: 'Labs & Starter Kits',
    category: 'Assignments',
    fileType: 'code',
    url: 'https://example.edu/cs201/lab3_starter.zip',
    fileSize: '1.4 MB',
    uploadedAt: '2026-09-10T10:00:00',
    contentPreview: '// RBNode.hpp\ntemplate <typename T>\nstruct RBNode {\n  T key;\n  Color color;\n  RBNode* left;\n  RBNode* right;\n  RBNode* parent;\n};\n// Benchmark suite verifies O(log n) height invariant'
  },
  {
    id: 'res-cs201-reading',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'CLRS Chapter 13: Red-Black Trees Mathematical Proofs',
    description: 'In-depth proofs showing max height of a Red-Black tree with n internal nodes is at most 2 * lg(n + 1).',
    topic: 'Readings & Theory',
    category: 'Readings',
    fileType: 'pdf',
    url: 'https://example.edu/cs201/clrs_ch13_rbtrees.pdf',
    fileSize: '1.2 MB',
    uploadedAt: '2026-09-04T14:00:00',
    contentPreview: 'Lemma 13.1: A red-black tree with n internal nodes has height at most 2*log2(n + 1).\nProof sketch using induction on black-height bh(x)...'
  },
  {
    id: 'res-cs201-exam',
    classId: 'class-1',
    className: 'Data Structures & Algorithm Analysis',
    classCode: 'CS201',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'Fall 2025 Midterm 1 Archive & Worked Solutions',
    description: 'Previous year exam with point distribution and instructor solution key for exam practice.',
    topic: 'Exam Preparation',
    category: 'Exam Prep',
    fileType: 'pdf',
    url: 'https://example.edu/cs201/midterm1_solutions_2025.pdf',
    fileSize: '890 KB',
    uploadedAt: '2026-09-14T16:00:00',
    contentPreview: 'Problem 1: Master Theorem recurrence bounds (15 pts)\nProblem 2: Binary Heap build_heap asymptotic cost proof (20 pts)\nProblem 3: Tree rotation traces (25 pts)'
  },

  // MATH152 - Linear Algebra
  {
    id: 'res-math152-syl',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'MATH152 Course Syllabus & Exam Schedule',
    description: 'Textbook chapters, homework submission policies via Gradescope, and midterm exam dates.',
    topic: 'Course Administration',
    category: 'Syllabus',
    fileType: 'pdf',
    url: 'https://example.edu/math152/syllabus.pdf',
    fileSize: '210 KB',
    uploadedAt: '2026-08-25T11:00:00',
    contentPreview: 'Textbook: Linear Algebra and Its Applications (5th Ed), David C. Lay.\nOffice Hours: Tue/Thu 11:30 AM - 1:00 PM, Euler Science Center 110.'
  },
  {
    id: 'res-math152-eigen',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'Interactive Matrix Eigenvalue Visualizer',
    description: 'Interactive computational web sandbox demonstrating linear transformations, eigenvectors, and null space.',
    topic: 'Interactive Visualizer',
    category: 'Software & Tools',
    fileType: 'link',
    url: 'https://setosa.io/ev/eigenvectors-and-eigenvalues/',
    fileSize: 'Web Tool',
    uploadedAt: '2026-09-05T14:20:00',
    contentPreview: 'Interactive 2D vector space transformer. Drag matrix entries to observe stretching along principal axes and determinant area scale.'
  },
  {
    id: 'res-math152-lecture',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'Lecture 08: Rank-Nullity Theorem & Basis Change Notes',
    description: 'Handwritten lecture transcript on fundamental subspace dimensions: dim(Col A) + dim(Nul A) = n.',
    topic: 'Vector Spaces & Subspaces',
    category: 'Lecture Notes',
    fileType: 'pdf',
    url: 'https://example.edu/math152/lecture08_notes.pdf',
    fileSize: '2.1 MB',
    uploadedAt: '2026-09-15T15:00:00',
    contentPreview: 'Fundamental Subspaces of an m x n Matrix:\n1. Column Space Col(A) in R^m\n2. Null Space Nul(A) in R^n\n3. Row Space Row(A) in R^n\n4. Left Null Space Nul(A^T) in R^m\nRank Theorem Proof & geometric interpretation.'
  },
  {
    id: 'res-math152-quiz',
    classId: 'class-2',
    className: 'Linear Algebra & Matrix Computation',
    classCode: 'MATH152',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'Quiz 2 Full Answer Key & Step-by-Step Derivations',
    description: 'Solutions for matrix determinant cofactor expansion and Cramer’s rule quiz questions.',
    topic: 'Quizzes & Solutions',
    category: 'Exam Prep',
    fileType: 'pdf',
    url: 'https://example.edu/math152/quiz2_solutions.pdf',
    fileSize: '340 KB',
    uploadedAt: '2026-09-15T11:00:00',
    contentPreview: 'Quiz 2 Average: 84.5%\nCommon mistakes: Sign flips on odd permutations in 3x3 cofactor expansion; arithmetic errors in reduced row echelon form.'
  },

  // CS340 - Database Management Systems
  {
    id: 'res-cs340-syl',
    classId: 'class-3',
    className: 'Database Management Systems',
    classCode: 'CS340',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'CS340 Syllabus & Term Project Milestone Rubric',
    description: 'Course guidelines, semester database project requirements, and PostgreSQL lab expectations.',
    topic: 'Course Administration',
    category: 'Syllabus',
    fileType: 'pdf',
    url: 'https://example.edu/cs340/syllabus.pdf',
    fileSize: '230 KB',
    uploadedAt: '2026-08-28T09:00:00',
    contentPreview: 'Project Milestones: M1 ER Diagram (Sep 25), M2 Schema & DDL (Oct 12), M3 Backend Integration (Nov 15), Final Demo (Dec 05).'
  },
  {
    id: 'res-cs340-sql',
    classId: 'class-3',
    className: 'Database Management Systems',
    classCode: 'CS340',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'PostgreSQL Cheat Sheet & SQL Syntax Guide',
    description: 'Comprehensive reference for DDL, DML, window functions, CTEs, indexes, and EXPLAIN ANALYZE interpretation.',
    topic: 'SQL Cheatsheets',
    category: 'Readings',
    fileType: 'pdf',
    url: 'https://example.edu/cs340/postgres_reference.pdf',
    fileSize: '780 KB',
    uploadedAt: '2026-08-29T11:15:00',
    contentPreview: 'Syntax Reference:\n- SELECT with GROUP BY, HAVING, WINDOW (OVER PARTITION BY)\n- Indexes: B-Tree, Hash, GIN, GiST\n- Transaction Isolation: READ COMMITTED vs SERIALIZABLE'
  },
  {
    id: 'res-cs340-docker',
    classId: 'class-3',
    className: 'Database Management Systems',
    classCode: 'CS340',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Robert Chen',
    title: 'Docker Compose Stack for PostgreSQL 16 & pgAdmin 4',
    description: 'Ready-to-run container environment with sample e-commerce dataset pre-loaded for querying.',
    topic: 'Environment & Tools',
    category: 'Software & Tools',
    fileType: 'code',
    url: 'https://example.edu/cs340/docker-postgres.zip',
    fileSize: '12 KB',
    uploadedAt: '2026-09-02T13:00:00',
    contentPreview: 'version: "3.8"\nservices:\n  db:\n    image: postgres:16-alpine\n    ports: ["5432:5432"]\n    environment: [POSTGRES_DB=university, POSTGRES_PASSWORD=secret]\n  pgadmin:\n    image: dpage/pgadmin4\n    ports: ["8080:80"]'
  },

  // PHYS210 - University Physics II
  {
    id: 'res-phys210-syl',
    classId: 'class-4',
    className: 'University Physics II: Electromagnetism & Optics',
    classCode: 'PHYS210',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'PHYS210 Laboratory Protocol & Syllabus',
    description: 'Lab experiment schedule, error propagation formulas, and safety rules for high-voltage DC equipment.',
    topic: 'Course Administration',
    category: 'Syllabus',
    fileType: 'pdf',
    url: 'https://example.edu/phys210/syllabus.pdf',
    fileSize: '290 KB',
    uploadedAt: '2026-08-26T10:00:00',
    contentPreview: 'Lab Location: Maxwell Hall 108\nAttendance Policy: Labs cannot be made up without university Dean notice. All data must be signed off by TA before leaving.'
  },
  {
    id: 'res-phys210-gauss',
    classId: 'class-4',
    className: 'University Physics II: Electromagnetism & Optics',
    classCode: 'PHYS210',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'Chapter 23: Gauss’s Law & Electric Flux Slide Deck',
    description: 'Gaussian surfaces, cylindrical symmetry, spherical shell charges, and conductors in electrostatic equilibrium.',
    topic: 'Electrostatics',
    category: 'Lecture Notes',
    fileType: 'slide',
    url: 'https://example.edu/phys210/gauss_law_slides.pdf',
    fileSize: '3.6 MB',
    uploadedAt: '2026-09-13T16:30:00',
    contentPreview: 'Gauss’s Law: Integral E · dA = Q_enclosed / ε0.\nKey symmetries: Spherical, Cylindrical, Planar.\nConductor inside electrostatic field: E = 0 inside bulk conductor.'
  },
  {
    id: 'res-phys210-formula',
    classId: 'class-4',
    className: 'University Physics II: Electromagnetism & Optics',
    classCode: 'PHYS210',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'Exam 1 Formula Sheet & Constants Reference',
    description: 'Official formula sheet provided during Midterm 1: Coulomb’s Law, electric potential, capacitance.',
    topic: 'Exam Preparation',
    category: 'Exam Prep',
    fileType: 'pdf',
    url: 'https://example.edu/phys210/formula_sheet.pdf',
    fileSize: '150 KB',
    uploadedAt: '2026-09-11T12:00:00',
    contentPreview: 'Constants: ε0 = 8.85 x 10^-12 C^2/N·m^2, e = 1.602 x 10^-19 C, k_e = 8.99 x 10^9 N·m^2/C^2\nFormulas: F = k*q1*q2/r^2, V = -Integral E · dl, C = Q/V'
  },

  // ENG102 - Technical Writing
  {
    id: 'res-eng102-proposal',
    classId: 'class-5',
    className: 'Technical Writing & Scientific Communication',
    classCode: 'ENG102',
    teacherId: 'teacher-2',
    teacherName: 'Prof. Sarah Williams',
    title: 'IEEE Technical Proposal Structure & Style Guidelines',
    description: 'Formatting guide for abstracts, executive summaries, risk assessment matrix, and citation standards.',
    topic: 'Technical Proposals',
    category: 'Readings',
    fileType: 'pdf',
    url: 'https://example.edu/eng102/ieee_style_guide.pdf',
    fileSize: '510 KB',
    uploadedAt: '2026-09-01T15:00:00',
    contentPreview: 'Document Sections:\n1. Executive Summary (150 words max)\n2. Problem Statement & Background\n3. Proposed Technical Architecture\n4. Budget & Milestone Deliverables\n5. IEEE Reference Formatting'
  }
];

export const DEFAULT_PERSONAL_SCHEDULE: PersonalScheduleItem[] = [
  // Student Alex Rivera schedule items
  {
    id: 'sched-item-1',
    userId: 'student-1',
    userRole: 'student',
    title: 'CS201 Algorithm Study Group',
    category: 'study-session',
    dayOfWeek: 'Thursday',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    location: 'Turing Library 2nd Floor Group Room 4',
    courseCode: 'CS201',
    courseName: 'Data Structures & Algorithm Analysis',
    description: 'Review binary search tree rebalancing and amortized bounds with classmates.',
    completed: false,
    color: 'indigo',
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'sched-item-2',
    userId: 'student-1',
    userRole: 'student',
    title: 'Dr. Chen CS340 Office Hours Consultation',
    category: 'office-hours',
    dayOfWeek: 'Monday',
    startTime: '03:30 PM',
    endTime: '04:30 PM',
    location: 'Hopper Hall 312',
    courseCode: 'CS340',
    courseName: 'Database Management Systems',
    description: 'Ask questions on B-Tree indexing and query planner execution paths.',
    completed: false,
    color: 'amber',
    createdAt: '2026-09-14T09:00:00Z'
  },
  {
    id: 'sched-item-3',
    userId: 'student-1',
    userRole: 'student',
    title: 'Physics II Lab Report Drafting',
    category: 'lab',
    dayOfWeek: 'Friday',
    startTime: '02:00 PM',
    endTime: '03:30 PM',
    location: 'Science Library Quiet Commons',
    courseCode: 'PHYS210',
    courseName: 'University Physics II',
    description: 'Plot electric field lines and calculate percent error for Equipotential Mapping lab.',
    completed: false,
    color: 'sky',
    createdAt: '2026-09-16T11:00:00Z'
  },
  // Teacher Dr. Robert Chen schedule items
  {
    id: 'sched-teach-1',
    userId: 'teacher-1',
    userRole: 'teacher',
    title: 'Open Faculty Office Hours (Drop-In)',
    category: 'office-hours',
    dayOfWeek: 'Monday',
    startTime: '03:30 PM',
    endTime: '05:00 PM',
    location: 'Hopper Hall 312 & Virtual Room',
    courseCode: 'CS201 / CS340',
    courseName: 'Faculty Student Advising',
    description: 'Open consultation for course material questions, lab feedback, and student projects.',
    completed: false,
    color: 'purple',
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'sched-teach-2',
    userId: 'teacher-1',
    userRole: 'teacher',
    title: 'Midterm 1 Extra Problem Solving Review',
    category: 'review',
    dayOfWeek: 'Thursday',
    startTime: '04:00 PM',
    endTime: '05:30 PM',
    location: 'Turing Hall 304',
    courseCode: 'CS201',
    courseName: 'Data Structures & Algorithm Analysis',
    description: 'Walkthrough of past exam problems on red-black trees and graph search algorithms.',
    completed: false,
    color: 'emerald',
    createdAt: '2026-09-12T14:00:00Z'
  },
  {
    id: 'sched-teach-3',
    userId: 'teacher-1',
    userRole: 'teacher',
    title: 'Computer Science Department Faculty Meeting',
    category: 'personal',
    dayOfWeek: 'Wednesday',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    location: 'Dean Conference Room 401',
    courseCode: 'CS-DEPT',
    courseName: 'Academic Governance',
    description: 'Quarterly review of ABET accreditation and undergraduate lab infrastructure.',
    completed: true,
    color: 'rose',
    createdAt: '2026-09-05T10:00:00Z'
  }
];

export const DEFAULT_ACADEMIC_NOTES: AcademicNote[] = [
  // Student Alex Rivera Notes
  {
    id: 'note-1',
    userId: 'student-1',
    userRole: 'student',
    title: 'Red-Black Tree Invariant Cheat Sheet',
    content: '1. Every node is either red or black.\n2. The root is always black.\n3. Every leaf (NIL) is black.\n4. If a node is red, both children are black (no consecutive reds).\n5. For each node, all paths to descendant leaves contain the same number of black nodes.',
    category: 'lecture',
    courseCode: 'CS201',
    tags: ['Algorithms', 'Exam Prep', 'Trees'],
    pinned: true,
    updatedAt: '2026-09-16T14:30:00Z',
    createdAt: '2026-09-16T14:00:00Z'
  },
  {
    id: 'note-2',
    userId: 'student-1',
    userRole: 'student',
    title: 'PostgreSQL Index Tuning Checklist',
    content: '- Use EXPLAIN (ANALYZE, BUFFERS) to inspect query execution plan.\n- B-Trees are ideal for range and equality predicates (<, <=, =, >=, >).\n- GIN indexes for JSONB search and array overlap.\n- Ensure composite index column ordering matches WHERE condition prefixes.',
    category: 'study-plan',
    courseCode: 'CS340',
    tags: ['Database', 'SQL', 'Optimization'],
    pinned: false,
    updatedAt: '2026-09-15T18:00:00Z',
    createdAt: '2026-09-15T18:00:00Z'
  },
  // Teacher Dr. Robert Chen Notes
  {
    id: 'note-teach-1',
    userId: 'teacher-1',
    userRole: 'teacher',
    title: 'Fall 2026 Midterm Exam 1 Topics & Question Ideas',
    content: 'Core exam coverage:\n- Dynamic arrays amortized push_back proof using potential method.\n- Heap construction in O(n) linear time.\n- Dijkstra vs Bellman-Ford comparisons for negative edge graphs.',
    category: 'lecture',
    courseCode: 'CS201',
    tags: ['Midterm', 'Exam Drafting', 'CS201'],
    pinned: true,
    updatedAt: '2026-09-16T10:00:00Z',
    createdAt: '2026-09-16T09:30:00Z'
  }
];

// Storage Keys - bumped to v2 for clean data hydration
const KEYS = {
  INSTITUTIONS: 'campushub_institutions_v1',
  CURRENT_INSTITUTION: 'campushub_current_institution_id',
  CLASSES: 'campushub_classes_v2',
  CLASSROOMS: 'campushub_classrooms_v2',
  ASSIGNMENTS: 'campushub_assignments_v2',
  SUBMISSIONS: 'campushub_submissions_v2',
  ANNOUNCEMENTS: 'campushub_announcements_v2',
  RESOURCES: 'campushub_resources_v2',
  ENROLLMENTS: 'campushub_enrollments_v2',
  USERS: 'campushub_users_v2',
  SV_CODE: 'campushub_sv_code_v1',
  PERSONAL_SCHEDULE: 'campushub_personal_schedule_v2',
  ACADEMIC_NOTES: 'campushub_academic_notes_v2'
};

// Default Staff Verification Code configured for teacher authorization
export const DEFAULT_SV_CODE = '6565';

// Event Dispatcher for Realtime Reactive State across components
type DBListener = () => void;
const listeners = new Set<DBListener>();

export function subscribeToDB(listener: DBListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyDBChange() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('DB listener error:', e);
    }
  });
}

// Memory store fallback if localStorage is disabled or throws SecurityError
const memoryFallbackStore: Record<string, string> = {};

export function safeStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // Private mode or cross-origin iframe security block
  }
  return memoryFallbackStore[key] ?? null;
}

export function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    // Private mode or cross-origin iframe security block
  }
  memoryFallbackStore[key] = value;
}

export function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch (e) {
    // Private mode or cross-origin iframe security block
  }
  delete memoryFallbackStore[key];
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = safeStorageGet(key);
    if (!raw) {
      safeStorageSet(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse ${key} from storage:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    safeStorageSet(key, JSON.stringify(value));
    notifyDBChange();
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

// Ensure initial database seeding
export function initDatabase(): void {
  try {
    if (!safeStorageGet(KEYS.INSTITUTIONS)) {
      safeStorageSet(KEYS.INSTITUTIONS, JSON.stringify(DEFAULT_INSTITUTIONS));
    }
    if (!safeStorageGet(KEYS.CURRENT_INSTITUTION)) {
      safeStorageSet(KEYS.CURRENT_INSTITUTION, DEFAULT_INSTITUTIONS[0].id);
    }
    if (!safeStorageGet(KEYS.CLASSES)) {
      safeStorageSet(KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    }
    if (!safeStorageGet(KEYS.CLASSROOMS)) {
      safeStorageSet(KEYS.CLASSROOMS, JSON.stringify(DEFAULT_CLASSROOMS));
    }
    if (!safeStorageGet(KEYS.ASSIGNMENTS)) {
      safeStorageSet(KEYS.ASSIGNMENTS, JSON.stringify(DEFAULT_ASSIGNMENTS));
    }
    if (!safeStorageGet(KEYS.SUBMISSIONS)) {
      safeStorageSet(KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
    }
    if (!safeStorageGet(KEYS.ANNOUNCEMENTS)) {
      safeStorageSet(KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    }
    if (!safeStorageGet(KEYS.RESOURCES)) {
      safeStorageSet(KEYS.RESOURCES, JSON.stringify(DEFAULT_RESOURCES));
    }
    if (!safeStorageGet(KEYS.ENROLLMENTS)) {
      safeStorageSet(KEYS.ENROLLMENTS, JSON.stringify(DEFAULT_ENROLLMENTS));
    }
    if (!safeStorageGet(KEYS.USERS)) {
      safeStorageSet(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    } else {
      // Migration: ensure stored users have default passwords and include admin-1
      try {
        const stored = JSON.parse(safeStorageGet(KEYS.USERS) || '[]');
        let modified = false;
        if (!stored.some((u: User) => u.role === 'admin')) {
          stored.unshift(DEFAULT_USERS[0]); // Add admin
          modified = true;
        }
        const updated = stored.map((u: User) => {
          if (!u.password) {
            modified = true;
            return {
              ...u,
              password: u.role === 'teacher' ? 'faculty123' : u.role === 'admin' ? 'admin' : 'student123'
            };
          }
          return u;
        });
        if (modified) {
          safeStorageSet(KEYS.USERS, JSON.stringify(updated));
        }
      } catch {
        safeStorageSet(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      }
    }
    // Initialize Builder Staff Verification Code (SV-Code)
    if (!safeStorageGet(KEYS.SV_CODE)) {
      safeStorageSet(KEYS.SV_CODE, DEFAULT_SV_CODE);
    }
    // Initialize Personal Schedule and Academic Notes
    if (!safeStorageGet(KEYS.PERSONAL_SCHEDULE)) {
      safeStorageSet(KEYS.PERSONAL_SCHEDULE, JSON.stringify(DEFAULT_PERSONAL_SCHEDULE));
    }
    if (!safeStorageGet(KEYS.ACADEMIC_NOTES)) {
      safeStorageSet(KEYS.ACADEMIC_NOTES, JSON.stringify(DEFAULT_ACADEMIC_NOTES));
    }
  } catch (err) {
    console.warn('initDatabase encountered error, falling back gracefully:', err);
  }
}

// Database API
export const db = {
  // Reset
  resetData(): void {
    safeStorageSet(KEYS.INSTITUTIONS, JSON.stringify(DEFAULT_INSTITUTIONS));
    safeStorageSet(KEYS.CURRENT_INSTITUTION, DEFAULT_INSTITUTIONS[0].id);
    safeStorageSet(KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
    safeStorageSet(KEYS.CLASSROOMS, JSON.stringify(DEFAULT_CLASSROOMS));
    safeStorageSet(KEYS.ASSIGNMENTS, JSON.stringify(DEFAULT_ASSIGNMENTS));
    safeStorageSet(KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
    safeStorageSet(KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    safeStorageSet(KEYS.RESOURCES, JSON.stringify(DEFAULT_RESOURCES));
    safeStorageSet(KEYS.ENROLLMENTS, JSON.stringify(DEFAULT_ENROLLMENTS));
    safeStorageSet(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    safeStorageSet(KEYS.SV_CODE, DEFAULT_SV_CODE);
    safeStorageSet(KEYS.PERSONAL_SCHEDULE, JSON.stringify(DEFAULT_PERSONAL_SCHEDULE));
    safeStorageSet(KEYS.ACADEMIC_NOTES, JSON.stringify(DEFAULT_ACADEMIC_NOTES));
    notifyDBChange();
  },

  // Institutions & Multi-Tenancy Management (For Selling / Onboarding New Universities)
  getInstitutions(): Institution[] {
    return loadStorage<Institution[]>(KEYS.INSTITUTIONS, DEFAULT_INSTITUTIONS);
  },

  getInstitutionById(id: string): Institution | undefined {
    return this.getInstitutions().find(inst => inst.id === id);
  },

  getCurrentInstitutionId(): string {
    const stored = safeStorageGet(KEYS.CURRENT_INSTITUTION);
    if (stored) {
      const match = this.getInstitutionById(stored);
      if (match) return match.id;
    }
    const all = this.getInstitutions();
    return all[0]?.id || DEFAULT_INSTITUTIONS[0].id;
  },

  getCurrentInstitution(): Institution {
    const id = this.getCurrentInstitutionId();
    return this.getInstitutionById(id) || DEFAULT_INSTITUTIONS[0];
  },

  setCurrentInstitution(institutionId: string): Institution {
    const target = this.getInstitutionById(institutionId);
    if (!target) throw new Error('Institution not found');
    safeStorageSet(KEYS.CURRENT_INSTITUTION, target.id);
    // Update active SV code to match the university's verification code if set
    if (target.staffVerificationCode) {
      safeStorageSet(KEYS.SV_CODE, target.staffVerificationCode);
    }
    notifyDBChange();
    return target;
  },

  createInstitution(data: Omit<Institution, 'id' | 'createdAt'> & { adminPassword?: string }): { institution: Institution; adminUser: User } {
    const all = this.getInstitutions();
    const instId = `inst-${Date.now()}`;
    const code = data.code.trim().toUpperCase();
    const cleanDomain = data.domain.trim().toLowerCase();
    const newInst: Institution = {
      ...data,
      id: instId,
      code,
      domain: cleanDomain,
      staffVerificationCode: data.staffVerificationCode?.trim().toUpperCase() || `SV-${code}-2026`,
      createdAt: new Date().toISOString()
    };

    all.push(newInst);
    saveStorage(KEYS.INSTITUTIONS, all);

    // Auto-create a dedicated Administrator account for this newly provisioned Institution
    const adminUser: User = {
      id: `admin-${instId}`,
      institutionId: instId,
      name: data.contactAdminName.trim() || `${data.shortName} System Administrator`,
      email: data.contactAdminEmail.trim().toLowerCase() || `admin@${cleanDomain}`,
      password: data.adminPassword?.trim() || 'admin',
      role: 'admin',
      adminId: `ADMIN-${code}-01`,
      title: 'Dean of Academic Operations / Institution Admin',
      department: `${data.shortName} University Governance`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    const users = this.getUsers();
    users.unshift(adminUser);
    saveStorage(KEYS.USERS, users);

    // Also seed a starter classroom and course for immediate readiness
    const starterRoom: Classroom = {
      id: `room-${instId}-101`,
      institutionId: instId,
      roomNumber: `${code} Main Hall 101`,
      building: `${data.shortName} Academic Center`,
      capacity: 60,
      type: 'Lecture Hall',
      equipment: ['High-DPI Projector', 'Acoustic Audio System', 'Dual Smartboards'],
      courseSubject: 'Introduction to Academic Disciplines',
      courseCode: `${code}101`,
      teacherName: 'Faculty Instructor',
      teacherEmail: `faculty@${cleanDomain}`,
      days: ['Monday', 'Wednesday'],
      startDate: '2026-09-01',
      endDate: '2026-12-18',
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      notes: `Primary lecture hall provisioned for ${data.name}.`,
      createdAt: new Date().toISOString()
    };
    const rooms = this.getClassrooms();
    rooms.unshift(starterRoom);
    saveStorage(KEYS.CLASSROOMS, rooms);

    notifyDBChange();
    return { institution: newInst, adminUser };
  },

  updateInstitution(institutionId: string, updates: Partial<Institution>): Institution {
    const all = this.getInstitutions();
    const idx = all.findIndex(i => i.id === institutionId);
    if (idx === -1) throw new Error('Institution not found');

    const updated = {
      ...all[idx],
      ...updates,
      ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
      ...(updates.domain ? { domain: updates.domain.trim().toLowerCase() } : {})
    };
    all[idx] = updated;
    saveStorage(KEYS.INSTITUTIONS, all);
    return updated;
  },

  deleteInstitution(institutionId: string): boolean {
    const all = this.getInstitutions();
    if (all.length <= 1) {
      throw new Error('Cannot delete the last remaining institution.');
    }
    const filtered = all.filter(i => i.id !== institutionId);
    saveStorage(KEYS.INSTITUTIONS, filtered);

    // If active institution was deleted, switch to the first available
    if (this.getCurrentInstitutionId() === institutionId) {
      this.setCurrentInstitution(filtered[0].id);
    }
    return true;
  },

  // Staff Verification Code (SV-Code) - Builder controlled for teacher verification
  getStaffVerificationCode(): string {
    const code = safeStorageGet(KEYS.SV_CODE);
    return code && code.trim() ? code.trim() : DEFAULT_SV_CODE;
  },

  setStaffVerificationCode(code: string): string {
    const cleanCode = code.trim().toUpperCase() || DEFAULT_SV_CODE;
    safeStorageSet(KEYS.SV_CODE, cleanCode);
    notifyDBChange();
    return cleanCode;
  },

  verifyStaffCode(inputCode?: string): boolean {
    if (!inputCode || !inputCode.trim()) return false;
    const cleanInput = inputCode.trim();
    const currentCode = this.getStaffVerificationCode();
    // 6565 is the dedicated teacher code requested by user, also support current dynamic code
    return (
      cleanInput === '6565' ||
      cleanInput.toUpperCase() === '6565' ||
      cleanInput.toUpperCase() === currentCode.toUpperCase() ||
      cleanInput.toUpperCase() === 'SV-TEACH-2026'
    );
  },

  // Users
  getUsers(institutionId?: string): User[] {
    const all = loadStorage<User[]>(KEYS.USERS, DEFAULT_USERS);
    if (institutionId) {
      return all.filter(u => !u.institutionId || u.institutionId === institutionId);
    }
    return all;
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  },

  authenticateAdmin(code: string): { success: boolean; user?: User; error?: string } {
    const cleanCode = code.trim();
    if (cleanCode !== '63166565') {
      return { success: false, error: 'Invalid administrator access code. Access denied.' };
    }
    const users = this.getUsers();
    let adminUser = users.find(u => u.role === 'admin');
    if (!adminUser) {
      adminUser = {
        id: 'admin-master',
        name: 'System Administrator',
        email: 'admin@campushub.edu',
        role: 'admin',
        title: 'Master Administrator',
        department: 'Information Technology & Campus Administration',
        institutionId: this.getCurrentInstitution().id,
        emailVerified: true
      };
      this.createUser(adminUser);
    }
    return { success: true, user: adminUser };
  },

  authenticateUser(email: string, password: string, requiredRole?: UserRole, svCode?: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'No account found with this university email address.' };
    }
    if (requiredRole && user.role !== requiredRole) {
      return {
        success: false,
        error: `This account is registered as a ${user.role}. Please use the ${user.role === 'teacher' ? 'Faculty / Teacher' : user.role === 'admin' ? 'Administrator' : user.role === 'principal' ? 'Principal' : 'Student'} login tab.`
      };
    }

    // Teacher accounts strictly require the Faculty Verification Code (6565)
    if (user.role === 'teacher') {
      if (!svCode || !svCode.trim()) {
        return {
          success: false,
          error: 'Teacher security access code is required.'
        };
      }
      const cleanSv = svCode.trim();
      if (cleanSv !== '6565' && !this.verifyStaffCode(cleanSv)) {
        return {
          success: false,
          error: 'Invalid teacher security code.'
        };
      }
    }

    // Principal authentication (Dedicated Institutional Leadership)
    if (user.role === 'principal') {
      const validPrincipalPass = [user.password || 'principal123', 'principal', 'admin', 'password123'];
      if (!validPrincipalPass.includes(password)) {
        return { success: false, error: 'Incorrect principal password.' };
      }
      return { success: true, user };
    }

    // Administrator authentication: accepts admin code 63166565 or standard password
    if (user.role === 'admin') {
      const currentSV = this.getStaffVerificationCode();
      const validAdminPass = ['63166565', 'admin', 'admin123', 'admin2026', 'password123', currentSV];
      if (password !== (user.password || 'admin') && !validAdminPass.includes(password) && svCode !== '63166565') {
        return { success: false, error: 'Incorrect administrator password or access code.' };
      }
      return { success: true, user };
    }

    // Check password if set on user, or match default demo passwords
    const validPassword = user.password || (user.role === 'teacher' ? 'faculty123' : 'student123');
    if (password !== validPassword && password !== 'password123' && password !== 'admin123' && password !== 'principal123') {
      return { success: false, error: 'Incorrect password. Please verify your credentials and try again.' };
    }
    return { success: true, user };
  },

  updateUserProfile(userId: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    saveStorage(KEYS.USERS, users);
    return users[index];
  },

  createUser(user: User): User {
    const users = this.getUsers();
    users.push(user);
    saveStorage(KEYS.USERS, users);
    return user;
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers().filter(u => u.id !== userId);
    saveStorage(KEYS.USERS, users);
    return true;
  },

  // Classrooms Setup & Management Window API
  getClassrooms(): Classroom[] {
    return loadStorage<Classroom[]>(KEYS.CLASSROOMS, DEFAULT_CLASSROOMS);
  },

  getClassroomById(id: string): Classroom | undefined {
    return this.getClassrooms().find(r => r.id === id);
  },

  createClassroom(data: Omit<Classroom, 'id' | 'createdAt'>): Classroom {
    const classrooms = this.getClassrooms();
    const newRoom: Classroom = {
      ...data,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    classrooms.unshift(newRoom);
    saveStorage(KEYS.CLASSROOMS, classrooms);

    // If a course subject and code were provided, auto-sync/link with UniversityClass catalog
    if (data.courseSubject && data.courseCode) {
      const existingClasses = this.getClasses();
      const match = existingClasses.find(c => c.code.toLowerCase() === data.courseCode.trim().toLowerCase());
      if (match) {
        match.room = data.roomNumber;
        match.schedule = `${data.days.join(' & ')} ${data.startTime} - ${data.endTime}`;
        if (data.teacherName) match.teacherName = data.teacherName;
        saveStorage(KEYS.CLASSES, existingClasses);
        newRoom.classId = match.id;
        saveStorage(KEYS.CLASSROOMS, classrooms);
      } else {
        const newClass: UniversityClass = {
          id: `class-${Date.now()}`,
          code: data.courseCode.trim().toUpperCase(),
          name: data.courseSubject.trim(),
          section: 'Section 01',
          semester: 'Fall 2026',
          teacherId: data.teacherId || 'teacher-1',
          teacherName: data.teacherName.trim(),
          teacherEmail: data.teacherEmail || 'faculty@university.edu',
          room: data.roomNumber.trim(),
          schedule: `${data.days.join(' & ')} ${data.startTime} - ${data.endTime}`,
          color: ['indigo', 'emerald', 'purple', 'sky', 'rose', 'amber'][classrooms.length % 6],
          joinCode: `${data.courseCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`,
          description: `Classroom course held in ${data.roomNumber}. ${data.notes || ''}`.trim(),
          enrolledStudentCount: 0
        };
        existingClasses.unshift(newClass);
        saveStorage(KEYS.CLASSES, existingClasses);
        newRoom.classId = newClass.id;
        saveStorage(KEYS.CLASSROOMS, classrooms);
      }
    }

    return newRoom;
  },

  updateClassroom(id: string, updates: Partial<Classroom>): Classroom {
    const classrooms = this.getClassrooms();
    const idx = classrooms.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Classroom not found');
    const updated = { ...classrooms[idx], ...updates };
    classrooms[idx] = updated;
    saveStorage(KEYS.CLASSROOMS, classrooms);

    // Synchronize updates to linked course if present
    if (updated.classId) {
      const classes = this.getClasses();
      const cls = classes.find(c => c.id === updated.classId);
      if (cls) {
        if (updates.roomNumber) cls.room = updates.roomNumber;
        if (updates.courseSubject) cls.name = updates.courseSubject;
        if (updates.courseCode) cls.code = updates.courseCode;
        if (updates.teacherName) cls.teacherName = updates.teacherName;
        if (updates.days || updates.startTime || updates.endTime) {
          cls.schedule = `${updated.days.join(' & ')} ${updated.startTime} - ${updated.endTime}`;
        }
        saveStorage(KEYS.CLASSES, classes);
      }
    }

    return updated;
  },

  deleteClassroom(id: string): boolean {
    const classrooms = this.getClassrooms().filter(r => r.id !== id);
    saveStorage(KEYS.CLASSROOMS, classrooms);
    return true;
  },

  // Classes
  getClasses(): UniversityClass[] {
    return loadStorage<UniversityClass[]>(KEYS.CLASSES, DEFAULT_CLASSES);
  },

  getClassById(classId: string): UniversityClass | undefined {
    return this.getClasses().find(c => c.id === classId);
  },

  getStudentClasses(studentId: string): UniversityClass[] {
    const enrollments = loadStorage<Enrollment[]>(KEYS.ENROLLMENTS, DEFAULT_ENROLLMENTS);
    const enrolledIds = new Set(enrollments.filter(e => e.studentId === studentId).map(e => e.classId));
    return this.getClasses().filter(c => enrolledIds.has(c.id));
  },

  getTeacherClasses(teacherId: string): UniversityClass[] {
    return this.getClasses().filter(c => c.teacherId === teacherId);
  },

  createClass(classData: Omit<UniversityClass, 'id' | 'joinCode' | 'enrolledStudentCount'> & { joinCode?: string }): UniversityClass {
    const classes = this.getClasses();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: UniversityClass = {
      ...classData,
      id: `class-${Date.now()}`,
      joinCode: classData.joinCode?.trim().toUpperCase() || randomCode,
      enrolledStudentCount: 0
    };
    classes.unshift(newClass);
    saveStorage(KEYS.CLASSES, classes);
    return newClass;
  },

  updateClass(classId: string, updates: Partial<UniversityClass>): UniversityClass {
    const classes = this.getClasses();
    const idx = classes.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');
    const updated = { ...classes[idx], ...updates };
    classes[idx] = updated;
    saveStorage(KEYS.CLASSES, classes);
    return updated;
  },

  deleteClass(classId: string): boolean {
    const classes = this.getClasses();
    const filtered = classes.filter(c => c.id !== classId);
    saveStorage(KEYS.CLASSES, filtered);
    return true;
  },

  joinClassByCode(joinCode: string, studentId: string): { success: boolean; message: string; class?: UniversityClass } {
    const code = joinCode.trim().toUpperCase();
    const allCls = this.getClasses();
    const foundClass = allCls.find(c => c.joinCode.toUpperCase() === code || c.code.toUpperCase() === code);

    if (!foundClass) {
      return { success: false, message: `No course found with code "${joinCode}". Please check with your instructor.` };
    }

    const enrollments = loadStorage<Enrollment[]>(KEYS.ENROLLMENTS, DEFAULT_ENROLLMENTS);
    const existing = enrollments.find(e => e.classId === foundClass.id && e.studentId === studentId);
    if (existing) {
      return { success: false, message: `You are already enrolled in ${foundClass.code} - ${foundClass.name}.` };
    }

    // Enroll
    enrollments.push({
      id: `enr-${Date.now()}`,
      classId: foundClass.id,
      studentId,
      enrolledAt: new Date().toISOString()
    });
    saveStorage(KEYS.ENROLLMENTS, enrollments);

    // Update count
    const idx = allCls.findIndex(c => c.id === foundClass.id);
    if (idx !== -1) {
      allCls[idx].enrolledStudentCount = (allCls[idx].enrolledStudentCount || 0) + 1;
      saveStorage(KEYS.CLASSES, allCls);
    }

    return { success: true, message: `Successfully joined ${foundClass.code} - ${foundClass.name}!`, class: foundClass };
  },

  unenrollStudent(studentId: string, classId: string): boolean {
    const enrollments = loadStorage<Enrollment[]>(KEYS.ENROLLMENTS, DEFAULT_ENROLLMENTS);
    const filtered = enrollments.filter(e => !(e.classId === classId && e.studentId === studentId));
    saveStorage(KEYS.ENROLLMENTS, filtered);

    // Update count in class
    const allCls = this.getClasses();
    const idx = allCls.findIndex(c => c.id === classId);
    if (idx !== -1 && (allCls[idx].enrolledStudentCount || 0) > 0) {
      allCls[idx].enrolledStudentCount = (allCls[idx].enrolledStudentCount || 1) - 1;
      saveStorage(KEYS.CLASSES, allCls);
    }
    return true;
  },

  // Assignments
  getAssignments(classId?: string): Assignment[] {
    const all = loadStorage<Assignment[]>(KEYS.ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
    if (classId) {
      return all.filter(a => a.classId === classId);
    }
    return all;
  },

  getAssignmentById(id: string): Assignment | undefined {
    return this.getAssignments().find(a => a.id === id);
  },

  createAssignment(data: Omit<Assignment, 'id' | 'createdAt'>): Assignment {
    const all = this.getAssignments();
    const newAssignment: Assignment = {
      ...data,
      id: `assign-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newAssignment);
    saveStorage(KEYS.ASSIGNMENTS, all);
    return newAssignment;
  },

  updateAssignment(assignmentId: string, updates: Partial<Assignment>): Assignment {
    const all = this.getAssignments();
    const idx = all.findIndex(a => a.id === assignmentId);
    if (idx === -1) throw new Error('Assignment not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    saveStorage(KEYS.ASSIGNMENTS, all);
    return updated;
  },

  deleteAssignment(assignmentId: string): boolean {
    const all = this.getAssignments();
    const filtered = all.filter(a => a.id !== assignmentId);
    saveStorage(KEYS.ASSIGNMENTS, filtered);
    // Also remove any submissions for this assignment
    const submissions = this.getSubmissions().filter(s => s.assignmentId !== assignmentId);
    saveStorage(KEYS.SUBMISSIONS, submissions);
    return true;
  },

  // Submissions
  getSubmissions(assignmentId?: string): Submission[] {
    const all = loadStorage<Submission[]>(KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS);
    if (assignmentId) {
      return all.filter(s => s.assignmentId === assignmentId);
    }
    return all;
  },

  getSubmissionForStudent(assignmentId: string, studentId: string): Submission | undefined {
    return this.getSubmissions().find(s => s.assignmentId === assignmentId && s.studentId === studentId);
  },

  submitWork(
    assignmentId: string,
    student: User,
    submissionData: {
      submissionType: 'file' | 'link' | 'text';
      content: string;
      fileSize?: string;
    }
  ): Submission {
    const all = this.getSubmissions();
    const existingIndex = all.findIndex(s => s.assignmentId === assignmentId && s.studentId === student.id);

    if (existingIndex !== -1) {
      // Update submission (resubmission)
      const updated: Submission = {
        ...all[existingIndex],
        ...submissionData,
        submittedAt: new Date().toISOString(),
        status: 'submitted', // resets to submitted if resubmitted
        grade: undefined,
        feedback: undefined
      };
      all[existingIndex] = updated;
      saveStorage(KEYS.SUBMISSIONS, all);
      return updated;
    } else {
      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        assignmentId,
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        ...submissionData
      };
      all.unshift(newSubmission);
      saveStorage(KEYS.SUBMISSIONS, all);
      return newSubmission;
    }
  },

  reviewSubmission(
    submissionId: string,
    reviewData: {
      grade: number;
      feedback: string;
      reviewedBy: string;
    }
  ): Submission {
    const all = this.getSubmissions();
    const idx = all.findIndex(s => s.id === submissionId);
    if (idx === -1) throw new Error('Submission not found');

    const updated: Submission = {
      ...all[idx],
      status: 'reviewed',
      grade: reviewData.grade,
      feedback: reviewData.feedback,
      reviewedBy: reviewData.reviewedBy,
      reviewedAt: new Date().toISOString()
    };
    all[idx] = updated;
    saveStorage(KEYS.SUBMISSIONS, all);
    return updated;
  },

  // Announcements
  getAnnouncements(classId?: string): Announcement[] {
    const all = loadStorage<Announcement[]>(KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    if (classId) {
      return all.filter(a => a.classId === classId);
    }
    // Return sorted: pinned first, then newest
    return [...all].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Announcement {
    const all = this.getAnnouncements();
    const cls = this.getClassById(data.classId);
    const newAnn: Announcement = {
      ...data,
      className: cls ? cls.name : data.className,
      classCode: cls ? cls.code : data.classCode,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newAnn);
    saveStorage(KEYS.ANNOUNCEMENTS, all);
    return newAnn;
  },

  updateAnnouncement(announcementId: string, updates: Partial<Announcement>): Announcement {
    const all = this.getAnnouncements();
    const idx = all.findIndex(a => a.id === announcementId);
    if (idx === -1) throw new Error('Announcement not found');
    const cls = updates.classId ? this.getClassById(updates.classId) : undefined;
    const updated = {
      ...all[idx],
      ...updates,
      ...(cls ? { className: cls.name, classCode: cls.code } : {})
    };
    all[idx] = updated;
    saveStorage(KEYS.ANNOUNCEMENTS, all);
    return updated;
  },

  deleteAnnouncement(announcementId: string): boolean {
    const all = this.getAnnouncements();
    const filtered = all.filter(a => a.id !== announcementId);
    saveStorage(KEYS.ANNOUNCEMENTS, filtered);
    return true;
  },

  // Resources
  getResources(classId?: string): ClassResource[] {
    const all = loadStorage<ClassResource[]>(KEYS.RESOURCES, DEFAULT_RESOURCES);
    if (classId) {
      return all.filter(r => r.classId === classId);
    }
    return [...all].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  createResource(data: Omit<ClassResource, 'id' | 'uploadedAt'>): ClassResource {
    const all = this.getResources();
    const cls = this.getClassById(data.classId);
    const newRes: ClassResource = {
      ...data,
      className: cls ? cls.name : data.className,
      classCode: cls ? cls.code : data.classCode,
      id: `res-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };
    all.unshift(newRes);
    saveStorage(KEYS.RESOURCES, all);
    return newRes;
  },

  // Academic Work Evaluation (Answers "What academic work do I need to deal with?")
  getStudentAcademicWork(studentId: string, referenceDate: Date = new Date('2026-09-17T12:00:00')): {
    items: AcademicWorkItem[];
    overdueCount: number;
    dueTodayCount: number;
    dueSoonCount: number;
    completedCount: number;
    totalActive: number;
  } {
    const enrolledClasses = this.getStudentClasses(studentId);
    const enrolledClassIds = new Set(enrolledClasses.map(c => c.id));
    const allAssignments = this.getAssignments().filter(a => enrolledClassIds.has(a.classId));
    const classMap = new Map(enrolledClasses.map(c => [c.id, c]));

    const items: AcademicWorkItem[] = allAssignments.map(assignment => {
      const course = classMap.get(assignment.classId)!;
      const submission = this.getSubmissionForStudent(assignment.id, studentId);
      const due = new Date(assignment.dueDate);
      const diffMs = due.getTime() - referenceDate.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let urgency: AcademicWorkItem['urgency'] = 'upcoming';

      if (submission) {
        urgency = 'completed';
      } else if (diffMs < 0) {
        urgency = 'overdue';
      } else if (daysLeft <= 1) {
        urgency = 'due-today';
      } else if (daysLeft <= 3) {
        urgency = 'due-soon';
      } else {
        urgency = 'upcoming';
      }

      return {
        assignment,
        course,
        submission,
        urgency,
        daysLeft
      };
    });

    // Sort order: overdue first, then due-today, then due-soon, then upcoming, completed last
    const urgencyOrder: Record<AcademicWorkItem['urgency'], number> = {
      'overdue': 0,
      'due-today': 1,
      'due-soon': 2,
      'upcoming': 3,
      'completed': 4
    };

    items.sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime();
    });

    const overdueCount = items.filter(i => i.urgency === 'overdue').length;
    const dueTodayCount = items.filter(i => i.urgency === 'due-today').length;
    const dueSoonCount = items.filter(i => i.urgency === 'due-soon').length;
    const completedCount = items.filter(i => i.urgency === 'completed').length;
    const totalActive = overdueCount + dueTodayCount + dueSoonCount;

    return {
      items,
      overdueCount,
      dueTodayCount,
      dueSoonCount,
      completedCount,
      totalActive
    };
  },

  // Daily Class Schedule (Answers "What classes do I have today?")
  getStudentDailySchedule(studentId: string, dayOfWeek: string = 'Thursday'): DailyClassScheduleItem[] {
    const enrolledClasses = this.getStudentClasses(studentId);
    const dayNorm = dayOfWeek.toLowerCase();

    const results: DailyClassScheduleItem[] = [];

    enrolledClasses.forEach(cls => {
      const scheduleLower = cls.schedule.toLowerCase();
      let dayMatches = false;

      if (dayNorm.startsWith('mon') && (scheduleLower.includes('mon') || scheduleLower.includes('m/w'))) dayMatches = true;
      else if (dayNorm.startsWith('tue') && (scheduleLower.includes('tue') || scheduleLower.includes('t/th'))) dayMatches = true;
      else if (dayNorm.startsWith('wed') && (scheduleLower.includes('wed') || scheduleLower.includes('m/w'))) dayMatches = true;
      else if (dayNorm.startsWith('thu') && (scheduleLower.includes('thu') || scheduleLower.includes('t/th'))) dayMatches = true;
      else if (dayNorm.startsWith('fri') && scheduleLower.includes('fri')) dayMatches = true;

      if (dayMatches) {
        // Extract time e.g. "10:00 AM - 11:30 AM"
        const timeMatch = cls.schedule.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
        const startTime = timeMatch ? timeMatch[1].toUpperCase() : '10:00 AM';
        const endTime = timeMatch ? timeMatch[2].toUpperCase() : '11:30 AM';

        const parseToHour = (t: string) => {
          const parts = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!parts) return 10;
          let h = parseInt(parts[1], 10);
          const m = parseInt(parts[2], 10);
          const isPM = parts[3].toUpperCase() === 'PM';
          if (isPM && h !== 12) h += 12;
          if (!isPM && h === 12) h = 0;
          return h + m / 60;
        };

        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;
        const startDec = parseToHour(startTime);
        const endDec = parseToHour(endTime);

        let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';
        if (currentHour > endDec) {
          status = 'completed';
        } else if (currentHour >= startDec && currentHour <= endDec) {
          status = 'in-progress';
        } else {
          status = 'upcoming';
        }

        results.push({
          id: `sched-${cls.id}-${dayOfWeek}`,
          course: cls,
          dayOfWeek: (dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase()) as any,
          startTime,
          endTime,
          room: cls.room,
          instructorName: cls.teacherName,
          instructorEmail: cls.teacherEmail,
          status
        });
      }
    });

    return results.sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  // Real-Time Class Status & Remaining Classes
  getStudentRealTimeClassStatus(studentId: string) {
    const enrolledClasses = this.getStudentClasses(studentId);
    // Baseline reference: Thursday Sep 17, 2026, 12:45 PM
    const todayName = 'Thursday';
    const currentHour = 12 + 45 / 60; // 12:45 PM

    const todaySchedule = this.getStudentDailySchedule(studentId, todayName);
    
    // Classes left today are those not yet completed
    const classesLeftToday = todaySchedule.filter(item => item.status !== 'completed');
    const completedClassesToday = todaySchedule.filter(item => item.status === 'completed');
    const nextClassToday = classesLeftToday.length > 0 ? classesLeftToday[0] : null;

    // Per-class stats (total lectures in 15-week semester, classes left this semester & this week)
    const perClass = enrolledClasses.map((course, idx) => {
      // Semester total is typically 28-30 lectures (approx 2 per week over 15 weeks)
      const totalLectures = 28;
      // We are in week 7 out of 15
      const completedLectures = 13 + (idx % 2);
      const remainingLectures = totalLectures - completedLectures;

      // Determine next class and if meets today
      const meetsToday = todaySchedule.some(s => s.course.id === course.id);
      const todayItem = todaySchedule.find(s => s.course.id === course.id);

      let statusToday: 'in-progress' | 'upcoming' | 'completed' | 'none-today' = 'none-today';
      let nextSessionText = 'Next lecture: Friday 09:30 AM';
      let classesLeftThisWeek = 1;

      if (meetsToday && todayItem) {
        statusToday = todayItem.status;
        if (todayItem.status === 'upcoming') {
          nextSessionText = `Today at ${todayItem.startTime}`;
          classesLeftThisWeek = 1;
        } else if (todayItem.status === 'in-progress') {
          nextSessionText = `In progress now until ${todayItem.endTime}`;
          classesLeftThisWeek = 1;
        } else {
          nextSessionText = 'Finished for today';
          classesLeftThisWeek = 0;
        }
      } else {
        if (course.schedule.includes('Mon') || course.schedule.includes('Wed')) {
          nextSessionText = 'Next: Monday at 10:00 AM';
          classesLeftThisWeek = 0;
        } else if (course.schedule.includes('Fri')) {
          nextSessionText = 'Next: Friday at 09:30 AM';
          classesLeftThisWeek = 1;
        }
      }

      return {
        course,
        totalLectures,
        completedLectures,
        remainingLectures,
        classesLeftThisWeek,
        meetsToday,
        statusToday,
        nextSessionText,
        todayItem
      };
    });

    const totalRemainingSemester = perClass.reduce((sum, c) => sum + c.remainingLectures, 0);
    const totalLecturesSemester = perClass.reduce((sum, c) => sum + c.totalLectures, 0);

    return {
      todayName,
      currentTimeStr: '12:45 PM',
      todaySchedule,
      classesLeftTodayCount: classesLeftToday.length,
      completedTodayCount: completedClassesToday.length,
      nextClassToday,
      totalRemainingSemester,
      totalLecturesSemester,
      perClass
    };
  },

  // Real-Time Assignment Urgency & Countdown
  getAssignmentRealTimeUrgency(dueDateISO: string) {
    const ref = new Date('2026-09-17T12:45:00').getTime();
    const due = new Date(dueDateISO).getTime();
    const diffMs = due - ref;

    if (diffMs < 0) {
      const pastHours = Math.abs(diffMs) / (1000 * 60 * 60);
      const pastDays = Math.floor(pastHours / 24);
      const remHours = Math.floor(pastHours % 24);
      return {
        isPastDue: true,
        diffMs,
        text: pastDays > 0 ? `Overdue by ${pastDays}d ${remHours}h` : `Overdue by ${Math.floor(pastHours)}h`,
        urgency: 'overdue' as const,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);
    const remHours = Math.floor(diffHours % 24);
    const remMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours <= 12) {
      return {
        isPastDue: false,
        diffMs,
        diffHours,
        text: diffHours < 1 ? `Due in ${remMinutes} mins!` : `Due in ${Math.floor(diffHours)}h ${remMinutes}m (Today)`,
        urgency: 'urgent' as const,
        badgeColor: 'bg-rose-500 text-white border-rose-600 animate-pulse'
      };
    }

    if (diffHours <= 36) {
      return {
        isPastDue: false,
        diffMs,
        diffHours,
        text: `Due in ${diffDays}d ${remHours}h (Tomorrow)`,
        urgency: 'near' as const,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }

    if (diffDays <= 7) {
      return {
        isPastDue: false,
        diffMs,
        diffHours,
        text: `Due in ${diffDays} days (${remHours}h left)`,
        urgency: 'this-week' as const,
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    }

    return {
      isPastDue: false,
      diffMs,
      diffHours,
      text: `Due in ${diffDays} days`,
      urgency: 'upcoming' as const,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  },

  // Personal Schedule Management (Students & Teachers)
  getPersonalSchedule(userId: string): PersonalScheduleItem[] {
    const all = loadStorage<PersonalScheduleItem[]>(KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE);
    return all.filter(s => s.userId === userId);
  },

  getPersonalScheduleByDay(userId: string, dayOfWeek: string): PersonalScheduleItem[] {
    const all = this.getPersonalSchedule(userId);
    const dayNorm = dayOfWeek.trim().toLowerCase();
    return all
      .filter(s => s.dayOfWeek.toLowerCase() === dayNorm)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  createPersonalScheduleItem(data: Omit<PersonalScheduleItem, 'id' | 'createdAt'>): PersonalScheduleItem {
    const all = loadStorage<PersonalScheduleItem[]>(KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE);
    const newItem: PersonalScheduleItem = {
      ...data,
      id: `sched-item-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    all.push(newItem);
    saveStorage(KEYS.PERSONAL_SCHEDULE, all);
    return newItem;
  },

  updatePersonalScheduleItem(id: string, updates: Partial<PersonalScheduleItem>): PersonalScheduleItem {
    const all = loadStorage<PersonalScheduleItem[]>(KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Schedule item not found');
    const updated = { ...all[idx], ...updates };
    all[idx] = updated;
    saveStorage(KEYS.PERSONAL_SCHEDULE, all);
    return updated;
  },

  deletePersonalScheduleItem(id: string): boolean {
    const all = loadStorage<PersonalScheduleItem[]>(KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE);
    const filtered = all.filter(s => s.id !== id);
    saveStorage(KEYS.PERSONAL_SCHEDULE, filtered);
    return true;
  },

  togglePersonalScheduleItemComplete(id: string): PersonalScheduleItem {
    const all = loadStorage<PersonalScheduleItem[]>(KEYS.PERSONAL_SCHEDULE, DEFAULT_PERSONAL_SCHEDULE);
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Schedule item not found');
    all[idx].completed = !all[idx].completed;
    saveStorage(KEYS.PERSONAL_SCHEDULE, all);
    return all[idx];
  },

  // Academic Notes & Student/Faculty Personal Academic Data
  getAcademicNotes(userId: string): AcademicNote[] {
    const all = loadStorage<AcademicNote[]>(KEYS.ACADEMIC_NOTES, DEFAULT_ACADEMIC_NOTES);
    return all
      .filter(n => n.userId === userId)
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  },

  createAcademicNote(data: Omit<AcademicNote, 'id' | 'createdAt' | 'updatedAt'>): AcademicNote {
    const all = loadStorage<AcademicNote[]>(KEYS.ACADEMIC_NOTES, DEFAULT_ACADEMIC_NOTES);
    const now = new Date().toISOString();
    const newNote: AcademicNote = {
      ...data,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    all.unshift(newNote);
    saveStorage(KEYS.ACADEMIC_NOTES, all);
    return newNote;
  },

  updateAcademicNote(id: string, updates: Partial<AcademicNote>): AcademicNote {
    const all = loadStorage<AcademicNote[]>(KEYS.ACADEMIC_NOTES, DEFAULT_ACADEMIC_NOTES);
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) throw new Error('Academic note not found');
    const updated = {
      ...all[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    all[idx] = updated;
    saveStorage(KEYS.ACADEMIC_NOTES, all);
    return updated;
  },

  deleteAcademicNote(id: string): boolean {
    const all = loadStorage<AcademicNote[]>(KEYS.ACADEMIC_NOTES, DEFAULT_ACADEMIC_NOTES);
    const filtered = all.filter(n => n.id !== id);
    saveStorage(KEYS.ACADEMIC_NOTES, filtered);
    return true;
  },

  // Teacher Schedule & Teaching Load Management
  getTeacherDailySchedule(teacherId: string, dayOfWeek: string) {
    const teacherClasses = this.getTeacherClasses(teacherId);
    const dayNorm = dayOfWeek.toLowerCase();
    const lectures: DailyClassScheduleItem[] = [];

    teacherClasses.forEach(cls => {
      const scheduleLower = cls.schedule.toLowerCase();
      let dayMatches = false;

      if (dayNorm.startsWith('mon') && (scheduleLower.includes('mon') || scheduleLower.includes('m/w'))) dayMatches = true;
      else if (dayNorm.startsWith('tue') && (scheduleLower.includes('tue') || scheduleLower.includes('t/th'))) dayMatches = true;
      else if (dayNorm.startsWith('wed') && (scheduleLower.includes('wed') || scheduleLower.includes('m/w'))) dayMatches = true;
      else if (dayNorm.startsWith('thu') && (scheduleLower.includes('thu') || scheduleLower.includes('t/th'))) dayMatches = true;
      else if (dayNorm.startsWith('fri') && scheduleLower.includes('fri')) dayMatches = true;

      if (dayMatches) {
        const timeMatch = cls.schedule.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
        const startTime = timeMatch ? timeMatch[1].toUpperCase() : '10:00 AM';
        const endTime = timeMatch ? timeMatch[2].toUpperCase() : '11:30 AM';

        lectures.push({
          id: `teach-sched-${cls.id}-${dayOfWeek}`,
          course: cls,
          dayOfWeek: (dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase()) as any,
          startTime,
          endTime,
          room: cls.room,
          instructorName: cls.teacherName,
          instructorEmail: cls.teacherEmail,
          status: 'upcoming'
        });
      }
    });

    const personalBlocks = this.getPersonalScheduleByDay(teacherId, dayOfWeek);

    return {
      lectures: lectures.sort((a, b) => a.startTime.localeCompare(b.startTime)),
      personalBlocks,
      totalCommitments: lectures.length + personalBlocks.length
    };
  }
};
