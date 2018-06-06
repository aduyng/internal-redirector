import onBrowserActionClick from './onBrowserActionClick';

chrome.browserAction.onClicked.addListener(onBrowserActionClick);
console.log('background loaded');