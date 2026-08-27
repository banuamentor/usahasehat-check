# Bisnis Sehat

MASTER BUILD PROMPT

BUSINESS HEALTH CHECK UMKM

ROLE

Bertindaklah sebagai:

Senior Full-Stack Engineer

Senior Product Engineer

SaaS Architect

UX Engineer

Database Architect

Business Rules Engine Engineer

Product Designer

Expert pembangunan assessment platform

Tugas Anda adalah merancang dan membangun web application production-ready bernama sementara:

Business Health Check UMKM

Webapp ini membantu pelaku UMKM Indonesia:

mengecek kondisi kesehatan bisnis;

mendapatkan skor kesehatan usaha;

mengetahui bagian bisnis yang bermasalah;

mendapatkan peringatan risiko kritis;

menemukan 3 prioritas perbaikan utama;

mendapatkan rencana tindakan 30 hari;

melakukan assessment ulang untuk melihat perkembangan.

Produk ini harus terasa seperti:

“Medical check-up untuk bisnis UMKM.”

Bukan sekadar:

kuis → skor → selesai.

1. SOURCE OF TRUTH

Saya akan memberikan file:

PRD Business Health Check UMKM

Business Health Measurement Framework v0.2 Audit

dokumen project lain jika diperlukan.

Gunakan file tersebut sebagai:

SOURCE OF TRUTH

Prioritas referensi:

Measurement Framework
↓
PRD
↓
Build Prompt
↓
General knowledge


Jika terjadi perbedaan:

jangan diam-diam mengubah framework;

pertahankan data sumber;

tandai konflik;

gunakan keputusan yang paling eksplisit dalam source of truth.

JANGAN membuat sendiri:

pertanyaan assessment baru;

bobot dimensi baru;

threshold baru;

scoring baru;

diagnosis baru;

jika sudah tersedia dalam framework.

2. PRODUCT PHILOSOPHY

Core value produk:

ASSESS
↓
UNDERSTAND
↓
DIAGNOSE
↓
PRIORITIZE
↓
ACT
↓
REASSESS


Jangan membuat skor menjadi pusat pengalaman pengguna.

Urutan prioritas produk:

Diagnosis
>
Priority
>
Action
>
Score
>
Visualization


Radar chart hanyalah visual pendukung.

3. PRIMARY USER

Pelaku UMKM Indonesia

Sebagian pengguna:

tidak memahami istilah bisnis teknis;

melakukan pencatatan manual;

lebih sering menggunakan smartphone;

tidak terbiasa dengan dashboard kompleks;

bisa berasal dari berbagai tingkat pendidikan;

bisa menjalankan usaha mikro secara sendiri.

Karena itu:

USER-FACING LANGUAGE HARUS SEDERHANA.

Hindari di interface utama istilah:

ROI

cash flow

gross margin

customer retention

funnel

conversion rate

KPI

SOP

value proposition

working capital

jika ada istilah Indonesia yang lebih sederhana.

Contoh:

Jangan:

Bagaimana kondisi cash flow usaha Anda?

Gunakan:

Apakah uang usaha biasanya cukup untuk membayar kebutuhan rutin usaha?

4. SECONDARY USER

Webapp juga akan digunakan oleh:

pendamping UMKM;

inkubator bisnis;

pemerintah;

NGO;

program pemberdayaan usaha.

Mereka perlu melihat banyak UMKM dalam satu program.

Tetapi:

JANGAN MEMBUAT FITUR MENTOR MERUSAK KESEDERHANAAN MVP UMKM.

5. CORE BUSINESS HEALTH FRAMEWORK

Gunakan 7 dimensi berikut.

DimensiBobotKeuangan20%Penjualan15%Pelanggan15%Produk & Value Proposition15%Pemasaran10%Operasional15%Growth Readiness & Resilience10%TOTAL100%

Jangan mengubah bobot tanpa instruction eksplisit.

6. QUICK CHECK ASSESSMENT

MVP menggunakan:

±31 indikator inti

Target waktu:

sekitar 7–10 menit.

Setiap indikator berasal dari Measurement Framework.

Pertanyaan harus data-driven dari database/configuration layer.

Jangan hard-code pertanyaan langsung dalam React component.

Struktur ideal:

