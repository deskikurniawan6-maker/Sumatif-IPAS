import { KisiKisiEntry, Question } from '../types';

function buildDigestiveSystemSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="252" height="166" rx="12" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="138" y="30" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e3a8a">Skema Organ Pencernaan Manusia</text>
  <!-- Head/Mouth (1) -->
  <ellipse cx="115" cy="52" rx="22" ry="11" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
  <!-- Esophagus (2) -->
  <rect x="111" y="63" width="8" height="30" rx="3" fill="#fca5a5" stroke="#b91c1c" stroke-width="1.3"/>
  <!-- Liver (accessory) -->
  <path d="M84,96 L112,96 L108,114 L82,110 Z" fill="#991b1b" opacity="0.85"/>
  <!-- Stomach (3) -->
  <path d="M119,92 C142,90 150,112 134,122 C120,129 109,120 113,106 Z" fill="#fb923c" stroke="#c2410c" stroke-width="1.5"/>
  <!-- Large Intestine frame (5) -->
  <path d="M90,158 L90,130 L146,130 L146,158" fill="none" stroke="#16a34a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Small Intestine coils (4) -->
  <path d="M102,138 C110,134 128,134 134,140 C138,145 102,145 104,151 C106,156 136,155 134,160" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
  <!-- Number badges & leader lines -->
  <line x1="137" y1="52" x2="178" y2="52" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="188" cy="52" r="10" fill="#1d4ed8"/><text x="188" y="56" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">1</text>
  <line x1="119" y1="78" x2="178" y2="78" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="188" cy="78" r="10" fill="#1d4ed8"/><text x="188" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">2</text>
  <line x1="143" y1="106" x2="178" y2="106" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="188" cy="106" r="10" fill="#ea580c"/><text x="188" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">3</text>
  <line x1="136" y1="146" x2="178" y2="136" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="188" cy="136" r="10" fill="#d97706"/><text x="188" y="140" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">4</text>
  <line x1="150" y1="154" x2="178" y2="162" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="188" cy="162" r="10" fill="#15803d"/><text x="188" y="166" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">5</text>

  <!-- Right Instruction Panel -->
  <rect x="278" y="12" width="250" height="166" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="403" y="34" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Petunjuk Nomor Organ</text>
  <text x="294" y="56" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 1 : Rongga awal masuknya makanan</text>
  <text x="294" y="80" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 2 : Saluran penghubung ke lambung</text>
  <text x="294" y="104" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 3 : Kantong pencernaan berenzim</text>
  <text x="294" y="128" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 4 : Saluran panjang berlipat-lipat</text>
  <text x="294" y="152" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 5 : Saluran akhir penyerap air</text>
</svg>`;
}

function buildIsiPiringkuSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="516" height="166" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="270" y="32" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a">Pola Piring Gizi Seimbang ("Isi Piringku")</text>
  <!-- Plate circle at (155, 108) r=62 -->
  <circle cx="155" cy="108" r="62" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
  <!-- Left top: Makanan Pokok (1/3) -->
  <path d="M155,108 L155,50 A58,58 0 0,0 104,136 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.3"/>
  <text x="128" y="92" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#713f12">Makanan</text>
  <text x="128" y="104" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#713f12">Pokok (1/3)</text>
  <!-- Left bottom: Lauk Pauk (1/6) -->
  <path d="M155,108 L104,136 A58,58 0 0,0 155,166 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="1.3"/>
  <text x="133" y="143" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#7c2d12">Lauk</text>
  <text x="133" y="154" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#7c2d12">(1/6)</text>
  <!-- Right top: Sayuran (1/3) -->
  <path d="M155,108 L155,50 A58,58 0 0,1 206,136 Z" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.3"/>
  <text x="182" y="92" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#14532d">Sayuran</text>
  <text x="182" y="104" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#14532d">(1/3)</text>
  <!-- Right bottom: Buah (1/6) -->
  <path d="M155,108 L206,136 A58,58 0 0,1 155,166 Z" fill="#fecdd3" stroke="#e11d48" stroke-width="1.3"/>
  <text x="177" y="143" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#881337">Buah</text>
  <text x="177" y="154" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="bold" fill="#881337">(1/6)</text>
  <!-- Glass of Water -->
  <polygon points="244,82 276,82 271,148 249,148" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/>
  <text x="260" y="164" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#0369a1">Air Putih</text>
  <!-- Legend Box -->
  <rect x="302" y="48" width="212" height="116" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
  <text x="314" y="68" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a">Contoh Komponen Menu:</text>
  <text x="314" y="88" font-family="sans-serif" font-size="10" fill="#334155">1. Makanan Pokok : Nasi, jagung, kentang</text>
  <text x="314" y="107" font-family="sans-serif" font-size="10" fill="#334155">2. Lauk Pauk : Ikan, telur, tempe, tahu</text>
  <text x="314" y="126" font-family="sans-serif" font-size="10" fill="#334155">3. Sayuran : Bayam, wortel, kangkung</text>
  <text x="314" y="145" font-family="sans-serif" font-size="10" fill="#334155">4. Buah-buahan : Pepaya, jeruk, pisang</text>
</svg>`;
}

function buildPeristalsisSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="516" height="166" rx="12" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
  <text x="270" y="34" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#9a3412">Gerakan Otot pada Saluran Kerongkongan</text>
  <!-- Esophagus horizontal tube -->
  <path d="M55,78 Q135,78 160,92 Q195,92 225,70 Q255,92 290,92 Q335,78 465,78" fill="none" stroke="#ea580c" stroke-width="4"/>
  <path d="M55,126 Q135,126 160,112 Q195,112 225,134 Q255,112 290,112 Q335,126 465,126" fill="none" stroke="#ea580c" stroke-width="4"/>
  <!-- Contracted ring -->
  <text x="178" y="66" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#b91c1c">Otot Mengkerut</text>
  <line x1="178" y1="71" x2="178" y2="89" stroke="#b91c1c" stroke-width="1.5"/>
  <!-- Bolus food -->
  <ellipse cx="225" cy="102" rx="22" ry="15" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
  <text x="225" y="106" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#78350f">Makanan</text>
  <!-- Arrow direction -->
  <line x1="270" y1="102" x2="365" y2="102" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
  <polygon points="365,95 381,102 365,109" fill="#15803d"/>
  <text x="325" y="148" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#166534">Didorong menuju lambung</text>
  <!-- Stomach icon at right -->
  <path d="M465,76 C495,74 508,108 488,128 C472,140 456,128 462,102 Z" fill="#fdba74" stroke="#c2410c" stroke-width="2"/>
  <text x="480" y="106" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#7c2d12">Lambung</text>
</svg>`;
}

function buildRespiratorySystemSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="252" height="166" rx="12" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1.5"/>
  <text x="138" y="30" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#065f46">Skema Organ Pernapasan Manusia</text>
  <!-- Nasal Cavity (1) -->
  <path d="M105,46 L130,46 L130,62 L110,62 Z" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
  <!-- Trachea (2) -->
  <rect x="120" y="62" width="12" height="38" fill="#cbd5e1" stroke="#475569" stroke-width="1.4"/>
  <line x1="120" y1="70" x2="132" y2="70" stroke="#64748b" stroke-width="1.2"/>
  <line x1="120" y1="78" x2="132" y2="78" stroke="#64748b" stroke-width="1.2"/>
  <line x1="120" y1="86" x2="132" y2="86" stroke="#64748b" stroke-width="1.2"/>
  <!-- Lungs (4) -->
  <path d="M118,96 C92,98 78,125 84,150 C96,154 114,150 118,142 Z" fill="#fda4af" stroke="#be123c" stroke-width="1.6"/>
  <path d="M134,96 C160,98 174,125 168,150 C156,154 138,150 134,142 Z" fill="#fda4af" stroke="#be123c" stroke-width="1.6"/>
  <!-- Bronchus (3) -->
  <path d="M126,98 L106,114 M126,98 L146,114" fill="none" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
  <!-- Diaphragm (5) -->
  <path d="M80,162 Q126,148 172,162" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
  <!-- Number badges -->
  <line x1="130" y1="54" x2="184" y2="50" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="194" cy="50" r="10" fill="#047857"/><text x="194" y="54" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">1</text>
  <line x1="132" y1="78" x2="184" y2="78" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="194" cy="78" r="10" fill="#0284c7"/><text x="194" y="82" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">2</text>
  <line x1="142" y1="108" x2="184" y2="106" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="194" cy="106" r="10" fill="#7c3aed"/><text x="194" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">3</text>
  <line x1="168" y1="134" x2="184" y2="134" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="194" cy="134" r="10" fill="#e11d48"/><text x="194" y="138" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">4</text>
  <line x1="168" y1="160" x2="184" y2="162" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>
  <circle cx="194" cy="162" r="10" fill="#0f766e"/><text x="194" y="166" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#fff">5</text>

  <!-- Right Panel -->
  <rect x="278" y="12" width="250" height="166" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="403" y="34" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Keterangan Nomor Bagian</text>
  <text x="294" y="56" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 1 : Pintu masuk udara (berambut)</text>
  <text x="294" y="80" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 2 : Saluran bercincin tulang rawan</text>
  <text x="294" y="104" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 3 : Cabang menuju paru kiri &amp; kanan</text>
  <text x="294" y="128" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 4 : Organ utama tempat alveolus</text>
  <text x="294" y="152" font-family="sans-serif" font-size="10.5" fill="#334155">• Nomor 5 : Sekat otot dada dan perut</text>
</svg>`;
}

function buildBreathingMechanismSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <!-- Left: Proses A (Inspirasi) -->
  <rect x="12" y="12" width="248" height="166" rx="12" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="136" y="32" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#1e40af">Proses A (Menarik Napas)</text>
  <path d="M136,42 L136,68" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
  <polygon points="130,66 142,66 136,75" fill="#2563eb"/>
  <text x="180" y="58" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#1d4ed8">Udara Masuk</text>
  <rect x="86" y="78" width="100" height="58" rx="14" fill="#fda4af" stroke="#e11d48" stroke-width="1.8"/>
  <text x="136" y="110" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#881337">Paru Mengembang</text>
  <line x1="76" y1="148" x2="196" y2="148" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
  <text x="136" y="166" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f766e">Diafragma Mendatar (Kontraksi)</text>

  <!-- Right: Proses B (Ekspirasi) -->
  <rect x="280" y="12" width="248" height="166" rx="12" fill="#fff1f2" stroke="#fda4af" stroke-width="1.5"/>
  <text x="404" y="32" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#9f1239">Proses B (Mengembus Napas)</text>
  <path d="M404,72 L404,46" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <polygon points="398,48 410,48 404,39" fill="#e11d48"/>
  <text x="448" y="58" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#be123c">Udara Keluar</text>
  <rect x="358" y="82" width="92" height="46" rx="12" fill="#fecdd3" stroke="#e11d48" stroke-width="1.8"/>
  <text x="404" y="108" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#881337">Paru Mengempis</text>
  <path d="M344,152 Q404,132 464,152" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round"/>
  <text x="404" y="166" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0f766e">Diafragma Melengkung (Relaksasi)</text>
</svg>`;
}

function buildAlveolusSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="516" height="166" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="270" y="32" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0f172a">Pertukaran Gas di Dalam Alveolus &amp; Pembuluh Kapiler</text>
  <!-- Alveolus sac -->
  <circle cx="170" cy="112" r="48" fill="#fef2f2" stroke="#f43f5e" stroke-width="2.5"/>
  <text x="170" y="54" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#9f1239">Rongga Alveolus</text>
  <!-- Capillary blood vessel -->
  <path d="M250,60 C275,60 285,154 250,154 L310,154 C335,154 335,60 310,60 Z" fill="#fee2e2" stroke="#b91c1c" stroke-width="2"/>
  <text x="292" y="112" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7f1d1d">Kapiler</text>
  <text x="292" y="125" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7f1d1d">Darah</text>
  <!-- Arrow Gas X: Alveolus -> Blood -->
  <line x1="196" y1="96" x2="262" y2="96" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
  <polygon points="262,90 274,96 262,102" fill="#2563eb"/>
  <text x="170" y="100" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#1d4ed8">Gas X</text>
  <!-- Arrow Gas Y: Blood -> Alveolus -->
  <line x1="274" y1="132" x2="208" y2="132" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
  <polygon points="208,126 196,132 208,138" fill="#16a34a"/>
  <text x="170" y="136" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#15803d">Gas Y</text>
  <!-- Explanation box -->
  <rect x="352" y="54" width="162" height="104" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.2"/>
  <text x="362" y="75" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e40af">• Gas X :</text>
  <text x="370" y="91" font-family="sans-serif" font-size="9.5" fill="#334155">Masuk dari alveolus ke</text>
  <text x="370" y="104" font-family="sans-serif" font-size="9.5" fill="#334155">aliran darah untuk sel tubuh.</text>
  <text x="362" y="125" font-family="sans-serif" font-size="10" font-weight="bold" fill="#15803d">• Gas Y :</text>
  <text x="370" y="141" font-family="sans-serif" font-size="9.5" fill="#334155">Sisa pernapasan dilepas</text>
  <text x="370" y="154" font-family="sans-serif" font-size="9.5" fill="#334155">dari darah keluar paru-paru.</text>
</svg>`;
}

function buildHistoryTimelineSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="516" height="166" rx="12" fill="#fffbeb" stroke="#fcd34d" stroke-width="1.5"/>
  <text x="270" y="34" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#92400e">Linimasa Sejarah Perjuangan Indonesia &amp; Bali</text>
  <!-- Timeline base line -->
  <line x1="48" y1="102" x2="492" y2="102" stroke="#b45309" stroke-width="3" stroke-linecap="round"/>
  <!-- Node 1: 1848 -->
  <circle cx="88" cy="102" r="10" fill="#d97706" stroke="#fff" stroke-width="2"/>
  <text x="88" y="82" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#78350f">1848–1849</text>
  <text x="88" y="126" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Perang</text>
  <text x="88" y="139" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Jagaraga</text>
  <!-- Node 2: 1906 -->
  <circle cx="204" cy="102" r="10" fill="#d97706" stroke="#fff" stroke-width="2"/>
  <text x="204" y="82" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#78350f">1906</text>
  <text x="204" y="126" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Puputan</text>
  <text x="204" y="139" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Badung</text>
  <!-- Node 3: 1945 -->
  <circle cx="326" cy="102" r="10" fill="#16a34a" stroke="#fff" stroke-width="2"/>
  <text x="326" y="82" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#166534">17 Agt 1945</text>
  <text x="326" y="126" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Proklamasi</text>
  <text x="326" y="139" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">Kemerdekaan</text>
  <!-- Node 4: 20 Nov 1946 -->
  <circle cx="448" cy="102" r="12" fill="#dc2626" stroke="#fff" stroke-width="2"/>
  <text x="448" y="80" text-anchor="middle" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#991b1b">20 Nov 1946</text>
  <text x="448" y="126" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#991b1b">Peristiwa X</text>
  <text x="448" y="139" text-anchor="middle" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#334155">(Margarana, Bali)</text>
  <text x="270" y="166" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#78350f">Amati peristiwa bersejarah bertanda "Peristiwa X" pada linimasa di atas.</text>
</svg>`;
}

function buildHeroValuesSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="540" height="190" viewBox="0 0 540 190">
  <rect x="0" y="0" width="540" height="190" rx="14" fill="#f8fafc"/>
  <rect x="12" y="12" width="516" height="166" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="270" y="34" text-anchor="middle" font-family="sans-serif" font-size="11.5" font-weight="bold" fill="#0f172a">Nilai Teladan &amp; Warisan Pahlawan Bangsa</text>
  <!-- 4 Pillar cards -->
  <rect x="28" y="50" width="112" height="110" rx="10" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.4"/>
  <circle cx="84" cy="78" r="16" fill="#dc2626"/><text x="84" y="83" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff">1</text>
  <text x="84" y="114" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7f1d1d">Cinta Tanah</text>
  <text x="84" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7f1d1d">Air</text>

  <rect x="152" y="50" width="112" height="110" rx="10" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.4"/>
  <circle cx="208" cy="78" r="16" fill="#2563eb"/><text x="208" y="83" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff">2</text>
  <text x="208" y="114" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e3a8a">Rela</text>
  <text x="208" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#1e3a8a">Berkorban</text>

  <rect x="276" y="50" width="112" height="110" rx="10" fill="#ecfdf5" stroke="#6ee7b7" stroke-width="1.4"/>
  <circle cx="332" cy="78" r="16" fill="#059669"/><text x="332" y="83" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff">3</text>
  <text x="332" y="114" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#064e3b">Persatuan</text>
  <text x="332" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#064e3b">&amp; Gotong Royong</text>

  <rect x="400" y="50" width="112" height="110" rx="10" fill="#fffbeb" stroke="#fcd34d" stroke-width="1.4"/>
  <circle cx="456" cy="78" r="16" fill="#d97706"/><text x="456" y="83" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#fff">4</text>
  <text x="456" y="114" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#78350f">Pantang</text>
  <text x="456" y="128" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="bold" fill="#78350f">Menyerah</text>
</svg>`;
}

