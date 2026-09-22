import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, subscribeToDB, initDatabase } from './services/db';
import { Assignment, Submission, UniversityClass } from './types';

// Authentication screen
import { LoginScreen } from './components/auth/LoginScreen';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentDailySchedule } from './components/student/StudentDailySchedule';
import { StudentAssignments } from './components/student/StudentAssignments';
import { StudentClasses } from './components/student/StudentClasses';
import { StudentAnnouncements } from './components/student/StudentAnnouncements';
import { StudentResources } from './components/student/StudentResources';
import { StudentCalendar } from './components/student/StudentCalendar';
import { AssignmentDetailModal } from './components/student/AssignmentDetailModal';
import { JoinClassModal } from './components/student/JoinClassModal';

// Teacher Views
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherClasses } from './components/teacher/TeacherClasses';
import { TeacherAssignments } from './components/teacher/TeacherAssignments';
import { TeacherAnnouncements } from './components/teacher/TeacherAnnouncements';
import { CreateClassModal } from './components/teacher/CreateClassModal';
import { CreateAssignmentModal } from './components/teacher/CreateAssignmentModal';
import { ScheduleProjectModal } from './components/teacher/ScheduleProjectModal';
import { PostAnnouncementModal } from './components/teacher/PostAnnouncementModal';
import { UploadResourceModal } from './components/teacher/UploadResourceModal';
import { TeacherSubmissionsModal } from './components/teacher/TeacherSubmissionsModal';

// Shared
import { ProfileModal } from './components/profile/ProfileModal';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SetupClassroomsModal } from './components/admin/SetupClassroomsModal';
import { AdminImpersonationBanner } from './components/admin/AdminImpersonationBanner';
import { PrincipalControlWindow } from './components/principal/PrincipalControlWindow';

// Initialize the database on first load
initDatabase();