interface Question {
  id: string
  dimensionId: string
  indicatorId: string
  question: string
  helperText?: string

  answerType:
    | "single_choice"
    | "multiple_choice"
    | "number"
    | "currency"
    | "percentage"
    | "boolean"

  options?: AnswerOption[]

  weight: number

  applicabilityRule?: Rule

  branchingRule?: Rule

  redFlagRules?: Rule[]

  isRequired: boolean

  version: string
}


7. INTERNAL SCORING

Behavioural answer menggunakan backend score:

0 = belum ada / tidak dilakukan
1 = sangat lemah
2 = mulai dilakukan
3 = rutin dan terstruktur
4 = terukur dan digunakan untuk keputusan


PENTING:

JANGAN TAMPILKAN 0–4 KE USER.

User hanya melihat pilihan natural.

Contoh:

Pertanyaan

Apakah uang pribadi dan uang usaha sudah dipisahkan?

Opsi user

Masih selalu tercampur.

Sebagian besar masih tercampur.

Sudah mulai dipisahkan.

Sudah menggunakan uang/rekening terpisah.

Sudah terpisah dan pencatatannya juga jelas.

Backend:

0
1
2
3
4


8. PRE-ASSESSMENT BUSINESS PROFILE

Sebelum assessment, minta informasi minimal:

nama usaha;

nama pengguna;

produk / jasa / keduanya;

kategori usaha;

lama usaha;

jumlah orang yang bekerja;

kisaran omzet;

menggunakan bahan baku/stok atau tidak;

apakah repeat purchase relevan;

tahap usaha.

Tahap usaha:

Rintisan
Bertumbuh
Berkembang
Scale-up


Profil ini bukan data kosmetik.

Gunakan untuk:

applicability;

branching;

N/A;

owner dependency;

inventory;

repeat purchase;

legalitas.

9. BRANCHING ENGINE

Bangun rule engine reusable.

Jangan implementasi branching menggunakan ratusan:

if (question.id === "...")


di UI.

Gunakan rule structure.

Contoh:

{
  "all": [
    {
      "field": "business.has_inventory",
      "operator": "equals",
      "value": true
    }
  ]
}


Engine minimal mendukung:

equals
not_equals
greater_than
less_than
greater_or_equal
less_or_equal
in
not_in
exists


dan combinator:

ALL
ANY


10. IMPORTANT APPLICABILITY RULES

Repeat Purchase

Repeat purchase tidak selalu relevan.

Contoh:

wedding organizer;

furniture custom;

konstruksi;

proyek satu kali.

Jika tidak applicable:

CUS-02 = N/A


BUKAN:

CUS-02 = 0


11. INVENTORY

Pertanyaan stok/bahan baku hanya muncul jika bisnis mempunyai:

bahan baku;

inventory;

barang dagang;

stok produksi.

Untuk jasa murni tanpa inventory:

OPS-03 = N/A


12. OWNER DEPENDENCY

Usaha solo tidak otomatis dianggap tidak sehat.

Pertimbangkan:

team size
+
business stage
+
growth intent


Owner dependency menjadi risiko terutama ketika:

usaha sudah memiliki tim;

bisnis sedang berkembang;

order meningkat;

tetapi seluruh keputusan/proses tetap berhenti tanpa owner.

13. LEGALITY

Jangan menggunakan satu standar legalitas universal.

Legalitas harus bisa bersifat dinamis berdasarkan kategori usaha.

Buat architecture yang memungkinkan:

Business Category
↓
Applicable Legal Requirements
↓
User-owned Legalities
↓
Compliance Score


Untuk MVP, gunakan konfigurasi sederhana terlebih dahulu.

Jangan klaim legalitas sebagai keputusan hukum otomatis.

14. N/A NORMALIZATION

N/A tidak sama dengan skor nol.

Gunakan:

Dimension Score =
Σ(obtained point × indicator weight)
/
Σ(max point × applicable indicator weight)
× 100


Hanya indikator applicable yang masuk denominator.

Contoh:

Jika Customer mempunyai empat indikator:

CUS-01
CUS-02
CUS-03
CUS-04


tetapi:

CUS-02 = N/A


maka skor dihitung hanya dari:

CUS-01
CUS-03
CUS-04


Jangan menghukum user karena model bisnisnya berbeda.

15. DIMENSION SCORE

