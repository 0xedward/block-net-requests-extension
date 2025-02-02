# Block Requests Extension

A crude Manifest V2 extension for Chromium-based browsers to block all network requests on the current tab. You can toggle whether all requests should be blocked per tab. 

This extension was built to ensure that all those static local-first apps do what they claim, which is to not make outgoing requests once the app is loaded.

## Installing extension from repo
Note: Manifest V2 isn't supported by Chrome anymore, but it is still supported in Brave

1. Download [this repo as a ZIP file](https://github.com/0xedward/block-net-requests-extension/archive/refs/heads/main.zip)
2. Unzip the file
3. In Brave, go to the extensions page - brave://extensions
4. Enable Developer Mode
5. Click `Load unpacked` button and select the `src` folder that was extracted or drag the extracted `src` folder anywhere on the page to import it

## Limitations
The state of extension badges is global, so if you have two windows open side by side the non-active window might not accurately reflect the blocking state until you mouse over or click on the tab.

## Permissions Audit
If you are curious or concerned about the permissions requested by this extension, the following is a brief explainer for each permission and where you can find it used in code:
- `webRequest` and `webRequestBlocking` are used to block requests
- `storage` is used to store which the state of network blocking per tab 
- `"<all_urls>"` is necessary to block requests on any URL the user toggles blocking on
- `contextMenus` is used to allow you to right click on the page to toggle blocking
