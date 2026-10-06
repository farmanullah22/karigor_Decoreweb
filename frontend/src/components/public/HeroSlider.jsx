import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { imageSrc } from '../../utils/image';

<<<<<<< HEAD
/** Milliseconds a slide stays on screen before advancing. */
const AUTOPLAY_MS = 6000;

/** Pixels the pointer must travel for a swipe to count as a slide change. */
const SWIPE_THRESHOLD = 48;

/** Maps hero button variants (from the dashboard) to dark-background buttons. */
const HERO_VARIANTS = { primary: 'light', secondary: 'accent', ghost: 'ghost' };

/**
 * Home page hero slider.
 *
 * Every slide is fully dashboard-managed (image, eyebrow, heading, copy and
 * buttons). With a single slide it renders as a plain hero - no arrows, dots
 * or auto-advance, so simple sites keep the original behaviour.
 *
 * Accessibility: the region is announced as a carousel, the active slide is
 * the only one exposed to assistive tech, arrows are real buttons and the
 * left/right keys work while the slider has focus.
 */
export default function HeroSlider({ slides = [], scrollHintVisible = true }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef(null);
  const regionRef = useRef(null);

  // Clamp when slides are removed or reordered in the dashboard.
  useEffect(() => {
    setIndex((current) => (count === 0 ? 0 : Math.min(current, count - 1)));
  }, [count]);

  const goTo = useCallback(
    (next) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  const isSlider = count > 1;

  // Auto-advance, paused on hover/focus and when the tab is hidden.
  useEffect(() => {
    if (!isSlider || paused) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [isSlider, paused, count]);

  const handleKeyDown = (event) => {
    if (!isSlider) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      previous();
    }
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start === null || end === null || !isSlider) return;

    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) next();
    else previous();
  };

  if (count === 0) return null;
=======
/** Maps dashboard button variants to dark-background button styles. */
const HERO_VARIANTS = { primary: 'light', secondary: 'accent', ghost: 'ghost' };

/** Autoplay delay between slides, in ms. */
const AUTOPLAY_MS = 6500;

/**
 * Normalizes homepage hero content into an array of slides.
 *
 * The dashboard can publish either a single `hero` block or a `hero.slides`
 * array. Supporting both keeps existing installs working: when no slides are
 * configured the hero renders exactly as it did before.
 */
function toSlides(hero) {
  if (!hero) return [];
  if (Array.isArray(hero.slides) && hero.slides.length > 0) {
    return hero.slides
      .filter((slide) => slide && (slide.heading || slide.backgroundImage))
      .map((slide) => ({
        subheading: slide.subheading ?? '',
        heading: slide.heading ?? '',
        description: slide.description ?? '',
        backgroundImage: slide.backgroundImage ?? null,
        buttons: Array.isArray(slide.buttons) ? slide.buttons : [],
      }));
  }
  return [
    {
      subheading: hero.subheading ?? '',
      heading: hero.heading ?? '',
      description: hero.description ?? '',
      backgroundImage: hero.backgroundImage ?? null,
      buttons: Array.isArray(hero.buttons) ? hero.buttons : [],
    },
  ];
}

/** True when the visitor asked the OS to reduce motion. */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Homepage hero slider.
 *
 * - Crossfades between slide backgrounds, re-running the zoom animation.
 * - Autoplays, but pauses on hover/focus and when the tab is hidden.
 * - Fully keyboard operable (left/right arrows) with ARIA live-region
 *   announcements for screen readers.
 * - Renders as a plain hero when there is only one slide, so no controls or
 *   timers are involved.
 */
