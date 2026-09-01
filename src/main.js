import "./style.css";
import "leaflet/dist/leaflet.css";
import { routes, shared } from "./content.js";
import { createInviteMap } from "./map.js";
import { buildTimeline } from "./timeline.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const statusEl = document.querySelector("#status");
const pickerEl = document.querySelector("#picker");
const storyEl = document.querySelector("#story");
const playBtn = document.querySelector("#btn-play");
const replayBtn = document.querySelector("#btn-replay");
const coursesBtn = document.querySelector("#btn-courses");
const walkBadge = document.querySelector("#walk-badge");

document.querySelector("#date-line").textContent = shared.date;
document.querySelector("#date-line-en").textContent = shared.dateEn;

const stubMap = {
  coords: [
    [127.13, 37.53],
    [127.13, 37.53],
  ],
  map: { jumpTo() {} },
  async loadRoute() {},
  showPickerView() {},
  setLineProgress() {},
  showWalker() {},
  setActivePin() {},
  flyToStart() {},
  flyToEnd() {},
  flyToOverview() {},
  jumpOverview() {},
};

let mapApi = stubMap;
let timeline;

statusEl.classList.add("is-gone");
try {
  mapApi = createInviteMap(document.querySelector("#map"));
} catch (error) {
  console.error(error);
}

pickerEl.querySelectorAll("[data-route]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const route = routes.find((item) => item.id === btn.dataset.route);
    if (route) startRoute(route);
  });
});

coursesBtn.addEventListener("click", showPicker);
replayBtn.addEventListener("click", () => {
  if (!timeline) return;
  document.body.classList.remove("is-complete");
  mapApi.setLineProgress(0);
  mapApi.showWalker(false);
  playBtn.hidden = false;
  replayBtn.hidden = true;
  playBtn.textContent = "Pause";
  timeline.restart();
});
playBtn.addEventListener("click", () => {
  if (!timeline) return;
  if (timeline.paused()) {
    timeline.play();
    playBtn.textContent = "Pause";
    playBtn.setAttribute("aria-pressed", "false");
  } else {
    timeline.pause();
    playBtn.textContent = "Play";
    playBtn.setAttribute("aria-pressed", "true");
  }
});

async function startRoute(route) {
  timeline?.kill();
  applyCopy(route);
  pickerEl.hidden = true;
  storyEl.hidden = false;
  walkBadge.hidden = false;
  coursesBtn.hidden = false;
  document.body.classList.remove("is-complete", "is-static");

  try {
    await mapApi.loadRoute(route);
    mapApi.map?.invalidateSize?.();
  } catch (error) {
    console.error(error);
  }

  timeline = buildTimeline(mapApi, { reducedMotion });
  if (timeline) {
    playBtn.hidden = false;
    replayBtn.hidden = true;
    playBtn.textContent = "Pause";
    timeline.eventCallback("onComplete", () => {
      document.body.classList.add("is-complete");
      playBtn.hidden = true;
      replayBtn.hidden = false;
    });
    timeline.play();
  } else {
    playBtn.hidden = true;
    replayBtn.hidden = true;
  }
}

function showPicker() {
  timeline?.kill();
  timeline = null;
  pickerEl.hidden = false;
  storyEl.hidden = true;
  walkBadge.hidden = true;
  playBtn.hidden = true;
  replayBtn.hidden = true;
  coursesBtn.hidden = true;
  document.body.classList.remove("is-complete", "is-static");
  mapApi.showPickerView();
}

function applyCopy(route) {
  document.title = `${route.titleKo} — ${route.titleEn}`;
  walkBadge.textContent = route.walkLabel;

  setText("cover-area", `${route.areaKo} · ${route.areaEn}`);
  document.querySelector("#cover-title").innerHTML =
    `${route.titleKo}<span>${route.titleEn}</span>`;
  setText("cover-start-name", route.start.name);
  setText("cover-start-step", route.start.stepEn);
  setText("cover-end-name", route.end.name);
  setText("cover-end-step", route.end.stepEn);

  fillStop("start", route.start);
  fillStop("stop", route.end);

  setText("walk-en", route.walkBlurbEn);
  setText("walk-blurb", route.walkBlurbKo);
  setText("end-sub", route.titleEn);

  const startLink = document.querySelector("#link-start");
  const endLink = document.querySelector("#link-end");
  startLink.href = route.start.naver;
  endLink.href = route.end.naver;
  setText("link-start-step", `01 ${route.start.stepEn}`);
  setText("link-start-name", route.start.name);
  setText("link-end-step", `02 ${route.end.stepEn}`);
  setText("link-end-name", route.end.name);
}

function fillStop(prefix, stop) {
  const nameEl = document.querySelector(`#${prefix}-name`);
  setText(`${prefix}-step`, `${stop.step} · ${stop.stepEn}`);
  nameEl.innerHTML = `${stop.name} <span>${stop.nameEn}</span>`;
  setText(`${prefix}-meta`, `${stop.category} · ${stop.address}`);
  setText(`${prefix}-blurb`, stop.blurbKo);
  setText(`${prefix}-blurb-en`, stop.blurbEn);

  const wrap = document.querySelector(`#${prefix}-photo-wrap`);
  const img = document.querySelector(`#${prefix}-photo`);
  if (stop.photo) {
    img.src = stop.photo.src;
    img.alt = stop.photo.alt;
    wrap.hidden = false;
  } else {
    img.removeAttribute("src");
    wrap.hidden = true;
  }

  const chips = document.querySelector(`#${prefix}-chips`);
  chips.innerHTML = stop.highlights.map((item) => `<li class="chip">${item}</li>`).join("");
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}
