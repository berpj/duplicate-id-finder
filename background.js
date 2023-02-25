var globalDuplicateIdsCount = 0;
var globalDuplicateIds = [];

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tabs[0] && tabs[0].url && !tabs[0].url.includes("chrome://")) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: countDuplicateIds,
        args: [{ message: "countDuplicateIds" }],
      }).then((results) => { updateBadge(results) });
    } else {
      updateBadge([{ result: { count: 0, ids: [] } }])
    }
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tab && tabs[0].id == tabId && tab.url && !tab.url.includes("chrome://")) {
      if (changeInfo.status === "complete") {
        chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ['duplicate-ids-checker-hightlight.css']
        });

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: countDuplicateIds
        }).then((results) => { updateBadge(results) });
      }
    } else if (tab.url.includes("chrome://")) {
      updateBadge([{ result: { count: 0, ids: [] } }], tab)
    }
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === "updateDuplicateIds") {
    // Envoyer une réponse à popup.js pour indiquer que la mise à jour est terminée
    sendResponse({ type: "displayDuplicateIds", ids: globalDuplicateIds, idsCount: globalDuplicateIdsCount });
  }
});

function countDuplicateIds() {
  const idCounts = new Map();
  const ids = document.querySelectorAll("*[id]");
  for (const id of ids) {
    if (typeof id !== 'undefined' && id.id.length > 0) {
      idCounts.set(id.id, (idCounts.get(id.id) || 0) + 1);
    }
  }
  const duplicateIds = Array.from(idCounts.entries()).filter(([id, count]) => count > 1).map(([id, count]) => id);
  return { count: duplicateIds.length, ids: duplicateIds };
};

function updateBadge(results) {
  results.forEach((result) => {
    if (result.result.count.toString() == '0') {
      chrome.action.setBadgeText({ text: result.result.count.toString() });
      chrome.action.setBadgeTextColor({ color: 'white' });
      chrome.action.setBadgeBackgroundColor({ color: '#1D84E1' });
    } else {
      chrome.action.setBadgeText({ text: result.result.count.toString() });
      chrome.action.setBadgeTextColor({ color: 'white' });
      chrome.action.setBadgeBackgroundColor({ color: 'red' });
    }

    globalDuplicateIdsCount = result.result.count;
    globalDuplicateIds = result.result.ids;
  });
};
