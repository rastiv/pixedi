import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UrlFilters } from './UrlFilters';

describe('UrlFilters', () => {
  it('sizes the vignette relative to the image so preview and saved image match', () => {
    const { container } = render(<UrlFilters />);
    const vignette = container.querySelector('#util-vignette');

    expect(vignette).toHaveAttribute('primitiveUnits', 'objectBoundingBox');
    // pixel-based noise renders differently at preview and full size
    expect(vignette?.querySelector('feTurbulence')).toBeNull();
    expect(vignette?.querySelector('feImage')?.getAttribute('href')).toMatch(
      /^data:image\/svg\+xml,/,
    );
  });
});
