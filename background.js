chrome.runtime.onInstalled.addListener(() => {
    console.log('Campus Menu Scraper installed.');
  });
  

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "saveRecipe" && request.data) {
      // Extract recipe data and key from the request
      const { key, recipe } = request.data;
      // Save the recipe to Chrome's local storage
      chrome.storage.local.set({[key]: recipe}, function() {
        console.log(`Recipe saved: ${key}`);
        // Optional: Send a response back to the content script
        sendResponse({status: 'success', key: key});
      });
      // Return true to indicate you wish to send a response asynchronously
      return true;  
    }
  });