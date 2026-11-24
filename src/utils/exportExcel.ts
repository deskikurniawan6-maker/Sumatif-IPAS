import * as XLSX from 'xlsx';
import { APP_CONFIG } from '../config';
import { ExamResult, ItemStat, Question, ItemResponse } from '../types';
import {
  computeItemAnalysis,
  formatAnswerKey,
  formatQuestionTypeLabel,
  getStudentRowKey,
} from './analysis';

function sanitizeSheetName(name: string): string {
  return name.replace(/[\\/?*[\]:]/g, '').slice(0, 31);
}

function buildWorksheet(
  rows: (string | number)[][],
  options: {
    enableAutoFilter?: boolean;
    filterLastRowIndex?: number;
    minWidth?: number;
    maxWidth?: number;
    compactFromColIdx?: number;
    compactCount?: number;
  } = {}
): XLSX.WorkSheet {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const {
    enableAutoFilter = true,
    filterLastRowIndex,
    minWidth = 8,
    maxWidth = 42,
    compactFromColIdx,
    compactCount,
  } = options;

  const colCount = rows.reduce((max, r) => Math.max(max, r.length), 0);
  const cols: XLSX.ColInfo[] = [];

  for (let c = 0; c < colCount; c++) {
    if (
      compactFromColIdx !== undefined &&
      compactCount !== undefined &&
      c >= compactFromColIdx &&
      c < compactFromColIdx + compactCount
    ) {
      cols.push({ wch: 5 });
      continue;
    }

    let longest = minWidth;
    for (let r = 0; r < rows.length; r++) {
      const cell = rows[r]?.[c];
      if (cell !== undefined && cell !== null) {
        longest = Math.max(longest, String(cell).length + 2);
      }
    }
    cols.push({ wch: Math.min(maxWidth, longest) });
  }
  ws['!cols'] = cols;

  if (enableAutoFilter && rows.length > 1 && colCount > 0) {
    const lastRow = filterLastRowIndex !== undefined ? filterLastRowIndex : rows.length - 1;
    ws['!autofilter'] = {
      ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: colCount - 1 } }),
    };
  }

  return ws;
}

function getIntegritySummary(res: ExamResult) {
  const violations = Number(res.violationsCount ?? 0);
  const isLimit = res.submissionReason === 'violation_limit';
  const statusSubmit = isLimit ? 'Auto-Submit (3x Pelanggaran)' : 'Normal';
  const catatan = isLimit
    ? res.terminationNote || 'Dihentikan otomatis karena 3x keluar tab/layar penuh'
    : violations > 0
      ? `${violations}x peringatan berpindah tab`
      : 'Tertib (0 pelanggaran)';
  const logHistory =
    res.violationLogs && res.violationLogs.length > 0
      ? res.violationLogs.map((l) => `${l.timestamp} (${l.reason})`).join('; ')
      : '-';

  return { statusSubmit, catatan, logHistory };
}

function buildRekapSheet(results: ExamResult[]): XLSX.WorkSheet {
  const header = [
    'No',
    'Nomor Absen',
    'Nama Siswa',
    'Kelas',
    'Mata Pelajaran',
    'Tanggal Lahir',
    'Benar',
    'Salah',
    'Nilai Akhir',
    'Status KKTP',
    'Pelanggaran',
    'Status Submit',
    'Waktu Submit',
  ];

  const dataRows = results.map((res, idx) => {
    const isLulus = res.status === 'Lulus' || (res.nilai ?? 0) >= APP_CONFIG.KKTP;
    const { statusSubmit } = getIntegritySummary(res);
    return [
      idx + 1,
      res.noAbsen || '-',
      res.nama || '-',
      res.kelas || APP_CONFIG.KELAS,
      res.mataPelajaran || APP_CONFIG.MATA_PELAJARAN,
      res.tglLahir || '-',
      Number(res.benar ?? 0),
      Number(res.salah ?? 0),
      Number(res.nilai ?? 0),
      isLulus ? 'Lulus' : 'Belum Lulus (Remedial)',
      Number(res.violationsCount ?? 0),
      statusSubmit,
      res.timestamp || '-',
    ];
  });

  return buildWorksheet([header, ...dataRows], { enableAutoFilter: true, minWidth: 10, maxWidth: 40 });
}

