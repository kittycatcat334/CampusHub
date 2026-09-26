import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, subscribeToDB, initDatabase } from './services/db';
import { Assignment, Submission, UniversityClass } from './types';

// Authentication screen (Google Login + Regular Login)
import { LoginScreen } from './components/auth/LoginScreen';

// Google Classroom Style Core Components
import { ClassroomHeader } from './components/classroom/ClassroomHeader';
import { ClassroomDrawer } from './components/classroom/ClassroomDrawer';
import { ClassesHome } from './components/classroom/ClassesHome';
import { ClassView } from './components/classroom/ClassView';
import { TodoView } from './components/classroom/TodoView';

// Calendar and Admin
import { StudentCalendar } from './components/student/StudentCalendar';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals for real student & teacher operations
import { JoinClassModal } from './components/student/JoinClassModal';
import { CreateClassModal } from './components/teacher/CreateClassModal';
import { CreateAssignmentModal } from './components/teacher/CreateAssignmentModal';
import { PostAnnouncementModal } from './components/teacher/PostAnnouncementModal';
import { UploadResourceModal } from './components/teacher/UploadResourceModal';
import { AssignmentDetailModal } from './components/student/AssignmentDetailModal';
import { TeacherSubmissionsModal } from './components/teacher/TeacherSubmissionsModal';
import { ProfileModal } from './components/profile/ProfileModal';

// Initialize the database on first load
initDatabase();

