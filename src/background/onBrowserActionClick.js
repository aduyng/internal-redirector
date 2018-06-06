export default (tab) => {
  chrome.windows.get(tab.windowId, function (w) {
    if (w.type === "normal") {
      f(tab);
    } else {
      that.updateBrowserAction(tab);
    }
  });
};