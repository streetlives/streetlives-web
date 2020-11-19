export function getCanonicalUrl() {
  return window.location.href.replace(/^https?:\/\/[^/]+/, 'https://www.gogetta.nyc');
}

export default {
  getCanonicalUrl,
};
