export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Scales a size from a base design width, then constrains it with min/max bounds.
 */
export function scaleByWidth(
  screenWidth: number,
  baseSize: number,
  minSize: number,
  maxSize: number,
  baseWidth = 390,
): number {
  const scaled = (screenWidth / baseWidth) * baseSize;
  return clamp(scaled, minSize, maxSize);
}

export function getResponsiveTokens(screenWidth: number) {
  return {
    containerMaxWidth: clamp(screenWidth - 16, 320, 760),
    pagePadding: scaleByWidth(screenWidth, 15, 10, 24),
    sectionPadding: scaleByWidth(screenWidth, 20, 14, 28),
    title: scaleByWidth(screenWidth, 24, 16, 24),
    subtitle: scaleByWidth(screenWidth, 15, 13, 15),
    heading: scaleByWidth(screenWidth, 18, 16, 20),
    body: scaleByWidth(screenWidth, 15, 13, 15),
    bodySmall: scaleByWidth(screenWidth, 14, 12, 14),
    chipText: scaleByWidth(screenWidth, 14, 12, 14),
    menuText: scaleByWidth(screenWidth, 15, 13, 15),
    compactBreakpoint: 340,
    narrowBreakpoint: 350,
  };
}