Hitung setiap dimensi 0–100.

Contoh result:

Keuangan        42
Penjualan       72
Pelanggan       58
Produk          81
Pemasaran       70
Operasional     61
Growth          49


16. OVERALL BUSINESS HEALTH SCORE

Formula:

Overall Score =
Finance × 0.20
+ Sales × 0.15
+ Customer × 0.15
+ Product × 0.15
+ Marketing × 0.10
+ Operations × 0.15
+ Growth × 0.10


Round secara konsisten.

Gunakan misalnya:

Math.round(score)


untuk display.

Simpan nilai presisi di database jika diperlukan.

17. HEALTH STATUS

Baseline:

0–39    Kritis
40–54   Rentan
55–69   Cukup Sehat
70–84   Sehat
85–100  Sangat Sehat


Simpan threshold di configuration/database.

JANGAN HARD-CODE ke banyak tempat.

Gunakan single source:

health_status_rules


18. CRITICAL HEALTH FLAG ENGINE

Overall score tidak boleh menutupi risiko serius.

Contoh:

Business Health Score = 78


tetapi:

Cash runway < 2 minggu


maka user tetap melihat:

RISIKO KRITIS

Critical Flags adalah layer terpisah.

Struktur:

interface CriticalFlag {
  id: string
  code: string
  name: string
  severity:
    | "critical"
    | "high"
    | "medium"
    | "low"

  dimensionId: string

  triggerRule: Rule

  userExplanation: string

  recommendation: string

  active: boolean
}


19. FIN-06 SPECIAL LOGIC

Bedakan:

Belum tahu berapa lama uang usaha cukup


dengan:

Uang hanya cukup <2 minggu


Keduanya dapat memiliki backend score serupa tetapi diagnosis berbeda.

Simpan:

answer semantic value


bukan hanya:

score = 0


Contoh:

{
  "score": 0,
  "value": "unknown"
}


versus:

{
  "score": 0,
  "value": "less_than_2_weeks"
}


Diagnosis:

unknown

Usaha belum mengetahui daya tahan kas.

less_than_2_weeks

Usaha memiliki risiko kas jangka pendek.

Ini WAJIB dipisahkan.

20. RESULT ENGINE

Setelah assessment selesai:

Answers
↓
Applicability Engine
↓
Indicator Score
↓
Dimension Scores
↓
Overall Score
↓
Critical Flags
↓
Diagnosis
↓
Priority Candidates
↓
Top 3 Priorities
↓
Action Plan


Jangan memasukkan AI sebelum deterministic layer selesai.

21. DETERMINISTIC VS AI

Pisahkan architecture.

DETERMINISTIC

Digunakan untuk:

scoring;

applicability;

branching;

N/A;

dimension score;

overall score;

health status;

critical flags;

priority candidates.

AI

Jika digunakan, hanya untuk:

menjelaskan diagnosis;

membuat bahasa lebih manusiawi;

cross-dimension insight;

menyesuaikan recommendation;

menyusun action plan.

AI tidak boleh mengubah:

score
flag
dimension
answer


22. MVP WITHOUT AI MUST STILL WORK

Ini requirement penting.

Jika AI API:

gagal;

timeout;

limit;

tidak tersedia;

webapp tetap menghasilkan:

score;

dimension result;

health status;

critical flags;

template diagnosis;

recommendation;

action plan template.

AI adalah enhancement.

Bukan dependency utama diagnostic engine.

23. CROSS-DIMENSION DIAGNOSIS

Dukung diagnosis lintas dimensi menggunakan deterministic patterns.

Contoh:

Marketing ≥ 70
Sales ≥ 70
Finance < 55


Diagnosis:

Pemasaran dan penjualan sudah bekerja cukup baik, tetapi hasil penjualan belum berubah menjadi kesehatan keuangan yang kuat.

Possible causes berasal dari indikator terkait.

Contoh lain:

Product ≥ 70
Marketing < 55


Diagnosis:

Produk relatif kuat, tetapi kemampuan menjangkau pasar masih membatasi pertumbuhan.

Simpan pattern diagnosis dalam config/database.

24. TOP 3 PRIORITY ENGINE

Jangan tampilkan semua masalah ke user.

Generate kandidat masalah dari:

lowest indicators;

lowest dimensions;

