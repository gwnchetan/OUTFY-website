import { useEffect, useRef } from 'react';

/**
 * useReveal — Intersection Observer based scroll-reveal hook
 * Adds the class 'revealed' when the element enters the viewport.
 *
 * @param {object} options
 * @param {number} options.threshold - 0–1, how much of element must be visible
 * @param {string} options.rootMargin - IntersectionObserver rootMargin
 * @param {boolean} options.once - Only fire once (default true)
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -40px 0px', once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('revealed');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}

/**
 * useRevealChildren — Stagger-reveals all direct children of a container
 * Adds 'revealed' + stagger delay CSS var to each child
 */
export function useRevealChildren({ threshold = 0.1, rootMargin = '0px 0px -40px 0px', staggerMs = 80 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = Array.from(container.children);
    children.forEach((child, i) => {
      child.style.setProperty('--stagger', `${i * staggerMs}ms`);
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach(child => child.classList.add('revealed'));
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [threshold, rootMargin, staggerMs]);

  return ref;
}
