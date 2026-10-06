import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { imageSrc } from '../../utils/image';

 c298e2ea2305420858c206e18e92f44e90399a10

  return (
    <section
      className={`hero${isSlider ? ' hero--slider' : ''}`}
      ref={regionRef}
 c298e2ea2305420858c206e18e92f44e90399a10
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
 c298e2ea2305420858c206e18e92f44e90399a10
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size={22} />
          </button>
          <button
            type="button"
 c298e2ea2305420858c206e18e92f44e90399a10
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size={22} />
          </button>

          <div className="hero__dots" role="tablist" aria-label="Choose slide">
 c298e2ea2305420858c206e18e92f44e90399a10
        <a className="hero__scroll" href="#explore" aria-label="Scroll to content">
          <span>Scroll</span>
          <Icon name="chevron-down" size={18} />
        </a>
 c298e2ea2305420858c206e18e92f44e90399a10
    </section>
  );
}
