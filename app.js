const screens = Array.from(document.querySelectorAll(".screen"));
const navButtons = Array.from(document.querySelectorAll("[data-go]"));
const bottomButtons = Array.from(document.querySelectorAll(".bottom-nav button"));
const reportForm = document.querySelector("#report-form");
const saveReportButton = document.querySelector("#save-report");
const adminReportList = document.querySelector("#admin-report-list");
const storageKey = "electricDailyReports";

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === id);
  });

  bottomButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.go === id);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getReports() {
  const savedReports = localStorage.getItem(storageKey);

  if (!savedReports) {
    return [];
  }

  try {
    return JSON.parse(savedReports);
  } catch (error) {
    console.warn("日報データを読み込めませんでした。", error);
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(storageKey, JSON.stringify(reports));
}

function formatWorkDate(dateValue) {
  if (!dateValue) {
    return "日付未入力";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function createReportCard(report) {
  const card = document.createElement("article");
  card.className = "report-card";

  const content = document.createElement("div");
  const badge = document.createElement("span");
  const title = document.createElement("h3");
  const summary = document.createElement("p");
  const detail = document.createElement("strong");
  const detailButton = document.createElement("button");

  badge.className = "status-badge";
  badge.textContent = "保存済み";
  title.textContent = `${formatWorkDate(report.workDate)} ${report.siteName}`;
  summary.textContent = `${report.workerName} / ${report.workerCount}名 / ${report.startTime}-${report.endTime} / ${report.progress}`;
  detail.textContent = report.issues
    ? `要確認: ${report.issues}`
    : `作業内容: ${report.workDetail}`;
  detailButton.className = "small-button";
  detailButton.type = "button";
  detailButton.textContent = report.photoCount > 0 ? `写真 ${report.photoCount}件` : "詳細";

  content.append(badge, title, summary, detail);
  card.append(content, detailButton);

  return card;
}

function renderAdminReports() {
  if (!adminReportList) {
    return;
  }

  const reports = getReports();
  adminReportList.replaceChildren();

  if (reports.length === 0) {
    const emptyState = document.createElement("div");
    const message = document.createElement("p");

    emptyState.className = "empty-state";
    message.textContent = "まだ保存された日報はありません。";
    emptyState.append(message);
    adminReportList.append(emptyState);
    return;
  }

  reports
    .slice()
    .reverse()
    .forEach((report) => {
      adminReportList.append(createReportCard(report));
    });
}

function handleSaveReport() {
  const formData = new FormData(reportForm);
  const photos = reportForm.elements.photos.files;
  const report = {
    id: crypto.randomUUID(),
    siteName: formData.get("siteName"),
    workDate: formData.get("workDate"),
    workerName: formData.get("workerName"),
    workerCount: formData.get("workerCount"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    workDetail: formData.get("workDetail"),
    progress: formData.get("progress"),
    issues: formData.get("issues"),
    tomorrowPlan: formData.get("tomorrowPlan"),
    photoCount: photos.length,
    photoNames: Array.from(photos).map((photo) => photo.name),
    savedAt: new Date().toISOString(),
  };

  const reports = getReports();
  reports.push(report);
  saveReports(reports);
  renderAdminReports();
  alert("日報をブラウザ内に保存しました。管理者画面の日報一覧に表示します。");
  showScreen("admin-dashboard");
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.go));
});

document.querySelector(".ai-button").addEventListener("click", () => {
  alert("AI APIはまだ接続していません。次の段階で、入力内容から日報文を生成できるようにします。");
});

saveReportButton.addEventListener("click", handleSaveReport);
renderAdminReports();
showScreen("login");
