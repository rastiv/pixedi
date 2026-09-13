export const UrlFilters = () => {
  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      xmlns="http://w3.org"
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

        <filter id="emboss">
          <feConvolveMatrix order="3" kernelMatrix="-2 -1 0 -1 1 1 0 1 2" />
          <feColorMatrix
            type="matrix"
            values="
        0.33 0.33 0.33 0 0.5
        0.33 0.33 0.33 0 0.5
        0.33 0.33 0.33 0 0.5
        0    0    0    1 0"
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
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            result="noise"
          />
          <feBlend mode="multiply" in="SourceGraphic" in2="noise" />
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

        <filter id="plastic-wrap">
          <feSpecularLighting
            surfaceScale="5"
            specularConstant="1"
            specularExponent="20"
            lightingColor="#fff"
            result="light"
          >
            <feDistantLight azimuth="225" elevation="45" />
          </feSpecularLighting>
          <feBlend mode="overlay" in="SourceGraphic" in2="light" />
        </filter>
      </defs>
    </svg>
  );
};
