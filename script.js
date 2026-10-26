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

// Grow the margin tree with scroll progress: a seedling at the top of the
// page, the full tree once the visitor reaches the end. Every part is driven
// by the same progress value, so scrolling back up reverses it in order.
const tree = document.querySelector('.tree');
if (tree) {
  const shown = matchMedia('(min-width: 1280px) and (min-height: 700px)');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const TRUNK_END = 0.96;
  const clamp = v => Math.max(0, Math.min(1, v));
  const grow = tree.querySelector('.grow');
  const branches = [...tree.querySelectorAll('.branch')].map(el => ({
    at: parseFloat(el.dataset.at),
    limb: el.querySelector('.limb:not(.twig)'),
    twig: el.querySelector('.twig'),
    leaves: el.querySelector('.leaves'),
    last: -1
  }));

  const render = p => {
    grow.style.strokeDashoffset = String(1 - clamp(p / TRUNK_END));
    branches.forEach(b => {
      const leaf = b.limb ? clamp((p - b.at - 0.075) / 0.025) : clamp((p - b.at) / 0.04);
      const key = Math.round(p * 1000);
      if (key === b.last) return;
      b.last = key;
      if (b.limb) b.limb.style.strokeDashoffset = String(1 - clamp((p - b.at - 0.01) / 0.045));
      if (b.twig) b.twig.style.strokeDashoffset = String(1 - clamp((p - b.at - 0.035) / 0.035));
      b.leaves.style.opacity = String(leaf);
    });
  };

  let frame = 0;
  const update = () => {
    frame = 0;
    if (still.matches) { render(1); return; }
    const max = document.documentElement.scrollHeight - innerHeight;
    const raw = max > 0 ? clamp(scrollY / max) : 1;
    render(0.12 + 0.88 * raw);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

  const sync = () => {
    removeEventListener('scroll', schedule);
    if (shown.matches && !still.matches) addEventListener('scroll', schedule, { passive: true });
    schedule();
  };
  shown.addEventListener('change', sync);
  still.addEventListener('change', sync);
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.querySelector('main'));
  if (document.fonts) document.fonts.ready.then(schedule);
  sync();
}
