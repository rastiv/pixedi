export const UrlFilters = () => {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="vintage">
          <feColorMatrix
            type="matrix"
            values="
        1.2  0    0    0  0.1
        0    1.0  0    0  0.0
        0    0    0.8  0  0.1
        0    0    0    1  0"
          />
        </filter>
        <filter id="olive-army">
          <feColorMatrix
            type="matrix"
            values="
        0.35 0.35 0.35 0 0
        0.45 0.45 0.45 0 0
        0.20 0.20 0.20 0 0
        0    0    0    1 0"
          />
        </filter>
        <filter id="warm-sunset">
          <feColorMatrix
            type="matrix"
            values="
        1.3  0    0    0   0.1
        0    1.1  0    0   0.05
        0    0    0.7  0  -0.05
        0    0    0    1   0"
          />
        </filter>
        <filter id="sin-city-red">
          <feColorMatrix
            type="matrix"
            values="
        1.5  0    0    0   0
        0.3  0.3  0.3  0   0
        0.3  0.3  0.3  0   0
        0    0    0    1   0"
          />
        </filter>
        <filter id="crt-lines">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0 0.9"
            numOctaves="1"
            result="lines"
          />
          <feColorMatrix
            type="matrix"
            values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 15 -7"
            result="sharpLines"
          />
          <feComposite
            operator="in"
            in="SourceGraphic"
            in2="sharpLines"
            result="pattern"
          />
          <feBlend mode="overlay" in="SourceGraphic" in2="pattern" />
        </filter>
        <filter id="grain" x="0%" y="0%" width="100%" height="100%">
          <feColorMatrix
            type="matrix"
            values="
        0.393 0.769 0.189 0 0
        0.349 0.686 0.168 0 0
        0.272 0.534 0.131 0 0
        0.000 0.000 0.000 1 0"
            result="sepiaBase"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            numOctaves="3"
            result="grainNoise"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.8"
            numOctaves="2"
            result="scratchNoise"
          />
          <feColorMatrix
            type="matrix"
            values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 12 -9.5"
            result="sharpScratches"
          />
          <feBlend
            mode="multiply"
            in="grainNoise"
            in2="sharpScratches"
            result="textureOverlay"
          />
          <feBlend
            mode="overlay"
            in="sepiaBase"
            in2="textureOverlay"
            result="finalComposite"
          />
          <feComposite operator="in" in="finalComposite" in2="SourceGraphic" />
        </filter>
        <filter id="cross-process">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0 0.05 0.2 0.5 0.8 0.95 1" />
            <feFuncG type="table" tableValues="0 0.1  0.3 0.6 0.85 1    1" />
            <feFuncB
              type="table"
              tableValues="0.05 0.15 0.4 0.5 0.7 0.8  0.9"
            />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.2" intercept="-0.1" />
            <feFuncG type="linear" slope="1.1" intercept="-0.05" />
          </feComponentTransfer>
        </filter>
        <filter id="x-ray">
          <feColorMatrix
            type="matrix"
            values="
        -0.33 -0.33 -0.33 0 1
        -0.2  -0.2  -0.2  0 0.6
        -0.1  -0.1  -0.1  0 0.9
         0     0     0    1 0"
          />
        </filter>
        <filter id="util-vignette">
          <feFlood flood-color="#111111" result="darkBase" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01"
            numOctaves="1"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 8 -3"
            result="vignetteShape"
          />
          <feBlend
            mode="multiply"
            in="SourceGraphic"
            in2="vignetteShape"
            result="vignettedImage"
          />
          <feComposite operator="in" in="vignettedImage" in2="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  );
};
