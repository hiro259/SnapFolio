// Display screenshot passed via query parameter

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const src = params.get('src');
  const img = document.getElementById('screenshot');
  if (src) {
    img.src = src;
  } else {
    img.alt = 'Screenshot not available';
  }
});
