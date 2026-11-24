import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  PenLine,
  RotateCcw,
  Search,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import { ExamResult, Question } from '../types';
import {
  buildKisiKisiSummary,
  computeItemAnalysis,
  formatAnswerKey,
  getStudentRowKey,
} from '../utils/analysis';
import { downloadItemAnalysisExcel } from '../utils/exportExcel';
import {
  downloadItemAnalysisPdf,
  downloadKisiKisiPdf,
  downloadQuestionsPdf,
} from '../utils/exportPdf';
import { StudentDiagnosisModal } from './TeacherModals';

export function ItemAnalysisTab({
  results,
  questions,
}: {
  results: ExamResult[];
  questions: Question[];
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tuntas' | 'Remedial'>('Semua');
  const [hoveredCol, setHoveredCol] = useState<{
    qNum: number;
    topic: string;
    elemen: string;
    kunci: string;
  } | null>(null);
  const [diagnosisTarget, setDiagnosisTarget] = useState<ExamResult | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { itemStats, allResponses } = useMemo(
    () => computeItemAnalysis(results, questions),
    [results, questions]
  );

  const summary = useMemo(() => {
    const avgKetercapaian =
      itemStats.length > 0
        ? Math.round(
            itemStats.reduce((s, item) => s + item.persentaseKetercapaian, 0) / itemStats.length
          )
        : 0;
    const mudahCount = itemStats.filter((s) => s.klasifikasiKesukaran === 'Mudah').length;
    const sedangCount = itemStats.filter((s) => s.klasifikasiKesukaran === 'Sedang').length;
    const sukarCount = itemStats.filter((s) => s.klasifikasiKesukaran === 'Sukar').length;
    const sorted = [...itemStats].sort(
      (a, b) => a.persentaseKetercapaian - b.persentaseKetercapaian
    );
    return {
      avgKetercapaian,
      mudahCount,
      sedangCount,
      sukarCount,
      hardest: sorted[0] || null,
      easiest: sorted[sorted.length - 1] || null,
    };
  }, [itemStats]);

  const filteredStudents = useMemo(() => {
    return results.filter((res) => {
      const q = search.trim().toLowerCase();
      const matchQuery =
        !q ||
        res.nama.toLowerCase().includes(q) ||
        String(res.noAbsen).toLowerCase().includes(q);
      const isLulus = res.status === 'Lulus' || res.nilai >= APP_CONFIG.KKTP;
      const matchFilter =
        statusFilter === 'Semua' ||
        (statusFilter === 'Tuntas' && isLulus) ||
        (statusFilter === 'Remedial' && !isLulus);
      return matchQuery && matchFilter;
    });
  }, [results, search, statusFilter]);

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      downloadItemAnalysisPdf(results, questions);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
            Matriks Analisis Butir Soal &amp; Respon Siswa
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Evaluasi tingkat kesukaran empiris, daya pembeda (D), dan pemetaan remedial per siswa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="btn-export-matriks-xlsx"
            type="button"
            onClick={() =>
              downloadItemAnalysisExcel(results, questions, itemStats, allResponses)
            }
            disabled={results.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Matriks (Excel .xlsx)</span>
          </button>
          <button
            id="btn-download-analisis-pdf"
            type="button"
            onClick={handleExportPdf}
            disabled={results.length === 0 || isExportingPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-700" />
            <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Unduh Laporan (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Rata-rata Ketercapaian</span>
            <span className="text-2xl font-black text-slate-900 block tabular-nums">
              {summary.avgKetercapaian}%
            </span>
            <span className="text-xs text-blue-700 font-medium">Daya serap klasikal</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block">Klasifikasi Butir Soal</span>
            <span className="text-xl font-black text-slate-900 block tabular-nums">
              {summary.mudahCount} <span className="text-xs font-normal text-slate-500">M</span> /{' '}
              {summary.sedangCount} <span className="text-xs font-normal text-slate-500">Sd</span> /{' '}
              {summary.sukarCount} <span className="text-xs font-normal text-slate-500">Sk</span>
            </span>
            <span className="text-xs text-emerald-700 font-medium">Mudah / Sedang / Sukar</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 block">Butir Paling Sukar</span>
            <span className="text-lg font-black text-rose-900 block truncate tabular-nums">
              {summary.hardest
                ? `Soal ${summary.hardest.questionNumber} (${summary.hardest.persentaseKetercapaian}%)`
                : '-'}
            </span>
            <span className="text-xs text-rose-700 font-medium truncate block">
              {summary.hardest?.topic || 'Perlu bimbingan'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-500 block">Butir Paling Dikuasai</span>
            <span className="text-lg font-black text-indigo-900 block truncate tabular-nums">
              {summary.easiest
                ? `Soal ${summary.easiest.questionNumber} (${summary.easiest.persentaseKetercapaian}%)`
                : '-'}
            </span>
            <span className="text-xs text-indigo-700 font-medium truncate block">
              {summary.easiest?.topic || 'Tuntas optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Legend */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau nomor absen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('Semua')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'Semua'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Siswa ({results.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Tuntas')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'Tuntas'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuntas (&ge;{APP_CONFIG.KKTP})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Remedial')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'Remedial'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Remedial
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600 gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700">Keterangan Visual:</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-5 h-5 rounded-md bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">
                1
              </span>
              <span>Benar (1.0)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-5 h-5 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
                &frac12;
              </span>
              <span>Sebagian</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-black text-[10px] flex items-center justify-center">
                0
              </span>
              <span>Salah (0)</span>
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Klik baris siswa untuk membuka <strong>Diagnosis Remedial &amp; Pengayaan</strong>.
          </span>
        </div>
      </div>

      {hoveredCol && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-300 tabular-nums">Soal {hoveredCol.qNum}:</span>
            <span className="font-semibold">{hoveredCol.topic}</span>
            <span className="text-slate-400">· Elemen: {hoveredCol.elemen}</span>
          </div>
          <span className="bg-slate-800 px-2.5 py-0.5 rounded text-slate-200 font-mono font-bold">
            Kunci: {hoveredCol.kunci}
          </span>
        </div>
      )}

      {/* Student x Question Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-[11px]">
                <th className="py-3 px-2 text-center w-10 border-b border-slate-800 sticky left-0 z-20 bg-slate-900">
                  No
                </th>
                <th className="py-3 px-2 text-center w-12 border-b border-slate-800 sticky left-10 z-20 bg-slate-900">
                  Absen
                </th>
                <th className="py-3 px-3 min-w-[170px] border-b border-slate-800 sticky left-[88px] z-20 bg-slate-900">
                  Nama Siswa
                </th>
                {questions.map((q, idx) => (
                  <th
                    key={q.id}
                    onMouseEnter={() =>
                      setHoveredCol({
                        qNum: idx + 1,
                        topic: q.topic,
                        elemen: itemStats[idx]?.elemen || 'Pemahaman IPAS',
                        kunci: itemStats[idx]?.kunciJawaban || '-',
                      })
                    }
                    onMouseLeave={() => setHoveredCol(null)}
                    className="py-3 px-1 text-center min-w-[34px] border-b border-slate-800 font-mono font-bold cursor-help hover:bg-slate-800 tabular-nums"
                    title={`Soal ${idx + 1}: ${q.topic}`}
                  >
                    S{idx + 1}
                  </th>
                ))}
                <th className="py-3 px-3 text-center w-16 border-b border-slate-800">Skor</th>
                <th className="py-3 px-3 text-center w-16 border-b border-slate-800">Nilai</th>
                <th className="py-3 px-3 text-center w-24 border-b border-slate-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={questions.length + 6}
                    className="py-12 text-center text-slate-400"
                  >
                    Belum ada data nilai siswa yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((res, idx) => {
                  const rowKey = getStudentRowKey(res);
                  const respMap = allResponses.get(rowKey) || {};
                  const isLulus = res.status === 'Lulus' || res.nilai >= APP_CONFIG.KKTP;
                  return (
                    <tr
                      key={res.id || `${rowKey}-${idx}`}
                      onClick={() => setDiagnosisTarget(res)}
                      className={`hover:bg-blue-50/70 transition-colors cursor-pointer group ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      }`}
                    >
                      <td className="py-2.5 px-2 text-center text-slate-500 font-bold sticky left-0 z-10 bg-inherit border-r border-slate-100 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700 sticky left-10 z-10 bg-inherit border-r border-slate-100 tabular-nums">
                        {res.noAbsen || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 sticky left-[88px] z-10 bg-inherit border-r border-slate-200 truncate max-w-[200px]">
                        <span className="group-hover:text-blue-700 transition-colors">
                          {res.nama}
                        </span>
                      </td>
                      {questions.map((q) => {
                        const r = respMap[q.id];
                        const isBenar = r?.status === 'benar';
                        const isSebagian = r?.status === 'sebagian';
                        return (
                          <td key={q.id} className="p-1 text-center">
                            {isBenar ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-500 text-white font-black text-[11px]">
                                1
                              </span>
                            ) : isSebagian ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-amber-950 font-black text-[11px]">
                                &frac12;
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-500 text-white font-black text-[11px]">
                                0
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800 tabular-nums">
                        {res.benar ?? 0}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-center font-black tabular-nums ${
                          isLulus ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {res.nilai ?? 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <span className={isLulus ? 'text-emerald-700' : 'text-rose-700'}>
                          {isLulus ? 'Tuntas' : 'Remedial'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Statistics Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Statistik Kualitas Butir Soal Empiris
            </h4>
            <p className="text-xs text-slate-500">
              Persentase ketercapaian, tingkat kesukaran, dan indeks daya pembeda (D)
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-3 text-center w-14">No</th>
                <th className="py-3 px-3">Elemen</th>
                <th className="py-3 px-3">Topik / Materi</th>
                <th className="py-3 px-3 text-center">Level</th>
                <th className="py-3 px-3 text-center">Kunci</th>
                <th className="py-3 px-3 text-center">Benar</th>
                <th className="py-3 px-3 text-center">Ketercapaian</th>
                <th className="py-3 px-3 text-center">Kesukaran</th>
                <th className="py-3 px-3 text-center">Daya Pembeda (D)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itemStats.map((st) => (
                <tr key={st.questionId} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700 tabular-nums">
                    S{st.questionNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-blue-700">{st.elemen}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{st.topic}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                    {st.levelKognitif}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                    {st.kunciJawaban}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-emerald-700 tabular-nums">
                    {st.correctCount}/{st.totalStudents}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 tabular-nums">
                    {st.persentaseKetercapaian}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold">
                    <span
                      className={
                        st.klasifikasiKesukaran === 'Mudah'
                          ? 'text-emerald-700'
                          : st.klasifikasiKesukaran === 'Sedang'
                            ? 'text-blue-700'
                            : 'text-rose-700'
                      }
                    >
                      {st.klasifikasiKesukaran}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center tabular-nums">
                    <span className="font-bold text-slate-900">{st.dayaPembeda}</span>{' '}
                    <span className="text-slate-500">· {st.dayaPembedaLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StudentDiagnosisModal
        result={diagnosisTarget}
        questions={questions}
        responses={diagnosisTarget ? allResponses.get(getStudentRowKey(diagnosisTarget)) || {} : {}}
        isOpen={Boolean(diagnosisTarget)}
        onClose={() => setDiagnosisTarget(null)}
      />
    </div>
  );
}

export function KisiKisiTab({ questions }: { questions: Question[] }) {
  const summary = useMemo(() => buildKisiKisiSummary(questions), [questions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Kisi-Kisi Penulisan Soal Kurikulum Merdeka
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Fase C · Kelas {APP_CONFIG.KELAS} · {APP_CONFIG.MATA_PELAJARAN} ({summary.total} Butir
            Soal)
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadKisiKisiPdf(questions)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Kisi-Kisi Resmi (PDF)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.levelDistribution.map((lvl) => (
          <div
            key={lvl.level}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{lvl.label}</span>
              <span className="text-sm font-black text-blue-700 tabular-nums">
                {lvl.count} Soal ({lvl.percentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-500">{lvl.desc}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-bold">
              <th className="py-3 px-3 text-center w-12">No</th>
              <th className="py-3 px-3 w-28">Elemen / CP</th>
              <th className="py-3 px-3 min-w-[200px]">Tujuan Pembelajaran</th>
              <th className="py-3 px-3 w-40">Materi Pokok</th>
              <th className="py-3 px-3 min-w-[220px]">Indikator Soal</th>
              <th className="py-3 px-3 text-center w-16">Level</th>
              <th className="py-3 px-3 text-center w-24">Kunci / Bobot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {summary.blueprints.map((bp, idx) => (
              <tr key={bp.questionId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                <td className="py-3 px-3 text-center font-bold text-slate-700 tabular-nums">
                  {bp.noSoal}
                </td>
                <td className="py-3 px-3 font-semibold text-blue-700">{bp.elemen}</td>
                <td className="py-3 px-3 text-slate-700 leading-relaxed">
                  {bp.tujuanPembelajaran}
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">{bp.materiPokok}</td>
                <td className="py-3 px-3 text-slate-700 leading-relaxed">{bp.indikatorSoal}</td>
                <td className="py-3 px-3 text-center font-bold text-slate-900">
                  {bp.levelKognitif}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="font-mono font-bold text-slate-900 block">
                    {bp.kunciJawaban}
                  </span>
                  <span className="text-[11px] text-slate-500 tabular-nums">
                    Bobot: {bp.bobotSkor}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BankSoalTab({
  questions,
  onEditQuestion,
  onRequestResetQuestions,
}: {
  questions: Question[];
  onEditQuestion: (q: Question) => void;
  onRequestResetQuestions: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tabular-nums">
            Struktur &amp; Bank Soal {APP_CONFIG.MATA_PELAJARAN} ({questions.length} Butir)
          </h3>
          <p className="text-xs text-slate-500">
            {questions.length} Soal Pilihan Ganda (Lingkup Materi: {APP_CONFIG.MATERI})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRequestResetQuestions}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Soal Standar</span>
          </button>
          <button
            type="button"
            onClick={() => downloadQuestionsPdf(questions)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Naskah Soal (PDF)</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="font-extrabold text-blue-700 tabular-nums">Soal #{idx + 1}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-semibold">{q.topic}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="text-slate-500">{q.difficulty}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-mono font-bold text-emerald-700">
                  Kunci: {formatAnswerKey(q)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEditQuestion(q)}
                className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Edit Soal</span>
              </button>
            </div>

            {q.imageSvg && (
              <div
                className="p-2 rounded-lg bg-white border border-slate-200 flex justify-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: q.imageSvg }}
              />
            )}

            <p className="text-sm text-slate-900 font-medium whitespace-pre-line">{q.text}</p>

            {q.options && q.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`px-3 py-1.5 rounded-lg border ${
                      q.correctAnswer === opt.id ||
                      (Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id))
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="font-bold mr-1.5">{opt.id}.</span>
                    <span>{opt.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-slate-700">
              <span className="font-bold text-blue-900 block mb-0.5">Pembahasan:</span>
              <p className="whitespace-pre-line">{q.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
