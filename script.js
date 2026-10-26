'use strict';

// Fade sections in as they scroll into view.
const sections = document.querySelectorAll('.fade');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  sections.forEach(el => io.observe(el));
} else {
  sections.forEach(el => el.classList.add('in'));
}

// Trees. Both drawings share one renderer: progress p runs from a seedling
// (0.12) to the full tree (1). Every part is derived from p, so growth always
// happens in order: trunk first, then each limb, its twig, then its leaves.
const still = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = v => Math.max(0, Math.min(1, v));

function treeRenderer(svg) {
  const TRUNK_END = 0.96;
  const grow = svg.querySelector('.grow');
  const branches = [...svg.querySelectorAll('.branch')].map(el => ({
    at: parseFloat(el.dataset.at),
    limb: el.querySelector('.limb:not(.twig)'),
    twig: el.querySelector('.twig'),
    leaves: el.querySelector('.leaves')
  }));
  return p => {
    grow.style.strokeDashoffset = String(1 - clamp(p / TRUNK_END));
    branches.forEach(b => {
      if (b.limb) b.limb.style.strokeDashoffset = String(1 - clamp((p - b.at - 0.01) / 0.045));
      if (b.twig) b.twig.style.strokeDashoffset = String(1 - clamp((p - b.at - 0.035) / 0.035));
      const leaf = b.limb ? clamp((p - b.at - 0.075) / 0.025) : clamp((p - b.at) / 0.04);
      b.leaves.style.opacity = String(leaf);
    });
  };
}

// Desktop: the margin tree follows scroll progress through the whole page.
const marginTree = document.querySelector('.tree');
if (marginTree) {
  const render = treeRenderer(marginTree);
  let frame = 0;
  const update = () => {
    frame = 0;
    if (still.matches) { render(1); return; }
    const max = document.documentElement.scrollHeight - innerHeight;
    render(0.12 + 0.88 * (max > 0 ? clamp(scrollY / max) : 1));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  still.addEventListener('change', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.querySelector('main'));
  if (document.fonts) document.fonts.ready.then(schedule);
  update();
}

// Phones and tablets: the finale grows once, when it comes into view.
const finale = document.querySelector('.finale-art');
if (finale) {
  const render = treeRenderer(finale);
  const play = () => {
    if (still.matches) { render(1); return; }
    const start = performance.now();
    const step = now => {
      const t = clamp((now - start) / 1100);
      render(0.12 + 0.88 * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (still.matches || !('IntersectionObserver' in window)) {
    render(1);
  } else {
    render(0.12);
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); play(); }
    }, { threshold: 0.6 });
    io.observe(finale);
  }
}

// Phones and tablets: tuck the dock away while reading down, bring it back
// when scrolling up or when it receives keyboard focus.
const dock = document.querySelector('.dock');
if (dock) {
  const small = matchMedia('(max-width: 1199.98px), (max-height: 559.98px)');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!small.matches) { dock.classList.remove('away'); lastY = y; return; }
    if (y - lastY > 16 && y > 120) { dock.classList.add('away'); lastY = y; }
    else if (lastY - y > 12) { dock.classList.remove('away'); lastY = y; }
  }, { passive: true });
  dock.addEventListener('focusin', () => dock.classList.remove('away'));
}
