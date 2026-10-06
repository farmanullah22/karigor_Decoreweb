import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../common/Button';
import Icon from '../common/Icon';
import { imageSrc } from '../../utils/image';
  return (
    <section
      className={`hero${isSlider ? ' hero--slider' : ''}`}
      ref={regionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={22} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size={22} />
          </button>
          <div className="hero__dots" role="tablist" aria-label="Choose slide">
        <a className="hero__scroll" href="#explore" aria-label="Scroll to content">
          <span>Scroll</span>
          <Icon name="chevron-down" size={18} />
        </a>
    </section>
  );
}

