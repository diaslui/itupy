const domUpdateAllText = (querySelector, value) => {
  document.querySelectorAll(querySelector).forEach((el) => {
    el.innerText = value;
  });
};

const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
}

const toggleTheme = () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
}


(function () {
  const y = new Date().getFullYear();
  const el = document.getElementById("year");
  if (el) el.textContent = y;
})();

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
});
