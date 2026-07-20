const STORAGE_KEY = "electricalDailyReports";

const fieldLabels = {
  siteName: "現場名",
  workDate: "作業日",
  workerName: "作業員名",
  workContent: "作業内容",
  progress: "進捗",
  startTime: "開始時刻",
  endTime: "終了時刻",
  materials: "使用材料",
  safetyCheck: "安全確認",
  notes: "備考",
  submittedAt: "保存日時",
};

const requiredCardFields = [
  "siteName",
  "workDate",
  "workerName",
  "workContent",
  "progress",
];

const detailFieldOrder = [
  "siteName",
  "workDate",
  "workerName",
  "workContent",
  "progress",
  "startTime",
  "endTime",
  "materials",
  "safetyCheck",
  "notes",
  "submittedAt",
];

const reportForm = document.querySelector("#report-form");
const saveMessage = document.querySelector("#save-message");
const reportList = document.querySelector("#report-list");
const detailScreen = document.querySelector("#detail-screen");
const detailContent = document.querySelector("#detail-content");
const detailBack = document.querySelector("#detail-back");
const tabButtons = document.querySelectorAll(".tab-button");
const bottomNavButtons = document.querySelectorAll(".bottom-nav button");
const views = {
  submit: document.querySelector("#submit-view"),
  admin: document.querySelector("#admin-view"),
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "未入力";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "未入力";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getReports() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// 画面遷移制御
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    screen.classList.remove('is-active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('is-active');
  }

  bottomNavButtons.forEach(button => {
    button.classList.toggle('is-active', button.getAttribute('data-go') === screenId);
  });
}

// 初期化
function initializeScreenNavigation() {
  // data-go ボタンのイベントリスナー設定
  const navButtons = document.querySelectorAll('[data-go]');
  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const screenId = button.getAttribute('data-go');
      showScreen(screenId);
    });
  });

  showScreen('login');
}

// DOMContentLoaded または即座に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScreenNavigation);
} else {
  initializeScreenNavigation();
}

function sortReportsByNewestWorkDate(reports) {
}