active critical flags;

cross-dimension problems.

Kemudian ranking.

Gunakan model seperti:

Priority Score =
Severity
× Impact
× Urgency
× Actionability


Tetapi hindari multiplier yang membuat scoring sulit dikontrol jika tidak diperlukan.

Boleh gunakan weighted scoring:

priority =
severity × 0.35
+ impact × 0.30
+ urgency × 0.20
+ actionability × 0.15


Gunakan skala konsisten:

1–5


Pilih maksimal:

3 priorities.

25. PRIORITY UI

Contoh:

Prioritas #1

Hitung kembali biaya produk utama

Kenapa ini penting

Anda belum mengetahui dengan pasti apakah harga jual sudah menutup seluruh biaya produk.

Yang perlu dilakukan

Hitung biaya bahan, kemasan, produksi dan biaya langsung dari 3 produk terlaris.

26. ACTION PLAN ENGINE

Generate:

Rencana Perbaikan 30 Hari

Struktur:

Week 1
Week 2
Week 3
Week 4


Setiap action item mempunyai:

interface ActionItem {
  id: string

  title: string

  description: string

  priorityId?: string

  weekNumber: 1 | 2 | 3 | 4

  completionCriteria?: string

  status:
    | "todo"
    | "doing"
    | "done"

  completedAt?: Date
}


27. ACTION QUALITY

Jangan menghasilkan:

Tingkatkan pemasaran.

Gunakan:

Selama 7 hari, tanyakan setiap pembeli mengetahui usaha Anda dari mana dan catat hasilnya.

Jangan:

Perbaiki pencatatan.

Gunakan:

Catat seluruh uang masuk dan uang keluar usaha selama 7 hari tanpa terlewat.

Action harus:

specific
small
achievable
observable


28. LANDING PAGE

Buat landing page sederhana.

Hero:

Cek Kesehatan Bisnis Anda

Supporting copy:

Cari tahu bagian usaha yang sudah kuat, masalah yang perlu diperbaiki, dan apa yang sebaiknya Anda kerjakan lebih dulu.

CTA utama:

Cek Bisnis Saya

Supporting:

Sekitar 7–10 menit.

Trust copy:

Hasil digunakan untuk membantu Anda memahami kondisi usaha, bukan menentukan kelayakan kredit atau memberikan penilaian hukum.

29. LANDING PAGE STRUCTURE

Minimal:

Header.

Hero.

Value proposition.

Cara kerja.

7 area yang diperiksa.

Contoh hasil.

CTA.

Footer.

Jangan membuat landing page terlalu panjang.

30. DESIGN LANGUAGE

Target visual:

professional
friendly
trustworthy
simple
modern
not childish


Produk harus terasa seperti:

digital business advisor

bukan:

game / personality quiz.

31. COLOR SEMANTICS

Gunakan semantic state:

critical
warning
fair
healthy
excellent


Tetapi:

Jangan hanya mengandalkan warna.

Gunakan:

text label;

icon;

score;

status.

Contoh:

42/100
Rentan


bukan hanya orange/red.

32. MOBILE FIRST

Primary viewport:

360–430px


Tetapi tetap responsif desktop.

Assessment UX:

satu pertanyaan utama per screen/card;

touch target besar;

pilihan mudah ditekan;

progress bar;

tombol Back;

tombol Next;

autosave.

Jangan menampilkan 31 pertanyaan dalam satu halaman panjang.

33. ASSESSMENT UX

Header:

Logo

Keuangan
Pertanyaan 4 dari 31

[progress bar]


Question:

Setiap akhir bulan, apakah Anda tahu usaha Anda untung atau rugi setelah semua biaya dibayar?


Helper:

Yang dimaksud biaya termasuk bahan, listrik, sewa, upah, ongkir usaha, dan biaya lainnya.


Options menggunakan card/radio.

Bottom:

← Kembali

Lanjut →


34. PROGRESS

Jangan hanya tampil:

14/31


Tampilkan juga area:

Keuangan
Penjualan
Pelanggan
...


Tetapi jangan membuat UX terlalu ramai.

35. AUTOSAVE

Assessment login user:

autosave answer setiap jawaban.

Guest:

gunakan:

localStorage


atau session storage yang aman.

Jika user refresh:

assessment tidak hilang.

