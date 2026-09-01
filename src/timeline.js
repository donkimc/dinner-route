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

  const shift = reducedMotion ? 0 : 16;
  gsap.set(Object.values(panels), { autoAlpha: 0, y: shift });
  gsap.set(".chip", { autoAlpha: 0, y: reducedMotion ? 0 : 8 });
  gsap.set(".photo-card", { autoAlpha: 0, y: reducedMotion ? 0 : 10 });

  const fade = reducedMotion ? 0.35 : 0.7;
  const ease = reducedMotion ? "none" : "power3.out";

  const tl = gsap.timeline({
    defaults: { ease },
    paused: true,
  });

  tl.addLabel("cover")
    .to(panels.cover, { autoAlpha: 1, y: 0, duration: fade })
    .to({}, { duration: 2 })
    .to(panels.cover, { autoAlpha: 0, y: reducedMotion ? 0 : -12, duration: 0.45, ease: "power2.in" })

    .addLabel("start")
    .add(() => mapApi.flyToStart(!reducedMotion))
    .to(panels.start, { autoAlpha: 1, y: 0, duration: fade }, "<0.2")
    .to("#panel-start .chip", { autoAlpha: 1, y: 0, stagger: reducedMotion ? 0 : 0.07, duration: 0.4 }, "-=0.15")
    .to("#panel-start .photo-card", { autoAlpha: 1, y: 0, duration: 0.4 }, "<")
    .to({}, { duration: 2.6 })
    .to(panels.start, { autoAlpha: 0, y: reducedMotion ? 0 : -12, duration: 0.4, ease: "power2.in" })

    .addLabel("walk")
    .add(() => {
      mapApi.showWalker(true);
      mapApi.setActivePin("none");
      mapApi.flyToOverview(false);
    })
    .to(panels.route, { autoAlpha: 1, y: 0, duration: 0.5 })
    .fromTo(
      walk,
      { t: 0 },
      {
        t: 1,
        duration: 5.4,
        ease: "none",
        onUpdate: () => {
          mapApi.setLineProgress(walk.t);
        },
      },
      "-=0.1",
    )
    .to({}, { duration: 1.1 })
    .to(panels.route, { autoAlpha: 0, y: reducedMotion ? 0 : -10, duration: 0.4, ease: "power2.in" })
    .add(() => mapApi.showWalker(false))

    .addLabel("stop")
    .add(() => mapApi.flyToEnd(!reducedMotion))
    .to(panels.end, { autoAlpha: 1, y: 0, duration: fade }, "<0.15")
    .to("#panel-stop .photo-card", { autoAlpha: 1, y: 0, duration: 0.45 }, "-=0.25")
    .to("#panel-stop .chip", { autoAlpha: 1, y: 0, stagger: reducedMotion ? 0 : 0.07, duration: 0.35 }, "-=0.3")
    .to({}, { duration: 2.8 })
    .to(panels.end, { autoAlpha: 0, y: reducedMotion ? 0 : -12, duration: 0.4, ease: "power2.in" })

    .addLabel("close")
    .add(() => {
      mapApi.setLineProgress(1);
      mapApi.flyToOverview(!reducedMotion);
    })
    .to(panels.close, { autoAlpha: 1, y: 0, duration: fade });

  return tl;
}
