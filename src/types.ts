export type QuestionType = 'pg' | 'pgk' | 'pgk_kategori';
export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sukar';
export type CognitiveLevel = 'L1' | 'L2' | 'L3';
export type AppStage = 1 | 2 | 3 | 4;

export interface QuestionOption {
  id: string;
  text: string;
}

export interface CategoryStatement {
  id: string;
  text: string;
  correctAnswer: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  topic: string;
  difficulty: DifficultyLevel;
  elemen?: string;
  levelKognitif?: CognitiveLevel;
  tujuanPembelajaran?: string;
  indikatorSoal?: string;
  bobot?: number;
  imageSvg?: string;
  text: string;
  options?: QuestionOption[];
  statements?: CategoryStatement[];
  correctAnswer?: string | string[];
  explanation: string;
}

export interface ShuffledQuestion extends Question {
  shuffledOptions?: QuestionOption[];
}

export interface BirthDate {
  hari: string;
  bulan: string;
  tahun: string;
}

export interface StudentIdentity {
  nama: string;
  noAbsen: string;
  tglLahir: BirthDate;
}

export interface ViolationLog {
  timestamp: string;
  reason: string;
}

export interface ItemResponse {
  questionId: number;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  status: 'benar' | 'sebagian' | 'salah';
  userAnswerText: string;
}

export interface ExamResult {
  id: string;
  timestamp: string;
  nama: string;
  kelas: string;
  noAbsen: string;
  tglLahir?: string;
  benar: number;
  salah: number;
  nilai: number;
  status: 'Lulus' | 'Belum Lulus';
  mataPelajaran?: string;
  durasiPengerjaan?: string;
  detailJawaban?: Record<number, unknown>;
  itemResponses?: Record<number, ItemResponse>;
  violationsCount?: number;
  violationLogs?: ViolationLog[];
  submissionReason?: 'normal' | 'violation_limit';
  terminationNote?: string;
}

export interface KisiKisiEntry {
  elemen: string;
  tujuanPembelajaran: string;
  indikatorSoal: string;
  levelKognitif: CognitiveLevel;
  bobotSkor: number;
}

export interface BlueprintItem {
  questionId: number;
  noSoal: number;
  elemen: string;
  tujuanPembelajaran: string;
  materiPokok: string;
  indikatorSoal: string;
  levelKognitif: CognitiveLevel;
  levelKognitifLabel: string;
  bentukSoal: string;
  kunciJawaban: string;
  bobotSkor: number;
  difficulty: DifficultyLevel;
}

export interface ItemStat {
  questionId: number;
  questionNumber: number;
  topic: string;
  elemen: string;
  type: QuestionType;
  levelKognitif: CognitiveLevel;
  difficulty: DifficultyLevel;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  totalStudents: number;
  persentaseKetercapaian: number;
  klasifikasiKesukaran: 'Mudah' | 'Sedang' | 'Sukar';
  dayaPembeda: number;
  dayaPembedaLabel: string;
  kunciJawaban: string;
  bobot: number;
}

export interface StudentDiagnosis {
  result: ExamResult;
  totalScore: number;
  maxPossibleScore: number;
  nilaiAkhir: number;
  isLulus: boolean;
  correctQuestions: number[];
  partialQuestions: number[];
  wrongQuestions: number[];
  weakTopics: Array<{
    topic: string;
    elemen: string;
    wrongQuestions: number[];
  }>;
  weakIndicators: string[];
  recommendations: string[];
}