36. GUEST MODE

User bisa:

mulai assessment;

menyelesaikan assessment;

melihat result utama;

tanpa login.

Tetapi untuk:

menyimpan history;

action tracking;

reassessment;

dashboard;

download tertentu jika ingin dibatasi;

arahkan untuk membuat akun.

Jangan meminta login sebelum user melihat value.

37. RESULT PAGE STRUCTURE

Urutan:

A. Overall Result

Business Health Score

64 / 100
CUKUP SEHAT


B. Diagnosis

Contoh:

Produk dan pemasaran usaha Anda cukup kuat, tetapi kondisi keuangan dan pengelolaan pelanggan masih perlu diperbaiki.

C. Critical Risks

Tampilkan sebelum grafik jika severity tinggi.

D. Top 3 Priorities

Ini bagian terpenting.

E. 7 Dimension Results

Cards/grid.

F. Strengths

2–3 kekuatan.

G. 30-Day Action Plan

H. CTA

Mulai Rencana Perbaikan
Download Laporan
Simpan Hasil


38. DO NOT OVEREMPHASIZE RADAR CHART

Radar chart boleh dibuat.

Tetapi:

jangan letakkan sebagai elemen paling dominan.

Priorities harus lebih jelas daripada chart.

39. DIMENSION DETAIL PAGE

User bisa click:

Keuangan — 43/100

Lalu melihat:

Kondisi Anda

Yang sudah baik

Yang perlu diperbaiki

Indikator terkait

Recommendation

Jangan tampilkan raw backend score 0–4.

40. BUSINESS HEALTH DASHBOARD

User dashboard:

Header:

Halo, [Nama]

[Nama Bisnis]


Hero card:

Business Health Score

64 / 100

Cukup Sehat


Subtext:

Terakhir diperiksa:
23 Agustus 2026


Dashboard sections:

Current Score
Critical Risks
Top Priorities
Action Plan Progress
7 Dimensions
Previous Assessments
Reassessment CTA


41. REASSESSMENT

User dapat melakukan assessment baru.

Jangan overwrite assessment lama.

Setiap assessment bersifat immutable setelah selesai.

Hubungkan:

Business
├─ Assessment #1
├─ Assessment #2
└─ Assessment #3


42. PROGRESS VISUALIZATION

Tampilkan:

Assessment 1     58
Assessment 2     64
Assessment 3     71


dan perubahan dimensi.

Tetapi jangan menyatakan:

bisnis membaik 13 poin

tanpa memperhatikan questionnaire version.

43. QUESTIONNAIRE VERSIONING

Ini WAJIB.

Setiap assessment menyimpan:

questionnaire_version
scoring_version


Contoh:

questionnaire = 0.2
scoring = 0.2


Jangan menghitung ulang assessment historis dengan rules baru tanpa explicit migration.

44. DATABASE

Gunakan PostgreSQL.

Jika menggunakan Supabase:

gunakan:

PostgreSQL;

Auth;

Row Level Security;

Storage jika diperlukan.

Core tables:

users

businesses

business_profiles

questionnaire_versions

dimensions

indicators

questions

answer_options

assessments

assessment_answers

dimension_scores

assessment_results

critical_flags

assessment_flags

diagnosis_rules

diagnosis_results

recommendations

priority_results

action_plans

action_items

programs

program_memberships

mentor_assignments


45. BUSINESS TABLE

Contoh:

businesses
---------
id
owner_user_id
name
business_type
industry_category
stage
established_year
employee_count
revenue_range
has_inventory
repeat_purchase_applicable
created_at
updated_at


46. ASSESSMENT TABLE

assessments
-----------
id
business_id
questionnaire_version
scoring_version
status
started_at
completed_at
overall_score
health_status


47. ANSWER TABLE

Jangan simpan hanya score.

assessment_answers
------------------
id
assessment_id
question_id
option_id
semantic_value
raw_value
score
is_applicable
answered_at


Ini penting untuk kasus seperti FIN-06.

48. DIMENSION RESULT

dimension_scores
----------------
id
assessment_id
dimension_id
score
applicable_indicator_count


49. CRITICAL FLAG RESULT

assessment_flags
----------------
id
assessment_id
critical_flag_id
severity
trigger_data
created_at
resolved_at


