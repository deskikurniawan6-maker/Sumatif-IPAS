import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  CloudUpload,
  Copy,
  Download,
  FileCode2,
  Link as LinkIcon,
  PenLine,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { APP_CONFIG, GAS_SCRIPT_TEMPLATE } from '../config';
import { spreadsheetService } from '../services/spreadsheetService';
import {
  CategoryStatement,
  DifficultyLevel,
  ExamResult,
  ItemResponse,
  Question,
  QuestionOption,
} from '../types';
import { buildStudentDiagnosis } from '../utils/analysis';
import { downloadResultPdf } from '../utils/exportPdf';

export function GasGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GAS_SCRIPT_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Panduan Google Apps Script Multi-Mapel
              </h3>
              <p className="text-xs text-slate-500">
                Sinkronisasi otomatis ke Google Spreadsheet sekolah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1.5 leading-relaxed">
            <p className="font-bold">Langkah Pemasangan (2 Menit):</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Buat Spreadsheet baru di{' '}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold text-blue-700"
                >
                  sheets.new
                </a>
                .
              </li>
              <li>
                Buka menu <strong>Ekstensi (Extensions)</strong> &rarr;{' '}
                <strong>Apps Script</strong>.
              </li>
              <li>Hapus kode bawaan lalu tempel seluruh skrip di bawah ini dan klik Simpan.</li>
              <li>
                Klik <strong>Terapkan (Deploy)</strong> &rarr;{' '}
                <strong>Penerapan Baru (New Deployment)</strong> &rarr; pilih{' '}
                <strong>Aplikasi Web (Web App)</strong>.
              </li>
              <li>
                Atur <em>Who has access</em> menjadi <strong>Siapa saja (Anyone)</strong>, lalu
                salin URL <code>/exec</code> ke Pengaturan URL Spreadsheet.
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Kode Skrip Google Apps Script Multi-Mapel Terbaru:
              </span>
              <button
                id="btn-copy-gas-script"
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Skrip'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 leading-normal border border-slate-800">
              {GAS_SCRIPT_TEMPLATE}
            </pre>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-slate-500">
            Mendukung Asesmen Sumatif Kurikulum Merdeka.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function GasSettingsModal({
  isOpen,
  onClose,
  onOpenGasGuide,
  onDataSynced,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenGasGuide: () => void;
  onDataSynced: () => void;
}) {
  const [urlInput, setUrlInput] = useState(() => spreadsheetService.getGasUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const localCount = spreadsheetService.getLocalExamResults().length;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setSavedNotice(false);
    const res = await spreadsheetService.testGasConnection(urlInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    spreadsheetService.setGasUrl(urlInput.trim());
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onDataSynced();
    }, 1500);
  };

  const handleReset = () => {
    spreadsheetService.resetGasUrl();
    setUrlInput(APP_CONFIG.GOOGLE_APPS_SCRIPT_URL);
    setTestResult(null);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onDataSynced();
    }, 1500);
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMsg(null);
    const res = await spreadsheetService.syncAllLocalToCloud();
    setSyncing(false);
    if (res.total === 0) {
      setSyncMsg('Tidak ada data hasil tes offline yang perlu disinkronkan.');
    } else {
      setSyncMsg(
        `Berhasil menyinkronkan ${res.success} dari ${res.total} data siswa ke Google Spreadsheet!`
      );
      onDataSynced();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Pengaturan Koneksi Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan aplikasi dengan Google Spreadsheet untuk sinkronisasi nilai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Penyimpanan Aman (Zero Data Loss):</span>
            Setiap jawaban dan nilai siswa selalu tersimpan secara otomatis di memori browser ini (
            <span className="tabular-nums font-semibold">{localCount}</span> data tersimpan). Ujian
            siswa tetap berjalan normal meskipun koneksi ke Google Spreadsheet sedang gangguan.
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            URL Google Apps Script Web App (Berakhiran /exec):
          </label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setTestResult(null);
            }}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <p className="text-xs text-slate-500">
            Dapatkan URL ini setelah menerapkan (Deploy) skrip di spreadsheet Anda dengan akses
            &ldquo;Anyone&rdquo;.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !urlInput.trim()}
            className="px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!urlInput.trim()}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan URL</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            title="Kembalikan ke URL default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenGasGuide();
            }}
            className="ml-auto px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Buka Panduan Skrip</span>
          </button>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>URL Google Apps Script berhasil disimpan!</span>
          </div>
        )}

        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}</span>
            </div>
            <p className="text-xs leading-relaxed pl-5">{testResult.message}</p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block tabular-nums">
                Sinkronisasi Data Siswa ({localCount} Tersimpan di Perangkat)
              </span>
              <span className="text-xs text-slate-500">
                Unggah semua nilai siswa lokal ke spreadsheet
              </span>
            </div>
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={syncing || localCount === 0}
              className="px-3 py-2 text-xs font-bold text-slate-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <CloudUpload className="w-4 h-4 text-emerald-700" />
              <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>
          {syncMsg && (
            <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
              {syncMsg}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudentDetailModal({
  result,
  isOpen,
  onClose,
}: {
  result: ExamResult | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !result) return null;

  const isLulus = result.status === 'Lulus' || result.nilai >= APP_CONFIG.KKTP;
  const violations = result.violationsCount || 0;
  const isLimit = result.submissionReason === 'violation_limit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{result.nama}</h3>
              <p className="text-xs text-slate-500 tabular-nums">
                Absen {result.noAbsen} · Kelas {result.kelas || APP_CONFIG.KELAS}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Nilai Tes Sumatif</span>
              <span className="text-xs text-slate-500 tabular-nums">
                KKTP: {APP_CONFIG.KKTP}
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-3xl font-black block tabular-nums ${
                  isLulus ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {result.nilai}
              </span>
              <span
                className={`text-xs font-bold ${
                  isLulus ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block">Jawaban Benar</span>
              <span className="font-bold text-emerald-900 text-base tabular-nums">
                {result.benar} Soal
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-rose-700 block">Jawaban Salah</span>
              <span className="font-bold text-rose-900 text-base tabular-nums">
                {result.salah} Soal
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Pengerjaan:</span>
              <span className="font-medium text-slate-800 tabular-nums">{result.timestamp}</span>
            </div>
            {result.tglLahir && (
              <div className="flex justify-between">
                <span className="text-slate-500">Tanggal Lahir:</span>
                <span className="font-medium text-slate-800">{result.tglLahir}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Integritas Ujian:</span>
              <span
                className={`font-bold ${
                  isLimit ? 'text-rose-600' : violations > 0 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                {isLimit
                  ? '3x Auto-Submit'
                  : violations > 0
                    ? `${violations}x Peringatan`
                    : 'Tertib (0 Pelanggaran)'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => downloadResultPdf(result)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF Hasil</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function StudentDiagnosisModal({
  result,
  questions,
  responses,
  isOpen,
  onClose,
}: {
  result: ExamResult | null;
  questions: Question[];
  responses: Record<number, ItemResponse>;
  isOpen: boolean;
  onClose: () => void;
}) {
  const diagnosis = useMemo(() => {
    if (!result) return null;
    return buildStudentDiagnosis(result, questions, responses);
  }, [result, questions, responses]);

  if (!isOpen || !diagnosis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                diagnosis.isLulus
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {diagnosis.isLulus ? (
                <Award className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Diagnosis Remedial &amp; Pengayaan: {diagnosis.result.nama}
              </h3>
              <p className="text-xs text-slate-500 tabular-nums">
                Absen {diagnosis.result.noAbsen} · Nilai Akhir: {diagnosis.nilaiAkhir} (
                {diagnosis.isLulus ? 'Tuntas' : 'Perlu Remedial'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block">Benar Penuh</span>
              <span className="text-lg font-black text-emerald-900 tabular-nums">
                {diagnosis.correctQuestions.length} Soal
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-amber-700 block">Benar Sebagian</span>
              <span className="text-lg font-black text-amber-900 tabular-nums">
                {diagnosis.partialQuestions.length} Soal
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-rose-700 block">Perlu Perbaikan</span>
              <span className="text-lg font-black text-rose-900 tabular-nums">
                {diagnosis.wrongQuestions.length} Soal
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
            <h4 className="font-bold text-blue-950">Rekomendasi Tindak Lanjut Guru:</h4>
            <ul className="space-y-1.5 text-blue-900 list-disc list-inside leading-relaxed">
              {diagnosis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          {diagnosis.weakTopics.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Pemetaan Topik yang Belum Dikuasai:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {diagnosis.weakTopics.map((wt) => (
                  <div
                    key={wt.topic}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="font-bold text-slate-900">{wt.topic}</div>
                    <div className="text-slate-500">
                      Elemen: {wt.elemen} · Soal No.{' '}
                      <span className="font-semibold text-rose-700 tabular-nums">
                        {wt.wrongQuestions.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditQuestionModal({
  question,
  isOpen,
  onClose,
  onSave,
}: {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Question) => void;
}) {
  const [text, setText] = useState(question?.text || '');
  const [topic, setTopic] = useState(question?.topic || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(question?.difficulty || 'Sedang');
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options ? JSON.parse(JSON.stringify(question.options)) : []
  );
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>(
    question?.correctAnswer || (question?.type === 'pgk' ? [] : 'A')
  );
  const [statements, setStatements] = useState<CategoryStatement[]>(
    question?.statements ? JSON.parse(JSON.stringify(question.statements)) : []
  );

  if (!isOpen || !question) return null;

  const updateOptionText = (idx: number, val: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === idx ? { ...opt, text: val } : opt)));
  };

  const togglePgkAnswer = (id: string) => {
    const arr = Array.isArray(correctAnswer) ? [...correctAnswer] : [];
    setCorrectAnswer(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...question,
      text: text.trim(),
      topic: topic.trim(),
      difficulty,
      explanation: explanation.trim(),
      options: question.type !== 'pgk_kategori' ? options : undefined,
      statements: question.type === 'pgk_kategori' ? statements : undefined,
      correctAnswer: question.type !== 'pgk_kategori' ? correctAnswer : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <PenLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Edit Soal Nomor {question.id}
              </h3>
              <p className="text-xs text-slate-500">
                Tipe: {question.type.toUpperCase()} · {question.topic}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Topik / Materi Soal</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Sukar">Sukar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Teks Butir Soal</label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              required
            />
          </div>

          {question.type === 'pg' && (
            <div className="space-y-2.5">
              <label className="block font-bold text-slate-700">
                Pilihan Jawaban &amp; Kunci Jawaban
              </label>
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-opt-pg"
                    checked={correctAnswer === opt.id}
                    onChange={() => setCorrectAnswer(opt.id)}
                    className="w-4 h-4 text-blue-700 cursor-pointer"
                  />
                  <span className="w-6 font-bold text-slate-700">{opt.id}.</span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOptionText(idx, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {question.type === 'pgk' && (
            <div className="space-y-2.5">
              <label className="block font-bold text-slate-700">
                Pilihan Jawaban &amp; Kunci Jawaban (Centang yang Benar)
              </label>
              {options.map((opt, idx) => {
                const checked = (Array.isArray(correctAnswer) ? correctAnswer : []).includes(
                  opt.id
                );
                return (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePgkAnswer(opt.id)}
                      className="w-4 h-4 text-emerald-600 cursor-pointer"
                    />
                    <span className="w-6 font-bold text-slate-700">{opt.id}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionText(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                );
              })}
            </div>
          )}

          {question.type === 'pgk_kategori' && (
            <div className="space-y-2.5">
              <label className="block font-bold text-slate-700">
                Pernyataan &amp; Kunci Benar / Salah
              </label>
              {statements.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
                >
                  <input
                    type="text"
                    value={st.text}
                    onChange={(e) =>
                      setStatements((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, text: e.target.value } : item))
                      )
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setStatements((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, correctAnswer: true } : item
                          )
                        )
                      }
                      className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                        st.correctAnswer
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Benar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStatements((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, correctAnswer: false } : item
                          )
                        )
                      }
                      className={`px-3 py-1 rounded-lg font-bold border cursor-pointer ${
                        !st.correctAnswer
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Salah
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pembahasan Soal</label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 leading-relaxed focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClearAllModal({
  isOpen,
  totalCount,
  isDeleting,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  totalCount: number;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Hapus Seluruh Data Nilai?</h3>
            <p className="text-xs text-slate-500">
              Tindakan ini menghapus data di perangkat dan Google Spreadsheet.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
          Sebanyak <strong className="tabular-nums">{totalCount} data siswa</strong> akan dihapus
          permanen (header tabel Google Spreadsheet tetap dipertahankan).
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Ketik kata <span className="text-rose-600 font-black tracking-wide">HAPUS</span> untuk
            konfirmasi:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Ketik HAPUS di sini..."
            autoFocus
            className="w-full px-3 py-2 text-xs font-bold uppercase rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none placeholder:normal-case placeholder:font-normal"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              setConfirmText('');
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting || confirmText.trim().toUpperCase() !== 'HAPUS'}
            onClick={() => {
              onConfirm();
              setConfirmText('');
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {isDeleting ? 'Menghapus...' : `Ya, Hapus Semua (${totalCount})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDeleteStudentModal({
  target,
  isDeleting,
  onClose,
  onConfirm,
}: {
  target: ExamResult | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Hapus Data Siswa?</h3>
            <p className="text-xs text-slate-500">Data akan dihapus dari lokal dan spreadsheet.</p>
          </div>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          Anda yakin ingin menghapus hasil tes milik <strong>{target.nama}</strong> (Absen{' '}
          <span className="tabular-nums">{target.noAbsen}</span>, Nilai{' '}
          <span className="tabular-nums">{target.nilai}</span>)?
        </p>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmResetQuestionsModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kembalikan Bank Soal Standar?
            </h3>
            <p className="text-xs text-slate-500">
              Seluruh perubahan edit soal akan dikembalikan ke 50 butir asli.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl cursor-pointer"
          >
            Ya, Reset Soal
          </button>
        </div>
      </div>
    </div>
  );
}
