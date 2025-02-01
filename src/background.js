chrome.contextMenus.create({
  id: "toggle-blocking",
  title: "Toggle blocking requests on this page",
  contexts: ["page"],
});

let blockingTabs = {};
let blockedDomains = [];

// Load the blocked URLs and set up the request blocking
const loadBlockedDomains = () => {
  chrome.storage.local.get("blockedDomains", (data) => {
    blockedDomains = data.blockedDomains || [];
  });
};

const isAutoBlockingEnabled = (callback) => {
  chrome.storage.local.get("autoBlockingEnabled", (data) => {
    callback(
      data.autoBlockingEnabled !== undefined ? data.autoBlockingEnabled : true
    );
  });
};

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

// Send the blocking state to the content script
const sendBlockingStateToTab = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.warn("Tab is closed.");
      return;
    }
    chrome.tabs.sendMessage(tabId, {
      action: "setBlockingState",
      isBlocking: blockingTabs[tabId],
    });
  });
};

// Toggle blocking state for the current tab
const toggleBlocking = (tabId) => {
  blockingTabs[tabId] = !blockingTabs[tabId];
  chrome.storage.local.set({ blockingTabs }, () => {
    updateBadge(tabId);
    sendBlockingStateToTab(tabId);
  });
};

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId == "toggle-blocking") {
    toggleBlocking(tab.id);
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  toggleBlocking(tab.id);
});

// Automatically block domains specified by the user
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  loadBlockedDomains();
  if (changeInfo.status === "complete" && !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
    chrome.tabs.get(tabId, () => {
      if (chrome.runtime.lastError) {
        console.warn("Tab is closed.");
        return;
      }
      chrome.tabs.executeScript(tabId, { file: "content.js" }, () => {
        sendBlockingStateToTab(tabId);
      });
    });
    isAutoBlockingEnabled((autoBlockingEnabled) => {
      if (
        autoBlockingEnabled &&
        blockedDomains.length &&
        blockedDomains.some((url) => tab.url.includes(URL.parse(url).host))
      ) {
        blockingTabs[tabId] = true;
        chrome.storage.local.set({ blockingTabs });
        updateBadge(tabId);
      }
    });
  }
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

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "updateBadge") {
    updateBadge(sender.tab.id);
  }
});

/*
Load the blocking state for current active tab from storage
Limitation: Extension badges cannot be updated by tab. The state of the badge is global
So if you have two windows open side by side the non-active window might not accurately 
reflect the blocking state until you mouse over or click
*/
chrome.storage.local.get("blockingTabs", (data) => {
  blockingTabs = data.blockingTabs || {};
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      updateBadge(activeTab.id);
      sendBlockingStateToTab(activeTab.id);
    }
  });
});
