let downloadData = null;
let selectedFormat = "video";
let selectedQuality = null;

const initDownloadPage = (data) => {
  downloadData = data;

  if (data.mode === "single") {
    initSingleMode(data.videos[0]);
  } else {
    initMultiMode(data);
  }
};

const initSingleMode = (video) => {
  domRefs.singleMode.classList.remove("hidden");
  domRefs.multiMode.classList.add("hidden");

  domRefs.singleThumbnail.src = video.thumbnail;
  domRefs.singleTitle.textContent = video.title;
  domRefs.singleDuration.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    ${formatDuration(video.duration)}
  `;

  renderSingleVideoFormats(video.formats);

  renderSingleAudioFormats(video.audio);

  document.getElementById("singleFormatVideo").addEventListener("click", () => {
    switchSingleFormat("video");
  });

  document.getElementById("singleFormatAudio").addEventListener("click", () => {
    switchSingleFormat("audio");
  });

  const firstVideoFormat = video.formats[video.formats.length - 1];
  selectedQuality = firstVideoFormat.formatId;
  selectedFormat = "video";
};

const renderSingleVideoFormats = (formats) => {
  const container = domRefs.singleVideoQualityList;

  const validFormats = formats
    .filter((f) => f.filesize && f.label)
    .sort((a, b) => a.filesize - b.filesize);

  container.innerHTML = validFormats
    .map(
      (format) => `
    <button 
      data-format-id="${format.formatId}"
      class="video-quality-btn p-4 border-2 border-itp-gray-200 dark:border-itp-gray-600 rounded-lg hover:border-itp-red transition-colors text-left ${
        format.formatId === selectedQuality
          ? "border-itp-red bg-red-50 dark:bg-red-950/20"
          : ""
      }">
      <div class="font-semibold text-itp-gray-900 dark:text-white mb-1">${format.label}</div>
      <div class="text-sm text-itp-gray-500 dark:text-itp-gray-400">${formatBytes(format.filesize)}</div>
    </button>
  `,
    )
    .join("");

  container.querySelectorAll(".video-quality-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const formatId = e.currentTarget.dataset.formatId;
      selectSingleQuality("video", formatId);
    });
  });
};

const renderSingleAudioFormats = (audioFormats) => {
  const container = domRefs.singleAudioQualityList;

  const validFormats = audioFormats
    .filter(
      (f) =>
        (f.ext === "m4a" || f.ext === "webm") &&
        !f.formatId.includes("drc") &&
        f.bitrate > 0,
    )
    .sort((a, b) => a.bitrate - b.bitrate);

  container.innerHTML = ` <button 
      data-format-id="mp3"
      class="audio-quality-btn p-4 border-2 border-itp-gray-200 dark:border-itp-gray-600 rounded-lg hover:border-itp-red transition-colors text-left">
      <div class="font-semibold text-itp-gray-900 dark:text-white mb-1">MP3</div>
      <div class="text-sm text-itp-gray-500 dark:text-itp-gray-400">não estimado</div>
    </button>`;
  container.querySelectorAll(".audio-quality-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const formatId = e.currentTarget.dataset.formatId;
      selectSingleQuality("audio", formatId);
    });
  });
};

const switchSingleFormat = (format) => {
  selectedFormat = format;

  const videoBtn = document.getElementById("singleFormatVideo");
  const audioBtn = document.getElementById("singleFormatAudio");

  if (format === "video") {
    videoBtn.className =
      "flex-1 py-3 px-4 bg-itp-red text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
    audioBtn.className =
      "flex-1 py-3 px-4 bg-itp-gray-100 dark:bg-itp-gray-700 text-itp-gray-900 dark:text-white rounded-lg font-medium hover:bg-itp-gray-200 dark:hover:bg-itp-gray-600 transition-colors flex items-center justify-center gap-2";

    domRefs.singleVideoQuality.classList.remove("hidden");
    domRefs.singleAudioQuality.classList.add("hidden");

    const firstBtn = document.querySelector(".video-quality-btn");
    if (firstBtn) {
      selectedQuality = firstBtn.dataset.formatId;
      selectSingleQuality("video", selectedQuality);
    }
  } else {
    audioBtn.className =
      "flex-1 py-3 px-4 bg-itp-red text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
    videoBtn.className =
      "flex-1 py-3 px-4 bg-itp-gray-100 dark:bg-itp-gray-700 text-itp-gray-900 dark:text-white rounded-lg font-medium hover:bg-itp-gray-200 dark:hover:bg-itp-gray-600 transition-colors flex items-center justify-center gap-2";

    domRefs.singleVideoQuality.classList.add("hidden");
    domRefs.singleAudioQuality.classList.remove("hidden");

    const firstBtn = document.querySelector(".audio-quality-btn");
    if (firstBtn) {
      selectedQuality = firstBtn.dataset.formatId;
      selectSingleQuality("audio", selectedQuality);
    }
  }
};

const selectSingleQuality = (type, formatId) => {
  selectedQuality = formatId;

  const container =
    type === "video"
      ? domRefs.singleVideoQualityList
      : domRefs.singleAudioQualityList;

  container.querySelectorAll("button").forEach((btn) => {
    if (btn.dataset.formatId === formatId) {
      btn.className = `${type}-quality-btn p-4 border-2 border-itp-red bg-red-50 dark:bg-red-950/20 rounded-lg transition-colors text-left`;
    } else {
      btn.className = `${type}-quality-btn p-4 border-2 border-itp-gray-200 dark:border-itp-gray-600 rounded-lg hover:border-itp-red transition-colors text-left`;
    }
  });
};

const initMultiMode = (data) => {
  document.getElementById("multiMode").classList.remove("hidden");
  domRefs.singleMode.classList.add("hidden");

  domRefs.multiVideoCount.textContent = data.count;

  const totalSize = data.videos.reduce(
    (sum, video) => sum + (video.bestFormat.filesize || 0),
    0,
  );
  domRefs.multiTotalSize.textContent = formatBytes(totalSize);

  renderMultiVideoList(data.videos);

  domRefs.multiFormatMp4.addEventListener("click", () => {
    switchMultiFormat("mp4");
  });

  domRefs.multiFormatMp3.addEventListener("click", () => {
    switchMultiFormat("mp3");
  });

  selectedFormat = "mp4";
};

const renderMultiVideoList = (videos) => {
  const container = domRefs.multiVideoList;

  container.innerHTML = videos
    .map(
      (video, index) => `
    <div class="bg-itp-gray-100 dark:bg-itp-gray-700 rounded-lg p-4 flex items-center gap-4">
      <div class="w-32 h-18 bg-itp-gray-200 dark:bg-itp-gray-600 rounded overflow-hidden flex-shrink-0">
        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-full object-cover">
      </div>
      
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-itp-gray-900 dark:text-white mb-1 truncate">${video.title}</h4>
        <div class="flex items-center gap-3 text-sm text-itp-gray-500 dark:text-itp-gray-400">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ${formatDuration(video.duration)}
          </span>
          <span>${video.bestFormat.label}</span>
          <span>${formatBytes(video.bestFormat.filesize)}</span>
        </div>
      </div>
      
      <div class="text-sm font-medium text-itp-gray-400 dark:text-itp-gray-500">
        #${index + 1}
      </div>
    </div>
  `,
    )
    .join("");
};

const switchMultiFormat = (format) => {
  selectedFormat = format;

  const mp4Btn = domRefs.multiFormatMp4;
  const mp3Btn = domRefs.multiFormatMp3;

  if (format === "mp4") {
    mp4Btn.className =
      "flex-1 py-3 px-4 bg-itp-red text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
    mp3Btn.className =
      "flex-1 py-3 px-4 bg-itp-gray-100 dark:bg-itp-gray-700 text-itp-gray-900 dark:text-white rounded-lg font-medium hover:bg-itp-gray-200 dark:hover:bg-itp-gray-600 transition-colors flex items-center justify-center gap-2";
  } else {
    mp3Btn.className =
      "flex-1 py-3 px-4 bg-itp-red text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2";
    mp4Btn.className =
      "flex-1 py-3 px-4 bg-itp-gray-100 dark:bg-itp-gray-700 text-itp-gray-900 dark:text-white rounded-lg font-medium hover:bg-itp-gray-200 dark:hover:bg-itp-gray-600 transition-colors flex items-center justify-center gap-2";
  }
};

const startDownload = async () => {
  const downloadConfig = {
    mode: downloadData.mode,
    format: selectedFormat,
    quality: selectedQuality,
    videos: downloadData.videos,
  };

  console.log("starting download:", downloadConfig);

  await showLoader("Preparando download...");
};

const include1fListeners = async () => {
  domRefs.startDownloadBtn.addEventListener("click", startDownload);
};

const initDownloadStep = (data) => {
  initDownloadPage(data);
};