50. ROW LEVEL SECURITY

User hanya boleh membaca:

business miliknya
assessment miliknya
action plan miliknya


Mentor hanya boleh membaca bisnis yang memang:

assigned / program member


Admin sesuai role.

Jangan menonaktifkan RLS hanya agar development mudah.

51. ROLES

Minimal:

guest
umkm
mentor
program_manager
admin


52. MENTOR DASHBOARD MVP

Jangan overbuild.

Minimal:

Portfolio Overview

total UMKM;

average score;

UMKM Kritis;

UMKM Rentan;

Critical Flag count.

Common Problems

Contoh:

Keuangan rendah: 62%
Tidak tahu HPP: 41%
Cash risk: 28%


UMKM List

Columns:

Business
Owner
Overall Score
Health Status
Critical Risk
Latest Assessment


Filters:

health status
dimension
critical flag
business category


53. ADMIN SYSTEM

Scoring dan questionnaire harus data-driven.

Admin kelak dapat:

create question
edit question
edit helper
edit option
edit score
edit indicator weight
edit dimension weight
edit applicability rule
edit flag rule
edit recommendation
publish questionnaire version


Tetapi untuk first MVP UI admin boleh sederhana.

Architecture harus sudah mendukung versioning.

54. MVP DEFINITION

Bangun dulu:

CORE MVP

Landing.

Business profiling.

Guest assessment.

31 questions.

Dynamic applicability.

N/A normalization.

Scoring.

7 dimension scores.

Overall score.

Critical flags.

Diagnosis templates.

Top 3 priorities.

30-day action plan.

Result page.

Authentication.

Save assessment.

User dashboard.

History.

Reassessment.

PDF report basic.

55. DO NOT BUILD YET

Jangan jadikan ini syarat MVP:

complex Deep Check;

industry benchmarking;

bank scoring;

creditworthiness;

marketplace integration;

WhatsApp bot;

AI chat advisor;

complex LMS;

booking mentor;

subscription;

payment gateway;

advanced program management;

multi-language;

native mobile app.

Architecture boleh mendukung pengembangan berikutnya.

Tetapi jangan menghabiskan effort MVP di sana.

56. RECOMMENDED TECH STACK

Gunakan default:

Frontend

Next.js
TypeScript
React
Tailwind CSS


Gunakan App Router.

UI

Gunakan reusable accessible component system.

Jika tersedia:

shadcn/ui


atau library setara.

Backend

Next.js Server Actions / Route Handlers


atau API architecture yang jelas.

Database/Auth

Supabase
PostgreSQL
Supabase Auth


Forms

Gunakan:

React Hook Form


dan validation:

Zod


Charts

Gunakan:

Recharts


atau library sederhana.

PDF

Gunakan solusi yang stabil untuk menghasilkan laporan.

Boleh:

React PDF


atau server-side HTML → PDF jika environment mendukung.

57. PROJECT STRUCTURE

Gunakan modular architecture.

Contoh:

src/
├── app/
│
├── components/
│   ├── assessment/
│   ├── dashboard/
│   ├── results/
│   ├── actions/
│   └── ui/
│
├── features/
│   ├── assessment/
│   ├── scoring/
│   ├── diagnosis/
│   ├── priorities/
│   └── action-plan/
│
├── lib/
│   ├── database/
│   ├── rules/
│   ├── scoring/
│   ├── diagnosis/
│   └── utils/
│
├── types/
│
└── config/


Business logic jangan diletakkan di UI component.

58. SCORING ENGINE

Pisahkan menjadi pure functions.

Contoh:

calculateIndicatorScore()

calculateDimensionScore()

calculateOverallScore()

resolveHealthStatus()

evaluateCriticalFlags()

evaluateApplicability()

rankPriorities()


Functions harus mudah unit test.

59. TESTING SCORING

Buat unit test minimal:

score 0
score 4
mixed scores
N/A indicator
all applicable
multiple N/A
dimension calculation
overall weighted calculation
critical flag
FIN-06 unknown
FIN-06 <2 weeks


Scoring adalah bagian berisiko tinggi.

Test lebih penting daripada animasi.

60. UX STATES

Setiap fitur harus mempunyai:

loading
empty
success
error


Contoh:

Assessment gagal load:

Pertanyaan belum dapat dimuat. Coba lagi.