export default function HeroSlider({ hero }) {
  const slides = toSlides(hero);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef(null);

  const isSlider = slides.length > 1;
  const reduceMotion = typeof window !== 'undefined' && prefersReducedMotion();

  // Guard against the slide list shrinking (e.g. after a dashboard save).
  useEffect(() => {
    setIndex((current) => (current < slides.length ? current : 0));
  }, [slides.length]);

  /**
   * Moves `delta` slides relative to whatever the *current* index is.
   *
   * A functional update is used deliberately: deriving the next index from a
   * captured `index` silently drops navigation when several clicks land before
   * React re-renders (fast clicking, or a held arrow key auto-repeating).
   */
  const step = useCallback(
    (delta) => {
      setIndex((current) => {
        const total = slides.length;
        return (((current + delta) % total) + total) % total;
      });
    },
    [slides.length]
  );

  const goPrev = useCallback(() => step(-1), [step]);
  const goNext = useCallback(() => step(1), [step]);

  /** Jumps straight to a slide (dot indicators). */
  const goTo = useCallback(
    (next) => setIndex(next),
    []
  );

  // Autoplay - skipped for single slides and for reduced-motion visitors.
  useEffect(() => {
    if (!isSlider || paused || reduceMotion) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isSlider, paused, reduceMotion, slides.length]);

  // Don't burn cycles (or jump ahead) while the tab is in the background.
  useEffect(() => {
    if (!isSlider) return undefined;
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isSlider]);

  const onKeyDown = (event) => {
    if (!isSlider) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goNext();
    }
  };

  if (slides.length === 0) return null;

  const activeSlide = slides[Math.min(index, slides.length - 1)];
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10

  return (
    <section
      className={`hero${isSlider ? ' hero--slider' : ''}`}
      ref={regionRef}
<<<<<<< HEAD
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      tabIndex={isSlider ? 0 : -1}
=======
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
<<<<<<< HEAD
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="hero__track"
        style={isSlider ? { transform: `translate3d(-${index * 100}%, 0, 0)` } : undefined}
      >
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;

          return (
            <div
              className={`hero__slide${isActive ? ' is-active' : ''}`}
              key={slide._id || slideIndex}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${count}`}
              aria-hidden={!isActive}
            >
              <div className="hero__bg">
                <img
                  src={imageSrc(slide.backgroundImage)}
                  alt=""
                  aria-hidden="true"
                  /* Every slide must be painted the moment it is shown. Slides
                     are parked off-screen by a transform on the track, and
                     browsers do not reliably re-run lazy loading for elements
                     moved by an ancestor transform - they stayed at
                     naturalWidth 0 and rendered as a blank slide. */
                  loading="eager"
                  decoding="async"
                  fetchPriority={slideIndex === 0 ? 'high' : 'low'}
                />
              </div>
              <div className="hero__overlay" />

              {/* Re-keyed so the entrance animation replays on every slide. */}
              <div className="container">
                <div className="hero__content" key={`content-${slideIndex}`}>
                  {slide.subheading ? (
                    <span className="hero__eyebrow">{slide.subheading}</span>
                  ) : null}
                  {slide.heading ? <h1>{slide.heading}</h1> : null}
                  {slide.description ? (
                    <p className="hero__description">{slide.description}</p>
                  ) : null}
                  {slide.buttons?.length > 0 ? (
                    <div className="hero__actions">
                      {slide.buttons.map((button, buttonIndex) => (
                        <Button
                          key={`${button.label}-${buttonIndex}`}
                          to={button.link}
                          variant={HERO_VARIANTS[button.variant] || 'light'}
                          size="lg"
                          tabIndex={isActive ? 0 : -1}
                        >
                          {button.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isSlider ? (
        <>
          <button
            type="button"
            className="hero__arrow hero__arrow--prev"
            onClick={previous}
=======
      onKeyDown={onKeyDown}
      aria-roledescription={isSlider ? 'carousel' : undefined}
      aria-label="Featured highlights"
    >
      {/* Backgrounds are stacked and crossfaded via opacity. */}
      <div className="hero__bg" aria-hidden="true">
        {slides.map((slide, i) => (
          <img
            key={slide.heading || i}
            className={`hero__bg-image${i === index ? ' is-active' : ''}`}
            src={imageSrc(slide.backgroundImage)}
            alt=""
            // Only the visible slide should be fetched eagerly.
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchpriority={i === 0 ? 'high' : 'low'}
          />
        ))}
      </div>
      <div className="hero__overlay" />

      <div className="container">
        <div className="hero__content" key={index}>
          {activeSlide.subheading ? (
            <span className="hero__eyebrow">{activeSlide.subheading}</span>
          ) : null}
          <h1>{activeSlide.heading}</h1>
          {activeSlide.description ? (
            <p className="hero__description">{activeSlide.description}</p>
          ) : null}
          {activeSlide.buttons.length > 0 && (
            <div className="hero__actions">
              {activeSlide.buttons.map((button, i) => (
                <Button
                  key={`${button.label}-${i}`}
                  to={button.link}
                  variant={HERO_VARIANTS[button.variant] || 'light'}
                  size="lg"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isSlider && (
        <>
          <button
            type="button"
            className="hero__nav hero__nav--prev"
            onClick={goPrev}
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={22} />
          </button>
          <button
            type="button"
<<<<<<< HEAD
            className="hero__arrow hero__arrow--next"
            onClick={next}
=======
            className="hero__nav hero__nav--next"
            onClick={goNext}
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size={22} />
          </button>

          <div className="hero__dots" role="tablist" aria-label="Choose slide">
<<<<<<< HEAD
            {slides.map((slide, slideIndex) => (
              <button
                type="button"
                key={slide._id || slideIndex}
                className={`hero__dot${slideIndex === index ? ' is-active' : ''}`}
                onClick={() => goTo(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      ) : null}

      {scrollHintVisible ? (
=======
            {slides.map((slide, i) => (
              <button
                key={slide.heading || i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                className={`hero__dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          {/* Announces slide changes to assistive tech. */}
          <p className="sr-only" aria-live="polite">
            {`Slide ${index + 1} of ${slides.length}`}
          </p>
        </>
      )}

      {isSlider ? null : (
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
        <a className="hero__scroll" href="#explore" aria-label="Scroll to content">
          <span>Scroll</span>
          <Icon name="chevron-down" size={18} />
        </a>
<<<<<<< HEAD
      ) : null}
=======
      )}
>>>>>>> c298e2ea2305420858c206e18e92f44e90399a10
    </section>
  );
}