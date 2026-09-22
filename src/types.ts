export type UserRole = 'student' | 'teacher' | 'admin' | 'principal';

export interface Institution {
  id: string; // e.g. "inst-campushub", "inst-apex"
  name: string; // e.g. "CampusHub Global University"
  shortName: string; // e.g. "CampusHub"
  code: string; // e.g. "CHUB", "APEX"
  domain: string; // e.g. "campushub.edu", "apex.edu"
  tagline: string;
  location: string;
  brandColor: 'indigo' | 'emerald' | 'purple' | 'rose' | 'amber' | 'sky' | 'blue';
  logoText: string;
  licenseTier: 'Starter Campus' | 'Professional Multi-School' | 'Enterprise Global';
  licenseStatus: 'active' | 'trial' | 'pending';
  licenseExpiresAt: string;
  contactAdminName: string;
  contactAdminEmail: string;
  principalName?: string;
  principalEmail?: string;
  principalTitle?: string;
  staffVerificationCode: string; // University-specific faculty SV-Code
  portalSubdomain?: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface Classroom {
  id: string;
  institutionId?: string; // Multi-tenant link
  roomNumber: string; // e.g. "Turing Hall 304"
  building: string;   // e.g. "Alan Turing Computer Science Center"
  capacity: number;   // e.g. 45
  type: 'Lecture Hall' | 'Computer Lab' | 'Science Lab' | 'Seminar Room' | 'Auditorium';
  equipment: string[]; // e.g. ['Projector', 'Smartboard', 'Audio PA']
  courseSubject: string; // Course/Subject taught here e.g. "Data Structures & Algorithm Analysis"
  courseCode: string;    // e.g. "CS201"
  teacherName: string;   // e.g. "Dr. Robert Chen"
  teacherEmail?: string;
  teacherId?: string;
  days: string[];        // e.g. ["Monday", "Wednesday"]
  startDate?: string;    // e.g. "2026-09-01"
  endDate?: string;      // e.g. "2026-12-18"
  startTime: string;     // e.g. "10:00 AM"
  endTime: string;       // e.g. "11:30 AM"
  classId?: string;      // Linked university class
  notes?: string;
  createdAt: string;
}

export interface User {
  id: string;
  institutionId?: string; // Multi-tenant link
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatarUrl?: string;
  department?: string;
  studentId?: string;
  facultyId?: string;
  adminId?: string;
  principalId?: string;
  title?: string; // e.g. "Associate Professor" or "Campus Administrator"
}

export interface UniversityClass {
  id: string;
  institutionId?: string; // Multi-tenant link
  code: string; // e.g. "CS201"
  name: string; // e.g. "Data Structures & Algorithms"
  section: string; // e.g. "Sec 02"
  semester: string; // e.g. "Fall 2026"
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  room: string; // e.g. "Turing Hall 304"
  schedule: string; // e.g. "Mon / Wed 10:00 AM - 11:30 AM"
  color: string; // e.g. "indigo", "emerald", "amber", "sky", "rose"
  joinCode: string; // 6-character code for students to join
  description: string;
  enrolledStudentCount: number;
}

export interface Enrollment {
  id: string;
  institutionId?: string;
  classId: string;
  studentId: string;
  enrolledAt: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'reviewed';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  points?: number;
  completed?: boolean;
}

export interface Assignment {
  id: string;
  institutionId?: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string e.g. "2026-09-22T23:59:00"
  points: number;
  category?: 'Homework' | 'Project' | 'Quiz' | 'Lab' | 'Exam' | 'Essay';
  publishDate?: string; // Scheduled publish date/time
  isScheduled?: boolean; // Scheduled in advance
  milestones?: ProjectMilestone[]; // For multi-phase term projects
  attachments?: {
    name: string;
    url: string;
    size?: string;
  }[];
  createdAt: string;
}

export interface DailyClassScheduleItem {
  id: string;
  course: UniversityClass;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:30 AM"
  room: string;
  instructorName: string;
  instructorEmail: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface Submission {
  id: string;
  institutionId?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  submissionType: 'file' | 'link' | 'text';
  content: string; // file name or URL or written text
  fileSize?: string;
  status: 'submitted' | 'reviewed';
  grade?: number; // e.g. 95
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  institutionId?: string;
  classId: string;
  className?: string;
  classCode?: string;
  teacherId: string;
  authorName: string;
  authorRole?: string;
  authorEmail?: string;
  authorAvatar?: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  pinned: boolean;
  createdAt: string;
  attachments?: {
    name: string;
    url: string;
    size?: string;
  }[];
}

export type ResourceCategory = 'Syllabus' | 'Lecture Notes' | 'Assignments' | 'Readings' | 'Exam Prep' | 'Software & Tools';

export interface ClassResource {
  id: string;
  institutionId?: string;
  classId: string;
  className?: string;
  classCode?: string;
  teacherId: string;
  teacherName?: string;
  title: string;
  description?: string;
  topic?: string;
  category: ResourceCategory;
  fileType: 'pdf' | 'slide' | 'link' | 'zip' | 'document' | 'code';
  url: string;
  fileSize?: string;
  uploadedAt: string;
  contentPreview?: string;
}

export interface AcademicWorkItem {
  assignment: Assignment;
  course: UniversityClass;
  submission?: Submission;
  urgency: 'overdue' | 'due-today' | 'due-soon' | 'upcoming' | 'completed';
  daysLeft: number;
}
