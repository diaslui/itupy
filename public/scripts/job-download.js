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

const init = async () => {
  const thisJobId = window.location.pathname.split("/").pop();
  await loadElements();
  await connectSSE("/api/download/sse/" + thisJobId);
};

document.addEventListener("DOMContentLoaded", init);
