import { scaledSize, MAX_DIMENSION } from './photoUpload';

// readAndDownscale itself needs a real canvas, which jsdom does not provide, so
// the component tests stub the whole module. The sizing rule is pure, and it is
// the part that decides whether an upload fits under the API's 4MiB cap.
describe('scaledSize', () => {
  it('leaves an image smaller than the limit alone', () => {
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('does not upscale an image exactly at the limit', () => {
    expect(scaledSize(MAX_DIMENSION, 900)).toEqual({ width: MAX_DIMENSION, height: 900 });
  });

  it('scales a landscape photo by its longest edge', () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });

  it('scales a portrait photo by its longest edge', () => {
    expect(scaledSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it('preserves the aspect ratio of an extreme panorama', () => {
    const { width, height } = scaledSize(8000, 1000);
    expect(width).toBe(1600);
    expect(height).toBe(200);
  });

  it('never rounds a dimension down to zero', () => {
    const { height } = scaledSize(16000, 1);
    expect(height).toBeGreaterThanOrEqual(1);
  });
});
