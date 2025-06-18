document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('show').addEventListener('click', () => {
    alert('SnapFolio');
    console.log('SnapFolio');
  });

  document.getElementById('screenshot').addEventListener('click', () => {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      chrome.tabs.create({url: dataUrl});
    });
  });
});
