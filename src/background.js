function urlMatchesExcludedSites(url, excludedSites) {
  return excludedSites.some(pattern => new RegExp(pattern).test(url));
}

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
