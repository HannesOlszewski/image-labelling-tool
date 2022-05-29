const {contextBridge} = require('electron');

window.addEventListener('DOMContentLoaded', function() {
  const replaceText = function(selector, text) {
    const element = document.getElementById(selector);

    if (element) {
      element.innerText = text;
    }
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

contextBridge.exposeInMainWorld('api', {
  name: 'Hannes',
});