export const DEFAULT_QUESTIONS: Question[] = [
  // ============================================================================
  // 1. SISTEM PENCERNAAN PADA MANUSIA (20 Soal: Nomor 1 - 20)
  // ============================================================================
  {
    id: 1,
    type: 'pg',
    topic: 'Organ Sistem Pencernaan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    imageSvg: buildDigestiveSystemSvg(),
    text: 'Perhatikan skema organ pencernaan manusia pada gambar! Organ yang ditunjukkan oleh nomor 3 dan nomor 4 secara berturut-turut adalah...',
    options: [
      { id: 'A', text: 'Kerongkongan dan lambung' },
      { id: 'B', text: 'Lambung dan usus halus' },
      { id: 'C', text: 'Usus halus dan usus besar' },
      { id: 'D', text: 'Hati dan usus besar' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada skema: nomor 1 adalah mulut, nomor 2 kerongkongan, nomor 3 lambung, nomor 4 usus halus, dan nomor 5 usus besar.',
  },
  {
    id: 2,
    type: 'pg',
    topic: 'Organ Sistem Pencernaan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    imageSvg: buildDigestiveSystemSvg(),
    text: 'Berdasarkan gambar skema sistem pencernaan tersebut, bagian yang berfungsi menyerap kembali air dari sisa-sisa makanan serta tempat pembusukan sisa makanan oleh bakteri E. coli ditunjukkan oleh nomor...',
    options: [
      { id: 'A', text: 'Nomor 2' },
      { id: 'B', text: 'Nomor 3' },
      { id: 'C', text: 'Nomor 4' },
      { id: 'D', text: 'Nomor 5' },
    ],
    correctAnswer: 'D',
    explanation:
      'Penyerapan air dan pembusukan sisa makanan menjadi feses dibantu bakteri Escherichia coli terjadi di usus besar (nomor 5).',
  },
  {
    id: 3,
    type: 'pg',
    topic: 'Organ Sistem Pencernaan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Urutan jalannya makanan pada saluran pencernaan manusia yang benar dari awal hingga akhir adalah...',
    options: [
      { id: 'A', text: 'Mulut → lambung → kerongkongan → usus halus → usus besar → anus' },
      { id: 'B', text: 'Mulut → kerongkongan → lambung → usus halus → usus besar → anus' },
      { id: 'C', text: 'Mulut → kerongkongan → usus halus → lambung → usus besar → anus' },
      { id: 'D', text: 'Mulut → tenggorokan → lambung → usus besar → usus halus → anus' },
    ],
    correctAnswer: 'B',
    explanation:
      'Makanan masuk melalui mulut, melewati kerongkongan (esofagus), dicerna di lambung, sari-sarinya diserap di usus halus, airnya diserap di usus besar, dan sisanya dikeluarkan melalui anus.',
  },
  {
    id: 4,
    type: 'pg',
    topic: 'Organ Sistem Pencernaan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Di dalam rongga mulut terdapat lidah yang membantu proses pencernaan. Salah satu fungsi utama lidah saat kita makan adalah...',
    options: [
      { id: 'A', text: 'Memotong makanan menjadi potongan kecil' },
      { id: 'B', text: 'Menghasilkan enzim pepsin untuk memecah protein' },
      { id: 'C', text: 'Mencampur makanan dengan air liur dan mendorongnya ke kerongkongan' },
      { id: 'D', text: 'Menyerap sari-sari makanan secara langsung ke darah' },
    ],
    correctAnswer: 'C',
    explanation:
      'Lidah berfungsi sebagai indra pengecap, membantu mengaduk makanan agar bercampur dengan air liur, serta mendorong makanan ke kerongkongan saat menelan.',
  },
  {
    id: 5,
    type: 'pg',
    topic: 'Organ Sistem Pencernaan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Hati dan pankreas merupakan organ pelengkap dalam sistem pencernaan manusia. Cairan empedu yang dihasilkan oleh hati berperan penting untuk membantu...',
    options: [
      { id: 'A', text: 'Mengubah amilum menjadi zat gula di mulut' },
      { id: 'B', text: 'Mengemulsikan (memecah) lemak agar mudah dicerna di usus halus' },
      { id: 'C', text: 'Membunuh kuman yang masuk bersama udara pernapasan' },
      { id: 'D', text: 'Mengubah protein susu menjadi kasein di lambung' },
    ],
    correctAnswer: 'B',
    explanation:
      'Cairan empedu yang diproduksi hati dan disimpan di kantong empedu disalurkan ke usus dua belas jari untuk memecah gumpalan lemak menjadi butiran halus (emulsi lemak).',
  },
  {
    id: 6,
    type: 'pg',
    topic: 'Proses Pencernaan Makanan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Pencernaan makanan yang dilakukan dengan bantuan gerakan mengunyah oleh gigi di mulut termasuk jenis pencernaan...',
    options: [
      { id: 'A', text: 'Kimiawi' },
      { id: 'B', text: 'Mekanik' },
      { id: 'C', text: 'Biologis' },
      { id: 'D', text: 'Otomatis' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pencernaan mekanik adalah pemecahan makanan secara fisik menjadi bagian lebih kecil tanpa bantuan enzim, misalnya oleh gigi dan otot lambung.',
  },
  {
    id: 7,
    type: 'pg',
    topic: 'Proses Pencernaan Makanan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    imageSvg: buildPeristalsisSvg(),
    text: 'Perhatikan gambar gerakan otot pada dinding kerongkongan berikut! Gerakan meremas dan mendorong makanan dari kerongkongan menuju lambung disebut gerak...',
    options: [
      { id: 'A', text: 'Peristaltik' },
      { id: 'B', text: 'Refleks' },
      { id: 'C', text: 'Difusi' },
      { id: 'D', text: 'Kontraksi diafragma' },
    ],
    correctAnswer: 'A',
    explanation:
      'Gerak peristaltik adalah gerakan meremas-remas dan mendorong secara bergelombang yang dilakukan oleh dinding otot kerongkongan agar makanan masuk ke lambung.',
  },
  {
    id: 8,
    type: 'pg',
    topic: 'Proses Pencernaan Makanan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Ketika kita mengunyah nasi putih cukup lama, lama-kelamaan nasi akan terasa agak manis di mulut. Hal ini terjadi karena di dalam air liur terdapat enzim...',
    options: [
      { id: 'A', text: 'Pepsin yang mengubah protein menjadi pepton' },
      { id: 'B', text: 'Lipase yang mengubah lemak menjadi asam lemak' },
      { id: 'C', text: 'Amilase (ptialin) yang mengubah zat tepung (amilum) menjadi gula' },
      { id: 'D', text: 'Renin yang mengendapkan protein susu' },
    ],
    correctAnswer: 'C',
    explanation:
      'Enzim amilase (ptialin) dalam air liur memecah karbohidrat kompleks (amilum/pati) dalam nasi menjadi gula sederhana (maltosa) sehingga terasa manis.',
  },
  {
    id: 9,
    type: 'pg',
    topic: 'Proses Pencernaan Makanan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Di dalam lambung terdapat asam klorida (HCl) yang bersifat sangat asam. Fungsi utama asam klorida pada proses pencernaan di lambung adalah...',
    options: [
      { id: 'A', text: 'Menyerap vitamin dan mineral ke pembuluh darah' },
      { id: 'B', text: 'Membunuh kuman penyakit yang terbawa bersama makanan' },
      { id: 'C', text: 'Mengubah zat tepung menjadi glukosa secara cepat' },
      { id: 'D', text: 'Membentuk feses agar mudah dikeluarkan tubuh' },
    ],
    correctAnswer: 'B',
    explanation:
      'Asam lambung (HCl) berfungsi membunuh kuman/bakteri berbahaya yang ikut masuk bersama makanan serta mengaktifkan enzim pepsin.',
  },
  {
    id: 10,
    type: 'pg',
    topic: 'Proses Pencernaan Makanan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Permukaan bagian dalam usus halus memiliki jutaan tonjolan halus seperti jari yang disebut vili (jonjot usus). Keberadaan vili tersebut bertujuan untuk...',
    options: [
      { id: 'A', text: 'Mempercepat pembusukan sisa makanan yang tidak terpakai' },
      { id: 'B', text: 'Menghasilkan asam lambung dalam jumlah besar' },
      { id: 'C', text: 'Memperluas bidang penyerapan sari-sari makanan ke pembuluh darah' },
      { id: 'D', text: 'Menyaring debu dan kotoran dari udara pernapasan' },
    ],
    correctAnswer: 'C',
    explanation:
      'Vili (jonjot usus) memperluas permukaan dinding usus halus sehingga penyerapan sari-sari makanan ke dalam kapiler darah berlangsung maksimal.',
  },
  {
    id: 11,
    type: 'pg',
    topic: 'Kandungan Zat Gizi',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Zat gizi utama yang berfungsi sebagai sumber energi terbesar bagi tubuh untuk beraktivitas seperti berlari dan belajar terdapat banyak pada nasi, jagung, dan roti. Zat gizi tersebut adalah...',
    options: [
      { id: 'A', text: 'Karbohidrat' },
      { id: 'B', text: 'Protein' },
      { id: 'C', text: 'Vitamin' },
      { id: 'D', text: 'Mineral' },
    ],
    correctAnswer: 'A',
    explanation:
      'Karbohidrat adalah sumber tenaga utama bagi tubuh. Bahan makanan pokok seperti beras, jagung, gandum, singkong, dan kentang kaya akan karbohidrat.',
  },
  {
    id: 12,
    type: 'pg',
    topic: 'Kandungan Zat Gizi',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Anak-anak pada masa pertumbuhan membutuhkan banyak zat pembangun untuk membentuk sel-sel tubuh baru dan mengganti jaringan yang rusak. Zat gizi yang berperan sebagai zat pembangun adalah...',
    options: [
      { id: 'A', text: 'Karbohidrat' },
      { id: 'B', text: 'Protein' },
      { id: 'C', text: 'Lemak' },
      { id: 'D', text: 'Serat' },
    ],
    correctAnswer: 'B',
    explanation:
      'Protein berfungsi sebagai zat pembangun dan pengatur tubuh, membantu pertumbuhan serta memperbaiki sel-sel tubuh yang rusak. Contohnya telur, ikan, daging, tahu, dan tempe.',
  },
  {
    id: 13,
    type: 'pg',
    topic: 'Kandungan Zat Gizi',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Wortel, pepaya, dan bayam kaya akan vitamin A. Jika seseorang kekurangan vitamin A dalam waktu lama, gangguan kesehatan yang paling mudah terjadi adalah...',
    options: [
      { id: 'A', text: 'Gusi mudah berdarah (sariawan)' },
      { id: 'B', text: 'Tulang menjadi rapuh dan mudah bengkok' },
      { id: 'C', text: 'Penglihatan kabur terutama saat senja (rabun senja)' },
      { id: 'D', text: 'Pembengkakan pada kelenjar tiroid di leher' },
    ],
    correctAnswer: 'C',
    explanation:
      'Vitamin A berperan penting menjaga kesehatan mata. Kekurangan vitamin A menyebabkan rabun senja dan gangguan kesehatan mata.',
  },
  {
    id: 14,
    type: 'pg',
    topic: 'Kandungan Zat Gizi',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Seseorang sering merasa cepat lelah, pusing, dan wajah tampak pucat karena kekurangan sel darah merah (anemia). Untuk mengatasinya, ia perlu memperbanyak makanan yang mengandung mineral...',
    options: [
      { id: 'A', text: 'Kalsium' },
      { id: 'B', text: 'Zat besi' },
      { id: 'C', text: 'Yodium' },
      { id: 'D', text: 'Fosfor' },
    ],
    correctAnswer: 'B',
    explanation:
      'Zat besi dibutuhkan untuk membentuk hemoglobin dalam sel darah merah. Kekurangan zat besi menyebabkan anemia (kurang darah).',
  },
  {
    id: 15,
    type: 'pg',
    topic: 'Makanan Gizi Seimbang',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    imageSvg: buildIsiPiringkuSvg(),
    text: 'Perhatikan gambar panduan "Isi Piringku" di atas! Agar menu makan siang memenuhi prinsip gizi seimbang, setengah bagian piring sebaiknya diisi oleh...',
    options: [
      { id: 'A', text: 'Makanan pokok dan lauk pauk saja' },
      { id: 'B', text: 'Lauk pauk dan buah-buahan saja' },
      { id: 'C', text: 'Sayuran dan buah-buahan' },
      { id: 'D', text: 'Makanan cepat saji dan minuman manis' },
    ],
    correctAnswer: 'C',
    explanation:
      'Pada panduan Isi Piringku, setengah bagian piring (1/3 sayuran + 1/6 buah = 1/2 piring) terdiri atas sayuran dan buah-buahan, sedangkan setengah lainnya terdiri atas makanan pokok (1/3) dan lauk pauk (1/6).',
  },
  {
    id: 16,
    type: 'pg',
    topic: 'Makanan Gizi Seimbang',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    imageSvg: buildIsiPiringkuSvg(),
    text: 'Ibu menyiapkan menu sarapan untuk Dafa berupa nasi putih, mi goreng, dan keripik kentang. Berdasarkan diagram "Isi Piringku", mengapa menu tersebut belum termasuk makanan bergizi seimbang?',
    options: [
      { id: 'A', text: 'Karena semua bahan makanan tersebut hanya mengandung karbohidrat tanpa protein, vitamin, dan mineral' },
      { id: 'B', text: 'Karena nasi putih dan kentang tidak boleh dimakan pada pagi hari' },
      { id: 'C', text: 'Karena menu tersebut terlalu banyak mengandung serat dan air putih' },
      { id: 'D', text: 'Karena tidak mengandung lemak jenuh yang tinggi' },
    ],
    correctAnswer: 'A',
    explanation:
      'Nasi, mi, dan kentang ketiganya merupakan sumber karbohidrat. Menu seimbang harus dilengkapi sumber protein (lauk pauk), serta vitamin dan serat (sayur dan buah).',
  },
  {
    id: 17,
    type: 'pg',
    topic: 'Gangguan Sistem Pencernaan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Fathin sering melewatkan sarapan dan terlambat makan siang hingga perutnya terasa perih serta mual. Dokter menyatakan Fathin mengalami peningkatan asam lambung yang mengiritasi dinding lambung. Gangguan tersebut dinamakan...',
    options: [
      { id: 'A', text: 'Diare' },
      { id: 'B', text: 'Maag (gastritis)' },
      { id: 'C', text: 'Sembelit' },
      { id: 'D', text: 'Apendisitis' },
    ],
    correctAnswer: 'B',
    explanation:
      'Maag atau gastritis adalah peradangan atau iritasi pada dinding lambung yang dipicu naiknya asam lambung, biasanya karena pola makan tidak teratur atau terlalu banyak makanan pedas/asam.',
  },
  {
    id: 18,
    type: 'pg',
    topic: 'Gangguan Sistem Pencernaan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L1',
    text: 'Seseorang mengalami kesulitan buang air besar karena feses menjadi sangat keras dan kering. Gangguan pencernaan ini disebut sembelit (konstipasi) yang disebabkan oleh...',
    options: [
      { id: 'A', text: 'Kelebihan mengonsumsi buah pepaya dan air putih' },
      { id: 'B', text: 'Kurang mengonsumsi makanan berserat dan kurang minum air putih' },
      { id: 'C', text: 'Terlalu sering makan makanan yang mengandung protein nabati' },
      { id: 'D', text: 'Infeksi bakteri pada saluran pernapasan bagian atas' },
    ],
    correctAnswer: 'B',
    explanation:
      'Sembelit (konstipasi) terjadi karena usus besar menyerap terlalu banyak air dari feses akibat kurang asupan serat (sayur dan buah) serta kurang minum air putih.',
  },
  {
    id: 19,
    type: 'pg',
    topic: 'Gangguan Sistem Pencernaan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Rehan jajan makanan di pinggir jalan yang tidak tertutup dan sering dihinggapi lalat. Keesokan harinya ia buang air besar terus-menerus dengan feses encer. Pertolongan pertama yang paling tepat diberikan kepada Rehan agar tidak kekurangan cairan adalah...',
    options: [
      { id: 'A', text: 'Memberikan minuman bersoda dingin dan makanan pedas' },
      { id: 'B', text: 'Memberikan larutan oralit (campuran air matang, gula, dan garam)' },
      { id: 'C', text: 'Membiarkannya berpuasa tidak minum sepanjang hari' },
      { id: 'D', text: 'Memberikan obat penurun panas tanpa minum air' },
    ],
    correctAnswer: 'B',
    explanation:
      'Diare menyebabkan tubuh kehilangan banyak cairan dan elektrolit (dehidrasi). Pemberian oralit sangat penting sebagai pertolongan pertama untuk menggantikan cairan dan garam tubuh yang hilang.',
  },
  {
    id: 20,
    type: 'pg',
    topic: 'Gangguan Sistem Pencernaan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    levelKognitif: 'L2',
    text: 'Apendisitis adalah gangguan pencernaan berupa peradangan pada bagian umbai cacing yang menimbulkan rasa nyeri hebat di perut bagian kanan bawah. Organ tempat melekatnya umbai cacing tersebut adalah...',
    options: [
      { id: 'A', text: 'Pangkal kerongkongan' },
      { id: 'B', text: 'Pangkal lambung' },
      { id: 'C', text: 'Pangkal usus besar (sekum)' },
      { id: 'D', text: 'Ujung pankreas' },
    ],
    correctAnswer: 'C',
    explanation:
      'Umbai cacing (apendiks/usus buntu) terletak pada pangkal usus besar (sekum) di bagian kanan bawah perut. Peradangannya disebut apendisitis.',
  },

  // ============================================================================
  // 2. SISTEM PERNAPASAN PADA MANUSIA (20 Soal: Nomor 21 - 40)
  // ============================================================================
  {
    id: 21,
    type: 'pg',
    topic: 'Organ Pernapasan Manusia',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    imageSvg: buildRespiratorySystemSvg(),
    text: 'Perhatikan skema organ pernapasan manusia di atas! Bagian yang ditunjukkan oleh nomor 2 dan nomor 3 secara berurutan adalah...',
    options: [
      { id: 'A', text: 'Rongga hidung dan faring' },
      { id: 'B', text: 'Trakea (batang tenggorokan) dan bronkus' },
      { id: 'C', text: 'Bronkiolus dan alveolus' },
      { id: 'D', text: 'Laring dan diafragma' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada skema: nomor 1 rongga hidung, nomor 2 trakea (batang tenggorokan), nomor 3 bronkus (cabang tenggorokan), nomor 4 paru-paru, dan nomor 5 diafragma.',
  },
  {
    id: 22,
    type: 'pg',
    topic: 'Organ Pernapasan Manusia',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    imageSvg: buildRespiratorySystemSvg(),
    text: 'Berdasarkan gambar organ pernapasan tersebut, organ yang tersusun atas cincin-cincin tulang rawan agar saluran udara selalu terbuka serta memiliki selaput lendir penangkap debu adalah nomor...',
    options: [
      { id: 'A', text: 'Nomor 1' },
      { id: 'B', text: 'Nomor 2' },
      { id: 'C', text: 'Nomor 4' },
      { id: 'D', text: 'Nomor 5' },
    ],
    correctAnswer: 'B',
    explanation:
      'Trakea (nomor 2) berbentuk pipa yang diperkuat cincin-cincin tulang rawan agar tidak mudah kempis dan memiliki rambut getar (silia) untuk menolak debu atau kotoran.',
  },
  {
    id: 23,
    type: 'pg',
    topic: 'Organ Pernapasan Manusia',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Urutan aliran udara yang masuk ke dalam tubuh saat manusia menghirup napas (inspirasi) adalah...',
    options: [
      { id: 'A', text: 'Rongga hidung → faring → laring → trakea → bronkus → bronkiolus → alveolus' },
      { id: 'B', text: 'Rongga hidung → kerongkongan → trakea → bronkus → alveolus' },
      { id: 'C', text: 'Rongga hidung → trakea → faring → bronkiolus → bronkus → alveolus' },
      { id: 'D', text: 'Rongga hidung → laring → alveolus → bronkus → paru-paru' },
    ],
    correctAnswer: 'A',
    explanation:
      'Udara masuk melalui rongga hidung, melewati faring (tekak), laring (pangkal tenggorokan), trakea (batang tenggorokan), bronkus, bronkiolus, hingga sampai di alveolus paru-paru.',
  },
  {
    id: 24,
    type: 'pg',
    topic: 'Organ Pernapasan Manusia',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Di dalam pangkal tenggorokan (laring) terdapat bagian yang bergetar ketika dilewati udara sehingga manusia dapat menghasilkan suara. Bagian tersebut adalah...',
    options: [
      { id: 'A', text: 'Katup epiglotis' },
      { id: 'B', text: 'Pita suara' },
      { id: 'C', text: 'Rambut hidung' },
      { id: 'D', text: 'Pleura' },
    ],
    correctAnswer: 'B',
    explanation:
      'Laring atau kotak suara memiliki pita suara yang bergetar saat udara keluar dari paru-paru sehingga menimbulkan bunyi/suara.',
  },
  {
    id: 25,
    type: 'pg',
    topic: 'Proses pada Organ Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Bernapas melalui hidung jauh lebih sehat dibandingkan bernapas melalui mulut karena di dalam rongga hidung udara mengalami tiga proses penting, yaitu...',
    options: [
      { id: 'A', text: 'Disaring kotorannya, dihangatkan suhunya, dan diatur kelembapannya' },
      { id: 'B', text: 'Diubah langsung menjadi karbon dioksida dan uap air' },
      { id: 'C', text: 'Dicampur dengan enzim pencernaan sebelum masuk paru-paru' },
      { id: 'D', text: 'Didinginkan hingga membeku agar kuman mati' },
    ],
    correctAnswer: 'A',
    explanation:
      'Rongga hidung memiliki rambut hidung untuk menyaring debu, selaput lendir untuk melembapkan udara, serta pembuluh darah untuk menghangatkan udara sesuai suhu tubuh.',
  },
  {
    id: 26,
    type: 'pg',
    topic: 'Proses pada Organ Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Saat makan sambil berbicara keras, seseorang mudah tersedak. Hal ini terjadi karena katup yang mencegah makanan masuk ke saluran tenggorokan (trakea) tidak menutup sempurna. Nama katup tersebut adalah...',
    options: [
      { id: 'A', text: 'Pleura' },
      { id: 'B', text: 'Epiglotis' },
      { id: 'C', text: 'Diafragma' },
      { id: 'D', text: 'Vili' },
    ],
    correctAnswer: 'B',
    explanation:
      'Epiglotis adalah katup tulang rawan di pangkal tenggorokan yang menutup saluran napas saat kita menelan makanan agar makanan masuk ke kerongkongan, bukan ke tenggorokan.',
  },
  {
    id: 27,
    type: 'pg',
    topic: 'Proses pada Organ Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Di dalam trakea terdapat silia (rambut getar halus). Ketika ada debu atau benda asing kecil masuk melewati hidung, reaksi yang dilakukan oleh sistem pernapasan kita adalah...',
    options: [
      { id: 'A', text: 'Mendorong debu masuk lebih dalam ke alveolus' },
      { id: 'B', text: 'Menyaring dan mendorong kotoran keluar dengan batuk atau bersin' },
      { id: 'C', text: 'Melarutkan debu ke dalam pembuluh darah kapiler' },
      { id: 'D', text: 'Mengubah debu menjadi oksigen bagi paru-paru' },
    ],
    correctAnswer: 'B',
    explanation:
      'Silia pada trakea bergerak menyapu lendir yang menjerat debu ke atas, lalu dikeluarkan melalui refleks batuk atau bersin.',
  },
  {
    id: 28,
    type: 'pg',
    topic: 'Proses pada Organ Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    imageSvg: buildAlveolusSvg(),
    text: 'Perhatikan gambar pertukaran gas di dalam alveolus di atas! Gas X yang masuk dari rongga alveolus ke dalam pembuluh kapiler darah dan Gas Y yang dilepaskan dari darah berturut-turut adalah...',
    options: [
      { id: 'A', text: 'Nitrogen dan Oksigen' },
      { id: 'B', text: 'Karbon dioksida dan Oksigen' },
      { id: 'C', text: 'Oksigen dan Karbon dioksida' },
      { id: 'D', text: 'Uap air dan Nitrogen' },
    ],
    correctAnswer: 'C',
    explanation:
      'Di alveolus terjadi pertukaran gas secara difusi: oksigen (Gas X) masuk ke pembuluh darah untuk diedarkan ke seluruh tubuh, sedangkan karbon dioksida (Gas Y) dilepas dari darah ke alveolus untuk diembuskan.',
  },
  {
    id: 29,
    type: 'pg',
    topic: 'Mekanisme Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    imageSvg: buildBreathingMechanismSvg(),
    text: 'Perhatikan diagram mekanisme pernapasan perut pada gambar! Saat terjadi Proses A (inspirasi/menarik napas), kondisi otot diafragma adalah...',
    options: [
      { id: 'A', text: 'Berkontraksi sehingga posisinya mendatar' },
      { id: 'B', text: 'Berelaksasi sehingga melengkung ke atas' },
      { id: 'C', text: 'Berhenti bergerak sehingga paru-paru mengecil' },
      { id: 'D', text: 'Mendorong udara keluar dari paru-paru' },
    ],
    correctAnswer: 'A',
    explanation:
      'Saat menarik napas (inspirasi) pada pernapasan perut, otot diafragma berkontraksi sehingga menjadi datar, rongga dada membesar, tekanan udara di paru-paru turun, dan udara luar masuk.',
  },
  {
    id: 30,
    type: 'pg',
    topic: 'Mekanisme Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    imageSvg: buildBreathingMechanismSvg(),
    text: 'Berdasarkan gambar mekanisme pernapasan tersebut, pernyataan yang benar mengenai Proses B (mengembuskan napas) adalah...',
    options: [
      { id: 'A', text: 'Diafragma berkontraksi, rongga dada membesar, udara masuk' },
      { id: 'B', text: 'Diafragma relaksasi melengkung ke atas, rongga dada mengecil, udara keluar' },
      { id: 'C', text: 'Tulang rusuk terangkat ke atas sehingga tekanan paru-paru mengecil' },
      { id: 'D', text: 'Paru-paru mengembang untuk menampung oksigen lebih banyak' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada saat ekspirasi (Proses B), diafragma berelaksasi dan melengkung ke atas, volume rongga dada mengecil, tekanan udara di paru-paru meningkat, sehingga udara terdorong keluar.',
  },
  {
    id: 31,
    type: 'pg',
    topic: 'Mekanisme Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Pada mekanisme pernapasan dada saat inspirasi (menghirup udara), otot antartulang rusuk berkontraksi. Akibat yang langsung terjadi setelah kontraksi otot tersebut adalah...',
    options: [
      { id: 'A', text: 'Tulang rusuk turun, rongga dada menyempit, udara keluar' },
      { id: 'B', text: 'Tulang rusuk terangkat, rongga dada membesar, udara masuk ke paru-paru' },
      { id: 'C', text: 'Diafragma melengkung ke bawah sehingga perut mengempis' },
      { id: 'D', text: 'Tekanan udara dalam paru-paru menjadi lebih tinggi daripada udara luar' },
    ],
    correctAnswer: 'B',
    explanation:
      'Kontraksi otot antartulang rusuk membuat tulang rusuk terangkat dan rongga dada membesar. Akibatnya tekanan udara dalam paru-paru menjadi lebih kecil dari udara luar sehingga udara masuk.',
  },
  {
    id: 32,
    type: 'pg',
    topic: 'Mekanisme Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Setelah berlari mengelilingi lapangan olahraga, frekuensi pernapasan kita menjadi lebih cepat dan dalam dibandingkan saat duduk tenang. Hal tersebut bertujuan untuk...',
    options: [
      { id: 'A', text: 'Mengurangi jumlah oksigen di dalam otot kaki' },
      { id: 'B', text: 'Memenuhi kebutuhan oksigen tubuh yang meningkat untuk menghasilkan energi' },
      { id: 'C', text: 'Menyimpan karbon dioksida lebih lama di paru-paru' },
      { id: 'D', text: 'Menghentikan denyut jantung agar tidak kelelahan' },
    ],
    correctAnswer: 'B',
    explanation:
      'Saat beraktivitas berat seperti berlari, sel-sel otot memerlukan lebih banyak energi sehingga tubuh membutuhkan pasokan oksigen lebih banyak dan membuang karbon dioksida lebih cepat.',
  },
  {
    id: 33,
    type: 'pg',
    topic: 'Gangguan Sistem Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Penyakit pernapasan berupa penyempitan saluran napas yang menyebabkan penderitanya sesak napas dan berbunyi mengi, biasanya dipicu oleh alergi debu, bulu hewan, atau udara dingin disebut...',
    options: [
      { id: 'A', text: 'Influenza' },
      { id: 'B', text: 'Asma' },
      { id: 'C', text: 'Tuberkulosis (TBC)' },
      { id: 'D', text: 'Pneumonia' },
    ],
    correctAnswer: 'B',
    explanation:
      'Asma adalah gangguan penyempitan saluran pernapasan (bronkus/bronkiolus) akibat peradangan dan alergi terhadap pemicu seperti debu, asap, serbuk sari, atau udara dingin.',
  },
  {
    id: 34,
    type: 'pg',
    topic: 'Gangguan Sistem Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Tuberkulosis (TBC) merupakan penyakit paru-paru menular yang ditandai batuk berdahak berkepanjangan dan penurunan berat badan. Penyebab utama penyakit TBC adalah infeksi bakteri...',
    options: [
      { id: 'A', text: 'Escherichia coli' },
      { id: 'B', text: 'Salmonella typhi' },
      { id: 'C', text: 'Mycobacterium tuberculosis' },
      { id: 'D', text: 'Virus Influenza' },
    ],
    correctAnswer: 'C',
    explanation:
      'TBC disebabkan oleh infeksi bakteri Mycobacterium tuberculosis yang menyerang paru-paru dan menular melalui percikan dahak/udara saat penderita batuk atau bersin.',
  },
  {
    id: 35,
    type: 'pg',
    topic: 'Gangguan Sistem Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Penyakit influenza (flu) yang menyebabkan hidung tersumbat, bersin, dan demam ringan disebabkan oleh...',
    options: [
      { id: 'A', text: 'Infeksi virus pada saluran pernapasan' },
      { id: 'B', text: 'Kekurangan vitamin C dalam makanan' },
      { id: 'C', text: 'Rusaknya katup epiglotis di kerongkongan' },
      { id: 'D', text: 'Penumpukan lemak pada usus halus' },
    ],
    correctAnswer: 'A',
    explanation:
      'Influenza disebabkan oleh infeksi virus influenza yang menyerang hidung, tenggorokan, dan saluran pernapasan.',
  },
  {
    id: 36,
    type: 'pg',
    topic: 'Gangguan Sistem Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Pneumonia (radang paru-paru) sangat berbahaya bagi pernapasan karena infeksi bakteri atau virus menyebabkan kantong-kantong udara di paru-paru terisi cairan atau nanah. Kantong udara yang terdampak tersebut adalah...',
    options: [
      { id: 'A', text: 'Trakea' },
      { id: 'B', text: 'Laring' },
      { id: 'C', text: 'Alveolus' },
      { id: 'D', text: 'Sinus hidung' },
    ],
    correctAnswer: 'C',
    explanation:
      'Pada penderita pneumonia, peradangan terjadi di alveolus sehingga terisi cairan atau nanah yang menghambat masuknya oksigen ke dalam darah.',
  },
  {
    id: 37,
    type: 'pg',
    topic: 'Gangguan Sistem Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Asap rokok sangat berbahaya baik bagi perokok aktif maupun perokok pasif di sekitarnya. Zat beracun dalam asap rokok yang dapat mengikat hemoglobin darah lebih kuat daripada oksigen sehingga mengurangi pasokan oksigen tubuh adalah...',
    options: [
      { id: 'A', text: 'Uap air' },
      { id: 'B', text: 'Karbon monoksida (CO)' },
      { id: 'C', text: 'Nitrogen murni' },
      { id: 'D', text: 'Vitamin D' },
    ],
    correctAnswer: 'B',
    explanation:
      'Gas karbon monoksida (CO) pada asap rokok dan asap kendaraan bermotor mengikat hemoglobin jauh lebih kuat dibanding oksigen sehingga sel tubuh kekurangan oksigen.',
  },
  {
    id: 38,
    type: 'pg',
    topic: 'Menjaga Kesehatan Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Saat melintasi jalan raya yang berdebu atau wilayah terdampak asap pembakaran sampah, tindakan sederhana paling tepat untuk melindungi organ pernapasan adalah...',
    options: [
      { id: 'A', text: 'Menggunakan masker penutup hidung dan mulut' },
      { id: 'B', text: 'Bernapas menggunakan mulut secara terus-menerus' },
      { id: 'C', text: 'Berlari cepat agar cepat melewati asap tanpa masker' },
      { id: 'D', text: 'Menutup mata saja sambil menghirup napas dalam-dalam' },
    ],
    correctAnswer: 'A',
    explanation:
      'Menggunakan masker membantu menyaring partikel debu halus, asap, dan kuman di udara agar tidak masuk ke saluran pernapasan.',
  },
  {
    id: 39,
    type: 'pg',
    topic: 'Menjaga Kesehatan Pernapasan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L1',
    text: 'Menanam banyak pohon dan tanaman hijau di halaman sekolah serta lingkungan rumah sangat bermanfaat bagi kesehatan pernapasan manusia karena tumbuhan menghasilkan...',
    options: [
      { id: 'A', text: 'Gas karbon monoksida saat siang hari' },
      { id: 'B', text: 'Gas oksigen melalui proses fotosintesis' },
      { id: 'C', text: 'Asap dan debu halus untuk menyaring udara' },
      { id: 'D', text: 'Gas karbon dioksida dalam jumlah besar di siang hari' },
    ],
    correctAnswer: 'B',
    explanation:
      'Tumbuhan hijau menyerap karbon dioksida dan melepaskan oksigen saat fotosintesis di siang hari sehingga udara menjadi lebih segar dan sehat bagi pernapasan.',
  },
  {
    id: 40,
    type: 'pg',
    topic: 'Menjaga Kesehatan Pernapasan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    levelKognitif: 'L2',
    text: 'Salah satu cara menjaga kesehatan sistem pernapasan di rumah adalah membuka jendela kamar setiap pagi. Manfaat utama dari kebiasaan tersebut adalah...',
    options: [
      { id: 'A', text: 'Membuat udara pengap tergantikan sirkulasi udara segar dan sinar matahari membunuh kuman' },
      { id: 'B', text: 'Mengumpulkan debu dari jalan raya agar masuk ke ruang tidur' },
      { id: 'C', text: 'Meningkatkan kadar karbon dioksida di dalam kamar tidur' },
      { id: 'D', text: 'Membuat suhu ruangan menjadi lembap dan berjamur' },
    ],
    correctAnswer: 'A',
    explanation:
      'Ventilasi udara yang baik memastikan pertukaran udara pengap dengan udara bersih kaya oksigen serta membantu sinar matahari masuk mengurangi kelembapan berlebih dan kuman.',
  },

  // ============================================================================
  // 3. JEJAK SANG PAHLAWAN (10 Soal: Nomor 41 - 50)
  // ============================================================================
  {
    id: 41,
    type: 'pg',
    topic: 'Daerahku di Masa Penjajahan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    text: 'Salah satu tujuan utama kedatangan bangsa-bangsa Eropa (seperti Portugis dan Belanda) ke wilayah Nusantara pada masa lalu adalah menguasai perdagangan hasil alam bernilai tinggi, yaitu...',
    options: [
      { id: 'A', text: 'Minyak bumi dan batu bara' },
      { id: 'B', text: 'Rempah-rempah seperti cengkih, pala, dan lada' },
      { id: 'C', text: 'Barang elektronik dan kendaraan bermotor' },
      { id: 'D', text: 'Kertas dan mesin percetakan modern' },
    ],
    correctAnswer: 'B',
    explanation:
      'Nusantara sangat kaya rempah-rempah (cengkih, pala, lada) yang harganya sangat mahal di Eropa. Kekayaan alam inilah yang menarik bangsa Eropa datang hingga melakukan monopoli (Gold).',
  },
  {
    id: 42,
    type: 'pg',
    topic: 'Daerahku di Masa Penjajahan',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    text: 'Pada masa penjajahan Belanda, rakyat Indonesia mengalami penderitaan berat akibat sistem kerja paksa membangun jalan dan benteng tanpa upah yang layak. Sistem kerja paksa di masa Belanda dikenal dengan istilah...',
    options: [
      { id: 'A', text: 'Gotong royong' },
      { id: 'B', text: 'Kerja rodi' },
      { id: 'C', text: 'Transmigrasi' },
      { id: 'D', text: 'Politik etis' },
    ],
    correctAnswer: 'B',
    explanation:
      'Kerja rodi adalah sistem kerja paksa pada masa penjajahan Belanda (terutama saat pemerintahan Daendels membangun Jalan Raya Pos Anyer–Panarukan) yang menyengsarakan rakyat.',
  },
  {
    id: 43,
    type: 'pg',
    topic: 'Daerahku di Masa Penjajahan',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L2',
    text: 'Kebijakan "Tanam Paksa" (Cultuurstelsel) yang diterapkan pemerintah kolonial Belanda membuat rakyat di berbagai daerah semakin menderita karena...',
    options: [
      { id: 'A', text: 'Petani bebas menjual seluruh hasil panennya dengan harga tinggi ke negara mana saja' },
      { id: 'B', text: 'Rakyat dipaksa menanam tanaman ekspor seperti kopi dan tebu untuk Belanda hingga kekurangan pangan' },
      { id: 'C', text: 'Belanda membangun sekolah gratis untuk seluruh anak petani di pedesaan' },
      { id: 'D', text: 'Pajak tanah rakyat dihapuskan sepenuhnya oleh pemerintah kolonial' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada sistem Tanam Paksa (1830), rakyat dipaksa menyediakan lahan dan tenaga untuk menanam tanaman ekspor bagi Belanda (kopi, teh, tebu, nila) sehingga sawah pangan terbengkalai dan terjadi kelaparan.',
  },
  {
    id: 44,
    type: 'pg',
    topic: 'Pahlawan Daerahku',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    text: 'Perlawanan heroik rakyat Bali terhadap penjajahan Belanda dikenal dengan semangat "Puputan". Makna istilah Puputan dalam perjuangan rakyat Bali adalah...',
    options: [
      { id: 'A', text: 'Perjanjian damai dengan menyerahkan wilayah kerajaan kepada penjajah' },
      { id: 'B', text: 'Berperang habis-habisan sampai titik darah penghabisan demi kehormatan dan tanah air' },
      { id: 'C', text: 'Mengungsi ke luar pulau untuk menghindari serangan musuh' },
      { id: 'D', text: 'Membayar upeti tahunan agar kerajaan tidak diserang' },
    ],
    correctAnswer: 'B',
    explanation:
      'Puputan berarti pertempuran habis-habisan hingga titik darah penghabisan lebih baik gugur daripada menyerah kepada penjajah, seperti dalam Puputan Jagaraga, Badung, Klungkung, dan Margarana.',
  },
  {
    id: 45,
    type: 'pg',
    topic: 'Pahlawan Daerahku',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L2',
    imageSvg: buildHistoryTimelineSvg(),
    text: 'Perhatikan linimasa sejarah perjuangan pada gambar! Peristiwa X yang terjadi pada 20 November 1946 di Kabupaten Tabanan, Bali dan dipimpin oleh I Gusti Ngurah Rai adalah...',
    options: [
      { id: 'A', text: 'Perang Jagaraga' },
      { id: 'B', text: 'Puputan Margarana' },
      { id: 'C', text: 'Bandung Lautan Api' },
      { id: 'D', text: 'Pertempuran Surabaya' },
    ],
    correctAnswer: 'B',
    explanation:
      'Pada tanggal 20 November 1946 terjadi Pertempuran Puputan Margarana di Desa Marga, Tabanan, Bali yang dipimpin oleh Kolonel I Gusti Ngurah Rai bersama Pasukan Ciung Wanara.',
  },
  {
    id: 46,
    type: 'pg',
    topic: 'Pahlawan Daerahku',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    text: 'Pahlawan nasional asal Bali yang memimpin perlawanan rakyat Buleleng dalam Perang Jagaraga (1848–1849) dan dengan tegas menolak menghapus Hak Tawan Karang atas tuntutan Belanda adalah...',
    options: [
      { id: 'A', text: 'I Gusti Ketut Jelantik' },
      { id: 'B', text: 'Pangeran Diponegoro' },
      { id: 'C', text: 'Tuanku Imam Bonjol' },
      { id: 'D', text: 'Sultan Hasanuddin' },
    ],
    correctAnswer: 'A',
    explanation:
      'Patih I Gusti Ketut Jelantik adalah pemimpin perlawanan Kerajaan Buleleng dan kerajaan-kerajaan Bali dalam Perang Jagaraga melawan tentara kolonial Belanda.',
  },
  {
    id: 47,
    type: 'pg',
    topic: 'Pahlawan Daerahku',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L2',
    text: 'Perjuangan rakyat di berbagai daerah sebelum tahun 1908 seperti Perang Diponegoro, Perang Padri, dan Perang Aceh sering kali mengalami kegagalan menghadapi penjajah. Faktor utama penyebab kegagalan tersebut adalah...',
    options: [
      { id: 'A', text: 'Rakyat Indonesia tidak berani melawan tentara penjajah' },
      { id: 'B', text: 'Perjuangan masih bersifat kedaerahan dan belum bersatu secara nasional' },
      { id: 'C', text: 'Senjata penjajah tidak menggunakan peluru maupun meriam' },
      { id: 'D', text: 'Para pemimpin daerah tidak memiliki pengikut sama sekali' },
    ],
    correctAnswer: 'B',
    explanation:
      'Sebelum Kebangkitan Nasional 1908, perlawanan masih bersifat kedaerahan, terpisah-pisah, dan bergantung pada satu pemimpin sehingga mudah dipecah belah oleh Belanda (politik devide et impera).',
  },
  {
    id: 48,
    type: 'pg',
    topic: 'Pahlawan Daerahku',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    text: 'Cut Nyak Dien merupakan pahlawan wanita tangguh yang berjuang melawan penjajah Belanda di daerah...',
    options: [
      { id: 'A', text: 'Maluku' },
      { id: 'B', text: 'Aceh' },
      { id: 'C', text: 'Sulawesi Selatan' },
      { id: 'D', text: 'Jawa Tengah' },
    ],
    correctAnswer: 'B',
    explanation:
      'Cut Nyak Dien adalah pahlawan nasional dari Aceh yang terus memimpin perang gerilya melawan Belanda di hutan-hutan Aceh bersama Teuku Umar dan pasukannya.',
  },
  {
    id: 49,
    type: 'pg',
    topic: 'Warisan Pahlawan Masa Kini',
    difficulty: 'Mudah',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L1',
    imageSvg: buildHeroValuesSvg(),
    text: 'Perhatikan gambar empat nilai teladan pahlawan di atas! Contoh penerapan nilai nomor 3 (Persatuan & Gotong Royong) yang paling tepat dilakukan oleh siswa kelas VI di lingkungan sekolah adalah...',
    options: [
      { id: 'A', text: 'Memilih teman bermain hanya yang berasal dari suku yang sama' },
      { id: 'B', text: 'Bekerja sama membersihkan ruang kelas bersama seluruh teman tanpa membeda-bedakan' },
      { id: 'C', text: 'Menyontek jawaban teman saat ulangan harian agar nilai kelompok tinggi' },
      { id: 'D', text: 'Membiarkan teman piket sendirian karena bukan giliran sendiri' },
    ],
    correctAnswer: 'B',
    explanation:
      'Persatuan dan gotong royong diwujudkan melalui kerja sama membersihkan kelas, saling membantu tanpa membedakan suku, agama, atau latar belakang.',
  },
  {
    id: 50,
    type: 'pg',
    topic: 'Warisan Pahlawan Masa Kini',
    difficulty: 'Sedang',
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    levelKognitif: 'L2',
    text: 'Sebagai pelajar di era kemerdekaan saat ini, cara terbaik untuk meneruskan semangat juang dan menghargai warisan para pahlawan bangsa adalah...',
    options: [
      { id: 'A', text: 'Belajar dengan tekun, berprestasi, disiplin, serta merawat peninggalan sejarah bangsa' },
      { id: 'B', text: 'Bermain gim sepanjang hari tanpa memedulikan tugas sekolah' },
      { id: 'C', text: 'Mencoret-coret dinding monumen perjuangan sebagai tanda kunjungan' },
      { id: 'D', text: 'Menghafal nama pahlawan hanya saat menjelang ujian saja' },
    ],
    correctAnswer: 'A',
    explanation:
      'Pelajar masa kini mengisi kemerdekaan dengan belajar sungguh-sungguh, bersikap disiplin, menjaga persatuan, dan ikut melestarikan situs serta monumen bersejarah.',
  },
];

export const KISI_KISI_MAP: Record<number, KisiKisiEntry> = {
  1: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi organ-organ penyusun sistem pencernaan manusia.',
    indikatorSoal: 'Disajikan skema organ pencernaan manusia bernomor, peserta didik dapat menentukan nama organ nomor 3 dan 4 dengan tepat.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  2: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menghubungkan organ pencernaan dengan fungsinya.',
    indikatorSoal: 'Disajikan skema organ pencernaan manusia, peserta didik dapat menunjukkan nomor organ tempat penyerapan air dan pembusukan sisa makanan.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  3: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengurutkan saluran pencernaan manusia secara runtut.',
    indikatorSoal: 'Peserta didik dapat menentukan urutan jalannya makanan pada organ pencernaan manusia dari mulut hingga anus.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  4: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan fungsi organ pencernaan di rongga mulut.',
    indikatorSoal: 'Peserta didik dapat mengidentifikasi fungsi utama lidah dalam proses pencernaan di rongga mulut.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  5: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan peran kelenjar pencernaan pelengkap.',
    indikatorSoal: 'Peserta didik dapat menentukan fungsi cairan empedu yang dihasilkan hati dalam membantu pencernaan lemak.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  6: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat membedakan pencernaan mekanik dan kimiawi.',
    indikatorSoal: 'Disajikan contoh proses pengunyahan oleh gigi, peserta didik dapat mengidentifikasi jenis pencernaan mekanik.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  7: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan proses yang terjadi pada kerongkongan.',
    indikatorSoal: 'Disajikan gambar gerakan otot kerongkongan, peserta didik dapat mengidentifikasi nama gerak peristaltik.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  8: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menganalisis peran enzim dalam pencernaan kimiawi.',
    indikatorSoal: 'Disajikan fenomena rasa manis saat mengunyah nasi lama, peserta didik dapat menentukan enzim amilase yang berperan.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  9: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan fungsi zat kimia di lambung.',
    indikatorSoal: 'Peserta didik dapat menentukan fungsi utama asam klorida (HCl) dalam membunuh kuman di lambung.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  10: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menganalisis adaptasi struktur usus halus dalam penyerapan gizi.',
    indikatorSoal: 'Peserta didik dapat menjelaskan fungsi vili (jonjot usus) pada dinding usus halus dalam memperluas bidang penyerapan.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  11: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi sumber dan fungsi zat gizi karbohidrat.',
    indikatorSoal: 'Disajikan contoh makanan pokok seperti nasi dan jagung, peserta didik dapat menentukan zat gizi sumber energi utamanya.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  12: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi fungsi zat gizi protein bagi pertumbuhan.',
    indikatorSoal: 'Peserta didik dapat menentukan zat gizi yang berfungsi sebagai zat pembangun dan pengganti sel rusak.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  13: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengaitkan kekurangan vitamin tertentu dengan dampaknya.',
    indikatorSoal: 'Disajikan contoh sumber vitamin A, peserta didik dapat menentukan gangguan akibat kekurangan vitamin A.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  14: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengaitkan kekurangan mineral dengan gangguan kesehatan.',
    indikatorSoal: 'Disajikan gejala anemia (lemas, pucat), peserta didik dapat menentukan jenis mineral yang dibutuhkan tubuh.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  15: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat membaca komposisi makanan bergizi seimbang.',
    indikatorSoal: 'Disajikan diagram "Isi Piringku", peserta didik dapat menentukan komposisi yang mengisi setengah piring makan.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  16: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengevaluasi menu makanan berdasarkan prinsip gizi seimbang.',
    indikatorSoal: 'Disajikan ilustrasi menu yang hanya berisi karbohidrat dan diagram Isi Piringku, peserta didik dapat menjelaskan alasan menu belum seimbang.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  17: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi gangguan pencernaan beserta penyebabnya.',
    indikatorSoal: 'Disajikan kasus siswa terlambat makan hingga perut perih, peserta didik dapat menentukan gangguan maag (gastritis).',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  18: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menentukan penyebab gangguan sembelit.',
    indikatorSoal: 'Disajikan kondisi feses keras pada sembelit, peserta didik dapat menentukan faktor penyebabnya.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  19: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat menentukan langkah penanganan pertama gangguan diare.',
    indikatorSoal: 'Disajikan kasus anak mengalami diare akibat jajan sembarangan, peserta didik dapat memilih pemberian oralit sebagai pertolongan pertama.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  20: {
    elemen: 'Pemahaman IPAS (Sistem Pencernaan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi gangguan peradangan pada umbai cacing.',
    indikatorSoal: 'Disajikan gejala apendisitis, peserta didik dapat menentukan letak organ umbai cacing pada pangkal usus besar.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  21: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi organ-organ sistem pernapasan manusia.',
    indikatorSoal: 'Disajikan skema organ pernapasan manusia bernomor, peserta didik dapat menentukan nama organ nomor 2 dan 3.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  22: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menghubungkan ciri struktur organ pernapasan dengan nomor pada gambar.',
    indikatorSoal: 'Disajikan skema organ pernapasan manusia, peserta didik dapat menunjukkan nomor trakea yang memiliki cincin tulang rawan.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  23: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengurutkan jalur aliran udara pernapasan manusia.',
    indikatorSoal: 'Peserta didik dapat menentukan urutan masuknya udara pernapasan dari rongga hidung hingga alveolus.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  24: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi bagian penghasil suara pada laring.',
    indikatorSoal: 'Peserta didik dapat menentukan nama pita suara sebagai bagian pada laring yang menghasilkan suara.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  25: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan proses yang terjadi di rongga hidung.',
    indikatorSoal: 'Peserta didik dapat mengidentifikasi tiga proses penyesuaian udara di rongga hidung (disaring, dihangatkan, dilembapkan).',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  26: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan fungsi katup epiglotis pada saluran napas dan makan.',
    indikatorSoal: 'Disajikan peristiwa tersedak saat makan sambil berbicara, peserta didik dapat menentukan peran katup epiglotis.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  27: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan fungsi rambut getar (silia) di trakea.',
    indikatorSoal: 'Peserta didik dapat menentukan mekanisme pertahanan trakea terhadap debu melalui refleks batuk atau bersin.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  28: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi pertukaran gas di alveolus.',
    indikatorSoal: 'Disajikan diagram pertukaran gas di alveolus dan kapiler darah, peserta didik dapat menentukan gas oksigen dan karbon dioksida.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  29: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan mekanisme inspirasi pernapasan perut.',
    indikatorSoal: 'Disajikan diagram pernapasan perut, peserta didik dapat menentukan kondisi diafragma yang berkontraksi mendatar saat menarik napas.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  30: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan mekanisme ekspirasi pernapasan perut.',
    indikatorSoal: 'Disajikan diagram pernapasan perut, peserta didik dapat menganalisis proses ekspirasi saat diafragma melengkung dan rongga dada mengecil.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  31: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan mekanisme pernapasan dada.',
    indikatorSoal: 'Disajikan kondisi kontraksi otot antartulang rusuk, peserta didik dapat menentukan terangkatnya tulang rusuk dan masuknya udara.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  32: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan pengaruh aktivitas fisik terhadap frekuensi napas.',
    indikatorSoal: 'Disajikan kasus napas terengah-engah setelah berlari, peserta didik dapat menentukan tujuan peningkatan pasokan oksigen.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  33: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi gangguan asma beserta pemicunya.',
    indikatorSoal: 'Disajikan gejala sesak napas berbunyi mengi akibat alergi debu, peserta didik dapat menentukan penyakit asma.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  34: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi penyebab penyakit TBC.',
    indikatorSoal: 'Disajikan gejala penyakit TBC, peserta didik dapat menentukan bakteri Mycobacterium tuberculosis sebagai penyebabnya.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  35: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi penyebab penyakit influenza.',
    indikatorSoal: 'Peserta didik dapat menentukan bahwa penyakit influenza disebabkan oleh infeksi virus.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  36: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi organ paru yang terdampak pneumonia.',
    indikatorSoal: 'Disajikan penjelasan penumpukan cairan akibat radang paru (pneumonia), peserta didik dapat menentukan bagian alveolus yang terdampak.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  37: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan bahaya gas beracun asap rokok bagi pernapasan.',
    indikatorSoal: 'Peserta didik dapat menentukan gas karbon monoksida dalam asap rokok yang menghambat pengikatan oksigen oleh darah.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  38: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menerapkan cara menjaga kesehatan pernapasan dari polusi.',
    indikatorSoal: 'Disajikan kondisi lingkungan berdebu dan berasap, peserta didik dapat memilih penggunaan masker sebagai upaya perlindungan.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  39: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan manfaat penghijauan bagi sistem pernapasan.',
    indikatorSoal: 'Peserta didik dapat menjelaskan peran tumbuhan hijau dalam menghasilkan oksigen untuk pernapasan.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  40: {
    elemen: 'Pemahaman IPAS (Sistem Pernapasan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan pentingnya ventilasi rumah untuk kesehatan paru.',
    indikatorSoal: 'Disajikan kebiasaan membuka jendela di pagi hari, peserta didik dapat menentukan manfaatnya bagi sirkulasi udara bersih.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  41: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan faktor penarik kedatangan bangsa Eropa ke Nusantara.',
    indikatorSoal: 'Peserta didik dapat menentukan bahwa rempah-rempah merupakan komoditas utama yang dicari bangsa Eropa di Nusantara.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  42: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi kebijakan kerja paksa di masa penjajahan Belanda.',
    indikatorSoal: 'Peserta didik dapat menentukan istilah kerja rodi sebagai sistem kerja paksa masa penjajahan Belanda.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  43: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menganalisis dampak kebijakan Tanam Paksa bagi rakyat.',
    indikatorSoal: 'Peserta didik dapat menjelaskan alasan kebijakan Tanam Paksa menyebabkan penderitaan dan kekurangan pangan rakyat.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  44: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menjelaskan makna semangat Puputan dalam sejarah perjuangan di Bali.',
    indikatorSoal: 'Peserta didik dapat menentukan arti istilah Puputan sebagai perjuangan habis-habisan membela tanah air.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  45: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat mengidentifikasi peristiwa bersejarah Puputan Margarana di Bali.',
    indikatorSoal: 'Disajikan linimasa perjuangan bertanda 20 November 1946 di Margarana, peserta didik dapat menentukan nama peristiwanya.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  46: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat mengenal tokoh pahlawan daerah Bali dalam Perang Jagaraga.',
    indikatorSoal: 'Peserta didik dapat menentukan nama tokoh I Gusti Ketut Jelantik sebagai pemimpin perlawanan rakyat Buleleng.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  47: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menganalisis penyebab kegagalan perlawanan daerah sebelum 1908.',
    indikatorSoal: 'Peserta didik dapat menyimpulkan bahwa sifat kedaerahan dan kurangnya persatuan menjadi penyebab utama kegagalan perlawanan masa lalu.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
  48: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat mengenal tokoh pahlawan nasional wanita dari berbagai daerah.',
    indikatorSoal: 'Peserta didik dapat mengidentifikasi Aceh sebagai daerah asal perjuangan pahlawan nasional Cut Nyak Dien.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  49: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menerapkan nilai kepahlawanan dalam kehidupan sekolah.',
    indikatorSoal: 'Disajikan diagram nilai teladan pahlawan, peserta didik dapat memilih contoh sikap persatuan dan gotong royong di sekolah.',
    levelKognitif: 'L1',
    bobotSkor: 1,
  },
  50: {
    elemen: 'Pemahaman IPAS (Sejarah Perjuangan)',
    tujuanPembelajaran: 'Peserta didik dapat menunjukkan wujud penghargaan terhadap warisan pahlawan di masa kini.',
    indikatorSoal: 'Peserta didik dapat menentukan tindakan nyata pelajar dalam meneruskan semangat pahlawan dan menjaga peninggalan sejarah.',
    levelKognitif: 'L2',
    bobotSkor: 1,
  },
};
