const eRefs = {
  itpProgressBar: "#itpProgressBar",
  progressCircle: "#progressCircle",
  progressPercent: "#progressPercent",
  linearProgress: "#linearProgress",
};

const domRefs = {};
let sseInstance = null;

const loadElements = async () => {
  for (const [key, selector] of Object.entries(eRefs)) {
    domRefs[key] = document.querySelector(selector);
    if (!domRefs[key]) {
      console.warn(`element for ${key} not found.`);
    }
  }
};

const updateProgress = (value) => {
  progress = value;

  domRefs.itpProgressBar.style.width = value + "%";

  const circle = domRefs.progressCircle;
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (value / 100) * circumference;
  circle.style.strokeDashoffset = offset;

  domRefs.progressPercent.textContent = Math.round(value) + "%";

  domRefs.linearProgress.style.width = value + "%";

  if (value >= 100) {
    console.log("ready!");
  }
};

const connectSSE = async (sseUrl) => {
    if (sseInstance) {
    sseInstance.close();
  }

  sseInstance = new EventSource(sseUrl);

  sseInstance.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.progress !== undefined) {
      updateProgress(data.progress);
    }
  };

  sseInstance.onerror = (error) => {
    console.error("sses error:", error);
    sseInstance.close();
  };
};

const downloadFile = async (jobId) => {
  const response = await fetch("/api/download/stream/" + jobId);
  if (!response.ok) {
    console.error("Download failed:", response.statusText);
    return;
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = "downloaded_file";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const init = async () => {
  const thisJobId = window.location.pathname.split("/").pop();
  await loadElements();
  await connectSSE("/api/download/sse/" + thisJobId);
  await downloadFile(thisJobId);
};

document.addEventListener("DOMContentLoaded", init);