function buildSummarySheet(results: ExamResult[]): XLSX.WorkSheet {
  const total = results.length;
  const lulusCount = results.filter(
    (r) => r.status === 'Lulus' || (r.nilai ?? 0) >= APP_CONFIG.KKTP
  ).length;
  const remedialCount = total - lulusCount;
  const passRate = total > 0 ? Math.round((lulusCount / total) * 1000) / 10 : 0;
  const avg =
    total > 0
      ? Math.round((results.reduce((s, r) => s + (Number(r.nilai) || 0), 0) / total) * 100) / 100
      : 0;
  const maxScore = total > 0 ? Math.max(...results.map((r) => Number(r.nilai) || 0)) : 0;
  const minScore = total > 0 ? Math.min(...results.map((r) => Number(r.nilai) || 0)) : 0;
  const autoSubmitCount = results.filter((r) => r.submissionReason === 'violation_limit').length;

  const rows: (string | number)[][] = [
    ['Indikator Statistik', 'Nilai', 'Keterangan'],
    ['Sekolah', APP_CONFIG.SEKOLAH, 'Kabupaten Jembrana'],
    ['Mata Pelajaran', APP_CONFIG.MATA_PELAJARAN, `Kelas ${APP_CONFIG.KELAS}`],
    ['Materi Pokok', APP_CONFIG.MATERI, `KKTP: ${APP_CONFIG.KKTP}`],
    ['Total Peserta Ujian', total, 'Siswa'],
    ['Siswa Tuntas (Lulus KKTP)', lulusCount, `${passRate}% ketuntasan klasikal`],
    ['Siswa Perlu Remedial', remedialCount, `Nilai < ${APP_CONFIG.KKTP}`],
    ['Nilai Rata-Rata Kelas', avg, 'Skala 0 - 100'],
    ['Nilai Tertinggi', maxScore, 'Skala 0 - 100'],
    ['Nilai Terendah', minScore, 'Skala 0 - 100'],
    ['Auto-Submit (Batas Pelanggaran 3x)', autoSubmitCount, 'Dihentikan otomatis sistem'],
  ];

  const bySubject = new Map<string, ExamResult[]>();
  results.forEach((r) => {
    const subj = r.mataPelajaran || APP_CONFIG.MATA_PELAJARAN;
    const list = bySubject.get(subj) || [];
    list.push(r);
    bySubject.set(subj, list);
  });

  if (bySubject.size > 1) {
    bySubject.forEach((list, subj) => {
      const subAvg =
        Math.round((list.reduce((s, r) => s + (Number(r.nilai) || 0), 0) / list.length) * 100) / 100;
      const subPass = list.filter(
        (r) => r.status === 'Lulus' || (r.nilai ?? 0) >= APP_CONFIG.KKTP
      ).length;
      rows.push([`Rekap Mapel: ${subj}`, subAvg, `${list.length} peserta • ${subPass} tuntas`]);
    });
  }

  return buildWorksheet(rows, { enableAutoFilter: true, minWidth: 12, maxWidth: 48 });
}

function buildMatrixSheet(
  results: ExamResult[],
  questions: Question[],
  itemStats: ItemStat[],
  allResponses: Map<string, Record<number, ItemResponse>>
): XLSX.WorkSheet {
  const header = [
    'No',
    'Nomor Absen',
    'Nama Siswa',
    'Kelas',
    ...questions.map((_, idx) => `S${idx + 1}`),
    'Total Skor',
    'Nilai Akhir',
    'Status KKTP',
    'Durasi Pengerjaan',
    'Jumlah Pelanggaran',
    'Waktu Submit',
  ];

  const dataRows = results.map((res, idx) => {
    const respMap = allResponses.get(getStudentRowKey(res)) || {};
    const itemScores = questions.map((q) => {
      const resp = respMap[q.id];
      if (!resp) return 0;
      if (resp.status === 'benar') return 1;
      if (resp.status === 'sebagian') return Number(resp.score);
      return 0;
    });
    const isLulus = res.status === 'Lulus' || (res.nilai ?? 0) >= APP_CONFIG.KKTP;

    return [
      idx + 1,
      res.noAbsen || '-',
      res.nama || '-',
      res.kelas || APP_CONFIG.KELAS,
      ...itemScores,
      Number(res.benar ?? 0),
      Number(res.nilai ?? 0),
      isLulus ? 'Tuntas' : 'Remedial',
      res.durasiPengerjaan || '-',
      Number(res.violationsCount ?? 0),
      res.timestamp || '-',
    ];
  });

  const footerRows: (string | number)[][] = [
    ['', '', 'KUNCI JAWABAN', '', ...questions.map((q) => formatAnswerKey(q)), '', '', '', '', '', ''],
    ['', '', 'JUMLAH BENAR (Σ)', '', ...itemStats.map((s) => s.correctCount), '', '', '', '', '', ''],
    ['', '', 'KETERCAPAIAN (%)', '', ...itemStats.map((s) => s.persentaseKetercapaian), '', '', '', '', '', ''],
    ['', '', 'TINGKAT KESUKARAN', '', ...itemStats.map((s) => s.klasifikasiKesukaran), '', '', '', '', '', ''],
    ['', '', 'DAYA PEMBEDA (D)', '', ...itemStats.map((s) => s.dayaPembeda), '', '', '', '', '', ''],
  ];

  return buildWorksheet([header, ...dataRows, ...footerRows], {
    enableAutoFilter: true,
    filterLastRowIndex: dataRows.length,
    minWidth: 8,
    maxWidth: 36,
    compactFromColIdx: 4,
    compactCount: questions.length,
  });
}