Jangan membuang jawaban yang sudah tersimpan.

61. ACCESSIBILITY

Pastikan:

keyboard navigation;

label form;

contrast;

visible focus;

semantic HTML;

screen-reader-friendly;

tidak bergantung warna saja.

62. PERFORMANCE

Target:

mobile-first;

quick initial load;

lazy load non-critical component;

chart hanya load bila diperlukan.

Jangan membuat homepage berat hanya karena chart library.

63. PRIVACY

Data UMKM dapat sensitif.

Jangan:

menjual data;

mengekspos omzet;

mengekspos skor antar UMKM;

memberikan akses mentor tanpa assignment.

Sediakan privacy notice sederhana.

64. DISCLAIMER

Result page harus mempunyai disclaimer singkat:

Hasil ini merupakan alat bantu untuk memahami kondisi usaha berdasarkan jawaban yang diberikan. Hasil bukan audit keuangan, penilaian kredit, atau nasihat hukum.

Jangan terlalu menakutkan user.

65. USER EXPERIENCE STYLE

Tulisan harus terdengar seperti:

pendamping usaha yang membantu

bukan:

auditor yang menghakimi.

Contoh:

Jangan:

Keuangan bisnis Anda buruk.

Gunakan:

Bagian keuangan masih perlu diperkuat, terutama pencatatan biaya dan pengelolaan uang usaha.

66. NO FAKE PRECISION

Jangan membuat klaim seperti:

Bisnis Anda 73.2% sehat.

Display:

73 / 100
Sehat


Skor adalah diagnostic index internal.

Bukan ukuran ilmiah absolut.

67. RESULT EXAMPLE

Gunakan dummy data saat development.

Contoh:

Sambal Roa Neng Sari

Business Health Score

61 / 100

CUKUP SEHAT


Diagnosis

Produk sudah memiliki penerimaan pasar yang cukup baik dan aktivitas penjualan berjalan. Namun keuangan dan pengelolaan pelanggan masih perlu diperkuat.

Priority 1

Hitung ulang biaya 3 produk utama.

Priority 2

Pisahkan uang pribadi dan uang usaha.

Priority 3

Mulai membuat daftar pelanggan.

68. DEMO DATA

Seed database dengan minimal:

3 UMKM


misalnya:

Usaha Makanan
Usaha Kerajinan
Usaha Jasa


Tujuan:

memastikan branching bekerja berbeda.

69. IMPORTANT DEMO SCENARIOS

Scenario A:

Food business:

inventory = true
repeat_purchase = true


Scenario B:

Wedding/event service:

inventory = false
repeat_purchase = false


Pastikan mereka tidak terkena penalti dari indikator tidak relevan.

Scenario C:

Solo professional:

employee_count = 1


Owner dependency tidak otomatis menghasilkan critical flag.

70. EMPTY RESULT PREVENTION

Sistem tidak boleh menghitung final score jika:

required assessment belum lengkap;

dimension tidak mempunyai minimum applicable indicator yang diperlukan;

data corrupt.

Tampilkan validation yang jelas.

71. DATA INTEGRITY

Setelah:

assessment.status = completed


jawaban assessment tidak boleh diedit langsung.

Untuk perubahan:

buat assessment baru.

Ini menjaga history valid.

72. REASSESSMENT COMPARISON

Bandingkan hanya jika compatible.

Minimal cek:

questionnaire_version
scoring_version


Jika berbeda:

tampilkan:

Metode assessment telah diperbarui. Perbandingan skor perlu dibaca dengan hati-hati.

73. DEVELOPMENT PRIORITY

Kerjakan dalam urutan:

PHASE 1 — FOUNDATION

project setup;

database;

auth;

schema;

questionnaire import;

business profile.

PHASE 2 — ASSESSMENT

dynamic questions;

branching;

applicability;

autosave;

guest mode.

PHASE 3 — ENGINE

scoring;

N/A;

dimensions;

overall score;

health status;

flags.

PHASE 4 — RESULTS

diagnosis;

priorities;

action plan;

results UI.

PHASE 5 — ACCOUNT

authentication;

dashboard;

history;

reassessment.

PHASE 6 — REPORT

PDF.

PHASE 7 — MENTOR BASIC

portfolio overview;

UMKM list;

