const urlMatchesExcludedSites = (url, excludedSites)  =>
  excludedSites.some(pattern => new RegExp(pattern).test(url));

const isSiteBlocked = async (url) => {
  const res = await chrome.storage.sync.get(['excludedSites']);
  return res ? urlMatchesExcludedSites(url, res.excludedSites) : false;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-site-blocked",
    title: "Add this site to the blocked list",
    contexts: ["action"] // Use "browser_action" for Manifest V2
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {

  const blocked = await isSiteBlocked(tab.url)
  const title = blocked ? "Remove this site from the blocked list" : "Add this site to the blocked list";
  chrome.contextMenus.update("toggle-site-blocked", { title: title });

  if (info.menuItemId === "toggle-site-blocked") {
    // Your code to execute when the custom context menu entry is clicked
    console.log("Tab: ", tab.url);
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.storage.sync.get(['excludedSites'], function(result) {
        if (result.excludedSites && urlMatchesExcludedSites(tab.url, result.excludedSites)) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./content_script.js"]
          }).catch(e => {
            console.error(e);
        });
        }
    });
});
