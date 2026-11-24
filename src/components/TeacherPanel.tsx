import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Layers,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { spreadsheetService } from '../services/spreadsheetService';
import { ExamResult, Question } from '../types';
import { downloadRekapExcel } from '../utils/exportExcel';
import { downloadKisiKisiPdf, downloadRekapPdf, downloadResultPdf } from '../utils/exportPdf';
import {
  ClearAllModal,
  ConfirmDeleteStudentModal,
  ConfirmResetQuestionsModal,
  EditQuestionModal,
  GasGuideModal,
  GasSettingsModal,
  StudentDetailModal,
} from './TeacherModals';
import { BankSoalTab, ItemAnalysisTab, KisiKisiTab } from './TeacherTabs';

interface TeacherPanelProps {
  questions: Question[];
  onUpdateQuestion: (updated: Question) => void;
  onResetDefaultQuestions: () => void;
  allowReview: boolean;
  onToggleAllowReview: (val: boolean) => void;
  strictSecurityMode: boolean;
  onToggleStrictSecurityMode: (val: boolean) => void;
}

type SortField = 'timestamp' | 'nama' | 'noAbsen' | 'nilai';

export function TeacherPanel({
  questions,
  onUpdateQuestion,
  onResetDefaultQuestions,
  allowReview,
  onToggleAllowReview,
  strictSecurityMode,
  onToggleStrictSecurityMode,
}: TeacherPanelProps) {
  const [activeTab, setActiveTab] = useState<'rekap' | 'analisis' | 'kisi-kisi' | 'soal'>('rekap');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSilentRefreshing, setIsSilentRefreshing] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState('');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('Semua');
  const [classFilter, setClassFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [showGasSettings, setShowGasSettings] = useState(false);
  const [showGasGuide, setShowGasGuide] = useState(false);
  const [detailResult, setDetailResult] = useState<ExamResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamResult | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showResetQuestionsConfirm, setShowResetQuestionsConfirm] = useState(false);

  // Live sync
  const [liveSync, setLiveSync] = useState(() => {
    try {
      const saved = localStorage.getItem('sd3_teacher_live_sync');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [newSubmissionToast, setNewSubmissionToast] = useState<{
    name: string;
    count: number;
  } | null>(null);

  const prevCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  const isMutatingRef = useRef(false);
  isMutatingRef.current = isDeletingStudent || isClearingAll;

  const loadData = useCallback(async (silent = false) => {
    if (isFetchingRef.current || isMutatingRef.current) return;
    isFetchingRef.current = true;
    if (silent) setIsSilentRefreshing(true);
    else setIsLoading(true);
    setSyncWarning(null);

    try {
      const data = await spreadsheetService.fetchExamResults();
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const diff = data.length - prevCountRef.current;
        setNewSubmissionToast({ name: data[0]?.nama || 'Siswa', count: diff });
        setTimeout(() => setNewSubmissionToast(null), 5000);
      }
      prevCountRef.current = data.length;
      setResults(data);
      setLastSyncedAt(new Date().toLocaleTimeString('id-ID'));
    } catch {
      if (!silent) {
        const local = spreadsheetService.getLocalExamResults();
        setResults(local);
        prevCountRef.current = local.length;
        setSyncWarning(
          'Sinkronisasi Google Spreadsheet belum aktif. Data hasil tes dimuat dari memori lokal perangkat ini.'
        );
      }
    } finally {
      setIsLoading(false);
      setIsSilentRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  const handleToggleLiveSync = () => {
    setLiveSync((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sd3_teacher_live_sync', String(next));
      } catch {
        // Ignore
      }
      if (next) loadData(true);
      return next;
    });
  };

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      if (liveSync && !document.hidden && !isMutatingRef.current) {
        loadData(true);
      }
    }, 10000);

    const onVis = () => {
      if (document.visibilityState === 'visible' && liveSync) loadData(true);
    };
    const onFocus = () => {
      if (liveSync) loadData(true);
    };

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('sd3_exam_sync_channel');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'NEW_SUBMISSION') {
          loadData(true);
          if (ev.data.studentName) {
            setNewSubmissionToast({ name: ev.data.studentName, count: 1 });
            setTimeout(() => setNewSubmissionToast(null), 5000);
          }
        } else if (ev.data?.type === 'DATA_CLEARED' || ev.data?.type === 'DATA_DELETED') {
          loadData(true);
        }
      };
    }

    const onCustomSubmit = (ev: Event) => {
      const detail = (ev as CustomEvent<ExamResult>).detail;
      loadData(true);
      if (detail?.nama) {
        setNewSubmissionToast({ name: detail.nama, count: 1 });
        setTimeout(() => setNewSubmissionToast(null), 5000);
      }
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('sd3_exam_submitted', onCustomSubmit);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('sd3_exam_submitted', onCustomSubmit);
      bc?.close();
    };
  }, [liveSync, loadData]);

  const handleConfirmDeleteStudent = async () => {
    if (!deleteTarget) return;
    setIsDeletingStudent(true);
    try {
      await spreadsheetService.deleteExamResult(
        deleteTarget.timestamp,
        deleteTarget.nama,
        deleteTarget.mataPelajaran
      );
      setResults((prev) =>
        prev.filter(
          (item) =>
            item.id !== deleteTarget.id &&
            !(item.timestamp === deleteTarget.timestamp && item.nama === deleteTarget.nama)
        )
      );
    } finally {
      setIsDeletingStudent(false);
      setDeleteTarget(null);
    }
  };

  const handleConfirmClearAll = async () => {
    setIsClearingAll(true);
    try {
      const res = await spreadsheetService.clearAllExamResults(
        subjectFilter !== 'Semua' ? subjectFilter : undefined,
        subjectFilter === 'Semua'
      );
      setResults((prev) =>
        subjectFilter === 'Semua'
          ? []
          : prev.filter(
              (item) =>
                (item.mataPelajaran || APP_CONFIG.MATA_PELAJARAN).toUpperCase() !==
                subjectFilter.toUpperCase()
            )
      );
      setStatusBanner({
        type: 'success',
        message: res.message || 'Data nilai siswa berhasil dibersihkan.',
      });
      setTimeout(() => setStatusBanner(null), 6000);
    } catch {
      if (subjectFilter === 'Semua') setResults([]);
      setStatusBanner({
        type: 'error',
        message:
          'Data lokal dikosongkan. Namun terjadi kendala pada sinkronisasi remote Spreadsheet.',
      });
      setTimeout(() => setStatusBanner(null), 6000);
    } finally {
      setIsClearingAll(false);
      setShowClearAll(false);
    }
  };

  const subjectOptions = useMemo(() => {
    const set = new Set<string>([APP_CONFIG.MATA_PELAJARAN]);
    results.forEach((r) => {
      if (r.mataPelajaran) set.add(r.mataPelajaran.toUpperCase());
    });
    return Array.from(set);
  }, [results]);

  const stats = useMemo(() => {
    const total = results.length;
    if (total === 0) return { total: 0, lulus: 0, belumLulus: 0, rataRata: 0 };
    const lulus = results.filter(
      (r) => r.status === 'Lulus' || r.nilai >= APP_CONFIG.KKTP
    ).length;
    const belumLulus = total - lulus;
    const sum = results.reduce((acc, r) => acc + (Number(r.nilai) || 0), 0);
    const rataRata = Math.round((sum / total) * 10) / 10;
    return { total, lulus, belumLulus, rataRata };
  }, [results]);

  const filteredResults = useMemo(() => {
    let list = [...results];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.nama.toLowerCase().includes(q));
    }
    if (subjectFilter !== 'Semua') {
      list = list.filter(
        (r) =>
          (r.mataPelajaran || APP_CONFIG.MATA_PELAJARAN).toUpperCase() ===
          subjectFilter.toUpperCase()
      );
    }
    if (classFilter !== 'Semua') {
      list = list.filter((r) => (r.kelas || APP_CONFIG.KELAS) === classFilter);
    }
    if (statusFilter !== 'Semua') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (dateFilter.trim()) {
      list = list.filter((r) => r.timestamp.includes(dateFilter.trim()));
    }

    list.sort((a, b) => {
      let valA: string | number = a[sortField] ?? '';
      let valB: string | number = b[sortField] ?? '';
      if (sortField === 'nilai' || sortField === 'noAbsen') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [
    results,
    searchQuery,
    subjectFilter,
    classFilter,
    statusFilter,
    dateFilter,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Panel Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">
              Dashboard Panel Guru · Kelas {APP_CONFIG.KELAS} · {APP_CONFIG.MATA_PELAJARAN}
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rekapitulasi &amp; Pengelolaan Tes Sumatif
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-open-gas-settings"
              type="button"
              onClick={() => setShowGasSettings(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan URL Spreadsheet</span>
            </button>
            <button
              id="btn-open-gas-guide"
              type="button"
              onClick={() => setShowGasGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-300 cursor-pointer whitespace-nowrap"
            >
              <FileCode2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Panduan Skrip GAS</span>
            </button>
            <button
              id="btn-export-kisi-kisi-pdf"
              type="button"
              onClick={() => downloadKisiKisiPdf(questions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 cursor-pointer whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kisi-Kisi (PDF)</span>
            </button>
            <button
              id="btn-export-rekap-pdf"
              type="button"
              onClick={() => downloadRekapPdf(filteredResults.length > 0 ? filteredResults : results)}
              disabled={results.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Rekap (PDF)</span>
            </button>
            <button
              id="btn-export-rekap-xlsx"
              type="button"
              onClick={() => downloadRekapExcel(results, questions)}
              disabled={results.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-300 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Rekap (Excel .xlsx)</span>
            </button>
            <button
              id="btn-delete-all-results-header"
              type="button"
              onClick={() => setShowClearAll(true)}
              disabled={results.length === 0 || isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Data</span>
            </button>
          </div>
        </div>

        {/* Teacher Settings & Sync Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowReview}
                onChange={(e) => onToggleAllowReview(e.target.checked)}
                className="w-4 h-4 text-blue-700 rounded border-slate-300 cursor-pointer"
              />
              <span className="font-semibold text-slate-700">
                Izinkan siswa melihat pembahasan setelah selesai
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictSecurityMode}
                onChange={(e) => onToggleStrictSecurityMode(e.target.checked)}
                className="w-4 h-4 text-blue-700 rounded border-slate-300 cursor-pointer"
              />
              <span className="font-semibold text-slate-700">
                Mode Keamanan Ketat (Layar Penuh &amp; Anti-Pindah Tab)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-live-sync"
              type="button"
              onClick={handleToggleLiveSync}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-xl border transition-colors cursor-pointer ${
                liveSync
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <span>{liveSync ? 'Sinkronisasi Otomatis: Aktif' : 'Sinkronisasi Otomatis: Dijeda'}</span>
            </button>
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={isLoading || isSilentRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title={lastSyncedAt ? `Terakhir dimuat: ${lastSyncedAt}` : 'Muat ulang data'}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading || isSilentRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Total Peserta Ujian</span>
            <span className="text-2xl font-black text-slate-900 block tabular-nums">
              {stats.total} Siswa
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">
              Tuntas (Nilai &ge; {APP_CONFIG.KKTP})
            </span>
            <span className="text-2xl font-black text-emerald-700 block tabular-nums">
              {stats.lulus} Siswa
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Perlu Remedial</span>
            <span className="text-2xl font-black text-amber-700 block tabular-nums">
              {stats.belumLulus} Siswa
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Rata-Rata Kelas</span>
            <span className="text-2xl font-black text-slate-900 block tabular-nums">
              {stats.rataRata}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div>
        <div className="flex items-center gap-6 px-4 pt-3 bg-white rounded-t-2xl border border-b-0 border-slate-200 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'rekap'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Rekap Nilai Siswa ({results.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analisis')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'analisis'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analisis Butir Soal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kisi-kisi')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'kisi-kisi'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kisi-Kisi Penulisan Soal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('soal')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'soal'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal &amp; Pembahasan ({questions.length})</span>
          </button>
        </div>

        {/* Tab 1: Rekap Nilai */}
        {activeTab === 'rekap' && (
          <div className="bg-white rounded-b-2xl p-6 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nama siswa..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-blue-50/50 text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
              >
                <option value="Semua">Semua Mapel</option>
                {subjectOptions.map((subj) => (
                  <option key={subj} value={subj}>
                    Mapel: {subj}
                  </option>
                ))}
              </select>

              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Kelas</option>
                <option value="VI">Kelas VI</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              >
                <option value="Semua">Semua Status</option>
                <option value="Lulus">Lulus</option>
                <option value="Belum Lulus">Belum Lulus</option>
              </select>

              <input
                type="text"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter tanggal (cth: 2026)..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {syncWarning && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{syncWarning}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowGasSettings(true)}
                    className="px-3 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer text-xs"
                  >
                    Atur URL Spreadsheet
                  </button>
                  <button
                    type="button"
                    onClick={() => loadData(false)}
                    className="px-3 py-1.5 bg-amber-200 text-amber-900 font-bold rounded-lg hover:bg-amber-300 transition-colors cursor-pointer text-xs"
                  >
                    Muat Ulang
                  </button>
                </div>
              </div>
            )}

            {statusBanner && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  statusBanner.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <span>{statusBanner.message}</span>
                <button
                  type="button"
                  onClick={() => setStatusBanner(null)}
                  className="font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">No</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                      onClick={() => toggleSort('timestamp')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Timestamp</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors"
                      onClick={() => toggleSort('nama')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Siswa</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3">Mata Pelajaran</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors text-center"
                      onClick={() => toggleSort('noAbsen')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Absen</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center text-emerald-700">Benar</th>
                    <th className="py-3 px-3 text-center text-rose-700">Salah</th>
                    <th
                      className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 transition-colors text-center"
                      onClick={() => toggleSort('nilai')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Nilai</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Integritas</th>
                    <th className="py-3 px-3 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-700" />
                          <span>Mengambil data dari Google Spreadsheet...</span>
                        </div>
                      </td>
                    </tr>
                  ) : pagedResults.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-500">
                        <div className="max-w-xs mx-auto space-y-1">
                          <p className="font-semibold text-slate-700">
                            {results.length === 0
                              ? 'Belum ada data nilai di Google Spreadsheet.'
                              : 'Tidak ada data siswa yang cocok dengan filter pencarian.'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {results.length === 0
                              ? 'Data dari siswa akan otomatis tercatat di sini setelah pengerjaan tes selesai.'
                              : 'Silakan sesuaikan kata kunci pencarian atau filter Anda.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pagedResults.map((res, idx) => {
                      const rowNum = (currentPage - 1) * pageSize + idx + 1;
                      const isLulus = res.status === 'Lulus' || res.nilai >= APP_CONFIG.KKTP;
                      return (
                        <tr
                          key={res.id || `${res.timestamp}-${res.nama}-${idx}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-3 text-center font-mono text-slate-500 tabular-nums">
                            {rowNum}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap tabular-nums">
                            {res.timestamp}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{res.nama}</td>
                          <td className="py-3 px-3 font-semibold text-blue-700">
                            {res.mataPelajaran || APP_CONFIG.MATA_PELAJARAN}
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {res.kelas || APP_CONFIG.KELAS}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-700 font-semibold tabular-nums">
                            {res.noAbsen}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-700 tabular-nums">
                            {res.benar}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-rose-700 tabular-nums">
                            {res.salah}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-black text-sm tabular-nums ${
                                isLulus ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {res.nilai}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold">
                            <span className={isLulus ? 'text-emerald-700' : 'text-amber-700'}>
                              {res.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {res.submissionReason === 'violation_limit' ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>3x Auto-Submit</span>
                              </span>
                            ) : res.violationsCount && res.violationsCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-bold tabular-nums">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{res.violationsCount}x Peringatan</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Tertib</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                id={`btn-detail-${idx}`}
                                type="button"
                                onClick={() => setDetailResult(res)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Lihat Detail Hasil"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                id={`btn-download-pdf-${idx}`}
                                type="button"
                                onClick={() => downloadResultPdf(res)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Download PDF Lembar Hasil"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                id={`btn-delete-${idx}`}
                                type="button"
                                onClick={() => setDeleteTarget(res)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Data Siswa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-xs text-slate-600">
                <span className="tabular-nums">
                  Menampilkan {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filteredResults.length)} dari{' '}
                  {filteredResults.length} data
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-bold text-slate-800 tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Analisis Butir Soal */}
        {activeTab === 'analisis' && (
          <div className="bg-white rounded-b-2xl p-6 border border-slate-200">
            <ItemAnalysisTab results={results} questions={questions} />
          </div>
        )}

        {/* Tab 3: Kisi-Kisi Penulisan Soal */}
        {activeTab === 'kisi-kisi' && (
          <div className="bg-white rounded-b-2xl p-6 border border-slate-200">
            <KisiKisiTab questions={questions} />
          </div>
        )}

        {/* Tab 4: Bank Soal */}
        {activeTab === 'soal' && (
          <div className="bg-white rounded-b-2xl p-6 border border-slate-200">
            <BankSoalTab
              questions={questions}
              onEditQuestion={(q) => setEditingQuestion(q)}
              onRequestResetQuestions={() => setShowResetQuestionsConfirm(true)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <GasSettingsModal
        isOpen={showGasSettings}
        onClose={() => setShowGasSettings(false)}
        onOpenGasGuide={() => setShowGasGuide(true)}
        onDataSynced={() => loadData(false)}
      />

      <GasGuideModal isOpen={showGasGuide} onClose={() => setShowGasGuide(false)} />

      <StudentDetailModal
        result={detailResult}
        isOpen={Boolean(detailResult)}
        onClose={() => setDetailResult(null)}
      />

      <ConfirmDeleteStudentModal
        target={deleteTarget}
        isDeleting={isDeletingStudent}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteStudent}
      />

      <ClearAllModal
        isOpen={showClearAll}
        totalCount={results.length}
        isDeleting={isClearingAll}
        onClose={() => setShowClearAll(false)}
        onConfirm={handleConfirmClearAll}
      />

      <EditQuestionModal
        key={editingQuestion?.id || 'edit-none'}
        question={editingQuestion}
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        onSave={(updated) => {
          onUpdateQuestion(updated);
          setEditingQuestion(null);
        }}
      />

      <ConfirmResetQuestionsModal
        isOpen={showResetQuestionsConfirm}
        onClose={() => setShowResetQuestionsConfirm(false)}
        onConfirm={onResetDefaultQuestions}
      />

      {/* Live submission toast */}
      {newSubmissionToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-extrabold">
                Jawaban Siswa Masuk (+{newSubmissionToast.count} Data Baru)
              </p>
              <p className="text-xs opacity-90 truncate">
                <span className="font-bold underline">{newSubmissionToast.name}</span> baru saja
                menyelesaikan ujian. Rekap otomatis diperbarui.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNewSubmissionToast(null)}
              className="text-white hover:text-emerald-100 font-bold cursor-pointer px-1"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
