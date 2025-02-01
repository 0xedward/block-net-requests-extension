if (typeof isBlocking === "undefined") {
  var isBlocking = false;
}

if (typeof updateBadgeFromContentScript === "undefined") {
  var updateBadgeFromContentScript = () => {
    if (document) {
      // Check if the document is still valid
      const badgeText = isBlocking ? "on" : "off";
      const badgeColor = isBlocking ? "#00FF00" : "#FF0000";
      chrome.runtime.sendMessage({
        action: "updateBadge",
        badgeText,
        badgeColor,
      });
    }
  };
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "setBlockingState") {
    isBlocking = request.isBlocking;
    updateBadgeFromContentScript();
  }
});

// Avoid injecting on chrome:// pages
if (
  window.location.href.startsWith("http://") ||
  window.location.href.startsWith("https://") ||
  window.location.href.startsWith("file://")
) {
  // Listen for mouse events
  const handleMouseOver = () => {
    updateBadgeFromContentScript();
  };

  const handleClick = () => {
    updateBadgeFromContentScript();
  };

  document.addEventListener("mouseover", handleMouseOver);
  document.addEventListener("click", handleClick);

  // Clean up event listeners when the page is unloaded
  window.addEventListener("beforeunload", () => {
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("click", handleClick);
  });
}
