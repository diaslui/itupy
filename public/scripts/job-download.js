const eRefs = {
  itpProgressBar: "#itpProgressBar",
  progressCircle: "#progressCircle",
  progressPercent: "#progressPercent",
  linearProgress: "#linearProgress",
};

const domRefs = {};

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


const init = async () => {
  await loadElements();
  updateProgress(12);
};

document.addEventListener("DOMContentLoaded", init);
