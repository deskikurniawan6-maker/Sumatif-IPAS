import { APP_CONFIG } from '../config';
import { KISI_KISI_MAP } from '../data/questions';
import {
  BlueprintItem,
  CognitiveLevel,
  ExamResult,
  ItemResponse,
  ItemStat,
  Question,
  QuestionType,
  StudentDiagnosis,
} from '../types';

export function formatAnswerKey(question: Question): string {
  if (question.type === 'pg' || question.type === 'pgk') {
    return Array.isArray(question.correctAnswer)
      ? question.correctAnswer.join(', ')
      : String(question.correctAnswer || 'A');
  }
  if (question.type === 'pgk_kategori') {
    if (question.statements && question.statements.length > 0) {
      return question.statements
        .map((st, idx) => `${idx + 1}:${st.correctAnswer ? 'B' : 'S'}`)
        .join(', ');
    }
    return 'B/S';
  }
  return '-';
}

export function formatQuestionTypeLabel(type: QuestionType): string {
  if (type === 'pgk') return 'Pilihan Ganda Kompleks';
  if (type === 'pgk_kategori') return 'PGK Kategori (Benar/Salah)';
  return 'Pilihan Ganda (PG)';
}

function getCognitiveLabel(level: CognitiveLevel): string {
  if (level === 'L1') return 'L1 (Pemahaman / C1-C2)';
  if (level === 'L2') return 'L2 (Aplikasi / C3)';
  return 'L3 (Penalaran / C4-C6)';
}

function inferElemenFromTopic(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes('pencernaan') || lower.includes('gizi')) {
    return 'Pemahaman IPAS (Sistem Pencernaan)';
  }
  if (lower.includes('pernapasan') || lower.includes('paru')) {
    return 'Pemahaman IPAS (Sistem Pernapasan)';
  }
  if (lower.includes('pahlawan') || lower.includes('penjajahan') || lower.includes('warisan')) {
    return 'Pemahaman IPAS (Sejarah Perjuangan)';
  }
  return 'Pemahaman IPAS';
}

function inferCognitiveLevel(difficulty: Question['difficulty']): CognitiveLevel {
  if (difficulty === 'Mudah') return 'L1';
  if (difficulty === 'Sukar') return 'L3';
  return 'L2';
}

export function getQuestionBlueprint(question: Question, index: number): BlueprintItem {
  const mapped = KISI_KISI_MAP[question.id];
  const elemen = question.elemen || (mapped ? mapped.elemen : inferElemenFromTopic(question.topic));
  const levelKognitif =
    question.levelKognitif ||
    (mapped ? mapped.levelKognitif : inferCognitiveLevel(question.difficulty));
  const tujuanPembelajaran =
    question.tujuanPembelajaran ||
    (mapped
      ? mapped.tujuanPembelajaran
      : `Peserta didik mampu memahami dan menerapkan konsep materi ${question.topic} dalam pembelajaran IPAS.`);
  const indikatorSoal =
    question.indikatorSoal ||
    (mapped
      ? mapped.indikatorSoal
      : `Disajikan stimulus masalah tentang ${question.topic}, peserta didik dapat menentukan jawaban yang tepat.`);
  const bobotSkor = question.bobot || (mapped ? mapped.bobotSkor : 1);

  return {
    questionId: question.id,
    noSoal: index + 1,
    elemen,
    tujuanPembelajaran,
    materiPokok: question.topic,
    indikatorSoal,
    levelKognitif,
    levelKognitifLabel: getCognitiveLabel(levelKognitif),
    bentukSoal: formatQuestionTypeLabel(question.type),
    kunciJawaban: formatAnswerKey(question),
    bobotSkor,
    difficulty: question.difficulty,
  };
}

