import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { ExamResult, Question } from '../types';
import { formatAnswerKey } from '../utils/analysis';
import { downloadResultPdf } from '../utils/exportPdf';

interface ResultViewProps {
  result: ExamResult;
  questions: Question[];
  allowReview: boolean;
  onRestart: () => void;
}

export function ResultView({
  result,
  questions,
  allowReview,
  onRestart,
}: ResultViewProps) {
  const isLulus = result.status === 'Lulus' || result.nilai >= APP_CONFIG.KKTP;
  const violationsCount = result.violationsCount || 0;
  const isAutoSubmit = result.submissionReason === 'violation_limit';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs text-center relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-2.5 ${
            isAutoSubmit ? 'bg-rose-600' : isLulus ? 'bg-emerald-600' : 'bg-amber-500'
          }`}
        />

        <div className="inline-flex items-center justify-center mt-2 mb-4">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isAutoSubmit
                ? 'bg-rose-100 text-rose-600'
                : isLulus
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-amber-100 text-amber-600'
            }`}
          >
            {isAutoSubmit ? (
              <ShieldAlert className="w-10 h-10" />
            ) : isLulus ? (
              <Award className="w-10 h-10" />
            ) : (
              <AlertTriangle className="w-10 h-10" />
            )}
          </div>
        </div>

        <p className="text-xs font-semibold text-blue-700 mb-1">
          {APP_CONFIG.SEKOLAH} · Kelas {APP_CONFIG.KELAS}
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Laporan Hasil Tes Sumatif
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {APP_CONFIG.MATA_PELAJARAN} ({APP_CONFIG.MATERI})
        </p>

        {isAutoSubmit ? (
          <div className="my-6 max-w-xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-300 text-left space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Ujian Dihentikan Otomatis oleh Sistem (Auto-Submit)</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              {result.terminationNote ||
                'Siswa terdeteksi meninggalkan halaman atau berpindah tab sebanyak 3 kali (batas maksimum toleransi tercapai). Jawaban yang telah terisi telah dikunci dan diserahkan secara otomatis.'}
            </p>
            {result.violationLogs && result.violationLogs.length > 0 && (
              <div className="pt-2 border-t border-rose-200 text-xs text-rose-800 space-y-1">
                <span className="font-bold block">Riwayat Waktu Insiden:</span>
                {result.violationLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold">{idx + 1}.</span>
                    <span>{log.timestamp}</span>
                    <span className="text-rose-700">- {log.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : violationsCount > 0 ? (
          <div className="my-5 max-w-xl mx-auto p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Catatan Integritas Ujian:</span>
              <span>
                Tercatat <strong>{violationsCount} kali peringatan</strong> berpindah tab/aplikasi
                selama pengerjaan soal berlangsung.
              </span>
            </div>
          </div>
        ) : null}

        {/* Score Box */}
        <div className="my-6 max-w-sm mx-auto p-6 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold tracking-wide text-slate-500 mb-1">
            Nilai Akhir Ujian
          </p>
          <div
            className={`text-5xl sm:text-6xl font-black my-2 tabular-nums ${
              isLulus ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {result.nilai}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-extrabold">
            {isLulus ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>LULUS (Mencapai KKTP)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                <span>BELUM LULUS (Perlu Remedial)</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 tabular-nums">
            Standar Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):{' '}
            <span className="font-bold text-slate-700">{APP_CONFIG.KKTP}</span>
          </p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8 text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Nama Siswa</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm truncate block mt-0.5">
              {result.nama}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Nomor Absen</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm block mt-0.5 tabular-nums">
              {result.noAbsen}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-xs text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Jawaban Benar</span>
            </span>
            <span className="font-extrabold text-emerald-800 text-base sm:text-lg block mt-0.5 tabular-nums">
              {result.benar} Soal
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-xs text-rose-700 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Jawaban Salah</span>
            </span>
            <span className="font-extrabold text-rose-800 text-base sm:text-lg block mt-0.5 tabular-nums">
              {result.salah} Soal
            </span>
          </div>
        </div>

        {/* Spreadsheet Sync Note */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs max-w-2xl mx-auto mb-8 text-left flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-blue-950">
              Data Anda telah tersimpan dan tersinkronisasi ke Google Spreadsheet sekolah.
            </p>
            <p className="mt-0.5 text-blue-800">
              Anda dapat mengunduh lembar hasil tes resmi dalam bentuk PDF di bawah ini. Lembar
              ini memuat kolom tanda tangan resmi Guru Kelas VI ({APP_CONFIG.GURU}) dan Orang
              Tua/Wali Murid.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="btn-download-result-pdf"
            type="button"
            onClick={() => downloadResultPdf(result)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-700 hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Lembar Hasil (PDF)</span>
          </button>
          <button
            id="btn-restart-exam"
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Tes Siswa Lain</span>
          </button>
        </div>

        {/* Optional Review Section */}
        {allowReview && (
          <div className="mt-10 pt-8 border-t border-slate-200 text-left max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-700" />
                <span>Pembahasan & Kunci Jawaban Soal</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700">
                Pembahasan Diaktifkan Guru
              </span>
            </div>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-slate-700">
                    <span className="tabular-nums">
                      Soal #{idx + 1} · {q.topic}
                    </span>
                    <span className="text-blue-700">Kunci: {formatAnswerKey(q)}</span>
                  </div>
                  {q.imageSvg && (
                    <div
                      className="p-2 rounded-lg bg-white border border-slate-200 flex justify-center overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: q.imageSvg }}
                    />
                  )}
                  <p className="text-slate-800">{q.text}</p>
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-700">
                    <span className="font-bold text-blue-900 block mb-0.5">Pembahasan:</span>
                    <p className="whitespace-pre-line">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
