// ========== Audio Context Unlock ==========
let ctx = null;
document.body.addEventListener("click", () => {
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(() => {
      audio.play().catch(()=>{});
    });
  }
});

// ========== Playlist Setup ==========
const songs = [
  { name: "Sample 1", path: "song1.mp3" },
  { name: "Sample 2", path: "song2.mp3" },
  { name: "Sample 3", path: "song3.mp3" }
];

let index = 0;

// ========== DOM Elements ==========
const audio = document.getElementById("audio");
audio.muted = false; // ensure not muted

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const title = document.getElementById("title");
const volume = document.getElementById("volume");
const progress = document.getElementById("progress");
const visualizer = document.getElementById("visualizer");
const bars = visualizer.querySelectorAll("div");

// ========== Load Song ==========
function loadSong() {
  audio.src = songs[index].path;
  title.innerText = songs[index].name;
}
loadSong();

// ========== Player Controls ==========
playBtn.addEventListener("click", () => {
  if (!ctx) {
    // initialize audio context on first play click
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    src.connect(analyser);
    analyser.connect(ctx.destination);

    analyser.fftSize = 256;
    setupVisualizer(analyser);
  }

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸";
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
});

nextBtn.addEventListener("click", () => {
  index = (index + 1) % songs.length;
  loadSong();
  audio.play();
  playBtn.textContent = "⏸";
});

prevBtn.addEventListener("click", () => {
  index = index - 1 < 0 ? songs.length - 1 : index - 1;
  loadSong();
  audio.play();
  playBtn.textContent = "⏸";
});

// ========== Volume & Progress ==========
volume.oninput = () => audio.volume = volume.value;

audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

// ========== Visualizer Setup Function ==========
function setupVisualizer(analyser) {
  function animate() {
    requestAnimationFrame(animate);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    for (let i = 0; i < bars.length; i++) {
      bars[i].style.height = dataArray[i] / 2 + "px";
    }
  }
  animate();
}