function ClassroomApp() {
  const { currentUser, isStudent, isTeacher, isAdmin, isAuthenticated } = useAuth();

  // Navigation state
  const [activeView, setActiveView] = useState<string>('classes');
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [classTab, setClassTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals state
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);
  const [createAssignmentClassId, setCreateAssignmentClassId] = useState<string | undefined>(undefined);
  const [isPostAnnouncementOpen, setIsPostAnnouncementOpen] = useState(false);
  const [postAnnouncementClassId, setPostAnnouncementClassId] = useState<string | undefined>(undefined);
  const [isUploadResourceOpen, setIsUploadResourceOpen] = useState(false);
  const [uploadResourceClassId, setUploadResourceClassId] = useState<string | undefined>(undefined);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Teacher Grading Modal state
  const [gradingPayload, setGradingPayload] = useState<{
    submission: Submission;
    assignment: Assignment;
    course?: UniversityClass;
  } | null>(null);

  // Re-render when local database changes
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

  // Active course lookup
  const activeClass = activeClassId ? db.getClassById(activeClassId) || null : null;

  // Navigation router handler
  const handleSelectView = (view: string, courseId?: string) => {
    if (view === 'class-detail' && courseId) {
      setActiveClassId(courseId);
      setClassTab('stream');
    } else if (view === 'classes') {
      setActiveClassId(null);
      setActiveView('classes');
    } else {
      setActiveClassId(null);
      setActiveView(view);
    }
  };

  const handleOpenCreateAssignment = (classId?: string) => {
    setCreateAssignmentClassId(classId);
    setIsCreateAssignmentOpen(true);
  };

  const handleOpenUploadResource = (classId?: string) => {
    setUploadResourceClassId(classId);
    setIsUploadResourceOpen(true);
  };

  const handleGradeSubmission = (
    submission: Submission,
    assignment: Assignment,
    course: UniversityClass
  ) => {
    setGradingPayload({ submission, assignment, course });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">
      {/* Top Google Classroom Navigation Bar */}
      <ClassroomHeader
        onToggleDrawer={() => setIsDrawerOpen(prev => !prev)}
        activeView={activeView}
        onSelectView={handleSelectView}
        activeClass={activeClass}
        classTab={classTab}
        onChangeClassTab={(tab) => setClassTab(tab)}
        onOpenJoinClass={() => setIsJoinClassOpen(true)}
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Slide-out Navigation Drawer */}
      <ClassroomDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenJoinClass={() => setIsJoinClassOpen(true)}
        onOpenCreateClass={() => setIsCreateClassOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeClassId && activeClass ? (
          /* INSIDE A CLASSROOM (Google Classroom: Stream, Classwork, People, Grades) */
          <ClassView
            course={activeClass}
            activeTab={classTab}
            onChangeTab={(tab) => setClassTab(tab)}
            onOpenCreateAssignment={handleOpenCreateAssignment}
            onOpenUploadResource={handleOpenUploadResource}
            onSelectAssignment={(assignment) => setSelectedAssignment(assignment)}
            onGradeSubmission={handleGradeSubmission}
          />
        ) : (
          /* MAIN APPLICATION VIEWS */
          <>
            {activeView === 'classes' && (
              <ClassesHome
                onSelectClass={(courseId) => {
                  setActiveClassId(courseId);
                  setClassTab('stream');
                }}
                onOpenJoinClass={() => setIsJoinClassOpen(true)}
                onOpenCreateClass={() => setIsCreateClassOpen(true)}
              />
            )}

            {activeView === 'todo' && (
              <TodoView
                onSelectAssignment={(assignment) => setSelectedAssignment(assignment)}
                onSelectClass={(courseId) => {
                  setActiveClassId(courseId);
                  setClassTab('stream');
                }}
              />
            )}

            {activeView === 'calendar' && (
              <StudentCalendar
                onSelectAssignment={(assignment) => setSelectedAssignment(assignment)}
                selectedCourseId={null}
                onSelectCourse={() => {}}
              />
            )}

            {activeView === 'admin' && isAdmin && (
              <AdminDashboard
                onOpenClassrooms={() => {}}
                onNavigate={(v) => handleSelectView(v)}
              />
            )}

            {/* Fallback to prevent white screens on any unrecognized view */}
            {activeView !== 'classes' &&
              activeView !== 'todo' &&
              activeView !== 'calendar' &&
              (activeView !== 'admin' || !isAdmin) && (
                <ClassesHome
                  onSelectClass={(courseId) => {
                    setActiveClassId(courseId);
                    setClassTab('stream');
                  }}
                  onOpenJoinClass={() => setIsJoinClassOpen(true)}
                  onOpenCreateClass={() => setIsCreateClassOpen(true)}
                />
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {isJoinClassOpen && (
        <JoinClassModal
          onClose={() => setIsJoinClassOpen(false)}
          onSuccess={() => setIsJoinClassOpen(false)}
        />
      )}

      {isCreateClassOpen && (
        <CreateClassModal
          onClose={() => setIsCreateClassOpen(false)}
          onSuccess={() => setIsCreateClassOpen(false)}
        />
      )}

      {isCreateAssignmentOpen && (
        <CreateAssignmentModal
          initialClassId={createAssignmentClassId}
          onClose={() => setIsCreateAssignmentOpen(false)}
          onSuccess={() => setIsCreateAssignmentOpen(false)}
        />
      )}

      {isPostAnnouncementOpen && (
        <PostAnnouncementModal
          initialClassId={postAnnouncementClassId}
          onClose={() => setIsPostAnnouncementOpen(false)}
          onSuccess={() => setIsPostAnnouncementOpen(false)}
        />
      )}

      {isUploadResourceOpen && (
        <UploadResourceModal
          initialClassId={uploadResourceClassId}
          onClose={() => setIsUploadResourceOpen(false)}
          onSuccess={() => setIsUploadResourceOpen(false)}
        />
      )}

      {/* Assignment Detail / Submission Modal for Students */}
      {selectedAssignment && isStudent && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmissionSuccess={() => setSelectedAssignment(null)}
        />
      )}

      {/* Assignment Review Modal for Teachers / Admins */}
      {selectedAssignment && !isStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-850 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {db.getClassById(selectedAssignment.classId)?.name || 'Course'} &bull; {selectedAssignment.points} Points &bull; Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Assignment Instructions:</p>
              <p className="whitespace-pre-line leading-relaxed">{selectedAssignment.description}</p>
            </div>

            {/* Submissions List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Student Submissions ({db.getSubmissions().filter(s => s.assignmentId === selectedAssignment.id).length})
              </h4>
              {db.getSubmissions().filter(s => s.assignmentId === selectedAssignment.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-center">
                  No student submissions turned in yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {db.getSubmissions().filter(s => s.assignmentId === selectedAssignment.id).map(sub => (
                    <div key={sub.id} className="p-3 flex items-center justify-between gap-3 text-xs bg-white dark:bg-slate-850">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{sub.studentName}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{sub.content}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {sub.grade !== undefined ? `${sub.grade}/${selectedAssignment.points}` : 'Ungraded'}
                        </span>
                        <button
                          onClick={() => {
                            const c = db.getClassById(selectedAssignment.classId);
                            setGradingPayload({ submission: sub, assignment: selectedAssignment, course: c });
                            setSelectedAssignment(null);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          Grade
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Grading Review Modal */}
      {gradingPayload && (
        <TeacherSubmissionsModal
          submission={gradingPayload.submission}
          assignment={gradingPayload.assignment}
          course={gradingPayload.course}
          onClose={() => setGradingPayload(null)}
          onGradedSuccess={() => setGradingPayload(null)}
        />
      )}

      {/* Account Profile Modal */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ClassroomApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