function MainContent() {
  const { currentUser, isStudent, isTeacher, isAdmin, isPrincipal, currentInstitution, isAuthenticated } = useAuth();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Selected Course Filter (null = All Courses)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modals state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState<boolean>(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState<boolean>(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState<boolean>(false);
  const [createAssignmentClassId, setCreateAssignmentClassId] = useState<string | undefined>(undefined);
  const [isScheduleProjectOpen, setIsScheduleProjectOpen] = useState<boolean>(false);
  const [isPostAnnouncementOpen, setIsPostAnnouncementOpen] = useState<boolean>(false);
  const [postAnnouncementClassId, setPostAnnouncementClassId] = useState<string | undefined>(undefined);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState<boolean>(false);
  const [uploadResourceClassId, setUploadResourceClassId] = useState<string | undefined>(undefined);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isClassroomSetupOpen, setIsClassroomSetupOpen] = useState<boolean>(false);

  // Teacher Grading Modal state
  const [gradingPayload, setGradingPayload] = useState<{
    submission: Submission;
    assignment: Assignment;
    course?: UniversityClass;
  } | null>(null);

  // Trigger re-render whenever localStorage updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = subscribeToDB(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // If user is not logged in, show Login & Portal Gateway
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen />;
  }

  // Compute live badges
  const pendingWork = isStudent
    ? db.getStudentAcademicWork(currentUser.id).totalActive
    : 0;

  const unreviewedCount = isTeacher
    ? db.getSubmissions().filter((s) => {
        const a = db.getAssignmentById(s.assignmentId);
        if (!a) return false;
        const c = db.getClassById(a.classId);
        return c?.teacherId === currentUser.id && s.status === 'submitted';
      }).length
    : 0;

  // Handlers for quick creation modals
  const handleOpenCreateAssignment = (classId?: string) => {
    setCreateAssignmentClassId(classId);
    setIsCreateAssignmentOpen(true);
  };

  const handleOpenScheduleProject = () => {
    setIsScheduleProjectOpen(true);
  };

  const handleOpenPostAnnouncement = (classId?: string) => {
    setPostAnnouncementClassId(classId);
    setIsPostAnnouncementOpen(true);
  };

  const handleOpenUploadResource = (classId?: string) => {
    setUploadResourceClassId(classId);
    setIsUploadResourceOpen(true);
  };

  const handleGradeSubmission = (
    submission: Submission,
    assignment: Assignment,
    course?: UniversityClass
  ) => {
    setGradingPayload({ submission, assignment, course });
  };

  const handleTabSelect = (tab: string) => {
    if (tab === 'profile') {
      setIsProfileOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenJoinClass={() => setIsJoinClassOpen(true)}
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
        onOpenScheduleProject={handleOpenScheduleProject}
        onOpenClassrooms={() => setIsClassroomSetupOpen(true)}
        onNavigate={handleTabSelect}
        selectedCourseId={selectedCourseId}
        onSelectCourse={setSelectedCourseId}
      />

      {/* Admin Impersonation & Master Control Banner */}
      <AdminImpersonationBanner onOpenClassrooms={() => setIsClassroomSetupOpen(true)} />

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleTabSelect}
          onOpenClassrooms={() => setIsClassroomSetupOpen(true)}
          pendingWorkCount={pendingWork}
          unreviewedSubmissionCount={unreviewedCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* PRINCIPAL EXPERIENCE */}
          {isPrincipal && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <PrincipalControlWindow
                institution={currentInstitution}
                isStandalone={true}
                isOpen={true}
              />
            </div>
          )}

          {/* ADMIN EXPERIENCE */}
          {isAdmin && (
            <>
              {(currentTab === 'dashboard' || currentTab === 'institutions') && (
                <AdminDashboard
                  onOpenClassrooms={() => setIsClassroomSetupOpen(true)}
                  onNavigate={setCurrentTab}
                  initialSubTab={currentTab === 'institutions' ? 'institutions' : undefined}
                />
              )}

              {currentTab === 'classes' && (
                <TeacherClasses
                  onOpenCreateClass={() => setIsCreateClassOpen(true)}
                  onOpenCreateAssignment={handleOpenCreateAssignment}
                  onOpenPostAnnouncement={handleOpenPostAnnouncement}
                  onOpenUploadResource={handleOpenUploadResource}
                />
              )}

              {currentTab === 'announcements' && (
                <TeacherAnnouncements
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}
            </>
          )}

          {/* STUDENT EXPERIENCE */}
          {isStudent && (
            <>
              {currentTab === 'dashboard' && (
                <StudentDashboard
                  onSelectAssignment={(a) => setSelectedAssignment(a)}
                  onOpenJoinModal={() => setIsJoinClassOpen(true)}
                  onNavigate={setCurrentTab}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'schedule' && (
                <StudentDailySchedule
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'assignments' && (
                <StudentAssignments
                  onSelectAssignment={(a) => setSelectedAssignment(a)}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'classes' && (
                <StudentClasses
                  onOpenJoinModal={() => setIsJoinClassOpen(true)}
                  onSelectAssignment={(a) => setSelectedAssignment(a)}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'calendar' && (
                <StudentCalendar
                  onSelectAssignment={(a) => setSelectedAssignment(a)}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'announcements' && (
                <StudentAnnouncements
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'resources' && (
                <StudentResources
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}
            </>
          )}

          {/* TEACHER EXPERIENCE */}
          {isTeacher && (
            <>
              {currentTab === 'dashboard' && (
                <TeacherDashboard
                  onOpenCreateClass={() => setIsCreateClassOpen(true)}
                  onOpenCreateAssignment={handleOpenCreateAssignment}
                  onOpenScheduleProject={handleOpenScheduleProject}
                  onOpenPostAnnouncement={handleOpenPostAnnouncement}
                  onOpenUploadResource={handleOpenUploadResource}
                  onGradeSubmission={handleGradeSubmission}
                  onNavigate={setCurrentTab}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'classes' && (
                <TeacherClasses
                  onOpenCreateClass={() => setIsCreateClassOpen(true)}
                  onOpenCreateAssignment={handleOpenCreateAssignment}
                  onOpenPostAnnouncement={handleOpenPostAnnouncement}
                  onOpenUploadResource={handleOpenUploadResource}
                />
              )}

              {currentTab === 'assignments' && (
                <TeacherAssignments
                  onOpenCreateAssignment={() => handleOpenCreateAssignment()}
                  onOpenScheduleProject={handleOpenScheduleProject}
                  onGradeSubmission={handleGradeSubmission}
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'announcements' && (
                <TeacherAnnouncements
                  selectedCourseId={selectedCourseId}
                  onSelectCourse={setSelectedCourseId}
                />
              )}

              {currentTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                        Subject Resources & Repository
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Lecture notes, syllabus PDFs, and problem set files.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenUploadResource()}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      + Upload Resource
                    </button>
                  </div>
                  <StudentResources />
                </div>
              )}

              {currentTab === 'calendar' && (
                <StudentCalendar onSelectAssignment={(a) => setSelectedAssignment(a)} />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}

      {/* Student: Assignment Details & Submission Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmissionSuccess={() => {
            // Keep open or update
          }}
        />
      )}

      {/* Student: Join Class Modal */}
      {isJoinClassOpen && (
        <JoinClassModal
          onClose={() => setIsJoinClassOpen(false)}
          onSuccess={() => setCurrentTab('classes')}
        />
      )}

      {/* Teacher: Create Course Modal */}
      {isCreateClassOpen && (
        <CreateClassModal
          onClose={() => setIsCreateClassOpen(false)}
          onSuccess={() => setCurrentTab('classes')}
        />
      )}

      {/* Teacher: Create Assignment Modal */}
      {isCreateAssignmentOpen && (
        <CreateAssignmentModal
          initialClassId={createAssignmentClassId}
          onClose={() => {
            setIsCreateAssignmentOpen(false);
            setCreateAssignmentClassId(undefined);
          }}
          onSuccess={() => setCurrentTab('assignments')}
        />
      )}

      {/* Teacher: Schedule Deliverable / Project Modal */}
      {isScheduleProjectOpen && (
        <ScheduleProjectModal
          onClose={() => setIsScheduleProjectOpen(false)}
          onSuccess={() => setCurrentTab('assignments')}
        />
      )}

      {/* Teacher: Post Announcement Modal */}
      {isPostAnnouncementOpen && (
        <PostAnnouncementModal
          initialClassId={postAnnouncementClassId}
          onClose={() => {
            setIsPostAnnouncementOpen(false);
            setPostAnnouncementClassId(undefined);
          }}
          onSuccess={() => setCurrentTab('announcements')}
        />
      )}

      {/* Teacher: Upload Resource Modal */}
      {isUploadResourceOpen && (
        <UploadResourceModal
          initialClassId={uploadResourceClassId}
          onClose={() => {
            setIsUploadResourceOpen(false);
            setUploadResourceClassId(undefined);
          }}
          onSuccess={() => setCurrentTab('resources')}
        />
      )}

      {/* Teacher: Review & Grade Submission Modal */}
      {gradingPayload && (
        <TeacherSubmissionsModal
          submission={gradingPayload.submission}
          assignment={gradingPayload.assignment}
          course={gradingPayload.course}
          onClose={() => setGradingPayload(null)}
          onGradedSuccess={() => {
            // Updated
          }}
        />
      )}

      {/* User Profile & Account Modal */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Classroom Setup Window Modal */}
      <SetupClassroomsModal
        isOpen={isClassroomSetupOpen}
        onClose={() => setIsClassroomSetupOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

