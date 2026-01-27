const getLoader = () => {
  const loader = document.createElement("div");
  loader.id = "loader";
  loader.className =
    "pointer-events-none fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 z-50";
  
  const loaderContent = document.createElement("div");
  loaderContent.className =
    "bg-itp-gray-800 dark:bg-itp-gray-200 rounded-lg p-6 shadow-xl flex flex-col items-center gap-4";
  
  const spinner = document.createElement("div");
  spinner.className =
    "w-12 h-12 border-4 border-itp-gray-600 dark:border-itp-gray-400 border-t-white dark:border-t-itp-gray-900 rounded-full animate-spin";
  
  const loaderMessage = document.createElement("span");
  loaderMessage.id = "loaderMessage";
  loaderMessage.className = "text-white dark:text-itp-gray-900 text-sm font-medium";
  
  loaderContent.appendChild(spinner);
  loaderContent.appendChild(loaderMessage);
  loader.appendChild(loaderContent);
  
  return loader;
};

const includeLoaderInDOM = async () => {
  if (!document.getElementById("loader")) {
    const loader = getLoader();
    document.body.appendChild(loader);
  }
};

const showLoader = async (message = "Carregando...") => {
  const loader = document.getElementById("loader");
  const loaderMessage = document.getElementById("loaderMessage");
  
  if (!loader || !loaderMessage) {
    await includeLoaderInDOM();
    showLoader(message);
    return;
  }
  
  loaderMessage.textContent = message;
  loader.classList.remove("opacity-0", "pointer-events-none");
};

const hideLoader = async () => {
  const loader = document.getElementById("loader");
  
  if (loader) {
    loader.classList.add("opacity-0", "pointer-events-none");
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await includeLoaderInDOM();
});