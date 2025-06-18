document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('show').addEventListener('click', () => {
    alert('SnapFolio');
    console.log('SnapFolio');
  });

  document.getElementById('screenshot').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    const [{result: info}] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        scrollY: window.scrollY
      })
    });

    const sections = Math.ceil(info.scrollHeight / info.innerHeight);
    const images = [];

    for (let i = 0; i < sections; i++) {
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: y => window.scrollTo(0, y),
        args: [i * info.innerHeight]
      });

      await new Promise(r => setTimeout(r, 200));

      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'});
      images.push({y: i * info.innerHeight, dataUrl});
    }
    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: y => window.scrollTo(0, y),
      args: [info.scrollY]
    });

    images.sort((a, b) => a.y - b.y);

    const canvas = document.createElement('canvas');
    const sample = await loadImage(images[0].dataUrl);
    canvas.width = sample.width;
    canvas.height = info.scrollHeight * info.devicePixelRatio;
    const ctx = canvas.getContext('2d');

    for (const {y, dataUrl} of images) {
      const img = await loadImage(dataUrl);
      ctx.drawImage(img, 0, y * info.devicePixelRatio);
    }

    const finalUrl = canvas.toDataURL();

    await chrome.storage.local.set({screenshot: finalUrl});
    chrome.tabs.create({url: chrome.runtime.getURL('screenshot.html')});
  });

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }
});