function buildItemStatsSheet(questions: Question[], itemStats: ItemStat[]): XLSX.WorkSheet {
  const header = [
    'No Soal',
    'Elemen / CP',
    'Topik / Materi Pokok',
    'Bentuk Soal',
    'Level Kognitif',
    'Kunci Jawaban',
    'Bobot Skor',
    'Jumlah Benar',
    'Benar Sebagian',
    'Jumlah Salah',
    'Total Siswa',
    'Ketercapaian (%)',
    'Kesukaran Empiris',
    'Daya Pembeda (D)',
    'Interpretasi Daya Pembeda',
  ];

  const rows = itemStats.map((stat, idx) => {
    const q = questions[idx];
    return [
      stat.questionNumber,
      stat.elemen,
      stat.topic,
      formatQuestionTypeLabel(q?.type ?? stat.type),
      stat.levelKognitif,
      stat.kunciJawaban,
      Number(stat.bobot ?? 1),
      Number(stat.correctCount),
      Number(stat.partialCount),
      Number(stat.wrongCount),
      Number(stat.totalStudents),
      Number(stat.persentaseKetercapaian),
      stat.klasifikasiKesukaran,
      Number(stat.dayaPembeda),
      stat.dayaPembedaLabel,
    ];
  });

  return buildWorksheet([header, ...rows], { enableAutoFilter: true, minWidth: 10, maxWidth: 40 });
}

function buildIntegritySheet(results: ExamResult[]): XLSX.WorkSheet {
  const header = [
    'No',
    'Nomor Absen',
    'Nama Siswa',
    'Kelas',
    'Mata Pelajaran',
    'Benar',
    'Salah',
    'Nilai Akhir',
    'Status KKTP',
    'Durasi Pengerjaan',
    'Jumlah Pelanggaran',
    'Status Pengerjaan',
    'Catatan Integritas',
    'Riwayat Waktu Pelanggaran',
    'Waktu Submit',
  ];

  const rows = results.map((res, idx) => {
    const isLulus = res.status === 'Lulus' || (res.nilai ?? 0) >= APP_CONFIG.KKTP;
    const { statusSubmit, catatan, logHistory } = getIntegritySummary(res);
    return [
      idx + 1,
      res.noAbsen || '-',
      res.nama || '-',
      res.kelas || APP_CONFIG.KELAS,
      res.mataPelajaran || APP_CONFIG.MATA_PELAJARAN,
      Number(res.benar ?? 0),
      Number(res.salah ?? 0),
      Number(res.nilai ?? 0),
      isLulus ? 'Tuntas' : 'Remedial',
      res.durasiPengerjaan || '-',
      Number(res.violationsCount ?? 0),
      statusSubmit,
      catatan,
      logHistory,
      res.timestamp || '-',
    ];
  });

  return buildWorksheet([header, ...rows], { enableAutoFilter: true, minWidth: 10, maxWidth: 48 });
}

export function downloadRekapExcel(results: ExamResult[], questions: Question[]): void {
  const wb = XLSX.utils.book_new();
  const { itemStats, allResponses } = computeItemAnalysis(results, questions);

  XLSX.utils.book_append_sheet(wb, buildRekapSheet(results), sanitizeSheetName('Rekap Nilai'));
  XLSX.utils.book_append_sheet(
    wb,
    buildSummarySheet(results),
    sanitizeSheetName('Ringkasan Statistik')
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildMatrixSheet(results, questions, itemStats, allResponses),
    sanitizeSheetName('Detail Jawaban & Butir')
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  const kelasSafe = APP_CONFIG.KELAS.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Rekap_Nilai_Tes_Sumatif_Kelas_${kelasSafe}_${dateStr}.xlsx`);
}

export function downloadItemAnalysisExcel(
  results: ExamResult[],
  questions: Question[],
  precomputedStats?: ItemStat[],
  precomputedResponses?: Map<string, Record<number, ItemResponse>>
): void {
  const wb = XLSX.utils.book_new();
  let itemStats = precomputedStats;
  let allResponses = precomputedResponses;

  if (!itemStats || !allResponses) {
    const computed = computeItemAnalysis(results, questions);
    itemStats = computed.itemStats;
    allResponses = computed.allResponses;
  }

  XLSX.utils.book_append_sheet(
    wb,
    buildMatrixSheet(results, questions, itemStats, allResponses),
    sanitizeSheetName('Matriks Jawaban')
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildItemStatsSheet(questions, itemStats),
    sanitizeSheetName('Statistik Butir Soal')
  );
  XLSX.utils.book_append_sheet(
    wb,
    buildIntegritySheet(results),
    sanitizeSheetName('Rekap Nilai & Integritas')
  );

  const dateStr = new Date().toISOString().slice(0, 10);
  const kelasSafe = APP_CONFIG.KELAS.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Matriks_Analisis_Butir_Soal_Kelas_${kelasSafe}_${dateStr}.xlsx`);
}
