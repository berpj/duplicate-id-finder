chrome.runtime.sendMessage({ type: "updateDuplicateIds" }, function (response) {
    document.getElementById("duplicateCount").innerHTML = response.idsCount

    if (response.type === "displayDuplicateIds") {
        const duplicateIds = response.ids;
        const ul = document.getElementById("duplicateIds");
        ul.innerHTML = "";
        duplicateIds.forEach(function (id) {
            const li = document.createElement("li");
            li.appendChild(document.createTextNode('#' + id));
            ul.appendChild(li);
        });

        // Add event listener to list items
        document.querySelectorAll('#duplicateIds li').forEach(li => {
            li.addEventListener('mouseover', () => {
                // Get active tab
                chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                    // Inject content script into page
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: findAndHighlightElements,
                        args: [li.innerHTML]
                    });
                });
            });

            li.addEventListener('mouseleave', () => {
                // Get active tab
                chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                    // Inject content script into page
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: findAndUnhighlightElements,
                        args: [li.innerHTML]
                    });
                });
            });
        });
    }
});

// Content script to find and highlight elements
function findAndHighlightElements(id) {
    const elements = document.querySelectorAll(id);
    elements.forEach(el => el.classList.add('duplicate-ids-checker-highlight'));
}
  
  // Content script to find and unhighlight elements
function findAndUnhighlightElements(id) {
    const elements = document.querySelectorAll(id);
    elements.forEach(el => el.classList.remove('duplicate-ids-checker-highlight'));
}
