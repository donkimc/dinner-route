import { gsap } from "gsap";

export function buildTimeline(mapApi, { reducedMotion }) {
  const walk = { t: 0 };
  const panels = {
    cover: document.querySelector("#panel-cover"),
    start: document.querySelector("#panel-start"),
    route: document.querySelector("#panel-route"),
    end: document.querySelector("#panel-stop"),
    close: document.querySelector("#panel-end"),
  };

  gsap.set(Object.values(panels), { autoAlpha: 0, y: 28 });
  gsap.set(".chip", { autoAlpha: 0, y: 10 });
  gsap.set(".photo-card", { autoAlpha: 0, y: 16 });

  if (reducedMotion) {
    mapApi.jumpOverview();
    gsap.set(Object.values(panels), { autoAlpha: 1, y: 0 });
    gsap.set(".chip, .photo-card", { autoAlpha: 1, y: 0 });
    document.body.classList.add("is-static");
    return null;
  }

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    paused: true,
  });

  tl.addLabel("cover")
    .to(panels.cover, { autoAlpha: 1, y: 0, duration: 0.85 })
    .to({}, { duration: 1.7 })
    .to(panels.cover, { autoAlpha: 0, y: -18, duration: 0.45, ease: "power2.in" })

    .addLabel("start")
    .add(() => mapApi.flyToStart(1400))
    .to(panels.start, { autoAlpha: 1, y: 0, duration: 0.7 }, "<0.25")
    .to("#panel-start .chip", { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.4 }, "-=0.2")
    .to("#panel-start .photo-card", { autoAlpha: 1, y: 0, duration: 0.45 }, "<")
    .to({}, { duration: 2.1 })
    .to(panels.start, { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" })

    .addLabel("walk")
    .add(() => {
      mapApi.showWalker(true);
      mapApi.setActivePin("start");
    })
    .to(panels.route, { autoAlpha: 1, y: 0, duration: 0.45 })
    .fromTo(
      walk,
      { t: 0 },
      {
        t: 1,
        duration: 4.2,
        ease: "none",
        onUpdate: () => {
          mapApi.setLineProgress(walk.t);
          mapApi.followWalker(walk.t);
        },
      },
      "-=0.1",
    )
    .to(panels.route, { autoAlpha: 0, y: -12, duration: 0.35, ease: "power2.in" })
    .add(() => mapApi.showWalker(false))

    .addLabel("stop")
    .add(() => mapApi.flyToEnd(1100))
    .to(panels.end, { autoAlpha: 1, y: 0, duration: 0.7 }, "<0.2")
    .to("#panel-stop .photo-card", { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35")
    .to("#panel-stop .chip", { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.35 }, "-=0.35")
    .to({}, { duration: 2.4 })
    .to(panels.end, { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" })

    .addLabel("close")
    .add(() => {
      mapApi.setLineProgress(1);
      mapApi.flyToOverview(1400);
    })
    .to(panels.close, { autoAlpha: 1, y: 0, duration: 0.75 });

  return tl;
}
