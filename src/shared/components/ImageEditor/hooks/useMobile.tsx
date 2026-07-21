import { useState } from "react";

type MobileDevice =
  | "android"
  | "ios"
  | "windows-phone"
  | "blackberry"
  | "opera-mini"
  | "mobile"
  | null;

const detectMobileDevice = (): MobileDevice => {
  if (typeof window === "undefined" || !window.navigator) {
    return null;
  }

  const ua = window.navigator.userAgent.toLowerCase();

  if (/android/.test(ua)) return "android";
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/windows phone/.test(ua)) return "windows-phone";
  if (/blackberry|bb10/.test(ua)) return "blackberry";
  if (/opera mini/.test(ua)) return "opera-mini";
  if (/mobile/.test(ua)) return "mobile";

  return null;
};

export const useMobile = (): MobileDevice => {
  const [mobile] = useState<MobileDevice>(() => detectMobileDevice());

  return mobile;
};
