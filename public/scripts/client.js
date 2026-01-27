const eRefs = {
  searchInputDesktop: "#searchInputDesktop",
  searchInputMobile: "#searchInputMobile",
  addVideoBtnDesktop: "#addVideoBtnDesktop",
  addVideoBtnMobile: "#addVideoBtnMobile",
  clearAllVideosBtn: "#clearAllVideosBtn",
  pastAndAdd: "#pastAndAdd",
  gotoDonwload: "#gotoDonwload",
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
let videos = new Map();

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const addVideoToLocalStorage = (videoData) => {
  const localStorageVideos = JSON.parse(localStorage.getItem("videos")) || [];
  const updatedVideos = [...videoData, ...localStorageVideos];
  localStorage.setItem("videos", JSON.stringify(updatedVideos));
};

const removeVideoFromLocalStorage = (videoId) => {
  const localStorageVideos = JSON.parse(localStorage.getItem("videos")) || [];
  const updatedVideos = localStorageVideos.filter(
    (video) => video.id !== videoId,
  );
  localStorage.setItem("videos", JSON.stringify(updatedVideos));
};

const removeAllFromLocalStorage = () => {
  localStorage.removeItem("videos");
};

const getVideosFromLocalStorage = () => {
  const localStorageVideos = JSON.parse(localStorage.getItem("videos")) || [];
  return localStorageVideos;
};

const addVideo = (source) => {
  const input =
    domRefs[source === "desktop" ? "searchInputDesktop" : "searchInputMobile"];
  const url = input.value.trim();

  if (!url) {
    showToast("Por favor, cole um link do YouTube");
    return;
  }

  const urls = url.split(/[\s,\n]+/).filter((u) => u.trim());
  let addedCount = 0;

  urls.forEach((singleUrl) => {
    const videoId = extractVideoId(singleUrl.trim());

    if (videoId && !videos.has(videoId)) {
      const newVideo = {
        id: videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        title: "Carregando...",
        loading: true,
      };
      videos = new Map([[videoId, newVideo], ...videos]);

      addVideoToLocalStorage([
        {
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
          title: `Video ${videoId}`,
          loading: false,
        },
      ]);

      addedCount++;

      setTimeout(() => {
        const video = videos.get(videoId);
        if (video) {
          video.title = `Video ${videoId}`;
          video.loading = false;
          renderVideos();
        }
      }, 1000);
    }
  });

  if (addedCount > 0) {
    input.value = "";
    document.getElementById("searchInputDesktop").value = "";
    document.getElementById("searchInputMobile").value = "";
    renderVideos();
    showToast(`${addedCount} video(s) adicionado(s)`);
  } else if (urls.length > 0) {
    showToast("Video ja adicionado ou link invalido");
  }
};

const removeVideo = (videoId) => {
  videos.delete(videoId);
  renderVideos();
  removeVideoFromLocalStorage(videoId);
  showToast("Video removido");
};

const clearAllVideos = () => {
  videos.clear();
  renderVideos();
  removeAllFromLocalStorage();
  showToast("Todos os videos foram removidos");
};

const renderVideos = () => {
  const emptyState = document.getElementById("emptyState");
  const videoList = document.getElementById("videoList");
  const videosContainer = document.getElementById("videosContainer");
  const videoCount = document.getElementById("videoCount");

  if (videos.size === 0) {
    emptyState.classList.remove("hidden");
    videoList.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  videoList.classList.remove("hidden");
  videoCount.textContent = videos.size;

  videosContainer.innerHTML = "";

  videos.forEach((video, id) => {
    const card = document.createElement("div");
    card.className =
      "video-card bg-itp-gray-50 dark:bg-itp-gray-800 rounded-xl overflow-hidden border border-itp-gray-200 dark:border-itp-gray-700 hover:border-itp-gray-300 dark:hover:border-itp-gray-600 transition-colors";

    card.innerHTML = `
          <div class="flex flex-col sm:flex-row">
            <a href="${video.url}" target="_blank" rel="noopener noreferrer" class=" relative sm:w-64 shrink-0">
              <div class="aspect-video  sm:aspect-[16/9] bg-itp-gray-200 dark:bg-itp-gray-700 overflow-hidden">
                <img 
                  src="${video.thumbnail}" 
                  alt="Thumbnail do video"
                  class="w-full h-full object-cover"
                  onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 180%22%3E%3Crect fill=%22%23272727%22 width=%22320%22 height=%22180%22/%3E%3Ctext x=%22160%22 y=%2290%22 text-anchor=%22middle%22 fill=%22%23606060%22 font-size=%2214%22%3EVideo%3C/text%3E%3C/svg%3E'"
                >
              </div>
              <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <div class="w-12 h-12 bg-black/80 rounded-full text-center flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </a>
            
            <div class="flex-1 p-4 flex flex-col justify-between min-w-0">
              <div>
                ${
                  video.loading
                    ? `
                  <div class="skeleton h-5 w-3/4 rounded mb-2"></div>
                  <div class="skeleton h-4 w-1/2 rounded"></div>
                `
                    : `
                  <h3 class="font-medium text-itp-gray-900 dark:text-white line-clamp-2 mb-1">${video.title}</h3>
                  <p class="text-sm text-itp-gray-500 dark:text-itp-gray-400 truncate">${video.url}</p>
                `
                }
              </div>
              
              <div class="flex items-center gap-2 mt-3">
                <button 
                  onclick="selectFormat('${id}', 'mp4')"
                  class="format-btn px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${!video.format || video.format === "mp4" ? "bg-itp-red text-white border-itp-red" : "bg-transparent text-itp-gray-600 dark:text-itp-gray-300 border-itp-gray-300 dark:border-itp-gray-600 hover:border-itp-gray-400"}"
                  data-video="${id}"
                  data-format="mp4"
                >
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    MP4
                  </span>
                </button>
                <button 
                  onclick="selectFormat('${id}', 'mp3')"
                  class="format-btn px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${video.format === "mp3" ? "bg-itp-red text-white border-itp-red" : "bg-transparent text-itp-gray-600 dark:text-itp-gray-300 border-itp-gray-300 dark:border-itp-gray-600 hover:border-itp-gray-400"}"
                  data-video="${id}"
                  data-format="mp3"
                >
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                    MP3
                  </span>
                </button>
              </div>
            </div>
            
            <button 
              onclick="removeVideo('${id}')"
              class="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:self-start sm:m-3 p-2 rounded-full bg-black/50 sm:bg-itp-gray-100 sm:dark:bg-itp-gray-700 hover:bg-black/70 sm:hover:bg-itp-gray-200 sm:dark:hover:bg-itp-gray-600 transition-colors"
              aria-label="Remover video"
            >
              <svg class="w-5 h-5 text-white sm:text-itp-gray-500 sm:dark:text-itp-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        `;

    card.style.position = "relative";

    videosContainer.appendChild(card);
  });
};

const selectFormat = (videoId, format) => {
  const video = videos.get(videoId);
  if (video) {
    video.format = format;
    renderVideos();
  }
};

const proceedToDownload = () => {
  if (videos.size === 0) {
    showToast("Adicione ao menos um video");
    return;
  }

  const videoData = Array.from(videos.values()).map((v) => ({
    id: v.id,
    format: v.format || "mp4",
  }));

  console.log("Proceeding to download:", videoData);
  showToast(`Iniciando download de ${videos.size} video(s)...`);
};

const handlePaste = (e) => {
  const pastedText = e.clipboardData.getData("text");
  const videoId = extractVideoId(pastedText);

  if (videoId) {
    e.preventDefault();
    e.target.value = pastedText;
    addVideo(e.target.id.includes("Desktop") ? "desktop" : "mobile");
  }
};

const handleKeyPress = (e) => {
  if (e.key === "Enter") {
    addVideo(e.target.id.includes("Desktop") ? "desktop" : "mobile");
  }
};

const initListeners = async () => {
  if (domRefs.addVideoBtnDesktop) {
    domRefs.addVideoBtnDesktop.addEventListener("click", () =>
      addVideo("desktop"),
    );
  }
  if (domRefs.addVideoBtnMobile) {
    domRefs.addVideoBtnMobile.addEventListener("click", () =>
      addVideo("mobile"),
    );
  }
  if (domRefs.clearAllVideosBtn) {
    domRefs.clearAllVideosBtn.addEventListener("click", clearAllVideos);
  }
  if (domRefs.gotoDonwload) {
    domRefs.gotoDonwload.addEventListener("click", proceedToDownload);
  }

  if (domRefs.pastAndAdd) {
    domRefs.pastAndAdd.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        const videoId = extractVideoId(text);
        if (videoId) {
          const inputDesktop = domRefs.searchInputDesktop;
          const inputMobile = domRefs.searchInputMobile;
          if (inputDesktop) inputDesktop.value = text;
          if (inputMobile) inputMobile.value = text;
          addVideo("desktop");
        } else {
          showToast(
            "Nenhum link de video valido encontrado na area de transferencia.",
          );
        }
      } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
        showToast("Nao foi possivel acessar a area de transferencia.");
      }
    });
  }

  const inputs = [
    domRefs.searchInputDesktop || document.getElementById("searchInputDesktop"),
    domRefs.searchInputMobile || document.getElementById("searchInputMobile"),
  ];
  inputs.forEach((input) => {
    if (input) {
      input.addEventListener("paste", handlePaste);
      input.addEventListener("keypress", handleKeyPress);
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  await loadElements();
  await initListeners();
  const storedVideos = getVideosFromLocalStorage();
  storedVideos.forEach((video) => {
    videos.set(video.id, video);
  });
  renderVideos();
});
