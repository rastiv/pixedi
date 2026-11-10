import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { UrlFilters } from './UrlFilters';

describe('UrlFilters', () => {
  afterEach(cleanup);

  it('does not use pixel-based noise that renders differently in preview and on save', () => {
    const { container } = render(<UrlFilters />);

    expect(container.querySelector('feTurbulence')).toBeNull();
  });

  it.each(['util-vignette', 'crt-lines', 'grain'])(
    'sizes the %s texture relative to the image',
    (id) => {
      const { container } = render(<UrlFilters />);
      const filter = container.querySelector(`#${id}`);

      expect(filter).toHaveAttribute('primitiveUnits', 'objectBoundingBox');
      expect(filter?.querySelector('feImage')?.getAttribute('href')).toMatch(
        /^data:image\/svg\+xml,/,
      );
    },
  );
});
