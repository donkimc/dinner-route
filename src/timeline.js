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

  const shift = reducedMotion ? 0 : 28;
  gsap.set(Object.values(panels), { autoAlpha: 0, y: shift });
  gsap.set(".chip", { autoAlpha: 0, y: reducedMotion ? 0 : 10 });
  gsap.set(".photo-card", { autoAlpha: 0, y: reducedMotion ? 0 : 16 });

  const fade = reducedMotion ? 0.2 : 0.7;
  const hold = reducedMotion ? 1.35 : 2.1;
  const walkSecs = reducedMotion ? 0.45 : 4.2;
  const ease = reducedMotion ? "none" : "power3.out";

  const tl = gsap.timeline({
    defaults: { ease },
    paused: true,
  });

  tl.addLabel("cover")
    .to(panels.cover, { autoAlpha: 1, y: 0, duration: reducedMotion ? fade : 0.85 })
    .to({}, { duration: reducedMotion ? 1.1 : 1.7 })
    .to(panels.cover, { autoAlpha: 0, y: reducedMotion ? 0 : -18, duration: reducedMotion ? fade : 0.45, ease: "power2.in" })

    .addLabel("start")
    .add(() => mapApi.flyToStart(!reducedMotion))
    .to(panels.start, { autoAlpha: 1, y: 0, duration: fade }, reducedMotion ? "<" : "<0.25")
    .to("#panel-start .chip", { autoAlpha: 1, y: 0, stagger: reducedMotion ? 0 : 0.07, duration: reducedMotion ? fade : 0.4 }, "-=0.2")
    .to("#panel-start .photo-card", { autoAlpha: 1, y: 0, duration: reducedMotion ? fade : 0.45 }, "<")
    .to({}, { duration: hold })
    .to(panels.start, { autoAlpha: 0, y: reducedMotion ? 0 : -16, duration: reducedMotion ? fade : 0.4, ease: "power2.in" })

    .addLabel("walk")
    .add(() => {
      mapApi.showWalker(!reducedMotion);
      mapApi.setActivePin("none");
    })
    .to(panels.route, { autoAlpha: 1, y: 0, duration: reducedMotion ? fade : 0.45 })
    .fromTo(
      walk,
      { t: 0 },
      {
        t: 1,
        duration: walkSecs,
        ease: "none",
        onUpdate: () => {
          mapApi.setLineProgress(walk.t);
          if (!reducedMotion) mapApi.followWalker(walk.t);
        },
      },
      "-=0.1",
    )
    .to(panels.route, { autoAlpha: 0, y: reducedMotion ? 0 : -12, duration: reducedMotion ? fade : 0.35, ease: "power2.in" })
    .add(() => mapApi.showWalker(false))

    .addLabel("stop")
    .add(() => mapApi.flyToEnd(!reducedMotion))
    .to(panels.end, { autoAlpha: 1, y: 0, duration: fade }, reducedMotion ? "<" : "<0.2")
    .to("#panel-stop .photo-card", { autoAlpha: 1, y: 0, duration: reducedMotion ? fade : 0.5 }, "-=0.35")
    .to("#panel-stop .chip", { autoAlpha: 1, y: 0, stagger: reducedMotion ? 0 : 0.07, duration: reducedMotion ? fade : 0.35 }, "-=0.35")
    .to({}, { duration: reducedMotion ? 1.5 : 2.4 })
    .to(panels.end, { autoAlpha: 0, y: reducedMotion ? 0 : -16, duration: reducedMotion ? fade : 0.4, ease: "power2.in" })

    .addLabel("close")
    .add(() => {
      mapApi.setLineProgress(1);
      mapApi.flyToOverview(!reducedMotion);
    })
    .to(panels.close, { autoAlpha: 1, y: 0, duration: reducedMotion ? fade : 0.75 });

  return tl;
}
