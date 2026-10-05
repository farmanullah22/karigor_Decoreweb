import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { imageSrc } from '../../utils/image';

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

  return (
    <section
      className={`hero${isSlider ? ' hero--slider' : ''}`}
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      tabIndex={isSlider ? 0 : -1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
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
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={22} />
          </button>
          <button
            type="button"
            className="hero__arrow hero__arrow--next"
            onClick={next}
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size={22} />
          </button>

          <div className="hero__dots" role="tablist" aria-label="Choose slide">
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
        <a className="hero__scroll" href="#explore" aria-label="Scroll to content">
          <span>Scroll</span>
          <Icon name="chevron-down" size={18} />
        </a>
      ) : null}
    </section>
  );
}