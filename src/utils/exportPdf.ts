import { jsPDF } from 'jspdf';
import { APP_CONFIG } from '../config';
import { ExamResult, Question } from '../types';
import {
  buildKisiKisiSummary,
  computeItemAnalysis,
  formatAnswerKey,
  getStudentRowKey,
} from './analysis';

function formatIndonesianDate(): string {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function sanitizePdfText(text: string): string {
  return text
    .replace(/→/g, '->')
    .replace(/[–—]/g, '-');
}

async function svgToPngDataUrl(svgString: string, width = 540, height = 190): Promise<string | null> {
  try {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.width = width;
    img.height = height;

    const loaded = await new Promise<boolean>((resolve) => {
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });

    if (!loaded) {
      URL.revokeObjectURL(url);
      return null;
    }

    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return null;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export function downloadResultPdf(result: ExamResult): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(14);
  doc.text(APP_CONFIG.SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(APP_CONFIG.ALAMAT_SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setLineWidth(0.8);
  doc.line(15, y, pageWidth - 15, y);
  doc.setLineWidth(0.2);
  doc.line(15, y + 0.8, pageWidth - 15, y + 0.8);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LEMBAR LAPORAN HASIL TES SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Tahun Ajaran 2025/2026', pageWidth / 2, y, { align: 'center' });
  y += 9;

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'FD');
  doc.setFontSize(10);

  const leftLabelX = 20;
  const leftValX = 58;
  const rightLabelX = 115;
  const rightValX = 150;

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Peserta', leftLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${result.nama}`, leftValX, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Mata Pelajaran', rightLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${APP_CONFIG.MATA_PELAJARAN}`, rightValX, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Nomor Absen', leftLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${result.noAbsen}`, leftValX, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Materi / Pokok', rightLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${APP_CONFIG.MATERI}`, rightValX, y, { maxWidth: 45 });

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Kelas', leftLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${result.kelas || APP_CONFIG.KELAS}`, leftValX, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Standar KKTP', rightLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${APP_CONFIG.KKTP} (Skala 100)`, rightValX, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Waktu Pengerjaan', leftLabelX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`: ${result.timestamp}`, leftValX, y);

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('A. Hasil Perolehan Nilai Tes', 15, y);
  y += 5;

  doc.setFillColor(30, 58, 138);
  doc.rect(15, y, pageWidth - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('Komponen Penilaian', 20, y + 5.5);
  doc.text('Jumlah / Nilai', pageWidth - 45, y + 5.5, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 8;

  const totalCount =
    (result.benar || 0) + (result.salah || 0) > 0
      ? (result.benar || 0) + (result.salah || 0)
      : 50;
  const integrityText =
    result.submissionReason === 'violation_limit'
      ? 'Dihentikan Otomatis (3x Pelanggaran Pindah Tab)'
      : result.violationsCount && result.violationsCount > 0
        ? `${result.violationsCount}x Peringatan Berpindah Tab`
        : 'Tertib (0 Pelanggaran)';

  const rows = [
    { label: 'Jumlah Soal Keseluruhan', value: `${totalCount} Butir Soal` },
    { label: 'Jumlah Jawaban Benar', value: `${result.benar} Soal` },
    { label: 'Jumlah Jawaban Salah / Tidak Tepat', value: `${result.salah} Soal` },
    { label: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', value: `${APP_CONFIG.KKTP}` },
    { label: 'Integritas & Kedisiplinan Ujian', value: integrityText },
  ];

  doc.setFont('helvetica', 'normal');
  rows.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(15, y, pageWidth - 30, 7.5, 'F');
    doc.rect(15, y, pageWidth - 30, 7.5, 'S');
    doc.text(row.label, 20, y + 5);
    doc.text(row.value, pageWidth - 45, y + 5, { align: 'right' });
    y += 7.5;
  });

  const isLulus = result.status === 'Lulus' || result.nilai >= APP_CONFIG.KKTP;
  doc.setFillColor(isLulus ? 240 : 254, isLulus ? 253 : 242, isLulus ? 244 : 242);
  doc.rect(15, y, pageWidth - 30, 10, 'F');
  doc.rect(15, y, pageWidth - 30, 10, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('NILAI AKHIR TES SUMATIF (Skala 0 - 100)', 20, y + 6.5);
  doc.setFontSize(13);
  doc.setTextColor(isLulus ? 22 : 185, isLulus ? 101 : 28, isLulus ? 52 : 28);
  doc.text(String(result.nilai), pageWidth - 45, y + 7, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, pageWidth - 30, 9, 'F');
  doc.rect(15, y, pageWidth - 30, 9, 'S');
  doc.setFontSize(10);
  doc.text('Keterangan Kelulusan', 20, y + 6);
  doc.setTextColor(isLulus ? 22 : 185, isLulus ? 101 : 28, isLulus ? 52 : 28);
  doc.text(
    isLulus ? 'LULUS (Mencapai KKTP)' : 'BELUM LULUS (Perlu Remedial)',
    pageWidth - 45,
    y + 6,
    { align: 'right' }
  );
  doc.setTextColor(0, 0, 0);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('B. Catatan Pembelajaran Guru Kelas:', 15, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  const note = isLulus
    ? 'Selamat atas pencapaian yang memuaskan. Tingkatkan terus semangat belajar dan pemahaman konsep IPAS dalam kehidupan sehari-hari.'
    : 'Perlu bimbingan dan pengulangan materi terutama pada konsep soal kompleks dan pemecahan masalah (remedial). Tetap semangat belajar.';
  doc.text(note, 15, y, { maxWidth: pageWidth - 30 });
  y += 16;

  const sigY = Math.max(y, 220);
  const leftSigX = 20;
  const rightSigX = pageWidth - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Mengetahui,', leftSigX, sigY);
  doc.text('Orang Tua / Wali Siswa,', leftSigX, sigY + 5);

  const dateStr = formatIndonesianDate();
  doc.text(`Jembrana, ${dateStr}`, rightSigX, sigY);
  doc.text('Guru Mata Pelajaran / Kelas VI,', rightSigX, sigY + 5);

  const lineY = sigY + 27;
  doc.line(leftSigX, lineY, leftSigX + 45, lineY);
  doc.text('( ......................................... )', leftSigX, lineY + 4);

  doc.setFont('helvetica', 'bold');
  doc.text(APP_CONFIG.GURU, rightSigX, lineY - 1);
  doc.line(rightSigX, lineY, rightSigX + 48, lineY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`NIPPPK. ${APP_CONFIG.NIP_GURU}`, rightSigX, lineY + 4);

  const safeName = (result.nama || 'siswa').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Hasil_Tes_Sumatif_${safeName}_Absen_${result.noAbsen}.pdf`);
}

export async function downloadQuestionsPdf(questions: Question[]): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 16;

  const renderPageHeader = () => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${APP_CONFIG.SEKOLAH} | Naskah Soal Tes Sumatif ${APP_CONFIG.MATA_PELAJARAN} Kelas ${APP_CONFIG.KELAS}`,
      pageWidth / 2,
      9,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 16) {
      doc.addPage();
      y = 16;
      renderPageHeader();
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(APP_CONFIG.SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(13);
  doc.text('NASKAH SOAL TES SUMATIF SEMESTER', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.setLineWidth(0.6);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Mata Pelajaran : ${APP_CONFIG.MATA_PELAJARAN}`, 16, y);
  doc.text(`Kelas / Semester : Kelas ${APP_CONFIG.KELAS}`, 128, y);
  y += 4.5;
  doc.text('Alokasi Waktu    : 60 Menit', 128, y);
  const materiLines = doc.splitTextToSize(
    `Materi Pokok    : ${sanitizePdfText(APP_CONFIG.MATERI)}`,
    108
  );
  doc.text(materiLines, 16, y);
  y += Math.max(1, materiLines.length) * 4.2 + 0.5;
  doc.text(`Kriteria KKTP   : ${APP_CONFIG.KKTP}`, 16, y);
  doc.text(`Jumlah Soal      : ${questions.length} Butir`, 128, y);
  y += 6;

  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(245, 247, 250);
  doc.rect(15, y, pageWidth - 30, 11, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.text('PETUNJUK UMUM:', 18, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    '1. Tulislah identitas pada lembar jawaban. 2. Kerjakan soal dengan teliti dan jujur. 3. Periksa kembali jawaban sebelum dikirimkan.',
    18,
    y + 8,
    { maxWidth: pageWidth - 36 }
  );
  y += 16;

  const imageMap = new Map<number, string>();
  for (const q of questions) {
    if (q.imageSvg) {
      const png = await svgToPngDataUrl(q.imageSvg);
      if (png) imageMap.set(q.id, png);
    }
  }

  questions.forEach((q, idx) => {
    const imgData = imageMap.get(q.id);
    const imgHeight = 42.22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(sanitizePdfText(q.text), pageWidth - 32);

    const optEntries = (q.options || []).map((opt) =>
      doc.splitTextToSize(`${opt.id}. ${sanitizePdfText(opt.text)}`, pageWidth - 36)
    );
    const stEntries = (q.statements || []).map((st, stIdx) =>
      doc.splitTextToSize(
        `Pernyataan ${stIdx + 1}: ${sanitizePdfText(st.text)}   [  ] Benar   [  ] Salah`,
        pageWidth - 36
      )
    );

    const optionsHeight = optEntries.reduce(
      (sum, oLines) => sum + oLines.length * 4.2 + 1,
      optEntries.length > 0 ? 3 : 0
    );
    const statementsHeight = stEntries.reduce(
      (sum, sLines) => sum + sLines.length * 4.5 + 1.5,
      stEntries.length > 0 ? 3 : 0
    );
    const neededHeight =
      5 +
      (imgData ? imgHeight + 3 : 0) +
      lines.length * 4.5 +
      2 +
      optionsHeight +
      statementsHeight;

    ensureSpace(Math.min(neededHeight, pageHeight - 34));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    let typeLabel = 'Pilihan Ganda';
    if (q.type === 'pgk') typeLabel = 'Pilihan Ganda Kompleks (Bisa >1 jawaban benar)';
    if (q.type === 'pgk_kategori') typeLabel = 'Pilihan Ganda Kompleks Kategori (Benar / Salah)';

    doc.setTextColor(30, 58, 138);
    doc.text(`Soal No. ${idx + 1} [${typeLabel}]`, 15, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    if (imgData) {
      ensureSpace(imgHeight + 16);
      doc.addImage(imgData, 'PNG', 16, y, 120, imgHeight);
      y += imgHeight + 3;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    ensureSpace(lines.length * 4.5 + 8);
    doc.text(lines, 16, y);
    y += lines.length * 4.5 + 2;

    if (optEntries.length > 0) {
      optEntries.forEach((optLines) => {
        ensureSpace(optLines.length * 4.2 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(optLines, 20, y);
        y += optLines.length * 4.2 + 1;
      });
      y += 3;
    }

    if (stEntries.length > 0) {
      stEntries.forEach((stLines) => {
        ensureSpace(stLines.length * 4.5 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.text(stLines, 20, y);
        y += stLines.length * 4.5 + 1.5;
      });
      y += 3;
    }
  });

  doc.save(
    `Naskah_Soal_${APP_CONFIG.MATA_PELAJARAN}_Kelas_${APP_CONFIG.KELAS}_${APP_CONFIG.SEKOLAH.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  );
}

export function downloadRekapPdf(results: ExamResult[]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginL = 12;
  const marginR = 12;
  const contentWidth = pageWidth - marginL - marginR;

  const total = results.length;
  const lulusCount = results.filter(
    (r) => r.status === 'Lulus' || r.nilai >= APP_CONFIG.KKTP
  ).length;
  const remedialCount = total - lulusCount;
  const passRate = total > 0 ? Math.round((lulusCount / total) * 100) : 0;
  const avg =
    total > 0
      ? (results.reduce((sum, r) => sum + (Number(r.nilai) || 0), 0) / total).toFixed(1)
      : '0';
  const maxScore = total > 0 ? Math.max(...results.map((r) => Number(r.nilai) || 0)) : 0;
  const minScore = total > 0 ? Math.min(...results.map((r) => Number(r.nilai) || 0)) : 0;

  let y = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(13);
  doc.text(APP_CONFIG.SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(APP_CONFIG.ALAMAT_SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 2.5;
  doc.setLineWidth(0.8);
  doc.line(marginL, y, pageWidth - marginR, y);
  doc.setLineWidth(0.2);
  doc.line(marginL, y + 0.8, pageWidth - marginR, y + 0.8);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DAFTAR REKAPITULASI NILAI HASIL TES SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Mata Pelajaran: ${APP_CONFIG.MATA_PELAJARAN} • Kelas ${APP_CONFIG.KELAS} • KKTP: ${APP_CONFIG.KKTP}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 5;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, contentWidth, 10, 1.5, 1.5, 'FD');
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Total Peserta: ${total}  |  Tuntas: ${lulusCount} (${passRate}%)  |  Remedial: ${remedialCount}  |  Rata-rata: ${avg}  |  Tertinggi: ${maxScore}  |  Terendah: ${minScore}`,
    pageWidth / 2,
    y + 6.2,
    { align: 'center' }
  );
  y += 14;

  const cols = [
    { key: 'no', title: 'No', width: 9, align: 'center' as const },
    { key: 'noAbsen', title: 'Absen', width: 13, align: 'center' as const },
    { key: 'nama', title: 'Nama Siswa', width: 54, align: 'left' as const },
    { key: 'kelas', title: 'Kelas', width: 14, align: 'center' as const },
    { key: 'benar', title: 'Benar', width: 14, align: 'center' as const },
    { key: 'salah', title: 'Salah', width: 14, align: 'center' as const },
    { key: 'nilai', title: 'Nilai', width: 15, align: 'center' as const },
    { key: 'status', title: 'Status', width: 25, align: 'center' as const },
    { key: 'timestamp', title: 'Waktu Submit', width: 28, align: 'center' as const },
  ];

  const drawHeader = (topY: number) => {
    doc.setFillColor(30, 58, 138);
    doc.rect(marginL, topY, contentWidth, 7.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    let x = marginL;
    cols.forEach((col) => {
      const tx = col.align === 'center' ? x + col.width / 2 : x + 2;
      doc.text(col.title, tx, topY + 5, { align: col.align });
      x += col.width;
    });
    doc.setTextColor(0, 0, 0);
  };

  drawHeader(y);
  y += 7.5;

  results.forEach((res, idx) => {
    if (y + 7 > pageHeight - 38) {
      doc.addPage();
      y = 16;
      drawHeader(y);
      y += 7.5;
    }

    const isEven = idx % 2 === 0;
    const isLulus = res.status === 'Lulus' || res.nilai >= APP_CONFIG.KKTP;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(marginL, y, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginL, y, contentWidth, 6.5, 'S');

    let x = marginL;
    cols.forEach((col) => {
      let val = '';
      if (col.key === 'no') val = String(idx + 1);
      else if (col.key === 'noAbsen') val = String(res.noAbsen || '-');
      else if (col.key === 'nama') val = res.nama || '-';
      else if (col.key === 'kelas') val = res.kelas || APP_CONFIG.KELAS;
      else if (col.key === 'benar') val = String(res.benar ?? 0);
      else if (col.key === 'salah') val = String(res.salah ?? 0);
      else if (col.key === 'nilai') val = String(res.nilai ?? 0);
      else if (col.key === 'status') {
        if (res.submissionReason === 'violation_limit') val = 'Auto-Submit';
        else if (res.violationsCount && res.violationsCount > 0) {
          val = isLulus ? `Lulus (!${res.violationsCount}x)` : `Remedial (!${res.violationsCount}x)`;
        } else {
          val = isLulus ? 'Lulus' : 'Remedial';
        }
      } else if (col.key === 'timestamp') {
        val = (res.timestamp || '-').substring(0, 16);
      }

      doc.setFont('helvetica', col.key === 'nilai' ? 'bold' : 'normal');
      doc.setFontSize(7.8);
      if (col.key === 'status') {
        if (res.submissionReason === 'violation_limit') doc.setTextColor(220, 38, 38);
        else doc.setTextColor(isLulus ? 22 : 185, isLulus ? 101 : 28, isLulus ? 52 : 28);
      } else if (col.key === 'nilai') {
        doc.setTextColor(isLulus ? 15 : 185, isLulus ? 23 : 28, isLulus ? 42 : 28);
      } else {
        doc.setTextColor(30, 41, 59);
      }

      const tx = col.align === 'center' ? x + col.width / 2 : x + 2;
      if (col.key === 'nama') {
        const clipped = doc.splitTextToSize(val, col.width - 3)[0] || val;
        doc.text(clipped, tx, y + 4.5);
      } else {
        doc.text(val, tx, y + 4.5, { align: col.align });
      }
      x += col.width;
    });

    doc.setTextColor(0, 0, 0);
    y += 6.5;
  });

  if (y + 38 > pageHeight - 16) {
    doc.addPage();
    y = 18;
  } else {
    y += 8;
  }

  const dateStr = formatIndonesianDate();
  const leftSigX = marginL + 8;
  const rightSigX = pageWidth - marginR - 55;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mengetahui,', leftSigX, y);
  doc.text('Kepala Sekolah,', leftSigX, y + 4.5);
  doc.text(`Jembrana, ${dateStr}`, rightSigX, y);
  doc.text('Guru Mata Pelajaran,', rightSigX, y + 4.5);

  const lineY = y + 23;
  doc.setFont('helvetica', 'bold');
  doc.text(APP_CONFIG.KEPALA_SEKOLAH, leftSigX, lineY);
  doc.line(leftSigX, lineY + 1, leftSigX + 50, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${APP_CONFIG.NIP_KEPALA_SEKOLAH}`, leftSigX, lineY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(APP_CONFIG.GURU, rightSigX, lineY);
  doc.line(rightSigX, lineY + 1, rightSigX + 50, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIPPPK. ${APP_CONFIG.NIP_GURU}`, rightSigX, lineY + 5);

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Rekapitulasi Nilai Resmi • ${APP_CONFIG.SEKOLAH} • Dicetak otomatis sistem`,
      marginL,
      pageHeight - 6
    );
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginR, pageHeight - 6, {
      align: 'right',
    });
  }

  doc.save(`Rekap_Nilai_Tes_Sumatif_${APP_CONFIG.MATA_PELAJARAN}_Kelas_${APP_CONFIG.KELAS}.pdf`);
}

export function downloadKisiKisiPdf(questions: Question[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginL = 14;
  const marginR = 14;
  const contentWidth = pageWidth - marginL - marginR;
  const summary = buildKisiKisiSummary(questions);

  let y = 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(13);
  doc.text(APP_CONFIG.SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(APP_CONFIG.ALAMAT_SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 2.5;
  doc.setLineWidth(0.8);
  doc.line(marginL, y, pageWidth - marginR, y);
  doc.setLineWidth(0.2);
  doc.line(marginL, y + 0.8, pageWidth - marginR, y + 0.8);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MATRIKS KISI-KISI PENULISAN SOAL TES SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Kurikulum Merdeka • Mata Pelajaran: ${APP_CONFIG.MATA_PELAJARAN} • Fase C / Kelas ${APP_CONFIG.KELAS} • Tahun Ajaran 2026/2027`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 6;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y, contentWidth, 10, 1.5, 1.5, 'FD');
  const l1 = summary.levelDistribution.find((d) => d.level === 'L1')?.count || 0;
  const l2 = summary.levelDistribution.find((d) => d.level === 'L2')?.count || 0;
  const l3 = summary.levelDistribution.find((d) => d.level === 'L3')?.count || 0;
  const pg = summary.typeDistribution.find((d) => d.type === 'pg')?.count || 0;
  const pgk = summary.typeDistribution.find((d) => d.type === 'pgk')?.count || 0;
  const pgkKat = summary.typeDistribution.find((d) => d.type === 'pgk_kategori')?.count || 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Total: ${summary.total} Butir Soal  |  Level Kognitif: L1 (Pemahaman)=${l1}, L2 (Aplikasi)=${l2}, L3 (Penalaran HOTS)=${l3}  |  Bentuk Soal: Pilihan Ganda (PG)=${pg}, PG Kompleks (PGK)=${pgk}, Benar/Salah (PGK Kategori)=${pgkKat}`,
    pageWidth / 2,
    y + 6.2,
    { align: 'center' }
  );
  y += 13;
  doc.setTextColor(0, 0, 0);

  const cols = [
    { key: 'no', title: 'No', width: 9, align: 'center' as const },
    { key: 'elemen', title: 'Elemen / CP', width: 30, align: 'left' as const },
    { key: 'tp', title: 'Tujuan Pembelajaran (TP)', width: 62, align: 'left' as const },
    { key: 'materi', title: 'Materi Pokok', width: 33, align: 'left' as const },
    { key: 'indikator', title: 'Indikator Soal', width: 73, align: 'left' as const },
    { key: 'level', title: 'Level', width: 14, align: 'center' as const },
    { key: 'bentuk', title: 'Bentuk', width: 28, align: 'center' as const },
    { key: 'kunci', title: 'Kunci / Bobot', width: 20, align: 'center' as const },
  ];

  const drawHeader = (topY: number) => {
    doc.setFillColor(30, 58, 138);
    doc.rect(marginL, topY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    let x = marginL;
    cols.forEach((col) => {
      const tx = col.align === 'center' ? x + col.width / 2 : x + 2;
      doc.text(col.title, tx, topY + 4.8, { align: col.align });
      x += col.width;
    });
    doc.setTextColor(0, 0, 0);
  };

  drawHeader(y);
  y += 7;

  summary.blueprints.forEach((bp, idx) => {
    const elemenLines = doc.splitTextToSize(sanitizePdfText(bp.elemen), cols[1].width - 3);
    const tpLines = doc.splitTextToSize(sanitizePdfText(bp.tujuanPembelajaran), cols[2].width - 3);
    const indLines = doc.splitTextToSize(sanitizePdfText(bp.indikatorSoal), cols[4].width - 3);
    const matLines = doc.splitTextToSize(sanitizePdfText(bp.materiPokok), cols[3].width - 3);
    const maxLines = Math.max(elemenLines.length, tpLines.length, indLines.length, matLines.length, 1);
    const rowH = Math.max(7, maxLines * 3.4 + 2);

    if (y + rowH > pageHeight - 35) {
      doc.addPage();
      y = 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Lanjutan Matriks Kisi-Kisi Penulisan Soal:', marginL, y - 2);
      drawHeader(y);
      y += 7;
    }

    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(marginL, y, contentWidth, rowH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginL, y, contentWidth, rowH, 'S');

    let x = marginL;
    cols.forEach((col) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(x, y, x, y + rowH);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(30, 41, 59);

      if (col.key === 'no') {
        doc.setFont('helvetica', 'bold');
        doc.text(String(bp.noSoal), x + col.width / 2, y + 4.5, { align: 'center' });
      } else if (col.key === 'elemen') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 78, 216);
        doc.text(elemenLines, x + 2, y + 3.8);
      } else if (col.key === 'tp') {
        doc.text(tpLines, x + 2, y + 3.8);
      } else if (col.key === 'materi') {
        doc.text(matLines, x + 2, y + 3.8);
      } else if (col.key === 'indikator') {
        doc.text(indLines, x + 2, y + 3.8);
      } else if (col.key === 'level') {
        doc.setFont('helvetica', 'bold');
        if (bp.levelKognitif === 'L1') doc.setTextColor(16, 185, 129);
        else if (bp.levelKognitif === 'L2') doc.setTextColor(37, 99, 235);
        else doc.setTextColor(217, 119, 6);
        doc.text(bp.levelKognitif, x + col.width / 2, y + 4.5, { align: 'center' });
      } else if (col.key === 'bentuk') {
        const shortType = bp.bentukSoal.includes('Kategori')
          ? 'PGK Kategori (B/S)'
          : bp.bentukSoal.includes('Kompleks')
            ? 'PGK (Kompleks)'
            : 'Pilihan Ganda';
        doc.text(shortType, x + col.width / 2, y + 4.5, { align: 'center' });
      } else if (col.key === 'kunci') {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(bp.kunciJawaban, x + col.width / 2, y + 3.8, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Skor: ${bp.bobotSkor}`, x + col.width / 2, y + 7, { align: 'center' });
      }

      x += col.width;
    });

    y += rowH;
  });

  if (y + 35 > pageHeight - 15) {
    doc.addPage();
    y = 18;
  } else {
    y += 8;
  }

  const dateStr = formatIndonesianDate();
  const leftSigX = marginL + 14;
  const rightSigX = pageWidth - marginR - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mengetahui,', leftSigX, y);
  doc.text('Kepala Sekolah,', leftSigX, y + 4.5);
  doc.text(`Jembrana, ${dateStr}`, rightSigX, y);
  doc.text('Guru Mata Pelajaran,', rightSigX, y + 4.5);

  const lineY = y + 21;
  doc.setFont('helvetica', 'bold');
  doc.text(APP_CONFIG.KEPALA_SEKOLAH, leftSigX, lineY);
  doc.line(leftSigX, lineY + 1, leftSigX + 55, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${APP_CONFIG.NIP_KEPALA_SEKOLAH}`, leftSigX, lineY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(APP_CONFIG.GURU, rightSigX, lineY);
  doc.line(rightSigX, lineY + 1, rightSigX + 55, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIPPPK. ${APP_CONFIG.NIP_GURU}`, rightSigX, lineY + 5);

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Kisi-Kisi Soal Kurikulum Merdeka • ${APP_CONFIG.SEKOLAH} • Dicetak otomatis sistem`,
      marginL,
      pageHeight - 6
    );
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginR, pageHeight - 6, {
      align: 'right',
    });
  }

  doc.save(`Kisi_Kisi_Soal_${APP_CONFIG.MATA_PELAJARAN}_Kelas_${APP_CONFIG.KELAS}.pdf`);
}

export function downloadItemAnalysisPdf(results: ExamResult[], questions: Question[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginL = 10;
  const marginR = 10;
  const contentWidth = pageWidth - marginL - marginR;
  const { itemStats, allResponses } = computeItemAnalysis(results, questions);

  let y = 13;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(13);
  doc.text(APP_CONFIG.SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(APP_CONFIG.ALAMAT_SEKOLAH, pageWidth / 2, y, { align: 'center' });
  y += 2.5;
  doc.setLineWidth(0.8);
  doc.line(marginL, y, pageWidth - marginR, y);
  doc.setLineWidth(0.2);
  doc.line(marginL, y + 0.8, pageWidth - marginR, y + 0.8);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('LAPORAN ANALISIS BUTIR SOAL DAN MATRIKS RESPON SISWA', pageWidth / 2, y, {
    align: 'center',
  });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Mata Pelajaran: ${APP_CONFIG.MATA_PELAJARAN} • Materi: ${APP_CONFIG.MATERI} • Kelas ${APP_CONFIG.KELAS} • KKTP: ${APP_CONFIG.KKTP} • Total Siswa: ${results.length}`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  y += 6;

  const wNo = 7;
  const wAbs = 10;
  const wNama = 38;
  const wSkor = 12;
  const wNilai = 12;
  const wStatus = 16;
  const fixedW = wNo + wAbs + wNama + wSkor + wNilai + wStatus;
  const availQWidth = contentWidth - fixedW;
  const wQ = Math.min(6.5, availQWidth / Math.max(1, questions.length));

  const drawHeader = (topY: number) => {
    doc.setFillColor(30, 58, 138);
    doc.rect(marginL, topY, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    let x = marginL;
    doc.text('No', x + wNo / 2, topY + 4.8, { align: 'center' });
    x += wNo;
    doc.text('Absen', x + wAbs / 2, topY + 4.8, { align: 'center' });
    x += wAbs;
    doc.text('Nama Siswa', x + 2, topY + 4.8);
    x += wNama;
    doc.setFontSize(questions.length > 40 ? 5.2 : 6.8);
    questions.forEach((_, idx) => {
      doc.text(`S${idx + 1}`, x + wQ / 2, topY + 4.8, { align: 'center' });
      x += wQ;
    });
    doc.setFontSize(7);
    doc.text('Skor', x + wSkor / 2, topY + 4.8, { align: 'center' });
    x += wSkor;
    doc.text('Nilai', x + wNilai / 2, topY + 4.8, { align: 'center' });
    x += wNilai;
    doc.text('Status', x + wStatus / 2, topY + 4.8, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  drawHeader(y);
  y += 7;

  results.forEach((res, idx) => {
    if (y + 6 > pageHeight - 45) {
      doc.addPage();
      y = 14;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Lanjutan Matriks Respon Butir Soal Siswa:', marginL, y - 2);
      drawHeader(y);
      y += 7;
    }

    const rowKey = getStudentRowKey(res);
    const respMap = allResponses.get(rowKey) || {};
    const isLulus = res.status === 'Lulus' || res.nilai >= APP_CONFIG.KKTP;
    const isEven = idx % 2 === 0;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(marginL, y, contentWidth, 5.8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(marginL, y, contentWidth, 5.8, 'S');

    let x = marginL;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    doc.text(String(idx + 1), x + wNo / 2, y + 4.2, { align: 'center' });
    x += wNo;
    doc.text(String(res.noAbsen || '-'), x + wAbs / 2, y + 4.2, { align: 'center' });
    x += wAbs;
    const clippedName = doc.splitTextToSize(res.nama || 'Siswa', wNama - 3)[0] || res.nama;
    doc.text(clippedName, x + 2, y + 4.2);
    x += wNama;

    questions.forEach((q) => {
      const resp = respMap[q.id];
      if (resp?.status === 'benar') {
        doc.setFillColor(220, 252, 231);
        doc.rect(x + 0.3, y + 0.5, wQ - 0.6, 4.8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('1', x + wQ / 2, y + 4.1, { align: 'center' });
      } else if (resp?.status === 'sebagian') {
        doc.setFillColor(254, 243, 199);
        doc.rect(x + 0.3, y + 0.5, wQ - 0.6, 4.8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('½', x + wQ / 2, y + 4.1, { align: 'center' });
      } else {
        doc.setFillColor(254, 226, 226);
        doc.rect(x + 0.3, y + 0.5, wQ - 0.6, 4.8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28);
        doc.text('0', x + wQ / 2, y + 4.1, { align: 'center' });
      }
      x += wQ;
    });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(String(res.benar ?? 0), x + wSkor / 2, y + 4.2, { align: 'center' });
    x += wSkor;
    doc.setTextColor(isLulus ? 22 : 185, isLulus ? 101 : 28, isLulus ? 52 : 28);
    doc.text(String(res.nilai ?? 0), x + wNilai / 2, y + 4.2, { align: 'center' });
    x += wNilai;
    doc.text(isLulus ? 'Tuntas' : 'Remedial', x + wStatus / 2, y + 4.2, { align: 'center' });

    y += 5.8;
  });

  const summaryRows = [
    {
      label: 'Kunci Jawaban',
      valGetter: (idx: number) => formatAnswerKey(questions[idx]),
      bgColor: [241, 245, 249] as const,
      textColor: [30, 41, 59] as const,
    },
    {
      label: 'Σ Benar',
      valGetter: (idx: number) => String(itemStats[idx]?.correctCount ?? 0),
      bgColor: [236, 253, 245] as const,
      textColor: [6, 95, 70] as const,
    },
    {
      label: '% Ketercapaian',
      valGetter: (idx: number) => `${itemStats[idx]?.persentaseKetercapaian ?? 0}%`,
      bgColor: [239, 246, 255] as const,
      textColor: [29, 78, 216] as const,
    },
    {
      label: 'Tingkat Kesukaran',
      valGetter: (idx: number) => {
        const level = itemStats[idx]?.klasifikasiKesukaran || 'Sedang';
        return level === 'Mudah' ? 'M' : level === 'Sedang' ? 'Sd' : 'Sk';
      },
      bgColor: [254, 242, 242] as const,
      textColor: [153, 27, 27] as const,
    },
    {
      label: 'Daya Pembeda (D)',
      valGetter: (idx: number) => String(itemStats[idx]?.dayaPembeda ?? 0),
      bgColor: [250, 245, 255] as const,
      textColor: [107, 33, 168] as const,
    },
  ];

  summaryRows.forEach((sRow) => {
    if (y + 5.5 > pageHeight - 35) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(sRow.bgColor[0], sRow.bgColor[1], sRow.bgColor[2]);
    doc.rect(marginL, y, contentWidth, 5.2, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginL, y, contentWidth, 5.2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(sRow.textColor[0], sRow.textColor[1], sRow.textColor[2]);
    const labelW = wNo + wAbs + wNama;
    doc.text(sRow.label, marginL + labelW - 2, y + 3.8, { align: 'right' });

    let x = marginL + labelW;
    questions.forEach((_, idx) => {
      doc.text(sRow.valGetter(idx), x + wQ / 2, y + 3.8, { align: 'center' });
      x += wQ;
    });
    y += 5.2;
  });

  if (y + 35 > pageHeight - 15) {
    doc.addPage();
    y = 18;
  } else {
    y += 8;
  }

  const dateStr = formatIndonesianDate();
  const leftSigX = marginL + 14;
  const rightSigX = pageWidth - marginR - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Mengetahui,', leftSigX, y);
  doc.text('Kepala Sekolah,', leftSigX, y + 4.5);
  doc.text(`Jembrana, ${dateStr}`, rightSigX, y);
  doc.text('Guru Mata Pelajaran,', rightSigX, y + 4.5);

  const lineY = y + 21;
  doc.setFont('helvetica', 'bold');
  doc.text(APP_CONFIG.KEPALA_SEKOLAH, leftSigX, lineY);
  doc.line(leftSigX, lineY + 1, leftSigX + 55, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIP. ${APP_CONFIG.NIP_KEPALA_SEKOLAH}`, leftSigX, lineY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(APP_CONFIG.GURU, rightSigX, lineY);
  doc.line(rightSigX, lineY + 1, rightSigX + 55, lineY + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`NIPPPK. ${APP_CONFIG.NIP_GURU}`, rightSigX, lineY + 5);

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Analisis Butir Soal Empiris • ${APP_CONFIG.SEKOLAH} • Dicetak otomatis sistem`,
      marginL,
      pageHeight - 6
    );
    doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - marginR, pageHeight - 6, {
      align: 'right',
    });
  }

  doc.save(`Analisis_Butir_Soal_${APP_CONFIG.MATA_PELAJARAN}_Kelas_${APP_CONFIG.KELAS}.pdf`);
}
