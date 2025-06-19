// Display screenshot passed via query parameter

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const src = params.get('src');
  if (src) {
    document.getElementById('screenshot').src = src;
  }
});
