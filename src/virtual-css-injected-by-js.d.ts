declare module "virtual:css-injected-by-js" {
  type CSSInjectionOptions = {
    target?: HTMLElement | ShadowRoot;
  };

  export function injectCSS(options?: CSSInjectionOptions): void;
  export function removeCSS(options?: CSSInjectionOptions): void;
}
