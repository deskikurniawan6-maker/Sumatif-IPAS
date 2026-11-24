import { APP_CONFIG } from '../config';
import { ExamResult } from '../types';

const LOCAL_RESULTS_KEY = 'sd3_local_exam_results_v2';
const CUSTOM_GAS_URL_KEY = 'sd3_custom_gas_url';
const LEGACY_URLS = [
  'AKfycbzBuJrheUE3MRAvNlUEZut3q0LQL5-J62sy8w_rfsBz72VJGt7IHyFPj0WORSB8dUCmeQ',
  'AKfycbx6Bki20asJdxZX-I6kmXwGIyd6pOApUMTD-92t7rFVdIuYH86ApVatKYEsBbZYttJSng',
  'AKfycbygzYgt5yGufQXj0Li0QnAiOLNitswNf0TPQnODZtg7HNgbQOdp1pbEmJruuUvPubDGbw',
];

export const spreadsheetService = {
  getGasUrl(): string {
    try {
      const saved = localStorage.getItem(CUSTOM_GAS_URL_KEY);
      if (saved && saved.trim().startsWith('http')) {
        if (LEGACY_URLS.some((legacy) => saved.includes(legacy))) {
          localStorage.removeItem(CUSTOM_GAS_URL_KEY);
          return APP_CONFIG.GOOGLE_APPS_SCRIPT_URL;
        }
        return saved.trim();
      }
    } catch {
      // Ignore storage errors
    }
    return APP_CONFIG.GOOGLE_APPS_SCRIPT_URL;
  },

  setGasUrl(url: string): void {
    try {
      if (!url || !url.trim()) {
        localStorage.removeItem(CUSTOM_GAS_URL_KEY);
      } else {
        localStorage.setItem(CUSTOM_GAS_URL_KEY, url.trim());
      }
    } catch (err) {
      console.warn('Gagal menyimpan URL GAS kustom ke localStorage:', err);
    }
  },

  resetGasUrl(): void {
    try {
      localStorage.removeItem(CUSTOM_GAS_URL_KEY);
    } catch {
      // Ignore
    }
  },

  getLocalExamResults(): ExamResult[] {
    try {
      const raw = localStorage.getItem(LOCAL_RESULTS_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (item) => !String(item?.id || '').startsWith('res-default-')
          );
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
    } catch (err) {
      console.warn('Gagal membaca data hasil tes lokal:', err);
    }
    return [];
  },

  saveLocalExamResult(result: ExamResult): void {
    try {
      const existing = this.getLocalExamResults();
      const idx = existing.findIndex(
        (item) =>
          item.id === result.id ||
          (item.nama.toLowerCase() === result.nama.toLowerCase() &&
            item.timestamp === result.timestamp)
      );
      if (idx >= 0) {
        existing[idx] = result;
      } else {
        existing.unshift(result);
      }
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('Gagal menyimpan hasil tes ke localStorage:', err);
    }
  },

  deleteLocalExamResult(timestamp: string, nama?: string): void {
    try {
      const filtered = this.getLocalExamResults().filter(
        (item) =>
          item.id !== timestamp &&
          item.timestamp !== timestamp &&
          !(nama && item.nama.toLowerCase() === nama.toLowerCase())
      );
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn('Gagal menghapus data hasil tes lokal:', err);
    }
  },

  clearAllLocalExamResults(): void {
    try {
      localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify([]));
    } catch (err) {
      console.warn('Gagal mengosongkan data lokal:', err);
    }
  },

  async testGasConnection(customUrl?: string): Promise<{
    success: boolean;
    message: string;
    rowCount?: number;
  }> {
    const targetUrl = (customUrl || this.getGasUrl()).trim();
    if (!targetUrl || !targetUrl.startsWith('http')) {
      return { success: false, message: 'URL Google Apps Script tidak valid.' };
    }
    try {
      const url = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=read&t=${Date.now()}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return res.status === 404
          ? {
              success: false,
              message:
                'Server merespons HTTP 404 (Not Found). Pastikan Web App sudah di-Deploy dengan jenis "Web App" dan akses "Anyone" (Siapa saja).',
            }
          : { success: false, message: `Server merespons status HTTP ${res.status}` };
      }

      const text = await res.text();
      let json: Record<string, unknown> = {};
      try {
        json = JSON.parse(text);
      } catch {
        return {
          success: true,
          message: 'Terhubung ke server Google Apps Script (Respons non-JSON).',
          rowCount: 0,
        };
      }
      const rows = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.rows)
            ? json.rows
            : [];
      return {
        success: true,
        message: `Koneksi berhasil! Terhubung ke Google Spreadsheet (${rows.length} baris data ditemukan).`,
        rowCount: rows.length,
      };
    } catch (err) {
      const error = err as Error;
      return error.name === 'AbortError'
        ? {
            success: false,
            message: 'Koneksi waktu habis (Timeout 8 detik). Server Google Apps Script lambat merespons.',
          }
        : {
            success: false,
            message:
              error.message ||
              'Gagal terhubung ke Google Apps Script. Periksa koneksi internet atau hak akses Web App.',
          };
    }
  },

  async submitExamResult(result: ExamResult): Promise<{
    success: boolean;
    savedLocally: boolean;
    message: string;
  }> {
    this.saveLocalExamResult(result);

    try {
      window.dispatchEvent(new CustomEvent('sd3_exam_submitted', { detail: result }));
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sd3_exam_sync_channel');
        ch.postMessage({
          type: 'NEW_SUBMISSION',
          studentName: result.nama,
          result,
        });
        ch.close();
      }
    } catch {
      // Ignore broadcast errors
    }

    const gasUrl = this.getGasUrl();
    if (!gasUrl || !gasUrl.startsWith('http')) {
      return {
        success: true,
        savedLocally: true,
        message: 'Hasil tes berhasil disimpan di perangkat ini.',
      };
    }

    const payload = {
      action: 'submit',
      id: result.id || `res-${Date.now()}`,
      timestamp: result.timestamp || new Date().toLocaleString('id-ID'),
      nama: result.nama,
      kelas: result.kelas || APP_CONFIG.KELAS,
      noAbsen: result.noAbsen,
      tglLahir: result.tglLahir || '',
      benar: result.benar,
      salah: result.salah,
      nilai: result.nilai,
      status: result.status,
      mataPelajaran: APP_CONFIG.MATA_PELAJARAN,
      sekolah: APP_CONFIG.SEKOLAH,
      studentName: result.nama,
      className: result.kelas || APP_CONFIG.KELAS,
      absenNumber: result.noAbsen,
      birthDate: result.tglLahir || '',
      correctCount: result.benar,
      incorrectCount: result.salah,
      totalQuestions: (result.benar || 0) + (result.salah || 0),
      finalScore: result.nilai,
      answers: result.detailJawaban || {},
      violationsCount: result.violationsCount || 0,
      pelanggaran: result.violationsCount || 0,
      violationLogs: result.violationLogs || [],
      submissionReason: result.submissionReason || 'normal',
      terminationNote: result.terminationNote || '',
    };

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`GAS POST merespons HTTP ${res.status}`);
        return {
          success: true,
          savedLocally: true,
          message: `Hasil tes tersimpan di perangkat ini. (Cloud respons HTTP ${res.status})`,
        };
      }

      const text = await res.text();
      let json: Record<string, unknown> = {};
      try {
        json = JSON.parse(text);
      } catch {
        json = { success: true };
      }

      return {
        success: true,
        savedLocally: true,
        message:
          (typeof json.message === 'string' && json.message) ||
          'Jawaban dan hasil tes berhasil disimpan ke Google Spreadsheet.',
      };
    } catch (err) {
      console.warn('Gagal sinkronisasi langsung ke Google Apps Script (tersimpan lokal):', err);
      return {
        success: true,
        savedLocally: true,
        message: 'Hasil tes tersimpan di perangkat ini. (Sinkronisasi cloud tertunda)',
      };
    }
  },

  async fetchExamResults(): Promise<ExamResult[]> {
    const local = this.getLocalExamResults();
    const gasUrl = this.getGasUrl();
    if (!gasUrl || !gasUrl.startsWith('http')) {
      return local;
    }

    try {
      const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=read&t=${Date.now()}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`Google Apps Script merespons HTTP ${res.status}, menggunakan data lokal.`);
        return local;
      }

      const json = await res.json();
      let rows: Record<string, unknown>[] = [];
      if (Array.isArray(json)) rows = json;
      else if (json && Array.isArray(json.data)) rows = json.data;
      else if (json && json.status === 'success' && Array.isArray(json.rows)) rows = json.rows;

      const remoteResults: ExamResult[] = rows
        .filter((row) => {
          const name = row.Nama || row.nama || row.studentName || row['Nama Siswa'];
          return name && String(name).trim().length > 0;
        })
        .map((row, idx) => {
          const timestamp = String(
            row.Timestamp || row.timestamp || row.waktu || new Date().toLocaleString('id-ID')
          );
          const nama = String(
            row.studentName || row.Nama || row.nama || row['Nama Siswa'] || 'Siswa'
          );
          const kelas = String(row.className || row.Kelas || row.kelas || APP_CONFIG.KELAS);
          const noAbsen = String(
            row.absenNumber || row['Nomor Absen'] || row.noAbsen || row.NoAbsen || '-'
          );
          const benar = Number(row.correctCount ?? row.Benar ?? row.benar ?? 0);
          const salah = Number(row.incorrectCount ?? row.Salah ?? row.salah ?? 0);
          const nilai = Number(row.finalScore ?? row.Nilai ?? row.nilai ?? 0);
          const rawStatus = String(row.status || (nilai >= APP_CONFIG.KKTP ? 'Lulus' : 'Belum Lulus'));
          const tglLahir = String(row.birthDate || row['Tanggal Lahir'] || row.tglLahir || '');
          const violationsCount = Number(
            row.violationsCount ?? row.pelanggaran ?? row.Pelanggaran ?? 0
          );

          return {
            id: String(row.id || `gas-${idx}-${timestamp}`),
            timestamp,
            nama,
            kelas,
            noAbsen,
            tglLahir,
            benar,
            salah,
            nilai,
            status: rawStatus === 'Lulus' ? 'Lulus' : 'Belum Lulus',
            mataPelajaran: String(
              row['Mata Pelajaran'] ||
                row.mataPelajaran ||
                row.subject ||
                row._sheetSource ||
                APP_CONFIG.MATA_PELAJARAN
            ),
            violationsCount,
            violationLogs: Array.isArray(row.violationLogs) ? row.violationLogs : [],
            submissionReason:
              row.submissionReason === 'violation_limit' || violationsCount >= 3
                ? 'violation_limit'
                : 'normal',
            terminationNote: String(
              row.terminationNote || row['Catatan Keamanan'] || row.catatan || ''
            ),
          };
        });

      local.forEach((loc) => {
        const exists = remoteResults.some(
          (rem) =>
            rem.nama.trim().toLowerCase() === loc.nama.trim().toLowerCase() &&
            rem.noAbsen === loc.noAbsen &&
            (rem.mataPelajaran === loc.mataPelajaran || !loc.mataPelajaran)
        );
        if (!exists) {
          remoteResults.push(loc);
        }
      });

      return remoteResults;
    } catch (err) {
      console.warn('Error saat fetch dari Google Apps Script, menampilkan data lokal:', err);
      return local;
    }
  },

  async deleteExamResult(timestamp: string, nama: string, mataPelajaran?: string): Promise<boolean> {
    this.deleteLocalExamResult(timestamp, nama);
    try {
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sd3_exam_sync_channel');
        ch.postMessage({ type: 'DATA_DELETED' });
        ch.close();
      }
    } catch {
      // Ignore
    }

    const gasUrl = this.getGasUrl();
    if (!gasUrl || !gasUrl.startsWith('http')) return true;

    const payload = {
      action: 'delete',
      timestamp,
      nama,
      studentName: nama,
      mataPelajaran: mataPelajaran || APP_CONFIG.MATA_PELAJARAN,
    };

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (err) {
      console.warn('Gagal menghapus di remote GAS (namun sudah terhapus di lokal):', err);
      return true;
    }
  },

  async clearAllExamResults(
    mataPelajaran?: string,
    allSheets = false
  ): Promise<{ success: boolean; clearedRemote: boolean; message: string }> {
    this.clearAllLocalExamResults();
    try {
      if ('BroadcastChannel' in window) {
        const ch = new BroadcastChannel('sd3_exam_sync_channel');
        ch.postMessage({ type: 'DATA_CLEARED' });
        ch.close();
      }
    } catch {
      // Ignore
    }

    const gasUrl = this.getGasUrl();
    if (!gasUrl || !gasUrl.startsWith('http')) {
      return {
        success: true,
        clearedRemote: false,
        message: 'Seluruh data nilai di penyimpanan lokal perangkat berhasil dibersihkan.',
      };
    }

    try {
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'clearAll',
          mataPelajaran: mataPelajaran || APP_CONFIG.MATA_PELAJARAN,
          allSheets,
        }),
      });
      return res.ok
        ? {
            success: true,
            clearedRemote: true,
            message: 'Seluruh data nilai di Google Spreadsheet dan perangkat lokal berhasil dihapus.',
          }
        : {
            success: true,
            clearedRemote: false,
            message: 'Data nilai lokal berhasil dibersihkan. Server Spreadsheet merespons dengan kendala.',
          };
    } catch (err) {
      console.warn('Gagal menghapus di remote Google Apps Script secara massal:', err);
      return {
        success: true,
        clearedRemote: false,
        message:
          'Data lokal berhasil dihapus. Google Spreadsheet tidak dapat diakses saat ini (koneksi offline/URL tidak valid).',
      };
    }
  },

  async syncAllLocalToCloud(): Promise<{ total: number; success: number }> {
    const local = this.getLocalExamResults();
    if (local.length === 0) return { total: 0, success: 0 };
    let success = 0;
    for (const item of local) {
      try {
        const res = await this.submitExamResult(item);
        if (res.success) success++;
      } catch {
        // Continue
      }
    }
    return { total: local.length, success };
  },
};
