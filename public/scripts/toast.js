const getToast = () => {
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className =
    "fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-itp-gray-800 dark:bg-itp-gray-200 text-white dark:text-itp-gray-900 rounded-lg shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 text-sm z-50";

  const toastMessage = document.createElement("span");
  toastMessage.id = "toastMessage";

  toast.appendChild(toastMessage);

  return toast;
};

const includeToastInDOM = async () => {
  if (!document.getElementById("toast")) {
    const toast = getToast();
    document.body.appendChild(toast);
  }
};

const showToast = async (message) => {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) {
    await includeToastInDOM();
    showToast(message);
    return;
  }
  toastMessage.textContent = message;
  toast.classList.remove("translate-y-20", "opacity-0");

  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3000);
};

document.addEventListener("DOMContentLoaded", async () => {
  await includeToastInDOM();
});
