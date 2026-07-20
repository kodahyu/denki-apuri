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

  if (screenId === 'daily-list') {
    renderReportList();
  }
}

function renderReportList() {
  if (!reportList) return;
  const reports = getReports();

  if (!reports.length) {
    reportList.innerHTML = `
      <div class="empty-state">
        <p>提出済み日報はありません。</p>
      </div>
    `;
    return;
  }

  reportList.innerHTML = reports
    .map((report, index) => {
      const status = report.submittedAt ? '提出済み' : '下書き';
      const statusClass = report.submittedAt ? '' : 'warning';
      return `
        <article class="report-card">
          <div>
            <span class="status-badge ${statusClass}">${escapeHtml(status)}</span>
            <h3>${escapeHtml(formatDate(report.workDate))} ${escapeHtml(report.siteName)}</h3>
            <p>${escapeHtml(report.workContent)} / ${escapeHtml(report.workerName)} / ${escapeHtml(report.progress)}</p>
          </div>
          <button class="small-button" type="button" data-report-index="${index}">詳細</button>
        </article>
      `;
    })
    .join('');
}

function showReportDetail(index) {
  const reports = getReports();
  const report = reports[index];
  if (!report || !detailContent) return;

  detailContent.innerHTML = `
    <div class="section-block">
      <div class="detail-row"><strong>現場名</strong><p>${escapeHtml(report.siteName)}</p></div>
      <div class="detail-row"><strong>作業日</strong><p>${escapeHtml(formatDate(report.workDate))}</p></div>
      <div class="detail-row"><strong>作業員名</strong><p>${escapeHtml(report.workerName)}</p></div>
      <div class="detail-row"><strong>作業内容</strong><p>${escapeHtml(report.workContent)}</p></div>
      <div class="detail-row"><strong>進捗</strong><p>${escapeHtml(report.progress)}</p></div>
      <div class="detail-row"><strong>開始時刻</strong><p>${escapeHtml(report.startTime)}</p></div>
      <div class="detail-row"><strong>終了時刻</strong><p>${escapeHtml(report.endTime)}</p></div>
      <div class="detail-row"><strong>使用材料</strong><p>${escapeHtml(report.materials)}</p></div>
      <div class="detail-row"><strong>安全確認</strong><p>${escapeHtml(report.safetyCheck)}</p></div>
      <div class="detail-row"><strong>備考</strong><p>${escapeHtml(report.notes)}</p></div>
      <div class="detail-row"><strong>保存日時</strong><p>${escapeHtml(formatDateTime(report.submittedAt))}</p></div>
    </div>
  `;
  showScreen('detail-screen');
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

  const saveReportButton = document.querySelector("#save-report");
  if (saveReportButton) {
    saveReportButton.addEventListener('click', () => {
      const data = collectReportData();
      if (!data) return;

      const reports = getReports();
      reports.push(data);
      saveReports(reports);

      if (saveMessage) {
        saveMessage.textContent = '保存しました';
      }

      setTimeout(() => {
        showScreen('worker-home');
      }, 600);
    });
  }

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const detailButton = target.closest('[data-report-index]');
    if (detailButton) {
      const index = Number(detailButton.getAttribute('data-report-index'));
      if (!Number.isNaN(index)) {
        showReportDetail(index);
      }
    }
  });
}

function collectReportData() {
  if (!reportForm) return null;
  const formData = new FormData(reportForm);

  return {
    siteName: formData.get('siteName')?.toString() ?? '',
    workDate: formData.get('workDate')?.toString() ?? '',
    workerName: formData.get('workerName')?.toString() ?? '',
    workContent: formData.get('workContent')?.toString() ?? '',
    progress: formData.get('progress')?.toString() ?? '',
    startTime: formData.get('startTime')?.toString() ?? '',
    endTime: formData.get('endTime')?.toString() ?? '',
    materials: formData.get('materials')?.toString() ?? '',
    safetyCheck: formData.get('safetyCheck')?.toString() ?? '',
    notes: formData.get('issues')?.toString() ?? '',
    submittedAt: new Date().toISOString(),
  };
}

// DOMContentLoaded または即座に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScreenNavigation);
} else {
  initializeScreenNavigation();
}

function sortReportsByNewestWorkDate(reports) {
}