/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { IdentityForm } from './components/IdentityForm';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { TeacherPanel } from './components/TeacherPanel';
import { APP_CONFIG } from './config';
import { DEFAULT_QUESTIONS } from './data/questions';
import { AppStage, ExamResult, Question, StudentIdentity } from './types';

const STORAGE_QUESTIONS_KEY = 'sd2_loloan_timur_ipas_questions_v2';
const STORAGE_REVIEW_KEY = 'sd3_loloan_timur_allow_review';
const STORAGE_STRICT_KEY = 'sd3_strict_exam_mode';

export default function App() {
  const [stage, setStage] = useState<AppStage>(1);
  const [prevStudentStage, setPrevStudentStage] = useState<AppStage>(1);
  const [student, setStudent] = useState<StudentIdentity | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_QUESTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_QUESTIONS.length) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_QUESTIONS;
  });

  const [allowReview, setAllowReview] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_REVIEW_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [strictSecurityMode, setStrictSecurityMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STRICT_KEY);
      if (saved !== null) return saved === 'true';
    } catch {
      // Ignore
    }
    return true;
  });

  const [isTeacherAuthed, setIsTeacherAuthed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleUpdateQuestion = (updated: Question) => {
    setQuestions((prev) => {
      const next = prev.map((q) => (q.id === updated.id ? updated : q));
      try {
        localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleResetDefaultQuestions = () => {
    setQuestions(DEFAULT_QUESTIONS);
    try {
      localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(DEFAULT_QUESTIONS));
    } catch {
      // Ignore
    }
  };

  const handleToggleAllowReview = (val: boolean) => {
    setAllowReview(val);
    try {
      localStorage.setItem(STORAGE_REVIEW_KEY, String(val));
    } catch {
      // Ignore
    }
  };

  const handleToggleStrictSecurityMode = (val: boolean) => {
    setStrictSecurityMode(val);
    try {
      localStorage.setItem(STORAGE_STRICT_KEY, String(val));
    } catch {
      // Ignore
    }
  };

  const handleStartExam = (identity: StudentIdentity) => {
    setStudent(identity);
    setStage(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishExam = (result: ExamResult) => {
    setExamResult(result);
    setStage(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setExamResult(null);
    setStudent(null);
    setStage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTeacherPanel = () => {
    if (isTeacherAuthed) {
      setPrevStudentStage(stage);
      setStage(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsTeacherAuthed(true);
    setShowAuthModal(false);
    setPrevStudentStage(stage);
    setStage(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStudentView = () => {
    setStage(prevStudentStage === 4 ? 1 : prevStudentStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-700 selection:text-white">
      <Header
        currentStage={stage}
        onOpenTeacherPanel={handleOpenTeacherPanel}
        onBackToStudentView={handleBackToStudentView}
      />

      <main className="flex-1">
        {stage === 1 && (
          <IdentityForm
            onStartExam={handleStartExam}
            initialIdentity={student || undefined}
            strictSecurityMode={strictSecurityMode}
          />
        )}
        {stage === 2 && student && (
          <QuizView
            student={student}
            questions={questions}
            onFinishExam={handleFinishExam}
            strictSecurityMode={strictSecurityMode}
          />
        )}
        {stage === 3 && examResult && (
          <ResultView
            result={examResult}
            questions={questions}
            allowReview={allowReview}
            onRestart={handleRestart}
          />
        )}
        {stage === 4 && (
          <TeacherPanel
            questions={questions}
            onUpdateQuestion={handleUpdateQuestion}
            onResetDefaultQuestions={handleResetDefaultQuestions}
            allowReview={allowReview}
            onToggleAllowReview={handleToggleAllowReview}
            strictSecurityMode={strictSecurityMode}
            onToggleStrictSecurityMode={handleToggleStrictSecurityMode}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            {APP_CONFIG.SEKOLAH} · Guru Kelas VI: {APP_CONFIG.GURU}
          </p>
          <p>
            Mata Pelajaran: {APP_CONFIG.MATA_PELAJARAN} ({APP_CONFIG.MATERI}) · Kelas{' '}
            {APP_CONFIG.KELAS} · KKTP: {APP_CONFIG.KKTP}
          </p>
        </div>
      </footer>

      <TeacherAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
