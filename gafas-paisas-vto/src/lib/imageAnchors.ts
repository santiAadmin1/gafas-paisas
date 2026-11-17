/** Visible bounds and hinge centers; transparent padding is never a physical part. */
export function imageAnchors(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] < 128) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left) return { left: 0, right: 1, top: 0, bottom: 1, leftY: 0.34, rightY: 0.34 };
  const inset = Math.max(1, Math.round((right - left) * 0.005));
  const center = (from: number, to: number) => {
    let first = height, last = -1;
    for (let x = from; x <= to; x++) for (let y = top; y <= bottom; y++) {
      if (data[(y * width + x) * 4 + 3] >= 128) { first = Math.min(first, y); last = Math.max(last, y); }
    }
    return (last < 0 ? (top + bottom + 1) / 2 : (first + last + 1) / 2) / height;
  };
  return { left: left / width, right: (right + 1) / width, top: top / height, bottom: (bottom + 1) / height,
    leftY: center(left, Math.min(right, left + inset)), rightY: center(Math.max(left, right - inset), right) };
}
