chrome.contextMenus.create({
  id: "toggle-blocking",
  title: "Toggle blocking requests on this page",
  contexts: ["page"],
});

let blockingTabs = {}; // Object to store blocking state for each tab

const updateBadge = (tabId) => {
  const isBlocking = blockingTabs[tabId] || false;
  chrome.browserAction.setIcon({
    path: isBlocking ? "icons/on.png" : "icons/off.png",
  });
  chrome.browserAction.setBadgeText({ text: isBlocking ? "on" : "off" });
  chrome.browserAction.setBadgeBackgroundColor({
    color: isBlocking ? "#00FF00" : "#FF0000",
  });
};

// Toggle blocking state for the current tab
const toggleBlocking = (tabId) => {
  blockingTabs[tabId] = !blockingTabs[tabId];
  chrome.storage.local.set({ blockingTabs });
  updateBadge(tabId);
};

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == "toggle-blocking") {
    toggleBlocking(tab.id);
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  toggleBlocking(tab.id);
});

// Update badge when switching tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Only block requests if the current tab is the one that is active
    return blockingTabs[details.tabId] ? { cancel: true } : {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Load the blocking state for all tabs from storage
chrome.storage.local.get("blockingTabs", (data) => {
  blockingTabs = data.blockingTabs || {};
  // Update badge for all tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      updateBadge(tab.id);
    });
  });
});
