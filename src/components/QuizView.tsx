import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  HelpCircle,
  Loader2,
  Maximize2,
  Send,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { spreadsheetService } from '../services/spreadsheetService';
import {
  ExamResult,
  ItemResponse,
  Question,
  QuestionOption,
  ShuffledQuestion,
  StudentIdentity,
  ViolationLog,
} from '../types';
import { formatAnswerKey } from '../utils/analysis';
import { downloadQuestionsPdf } from '../utils/exportPdf';
import { enterFullscreen, exitFullscreen, isFullscreen } from '../utils/fullscreen';

interface QuizViewProps {
  student: StudentIdentity;
  questions: Question[];
  onFinishExam: (result: ExamResult) => void;
  strictSecurityMode?: boolean;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function QuizView({
  student,
  questions,
  onFinishExam,
  strictSecurityMode = true,
}: QuizViewProps) {
  const shuffledQuestions: ShuffledQuestion[] = useMemo(() => {
    const letters = ['A', 'B', 'C', 'D'];
    return shuffleArray(questions).map((q) => {
      if ((q.type === 'pg' || q.type === 'pgk') && q.options && q.options.length > 0) {
        const shuffledOpts: QuestionOption[] = shuffleArray(q.options).map((opt, idx) => ({
          id: letters[idx] || opt.id,
          text: opt.text,
        }));
        return { ...q, shuffledOptions: shuffledOpts };
      }
      return { ...q };
    });
  }, [questions]);

  const totalCount = shuffledQuestions.length;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [incompleteNotice, setIncompleteNotice] = useState<string | null>(null);

  // Security states
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([]);
  const [warningModal, setWarningModal] = useState<{ level: 1 | 2; reason: string } | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const isFinishedRef = useRef(false);
  const strictRef = useRef(strictSecurityMode);
  const hasEnteredFullscreenRef = useRef(false);
  const violationsCountRef = useRef(0);
  const violationLogsRef = useRef<ViolationLog[]>([]);
  const lastViolationTimeRef = useRef(0);

  strictRef.current = strictSecurityMode;

  const isQuestionAnswered = useCallback(
    (idx: number): boolean => {
      const q = shuffledQuestions[idx];
      const ans = answers[idx];
      if (!q || ans === undefined || ans === null) return false;
      if (q.type === 'pg') {
        return typeof ans === 'string' && ans.length > 0;
      }
      if (q.type === 'pgk') {
        return Array.isArray(ans) && ans.length > 0;
      }
      if (q.type === 'pgk_kategori') {
        const stCount = q.statements?.length || 0;
        const map = typeof ans === 'object' && !Array.isArray(ans) ? (ans as Record<string, boolean>) : {};
        return Object.keys(map).length === stCount;
      }
      return false;
    },
    [answers, shuffledQuestions]
  );

  const answeredCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < totalCount; i++) {
      if (isQuestionAnswered(i)) count++;
    }
    return count;
  }, [totalCount, isQuestionAnswered]);

  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const allAnswered = answeredCount === totalCount;
  const currentQuestion = shuffledQuestions[currentIdx];

  const computeExamResult = useCallback(
    (
      reason: 'normal' | 'violation_limit' = 'normal',
      finalViolationCount = violationsCountRef.current,
      finalLogs = violationLogsRef.current
    ): ExamResult => {
      let earnedScore = 0;
      const detailJawaban: Record<number, unknown> = {};
      const itemResponses: Record<number, ItemResponse> = {};

      shuffledQuestions.forEach((q, idx) => {
        const ans = answers[idx];
        detailJawaban[q.id] = ans;

        if (q.type === 'pg') {
          const correctOpt = q.options?.find((o) => o.id === q.correctAnswer);
          const isCorrect =
            typeof ans === 'string' &&
            (ans === q.correctAnswer || (correctOpt !== undefined && ans === correctOpt.text));
          if (isCorrect) earnedScore += 1;
          itemResponses[q.id] = {
            questionId: q.id,
            isCorrect,
            score: isCorrect ? 1 : 0,
            maxScore: 1,
            status: isCorrect ? 'benar' : 'salah',
            userAnswerText: typeof ans === 'string' ? ans : '-',
          };
        } else if (q.type === 'pgk') {
          const correctIds = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          const correctTexts = (q.options || [])
            .filter((o) => correctIds.includes(o.id))
            .map((o) => o.text);
          const selected = Array.isArray(ans) ? (ans as string[]) : [];
          const fullMatch =
            (correctIds.length === selected.length &&
              correctIds.every((id) => selected.includes(id))) ||
            (correctTexts.length === selected.length &&
              correctTexts.every((t) => selected.includes(t)));
          const partialMatchCount = selected.filter(
            (v) => correctIds.includes(v) || correctTexts.includes(v)
          ).length;

          if (fullMatch) {
            earnedScore += 1;
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: true,
              score: 1,
              maxScore: 1,
              status: 'benar',
              userAnswerText: selected.join(', '),
            };
          } else if (partialMatchCount > 0) {
            earnedScore += 0.5;
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: false,
              score: 0.5,
              maxScore: 1,
              status: 'sebagian',
              userAnswerText: selected.join(', '),
            };
          } else {
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: false,
              score: 0,
              maxScore: 1,
              status: 'salah',
              userAnswerText: selected.length > 0 ? selected.join(', ') : 'Kosong',
            };
          }
        } else if (q.type === 'pgk_kategori') {
          const statements = q.statements || [];
          const userMap =
            typeof ans === 'object' && ans !== null && !Array.isArray(ans)
              ? (ans as Record<string, boolean>)
              : {};
          let correctCount = 0;
          statements.forEach((st) => {
            if (userMap[st.id] === st.correctAnswer) correctCount += 1;
          });
          if (correctCount === statements.length && statements.length > 0) {
            earnedScore += 1;
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: true,
              score: 1,
              maxScore: 1,
              status: 'benar',
              userAnswerText: 'Semua Benar',
            };
          } else if (correctCount > 0) {
            const partial = Math.round((correctCount / statements.length) * 100) / 100;
            earnedScore += partial;
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: false,
              score: partial,
              maxScore: 1,
              status: 'sebagian',
              userAnswerText: `${correctCount}/${statements.length} Benar`,
            };
          } else {
            itemResponses[q.id] = {
              questionId: q.id,
              isCorrect: false,
              score: 0,
              maxScore: 1,
              status: 'salah',
              userAnswerText: 'Salah Semua',
            };
          }
        } else {
          itemResponses[q.id] = {
            questionId: q.id,
            isCorrect: false,
            score: 0,
            maxScore: 1,
            status: 'salah',
            userAnswerText: formatAnswerKey(q),
          };
        }
      });

      const benar = Math.round(earnedScore * 10) / 10;
      const salah = Math.max(0, Math.round((totalCount - earnedScore) * 10) / 10);
      const nilai = totalCount > 0 ? Math.round((earnedScore / totalCount) * 100) : 0;
      const status = nilai >= APP_CONFIG.KKTP ? 'Lulus' : 'Belum Lulus';

      const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      const mins = Math.floor(elapsedSec / 60);
      const secs = elapsedSec % 60;
      const durasiPengerjaan = `${mins} menit ${secs} detik`;

      const birthStr = `${student.tglLahir.hari} ${student.tglLahir.bulan} ${student.tglLahir.tahun}`;
      const nowStr = new Date().toLocaleString('id-ID');

      return {
        id: `res-${Date.now()}`,
        timestamp: nowStr,
        nama: student.nama,
        kelas: APP_CONFIG.KELAS,
        noAbsen: student.noAbsen,
        tglLahir: birthStr,
        benar,
        salah,
        nilai,
        status,
        mataPelajaran: APP_CONFIG.MATA_PELAJARAN,
        durasiPengerjaan,
        detailJawaban,
        itemResponses,
        violationsCount: finalViolationCount,
        violationLogs: finalLogs,
        submissionReason: reason,
        terminationNote:
          reason === 'violation_limit'
            ? `Ujian dihentikan otomatis oleh sistem setelah tercatat ${finalViolationCount}x pelanggaran keluar tab atau layar penuh.`
            : '',
      };
    },
    [answers, shuffledQuestions, student, totalCount]
  );

  const handleViolation = useCallback(
    async (reason: string) => {
      if (!strictRef.current || isFinishedRef.current) return;
      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1200) return;
      lastViolationTimeRef.current = now;

      const nextCount = violationsCountRef.current + 1;
      violationsCountRef.current = nextCount;
      setViolationsCount(nextCount);

      const log: ViolationLog = {
        timestamp: new Date().toLocaleTimeString('id-ID'),
        reason,
      };
      const nextLogs = [...violationLogsRef.current, log];
      violationLogsRef.current = nextLogs;
      setViolationLogs(nextLogs);

      if (nextCount >= 3) {
        isFinishedRef.current = true;
        setWarningModal(null);
        setNeedsFullscreenPrompt(false);
        setIsTerminating(true);
        const result = computeExamResult('violation_limit', nextCount, nextLogs);
        try {
          await spreadsheetService.submitExamResult(result);
        } catch {
          // Local save already completed
        }
        await exitFullscreen();
        onFinishExam(result);
      } else {
        setWarningModal({
          level: nextCount as 1 | 2,
          reason,
        });
      }
    },
    [computeExamResult, onFinishExam]
  );

  // Fullscreen check & event listeners
  useEffect(() => {
    if (!strictSecurityMode) return;
    if (isFullscreen()) {
      hasEnteredFullscreenRef.current = true;
      setNeedsFullscreenPrompt(false);
    } else {
      setNeedsFullscreenPrompt(true);
    }

    const onVisibility = () => {
      if (document.hidden && !isFinishedRef.current) {
        handleViolation('Berpindah tab atau meminimalkan jendela browser');
      }
    };

    const onBlur = () => {
      if (!isFinishedRef.current) {
        handleViolation('Jendela ujian kehilangan fokus / berpindah aplikasi');
      }
    };

    const onFullscreenChange = () => {
      if (!isFullscreen() && hasEnteredFullscreenRef.current && !isFinishedRef.current) {
        setNeedsFullscreenPrompt(true);
        handleViolation('Keluar dari mode layar penuh');
      } else if (isFullscreen()) {
        hasEnteredFullscreenRef.current = true;
        setNeedsFullscreenPrompt(false);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [strictSecurityMode, handleViolation]);

  // Keyboard & Context menu lock
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinishedRef.current) {
        e.preventDefault();
        e.returnValue =
          'Ujian sedang berlangsung. Jika Anda keluar atau memuat ulang, data Anda dapat terganggu.';
        return e.returnValue;
      }
      return undefined;
    };

    const onContextMenu = (e: MouseEvent) => {
      if (strictRef.current) {
        e.preventDefault();
        return false;
      }
      return undefined;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!strictRef.current) return;
      const lower = e.key.toLowerCase();
      if ((e.key === 'Escape' || e.key === 'Esc' || e.code === 'Escape') && hasEnteredFullscreenRef.current) {
        handleViolation('Keluar dari mode layar penuh (Menekan tombol Esc)');
        setNeedsFullscreenPrompt(true);
      }
      if (
        ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 'p', 's', 'r'].includes(lower)) ||
        e.key === 'F12' ||
        e.key === 'F5' ||
        e.key === 'F11' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(lower))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleViolation]);

  const handleSelectPg = (optionText: string) => {
    setIncompleteNotice(null);
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionText }));
  };

  const handleTogglePgk = (optionText: string) => {
    setIncompleteNotice(null);
    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentIdx]) ? (prev[currentIdx] as string[]) : [];
      const updated = existing.includes(optionText)
        ? existing.filter((x) => x !== optionText)
        : [...existing, optionText];
      return { ...prev, [currentIdx]: updated };
    });
  };

  const handleSetKategori = (stId: string, val: boolean) => {
    setIncompleteNotice(null);
    setAnswers((prev) => {
      const existing =
        typeof prev[currentIdx] === 'object' &&
        prev[currentIdx] !== null &&
        !Array.isArray(prev[currentIdx])
          ? (prev[currentIdx] as Record<string, boolean>)
          : {};
      return { ...prev, [currentIdx]: { ...existing, [stId]: val } };
    });
  };

  const handleManualSubmit = async () => {
    if (!allAnswered) {
      setIncompleteNotice(
        `Masih ada ${totalCount - answeredCount} butir soal yang belum dijawab. Harap jawab seluruh soal terlebih dahulu.`
      );
      setShowConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    isFinishedRef.current = true;
    const result = computeExamResult('normal');

    try {
      await spreadsheetService.submitExamResult(result);
      await exitFullscreen();
      setIsSubmitting(false);
      setShowConfirmModal(false);
      onFinishExam(result);
    } catch (err) {
      isFinishedRef.current = false;
      setIsSubmitting(false);
      setSubmitError(
        (err as Error).message ||
          'Gagal mengirim data ke server. Periksa koneksi internet atau konfigurasi Google Apps Script.'
      );
    }
  };

  const currentOptions = currentQuestion?.shuffledOptions || currentQuestion?.options || [];

  return (
    <div
      className="max-w-6xl mx-auto py-6 px-4 sm:px-6 select-none"
      onContextMenu={(e) => {
        if (strictSecurityMode) e.preventDefault();
      }}
    >
      {/* Top Info & Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="text-sm font-bold text-slate-900">{student.nama}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  Absen {student.noAbsen}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-semibold text-blue-700">Kelas {APP_CONFIG.KELAS}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                {strictSecurityMode ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pengawasan Aktif</span>
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">Mode Fleksibel</span>
                )}
                {strictSecurityMode && violationsCount > 0 && (
                  <>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold tabular-nums">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pelanggaran: {violationsCount}/3</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {APP_CONFIG.SEKOLAH} · {APP_CONFIG.MATA_PELAJARAN} ({APP_CONFIG.MATERI})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-download-questions-pdf"
              type="button"
              onClick={() => downloadQuestionsPdf(questions)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 cursor-pointer whitespace-nowrap"
              title="Unduh Lembar Naskah Soal dalam bentuk PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh Soal (PDF)</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
            <span className="text-slate-600">
              Progres Pengerjaan:{' '}
              <span className="text-blue-700 font-bold tabular-nums">{answeredCount}</span> dari{' '}
              <span className="tabular-nums">{totalCount}</span> Soal Terjawab
            </span>
            <span className="text-blue-700 font-bold tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {incompleteNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{incompleteNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setIncompleteNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Question */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs min-h-[440px] flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm sm:text-base font-extrabold px-3 py-1 bg-blue-700 text-white rounded-xl tabular-nums">
                    Soal No. {currentIdx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {currentQuestion?.type === 'pg' && 'Pilihan Ganda'}
                    {currentQuestion?.type === 'pgk' && 'Pilihan Ganda Kompleks'}
                    {currentQuestion?.type === 'pgk_kategori' && 'PGK Kategori (Benar / Salah)'}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {currentQuestion?.topic}
                </span>
              </div>

              <p className="mb-4 text-xs font-medium text-blue-800 bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-lg">
                {currentQuestion?.type === 'pg' && 'Pilihlah salah satu jawaban yang paling tepat.'}
                {currentQuestion?.type === 'pgk' &&
                  'Pilihlah seluruh pernyataan yang bernilai benar (bisa lebih dari satu).'}
                {currentQuestion?.type === 'pgk_kategori' &&
                  'Tentukan pilihan Benar atau Salah untuk setiap pernyataan di bawah ini.'}
              </p>

              {currentQuestion?.imageSvg && (
                <div
                  className="mb-5 p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-center overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.imageSvg }}
                />
              )}

              <div className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium whitespace-pre-line mb-6">
                {currentQuestion?.text}
              </div>

              {/* Options for PG */}
              {currentQuestion?.type === 'pg' && (
                <div className="space-y-2.5">
                  {currentOptions.map((opt) => {
                    const isSelected = answers[currentIdx] === opt.text;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectPg(opt.text)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-blue-700 bg-blue-50 text-blue-950 font-semibold ring-1 ring-blue-600'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="text-xs sm:text-sm mt-0.5 leading-normal flex-1">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Options for PGK */}
              {currentQuestion?.type === 'pgk' && (
                <div className="space-y-2.5">
                  {currentOptions.map((opt) => {
                    const selectedList = Array.isArray(answers[currentIdx])
                      ? (answers[currentIdx] as string[])
                      : [];
                    const isChecked = selectedList.includes(opt.text);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleTogglePgk(opt.text)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-colors flex items-start gap-3.5 cursor-pointer ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isChecked ? <Check className="w-4 h-4" /> : opt.id}
                        </div>
                        <span className="text-xs sm:text-sm mt-0.5 leading-normal flex-1">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Statements for PGK Kategori */}
              {currentQuestion?.type === 'pgk_kategori' && (
                <div className="space-y-3">
                  {(currentQuestion.statements || []).map((st, idx) => {
                    const map =
                      typeof answers[currentIdx] === 'object' &&
                      answers[currentIdx] !== null &&
                      !Array.isArray(answers[currentIdx])
                        ? (answers[currentIdx] as Record<string, boolean>)
                        : {};
                    const val = map[st.id];
                    return (
                      <div
                        key={st.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70"
                      >
                        <p className="text-xs sm:text-sm text-slate-800 font-medium mb-3">
                          <span className="font-bold text-blue-700 mr-1.5">{idx + 1}.</span>
                          {st.text}
                        </p>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSetKategori(st.id, true)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
                              val === true
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Benar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetKategori(st.id, false)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
                              val === false
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            Salah
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              {currentIdx < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => Math.min(totalCount - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Selesai & Kirim</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Number Grid */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold tracking-wide text-slate-700 mb-3 flex items-center justify-between">
              <span>Nomor Soal Ujian</span>
              <span className="font-semibold text-slate-500 tabular-nums">{totalCount} Butir</span>
            </h3>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 mb-4">
              {shuffledQuestions.map((q, idx) => {
                const isCurrent = currentIdx === idx;
                const isDone = isQuestionAnswered(idx);
                let btnStyle =
                  'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isDone) {
                  btnStyle =
                    'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700';
                }
                if (isCurrent) {
                  btnStyle =
                    'bg-blue-700 text-white border-blue-700 ring-2 ring-blue-300 font-extrabold';
                }
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg font-bold text-xs flex items-center justify-center border transition-colors cursor-pointer tabular-nums ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-700 shrink-0" />
                <span>Soal Sedang Dikerjakan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span className="tabular-nums">Sudah Dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-200 shrink-0" />
                <span className="tabular-nums">Belum Dijawab ({totalCount - answeredCount})</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                id="btn-sidebar-submit"
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  allAnswered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{allAnswered ? 'Selesai & Kirim Jawaban' : 'Kirim Jawaban'}</span>
              </button>
              {!allAnswered && (
                <p className="mt-2 text-xs text-amber-700 text-center font-medium">
                  Harap jawab seluruh {totalCount} soal sebelum mengirim.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Konfirmasi Pengiriman Jawaban
                </h3>
                <p className="text-xs text-slate-500">Periksa kembali kepastian jawaban Anda</p>
              </div>
            </div>

            {allAnswered ? (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs mb-5 space-y-1">
                <p className="font-bold">Apakah Anda yakin ingin mengirim jawaban?</p>
                <p>
                  Setelah dikirim, nilai akan dihitung dan tersimpan secara permanen ke rekap
                  Google Spreadsheet sekolah.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-5">
                <p className="font-bold mb-1">Peringatan: Belum Semua Soal Dijawab!</p>
                <p>
                  Anda baru menjawab <span className="font-bold tabular-nums">{answeredCount}</span>{' '}
                  dari <span className="tabular-nums">{totalCount}</span> butir soal. Sesuai
                  ketentuan, Anda tidak dapat mengirim tes sebelum seluruh soal terjawab.
                </p>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Gagal Mengirim Data</span>
                </p>
                <p>{submitError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                id="btn-cancel-submit"
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSubmitError(null);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal / Kembali ke Soal
              </button>
              {allAnswered && (
                <button
                  id="btn-confirm-submit-answers"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleManualSubmit}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim ke Server...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Ya, Kirim Jawaban</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Required Overlay */}
      {strictSecurityMode &&
        needsFullscreenPrompt &&
        !warningModal &&
        !isFinishedRef.current &&
        !isTerminating && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-500 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-700 mb-1">
                  Peringatan Integritas Ujian
                </p>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  Ujian Harus Dikerjakan dalam Mode Layar Penuh!
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Untuk menjaga integritas dan ketertiban evaluasi, tes hanya dapat dikerjakan
                  dalam tampilan layar penuh tanpa gangguan aplikasi lain.
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Menekan tombol <strong>Esc</strong> atau berpindah layar terekam oleh sistem
                  pengawasan guru.
                </span>
              </div>
              <button
                id="btn-resume-fullscreen"
                type="button"
                onClick={async () => {
                  const ok = (await enterFullscreen()) || isFullscreen();
                  if (ok) {
                    hasEnteredFullscreenRef.current = true;
                    setNeedsFullscreenPrompt(false);
                  }
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-5 h-5" />
                <span>Aktifkan Layar Penuh & Lanjutkan</span>
              </button>
            </div>
          </div>
        )}

      {/* Violation Warning Modal (1/3 and 2/3) */}
      {warningModal && !isTerminating && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div
            className={`bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 text-center space-y-4 ${
              warningModal.level === 2 ? 'border-rose-600' : 'border-amber-500'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                warningModal.level === 2
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div>
              <p
                className={`text-xs font-black tracking-wide mb-1 ${
                  warningModal.level === 2 ? 'text-rose-700' : 'text-amber-700'
                }`}
              >
                {warningModal.level === 1
                  ? 'Peringatan 1 dari 3'
                  : 'Peringatan Darurat 2 dari 3'}
              </p>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {warningModal.level === 1
                  ? 'Anda Terdeteksi Melakukan Pelanggaran!'
                  : 'Segera Kembali ke Soal Ujian!'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {warningModal.level === 1
                  ? `Aktivitas keluar layar penuh atau meninggalkan halaman ujian (${warningModal.reason}) terekam sistem (1 dari batas 3 kali). Harap tetap fokus pada lembar soal.`
                  : 'PERINGATAN DARURAT: Ini adalah pelanggaran ke-2 dari batas maksimal 3 kali. Jika Anda keluar sekali lagi, ujian akan DIHENTIKAN & DIKIRIM OTOMATIS oleh sistem.'}
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setWarningModal(null);
                if (strictSecurityMode && !isFullscreen()) {
                  const ok = await enterFullscreen();
                  if (!ok) setNeedsFullscreenPrompt(true);
                }
              }}
              className={`w-full py-3 px-5 rounded-xl font-bold text-sm text-white cursor-pointer transition-colors ${
                warningModal.level === 2
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              Saya Mengerti, Kembali ke Ujian
            </button>
          </div>
        </div>
      )}

      {/* Auto-Terminating Overlay */}
      {isTerminating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mx-auto" />
            <h3 className="text-lg font-black text-slate-900">
              Batas Pelanggaran Tercapai — Auto-Submit
            </h3>
            <p className="text-xs text-slate-600">
              Sistem sedang mengunci jawaban dan menyimpan hasil ujian ke Google Spreadsheet...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
