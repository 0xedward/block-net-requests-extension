document.addEventListener("DOMContentLoaded", () => {
  const urlList = document.getElementById("urlList");
  const saveButton = document.getElementById("save");
  const errorDiv = document.getElementById("error");
  const urlCountDiv = document.getElementById("urlCount");
  const autoBlockCheckbox = document.getElementById("autoBlockCheckbox");

  chrome.storage.local.get("blockedDomains", (data) => {
    urlList.value = data.blockedDomains ? data.blockedDomains.join("\n") : "";
  });

  chrome.storage.local.get("autoBlockingEnabled", (data) => {
    autoBlockCheckbox.checked =
      data.autoBlockingEnabled !== undefined ? data.autoBlockingEnabled : true;
  });

  const isValidUrl = (url) => {
    const isValid = URL.parse(url);
    return isValid !== null;
  };

  const updateUrlCount = (count) => {
    urlCountDiv.textContent = `Saved ${count} URLs`;
  };

  saveButton.addEventListener("click", () => {
    const urls = urlList.value
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url);
    const invalidUrls = urls.filter((url) => !isValidUrl(url));

    if (invalidUrls.length > 0) {
      errorDiv.textContent = "Invalid URLs: " + invalidUrls.join(", ");
    } else {
      errorDiv.textContent = "";
      chrome.storage.local.set({ blockedDomains: urls }, () => {
        alert("Blocked hosts saved!");
        updateUrlCount(urls.length);
      });
    }
  });

  autoBlockCheckbox.addEventListener("change", () => {
    chrome.storage.local.set({
      autoBlockingEnabled: autoBlockCheckbox.checked,
    });
  });
});
