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
        func: (y) => window.scrollTo(0, y),
        args: [i * info.innerHeight]
      });

      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: (index, total) => {
          const showHeader = index === 0;
          const showFooter = index === total - 1;
          const vh = window.innerHeight;
          document.querySelectorAll('*').forEach(el => {
            const style = getComputedStyle(el);
            if (style.position === 'fixed') {
              const rect = el.getBoundingClientRect();
              const isHeader = rect.top < vh / 2;
              if ((isHeader && showHeader) || (!isHeader && showFooter)) {
                el.style.visibility = '';
              } else {
                el.style.visibility = 'hidden';
              }
            }
          });
        },
        args: [i, sections]
      });

      // Wait for scrollbars to fade out before capturing the screenshot
      await new Promise(r => setTimeout(r, 1500));
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {format: 'png'});
      images.push({y: i * info.innerHeight, dataUrl});
    }

    await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => {
        document.querySelectorAll('*').forEach(el => {
          if (getComputedStyle(el).position === 'fixed') {
            el.style.visibility = '';
          }
        });
      }
    });
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

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshot.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  });

  function loadImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });
  }
});