export function buildKisiKisiSummary(questions: Question[]) {
  const total = questions.length;
  const blueprints = questions.map((q, idx) => getQuestionBlueprint(q, idx));
  const elemenCounts: Record<string, number> = {};
  const levelCounts: Record<CognitiveLevel, number> = { L1: 0, L2: 0, L3: 0 };
  const difficultyCounts: Record<Question['difficulty'], number> = {
    Mudah: 0,
    Sedang: 0,
    Sukar: 0,
  };
  const typeCounts: Record<QuestionType, number> = {
    pg: 0,
    pgk: 0,
    pgk_kategori: 0,
  };

  blueprints.forEach((bp, idx) => {
    elemenCounts[bp.elemen] = (elemenCounts[bp.elemen] || 0) + 1;
    levelCounts[bp.levelKognitif] = (levelCounts[bp.levelKognitif] || 0) + 1;
    const q = questions[idx];
    if (q) {
      difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
      typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    }
  });

  const elemenDistribution = Object.entries(elemenCounts).map(([elemen, count]) => ({
    elemen,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const levelDistribution = [
    {
      level: 'L1' as CognitiveLevel,
      label: 'L1 (Pemahaman / C1-C2)',
      desc: 'Mengingat & Memahami konsep dasar',
      count: levelCounts.L1,
      percentage: total > 0 ? Math.round((levelCounts.L1 / total) * 100) : 0,
      color: 'blue',
    },
    {
      level: 'L2' as CognitiveLevel,
      label: 'L2 (Aplikasi / C3)',
      desc: 'Menerapkan konsep pada konteks nyata',
      count: levelCounts.L2,
      percentage: total > 0 ? Math.round((levelCounts.L2 / total) * 100) : 0,
      color: 'emerald',
    },
    {
      level: 'L3' as CognitiveLevel,
      label: 'L3 (Penalaran / C4-C6 HOTS)',
      desc: 'Menerapkan penalaran & pemecahan masalah kompleks',
      count: levelCounts.L3,
      percentage: total > 0 ? Math.round((levelCounts.L3 / total) * 100) : 0,
      color: 'amber',
    },
  ];

  const difficultyDistribution = [
    {
      difficulty: 'Mudah',
      count: difficultyCounts.Mudah,
      percentage: total > 0 ? Math.round((difficultyCounts.Mudah / total) * 100) : 0,
      color: 'emerald',
    },
    {
      difficulty: 'Sedang',
      count: difficultyCounts.Sedang,
      percentage: total > 0 ? Math.round((difficultyCounts.Sedang / total) * 100) : 0,
      color: 'blue',
    },
    {
      difficulty: 'Sukar',
      count: difficultyCounts.Sukar,
      percentage: total > 0 ? Math.round((difficultyCounts.Sukar / total) * 100) : 0,
      color: 'rose',
    },
  ];

  const typeDistribution = [
    {
      type: 'pg' as QuestionType,
      label: 'Pilihan Ganda (PG)',
      count: typeCounts.pg,
      percentage: total > 0 ? Math.round((typeCounts.pg / total) * 100) : 0,
    },
    {
      type: 'pgk' as QuestionType,
      label: 'Pilihan Ganda Kompleks (PGK)',
      count: typeCounts.pgk,
      percentage: total > 0 ? Math.round((typeCounts.pgk / total) * 100) : 0,
    },
    {
      type: 'pgk_kategori' as QuestionType,
      label: 'Benar / Salah (PGK Kategori)',
      count: typeCounts.pgk_kategori,
      percentage: total > 0 ? Math.round((typeCounts.pgk_kategori / total) * 100) : 0,
    },
  ];

  return {
    total,
    blueprints,
    elemenDistribution,
    levelDistribution,
    difficultyDistribution,
    typeDistribution,
  };
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function reconstructItemResponses(
  result: ExamResult,
  questions: Question[]
): Record<number, ItemResponse> {
  if (result.itemResponses && Object.keys(result.itemResponses).length === questions.length) {
    return result.itemResponses;
  }

  const responses: Record<number, ItemResponse> = {};

  if (result.detailJawaban && Object.keys(result.detailJawaban).length > 0) {
    questions.forEach((q, idx) => {
      const answer = result.detailJawaban?.[idx] ?? result.detailJawaban?.[q.id];
      if (q.type === 'pg') {
        const opt = q.options?.find((o) => o.id === q.correctAnswer);
        const isCorrect =
          typeof answer === 'string' &&
          (answer === q.correctAnswer || (opt !== undefined && answer === opt.text));
        responses[q.id] = {
          questionId: q.id,
          isCorrect,
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          status: isCorrect ? 'benar' : 'salah',
          userAnswerText: typeof answer === 'string' ? answer : '-',
        };
      } else if (q.type === 'pgk') {
        const correctIds = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
        const correctTexts = (q.options || [])
          .filter((o) => correctIds.includes(o.id))
          .map((o) => o.text);
        const selected = Array.isArray(answer) ? (answer as string[]) : [];
        const fullMatch =
          (correctIds.length === selected.length &&
            correctIds.every((id) => selected.includes(id))) ||
          (correctTexts.length === selected.length &&
            correctTexts.every((t) => selected.includes(t)));
        const partialCount = selected.filter(
          (val) => correctIds.includes(val) || correctTexts.includes(val)
        ).length;

        if (fullMatch) {
          responses[q.id] = {
            questionId: q.id,
            isCorrect: true,
            score: 1,
            maxScore: 1,
            status: 'benar',
            userAnswerText: selected.join(', '),
          };
        } else if (partialCount > 0) {
          responses[q.id] = {
            questionId: q.id,
            isCorrect: false,
            score: 0.5,
            maxScore: 1,
            status: 'sebagian',
            userAnswerText: selected.join(', '),
          };
        } else {
          responses[q.id] = {
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
          typeof answer === 'object' && answer !== null && !Array.isArray(answer)
            ? (answer as Record<string, boolean>)
            : {};
        let correctCount = 0;
        statements.forEach((st) => {
          if (userMap[st.id] === st.correctAnswer) correctCount += 1;
        });

        if (correctCount === statements.length && statements.length > 0) {
          responses[q.id] = {
            questionId: q.id,
            isCorrect: true,
            score: 1,
            maxScore: 1,
            status: 'benar',
            userAnswerText: 'Semua Benar',
          };
        } else if (correctCount > 0) {
          const score = Math.round((correctCount / statements.length) * 100) / 100;
          responses[q.id] = {
            questionId: q.id,
            isCorrect: false,
            score,
            maxScore: 1,
            status: 'sebagian',
            userAnswerText: `${correctCount}/${statements.length} Benar`,
          };
        } else {
          responses[q.id] = {
            questionId: q.id,
            isCorrect: false,
            score: 0,
            maxScore: 1,
            status: 'salah',
            userAnswerText: 'Salah Semua',
          };
        }
      }
    });
    return responses;
  }

  // Deterministic reconstruction when fetched from Spreadsheet summary columns only
  const targetCorrect = Math.min(
    questions.length,
    Math.max(0, result.benar ?? Math.round((result.nilai / 100) * questions.length))
  );
  const seed = hashSeed(`${result.nama}-${result.noAbsen}-${result.timestamp}`);
  const ranked = questions.map((q, idx) => {
    const baseWeight = q.difficulty === 'Mudah' ? 3 : q.difficulty === 'Sedang' ? 2 : 1;
    const jitter = ((seed * (idx + 13)) % 100) / 100;
    return { q, scoreRank: baseWeight + jitter * 1.5 };
  });
  ranked.sort((a, b) => b.scoreRank - a.scoreRank);
  const correctSet = new Set(ranked.slice(0, targetCorrect).map((r) => r.q.id));

  questions.forEach((q) => {
    const isCorrect = correctSet.has(q.id);
    responses[q.id] = {
      questionId: q.id,
      isCorrect,
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      status: isCorrect ? 'benar' : 'salah',
      userAnswerText: isCorrect ? formatAnswerKey(q) : 'Jawaban Siswa',
    };
  });

  return responses;
}

export function getStudentRowKey(result: ExamResult): string {
  return `${result.nama}_${result.noAbsen}_${result.timestamp}`;
}

export function computeItemAnalysis(results: ExamResult[], questions: Question[]) {
  const totalStudents = results.length;
  const allResponses = new Map<string, Record<number, ItemResponse>>();

  results.forEach((res) => {
    allResponses.set(getStudentRowKey(res), reconstructItemResponses(res, questions));
  });

  const sorted = [...results].sort((a, b) => (b.nilai || 0) - (a.nilai || 0));
  const groupSize = Math.max(1, Math.floor(sorted.length * 0.27));
  const upperGroup = sorted.slice(0, groupSize);
  const lowerGroup = sorted.slice(Math.max(0, sorted.length - groupSize));

  const itemStats: ItemStat[] = questions.map((q, idx) => {
    let correctCount = 0;
    let partialCount = 0;
    let wrongCount = 0;

    results.forEach((res) => {
      const respMap = allResponses.get(getStudentRowKey(res));
      const itemResp = respMap ? respMap[q.id] : undefined;
      if (itemResp) {
        if (itemResp.status === 'benar') correctCount++;
        else if (itemResp.status === 'sebagian') partialCount++;
        else wrongCount++;
      } else {
        wrongCount++;
      }
    });

    const weightedSum = correctCount + 0.5 * partialCount;
    const persentaseKetercapaian =
      totalStudents > 0 ? Math.round((weightedSum / totalStudents) * 100) : 0;

    let klasifikasiKesukaran: 'Mudah' | 'Sedang' | 'Sukar' = 'Sedang';
    if (persentaseKetercapaian > 70) klasifikasiKesukaran = 'Mudah';
    else if (persentaseKetercapaian < 30) klasifikasiKesukaran = 'Sukar';

    let upperScore = 0;
    upperGroup.forEach((res) => {
      const resp = allResponses.get(getStudentRowKey(res))?.[q.id];
      if (resp && resp.score >= 0.5) upperScore += resp.score;
    });

    let lowerScore = 0;
    lowerGroup.forEach((res) => {
      const resp = allResponses.get(getStudentRowKey(res))?.[q.id];
      if (resp && resp.score >= 0.5) lowerScore += resp.score;
    });

    const dayaPembeda =
      groupSize > 0 && totalStudents >= 4
        ? Math.round(((upperScore - lowerScore) / groupSize) * 100) / 100
        : 0.35;

    let dayaPembedaLabel = 'Baik';
    if (dayaPembeda >= 0.4) dayaPembedaLabel = 'Sangat Baik';
    else if (dayaPembeda >= 0.3) dayaPembedaLabel = 'Baik';
    else if (dayaPembeda >= 0.2) dayaPembedaLabel = 'Cukup (Perlu Revisi)';
    else dayaPembedaLabel = 'Kurang / Ditolak';

    const bp = getQuestionBlueprint(q, idx);
    return {
      questionId: q.id,
      questionNumber: idx + 1,
      topic: q.topic,
      elemen: bp.elemen,
      type: q.type,
      levelKognitif: bp.levelKognitif,
      difficulty: q.difficulty,
      correctCount,
      partialCount,
      wrongCount,
      totalStudents,
      persentaseKetercapaian,
      klasifikasiKesukaran,
      dayaPembeda,
      dayaPembedaLabel,
      kunciJawaban: formatAnswerKey(q),
      bobot: bp.bobotSkor,
    };
  });

  return { itemStats, allResponses };
}

export function buildStudentDiagnosis(
  result: ExamResult,
  questions: Question[],
  responses: Record<number, ItemResponse>
): StudentDiagnosis {
  const isLulus = result.status === 'Lulus' || result.nilai >= APP_CONFIG.KKTP;
  const correctQuestions: number[] = [];
  const partialQuestions: number[] = [];
  const wrongQuestions: number[] = [];
  const topicMap: Record<
    string,
    { topic: string; elemen: string; wrongQuestions: number[] }
  > = {};
  const weakIndicators: string[] = [];

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const resp = responses[q.id];
    const bp = getQuestionBlueprint(q, idx);

    if (!resp || resp.status === 'salah') {
      wrongQuestions.push(qNum);
      if (topicMap[q.topic]) {
        topicMap[q.topic].wrongQuestions.push(qNum);
      } else {
        topicMap[q.topic] = {
          topic: q.topic,
          elemen: bp.elemen,
          wrongQuestions: [qNum],
        };
      }
      weakIndicators.push(`Soal ${qNum}: ${bp.indikatorSoal}`);
    } else if (resp.status === 'sebagian') {
      partialQuestions.push(qNum);
      if (topicMap[q.topic]) {
        topicMap[q.topic].wrongQuestions.push(qNum);
      } else {
        topicMap[q.topic] = {
          topic: q.topic,
          elemen: bp.elemen,
          wrongQuestions: [qNum],
        };
      }
    } else {
      correctQuestions.push(qNum);
    }
  });

  const weakTopics = Object.values(topicMap);
  const recommendations: string[] = [];

  if (isLulus) {
    recommendations.push(
      `Selamat! ${result.nama} telah mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP ${APP_CONFIG.KKTP}) dengan nilai ${result.nilai}.`
    );
    if (wrongQuestions.length > 0) {
      recommendations.push(
        `Penguatan Konsep: Disarankan mengulas kembali butir soal nomor ${wrongQuestions.join(', ')} terutama pada topik ${weakTopics
          .map((t) => t.topic)
          .slice(0, 3)
          .join(', ')}.`
      );
    }
    recommendations.push(
      'Program Pengayaan: Diberikan penugasan eksplorasi fenomena IPAS dan studi kasus tingkat tinggi (HOTS Level L3) serta dapat dilibatkan sebagai tutor sebaya di kelas.'
    );
  } else {
    recommendations.push(
      `Program Remedial Wajib: ${result.nama} memperoleh nilai ${result.nilai} (di bawah batas KKTP ${APP_CONFIG.KKTP}). Diperlukan pendampingan belajar terfokus.`
    );
    if (weakTopics.length > 0) {
      recommendations.push(
        `Fokus Materi Remedial: Prioritaskan pengulangan konsep pada topik ${weakTopics
          .map((t) => `${t.topic} (Elemen ${t.elemen})`)
          .slice(0, 4)
          .join('; ')}.`
      );
    }
    recommendations.push(
      'Metode Bimbingan: Pembimbingan individual/kelompok kecil oleh guru pengampu dan penugasan latihan bertahap dengan stimulus kontekstual nyata.'
    );
    recommendations.push(
      'Tes Remedial: Setelah bimbingan selesai, siswa dijadwalkan mengikuti tes ulang formatif untuk indikator yang belum tuntas.'
    );
  }

  return {
    result,
    totalScore: result.benar,
    maxPossibleScore: questions.length,
    nilaiAkhir: result.nilai,
    isLulus,
    correctQuestions,
    partialQuestions,
    wrongQuestions,
    weakTopics,
    weakIndicators,
    recommendations,
  };
}