risks.

74. CODE QUALITY

Use:

TypeScript strict mode
clear naming
small functions
modular architecture
reusable components
schema validation


Avoid:

any
huge React components
business rules inside JSX
duplicated scoring rules
magic numbers


75. CONFIGURATION FIRST

Threshold seperti:

39
54
69
84


weights seperti:

20%
15%


jangan tersebar di source code.

Simpan dalam:

configuration


atau database.

76. AUDITABILITY

Setiap assessment result harus bisa ditelusuri:

result
↓
dimension
↓
indicator
↓
question
↓
answer
↓
score
↓
rule version


Ini penting untuk debugging dan validasi framework.

77. DEVELOPMENT OUTPUT REQUIRED

Sebelum coding terlalu jauh, keluarkan:

A. Architecture Summary

B. Folder Structure

C. Database Schema

D. Assessment Data Model

E. Scoring Architecture

F. Rule Engine Architecture

G. Page Map

H. MVP Build Order

Setelah itu lanjutkan implementasi.

Jangan berhenti hanya pada proposal.

78. REQUIRED PAGES

Minimal:

/


Landing.

/assessment/start


Business profile.

/assessment/[assessmentId]


Assessment.

/results/[assessmentId]


Result.

/login


Authentication.

/dashboard


UMKM dashboard.

/dashboard/assessment/[id]


Assessment detail.

/dashboard/action-plan


Action plan.

/dashboard/history


Assessment history.

/mentor


Mentor dashboard jika role sesuai.

79. LANDING PAGE FIRST IMPRESSION

Dalam 5 detik user harus mengerti:

Apa produk ini?
Apa yang saya dapatkan?
Berapa lama?
Apa CTA?


Contoh:

Cek Kesehatan Bisnis Anda

Dalam sekitar 7–10 menit, lihat bagian usaha yang sudah kuat, masalah yang perlu diperbaiki, dan tiga hal yang sebaiknya Anda kerjakan lebih dulu.

[Cek Bisnis Saya]

80. RESULT FIRST IMPRESSION

Dalam 5 detik user harus mengerti:

Skor saya?
Status saya?
Masalah terbesar saya?
Apa yang harus saya lakukan?


Jangan sembunyikan priority di bawah terlalu banyak chart.

81. DEFINITION OF MVP SUCCESS

MVP dianggap berhasil secara teknis jika:

User bisa assessment tanpa login.

Business profile menentukan applicable questions.

Questions berasal dari source configuration.

Semua applicable questions dapat dijawab.

N/A tidak menurunkan score.

7 dimension scores dihitung benar.

Overall score dihitung benar.

Critical flags muncul benar.

FIN-06 semantic condition dibedakan.

Top 3 priorities dihasilkan.

Action plan dapat dibuat.

Result bisa disimpan setelah login.

History tidak tertimpa.

Reassessment dapat dibuat.

Mobile UI nyaman digunakan.

82. MOST IMPORTANT ENGINEERING RULE

Jika harus memilih antara:

UI terlihat keren


atau:

scoring dan diagnosis benar


pilih:

SCORING DAN DIAGNOSIS BENAR.

UI dapat diperbaiki.

Diagnosis yang salah merusak kepercayaan terhadap produk.

83. FINAL EXECUTION INSTRUCTION

Sekarang pelajari seluruh attached source files.

Kemudian:

ekstrak framework assessment;

petakan 31 indikator;

petakan opsi jawaban dan backend score;

identifikasi branching;

identifikasi N/A;

identifikasi Critical Flags;

susun database schema;

susun scoring engine;

susun architecture;

bangun aplikasi.

Jangan mengubah framework tanpa alasan eksplisit.

Jika terdapat requirement yang belum cukup jelas:

gunakan keputusan paling konservatif;

tuliskan sebagai assumption;

jangan mengarang business rule baru;

lanjutkan implementasi bagian yang sudah jelas.

Target akhir:

sebuah webapp Business Health Check UMKM yang berfungsi end-to-end, mobile-first, mempunyai rule-based diagnostic engine, mudah digunakan pelaku UMKM, dan architecture-nya siap dikembangkan menjadi platform monitoring pendampingan UMKM.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://usahasehat-check.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9dde489a-a37a-4db0-a57a-ae8db39f7cce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
