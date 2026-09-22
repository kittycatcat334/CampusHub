import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, subscribeToDB } from '../../services/db';
import { UniversityClass, Assignment } from '../../types';
import {
  BookOpen,
  Plus,
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Megaphone,
  FolderArchive,
  FileCheck2,
  X,
  Radio,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Mail,
  UserMinus
} from 'lucide-react';

interface StudentClassesProps {
  onOpenJoinModal: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
  selectedCourseId?: string | null;
  onSelectCourse?: (courseId: string | null) => void;
  onNavigate?: (tab: string) => void;
}

export const StudentClasses: React.FC<StudentClassesProps> = ({
  onOpenJoinModal,
  onSelectAssignment,
  selectedCourseId,
  onSelectCourse,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeToDB(() => setTick(t => t + 1));
  }, []);

  // Active class drill-down modal
  const [activeClass, setActiveClass] = useState<UniversityClass | null>(null);
  const [activeClassTab, setActiveClassTab] = useState<'stream' | 'assignments' | 'resources'>('stream');
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const [unenrollConfirmId, setUnenrollConfirmId] = useState<string | null>(null);

  if (!currentUser) return null;

  const enrolledClasses = db.getStudentClasses(currentUser.id);
  const realTimeStatus = db.getStudentRealTimeClassStatus(currentUser.id);

  const handleUnenroll = (classId: string) => {
    db.unenrollStudent(currentUser.id, classId);
    setUnenrollConfirmId(null);
    if (activeClass?.id === classId) {
      setActiveClass(null);
    }
  };

  // Data for active class
  const classAssignments = activeClass ? db.getAssignments(activeClass.id) : [];
  const classAnnouncements = activeClass ? db.getAnnouncements(activeClass.id) : [];
  const classResources = activeClass ? db.getResources(activeClass.id) : [];

  // Filter classes according to global or local filter
  const displayedClasses = enrolledClasses.filter(c => {
    if (selectedCourseId && c.id !== selectedCourseId) return false;
    if (filterTodayOnly) {
      const perClassInfo = realTimeStatus?.perClass.find(p => p.course.id === c.id);
      return perClassInfo?.meetsToday;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Space_Grotesk']">
              My Classes
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Real-Time Tracker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of lectures left today, semester progress, room details, and coursework.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onNavigate && (
            <button
              onClick={() => onNavigate('schedule')}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Daily Timetable</span>
            </button>
          )}
          <button
            onClick={onOpenJoinModal}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Join Class</span>
          </button>
        </div>
      </div>

      {/* REAL-TIME CLASSES LEFT SUMMARY WIDGET */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Real-time clock & Today's remaining classes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" />
                Live Academic Clock: 12:45 PM • {realTimeStatus.todayName}
              </span>
              <span className="text-xs text-slate-400">Fall Semester 2026 • Week 7</span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                  {realTimeStatus.classesLeftTodayCount}
                </span>
                <span className="text-base sm:text-lg font-bold text-indigo-200">
                  {realTimeStatus.classesLeftTodayCount === 1 ? 'Class Left Today' : 'Classes Left at Real Time Today'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {realTimeStatus.classesLeftTodayCount > 0 ? (
                  <>
                    Next immediate class starts in <strong className="text-amber-300">15 minutes</strong>:{' '}
                    <strong className="text-white">
                      {realTimeStatus.nextClassToday?.course.code} ({realTimeStatus.nextClassToday?.course.name})
                    </strong>{' '}
                    at {realTimeStatus.nextClassToday?.startTime} in {realTimeStatus.nextClassToday?.room}.
                  </>
                ) : (
                  'All scheduled lectures for today have completed. Excellent job!'
                )}
              </p>
            </div>

            {/* Upcoming classes ticker */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {realTimeStatus.todaySchedule.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    item.status === 'in-progress'
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                      : item.status === 'upcoming'
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                      : 'bg-slate-800 border-slate-700 text-slate-400 line-through'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    <strong>{item.course.code}:</strong> {item.startTime} - {item.endTime}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-black/30">
                    {item.status === 'upcoming' ? 'In 15m' : item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Semester lectures left progress */}
          <div className="lg:w-80 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Semester Lectures Left
              </span>
              <span className="font-bold text-white">
                {realTimeStatus.totalRemainingSemester} of {realTimeStatus.totalLecturesSemester} left
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    ((realTimeStatus.totalLecturesSemester - realTimeStatus.totalRemainingSemester) /
                      realTimeStatus.totalLecturesSemester) *
                      100
                  )}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>51% Semester Completed</span>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('schedule')}
                  className="text-indigo-300 hover:text-white font-semibold transition-colors inline-flex items-center gap-0.5"
                >
                  Weekly schedule <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilterTodayOnly(false);
              if (onSelectCourse) onSelectCourse(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              !filterTodayOnly && !selectedCourseId
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Courses ({enrolledClasses.length})
          </button>
          <button
            onClick={() => setFilterTodayOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterTodayOnly
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Today's Classes Only ({realTimeStatus.todaySchedule.length})
          </button>
        </div>

        {selectedCourseId && onSelectCourse && (
          <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
            <span>Filtered by course: <strong>{enrolledClasses.find(c => c.id === selectedCourseId)?.code}</strong></span>
            <button
              onClick={() => onSelectCourse(null)}
              className="p-0.5 hover:bg-indigo-100 rounded text-slate-500 hover:text-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Course Cards Grid */}
      {displayedClasses.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No classes match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting the filter to view all your enrolled semester courses.
          </p>
          <button
            onClick={() => {
              setFilterTodayOnly(false);
              if (onSelectCourse) onSelectCourse(null);
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-xl"
          >
            Show All Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClasses.map(cls => {
            const classInfo = realTimeStatus.perClass.find(p => p.course.id === cls.id);
            const classTasks = db.getAssignments(cls.id);
            const pendingTasks = classTasks.filter(t => !db.getSubmissionForStudent(t.id, currentUser.id));

            return (
              <div
                key={cls.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Header Banner */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      {cls.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">
                      {cls.section}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                    {cls.name}
                  </h3>

                  {/* REAL-TIME STATUS BADGE ON CARD */}
                  <div className="mt-3">
                    {classInfo?.meetsToday ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400 text-amber-950 border border-amber-300 shadow-xs animate-pulse">
                        <Hourglass className="w-3 h-3" />
                        <span>Today at {classInfo.todayItem?.startTime} (Starts in 15m)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
                        <Clock className="w-3 h-3 text-indigo-300" />
                        <span>{classInfo?.nextSessionText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Body with "Classes Left at Real Time" Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Classes Left Progress */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Classes Left in Course:
                      </span>
                      <span className="font-black text-indigo-700">
                        {classInfo?.remainingLectures} / {classInfo?.totalLectures} lectures
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            ((classInfo?.completedLectures || 0) / (classInfo?.totalLectures || 28)) * 100
                          )}%`
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{classInfo?.completedLectures} lectures attended</span>
                      <span>
                        {classInfo?.classesLeftThisWeek === 1 ? '1 class left this week' : '0 left this week'}
                      </span>
                    </div>
                  </div>

                  {/* Room & Instructor */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{cls.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">Instructor:</span>
                      <a
                        href={`mailto:${cls.teacherEmail}`}
                        onClick={e => e.stopPropagation()}
                        className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                      >
                        {cls.teacherName}
                        <Mail className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Pending assignments indicator */}
                  {pendingTasks.length > 0 && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                      <span>{pendingTasks.length} pending submission{pendingTasks.length > 1 ? 's' : ''}</span>
                      <button
                        onClick={() => onNavigate && onNavigate('assignments')}
                        className="text-amber-900 underline text-[11px] font-bold"
                      >
                        View
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100 relative">
                    <button
                      onClick={() => {
                        setActiveClass(cls);
                        setActiveClassTab('stream');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors"
                    >
                      <span>Course Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('schedule')}
                        title="View in daily schedule"
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setUnenrollConfirmId(cls.id)}
                      title="Drop / Unenroll course"
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>

                    {/* Unenroll confirmation overlay */}
                    {unenrollConfirmId === cls.id && (
                      <div className="absolute inset-0 -top-8 bg-white/95 rounded-xl border border-rose-200 p-2 z-20 flex flex-col justify-center items-center text-center shadow-lg">
                        <p className="text-[11px] font-bold text-slate-800 mb-1.5">
                          Drop {cls.code}?
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUnenroll(cls.id)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                          >
                            Yes, Drop
                          </button>
                          <button
                            onClick={() => setUnenrollConfirmId(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLASS DETAILS DRILLDOWN MODAL */}
      {activeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
              <button
                onClick={() => setActiveClass(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded bg-indigo-500/40 text-indigo-200 border border-indigo-400/40">
                  {activeClass.code}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {activeClass.section} • {activeClass.semester}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeClass.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {activeClass.description}
              </p>

              {/* Real-time stats bar */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-200 pt-3 border-t border-white/15">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  {activeClass.schedule}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                  {activeClass.room}
                </span>
                <span>•</span>
                <span className="font-semibold text-white">
                  Instructor: {activeClass.teacherName} ({activeClass.teacherEmail})
                </span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2">
              <button
                onClick={() => setActiveClassTab('stream')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeClassTab === 'stream'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Class Announcements ({classAnnouncements.length})</span>
              </button>
              <button
                onClick={() => setActiveClassTab('assignments')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeClassTab === 'assignments'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Assignments & Labs ({classAssignments.length})</span>
              </button>
              <button
                onClick={() => setActiveClassTab('resources')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeClassTab === 'resources'
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Subject Files ({classResources.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeClassTab === 'stream' && (
                <div className="space-y-3">
                  {classAnnouncements.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No announcements posted for this course yet.</p>
                  ) : (
                    classAnnouncements.map(ann => (
                      <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                        <div className="text-[11px] text-indigo-600 font-semibold">
                          Posted by: {ann.authorName}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeClassTab === 'assignments' && (
                <div className="space-y-3">
                  {classAssignments.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No assignments posted for this course yet.</p>
                  ) : (
                    classAssignments.map(assign => {
                      const submission = db.getSubmissionForStudent(assign.id, currentUser.id);
                      const urgency = db.getAssignmentRealTimeUrgency(assign.dueDate);

                      return (
                        <div
                          key={assign.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs text-slate-900">{assign.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${urgency.badgeColor}`}>
                                {urgency.text}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{assign.description}</p>
                            <span className="text-[11px] text-slate-400">
                              Points: {assign.points} pts • Due: {new Date(assign.dueDate).toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveClass(null);
                              onSelectAssignment(assign);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                              submission
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {submission ? 'View Submission' : 'Submit Work'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeClassTab === 'resources' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classResources.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8 col-span-2">No resource files uploaded yet.</p>
                  ) : (
                    classResources.map(res => (
                      <div
                        key={res.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {res.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{res.fileSize || 'PDF'}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{res.title}</h4>
                        {res.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{res.description}</p>
                        )}
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveClass(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
