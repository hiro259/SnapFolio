// Display screenshot stored in chrome.storage

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.session.get('screenshot', (result) => {
    if (result.screenshot) {
      document.getElementById('screenshot').src = result.screenshot;
    }
  });
});
