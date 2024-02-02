const urlMatchesExcludedSites = (url, excludedSites)  =>
  excludedSites.some(pattern => new RegExp(pattern).test(url));

const isSiteBlocked = async (url) => {
  const res = await chrome.storage.sync.get(['excludedSites']);
  return res ? urlMatchesExcludedSites(url, res.excludedSites) : false;
}

// Extract the site from an url
// For example https://chat.openai.com/c/6b9ab6af-ba69-4bdb-8b21-ae71288a210d turns into https:\/\/chat.openai.com/*
const extractSite = (url) => {
  // This regex captures the protocol and domain, then replaces the entire URL with them followed by '/*'
  return url.replace(/^(https?:\/\/[^\/]+)\/.*$/, "$1/*");
};

// Execute on tab
const executeOnTab = async (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    chrome.storage.sync.get(["excludedSites"], function (result) {
      if (
        result.excludedSites &&
        urlMatchesExcludedSites(tab.url, result.excludedSites)
      ) {
        chrome.contextMenus.update("toggle-site-blocked", {
          title: "Remove this site from the blocked list",
        });
        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            files: ["./content_script.js"],
          })
          .catch((e) => {
            console.error(e);
          });
      } else {
        chrome.contextMenus.update("toggle-site-blocked", {
          title: "Add this site to the blocked list",
        });
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toggle-site-blocked",
    title: "Add this site to the blocked list",
    contexts: ["action"], // Use "browser_action" for Manifest V2
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "toggle-site-blocked") {
    const response = await chrome.storage.sync.get(['excludedSites']);
    const excludedSites = response.excludedSites || [];
    if(urlMatchesExcludedSites(tab.url, excludedSites)) {
      chrome.storage.sync.set({
        excludedSites: excludedSites.filter(
          (site) => site !== extractSite(tab.url)
        ),
      });
      chrome.tabs.reload(tab.id)
    } else {
      chrome.storage.sync.set({
        excludedSites: [...excludedSites, extractSite(tab.url)],
      });
    }
    executeOnTab(tab.id);
  }
});

chrome.tabs.onActivated.addListener(({tabId}) => {
  executeOnTab(tabId);
});

